'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Filter,
  Info,
  MapPin,
  Percent,
  RotateCcw,
  Search,
  Sliders,
  Store,
  Tag,
  X,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { adminOrganizationsQuery } from '@/hooks/use-organization';
import {
  sellerCommissionQuery,
  systemSettingsQuery,
  useSetSellerCommission,
} from '@/hooks/use-revenue';
import { bpsToPercent, percentToBps } from '@/lib/revenue-math';
import { cn } from '@/lib/utils';
import type { Organization, SellerCommissionOverride } from '@/types/api';

/** Standard quick-select commission override percentages */
const QUICK_PRESETS = [0, 5, 7.5, 8, 10, 12, 15, 20];

export interface AdminSellerCommissionsProps {
  className?: string;
}

/**
 * Individual seller row displaying commission baseline, override rate, and configure action.
 */
function SellerRow({
  seller,
  defaultRateBps,
  defaultPercent,
  onConfigure,
}: {
  seller: Organization;
  defaultRateBps: number;
  defaultPercent: number;
  onConfigure: (seller: Organization, currentOverride?: SellerCommissionOverride) => void;
}) {
  const { data: override, isLoading: isOverrideLoading } = useQuery(
    sellerCommissionQuery(seller.id),
  );

  const isCustomOverride =
    override?.commissionRateBps !== null && override?.commissionRateBps !== undefined;

  const effectivePercent = isCustomOverride
    ? (override?.effectiveCommissionPercent ?? bpsToPercent(override?.commissionRateBps))
    : defaultPercent;

  const effectiveBps = isCustomOverride
    ? (override?.effectiveCommissionRateBps ?? override?.commissionRateBps ?? defaultRateBps)
    : defaultRateBps;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between">
      {/* Organization Meta */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-border bg-muted/60 text-primary">
          {seller.type === 'seller' ? (
            <Store className="size-5" aria-hidden="true" />
          ) : (
            <Building2 className="size-5" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{seller.name}</h3>
            <span className="text-xs text-muted-foreground font-mono">@{seller.slug}</span>

            {/* Status indicator */}
            <Badge
              variant={
                seller.status === 'approved'
                  ? 'positive'
                  : seller.status === 'pending'
                    ? 'warning'
                    : 'destructive'
              }
              className="text-[11px] uppercase tracking-wider"
            >
              {seller.status}
            </Badge>

            {seller.type !== 'seller' && (
              <Badge variant="neutral" className="text-[11px] capitalize">
                {seller.type}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {seller.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                <span>
                  {seller.city}
                  {seller.regionCode ? `, ${seller.regionCode}` : ''}
                </span>
              </span>
            ) : (
              <span>Location undisclosed</span>
            )}
            <span>·</span>
            <span>ID #{seller.id}</span>
          </div>
        </div>
      </div>

      {/* Rates and Status Badges */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
        {/* Global Default vs Effective Rate */}
        <div className="flex flex-col sm:items-end text-xs">
          <span className="text-muted-foreground">
            Global Default:{' '}
            <span className="font-mono font-medium text-foreground">{defaultPercent}%</span>
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-muted-foreground">Effective:</span>
            {isOverrideLoading ? (
              <Skeleton className="h-4 w-12 rounded-xs" />
            ) : (
              <span className="font-mono font-bold text-foreground">
                {effectivePercent}%{' '}
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({effectiveBps} bps)
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center min-w-[140px]">
          {isOverrideLoading ? (
            <Skeleton className="h-6 w-28 rounded-xs" />
          ) : isCustomOverride ? (
            <Badge variant="primary" className="font-medium">
              Custom Override ({effectivePercent}%)
            </Badge>
          ) : (
            <Badge variant="muted" className="font-medium">
              Default ({defaultPercent}%)
            </Badge>
          )}
        </div>

        {/* Configure Action */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onConfigure(seller, override)}
          className="shrink-0 gap-1.5"
        >
          <Sliders className="size-3.5 text-primary" aria-hidden="true" />
          <span>Configure Override</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Modal dialog for configuring or clearing a seller's marketplace commission override.
 */
function CommissionOverrideDialog({
  open,
  seller,
  defaultRateBps,
  defaultPercent,
  onClose,
}: {
  open: boolean;
  seller: Organization | null;
  defaultRateBps: number;
  defaultPercent: number;
  onClose: () => void;
}) {
  const sellerId = seller?.id ?? 0;
  const { data: currentOverride, isLoading: isOverrideLoading } = useQuery({
    ...sellerCommissionQuery(sellerId),
    enabled: open && sellerId > 0,
  });

  const setCommission = useSetSellerCommission(sellerId);

  // Form states
  const [usePlatformDefault, setUsePlatformDefault] = React.useState<boolean>(true);
  const [percentInput, setPercentInput] = React.useState<string>('10');
  const [reason, setReason] = React.useState<string>('');
  const [inputError, setInputError] = React.useState<string | null>(null);

  // Synchronize state when override query resolves or seller changes
  React.useEffect(() => {
    if (!open || !seller) return;

    if (currentOverride) {
      const isOverridden =
        currentOverride.commissionRateBps !== null &&
        currentOverride.commissionRateBps !== undefined;

      setUsePlatformDefault(!isOverridden);

      if (isOverridden) {
        const val =
          currentOverride.commissionPercent ?? bpsToPercent(currentOverride.commissionRateBps);
        setPercentInput(val.toString());
      } else {
        setPercentInput(defaultPercent.toString());
      }
    } else {
      setUsePlatformDefault(true);
      setPercentInput(defaultPercent.toString());
    }

    setReason('');
    setInputError(null);
  }, [open, seller, currentOverride, defaultPercent]);

  const handlePercentChange = (val: string) => {
    setPercentInput(val);
    const num = parseFloat(val);
    if (isNaN(num)) {
      setInputError('Please enter a valid percentage number.');
    } else if (num < 0) {
      setInputError('Commission percentage cannot be negative.');
    } else if (num > 50) {
      setInputError('Commission percentage cannot exceed 50.00%.');
    } else {
      setInputError(null);
    }
  };

  const handleApplyPreset = (preset: number) => {
    setUsePlatformDefault(false);
    setPercentInput(preset.toString());
    setInputError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;

    let targetBps: number | null = null;

    if (!usePlatformDefault) {
      const parsed = parseFloat(percentInput);
      if (isNaN(parsed) || parsed < 0 || parsed > 50) {
        setInputError('Commission rate must be between 0.00% and 50.00%');
        return;
      }
      targetBps = percentToBps(parsed);
    }

    try {
      await setCommission.mutateAsync({
        commissionRateBps: targetBps,
        reason: reason.trim() || undefined,
      });

      if (targetBps === null) {
        toast.success(
          `Reverted "${seller.name}" to platform default commission (${defaultPercent}%).`,
        );
      } else {
        const pct = bpsToPercent(targetBps);
        toast.success(`Updated commission for "${seller.name}" to ${pct}% (${targetBps} bps).`);
      }

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update commission override';
      toast.error(message);
    }
  };

  if (!seller) return null;

  const parsedCurrentPercent = parseFloat(percentInput);
  const calculatedBps =
    !isNaN(parsedCurrentPercent) && parsedCurrentPercent >= 0 && parsedCurrentPercent <= 50
      ? percentToBps(parsedCurrentPercent)
      : null;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sliders className="size-5 text-primary" aria-hidden="true" />
          <span>Configure Seller Commission</span>
        </div>
      }
      description={`Override or inherit default marketplace commission for ${seller.name}.`}
      size="md"
    >
      {isOverrideLoading ? (
        <div className="space-y-4 py-4 animate-pulse">
          <Skeleton className="h-16 w-full rounded-sm" />
          <Skeleton className="h-24 w-full rounded-sm" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Seller Snapshot Card */}
          <div className="rounded-sm border border-border bg-muted/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                  Seller Organization
                </span>
                <span className="font-semibold text-foreground text-sm">{seller.name}</span>
                <span className="text-xs text-muted-foreground ml-1.5 font-mono">
                  (@{seller.slug})
                </span>
              </div>
              <Badge
                variant={seller.status === 'approved' ? 'positive' : 'warning'}
                className="text-[11px]"
              >
                {seller.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
              <span className="text-muted-foreground">Platform Baseline Rate:</span>
              <span className="font-mono font-medium text-foreground">
                {defaultPercent}% ({defaultRateBps} bps)
              </span>
            </div>
          </div>

          {/* Platform Default Toggle */}
          <div className="rounded-sm border border-border bg-card p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usePlatformDefault}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUsePlatformDefault(checked);
                  if (checked) {
                    setPercentInput(defaultPercent.toString());
                    setInputError(null);
                  }
                }}
                className="mt-0.5 size-4 rounded-xs border-input text-primary focus:ring-ring"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground block">
                  Use Platform Default ({defaultPercent}%)
                </span>
                <p className="text-xs text-muted-foreground">
                  Inherits system-wide commission rate ({defaultRateBps} bps). Clears any custom
                  override on this seller.
                </p>
              </div>
            </label>
          </div>

          {/* Custom Percentage Input Section */}
          <div
            className={cn(
              'space-y-3 transition-opacity duration-200',
              usePlatformDefault && 'opacity-40 pointer-events-none',
            )}
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="override-rate-input"
                className="text-xs font-semibold text-foreground"
              >
                Custom Commission Percentage (0.00% – 50.00%)
              </label>
              {calculatedBps !== null && !usePlatformDefault && (
                <span className="text-xs font-mono font-medium text-primary">
                  = {calculatedBps.toLocaleString()} basis points (bps)
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                id="override-rate-input"
                type="number"
                step="0.01"
                min="0"
                max="50"
                disabled={usePlatformDefault}
                value={percentInput}
                onChange={(e) => handlePercentChange(e.target.value)}
                placeholder="e.g. 8.00"
                className="pr-10 font-mono text-base"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
                <Percent className="size-4" aria-hidden="true" />
              </div>
            </div>

            {inputError && (
              <p className="text-xs font-medium text-destructive flex items-center gap-1">
                <AlertCircle className="size-3.5" aria-hidden="true" />
                <span>{inputError}</span>
              </p>
            )}

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={usePlatformDefault}
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'rounded-xs border border-border bg-muted/60 px-2 py-1 text-xs font-mono font-medium text-foreground transition hover:border-primary/60 hover:bg-accent hover:text-accent-foreground disabled:opacity-40',
                      !usePlatformDefault &&
                        parseFloat(percentInput) === preset &&
                        'border-primary bg-primary/10 text-primary font-bold',
                    )}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Reason Note */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="override-reason" className="text-xs font-semibold text-foreground">
              Audit Note / Reason{' '}
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              id="override-reason"
              placeholder="e.g. Strategic eco-partner agreement / Q4 promotional discount tier..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={setCommission.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={setCommission.isPending}
              disabled={setCommission.isPending || (!usePlatformDefault && Boolean(inputError))}
            >
              {usePlatformDefault ? 'Apply Platform Default' : 'Save Custom Override'}
            </Button>
          </div>
        </form>
      )}
    </ModalDialog>
  );
}

/**
 * Main Admin Seller Commission Overrides management block (Part 7, Requirement 25).
 */
export function AdminSellerCommissions({ className }: AdminSellerCommissionsProps) {
  // 1. Fetch system settings for global baseline commission %
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    refetch: refetchSettings,
  } = useQuery(systemSettingsQuery());

  // 2. Fetch all organizations
  const {
    data: orgsData,
    isLoading: isOrgsLoading,
    isError: isOrgsError,
    refetch: refetchOrgs,
  } = useQuery(adminOrganizationsQuery('all'));

  // Filter states
  const [search, setSearch] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<
    'approved' | 'all' | 'pending' | 'suspended'
  >('approved');
  const [typeFilter, setTypeFilter] = React.useState<'sellers' | 'all'>('sellers');

  // Modal dialog state
  const [configureDialog, setConfigureDialog] = React.useState<{
    open: boolean;
    seller: Organization | null;
  }>({
    open: false,
    seller: null,
  });

  const defaultCommissionRateBps = settings?.defaultCommissionRateBps ?? 1000;
  const defaultCommissionPercent =
    settings?.defaultCommissionPercent ?? bpsToPercent(defaultCommissionRateBps);

  const allOrganizations = orgsData?.items ?? [];

  // Filter sellers
  const filteredOrganizations = React.useMemo(() => {
    return allOrganizations.filter((org) => {
      // Type filter
      if (typeFilter === 'sellers' && org.type !== 'seller') {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && org.status !== statusFilter) {
        return false;
      }

      // Search query filter (matches name or slug or city)
      const q = search.trim().toLowerCase();
      if (q) {
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesSlug = org.slug.toLowerCase().includes(q);
        const matchesCity = org.city ? org.city.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesSlug && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [allOrganizations, typeFilter, statusFilter, search]);

  const activeSellersCount = React.useMemo(() => {
    return allOrganizations.filter((o) => o.type === 'seller' && o.status === 'approved').length;
  }, [allOrganizations]);

  const totalSellersCount = React.useMemo(() => {
    return allOrganizations.filter((o) => o.type === 'seller').length;
  }, [allOrganizations]);

  const handleOpenConfigure = (seller: Organization) => {
    setConfigureDialog({
      open: true,
      seller,
    });
  };

  const handleCloseConfigure = () => {
    setConfigureDialog({
      open: false,
      seller: null,
    });
  };

  const isLoading = isSettingsLoading || isOrgsLoading;
  const hasError = isSettingsError || isOrgsError;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Platform Economics Summary Header */}
      <Card variant="feature" className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Percent className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Marketplace Seller Commissions
              </h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Global baseline commission applies to all marketplace vendors by default. Configure
              per-seller overrides between 0.00% and 50.00% for strategic partners or promotional
              tiers.
            </p>
          </div>

          {/* Quick Refresh */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSettings();
              refetchOrgs();
            }}
            className="shrink-0 gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Metric Badges / Baseline Info */}
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <div className="rounded-sm border border-border bg-card p-3 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Global Default Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-primary">
                {isSettingsLoading ? '…' : `${defaultCommissionPercent}%`}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ({defaultCommissionRateBps} bps)
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Max Permitted Override
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">50.00%</span>
              <span className="text-xs text-muted-foreground font-mono">(5,000 bps)</span>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Approved Sellers
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">
                {isOrgsLoading ? '…' : activeSellersCount}
              </span>
              <span className="text-xs text-muted-foreground">active</span>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3 space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Total Registered Sellers
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-foreground">
                {isOrgsLoading ? '…' : totalSellersCount}
              </span>
              <span className="text-xs text-muted-foreground">on platform</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sellers by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="inline-flex rounded-sm border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('approved')}
                className={cn(
                  'rounded-xs px-2.5 py-1 font-semibold transition',
                  statusFilter === 'approved'
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Approved Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'rounded-xs px-2.5 py-1 font-semibold transition',
                  statusFilter === 'all'
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All Statuses
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={cn(
                  'rounded-xs px-2.5 py-1 font-semibold transition',
                  statusFilter === 'pending'
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Pending
              </button>
            </div>

            {/* Type Filter */}
            <div className="inline-flex rounded-sm border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter('sellers')}
                className={cn(
                  'rounded-xs px-2.5 py-1 font-semibold transition',
                  typeFilter === 'sellers'
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Sellers Only
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={cn(
                  'rounded-xs px-2.5 py-1 font-semibold transition',
                  typeFilter === 'all'
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All Organizations
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter and Active Filter Feedback */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span>
            Showing <strong className="text-foreground">{filteredOrganizations.length}</strong>{' '}
            {typeFilter === 'sellers' ? 'seller organizations' : 'organizations'}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
            {search.trim() && ` matching "${search.trim()}"`}
          </span>

          {(search.trim() || statusFilter !== 'approved' || typeFilter !== 'sellers') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('approved');
                setTypeFilter('sellers');
              }}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Seller Commission Table / List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((idx) => (
              <Card key={idx} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48 rounded-xs" />
                    <Skeleton className="h-3 w-32 rounded-xs" />
                  </div>
                  <Skeleton className="h-8 w-32 rounded-sm" />
                </div>
              </Card>
            ))}
          </div>
        ) : hasError ? (
          <Card className="p-6 text-center space-y-3">
            <AlertCircle className="size-8 text-destructive mx-auto" aria-hidden="true" />
            <h3 className="font-semibold text-foreground">Failed to load seller commission data</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Could not retrieve system settings or organizations. Check network connection or
              permissions.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                refetchSettings();
                refetchOrgs();
              }}
            >
              Retry
            </Button>
          </Card>
        ) : filteredOrganizations.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Store className="size-10 text-muted-foreground/60 mx-auto" aria-hidden="true" />
            <h3 className="font-semibold text-foreground">No sellers found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No marketplace organizations match your active search filters. Try adjusting the
              search query or status filter.
            </p>
            {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear all filters
              </Button>
            )}
          </Card>
        ) : (
          filteredOrganizations.map((seller) => (
            <SellerRow
              key={seller.id}
              seller={seller}
              defaultRateBps={defaultCommissionRateBps}
              defaultPercent={defaultCommissionPercent}
              onConfigure={handleOpenConfigure}
            />
          ))
        )}
      </div>

      {/* Commission Override Edit Modal Dialog */}
      <CommissionOverrideDialog
        open={configureDialog.open}
        seller={configureDialog.seller}
        defaultRateBps={defaultCommissionRateBps}
        defaultPercent={defaultCommissionPercent}
        onClose={handleCloseConfigure}
      />
    </div>
  );
}
