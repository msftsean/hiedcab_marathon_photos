'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartSummary } from '@/components/checkout/CartSummary';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/lib/store/cart';
import { getStripe } from '@/lib/stripe/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCartStore();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const validateEmail = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!validateEmail(email)) {
      return;
    }

    if (items.length === 0) {
      setCheckoutError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Check if we're offline
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your connection and try again.');
      }

      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          photoIds: items.map((item) => item.photoId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Use Stripe.js to redirect
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            throw new Error(error.message);
          }
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setCheckoutError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [email, items, validateEmail]);

  const pricing = getTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/search" className="text-gray-500 hover:text-gray-700">
              Search
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {items.length === 0 ? (
          <Card variant="bordered" padding="lg">
            <CartSummary />
          </Card>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Cart Summary */}
            <div>
              <Card variant="bordered" padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Photos ({items.length})
                </h2>
                <CartSummary />
              </Card>
            </div>

            {/* Checkout Form */}
            <div className="mt-8 lg:mt-0">
              <Card variant="elevated" padding="lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Guest Checkout
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  Enter your email to receive your download links. No account required!
                </p>

                {/* Email input */}
                <div className="mb-6">
                  <Input
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    onBlur={() => email && validateEmail(email)}
                    error={emailError || undefined}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    We&apos;ll send your download links to this email.
                  </p>
                </div>

                {/* Error message */}
                {checkoutError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{checkoutError}</p>
                  </div>
                )}

                {/* Checkout button */}
                <Button
                  onClick={handleCheckout}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isProcessing}
                  disabled={isProcessing || items.length === 0}
                  aria-label="Proceed to payment"
                >
                  {isProcessing ? 'Processing...' : `Pay ${pricing.totalCents > 0 ? `$${(pricing.totalCents / 100).toFixed(2)}` : ''}`}
                </Button>

                {/* Security badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1 text-xs">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span>Powered by</span>
                    <span className="font-semibold">Stripe</span>
                  </div>
                </div>

                {/* Terms */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                  By completing this purchase, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </Card>

              {/* What you get */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">What you&apos;ll receive:</h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    High-resolution photos (watermark-free)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Instant download access
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Download links sent via email
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
