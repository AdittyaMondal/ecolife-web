'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Loader2,
  LogOut,
  RefreshCw,
  Shield,
  UserCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, ModalDialog } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { meQuery } from '@/hooks/use-auth';
import {
  orgLookupQuery,
  useJoinOrganization,
  useLeaveOrganization,
  useUpdateMembershipPreferences,
} from '@/hooks/use-organization';
import { cn } from '@/lib/utils';

export function OrganizationMembershipCard() {
  const me = useQuery(meQuery());
  const leaveOrg = useLeaveOrganization();
  const joinOrg = useJoinOrganization();
  const updatePrivacy = useUpdateMembershipPreferences();

  const [copied, setCopied] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [changeModalOpen, setChangeModalOpen] = React.useState(false);
  const [shareConsent, setShareConsent] = React.useState(true);

  // Join / Change code inputs
  const [inputCode, setInputCode] = React.useState('');
  const [changeCode, setChangeCode] = React.useState('');

  const cleanInputCode = inputCode.trim();
  const isInputSixDigits = /^\d{6}$/.test(cleanInputCode);
  const inputLookup = useQuery(orgLookupQuery(cleanInputCode));

  const cleanChangeCode = changeCode.trim();
  const isChangeSixDigits = /^\d{6}$/.test(cleanChangeCode);
  const changeLookup = useQuery(orgLookupQuery(cleanChangeCode));

  if (me.isPending) {
    return <Skeleton className="h-44 w-full rounded-lg" />;
  }

  const user = me.data;
  const org = user?.organization;

  const handleCopyCode = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success('Organization code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy code to clipboard.');
    }
  };

  const handleToggleShareConsent = (checked: boolean) => {
    setShareConsent(checked);
    updatePrivacy.mutate(
      { shareFootprint: checked },
      {
        onSuccess: () => {
          toast.success(
            checked
              ? 'Carbon footprint sharing with organization admins enabled.'
              : 'Carbon footprint sharing disabled (private mode on team roster).',
          );
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Could not update sharing preferences.');
          setShareConsent(!checked);
        },
      },
    );
  };

  const handleLeaveConfirm = () => {
    leaveOrg.mutate(undefined, {
      onSuccess: () => {
        toast.success(`You have left ${org?.name ?? 'your organization'}.`);
        setLeaveDialogOpen(false);
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(
          apiErr?.message ||
            'Could not leave organization. If you are the sole owner, designate another owner first.',
        );
        setLeaveDialogOpen(false);
      },
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputSixDigits || !inputLookup.data?.valid) return;

    joinOrg.mutate(
      { code: cleanInputCode },
      {
        onSuccess: (res) => {
          toast.success(`Successfully joined ${res.organization.name}!`);
          setInputCode('');
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'Could not join organization.');
        },
      },
    );
  };

  const handleChangeConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChangeSixDigits || !changeLookup.data?.valid) return;

    if (org?.role === 'owner') {
      toast.error(
        'You are currently the owner of an organization. Transfer ownership or remove your organization before switching.',
      );
      return;
    }

    try {
      // Step 1: Leave current organization
      await leaveOrg.mutateAsync();
      // Step 2: Join new organization
      const res = await joinOrg.mutateAsync({ code: cleanChangeCode });
      toast.success(`Changed organization to ${res.organization.name}!`);
      setChangeCode('');
      setChangeModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      toast.error(apiErr?.message || 'Could not change organization.');
    }
  };

  const partnerPortalPath =
    org?.type === 'industry'
      ? '/organization/corporate'
      : org?.type === 'ngo'
        ? '/organization/community'
        : '/marketplace/seller';

  const typeLabel =
    org?.type === 'industry'
      ? 'Corporate Partner'
      : org?.type === 'ngo'
        ? 'Community Partner'
        : 'Marketplace Partner';

  return (
    <>
      <Card className="p-6 space-y-5 border-border shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Organization Membership</h2>
              <p className="text-xs text-muted-foreground">
                Connect your account to your company or community partner on EcoLife.
              </p>
            </div>
          </div>

          {org && (
            <Badge
              variant={org.role === 'owner' ? 'primary' : 'neutral'}
              className="gap-1.5 self-start sm:self-auto"
            >
              {org.role === 'owner' ? (
                <>
                  <Crown className="size-3.5 text-yellow-300" aria-hidden="true" />
                  <span>Owner</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" aria-hidden="true" />
                  <span>Member</span>
                </>
              )}
            </Badge>
          )}
        </div>

        {/* State A: User belongs to an Organization */}
        {org ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{org.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your footprint data contributes towards this organization&apos;s sustainability
                    metrics and team goals.
                  </p>
                </div>

                <Link
                  href={partnerPortalPath}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'gap-1.5 text-xs self-start sm:self-auto font-semibold',
                  )}
                >
                  <span>Open Portal</span>
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </Link>
              </div>

              {/* 6-Digit Org Code display */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Organization Code:</span>
                  <code className="font-mono text-xs font-black bg-card border border-border px-2 py-0.5 rounded tracking-wider text-primary select-all">
                    {org.code || org.slug}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(org.code || org.slug)}
                    className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="size-3 text-positive" aria-hidden="true" />
                    ) : (
                      <Copy className="size-3" aria-hidden="true" />
                    )}
                  </Button>
                </div>

                {/* Status Indicator */}
                <span className="text-muted-foreground">
                  Status:{' '}
                  <strong
                    className={cn(
                      'capitalize',
                      org.status === 'approved' ? 'text-positive' : 'text-warning',
                    )}
                  >
                    {org.status}
                  </strong>
                </span>
              </div>

              {/* Privacy & Data Sharing Consent (Requirement 13) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Shield className="size-3.5 text-primary" aria-hidden="true" />
                    <span>Data Sharing &amp; Privacy Consent</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Share your personal footprint and trend with organization admins on the team
                    roster. When disabled, your data remains anonymous in collective totals.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 font-medium">
                  <input
                    type="checkbox"
                    checked={shareConsent}
                    onChange={(e) => handleToggleShareConsent(e.target.checked)}
                    disabled={updatePrivacy.isPending}
                    className="size-4 rounded-xs border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-xs text-foreground">
                    {shareConsent ? 'Sharing Enabled' : 'Private Mode'}
                  </span>
                </label>
              </div>
            </div>

            {/* Leave / Change actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChangeModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                <span>Change Organization</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaveDialogOpen(true)}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                <span>Leave Organization</span>
              </Button>
            </div>
          </div>
        ) : (
          /* State B: User does NOT belong to an Organization */
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-border p-4 sm:p-5 bg-muted/20 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Join a Team or Partner Organization
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter the 6-digit organization code provided by your employer, school, or
                  community NGO.
                </p>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="e.g. 482910"
                      className="font-mono tracking-widest uppercase pr-10"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {inputLookup.isFetching && (
                        <Loader2
                          className="size-4 animate-spin text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      {!inputLookup.isFetching && isInputSixDigits && inputLookup.data?.valid && (
                        <CheckCircle2 className="size-4 text-positive" aria-hidden="true" />
                      )}
                      {!inputLookup.isFetching && isInputSixDigits && inputLookup.isError && (
                        <XCircle className="size-4 text-destructive" aria-hidden="true" />
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!isInputSixDigits || !inputLookup.data?.valid || joinOrg.isPending}
                    loading={joinOrg.isPending}
                    className="shrink-0"
                  >
                    Join Team
                  </Button>
                </div>

                {/* Validation Feedback */}
                {cleanInputCode.length > 0 && !isInputSixDigits && (
                  <p className="text-xs text-muted-foreground">Code must be exactly 6 digits.</p>
                )}

                {isInputSixDigits && inputLookup.isError && (
                  <p className="text-xs text-destructive">
                    {(inputLookup.error as { message?: string })?.message ||
                      'No approved organization found with this 6-digit code.'}
                  </p>
                )}

                {isInputSixDigits && inputLookup.data?.valid && (
                  <div className="flex items-center gap-2 rounded-xs border border-positive/30 bg-positive/5 px-2.5 py-1.5 text-xs text-positive font-medium max-w-md">
                    <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      Ready to join: <strong>{inputLookup.data.name}</strong> (
                      {inputLookup.data.type === 'industry'
                        ? 'Corporate'
                        : inputLookup.data.type === 'ngo'
                          ? 'Community'
                          : 'Marketplace'}{' '}
                      Partner)
                    </span>
                  </div>
                )}
              </form>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Are you an organization representative?</span>
              <Link href="/partner-register" className="font-semibold text-primary hover:underline">
                Register as a Partner Organization &rarr;
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Leave Organization Dialog */}
      {org && (
        <ConfirmDialog
          open={leaveDialogOpen}
          onClose={() => setLeaveDialogOpen(false)}
          onConfirm={handleLeaveConfirm}
          title={`Leave ${org.name}?`}
          description="Are you sure you want to leave this organization? Your personal daily logs, streak, and EcoCoins will remain yours, but you will no longer appear on the team roster or contribute to its collective carbon footprint."
          confirmText="Leave Organization"
          confirmVariant="destructive"
          loading={leaveOrg.isPending}
        />
      )}

      {/* Change Organization Modal */}
      {org && (
        <ModalDialog
          open={changeModalOpen}
          onClose={() => setChangeModalOpen(false)}
          title="Change Organization"
          description={`Switch from ${org.name} to another partner organization.`}
          size="sm"
        >
          <form onSubmit={handleChangeConfirm} className="space-y-4">
            <Field
              id="change-org-code"
              label="New 6-digit Organization Code"
              hint="Enter the code for the new organization you want to join."
              error={
                cleanChangeCode.length > 0 && !isChangeSixDigits
                  ? 'Code must be exactly 6 digits.'
                  : changeLookup.isError
                    ? (changeLookup.error as { message?: string })?.message ||
                      'No approved organization found with this code.'
                    : undefined
              }
            >
              <div className="relative">
                <Input
                  id="change-org-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 719302"
                  className="font-mono tracking-widest uppercase pr-10"
                  value={changeCode}
                  onChange={(e) => setChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {changeLookup.isFetching && (
                    <Loader2
                      className="size-4 animate-spin text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  {!changeLookup.isFetching && isChangeSixDigits && changeLookup.data?.valid && (
                    <CheckCircle2 className="size-4 text-positive" aria-hidden="true" />
                  )}
                  {!changeLookup.isFetching && isChangeSixDigits && changeLookup.isError && (
                    <XCircle className="size-4 text-destructive" aria-hidden="true" />
                  )}
                </div>
              </div>

              {isChangeSixDigits && changeLookup.data?.valid && (
                <div className="mt-2 flex items-center gap-2 rounded-xs border border-positive/30 bg-positive/5 px-2.5 py-1.5 text-xs text-positive font-medium">
                  <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    New Organization: <strong>{changeLookup.data.name}</strong> (
                    {changeLookup.data.type === 'industry'
                      ? 'Corporate'
                      : changeLookup.data.type === 'ngo'
                        ? 'Community'
                        : 'Marketplace'}{' '}
                    Partner)
                  </span>
                </div>
              )}
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setChangeModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  !isChangeSixDigits ||
                  !changeLookup.data?.valid ||
                  joinOrg.isPending ||
                  leaveOrg.isPending
                }
                loading={joinOrg.isPending || leaveOrg.isPending}
              >
                Confirm Switch
              </Button>
            </div>
          </form>
        </ModalDialog>
      )}
    </>
  );
}
