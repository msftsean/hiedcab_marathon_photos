'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/pricing';
import { cn } from '@/lib/utils/cn';
import type { PhotoPreview } from '@/types';

interface PhotoCardProps {
  photo: PhotoPreview;
  onAddToCart?: (photo: PhotoPreview) => void;
  onPreview?: (photo: PhotoPreview) => void;
  isInCart?: boolean;
  className?: string;
}

export function PhotoCard({
  photo,
  onAddToCart,
  onPreview,
  isInCart = false,
  className,
}: PhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onPreview) {
      onPreview(photo);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(photo);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      data-testid="photo-card"
      variant="bordered"
      padding="none"
      className={cn(
        'overflow-hidden transition-shadow hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Photo from ${photo.eventName}, click to preview`}
    >
      {/* Image container with aspect ratio */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {!imageError ? (
          <Image
            src={photo.thumbnailUrl}
            alt={`Race photo from ${photo.eventName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        {/* Quality badge */}
        {photo.qualityScore !== undefined && photo.qualityScore >= 0.9 && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
            HD
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-3">
        {/* Event info */}
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {photo.eventName}
          </h3>
          <p className="text-xs text-gray-500">
            {new Date(photo.eventDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {photo.eventLocation && ` • ${photo.eventLocation}`}
          </p>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(photo.priceCents)}
          </span>
          <Button
            variant={isInCart ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleAddToCart}
            disabled={isInCart}
            aria-label={isInCart ? 'In cart' : 'Add to cart'}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
