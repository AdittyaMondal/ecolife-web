import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
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
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-base font-semibold text-foreground">
        1. How did you get around today?
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Add each trip taken today. Leaving this empty means you did not travel.
      </p>

      {/* Concentric "Same as usual" banner: outer rounded-sm (12px), p-1 (4px), inner button rounded-xs (8px) */}
      <div className="mt-4 flex flex-col justify-between gap-2 rounded-sm border border-tertiary/40 bg-accent p-3 sm:flex-row sm:items-center">
        <div className="text-xs text-accent-foreground sm:text-sm">
          <span className="font-semibold">Default commute: </span>
          <span>{defaultSummary}</span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={handleApplyDefaults}>
          <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Same as usual</span>
        </Button>
      </div>

      {/* Trips list */}
      <div className="mt-4 space-y-2.5">
        {trips.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
            No travel logged today (0 km).
          </div>
        ) : (
          trips.map((trip, idx) => {
            const isWfh = trip.mode === 'work_from_home';
            return (
              <div
                key={trip._id}
                className="flex flex-col gap-2 rounded-sm border border-border bg-muted/50 p-2 sm:flex-row sm:items-center"
              >
                <div className="flex-1">
                  <label htmlFor={`trip-mode-${idx}`} className="sr-only">
                    Trip {idx + 1} transport mode
                  </label>
                  <Select
                    id={`trip-mode-${idx}`}
                    value={trip.mode}
                    onChange={(e) => handleModeChange(idx, e.target.value as Trip['mode'])}
                    className="rounded-xs"
                  >
                    {TRAVEL_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <label htmlFor={`trip-km-${idx}`} className="sr-only">
                      Trip {idx + 1} distance in kilometres
                    </label>
                    <Input
                      id={`trip-km-${idx}`}
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={isWfh}
                      value={isWfh ? 0 : trip.km}
                      onChange={(e) => handleKmChange(idx, e.target.value)}
                      className="tabular w-28 rounded-xs pr-9"
                    />
                    <span
                      className="pointer-events-none absolute right-3 text-xs text-muted-foreground"
                      aria-hidden="true"
                    >
                      km
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTrip(idx)}
                    aria-label={`Remove trip ${idx + 1}`}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xs border border-border bg-card text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <Button type="button" variant="outline" onClick={handleAddTrip}>
          <Plus className="size-4" aria-hidden="true" />
          <span>Add another trip</span>
        </Button>
      </div>
    </fieldset>
  );
}
