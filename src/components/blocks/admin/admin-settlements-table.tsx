'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  DollarSign,
  HelpCircle,
  Receipt,
  Search,
  Store,
  X,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import {
  orderSettlementsQuery,
  type SettlementFilters,
  useCreateSellerPayout,
} from '@/hooks/use-revenue';
import { formatDate, formatPaise } from '@/lib/format';
import type { OrderSettlement } from '@/types/api';

type StatusFilter = 'all' | 'pending' | 'settled' | 'cancelled';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Settlements' },
  { value: 'pending', label: 'Pending' },
  { value: 'settled', label: 'Settled' },
  { value: 'cancelled', label: 'Cancelled' },
];

export interface AdminSettlementsTableProps {
  initialSellerOrgId?: string;
  className?: string;
}

export function AdminSettlementsTable({
  initialSellerOrgId = '',
  className,
}: AdminSettlementsTableProps) {
  // Filters
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [sellerInput, setSellerInput] = React.useState(initialSellerOrgId);
  const [activeSellerFilter, setActiveSellerFilter] = React.useState(initialSellerOrgId);

  // Pagination state
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([]);

  // Disburse modal state
  const [isDisburseOpen, setIsDisburseOpen] = React.useState(false);
  const [disburseSellerOrgId, setDisburseSellerOrgId] = React.useState('');
  const [disburseSellerName, setDisburseSellerName] = React.useState('');
  const [disburseReferenceNote, setDisburseReferenceNote] = React.useState('');

  const createPayoutMutation = useCreateSellerPayout();

  // Construct query filters
  const queryFilters: SettlementFilters = React.useMemo(() => {
    const f: SettlementFilters = {
      limit: 15,
    };
    if (statusFilter !== 'all') {
      f.status = statusFilter;
    }
    if (activeSellerFilter.trim()) {
      f.sellerOrgId = activeSellerFilter.trim();
    }
    if (cursor) {
      f.cursor = cursor;
    }
    return f;
  }, [statusFilter, activeSellerFilter, cursor]);

  const { data, isLoading, isError, error, refetch } = useQuery(
    orderSettlementsQuery(queryFilters),
  );

  const items = data?.items ?? [];
  const pageInfo = data?.pageInfo;

  const handleStatusChange = (val: StatusFilter) => {
    setStatusFilter(val);
    setCursor(undefined);
    setCursorHistory([]);
  };

  const handleSellerFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSellerFilter(sellerInput.trim());
    setCursor(undefined);
    setCursorHistory([]);
  };

  const handleClearSellerFilter = () => {
    setSellerInput('');
    setActiveSellerFilter('');
    setCursor(undefined);
    setCursorHistory([]);
  };

  const handleNextPage = () => {
    if (pageInfo?.hasMore && pageInfo?.nextCursor) {
      setCursorHistory((prev) => [...prev, cursor ?? '']);
      setCursor(pageInfo.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory((prev) => prev.slice(0, -1));
      setCursor(prevCursor || undefined);
    }
  };

  const openDisburseModal = (sellerOrgId = '', sellerName = '') => {
    setDisburseSellerOrgId(sellerOrgId ? String(sellerOrgId) : '');
    setDisburseSellerName(sellerName);
    setDisburseReferenceNote('');
    setIsDisburseOpen(true);
  };

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgIdNum = Number.parseInt(disburseSellerOrgId.trim(), 10);
    if (!orgIdNum || Number.isNaN(orgIdNum) || orgIdNum <= 0) {
      toast.error('Please enter a valid Seller Organization ID.');
      return;
    }

    try {
      await createPayoutMutation.mutateAsync({
        sellerOrgId: orgIdNum,
        referenceNote: disburseReferenceNote.trim() || undefined,
      });
      toast.success(
        `Disbursement initiated successfully for ${disburseSellerName ? `${disburseSellerName} (#${orgIdNum})` : `Seller #${orgIdNum}`}.`,
      );
      setIsDisburseOpen(false);
      setDisburseSellerOrgId('');
      setDisburseSellerName('');
      setDisburseReferenceNote('');
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to disburse payout. Please check seller balance.';
      toast.error(message);
    }
  };

  const renderStatusBadge = (status: OrderSettlement['status']) => {
    switch (status) {
      case 'settled':
        return (
          <Badge tone="positive" className="capitalize">
            Settled
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge tone="neutral" className="capitalize text-muted-foreground">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge tone="warning" className="capitalize">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Card className={className} variant="default">
      {/* Header and Top Action */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-5 text-primary" aria-hidden="true" />
            Order Settlements
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track gross marketplace revenue, coin liabilities, platform commissions, and seller
            settlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openDisburseModal()}
            className="shrink-0"
          >
            <Banknote className="size-4 mr-1.5" aria-hidden="true" />
            Disburse Payout
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <SegmentedControl
            name="settlement-status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
          />
        </div>

        {/* Seller ID Search Filter */}
        <form onSubmit={handleSellerFilterSubmit} className="flex items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by Seller Org ID..."
              value={sellerInput}
              onChange={(e) => setSellerInput(e.target.value)}
              className="min-h-10 w-full rounded-sm border border-input bg-card pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground transition focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring"
            />
            {sellerInput && (
              <button
                type="button"
                onClick={handleClearSellerFilter}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear seller filter"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button type="submit" variant="outline" size="sm">
            Apply
          </Button>
        </form>
      </div>

      {/* Active filters notice if any */}
      {activeSellerFilter && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtering by Seller Org ID:</span>
          <span className="font-semibold text-foreground">#{activeSellerFilter}</span>
          <button
            type="button"
            onClick={handleClearSellerFilter}
            className="text-primary hover:underline font-medium"
          >
            Reset
          </button>
        </div>
      )}

      {/* Content Table / States */}
      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3" aria-hidden="true">
            <Skeleton className="h-10 w-full rounded-sm" />
            <Skeleton className="h-16 w-full rounded-sm" />
            <Skeleton className="h-16 w-full rounded-sm" />
            <Skeleton className="h-16 w-full rounded-sm" />
            <Skeleton className="h-16 w-full rounded-sm" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={<HelpCircle className="size-8 text-destructive" />}
            title="Failed to load settlements"
            description={
              error instanceof Error ? error.message : 'An unknown network error occurred.'
            }
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Receipt className="size-8 text-muted-foreground" />}
            title="No settlements found"
            description={
              statusFilter !== 'all' || activeSellerFilter
                ? 'No order settlements match your filter parameters.'
                : 'There are currently no recorded order settlements.'
            }
            action={
              statusFilter !== 'all' || activeSellerFilter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    handleClearSellerFilter();
                  }}
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Order & Product
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Seller
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Sale Amount
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer Breakdown
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Platform Comm.
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Net Payout
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* Order & Product */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {item.orderNumber}
                      </div>
                      <div
                        className="mt-0.5 max-w-[180px] truncate font-medium text-foreground text-xs"
                        title={item.productName}
                      >
                        {item.productName}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </div>
                    </td>

                    {/* Seller Org */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-foreground text-xs flex items-center gap-1.5">
                        <Store className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]" title={item.sellerName}>
                          {item.sellerName}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                        Org #{item.sellerOrgId}
                      </div>
                    </td>

                    {/* Sale Amount */}
                    <td className="px-4 py-3.5 align-top text-right font-medium text-foreground tabular-nums">
                      {formatPaise(item.saleAmountPaise)}
                    </td>

                    {/* Customer Breakdown */}
                    <td className="px-4 py-3.5 align-top text-xs">
                      <div className="flex items-center gap-1 text-foreground tabular-nums">
                        <CreditCard className="size-3 text-muted-foreground shrink-0" />
                        <span>Cash: {formatPaise(item.cashPaidPaise)}</span>
                      </div>
                      {item.coinsUsed > 0 ? (
                        <div className="mt-1 flex items-center gap-1 text-muted-foreground tabular-nums">
                          <Coins className="size-3 text-amber-500 shrink-0" />
                          <span>
                            {item.coinsUsed} coins ({formatPaise(item.coinValuePaise)})
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-muted-foreground">0 coins used</div>
                      )}
                    </td>

                    {/* Platform Commission */}
                    <td className="px-4 py-3.5 align-top text-right text-xs">
                      <div className="font-semibold text-foreground tabular-nums">
                        {formatPaise(item.platformCommissionPaise)}
                      </div>
                      <div
                        className="mt-0.5 text-[11px] text-muted-foreground tabular-nums"
                        title={`Sales: ${formatPaise(item.salesCommissionPaise)} (${(item.commissionRateBps / 100).toFixed(1)}%) + Coin fee: ${formatPaise(item.coinFeePaise)} (${(item.coinFeeRateBps / 100).toFixed(1)}%)`}
                      >
                        Sales: {formatPaise(item.salesCommissionPaise)}
                        <br />
                        Fee: {formatPaise(item.coinFeePaise)}
                      </div>
                    </td>

                    {/* Net Seller Payout */}
                    <td className="px-4 py-3.5 align-top text-right">
                      <div className="font-semibold text-positive tabular-nums text-sm">
                        {formatPaise(item.sellerPayoutPaise)}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 align-top text-center">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 align-top text-right">
                      {item.status === 'pending' ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openDisburseModal(String(item.sellerOrgId), item.sellerName)
                          }
                          className="h-8 text-xs font-medium"
                        >
                          Disburse
                        </Button>
                      ) : item.payoutId ? (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          Payout #{item.payoutId}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && items.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{items.length}</span>{' '}
            settlements
            {cursorHistory.length > 0 && <span> · Page {cursorHistory.length + 1}</span>}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={cursorHistory.length === 0}
            >
              <ChevronLeft className="size-4 mr-1" aria-hidden="true" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pageInfo?.hasMore || !pageInfo?.nextCursor}
            >
              Next
              <ChevronRight className="size-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Disburse Payout Modal Dialog */}
      <ModalDialog
        open={isDisburseOpen}
        onClose={() => setIsDisburseOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <DollarSign className="size-5 text-primary" aria-hidden="true" />
            Disburse Seller Payout
          </span>
        }
        description="Process settlement balance payout to the seller's registered bank or UPI account."
        size="md"
      >
        <form onSubmit={handleDisburseSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="seller-org-id" className="text-xs font-semibold text-foreground">
              Seller Organization ID <span className="text-destructive">*</span>
            </label>
            <Input
              id="seller-org-id"
              type="number"
              placeholder="e.g. 12"
              value={disburseSellerOrgId}
              onChange={(e) => setDisburseSellerOrgId(e.target.value)}
              required
              min={1}
            />
            {disburseSellerName && (
              <p className="text-xs text-muted-foreground">
                Seller: <strong className="text-foreground">{disburseSellerName}</strong>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reference-note" className="text-xs font-semibold text-foreground">
              Reference / Bank Transfer Note{' '}
              <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Input
              id="reference-note"
              type="text"
              placeholder="e.g. IMPS / NEFT transfer ref #N987654321"
              value={disburseReferenceNote}
              onChange={(e) => setDisburseReferenceNote(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Recorded in the double-entry immutable ledger for compliance and audit reconciliation.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDisburseOpen(false)}
              disabled={createPayoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createPayoutMutation.isPending}
            >
              Confirm Disbursement
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Card>
  );
}
