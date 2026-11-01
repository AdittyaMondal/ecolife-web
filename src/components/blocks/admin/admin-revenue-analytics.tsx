'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Coins,
  CreditCard,
  DollarSign,
  HelpCircle,
  IndianRupee,
  Landmark,
  PiggyBank,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { revenueAnalyticsQuery } from '@/hooks/use-revenue';
import { formatNumber, formatPaise } from '@/lib/format';

function formatMonth(ym: string): string {
  try {
    const [year, month] = ym.split('-').map(Number);
    if (!year || !month) return ym;
    const date = new Date(year, month - 1, 1);
    return new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric' }).format(date);
  } catch {
    return ym;
  }
}

export function AdminRevenueAnalytics() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery(
    revenueAnalyticsQuery(),
  );
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);

  if (isPending) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-80 rounded-sm" />
          <Skeleton className="h-4 w-96 rounded-sm" />
        </div>
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
        {/* Monthly chart skeleton */}
        <Skeleton className="h-96 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6 border-border bg-card">
        <ErrorBanner
          error={error ?? new Error('Failed to load platform revenue analytics')}
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const monthlyList = data.monthlyBreakdown ?? [];
  const maxGross = monthlyList.reduce(
    (max, item) => (item.grossPaise > max ? item.grossPaise : max),
    0,
  );

  const activeMonthData = selectedMonth
    ? monthlyList.find((m) => m.month === selectedMonth)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Platform Monetization &amp; Coin Economy
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Platform revenue margins, coin subsidy liabilities, and seller disbursement flows.
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

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* 1. Gross Merchandise Value (GMV) */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gross Merchandise Value (GMV)
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
                <ShoppingBag className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-foreground">
              {formatPaise(data.grossMerchandiseValuePaise)}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Total marketplace catalog sales volume
          </p>
        </Card>

        {/* 2. Total Cash Collected */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Cash Collected
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-positive/10 text-positive">
                <CreditCard className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-positive">
              {formatPaise(data.totalCashCollectedPaise)}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Direct fiat customer payments received
          </p>
        </Card>

        {/* 3. Platform Coin Subsidies */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Platform Coin Subsidies
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Coins className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-amber-700 dark:text-amber-400">
              {formatPaise(data.totalCoinDiscountPaise)}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="warning" className="px-1.5 py-0.5 text-[10px]">
              {formatNumber(data.totalCoinsRedeemed)} coins
            </Badge>
            <span>redeemed by buyers</span>
          </div>
        </Card>

        {/* 4. Net Platform Revenue */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Platform Revenue
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatPaise(data.platformRevenuePaise)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Earned via:</span>
            <Badge variant="accent" className="text-[10px]">
              Sales Comm: {formatPaise(data.platformSalesCommissionPaise)}
            </Badge>
            <Badge variant="accent" className="text-[10px]">
              Coin Fees: {formatPaise(data.platformCoinFeesPaise)}
            </Badge>
          </div>
        </Card>

        {/* 5. Disbursed Seller Payouts */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Disbursed Seller Payouts
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Wallet className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-foreground">
              {formatPaise(data.settledSellerPayoutsPaise)}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fully settled seller disbursement batches
          </p>
        </Card>

        {/* 6. Pending Seller Obligations */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Seller Obligations
              </span>
              <span className="flex size-8 items-center justify-center rounded-xs bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <PiggyBank className="size-4" />
              </span>
            </div>
            <p className="tabular-nums font-mono text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatPaise(data.pendingSellerPayoutsPaise)}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Awaiting clearance / hold window expiry
          </p>
        </Card>

        {/* 7. Net Platform Cash Flow */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition sm:col-span-2 lg:col-span-3 xl:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Net Platform Cash Flow
              </span>
              <span
                className={`flex size-8 items-center justify-center rounded-xs ${
                  data.netPlatformCashFlowPaise >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {data.netPlatformCashFlowPaise >= 0 ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownRight className="size-4" />
                )}
              </span>
            </div>
            <p
              className={`tabular-nums font-mono text-2xl font-extrabold ${
                data.netPlatformCashFlowPaise >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-destructive'
              }`}
            >
              {formatPaise(data.netPlatformCashFlowPaise)}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Cash collected from buyers minus total payouts disbursed to merchant sellers.
          </p>
        </Card>
      </div>

      {/* Monthly Performance Trend (Past 12 Months) */}
      <Card className="p-6 border-border bg-card shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Monthly Performance Trend (Past 12 Months)
              </h2>
              <p className="text-xs text-muted-foreground">
                Historical GMV breakdown, coin redemptions, commissions, and payout liabilities.
              </p>
            </div>
          </div>
          {monthlyList.length > 0 && (
            <span className="text-xs text-muted-foreground self-start sm:self-auto">
              Showing {monthlyList.length} recording periods
            </span>
          )}
        </div>

        {monthlyList.length === 0 ? (
          <EmptyState
            title="No Monthly Trend Data"
            description="Historical monetization records will accumulate here as orders are placed and settled."
          />
        ) : (
          <div className="space-y-6">
            {/* Interactive Visual Bar Trend */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="font-medium">Monthly Gross Volume (GMV)</span>
                <span>Select a month for detail</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2 items-end h-36 border-b border-border/60 pb-3">
                {monthlyList.map((m) => {
                  const heightPercent =
                    maxGross > 0 ? Math.max((m.grossPaise / maxGross) * 100, 8) : 8;
                  const isSelected = selectedMonth === m.month;

                  return (
                    <button
                      key={m.month}
                      type="button"
                      onClick={() =>
                        setSelectedMonth((prev) => (prev === m.month ? null : m.month))
                      }
                      className={`group flex flex-col items-center justify-end h-full gap-1 p-1 rounded-xs transition cursor-pointer focus-visible:outline-2 focus-visible:outline-ring ${
                        isSelected
                          ? 'bg-primary/10 ring-1 ring-primary'
                          : 'hover:bg-muted/40'
                      }`}
                      aria-label={`Month ${formatMonth(m.month)}: GMV ${formatPaise(m.grossPaise)}`}
                      title={`${formatMonth(m.month)}: ${formatPaise(m.grossPaise)} (${m.orderCount} orders)`}
                    >
                      <div className="text-[10px] font-mono tabular-nums text-muted-foreground hidden lg:block truncate max-w-full">
                        {formatPaise(m.grossPaise)}
                      </div>
                      <div
                        className={`w-full rounded-xs transition-all duration-300 ${
                          isSelected
                            ? 'bg-primary ring-2 ring-primary/40'
                            : 'bg-primary/75 group-hover:bg-primary'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span
                        className={`text-[10px] font-semibold truncate w-full text-center ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {m.month.slice(5)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Month Inspector Callout */}
            {activeMonthData && (
              <div className="p-4 rounded-sm border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">
                      {formatMonth(activeMonthData.month)}
                    </Badge>
                    <span className="text-xs font-medium text-foreground">
                      Period Breakdown Inspector
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMonth(null)}
                    className="h-7 text-xs px-2"
                  >
                    Clear selection
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Orders</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-foreground">
                      {formatNumber(activeMonthData.orderCount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">GMV</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-foreground">
                      {formatPaise(activeMonthData.grossPaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Cash Collected</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-positive">
                      {formatPaise(activeMonthData.cashPaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Coins Redeemed</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-amber-600 dark:text-amber-400">
                      {formatPaise(activeMonthData.coinValuePaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Commission</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPaise(activeMonthData.commissionPaise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Seller Payouts</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-foreground">
                      {formatPaise(activeMonthData.payoutPaise)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Trend Data Table */}
            <div className="overflow-x-auto rounded-sm border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 text-center">Orders</th>
                    <th className="py-2.5 px-3 text-right">GMV</th>
                    <th className="py-2.5 px-3 text-right">Cash Collected</th>
                    <th className="py-2.5 px-3 text-right">Coin Subsidies</th>
                    <th className="py-2.5 px-3 text-right">Platform Commission</th>
                    <th className="py-2.5 px-3 text-right">Seller Payouts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {monthlyList.map((m) => {
                    const isSelected = selectedMonth === m.month;
                    return (
                      <tr
                        key={m.month}
                        onClick={() =>
                          setSelectedMonth((prev) => (prev === m.month ? null : m.month))
                        }
                        className={`transition cursor-pointer ${
                          isSelected
                            ? 'bg-primary/10 font-medium'
                            : 'hover:bg-muted/30'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                          {formatMonth(m.month)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-foreground">
                          {formatNumber(m.orderCount)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-foreground">
                          {formatPaise(m.grossPaise)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-positive font-medium">
                          {formatPaise(m.cashPaise)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700 dark:text-amber-400 font-medium">
                          {formatPaise(m.coinValuePaise)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                          {formatPaise(m.commissionPaise)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground font-medium">
                          {formatPaise(m.payoutPaise)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
