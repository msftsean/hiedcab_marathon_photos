'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, ModalCloseButton } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/pricing';
import type { PhotoPreview } from '@/types';

interface PhotoPreviewModalProps {
  photo: PhotoPreview;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  isInCart: boolean;
}

export function PhotoPreviewModal({
  photo,
  isOpen,
  onClose,
  onAddToCart,
  isInCart,
}: PhotoPreviewModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleAddToCartAndClose = () => {
    onAddToCart();
    // Optionally close modal or show confirmation
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="relative">
        <ModalCloseButton onClose={onClose} />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image container */}
          <div className="flex-1 min-w-0">
            <div
              className={`relative bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in ${
                isZoomed ? 'cursor-zoom-out' : ''
              }`}
              onClick={handleZoomToggle}
              style={{
                aspectRatio: isZoomed ? 'auto' : '4/3',
                maxHeight: isZoomed ? '80vh' : '60vh',
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
                width={isZoomed ? 1200 : undefined}
                height={isZoomed ? 900 : undefined}
                className={`${
                  isZoomed ? 'w-full h-auto' : 'object-contain'
                } transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                priority
              />

              {/* Zoom indicator */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
              </div>
            </div>

            {/* Watermark notice */}
            <p className="mt-2 text-sm text-gray-500 text-center">
              Preview image includes watermark. Purchased photos are watermark-free.
            </p>
          </div>

          {/* Details panel */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Event info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {photo.eventName}
              </h2>
              <p className="text-gray-600">
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

            {/* Quality indicator */}
            {photo.qualityScore !== undefined && (
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Quality:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                  <span className="text-sm font-medium">
                    {photo.qualityScore >= 0.9 ? 'HD' : photo.qualityScore >= 0.7 ? 'Good' : 'Standard'}
                  </span>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Single photo</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(photo.priceCents)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Add more photos for bundle discounts! 5 photos for $4, 10 for $7, or 20+ for $12.
              </p>
            </div>

            {/* Add to cart button */}
            <Button
              onClick={handleAddToCartAndClose}
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
                  In Cart
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

            {/* View cart link */}
            {isInCart && (
              <a
                href="/checkout"
                className="mt-3 block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View Cart & Checkout
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
