import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { DailyAnswers, Trip, TripRow } from '@/hooks/use-track';

export interface TravelQuestionProps {
  trips: TripRow[];
  onChange: (trips: TripRow[]) => void;
  defaults?: DailyAnswers;
}

const TRAVEL_MODES: { value: Trip['mode']; label: string }[] = [
  { value: 'walk', label: 'Walk' },
  { value: 'cycle', label: 'Bicycle / Cycle' },
  { value: 'bus', label: 'Bus' },
  { value: 'metro_train', label: 'Metro / Train' },
  { value: 'two_wheeler', label: 'Two-wheeler / Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'cab', label: 'Cab / Taxi' },
  { value: 'auto_rickshaw', label: 'Auto-rickshaw' },
  { value: 'work_from_home', label: 'Work from home' },
];

export function TravelQuestion({ trips, onChange, defaults }: TravelQuestionProps) {
  const defaultTrip: Trip = defaults?.trips?.[0] ?? { mode: 'bus', km: 10 };

  const modeLabel =
    TRAVEL_MODES.find((m) => m.value === defaultTrip.mode)?.label ?? defaultTrip.mode;
  const defaultSummary = `${modeLabel} (${defaultTrip.km} km)`;

  const handleApplyDefaults = () => {
    onChange([{ ...defaultTrip, _id: crypto.randomUUID() }]);
  };

  const handleAddTrip = () => {
    onChange([...trips, { mode: 'bus', km: 5, _id: crypto.randomUUID() }]);
  };

  const handleRemoveTrip = (index: number) => {
    onChange(trips.filter((_, i) => i !== index));
  };

  const handleModeChange = (index: number, mode: Trip['mode']) => {
    const updated = [...trips];
    const existing = updated[index];
    if (existing) {
      updated[index] = { ...existing, mode, km: mode === 'work_from_home' ? 0 : existing.km };
      onChange(updated);
    }
  };

  const handleKmChange = (index: number, kmStr: string) => {
    const km = Math.max(0, Number.parseFloat(kmStr) || 0);
    const updated = [...trips];
    const existing = updated[index];
    if (existing) {
      updated[index] = { ...existing, km };
      onChange(updated);
    }
  };

  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-base font-semibold text-foreground">
        1. How did you get around today?
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Add each trip taken today. Leaving this empty means you did not travel.
      </p>

      {/* Prominent "Same as usual" action */}
      <div className="mt-4 rounded-lg border border-primary/20 bg-secondary/60 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="text-xs text-muted-foreground sm:text-sm">
          <span className="font-medium text-foreground">Default commute: </span>
          <span>{defaultSummary}</span>
        </div>
        <button
          type="button"
          onClick={handleApplyDefaults}
          className="mt-2.5 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-eco-700 hover:text-eco-50 sm:mt-0 sm:w-auto dark:hover:bg-eco-300 dark:hover:text-eco-950"
        >
          <RotateCcw className="size-4 shrink-0" aria-hidden="true" />
          <span>Same as usual</span>
        </button>
      </div>

      {/* Trips list */}
      <div className="mt-4 space-y-3">
        {trips.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
            No travel logged today (0 km).
          </div>
        ) : (
          trips.map((trip, idx) => {
            const isWfh = trip.mode === 'work_from_home';
            return (
              <div
                key={trip._id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex-1">
                  <label htmlFor={`trip-mode-${idx}`} className="sr-only">
                    Trip {idx + 1} transport mode
                  </label>
                  <select
                    id={`trip-mode-${idx}`}
                    value={trip.mode}
                    onChange={(e) => handleModeChange(idx, e.target.value as Trip['mode'])}
                    className="min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {TRAVEL_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <label htmlFor={`trip-km-${idx}`} className="sr-only">
                      Trip {idx + 1} distance in kilometres
                    </label>
                    <input
                      id={`trip-km-${idx}`}
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={isWfh}
                      value={isWfh ? 0 : trip.km}
                      onChange={(e) => handleKmChange(idx, e.target.value)}
                      className="min-h-11 w-24 rounded-lg border border-input bg-card px-3 pr-8 py-2 text-sm tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                    />
                    <span
                      className="pointer-events-none absolute right-2.5 text-xs text-muted-foreground"
                      aria-hidden="true"
                    >
                      km
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTrip(idx)}
                    aria-label={`Remove trip ${idx + 1}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <button
          type="button"
          onClick={handleAddTrip}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/60 sm:w-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>Add another trip</span>
        </button>
      </div>
    </fieldset>
  );
}
