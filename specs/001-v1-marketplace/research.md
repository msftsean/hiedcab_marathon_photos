# Research Summary: V1 Core Marketplace

**Feature Branch**: `001-v1-marketplace`
**Date**: 2026-01-22
**Status**: Complete

## Overview

This document consolidates research findings for the V1 Core Marketplace implementation, resolving all NEEDS CLARIFICATION items from the Technical Context.

---

## Decision 1: Frontend Framework

### Decision: React with Next.js 14+ (App Router)

### Rationale
1. **Stripe Integration**: Official `@stripe/react-stripe-js` SDK provides best-in-class checkout support
2. **Hiring Pool**: 847,000+ job opportunities; 40% of developers use React; 80% of Fortune 500 adoption
3. **Image Optimization**: `next/image` component is the most mature image optimization solution with automatic WebP/AVIF, responsive images, and blur placeholders
4. **TypeScript**: First-class support with excellent tooling
5. **PWA Support**: Mature `next-pwa` plugin with Workbox integration
6. **Real-time**: Well-documented WebSocket patterns for photographer dashboards

### Alternatives Considered

| Framework | Pros | Rejected Because |
|-----------|------|------------------|
| Vue/Nuxt | Better DX, smaller bundle, growing ecosystem | No official Stripe SDK; smaller talent pool |
| Svelte/SvelteKit | Best raw performance (Lighthouse 95+), smallest bundle | Limited talent pool ("recruiting is not easy"); community Stripe SDK less mature |

### Implementation Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **Images**: `next/image` + Cloudinary CDN
- **PWA**: `next-pwa`
- **Payments**: `@stripe/react-stripe-js`
- **Auth**: NextAuth.js (or Supabase Auth client)
- **Real-time**: Supabase Realtime
- **State**: Zustand or Jotai

---

## Decision 2: Authentication Provider

### Decision: Supabase Auth

### Rationale
1. **No Vendor Lock-In**: User data lives in YOUR PostgreSQL database (`auth.users` table). GoTrue auth server is open source and self-hostable
2. **Unified Stack**: Auth + Database + Storage + Realtime in one platform, reducing architectural complexity
3. **Cost at Scale**: $25/month Pro plan includes 100k MAU + database + storage vs. $290+/month for Clerk or enterprise pricing for Auth0
4. **RBAC via RLS**: Row-Level Security policies enforce role-based access at the database level
5. **All Auth Methods**: Social login (Google, Facebook, Apple), email/password, and magic links supported out of the box

### Alternatives Considered

| Provider | Pros | Rejected Because |
|----------|------|------------------|
| Clerk | Best DX with pre-built UI, fastest time-to-auth | $100/month extra for custom roles; no self-hosting; higher cost at scale |
| Auth0 | Extensive provider catalog (50+), enterprise features | Pricing opacity at scale; password hash export requires support ticket; overkill for use case |

### Implementation Notes
- Store user roles in `user_roles` table
- Use Custom Access Token Hook to inject role claim into JWT
- Enforce via RLS policies: `auth.jwt() ->> 'user_role' = 'photographer'`
- Social login configured in Supabase Dashboard
- Magic links via `supabase.auth.signInWithOtp()`

---

## Decision 3: Database

### Decision: Supabase (Managed PostgreSQL)

### Rationale
1. **Fastest Time to Market**: Built-in auth, real-time, storage, and database in one platform
2. **Superior Analytics**: PostgreSQL's window functions, CTEs, JSONB aggregations, and materialized views for photographer dashboards
3. **Real-time Included**: Built-in change data capture and client-side subscriptions with row-level security
4. **Predictable Costs**: $25/month Pro plan; spend caps prevent bill shock
5. **Migration Path**: Standard PostgreSQL allows migration to self-hosted or other providers if needed

### Alternatives Considered

| Platform | Pros | Rejected Because |
|----------|------|------------------|
| PlanetScale | Excellent horizontal scaling (Vitess), MySQL | No native real-time; requires external service; MySQL lacks PostgreSQL analytics power |
| Self-hosted PostgreSQL | Full control, lowest per-unit cost | Requires DevOps expertise; $120K-$240K/year staff costs; operational overhead |

### Performance Optimizations
- **Bib search**: B-tree index on `bib_number` column
- **Photo lookups**: Composite index on `(event_id, bib_number)`
- **Analytics**: Materialized views for photographer dashboards, refreshed hourly
- **Real-time**: Filtered subscriptions on `transactions` table for photographer-specific updates
- **Partitioning**: Partition `photos` table by `event_id` or `created_at`

### Scaling Path
- Supabase handles millions of photo records and thousands of concurrent users
- If exceeding tens of millions of users/terabytes of data, migrate to PlanetScale Metal or self-hosted PostgreSQL with sharding

---

## Decision 4: Azure AI Vision for Bib OCR

### Decision: Azure Image Analysis 4.0 OCR with Queue-based Architecture

### Rationale
1. **API Fit**: Image Analysis 4.0 is optimized for "in-the-wild" images (race photos), not documents
2. **Synchronous Processing**: Single API call returns results, easily meeting <30s requirement
3. **Multiple Bib Detection**: Returns bounding polygons for locating multiple bib numbers per photo
4. **Batch Architecture**: Blob trigger → Queue → Azure Function pattern scales to 200+ concurrent workers

