import {
  infiniteQueryOptions,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import { clearSession } from '@/lib/session';
import type { Page, Schema } from '@/types/api';

export type OwnProfile = Schema<'OwnProfile'>;
export type PublicProfile = Schema<'PublicProfile'>;
export type ProfilePatchBody = Schema<'ProfilePatchBody'>;
export type RewardEntry = Schema<'RewardEntry'>;
export type Notification = Schema<'Notification'>;
export type Methodology = Schema<'Methodology'>;

export const profileQuery = () =>
  queryOptions({
    queryKey: qk.profile(),
    queryFn: () => api.get<OwnProfile>('/profile'),
  });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfilePatchBody) => api.patch<OwnProfile>('/profile', body),
    onSuccess: (profile) => {
      qc.setQueryData(qk.profile(), profile);
      qc.invalidateQueries({ queryKey: qk.me() });
      qc.invalidateQueries({ queryKey: qk.home() });
      qc.invalidateQueries({ queryKey: qk.trackToday() });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ deleted: true }>('/profile'),
    onSuccess: () => {
      clearSession();
      qc.clear();
    },
  });
}

export async function downloadExport() {
  const data = await api.get<unknown>('/profile/export');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ecolife-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

export const rewardsInfiniteQuery = () =>
  infiniteQueryOptions({
    queryKey: qk.rewards(),
    queryFn: ({ pageParam }) =>
      api.get<Page<RewardEntry>>(`/profile/rewards${qs({ cursor: pageParam, limit: 20 })}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasMore ? (last.pageInfo.nextCursor ?? undefined) : undefined,
  });

export const publicProfileQuery = (id: number) =>
  queryOptions({
    queryKey: qk.publicProfile(id),
    queryFn: () => api.get<PublicProfile>(`/users/${id}`),
  });

export const notificationsQuery = () =>
  queryOptions({
    queryKey: qk.notifications(),
    queryFn: () => api.get<Page<Notification>>(`/notifications${qs({ limit: 20 })}`),
    staleTime: 30_000,
  });

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch<Notification>(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export const methodologyQuery = () =>
  queryOptions({
    queryKey: qk.methodology(),
    queryFn: () => api.get<Methodology>('/carbon/methodology', { anonymous: true }),
    staleTime: 60 * 60_000,
  });

export const REWARD_SOURCE_LABEL: Record<RewardEntry['source'], string> = {
  onboarding: 'Profile set up',
  daily_log: 'Daily log',
  streak: 'Streak bonus',
  reduction: 'Lower than baseline',
  goal: 'Goal achieved',
  event_attend: 'Event attended',
  event_host: 'Event hosted',
  order: 'Marketplace order',
  order_refund: 'Order refund',
  admin: 'Adjustment',
};
