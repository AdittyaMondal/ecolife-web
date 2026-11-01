'use client';

import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Screen polar to cartesian:
 * 0° is 3 o'clock, 90° is 6 o'clock (bottom), 180° is 9 o'clock (left), 270° is 12 o'clock (top).
 * Y is positive downwards in SVG space.
 */
function polarToScreen(cx: number, cy: number, degClockwiseFrom3: number, radius: number) {
  const rad = (degClockwiseFrom3 * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export interface RadialDialProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label: string;
  sublabel?: string;
  presets?: number[];
  onChange: (val: number) => void;
  className?: string;
}

export function RadialDial({
  value,
  min,
  max,
  step = 1,
  unit = '%',
  label,
  sublabel,
  presets,
  onChange,
  className,
}: RadialDialProps) {
  const dialRef = React.useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Geometric layout of circular arc
  // Symmetrical 270° sweep starting at 135° (bottom-left) and ending at 405° (bottom-right / 45°)
  const cx = 100;
  const cy = 100;
  const r = 70;
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle; // 405°

  const fraction = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const currentAngle = startAngle + fraction * sweepAngle;

  const describeArc = (fromDeg: number, toDeg: number, radius: number) => {
    // Clamp to prevent full 360 loop degeneracies
    const clampedTo = Math.max(fromDeg + 0.5, toDeg);
    const start = polarToScreen(cx, cy, fromDeg, radius);
    const end = polarToScreen(cx, cy, clampedTo, radius);
    const diff = clampedTo - fromDeg;
    const largeArc = diff > 180 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  const handlePointerAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerPointX = rect.left + rect.width / 2;
    const centerPointY = rect.top + rect.height / 2;

    const dx = clientX - centerPointX;
    const dy = clientY - centerPointY;

    // Angle in degrees clockwise from 3 o'clock (0° to 360°)
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    // Map [0, 90) to [360, 450) so dial [135, 405] is continuous
    let angle = deg;
    if (angle < 90) {
      angle += 360;
    }

    // Clamp inside or closest to dial arc boundaries
    if (angle < startAngle) {
      angle = startAngle;
    } else if (angle > endAngle) {
      angle = endAngle;
    }

    const newFraction = (angle - startAngle) / sweepAngle;
    const rawVal = min + newFraction * (max - min);
    const stepped = Math.round(rawVal / step) * step;

    const precision = step.toString().split('.')[1]?.length || 0;
    const finalVal = Number(Math.min(Math.max(stepped, min), max).toFixed(precision));
    onChange(finalVal);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerAngle(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    handlePointerAngle(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const stepPrecision = step.toString().split('.')[1]?.length || 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Number(Math.min(value + step, max).toFixed(stepPrecision));
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Number(Math.max(value - step, min).toFixed(stepPrecision));
      onChange(prev);
    }
  };

  const knobPos = polarToScreen(cx, cy, currentAngle, r);

  // Ticks along the dial
  const ticks = React.useMemo(() => {
    const list = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const f = i / count;
      const angle = startAngle + f * sweepAngle;
      const p1 = polarToScreen(cx, cy, angle, r - 8);
      const p2 = polarToScreen(cx, cy, angle, r + 6);
      list.push({ id: i, p1, p2, isMajor: i % 3 === 0 });
    }
    return list;
  }, []);

  return (
    <div className={cn('flex flex-col items-center gap-3.5', className)}>
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="group relative flex flex-col items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-primary select-none"
      >
        <svg
          ref={dialRef}
          viewBox="0 0 200 200"
          aria-hidden="true"
          focusable="false"
          className="size-48 sm:size-52 cursor-grab active:cursor-grabbing touch-none select-none transition-transform"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <defs>
            <linearGradient id="activeDialArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#41825e" />
              <stop offset="50%" stopColor="#7ebf52" />
              <stop offset="100%" stopColor="#9fd475" />
            </linearGradient>
            <filter id="dialKnobShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background Outer Ring Track */}
          <path
            d={describeArc(startAngle, endAngle, r)}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Active Value Progress Arc */}
          {fraction > 0.005 && (
            <path
              d={describeArc(startAngle, currentAngle, r)}
              fill="none"
              stroke="url(#activeDialArc)"
              strokeWidth="11"
              strokeLinecap="round"
            />
          )}

          {/* Dial Tick Marks */}
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.p1.x.toFixed(2)}
              y1={t.p1.y.toFixed(2)}
              x2={t.p2.x.toFixed(2)}
              y2={t.p2.y.toFixed(2)}
              stroke="var(--foreground)"
              strokeOpacity={t.isMajor ? 0.35 : 0.12}
              strokeWidth={t.isMajor ? 1.5 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Center Hub Display */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 20}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth="1.5"
            className="shadow-inner"
          />

          {/* Draggable Knob Handle */}
          <g filter="url(#dialKnobShadow)">
            <circle
              cx={knobPos.x.toFixed(2)}
              cy={knobPos.y.toFixed(2)}
              r="11"
              fill="#ffffff"
              stroke="#1e4732"
              strokeWidth="3.5"
              className="transition-transform duration-75 group-hover:scale-110"
            />
            <circle cx={knobPos.x.toFixed(2)} cy={knobPos.y.toFixed(2)} r="3.5" fill="#7ebf52" />
          </g>
        </svg>

        {/* Numeric Readout inside center hub */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
              {value}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{unit}</span>
          </div>
          {sublabel && (
            <span className="text-[10px] text-muted-foreground max-w-[84px] truncate leading-tight mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Stepper Buttons (- and +) for precise control */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => onChange(Number(Math.max(value - step, min).toFixed(stepPrecision)))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3.5" />
        </Button>

        <span className="text-xs font-mono font-semibold text-foreground/80 tabular w-16 text-center">
          {value} {unit}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => onChange(Number(Math.min(value + step, max).toFixed(stepPrecision)))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Quick Select Preset Pills */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-[260px]">
          {presets.map((preset) => {
            const isSelected = value === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-bold transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-2xs scale-105'
                    : 'bg-muted/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {preset}
                {unit}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
