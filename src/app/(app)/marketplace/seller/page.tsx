'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { SellerAnalyticsView } from '@/components/blocks/marketplace/seller-analytics-view';
import { SellerOrdersManager } from '@/components/blocks/marketplace/seller-orders-manager';
import { SellerPricingView } from '@/components/blocks/marketplace/seller-pricing-view';
import { SellerProductManager } from '@/components/blocks/marketplace/seller-product-manager';
import { SellerShopProfile } from '@/components/blocks/marketplace/seller-shop-profile';
import { OrgEditDialog } from '@/components/blocks/organization/org-edit-dialog';
import { OrgHeader } from '@/components/blocks/organization/org-header';
import { PartnerPortalGuard } from '@/components/blocks/organization/partner-portal-guard';
import { buttonVariants } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { meQuery } from '@/hooks/use-auth';
import type { Organization } from '@/types/api';

function SellerPortalView({
  organization,
  role,
  isApproved,
}: {
  organization: Organization;
  role: 'owner' | 'member';
  isApproved: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState('products');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const { data: me } = useQuery(meQuery());

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground bg-accent px-2 py-0.5 rounded-xs">
              <Store className="size-3.5" />
              Marketplace Partner
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">Merchant Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-0.5">
            Seller Portal
          </h1>
        </div>

        {/* Action Button */}
        {role === 'owner' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Link
              href="/marketplace"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5' })}
            >
              <ShoppingBag className="size-3.5" />
              <span>View Buyer Marketplace</span>
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

      {/* Seller Analytics Dashboard */}
      <SellerAnalyticsView />

      {/* 4 Tabs: Products, Pricing & Discounts, Orders & Redemptions, Store Profile */}
      <div className="space-y-6">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'products', label: 'Products & Inventory' },
            { value: 'pricing', label: 'Pricing & Coin Discounts' },
            { value: 'orders', label: 'Orders & Redemptions' },
            { value: 'shop', label: 'Store Profile' },
          ]}
        />

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <SellerProductManager isApproved={isApproved} isOwner={role === 'owner'} />
        )}

        {/* Tab 2: Pricing & Coin Discounts */}
        {activeTab === 'pricing' && (
          <SellerPricingView
            isApproved={isApproved}
            isOwner={role === 'owner'}
            onNavigateToProducts={() => setActiveTab('products')}
          />
        )}

        {/* Tab 3: Orders & Redemptions */}
        {activeTab === 'orders' && (
          <SellerOrdersManager isApproved={isApproved} isOwner={role === 'owner'} />
        )}

        {/* Tab 4: Store Profile & Verification */}
        {(activeTab === 'shop' || activeTab === 'profile') && (
          <SellerShopProfile organization={organization} isOwner={role === 'owner'} />
        )}
      </div>

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

export default function SellerPortalPage() {
  return (
    <PartnerPortalGuard
      expectedType="seller"
      portalTitle="Seller Portal"
      partnerLabel="Marketplace Partner"
    >
      {(props) => <SellerPortalView {...props} />}
    </PartnerPortalGuard>
  );
}
