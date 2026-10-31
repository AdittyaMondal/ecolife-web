/**
 * Error code → user-facing copy. Branch on `error.code`, never on
 * `error.message` (docs/error-codes.md). Server messages are a fallback only.
 */
import { ApiError } from './fetcher';

const COPY: Record<string, string> = {
  GEN_400: 'Some of those details are not valid. Please check and try again.',
  GEN_429: 'You are doing that a bit too often. Please wait a moment.',
  GEN_501: 'This part of EcoLife is still being built. Check back soon.',
  INTERNAL_001: 'Something went wrong on our side. Please try again shortly.',
  NETWORK_ERROR: 'We could not reach the server. Check your connection and try again.',

  AUTH_001: 'That email and password do not match.',
  AUTH_002: 'Your session expired. Please sign in again.',
  AUTH_003: 'Your session ended. Please sign in again.',
  AUTH_004: 'Verify your email to start earning points and coins.',
  AUTH_005: 'An account with that email already exists.',

  ONB_001: 'Please answer every question on this step.',
  ONB_002: 'Your profile is already set up.',
  ONB_003: 'Finish setting up your profile first.',

  TRACK_001: 'You have already logged this day.',
  TRACK_002: 'You can only log today or yesterday.',
  TRACK_003: 'The edit window for this log has closed.',

  GOAL_001: 'You already have an active goal. Finish or cancel it first.',
  GOAL_002: 'The end date must be after the start date.',
  GOAL_003: 'Please set a target for this goal type.',

  EVENT_001: 'Only the host or a co-host can do that.',
  EVENT_002: 'That pass does not belong to this event.',
  EVENT_003: 'Check-in opens 1 hour before the event and closes 2 hours after.',
  EVENT_005: 'This event is full.',
  EVENT_006: 'You are already registered.',
  EVENT_007: 'Registration for this event has closed.',

  SHOP_001: 'One of the items in your cart is out of stock.',
  SHOP_002: 'Coin discounts are capped at 20% of the order.',
  SHOP_003: 'You do not have enough coins for that.',
  SHOP_004: 'This order was already placed.',

  POINTS_001: 'You do not have enough coins for that.',
};

export function errorCode(err: unknown): string | null {
  return err instanceof ApiError ? err.code : null;
}

export function errorMessage(err: unknown, fallback = 'Something went wrong. Please try again.') {
  if (err instanceof ApiError) return COPY[err.code] ?? err.message ?? fallback;
  return fallback;
}

/** `details.issues` on GEN_400 → `{ field: message }` for inline form errors. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || err.code !== 'GEN_400') return {};
  const issues = (err.details as { issues?: { path?: unknown; message?: string }[] } | null)
    ?.issues;
  if (!Array.isArray(issues)) return {};
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const path = Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path ?? '');
    if (path && issue.message && !out[path]) out[path] = issue.message;
  }
  return out;
}
