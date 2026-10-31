/** Formatting. Money is integer paise; emissions are kg CO₂e. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

/** 24000 → "₹240". Paise in, never a float price out of our own arithmetic. */
export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

export function formatKg(kg: number, digits = 1): string {
  return `${kg.toFixed(digits)} kg`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

export function formatPct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

/** Signed with a real minus sign, for deltas. */
export function formatSigned(n: number, digits = 1, unit = ''): string {
  const s = Math.abs(n).toFixed(digits);
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${s}${unit}`;
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
const dateLongFmt = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });
const weekdayFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });

/** `YYYY-MM-DD` is the user's LOCAL date — parse it as local, not UTC. */
export function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(value: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDate(value) : new Date(value);
  return dateFmt.format(d);
}

export function formatDateLong(value: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseLocalDate(value) : new Date(value);
  return dateLongFmt.format(d);
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function formatWeekday(ymd: string): string {
  return weekdayFmt.format(parseLocalDate(ymd));
}

export function formatDateTimeRange(startIso: string, endIso: string): string {
  return `${dateLongFmt.format(new Date(startIso))} · ${formatTime(startIso)} – ${formatTime(endIso)}`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelative(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return dateFmt.format(new Date(iso));
}

/** Today as `YYYY-MM-DD` in the browser's zone. */
export function todayYmd(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function titleCase(snake: string): string {
  return snake
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}
