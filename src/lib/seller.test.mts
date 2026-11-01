import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  computeEffectivePricePaise,
  computeMaxCoinsAllowed,
  computeSellerPayout,
  formatDiscountLabel,
} from './seller-pricing.ts';

describe('seller-pricing: computeEffectivePricePaise', () => {
  const basePrice = 10000; // ₹100.00 = 10,000 paise

  it('calculates percentage discount accurately', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'percentage',
      discountValue: 15,
    });
    // 10000 * 0.85 = 8500
    assert.equal(effective, 8500);

    const oddDiscount = computeEffectivePricePaise({
      pricePaise: 19900,
      discountType: 'percentage',
      discountValue: 25,
    });
    // 19900 * 0.75 = 14925
    assert.equal(oddDiscount, 14925);
  });

  it('calculates fixed discount in rupees converted to paise', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'fixed',
      discountValue: 30, // ₹30 off = 3000 paise
    });
    assert.equal(effective, 7000);
  });

  it('ignores expired discounts where endDate is in the past', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'percentage',
      discountValue: 20,
      discountStartDate: '2026-01-01T00:00:00Z',
      discountEndDate: '2026-01-10T23:59:59Z',
      now: new Date('2026-01-15T12:00:00Z'),
    });
    assert.equal(effective, basePrice);
  });

  it('ignores future discounts where startDate has not arrived yet', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'fixed',
      discountValue: 50,
      discountStartDate: '2026-02-01T00:00:00Z',
      discountEndDate: '2026-02-28T23:59:59Z',
      now: new Date('2026-01-15T12:00:00Z'),
    });
    assert.equal(effective, basePrice);
  });

  it('applies discount when current date falls strictly within start and end range', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'percentage',
      discountValue: 10,
      discountStartDate: '2026-01-01T00:00:00Z',
      discountEndDate: '2026-01-31T23:59:59Z',
      now: new Date('2026-01-15T12:00:00Z'),
    });
    assert.equal(effective, 9000);
  });

  it('guards against negative prices when fixed discount exceeds product price', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: 5000, // ₹50
      discountType: 'fixed',
      discountValue: 80, // ₹80 off -> would be -3000 paise
    });
    assert.equal(effective, 0);
  });

  it('guards against negative prices when percentage discount exceeds 100%', () => {
    const effective = computeEffectivePricePaise({
      pricePaise: 5000,
      discountType: 'percentage',
      discountValue: 120, // 120% off -> would be -1000 paise
    });
    assert.equal(effective, 0);
  });

  it('returns original price when discount value is zero or unspecified', () => {
    const zeroPct = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'percentage',
      discountValue: 0,
    });
    assert.equal(zeroPct, basePrice);

    const zeroFixed = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'fixed',
      discountValue: 0,
    });
    assert.equal(zeroFixed, basePrice);

    const undefinedValue = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'percentage',
      discountValue: undefined,
    });
    assert.equal(undefinedValue, basePrice);
  });

  it('returns original price when discountType is none or absent', () => {
    const noneType = computeEffectivePricePaise({
      pricePaise: basePrice,
      discountType: 'none',
      discountValue: 50,
    });
    assert.equal(noneType, basePrice);

    const noType = computeEffectivePricePaise({
      pricePaise: basePrice,
    });
    assert.equal(noType, basePrice);
  });
});

describe('seller-pricing: computeMaxCoinsAllowed', () => {
  it('returns 0 when coin redemption is disabled or absent', () => {
    assert.equal(
      computeMaxCoinsAllowed({
        effectivePricePaise: 24000,
        allowCoinRedemption: false,
      }),
      0,
    );

    assert.equal(
      computeMaxCoinsAllowed({
        effectivePricePaise: 24000,
        allowCoinRedemption: undefined,
      }),
      0,
    );
  });

  it('calculates default 20% max discount with 10 coins/rupee rate', () => {
    // 24000 paise (₹240). 20% = 4800 paise (₹48).
    // 48 rupees * 10 coins/rupee = 480 coins.
    const coins = computeMaxCoinsAllowed({
      effectivePricePaise: 24000,
      allowCoinRedemption: true,
    });
    assert.equal(coins, 480);
  });

  it('calculates odd prices with flooring correctly', () => {
    // 19900 paise (₹199). 20% = 3980 paise (₹39.80).
    // (3980 / 100) * 10 = 398 coins.
    const coins = computeMaxCoinsAllowed({
      effectivePricePaise: 19900,
      allowCoinRedemption: true,
    });
    assert.equal(coins, 398);
  });

  it('supports custom percentage caps (e.g. 50%)', () => {
    // 10000 paise (₹100). 50% = 5000 paise (₹50).
    // 50 rupees * 10 coins = 500 coins.
    const coins = computeMaxCoinsAllowed({
      effectivePricePaise: 10000,
      allowCoinRedemption: true,
      maxCoinRedemptionPercent: 50,
    });
    assert.equal(coins, 500);
  });

  it('returns 0 for zero or non-positive price', () => {
    assert.equal(
      computeMaxCoinsAllowed({
        effectivePricePaise: 0,
        allowCoinRedemption: true,
      }),
      0,
    );

    assert.equal(
      computeMaxCoinsAllowed({
        effectivePricePaise: -500,
        allowCoinRedemption: true,
      }),
      0,
    );
  });
});

