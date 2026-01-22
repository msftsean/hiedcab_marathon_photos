# Data Model: V1 Core Marketplace

**Feature Branch**: `001-v1-marketplace`
**Date**: 2026-01-22
**Database**: Supabase (PostgreSQL)

## Overview

This document defines the data model for the V1 Core Marketplace, derived from the Key Entities in [spec.md](spec.md) and aligned with the technical decisions in [research.md](research.md).

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │     events      │
│  (auth.users)   │       │                 │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ 1:1                     │ 1:n
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  user_profiles  │       │     photos      │
│                 │       │                 │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │                         │ n:m
         │                         ▼
         │               ┌─────────────────┐
         │               │   photo_bibs    │
         │               │  (junction)     │
         │               └─────────────────┘
         │
         │ 1:n (photographer)
         ▼
┌─────────────────┐       ┌─────────────────┐
│  transactions   │◀─────▶│transaction_items│
│                 │  1:n  │                 │
└────────┬────────┘       └─────────────────┘
         │
         │ 1:n
         ▼
┌─────────────────┐
│    payouts      │
└─────────────────┘
```

---

## Tables

### 1. user_profiles

Extends Supabase `auth.users` with marketplace-specific data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users(id) | User ID (same as auth.users) |
| role | text | NOT NULL, CHECK (role IN ('runner', 'photographer')) | User role |
| display_name | text | | Public display name |
| avatar_url | text | | Profile avatar URL |
| stripe_connect_id | text | UNIQUE | Stripe Connect account ID (photographers only) |
| stripe_connect_status | text | CHECK IN ('pending', 'active', 'restricted', 'disabled') | Stripe Connect onboarding status |
| payout_enabled | boolean | DEFAULT false | Whether payouts are enabled |
| saved_bib_numbers | text[] | DEFAULT '{}' | Saved bib numbers for notifications (runners) |
| notification_preferences | jsonb | DEFAULT '{}' | Notification settings |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_user_profiles_role` on `role`
- `idx_user_profiles_stripe_connect_id` on `stripe_connect_id` WHERE `stripe_connect_id IS NOT NULL`

**RLS Policies:**
- Users can read their own profile
- Users can update their own profile
- Photographers with active Stripe Connect can be queried for public info

---

### 2. events

Race or athletic events that photos are associated with.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| name | text | NOT NULL | Event name (e.g., "Boston Marathon 2026") |
| date | date | NOT NULL | Event date |
| location | text | NOT NULL | Event location |
| description | text | | Optional description |
| cover_image_url | text | | Event cover image |
| created_by | uuid | FK → user_profiles(id) | Photographer who created |
| is_active | boolean | DEFAULT true | Whether event is visible |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Constraints:**
- UNIQUE (name, date, location) - Events uniquely identified by combination

**Indexes:**
- `idx_events_date` on `date DESC`
- `idx_events_name_trgm` GIN index using pg_trgm for text search
- `idx_events_active` on `is_active` WHERE `is_active = true`

---

### 3. photos

Individual race photographs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| photographer_id | uuid | NOT NULL, FK → user_profiles(id) | Photo owner |
| event_id | uuid | NOT NULL, FK → events(id) | Associated event |
| original_url | text | NOT NULL | Original high-res file URL (private) |
| watermarked_url | text | NOT NULL | Watermarked preview URL (public) |
| thumbnail_url | text | NOT NULL | Thumbnail URL (public) |
| width | integer | | Original image width |
| height | integer | | Original image height |
| file_size_bytes | bigint | | Original file size |
| quality_score | decimal(3,2) | CHECK (0 <= quality_score <= 1) | AI quality score for ranking |
| ocr_status | text | NOT NULL, DEFAULT 'pending', CHECK IN ('pending', 'processing', 'completed', 'failed', 'manual_review') | Bib detection status |
| ocr_confidence | decimal(3,2) | CHECK (0 <= ocr_confidence <= 1) | OCR overall confidence |
| ocr_result | jsonb | | Raw OCR result from Azure |
| price_cents | integer | NOT NULL, DEFAULT 100 | Price in cents ($1.00) |
| purchase_count | integer | NOT NULL, DEFAULT 0 | Number of times purchased |
| is_visible | boolean | NOT NULL, DEFAULT true | Whether photo appears in search |
| uploaded_at | timestamptz | DEFAULT now() | |
| processed_at | timestamptz | | When AI processing completed |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_photos_photographer` on `photographer_id`
- `idx_photos_event` on `event_id`
- `idx_photos_ocr_status` on `ocr_status`
- `idx_photos_quality_score` on `quality_score DESC` WHERE `is_visible = true`
- `idx_photos_visible_event` on `(event_id, quality_score DESC)` WHERE `is_visible = true`

**RLS Policies:**
- Anyone can read visible photos (watermarked/thumbnail URLs only)
- Photographers can CRUD their own photos
- Original URL only accessible after purchase verification

---

### 4. photo_bibs

Junction table linking photos to detected bib numbers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| photo_id | uuid | NOT NULL, FK → photos(id) ON DELETE CASCADE | |
| bib_number | text | NOT NULL | Detected bib number |
| confidence | decimal(3,2) | NOT NULL, CHECK (0 <= confidence <= 1) | Detection confidence |
| bounding_box | jsonb | | Bounding polygon coordinates |
| is_verified | boolean | DEFAULT false | Manually verified by photographer |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_photo_bibs_bib_number` on `bib_number` - Primary search index
- `idx_photo_bibs_photo` on `photo_id`
- `idx_photo_bibs_high_confidence` on `(bib_number, confidence DESC)` WHERE `confidence >= 0.8`

