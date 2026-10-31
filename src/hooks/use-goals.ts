import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { components } from '@/types/generated/api';

/** PRD-v2 §6.4. One active goal per user, enforced by the database. */
export type Goal = components['schemas']['Goal'];
export type GoalsList = components['schemas']['GoalsList'];
export type GoalProgress = components['schemas']['GoalProgress'];
export type CreateGoalBody = components['schemas']['CreateGoalBody'];

export const goalsQuery = () =>
  queryOptions({
    queryKey: qk.goals(),
    queryFn: () => api.get<GoalsList>('/goals'),
    staleTime: 60_000,
  });

export const goalProgressQuery = (id: number) =>
  queryOptions({
    queryKey: qk.goalProgress(id),
    queryFn: () => api.get<GoalProgress>(`/goals/${id}/progress`),
    staleTime: 60_000,
  });

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGoalBody) => api.post<Goal>('/goals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals() });
      qc.invalidateQueries({ queryKey: qk.home() });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<CreateGoalBody> & { id: number }) =>
      api.patch<Goal>(`/goals/${id}`, body),
    onSuccess: (_g, vars) => {
      qc.invalidateQueries({ queryKey: qk.goals() });
      qc.invalidateQueries({ queryKey: qk.goalProgress(vars.id) });
      qc.invalidateQueries({ queryKey: qk.home() });
    },
  });
}

export function useCancelGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<Goal>(`/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.goals() });
      qc.invalidateQueries({ queryKey: qk.home() });
    },
  });
}

/**
 * Goals carry a frozen `targetKgTotal`, so progress is a plain ratio rather
 * than something recomputed against a moving baseline — which is what made
 * v1's percentage goals unachievable (PRD-v2 §6.4).
 */
export function goalLabel(goal: Goal) {
  if (goal.type === 'absolute_cap') {
    return `Stay under ${goal.capKgPerDay?.toFixed(1)} kg/day this ${goal.period}`;
  }
  return `Cut ${goal.reducePercent}% this ${goal.period}`;
}
