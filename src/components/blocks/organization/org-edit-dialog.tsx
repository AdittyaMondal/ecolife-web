'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ModalDialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { useUpdateOrganization } from '@/hooks/use-organization';
import type { Organization, UpdateOrganizationBody } from '@/types/api';

export interface OrgEditDialogProps {
  organization: Organization;
  open: boolean;
  onClose: () => void;
}

export function OrgEditDialog({ organization, open, onClose }: OrgEditDialogProps) {
  const [name, setName] = React.useState(organization.name);
  const [description, setDescription] = React.useState(organization.description || '');
  const [websiteUrl, setWebsiteUrl] = React.useState(organization.websiteUrl || '');
  const [contactEmail, setContactEmail] = React.useState(organization.contactEmail || '');
  const [contactPhone, setContactPhone] = React.useState(organization.contactPhone || '');
  const [city, setCity] = React.useState(organization.city || '');
  const [regionCode, setRegionCode] = React.useState(organization.regionCode || '');
  const [logoUrl, setLogoUrl] = React.useState(organization.logoUrl || '');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(organization.name);
      setDescription(organization.description || '');
      setWebsiteUrl(organization.websiteUrl || '');
      setContactEmail(organization.contactEmail || '');
      setContactPhone(organization.contactPhone || '');
      setCity(organization.city || '');
      setRegionCode(organization.regionCode || '');
      setLogoUrl(organization.logoUrl || '');
    }
  }, [open, organization]);

  const updateOrg = useUpdateOrganization(organization.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Organization name is required.');
      return;
    }

    const payload: UpdateOrganizationBody = {
      name: name.trim(),
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      city: city.trim() || undefined,
      regionCode: regionCode.trim() || undefined,
      logoUrl: logoUrl.trim() || null,
    };

    updateOrg.mutate(payload, {
      onSuccess: () => {
        toast.success('Organization updated successfully.');
        onClose();
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(apiErr?.message || 'Could not update organization.');
      },
    });
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title="Edit Organization Details"
      description="Update profile metadata, contact channels, and branding for your organization."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="edit-org-name" className="text-xs font-semibold text-foreground">
            Organization Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="edit-org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-org-desc" className="text-xs font-semibold text-foreground">
            Description
          </label>
          <Textarea
            id="edit-org-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-org-website" className="text-xs font-semibold text-foreground">
              Website URL
            </label>
            <Input
              id="edit-org-website"
              type="url"
              placeholder="https://acme.example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-org-email" className="text-xs font-semibold text-foreground">
              Contact Email
            </label>
            <Input
              id="edit-org-email"
              type="email"
              placeholder="contact@acme.example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-org-phone" className="text-xs font-semibold text-foreground">
              Contact Phone
            </label>
            <Input
              id="edit-org-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-org-city" className="text-xs font-semibold text-foreground">
              City
            </label>
            <Input id="edit-org-city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-org-region" className="text-xs font-semibold text-foreground">
              Region Code
            </label>
            <Input
              id="edit-org-region"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-org-logo" className="text-xs font-semibold text-foreground">
            Logo Image URL
          </label>
          <Input
            id="edit-org-logo"
            type="url"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={updateOrg.isPending || !name.trim()}
          >
            {updateOrg.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