**RLS Policies:**
- Anyone can search by bib_number (returns photo IDs only)
- Photographers can manage bibs for their photos

---

### 5. transactions

Purchase records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| buyer_id | uuid | FK → user_profiles(id) | NULL for guest checkout |
| buyer_email | text | NOT NULL | Email for delivery |
| stripe_payment_intent_id | text | NOT NULL, UNIQUE | Stripe PaymentIntent ID |
| stripe_checkout_session_id | text | UNIQUE | Stripe Checkout Session ID |
| amount_cents | integer | NOT NULL | Total amount charged |
| platform_fee_cents | integer | NOT NULL | Platform commission (30%) |
| photographer_amount_cents | integer | NOT NULL | Photographer payout (70%) |
| currency | text | NOT NULL, DEFAULT 'usd' | |
| status | text | NOT NULL, CHECK IN ('pending', 'completed', 'refunded', 'disputed', 'failed') | |
| refund_amount_cents | integer | DEFAULT 0 | Amount refunded |
| dispute_status | text | CHECK IN (NULL, 'needs_response', 'under_review', 'won', 'lost') | |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | | When payment completed |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_transactions_buyer` on `buyer_id` WHERE `buyer_id IS NOT NULL`
- `idx_transactions_buyer_email` on `buyer_email`
- `idx_transactions_stripe_pi` on `stripe_payment_intent_id`
- `idx_transactions_status` on `status`
- `idx_transactions_created` on `created_at DESC`

**RLS Policies:**
- Buyers can read their own transactions (by buyer_id or buyer_email)
- Photographers can read transactions containing their photos

---

### 6. transaction_items

Line items for each transaction (photos purchased).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| transaction_id | uuid | NOT NULL, FK → transactions(id) ON DELETE CASCADE | |
| photo_id | uuid | NOT NULL, FK → photos(id) | |
| photographer_id | uuid | NOT NULL, FK → user_profiles(id) | Denormalized for queries |
| price_cents | integer | NOT NULL | Price at time of purchase |
| photographer_amount_cents | integer | NOT NULL | Photographer's share |
| download_url | text | | Signed URL for download (generated on demand) |
| download_count | integer | DEFAULT 0 | Number of times downloaded |
| download_expires_at | timestamptz | | Download link expiration |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_transaction_items_transaction` on `transaction_id`
- `idx_transaction_items_photo` on `photo_id`
- `idx_transaction_items_photographer` on `photographer_id`

**RLS Policies:**
- Buyers can read their own transaction items
- Photographers can read items for their photos

---

### 7. payouts

Photographer payout records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| photographer_id | uuid | NOT NULL, FK → user_profiles(id) | |
| stripe_transfer_id | text | UNIQUE | Stripe Transfer ID |
| amount_cents | integer | NOT NULL | Payout amount |
| currency | text | NOT NULL, DEFAULT 'usd' | |
| status | text | NOT NULL, CHECK IN ('pending', 'in_transit', 'paid', 'failed', 'canceled') | |
| failure_reason | text | | Reason for failure |
| period_start | timestamptz | NOT NULL | Payout period start |
| period_end | timestamptz | NOT NULL | Payout period end |
| transaction_count | integer | NOT NULL | Number of transactions included |
| initiated_at | timestamptz | | When payout was initiated |
| completed_at | timestamptz | | When payout completed |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**Indexes:**
- `idx_payouts_photographer` on `photographer_id`
- `idx_payouts_status` on `status`
- `idx_payouts_period` on `(photographer_id, period_start, period_end)`

**RLS Policies:**
- Photographers can read their own payouts

---

## Views

### v_photo_search

Optimized view for bib number search results.

