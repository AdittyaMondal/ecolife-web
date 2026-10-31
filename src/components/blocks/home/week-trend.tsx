import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';

export interface WeekTrendProps {
  week: Home['week'];
}

type Point = { x: number; y: number; date: string; totalKg: number };

export function WeekTrend({ week }: WeekTrendProps) {
  const sparkline: Home['week']['sparkline'] = week.sparkline ?? [];
  const hasData = sparkline.length > 0;

  const minKg = hasData ? Math.min(...sparkline.map((d) => d.totalKg)) : 0;
  const maxKg = hasData ? Math.max(...sparkline.map((d) => d.totalKg)) : 1;
  const range = maxKg === minKg ? 1 : maxKg - minKg;

  const width = 280;
  const height = 64;
  const padX = 12;
  const padY = 10;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;

  const points: Point[] = sparkline.map((d, i) => {
    const x =
      padX + (sparkline.length > 1 ? (i / (sparkline.length - 1)) * plotWidth : plotWidth / 2);
    const y = height - padY - ((d.totalKg - minKg) / range) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = hasData
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`
    : '';

  const isDecreased = week.changeVsLastWeekPct < 0;
  const isIncreased = week.changeVsLastWeekPct > 0;
  const formattedPct = Math.abs(week.changeVsLastWeekPct).toFixed(1);

  return (
    <Card aria-labelledby="week-trend-heading">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="week-trend-heading">This week</CardTitle>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasData && (
          <div className="w-full rounded-sm border border-border bg-muted/40 p-3">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-20 w-full overflow-visible"
              role="img"
              aria-label={`Emissions sparkline for the past 7 days, ranging from ${minKg.toFixed(1)} kg to ${maxKg.toFixed(1)} kg CO2e`}
            >
              <defs>
                <linearGradient id="week-sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#week-sparkline-gradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--tertiary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((p, i) => {
                const isLast = i === points.length - 1;
                return (
                  <circle
                    key={p.date}
                    cx={p.x}
                    cy={p.y}
                    r={isLast ? 4 : 2.5}
                    className={isLast ? 'fill-secondary stroke-primary stroke-2' : 'fill-secondary'}
                  />
                );
              })}
            </svg>

            <table className="sr-only">
              <caption>Daily emissions for the past 7 days</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Emissions (kg CO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {sparkline.map((item) => (
                  <tr key={item.date}>
                    <td>{item.date}</td>
                    <td>{item.totalKg.toFixed(1)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Daily average: </span>
            <span className="tabular font-semibold text-foreground">
              {week.avgKgPerDay.toFixed(1)} kg/day
            </span>
          </div>

          <div
            className={`flex items-center gap-1 font-medium ${
              isDecreased
                ? 'text-positive'
                : isIncreased
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            <span aria-hidden="true">{isDecreased ? '▼' : isIncreased ? '▲' : '—'}</span>
            <span className="tabular">
              {isDecreased
                ? `${formattedPct}% decrease vs last week`
                : isIncreased
                  ? `${formattedPct}% increase vs last week`
                  : '0.0% vs last week'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
