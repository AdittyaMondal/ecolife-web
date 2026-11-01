'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle2, FileQuestion, HelpCircle, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { orgMemberAnswersQuery } from '@/hooks/use-organization';
import type { OrganizationMember } from '@/types/api';

interface OrgMemberAnswersDialogProps {
  organizationId: number;
  member: OrganizationMember | null;
  onClose: () => void;
}

export function OrgMemberAnswersDialog({
  organizationId,
  member,
  onClose,
}: OrgMemberAnswersDialogProps) {
  const userId = member?.user.id ?? 0;

  const { data, isLoading } = useQuery({
    ...orgMemberAnswersQuery(organizationId, userId),
    enabled: Boolean(organizationId && userId),
  });

  if (!member) return null;

  const answers = data?.answers ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-answers-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <Card className="relative z-10 w-full max-w-lg p-6 border-border bg-card shadow-xl max-h-[85vh] flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <FileQuestion className="size-4" />
              </span>
              <h2 id="member-answers-title" className="text-lg font-bold text-foreground">
                Onboarding Insights
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Custom onboarding responses submitted by{' '}
              <strong className="text-foreground">{member.user.name}</strong>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-8 p-0 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Loading answers...</span>
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border text-muted-foreground space-y-2">
              <HelpCircle className="size-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">No custom answers submitted yet</p>
              <p className="text-xs text-muted-foreground">
                This member has not yet answered your organization&apos;s custom onboarding
                questions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground leading-snug">
                      {item.questionPrompt}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {item.questionType.replace('_', ' ')}
                      </span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                        title={`Question schema version ${item.questionVersion}`}
                      >
                        v{item.questionVersion}
                      </span>
                    </div>
                  </div>

                  {/* Formatted Answer */}
                  <div className="pt-1">
                    {Array.isArray(item.answer) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.answer.map((v, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-xs font-medium text-foreground"
                          >
                            <CheckCircle2 className="size-3 text-primary" />
                            <span>{String(v)}</span>
                          </span>
                        ))}
                      </div>
                    ) : typeof item.answer === 'boolean' ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          item.answer
                            ? 'bg-positive/10 text-positive border border-positive/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {item.answer ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <p className="text-xs text-foreground font-medium bg-card px-2.5 py-1.5 rounded-md border border-border inline-block">
                        {String(item.answer ?? '—')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
