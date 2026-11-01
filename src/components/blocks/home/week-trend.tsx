'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Home } from '@/hooks/use-home';
import { formatDate, formatWeekday, todayYmd } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface WeekTrendProps {
  week: Home['week'];
}

type Point = { x: number; y: number; date: string; totalKg: number };

interface TooltipCoords {
  x: number;
  y: number;
  isTopHalf: boolean;
  transform: string;
}

function formatEmissionsKg(kg: number): string {
  if (kg === 0) return '0.0 kg';
  const str = kg.toFixed(2);
  return str.endsWith('0') ? `${kg.toFixed(1)} kg` : `${str} kg`;
}

function getDateBadge(ymd: string): string | null {
  const today = todayYmd();
  const yesterday = todayYmd(-1);
  if (ymd === today) return 'Today';
  if (ymd === yesterday) return 'Yesterday';
  return null;
}

function getSvgPoint(
  clientX: number,
  clientY: number,
  svg: SVGSVGElement,
  defaultWidth: number,
  defaultHeight: number,
): { x: number; y: number } {
  try {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
  } catch {
    // fallback
  }
  const rect = svg.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
  return {
    x: ((clientX - rect.left) / rect.width) * defaultWidth,
    y: ((clientY - rect.top) / rect.height) * defaultHeight,
  };
}

function getPointPixelCoords(
  point: Point,
  svg: SVGSVGElement,
  container: HTMLElement,
  defaultWidth: number,
  defaultHeight: number,
): TooltipCoords {
  const containerRect = container.getBoundingClientRect();
  let px = (point.x / defaultWidth) * containerRect.width;
  let py = (point.y / defaultHeight) * containerRect.height;

  try {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = point.x;
      pt.y = point.y;
      const screenPt = pt.matrixTransform(ctm);
      px = screenPt.x - containerRect.left;
      py = screenPt.y - containerRect.top;
    }
  } catch {
    // fallback
  }

  const isTopHalf = py < containerRect.height * 0.45;
  const align = px < 80 ? 'left' : px > containerRect.width - 80 ? 'right' : 'center';
  const alignX =
    align === 'left'
      ? 'translateX(0%)'
      : align === 'right'
        ? 'translateX(-100%)'
        : 'translateX(-50%)';
  const translateY = isTopHalf ? 'translateY(0%)' : 'translateY(-100%)';

  return {
    x: px,
    y: py,
    isTopHalf,
    transform: `${alignX} ${translateY}`,
  };
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 100;
const PAD_X = 20;
const PAD_Y = 16;
const PLOT_WIDTH = CHART_WIDTH - PAD_X * 2;
const PLOT_HEIGHT = CHART_HEIGHT - PAD_Y * 2;

