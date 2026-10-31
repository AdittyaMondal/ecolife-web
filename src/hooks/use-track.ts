import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { components } from '@/types/generated/api';

/** The 5 daily questions (PRD-v2 §3.4). Target: under 30 seconds, one thumb. */
export type TrackToday = components['schemas']['TrackToday'];
export type DailyAnswers = components['schemas']['DailyAnswers'];
export type LogResult = components['schemas']['LogResult'];
export type Trip = components['schemas']['Trip'];
export type HistoryPoint = components['schemas']['HistoryPoint'];
export type TrackGranularity = 'day' | 'week' | 'month';

/**
 * A trip row in the form, with a client-only id.
 *
 * The travel question is a removable list. An array index as React key makes a
 * deletion reuse the previous row's DOM node, so focus and caret land on the
 * wrong input. `_id` never leaves the client — it is stripped before submit.
 */
export type TripRow = Trip & { _id: string };

export const trackTodayQuery = () =>
  queryOptions({
    queryKey: qk.trackToday(),
    queryFn: () => api.get<TrackToday>('/track/today'),
    staleTime: 30_000,
  });

export const trackHistoryQuery = (
  from: string,
  to: string,
  granularity: TrackGranularity = 'day',
) =>
  queryOptions({
    queryKey: qk.trackHistoryRange(from, to, granularity),
    queryFn: () =>
      api
        .get<{ points: HistoryPoint[] }>(`/track/history${qs({ from, to, granularity })}`)
        .then((r) => r.points),
    staleTime: 60_000,
  });

/**
 * Submitting the daily log — the core loop.
 *
 * `clientLogId` is generated here, not on the server, and is what makes a
 * retry safe: the server dedupes on (userId, clientLogId), so a double-tap or
 * a replayed offline queue produces one footprint and one reward, never two
 * (PRD-v2 §10.3).
 *
 * The response carries the new number, the delta, the reward and the streak,
 * so the result sheet renders from the mutation result with no refetch.
 */
export function useSubmitLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['track', 'submit'],
    mutationFn: (input: { logDate: string; answers: DailyAnswers; existingLogId?: number }) => {
      if (input.existingLogId !== undefined) {
        return api.patch<LogResult>(`/track/logs/${input.existingLogId}`, {
          answers: input.answers,
        });
      }
      return api.post<LogResult>('/track/logs', {
        logDate: input.logDate,
        answers: input.answers,
        clientLogId: crypto.randomUUID(),
      });
    },
    onSuccess: () => {
      // Home shows today's number, the streak and the wallet; all three moved.
      qc.invalidateQueries({ queryKey: qk.home() });
      qc.invalidateQueries({ queryKey: qk.trackToday() });
      qc.invalidateQueries({ queryKey: qk.trackHistory() });
      qc.invalidateQueries({ queryKey: qk.goals() });
      qc.invalidateQueries({ queryKey: qk.leaderboard() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

/** Deep-equal enough for a form: did the user change anything from the prefill? */
export function answersDiffer(a: DailyAnswers, b: DailyAnswers) {
  return JSON.stringify(a) !== JSON.stringify(b);
}