### Implementation Architecture
```
Blob Storage (Upload) → Event Grid → Azure Function (Detector)
                                              ↓
                                        Azure Queue Storage
                                              ↓
                                   Azure Function (OCR Processor)
                                              ↓
                                   Results DB (Supabase)
```

### Quality Scoring Thresholds
| Confidence | Action |
|------------|--------|
| >= 0.95 | Auto-assign to runners |
| 0.80 - 0.95 | Suggest with verification prompt |
| 0.60 - 0.80 | Queue for photographer review |
| < 0.60 | Reject or attempt image enhancement |

### Error Handling
- Exponential backoff with jitter for transient errors (429, 500, 503)
- Circuit breaker: Open after 5 failures, 30s recovery timeout
- Dead-letter queue for persistent failures
- Non-retryable errors (400, 404) logged and skipped

### Cost Estimates
| Volume | Monthly Cost |
|--------|--------------|
| 100k photos | $100 - $150 |
| 500k photos | $400 - $600 |
| 1M photos | $700 - $1,000 (commitment tier recommended) |

---

## Decision 5: Stripe Connect Implementation

### Decision: Controller Properties with Express Dashboard + Destination Charges

### Rationale
1. **Modern Approach**: Controller properties replace deprecated Standard/Express/Custom account types
2. **Express Dashboard**: Photographers can view payouts and update bank info without platform development
3. **Stripe-hosted Onboarding**: Stripe handles identity verification and KYC compliance
4. **Destination Charges**: Ideal for single-seller-per-transaction model
5. **PCI SAQ A**: Using Stripe Checkout achieves minimal PCI compliance (no card data handling)

### Account Configuration
```javascript
const account = await stripe.accounts.create({
  type: 'none',
  controller: {
    stripe_dashboard: { type: 'express' },
    fees: { payer: 'application' },
    losses: { payments: 'application' }
  },
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true }
  }
});
```

### Bundle Pricing Implementation
| Bundle | Price | Platform Fee (30%) | Photographer (70%) |
|--------|-------|-------------------|-------------------|
| 1 photo | $1.00 | $0.30 | $0.70 |
| 5 photos | $4.00 | $1.20 | $2.80 |
| 10 photos | $7.00 | $2.10 | $4.90 |
| 20 photos | $12.00 | $3.60 | $8.40 |

### Payout Configuration
- **New photographers**: 14-day payout delay (fraud prevention)
- **Established photographers**: 2-day payout delay
- **Schedule**: Weekly payouts on Fridays (configurable)
- **Threshold**: Optional minimum balance before payout

### Dispute Handling
- Platform is liable for disputes (`losses.payments: 'application'`)
- Gather evidence: download logs, delivery confirmation
- Transfer reversal recovers funds from photographer if needed
- Clear refund policy reduces chargebacks

### Key Webhooks
- `checkout.session.completed` - Deliver photos
- `charge.dispute.created` - Handle disputes immediately
- `payout.failed` - Alert on payout issues
- `account.updated` - Photographer verification status

---

## Technical Context (Resolved)

All NEEDS CLARIFICATION items have been resolved:

| Item | Resolution |
|------|------------|
| Frontend framework | React with Next.js 14+ |
| Auth provider | Supabase Auth |
| Database | Supabase (Managed PostgreSQL) |
| Stripe Connect type | Controller Properties with Express Dashboard |
| Payout scheduling | Weekly on Fridays, 14-day delay for new photographers |
| AI processing | Azure Image Analysis 4.0 OCR |

---

## Sources

### Frontend Framework
- [React vs Vue vs Svelte: 2025 Performance Comparison](https://medium.com/@jessicajournal/react-vs-vue-vs-svelte-the-ultimate-2025-frontend-performance-comparison-5b5ce68614e2)
- [React Stripe.js Reference](https://docs.stripe.com/sdks/stripejs-react)
- [Next.js Image Optimization](https://www.debugbear.com/blog/nextjs-image-optimization)

### Authentication
- [Clerk vs Supabase Auth Comparison](https://www.getmonetizely.com/articles/clerk-vs-supabase-auth-how-to-choose-the-right-authentication-service-for-your-budget)
- [Supabase RBAC with Custom Claims](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Self-Hosting Documentation](https://supabase.com/docs/reference/self-hosting-auth/introduction)

### Database
- [Supabase vs PlanetScale Comparison](https://www.leanware.co/insights/supabase-vs-planetscale)
- [PostgreSQL Full Text Search Indexes](https://www.postgresql.org/docs/current/textsearch-indexes.html)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)

### Azure AI Vision
- [OCR - Optical Character Recognition](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-ocr)
- [Transient Fault Handling](https://learn.microsoft.com/en-us/azure/architecture/best-practices/transient-faults)
- [Azure Vision Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/computer-vision/)

### Stripe Connect
- [Connect account types](https://docs.stripe.com/connect/accounts)
- [Create destination charges](https://docs.stripe.com/connect/destination-charges)
- [Handle refunds and disputes](https://docs.stripe.com/connect/marketplace/tasks/refunds-disputes)
- [PCI DSS compliance](https://stripe.com/guides/pci-compliance)
