'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateBundlePrice, type BundlePriceResult } from '@/lib/utils/pricing';

export interface CartItem {
  photoId: string;
  eventId: string;
  eventName: string;
  thumbnailUrl: string;
  priceCents: number;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'addedAt'>) => void;
  removeItem: (photoId: string) => void;
  clearCart: () => void;
  getTotal: () => BundlePriceResult;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Don't add duplicates
          if (state.items.some((i) => i.photoId === item.photoId)) {
            return state;
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                addedAt: Date.now(),
              },
            ],
          };
        });
      },

      removeItem: (photoId) => {
        set((state) => ({
          items: state.items.filter((item) => item.photoId !== photoId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const { items } = get();
        return calculateBundlePrice(items.length);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'marathon-photo-cart',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version) => {
        // Handle migrations if needed
        if (version === 0) {
          return { items: [], ...persistedState };
        }
        return persistedState as CartState;
      },
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.items.length);
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useIsInCart = (photoId: string) =>
  useCartStore((state) => state.items.some((item) => item.photoId === photoId));
