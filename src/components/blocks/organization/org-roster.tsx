'use client';

import {
  Award,
  Crown,
  Flame,
  Mail,
  Plus,
  Search,
  Trash2,
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

export interface OrgRosterProps {
  organization: Organization;
  members: OrganizationMember[];
  currentUserId?: number;
  userRole: 'owner' | 'member';
}

export function OrgRoster({ organization, members, currentUserId, userRole }: OrgRosterProps) {
  const [search, setSearch] = React.useState('');
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'owner' | 'member'>('member');
  const [memberToRemove, setMemberToRemove] = React.useState<OrganizationMember | null>(null);

  const addMember = useAddOrgMember(organization.id);
  const removeMember = useRemoveOrgMember(organization.id);

  const isOwner = userRole === 'owner';
  const isApproved = organization.status === 'approved';

  // Filter members by name or email
  const filteredMembers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = m.user.name?.toLowerCase() || '';
      const email = (m as OrganizationMember & { email?: string }).email?.toLowerCase() || '';
      return name.includes(q) || email.includes(q);
    });
  }, [members, search]);

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
              {members.length} {members.length === 1 ? 'member' : 'members'} enrolled in this
              organization
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-48 sm:min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Add Member button (Owner only & approved only) */}
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

        {/* Member List Table / Cards */}
        <div className="divide-y divide-border rounded-sm border border-border overflow-hidden bg-card">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No members found</p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? `No members match "${search}". Try searching by a different term.`
                  : 'No colleagues have joined yet. Share your organization code above!'}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isMemberOwner = member.role === 'owner';
              const isCurrentUser = currentUserId === member.user.id;
              const email = (member as OrganizationMember & { email?: string }).email;

              return (
                <div
                  key={member.user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition hover:bg-muted/40"
                >
                  {/* Left: Avatar + Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-secondary text-xs font-bold text-secondary-foreground">
                      {member.user.avatarUrl ? (
                        // biome-ignore lint/performance/noImgElement: dynamic user avatar
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.name}
                          className="size-full rounded-sm object-cover"
                        />
                      ) : (
                        initials(member.user.name)
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">
                          {member.user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-xs bg-primary/20 text-primary text-[10px] font-semibold px-1.5 py-0.5">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {email && <span className="truncate">{email}</span>}
                        {member.user.city && <span className="truncate">· {member.user.city}</span>}
                        <span>· Joined {formatDate(member.joinedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics + Role Badge + Owner Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {/* Points & Baseline Metrics */}
                    <div className="flex items-center gap-2 text-xs">
                      {typeof member.baselineTotalKg === 'number' && member.baselineTotalKg > 0 && (
                        <span
                          className="inline-flex items-center gap-1 rounded-xs bg-muted border border-border px-2 py-1 font-mono text-[11px] text-foreground"
                          title="Daily carbon baseline"
                        >
                          <Flame className="size-3 text-amber-500" aria-hidden="true" />
                          <span>{formatKg(member.baselineTotalKg, 1)}/d</span>
                        </span>
                      )}

                      {typeof member.pointsTotal === 'number' && (
                        <span
                          className="inline-flex items-center gap-1 rounded-xs bg-accent/60 border border-tertiary/40 px-2 py-1 font-mono text-[11px] font-semibold text-positive"
                          title="EcoPoints total"
                        >
                          <Award className="size-3" aria-hidden="true" />
                          <span>{formatNumber(member.pointsTotal)} pts</span>
                        </span>
                      )}
                    </div>

                    {/* Role Badge */}
                    <Badge
                      variant={isMemberOwner ? 'primary' : 'neutral'}
                      className="text-[11px] gap-1"
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

                    {/* Remove Member Button (Owner only, cannot remove self) */}
                    {isOwner && !isCurrentUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMemberToRemove(member)}
                        className="size-8 p-0 text-muted-foreground hover:text-destructive hover:border-destructive/40"
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
        title="Add Colleague by Email"
        description="Add a member who already has an account on EcoLife directly to your organization."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="invite-email" className="text-xs font-semibold text-foreground">
              User Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@yourcompany.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              The user must already have registered an account with this email address.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="invite-role" className="text-xs font-semibold text-foreground">
              Organizational Role
            </label>
            <Select
              id="invite-role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
            >
              <option value="member">Member (view cumulative metrics &amp; roster)</option>
              <option value="owner">Owner (can manage members &amp; organization details)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={addMember.isPending || !inviteEmail.trim()}
            >
              <UserPlus className="size-3.5 mr-1.5" aria-hidden="true" />
              {addMember.isPending ? 'Adding…' : 'Add to Organization'}
            </Button>
          </div>
        </form>
      </ModalDialog>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title={`Remove ${memberToRemove?.user.name}?`}
        description="Are you sure you want to remove this employee from the organization? Their individual points and account will remain active, but they will be detached from your team's cumulative carbon tracking."
        confirmText="Remove Member"
        confirmVariant="destructive"
        loading={removeMember.isPending}
      />
    </>
  );
}
