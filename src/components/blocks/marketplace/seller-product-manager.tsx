'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  Edit3,
  Filter,
  ImageOff,
  Leaf,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog, ModalDialog } from '@/components/ui/dialog';
import { Input, Select, Textarea } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/hooks/use-marketplace';
import {
  type SellerProductFilters,
  sellerProductsQuery,
  useCreateSellerProduct,
  useDeleteSellerProduct,
  useUpdateSellerProduct,
} from '@/hooks/use-seller';
import { formatKg, formatPaise } from '@/lib/format';
import { getProductImageUrl } from '@/lib/images';
import type { CreateSellerProductBody, Product, UpdateSellerProductBody } from '@/types/api';

export interface SellerProductManagerProps {
  isApproved?: boolean;
  isOwner?: boolean;
  className?: string;
}

/** Check if product discount is currently effective by dates and values */
export function isDiscountActive(product: {
  discountType?: 'none' | 'percentage' | 'fixed' | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
}): boolean {
  if (!product.discountType || product.discountType === 'none') return false;
  if (!product.discountValue || product.discountValue <= 0) return false;
  const now = new Date();
  if (product.discountStartDate && new Date(product.discountStartDate) > now) {
    return false;
  }
  if (product.discountEndDate && new Date(product.discountEndDate) < now) {
    return false;
  }
  return true;
}

function toDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDatetimeLocal(dtLocal: string): string | null {
  if (!dtLocal.trim()) return null;
  const d = new Date(dtLocal);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

function ProductFormModal({ open, onClose, product }: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const createMutation = useCreateSellerProduct();
  const updateMutation = useUpdateSellerProduct();

  // Form states
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<ProductCategory>('plants');
  const [priceRupees, setPriceRupees] = React.useState('');
  const [stock, setStock] = React.useState('0');
  const [co2SavedKg, setCo2SavedKg] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  // Discount states
  const [discountType, setDiscountType] = React.useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = React.useState('');
  const [discountStartDate, setDiscountStartDate] = React.useState('');
  const [discountEndDate, setDiscountEndDate] = React.useState('');

  // Coin states
  const [allowCoinRedemption, setAllowCoinRedemption] = React.useState(true);
  const [maxCoinRedemptionPercent, setMaxCoinRedemptionPercent] = React.useState('20');

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync state on open/edit
  React.useEffect(() => {
    if (!open) return;

    if (product) {
      setName(product.name ?? '');
      setDescription(product.description ?? '');
      setCategory(product.category ?? 'plants');
      setPriceRupees((product.pricePaise / 100).toString());
      setStock((product.stock ?? 0).toString());
      setCo2SavedKg(
        product.co2SavedKg !== null && product.co2SavedKg !== undefined
          ? product.co2SavedKg.toString()
          : '',
      );
      setImageUrl(product.imageUrl ?? '');
      setIsActive(product.isActive ?? true);

      setDiscountType(product.discountType ?? 'none');
      if (product.discountType === 'fixed') {
        setDiscountValue(((product.discountValue ?? 0) / 100).toString());
      } else {
        setDiscountValue((product.discountValue ?? 0).toString());
      }
      setDiscountStartDate(toDatetimeLocal(product.discountStartDate));
      setDiscountEndDate(toDatetimeLocal(product.discountEndDate));

      setAllowCoinRedemption(product.allowCoinRedemption ?? true);
      setMaxCoinRedemptionPercent((product.maxCoinRedemptionPercent ?? 20).toString());
    } else {
      setName('');
      setDescription('');
      setCategory('plants');
      setPriceRupees('');
      setStock('0');
      setCo2SavedKg('0.5');
      setImageUrl('');
      setIsActive(true);

      setDiscountType('none');
      setDiscountValue('');
      setDiscountStartDate('');
      setDiscountEndDate('');

      setAllowCoinRedemption(true);
      setMaxCoinRedemptionPercent('20');
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    const priceNum = parseFloat(priceRupees);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price in Rupees.');
      return;
    }
    const pricePaise = Math.round(priceNum * 100);

    const stockNum = parseInt(stock, 10);
    if (Number.isNaN(stockNum) || stockNum < 0) {
      toast.error('Stock quantity must be a non-negative number.');
      return;
    }

    const co2Num = co2SavedKg.trim() ? parseFloat(co2SavedKg) : null;
    if (co2Num !== null && (Number.isNaN(co2Num) || co2Num < 0)) {
      toast.error('CO₂ saved must be a positive number.');
      return;
    }

    let discountVal = 0;
    if (discountType === 'percentage') {
      const pct = parseInt(discountValue, 10);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        toast.error('Percentage discount must be between 0 and 100%.');
        return;
      }
      discountVal = pct;
    } else if (discountType === 'fixed') {
      const fixedRupees = parseFloat(discountValue);
      if (Number.isNaN(fixedRupees) || fixedRupees < 0) {
        toast.error('Fixed discount amount must be a non-negative number.');
        return;
      }
      discountVal = Math.round(fixedRupees * 100);
      if (discountVal > pricePaise) {
        toast.error('Fixed discount cannot exceed product base price.');
        return;
      }
    }

    const startIso = fromDatetimeLocal(discountStartDate);
    const endIso = fromDatetimeLocal(discountEndDate);
    if (startIso && endIso && new Date(startIso) >= new Date(endIso)) {
      toast.error('Discount end date must be after start date.');
      return;
    }

    const maxCoinPct = parseInt(maxCoinRedemptionPercent, 10);
    if (Number.isNaN(maxCoinPct) || maxCoinPct < 0 || maxCoinPct > 100) {
      toast.error('Max coin redemption must be between 0 and 100%.');
      return;
    }

    const cleanImg = imageUrl.trim() || null;
    const images = cleanImg ? [cleanImg] : [];

    setIsSubmitting(true);
    try {
      if (isEditing && product) {
        const body: UpdateSellerProductBody & { id: number } = {
          id: product.id,
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          pricePaise,
          imageUrl: cleanImg,
          images,
          stock: stockNum,
          co2SavedKg: co2Num,
          discountType,
          discountValue: discountVal,
          discountStartDate: startIso,
          discountEndDate: endIso,
          allowCoinRedemption,
          maxCoinRedemptionPercent: maxCoinPct,
          isActive,
        };
        await updateMutation.mutateAsync(body);
        toast.success(`"${name.trim()}" updated successfully.`);
      } else {
        const body: CreateSellerProductBody = {
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          pricePaise,
          imageUrl: cleanImg,
          images,
          stock: stockNum,
          co2SavedKg: co2Num,
          discountType,
          discountValue: discountVal,
          discountStartDate: startIso,
          discountEndDate: endIso,
          allowCoinRedemption,
          maxCoinRedemptionPercent: maxCoinPct,
          isActive,
        };
        await createMutation.mutateAsync(body);
        toast.success(`"${name.trim()}" published to catalog.`);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Product Listing' : 'Add New Sustainable Product'}
      description={
        isEditing
          ? 'Update pricing, stock availability, discounts, and item details.'
          : 'List an eco-friendly product with sustainable impact metrics in the marketplace.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-1.5">
            <Package className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              General Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="product-name" className="text-xs font-semibold text-foreground">
                Product Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handmade Neem Wood Comb"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-category" className="text-xs font-semibold text-foreground">
                Category <span className="text-destructive">*</span>
              </label>
              <Select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                required
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-co2" className="text-xs font-semibold text-foreground">
                CO₂ Offset Saved (kg)
              </label>
              <Input
                id="product-co2"
                type="number"
                step="0.1"
                min="0"
                value={co2SavedKg}
                onChange={(e) => setCo2SavedKg(e.target.value)}
                placeholder="e.g. 0.8"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="product-desc" className="text-xs font-semibold text-foreground">
                Description
              </label>
              <Textarea
                id="product-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe material sustainability, eco certifications, plastic-free packaging, etc."
                rows={3}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="product-image" className="text-xs font-semibold text-foreground">
                Product Image URL
              </label>
              <Input
                id="product-image"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use a curated eco photo placeholder based on category.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-1.5">
            <Tag className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pricing &amp; Inventory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="product-price" className="text-xs font-semibold text-foreground">
                Base Price (₹ INR) <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                placeholder="249.00"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-stock" className="text-xs font-semibold text-foreground">
                Available Stock <span className="text-destructive">*</span>
              </label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="25"
                required
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <span className="text-xs font-semibold text-foreground mb-2">Listing Status</span>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer min-h-11">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded-xs border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">
                  {isActive ? 'Active (Live in store)' : 'Inactive (Hidden)'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Promotions & Discounts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-1.5">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Promotional Discount
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="product-discount-type"
                className="text-xs font-semibold text-foreground"
              >
                Discount Type
              </label>
              <Select
                id="product-discount-type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'none' | 'percentage' | 'fixed')}
              >
                <option value="none">No Discount</option>
                <option value="percentage">Percentage (%) Off</option>
                <option value="fixed">Fixed Amount (₹) Off</option>
              </Select>
            </div>

            {discountType !== 'none' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="product-discount-val"
                  className="text-xs font-semibold text-foreground"
                >
                  {discountType === 'percentage'
                    ? 'Discount Percentage (%)'
                    : 'Discount Amount (₹)'}
                </label>
                <Input
                  id="product-discount-val"
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? '15' : '50'}
                  required
                />
              </div>
            )}

            {discountType !== 'none' && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="product-discount-start"
                    className="text-xs font-semibold text-foreground"
                  >
                    Discount Start Date (Optional)
                  </label>
                  <Input
                    id="product-discount-start"
                    type="datetime-local"
                    value={discountStartDate}
                    onChange={(e) => setDiscountStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="product-discount-end"
                    className="text-xs font-semibold text-foreground"
                  >
                    Discount End Date (Optional)
                  </label>
                  <Input
                    id="product-discount-end"
                    type="datetime-local"
                    value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: EcoCoin Redemptions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-1.5">
            <Coins className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              EcoCoin Loyalty Redemption
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground mb-1 block">Accept Coins</span>
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer min-h-11">
                <input
                  type="checkbox"
                  checked={allowCoinRedemption}
                  onChange={(e) => setAllowCoinRedemption(e.target.checked)}
                  className="size-4 rounded-xs border-input text-primary focus:ring-ring"
                />
                <span className="font-medium text-xs">
                  Allow customers to spend EcoCoins towards this item
                </span>
              </label>
            </div>

            {allowCoinRedemption && (
              <div className="space-y-1.5">
                <label htmlFor="product-max-coin" className="text-xs font-semibold text-foreground">
                  Max Coin Redemption (%)
                </label>
                <Input
                  id="product-max-coin"
                  type="number"
                  min="0"
                  max="100"
                  value={maxCoinRedemptionPercent}
                  onChange={(e) => setMaxCoinRedemptionPercent(e.target.value)}
                  placeholder="20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Standard platform policy allows up to 20% order subtotal settled via coins.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}

export function SellerProductManager({
  isApproved = true,
  isOwner = true,
  className,
}: SellerProductManagerProps) {
  const [statusTab, setStatusTab] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Dialog controls
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  const updateMutation = useUpdateSellerProduct();
  const deleteMutation = useDeleteSellerProduct();

  // Query filters
  const filters: SellerProductFilters = {
    status: statusTab,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    q: searchQuery.trim() || undefined,
  };

  const {
    data: pageData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery(sellerProductsQuery(filters));

  const products = pageData?.items ?? [];

  // Toggle active/inactive status inline
  const handleToggleActive = async (p: Product) => {
    if (!isOwner) return;
    setTogglingId(p.id);
    try {
      await updateMutation.mutateAsync({
        id: p.id,
        isActive: !p.isActive,
      });
      toast.success(p.isActive ? `"${p.name}" marked inactive` : `"${p.name}" activated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
      toast.success(`"${deletingProduct.name}" removed from catalog.`);
      setDeletingProduct(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {/* Top Banner if not approved */}
      {!isApproved && (
        <div className="rounded-sm border border-warning/30 bg-warning-surface p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-warning">
              Merchant Application Pending Approval
            </h4>
            <p className="text-xs text-muted-foreground">
              Your store profile and GSTIN/tax credentials are currently undergoing review by the
              EcoLife verification team. Product creation and public catalog visibility will be
              enabled once your account is approved.
            </p>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <Card className="p-4 border-border bg-card shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <SegmentedControl
            value={statusTab}
            onChange={(val) => setStatusTab(val as 'all' | 'active' | 'inactive')}
            options={[
              { value: 'all', label: 'All Products' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />

          {/* Action button */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-1.5"
              title="Refresh list"
            >
              <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              disabled={!isApproved || !isOwner}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add New Product</span>
            </Button>
          </div>
        </div>

        {/* Secondary Filters: Search & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-border">
          <div className="relative sm:col-span-2">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, keywords..."
              className="pl-9 min-h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground shrink-0 hidden sm:inline" />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-10 text-sm"
            >
              <option value="all">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12 text-center border-border shadow-subtle space-y-3">
          <RefreshCw className="size-6 text-primary animate-spin mx-auto" />
          <p className="text-sm font-semibold text-foreground">Loading catalog items...</p>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card className="p-8 text-center border-destructive/20 bg-danger-surface space-y-3">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <h4 className="text-sm font-bold text-destructive">Could not load products</h4>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected network error occurred.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <Card className="p-12 text-center border-dashed border-border shadow-subtle space-y-3">
          <Package className="size-10 text-muted-foreground mx-auto stroke-1" />
          <h4 className="text-base font-semibold text-foreground">No products found</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all' || statusTab !== 'all'
              ? 'No catalog items match your search and filter criteria. Try resetting filters.'
              : 'You have not added any sustainable merchandise to your store catalog yet.'}
          </p>
          {isApproved && isOwner && (
            <div className="pt-2">
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5">
                <Plus className="size-4" />
                <span>Add Your First Product</span>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Products Grid / Table */}
      {!isLoading && !isError && products.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong className="text-foreground">{products.length}</strong> product
              {products.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p) => {
              const activeDiscount = isDiscountActive(p);
              const effectivePrice = p.effectivePricePaise ?? p.pricePaise;
              const imageUrl = getProductImageUrl(p);
              const categoryLabel =
                PRODUCT_CATEGORIES.find((c) => c.value === p.category)?.label ?? p.category;

              // Stock badge computation
              let stockVariant: 'positive' | 'warning' | 'destructive' = 'positive';
              let stockLabel = `${p.stock} in stock`;
              if (p.stock === 0) {
                stockVariant = 'destructive';
                stockLabel = 'Out of Stock';
              } else if (p.stock <= 5) {
                stockVariant = 'warning';
                stockLabel = `Low Stock (${p.stock})`;
              }

              return (
                <Card
                  key={p.id}
                  className="flex flex-col justify-between overflow-hidden border-border bg-card shadow-subtle hover:border-primary/40 transition-colors"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: Image, Title, Badges */}
                    <div className="flex items-start gap-3">
                      <div className="relative size-16 shrink-0 rounded-sm overflow-hidden bg-muted border border-border flex items-center justify-center">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={p.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <ImageOff className="size-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="accent" className="text-[10px] px-1.5 py-0.5">
                            {categoryLabel}
                          </Badge>
                          <Badge variant={stockVariant} className="text-[10px] px-1.5 py-0.5">
                            {stockLabel}
                          </Badge>
                        </div>

                        <h4 className="text-sm font-bold text-foreground truncate" title={p.name}>
                          {p.name}
                        </h4>

                        <p
                          className="text-[11px] font-mono text-muted-foreground truncate"
                          title={p.slug}
                        >
                          /{p.slug}
                        </p>
                      </div>
                    </div>

                    {/* Price and Active Discount Badge */}
                    <div className="rounded-sm bg-muted/40 p-3 border border-border/60 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Listing Price
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-foreground tabular">
                            {formatPaise(effectivePrice)}
                          </span>
                          {activeDiscount && (
                            <span className="text-xs line-through text-muted-foreground tabular">
                              {formatPaise(p.pricePaise)}
                            </span>
                          )}
                        </div>
                      </div>

                      {activeDiscount && (
                        <Badge variant="positive" className="text-xs font-mono font-bold">
                          {p.discountType === 'percentage'
                            ? `${p.discountValue}% off`
                            : `${formatPaise(p.discountValue)} off`}
                        </Badge>
                      )}
                    </div>

                    {/* Meta info tags: Coin redemption + CO2 impact */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {p.allowCoinRedemption ? (
                        <Badge variant="neutral" className="gap-1 text-[11px]">
                          <Coins className="size-3 text-amber-500" />
                          <span>Coins accepted (up to {p.maxCoinRedemptionPercent}%)</span>
                        </Badge>
                      ) : (
                        <Badge variant="muted" className="text-[11px]">
                          No coins
                        </Badge>
                      )}

                      {p.co2SavedKg !== null && p.co2SavedKg !== undefined && p.co2SavedKg > 0 && (
                        <Badge variant="accent" className="gap-1 text-[11px]">
                          <Leaf className="size-3 text-positive" />
                          <span>{formatKg(p.co2SavedKg)} CO₂ saved</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status row */}
                  <div className="px-5 py-3 border-t border-border bg-card/50 flex items-center justify-between gap-2">
                    {/* Active toggle button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      disabled={!isOwner || togglingId === p.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xs border transition-colors ${
                        p.isActive
                          ? 'border-positive/30 bg-accent text-positive hover:bg-accent/80'
                          : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      title={p.isActive ? 'Click to mark as inactive' : 'Click to activate listing'}
                    >
                      {togglingId === p.id ? (
                        <RefreshCw className="size-3 animate-spin" />
                      ) : p.isActive ? (
                        <CheckCircle2 className="size-3 text-positive" />
                      ) : (
                        <XCircle className="size-3 text-muted-foreground" />
                      )}
                      <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* Edit / Delete actions */}
                    {isOwner && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(p)}
                          className="h-8 px-2.5 text-xs gap-1"
                        >
                          <Edit3 className="size-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingProduct(p)}
                          className="h-8 px-2.5 text-xs gap-1 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        >
                          <Trash2 className="size-3" />
                          <span className="sr-only sm:not-sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <ProductFormModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={null}
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        open={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Listing"
        description={
          deletingProduct
            ? `Are you sure you want to permanently remove "${deletingProduct.name}" from your catalog? Existing past orders will remain intact, but customers will no longer be able to view or purchase this item.`
            : ''
        }
        confirmText="Delete Product"
        confirmVariant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
