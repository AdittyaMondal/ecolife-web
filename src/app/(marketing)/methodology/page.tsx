'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Info } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { methodologyQuery } from '@/hooks/use-profile';
import { formatDateLong } from '@/lib/format';

export default function MethodologyPage() {
  const methodology = useQuery(methodologyQuery());

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to EcoLife
        </Link>
        {methodology.data && (
          <Badge tone="primary">
            Factor Version v{methodology.data.factorVersion} · Updated{' '}
            {formatDateLong(methodology.data.updatedAt)}
          </Badge>
        )}
      </div>

      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-positive">
          <BookOpen className="size-4" />
          <span>Open Carbon Accounting</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          Published Emission Factors & Methodology
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Every number EcoLife computes—from your 15-question lifestyle baseline to your 5 daily
          tracking logs—is calculated from the open emission factor table below.
        </p>
      </header>

      {methodology.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      ) : methodology.isError ? (
        <ErrorBanner error={methodology.error} onRetry={() => methodology.refetch()} />
      ) : methodology.data ? (
        <>
          <Card className="flex items-start gap-3 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-positive" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {methodology.data.caveat}
            </p>
          </Card>

          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 pr-4">Factor Key</th>
                    <th className="py-2.5 px-4">Value</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Basis</th>
                    <th className="py-2.5 pl-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {methodology.data.factors.map((f) => (
                    <tr key={f.key} className="hover:bg-muted/30">
                      <td className="py-3 pr-4 font-mono font-bold text-foreground">{f.key}</td>
                      <td className="py-3 px-4 font-mono font-extrabold tabular-nums text-positive">
                        {f.value}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{f.unit}</td>
                      <td className="py-3 px-4 text-foreground">{f.basis}</td>
                      <td className="py-3 pl-4 text-muted-foreground">{f.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
