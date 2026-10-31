/**
 * High-resolution, curated eco imagery fallbacks from Unsplash.
 */

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  'tulsi-sapling':
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
  'neem-sapling':
    'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
  'money-plant-jar':
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  'snake-plant-pot':
    'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
  'curry-leaf-plant':
    'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
  'balcony-herb-trio':
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
  'compost-bin-10l':
    'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80',
  'led-bulb-pack-4':
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
  'solar-lantern':
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  'jute-laundry-basket':
    'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80',
  'cloth-shopping-bags-5':
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'bamboo-toothbrush-4':
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
  'shampoo-bar':
    'https://images.unsplash.com/photo-1608248597359-55006b533a0b?auto=format&fit=crop&w=800&q=80',
  'neem-wood-comb':
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'menstrual-cup':
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
  'bamboo-razor':
    'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
  'copper-water-bottle':
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  'steel-tiffin-3-tier':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'beeswax-food-wraps-3':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'bamboo-cutlery-travel-set':
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  'clay-cookware-handi':
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'recycled-notebook-a5':
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'seed-pencils-10':
    'https://images.unsplash.com/photo-1585336261026-407421cb4172?auto=format&fit=crop&w=800&q=80',
  'jute-laptop-sleeve':
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  plants:
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
  household:
    'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80',
  kitchen:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  personal_care:
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
  stationery:
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
};

const EVENT_COVERS: Record<string, string> = {
  'terrace-composting-workshop':
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  'versova-beach-cleanup':
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
  'cubbon-park-plant-drive':
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  'powai-lake-cleanup':
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80',
  'ewaste-collection-drive':
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  'balcony-garden-starter':
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
};

const EVENT_TYPE_FALLBACKS: Record<string, string> = {
  plant_drive:
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  cleanup_drive:
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
  recycling_drive:
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  workshop:
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
  awareness:
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
};

export function getProductImageUrl(product: {
  slug: string;
  category?: string;
  imageUrl?: string | null;
}): string {
  if (product.imageUrl && !product.imageUrl.includes('cdn.ecolife.app')) {
    return product.imageUrl;
  }
  return (
    PRODUCT_IMAGE_FALLBACKS[product.slug] ??
    (product.category ? CATEGORY_FALLBACKS[product.category] : undefined) ??
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
  );
}

export function getEventCoverUrl(event: {
  slug: string;
  type?: string;
  coverUrl?: string | null;
}): string {
  if (event.coverUrl && !event.coverUrl.includes('cdn.ecolife.app')) {
    return event.coverUrl;
  }
  return (
    EVENT_COVERS[event.slug] ??
    (event.type ? EVENT_TYPE_FALLBACKS[event.type] : undefined) ??
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'
  );
}
