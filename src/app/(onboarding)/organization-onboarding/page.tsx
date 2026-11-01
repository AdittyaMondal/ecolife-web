'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Select } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { myOrgOnboardingQuery, useSubmitOrgOnboardingAnswers } from '@/hooks/use-organization';
import type { OrgAnswerInput, OrgOnboardingQuestion } from '@/types/api';

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery(myOrgOnboardingQuery());
  const submitAnswers = useSubmitOrgOnboardingAnswers();

  // Map of questionId -> answer value
  const [answers, setAnswers] = React.useState<Record<number, unknown>>({});
  const [initialized, setInitialized] = React.useState(false);

  const org = data?.organization;
  const questions = data?.questions ?? [];
  const existingAnswers = data?.answers ?? [];

  // Populate answers from existing answers on first load
  React.useEffect(() => {
    if (data && !initialized) {
      const initial: Record<number, unknown> = {};
      for (const a of existingAnswers) {
        initial[a.questionId] = a.answer;
      }
      setAnswers(initial);
      setInitialized(true);
    }
  }, [data, existingAnswers, initialized]);

  // If no organization or 0 questions, redirect to home
  React.useEffect(() => {
    if (!isLoading && (!org || questions.length === 0)) {
      router.replace('/home');
    }
  }, [isLoading, org, questions, router]);

  const updateAnswer = (questionId: number, val: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleMultipleChoiceToggle = (questionId: number, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateAnswer(questionId, updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required questions
    for (const q of questions) {
      if (q.required) {
        const val = answers[q.id];
        const isMissing =
          val === null ||
          val === undefined ||
          val === '' ||
          (Array.isArray(val) && val.length === 0);

        if (isMissing) {
          toast.error(`Please answer required question: "${q.prompt}"`);
          return;
        }
      }
    }

    // Format submission payload
    const payload: OrgAnswerInput[] = [];
    for (const q of questions) {
      const val = answers[q.id];
      if (val !== undefined && val !== null && val !== '') {
        payload.push({ questionId: q.id, answer: val });
      }
    }

    submitAnswers.mutate(
      { answers: payload },
      {
        onSuccess: () => {
          toast.success(`Welcome to ${org?.name}! Onboarding complete.`);
          router.push('/home');
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Failed to submit answers.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading organization onboarding...</p>
      </div>
    );
  }

  if (!org || questions.length === 0) {
    return null;
  }

  const hasRequired = questions.some((q) => q.required);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Building2 className="size-3.5" />
          <span>{org.name}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Partner Onboarding
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {org.name} has prepared these questions to help personalize your team impact, benchmarks,
          and community initiatives.
        </p>
      </div>

      {/* Questions Card */}
      <Card className="p-6 sm:p-8 border-border bg-card shadow-subtle space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const currentVal = answers[q.id];

            return (
              <div
                key={q.id}
                className="space-y-3 pb-6 border-b border-border/60 last:border-b-0 last:pb-0"
              >
                {/* Question Prompt & Badges */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <label
                      htmlFor={`question-${q.id}`}
                      className="text-sm font-semibold text-foreground leading-snug cursor-pointer"
                    >
                      <span className="text-muted-foreground font-mono mr-1.5">{idx + 1}.</span>
                      {q.prompt}
                      {q.required && <span className="text-destructive font-bold ml-1">*</span>}
                    </label>

                    {q.required ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        Optional
                      </span>
                    )}
                  </div>

                  {q.description && (
                    <p className="text-xs text-muted-foreground italic pl-4">{q.description}</p>
                  )}
                </div>

                {/* Question Input depending on type */}
                <div className="pl-4">
                  {/* Type 1: Text */}
                  {q.type === 'text' && (
                    <Input
                      id={`question-${q.id}`}
                      value={typeof currentVal === 'string' ? currentVal : ''}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      placeholder="Type your response here..."
                      required={q.required}
                    />
                  )}

                  {/* Type 2: Number */}
                  {q.type === 'number' && (
                    <Input
                      id={`question-${q.id}`}
                      type="number"
                      value={
                        typeof currentVal === 'number' || typeof currentVal === 'string'
                          ? currentVal
                          : ''
                      }
                      onChange={(e) =>
                        updateAnswer(q.id, e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Enter a number..."
                      required={q.required}
                    />
                  )}

                  {/* Type 3: Yes / No */}
                  {q.type === 'yes_no' && (
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant={currentVal === true ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateAnswer(q.id, true)}
                        className="w-24 gap-1.5"
                      >
                        {currentVal === true && <CheckCircle2 className="size-3.5" />}
                        <span>Yes</span>
                      </Button>
                      <Button
                        type="button"
                        variant={currentVal === false ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => updateAnswer(q.id, false)}
                        className="w-24 gap-1.5"
                      >
                        {currentVal === false && <CheckCircle2 className="size-3.5" />}
                        <span>No</span>
                      </Button>
                    </div>
                  )}

                  {/* Type 4: Single Choice */}
                  {q.type === 'single_choice' && (
                    <Select
                      id={`question-${q.id}`}
                      value={typeof currentVal === 'string' ? currentVal : ''}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      required={q.required}
                    >
                      <option value="">Select an option...</option>
                      {(q.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  )}

                  {/* Type 5: Multiple Choice */}
                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(q.options || []).map((opt) => {
                        const selectedList = (currentVal as string[]) || [];
                        const isChecked = selectedList.includes(opt);

                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                              isChecked
                                ? 'bg-primary/10 border-primary/40 text-foreground font-medium'
                                : 'bg-card border-border hover:bg-muted/40 text-muted-foreground'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleMultipleChoiceToggle(q.id, opt)}
                              className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
            {!hasRequired ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/home')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitAnswers.isPending}
              className="w-full sm:w-auto gap-2"
            >
              {submitAnswers.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Onboarding</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
