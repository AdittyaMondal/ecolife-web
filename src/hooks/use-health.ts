import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { components } from '@/types/generated/api';

export type Liveness = components['schemas']['Liveness'];

/** One hook module per resource (PRD-v2 §9.2). This one proves the pipe works. */
export const healthQuery = () =>
  queryOptions({
    queryKey: qk.health(),
    queryFn: () => api.get<Liveness>('/health', { anonymous: true }),
  });
