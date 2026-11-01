'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { sellerOrdersQuery, useUpdateSellerOrderStatus } from '@/hooks/use-seller';
import { formatDate, formatDateLong, formatPaise } from '@/lib/format';
import type { SellerOrder } from '@/types/api';

export interface SellerOrdersManagerProps {
  isApproved?: boolean;
  isOwner?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; tone: 'warning' | 'primary' | 'positive' | 'destructive' | 'neutral' }
> = {
  placed: { label: 'Placed', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'primary' },
  shipped: { label: 'Shipped', tone: 'primary' },
  delivered: { label: 'Delivered', tone: 'positive' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
};

function formatAddress(addr: SellerOrder['address']): string {
  if (!addr) return 'No shipping address provided';
  const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
  return parts.join(', ');
}

export function SellerOrdersManager({
  isApproved = true,
  isOwner = false,
}: SellerOrdersManagerProps) {
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [onlyRedemptions, setOnlyRedemptions] = React.useState<boolean>(false);
  const [cancelOrderTarget, setCancelOrderTarget] = React.useState<SellerOrder | null>(null);

  const queryFilters = React.useMemo(() => {
    return {
      status: statusFilter === 'all' ? undefined : statusFilter,
      onlyRedemptions: onlyRedemptions ? true : undefined,
    };
  }, [statusFilter, onlyRedemptions]);

  const { data, isPending, isError, error, refetch } = useQuery(sellerOrdersQuery(queryFilters));

  const updateStatusMutation = useUpdateSellerOrderStatus();

  const isUpdating = (id: number, status?: string) =>
    updateStatusMutation.isPending &&
    updateStatusMutation.variables?.id === id &&
    (!status || updateStatusMutation.variables?.status === status);

  const handleUpdateStatus = (
    orderId: number,
    status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  ) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const orders = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-5 text-primary" />
            Seller Orders &amp; Redemptions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer orders, track EcoCoin redemptions, and update delivery status.
          </p>
        </div>

        {/* Coin Redemption Filter Toggle */}
        <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold cursor-pointer select-none transition hover:bg-muted/50 w-fit">
          <input
            type="checkbox"
            checked={onlyRedemptions}
            onChange={(e) => setOnlyRedemptions(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary size-4"
          />
          <Coins className="size-4 text-amber-500" />
          <span className="text-foreground">Only Coin Redemptions</span>
        </label>
      </div>

      {/* Status Filter Tabs */}
      <div className="overflow-x-auto pb-1">
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      {/* Account Approval Notice if not approved */}
      {!isApproved && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-4 text-amber-700 dark:text-amber-400">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">Seller Account Pending Approval</p>
              <p>
                Your store credentials are being reviewed by the platform team. New orders will
                appear here once your seller profile is verified and active.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mutation Error Notification */}
      {updateStatusMutation.isError && (
        <ErrorBanner
          error={updateStatusMutation.error}
          onRetry={() => updateStatusMutation.reset()}
        />
      )}

      {/* Main Content Area */}
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-44 w-full rounded-md" />
        </div>
      ) : isError ? (
        <ErrorBanner error={error} onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-6" />}
          title={
            statusFilter !== 'all' || onlyRedemptions
              ? 'No orders match your filter criteria'
              : 'No orders received yet'
          }
          description={
            statusFilter !== 'all' || onlyRedemptions
              ? 'Try selecting a different status tab or toggling off the coin redemptions filter.'
              : 'When customers purchase your catalog items with cash or EcoCoins, orders will show up here.'
          }
          action={
            (statusFilter !== 'all' || onlyRedemptions) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setOnlyRedemptions(false);
                }}
              >
                Reset Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const badgeCfg = STATUS_BADGE_CONFIG[ord.status] ?? {
              label: ord.status,
              tone: 'neutral',
            };

            return (
              <Card
                key={ord.id}
                className="overflow-hidden border-border bg-card p-5 shadow-subtle transition-all hover:border-border/80 space-y-4"
              >
                {/* Order Top Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {ord.orderNumber}
                    </span>
                    <Badge tone={badgeCfg.tone}>{badgeCfg.label}</Badge>
                    {ord.sellerCoinsSpent > 0 && (
                      <Badge
                        tone="accent"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
                      >
                        <Coins className="size-3" />
                        <span>{ord.sellerCoinsSpent} Coins Redeemed</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="size-3.5" />
                    <span>Placed on {formatDateLong(ord.createdAt)}</span>
                  </div>
                </div>

                {/* Details Grid: Customer, Shipping, Financial */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="rounded-sm border border-border/70 bg-muted/20 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                      <User className="size-3.5 text-primary" />
                      <span>Customer Details</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      {ord.customer?.name || 'Guest User'}
                    </p>
                    <p className="text-muted-foreground font-mono">
                      {ord.customer?.email || 'No email provided'}
                    </p>
                  </div>

                  {/* Delivery Address */}
                  <div className="rounded-sm border border-border/70 bg-muted/20 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="size-3.5 text-positive" />
                      <span>Delivery Address</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{formatAddress(ord.address)}</p>
                    {ord.address?.phone && (
                      <p className="text-muted-foreground font-mono">Phone: {ord.address.phone}</p>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="rounded-sm border border-border/70 bg-card p-3 space-y-1.5">
                    <div className="font-bold uppercase tracking-wider text-muted-foreground pb-0.5">
                      Financial Summary
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Seller Subtotal:</span>
                      <span className="font-mono tabular font-semibold text-foreground">
                        {formatPaise(ord.sellerSubtotalPaise)}
                      </span>
                    </div>
                    {ord.sellerDiscountPaise > 0 && (
                      <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Coins className="size-3" />
                          Coin Discount ({ord.sellerCoinsSpent} coins):
                        </span>
                        <span className="font-mono tabular font-semibold">
                          − {formatPaise(ord.sellerDiscountPaise)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border/80 pt-1.5 font-bold text-foreground">
                      <span>Seller Net Total:</span>
                      <span className="font-mono tabular text-sm text-primary">
                        {formatPaise(ord.sellerTotalPaise)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="rounded-sm border border-border/70 bg-muted/10 p-3 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Items in Order ({ord.items.length})
                  </div>
                  <div className="divide-y divide-border/60">
                    {ord.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-2 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 sm:gap-4"
                      >
                        <div>
                          <span className="font-semibold text-foreground text-sm">
                            {item.productName}
                          </span>
                          <span className="text-muted-foreground ml-2 font-mono">
                            Qty: {item.quantity} × {formatPaise(item.unitPaise)}
                          </span>
                        </div>
                        <span className="font-mono tabular font-bold text-foreground text-sm">
                          {formatPaise(item.totalPaise)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Action Buttons (For Owner/Staff) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <div className="text-xs text-muted-foreground">
                    Current Status:{' '}
                    <span className="font-semibold text-foreground capitalize">{ord.status}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* If placed: Confirm Order or Cancel */}
                    {ord.status === 'placed' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          loading={isUpdating(ord.id, 'confirmed')}
                          onClick={() => handleUpdateStatus(ord.id, 'confirmed')}
                          className="gap-1.5"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Confirm Order</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => setCancelOrderTarget(ord)}
                        >
                          <Ban className="size-3.5" />
                          <span>Cancel Order</span>
                        </Button>
                      </>
                    )}

                    {/* If confirmed: Mark as Shipped or Cancel */}
                    {ord.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          loading={isUpdating(ord.id, 'shipped')}
                          onClick={() => handleUpdateStatus(ord.id, 'shipped')}
                          className="gap-1.5"
                        >
                          <Truck className="size-3.5" />
                          <span>Mark as Shipped</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 gap-1.5"
                          onClick={() => setCancelOrderTarget(ord)}
                        >
                          <Ban className="size-3.5" />
                          <span>Cancel Order</span>
                        </Button>
                      </>
                    )}

                    {/* If shipped: Mark as Delivered */}
                    {ord.status === 'shipped' && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isUpdating(ord.id, 'delivered')}
                        onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                        className="gap-1.5"
                      >
                        <PackageCheck className="size-3.5" />
                        <span>Mark as Delivered</span>
                      </Button>
                    )}

                    {/* If delivered */}
                    {ord.status === 'delivered' && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-positive">
                        <CheckCircle2 className="size-4" />
                        <span>Fulfilled &amp; Delivered</span>
                      </div>
                    )}

                    {/* If cancelled */}
                    {ord.status === 'cancelled' && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                        <Ban className="size-4" />
                        <span>Order Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        open={Boolean(cancelOrderTarget)}
        onClose={() => setCancelOrderTarget(null)}
        onConfirm={() => {
          if (cancelOrderTarget) {
            updateStatusMutation.mutate(
              { id: cancelOrderTarget.id, status: 'cancelled' },
              {
                onSuccess: () => setCancelOrderTarget(null),
              },
            );
          }
        }}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${cancelOrderTarget?.orderNumber}? This will mark the order as cancelled and notify the customer.`}
        confirmText="Cancel Order"
        confirmVariant="destructive"
        loading={cancelOrderTarget ? isUpdating(cancelOrderTarget.id, 'cancelled') : false}
      />
    </div>
  );
}
