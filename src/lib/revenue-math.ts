/**
 * Pure revenue and settlement mathematics for platform economics.
 * Shared across admin panels, settlement previews, and client calculation helpers.
 */

export interface SettlementMathInput {
  saleAmountPaise: number;
  coinsUsed: number;
  coinsPerRupee: number;
  commissionRateBps: number;
  coinFeeRateBps: number;
}

export interface SettlementMathResult {
  saleAmountPaise: number;
  cashPaidPaise: number;
  coinValuePaise: number;
  salesCommissionPaise: number;
  coinFeePaise: number;
  platformCommissionPaise: number;
  sellerPayoutPaise: number;
  isZeroLossSatisfied: boolean;
  effectiveCommissionRatePercent: number;
}

/** Convert basis points (e.g. 1000) to percentage (e.g. 10.0) */
export function bpsToPercent(bps: number | null | undefined): number {
  if (bps === null || bps === undefined || isNaN(bps)) return 0;
  return Number((bps / 100).toFixed(2));
}

/** Convert percentage (e.g. 10.5) to basis points (e.g. 1050) */
export function percentToBps(percent: number | null | undefined): number {
  if (percent === null || percent === undefined || isNaN(percent)) return 0;
  return Math.min(5000, Math.max(0, Math.round(percent * 100)));
}

/** Convert coin count to value in paise given coinsPerRupee (e.g. 10 coins = 100 paise) */
export function coinsToPaise(coins: number, coinsPerRupee: number): number {
  if (coins <= 0 || coinsPerRupee <= 0) return 0;
  return Math.floor((coins * 100) / coinsPerRupee);
}

/** Convert value in paise to required coin count given coinsPerRupee */
export function paiseToCoins(paise: number, coinsPerRupee: number): number {
  if (paise <= 0 || coinsPerRupee <= 0) return 0;
  return Math.floor((paise * coinsPerRupee) / 100);
}

/**
 * Computes exact zero-loss settlement split for an order item.
 *
 * Invariants:
 * 1. Conservation of money: cashPaidPaise + coinValuePaise === saleAmountPaise
 * 2. Commission sum: salesCommissionPaise + coinFeePaise === platformCommissionPaise
 * 3. Seller payout: (cashPaidPaise + coinValuePaise) - platformCommissionPaise === sellerPayoutPaise
 * 4. Zero loss: sellerPayoutPaise >= 0
 */
export function computeSettlementMath(input: SettlementMathInput): SettlementMathResult {
  const {
    saleAmountPaise,
    coinsUsed,
    coinsPerRupee,
    commissionRateBps,
    coinFeeRateBps,
  } = input;

  const rawCoinValue = coinsToPaise(coinsUsed, coinsPerRupee);
  const coinValuePaise = Math.min(rawCoinValue, saleAmountPaise);
  const cashPaidPaise = Math.max(0, saleAmountPaise - coinValuePaise);

  const salesCommissionPaise = Math.round((saleAmountPaise * commissionRateBps) / 10_000);
  const coinFeePaise = Math.round((coinValuePaise * coinFeeRateBps) / 10_000);
  const platformCommissionPaise = salesCommissionPaise + coinFeePaise;

  const sellerPayoutPaise = (cashPaidPaise + coinValuePaise) - platformCommissionPaise;

  const conservation = cashPaidPaise + coinValuePaise === saleAmountPaise;
  const payoutCheck = (sellerPayoutPaise + platformCommissionPaise) === saleAmountPaise;
  const nonNegative = sellerPayoutPaise >= 0 && platformCommissionPaise >= 0;

  const isZeroLossSatisfied = conservation && payoutCheck && nonNegative;

  const effectiveCommissionRatePercent = saleAmountPaise > 0
    ? Number(((platformCommissionPaise / saleAmountPaise) * 100).toFixed(2))
    : 0;

  return {
    saleAmountPaise,
    cashPaidPaise,
    coinValuePaise,
    salesCommissionPaise,
    coinFeePaise,
    platformCommissionPaise,
    sellerPayoutPaise,
    isZeroLossSatisfied,
    effectiveCommissionRatePercent,
  };
}
