/**
 * Seller pricing, coin redemption caps, and platform payout calculations.
 *
 * Money is integer paise; rates and percentages are numbers.
 */

export type DiscountType = 'none' | 'percentage' | 'fixed';

export interface ComputeEffectivePricePaiseParams {
  pricePaise: number;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountStartDate?: string | Date | null;
  discountEndDate?: string | Date | null;
  now?: Date | string;
}

export interface ComputeMaxCoinsAllowedParams {
  effectivePricePaise: number;
  allowCoinRedemption?: boolean | null;
  maxCoinRedemptionPercent?: number;
  coinToRupeeRate?: number;
}

export interface ComputeSellerPayoutParams {
  subtotalPaise: number;
  discountPaise: number;
  commissionPercent?: number;
}

export interface SellerPayout {
  cashRevenuePaise: number;
  commissionPaise: number;
  netPayoutPaise: number;
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Computes the effective price in paise after applying active discounts.
 * Guards against negative prices (floors at 0).
 */
export function computeEffectivePricePaise({
  pricePaise,
  discountType,
  discountValue,
  discountStartDate,
  discountEndDate,
  now = new Date(),
}: ComputeEffectivePricePaiseParams): number {
  if (!discountType || discountType === 'none') {
    return pricePaise;
  }

  const nowDate = now instanceof Date ? now : new Date(now);
  const nowMs = nowDate.getTime();

  const start = parseDate(discountStartDate);
  const end = parseDate(discountEndDate);

  const isAfterStart = !start || nowMs >= start.getTime();
  const isBeforeEnd = !end || nowMs <= end.getTime();
  const isDiscountActive = isAfterStart && isBeforeEnd;

  if (!isDiscountActive) {
    return pricePaise;
  }

  if (discountType === 'percentage') {
    return Math.max(0, Math.round(pricePaise * (1 - (discountValue ?? 0) / 100)));
  }

  if (discountType === 'fixed') {
    return Math.max(0, pricePaise - Math.round((discountValue ?? 0) * 100));
  }

  return pricePaise;
}

/**
 * Computes the maximum number of coins a buyer may redeem on a product/order.
 * Default max discount: 20% of effective price.
 * Default conversion rate: 10 coins = ₹1 (100 paise).
 */
export function computeMaxCoinsAllowed({
  effectivePricePaise,
  allowCoinRedemption,
  maxCoinRedemptionPercent = 20,
  coinToRupeeRate = 10,
}: ComputeMaxCoinsAllowedParams): number {
  if (!allowCoinRedemption || effectivePricePaise <= 0) {
    return 0;
  }

  const maxDiscountPaise = Math.floor(effectivePricePaise * (maxCoinRedemptionPercent / 100));
  return Math.max(0, Math.floor((maxDiscountPaise / 100) * coinToRupeeRate));
}

/**
 * Computes the seller financial breakdown:
 * - `cashRevenuePaise`: Cash actually collected from the buyer (subtotal - coin/voucher discount).
 * - `commissionPaise`: Platform fee calculated on the gross subtotal.
 * - `netPayoutPaise`: Seller payout, subsidized by the platform so the seller does not forfeit coin discounts.
 */
export function computeSellerPayout({
  subtotalPaise,
  discountPaise,
  commissionPercent = 5,
}: ComputeSellerPayoutParams): SellerPayout {
  const cashRevenuePaise = Math.max(0, subtotalPaise - discountPaise);
  const commissionPaise = Math.round(subtotalPaise * (commissionPercent / 100));
  const netPayoutPaise = Math.max(0, subtotalPaise - commissionPaise);

  return {
    cashRevenuePaise,
    commissionPaise,
    netPayoutPaise,
  };
}

/**
 * Human-readable badge or label for a product discount.
 * e.g., "15% OFF", "₹50 OFF", or null if no discount is present.
 */
export function formatDiscountLabel(
  discountType?: 'none' | 'percentage' | 'fixed' | null,
  discountValue?: number | null,
): string | null {
  if (!discountType || discountType === 'none' || discountValue == null || discountValue <= 0) {
    return null;
  }

  if (discountType === 'percentage') {
    return `${discountValue}% OFF`;
  }

  if (discountType === 'fixed') {
    return `₹${discountValue} OFF`;
  }

  return null;
}
