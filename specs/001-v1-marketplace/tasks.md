# Tasks: V1 Core Marketplace

**Input**: Design documents from `/specs/001-v1-marketplace/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml
**Date Generated**: 2026-01-22

**Tests**: Test tasks are included based on the specification requirements for testability.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Includes exact file paths in descriptions

## Path Conventions

Based on plan.md project structure:
- **Frontend**: `src/` (Next.js App Router)
- **Backend**: `supabase/` (Supabase Edge Functions, migrations)
- **Tests**: `tests/` (unit, integration, e2e)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14+ project with TypeScript and App Router in repository root
- [X] T002 Install core dependencies: Tailwind CSS, Supabase client, Stripe SDK, next-pwa per research.md
- [X] T003 [P] Configure ESLint and Prettier with TypeScript rules in eslint.config.js and .prettierrc
- [X] T004 [P] Configure Tailwind CSS with custom theme and 44x44px touch targets in tailwind.config.ts
- [X] T005 [P] Create environment configuration files: .env.example, .env.local per quickstart.md
- [X] T006 [P] Configure Vitest for unit testing in vitest.config.ts
- [X] T007 [P] Configure Playwright for E2E testing in playwright.config.ts
- [X] T008 Create base TypeScript types from OpenAPI schemas in src/types/index.ts
- [X] T009 Initialize Supabase project locally with `supabase init` in supabase/config.toml
- [X] T010 Configure next-pwa with Workbox for PWA support in next.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Auth Foundation

- [X] T011 Create database migration for user_profiles table with RLS in supabase/migrations/001_user_profiles.sql
- [X] T012 Create database migration for events table with indexes in supabase/migrations/002_events.sql
- [X] T013 Create database migration for photos table with OCR columns in supabase/migrations/003_photos.sql
- [X] T014 Create database migration for photo_bibs junction table in supabase/migrations/004_photo_bibs.sql
- [X] T015 Create database migration for transactions table in supabase/migrations/005_transactions.sql
- [X] T016 Create database migration for transaction_items table in supabase/migrations/006_transaction_items.sql
- [X] T017 Create database migration for payouts table in supabase/migrations/007_payouts.sql
- [X] T018 Create database views: v_photo_search, v_photographer_dashboard in supabase/migrations/008_views.sql
- [X] T019 Create database functions: calculate_transaction_splits, increment_purchase_count in supabase/migrations/009_functions.sql
- [X] T020 Configure Supabase Auth with social providers (Google, Facebook, Apple) in supabase/config.toml
- [X] T021 Implement custom JWT claims hook for user roles per research.md in supabase/functions/_shared/auth.ts
- [X] T022 Create seed data for development testing in supabase/seed.sql

### Shared Libraries & Utilities

- [X] T023 Create Supabase client singleton with typed queries in src/lib/supabase/client.ts
- [X] T024 [P] Create Supabase server client for Server Components in src/lib/supabase/server.ts
- [X] T025 [P] Create Stripe client singleton in src/lib/stripe/client.ts
- [X] T026 [P] Create utility functions: formatCurrency, calculateBundlePrice in src/lib/utils/pricing.ts
- [X] T027 [P] Create image URL utilities for watermarked/thumbnail generation in src/lib/utils/images.ts
- [X] T028 Create root layout with Supabase AuthProvider in src/app/layout.tsx
- [X] T029 [P] Create error boundary and error page in src/app/error.tsx
- [X] T030 [P] Create loading state component in src/app/loading.tsx
- [X] T031 [P] Create 404 not found page in src/app/not-found.tsx

### Base UI Components

- [X] T032 [P] Create Button component with variants in src/components/ui/Button.tsx
- [X] T033 [P] Create Input component with validation states in src/components/ui/Input.tsx
- [X] T034 [P] Create Card component for photo cards in src/components/ui/Card.tsx
- [X] T035 [P] Create Modal component for photo preview in src/components/ui/Modal.tsx
- [X] T036 [P] Create Spinner loading component in src/components/ui/Spinner.tsx
- [X] T037 [P] Create Toast notification component in src/components/ui/Toast.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Runner Finds and Purchases Race Photo (Priority: P1) 🎯 MVP

**Goal**: Runners can search by bib number, view watermarked previews, add to cart, complete guest checkout, and download high-res photos.

**Independent Test**: Search for bib "12345", add photo to cart, complete Stripe test checkout, verify download link provides watermark-free photo.

**Requirements**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-021, FR-022

### Tests for User Story 1

- [X] T038 [P] [US1] E2E test: bib search returns watermarked results in tests/e2e/search.spec.ts
- [X] T039 [P] [US1] E2E test: guest checkout flow with Stripe test mode in tests/e2e/checkout.spec.ts
- [X] T040 [P] [US1] E2E test: download access after successful payment in tests/e2e/download.spec.ts
- [X] T041 [P] [US1] Unit test: bundle pricing calculations in tests/unit/pricing.test.ts
- [X] T042 [P] [US1] Integration test: search API with Supabase in tests/integration/search.test.ts

### Implementation for User Story 1

#### Search Feature

- [X] T043 [US1] Create SearchInput component with bib validation in src/components/search/SearchInput.tsx
- [X] T044 [US1] Create SearchResults grid component with lazy loading in src/components/search/SearchResults.tsx
- [X] T045 [US1] Create PhotoCard component with watermark preview in src/components/photos/PhotoCard.tsx
- [X] T046 [US1] Create search page with event filtering in src/app/(public)/search/page.tsx
- [X] T047 [US1] Implement search query hook using v_photo_search view in src/hooks/usePhotoSearch.ts
- [X] T048 [US1] Create GET /api/search route handler for bib search in src/app/api/search/route.ts

#### Photo Preview

- [X] T049 [US1] Create PhotoPreviewModal with zoom capability in src/components/photos/PhotoPreviewModal.tsx
- [X] T050 [US1] Create photo detail page with purchase CTA in src/app/(public)/photos/[id]/page.tsx
- [X] T051 [US1] Create GET /api/photos/[id] route handler in src/app/api/photos/[id]/route.ts

#### Cart & Checkout

- [X] T052 [US1] Create cart state management with Zustand in src/lib/store/cart.ts
- [X] T053 [US1] Create Cart component with bundle pricing display in src/components/checkout/Cart.tsx
- [X] T054 [US1] Create CartSummary with photo thumbnails in src/components/checkout/CartSummary.tsx
- [X] T055 [US1] Create checkout page with email input for guests in src/app/(public)/checkout/page.tsx
- [X] T056 [US1] Implement POST /api/checkout/session to create Stripe Checkout in src/app/api/checkout/session/route.ts
- [X] T057 [US1] Implement GET /api/checkout/session/[sessionId] for status check in src/app/api/checkout/session/[sessionId]/route.ts

#### Payment & Download

- [X] T058 [US1] Create Stripe webhook handler for checkout.session.completed in src/app/api/webhooks/stripe/route.ts
- [X] T059 [US1] Implement transaction creation and photo purchase recording in webhook handler
- [X] T060 [US1] Create checkout success page with download links in src/app/(public)/checkout/success/page.tsx
- [X] T061 [US1] Create GET /api/downloads/[transactionId] with email verification in src/app/api/downloads/[transactionId]/route.ts
- [X] T062 [US1] Implement signed URL generation for original photo access in src/lib/supabase/storage.ts
- [X] T063 [US1] Create DownloadList component for purchased photos in src/components/checkout/DownloadList.tsx

#### No Results Handling

- [X] T064 [US1] Create NoResults component with helpful suggestions in src/components/search/NoResults.tsx
- [X] T065 [US1] Add "photos still uploading" messaging for recent events in search results

**Checkpoint**: User Story 1 complete - Runners can search, purchase, and download photos as guests

---

## Phase 4: User Story 2 - Photographer Uploads and Monetizes Race Photos (Priority: P2)

**Goal**: Photographers can sign up, connect Stripe, bulk upload photos, and have bib numbers automatically detected.

**Independent Test**: Create photographer account, complete Stripe Connect onboarding, upload 10 test photos, verify bibs detected and photos appear in search.

**Requirements**: FR-007, FR-008, FR-009, FR-010, FR-011, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020

### Tests for User Story 2

- [ ] T066 [P] [US2] E2E test: photographer signup and Stripe Connect flow in tests/e2e/photographer-signup.spec.ts
- [ ] T067 [P] [US2] E2E test: bulk photo upload with progress in tests/e2e/upload.spec.ts
- [ ] T068 [P] [US2] Integration test: AI bib detection processing in tests/integration/bib-detection.test.ts
- [ ] T069 [P] [US2] Unit test: presigned URL generation in tests/unit/upload.test.ts

### Implementation for User Story 2

#### Photographer Auth & Onboarding

- [ ] T070 [US2] Create photographer signup page with role selection in src/app/(auth)/signup/page.tsx
- [ ] T071 [US2] Create auth callback handler for OAuth providers in src/app/(auth)/callback/route.ts
- [ ] T072 [US2] Implement Stripe Connect account creation in src/lib/stripe/connect.ts
- [ ] T073 [US2] Create GET /api/auth/stripe-connect/link for onboarding URL in src/app/api/auth/stripe-connect/link/route.ts
- [ ] T074 [US2] Create Stripe Connect onboarding page with status in src/app/(auth)/onboarding/page.tsx
- [ ] T075 [US2] Handle account.updated webhook for Stripe Connect status in src/app/api/webhooks/stripe/route.ts

#### Event Management

- [ ] T076 [US2] Create event creation form component in src/components/dashboard/EventForm.tsx
- [ ] T077 [US2] Create events listing page for photographers in src/app/(auth)/dashboard/events/page.tsx
- [ ] T078 [US2] Implement POST /api/events for event creation in src/app/api/events/route.ts
- [ ] T079 [US2] Implement GET /api/events for event listing in src/app/api/events/route.ts
- [ ] T080 [US2] Create event selector dropdown for uploads in src/components/upload/EventSelector.tsx

#### Bulk Photo Upload

- [ ] T081 [US2] Create BulkUploader component with drag-drop in src/components/upload/BulkUploader.tsx
- [ ] T082 [US2] Create UploadProgress component with per-file status in src/components/upload/UploadProgress.tsx
- [ ] T083 [US2] Create upload page with event selection in src/app/(auth)/upload/page.tsx
- [ ] T084 [US2] Implement POST /api/upload/presigned for batch presigned URLs in src/app/api/upload/presigned/route.ts
- [ ] T085 [US2] Implement parallel upload to Supabase Storage in src/lib/supabase/upload.ts
- [ ] T086 [US2] Implement POST /api/upload/complete to trigger processing in src/app/api/upload/complete/route.ts

#### AI Bib Detection

- [ ] T087 [US2] Create Supabase Edge Function for photo processing in supabase/functions/process-photo/index.ts
- [ ] T088 [US2] Implement Azure Vision API client in supabase/functions/_shared/azure-vision.ts
- [ ] T089 [US2] Implement bib number extraction from OCR results in supabase/functions/_shared/bib-parser.ts
- [ ] T090 [US2] Implement watermark generation using Sharp in supabase/functions/_shared/watermark.ts
- [ ] T091 [US2] Implement thumbnail generation in supabase/functions/_shared/thumbnail.ts
- [ ] T092 [US2] Implement quality scoring algorithm in supabase/functions/_shared/quality-score.ts
- [ ] T093 [US2] Create database trigger to invoke Edge Function on photo insert in supabase/migrations/010_photo_trigger.sql
- [ ] T094 [US2] Implement retry logic with exponential backoff for Azure API in supabase/functions/_shared/retry.ts

#### Manual Review Flow

- [ ] T095 [US2] Create PhotoReviewCard component for failed detections in src/components/dashboard/PhotoReviewCard.tsx
- [ ] T096 [US2] Create manual bib entry form in src/components/dashboard/BibEntryForm.tsx
- [ ] T097 [US2] Implement PUT /api/dashboard/photos/[id]/bibs for manual updates in src/app/api/dashboard/photos/[id]/bibs/route.ts
- [ ] T098 [US2] Create notification for photos needing review in src/components/dashboard/ReviewNotification.tsx

**Checkpoint**: User Story 2 complete - Photographers can upload photos with automatic bib detection

---

## Phase 5: User Story 3 - Photographer Tracks Sales and Receives Payouts (Priority: P3)

**Goal**: Photographers can view sales analytics, track earnings, and receive automatic payouts via Stripe Connect.

**Independent Test**: Log in as photographer with existing sales, verify dashboard shows accurate earnings, check payout history matches Stripe.

**Requirements**: FR-012, FR-013, FR-024

### Tests for User Story 3

- [ ] T099 [P] [US3] E2E test: dashboard displays correct earnings in tests/e2e/dashboard.spec.ts
- [ ] T100 [P] [US3] E2E test: payout history accuracy in tests/e2e/payouts.spec.ts
- [ ] T101 [P] [US3] Integration test: real-time sales updates in tests/integration/realtime-sales.test.ts
- [ ] T102 [P] [US3] Unit test: earnings calculations in tests/unit/earnings.test.ts

### Implementation for User Story 3

#### Dashboard Statistics

- [ ] T103 [US3] Create DashboardStats component with earnings cards in src/components/dashboard/DashboardStats.tsx
- [ ] T104 [US3] Create SalesChart component with time-series in src/components/dashboard/SalesChart.tsx
- [ ] T105 [US3] Create PhotoSalesTable with per-photo performance in src/components/dashboard/PhotoSalesTable.tsx
- [ ] T106 [US3] Create main dashboard page layout in src/app/(auth)/dashboard/page.tsx
- [ ] T107 [US3] Implement GET /api/dashboard/stats with period filtering in src/app/api/dashboard/stats/route.ts
- [ ] T108 [US3] Implement GET /api/dashboard/photos for photo listing in src/app/api/dashboard/photos/route.ts

#### Real-time Updates

- [ ] T109 [US3] Implement Supabase Realtime subscription for sales in src/hooks/useSalesSubscription.ts
- [ ] T110 [US3] Create live sale notification toast in src/components/dashboard/SaleNotification.tsx
- [ ] T111 [US3] Update dashboard stats on new sale event in real-time

#### Payouts

- [ ] T112 [US3] Create PayoutHistory component with status badges in src/components/dashboard/PayoutHistory.tsx
- [ ] T113 [US3] Create payouts page with history list in src/app/(auth)/dashboard/payouts/page.tsx
- [ ] T114 [US3] Implement GET /api/dashboard/payouts for payout listing in src/app/api/dashboard/payouts/route.ts
- [ ] T115 [US3] Create Supabase Edge Function for payout processing in supabase/functions/process-payout/index.ts
- [ ] T116 [US3] Handle payout.paid and payout.failed webhooks in src/app/api/webhooks/stripe/route.ts
- [ ] T117 [US3] Implement GET /api/auth/stripe-connect/dashboard for Express Dashboard link in src/app/api/auth/stripe-connect/dashboard/route.ts

#### Event Analytics

- [ ] T118 [US3] Create EventSalesCard with per-event breakdown in src/components/dashboard/EventSalesCard.tsx
- [ ] T119 [US3] Create events analytics page in src/app/(auth)/dashboard/events/[id]/page.tsx

**Checkpoint**: User Story 3 complete - Photographers can track sales and receive payouts

---

## Phase 6: User Story 4 - Runner Creates Account for Order History (Priority: P4)

**Goal**: Runners can create accounts to access order history and receive notifications for new photos.

**Independent Test**: Make guest purchase, create account with same email, verify previous orders appear, enable notifications.

**Requirements**: FR-006

### Tests for User Story 4

- [ ] T120 [P] [US4] E2E test: account creation links previous orders in tests/e2e/runner-account.spec.ts
- [ ] T121 [P] [US4] E2E test: notification preferences in tests/e2e/notifications.spec.ts
- [ ] T122 [P] [US4] Integration test: order linking by email in tests/integration/order-linking.test.ts

### Implementation for User Story 4

#### Runner Account

- [ ] T123 [US4] Create runner signup/login page with social options in src/app/(auth)/login/page.tsx
- [ ] T124 [US4] Implement magic link authentication flow in src/lib/supabase/auth.ts
- [ ] T125 [US4] Create account linking logic for guest purchases in src/lib/supabase/link-orders.ts
- [ ] T126 [US4] Create order history page in src/app/(auth)/account/orders/page.tsx
- [ ] T127 [US4] Create OrderHistoryCard component in src/components/account/OrderHistoryCard.tsx

#### Notifications

- [ ] T128 [US4] Create notification preferences form in src/components/account/NotificationPreferences.tsx
- [ ] T129 [US4] Create account settings page in src/app/(auth)/account/page.tsx
- [ ] T130 [US4] Implement saved bib number management in src/lib/supabase/saved-bibs.ts
- [ ] T131 [US4] Create Supabase Edge Function for new photo notifications in supabase/functions/notify-runner/index.ts
- [ ] T132 [US4] Create database trigger for new photos matching saved bibs in supabase/migrations/011_notification_trigger.sql

**Checkpoint**: User Story 4 complete - Runners can manage accounts and receive notifications

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Security & Compliance

- [ ] T133 [P] Add rate limiting middleware for API routes in src/middleware.ts
- [ ] T134 [P] Implement CSRF protection for forms in src/lib/utils/csrf.ts
- [ ] T135 [P] Add input sanitization for search and form inputs in src/lib/utils/sanitize.ts
- [ ] T136 [P] Verify RLS policies cover all tables in supabase/migrations/012_rls_audit.sql

### Performance

- [ ] T137 [P] Implement image lazy loading with blur placeholders in src/components/photos/LazyImage.tsx
- [ ] T138 [P] Add search result caching with SWR/React Query in src/hooks/usePhotoSearch.ts
- [ ] T139 [P] Configure CDN headers for static assets in next.config.js
- [ ] T140 [P] Implement database query optimization for v_photo_search in supabase/migrations/013_query_optimization.sql

### PWA & Offline

- [ ] T141 [P] Configure service worker for offline search results in src/lib/pwa/service-worker.ts
- [ ] T142 [P] Add manifest.json with app icons in public/manifest.json
- [ ] T143 [P] Implement offline-first cart storage in src/lib/store/cart.ts

### Monitoring & Error Handling

- [ ] T144 [P] Add structured logging for API routes in src/lib/utils/logger.ts
- [ ] T145 [P] Implement error tracking integration (Sentry) in src/lib/utils/error-tracking.ts
- [ ] T146 [P] Create admin error dashboard page in src/app/(auth)/admin/errors/page.tsx

### Documentation & Validation

- [ ] T147 Update quickstart.md with actual setup steps tested on fresh machine
- [ ] T148 Run Lighthouse audit and achieve >80 mobile score
- [ ] T149 Validate all E2E tests pass with Stripe test mode
- [ ] T150 Security review of Stripe webhook signature verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (different user role)
- **User Story 3 (P3)**: Depends on US2 (needs uploaded photos and sales) - Can run after US2 complete
- **User Story 4 (P4)**: Depends on US1 (needs purchase flow) - Can run after US1 complete

```
                    ┌─────────┐
                    │ Phase 1 │
                    │  Setup  │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │ Phase 2 │
                    │  Found. │
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼────┐    ┌────▼────┐    (wait)
     │ US1 P1  │    │ US2 P2  │         │
     │ Runner  │    │ Photog  │         │
     │Purchase │    │ Upload  │         │
     └────┬────┘    └────┬────┘         │
          │              │              │
     ┌────▼────┐    ┌────▼────┐         │
     │ US4 P4  │    │ US3 P3  │         │
     │ Account │    │Dashboard│         │
     └────┬────┘    └────┬────┘         │
          │              │              │
          └──────────────┴──────────────┘
                         │
                    ┌────▼────┐
                    │ Phase 7 │
                    │  Polish │
                    └─────────┘
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/migrations before services
- Services before API routes
- API routes before frontend components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T007)
- All Foundational tasks marked [P] can run in parallel (T023-T037)
- Once Foundational phase completes, US1 and US2 can start in parallel
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: T038 "E2E test: bib search returns watermarked results"
Task: T039 "E2E test: guest checkout flow with Stripe test mode"
Task: T040 "E2E test: download access after successful payment"
Task: T041 "Unit test: bundle pricing calculations"
Task: T042 "Integration test: search API with Supabase"

