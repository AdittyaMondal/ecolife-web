'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Coins,
  Leaf,
  PackageCheck,
  Plus,
  ShoppingBag,
  Sprout,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { Stepper } from '@/components/ui/stepper';
import { cartQuery, productQuery, useAddToCart } from '@/hooks/use-marketplace';
import { formatKg, formatPaise, titleCase } from '@/lib/format';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const product = useQuery(productQuery(slug));
  const cart = useQuery(cartQuery());
  const addToCart = useAddToCart();

  const [quantity, setQuantity] = React.useState(1);
  const [addedFeedback, setAddedFeedback] = React.useState(false);

  if (product.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-36 rounded-sm" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to Marketplace
          </Button>
        </Link>
        <ErrorBanner error={product.error} onRetry={() => product.refetch()} />
      </div>
    );
  }

  const p = product.data;
  const outOfStock = p.stock <= 0;
  const maxCoinDiscountPaise = Math.floor(p.pricePaise * 0.2);
  const maxCoinsForItem = Math.floor(p.pricePaise / 50);
  const inCartQty = cart.data?.items.find((item) => item.product.id === p.id)?.quantity ?? 0;

  const handleAdd = async () => {
    await addToCart.mutateAsync({ productId: p.id, quantity });
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to Marketplace
          </Button>
        </Link>

        {inCartQty > 0 && (
          <Link href="/marketplace">
            <Badge tone="primary">
              <ShoppingBag className="size-3.5" />
              {inCartQty} in your cart
            </Badge>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Concentric Product Visual Frame: Card variant="media" (rounded-lg p-2) -> inner image rounded-md */}
        <Card variant="media" className="flex flex-col justify-between">
          <div className="relative h-80 w-full overflow-hidden rounded-md border border-border/60 bg-accent/40 sm:h-96">
            {p.imageUrl ? (
              <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-positive">
                <Sprout className="size-20" aria-hidden="true" />
              </div>
            )}

            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge tone="neutral">{titleCase(p.category)}</Badge>
              {p.co2SavedKg != null && p.co2SavedKg > 0 && (
                <Badge tone="positive">
                  <Leaf className="size-3.5" />−{formatKg(p.co2SavedKg)} CO₂e saved
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Product Details & Purchase Controls */}
        <Card className="flex flex-col justify-between space-y-5 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-positive">
                Verified Sustainable Product
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {p.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">
                {formatPaise(p.pricePaise)}
              </span>
              <Badge tone={outOfStock ? 'danger' : 'positive'}>
                {outOfStock ? 'Out of stock' : `${p.stock} available`}
              </Badge>
            </div>

            {p.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            )}

            {/* Coin Discount Callout: inner rounded-sm */}
            <div className="rounded-sm border border-primary/50 bg-accent/40 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Coins className="size-4 text-positive" aria-hidden="true" />
                <span>EcoCoin Discount Eligible (up to 20% off)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Redeem up to <strong>{maxCoinsForItem} coins</strong> at checkout to save{' '}
                <strong>{formatPaise(maxCoinDiscountPaise)}</strong> on each unit (net{' '}
                <strong>{formatPaise(p.pricePaise - maxCoinDiscountPaise)}</strong>).
              </p>
            </div>
          </div>

          {/* Add to Cart Footer */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Quantity</span>
                <Stepper
                  value={quantity}
                  min={1}
                  max={Math.max(1, Math.min(10, p.stock))}
                  label="Select quantity"
                  onChange={setQuantity}
                />
              </div>

              {p.co2SavedKg != null && p.co2SavedKg > 0 && (
                <div className="text-right text-xs text-muted-foreground">
                  Total impact:{' '}
                  <strong className="text-positive">
                    −{formatKg(p.co2SavedKg * quantity)} CO₂e
                  </strong>
                </div>
              )}
            </div>

            {addToCart.isError && <ErrorBanner error={addToCart.error} />}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={outOfStock}
                loading={addToCart.isPending}
                onClick={handleAdd}
              >
                {addedFeedback ? (
                  <>
                    <Check className="size-4" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Add to cart · {formatPaise(p.pricePaise * quantity)}
                  </>
                )}
              </Button>

              <Link href="/marketplace">
                <Button variant="secondary" size="lg">
                  <PackageCheck className="size-4" />
                  Checkout in Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
