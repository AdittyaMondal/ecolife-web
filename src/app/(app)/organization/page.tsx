'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { OrgAnalytics } from '@/components/blocks/organization/org-analytics';
import { OrgEditDialog } from '@/components/blocks/organization/org-edit-dialog';
import { OrgEnrollment } from '@/components/blocks/organization/org-enrollment';
import { OrgHeader } from '@/components/blocks/organization/org-header';
import { OrgRoster } from '@/components/blocks/organization/org-roster';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { meQuery } from '@/hooks/use-auth';
import { myOrganizationQuery, orgMembersQuery } from '@/hooks/use-organization';

function OrganizationSkeletons() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Header Skeleton */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-xs" />
            <Skeleton className="h-6 w-20 rounded-xs" />
          </div>
          <Skeleton className="h-9 w-24 rounded-sm" />
        </div>
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 sm:size-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64 rounded-sm" />
            <Skeleton className="h-4 w-96 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-sm" />
      </Card>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-3">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-9 w-20 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-xs" />
        </Card>
        <Card className="p-5 space-y-3">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-9 w-24 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-xs" />
        </Card>
        <Card className="p-5 space-y-3">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-9 w-20 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-xs" />
        </Card>
        <Card className="p-5 space-y-3">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-9 w-24 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-xs" />
        </Card>
      </div>

      {/* Roster Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48 rounded-sm" />
          <Skeleton className="h-9 w-60 rounded-sm" />
        </div>
        <div className="space-y-3 pt-2">
          <Skeleton className="h-16 w-full rounded-sm" />
          <Skeleton className="h-16 w-full rounded-sm" />
          <Skeleton className="h-16 w-full rounded-sm" />
        </div>
      </Card>
    </div>
  );
}

export default function OrganizationPage() {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const { data: me } = useQuery(meQuery());
  const { data: myOrgData, isLoading: isOrgLoading } = useQuery(myOrganizationQuery());

  const org = myOrgData?.organization ?? null;
  const role = myOrgData?.role ?? 'member';

  // Automatically navigate to dedicated portal if enrolled
  React.useEffect(() => {
    if (!org) return;
    if (org.type === 'industry') {
      router.replace('/organization/corporate');
    } else if (org.type === 'ngo') {
      router.replace('/organization/community');
    } else if (org.type === 'seller') {
      router.replace('/marketplace/seller');
    }
  }, [org, router]);

  const { data: membersData } = useQuery({
    ...orgMembersQuery(org?.id ?? 0),
    enabled: Boolean(org?.id),
  });

  if (isOrgLoading) {
    return <OrganizationSkeletons />;
  }

  // User is not enrolled in an organization yet
  if (!org) {
    return <OrgEnrollment />;
  }

  const members = membersData?.items ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Organization Header & Branding */}
      <OrgHeader
        organization={org}
        role={role}
        isAdmin={me?.role === 'admin'}
        onEditClick={role === 'owner' ? () => setEditDialogOpen(true) : undefined}
      />

      {/* Cumulative Workforce Impact Analytics */}
      <OrgAnalytics organization={org} members={members} />

      {/* Employee / Member Directory & Roster */}
      <OrgRoster organization={org} members={members} currentUserId={me?.id} userRole={role} />

      {/* Owner Edit Dialog */}
      {role === 'owner' && (
        <OrgEditDialog
          organization={org}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
    </div>
  );
}
