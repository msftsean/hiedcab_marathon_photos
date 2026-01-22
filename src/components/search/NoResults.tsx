'use client';

import Link from 'next/link';

interface NoResultsProps {
  bibNumber: string;
  eventName?: string;
}

export function NoResults({ bibNumber, eventName }: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="rounded-full bg-gray-100 p-4 mb-4">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-gray-900">No Photos Found</h3>

      <p className="mt-2 text-gray-500 max-w-md">
        We couldn&apos;t find any photos for bib number <strong>#{bibNumber}</strong>
        {eventName && (
          <>
            {' '}
            at <strong>{eventName}</strong>
          </>
        )}
        .
      </p>

      {/* Helpful suggestions */}
      <div className="mt-6 text-left bg-blue-50 rounded-lg p-4 max-w-md">
        <h4 className="font-medium text-blue-900 mb-2">Here are some things to try:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Double-check your bib number for typos</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Photos may still be uploading.</strong> Photographers often upload
              photos within 24-48 hours after an event.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Try removing event filters to search across all events</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              If your bib was obscured or worn incorrectly, the photographer may not have
              been able to tag your photos
            </span>
          </li>
        </ul>
      </div>

      {/* Check back later message */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-medium">Check back soon!</p>
            <p className="mt-1">
              New photos are being uploaded regularly. Try searching again in a few hours.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          href="/search"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-touch"
        >
          Search Again
        </Link>
      </div>
    </div>
  );
}
