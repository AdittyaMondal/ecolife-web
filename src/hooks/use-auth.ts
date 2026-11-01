import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/fetcher';
import { qk } from '@/lib/query-keys';
import { clearSession, setSession } from '@/lib/session';
import type { Schema } from '@/types/api';

/** PRD-v2 §6.1. Web keeps the refresh token in an httpOnly cookie. */
export type Me = Schema<'Me'>;
export type AuthResult = Schema<'AuthResult'>;
export type LoginBody = Schema<'LoginBody'>;
export type RegisterBody = Schema<'RegisterBody'>;
export type OkMessage = Schema<'OkMessage'>;

export const meQuery = () =>
  queryOptions({
    queryKey: qk.me(),
    queryFn: () => api.get<Me>('/auth/me'),
    staleTime: 30_000,
    /**
     * A 4xx will not become a 2xx by asking again. The fetcher has already
     * tried a refresh-and-retry by the time an error reaches here, so a 401
     * means the session is genuinely gone — retrying three times only delays
     * the redirect to /login. Server and network errors still get retries.
     */
    retry: (attempt: number, error: unknown) => {
      const status = (error as { httpStatus?: number } | null)?.httpStatus ?? 0;
      if (status >= 400 && status < 500) return false;
      return attempt < 2;
    },
  });

export { landingPathFor } from '@/lib/routing';

function useSignedIn() {
  const qc = useQueryClient();
  return (result: AuthResult) => {
    setSession(result.session);
    qc.setQueryData(qk.me(), result.user);
  };
}

export function useLogin() {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: (body: LoginBody) => api.post<AuthResult>('/auth/login', body, { anonymous: true }),
    onSuccess: signedIn,
  });
}

export function useRegister() {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: (body: RegisterBody) =>
      api.post<AuthResult>(
        '/auth/register',
        { ...body, timezone: body.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone },
        { anonymous: true },
      ),
    onSuccess: signedIn,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<OkMessage>('/auth/logout').catch(() => null),
    onSettled: () => {
      clearSession();
      qc.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<OkMessage>('/auth/forgot-password', { email }, { anonymous: true }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { token: string; password: string }) =>
      api.post<OkMessage>('/auth/reset-password', body, { anonymous: true }),
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      api.post<OkMessage>('/auth/verify-email', { token }, { anonymous: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me() }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => api.post<OkMessage>('/auth/resend-verification'),
  });
}
