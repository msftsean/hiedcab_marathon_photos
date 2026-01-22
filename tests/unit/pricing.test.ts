import { describe, it, expect } from 'vitest';
import {
  calculateBundlePrice,
  calculateRevenueSplit,
  formatCurrency,
  getBundleDescription,
  BUNDLE_PRICING,
  REVENUE_SPLIT,
} from '@/lib/utils/pricing';

describe('calculateBundlePrice', () => {
  describe('single photo pricing', () => {
    it('should return $1.00 for 1 photo', () => {
      const result = calculateBundlePrice(1);
      expect(result.totalCents).toBe(100);
      expect(result.bundleType).toBe('single');
      expect(result.savingsCents).toBe(0);
      expect(result.pricePerPhotoCents).toBe(100);
    });

    it('should return $2.00 for 2 photos', () => {
      const result = calculateBundlePrice(2);
      expect(result.totalCents).toBe(200);
      expect(result.bundleType).toBe('single');
      expect(result.savingsCents).toBe(0);
    });

    it('should return $4.00 for 4 photos (max single pricing)', () => {
      const result = calculateBundlePrice(4);
      expect(result.totalCents).toBe(400);
      expect(result.bundleType).toBe('single');
      expect(result.savingsCents).toBe(0);
    });
  });

  describe('5-pack bundle pricing', () => {
    it('should return $4.00 for 5 photos', () => {
      const result = calculateBundlePrice(5);
      expect(result.totalCents).toBe(400);
      expect(result.bundleType).toBe('pack_5');
      expect(result.savingsCents).toBe(100); // $5 - $4 = $1 savings
    });

    it('should return $4.00 for 6 photos', () => {
      const result = calculateBundlePrice(6);
      expect(result.totalCents).toBe(400);
      expect(result.bundleType).toBe('pack_5');
      expect(result.savingsCents).toBe(200); // $6 - $4 = $2 savings
    });

    it('should return $4.00 for 9 photos (max 5-pack)', () => {
      const result = calculateBundlePrice(9);
      expect(result.totalCents).toBe(400);
      expect(result.bundleType).toBe('pack_5');
      expect(result.savingsCents).toBe(500); // $9 - $4 = $5 savings
    });
  });

  describe('10-pack bundle pricing', () => {
    it('should return $7.00 for 10 photos', () => {
      const result = calculateBundlePrice(10);
      expect(result.totalCents).toBe(700);
      expect(result.bundleType).toBe('pack_10');
      expect(result.savingsCents).toBe(300); // $10 - $7 = $3 savings
    });

    it('should return $7.00 for 15 photos', () => {
      const result = calculateBundlePrice(15);
      expect(result.totalCents).toBe(700);
      expect(result.bundleType).toBe('pack_10');
      expect(result.savingsCents).toBe(800); // $15 - $7 = $8 savings
    });

    it('should return $7.00 for 19 photos (max 10-pack)', () => {
      const result = calculateBundlePrice(19);
      expect(result.totalCents).toBe(700);
      expect(result.bundleType).toBe('pack_10');
      expect(result.savingsCents).toBe(1200); // $19 - $7 = $12 savings
    });
  });

  describe('20-pack bundle pricing', () => {
    it('should return $12.00 for 20 photos', () => {
      const result = calculateBundlePrice(20);
      expect(result.totalCents).toBe(1200);
      expect(result.bundleType).toBe('pack_20');
      expect(result.savingsCents).toBe(800); // $20 - $12 = $8 savings
    });

    it('should return $12.00 for 25 photos', () => {
      const result = calculateBundlePrice(25);
      expect(result.totalCents).toBe(1200);
      expect(result.bundleType).toBe('pack_20');
      expect(result.savingsCents).toBe(1300); // $25 - $12 = $13 savings
    });

    it('should return $12.00 for 50 photos', () => {
      const result = calculateBundlePrice(50);
      expect(result.totalCents).toBe(1200);
      expect(result.bundleType).toBe('pack_20');
      expect(result.savingsCents).toBe(3800); // $50 - $12 = $38 savings
    });

    it('should return $12.00 for 100 photos', () => {
      const result = calculateBundlePrice(100);
      expect(result.totalCents).toBe(1200);
      expect(result.bundleType).toBe('pack_20');
      expect(result.savingsCents).toBe(8800); // $100 - $12 = $88 savings
    });
  });

  describe('edge cases', () => {
    it('should return 0 for 0 photos', () => {
      const result = calculateBundlePrice(0);
      expect(result.totalCents).toBe(0);
      expect(result.bundleType).toBe('single');
      expect(result.savingsCents).toBe(0);
    });

    it('should return 0 for negative photo count', () => {
      const result = calculateBundlePrice(-5);
      expect(result.totalCents).toBe(0);
      expect(result.bundleType).toBe('single');
      expect(result.savingsCents).toBe(0);
    });
  });

  describe('pricePerPhotoCents calculation', () => {
    it('should calculate correct per-photo price for bundles', () => {
      const pack5 = calculateBundlePrice(5);
      expect(pack5.pricePerPhotoCents).toBe(80); // $4.00 / 5 = $0.80

      const pack10 = calculateBundlePrice(10);
      expect(pack10.pricePerPhotoCents).toBe(70); // $7.00 / 10 = $0.70

      const pack20 = calculateBundlePrice(20);
      expect(pack20.pricePerPhotoCents).toBe(60); // $12.00 / 20 = $0.60

      const pack25 = calculateBundlePrice(25);
      expect(pack25.pricePerPhotoCents).toBe(48); // $12.00 / 25 = $0.48
    });
  });
});

