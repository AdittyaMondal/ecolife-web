'use client';

import {
  Activity,
  Award,
  BarChart3,
  Building2,
  Calendar,
  Flame,
  Leaf,
  MapPin,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { formatKg, formatNumber } from '@/lib/format';
import type { Organization, OrganizationMember } from '@/types/api';

export interface OrgAnalyticsProps {
  organization: Organization;
  members: OrganizationMember[];
}

export function OrgAnalytics({ organization, members }: OrgAnalyticsProps) {
  // Compute cumulative values from roster members
  const totalStaff = members.length || organization.memberCount || 1;

  const validBaselines = members.filter(
    (m) => typeof m.baselineTotalKg === 'number' && m.baselineTotalKg > 0,
  );

  const cumulativeDailyBaselineKg = members.reduce(
    (acc, m) => acc + (Number(m.baselineTotalKg) || 0),
    0,
  );

  const cumulativeAnnualFootprintTonnes = (cumulativeDailyBaselineKg * 365) / 1000;

  const totalPoints = members.reduce((acc, m) => acc + (Number(m.pointsTotal) || 0), 0);

  const avgBaselineKg =
    validBaselines.length > 0 ? cumulativeDailyBaselineKg / validBaselines.length : 0;

  const avgPoints = totalStaff > 0 ? Math.round(totalPoints / totalStaff) : 0;

  // Benchmark: Indian average urban footprint ~7.2 kg CO₂e / person / day
  const urbanAverageBaselineKg = 7.2;
  const benchmarkTotalDailyKg = totalStaff * urbanAverageBaselineKg;
  const deltaVsBenchmarkKg = benchmarkTotalDailyKg - cumulativeDailyBaselineKg;
  const isLowerThanAverage = deltaVsBenchmarkKg > 0;

  // City breakdown
  const cityCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of members) {
      const city = m.user.city || 'Undisclosed';
      counts[city] = (counts[city] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [members]);

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" aria-hidden="true" />
            <span>Cumulative Organizational ESG Metrics</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated sustainability analytics across all {totalStaff} enrolled staff members.
          </p>
        </div>
      </div>

      {/* 4 Core Cumulative Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enrolled Staff */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-primary/40 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Enrolled Workforce
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-secondary/30 text-primary">
              <Users className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {formatNumber(totalStaff)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Active participants contributing to team logs
          </p>
        </Card>

        {/* Cumulative Daily Baseline Carbon */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-primary/40 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cumulative Daily Emissions
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-secondary/30 text-primary">
              <Flame className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {cumulativeDailyBaselineKg > 0 ? formatKg(cumulativeDailyBaselineKg, 1) : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total baseline CO₂e emitted across employees/day
          </p>
        </Card>

        {/* Cumulative Annual Footprint */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-primary/40 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Annual Scope 3 Baseline
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-secondary/30 text-primary">
              <Calendar className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {cumulativeAnnualFootprintTonnes > 0
              ? `${cumulativeAnnualFootprintTonnes.toFixed(1)} t`
              : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Projected metric tonnes of CO₂e per year
          </p>
        </Card>

        {/* Collective EcoPoints */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-primary/40 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Collective EcoPoints
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-secondary/30 text-primary">
              <Award className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-positive">
            {formatNumber(totalPoints)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Earned from logs, goals, events &amp; challenges
          </p>
        </Card>
      </div>

      {/* Deep-Dive Impact Comparison Card */}
      <Card className="p-6 sm:p-7 border-border bg-card shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Leaf className="size-4 text-positive" aria-hidden="true" />
              <span>Workforce Carbon Intensity Benchmark</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Average per-employee daily carbon emissions compared to urban averages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Org Per-Capita Average</span>
              <span className="tabular font-mono text-xl font-bold text-foreground">
                {avgBaselineKg > 0 ? formatKg(avgBaselineKg, 1) : '7.2 kg'}/day
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Urban Benchmark</span>
              <span className="tabular font-mono text-xl font-bold text-muted-foreground">
                7.2 kg/day
              </span>
            </div>
          </div>
        </div>

        {/* Benchmark Efficiency Meter Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground">Workforce Climate Performance</span>
            <span className={isLowerThanAverage ? 'text-positive' : 'text-amber-500'}>
              {avgBaselineKg > 0 && avgBaselineKg < urbanAverageBaselineKg ? (
                <span className="inline-flex items-center gap-1">
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                  {(
                    ((urbanAverageBaselineKg - avgBaselineKg) / urbanAverageBaselineKg) *
                    100
                  ).toFixed(0)}
                  % below urban average
                </span>
              ) : avgBaselineKg > urbanAverageBaselineKg ? (
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="size-3.5" aria-hidden="true" />
                  {(
                    ((avgBaselineKg - urbanAverageBaselineKg) / urbanAverageBaselineKg) *
                    100
                  ).toFixed(0)}
                  % above urban average
                </span>
              ) : (
                'On track with urban average'
              )}
            </span>
          </div>

          {/* Progress gauge bar */}
          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden border border-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-positive via-tertiary to-amber-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max((avgBaselineKg / (urbanAverageBaselineKg * 1.5)) * 100, 10),
                  100,
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>0 kg (Ideal)</span>
            <span className="font-semibold text-foreground">7.2 kg (City Avg)</span>
            <span>11.0+ kg (High Carbon)</span>
          </div>
        </div>

        {/* Geographic Distribution Pill Cloud */}
        {cityCounts.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              <span>
                Team Geographic Footprint ({cityCounts.length}{' '}
                {cityCounts.length === 1 ? 'City' : 'Cities'})
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {cityCounts.map(([city, count]) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground font-medium"
                >
                  <span>{city}</span>
                  <span className="tabular font-semibold text-primary">
                    {count} {count === 1 ? 'member' : 'members'}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
