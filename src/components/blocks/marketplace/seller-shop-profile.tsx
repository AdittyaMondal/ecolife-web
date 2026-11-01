'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Store,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModalDialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { myOrganizationQuery, useUpdateMyOrg } from '@/hooks/use-organization';
import { initials } from '@/lib/format';
import type { Organization, UpdateOrganizationBody } from '@/types/api';

export interface SellerShopProfileProps {
  organization?: Organization;
  isOwner?: boolean;
  className?: string;
}

interface EditShopProfileDialogProps {
  organization: Organization;
  open: boolean;
  onClose: () => void;
}

function EditShopProfileDialog({ organization, open, onClose }: EditShopProfileDialogProps) {
  const [name, setName] = React.useState(organization.name ?? '');
  const [description, setDescription] = React.useState(organization.description ?? '');
  const [contactEmail, setContactEmail] = React.useState(organization.contactEmail ?? '');
  const [contactPhone, setContactPhone] = React.useState(organization.contactPhone ?? '');
  const [address, setAddress] = React.useState(organization.address ?? '');
  const [city, setCity] = React.useState(organization.city ?? '');
  const [regionCode, setRegionCode] = React.useState(organization.regionCode ?? '');
  const [websiteUrl, setWebsiteUrl] = React.useState(organization.websiteUrl ?? '');
  const [logoUrl, setLogoUrl] = React.useState(organization.logoUrl ?? '');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const updateMyOrgMutation = useUpdateMyOrg(organization.id);

  // Re-sync form state when opened
  React.useEffect(() => {
    if (open) {
      setName(organization.name ?? '');
      setDescription(organization.description ?? '');
      setContactEmail(organization.contactEmail ?? '');
      setContactPhone(organization.contactPhone ?? '');
      setAddress(organization.address ?? '');
      setCity(organization.city ?? '');
      setRegionCode(organization.regionCode ?? '');
      setWebsiteUrl(organization.websiteUrl ?? '');
      setLogoUrl(organization.logoUrl ?? '');
    }
  }, [open, organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Store name is required.');
      return;
    }

    const payload: UpdateOrganizationBody = {
      name: name.trim(),
      description: description.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      regionCode: regionCode.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      logoUrl: logoUrl.trim() || null,
    };

    setIsSubmitting(true);
    try {
      await updateMyOrgMutation.mutateAsync(payload);
      toast.success('Shop profile updated successfully.');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update shop profile';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Edit Shop Profile"
      description="Update public storefront information, merchant contact details, and business location."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="shop-name" className="text-xs font-semibold text-foreground">
            Shop / Brand Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="shop-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Green Living Naturals"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="shop-desc" className="text-xs font-semibold text-foreground">
            Description
          </label>
          <Textarea
            id="shop-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your eco-mission, sustainable sourcing, and product ethos..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="shop-email" className="text-xs font-semibold text-foreground">
              Contact Email
            </label>
            <Input
              id="shop-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@merchant.example"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="shop-phone" className="text-xs font-semibold text-foreground">
              Contact Phone
            </label>
            <Input
              id="shop-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="shop-address" className="text-xs font-semibold text-foreground">
            Street Address
          </label>
          <Input
            id="shop-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Plot 42, Green Valley Industrial Area"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="shop-city" className="text-xs font-semibold text-foreground">
              City
            </label>
            <Input
              id="shop-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="shop-region" className="text-xs font-semibold text-foreground">
              Region / State Code
            </label>
            <Input
              id="shop-region"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              placeholder="e.g. IN-MH"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="shop-website" className="text-xs font-semibold text-foreground">
              Website URL
            </label>
            <Input
              id="shop-website"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://brand.example"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="shop-logo" className="text-xs font-semibold text-foreground">
              Brand Logo URL
            </label>
            <Input
              id="shop-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}

export function SellerShopProfile({
  organization: propOrg,
  isOwner: propIsOwner,
  className,
}: SellerShopProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Fetch my organization if not provided via props
  const { data: myOrgData, isLoading } = useQuery(myOrganizationQuery());
  const organization = propOrg ?? myOrgData?.organization;
  const isOwner = propIsOwner !== undefined ? propIsOwner : myOrgData?.role === 'owner';

  if (isLoading && !organization) {
    return (
      <Card className="p-8 text-center border-border shadow-subtle space-y-3">
        <RefreshCw className="size-6 text-primary animate-spin mx-auto" />
        <p className="text-sm font-semibold text-foreground">Loading shop profile...</p>
      </Card>
    );
  }

  if (!organization) {
    return (
      <Card className="p-8 text-center border-dashed border-border shadow-subtle space-y-3">
        <Store className="size-10 text-muted-foreground mx-auto" />
        <h4 className="text-base font-semibold text-foreground">No Shop Profile Found</h4>
        <p className="text-xs text-muted-foreground">
          You are not currently registered with an active merchant organization.
        </p>
      </Card>
    );
  }

  const verification = (organization.verificationDetails as Record<string, unknown>) || {};
  const gstinOrReg =
    (verification.gstin as string) ||
    (verification.taxId as string) ||
    (verification.registrationNumber as string) ||
    (verification.businessRegNo as string) ||
    'Submitted with application';

  const storeCategory =
    (verification.storeCategory as string) ||
    (verification.category as string) ||
    'Sustainable Goods & Eco-Friendly Merchandise';

  // Status badge config
  const statusBadges: Record<
    Organization['status'],
    { variant: 'positive' | 'warning' | 'destructive'; label: string; icon: React.ReactNode }
  > = {
    approved: {
      variant: 'positive',
      label: 'Approved Partner',
      icon: <CheckCircle2 className="size-3.5" />,
    },
    pending: {
      variant: 'warning',
      label: 'Pending Verification',
      icon: <Clock className="size-3.5" />,
    },
    rejected: {
      variant: 'destructive',
      label: 'Application Rejected',
      icon: <XCircle className="size-3.5" />,
    },
    suspended: {
      variant: 'destructive',
      label: 'Account Suspended',
      icon: <AlertCircle className="size-3.5" />,
    },
  };

  const statusConfig = statusBadges[organization.status] ?? statusBadges.pending;

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {/* Main Profile Header Card */}
      <Card className="p-6 border-border bg-card shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Logo / Avatar */}
            <div className="relative size-16 sm:size-20 shrink-0 rounded-md overflow-hidden bg-muted border border-border flex items-center justify-center font-bold text-lg text-foreground">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span>{initials(organization.name)}</span>
              )}
            </div>

            {/* Shop Titles & Status */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusConfig.variant} className="gap-1.5 text-xs">
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Partner ID: #{organization.id}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground truncate">
                {organization.name}
              </h2>

              <p className="text-xs font-mono text-muted-foreground">/{organization.slug}</p>
            </div>
          </div>

          {/* Edit Action Button */}
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-1.5 self-start shrink-0"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Shop Profile</span>
            </Button>
          )}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            About Merchant
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {organization.description || (
              <span className="italic text-muted-foreground">
                No description provided yet. Click &quot;Edit Shop Profile&quot; to share your
                eco-friendly background with buyers.
              </span>
            )}
          </p>
        </div>
      </Card>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Details Card */}
        <Card className="p-5 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Mail className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Contact Channels
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                  Support Email
                </span>
                {organization.contactEmail ? (
                  <a
                    href={`mailto:${organization.contactEmail}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {organization.contactEmail}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">Not specified</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                  Direct Phone
                </span>
                {organization.contactPhone ? (
                  <a
                    href={`tel:${organization.contactPhone}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                  >
                    {organization.contactPhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">Not specified</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                  Store Website
                </span>
                {organization.websiteUrl ? (
                  <a
                    href={organization.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-xs truncate max-w-full"
                  >
                    <span className="truncate">{organization.websiteUrl}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">Not specified</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Location & Operating Region Card */}
        <Card className="p-5 border-border bg-card shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <MapPin className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Store &amp; Dispatch Location
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                  Registered Address
                </span>
                <p className="font-medium text-foreground">
                  {organization.address || 'Address not listed'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                  City &amp; Region
                </span>
                <p className="font-medium text-foreground">
                  {organization.city ? `${organization.city}, ` : ''}
                  {organization.regionCode || 'India'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Verification & Compliance Card */}
        <Card className="p-5 border-border bg-card shadow-subtle space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Verification &amp; Tax Compliance Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-sm border border-border p-3.5 space-y-1 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                GSTIN / Business Registration
              </span>
              <p className="font-mono font-bold text-foreground">{gstinOrReg}</p>
            </div>

            <div className="rounded-sm border border-border p-3.5 space-y-1 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Merchandise Category
              </span>
              <p className="font-semibold text-foreground">{storeCategory}</p>
            </div>

            <div className="rounded-sm border border-border p-3.5 space-y-1 bg-muted/20">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Partner Account Access
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <Badge variant={isOwner ? 'primary' : 'neutral'} className="text-[11px]">
                  {isOwner ? 'Store Owner' : 'Store Member'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({organization.memberCount ?? 1} team member
                  {(organization.memberCount ?? 1) === 1 ? '' : 's'})
                </span>
              </div>
            </div>
          </div>

          {/* Admin Review Note if any */}
          {organization.reviewNote && (
            <div className="rounded-sm border border-border bg-muted/40 p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                EcoLife Verification Team Note
              </span>
              <p className="text-xs text-foreground">{organization.reviewNote}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Shop Dialog */}
      {isOwner && (
        <EditShopProfileDialog
          organization={organization}
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      )}
    </div>
  );
}
