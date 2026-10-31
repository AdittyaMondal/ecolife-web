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
 * Events (PRD-v2 §6.6). Detail is addressed by SLUG; every action by numeric ID.
 * The creator is the host; co-hosts may scan but not edit or cancel.
 */
export type EventItem = Schema<'Event'>;
export type EventType = EventItem['type'];
export type EventPass = Schema<'EventPass'>;
export type EventParticipant = Schema<'EventParticipant'>;
export type EventParticipantList = Schema<'EventParticipantList'>;
export type CreateEventBody = Schema<'CreateEventBody'>;
export type ScanResult = Schema<'ScanResult'>;
export type RegisterResult = Schema<'RegisterResult'>;
export type PresignResult = Schema<'PresignResult'>;

export type EventFilter = 'upcoming' | 'nearby' | 'registered' | 'hosting' | 'past';
export type EventListFilters = {
  filter?: EventFilter;
  type?: EventType;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'plant_drive', label: 'Plant drive' },
  { value: 'cleanup_drive', label: 'Clean-up drive' },
  { value: 'recycling_drive', label: 'Recycling drive' },
  { value: 'awareness', label: 'Awareness' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
];

export const EVENT_TYPE_LABEL = Object.fromEntries(
  EVENT_TYPES.map((t) => [t.value, t.label]),
) as Record<EventType, string>;

export const eventsInfiniteQuery = (filters: EventListFilters) =>
  infiniteQueryOptions({
    queryKey: qk.eventList(filters),
    queryFn: ({ pageParam }) =>
      api.get<Page<EventItem>>(`/events${qs({ ...filters, cursor: pageParam, limit: 20 })}`),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasMore ? (last.pageInfo.nextCursor ?? undefined) : undefined,
  });

export const eventQuery = (slug: string) =>
  queryOptions({
    queryKey: qk.event(slug),
    queryFn: () => api.get<EventItem>(`/events/${encodeURIComponent(slug)}`),
  });

export const eventPassQuery = (id: number) =>
  queryOptions({
    queryKey: qk.eventPass(id),
    queryFn: () => api.get<EventPass>(`/events/${id}/pass`),
    // The pass is what gets shown at the gate; keep it around for offline display.
    staleTime: 5 * 60_000,
    gcTime: 7 * 86_400_000,
  });

export const eventParticipantsQuery = (id: number) =>
  queryOptions({
    queryKey: qk.eventParticipants(id),
    queryFn: () => api.get<EventParticipantList>(`/events/${id}/participants`),
    staleTime: 10_000,
  });

function useInvalidateEvents() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.events() });
    qc.invalidateQueries({ queryKey: qk.home() });
  };
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (body: CreateEventBody) => api.post<EventItem>('/events', body),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<CreateEventBody> & { id: number }) =>
      api.patch<EventItem>(`/events/${id}`, body),
    onSuccess: invalidate,
  });
}

export function useCancelEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: number) => api.post<EventItem>(`/events/${id}/cancel`),
    onSuccess: invalidate,
  });
}

/** Idempotent server-side: registering twice returns the existing pass. */
export function useRegisterForEvent() {
  const qc = useQueryClient();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: number) => api.post<RegisterResult>(`/events/${id}/register`),
    onSuccess: (result) => {
      qc.setQueryData(qk.eventPass(result.event.id), result.pass);
      qc.setQueryData(qk.event(result.event.slug), result.event);
      invalidate();
    },
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: number) => api.delete<{ cancelled: true }>(`/events/${id}/register`),
    onSuccess: (_r, id) => {
      qc.removeQueries({ queryKey: qk.eventPass(id) });
      invalidate();
    },
  });
}

/**
 * Check a pass in by its code. `scanClientId` is minted per scan so a retried
 * request is deduped. EVENT_004 / alreadyCheckedIn is NOT an error.
 */
export function useScanPass(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (passCode: string) =>
      api.post<ScanResult>(`/events/${eventId}/scan`, {
        passCode,
        scanClientId: crypto.randomUUID(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.eventParticipants(eventId) });
      qc.invalidateQueries({ queryKey: qk.events() });
    },
  });
}

export function useManualCheckIn(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (passId: number) =>
      api.post<ScanResult>(`/events/${eventId}/manual-check-in`, { passId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.eventParticipants(eventId) });
      qc.invalidateQueries({ queryKey: qk.events() });
    },
  });
}

export function useAddCoHost(eventId: number) {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (userId: number) => api.post<EventItem>(`/events/${eventId}/co-hosts`, { userId }),
    onSuccess: invalidate,
  });
}

export function useRemoveCoHost(eventId: number) {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (userId: number) => api.delete<EventItem>(`/events/${eventId}/co-hosts/${userId}`),
    onSuccess: invalidate,
  });
}

/**
 * Images go straight to storage: presign, then PUT the file, then send the
 * returned `publicUrl` as `coverUrl`. Images never transit the API.
 */
export async function uploadImage(file: File, purpose: 'avatar' | 'event_cover'): Promise<string> {
  const contentType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
  const presign = await api.post<PresignResult>('/uploads/presign', {
    purpose,
    contentType,
    sizeBytes: file.size,
  });
  const res = await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) throw new Error('Upload failed');
  return presign.publicUrl;
}

/** Pull a pass code out of whatever the camera read: raw code or `ecolife://pass/<code>`. */
export function passCodeFromQr(raw: string): string {
  const trimmed = raw.trim();
  const m = trimmed.match(/^ecolife:\/\/pass\/(.+)$/i);
  return m ? decodeURIComponent(m[1]) : trimmed;
}
