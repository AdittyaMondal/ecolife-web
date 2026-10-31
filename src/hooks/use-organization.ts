import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import type {
  AddOrganizationMemberBody,
  CreateOrganizationBody,
  JoinOrganizationBody,
  JoinOrganizationResult,
  MyOrganization,
  Organization,
  OrganizationMemberList,
  UpdateOrganizationBody,
} from '@/types/api';

export const myOrganizationQuery = () =>
  queryOptions({
    queryKey: qk.myOrganization(),
    queryFn: () => api.get<MyOrganization>('/organizations/me'),
  });

export const orgMembersQuery = (orgId: number) =>
  queryOptions({
    queryKey: qk.orgMembers(orgId),
    queryFn: () => api.get<OrganizationMemberList>(`/organizations/${orgId}/members`),
    enabled: Boolean(orgId),
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
