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
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useLeaveOrganization } from '@/hooks/use-organization';
import { initials } from '@/lib/format';
import type { Organization } from '@/types/api';

export interface OrgHeaderProps {
  organization: Organization;
  role: 'owner' | 'member';
  onEditClick?: () => void;
}

export function OrgHeader({ organization, role, onEditClick }: OrgHeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = React.useState(false);
  const leaveOrg = useLeaveOrganization();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(organization.slug);
      setCopied(true);
      toast.success('Organization code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy code to clipboard.');
    }
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

        {/* Shareable Code / Slug Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm border border-secondary/30 bg-muted/50 p-3 sm:px-4">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">Organization Join Code / Slug</p>
            <p className="text-xs text-muted-foreground">
              Share this code with your employees and colleagues so they can enroll into your team
              portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="font-mono text-sm font-bold bg-card border border-border px-3 py-1.5 rounded-xs text-primary tracking-wide">
              {organization.slug}
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
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pending Approval Notice */}
        {organization.status === 'pending' && (
          <div className="rounded-sm border border-warning/40 bg-warning-surface p-4 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Clock className="size-4 text-warning" aria-hidden="true" />
              <span>Registration Under Review</span>
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
    </>
  );
}
