/**
 * Pricing utilities for bundle calculations and currency formatting
 */

export const BUNDLE_PRICING = {
  SINGLE: { minPhotos: 1, maxPhotos: 4, pricePerPhoto: 100 }, // $1.00 each
  PACK_5: { minPhotos: 5, maxPhotos: 9, totalPrice: 400 }, // $4.00 flat
  PACK_10: { minPhotos: 10, maxPhotos: 19, totalPrice: 700 }, // $7.00 flat
  PACK_20: { minPhotos: 20, maxPhotos: Infinity, totalPrice: 1200 }, // $12.00 flat
} as const;

export const REVENUE_SPLIT = {
  PHOTOGRAPHER_PERCENTAGE: 70,
  PLATFORM_PERCENTAGE: 30,
} as const;

export type BundleType = 'single' | 'pack_5' | 'pack_10' | 'pack_20';

export interface BundlePriceResult {
  totalCents: number;
  bundleType: BundleType;
  savingsCents: number;
  pricePerPhotoCents: number;
}

/**
 * Calculate the bundle price for a given number of photos
 * @param photoCount - Number of photos in the cart
 * @returns Bundle pricing details
 */
export function calculateBundlePrice(photoCount: number): BundlePriceResult {
  if (photoCount <= 0) {
    return {
      totalCents: 0,
      bundleType: 'single',
      savingsCents: 0,
      pricePerPhotoCents: 0,
    };
  }

  const singlePrice = photoCount * BUNDLE_PRICING.SINGLE.pricePerPhoto;

  if (photoCount >= BUNDLE_PRICING.PACK_20.minPhotos) {
    return {
      totalCents: BUNDLE_PRICING.PACK_20.totalPrice,
      bundleType: 'pack_20',
      savingsCents: singlePrice - BUNDLE_PRICING.PACK_20.totalPrice,
      pricePerPhotoCents: Math.round(BUNDLE_PRICING.PACK_20.totalPrice / photoCount),
    };
  }

  if (photoCount >= BUNDLE_PRICING.PACK_10.minPhotos) {
    return {
      totalCents: BUNDLE_PRICING.PACK_10.totalPrice,
      bundleType: 'pack_10',
      savingsCents: singlePrice - BUNDLE_PRICING.PACK_10.totalPrice,
      pricePerPhotoCents: Math.round(BUNDLE_PRICING.PACK_10.totalPrice / photoCount),
    };
  }

  if (photoCount >= BUNDLE_PRICING.PACK_5.minPhotos) {
    return {
      totalCents: BUNDLE_PRICING.PACK_5.totalPrice,
      bundleType: 'pack_5',
      savingsCents: singlePrice - BUNDLE_PRICING.PACK_5.totalPrice,
      pricePerPhotoCents: Math.round(BUNDLE_PRICING.PACK_5.totalPrice / photoCount),
    };
  }

  return {
    totalCents: singlePrice,
    bundleType: 'single',
    savingsCents: 0,
    pricePerPhotoCents: BUNDLE_PRICING.SINGLE.pricePerPhoto,
  };
}

/**
 * Calculate the revenue split between photographer and platform
 * @param amountCents - Total transaction amount in cents
 * @returns Split amounts
 */
export function calculateRevenueSplit(amountCents: number): {
  photographerAmountCents: number;
  platformFeeCents: number;
} {
  const photographerAmountCents = Math.round(
    (amountCents * REVENUE_SPLIT.PHOTOGRAPHER_PERCENTAGE) / 100
  );
  const platformFeeCents = amountCents - photographerAmountCents;

  return {
    photographerAmountCents,
    platformFeeCents,
  };
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$4.00")
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Get human-readable bundle description
 * @param bundleType - Type of bundle
 * @param photoCount - Number of photos
 * @returns Description string
 */
export function getBundleDescription(bundleType: BundleType, photoCount: number): string {
  switch (bundleType) {
    case 'pack_20':
      return `20+ Photo Pack (${photoCount} photos)`;
    case 'pack_10':
      return `10-Pack (${photoCount} photos)`;
    case 'pack_5':
      return `5-Pack (${photoCount} photos)`;
    default:
      return photoCount === 1 ? '1 Photo' : `${photoCount} Photos`;
  }
}
