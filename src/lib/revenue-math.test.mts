import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bpsToPercent,
  coinsToPaise,
  computeSettlementMath,
  paiseToCoins,
  percentToBps,
} from './revenue-math.ts';

describe('revenue-math: conversion helpers', () => {
  it('converts bps to percent properly', () => {
    assert.equal(bpsToPercent(1000), 10);
    assert.equal(bpsToPercent(250), 2.5);
    assert.equal(bpsToPercent(800), 8);
    assert.equal(bpsToPercent(0), 0);
    assert.equal(bpsToPercent(null), 0);
  });

  it('converts percent to bps properly with clamping', () => {
    assert.equal(percentToBps(10), 1000);
    assert.equal(percentToBps(2.5), 250);
    assert.equal(percentToBps(8.25), 825);
    assert.equal(percentToBps(60), 5000); // capped at 5000 bps (50%)
    assert.equal(percentToBps(-5), 0); // clamped to 0
  });

  it('converts coins to paise given 10 coins = 1 Rupee (100 paise)', () => {
    // 10 coins / 10 * 100 = 100 paise
    assert.equal(coinsToPaise(10, 10), 100);
    // 50 coins / 10 * 100 = 500 paise (₹5.00)
    assert.equal(coinsToPaise(50, 10), 500);
    // 0 coins
    assert.equal(coinsToPaise(0, 10), 0);
  });

  it('converts paise to coins given 10 coins = 1 Rupee (100 paise)', () => {
    assert.equal(paiseToCoins(100, 10), 10);
    assert.equal(paiseToCoins(500, 10), 50);
    assert.equal(paiseToCoins(250, 10), 25);
  });
});

describe('revenue-math: computeSettlementMath zero-loss settlement', () => {
  it('handles standard order with pure cash and 10% commission', () => {
    const res = computeSettlementMath({
      saleAmountPaise: 10000, // ₹100.00
      coinsUsed: 0,
      coinsPerRupee: 10,
      commissionRateBps: 1000, // 10%
      coinFeeRateBps: 200, // 2%
    });

    assert.equal(res.cashPaidPaise, 10000);
    assert.equal(res.coinValuePaise, 0);
    assert.equal(res.salesCommissionPaise, 1000); // ₹10.00
    assert.equal(res.coinFeePaise, 0);
    assert.equal(res.platformCommissionPaise, 1000);
    assert.equal(res.sellerPayoutPaise, 9000); // ₹90.00
    assert.equal(res.isZeroLossSatisfied, true);
    assert.equal(res.effectiveCommissionRatePercent, 10);
  });

  it('handles order with cash + coin redemption (Req 27)', () => {
    // Sale Amount = ₹200.00 (20,000 paise)
    // Customer pays 50 coins (₹5.00 / 500 paise) + ₹195.00 cash (19,500 paise)
    // Commission: 10% on sale (₹20.00 / 2,000 paise) + 2% fee on coin redemption (₹0.10 / 10 paise)
    const res = computeSettlementMath({
      saleAmountPaise: 20000,
      coinsUsed: 50,
      coinsPerRupee: 10,
      commissionRateBps: 1000,
      coinFeeRateBps: 200,
    });

    assert.equal(res.coinValuePaise, 500);
    assert.equal(res.cashPaidPaise, 19500);
    assert.equal(res.salesCommissionPaise, 2000);
    assert.equal(res.coinFeePaise, 10);
    assert.equal(res.platformCommissionPaise, 2010);
    // seller payout = (19500 + 500) - 2010 = 17990 paise (₹179.90)
    assert.equal(res.sellerPayoutPaise, 17990);
    assert.equal(res.isZeroLossSatisfied, true);
    // Conservation: 17990 + 2010 === 20000
    assert.equal(res.sellerPayoutPaise + res.platformCommissionPaise, 20000);
  });

  it('caps coin redemption value to total sale amount', () => {
    const res = computeSettlementMath({
      saleAmountPaise: 500, // ₹5.00
      coinsUsed: 200, // 200 coins = ₹20.00 (more than item price)
      coinsPerRupee: 10,
      commissionRateBps: 1000,
      coinFeeRateBps: 200,
    });

    assert.equal(res.coinValuePaise, 500); // capped at saleAmountPaise
    assert.equal(res.cashPaidPaise, 0);
    assert.equal(res.isZeroLossSatisfied, true);
  });
});
