import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, qs } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type {
  AddOrganizationMemberBody,
  CreateOrganizationBody,
  CreateOrgQuestionBody,
  JoinOrganizationBody,
  JoinOrganizationResult,
  MyOrganization,
  Organization,
  OrganizationAnalytics,
  OrganizationLookupResult,
  OrganizationMemberList,
  OrgEmployeeAnswers,
  OrgOnboardingQuestion,
  OrgOnboardingStatus,
  Page,
  RegenerateCodeResult,
  ReorderOrgQuestionsBody,
  ReviewOrganizationBody,
  SubmitOrgOnboardingAnswersBody,
  UpdateMembershipPreferencesBody,
  UpdateMembershipPreferencesResult,
  UpdateOrganizationBody,
  UpdateOrgQuestionBody,
} from '@/types/api';

export const myOrganizationQuery = () =>
  queryOptions({
    queryKey: qk.myOrganization(),
    queryFn: () => api.get<MyOrganization>('/organizations/me'),
  });

export const orgMembersQuery = (
  orgId: number,
  filters?: { search?: string; role?: string; onboardingStatus?: string },
) =>
  queryOptions({
    queryKey: qk.orgMembers(orgId, filters),
    queryFn: () =>
      api.get<OrganizationMemberList>(
        `/organizations/${orgId}/members${qs({
          search: filters?.search?.trim() || undefined,
          role: filters?.role || undefined,
          onboardingStatus: filters?.onboardingStatus || undefined,
        })}`,
      ),
    enabled: Boolean(orgId),
  });

export const orgAnalyticsQuery = (orgId: number) =>
  queryOptions({
    queryKey: qk.orgAnalytics(orgId),
    queryFn: () => api.get<OrganizationAnalytics>(`/organizations/${orgId}/analytics`),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrganizationBody) => api.post<Organization>('/organizations', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useJoinOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: JoinOrganizationBody) =>
      api.post<JoinOrganizationResult>('/organizations/join', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useUpdateOrganization(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateOrganizationBody) =>
      api.patch<Organization>(`/organizations/${orgId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.orgMembers(orgId) });
    },
  });
}

export function useUpdateMyOrg(orgId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateOrganizationBody & { orgId?: number }) => {
      let targetId = orgId ?? body.orgId;
      if (!targetId) {
        const myOrg = await qc.fetchQuery(myOrganizationQuery());
        if (!myOrg?.organization?.id) {
          throw new Error('No active organization found');
        }
        targetId = myOrg.organization.id;
      }
      const { orgId: _, ...payload } = body;
      return api.patch<Organization>(`/organizations/${targetId}`, payload);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      if (data?.id) {
        qc.invalidateQueries({ queryKey: qk.orgMembers(data.id) });
      }
    },
  });
}

export function useAddOrgMember(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddOrganizationMemberBody) =>
      api.post<OrganizationMemberList>(`/organizations/${orgId}/members`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgMembers(orgId) });
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
    },
  });
}

export function useRemoveOrgMember(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      api.delete<OrganizationMemberList>(`/organizations/${orgId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgMembers(orgId) });
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
    },
  });
}

export function useLeaveOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ left: true }>('/organizations/me/membership'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useRegenerateOrgCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<RegenerateCodeResult>('/organizations/me/code/regenerate'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export function useUpdateMembershipPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMembershipPreferencesBody) =>
      api.patch<UpdateMembershipPreferencesResult>('/organizations/me/membership', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export const orgLookupQuery = (code: string) => {
  const clean = code.trim();
  return queryOptions({
    queryKey: qk.orgLookup(clean),
    queryFn: () => api.get<OrganizationLookupResult>(`/organizations/lookup${qs({ code: clean })}`),
    enabled: clean.length === 6 && /^\d{6}$/.test(clean),
    retry: false,
    staleTime: 30_000,
  });
};

export const adminOrganizationsQuery = (status?: string) =>
  queryOptions({
    queryKey: qk.adminOrgs(status),
    queryFn: () =>
      api.get<Page<Organization>>(
        `/admin/organizations${qs({ status: status === 'all' ? undefined : status, limit: 100 })}`,
      ),
  });

export function useReviewOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ReviewOrganizationBody }) =>
      api.post<Organization>(`/admin/organizations/${id}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ecolife', 'admin'] });
      qc.invalidateQueries({ queryKey: qk.myOrganization() });
    },
  });
}

// --- Part 4: Custom Onboarding Questions & Answers --------------------------

export const orgQuestionsQuery = (orgId: number) =>
  queryOptions({
    queryKey: qk.orgQuestions(orgId),
    queryFn: () => api.get<OrgOnboardingQuestion[]>(`/organizations/${orgId}/questions`),
    enabled: Boolean(orgId),
  });

export function useCreateOrgQuestion(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrgQuestionBody) =>
      api.post<OrgOnboardingQuestion>(`/organizations/${orgId}/questions`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgQuestions(orgId) });
    },
  });
}

export function useUpdateOrgQuestion(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: number; body: UpdateOrgQuestionBody }) =>
      api.put<OrgOnboardingQuestion>(`/organizations/${orgId}/questions/${questionId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgQuestions(orgId) });
    },
  });
}

export function useReorderOrgQuestions(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderOrgQuestionsBody) =>
      api.post<{ ok: boolean }>(`/organizations/${orgId}/questions/reorder`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgQuestions(orgId) });
    },
  });
}

export function useDeleteOrgQuestion(orgId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: number) =>
      api.delete<{ ok: boolean }>(`/organizations/${orgId}/questions/${questionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orgQuestions(orgId) });
    },
  });
}

export const myOrgOnboardingQuery = () =>
  queryOptions({
    queryKey: qk.myOrgOnboarding(),
    queryFn: () => api.get<OrgOnboardingStatus>('/organizations/me/onboarding'),
  });

export function useSubmitOrgOnboardingAnswers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitOrgOnboardingAnswersBody) =>
      api.post<{ ok: boolean; count: number }>('/organizations/me/onboarding', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrgOnboarding() });
      qc.invalidateQueries({ queryKey: qk.me() });
    },
  });
}

export const orgMemberAnswersQuery = (orgId: number, userId: number) =>
  queryOptions({
    queryKey: qk.orgMemberAnswers(orgId, userId),
    queryFn: () => api.get<OrgEmployeeAnswers>(`/organizations/${orgId}/members/${userId}/answers`),
    enabled: Boolean(orgId) && Boolean(userId),
  });
