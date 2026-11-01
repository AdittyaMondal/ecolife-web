'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  HelpCircle,
  Lock,
  Search,
  ShieldCheck,
  Store,
  X,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { type LedgerFilters, settlementLedgerQuery } from '@/hooks/use-revenue';
import { formatDateLong, formatPaise } from '@/lib/format';
import type { SettlementLedgerEntry } from '@/types/api';

type TransactionTypeFilter =
  | 'all'
  | 'sale_commission'
  | 'coin_subsidy'
  | 'coin_fee'
  | 'seller_payout';

const TRANSACTION_TYPE_OPTIONS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Transactions' },
  { value: 'sale_commission', label: 'Sale Commission' },
  { value: 'coin_subsidy', label: 'Coin Subsidy' },
  { value: 'coin_fee', label: 'Coin Fee' },
  { value: 'seller_payout', label: 'Seller Payout' },
];

export interface AdminSettlementLedgerProps {
  initialSellerOrgId?: string;
  className?: string;
}

export function AdminSettlementLedger({
  initialSellerOrgId = '',
  className,
}: AdminSettlementLedgerProps) {
  const [typeFilter, setTypeFilter] = React.useState<TransactionTypeFilter>('all');
  const [sellerInput, setSellerInput] = React.useState(initialSellerOrgId);
  const [activeSellerFilter, setActiveSellerFilter] = React.useState(initialSellerOrgId);

  // Pagination state
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = React.useState<string[]>([]);

  // Copied state for idempotency keys
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const queryFilters: LedgerFilters = React.useMemo(() => {
    const f: LedgerFilters = {
      limit: 20,
    };
    if (typeFilter !== 'all') {
      f.transactionType = typeFilter;
    }
    if (activeSellerFilter.trim()) {
      f.sellerOrgId = activeSellerFilter.trim();
    }
    if (cursor) {
      f.cursor = cursor;
    }
    return f;
  }, [typeFilter, activeSellerFilter, cursor]);

  const { data, isLoading, isError, error, refetch } = useQuery(
    settlementLedgerQuery(queryFilters),
  );

  const items = data?.items ?? [];
  const pageInfo = data?.pageInfo;

  const handleTypeChange = (val: TransactionTypeFilter) => {
    setTypeFilter(val);
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

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success('Idempotency key copied to clipboard.');
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const renderTransactionTypeBadge = (type: SettlementLedgerEntry['transactionType']) => {
    switch (type) {
      case 'sale_commission':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xs border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
            <ArrowDownLeft className="size-3" aria-hidden="true" />
            Sale Commission
          </span>
        );
      case 'coin_subsidy':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xs border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold tracking-tight text-purple-700 dark:text-purple-400">
            <Lock className="size-3" aria-hidden="true" />
            Coin Liability Subsidy
          </span>
        );
      case 'coin_fee':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xs border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold tracking-tight text-sky-700 dark:text-sky-400">
            <ArrowUpRight className="size-3" aria-hidden="true" />
            Coin Redemption Fee
          </span>
        );
      case 'seller_payout':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-xs border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold tracking-tight text-blue-700 dark:text-blue-400">
            <ArrowUpRight className="size-3" aria-hidden="true" />
            Seller Payout Disbursement
          </span>
        );
      default:
        return (
          <Badge tone="neutral" className="capitalize">
            {type}
          </Badge>
        );
    }
  };

  return (
    <Card className={className} variant="default">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Immutable Transaction Ledger
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Double-entry financial journal auditing all platform transactions, coin liability reliefs,
          and partner disbursements.
        </p>
      </div>

      {/* Info Callout */}
      <div className="mt-4 flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Audit Guarantee
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Immutable Audit Ledger: All financial entries are append-only double-entry records
            capturing gross merchandise, coin liability relief, commission deductions, and seller
            disbursements.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-xl">
          <SegmentedControl
            name="ledger-transaction-type"
            options={TRANSACTION_TYPE_OPTIONS}
            value={typeFilter}
            onChange={handleTypeChange}
          />
        </div>

        {/* Optional Seller ID Search Filter */}
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
            <Skeleton className="h-14 w-full rounded-sm" />
            <Skeleton className="h-14 w-full rounded-sm" />
            <Skeleton className="h-14 w-full rounded-sm" />
            <Skeleton className="h-14 w-full rounded-sm" />
            <Skeleton className="h-14 w-full rounded-sm" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={<HelpCircle className="size-8 text-destructive" />}
            title="Failed to load ledger records"
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
            icon={<BookOpen className="size-8 text-muted-foreground" />}
            title="No ledger entries found"
            description={
              typeFilter !== 'all' || activeSellerFilter
                ? 'No transactions match your filter selection.'
                : 'There are currently no recorded financial ledger entries.'
            }
            action={
              typeFilter !== 'all' || activeSellerFilter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
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
                    Timestamp
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Transaction Type
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Seller Organization
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Description / Note
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Idempotency Key
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-xs text-muted-foreground">
                      <div className="font-medium text-foreground">
                        {formatDateLong(entry.createdAt)}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        Order #{entry.orderNumber}
                      </div>
                    </td>

                    {/* Transaction Type */}
                    <td className="px-4 py-3.5 align-top">
                      {renderTransactionTypeBadge(entry.transactionType)}
                    </td>

                    {/* Seller Organization */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-foreground text-xs flex items-center gap-1.5">
                        <Store className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[140px]" title={entry.sellerName}>
                          {entry.sellerName}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                        Org #{entry.sellerOrgId}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 align-top text-right font-medium text-foreground tabular-nums text-sm">
                      {formatPaise(entry.amountPaise)}
                    </td>

                    {/* Description Note */}
                    <td className="px-4 py-3.5 align-top text-xs text-muted-foreground max-w-[220px]">
                      {entry.note ? (
                        <span className="line-clamp-2" title={entry.note}>
                          {entry.note}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    {/* Idempotency Key */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-xs text-muted-foreground max-w-[150px] truncate"
                          title={entry.idempotencyKey}
                        >
                          {entry.idempotencyKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entry.idempotencyKey)}
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          title="Copy Idempotency Key"
                          aria-label="Copy Idempotency Key"
                        >
                          {copiedKey === entry.idempotencyKey ? (
                            <Check className="size-3 text-positive" aria-hidden="true" />
                          ) : (
                            <Copy className="size-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 align-top text-center">
                      <Badge
                        tone="positive"
                        className="text-[11px] font-medium uppercase tracking-wider"
                      >
                        posted
                      </Badge>
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
            Showing <span className="font-semibold text-foreground">{items.length}</span> entries
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
    </Card>
  );
}
