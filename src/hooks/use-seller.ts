import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import type {
  CreateSellerProductBody,
  Page,
  Product,
  SellerAnalytics,
  SellerOrder,
  UpdateSellerOrderStatusBody,
  UpdateSellerProductBody,
} from '@/types/api';

export type SellerProductFilters = {
  category?: string;
  status?: 'all' | 'active' | 'inactive';
  q?: string;
  cursor?: string;
  limit?: number;
};

export type SellerOrderFilters = {
  status?: string;
  onlyRedemptions?: boolean;
  cursor?: string;
  limit?: number;
};

export const sellerProductsQuery = (filters?: SellerProductFilters) =>
  queryOptions({
    queryKey: ['seller', 'products', filters],
    queryFn: () => api.get<Page<Product>>(`/seller/products${qs(filters ?? {})}`),
    staleTime: 15_000,
  });

export const sellerProductQuery = (id: number) =>
  queryOptions({
    queryKey: ['seller', 'product', id],
    queryFn: () => api.get<Product>(`/seller/products/${id}`),
    enabled: id > 0,
  });

export const sellerOrdersQuery = (filters?: SellerOrderFilters) =>
  queryOptions({
    queryKey: ['seller', 'orders', filters],
    queryFn: () => api.get<Page<SellerOrder>>(`/seller/orders${qs(filters ?? {})}`),
    staleTime: 15_000,
  });

export const sellerAnalyticsQuery = () =>
  queryOptions({
    queryKey: ['seller', 'analytics'],
    queryFn: () => api.get<SellerAnalytics>('/seller/analytics'),
    staleTime: 30_000,
  });

export function useCreateSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSellerProductBody) => api.post<Product>('/seller/products', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'products'] });
      qc.invalidateQueries({ queryKey: ['seller', 'analytics'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateSellerProductBody & { id: number }) =>
      api.patch<Product>(`/seller/products/${id}`, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['seller', 'products'] });
      qc.invalidateQueries({ queryKey: ['seller', 'product', id] });
      qc.invalidateQueries({ queryKey: ['seller', 'analytics'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ deleted: true }>(`/seller/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'products'] });
      qc.invalidateQueries({ queryKey: ['seller', 'analytics'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateSellerOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: UpdateSellerOrderStatusBody & { id: number }) =>
      api.patch<{ success: true; status: string }>(`/seller/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller', 'orders'] });
      qc.invalidateQueries({ queryKey: ['seller', 'analytics'] });
    },
  });
}
