# Marathon Photo Marketplace

> A two-sided marketplace where runners find and purchase race photos by bib number, and photographers monetize their work with instant payouts.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg)](https://supabase.com/)

---

## Project Status

### Overall Progress: 45% Complete

### Phase Completion

| Phase | Status | Progress | Description |
|-------|--------|----------|-------------|
| **Phase 1: Setup** | Complete | 100% | Infrastructure & tooling |
| **Phase 2: Foundation** | Complete | 100% | Database, auth, UI components |
| **Phase 3: MVP (Runner Purchase)** | Complete | 100% | Search, Cart, Checkout, Download |
| **Phase 4: Photographer Upload** | Pending | 0% | Bulk upload with AI bib detection |
| **Phase 5: Photographer Dashboard** | Pending | 0% | Sales analytics & earnings |
| **Phase 6: Runner Accounts** | Pending | 0% | Order history & notifications |
| **Phase 7: Polish** | Pending | 0% | Performance, PWA, cross-browser |

### MVP Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Bib Number Search | Working | <2s response time |
| Watermarked Previews | Working | Gallery + modal preview |
| Shopping Cart | Working | Zustand state management |
| Guest Checkout | Working | Stripe integration |
| Photo Downloads | Working | Signed URLs |
| Mobile Responsive | Working | Mobile-first design |

---

## Features

### For Runners

- **Instant Bib Search** - Find your photos by bib number, no account required
- **Preview Before Buy** - View watermarked previews before purchasing
- **Easy Checkout** - Guest checkout with credit card via Stripe
- **Instant Downloads** - Get high-res, watermark-free photos immediately
- **Bundle Pricing** - Save with photo bundles (5 for $4, 10 for $7, 20 for $12)

### For Photographers

- **Bulk Upload** - Upload 500+ photos per batch
- **AI Bib Detection** - Automatic bib number tagging via Azure AI Vision
- **70% Revenue Share** - Keep $0.70 for every $1 photo sold
- **Real-time Dashboard** - Track sales and earnings instantly
- **Auto Payouts** - Direct deposits via Stripe Connect

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 5.5.x | Type-safe development |
| **React** | 18.3.x | UI framework |
| **Next.js** | 14.2.x | Full-stack framework (App Router) |
| **Node.js** | 20 LTS | Runtime environment |
| **Supabase** | Latest | Backend (Auth, DB, Storage, Realtime) |
| **PostgreSQL** | 15.x | Database (via Supabase) |
| **Stripe** | 16.10.x | Payments & Connect |
| **Azure AI Vision** | 4.0 | Bib number OCR |
| **Tailwind CSS** | 3.4.x | Styling |
| **Zustand** | 4.5.x | State management |
| **Vitest** | 2.1.x | Unit testing |
| **Playwright** | 1.47.x | E2E testing |

---

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm 9+
- Supabase account (cloud or local Docker)
- Stripe account (test mode)
- Azure AI Vision API key (optional for bib detection)

### Installation

```bash
# Clone the repository
git clone https://github.com/msftsean/hiedcab_marathon_photos.git
cd hiedcab_marathon_photos

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Azure AI Vision (optional)
AZURE_VISION_ENDPOINT=your-endpoint
AZURE_VISION_KEY=your-key
```

### Development

```bash
pnpm dev              # Start development server
pnpm test             # Run unit tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm typecheck        # Type checking
pnpm lint             # Linting
```

### Database Setup

```bash
pnpm supabase:db:push   # Push migrations to Supabase
pnpm supabase:db:seed   # Seed test data
```

---

## Project Structure

```
vibes/
  docs/                     Documentation & prompts
  public/                   Static assets (icons, images, screenshots)
  specs/                    Feature specifications
  src/
    app/                    Next.js App Router
      (public)/             Public routes (search, checkout)
      api/                  API routes
    components/             React components
    hooks/                  Custom React hooks
    lib/                    Utilities & clients
    styles/                 Global styles
    types/                  TypeScript definitions
  supabase/
    functions/              Edge Functions
    migrations/             Database migrations
    seed.sql                Test data
  tests/
    e2e/                    Playwright E2E tests
    fixtures/               Test fixtures
    integration/            API tests
    mocks/                  Test mocks
    unit/                   Unit tests
```

---

## Pricing Model

| Option | Price | Per Photo |
|--------|-------|-----------|
| Single Photo | $1.00 | $1.00 |
| 5-Photo Bundle | $4.00 | $0.80 |
| 10-Photo Bundle | $7.00 | $0.70 |
| 20-Photo Bundle | $12.00 | $0.60 |

**Revenue Split**: 70% Photographer / 30% Platform

---

## Test Data

| Type | Value | Notes |
|------|-------|-------|
| Test Photographer | photographer@test.com | Password: password123 |
| Test Bib Numbers | 12345, 12346, 67890 | Search these to see photos |
| Test Events | Boston Marathon, NYC Half, Chicago 10K | 2026 dates |

---

## Documentation

- [Feature Specification](specs/001-v1-marketplace/spec.md)
- [Implementation Plan](specs/001-v1-marketplace/plan.md)
- [Data Model](specs/001-v1-marketplace/data-model.md)
- [API Contracts](specs/001-v1-marketplace/contracts/openapi.yaml)
- [Original Prompt](docs/marathon-photo-marketplace-prp.md)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Find your finish line photos. Monetize your race photography.</strong>
</p>