describe('calculateRevenueSplit', () => {
  it('should split 70/30 for photographer/platform', () => {
    const result = calculateRevenueSplit(1000);
    expect(result.photographerAmountCents).toBe(700);
    expect(result.platformFeeCents).toBe(300);
  });

  it('should handle $1.00 transaction', () => {
    const result = calculateRevenueSplit(100);
    expect(result.photographerAmountCents).toBe(70);
    expect(result.platformFeeCents).toBe(30);
  });

  it('should handle $4.00 bundle', () => {
    const result = calculateRevenueSplit(400);
    expect(result.photographerAmountCents).toBe(280);
    expect(result.platformFeeCents).toBe(120);
  });

  it('should handle $7.00 bundle', () => {
    const result = calculateRevenueSplit(700);
    expect(result.photographerAmountCents).toBe(490);
    expect(result.platformFeeCents).toBe(210);
  });

  it('should handle $12.00 bundle', () => {
    const result = calculateRevenueSplit(1200);
    expect(result.photographerAmountCents).toBe(840);
    expect(result.platformFeeCents).toBe(360);
  });

  it('should handle rounding correctly', () => {
    // $1.01 = 101 cents
    const result = calculateRevenueSplit(101);
    expect(result.photographerAmountCents).toBe(71); // 70.7 rounded
    expect(result.platformFeeCents).toBe(30); // remainder
    expect(result.photographerAmountCents + result.platformFeeCents).toBe(101);
  });

  it('should handle zero amount', () => {
    const result = calculateRevenueSplit(0);
    expect(result.photographerAmountCents).toBe(0);
    expect(result.platformFeeCents).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('should format cents as USD by default', () => {
    expect(formatCurrency(100)).toBe('$1.00');
    expect(formatCurrency(400)).toBe('$4.00');
    expect(formatCurrency(1200)).toBe('$12.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle fractional dollars', () => {
    expect(formatCurrency(99)).toBe('$0.99');
    expect(formatCurrency(150)).toBe('$1.50');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(10000)).toBe('$100.00');
    expect(formatCurrency(999999)).toBe('$9,999.99');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toMatch(/€|EUR/);
    expect(formatCurrency(100, 'GBP')).toMatch(/£|GBP/);
  });
});

describe('getBundleDescription', () => {
  it('should return correct description for single photo', () => {
    expect(getBundleDescription('single', 1)).toBe('1 Photo');
  });

  it('should return correct description for multiple singles', () => {
    expect(getBundleDescription('single', 3)).toBe('3 Photos');
  });

  it('should return correct description for 5-pack', () => {
    expect(getBundleDescription('pack_5', 5)).toBe('5-Pack (5 photos)');
    expect(getBundleDescription('pack_5', 7)).toBe('5-Pack (7 photos)');
  });

  it('should return correct description for 10-pack', () => {
    expect(getBundleDescription('pack_10', 10)).toBe('10-Pack (10 photos)');
    expect(getBundleDescription('pack_10', 15)).toBe('10-Pack (15 photos)');
  });

  it('should return correct description for 20-pack', () => {
    expect(getBundleDescription('pack_20', 20)).toBe('20+ Photo Pack (20 photos)');
    expect(getBundleDescription('pack_20', 50)).toBe('20+ Photo Pack (50 photos)');
  });
});

describe('Constants', () => {
  it('should have correct BUNDLE_PRICING values', () => {
    expect(BUNDLE_PRICING.SINGLE.pricePerPhoto).toBe(100);
    expect(BUNDLE_PRICING.PACK_5.totalPrice).toBe(400);
    expect(BUNDLE_PRICING.PACK_10.totalPrice).toBe(700);
    expect(BUNDLE_PRICING.PACK_20.totalPrice).toBe(1200);
  });

  it('should have correct REVENUE_SPLIT percentages', () => {
    expect(REVENUE_SPLIT.PHOTOGRAPHER_PERCENTAGE).toBe(70);
    expect(REVENUE_SPLIT.PLATFORM_PERCENTAGE).toBe(30);
    expect(REVENUE_SPLIT.PHOTOGRAPHER_PERCENTAGE + REVENUE_SPLIT.PLATFORM_PERCENTAGE).toBe(100);
  });
});
