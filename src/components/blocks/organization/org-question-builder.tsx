'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Edit2,
  FileQuestion,
  HelpCircle,
  ListOrdered,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input, Select } from '@/components/ui/input';
import {
  orgQuestionsQuery,
  useCreateOrgQuestion,
  useDeleteOrgQuestion,
  useReorderOrgQuestions,
  useUpdateOrgQuestion,
} from '@/hooks/use-organization';
import type {
  CreateOrgQuestionBody,
  Organization,
  OrgOnboardingQuestion,
  OrgQuestionType,
  UpdateOrgQuestionBody,
} from '@/types/api';

interface OrgQuestionBuilderProps {
  organization: Organization;
  isOwner: boolean;
}

const QUESTION_TYPES: { value: OrgQuestionType; label: string; desc: string }[] = [
  { value: 'text', label: 'Short Text', desc: 'Free-form text response (e.g. Department, Team)' },
  { value: 'single_choice', label: 'Single Choice', desc: 'Select one from multiple options' },
  { value: 'multiple_choice', label: 'Multiple Choice', desc: 'Select one or more options' },
  { value: 'number', label: 'Number', desc: 'Numeric value (e.g. Commute distance in km)' },
  { value: 'yes_no', label: 'Yes / No', desc: 'Simple boolean confirmation' },
];

