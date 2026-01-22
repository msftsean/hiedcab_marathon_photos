'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCartStore, useIsInCart } from '@/lib/store/cart';
import { formatCurrency } from '@/lib/utils/pricing';
import type { PhotoPreview } from '@/types';

interface PhotoDetailProps {
  photo: PhotoPreview & {
    bibNumbers?: Array<{ number: string; confidence: number }>;
  };
}

export function PhotoDetailClient({ photo }: PhotoDetailProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useIsInCart(photo.id);

  const handleAddToCart = () => {
    addItem({
      photoId: photo.id,
      eventId: photo.eventId,
      eventName: photo.eventName,
      thumbnailUrl: photo.thumbnailUrl,
      priceCents: photo.priceCents,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/search" className="text-gray-500 hover:text-gray-700">
              Search
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{photo.eventName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Image section */}
          <div>
            <div
              className={`relative bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in ${
                isZoomed ? 'cursor-zoom-out' : ''
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
              style={{
                aspectRatio: isZoomed ? 'auto' : '4/3',
              }}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
                </div>
              )}
              <Image
                src={photo.watermarkedUrl}
                alt={`Race photo from ${photo.eventName}`}
                fill={!isZoomed}
                width={isZoomed ? 1600 : undefined}
                height={isZoomed ? 1200 : undefined}
                className={`${
                  isZoomed ? 'w-full h-auto' : 'object-contain'
                } transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                priority
              />

              {/* HD badge */}
              {photo.qualityScore !== undefined && photo.qualityScore >= 0.9 && (
                <div className="absolute top-4 left-4 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                  HD Quality
                </div>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500 text-center">
              Click image to {isZoomed ? 'zoom out' : 'zoom in'}. Preview includes watermark.
            </p>
          </div>

          {/* Details section */}
          <div className="mt-8 lg:mt-0">
            {/* Event info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{photo.eventName}</h1>
              <p className="mt-1 text-lg text-gray-600">
                {new Date(photo.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              {photo.eventLocation && (
                <p className="text-gray-500">{photo.eventLocation}</p>
              )}
            </div>

            {/* Bib numbers detected */}
            {photo.bibNumbers && photo.bibNumbers.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-700 mb-2">
                  Bib Numbers Detected
                </h2>
                <div className="flex flex-wrap gap-2">
                  {photo.bibNumbers.map((bib) => (
                    <span
                      key={bib.number}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      #{bib.number}
                      {bib.confidence >= 0.95 && (
                        <svg
                          className="ml-1 h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quality indicator */}
            {photo.qualityScore !== undefined && (
              <Card variant="bordered" padding="md" className="mb-6">
                <h2 className="text-sm font-medium text-gray-700 mb-2">
                  Image Quality
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        photo.qualityScore >= 0.9
                          ? 'bg-green-500'
                          : photo.qualityScore >= 0.7
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${photo.qualityScore * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {photo.qualityScore >= 0.9
                      ? 'Excellent'
                      : photo.qualityScore >= 0.7
                      ? 'Good'
                      : 'Standard'}
                  </span>
                </div>
              </Card>
            )}

            {/* Pricing card */}
            <Card variant="elevated" padding="lg" className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Price</span>
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(photo.priceCents)}
                </span>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Bundle & Save!</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>5 photos for $4.00 (save $1.00)</li>
                  <li>10 photos for $7.00 (save $3.00)</li>
                  <li>20+ photos for $12.00 (save $8.00+)</li>
                </ul>
              </div>

              <Button
                onClick={handleAddToCart}
                variant={isInCart ? 'secondary' : 'primary'}
                size="lg"
                className="w-full"
                disabled={isInCart}
              >
                {isInCart ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Add to Cart
                  </>
                )}
              </Button>

              {isInCart && (
                <Link
                  href="/checkout"
                  className="mt-3 block text-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Cart & Checkout
                </Link>
              )}
            </Card>

            {/* What you get */}
            <div className="space-y-3">
              <h2 className="font-medium text-gray-900">What you get:</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                  High-resolution digital download
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                  Watermark-free image
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                  Instant download after purchase
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
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
                  Personal use license included
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
