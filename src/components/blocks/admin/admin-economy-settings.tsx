'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  HelpCircle,
  IndianRupee,
  Info,
  Percent,
  RefreshCw,
  Save,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { systemSettingsQuery, useUpdateSystemSettings } from '@/hooks/use-revenue';
import { formatDateLong, formatPaise, formatTime } from '@/lib/format';
import type { SystemSettings, UpdateSystemSettingsBody } from '@/types/api';

export function AdminEconomySettings() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(systemSettingsQuery());
  const updateSettingsMutation = useUpdateSystemSettings();

  const [commissionPercent, setCommissionPercent] = React.useState<string>('10');
  const [coinRedemptionFeePercent, setCoinRedemptionFeePercent] = React.useState<string>('2');
  const [coinsPerRupee, setCoinsPerRupee] = React.useState<string>('10');
  const [coinValuePaise, setCoinValuePaise] = React.useState<string>('10');
  const [maxDiscountPercent, setMaxDiscountPercent] = React.useState<string>('20');
  const [payoutHoldDays, setPayoutHoldDays] = React.useState<string>('7');

  // Sync state when query data arrives or updates
  React.useEffect(() => {
    if (data) {
      const commPct =
        typeof data.defaultCommissionPercent === 'number'
          ? data.defaultCommissionPercent
          : (data.defaultCommissionRateBps ?? 1000) / 100;
      setCommissionPercent(commPct.toString());

      const coinFeePct =
        typeof data.coinRedemptionFeePercent === 'number'
          ? data.coinRedemptionFeePercent
          : (data.coinRedemptionFeeBps ?? 200) / 100;
      setCoinRedemptionFeePercent(coinFeePct.toString());

      const cpr = data.coinsPerRupee ?? 10;
      setCoinsPerRupee(cpr.toString());

      const cvp = data.coinValuePaise ?? Math.round(100 / cpr);
      setCoinValuePaise(cvp.toString());

      setMaxDiscountPercent((data.maxDiscountPercent ?? 20).toString());
      setPayoutHoldDays((data.payoutHoldDays ?? 7).toString());
    }
  }, [data]);

  // Handle coinsPerRupee change and auto-sync coinValuePaise
  const handleCoinsPerRupeeChange = (val: string) => {
    setCoinsPerRupee(val);
    const parsed = Number(val);
    if (!isNaN(parsed) && parsed > 0) {
      setCoinValuePaise(Math.round(100 / parsed).toString());
    }
  };

  const handleReset = () => {
    if (!data) return;
    const commPct =
      typeof data.defaultCommissionPercent === 'number'
        ? data.defaultCommissionPercent
        : (data.defaultCommissionRateBps ?? 1000) / 100;
    setCommissionPercent(commPct.toString());

    const coinFeePct =
      typeof data.coinRedemptionFeePercent === 'number'
        ? data.coinRedemptionFeePercent
        : (data.coinRedemptionFeeBps ?? 200) / 100;
    setCoinRedemptionFeePercent(coinFeePct.toString());

    const cpr = data.coinsPerRupee ?? 10;
    setCoinsPerRupee(cpr.toString());
    setCoinValuePaise((data.coinValuePaise ?? Math.round(100 / cpr)).toString());
    setMaxDiscountPercent((data.maxDiscountPercent ?? 20).toString());
    setPayoutHoldDays((data.payoutHoldDays ?? 7).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedCommPct = parseFloat(commissionPercent);
    if (isNaN(parsedCommPct) || parsedCommPct < 0 || parsedCommPct > 100) {
      toast.error('Global Sales Commission must be between 0% and 100%.');
      return;
    }

    const parsedCoinFeePct = parseFloat(coinRedemptionFeePercent);
    if (isNaN(parsedCoinFeePct) || parsedCoinFeePct < 0 || parsedCoinFeePct > 100) {
      toast.error('Coin Redemption Fee must be between 0% and 100%.');
      return;
    }

    const parsedCoinsPerRupee = parseInt(coinsPerRupee, 10);
    if (isNaN(parsedCoinsPerRupee) || parsedCoinsPerRupee <= 0) {
      toast.error('Coins per Rupee must be a positive integer.');
      return;
    }

    const parsedCoinValuePaise = parseInt(coinValuePaise, 10);
    if (isNaN(parsedCoinValuePaise) || parsedCoinValuePaise <= 0) {
      toast.error('Coin Value (paise) must be a positive integer.');
      return;
    }

    const parsedMaxDiscount = parseFloat(maxDiscountPercent);
    if (isNaN(parsedMaxDiscount) || parsedMaxDiscount < 0 || parsedMaxDiscount > 100) {
      toast.error('Max Coin Redemption Discount must be between 0% and 100%.');
      return;
    }

    const parsedHoldDays = parseInt(payoutHoldDays, 10);
    if (isNaN(parsedHoldDays) || parsedHoldDays < 0 || parsedHoldDays > 365) {
      toast.error('Settlement Payout Hold Window must be between 0 and 365 days.');
      return;
    }

    const payload: UpdateSystemSettingsBody = {
      defaultCommissionRateBps: Math.round(parsedCommPct * 100),
      coinRedemptionFeeBps: Math.round(parsedCoinFeePct * 100),
      coinsPerRupee: parsedCoinsPerRupee,
      coinValuePaise: parsedCoinValuePaise,
      maxDiscountPercent: parsedMaxDiscount,
      payoutHoldDays: parsedHoldDays,
    };

    updateSettingsMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Economy and monetization settings updated successfully.');
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error(err?.message || 'Failed to update system settings.');
      },
    });
  };

  if (isPending) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-sm" />
          <Skeleton className="h-4 w-96 rounded-sm" />
        </div>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-sm" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-sm" />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6 border-border bg-card">
        <ErrorBanner
          error={error ?? new Error('Failed to load system economy settings')}
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Sliders className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Platform Economy &amp; Fee Settings
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure global marketplace commission rates, coin pegging valuations, and payout holding constraints.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="p-6 border-border bg-card shadow-subtle">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Global Sales Commission (%) */}
            <div className="space-y-1.5">
              <label
                htmlFor="globalCommission"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Global Sales Commission (%)</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Basis points: {Math.round((parseFloat(commissionPercent) || 0) * 100)} bps
                </span>
              </label>
              <div className="relative">
                <Input
                  id="globalCommission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  placeholder="10.0"
                  required
                  className="pr-8 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Base commission deducted from gross order item value before disbursement.
              </p>
            </div>

            {/* 2. Coin Redemption Fee (%) */}
            <div className="space-y-1.5">
              <label
                htmlFor="coinRedemptionFee"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Coin Redemption Fee (%)</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Basis points: {Math.round((parseFloat(coinRedemptionFeePercent) || 0) * 100)} bps
                </span>
              </label>
              <div className="relative">
                <Input
                  id="coinRedemptionFee"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={coinRedemptionFeePercent}
                  onChange={(e) => setCoinRedemptionFeePercent(e.target.value)}
                  placeholder="2.0"
                  required
                  className="pr-8 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Processing fee charged on coin redemption subsidies covered by platform liability.
              </p>
            </div>

            {/* 3. Fixed Coin-to-Rupee Rate (Coins per Rupee) */}
            <div className="space-y-1.5">
              <label
                htmlFor="coinsPerRupee"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Fixed Coin-to-Rupee Rate</span>
                <Badge variant="accent" className="font-mono text-[10px]">
                  1 Coin = {coinValuePaise} paise (₹{(parseInt(coinValuePaise, 10) / 100 || 0).toFixed(2)})
                </Badge>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="relative">
                    <Input
                      id="coinsPerRupee"
                      type="number"
                      min="1"
                      step="1"
                      value={coinsPerRupee}
                      onChange={(e) => handleCoinsPerRupeeChange(e.target.value)}
                      placeholder="10"
                      required
                      className="pr-14 font-mono tabular-nums"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      coins
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Coins per ₹1.00 INR
                  </span>
                </div>
                <div>
                  <div className="relative">
                    <Input
                      id="coinValuePaise"
                      type="number"
                      min="1"
                      step="1"
                      value={coinValuePaise}
                      onChange={(e) => setCoinValuePaise(e.target.value)}
                      placeholder="10"
                      required
                      className="pr-14 font-mono tabular-nums"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      paise
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Value of 1 EcoCoin
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Standard peg: 10 coins = ₹1 (10 paise per coin). Editing auto-synchronizes equivalent paise.
              </p>
            </div>

            {/* 4. Max Coin Redemption Discount (%) */}
            <div className="space-y-1.5">
              <label
                htmlFor="maxDiscount"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Max Coin Redemption Discount (%)</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Default ceiling
                </span>
              </label>
              <div className="relative">
                <Input
                  id="maxDiscount"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={maxDiscountPercent}
                  onChange={(e) => setMaxDiscountPercent(e.target.value)}
                  placeholder="20"
                  required
                  className="pr-8 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Maximum allowable cart subtotal reduction using EcoCoins on catalog products.
              </p>
            </div>

            {/* 5. Settlement Payout Hold Window (Days) */}
            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="payoutHoldDays"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Settlement Payout Hold Window (Days)</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Return &amp; Dispute Buffer
                </span>
              </label>
              <div className="relative max-w-md">
                <Input
                  id="payoutHoldDays"
                  type="number"
                  step="1"
                  min="0"
                  max="365"
                  value={payoutHoldDays}
                  onChange={(e) => setPayoutHoldDays(e.target.value)}
                  placeholder="7"
                  required
                  className="pr-14 font-mono tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  days
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Required waiting period after order completion before merchant settlement batches unlock for payout disbursement.
              </p>
            </div>
          </div>

          {/* Info Callout Explaining the Platform Loss Prevention Invariant */}
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex items-start gap-3.5">
            <ShieldCheck className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-foreground">
                Platform Loss Prevention Invariant
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Seller payout = (Cash + Coin value) - Commission. Coin redemption value is covered by platform liability and commission is calculated post-discount so the platform never operates at a deficit.
              </p>
            </div>
          </div>

          {/* Form Actions & Audit Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/60">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <span>
                Last updated:{' '}
                {data.updatedAt ? (
                  <strong className="text-foreground">
                    {formatDateLong(data.updatedAt)} {formatTime(data.updatedAt)}
                  </strong>
                ) : (
                  'System default'
                )}
                {data.updatedBy ? ` by Admin #${data.updatedBy}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={updateSettingsMutation.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={updateSettingsMutation.isPending}
                disabled={updateSettingsMutation.isPending}
                className="gap-1.5"
              >
                <Save className="size-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
