'use client';

import {
  AlertTriangle,
  Building2,
  Check,
  Clock,
  Copy,
  Crown,
  Edit3,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useLeaveOrganization, useRegenerateOrgCode } from '@/hooks/use-organization';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Organization } from '@/types/api';

export interface OrgHeaderProps {
  organization: Organization;
  role: 'owner' | 'member';
  isAdmin?: boolean;
  onEditClick?: () => void;
}

export function OrgHeader({ organization, role, isAdmin, onEditClick }: OrgHeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const [regenDialogOpen, setRegenDialogOpen] = React.useState(false);
  const leaveOrg = useLeaveOrganization();
  const regenCode = useRegenerateOrgCode();

  const activeCode = organization.code || organization.slug;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      toast.success('Organization code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy code to clipboard.');
    }
  };

  const handleRegenerateConfirm = () => {
    regenCode.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(`Organization code regenerated: ${res.code}`);
        setRegenDialogOpen(false);
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(apiErr?.message || 'Could not regenerate code.');
        setRegenDialogOpen(false);
      },
    });
  };

  const handleLeaveConfirm = () => {
    leaveOrg.mutate(undefined, {
      onSuccess: () => {
        toast.success(`You have left ${organization.name}.`);
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

  const isOwner = role === 'owner';

  const typeLabel =
    organization.type === 'industry'
      ? 'Corporate / Enterprise'
      : organization.type === 'ngo'
        ? 'Non-Profit / NGO'
        : 'Sustainable Merchant';

  return (
    <>
      <Card className="p-6 sm:p-8 space-y-6 border-border shadow-subtle bg-card">
        {/* Top Bar with Badges & Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 font-semibold">
              <Building2 className="size-3.5" aria-hidden="true" />
              <span>{typeLabel}</span>
            </Badge>

            {/* Status Badge */}
            {organization.status === 'approved' && (
              <Badge variant="positive" className="gap-1.5">
                <ShieldCheck className="size-3.5 text-positive" aria-hidden="true" />
                <span>Verified &amp; Active</span>
              </Badge>
            )}
            {organization.status === 'pending' && (
              <Badge variant="warning" className="gap-1.5">
                <Clock className="size-3.5 text-warning" aria-hidden="true" />
                <span>Pending Review</span>
              </Badge>
            )}
            {organization.status === 'rejected' && (
              <Badge variant="danger" className="gap-1.5">
                <ShieldAlert className="size-3.5" aria-hidden="true" />
                <span>Application Rejected</span>
              </Badge>
            )}
            {organization.status === 'suspended' && (
              <Badge variant="danger" className="gap-1.5">
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                <span>Suspended</span>
              </Badge>
            )}

            {/* User's Role */}
            <Badge variant={isOwner ? 'primary' : 'neutral'} className="gap-1.5">
              {isOwner ? (
                <>
                  <Crown className="size-3.5 text-yellow-300" aria-hidden="true" />
                  <span>You are Owner</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" aria-hidden="true" />
                  <span>You are Member</span>
                </>
              )}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isOwner && onEditClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="gap-1.5 text-xs font-semibold"
              >
                <Edit3 className="size-3.5" aria-hidden="true" />
                <span>Edit Info</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveDialogOpen(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              <span>Leave</span>
            </Button>
          </div>
        </div>

        {/* Identity & Details Section */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Logo / Initials avatar */}
          <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/30 border border-border text-foreground font-extrabold text-2xl sm:text-3xl shadow-inner">
            {organization.logoUrl ? (
              // biome-ignore lint/performance/noImgElement: dynamic logo URL
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="size-full object-cover rounded-lg"
              />
            ) : (
              initials(organization.name)
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {organization.name}
              </h1>
              {organization.description && (
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {organization.description}
                </p>
              )}
            </div>

            {/* Quick Metadata chips: Website, Contact, Location */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
              {organization.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                  <span>
                    {organization.city}
                    {organization.regionCode ? `, ${organization.regionCode}` : ''}
                  </span>
                </span>
              )}
              {organization.websiteUrl && (
                <a
                  href={organization.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-positive hover:underline"
                >
                  <Globe className="size-3.5" aria-hidden="true" />
                  <span>Website</span>
                </a>
              )}
              {organization.contactEmail && (
                <a
                  href={`mailto:${organization.contactEmail}`}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  <span>{organization.contactEmail}</span>
                </a>
              )}
              {organization.contactPhone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden="true" />
                  <span>{organization.contactPhone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shareable 6-digit Code Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:px-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-foreground">Organization Join Code</p>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                6-digit code
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Employees and colleagues enter this 6-digit code during registration or in profile
              settings to link to your organization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="font-mono text-base font-black bg-card border border-border px-3 py-1 rounded-md text-primary tracking-widest select-all">
              {activeCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="gap-1.5 text-xs shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-positive" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRegenDialogOpen(true)}
                className="gap-1.5 text-xs shrink-0 hover:text-warning hover:border-warning/40"
                title="Generate a new 6-digit code"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                <span>Regenerate</span>
              </Button>
            )}
          </div>
        </div>

        {/* Pending Approval Notice */}
        {organization.status === 'pending' && (
          <div className="rounded-sm border border-warning/40 bg-warning-surface p-4 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Clock className="size-4 text-warning" aria-hidden="true" />
                <span>Registration Under Review</span>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ variant: 'secondary', size: 'sm' }),
                    'text-xs h-7 self-start sm:self-auto',
                  )}
                >
                  Review in Admin Panel →
                </Link>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your organization registration is currently being verified by the EcoLife review team.
              Once approved, members will be able to join via your organization slug, and full ESG
              reporting exports will be unlocked.
            </p>
          </div>
        )}

        {/* Rejection Note */}
        {organization.status === 'rejected' && organization.reviewNote && (
          <div className="rounded-sm border border-destructive/40 bg-danger-surface p-4 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-destructive">
              <ShieldAlert className="size-4" aria-hidden="true" />
              <span>Review Feedback</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Reason: {organization.reviewNote}
            </p>
          </div>
        )}
      </Card>

      {/* Leave Organization Dialog */}
      <ConfirmDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={handleLeaveConfirm}
        title={`Leave ${organization.name}?`}
        description="Are you sure you want to leave this organization? Your individual points and daily logs will remain yours, but you will no longer appear on the team roster or contribute to its cumulative metrics."
        confirmText="Leave Organization"
        confirmVariant="destructive"
        loading={leaveOrg.isPending}
      />

      {/* Regenerate Organization Code Dialog */}
      <ConfirmDialog
        open={regenDialogOpen}
        onClose={() => setRegenDialogOpen(false)}
        onConfirm={handleRegenerateConfirm}
        title="Regenerate Organization Code?"
        description="This will invalidate the current 6-digit code immediately. New employees must use the newly generated code to link during signup or in settings. Existing members remain unaffected."
        confirmText="Regenerate Code"
        confirmVariant="primary"
        loading={regenCode.isPending}
      />
    </>
  );
}
