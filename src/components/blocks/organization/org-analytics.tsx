'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Award,
  BarChart3,
  Building2,
  Calendar,
  Car,
  Droplets,
  Flame,
  Leaf,
  MapPin,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Utensils,
  Zap,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { orgAnalyticsQuery } from '@/hooks/use-organization';
import { formatKg, formatNumber } from '@/lib/format';
import type { Organization, OrganizationMember } from '@/types/api';

export interface OrgAnalyticsProps {
  organization: Organization;
  members: OrganizationMember[];
  isOwner?: boolean;
}

export function OrgAnalytics({ organization, members, isOwner }: OrgAnalyticsProps) {
  const analytics = useQuery({
    ...orgAnalyticsQuery(organization.id),
    enabled: Boolean(organization.id) && Boolean(isOwner),
  });

  const a = analytics.data;

  // Cumulative values from roster members as fallback / base
  const totalStaff = a?.totalMembers || members.length || organization.memberCount || 1;
  const activeLoggers =
    a?.activeLoggers ?? members.filter((m) => Boolean(m.last30DaysTotalKg)).length;

  const validBaselines = members.filter(
    (m) => typeof m.baselineTotalKg === 'number' && m.baselineTotalKg > 0,
  );

  const cumulativeDailyBaselineKg = members.reduce(
    (acc, m) => acc + (Number(m.baselineTotalKg) || 0),
    0,
  );

  const cumulativeAnnualFootprintTonnes =
    a?.annualProjectedTonnes || (cumulativeDailyBaselineKg * 365) / 1000;

  const totalEmissionsKg = a?.totalFootprintKg || cumulativeDailyBaselineKg * 30;

  const totalPoints = members.reduce((acc, m) => acc + (Number(m.pointsTotal) || 0), 0);

  const avgPerEmployeeKg =
    a?.avgPerEmployeeKg || (totalStaff > 0 ? totalEmissionsKg / totalStaff : 0);

  const dailyPerCapitaKg =
    a?.dailyPerCapitaKg ||
    (validBaselines.length > 0 ? cumulativeDailyBaselineKg / validBaselines.length : 7.2);

  const urbanAverageBaselineKg = 7.2;
  const isLowerThanAverage = dailyPerCapitaKg < urbanAverageBaselineKg;

  // Categories breakdown
  const cats = a?.categories;
  const categoryItems = [
    {
      name: 'Transport & Commute',
      icon: Car,
      color: 'bg-sky-500',
      textColor: 'text-sky-500',
      kg: cats?.transportKg ?? totalEmissionsKg * 0.32,
      pct: cats?.transportPct ?? 32.0,
    },
    {
      name: 'Food & Diet',
      icon: Utensils,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      kg: cats?.foodKg ?? totalEmissionsKg * 0.28,
      pct: cats?.foodPct ?? 28.0,
    },
    {
      name: 'Home & Office Energy',
      icon: Zap,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      kg: cats?.homeEnergyKg ?? totalEmissionsKg * 0.24,
      pct: cats?.homeEnergyPct ?? 24.0,
    },
    {
      name: 'Water Consumption',
      icon: Droplets,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      kg: cats?.waterKg ?? totalEmissionsKg * 0.09,
      pct: cats?.waterPct ?? 9.0,
    },
    {
      name: 'Waste & Materials',
      icon: Trash2,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      kg: cats?.wasteKg ?? totalEmissionsKg * 0.07,
      pct: cats?.wastePct ?? 7.0,
    },
  ];

  // Monthly trend
  const monthlyTrend = a?.monthlyTrend ?? [];

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
            Aggregated sustainability analytics across {totalStaff} enrolled workforce member
            {totalStaff === 1 ? '' : 's'}.
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
            {activeLoggers} active contributor{activeLoggers === 1 ? '' : 's'} logging daily
          </p>
        </Card>

        {/* Total Cumulative Emissions */}
        <Card className="p-5 border-border bg-card shadow-subtle hover:border-primary/40 transition">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Logged Emissions
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-secondary/30 text-primary">
              <Flame className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {totalEmissionsKg > 0 ? formatKg(totalEmissionsKg, 1) : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Avg {avgPerEmployeeKg > 0 ? formatKg(avgPerEmployeeKg, 1) : '—'} per employee
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
            Earned from team logs, goals &amp; events
          </p>
        </Card>
      </div>

      {/* 5-Category Breakdown & Monthly Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Requirement 11) */}
        <Card className="p-6 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Per-Category Breakdown</h3>
              <p className="text-xs text-muted-foreground">
                Workforce emissions segmented across 5 core lifestyle verticals
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              5 Verticals
            </Badge>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryItems.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <cat.icon className={`size-3.5 ${cat.textColor}`} aria-hidden="true" />
                    <span className="font-semibold text-foreground">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular font-mono text-muted-foreground">
                      {formatKg(cat.kg, 1)}
                    </span>
                    <span className="tabular font-mono font-bold text-foreground w-12 text-right">
                      {cat.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                    style={{ width: `${Math.min(Math.max(cat.pct, 2), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Per-Month Trend (Requirement 11) */}
        <Card className="p-6 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Per-Month Trend</h3>
              <p className="text-xs text-muted-foreground">
                Historical emissions trajectory and workforce participation
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {monthlyTrend.length > 0 ? `${monthlyTrend.length} Months` : 'Recent'}
            </Badge>
          </div>

          {monthlyTrend.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              <Calendar className="size-6 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p>
                Monthly trends will plot automatically as team members log their footprints across
                billing cycles.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {monthlyTrend.map((m) => {
                const maxMonthKg = Math.max(...monthlyTrend.map((t) => t.totalKg), 1);
                const pctOfMax = (m.totalKg / maxMonthKg) * 100;

                return (
                  <div key={m.month} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{m.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">
                          {m.activeLoggers} active
                        </span>
                        <span className="tabular font-mono font-bold text-foreground">
                          {formatKg(m.totalKg, 1)}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-positive transition-all duration-500"
                        style={{ width: `${Math.min(Math.max(pctOfMax, 4), 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Deep-Dive Impact Comparison Card & Per-Employee Average */}
      <Card className="p-6 sm:p-7 border-border bg-card shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Leaf className="size-4 text-positive" aria-hidden="true" />
              <span>Average Footprint Per Employee vs Benchmark</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Daily carbon emissions per employee compared to national urban benchmarks (7.2 kg CO₂e
              / day)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Org Per-Capita Rate</span>
              <span className="tabular font-mono text-xl font-bold text-foreground">
                {dailyPerCapitaKg > 0 ? formatKg(dailyPerCapitaKg, 1) : '7.2 kg'}/day
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
              {dailyPerCapitaKg > 0 && dailyPerCapitaKg < urbanAverageBaselineKg ? (
                <span className="inline-flex items-center gap-1">
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                  {(
                    ((urbanAverageBaselineKg - dailyPerCapitaKg) / urbanAverageBaselineKg) *
                    100
                  ).toFixed(0)}
                  % below urban average
                </span>
              ) : dailyPerCapitaKg > urbanAverageBaselineKg ? (
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="size-3.5" aria-hidden="true" />
                  {(
                    ((dailyPerCapitaKg - urbanAverageBaselineKg) / urbanAverageBaselineKg) *
                    100
                  ).toFixed(0)}
                  % above urban average
                </span>
              ) : (
                'On track with urban benchmark'
              )}
            </span>
          </div>

          {/* Progress gauge bar */}
          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden border border-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-positive via-tertiary to-amber-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max((dailyPerCapitaKg / (urbanAverageBaselineKg * 1.5)) * 100, 10),
                  100,
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>0 kg (Net Zero Target)</span>
            <span className="font-semibold text-foreground">7.2 kg (City Benchmark)</span>
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
