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

**Last Updated**: 2026-01-23

### Overall Progress

```
█████████████░░░░░░░░░░░░░░░░░  43% Complete (65/150 tasks)
```

### Phase Completion

| Phase | Status | Tasks | Progress | Notes |
|-------|--------|-------|----------|-------|
| Phase 1: Setup | ✅ Complete | T001-T010 | 10/10 | Infrastructure ready |
| Phase 2: Foundational | ✅ Complete | T011-T037 | 27/27 | Database, auth, UI components |
| Phase 3: User Story 1 (MVP) | ✅ Complete | T038-T065 | 28/28 | Runner purchase flow |
| Phase 4: User Story 2 | ⏳ Not Started | T066-T098 | 0/33 | Photographer upload |
| Phase 5: User Story 3 | ⏳ Not Started | T099-T119 | 0/21 | Photographer dashboard |
| Phase 6: User Story 4 | ⏳ Not Started | T120-T132 | 0/13 | Runner accounts |
| Phase 7: Polish | ⏳ Not Started | T133-T150 | 0/18 | Cross-cutting concerns |

---

## Implementation Status

### What's Built ✅

#### Pages & Routes
| Route | Status | File |
|-------|--------|------|
| Home | ✅ | `src/app/page.tsx` |
| Search | ✅ | `src/app/(public)/search/page.tsx` |
| Photo Detail | ✅ | `src/app/(public)/photos/[id]/page.tsx` |
| Checkout | ✅ | `src/app/(public)/checkout/page.tsx` |
| Checkout Success | ✅ | `src/app/(public)/checkout/success/page.tsx` |
| Error/Loading/404 | ✅ | `src/app/error.tsx`, `loading.tsx`, `not-found.tsx` |

#### API Routes
| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/search` | GET | ✅ | Bib number search |
| `/api/photos/[id]` | GET | ✅ | Photo detail |
| `/api/checkout/session` | POST | ✅ | Create Stripe session |
| `/api/checkout/session/[id]` | GET | ✅ | Session status |
| `/api/downloads/[transactionId]` | GET | ✅ | Signed download URLs |
| `/api/webhooks/stripe` | POST | ✅ | Payment webhook |

#### Components
| Category | Components | Status |
|----------|------------|--------|
| UI | Button, Input, Card, Modal, Spinner, Toast | ✅ |
| Search | SearchInput, SearchResults, NoResults | ✅ |
| Photos | PhotoCard, PhotoPreviewModal | ✅ |
| Checkout | Cart, CartSummary, DownloadList | ✅ |
| Providers | AuthProvider | ✅ |

#### Libraries
| File | Status | Purpose |
|------|--------|---------|
| `lib/supabase/client.ts` | ✅ | Browser Supabase client |
| `lib/supabase/server.ts` | ✅ | Server Supabase client |
| `lib/supabase/storage.ts` | ✅ | Signed URL generation |
| `lib/stripe/client.ts` | ✅ | Stripe SDK + webhook verification |
| `lib/utils/pricing.ts` | ✅ | Bundle pricing (70/30 split) |
| `lib/utils/images.ts` | ✅ | Image URL utilities |
| `lib/store/cart.ts` | ✅ | Zustand cart state |

#### Database (All Migrations Applied)
| Migration | Tables/Features |
|-----------|-----------------|
| 001-009 | ✅ user_profiles, events, photos, photo_bibs, transactions, transaction_items, payouts, views, functions |

#### Tests
| Type | Files | Status |
|------|-------|--------|
| Unit | `tests/unit/pricing.test.ts` | ✅ |
| Integration | `tests/integration/search.test.ts` | ✅ |
| E2E | `tests/e2e/search.spec.ts`, `checkout.spec.ts`, `download.spec.ts` | ✅ |

---

### What's Missing ❌

#### Phase 4: Photographer Upload (T066-T098)
| Feature | Components/Files Needed |
|---------|------------------------|
| Auth routes | `src/app/(auth)/` route group |
| Signup page | `src/app/(auth)/signup/page.tsx` |
| Stripe Connect | `src/lib/stripe/connect.ts`, `/api/auth/stripe-connect/*` |
| Event management | `src/app/(auth)/dashboard/events/`, `/api/events` |
| Bulk upload | `src/components/upload/*`, `/api/upload/presigned`, `/api/upload/complete` |
| AI bib detection | `supabase/functions/process-photo/`, Azure Vision integration |
| Manual review | `src/components/dashboard/PhotoReviewCard.tsx`, `BibEntryForm.tsx` |

#### Phase 5: Photographer Dashboard (T099-T119)
| Feature | Components/Files Needed |
|---------|------------------------|
| Dashboard stats | `src/components/dashboard/DashboardStats.tsx`, `SalesChart.tsx` |
| Real-time updates | `src/hooks/useSalesSubscription.ts` |
| Payout history | `src/components/dashboard/PayoutHistory.tsx`, `/api/dashboard/payouts` |

#### Phase 6: Runner Accounts (T120-T132)
| Feature | Components/Files Needed |
|---------|------------------------|
| Login page | `src/app/(auth)/login/page.tsx` |
| Order history | `src/app/(auth)/account/orders/page.tsx` |
| Notifications | `supabase/functions/notify-runner/` |

#### Phase 7: Polish (T133-T150)
| Feature | Files Needed |
|---------|-------------|
| Rate limiting | `src/middleware.ts` |
| PWA offline | `src/lib/pwa/service-worker.ts` |
| Error tracking | Sentry integration |

---

### Environment Setup

**Supabase**: Cloud instance at `https://ipqfebnelpmpzsjhiitu.supabase.co`

**Required `.env.local`**:
```bash
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
# Phase 4+ will need:
AZURE_VISION_ENDPOINT=<azure-endpoint>
AZURE_VISION_KEY=<azure-key>
```

**Test Data**: Bibs `12345`, `12346`, `67890` | Events: Boston Marathon, NYC Half, Chicago 10K

---

### Known Issues

1. **Local Supabase on Windows**: WSL2 compatibility issue. Use cloud Supabase.
2. **Photo URLs**: Using placeholder URLs from picsum.photos; production needs Supabase Storage.
3. **Stripe**: Placeholder test keys; configure real test keys for payment testing.

---

### Next Steps (Priority Order)

1. **Configure Stripe test keys** - Enable end-to-end payment testing
2. **Set up Supabase Storage buckets** - `photos-original`, `photos-watermarked`, `photos-thumbnails`
3. **Create `(auth)` route group** - Prerequisite for all photographer features
4. **Implement Stripe Connect** - T072-T075 (photographer onboarding)
5. **Build upload flow** - T081-T086 (bulk upload with presigned URLs)
6. **Deploy Azure Vision Edge Function** - T087-T094 (AI bib detection)

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to justify. Architecture adheres to Constitution Principle VII (Simplicity):
- Single Next.js application (no monorepo complexity)
- Supabase provides unified backend (database + auth + storage + realtime)
- No premature abstractions - direct Supabase client usage
- Edge Functions only for truly async operations (AI processing, webhooks)
