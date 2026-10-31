'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmissionGaugeProps {
  currentKg: number;
  baselineKg: number;
  className?: string;
  logged?: boolean;
}

/**
 * Car-style speedometer tachometer for daily carbon emissions.
 * 240° radial sweep from bottom-left (210°) to bottom-right (-30°).
 */
export function EmissionGauge({
  currentKg,
  baselineKg,
  className,
  logged = false,
}: EmissionGaugeProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Dial geometry
  const cx = 160;
  const cy = 145;
  const r = 105;
  const startAngle = 210; // degrees (bottom-left)
  const totalSweep = 240; // degrees clockwise

  // Define scale max: at least 1.5x baseline or 1.25x current, minimum 10 kg
  const maxKg = Math.max(baselineKg * 1.5, currentKg * 1.2, 10);

  // Value ratio (0 to 1)
  const currentRatio = Math.min(Math.max(currentKg / maxKg, 0), 1);
  const baselineRatio = Math.min(Math.max(baselineKg / maxKg, 0), 1);

  // Calculate needle angle (rotates from startAngle clockwise by sweep * ratio)
  // Standard CSS rotation around (cx, cy): 0 deg is pointing right.
  // When angle is 210 deg, needle points down-left.
  const targetNeedleAngle = startAngle - (mounted ? currentRatio : 0) * totalSweep;
  const baselineAngle = startAngle - baselineRatio * totalSweep;

  // Polar to Cartesian conversion
  const polarToCartesian = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
    };
  };

  // SVG arc path generator
  const describeArc = (startDeg: number, endDeg: number, radius: number) => {
    const start = polarToCartesian(startDeg, radius);
    const end = polarToCartesian(endDeg, radius);
    const sweepFlag = 1; // clockwise in screen space when going from larger angle to smaller
    const largeArcFlag = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
  };

  // Generate tick marks (11 major ticks from 0 to maxKg)
  const ticks = React.useMemo(() => {
    const count = 9;
    const items = [];
    for (let i = 0; i <= count; i++) {
      const ratio = i / count;
      const angle = startAngle - ratio * totalSweep;
      const val = ratio * maxKg;
      const inner = polarToCartesian(angle, r - 6);
      const outer = polarToCartesian(angle, r + 4);
      const labelPos = polarToCartesian(angle, r - 20);

      items.push({
        id: i,
        angle,
        val: val.toFixed(val >= 10 ? 0 : 1),
        inner,
        outer,
        labelPos,
        isMajor: i % 2 === 0,
      });
    }
    return items;
  }, [maxKg]);

  // Zone angles along the perimeter
  // Eco zone: 0 to 75% of baseline
  const ecoEndRatio = Math.min((baselineKg * 0.75) / maxKg, 0.8);
  const ecoEndAngle = startAngle - ecoEndRatio * totalSweep;

  // Normal zone: 75% of baseline to 105% of baseline
  const normalEndRatio = Math.min((baselineKg * 1.05) / maxKg, 0.95);
  const normalEndAngle = startAngle - normalEndRatio * totalSweep;

  // High zone: 105% of baseline to maxKg
  const highEndAngle = startAngle - totalSweep;

  // Status computation
  const delta = currentKg - baselineKg;
  const isEco = delta <= -0.1;
  const isNormal = Math.abs(delta) < 0.1;
  const isHigh = delta > 0.1;

  const baselineMarkerPos = polarToCartesian(baselineAngle, r + 9);
  const baselineInnerPos = polarToCartesian(baselineAngle, r - 8);

  return (
    <div className={cn('relative flex flex-col items-center select-none', className)}>
      <svg
        viewBox="0 0 320 220"
        className="w-full max-w-[340px] drop-shadow-sm overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle dial face gradient */}
          <radialGradient id="dialGlow" cx="50%" cy="65%" r="70%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="60%" stopColor="var(--muted)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Eco Zone Green Gradient */}
          <linearGradient id="ecoArcGrad" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#41825e" />
            <stop offset="100%" stopColor="#7ebf52" />
          </linearGradient>

          {/* Needle Drop Shadow */}
          <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#0f261a" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Dial Background Disc Glow */}
        <circle cx={cx} cy={cy} r={r + 14} fill="url(#dialGlow)" />

        {/* Outer Bezel Rim */}
        <path
          d={describeArc(startAngle + 3, highEndAngle - 3, r + 10)}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 1. Eco Zone Arc Track (Green) */}
        <path
          d={describeArc(startAngle, ecoEndAngle, r)}
          fill="none"
          stroke="url(#ecoArcGrad)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* 2. Target/Cruising Zone Arc Track (Lime/Amber) */}
        <path
          d={describeArc(ecoEndAngle, normalEndAngle, r)}
          fill="none"
          stroke="#9fd475"
          strokeWidth="7"
          strokeLinecap="butt"
        />

        {/* 3. Elevated/High Emission Arc Track (Muted Coral/Red) */}
        <path
          d={describeArc(normalEndAngle, highEndAngle, r)}
          fill="none"
          stroke="#e07a5f"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Tick Marks & Numbers */}
        {ticks.map((t) => (
          <g key={t.id}>
            <line
              x1={t.inner.x}
              y1={t.inner.y}
              x2={t.outer.x}
              y2={t.outer.y}
              stroke="var(--foreground)"
              strokeOpacity={t.isMajor ? 0.6 : 0.25}
              strokeWidth={t.isMajor ? 2 : 1.2}
              strokeLinecap="round"
            />
            {t.isMajor && (
              <text
                x={t.labelPos.x}
                y={t.labelPos.y + 3}
                fontSize="9"
                fontWeight="600"
                fill="var(--muted-foreground)"
                textAnchor="middle"
                className="font-mono tabular-nums"
              >
                {t.val}
              </text>
            )}
          </g>
        ))}

        {/* Baseline Marker Flag on the Outer Arc */}
        <line
          x1={baselineMarkerPos.x}
          y1={baselineMarkerPos.y}
          x2={baselineInnerPos.x}
          y2={baselineInnerPos.y}
          stroke="#1e4732"
          strokeWidth="2.5"
          strokeDasharray="2 1"
        />
        <circle cx={baselineMarkerPos.x} cy={baselineMarkerPos.y} r="3" fill="#1e4732" />

        {/* Tachometer Zone Tags */}
        <text
          x="68"
          y="180"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.08em"
          fill="#41825e"
          textAnchor="middle"
        >
          ECO
        </text>
        <text
          x={cx}
          y="42"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.08em"
          fill="#5a6656"
          textAnchor="middle"
        >
          BASELINE
        </text>
        <text
          x="252"
          y="180"
          fontSize="8"
          fontWeight="700"
          letterSpacing="0.08em"
          fill="#e07a5f"
          textAnchor="middle"
        >
          HIGH
        </text>

        {/* Speedometer Needle with smooth animation */}
        <g
          filter="url(#needleShadow)"
          style={{
            transform: `rotate(${-targetNeedleAngle + 90}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 1.2s cubic-bezier(0.34, 1.3, 0.64, 1)',
          }}
        >
          {/* Tapered needle blade */}
          <polygon
            points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx + 0.8},${cy - r + 14} ${cx - 0.8},${cy - r + 14}`}
            fill="#1a2119"
            className="dark:fill-lime-300"
          />
          {/* Needle red/lime tip accent */}
          <polygon
            points={`${cx - 1.2},${cy - r + 16} ${cx + 1.2},${cy - r + 16} ${cx},${cy - r + 4}`}
            fill={isEco ? '#7ebf52' : isHigh ? '#e07a5f' : '#9fd475'}
          />
          {/* Counterweight tail */}
          <polygon
            points={`${cx - 2.5},${cy} ${cx + 2.5},${cy} ${cx + 1.5},${cy + 18} ${cx - 1.5},${cy + 18}`}
            fill="#1a2119"
            className="dark:fill-lime-400"
          />
        </g>

        {/* Center Pivot Hub (Double Concentric Metal Rings) */}
        <circle cx={cx} cy={cy} r="14" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="8" fill="#1e4732" />
        <circle cx={cx} cy={cy} r="3" fill="#7ebf52" />
      </svg>

      {/* Digital Odometer Display Directly Below Needle Hub */}
      <div className="-mt-8 flex flex-col items-center text-center">
        <div className="flex items-baseline gap-1.5">
          <span className="tabular font-mono text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {currentKg.toFixed(2)}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            kg CO₂e
          </span>
        </div>

        {/* Status Pill Badge */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-2xs transition-all',
              isEco &&
                'bg-lime-100 text-lime-900 border border-lime-300 dark:bg-lime-950/60 dark:text-lime-200',
              isNormal && 'bg-accent text-accent-foreground border border-tertiary/40',
              isHigh && 'bg-danger-surface text-destructive border border-destructive/20',
            )}
          >
            <span
              className={cn(
                'size-2 rounded-full animate-pulse',
                isEco && 'bg-lime-600',
                isNormal && 'bg-yellow-500',
                isHigh && 'bg-red-500',
              )}
            />
            {isEco ? 'Eco Zone Active' : isNormal ? 'At Baseline' : 'Elevated RPM'}
          </span>

          <span className="text-xs font-medium text-muted-foreground">
            Target:{' '}
            <strong className="text-foreground font-semibold">{baselineKg.toFixed(2)} kg</strong>
          </span>
        </div>

        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {delta < 0 ? (
            <span className="text-positive font-semibold">
              ▼ {Math.abs(delta).toFixed(2)} kg ({Math.abs((delta / baselineKg) * 100).toFixed(0)}%)
              under budget
            </span>
          ) : delta > 0 ? (
            <span className="text-destructive font-semibold">
              ▲ {delta.toFixed(2)} kg ({((delta / baselineKg) * 100).toFixed(0)}%) above budget
            </span>
          ) : (
            <span>Exact match with your daily lifestyle profile</span>
          )}
        </p>
      </div>
    </div>
  );
}
