import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GoalForm } from '@/components/blocks/goals/goal-form';

export default function NewGoalPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/track/goals"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to Goals</span>
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Set a new goal</h1>
          <p className="text-sm text-muted-foreground">
            Choose a target to cut your carbon emissions and stay accountable.
          </p>
        </div>
      </div>

      {/* Goal creation form */}
      <GoalForm />
    </main>
  );
}