# These run in parallel because they're in different files

# After search implementation is complete:
Task: T043-T048 "Search components and API" (sequential within feature)

# Cart components can run in parallel:
Task: T052 "cart state management"
Task: T053 "Cart component"
Task: T054 "CartSummary component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~T001-T010)
2. Complete Phase 2: Foundational (~T011-T037)
3. Complete Phase 3: User Story 1 (~T038-T065)
4. **STOP and VALIDATE**: Test runner can search, purchase, download
5. Deploy MVP and gather feedback

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Photographers can upload → Deploy
4. Add User Story 3 → Photographers see earnings → Deploy
5. Add User Story 4 → Runners can track history → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Runner Purchase)
   - Developer B: User Story 2 (Photographer Upload)
3. After US1/US2 complete:
   - Developer A: User Story 4 (Runner Account)
   - Developer B: User Story 3 (Photographer Dashboard)
4. Stories complete and integrate independently

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 150 |
| **Setup Tasks** | 10 |
| **Foundational Tasks** | 27 |
| **US1 Tasks (P1)** | 28 |
| **US2 Tasks (P2)** | 33 |
| **US3 Tasks (P3)** | 21 |
| **US4 Tasks (P4)** | 13 |
| **Polish Tasks** | 18 |
| **Parallelizable Tasks** | 67 |

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1)**

This delivers:
- Bib number search without account
- Watermarked photo previews
- Bundle pricing ($1 single, $4 for 5, etc.)
- Guest checkout with Stripe
- Immediate download access

Total MVP tasks: **65 tasks** (T001-T065)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
