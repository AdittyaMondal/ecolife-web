import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type { Schema } from '@/types/api';

/**
 * The 15-question lifestyle wizard, in 5 server-persisted steps (PRD-v2 §3.2).
 * Each step is its own PATCH, so a dropped connection never loses the form.
 */
export type OnboardingAnswers = Schema<'OnboardingAnswers'>;
export type OnboardingState = Schema<'OnboardingState'>;
export type OnboardingCompleteResult = Schema<'OnboardingCompleteResult'>;
export type OnboardingStep1 = Schema<'OnboardingStep1'>;
export type OnboardingStep2 = Schema<'OnboardingStep2'>;
export type OnboardingStep3 = Schema<'OnboardingStep3'>;
export type OnboardingStep4 = Schema<'OnboardingStep4'>;
export type OnboardingStep5 = Schema<'OnboardingStep5'>;
export type OnboardingStepBody =
  | OnboardingStep1
  | OnboardingStep2
  | OnboardingStep3
  | OnboardingStep4
  | OnboardingStep5;
export type City = Schema<'City'>;
export type Region = Schema<'Region'>;
export type Baseline = Schema<'Baseline'>;

export const ONBOARDING_STEPS = 5;

export const onboardingQuery = () =>
  queryOptions({
    queryKey: qk.onboarding(),
    queryFn: () => api.get<OnboardingState>('/profile/onboarding'),
    staleTime: 0,
  });

export const citiesQuery = (q: string) =>
  queryOptions({
    queryKey: qk.cities(q),
    queryFn: () =>
      api.get<{ items: City[] }>(`/cities${qs({ q })}`, { anonymous: true }).then((r) => r.items),
    enabled: q.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

export const regionsQuery = () =>
  queryOptions({
    queryKey: qk.regions(),
    queryFn: () =>
      api.get<{ items: Region[] }>('/regions', { anonymous: true }).then((r) => r.items),
    staleTime: 60 * 60_000,
  });

export function useSaveOnboardingStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ step, body }: { step: number; body: OnboardingStepBody }) =>
      api.patch<OnboardingState>(`/profile/onboarding/step/${step}`, body),
    onSuccess: (state) => {
      qc.setQueryData(qk.onboarding(), state);
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<OnboardingCompleteResult>('/profile/onboarding/complete'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me() });
      qc.invalidateQueries({ queryKey: qk.home() });
      qc.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}
