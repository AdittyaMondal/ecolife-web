'use client';

import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const cx = 100;
  const cy = 100;
  const r = 74;
  const startAngle = 140; // degrees from 3 o'clock (around 8 o'clock)
  const sweepAngle = 260; // total degrees of dial rotation clockwise

  const fraction = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const currentAngle = startAngle + fraction * sweepAngle;

  const polarToCartesian = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (fromDeg: number, toDeg: number, radius: number) => {
    const start = polarToCartesian(fromDeg, radius);
    const end = polarToCartesian(toDeg, radius);
    const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const handlePointerAngle = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerPointX = rect.left + rect.width / 2;
    const centerPointY = rect.top + rect.height / 2;

    const dx = clientX - centerPointX;
    const dy = clientY - centerPointY;

    // Angle in degrees from 0 to 360
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    // Map angle relative to startAngle (140)
    let relative = deg - startAngle;
    if (relative < 0) relative += 360;

    // If within sweep range
    if (relative <= sweepAngle + 30) {
      const clampedSweep = Math.min(Math.max(relative, 0), sweepAngle);
      const newFraction = clampedSweep / sweepAngle;
      const rawVal = min + newFraction * (max - min);
      const stepped = Math.round(rawVal / step) * step;
      onChange(Math.min(Math.max(stepped, min), max));
    }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(value + step, max));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(value - step, min));
    }
  };

  const knobPos = polarToCartesian(currentAngle, r);

  // Ticks along the dial
  const ticks = React.useMemo(() => {
    const list = [];
    const count = 10;
    for (let i = 0; i <= count; i++) {
      const f = i / count;
      const angle = startAngle + f * sweepAngle;
      const p1 = polarToCartesian(angle, r - 6);
      const p2 = polarToCartesian(angle, r + 4);
      list.push({ id: i, p1, p2, isMajor: i % 2 === 0 });
    }
    return list;
  }, []);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="group relative flex flex-col items-center justify-center rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
      >
        <svg
          ref={dialRef}
          viewBox="0 0 200 200"
          className="size-44 sm:size-48 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <defs>
            <linearGradient id="activeArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#41825e" />
              <stop offset="60%" stopColor="#7ebf52" />
              <stop offset="100%" stopColor="#9fd475" />
            </linearGradient>
            <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Outer Ring Track */}
          <path
            d={describeArc(startAngle, startAngle + sweepAngle, r)}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Active Value Progress Arc */}
          {fraction > 0.01 && (
            <path
              d={describeArc(startAngle, currentAngle, r)}
              fill="none"
              stroke="url(#activeArc)"
              strokeWidth="10"
              strokeLinecap="round"
              className="transition-[stroke-dasharray]"
            />
          )}

          {/* Dial Tick Marks */}
          {ticks.map((t) => (
            <line
              key={t.id}
              x1={t.p1.x}
              y1={t.p1.y}
              x2={t.p2.x}
              y2={t.p2.y}
              stroke="var(--foreground)"
              strokeOpacity={t.isMajor ? 0.4 : 0.15}
              strokeWidth={t.isMajor ? 1.5 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Center Hub Display */}
          <circle cx={cx} cy={cy} r={r - 18} fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />

          {/* Draggable Knob Handle */}
          <g filter="url(#knobShadow)">
            <circle
              cx={knobPos.x}
              cy={knobPos.y}
              r="10"
              fill="#ffffff"
              stroke="#1e4732"
              strokeWidth="3"
              className="transition-transform duration-75 group-hover:scale-110"
            />
            <circle cx={knobPos.x} cy={knobPos.y} r="3" fill="#7ebf52" />
          </g>
        </svg>

        {/* Numeric Readout inside center hub */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="tabular font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
              {value}
            </span>
            <span className="text-xs font-bold text-muted-foreground">{unit}</span>
          </div>
          {sublabel && (
            <span className="text-[10px] text-muted-foreground max-w-[80px] truncate leading-tight">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Stepper Buttons (- and +) for precise control */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0 rounded-full"
          onClick={() => onChange(Math.max(value - step, min))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3.5" />
        </Button>

        <span className="text-xs font-mono font-semibold text-muted-foreground tabular w-14 text-center">
          {value} {unit}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-8 p-0 rounded-full"
          onClick={() => onChange(Math.min(value + step, max))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Quick Select Preset Pills */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
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
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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

