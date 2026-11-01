'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  HeartHandshake,
  MapPin,
  Plus,
  Share2,
  Sparkles,
  Trees,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { OrgAnalytics } from '@/components/blocks/organization/org-analytics';
import { OrgEditDialog } from '@/components/blocks/organization/org-edit-dialog';
import { OrgHeader } from '@/components/blocks/organization/org-header';
import { OrgQuestionBuilder } from '@/components/blocks/organization/org-question-builder';
import { OrgRoster } from '@/components/blocks/organization/org-roster';
import { PartnerPortalGuard } from '@/components/blocks/organization/partner-portal-guard';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { meQuery } from '@/hooks/use-auth';
import { orgMembersQuery } from '@/hooks/use-organization';
import type { Organization } from '@/types/api';

function CommunityPortalView({
  organization,
  role,
  isApproved,
}: {
  organization: Organization;
  role: 'owner' | 'member';
  isApproved: boolean;
}) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const { data: me } = useQuery(meQuery());

  const { data: membersData } = useQuery({
    ...orgMembersQuery(organization.id),
    enabled: Boolean(organization.id),
  });

  const members = membersData?.items ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-positive">
              <HeartHandshake className="size-3.5" />
              Community Partner
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              Non-Profit &amp; Grassroots Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
            Community Portal
          </h1>
        </div>

        {/* Quick Action Button for NGO Organizers */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <Link
            href="/events/new"
            className={buttonVariants({ variant: 'primary', size: 'sm', className: 'gap-1.5' })}
          >
            <Trees className="size-3.5" />
            <span>Organize Community Drive</span>
          </Link>
        </div>
      </div>

      {/* Header & Verification Branding */}
      <OrgHeader
        organization={organization}
        role={role}
        isAdmin={me?.role === 'admin'}
        onEditClick={role === 'owner' ? () => setEditDialogOpen(true) : undefined}
      />

      {/* Community Drives Card */}
      <Card className="p-6 border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trees className="size-5 text-positive" />
              <span>Community Environmental Drives</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Local clean-ups, tree plantations, and awareness workshops hosted by{' '}
              {organization.name}.
            </p>
          </div>
          <Link href="/events" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Browse All Events
          </Link>
        </div>

        <div className="rounded-sm border border-dashed border-border p-6 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Mobilize community volunteers in {organization.city || 'your region'}
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Create an event, manage attendee capacity, and scan QR passes on-site to award EcoPoints
            &amp; Coins.
          </p>
          <div className="pt-2">
            <Link
              href="/events/new"
              className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'gap-1.5' })}
            >
              <Plus className="size-3.5" />
              <span>Host New Drive</span>
            </Link>
          </div>
        </div>
      </Card>

      {/* Cumulative Team Impact */}
      <OrgAnalytics organization={organization} members={members} isOwner={role === 'owner'} />

      {/* Volunteer & Member Roster */}
      <OrgRoster
        organization={organization}
        members={members}
        currentUserId={me?.id}
        userRole={role}
      />

      {/* Custom Onboarding Questions Builder (Part 4) */}
      <OrgQuestionBuilder organization={organization} isOwner={role === 'owner'} />

      {/* Owner Edit Dialog */}
      {role === 'owner' && (
        <OrgEditDialog
          organization={organization}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
    </div>
  );
}

export default function CommunityPortalPage() {
  return (
    <PartnerPortalGuard
      expectedType="ngo"
      portalTitle="Community Portal"
      partnerLabel="Community Partner"
    >
      {(props) => <CommunityPortalView {...props} />}
    </PartnerPortalGuard>
  );
}
