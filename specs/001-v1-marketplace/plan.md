# Implementation Plan: V1 Core Marketplace

**Branch**: `001-v1-marketplace` | **Date**: 2026-01-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-v1-marketplace/spec.md`

## Summary

Two-sided photo marketplace where runners search for race photos by bib number and pay photographers $1/photo (or bundle pricing) to download watermark-free versions. Core features: guest bib search, AI-powered bib detection via Azure AI Vision, Stripe payment processing, Stripe Connect photographer payouts, and a mobile-first PWA interface.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18+ with Next.js 14+ (App Router), Node.js 20 LTS (backend via Supabase Edge Functions)
**Primary Dependencies**: Supabase (Auth, Database, Storage, Realtime), Azure AI Vision (bib OCR), Stripe + Stripe Connect (payments)
**Storage**: Supabase PostgreSQL (metadata), Supabase Storage or Azure Blob Storage (photos)
**Testing**: Vitest (unit), Playwright (E2E), Stripe test mode (payment integration)
**Target Platform**: PWA (mobile-first), Web browsers (Chrome, Safari, Firefox)
**Project Type**: Web application (Next.js frontend + Supabase backend)
**Performance Goals**: <500ms photo search (p95), <2s gallery load on 3G, <30s AI processing per photo, 1000+ concurrent users
**Constraints**: <200ms p95 API response, Lighthouse mobile score >80, offline-capable search results, PCI-DSS compliance via Stripe
**Scale/Scope**: Initial: 10k users, 100k photos; Growth: 100k users, 1M photos

> See [research.md](research.md) for detailed technology decision rationale.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate (Phase 0)

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Runner-First | Bib search without account | ✅ PASS | FR-001 specifies guest search |
| I. Runner-First | <2s page load on mobile | ✅ PASS | SC-006 specifies <2s on mobile networks |
| I. Runner-First | Guest checkout via Stripe | ✅ PASS | FR-003 specifies guest checkout |
| II. Photographer Monetization | Stripe Connect <5min onboard | ✅ PASS | FR-008 requires Stripe Connect |
| II. Photographer Monetization | Bulk upload 500+ photos | ✅ PASS | FR-009 specifies 500+ per batch |
| II. Photographer Monetization | AI failure notifications | ✅ PASS | FR-011 specifies failure notifications |
| III. AI-Powered | Bib OCR >90% accuracy | ✅ PASS | SC-004 specifies >90% accuracy |
| III. AI-Powered | <30s processing per photo | ✅ PASS | FR-017 specifies 30s max |
| IV. Payment Security | No raw card storage | ✅ PASS | FR-023 specifies PCI via Stripe |
| IV. Payment Security | Stripe Checkout for payments | ✅ PASS | Implied by Stripe integration |
| V. Mobile-First PWA | Lighthouse >80 mobile | ✅ PASS | Performance goals specify this |
| V. Mobile-First PWA | Touch targets 44x44px | ⏳ PENDING | Design phase requirement |
| VI. Data Privacy | GDPR/CCPA compliance | ⏳ PENDING | Research phase requirement |
| VII. Simplicity | V1 core only | ✅ PASS | Spec focuses on MVP features |

**Gate Status**: ✅ PASS - All critical principles addressed, pending items are design/research phase

### Post-Design Gate (Phase 1)

| Principle | Requirement | Status | Design Evidence |
|-----------|-------------|--------|-----------------|
| I. Runner-First | Bib search without account | ✅ PASS | `/search` endpoint in API contract requires no auth |
| I. Runner-First | <2s page load on mobile | ✅ PASS | Next.js `next/image` + lazy loading + CDN |
| I. Runner-First | Guest checkout via Stripe | ✅ PASS | `CreateCheckoutRequest` allows null `buyer_id` |
| II. Photographer Monetization | Stripe Connect <5min onboard | ✅ PASS | Express Dashboard with hosted onboarding |
| II. Photographer Monetization | Bulk upload 500+ photos | ✅ PASS | Presigned URL batch API supports 500 files |
| II. Photographer Monetization | AI failure notifications | ✅ PASS | `ocr_status: manual_review` triggers notification |
| III. AI-Powered | Bib OCR >90% accuracy | ✅ PASS | Azure Image Analysis 4.0 with quality scoring |
| III. AI-Powered | <30s processing per photo | ✅ PASS | Queue-based architecture with timeouts |
| IV. Payment Security | No raw card storage | ✅ PASS | Stripe Checkout handles all card data |
| IV. Payment Security | Stripe Checkout for payments | ✅ PASS | `/checkout/session` creates hosted checkout |
| V. Mobile-First PWA | Lighthouse >80 mobile | ✅ PASS | Next.js optimizations + PWA config |
| V. Mobile-First PWA | Touch targets 44x44px | ✅ PASS | Tailwind config + component guidelines |
| VI. Data Privacy | GDPR/CCPA compliance | ✅ PASS | Supabase Auth + RLS + account deletion API |
| VII. Simplicity | V1 core only | ✅ PASS | No V2+ features in scope |

**Post-Design Gate Status**: ✅ PASS - All principles validated against design artifacts

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js PWA with Supabase Backend
src/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public routes (no auth required)
│   │   ├── search/          # Bib number search
│   │   ├── photos/[id]/     # Photo detail/preview
│   │   └── checkout/        # Guest checkout flow
│   ├── (auth)/              # Protected routes
│   │   ├── dashboard/       # Photographer dashboard
│   │   ├── upload/          # Photo upload flow
│   │   └── account/         # Account settings
│   ├── api/                 # API routes (webhooks, etc.)
│   │   └── webhooks/        # Stripe webhooks
│   └── layout.tsx           # Root layout with providers
├── components/
│   ├── ui/                  # Base UI components
│   ├── photos/              # Photo gallery, preview, cart
│   ├── search/              # Search input, results
│   ├── checkout/            # Cart, payment UI
│   └── dashboard/           # Photographer dashboard components
├── lib/
│   ├── supabase/            # Supabase client, hooks
│   ├── stripe/              # Stripe client, helpers
│   └── utils/               # Shared utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── styles/                  # Global styles, Tailwind config

supabase/
├── migrations/              # Database migrations
├── functions/               # Supabase Edge Functions
│   ├── process-photo/       # AI bib detection trigger
│   ├── handle-payment/      # Payment completion handler
│   └── process-payout/      # Photographer payout handler
└── seed.sql                 # Development seed data

tests/
├── e2e/                     # Playwright E2E tests
├── integration/             # API/database integration tests
└── unit/                    # Component and utility unit tests
```

