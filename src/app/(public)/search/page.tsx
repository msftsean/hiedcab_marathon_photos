'use client';

import { useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ImageIcon, ShoppingCart, Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { SearchInput } from '@/components/search/SearchInput';
import { SearchResults } from '@/components/search/SearchResults';
import { PhotoPreviewModal } from '@/components/photos/PhotoPreviewModal';
import { usePhotoSearch } from '@/hooks/usePhotoSearch';
import { useCartStore } from '@/lib/store/cart';
import type { PhotoPreview } from '@/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const bibNumber = searchParams.get('bib');
  const eventId = searchParams.get('event');
  const sort = (searchParams.get('sort') as 'quality' | 'recent') || 'quality';

  const [previewPhoto, setPreviewPhoto] = useState<PhotoPreview | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cart store
  const { items, addItem } = useCartStore();
  const cartPhotoIds = useMemo(
    () => new Set(items.map((item) => item.photoId)),
    [items]
  );

  // Search hook
  const { photos, isLoading, error, hasMore, loadMore } = usePhotoSearch({
    bibNumber,
    eventId,
    sort,
  });

  // Get unique events from results
  const uniqueEvents = useMemo(() => {
    return Array.from(
      new Map(photos.map((p) => [p.eventId, { id: p.eventId, name: p.eventName }])).values()
    );
  }, [photos]);

  const handleAddToCart = useCallback(
    (photo: PhotoPreview) => {
      addItem({
        photoId: photo.id,
        eventId: photo.eventId,
        eventName: photo.eventName,
        thumbnailUrl: photo.thumbnailUrl,
        priceCents: photo.priceCents,
      });
    },
    [addItem]
  );

  const handlePreview = useCallback((photo: PhotoPreview) => {
    setPreviewPhoto(photo);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewPhoto(null);
  }, []);

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
                <ImageIcon className="w-6 h-6" />
                <span className="text-lg font-bold hidden sm:inline">RacePhotos</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </div>

            {/* Cart */}
            <Link
              href="/checkout"
              className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Cart</span>
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-12 sm:py-16">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/marathon_legs.jpg)' }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Find Your Race Photos
          </h1>
          <p className="text-blue-100 mb-8">
            Enter your bib number to find all your photos from the event
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <SearchInput autoFocus />

            {/* Quick tip */}
            {!bibNumber && (
              <p className="mt-3 text-sm text-gray-500">
                Tip: Your bib number is printed on your race number
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header with Filters */}
        {photos.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Results count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {photos.length} photo{photos.length !== 1 ? 's' : ''} found
                  </p>
                  {bibNumber && (
                    <p className="text-sm text-gray-500">
                      Bib #{bibNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="event-filter" className="text-sm text-gray-500">
                    Event:
                  </label>
                  <select
                    id="event-filter"
                    aria-label="Filter by event"
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={eventId || ''}
                    onChange={(e) => updateSearchParam('event', e.target.value)}
                  >
                    <option value="">All Events</option>
                    {uniqueEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort-filter" className="text-sm text-gray-500">
                    Sort:
                  </label>
                  <select
                    id="sort-filter"
                    aria-label="Sort results"
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sort}
                    onChange={(e) => updateSearchParam('sort', e.target.value)}
                  >
                    <option value="quality">Best Quality</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters (Expandable) */}
            {showFilters && (
              <div className="sm:hidden mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-filter-mobile" className="block text-sm text-gray-500 mb-1">
                    Event
                  </label>
                  <select
                    id="event-filter-mobile"
                    aria-label="Filter by event"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eventId || ''}
                    onChange={(e) => updateSearchParam('event', e.target.value)}
                  >
                    <option value="">All Events</option>
                    {uniqueEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-filter-mobile" className="block text-sm text-gray-500 mb-1">
                    Sort by
                  </label>
                  <select
                    id="sort-filter-mobile"
                    aria-label="Sort results"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sort}
                    onChange={(e) => updateSearchParam('sort', e.target.value)}
                  >
                    <option value="quality">Best Quality</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        <SearchResults
          photos={photos}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onAddToCart={handleAddToCart}
          onPreview={handlePreview}
          cartPhotoIds={cartPhotoIds}
          searchedBib={bibNumber}
        />
      </section>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <PhotoPreviewModal
          photo={previewPhoto}
          isOpen={!!previewPhoto}
          onClose={handleClosePreview}
          onAddToCart={() => handleAddToCart(previewPhoto)}
          isInCart={cartPhotoIds.has(previewPhoto.id)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
