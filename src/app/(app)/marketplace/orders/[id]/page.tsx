'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Coins, MapPin, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { orderQuery } from '@/hooks/use-marketplace';
import { formatDateLong, formatPaise, titleCase } from '@/lib/format';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const order = useQuery(orderQuery(orderId));

  if (order.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40 rounded-sm" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (order.isError || !order.data) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            All Orders
          </Button>
        </Link>
        <ErrorBanner error={order.error} onRetry={() => order.refetch()} />
      </div>
    );
  }

  const o = order.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/marketplace/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Orders
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order {o.orderNumber}
            </h1>
            <Badge tone="positive">{titleCase(o.status)}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed on {formatDateLong(o.createdAt)}
          </p>
        </div>

        <Link href="/marketplace">
          <Button variant="outline" size="sm">
            Continue shopping
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Items */}
        <Card className="space-y-3 p-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="size-4 text-positive" />
            <h2 className="text-sm font-bold text-foreground">Items in this order</h2>
          </div>

          <div className="space-y-2">
            {o.items.map((item) => (
              <div
                key={`${item.productName}-${item.unitPaise}-${item.quantity}`}
                className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/30 p-3"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Qty {item.quantity} × {formatPaise(item.unitPaise)}
                  </p>
                </div>
                <span className="text-sm font-extrabold tabular-nums text-foreground">
                  {formatPaise(item.quantity * item.unitPaise)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment & Shipping Summary */}
        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <h2 className="text-sm font-bold text-foreground">Payment Breakdown</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-foreground">
                  {formatPaise(o.subtotalPaise)}
                </span>
              </div>
              <div className="flex justify-between text-positive">
                <span className="inline-flex items-center gap-1">
                  <Coins className="size-3.5" />
                  EcoCoins ({o.coinsSpent})
                </span>
                <span className="tabular-nums font-semibold">−{formatPaise(o.discountPaise)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
                <span>Total Paid</span>
                <span className="tabular-nums">{formatPaise(o.totalPaise)}</span>
              </div>
            </div>
          </Card>

          {o.address && (
            <Card className="space-y-2 p-4">
              <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <MapPin className="size-4 text-positive" />
                <span>Shipping Address</span>
              </div>
              <div className="rounded-sm border border-border bg-muted/30 p-3 text-xs space-y-0.5">
                <p className="font-bold text-foreground">{o.address.name}</p>
                <p className="text-muted-foreground">{o.address.line1}</p>
                {o.address.line2 && <p className="text-muted-foreground">{o.address.line2}</p>}
                <p className="text-muted-foreground">
                  {o.address.city}, {o.address.state} {o.address.pincode}
                </p>
                <p className="text-muted-foreground pt-1">{o.address.phone}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
