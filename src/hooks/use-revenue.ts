import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import type {
  CreatePayoutBody,
  OrderSettlement,
  Page,
  RevenueAnalytics,
  SellerCommissionOverride,
  SellerCommissionOverrideBody,
  SellerPayout,
  SettlementLedgerEntry,
  SystemSettings,
  UpdateSystemSettingsBody,
} from '@/types/api';

export type SettlementFilters = {
  sellerOrgId?: string;
  status?: 'pending' | 'settled' | 'cancelled';
  cursor?: string;
  limit?: number;
};

export type LedgerFilters = {
  sellerOrgId?: string;
  transactionType?: 'sale_commission' | 'coin_subsidy' | 'coin_fee' | 'seller_payout';
  orderId?: string;
  cursor?: string;
  limit?: number;
};

export type PayoutFilters = {
  sellerOrgId?: string;
  cursor?: string;
  limit?: number;
};

export const systemSettingsQuery = () =>
  queryOptions({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get<SystemSettings>('/admin/settings'),
    staleTime: 60_000,
  });

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSystemSettingsBody) =>
      api.patch<SystemSettings>('/admin/settings', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'revenue'] });
    },
  });
}

export const sellerCommissionQuery = (sellerOrgId: number) =>
  queryOptions({
    queryKey: ['admin', 'sellers', sellerOrgId, 'commission'],
    queryFn: () =>
      api.get<SellerCommissionOverride>(`/admin/settings/sellers/${sellerOrgId}/commission`),
    enabled: sellerOrgId > 0,
  });

export function useSetSellerCommission(sellerOrgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SellerCommissionOverrideBody) =>
      api.put<SellerCommissionOverride>(`/admin/settings/sellers/${sellerOrgId}/commission`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'sellers', sellerOrgId, 'commission'] });
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'revenue'] });
    },
  });
}

export const revenueAnalyticsQuery = () =>
  queryOptions({
    queryKey: ['admin', 'revenue', 'analytics'],
    queryFn: () => api.get<RevenueAnalytics>('/admin/revenue/analytics'),
    staleTime: 30_000,
  });

export const orderSettlementsQuery = (filters?: SettlementFilters) =>
  queryOptions({
    queryKey: ['admin', 'revenue', 'settlements', filters],
    queryFn: () =>
      api.get<Page<OrderSettlement>>(`/admin/revenue/settlements${qs(filters ?? {})}`),
    staleTime: 15_000,
  });

export const sellerPayoutsQuery = (filters?: PayoutFilters) =>
  queryOptions({
    queryKey: ['admin', 'revenue', 'payouts', filters],
    queryFn: () =>
      api.get<Page<SellerPayout>>(`/admin/revenue/payouts${qs(filters ?? {})}`),
    staleTime: 15_000,
  });

export function useCreateSellerPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePayoutBody) =>
      api.post<SellerPayout>('/admin/revenue/payouts', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'revenue'] });
      qc.invalidateQueries({ queryKey: ['seller', 'orders'] });
      qc.invalidateQueries({ queryKey: ['seller', 'analytics'] });
    },
  });
}

export const settlementLedgerQuery = (filters?: LedgerFilters) =>
  queryOptions({
    queryKey: ['admin', 'revenue', 'ledger', filters],
    queryFn: () =>
      api.get<Page<SettlementLedgerEntry>>(`/admin/revenue/ledger${qs(filters ?? {})}`),
    staleTime: 15_000,
  });
