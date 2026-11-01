'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { meQuery, useRegister } from '@/hooks/use-auth';
import { useCreateOrganization } from '@/hooks/use-organization';
import type { CreateOrganizationBody } from '@/types/api';

type PartnerType = 'industry' | 'ngo' | 'seller';

const PARTNER_TYPES: {
  type: PartnerType;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
}[] = [
  {
    type: 'industry',
    title: 'Corporate Partner',
    badge: 'Enterprise & Industry',
    desc: 'Workforce ESG reporting, employee carbon tracking, and enterprise sustainability programs.',
    icon: Building2,
  },
  {
    type: 'ngo',
    title: 'Community Partner',
    badge: 'NGOs & Non-Profits',
    desc: 'Organize city clean-ups, tree planting drives, volunteer management, and local climate action.',
    icon: HeartHandshake,
  },
  {
    type: 'seller',
    title: 'Marketplace Partner',
    badge: 'Sustainable Merchant',
    desc: 'Showcase eco-certified merchandise, offer coin-redeemable discounts, and expand green sales.',
    icon: Store,
  },
];

export default function PartnerRegisterPage() {
  const router = useRouter();
  const { data: me } = useQuery(meQuery());
  const registerUser = useRegister();
  const createOrg = useCreateOrganization();

  const [selectedType, setSelectedType] = React.useState<PartnerType>('industry');

  // User credentials (if not already logged in)
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');
  const [userPhone, setUserPhone] = React.useState('');

  // Organization fields
  const [orgName, setOrgName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [city, setCity] = React.useState('Bengaluru');
  const [regionCode, setRegionCode] = React.useState('IN-KA');
  const [description, setDescription] = React.useState('');

  // Partner-specific verification fields
  const [taxId, setTaxId] = React.useState(''); // GSTIN or PAN
  const [regNumber, setRegNumber] = React.useState(''); // CIN or NGO Darpan
  const [extraDetail, setExtraDetail] = React.useState(''); // Workforce size, NGO focus, or Store category

  const isSubmitting = registerUser.isPending || createOrg.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      toast.error('Organization or Brand Name is required.');
      return;
    }

    try {
      // 1. If user is not logged in, register account first
      if (!me) {
        if (!userName.trim() || !userEmail.trim() || !userPassword) {
          toast.error('Please fill in your account credentials.');
          return;
        }

        await registerUser.mutateAsync({
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          ...(userPhone.trim() ? { phone: userPhone.trim() } : {}),
        });
      }

      // 2. Prepare verification payload
      const verificationDetails: Record<string, string> = {};
      if (taxId.trim()) verificationDetails.taxId = taxId.trim();
      if (regNumber.trim()) verificationDetails.registrationNumber = regNumber.trim();
      if (extraDetail.trim()) {
        if (selectedType === 'industry') verificationDetails.workforceSize = extraDetail.trim();
        else if (selectedType === 'ngo') verificationDetails.focusArea = extraDetail.trim();
        else verificationDetails.storeCategory = extraDetail.trim();
      }

      const orgPayload: CreateOrganizationBody & { verificationDetails?: Record<string, unknown> } =
        {
          name: orgName.trim(),
          type: selectedType,
          description: description.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          contactEmail: contactEmail.trim() || userEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || userPhone.trim() || undefined,
          city: city.trim() || undefined,
          regionCode: regionCode.trim() || undefined,
          verificationDetails,
        };

      const createdOrg = await createOrg.mutateAsync(orgPayload as CreateOrganizationBody);

      toast.success(
        `Registered ${createdOrg.name}! Your workspace is now pending admin verification.`,
      );

      // Route to partner portal
      if (selectedType === 'industry') {
        router.push('/organization/corporate');
      } else if (selectedType === 'ngo') {
        router.push('/organization/community');
      } else {
        router.push('/marketplace/seller');
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      toast.error(
        apiErr?.message || 'Could not register partner organization. Please check inputs.',
      );
    }
  };

  const selectedConfig = PARTNER_TYPES.find((t) => t.type === selectedType)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Individual Signup</span>
        </Link>
        <h1 className="pt-2 text-2xl font-bold tracking-tight text-foreground">
          Partner Registration
        </h1>
        <p className="text-sm text-muted-foreground">
          Select your organization type to register for verified corporate, NGO, or seller portals.
        </p>
      </div>

      {/* 3 Partner Type Cards */}
      <div className="grid grid-cols-1 gap-3">
        {PARTNER_TYPES.map((pt) => {
          const Icon = pt.icon;
          const isSelected = selectedType === pt.type;
          return (
            <button
              type="button"
              key={pt.type}
              onClick={() => setSelectedType(pt.type)}
              className={`flex items-start gap-3.5 p-3.5 rounded-sm border text-left transition ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xs ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{pt.title}</span>
                  <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                    {pt.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{pt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* User Account Details (if not signed in) */}
        {!me && (
          <div className="space-y-3 rounded-sm border border-border p-3.5 bg-muted/20">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Manager / Owner Account
            </span>
            <Field id="user-name" label="Your Name">
              <Input
                id="user-name"
                required
                placeholder="Full Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Field>
            <Field id="user-email" label="Work / Organization Email">
              <Input
                id="user-email"
                type="email"
                required
                placeholder="you@company.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </Field>
            <Field id="user-password" label="Password" hint="At least 10 characters">
              <Input
                id="user-password"
                type="password"
                required
                minLength={10}
                placeholder="••••••••••••"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </Field>
            <Field id="user-phone" label="Phone (Optional)">
              <Input
                id="user-phone"
                type="tel"
                placeholder="+919876543210"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* Organization Information */}
        <div className="space-y-3 rounded-sm border border-border p-3.5 bg-card">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {selectedConfig.title} Profile
          </span>
          <Field
            id="org-name"
            label={
              selectedType === 'industry'
                ? 'Company / Enterprise Name'
                : selectedType === 'ngo'
                  ? 'NGO / Non-Profit Name'
                  : 'Store / Brand Name'
            }
          >
            <Input
              id="org-name"
              required
              placeholder={
                selectedType === 'industry'
                  ? 'Acme Green Technologies'
                  : selectedType === 'ngo'
                    ? 'Clean Earth Foundation'
                    : 'EarthWear Sustainable Apparels'
              }
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field id="org-city" label="City">
              <Input
                id="org-city"
                placeholder="Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Field>
            <Field id="org-region" label="State Code">
              <Input
                id="org-region"
                placeholder="IN-KA"
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value)}
              />
            </Field>
          </div>

          <Field id="org-website" label="Website URL (HTTPS)" hint="Optional official website">
            <Input
              id="org-website"
              type="url"
              placeholder="https://example.org"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </Field>
        </div>

        {/* Basic Verification Documents & Identifiers */}
        <div className="space-y-3 rounded-sm border border-border p-3.5 bg-card">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-positive" />
            <span>Verification Details</span>
          </span>

          <Field
            id="verif-tax"
            label={
              selectedType === 'ngo' ? 'PAN / 12A / 80G Registration' : 'GSTIN or Business PAN'
            }
            hint="For administrative verification and approval"
          >
            <Input
              id="verif-tax"
              placeholder={selectedType === 'ngo' ? 'AAATC1234F' : '29ABCDE1234F1Z5'}
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            />
          </Field>

          <Field
            id="verif-reg"
            label={
              selectedType === 'industry'
                ? 'Corporate Identification Number (CIN/LLPIN)'
                : selectedType === 'ngo'
                  ? 'NGO Darpan / Trust Registration No.'
                  : 'Trade License / MSME Registration (Optional)'
            }
          >
            <Input
              id="verif-reg"
              placeholder="Registration Number"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
            />
          </Field>

          <Field
            id="verif-extra"
            label={
              selectedType === 'industry'
                ? 'Workforce Size (Approximate employee count)'
                : selectedType === 'ngo'
                  ? 'Primary Focus Area (e.g. Cleanups, Afforestation)'
                  : 'Store Categories (e.g. Household, Personal care)'
            }
          >
            <Input
              id="verif-extra"
              placeholder={
                selectedType === 'industry'
                  ? '100-500 employees'
                  : selectedType === 'ngo'
                    ? 'Urban Afforestation & Waste Recovery'
                    : 'Personal Care & Zero-Waste Stationery'
              }
              value={extraDetail}
              onChange={(e) => setExtraDetail(e.target.value)}
            />
          </Field>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-base font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>Submitting Application...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Register as {selectedConfig.title}</span>
              <ArrowRight className="size-4" />
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          By registering, your organization enters the verification queue with initial status{' '}
          <strong className="text-foreground">Pending Review</strong>.
        </p>
      </form>
    </div>
  );
}