describe('seller-pricing: computeSellerPayout', () => {
  it('nets out gross volume, coin subsidy, and commission correctly', () => {
    const payout = computeSellerPayout({
      subtotalPaise: 10000, // ₹100.00
      discountPaise: 2000, // ₹20.00 coin subsidy
      commissionPercent: 5, // 5% platform commission
    });

    // Buyer paid cash: 10000 - 2000 = 8000 paise (₹80.00)
    assert.equal(payout.cashRevenuePaise, 8000);
    // Platform commission on gross volume: 5% of 10000 = 500 paise (₹5.00)
    assert.equal(payout.commissionPaise, 500);
    // Net seller payout: gross - commission = 9500 paise (₹95.00)
    assert.equal(payout.netPayoutPaise, 9500);

    // Invariant 1: Cash collected + Coin subsidy = Gross subtotal
    assert.equal(payout.cashRevenuePaise + 2000, 10000);
    // Invariant 2: Net payout + Platform commission = Gross subtotal
    assert.equal(payout.netPayoutPaise + payout.commissionPaise, 10000);
  });

  it('handles 0% and custom commission rates', () => {
    const zeroCommission = computeSellerPayout({
      subtotalPaise: 50000,
      discountPaise: 5000,
      commissionPercent: 0,
    });
    assert.equal(zeroCommission.cashRevenuePaise, 45000);
    assert.equal(zeroCommission.commissionPaise, 0);
    assert.equal(zeroCommission.netPayoutPaise, 50000);

    const highCommission = computeSellerPayout({
      subtotalPaise: 20000,
      discountPaise: 0,
      commissionPercent: 12,
    });
    assert.equal(highCommission.cashRevenuePaise, 20000);
    assert.equal(highCommission.commissionPaise, 2400); // 12% of 20000
    assert.equal(highCommission.netPayoutPaise, 17600);
  });

  it('guards against negative cash revenue when discount exceeds subtotal', () => {
    const payout = computeSellerPayout({
      subtotalPaise: 5000,
      discountPaise: 6000,
      commissionPercent: 5,
    });
    assert.equal(payout.cashRevenuePaise, 0);
    assert.equal(payout.commissionPaise, 250);
    assert.equal(payout.netPayoutPaise, 4750);
  });
});

describe('seller-pricing: formatDiscountLabel', () => {
  it('formats percentage discounts as expected', () => {
    assert.equal(formatDiscountLabel('percentage', 15), '15% OFF');
    assert.equal(formatDiscountLabel('percentage', 20), '20% OFF');
    assert.equal(formatDiscountLabel('percentage', 50), '50% OFF');
  });

  it('formats fixed rupee discounts as expected', () => {
    assert.equal(formatDiscountLabel('fixed', 50), '₹50 OFF');
    assert.equal(formatDiscountLabel('fixed', 100), '₹100 OFF');
  });

  it('returns null for type none or missing type', () => {
    assert.equal(formatDiscountLabel('none', 20), null);
    assert.equal(formatDiscountLabel(undefined, 20), null);
    assert.equal(formatDiscountLabel(null, 20), null);
  });

  it('returns null for zero, negative, or invalid discount values', () => {
    assert.equal(formatDiscountLabel('percentage', 0), null);
    assert.equal(formatDiscountLabel('fixed', 0), null);
    assert.equal(formatDiscountLabel('percentage', -10), null);
    assert.equal(formatDiscountLabel('fixed', -5), null);
    assert.equal(formatDiscountLabel('percentage', undefined), null);
    assert.equal(formatDiscountLabel('fixed', null), null);
  });
});
