'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import { AdminEconomySettings } from '@/components/blocks/admin/admin-economy-settings';
import { AdminRevenueAnalytics } from '@/components/blocks/admin/admin-revenue-analytics';
import { AdminSellerCommissions } from '@/components/blocks/admin/admin-seller-commissions';
import { AdminSettlementLedger } from '@/components/blocks/admin/admin-settlement-ledger';
import { AdminSettlementsTable } from '@/components/blocks/admin/admin-settlements-table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { meQuery } from '@/hooks/use-auth';
import { adminOrganizationsQuery, useReviewOrganization } from '@/hooks/use-organization';
import { formatDateLong, initials } from '@/lib/format';
import type { Organization, ReviewOrganizationBody } from '@/types/api';

const STATUS_FILTERS = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'all', label: 'All Organizations' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

type AdminPortalTab = 'queue' | 'revenue' | 'economy' | 'settlements' | 'ledger';

const PORTAL_TABS = [
  { value: 'queue', label: 'Review Queue' },
  { value: 'revenue', label: 'Revenue Analytics' },
  { value: 'economy', label: 'Economy & Commissions' },
  { value: 'settlements', label: 'Order Settlements' },
  { value: 'ledger', label: 'Audit Journal' },
];

function AdminSkeletons() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-72 rounded-sm" />
        <Skeleton className="h-4 w-96 rounded-sm" />
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: me, isLoading: isMeLoading } = useQuery(meQuery());
  const [activeTab, setActiveTab] = React.useState<AdminPortalTab>('queue');
  const [selectedStatus, setSelectedStatus] = React.useState('pending');
  const [search, setSearch] = React.useState('');

  // Dialog for rejecting or suspending an organization (requires a note)
  const [reviewDialog, setReviewDialog] = React.useState<{
    open: boolean;
    org: Organization | null;
    decision: 'reject' | 'suspend';
    note: string;
  }>({
    open: false,
    org: null,
    decision: 'reject',
    note: '',
  });

  const isAdmin = me?.role === 'admin';

  const {
    data: orgsData,
    isLoading: isOrgsLoading,
    refetch,
  } = useQuery({
    ...adminOrganizationsQuery(selectedStatus),
    enabled: Boolean(isAdmin),
  });

  const reviewOrg = useReviewOrganization();

  const items = orgsData?.items ?? [];

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.slug.toLowerCase().includes(q) ||
        (org.city && org.city.toLowerCase().includes(q)),
    );
  }, [items, search]);

  if (isMeLoading) {
    return <AdminSkeletons />;
  }

  // Non-admin protection
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center space-y-4">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Restricted Access: Administrator Privileges Required
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          This section is exclusively available to EcoLife internal staff and platform
          administrators to review and approve organization partner requests.
        </p>
        <div className="pt-2">
          <Link href="/home" className={buttonVariants({ variant: 'outline' })}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleQuickApprove = (org: Organization) => {
    reviewOrg.mutate(
      {
        id: org.id,
        body: {
          decision: 'approve',
          expected: {
            name: org.name,
            logoUrl: org.logoUrl,
            websiteUrl: org.websiteUrl,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(`Organization "${org.name}" approved successfully!`);
          refetch();
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Failed to approve organization.');
        },
      },
    );
  };

  const handleQuickReinstate = (org: Organization) => {
    reviewOrg.mutate(
      {
        id: org.id,
        body: {
          decision: 'reinstate',
          expected: {
            name: org.name,
            logoUrl: org.logoUrl,
            websiteUrl: org.websiteUrl,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(`Organization "${org.name}" reinstated.`);
          refetch();
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Failed to reinstate organization.');
        },
      },
    );
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDialog.org) return;

    if (!reviewDialog.note.trim()) {
      toast.error('A note explaining this decision is required.');
      return;
    }

    const payload: ReviewOrganizationBody = {
      decision: reviewDialog.decision,
      note: reviewDialog.note.trim(),
      expected: {
        name: reviewDialog.org.name,
        logoUrl: reviewDialog.org.logoUrl,
        websiteUrl: reviewDialog.org.websiteUrl,
      },
    };

    reviewOrg.mutate(
      { id: reviewDialog.org.id, body: payload },
      {
        onSuccess: () => {
          toast.success(`Organization "${reviewDialog.org?.name}" ${reviewDialog.decision}ed.`);
          setReviewDialog({ open: false, org: null, decision: 'reject', note: '' });
          refetch();
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Failed to update organization status.');
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <Card className="p-6 sm:p-8 border-border bg-card shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xs bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Staff Operations Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {activeTab === 'queue' && 'Organization Review Queue'}
              {activeTab === 'revenue' && 'Platform Revenue & Coin Economy'}
              {activeTab === 'economy' && 'Economy Settings & Commission Overrides'}
              {activeTab === 'settlements' && 'Marketplace Order Settlements & Disbursements'}
              {activeTab === 'ledger' && 'Immutable Double-Entry Audit Journal'}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              {activeTab === 'queue' &&
                'Inspect pending organization applications, verify legitimacy and contact details, and activate partner portals.'}
              {activeTab === 'revenue' &&
                'Track Gross Merchandise Value (GMV), cash collections, coin liability subsidies, net platform take rates, and cash flow.'}
              {activeTab === 'economy' &&
                'Configure platform baseline commission, coin redemption fee, 10:1 coin-to-rupee valuation, and per-seller overrides.'}
              {activeTab === 'settlements' &&
                'Inspect line-item order settlements, zero-loss payouts, and disburse batched payout obligations to sellers.'}
              {activeTab === 'ledger' &&
                'Audit immutable transaction ledger entries capturing commissions, coin subsidies, redemption fees, and payout disbursements.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" className="gap-1.5 text-xs py-1.5 px-3">
              <Shield className="size-3.5" aria-hidden="true" />
              <span>Signed in as Staff: {me?.name}</span>
            </Badge>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="pt-2 border-t border-border/50">
          <SegmentedControl
            name="admin-portal-tabs"
            label="Admin Portal Section"
            options={PORTAL_TABS}
            value={activeTab}
            onChange={(val) => setActiveTab(val as AdminPortalTab)}
          />
        </div>
      </Card>

      {/* Tab Panels */}
      {activeTab === 'revenue' && <AdminRevenueAnalytics />}

      {activeTab === 'economy' && (
        <div className="space-y-8">
          <AdminEconomySettings />
          <AdminSellerCommissions />
        </div>
      )}

      {activeTab === 'settlements' && <AdminSettlementsTable />}

      {activeTab === 'ledger' && <AdminSettlementLedger />}

      {activeTab === 'queue' && (
        <>
          {/* Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto overflow-x-auto">
              <SegmentedControl
                name="admin-status-filter"
                label="Organization Status Filter"
                options={STATUS_FILTERS}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
            </div>

            <div className="relative min-w-56 sm:min-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, slug, or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Review Queue List */}
          {isOrgsLoading ? (
            <AdminSkeletons />
          ) : filteredItems.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border bg-card space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                No organizations in this queue
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {selectedStatus === 'pending'
                  ? 'All pending organization applications have been reviewed. Good job!'
                  : `No organizations match status "${selectedStatus}".`}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((org) => {
                const isPending = org.status === 'pending';
                const isApproved = org.status === 'approved';
                const isSuspended = org.status === 'suspended';
                const isRejected = org.status === 'rejected';

                const typeLabel =
                  org.type === 'industry'
                    ? 'Corporate / Industry'
                    : org.type === 'ngo'
                      ? 'NGO / Non-Profit'
                      : 'Merchant / Seller';

                return (
                  <Card
                    key={org.id}
                    className="p-6 border-border bg-card shadow-subtle hover:border-primary/40 transition space-y-5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary text-primary text-xl font-extrabold shadow-inner">
                          {org.logoUrl ? (
                            // biome-ignore lint/performance/noImgElement: dynamic logo
                            <img
                              src={org.logoUrl}
                              alt={org.name}
                              className="size-full rounded-md object-cover"
                            />
                          ) : (
                            initials(org.name)
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">{org.name}</h2>
                            <code className="rounded-xs bg-muted border border-border px-2 py-0.5 font-mono text-xs text-primary font-semibold">
                              {org.slug}
                            </code>
                            <span className="text-xs text-muted-foreground">ID #{org.id}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <Badge variant="secondary" className="gap-1 text-[11px]">
                              <Building2 className="size-3" aria-hidden="true" />
                              <span>{typeLabel}</span>
                            </Badge>

                            {isPending && (
                              <Badge variant="warning" className="gap-1 text-[11px]">
                                <Clock className="size-3" aria-hidden="true" />
                                <span>Pending Review</span>
                              </Badge>
                            )}
                            {isApproved && (
                              <Badge variant="positive" className="gap-1 text-[11px]">
                                <CheckCircle2 className="size-3" aria-hidden="true" />
                                <span>Approved &amp; Active</span>
                              </Badge>
                            )}
                            {isSuspended && (
                              <Badge variant="danger" className="gap-1 text-[11px]">
                                <AlertTriangle className="size-3" aria-hidden="true" />
                                <span>Suspended</span>
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge variant="danger" className="gap-1 text-[11px]">
                                <XCircle className="size-3" aria-hidden="true" />
                                <span>Rejected</span>
                              </Badge>
                            )}

                            <span className="text-[11px] text-muted-foreground">
                              · Enrolled: {org.memberCount}{' '}
                              {org.memberCount === 1 ? 'member' : 'members'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              · Applied {formatDateLong(org.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Approve Action */}
                        {isPending && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickApprove(org)}
                            disabled={reviewOrg.isPending}
                            className="gap-1 text-xs"
                          >
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            <span>Approve</span>
                          </Button>
                        )}

                        {/* Reject Action */}
                        {isPending && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setReviewDialog({
                                open: true,
                                org,
                                decision: 'reject',
                                note: '',
                              })
                            }
                            disabled={reviewOrg.isPending}
                            className="gap-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="size-3.5" aria-hidden="true" />
                            <span>Reject</span>
                          </Button>
                        )}

                        {/* Suspend Action */}
                        {isApproved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setReviewDialog({
                                open: true,
                                org,
                                decision: 'suspend',
                                note: '',
                              })
                            }
                            disabled={reviewOrg.isPending}
                            className="gap-1 text-xs text-amber-500 hover:bg-amber-500/10"
                          >
                            <AlertTriangle className="size-3.5" aria-hidden="true" />
                            <span>Suspend</span>
                          </Button>
                        )}

                        {/* Reinstate Action */}
                        {(isSuspended || isRejected) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReinstate(org)}
                            disabled={reviewOrg.isPending}
                            className="gap-1 text-xs text-positive hover:bg-accent/60"
                          >
                            <RotateCcw className="size-3.5" aria-hidden="true" />
                            <span>Reinstate</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Description & Mission */}
                    {org.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-sm border border-border">
                        {org.description}
                      </p>
                    )}

                    {/* Verification Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs border-t border-border pt-4">
                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Website URL
                        </span>
                        {org.websiteUrl ? (
                          <a
                            href={org.websiteUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-0.5 inline-flex items-center gap-1 text-positive hover:underline font-medium truncate max-w-full"
                          >
                            <Globe className="size-3" aria-hidden="true" />
                            <span className="truncate">{org.websiteUrl}</span>
                            <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Contact Email
                        </span>
                        {org.contactEmail ? (
                          <a
                            href={`mailto:${org.contactEmail}`}
                            className="mt-0.5 inline-flex items-center gap-1 text-foreground hover:underline font-medium"
                          >
                            <Mail className="size-3 text-muted-foreground" aria-hidden="true" />
                            <span className="truncate">{org.contactEmail}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Phone Number
                        </span>
                        {org.contactPhone ? (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-foreground font-medium">
                            <Phone className="size-3 text-muted-foreground" aria-hidden="true" />
                            <span>{org.contactPhone}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                          Location
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-foreground font-medium">
                          <MapPin className="size-3 text-muted-foreground" aria-hidden="true" />
                          <span>
                            {org.city || 'Undisclosed'}
                            {org.regionCode ? `, ${org.regionCode}` : ''}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Previous Review Note if present */}
                    {org.reviewNote && (
                      <div className="rounded-sm border border-border bg-muted/60 p-3 text-xs space-y-0.5">
                        <span className="font-semibold text-foreground">
                          Admin Working Note (
                          {org.reviewedAt ? formatDateLong(org.reviewedAt) : 'Logged'}):
                        </span>
                        <p className="text-muted-foreground">{org.reviewNote}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Decision Review Modal Dialog (for Reject or Suspend with required note) */}
      <ModalDialog
        open={reviewDialog.open}
        onClose={() => setReviewDialog({ open: false, org: null, decision: 'reject', note: '' })}
        title={
          reviewDialog.decision === 'reject'
            ? `Reject Application: ${reviewDialog.org?.name}`
            : `Suspend Organization: ${reviewDialog.org?.name}`
        }
        description="Provide a justification note. This note is retained for admin auditing and compliance records."
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="decision-note" className="text-xs font-semibold text-foreground">
              Working Note &amp; Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="decision-note"
              placeholder={
                reviewDialog.decision === 'reject'
                  ? 'e.g. Could not verify business registration / fraudulent submission...'
                  : 'e.g. Temporary suspension due to investigation into spoofed employee accounts...'
              }
              value={reviewDialog.note}
              onChange={(e) => setReviewDialog((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setReviewDialog({ open: false, org: null, decision: 'reject', note: '' })
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewDialog.decision === 'reject' ? 'destructive' : 'secondary'}
              size="sm"
              disabled={reviewOrg.isPending || !reviewDialog.note.trim()}
            >
              {reviewOrg.isPending
                ? 'Submitting…'
                : reviewDialog.decision === 'reject'
                  ? 'Confirm Rejection'
                  : 'Confirm Suspension'}
            </Button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