export function OrgQuestionBuilder({ organization, isOwner }: OrgQuestionBuilderProps) {
  const { data: questions = [], isLoading } = useQuery(orgQuestionsQuery(organization.id));

  const createQuestion = useCreateOrgQuestion(organization.id);
  const updateQuestion = useUpdateOrgQuestion(organization.id);
  const reorderQuestions = useReorderOrgQuestions(organization.id);
  const deleteQuestion = useDeleteOrgQuestion(organization.id);

  // Modal states
  const [modalMode, setModalMode] = React.useState<'create' | 'edit' | null>(null);
  const [editingQuestion, setEditingQuestion] = React.useState<OrgOnboardingQuestion | null>(null);

  // Form states
  const [prompt, setPrompt] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<OrgQuestionType>('text');
  const [optionsStr, setOptionsStr] = React.useState('');
  const [required, setRequired] = React.useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<number | null>(null);

  const openCreateModal = () => {
    setPrompt('');
    setDescription('');
    setType('text');
    setOptionsStr('');
    setRequired(false);
    setEditingQuestion(null);
    setModalMode('create');
  };

  const openEditModal = (q: OrgOnboardingQuestion) => {
    setEditingQuestion(q);
    setPrompt(q.prompt);
    setDescription(q.description || '');
    setType(q.type);
    setOptionsStr((q.options || []).join(', '));
    setRequired(q.required);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingQuestion(null);
  };

  const parseOptions = (str: string): string[] => {
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      toast.error('Question prompt is required.');
      return;
    }

    const needsOptions = type === 'single_choice' || type === 'multiple_choice';
    const parsedOpts = needsOptions ? parseOptions(optionsStr) : undefined;

    if (needsOptions && (!parsedOpts || parsedOpts.length < 2)) {
      toast.error('Please provide at least 2 comma-separated options.');
      return;
    }

    if (modalMode === 'create') {
      const body: CreateOrgQuestionBody = {
        prompt: cleanPrompt,
        description: description.trim() || undefined,
        type,
        options: parsedOpts,
        required,
      };

      createQuestion.mutate(body, {
        onSuccess: () => {
          toast.success('Question added successfully!');
          closeModal();
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Failed to add question.');
        },
      });
    } else if (modalMode === 'edit' && editingQuestion) {
      const body: UpdateOrgQuestionBody = {
        prompt: cleanPrompt,
        description: description.trim() || null,
        type,
        options: needsOptions ? parsedOpts : null,
        required,
      };

      updateQuestion.mutate(
        { questionId: editingQuestion.id, body },
        {
          onSuccess: (updated: OrgOnboardingQuestion) => {
            if (updated.version > editingQuestion.version) {
              toast.success(`Question updated (version incremented to v${updated.version}).`);
            } else {
              toast.success('Question updated successfully!');
            }
            closeModal();
          },
          onError: (err: unknown) => {
            const apiErr = err as { message?: string };
            toast.error(apiErr?.message || 'Failed to update question.');
          },
        },
      );
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const newOrder = [...questions];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved!);

    const questionIds = newOrder.map((q) => q.id);
    reorderQuestions.mutate(
      { questionIds },
      {
        onError: () => toast.error('Failed to update question order.'),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteQuestion.mutate(id, {
      onSuccess: () => {
        toast.success('Question deleted.');
        setDeleteConfirmId(null);
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(apiErr?.message || 'Failed to delete question.');
        setDeleteConfirmId(null);
      },
    });
  };

  return (
    <Card className="p-6 sm:p-7 border-border bg-card shadow-subtle space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <FileQuestion className="size-4" />
            </span>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Custom Onboarding Questions
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Members joining with your code answer these questions after completing standard EcoLife
            onboarding.
          </p>
        </div>

        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="gap-1.5 text-xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Add Question</span>
          </Button>
        )}
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-xs">Loading questions...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
          <HelpCircle className="size-8 mx-auto text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No custom questions configured</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add custom questions to gather organization-specific data such as department, commute
              modes, or remote work habits.
            </p>
          </div>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateModal}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Create First Question</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors"
            >
              {/* Left: Question info */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">{q.prompt}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {q.type.replace('_', ' ')}
                  </span>
                  {q.required ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                      Required
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                      Optional
                    </span>
                  )}
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                    title={`Question version ${q.version}. Edits bump version to preserve answer history.`}
                  >
                    v{q.version}
                  </span>
                </div>

                {q.description && (
                  <p className="text-xs text-muted-foreground italic pl-5">{q.description}</p>
                )}

                {q.options && q.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-5 pt-0.5">
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              {isOwner && (
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Reorder Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0 || reorderQuestions.isPending}
                    onClick={() => handleMove(idx, 'up')}
                    className="size-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move question up"
                    aria-label="Move question up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === questions.length - 1 || reorderQuestions.isPending}
                    onClick={() => handleMove(idx, 'down')}
                    className="size-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move question down"
                    aria-label="Move question down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(q)}
                    className="size-8 p-0 text-muted-foreground hover:text-primary"
                    title="Edit question"
                    aria-label="Edit question"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>

                  {/* Delete Button */}
                  {deleteConfirmId === q.id ? (
                    <div className="flex items-center gap-1 animate-fade-in">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(q.id)}
                        disabled={deleteQuestion.isPending}
                        className="h-8 px-2 text-xs"
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(null)}
                        className="size-8 p-0"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(q.id)}
                      className="size-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete question"
                      aria-label="Delete question"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Question */}
      {modalMode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="fixed inset-0" onClick={closeModal} aria-hidden="true" />

          <Card className="relative z-10 w-full max-w-lg p-6 border-border bg-card shadow-xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {modalMode === 'create' ? 'Add Custom Question' : 'Edit Question'}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {modalMode === 'create'
                    ? 'Configure a question for new members joining your organization.'
                    : 'Modifying prompt or question type increments the version to preserve historical answer snapshots.'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="size-8 p-0 text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prompt */}
              <Field
                id="question-prompt-input"
                label="Question Prompt *"
                hint="Clear question statement for employees"
              >
                <Input
                  id="question-prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. What department or business unit do you work in?"
                  required
                  maxLength={300}
                />
              </Field>

              {/* Description */}
              <Field
                id="question-desc-input"
                label="Description (optional)"
                hint="Helper note or context displayed under the question"
              >
                <Input
                  id="question-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Used to aggregate team-level carbon benchmarks"
                  maxLength={500}
                />
              </Field>

              {/* Type */}
              <Field id="question-type-select" label="Question Type *">
                <Select
                  id="question-type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as OrgQuestionType)}
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.desc}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* Options (for choice types) */}
              {(type === 'single_choice' || type === 'multiple_choice') && (
                <Field
                  id="question-options-input"
                  label="Options (comma-separated) *"
                  hint="Provide at least 2 distinct choices (e.g. Engineering, Sales, Operations, Marketing)"
                >
                  <Input
                    id="question-options-input"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    placeholder="Option A, Option B, Option C"
                    required
                  />
                </Field>
              )}

              {/* Required Toggle */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="question-required-toggle"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
                />
                <label
                  htmlFor="question-required-toggle"
                  className="text-xs font-medium text-foreground cursor-pointer select-none"
                >
                  Mark as required for employees during onboarding
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createQuestion.isPending || updateQuestion.isPending}
                >
                  {createQuestion.isPending || updateQuestion.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : modalMode === 'create' ? (
                    'Add Question'
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  );
}
