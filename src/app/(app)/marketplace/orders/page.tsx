'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Coins, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { ordersInfiniteQuery } from '@/hooks/use-marketplace';
import { formatDateLong, formatPaise, titleCase } from '@/lib/format';

const STATUS_TONE: Record<string, 'primary' | 'positive' | 'warning' | 'danger' | 'neutral'> = {
  placed: 'primary',
  confirmed: 'primary',
  shipped: 'positive',
  delivered: 'positive',
  cancelled: 'danger',
};

export default function OrdersListPage() {
  const orders = useInfiniteQuery(ordersInfiniteQuery());
  const allOrders = React.useMemo(
    () => orders.data?.pages.flatMap((p) => p.items) ?? [],
    [orders.data],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Marketplace
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your Eco Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your sustainable marketplace orders and EcoCoin redemptions.
          </p>
        </div>
      </div>

      {orders.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : orders.isError ? (
        <ErrorBanner error={orders.error} onRetry={() => orders.refetch()} />
      ) : allOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-5" />}
          title="No orders placed yet"
          description="Browse indoor plants and sustainable home essentials to place your first EcoCoin-discounted order."
          action={
            <Link href="/marketplace">
              <Button variant="primary" size="sm">
                <ShoppingBag className="size-4" />
                Explore Marketplace
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {allOrders.map((order) => (
            <Card key={order.id} className="p-4 transition hover:border-primary/60">
              <Link
                href={`/marketplace/orders/${order.id}`}
                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {order.orderNumber}
                    </span>
                    <Badge tone={STATUS_TONE[order.status] ?? 'neutral'}>
                      {titleCase(order.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Placed on {formatDateLong(order.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-foreground">
                    {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                  </p>

                  {order.address && (
                    <p className="text-xs text-muted-foreground">
                      Delivering to {order.address.name} · {order.address.city},{' '}
                      {order.address.pincode}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="block text-lg font-extrabold tabular-nums text-foreground">
                      {formatPaise(order.totalPaise)}
                    </span>
                    {order.coinsSpent > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-positive">
                        <Coins className="size-3" />
                        Saved {formatPaise(order.discountPaise)} ({order.coinsSpent} coins)
                      </span>
                    )}
                  </div>

                  <span className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-muted/40 text-foreground">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Card>
          ))}

          {orders.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                loading={orders.isFetchingNextPage}
                onClick={() => orders.fetchNextPage()}
              >
                Load older orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
