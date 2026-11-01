'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Coins,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import * as React from 'react';
import { isDiscountActive } from '@/components/blocks/marketplace/seller-product-manager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { sellerProductsQuery } from '@/hooks/use-seller';
import { formatDate, formatNumber, formatPaise, titleCase } from '@/lib/format';
import {
  computeEffectivePricePaise,
  computeMaxCoinsAllowed,
  formatDiscountLabel,
} from '@/lib/seller-pricing';
import type { Product } from '@/types/api';

export interface SellerPricingViewProps {
  isApproved?: boolean;
  isOwner?: boolean;
  onNavigateToProducts?: () => void;
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'discounts', label: 'Active Discounts Only' },
  { value: 'coins', label: 'EcoCoins Allowed' },
];

export function SellerPricingView({
  isApproved = true,
  isOwner = false,
  onNavigateToProducts,
}: SellerPricingViewProps) {
  const [filterMode, setFilterMode] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const { data, isPending, isError, error, refetch } = useQuery(
    sellerProductsQuery({ limit: 100 }),
  );

  const allProducts = data?.items ?? [];

  // Filtered products list
  const filteredProducts = React.useMemo(() => {
    return allProducts.filter((product) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }

      // Mode filter
      if (filterMode === 'discounts') {
        return isDiscountActive(product);
      }
      if (filterMode === 'coins') {
        return Boolean(product.allowCoinRedemption);
      }
      return true;
    });
  }, [allProducts, filterMode, searchQuery]);

  // Compute stats
  const activeDiscountsCount = React.useMemo(
    () => allProducts.filter((p) => isDiscountActive(p)).length,
    [allProducts],
  );

  const coinEnabledCount = React.useMemo(
    () => allProducts.filter((p) => p.allowCoinRedemption).length,
    [allProducts],
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-5 text-primary" />
            Pricing, Promotions &amp; Coin Discounts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor promotional price cuts, flash sales, and EcoCoin redemption caps across your catalog.
          </p>
        </div>

        {onNavigateToProducts && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateToProducts}
            className="gap-1.5 w-fit"
          >
            <span>Manage in Catalog</span>
            <ArrowRight className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Pricing Rule Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Catalog Listings
            </span>
            <Boxes className="size-4 text-primary" />
          </div>
          <p className="tabular font-mono text-2xl font-extrabold text-foreground">
            {formatNumber(allProducts.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Priced in Indian Rupees (INR)
          </p>
        </Card>

        <Card className="p-4 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Discounts
            </span>
            <Percent className="size-4 text-positive" />
          </div>
          <p className="tabular font-mono text-2xl font-extrabold text-positive">
            {formatNumber(activeDiscountsCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Currently discounted promotions
          </p>
        </Card>

        <Card className="p-4 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coin Redemptions
            </span>
            <Coins className="size-4 text-amber-500" />
          </div>
          <p className="tabular font-mono text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatNumber(coinEnabledCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Products eligible for EcoCoin discounts
          </p>
        </Card>
      </div>

      {/* Platform Liability Guarantee Callout */}
      <Card className="border-border/80 bg-accent/40 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground text-sm">
              Platform Coin Subsidy Guarantee
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When buyers redeem EcoCoins on your products, the discount is fully absorbed and subsidized by the EcoLife Platform liability fund. Your seller net payout is calculated on the full merchandise subtotal minus standard platform commission.
            </p>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="overflow-x-auto pb-1 sm:pb-0">
          <SegmentedControl
            value={filterMode}
            onChange={setFilterMode}
            options={FILTER_OPTIONS}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Products Pricing List */}
      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      ) : isError ? (
        <ErrorBanner error={error} onRetry={() => refetch()} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Tag className="size-6" />}
          title={
            filterMode !== 'all' || searchQuery
              ? 'No products found matching filters'
              : 'No products in catalog yet'
          }
          description={
            filterMode !== 'all' || searchQuery
              ? 'Try resetting the filter tabs or clearing your search term.'
              : 'Add your sustainable merchandise to configure promotional pricing and coin rules.'
          }
          action={
            filterMode !== 'all' || searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterMode('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            ) : onNavigateToProducts ? (
              <Button variant="primary" size="sm" onClick={onNavigateToProducts}>
                Add Products
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => {
            const hasActiveDiscount = isDiscountActive(product);
            const effectivePrice = computeEffectivePricePaise({
              pricePaise: product.pricePaise,
              discountType: product.discountType,
              discountValue: product.discountValue,
              discountStartDate: product.discountStartDate,
              discountEndDate: product.discountEndDate,
            });
            const discountLabel = formatDiscountLabel(
              product.discountType,
              product.discountValue,
            );
            const maxCoins = computeMaxCoinsAllowed({
              effectivePricePaise: effectivePrice,
              allowCoinRedemption: product.allowCoinRedemption,
              maxCoinRedemptionPercent: product.maxCoinRedemptionPercent ?? 20,
            });

            return (
              <Card
                key={product.id}
                className="p-4 border-border bg-card shadow-subtle hover:border-border/80 transition space-y-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-sm">
                        {product.name}
                      </h3>
                      <Badge tone="neutral" className="text-[10px] capitalize">
                        {product.category.replace('_', ' ')}
                      </Badge>
                      {!product.isActive && (
                        <Badge tone="warning" className="text-[10px]">
                          Draft / Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Base Catalog Price:{' '}
                      <span className="font-mono tabular font-semibold text-foreground">
                        {formatPaise(product.pricePaise)}
                      </span>
                    </p>
                  </div>

                  {onNavigateToProducts && isOwner && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onNavigateToProducts}
                      className="gap-1 text-xs h-8"
                    >
                      <span>Edit Discounts</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  )}
                </div>

                {/* Pricing and Coin Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Promotional Discount Info */}
                  <div className="rounded-sm border border-border/70 bg-muted/20 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                        Active Discount
                      </span>
                      {hasActiveDiscount && discountLabel ? (
                        <Badge tone="positive" className="gap-1 font-bold">
                          <Sparkles className="size-3" />
                          {discountLabel}
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="text-[10px]">
                          No Active Discount
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-muted-foreground">Effective Buyer Price:</span>
                      <span className="font-mono tabular text-sm font-extrabold text-foreground">
                        {formatPaise(effectivePrice)}
                      </span>
                    </div>

                    {hasActiveDiscount && product.discountEndDate && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-primary" />
                        <span>Ends {formatDate(product.discountEndDate)}</span>
                      </p>
                    )}
                  </div>

                  {/* EcoCoin Redemption Allowance */}
                  <div className="rounded-sm border border-border/70 bg-muted/20 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                        Coin Redemption Allowance
                      </span>
                      {product.allowCoinRedemption ? (
                        <Badge
                          tone="accent"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
                        >
                          <Coins className="size-3" />
                          Up to {product.maxCoinRedemptionPercent ?? 20}%
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="text-[10px]">
                          Disabled
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-muted-foreground">Max Coins Per Item:</span>
                      <span className="font-mono tabular text-sm font-bold text-amber-700 dark:text-amber-400">
                        {product.allowCoinRedemption ? `${formatNumber(maxCoins)} coins` : '0'}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                      {product.allowCoinRedemption
                        ? `Equivalent to max ${formatPaise((maxCoins / 10) * 100)} coin discount`
                        : 'Buyers cannot spend EcoCoins on this listing'}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
