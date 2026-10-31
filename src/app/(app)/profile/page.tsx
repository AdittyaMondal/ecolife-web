'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Award,
  Check,
  Coins,
  Download,
  Edit3,
  Flame,
  Leaf,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { ErrorBanner } from '@/components/ui/error-banner';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { meQuery, useLogout } from '@/hooks/use-auth';
import {
  downloadExport,
  type OwnProfile,
  profileQuery,
  REWARD_SOURCE_LABEL,
  rewardsInfiniteQuery,
  useDeleteAccount,
  useUpdateProfile,
} from '@/hooks/use-profile';
import { formatDateLong, formatKg, formatNumber, initials, titleCase } from '@/lib/format';

export default function ProfilePage() {
  const router = useRouter();
  const profile = useQuery(profileQuery());
  const me = useQuery(meQuery());
  const rewards = useInfiniteQuery(rewardsInfiniteQuery());
  const logout = useLogout();

  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const rewardItems = React.useMemo(
    () => rewards.data?.pages.flatMap((p) => p.items) ?? [],
    [rewards.data],
  );

  if (profile.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return <ErrorBanner error={profile.error} onRetry={() => profile.refetch()} />;
  }

  const p = profile.data;
  const baseline = p.baseline;
  const annualTonnes = (baseline.totalKg * 365) / 1000;

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadExport();
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace('/login');
  };

  return (
    <div className="space-y-6">
      {/* Typical Social/Dashboard Profile Hero Card with Centered PFP */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        {/* Top Decorative Canopy Banner */}
        <div className="relative h-28 sm:h-36 w-full bg-gradient-to-r from-secondary via-forest-800 to-forest-700">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-black/20" />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge
              tone="positive"
              className="bg-forest-900/80 text-lime-300 border border-lime-400/30 backdrop-blur-xs"
            >
              ✓ Verified Member
            </Badge>
          </div>
        </div>

        {/* Centered Avatar and Profile Details */}
        <div className="px-6 pb-6 pt-0">
          <div className="flex flex-col items-center text-center">
            {/* Centered PFP with Concentric Ring */}
            <div className="relative -mt-14 sm:-mt-16 flex size-24 sm:size-28 items-center justify-center rounded-full bg-primary text-2xl sm:text-3xl font-black text-primary-foreground shadow-md ring-4 ring-card select-none">
              {p.user.avatarUrl ? (
                <Image
                  src={p.user.avatarUrl}
                  alt={p.user.name}
                  width={112}
                  height={112}
                  unoptimized
                  className="size-full rounded-full object-cover"
                />
              ) : (
                initials(p.user.name)
              )}

              {/* Verified Badge Icon Overlapping Avatar Bottom Right */}
              <div
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-secondary text-primary shadow-xs ring-2 ring-card"
                title="Verified EcoLife Account"
              >
                <Check className="size-4 stroke-[3]" aria-hidden="true" />
              </div>
            </div>

            {/* User Title & Handle */}
            <div className="mt-3 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {p.user.name}
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {me.data?.email ?? 'Member'}
              </p>
            </div>

            {/* Metadata Pills Row */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                <MapPin className="size-3 text-positive" />
                <span>
                  {p.user.city ?? p.answers.city ?? 'Mumbai'}, {p.answers.regionCode ?? 'IN-MH'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                <Leaf className="size-3 text-positive" />
                <span>Member since {formatDateLong(p.memberSince)}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2.5 py-1">
                <User className="size-3 text-positive" />
                <span className="capitalize">{me.data?.role ?? 'User'} Account</span>
              </span>
            </div>

            {/* Centered Profile Action Buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="shadow-2xs active:scale-[0.98]"
              >
                <Edit3 className="size-3.5" />
                <span>Edit Profile &amp; Lifestyle</span>
              </Button>

              <Link href="/step/1">
                <Button variant="outline" size="sm" className="active:scale-[0.98]">
                  <RefreshCw className="size-3.5" />
                  <span>Retake 15-Q Survey</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                loading={exporting}
                onClick={handleExport}
                className="active:scale-[0.98]"
              >
                <Download className="size-3.5" />
                <span>Export Data (JSON)</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                loading={logout.isPending}
                onClick={handleLogout}
                className="active:scale-[0.98]"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Concentric 4-Metric Grid */}
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center shadow-2xs transition hover:border-tertiary/50">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Sparkles className="size-3.5 text-positive" />
                <span>Total EcoPoints</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
                {formatNumber(p.wallet.pointsTotal)}
              </p>
              <p className="text-[11px] text-muted-foreground">Determines leaderboard rank</p>
            </div>

            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center shadow-2xs transition hover:border-tertiary/50">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Coins className="size-3.5 text-positive" />
                <span>EcoCoins Balance</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
                {formatNumber(p.wallet.coinsBalance)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Worth ₹{(p.wallet.coinsBalance / 10).toFixed(0)} in marketplace
              </p>
            </div>

            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center shadow-2xs transition hover:border-tertiary/50">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Leaf className="size-3.5 text-positive" />
                <span>Daily Baseline</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
                {formatKg(baseline.totalKg)} kg
              </p>
              <p className="text-[11px] text-muted-foreground">CO₂e / day benchmark</p>
            </div>

            <div className="rounded-sm border border-border bg-muted/30 p-4 text-center shadow-2xs transition hover:border-tertiary/50">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Flame className="size-3.5 text-positive" />
                <span>Annual Footprint</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
                {annualTonnes.toFixed(2)} t
              </p>
              <p className="text-[11px] text-muted-foreground">Tonnes CO₂e / year</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Baseline Category Breakdown & Lifestyle Answers */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground">
              15-Question Lifestyle Baseline Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Your daily benchmark across all 5 emission categories. Beat this daily in Track to
              earn bonus points and coins.
            </p>
          </div>
          <Badge tone="neutral">5 Categories</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ['Transport', baseline.transportKg],
              ['Home Energy', baseline.homeEnergyKg],
              ['Diet & Food', baseline.foodKg],
              ['Water', baseline.waterKg],
              ['Waste', baseline.wasteKg],
            ] as const
          ).map(([label, val]) => (
            <div
              key={label}
              className="rounded-sm border border-border bg-muted/30 p-3 text-center"
            >
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <span className="mt-1 block text-lg font-extrabold tabular-nums text-foreground">
                {formatKg(val)} kg
              </span>
              <span className="text-[10px] text-muted-foreground">CO₂e / day</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Points & Coins Reward Ledger */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Points & EcoCoins Ledger</h2>
            <p className="text-xs text-muted-foreground">
              Verified history of every activity that credited or spent points and coins.
            </p>
          </div>
          <Award className="size-5 text-positive" aria-hidden="true" />
        </div>

        {rewards.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        ) : rewards.isError ? (
          <ErrorBanner error={rewards.error} onRetry={() => rewards.refetch()} />
        ) : rewardItems.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            No reward transactions yet. Log today&apos;s footprint or attend an event to earn points
            & coins!
          </p>
        ) : (
          <div className="space-y-2">
            {rewardItems.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {tx.note ?? REWARD_SOURCE_LABEL[tx.source] ?? titleCase(tx.source)}
                    </span>
                    <Badge tone="neutral">
                      {REWARD_SOURCE_LABEL[tx.source] ?? titleCase(tx.source)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateLong(tx.createdAt)}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-right font-mono text-xs font-bold">
                  {tx.pointsDelta !== 0 && (
                    <span className="rounded-xs bg-accent px-2 py-1 text-accent-foreground">
                      {tx.pointsDelta > 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} pts
                    </span>
                  )}
                  {tx.coinsDelta !== 0 && (
                    <span
                      className={`rounded-xs px-2 py-1 ${
                        tx.coinsDelta > 0
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-warning/20 text-foreground'
                      }`}
                    >
                      {tx.coinsDelta > 0 ? `+${tx.coinsDelta}` : tx.coinsDelta} coins
                    </span>
                  )}
                </div>
              </div>
            ))}

            {rewards.hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={rewards.isFetchingNextPage}
                  onClick={() => rewards.fetchNextPage()}
                >
                  Load older rewards
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Data Export, Sign Out & Danger Zone */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Account & Data Controls</h2>
            <p className="text-xs text-muted-foreground">
              Export your complete carbon logs and ledger as JSON, sign out, or delete your account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" loading={exporting} onClick={handleExport}>
              <Download className="size-3.5" />
              Export My Data (JSON)
            </Button>

            <Button variant="secondary" size="sm" loading={logout.isPending} onClick={handleLogout}>
              <LogOut className="size-3.5" />
              Sign out
            </Button>

            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3.5" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {editOpen && (
        <EditProfileModal profile={p} open={editOpen} onClose={() => setEditOpen(false)} />
      )}

      {deleteOpen && (
        <DeleteAccountModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => router.replace('/login')}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  profile: p,
  open,
  onClose,
}: {
  profile: OwnProfile;
  open: boolean;
  onClose: () => void;
}) {
  const updateProfile = useUpdateProfile();
  const [name, setName] = React.useState(p.user.name);
  const [city, setCity] = React.useState(p.answers.city ?? p.user.city ?? '');
  const [householdSize, setHouseholdSize] = React.useState(String(p.answers.householdSize ?? 3));
  const [dietType, setDietType] = React.useState<
    'vegan' | 'vegetarian' | 'eggetarian' | 'non_veg_weekly' | 'non_veg_daily'
  >(p.answers.dietType ?? 'vegetarian');
  const [primaryCommuteMode, setPrimaryCommuteMode] = React.useState<
    | 'walk'
    | 'cycle'
    | 'bus'
    | 'metro_train'
    | 'two_wheeler'
    | 'car'
    | 'cab'
    | 'auto_rickshaw'
    | 'work_from_home'
  >(p.answers.primaryCommuteMode ?? 'metro_train');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      name: name.trim(),
      answers: {
        ...p.answers,
        city: city.trim() || undefined,
        householdSize: Math.max(1, Math.min(12, Number(householdSize) || 3)),
        dietType,
        primaryCommuteMode,
      },
    });
    onClose();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Edit Profile & Lifestyle Baseline"
      description="Updating lifestyle answers automatically recalculates your daily carbon baseline."
    >
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
          />
          <Input
            type="number"
            label="Household Size"
            min={1}
            max={12}
            value={householdSize}
            onChange={(e) => setHouseholdSize(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Primary Diet"
            value={dietType}
            onChange={(e) => setDietType(e.target.value as typeof dietType)}
          >
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="non_veg_weekly">Non-veg (1–3× / week)</option>
            <option value="non_veg_daily">Non-veg (Daily)</option>
          </Select>

          <Select
            label="Primary Commute Mode"
            value={primaryCommuteMode}
            onChange={(e) => setPrimaryCommuteMode(e.target.value as typeof primaryCommuteMode)}
          >
            <option value="walk">Walk</option>
            <option value="cycle">Cycle</option>
            <option value="metro_train">Metro / Local Train</option>
            <option value="bus">Bus</option>
            <option value="two_wheeler">Two-Wheeler</option>
            <option value="car">Car</option>
            <option value="work_from_home">Work from Home</option>
          </Select>
        </div>

        {updateProfile.isError && <ErrorBanner error={updateProfile.error} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={updateProfile.isPending}>
            Save & Recompute Baseline
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}

function DeleteAccountModal({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const [confirmText, setConfirmText] = React.useState('');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') return;
    await deleteAccount.mutateAsync();
    onDeleted();
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Delete Your EcoLife Account"
      description="This permanently anonymizes your profile and revokes all sessions."
      size="sm"
    >
      <form onSubmit={handleDelete} className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-xs text-foreground">
          <ShieldAlert className="size-4 text-destructive shrink-0 mt-0.5" />
          <span>
            Type <strong className="font-mono">DELETE</strong> below to confirm permanent account
            deletion.
          </span>
        </div>

        <Input
          label="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          required
        />

        {deleteAccount.isError && <ErrorBanner error={deleteAccount.error} />}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={confirmText !== 'DELETE'}
            loading={deleteAccount.isPending}
          >
            Permanently Delete
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
