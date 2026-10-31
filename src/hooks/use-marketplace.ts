import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { Page, Schema } from '@/types/api';

/**
 * Marketplace (PRD-v2 §6.8). The server prices everything — the client only
 * ever PREVIEWS a coin offer and never computes what it pays. Coins buy at most
 * a 20% discount; 10 coins = ₹1.
 */
export type Product = Schema<'Product'>;
export type CartQuote = Schema<'CartQuote'>;
export type CartItem = Schema<'CartItem'>;
export type Order = Schema<'Order'>;
export type Address = Schema<'Address'>;
export type AddressBody = Schema<'AddressBody'>;

export type ProductCategory = Product['category'];
export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'co2_desc';
export type ProductFilters = { category?: ProductCategory; q?: string; sort?: ProductSort };

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'plants', label: 'Plants' },
  { value: 'household', label: 'Household' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'personal_care', label: 'Personal care' },
  { value: 'stationery', label: 'Stationery' },
];

export const productsInfiniteQuery = (filters: ProductFilters) =>
  infiniteQueryOptions({
    queryKey: qk.products(filters),
    queryFn: ({ pageParam }) =>
      api.get<Page<Product>>(
        `/marketplace/products${qs({ ...filters, cursor: pageParam, limit: 20 })}`,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasMore ? (last.pageInfo.nextCursor ?? undefined) : undefined,
  });

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: qk.product(slug),
    queryFn: () => api.get<Product>(`/marketplace/products/${encodeURIComponent(slug)}`),
  });

export const cartQuery = () =>
  queryOptions({
    queryKey: qk.cart(),
    queryFn: () => api.get<CartQuote>('/marketplace/cart'),
    staleTime: 10_000,
  });

/** Drives the coin slider. Debounce the input before passing it here. */
export const cartPreviewQuery = (offeredCoins: number) =>
  queryOptions({
    queryKey: qk.cartPreview(offeredCoins),
    queryFn: () => api.post<CartQuote>('/marketplace/cart/preview', { offeredCoins }),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });

function useCartMutation<V>(fn: (v: V) => Promise<CartQuote>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (quote) => {
      qc.setQueryData(qk.cart(), quote);
      qc.invalidateQueries({ queryKey: [...qk.cart(), 'preview'] });
    },
  });
}

export function useAddToCart() {
  return useCartMutation((v: { productId: number; quantity?: number }) =>
    api.post<CartQuote>('/marketplace/cart/items', v),
  );
}

/** `productId` — the PATCH path id is the product id. Quantity 0 removes. */
export function useSetCartQuantity() {
  return useCartMutation((v: { productId: number; quantity: number }) =>
    api.patch<CartQuote>(`/marketplace/cart/items/${v.productId}`, { quantity: v.quantity }),
  );
}

export function useRemoveFromCart() {
  return useCartMutation((productId: number) =>
    api.delete<CartQuote>(`/marketplace/cart/items/${productId}`),
  );
}

export const ordersInfiniteQuery = () =>
  infiniteQueryOptions({
    queryKey: qk.orders(),
    queryFn: ({ pageParam }) =>
      api.get<Page<Order>>(`/marketplace/orders${qs({ cursor: pageParam, limit: 20 })}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasMore ? (last.pageInfo.nextCursor ?? undefined) : undefined,
  });

export const orderQuery = (id: number) =>
  queryOptions({
    queryKey: qk.order(id),
    queryFn: () => api.get<Order>(`/marketplace/orders/${id}`),
  });

/**
 * One transaction server-side. `idempotencyKey` is minted once per checkout
 * attempt by the caller and reused on retry, so a double-tap never charges twice.
 */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { offeredCoins: number; addressId: number; idempotencyKey: string }) =>
      api.post<Order>('/marketplace/orders', body),
    onSuccess: (order) => {
      qc.setQueryData(qk.order(order.id), order);
      qc.invalidateQueries({ queryKey: qk.marketplace() });
      qc.invalidateQueries({ queryKey: qk.me() });
      qc.invalidateQueries({ queryKey: qk.home() });
    },
  });
}

export const addressesQuery = () =>
  queryOptions({
    queryKey: qk.addresses(),
    queryFn: () => api.get<{ items: Address[] }>('/addresses').then((r) => r.items),
  });

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddressBody) => api.post<Address>('/addresses', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.addresses() }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<AddressBody> & { id: number }) =>
      api.patch<Address>(`/addresses/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.addresses() }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ deleted: true }>(`/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.addresses() }),
  });
}

export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
