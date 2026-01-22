'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Search, AlertCircle, Camera } from 'lucide-react';
import { PhotoCard } from '@/components/photos/PhotoCard';
import { Spinner } from '@/components/ui/Spinner';
import { NoResults } from './NoResults';
import type { PhotoPreview } from '@/types';

interface SearchResultsProps {
  photos: PhotoPreview[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onAddToCart: (photo: PhotoPreview) => void;
  onPreview: (photo: PhotoPreview) => void;
  cartPhotoIds: Set<string>;
  searchedBib?: string | null;
}

export function SearchResults({
  photos,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  onAddToCart,
  onPreview,
  cartPhotoIds,
  searchedBib,
}: SearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleIntersection]);

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Initial loading state (no photos yet)
  if (isLoading && photos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Searching for your photos...</p>
        <p className="mt-1 text-sm text-gray-400">This usually takes just a moment</p>
      </div>
    );
  }

  // No results
  if (!isLoading && photos.length === 0 && searchedBib) {
    return <NoResults bibNumber={searchedBib} />;
  }

  // No search performed yet
  if (photos.length === 0 && !searchedBib) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full mb-6">
          <Camera className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to find your photos</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Enter your bib number in the search box above to find all your race photos.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search by bib</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span>High-resolution downloads</span>
          <div className="w-px h-4 bg-gray-200" />
          <span>Instant access</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Photo grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onAddToCart={onAddToCart}
            onPreview={onPreview}
            isInCart={cartPhotoIds.has(photo.id)}
          />
        ))}
      </div>

      {/* Load more trigger for infinite scroll */}
      <div ref={loadMoreRef} className="mt-8 flex justify-center">
        {isLoading && photos.length > 0 && (
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm">
            <Spinner size="sm" />
            <span className="text-sm text-gray-600">Loading more photos...</span>
          </div>
        )}
        {!isLoading && hasMore && (
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-full shadow-sm transition-colors"
          >
            Load more photos
          </button>
        )}
        {!hasMore && photos.length > 0 && (
          <p className="text-sm text-gray-400 bg-gray-50 px-6 py-3 rounded-full">
            You&apos;ve seen all {photos.length} photos
          </p>
        )}
      </div>
    </div>
  );
}
