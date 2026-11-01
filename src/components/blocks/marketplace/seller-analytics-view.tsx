'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BarChart3,
  Boxes,
  Calendar,
  CircleDollarSign,
  Coins,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { sellerAnalyticsQuery } from '@/hooks/use-seller';
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

export function SellerAnalyticsView() {
  const { data, isPending, isError, error, refetch } = useQuery(sellerAnalyticsQuery());

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6 border-border bg-card">
        <ErrorBanner
          error={error ?? new Error('Failed to load seller analytics')}
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const maxRevenue = data.topProducts.reduce(
    (max, item) => (item.revenuePaise > max ? item.revenuePaise : max),
    0,
  );

  const maxMonthlySales = data.monthlySales.reduce(
    (max, item) => (item.salesPaise > max ? item.salesPaise : max),
    0,
  );

  return (
    <div className="space-y-6">
      {/* 6 Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Gross Sales Volume */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gross Sales Volume
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-amber-500/10 text-amber-500">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatPaise(data.totalSalesVolumePaise)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total merchandise catalog value
          </p>
        </Card>

        {/* 2. Net Cash Revenue */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Cash Revenue
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-positive/10 text-positive">
              <Wallet className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatPaise(data.cashRevenuePaise)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rupee customer payments received
          </p>
        </Card>

        {/* 3. Coin Redemptions Value */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coin Redemptions Value
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-amber-500/10 text-amber-600">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
            {formatPaise(data.coinsRedeemedDiscountPaise)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="size-3 text-amber-500" />
            <span>{formatNumber(data.totalCoinsRedeemed)} EcoCoins redeemed</span>
          </p>
        </Card>

        {/* 4. Total Orders */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Orders
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Package className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatNumber(data.totalOrdersCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Customer transactions fulfilled
          </p>
        </Card>

        {/* 5. Total Units Sold */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Units Sold
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-blue-500/10 text-blue-500">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatNumber(data.totalUnitsSoldCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sustainable items dispatched
          </p>
        </Card>

        {/* 6. Active Catalog Products */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-border/80 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Catalog Products
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-purple-500/10 text-purple-500">
              <Boxes className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
            {formatNumber(data.activeProductsCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Live in EcoLife marketplace
          </p>
        </Card>
      </div>

      {/* Top Products and Monthly Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="p-5 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-amber-500" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Top Selling Sustainable Products
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              By units &amp; revenue
            </span>
          </div>

          {data.topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No product sales recorded yet. Once customers order items, your bestsellers will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                    <th className="pb-2 pl-1 w-8">#</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-center">Units Sold</th>
                    <th className="pb-2 text-right pr-1">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.topProducts.map((prod, idx) => {
                    const ratio = maxRevenue > 0 ? (prod.revenuePaise / maxRevenue) * 100 : 0;
                    return (
                      <tr key={prod.productId} className="hover:bg-muted/30 transition">
                        <td className="py-2.5 pl-1 font-mono font-bold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="py-2.5">
                          <div className="space-y-1">
                            <span className="font-semibold text-foreground text-xs block">
                              {prod.productName}
                            </span>
                            {/* Visual Revenue Share Bar */}
                            <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.max(ratio, 8)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-mono tabular font-semibold text-foreground">
                          {formatNumber(prod.unitsSold)}
                        </td>
                        <td className="py-2.5 text-right pr-1 font-mono tabular font-bold text-foreground">
                          {formatPaise(prod.revenuePaise)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Monthly Sales Trend */}
        <Card className="p-5 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Monthly Sales Trend (Past 6 Months)
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Volume &amp; Redemptions
            </span>
          </div>

          {data.monthlySales.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No monthly sales recorded yet. Historical trends will be charted here.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mini Visual Bar Trend */}
              <div className="grid grid-cols-6 gap-2 pt-1 items-end h-28 border-b border-border/60 pb-3">
                {data.monthlySales.map((m) => {
                  const heightPercent =
                    maxMonthlySales > 0
                      ? Math.max((m.salesPaise / maxMonthlySales) * 100, 10)
                      : 10;
                  return (
                    <div
                      key={m.month}
                      className="flex flex-col items-center justify-end h-full gap-1"
                    >
                      <div className="text-[10px] font-mono tabular text-muted-foreground hidden sm:block">
                        {formatPaise(m.salesPaise)}
                      </div>
                      <div
                        className="w-full bg-primary/80 hover:bg-primary transition rounded-xs"
                        style={{ height: `${heightPercent}%` }}
                        title={`${formatMonth(m.month)}: ${formatPaise(m.salesPaise)} (${m.ordersCount} orders)`}
                      />
                      <span className="text-[10px] font-semibold text-muted-foreground truncate w-full text-center">
                        {m.month.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-semibold">
                      <th className="pb-2 pl-1">Month</th>
                      <th className="pb-2 text-center">Orders</th>
                      <th className="pb-2 text-right">Gross Sales</th>
                      <th className="pb-2 text-right">Cash</th>
                      <th className="pb-2 text-right pr-1">Coins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.monthlySales.map((m) => (
                      <tr key={m.month} className="hover:bg-muted/30 transition">
                        <td className="py-2 pl-1 font-semibold text-foreground whitespace-nowrap">
                          {formatMonth(m.month)}
                        </td>
                        <td className="py-2 text-center font-mono tabular font-medium text-foreground">
                          {formatNumber(m.ordersCount)}
                        </td>
                        <td className="py-2 text-right font-mono tabular font-semibold text-foreground">
                          {formatPaise(m.salesPaise)}
                        </td>
                        <td className="py-2 text-right font-mono tabular text-positive font-medium">
                          {formatPaise(m.cashPaise)}
                        </td>
                        <td className="py-2 text-right pr-1 font-mono tabular text-amber-700 dark:text-amber-400 font-medium">
                          {formatNumber(m.coinsSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
