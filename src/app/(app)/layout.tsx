'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Award,
  Bell,
  Building2,
  Calendar,
  Coins,
  Home,
  Leaf,
  LogOut,
  MailWarning,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Trees,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ModalDialog } from '@/components/ui/dialog';
import { FloatingChat } from '@/components/blocks/ai-chat/floating-chat';
import { meQuery, useLogout, useResendVerification } from '@/hooks/use-auth';
import { cartQuery } from '@/hooks/use-marketplace';
import { notificationsQuery, useMarkNotificationRead } from '@/hooks/use-profile';
import { formatNumber, formatRelative, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

const PRIMARY_NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/track', label: 'Track', icon: Activity },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/events', label: 'Events', icon: Calendar },
] as const;

const SECONDARY_NAV = [
  { href: '/garden', label: 'Garden', icon: Trees },
  { href: '/organization', label: 'Organization', icon: Building2 },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppLayoutShell>{children}</AppLayoutShell>
    </React.Suspense>
  );
}

function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: me } = useQuery(meQuery());
  const { data: cart } = useQuery(cartQuery());
  const { data: notificationsData } = useQuery({
    ...notificationsQuery(),
    enabled: notificationsOpen,
  });
  const markRead = useMarkNotificationRead();
  const resendVerification = useResendVerification();
  const logout = useLogout();

  const cartItemCount = React.useMemo(
    () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const unreadCount = me?.unreadNotifications ?? 0;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Desktop Geometric Sidebar (≥md)
          Outer surface: rounded-lg (28px), p-4 (16px) inset.
          Inner items: rounded-sm (12px = 28 − 16). */}
      <aside
        aria-label="Primary navigation"
        className="fixed top-4 bottom-4 left-4 z-30 hidden w-64 lg:w-72 flex-col justify-between rounded-lg border border-border bg-card/95 shadow-subtle backdrop-blur-md p-4 lg:p-5 md:flex"
      >
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/home"
              className="inline-flex items-center gap-2.5 rounded-sm p-1 text-foreground transition hover:opacity-90"
            >
              <span className="flex size-9 items-center justify-center rounded-xs bg-secondary text-primary">
                <Leaf className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="text-base font-semibold tracking-tight leading-none">EcoLife</span>
                <span className="mt-0.5 text-xs text-muted-foreground">Carbon &amp; Rewards</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                aria-label={
                  unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'
                }
                className="relative inline-flex size-9 items-center justify-center rounded-sm border border-border bg-muted text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                <Bell className="size-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="tabular absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>

              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle color theme"
                  className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-muted text-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="size-4" aria-hidden="true" />
                  ) : (
                    <Moon className="size-4" aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Wallet Pill — concentric: outer rounded-sm (12px), p-1 (4px), inner tiles rounded-xs (8px) */}
          {me && (
            <div className="grid grid-cols-2 gap-1 rounded-sm border border-border bg-muted p-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xs bg-card px-2.5 py-2 transition hover:bg-accent/60"
                title="Coins balance — spend up to 20% off in Marketplace"
              >
                <Coins className="size-4 shrink-0 text-positive" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="tabular truncate text-xs font-semibold text-foreground">
                    {formatNumber(me.wallet.coinsBalance)}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-none">Coins</p>
                </div>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 rounded-xs bg-card px-2.5 py-2 transition hover:bg-accent/60"
                title="Total points — ranks you on the Leaderboard"
              >
                <Award className="size-4 shrink-0 text-positive" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="tabular truncate text-xs font-semibold text-foreground">
                    {formatNumber(me.wallet.pointsTotal)}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-none">Points</p>
                </div>
              </Link>
            </div>
          )}

          {/* Core 4 Navigation Links */}
          <nav aria-label="Main sections" className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Core
            </p>
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {item.href === '/marketplace' && cartItemCount > 0 && (
                    <span
                      className={cn(
                        'tabular inline-flex min-h-5 min-w-5 items-center justify-center rounded-xs px-1.5 text-xs font-semibold',
                        active
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-accent text-accent-foreground',
                      )}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <nav aria-label="Community and account" className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Community &amp; Partners
            </p>
            {/* Dynamic Partner Portal Link */}
            {(() => {
              const org = me?.organization;
              const orgHref =
                org?.type === 'industry'
                  ? '/organization/corporate'
                  : org?.type === 'ngo'
                    ? '/organization/community'
                    : org?.type === 'seller'
                      ? '/marketplace/seller'
                      : '/organization';

              const orgLabel =
                org?.type === 'industry'
                  ? 'Corporate Portal'
                  : org?.type === 'ngo'
                    ? 'Community Portal'
                    : org?.type === 'seller'
                      ? 'Seller Portal'
                      : 'Organization';

              const active = isActivePath(pathname, orgHref);

              return (
                <Link
                  href={orgHref}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Building2 className="size-4 shrink-0" aria-hidden="true" />
                  <span>{orgLabel}</span>
                  {org?.status === 'pending' && (
                    <span className="ml-auto rounded-xs bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      Pending
                    </span>
                  )}
                </Link>
              );
            })()}

            {SECONDARY_NAV.filter((item) => item.href !== '/organization').map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin Navigation (Staff Only) */}
          {me?.role === 'admin' && (
            <nav aria-label="Staff administration" className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Operations</span>
                <span className="rounded-xs bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Staff
                </span>
              </p>
              <Link
                href="/admin"
                aria-current={isActivePath(pathname, '/admin') ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition',
                  isActivePath(pathname, '/admin')
                    ? 'bg-amber-600 font-semibold text-white'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <ShieldCheck className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>Admin Review</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Bottom User Card — outer rounded-sm (12px), p-1 (4px) inset, inner avatar rounded-xs (8px) */}
        <div className="flex flex-col gap-2">
          {me && (
            <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-muted p-1">
              <Link
                href="/profile"
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xs p-1.5 transition hover:bg-card"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-secondary text-xs font-semibold text-secondary-foreground">
                  {initials(me.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {me.name}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {me.city ?? me.email}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout.mutate(undefined, {
                    onSettled: () => router.push('/login'),
                  });
                }}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition hover:bg-card hover:text-destructive"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar (<md) */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden">
        <Link href="/home" className="inline-flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xs bg-secondary text-primary">
            <Leaf className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">EcoLife</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {me && (
            <Link
              href="/profile"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xs border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"
            >
              <Coins className="size-3.5 text-positive" aria-hidden="true" />
              <span className="tabular">{formatNumber(me.wallet.coinsBalance)}</span>
            </Link>
          )}

          <Link
            href="/garden"
            aria-label="Garden"
            className="inline-flex size-9 items-center justify-center rounded-xs border border-border bg-muted text-foreground"
          >
            <Trees className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/organization"
            aria-label="Organization"
            className="inline-flex size-9 items-center justify-center rounded-xs border border-border bg-muted text-foreground"
          >
            <Building2 className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/leaderboard"
            aria-label="Leaderboard"
            className="inline-flex size-9 items-center justify-center rounded-xs border border-border bg-muted text-foreground"
          >
            <Trophy className="size-4" aria-hidden="true" />
          </Link>

          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
            className="relative inline-flex size-9 items-center justify-center rounded-xs border border-border bg-muted text-foreground"
          >
            <Bell className="size-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="tabular absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          <Link
            href="/profile"
            aria-label="Profile"
            className="inline-flex size-9 items-center justify-center rounded-xs border border-border bg-muted text-foreground"
          >
            <User className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="pb-28 md:pl-72 lg:pl-80 md:pb-12">
        {/* Email Verification Banner (AUTH_004: browsing allowed, earning blocked until verified) */}
        {me && !me.emailVerified && (
          <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-8">
            <div className="flex flex-col gap-3 rounded-lg border border-warning/40 bg-warning-surface p-4 sm:flex-row sm:items-center sm:justify-between shadow-subtle">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-card text-warning">
                  <MailWarning className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Verify your email to start earning rewards
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We sent a verification link to {me.email}. Earning points and coins is paused
                    until verified.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={resendVerification.isPending}
                onClick={() => {
                  resendVerification.mutate(undefined, {
                    onSuccess: (res) => toast.success(res.message || 'Verification email sent.'),
                    onError: () => toast.error('Could not resend right now. Try again shortly.'),
                  });
                }}
              >
                {resendVerification.isPending ? 'Sending…' : 'Resend email'}
              </Button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-8 lg:px-10 py-6 sm:py-8">
          <React.Suspense fallback={null}>{children}</React.Suspense>
        </div>
      </div>

      {/* Mobile Bottom Dock (<md)
          Outer dock: rounded-lg (28px), p-2 (8px) inset.
          Inner items: rounded-md (20px = 28 − 8). */}
      <nav
        aria-label="Bottom navigation"
        className="pb-safe fixed right-3 bottom-3 left-3 z-30 md:hidden"
      >
        <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-md">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium transition',
                  active
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
                {item.href === '/marketplace' && cartItemCount > 0 && (
                  <span className="tabular absolute top-1 right-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-secondary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* In-App Notifications Dialog */}
      <ModalDialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description="Updates on your goals, events, and rewards."
      >
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {(notificationsData?.items ?? []).length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              You are all caught up.
            </p>
          ) : (
            (notificationsData?.items ?? []).map((n) => {
              const unread = !n.readAt;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-sm border p-3 transition',
                    unread ? 'border-tertiary/50 bg-accent/40' : 'border-border bg-muted/40',
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {unread && (
                        <span
                          className="size-2 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    </div>
                    {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelative(n.createdAt)}
                      </span>
                      {n.linkPath && (
                        <Link
                          href={n.linkPath}
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-semibold text-positive hover:underline"
                        >
                          Open →
                        </Link>
                      )}
                    </div>
                  </div>
                  {unread && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(n.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ModalDialog>

      {/* Floating AI Advisor Chatbot */}
      <FloatingChat />
    </div>
  );
}
