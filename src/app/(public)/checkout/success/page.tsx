'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { DownloadList } from '@/components/checkout/DownloadList';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils/pricing';

interface SessionData {
  status: string;
  paymentStatus: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  metadata: {
    photoCount: string;
    bundleType: string;
  };
}

interface TransactionData {
  id: string;
  email: string;
  purchasedAt: string;
  photos: Array<{
    id: string;
    downloadUrl: string | null;
    thumbnailUrl: string;
    eventName: string;
  }>;
}

type PageStatus = 'loading' | 'success' | 'processing' | 'error';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<PageStatus>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID provided');
      return;
    }

    try {
      const response = await fetch(`/api/checkout/session/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data: SessionData = await response.json();
      setSession(data);

      if (data.status === 'complete' && data.paymentStatus === 'paid') {
        // Payment successful - fetch transaction details
        setStatus('success');
        clearCart();
        await fetchTransaction();
      } else if (data.status === 'open') {
        // Payment still processing
        setStatus('processing');
      } else {
        setStatus('error');
        setError('Payment was not completed');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setStatus('error');
      setError('Failed to verify payment');
    }
  }, [sessionId, clearCart]);

  const fetchTransaction = async () => {
    if (!sessionId) return;

    try {
      // Fetch transaction by session ID
      const response = await fetch(`/api/downloads?session_id=${sessionId}`);

      if (response.ok) {
        const data = await response.json();
        // Map API response to component format
        setTransaction({
          id: data.id,
          email: data.email,
          purchasedAt: data.purchasedAt,
          photos: data.photos.map((p: any) => ({
            id: p.id,
            downloadUrl: p.downloadUrl,
            thumbnailUrl: p.thumbnailUrl,
            eventName: p.eventName,
          })),
        });
      }
    } catch (err) {
      console.error('Error fetching transaction:', err);
      // Non-critical - downloads may still work via email link
    }
  };

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Poll for updates if payment is still processing
  useEffect(() => {
    if (status === 'processing' && pollCount < 10) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        fetchSession();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, pollCount, fetchSession]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md mx-4">
          <div className="text-center">
            <Spinner size="lg" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Processing your payment...
            </h1>
            <p className="mt-2 text-gray-600">
              This usually takes just a moment. Please don&apos;t close this page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="bordered" padding="lg" className="max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-600">
              {error || 'We couldn\'t verify your payment. Please contact support if you were charged.'}
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/checkout">
                <Button variant="primary" className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="secondary" className="w-full">
                  Back to Search
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Thank you for your purchase!
          </h1>
          <p className="mt-2 text-gray-600">
            Your photos are ready to download.
          </p>
        </div>

        {/* Order summary */}
        {session && (
          <Card variant="bordered" padding="lg" className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Photos purchased</span>
                <span className="font-medium">{session.metadata?.photoCount || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total paid</span>
                <span className="font-medium">
                  {formatCurrency(session.amountTotal, session.currency?.toUpperCase())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation sent to</span>
                <span className="font-medium">{session.customerEmail}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Download section */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Downloads
          </h2>

          {transaction ? (
            <DownloadList
              transactionId={transaction.id}
              photos={transaction.photos}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Download links have been sent to your email address.
              </p>
              <p className="text-sm text-gray-500">
                Check your inbox at <strong>{session?.customerEmail}</strong>
              </p>
            </div>
          )}
        </Card>

        {/* Email reminder */}
        <Card variant="bordered" padding="md" className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Check your email
              </p>
              <p className="text-sm text-blue-700">
                We&apos;ve sent download links to {session?.customerEmail}.
                Links are valid for 7 days.
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/search" className="flex-1">
            <Button variant="secondary" className="w-full">
              Find More Photos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
