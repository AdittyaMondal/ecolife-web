import { Chip } from '@/components/ui/chip';
import type { DailyAnswers } from '@/hooks/use-track';

type WasteAction = NonNullable<DailyAnswers['wasteActions']>[number];

export interface WasteQuestionProps {
  value: WasteAction[];
  onChange: (value: WasteAction[]) => void;
}

const WASTE_ITEMS: { value: WasteAction; label: string; description: string }[] = [
  {
    value: 'segregated',
    label: 'Segregated',
    description: 'Separated wet and dry waste at the source',
  },
  {
    value: 'composted',
    label: 'Composted',
    description: 'Composted organic kitchen waste',
  },
  {
    value: 'refused_plastic',
    label: 'Refused plastic',
    description: 'Avoided single-use plastic bags, bottles, or packaging',
  },
  {
    value: 'none_of_these',
    label: 'None of these',
    description: 'Did not practice waste diversion actions today',
  },
];

export function WasteQuestion({ value = [], onChange }: WasteQuestionProps) {
  const handleToggle = (item: WasteAction) => {
    if (item === 'none_of_these') {
      if (value.includes('none_of_these')) {
        onChange([]);
      } else {
        onChange(['none_of_these']);
      }
      return;
    }

    const withoutNone = value.filter((v) => v !== 'none_of_these');
    if (withoutNone.includes(item)) {
      onChange(withoutNone.filter((v) => v !== item));
    } else {
      onChange([...withoutNone, item]);
    }
  };

  return (
    <fieldset className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <legend className="px-1 text-base font-semibold text-foreground">5. Waste today?</legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Select all actions you took today. Selecting &ldquo;None of these&rdquo; clears the other
        options.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {WASTE_ITEMS.map((item) => {
          const isSelected = value.includes(item.value);
          return (
            <Chip
              key={item.value}
              selected={isSelected}
              onToggle={() => handleToggle(item.value)}
              aria-label={`${item.label}: ${item.description}`}
            >
              {item.label}
            </Chip>
          );
        })}
      </div>
    </fieldset>
  );
}
