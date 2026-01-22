'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/Button';
import { formatCurrency, getBundleDescription } from '@/lib/utils/pricing';

interface CartSummaryProps {
  onCheckout?: () => void;
  isCheckingOut?: boolean;
}

export function CartSummary({ onCheckout, isCheckingOut }: CartSummaryProps) {
  const { items, removeItem, getTotal } = useCartStore();
  const pricing = getTotal();

  if (items.length === 0) {
    return (
      <div className="text-center py-12" data-testid="cart-summary">
        <div className="rounded-full bg-gray-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-gray-500">
          Search for photos by bib number to add them to your cart.
        </p>
        <a
          href="/search"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Find Photos
        </a>
      </div>
    );
  }

  return (
    <div data-testid="cart-summary">
      {/* Items list */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={item.photoId}
            className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-200">
              <Image
                src={item.thumbnailUrl}
                alt={`Photo from ${item.eventName}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.eventName}
              </h4>
              <p className="text-sm text-gray-500">
                {formatCurrency(item.priceCents)} each
              </p>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeItem(item.photoId)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Remove from cart"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Pricing summary */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Bundle description */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{getBundleDescription(pricing.bundleType, items.length)}</span>
          <span className="text-gray-900">{formatCurrency(pricing.totalCents)}</span>
        </div>

        {/* Savings */}
        {pricing.savingsCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">You save</span>
            <span className="text-green-600 font-medium">
              -{formatCurrency(pricing.savingsCents)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
          <span>Total</span>
          <span data-testid="order-total">{formatCurrency(pricing.totalCents)}</span>
        </div>

        {/* Per photo price */}
        {items.length > 1 && (
          <p className="text-sm text-gray-500 text-center">
            {formatCurrency(pricing.pricePerPhotoCents)} per photo
          </p>
        )}
      </div>

      {/* Checkout button (if handler provided) */}
      {onCheckout && (
        <Button
          onClick={onCheckout}
          variant="primary"
          size="lg"
          className="w-full mt-6"
          loading={isCheckingOut}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      )}
    </div>
  );
}