```sql
CREATE VIEW v_photo_search AS
SELECT
    pb.bib_number,
    p.id AS photo_id,
    p.event_id,
    e.name AS event_name,
    e.date AS event_date,
    e.location AS event_location,
    p.watermarked_url,
    p.thumbnail_url,
    p.quality_score,
    p.price_cents,
    pb.confidence AS bib_confidence,
    p.photographer_id
FROM photo_bibs pb
JOIN photos p ON pb.photo_id = p.id
JOIN events e ON p.event_id = e.id
WHERE p.is_visible = true
  AND p.ocr_status = 'completed'
  AND pb.confidence >= 0.6;
```

### v_photographer_dashboard

Aggregated data for photographer dashboard.

```sql
CREATE VIEW v_photographer_dashboard AS
SELECT
    up.id AS photographer_id,
    up.display_name,
    COUNT(DISTINCT p.id) AS total_photos,
    COUNT(DISTINCT CASE WHEN p.ocr_status = 'completed' THEN p.id END) AS searchable_photos,
    COUNT(DISTINCT CASE WHEN p.ocr_status = 'failed' OR p.ocr_status = 'manual_review' THEN p.id END) AS photos_needing_review,
    COALESCE(SUM(ti.photographer_amount_cents), 0) AS total_earnings_cents,
    COUNT(DISTINCT ti.id) AS total_sales,
    COALESCE(SUM(CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN ti.photographer_amount_cents END), 0) AS earnings_last_30_days,
    COUNT(DISTINCT CASE WHEN t.created_at >= NOW() - INTERVAL '30 days' THEN ti.id END) AS sales_last_30_days
FROM user_profiles up
LEFT JOIN photos p ON up.id = p.photographer_id
LEFT JOIN transaction_items ti ON p.id = ti.photo_id
LEFT JOIN transactions t ON ti.transaction_id = t.id AND t.status = 'completed'
WHERE up.role = 'photographer'
GROUP BY up.id, up.display_name;
```

---

## State Transitions

### Photo OCR Status

```
pending → processing → completed
                   ↘ failed → manual_review → completed
                                           ↘ (deleted by photographer)
```

### Transaction Status

```
pending → completed → refunded (partial or full)
      ↘ failed              ↘ disputed → won/lost
```

### Payout Status

```
pending → in_transit → paid
                   ↘ failed → (retry) → pending
                   ↘ canceled
```

---

## Validation Rules

### From Functional Requirements

| Requirement | Table | Validation |
|-------------|-------|------------|
| FR-001 | photo_bibs | Search works without auth (RLS allows) |
| FR-009 | photos | No timeout constraint at DB level (handled by Edge Function) |
| FR-017 | photos | `processed_at - uploaded_at <= 30 seconds` (monitored, not enforced) |
| FR-021 | photos | `price_cents = 100` (default, can be overridden for bundles) |
| FR-024 | transactions | `platform_fee_cents = amount_cents * 0.30` |
| FR-024 | transactions | `photographer_amount_cents = amount_cents * 0.70` |

### Bundle Pricing Calculation

Bundle pricing is calculated at checkout, not stored in the database:

| Bundle | Photos | Total | Per Photo | Platform Fee | Photographer |
|--------|--------|-------|-----------|--------------|--------------|
| Single | 1 | $1.00 | $1.00 | $0.30 | $0.70 |
| 5-pack | 5 | $4.00 | $0.80 | $1.20 | $2.80 |
| 10-pack | 10 | $7.00 | $0.70 | $2.10 | $4.90 |
| 20-pack | 20 | $12.00 | $0.60 | $3.60 | $8.40 |

---

## Database Functions

### calculate_transaction_splits(amount_cents INTEGER)

Calculates platform fee and photographer amount.

```sql
CREATE FUNCTION calculate_transaction_splits(amount_cents INTEGER)
RETURNS TABLE (platform_fee_cents INTEGER, photographer_amount_cents INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT
        ROUND(amount_cents * 0.30)::INTEGER,
        ROUND(amount_cents * 0.70)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### increment_purchase_count()

Trigger to increment photo purchase count.

```sql
CREATE FUNCTION increment_purchase_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE photos
    SET purchase_count = purchase_count + 1,
        updated_at = NOW()
    WHERE id = NEW.photo_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_purchase_count
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION increment_purchase_count();
```

---

## Migration Notes

Initial migration creates all tables, indexes, RLS policies, functions, and triggers. See `supabase/migrations/` for implementation.

Key considerations:
1. Enable Row-Level Security on all tables
2. Create `pg_trgm` extension for text search
3. Configure Supabase Auth with custom claims hook for roles
4. Set up Realtime subscriptions for `transactions` and `photos` tables
