'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Building2,
  Calendar,
  FileSpreadsheet,
  HelpCircle,
  Plus,
  ShieldCheck,
  TrendingDown,
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { meQuery } from '@/hooks/use-auth';
import { orgMembersQuery } from '@/hooks/use-organization';
import type { Organization } from '@/types/api';

function CorporatePortalView({
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
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Building2 className="size-3.5" />
              Corporate Partner
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">Enterprise ESG Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
            Corporate Portal
          </h1>
        </div>

        {/* Action Buttons for Corporate Owners */}
        {role === 'owner' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Link
              href="/events/new"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5' })}
            >
              <Calendar className="size-3.5" />
              <span>Host Corporate Drive</span>
            </Link>
          </div>
        )}
      </div>

      {/* Header & Verification Branding */}
      <OrgHeader
        organization={organization}
        role={role}
        isAdmin={me?.role === 'admin'}
        onEditClick={role === 'owner' ? () => setEditDialogOpen(true) : undefined}
      />

      {/* Cumulative Workforce ESG Impact */}
      <OrgAnalytics organization={organization} members={members} isOwner={role === 'owner'} />

      {/* Employee Workforce Directory */}
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

export default function CorporatePortalPage() {
  return (
    <PartnerPortalGuard
      expectedType="industry"
      portalTitle="Corporate Portal"
      partnerLabel="Corporate Partner"
    >
      {(props) => <CorporatePortalView {...props} />}
    </PartnerPortalGuard>
  );
}
