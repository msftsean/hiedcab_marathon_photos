/**
 * TypeScript types generated from OpenAPI schema
 * @see specs/001-v1-marketplace/contracts/openapi.yaml
 */

// =============================================================================
// Common Types
// =============================================================================

export interface Pagination {
  next_cursor: string | null;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// User & Auth Types
// =============================================================================

export type UserRole = 'runner' | 'photographer';

export type StripeConnectStatus = 'pending' | 'active' | 'restricted' | 'disabled';

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  stripe_connect_id: string | null;
  stripe_connect_status: StripeConnectStatus | null;
  payout_enabled: boolean;
  saved_bib_numbers: string[];
  notification_preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Event Types
// =============================================================================

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  location: string;
  photo_count: number;
}

export interface Event extends EventSummary {
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface EventDetail extends Event {
  photographers: Array<{
    id: string;
    display_name: string;
    photo_count: number;
  }>;
}

export interface CreateEventRequest {
  name: string;
  date: string;
  location: string;
  description?: string;
}

export interface EventListResponse {
  events: EventSummary[];
  pagination: Pagination;
}

// =============================================================================
// Photo Types
// =============================================================================

export type OcrStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review';

export interface BibDetection {
  bib_number: string;
  confidence: number;
  is_verified: boolean;
}

export interface PhotoPreview {
  id: string;
  thumbnail_url: string;
  watermarked_url: string;
  event_id: string;
  event_name: string;
  event_date: string;
  quality_score: number;
  price_cents: number;
  bib_confidence: number;
}

export interface PhotoDetail extends PhotoPreview {
  width: number;
  height: number;
  photographer_id: string;
  bibs: BibDetection[];
}

export interface PhotographerPhoto extends PhotoDetail {
  ocr_status: OcrStatus;
  purchase_count: number;
  earnings_cents: number;
}

// =============================================================================
// Search Types
// =============================================================================

export interface SearchParams {
  bib: string;
  event_id?: string;
  sort?: 'quality' | 'recent';
  limit?: number;
  cursor?: string;
}

export interface SearchResponse {
  bib_number: string;
  event?: EventSummary;
  photos: PhotoPreview[];
  pagination: Pagination;
}

// =============================================================================
// Checkout Types
// =============================================================================

export type BundleType = 'single' | 'pack_5' | 'pack_10' | 'pack_20';

export interface CreateCheckoutRequest {
  photo_ids: string[];
  email: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
  amount_cents: number;
  photo_count: number;
  bundle_applied: BundleType | null;
}

export type CheckoutStatus = 'pending' | 'completed' | 'expired';

export interface CheckoutSessionStatus {
  session_id: string;
  status: CheckoutStatus;
  transaction_id: string | null;
}

export interface DownloadItem {
  photo_id: string;
  download_url: string;
  expires_at: string;
}

export interface DownloadLinksResponse {
  transaction_id: string;
  downloads: DownloadItem[];
}

// =============================================================================
// Upload Types
// =============================================================================

export interface UploadFileInfo {
  filename: string;
  content_type: 'image/jpeg' | 'image/png';
  size_bytes: number;
}

export interface PresignedUploadRequest {
  event_id: string;
  files: UploadFileInfo[];
}

export interface PresignedUploadItem {
  filename: string;
  photo_id: string;
  upload_url: string;
  expires_at: string;
}

export interface PresignedUploadResponse {
  batch_id: string;
  uploads: PresignedUploadItem[];
}

export interface CompleteUploadRequest {
  batch_id: string;
  photo_ids: string[];
}

export interface UploadBatchStatus {
  batch_id: string;
  total_photos: number;
  processing: number;
  completed: number;
  failed: number;
}

// =============================================================================
// Dashboard Types
// =============================================================================

export type DashboardPeriod = '7d' | '30d' | '90d' | 'all';

export interface DashboardStats {
  total_photos: number;
  searchable_photos: number;
  photos_needing_review: number;
  total_earnings_cents: number;
  total_sales: number;
  period_earnings_cents: number;
  period_sales: number;
  period: string;
}

export interface PhotographerPhotoList {
  photos: PhotographerPhoto[];
  pagination: Pagination;
}

export interface UpdateBibsRequest {
  bibs: Array<{
    bib_number: string;
    is_verified?: boolean;
  }>;
}

// =============================================================================
// Payout Types
// =============================================================================

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';

export interface Payout {
  id: string;
  amount_cents: number;
  status: PayoutStatus;
  period_start: string;
  period_end: string;
  transaction_count: number;
  initiated_at: string | null;
  completed_at: string | null;
}

export interface PayoutList {
  payouts: Payout[];
  pagination: Pagination;
}

// =============================================================================
// Transaction Types
// =============================================================================

export type TransactionStatus = 'pending' | 'completed' | 'refunded' | 'disputed' | 'failed';
export type DisputeStatus = 'needs_response' | 'under_review' | 'won' | 'lost' | null;

export interface Transaction {
  id: string;
  buyer_id: string | null;
  buyer_email: string;
  stripe_payment_intent_id: string;
  amount_cents: number;
  platform_fee_cents: number;
  photographer_amount_cents: number;
  currency: string;
  status: TransactionStatus;
  refund_amount_cents: number;
  dispute_status: DisputeStatus;
  created_at: string;
  completed_at: string | null;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  photo_id: string;
  photographer_id: string;
  price_cents: number;
  photographer_amount_cents: number;
  download_url: string | null;
  download_count: number;
  download_expires_at: string | null;
  created_at: string;
}

// =============================================================================
// Cart Types (Client-side)
// =============================================================================

export interface CartItem {
  photo: PhotoPreview;
  addedAt: number;
}

export interface CartState {
  items: CartItem[];
  email: string;
}

// =============================================================================
// Bundle Pricing
// =============================================================================

export const BUNDLE_PRICING = {
  single: { count: 1, price_cents: 100, per_photo_cents: 100 },
  pack_5: { count: 5, price_cents: 400, per_photo_cents: 80 },
  pack_10: { count: 10, price_cents: 700, per_photo_cents: 70 },
  pack_20: { count: 20, price_cents: 1200, per_photo_cents: 60 },
} as const;

export const REVENUE_SPLIT = {
  photographer: 0.70,
  platform: 0.30,
} as const;
