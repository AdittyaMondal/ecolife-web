import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { categoryShares, type Home } from '@/hooks/use-home';

export interface BreakdownListProps {
  breakdown: Home['breakdown30d'];
}

export function BreakdownList({ breakdown }: BreakdownListProps) {
  const categories = categoryShares(breakdown);

  return (
    <Card aria-labelledby="breakdown-heading">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle id="breakdown-heading">Breakdown (30 days)</CardTitle>
          <span className="text-xs text-muted-foreground">
            Total {breakdown.totalKg.toFixed(1)} kg
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{cat.label}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{Math.round(cat.pct)}%</span>
                <span aria-hidden="true">·</span>
                <span>{cat.kg.toFixed(1)} kg</span>
              </div>
            </div>
            <ProgressBar
              value={cat.pct}
              max={100}
              label={`${cat.label} emissions proportion: ${Math.round(cat.pct)}%`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