export function WeekTrend({ week }: WeekTrendProps) {
  const sparkline: Home['week']['sparkline'] = week.sparkline ?? [];
  const hasData = sparkline.length > 0;

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [coords, setCoords] = React.useState<TooltipCoords | null>(null);

  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const minKg = hasData ? Math.min(...sparkline.map((d) => d.totalKg)) : 0;
  const maxKg = hasData ? Math.max(...sparkline.map((d) => d.totalKg)) : 1;
  const range = maxKg === minKg ? 1 : maxKg - minKg;

  const points: Point[] = React.useMemo(() => {
    return sparkline.map((d, i) => {
      const x =
        PAD_X + (sparkline.length > 1 ? (i / (sparkline.length - 1)) * PLOT_WIDTH : PLOT_WIDTH / 2);
      const y = CHART_HEIGHT - PAD_Y - ((d.totalKg - minKg) / range) * PLOT_HEIGHT;
      return { x, y, ...d };
    });
  }, [sparkline, minKg, range]);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = hasData
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${CHART_HEIGHT} L ${points[0].x.toFixed(1)} ${CHART_HEIGHT} Z`
    : '';

  const isDecreased = week.changeVsLastWeekPct < 0;
  const isIncreased = week.changeVsLastWeekPct > 0;
  const formattedPct = Math.abs(week.changeVsLastWeekPct).toFixed(1);

  const updateHoverAtClientCoords = React.useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container || points.length === 0) return;

      const svgPt = getSvgPoint(clientX, clientY, svg, CHART_WIDTH, CHART_HEIGHT);
      let closestIndex = 0;
      let minDistance = Infinity;
      for (let i = 0; i < points.length; i++) {
        const dist = Math.abs(points[i].x - svgPt.x);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = i;
        }
      }

      setHoveredIndex(closestIndex);
      setCoords(getPointPixelCoords(points[closestIndex], svg, container, CHART_WIDTH, CHART_HEIGHT));
    },
    [points],
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverAtClientCoords(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setCoords(null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    updateHoverAtClientCoords(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setHoveredIndex(null);
    setCoords(null);
  };

  const handlePointFocus = React.useCallback(
    (index: number) => {
      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container || !points[index]) return;
      setHoveredIndex(index);
      setCoords(getPointPixelCoords(points[index], svg, container, CHART_WIDTH, CHART_HEIGHT));
    },
    [points],
  );

  const handlePointBlur = () => {
    setHoveredIndex(null);
    setCoords(null);
  };

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;
  const activeBadge = activePoint ? getDateBadge(activePoint.date) : null;
  const diffFromAvg =
    activePoint && week.avgKgPerDay > 0 ? activePoint.totalKg - week.avgKgPerDay : 0;

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
          <div className="w-full rounded-sm border border-border/80 bg-muted/30 p-4 shadow-subtle">
            <div ref={containerRef} className="relative">
              {/* Floating Tooltip displaying actual data for the hovered day */}
              {activePoint && coords && (
                <div
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute z-30 flex flex-col gap-1 rounded-sm border border-border bg-card/95 px-3 py-2 text-xs shadow-md backdrop-blur-xs transition-all duration-100 animate-fade-in',
                  )}
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.isTopHalf ? coords.y + 12 : coords.y - 12}px`,
                    transform: coords.transform,
                  }}
                >
                  <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-muted-foreground">
                    <span>
                      {formatWeekday(activePoint.date)}, {formatDate(activePoint.date)}
                    </span>
                    {activeBadge && (
                      <span className="rounded-xs bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {activeBadge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                    <span className="tabular font-bold text-foreground text-sm">
                      {formatEmissionsKg(activePoint.totalKg)}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">CO₂e</span>
                  </div>

                  {week.avgKgPerDay > 0 ? (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-[10px] tabular font-medium',
                        diffFromAvg < -0.05
                          ? 'text-positive'
                          : diffFromAvg > 0.05
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                      )}
                    >
                      <span aria-hidden="true">
                        {diffFromAvg < -0.05 ? '▼' : diffFromAvg > 0.05 ? '▲' : '—'}
                      </span>
                      <span>
                        {diffFromAvg < -0.05
                          ? `${Math.abs(diffFromAvg).toFixed(1)} kg vs avg`
                          : diffFromAvg > 0.05
                            ? `${diffFromAvg.toFixed(1)} kg vs avg`
                            : 'Matches daily avg'}
                      </span>
                    </div>
                  ) : activePoint.totalKg === 0 ? (
                    <span className="text-[10px] text-muted-foreground">No emissions recorded</span>
                  ) : null}
                </div>
              )}

              <svg
                ref={svgRef}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="h-28 sm:h-32 w-full overflow-visible cursor-crosshair"
                role="img"
                aria-label={`Emissions sparkline for the past 7 days, ranging from ${minKg.toFixed(1)} kg to ${maxKg.toFixed(1)} kg CO2e`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchMove}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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

                {/* Vertical guideline on hover */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={PAD_Y / 2}
                    x2={activePoint.x}
                    y2={CHART_HEIGHT - PAD_Y / 2}
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.6"
                    className="pointer-events-none transition-all duration-100"
                  />
                )}

                {/* Points */}
                {points.map((p, i) => {
                  const isLast = i === points.length - 1;
                  const isHovered = i === hoveredIndex;
                  return (
                    <g key={p.date} className="transition-all duration-150">
                      {isHovered && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={8}
                          className="fill-primary/25 pointer-events-none animate-pulse"
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 5 : isLast ? 4 : 2.5}
                        tabIndex={0}
                        role="button"
                        aria-label={`${formatWeekday(p.date)}, ${formatDate(p.date)}: ${formatEmissionsKg(p.totalKg)} CO2e`}
                        onFocus={() => handlePointFocus(i)}
                        onBlur={handlePointBlur}
                        className={
                          isHovered
                            ? 'fill-primary stroke-background stroke-2 outline-none'
                            : isLast
                              ? 'fill-secondary stroke-primary stroke-2 outline-none'
                              : 'fill-secondary outline-none'
                        }
                      >
                        <title>{`${formatWeekday(p.date)}, ${formatDate(p.date)}: ${formatEmissionsKg(p.totalKg)} CO₂e`}</title>
                      </circle>
                    </g>
                  );
                })}

                {/* Invisible hover columns across the full height for effortless mouse/touch targeting */}
                {points.map((p, i) => {
                  const xStart = i === 0 ? 0 : (points[i - 1].x + p.x) / 2;
                  const xEnd = i === points.length - 1 ? CHART_WIDTH : (p.x + points[i + 1].x) / 2;
                  return (
                    <rect
                      key={`hit-${p.date}`}
                      x={xStart}
                      y={0}
                      width={xEnd - xStart}
                      height={CHART_HEIGHT}
                      fill="transparent"
                      className="cursor-crosshair"
                      onMouseEnter={() => handlePointFocus(i)}
                    />
                  );
                })}
              </svg>
            </div>

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