**Structure Decision**: Next.js App Router with Supabase backend services. Frontend and backend are tightly integrated through Supabase client libraries. Edge Functions handle async processing (AI bib detection, payment webhooks). This structure supports the mobile-first PWA requirement while leveraging Supabase's real-time capabilities for photographer dashboards.

## Progress & Status

**Last Updated**: 2026-01-22

### Phase Completion

| Phase | Status | Tasks | Notes |
|-------|--------|-------|-------|
| Phase 1: Setup | ✅ Complete | T001-T010 | All infrastructure in place |
| Phase 2: Foundational | ✅ Complete | T011-T037 | Database, auth, UI components ready |
| Phase 3: User Story 1 (MVP) | ✅ Complete | T038-T065 | Runner purchase flow working |
| Phase 4: User Story 2 | ⏳ Not Started | T066-T098 | Photographer upload flow |
| Phase 5: User Story 3 | ⏳ Not Started | T099-T119 | Photographer dashboard |
| Phase 6: User Story 4 | ⏳ Not Started | T120-T132 | Runner accounts |
| Phase 7: Polish | ⏳ Not Started | T133-T150 | Cross-cutting concerns |

### MVP Milestone Achieved ✅

**Status**: App is running and functional at `localhost:3000`

The MVP (User Story 1) is now functional:
- ✅ Bib number search returns watermarked photos
- ✅ Photo preview with zoom capability
- ✅ Shopping cart with bundle pricing
- ✅ Guest checkout via Stripe (UI ready, needs Stripe test keys)
- ✅ Checkout success page with download links
- ✅ Download API with signed URLs
- ✅ Home page with feature highlights and navigation

### Dependencies Added

```json
{
  "lucide-react": "^0.468.0"  // Icons for UI
}
```

### Environment Setup

**Supabase Configuration**:
- Using cloud Supabase (local Docker had WSL2 compatibility issues on Windows)
- Project URL: `https://ipqfebnelpmpzsjhiitu.supabase.co`
- Database migrations applied via `npx supabase db push`
- Seed data applied manually via Supabase SQL Editor

**Required Environment Variables** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Test Data**:
- Test bib numbers: `12345` (3 photos), `12346` (1 photo), `67890` (1 photo)
- Test events: Boston Marathon 2026, NYC Half Marathon 2026, Chicago 10K 2026

### Known Issues / Workarounds

1. **Local Supabase on Windows**: Docker containers crash due to WSL2 `RLIMIT_NOFILE` issue. Workaround: Use cloud Supabase.
2. **Seed data URLs**: Photos use placeholder URLs; real implementation needs Supabase Storage URLs.
3. **Stripe keys**: Using placeholder test keys; replace with actual Stripe test keys for payment testing.

### Next Steps

To continue development:
1. Set up real Stripe test keys in `.env.local`
2. Configure Supabase Storage buckets for photo uploads
3. Begin Phase 4 (User Story 2) - Photographer upload flow

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to justify. Architecture adheres to Constitution Principle VII (Simplicity):
- Single Next.js application (no monorepo complexity)
- Supabase provides unified backend (database + auth + storage + realtime)
- No premature abstractions - direct Supabase client usage
- Edge Functions only for truly async operations (AI processing, webhooks)
