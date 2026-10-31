'use client';

import {
  Building2,
  CheckCircle2,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useCreateOrganization, useJoinOrganization } from '@/hooks/use-organization';
import type { CreateOrganizationBody } from '@/types/api';

const MODE_OPTIONS = [
  { value: 'join' as const, label: 'Join Existing Team' },
  { value: 'register' as const, label: 'Register Organization' },
];

const ORG_TYPE_OPTIONS = [
  { value: 'industry', label: 'Corporate / Industry (ESG & Employee Sustainability)' },
  { value: 'ngo', label: 'NGO / Non-Profit / Community Group' },
  { value: 'seller', label: 'Sustainable Merchant / Seller' },
];

export function OrgEnrollment() {
  const [mode, setMode] = React.useState<'join' | 'register'>('join');
  const [code, setCode] = React.useState('');

  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<'industry' | 'ngo' | 'seller'>('industry');
  const [description, setDescription] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [city, setCity] = React.useState('');
  const [regionCode, setRegionCode] = React.useState('IN-MH');

  const joinOrg = useJoinOrganization();
  const createOrg = useCreateOrganization();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      toast.error('Please enter an organization code or slug.');
      return;
    }

    joinOrg.mutate(
      { code: cleanCode },
      {
        onSuccess: (res) => {
          toast.success(`Successfully joined ${res.organization.name}!`);
        },
        onError: (err: unknown) => {
          const apiErr = err as { code?: string; message?: string };
          const message =
            apiErr?.message ||
            (apiErr?.code === 'ORG_006'
              ? 'This organization is pending administrator approval before members can join.'
              : apiErr?.code === 'ORG_002'
                ? 'Organization not found. Please verify the code or slug.'
                : 'Could not join organization. Please try again.');
          toast.error(message);
        },
      },
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Organization name is required.');
      return;
    }

    const payload: CreateOrganizationBody = {
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      city: city.trim() || undefined,
      regionCode: regionCode.trim() || undefined,
    };

    createOrg.mutate(payload, {
      onSuccess: (org) => {
        toast.success(`Organization "${org.name}" registered successfully!`);
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        toast.error(apiErr?.message || 'Could not register organization. Please check all fields.');
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in">
      {/* Hero Intro */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Workplace &amp; Collective Climate Action</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Connect with your Organization
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Join your workplace, campus, or NGO to pool emission reductions, participate in team
          sustainability challenges, and view cumulative ESG impact data.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="max-w-md mx-auto">
        <SegmentedControl
          name="org-mode"
          label="Organization enrollment option"
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          fullWidth
        />
      </div>

      {/* Mode 1: Join with Code */}
      {mode === 'join' && (
        <Card className="p-6 sm:p-8 space-y-6 shadow-subtle border-border bg-card">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
              <KeyRound className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">
                Join with an Invite Code or Slug
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter the unique organization identifier (e.g.{' '}
                <code className="font-mono text-primary font-semibold">acme-industries</code>)
                provided by your team lead, HR, or sustainability coordinator.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="org-code-input" className="text-xs font-semibold text-foreground">
                Organization Code or Slug
              </label>
              <Input
                id="org-code-input"
                placeholder="e.g. acme-industries or org ID"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="font-mono text-base"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Case-insensitive. Look for your organization's custom link or ask your workspace
                admin.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={joinOrg.isPending || !code.trim()}
            >
              <Users className="size-4 mr-2" aria-hidden="true" />
              {joinOrg.isPending ? 'Verifying & Joining…' : 'Join Organization'}
            </Button>
          </form>

          {/* Value Props / Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 rounded-sm bg-muted/60 p-3">
              <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden="true" />
              <span className="text-xs text-foreground font-medium">Automatic team pooling</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-sm bg-muted/60 p-3">
              <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden="true" />
              <span className="text-xs text-foreground font-medium">Roster visibility</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-sm bg-muted/60 p-3">
              <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden="true" />
              <span className="text-xs text-foreground font-medium">No personal data exposed</span>
            </div>
          </div>
        </Card>
      )}

      {/* Mode 2: Register Organization */}
      {mode === 'register' && (
        <Card className="p-6 sm:p-8 space-y-6 shadow-subtle border-border bg-card">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
              <Building2 className="size-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Register a New Organization</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a centralized workspace for your enterprise or community. As the creator, you
                will become the Organization Owner with access to cumulative carbon data, employee
                roster management, and invite controls.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Organization Name */}
            <div className="space-y-1.5">
              <label htmlFor="org-name-input" className="text-xs font-semibold text-foreground">
                Organization Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="org-name-input"
                placeholder="e.g. Acme Green Solutions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label htmlFor="org-type-select" className="text-xs font-semibold text-foreground">
                Organization Classification <span className="text-destructive">*</span>
              </label>
              <Select
                id="org-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as 'industry' | 'ngo' | 'seller')}
              >
                {ORG_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Corporate orgs track workforce emission baselines; NGOs mobilize community drives;
                Sellers showcase sustainable merchandise.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="org-desc-input" className="text-xs font-semibold text-foreground">
                Description / Mission
              </label>
              <Textarea
                id="org-desc-input"
                placeholder="Briefly describe your company, facility size, or environmental goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Contact & Web Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="org-web-input"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Globe className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Website URL
                </label>
                <Input
                  id="org-web-input"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="org-email-input"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Official Contact Email
                </label>
                <Input
                  id="org-email-input"
                  type="email"
                  placeholder="sustainability@company.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label
                  htmlFor="org-phone-input"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Phone Number
                </label>
                <Input
                  id="org-phone-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label
                  htmlFor="org-city-input"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  City / Location
                </label>
                <Input
                  id="org-city-input"
                  placeholder="e.g. Pune or Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="org-region-input" className="text-xs font-semibold text-foreground">
                  Region Code
                </label>
                <Input
                  id="org-region-input"
                  placeholder="e.g. IN-MH"
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                />
              </div>
            </div>

            {/* Info notice about review status */}
            <div className="flex items-start gap-3 rounded-sm border border-secondary/40 bg-secondary/10 p-3.5 text-xs text-foreground">
              <ShieldCheck className="size-5 shrink-0 text-positive mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="font-semibold">Review &amp; Verification Workflow</p>
                <p className="text-muted-foreground">
                  Upon registration, your organization enters{' '}
                  <code className="font-medium text-foreground">pending</code> review. Once verified
                  by the platform team, public joining via code and invite dispatch will be
                  activated.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={createOrg.isPending || !name.trim()}
            >
              <Building2 className="size-4 mr-2" aria-hidden="true" />
              {createOrg.isPending
                ? 'Registering Organization…'
                : 'Submit Organization Registration'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
