'use client';

import {
  Award,
  CheckCircle2,
  Clock,
  Crown,
  FileQuestion,
  Filter,
  Flame,
  Search,
  Shield,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, ModalDialog } from '@/components/ui/dialog';
import { Input, Select } from '@/components/ui/input';
import { useAddOrgMember, useRemoveOrgMember } from '@/hooks/use-organization';
import { formatDate, formatKg, formatNumber, initials } from '@/lib/format';
import type { Organization, OrganizationMember } from '@/types/api';
import { OrgMemberAnswersDialog } from './org-member-answers-dialog';

export interface OrgRosterProps {
  organization: Organization;
  members: OrganizationMember[];
  currentUserId?: number;
  userRole: 'owner' | 'member';
}

export function OrgRoster({ organization, members, currentUserId, userRole }: OrgRosterProps) {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'owner' | 'member'>('all');
  const [onboardingFilter, setOnboardingFilter] = React.useState<'all' | 'completed' | 'pending'>(
    'all',
  );
  const [privacyFilter, setPrivacyFilter] = React.useState<'all' | 'sharing' | 'private'>('all');

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'owner' | 'member'>('member');
  const [memberToRemove, setMemberToRemove] = React.useState<OrganizationMember | null>(null);
  const [selectedMemberForAnswers, setSelectedMemberForAnswers] =
    React.useState<OrganizationMember | null>(null);

  const addMember = useAddOrgMember(organization.id);
  const removeMember = useRemoveOrgMember(organization.id);

  const isOwner = userRole === 'owner';
  const isApproved = organization.status === 'approved';

  // Filter members by search, role, onboarding, and privacy
  const filteredMembers = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return members.filter((m) => {
      // 1. Search filter
      const name = m.user.name?.toLowerCase() || '';
      const email = (m as OrganizationMember & { email?: string }).email?.toLowerCase() || '';
      const matchesSearch = !q || name.includes(q) || email.includes(q);
      if (!matchesSearch) return false;

      // 2. Role filter
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;

      // 3. Onboarding filter
      if (onboardingFilter !== 'all') {
        const status =
          (m as OrganizationMember & { onboardingStatus?: 'completed' | 'pending' })
            .onboardingStatus ?? (m.baselineTotalKg != null ? 'completed' : 'pending');
        if (status !== onboardingFilter) return false;
      }

      // 4. Privacy sharing filter
      if (privacyFilter !== 'all') {
        const isSharing =
          (m as OrganizationMember & { shareFootprint?: boolean }).shareFootprint !== false;
        if (privacyFilter === 'sharing' && !isSharing) return false;
        if (privacyFilter === 'private' && isSharing) return false;
      }

      return true;
    });
  }, [members, search, roleFilter, onboardingFilter, privacyFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }

    addMember.mutate(
      { email: cleanEmail, role: inviteRole },
      {
        onSuccess: () => {
          toast.success(`Added ${cleanEmail} to ${organization.name}!`);
          setInviteEmail('');
          setInviteRole('member');
          setAddModalOpen(false);
        },
        onError: (err: unknown) => {
          const apiErr = err as { message?: string };
          toast.error(
            apiErr?.message ||
              'Could not add member. Ensure the user has an existing EcoLife account.',
          );
        },
      },
    );
  };

  const handleRemoveConfirm = () => {
    if (!memberToRemove) return;
    removeMember.mutate(memberToRemove.user.id, {
      onSuccess: () => {
        toast.success(`Removed ${memberToRemove.user.name} from ${organization.name}.`);
        setMemberToRemove(null);
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(apiErr?.message || 'Could not remove member.');
        setMemberToRemove(null);
      },
    });
  };

  return (
    <>
      <Card className="p-6 sm:p-7 border-border bg-card shadow-subtle space-y-6">
        {/* Header with Search and Add Member Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-5 text-primary" aria-hidden="true" />
              <span>Employee &amp; Member Roster</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {filteredMembers.length} of {members.length} enrolled member
              {members.length === 1 ? '' : 's'} displayed
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isOwner && isApproved && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="gap-1.5 text-xs shrink-0"
              >
                <UserPlus className="size-3.5" aria-hidden="true" />
                <span>Add Member</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Multi-Filter Control Bar (Requirement 12) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search employee or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'owner' | 'member')}
            className="h-9 text-xs"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners Only</option>
            <option value="member">Members Only</option>
          </Select>

          {/* Onboarding Status Filter */}
          <Select
            value={onboardingFilter}
            onChange={(e) => setOnboardingFilter(e.target.value as 'all' | 'completed' | 'pending')}
            className="h-9 text-xs"
          >
            <option value="all">All Onboarding Statuses</option>
            <option value="completed">Completed Baseline</option>
            <option value="pending">Pending Setup</option>
          </Select>

          {/* Privacy Sharing Filter */}
          <Select
            value={privacyFilter}
            onChange={(e) => setPrivacyFilter(e.target.value as 'all' | 'sharing' | 'private')}
            className="h-9 text-xs"
          >
            <option value="all">All Privacy Consents</option>
            <option value="sharing">Sharing Footprint</option>
            <option value="private">Private (Not Consented)</option>
          </Select>
        </div>

        {/* Member List Cards / Table */}
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No members found</p>
              <p className="text-xs text-muted-foreground">
                {search ||
                roleFilter !== 'all' ||
                onboardingFilter !== 'all' ||
                privacyFilter !== 'all'
                  ? 'No members match the selected filters. Clear or adjust your filters.'
                  : 'No colleagues have joined yet. Share your 6-digit organization code above!'}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const m = member as OrganizationMember & {
                email?: string;
                onboardingStatus?: 'completed' | 'pending';
                currentStreak?: number;
                last30DaysTotalKg?: number | null;
                avgDailyKg?: number | null;
                reductionPct?: number | null;
                lastActiveAt?: string | null;
              };

              const isMemberOwner = member.role === 'owner';
              const isCurrentUser = currentUserId === member.user.id;
              const isOnboarded =
                m.onboardingStatus === 'completed' || member.baselineTotalKg != null;
              const isSharingFootprint = m.shareFootprint !== false;

              return (
                <div
                  key={member.user.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 transition hover:bg-muted/40"
                >
                  {/* Left: Avatar + Identity + Onboarding Status */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground border border-border">
                      {member.user.avatarUrl ? (
                        // biome-ignore lint/performance/noImgElement: dynamic user avatar
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.name}
                          className="size-full rounded-lg object-cover"
                        />
                      ) : (
                        initials(member.user.name)
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">
                          {member.user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-xs bg-primary/20 text-primary text-[10px] font-semibold px-1.5 py-0.5">
                            You
                          </span>
                        )}
                        <Badge
                          variant={isMemberOwner ? 'primary' : 'neutral'}
                          className="text-[10px] h-5 gap-1"
                        >
                          {isMemberOwner ? (
                            <>
                              <Crown className="size-3 text-yellow-300" aria-hidden="true" />
                              <span>Owner</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3" aria-hidden="true" />
                              <span>Member</span>
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {m.email && <span className="truncate">{m.email}</span>}
                        {member.user.city && <span>· {member.user.city}</span>}
                        <span>· Joined {formatDate(member.joinedAt)}</span>

                        {/* Onboarding Status Badge (Requirement 12) */}
                        {isOnboarded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-positive font-medium">
                            <CheckCircle2 className="size-3 text-positive" />
                            <span>Onboarded</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                            <Clock className="size-3 text-amber-500" />
                            <span>Setup Pending</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Per-User Insights (Footprint, Trend, Activity, Privacy) (Requirement 12 & 13) */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-border/40 lg:border-t-0">
                    {/* Privacy & Footprint Insights */}
                    <div className="flex items-center gap-2.5">
                      {!isSharingFootprint ? (
                        /* Respect Privacy: Not Consented */
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted border border-border px-2.5 py-1 text-xs text-muted-foreground font-medium"
                          title="User has opted out of sharing individual footprint data with organization admins"
                        >
                          <Shield className="size-3 text-muted-foreground" aria-hidden="true" />
                          <span>Private Footprint</span>
                        </span>
                      ) : (
                        /* Consented Insights */
                        <div className="flex items-center gap-2 text-xs">
                          {/* Baseline Footprint */}
                          {typeof member.baselineTotalKg === 'number' &&
                            member.baselineTotalKg > 0 && (
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-muted border border-border px-2.5 py-1 font-mono text-xs text-foreground"
                                title="Daily carbon footprint baseline"
                              >
                                <span className="text-muted-foreground">Base:</span>
                                <span className="font-bold">
                                  {formatKg(member.baselineTotalKg, 1)}/d
                                </span>
                              </span>
                            )}

                          {/* 30-Day Footprint */}
                          {typeof m.last30DaysTotalKg === 'number' && m.last30DaysTotalKg > 0 && (
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-muted/80 border border-border px-2 py-1 font-mono text-xs text-foreground"
                              title="Last 30 days total carbon footprint"
                            >
                              <span className="text-muted-foreground">30d:</span>
                              <span className="font-bold">{formatKg(m.last30DaysTotalKg, 1)}</span>
                            </span>
                          )}

                          {/* Trend / Reduction % */}
                          {typeof m.reductionPct === 'number' && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold font-mono ${
                                m.reductionPct > 0
                                  ? 'bg-positive/10 text-positive border border-positive/30'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}
                              title={
                                m.reductionPct > 0
                                  ? `${m.reductionPct}% reduction vs baseline`
                                  : `${Math.abs(m.reductionPct)}% increase vs baseline`
                              }
                            >
                              {m.reductionPct > 0 ? (
                                <>
                                  <TrendingDown className="size-3" />
                                  <span>-{m.reductionPct}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="size-3" />
                                  <span>+{Math.abs(m.reductionPct)}%</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Streak & EcoPoints Activity */}
                      <div className="flex items-center gap-1.5 text-xs pl-1">
                        {typeof m.currentStreak === 'number' && m.currentStreak > 0 && (
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-1 text-xs font-bold font-mono"
                            title="Daily logging streak"
                          >
                            <Flame className="size-3 text-orange-500" />
                            <span>{m.currentStreak}d</span>
                          </span>
                        )}

                        {typeof member.pointsTotal === 'number' && (
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-1 font-mono text-xs font-bold text-primary"
                            title="EcoPoints total"
                          >
                            <Award className="size-3" />
                            <span>{formatNumber(member.pointsTotal)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Custom Onboarding Answers (Owner only) */}
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMemberForAnswers(member)}
                        className="size-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
                        title="View custom onboarding answers"
                        aria-label={`View answers for ${member.user.name}`}
                      >
                        <FileQuestion className="size-3.5" aria-hidden="true" />
                      </Button>
                    )}

                    {/* Remove Member Button (Owner only, cannot remove self) */}
                    {isOwner && !isCurrentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        className="size-8 p-0 text-muted-foreground hover:text-destructive hover:border-destructive/40 shrink-0"
                        title="Remove member from organization"
                        aria-label={`Remove ${member.user.name}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Add Member Modal Dialog */}
      <ModalDialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Team Member"
        description={`Enroll an employee or colleague into ${organization.name}.`}
        size="sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="invite-email" className="text-xs font-semibold text-foreground">
              Colleague Email Address
            </label>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              The user must already have registered an account on EcoLife.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invite-role" className="text-xs font-semibold text-foreground">
              Role in Organization
            </label>
            <Select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'owner' | 'member')}
            >
              <option value="member">Member (Can track and view team portal)</option>
              <option value="owner">
                Owner / Admin (Can manage roster, code, and ESG reports)
              </option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!inviteEmail.trim() || addMember.isPending}
              loading={addMember.isPending}
            >
              Add to Organization
            </Button>
          </div>
        </form>
      </ModalDialog>

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <ConfirmDialog
          open={Boolean(memberToRemove)}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleRemoveConfirm}
          title={`Remove ${memberToRemove.user.name}?`}
          description={`Are you sure you want to remove ${memberToRemove.user.name} from ${organization.name}? They will lose access to team challenges, leaderboards, and exclusive partner events.`}
          confirmText="Remove Member"
          confirmVariant="destructive"
          loading={removeMember.isPending}
        />
      )}

      {/* Member Custom Answers Dialog */}
      {selectedMemberForAnswers && (
        <OrgMemberAnswersDialog
          organizationId={organization.id}
          member={selectedMemberForAnswers}
          onClose={() => setSelectedMemberForAnswers(null)}
        />
      )}
    </>
  );
}
