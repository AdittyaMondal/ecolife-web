'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { meQuery } from '@/hooks/use-auth';
import { myOrganizationQuery } from '@/hooks/use-organization';
import type { Organization } from '@/types/api';
import { OrgEnrollment } from './org-enrollment';

interface PartnerPortalGuardProps {
  expectedType: 'industry' | 'ngo' | 'seller';
  portalTitle: string;
  partnerLabel: string;
  children: (props: {
    organization: Organization;
    role: 'owner' | 'member';
    isApproved: boolean;
  }) => React.ReactNode;
}

export function PartnerPortalGuard({
  expectedType,
  portalTitle,
  partnerLabel,
  children,
}: PartnerPortalGuardProps) {
  const router = useRouter();
  const { data: me, isLoading: isMeLoading } = useQuery(meQuery());
  const { data: myOrgData, isLoading: isOrgLoading } = useQuery(myOrganizationQuery());

  const org = myOrgData?.organization ?? null;
  const role = myOrgData?.role ?? 'member';

  if (isMeLoading || isOrgLoading) {
    return (
      <div className="space-y-6 animate-pulse" aria-hidden="true">
        <Card className="p-6 sm:p-8 space-y-4">
          <Skeleton className="h-8 w-64 rounded-sm" />
          <Skeleton className="h-4 w-96 rounded-sm" />
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>
    );
  }

  // Not logged in or no organization attached
  if (!org) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-border/80 bg-muted/20 text-center space-y-3">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
            <Building2 className="size-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{portalTitle} Access</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You are not currently enrolled in a {partnerLabel} workspace. Register your organization
            or join with a code below.
          </p>
        </Card>
        <OrgEnrollment />
      </div>
    );
  }

  // Organization type mismatch
  if (org.type !== expectedType) {
    const correctPath =
      org.type === 'industry'
        ? '/organization/corporate'
        : org.type === 'ngo'
          ? '/organization/community'
          : '/marketplace/seller';

    const correctLabel =
      org.type === 'industry'
        ? 'Corporate Portal'
        : org.type === 'ngo'
          ? 'Community Portal'
          : 'Seller Portal';

    return (
      <Card className="p-8 text-center max-w-xl mx-auto space-y-4 border-warning/30 bg-warning/5">
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-warning/20 text-warning mx-auto">
          <AlertTriangle className="size-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Portal Mismatch</h2>
        <p className="text-sm text-muted-foreground">
          You are currently signed in as a member of <strong>{org.name}</strong>, which is
          registered as an <strong>{org.type.toUpperCase()}</strong> partner.
        </p>
        <div className="pt-2">
          <Link href={correctPath} className={buttonVariants({ variant: 'primary' })}>
            Go to your {correctLabel}
          </Link>
        </div>
      </Card>
    );
  }

  const isApproved = org.status === 'approved';
  const isPending = org.status === 'pending';
  const isRejected = org.status === 'rejected';
  const isSuspended = org.status === 'suspended';

  return (
    <div className="space-y-6">
      {/* Pending Banner */}
      {isPending && (
        <Card className="p-5 border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3.5">
            <Clock className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold tracking-tight">
                Partner Application Awaiting Review
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                Your <strong>{partnerLabel}</strong> workspace for <strong>{org.name}</strong> is
                pending review by an EcoLife platform administrator. You may browse and preview
                dashboard modules, but public event hosting and live marketplace operations remain
                locked until approved.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <Card className="p-5 border-destructive/40 bg-destructive/10 text-destructive">
          <div className="flex items-start gap-3.5">
            <XCircle className="size-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold tracking-tight">Partner Application Rejected</h3>
              <p className="text-xs leading-relaxed opacity-90">
                Unfortunately, your application for <strong>{org.name}</strong> could not be
                approved at this time. Please contact support@ecolife.app or re-apply with valid
                verification documents.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Suspended Banner */}
      {isSuspended && (
        <Card className="p-5 border-destructive/40 bg-destructive/10 text-destructive">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="size-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold tracking-tight">Partner Workspace Suspended</h3>
              <p className="text-xs leading-relaxed opacity-90">
                This organization is currently suspended due to policy or verification flags. Please
                contact the EcoLife administrative team for assistance.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Portal View */}
      {children({ organization: org, role, isApproved })}
    </div>
  );
}
