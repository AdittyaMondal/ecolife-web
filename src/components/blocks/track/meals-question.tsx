import { Stepper } from '@/components/ui/stepper';

export interface MealsQuestionProps {
  vegMeals: number;
  nonVegMeals: number;
  veganMeals: number;
  onChange: (meals: { vegMeals: number; nonVegMeals: number; veganMeals: number }) => void;
}

export function MealsQuestion({ vegMeals, nonVegMeals, veganMeals, onChange }: MealsQuestionProps) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-base font-semibold text-foreground">
        2. What did you eat today?
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Count each meal eaten today by dietary category.
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex flex-col gap-2 rounded-sm border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label htmlFor="stepper-veg-meals" className="text-sm font-semibold text-foreground">
              Vegetarian meals
            </label>
            <p className="text-xs text-muted-foreground">Dairy, eggs, vegetables, grains</p>
          </div>
          <Stepper
            id="stepper-veg-meals"
            label="Vegetarian meals"
            value={vegMeals}
            min={0}
            max={10}
            onChange={(val) => onChange({ vegMeals: val, nonVegMeals, veganMeals })}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-sm border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label
              htmlFor="stepper-non-veg-meals"
              className="text-sm font-semibold text-foreground"
            >
              Non-vegetarian meals
            </label>
            <p className="text-xs text-muted-foreground">Meat, poultry, seafood</p>
          </div>
          <Stepper
            id="stepper-non-veg-meals"
            label="Non-vegetarian meals"
            value={nonVegMeals}
            min={0}
            max={10}
            onChange={(val) => onChange({ vegMeals, nonVegMeals: val, veganMeals })}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-sm border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label htmlFor="stepper-vegan-meals" className="text-sm font-semibold text-foreground">
              Vegan meals
            </label>
            <p className="text-xs text-muted-foreground">100% plant-based, no animal products</p>
          </div>
          <Stepper
            id="stepper-vegan-meals"
            label="Vegan meals"
            value={veganMeals}
            min={0}
            max={10}
            onChange={(val) => onChange({ vegMeals, nonVegMeals, veganMeals: val })}
          />
        </div>
      </div>
    </fieldset>
  );
}
