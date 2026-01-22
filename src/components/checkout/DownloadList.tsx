'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

interface DownloadPhoto {
  id: string;
  downloadUrl: string | null;
  thumbnailUrl: string;
  eventName: string;
}

interface DownloadListProps {
  transactionId: string;
  photos: DownloadPhoto[];
}

export function DownloadList({ transactionId, photos }: DownloadListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const handleDownload = async (photo: DownloadPhoto) => {
    if (!photo.downloadUrl) return;

    setDownloadingId(photo.id);

    try {
      // Trigger download
      const link = document.createElement('a');
      link.href = photo.downloadUrl;
      link.download = `photo-${photo.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mark as downloaded
      setDownloadedIds((prev) => new Set(prev).add(photo.id));
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const photo of photos) {
      if (photo.downloadUrl) {
        await handleDownload(photo);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No photos available for download.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Download all button */}
      {photos.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadAll}
            disabled={downloadingId !== null}
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download All ({photos.length})
          </Button>
        </div>
      )}

      {/* Photo list */}
      <div className="space-y-3">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            variant="bordered"
            padding="sm"
            className="flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {photo.thumbnailUrl ? (
                <Image
                  src={photo.thumbnailUrl}
                  alt={`Photo from ${photo.eventName}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Photo info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {photo.eventName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                ID: {photo.id.slice(0, 8)}...
              </p>
            </div>

            {/* Download button */}
            <div className="flex-shrink-0">
              {downloadedIds.has(photo.id) ? (
                <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg">
                  <svg
                    className="h-4 w-4 mr-1.5"
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
                  Downloaded
                </span>
              ) : photo.downloadUrl ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDownload(photo)}
                  disabled={downloadingId === photo.id}
                >
                  {downloadingId === photo.id ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-sm text-gray-500">Unavailable</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Download links expire in 7 days. Contact support if you need help.
      </p>
    </div>
  );
}
