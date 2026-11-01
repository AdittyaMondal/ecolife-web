'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Boxes,
  CircleDollarSign,
  Coins,
  Package,
  Plus,
  ShoppingBag,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { OrgEditDialog } from '@/components/blocks/organization/org-edit-dialog';
import { OrgHeader } from '@/components/blocks/organization/org-header';
import { PartnerPortalGuard } from '@/components/blocks/organization/partner-portal-guard';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const verification = (organization.verificationDetails as Record<string, string>) || {};

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

      {/* Quick Seller Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Products
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <Boxes className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {isApproved ? '0' : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isApproved ? 'Published in eco catalog' : 'Awaiting approval to publish'}
          </p>
        </Card>

        <Card className="p-5 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-positive/10 text-positive">
              <Package className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {isApproved ? '0' : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Fulfilled via marketplace</p>
        </Card>

        <Card className="p-5 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gross Sales
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-amber-500/10 text-amber-500">
              <CircleDollarSign className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {isApproved ? '₹0' : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Net customer transactions</p>
        </Card>

        <Card className="p-5 border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Coins Redeemed
            </span>
            <span className="flex size-8 items-center justify-center rounded-xs bg-tertiary/20 text-foreground">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="tabular font-mono text-3xl font-extrabold text-foreground">
            {isApproved ? '0' : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Settled by platform liability</p>
        </Card>
      </div>

      {/* Tabs: Products, Orders, Store Profile */}
      <div className="space-y-4">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'products', label: 'Products & Inventory' },
            { value: 'orders', label: 'Orders & Redemptions' },
            { value: 'profile', label: 'Store & Verification Details' },
          ]}
        />

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <Card className="p-6 border-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Sustainable Merchandise Catalog
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your eco-friendly product listings, prices, stock, and coin discounts.
                </p>
              </div>
              <Button size="sm" disabled={!isApproved} className="gap-1.5">
                <Plus className="size-3.5" />
                <span>Add Product</span>
              </Button>
            </div>

            {!isApproved ? (
              <div className="rounded-sm border border-dashed border-border p-8 text-center space-y-2">
                <AlertCircle className="size-8 text-amber-500 mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  Listing creation is locked while pending approval
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Once your merchant credentials (GSTIN / Business registration) are approved by the
                  EcoLife team, you will be able to add and price sustainable products here.
                </p>
              </div>
            ) : (
              <div className="rounded-sm border border-dashed border-border p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">No products added yet</p>
                <p className="text-xs text-muted-foreground">
                  Click &quot;Add Product&quot; to publish your first eco item to the EcoLife
                  marketplace.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <Card className="p-6 border-border shadow-subtle space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Orders &amp; Coin Redemptions
              </h2>
              <p className="text-xs text-muted-foreground">
                Track customer orders, shipping status, and platform coin settlements.
              </p>
            </div>

            <div className="rounded-sm border border-dashed border-border p-8 text-center space-y-2">
              <Package className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">No orders received yet</p>
              <p className="text-xs text-muted-foreground">
                When customers purchase your items using rupee payments or EcoCoins, orders will
                appear here.
              </p>
            </div>
          </Card>
        )}

        {/* Tab 3: Store Profile & Verification */}
        {activeTab === 'profile' && (
          <Card className="p-6 border-border shadow-subtle space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Merchant Business Profile &amp; Verification
              </h2>
              <p className="text-xs text-muted-foreground">
                Submitted registration details for platform verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-sm border border-border p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Store / Brand Name
                </span>
                <p className="font-semibold text-foreground">{organization.name}</p>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Business Location
                </span>
                <p className="font-semibold text-foreground">
                  {organization.city || 'Not specified'}, {organization.regionCode || 'IN'}
                </p>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  GSTIN / Tax ID
                </span>
                <p className="font-semibold font-mono text-foreground">
                  {verification.gstin || verification.taxId || 'Submitted with application'}
                </p>
              </div>

              <div className="rounded-sm border border-border p-4 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Store Category
                </span>
                <p className="font-semibold capitalize text-foreground">
                  {verification.storeCategory || 'Sustainable Goods'}
                </p>
              </div>
            </div>
          </Card>
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
