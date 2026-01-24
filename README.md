# ÌøÉ Marathon Photo Marketplace

> A two-sided marketplace where runners find and purchase race photos by bib number, and photographers monetize their work with instant payouts.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg)](https://supabase.com/)

---

## Ì≥ä Project Status

### Overall Progress

```
‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñà‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë‚ñë  45% Complete
```

### Phase Completion

| Phase | Status | Progress | Description |
|-------|--------|----------|-------------|
| Ì¥ß **Phase 1: Setup** | ‚úÖ Complete | 100% | Infrastructure & tooling |
| ÌøóÔ∏è **Phase 2: Foundation** | ‚úÖ Complete | 100% | Database, auth, UI components |
| Ìªí **Phase 3: MVP (Runner Purchase)** | ‚úÖ Complete | 100% | Search ‚Üí Cart ‚Üí Checkout ‚Üí Download |
| Ì≥∏ **Phase 4: Photographer Upload** | ‚è≥ Pending | 0% | Bulk upload with AI bib detection |
| Ì≥à **Phase 5: Photographer Dashboard** | ‚è≥ Pending | 0% | Sales analytics & earnings |
| Ì±§ **Phase 6: Runner Accounts** | ‚è≥ Pending | 0% | Order history & notifications |
| ‚ú® **Phase 7: Polish** | ‚è≥ Pending | 0% | Performance, PWA, cross-browser |

### MVP Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Ì¥ç Bib Number Search | ‚úÖ Working | <2s response time |
| Ì∂ºÔ∏è Watermarked Previews | ‚úÖ Working | Gallery + modal preview |
| Ìªí Shopping Cart | ‚úÖ Working | Zustand state management |
| Ì≤≥ Guest Checkout | ‚úÖ Working | Stripe integration |
| Ì≥• Photo Downloads | ‚úÖ Working | Signed URLs |
| Ì≥± Mobile Responsive | ‚úÖ Working | Mobile-first design |

---

## ÌæØ Features

### For Runners ÌøÉ

- **Ì¥ç Instant Bib Search** ‚Äî Find your photos by bib number, no account required
- **Ì±Ä Preview Before Buy** ‚Äî View watermarked previews before purchasing
- **Ìªí Easy Checkout** ‚Äî Guest checkout with credit card via Stripe
- **Ì≥• Instant Downloads** ‚Äî Get high-res, watermark-free photos immediately
- **Ì≥¶ Bundle Pricing** ‚Äî Save with photo bundles (5 for $4, 10 for $7, 20 for $12)

### For Photographers Ì≥∏

- **Ì≥§ Bulk Upload** ‚Äî Upload 500+ photos per batch
- **Ì¥ñ AI Bib Detection** ‚Äî Automatic bib number tagging via Azure AI Vision
- **Ì≤∞ 70% Revenue Share** ‚Äî Keep $0.70 for every $1 photo sold
- **Ì≥ä Real-time Dashboard** ‚Äî Track sales and earnings instantly
- **Ìø¶ Auto Payouts** ‚Äî Direct deposits via Stripe Connect

---

## Ìª†Ô∏è Tech Stack

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

## Ì∫Ä Quick Start

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

## Ì≥Å Project Structure

```
‚îú‚îÄ‚îÄ docs/                     # Ì≥Ñ Documentation & prompts
‚îÇ   ‚îú‚îÄ‚îÄ github-copilot-prp-metaprompt.md
‚îÇ   ‚îî‚îÄ‚îÄ marathon-photo-marketplace-prp.md
‚îú‚îÄ‚îÄ public/                   # Ìºê Static assets
‚îÇ   ‚îú‚îÄ‚îÄ icons/
‚îÇ   ‚îú‚îÄ‚îÄ images/
‚îÇ   ‚îî‚îÄ‚îÄ screenshots/
‚îú‚îÄ‚îÄ specs/                    # Ì≥ã Feature specifications
‚îÇ   ‚îî‚îÄ‚îÄ 001-v1-marketplace/
‚îú‚îÄ‚îÄ src/
‚îÇ   ‚îú‚îÄ‚îÄ app/                  # Next.js App Router
‚îÇ   ‚îÇ   ‚îú‚îÄ‚îÄ (public)/         # Public routes (search, checkout)
‚îÇ   ‚îÇ   ‚îî‚îÄ‚îÄ api/              # API routes
‚îÇ   ‚îú‚îÄ‚îÄ components/           # React components
‚îÇ   ‚îú‚îÄ‚îÄ hooks/                # Custom React hooks
‚îÇ   ‚îú‚îÄ‚îÄ lib/                  # Utilities & clients
‚îÇ   ‚îú‚îÄ‚îÄ styles/               # Global styles
‚îÇ   ‚îî‚îÄ‚îÄ types/                # TypeScript definitions
‚îú‚îÄ‚îÄ supabase/
‚îÇ   ‚îú‚îÄ‚îÄ functions/            # Edge Functions
‚îÇ   ‚îú‚îÄ‚îÄ migrations/           # Database migrations
‚îÇ   ‚îî‚îÄ‚îÄ seed.sql              # Test data
‚îî‚îÄ‚îÄ tests/
    ‚îú‚îÄ‚îÄ e2e/                  # Playwright E2E tests
    ‚îú‚îÄ‚îÄ fixtures/             # Test fixtures
    ‚îú‚îÄ‚îÄ integration/          # API tests
    ‚îú‚îÄ‚îÄ mocks/                # Test mocks
    ‚îî‚îÄ‚îÄ unit/                 # Unit tests
```

---

## Ì≤∞ Pricing Model

| Option | Price | Per Photo |
|--------|-------|-----------|
| Single Photo | $1.00 | $1.00 |
| 5-Photo Bundle | $4.00 | $0.80 |
| 10-Photo Bundle | $7.00 | $0.70 |
| 20-Photo Bundle | $12.00 | $0.60 |

**Revenue Split**: 70% Photographer / 30% Platform

---

## Ì∑™ Test Data

| Type | Value | Notes |
|------|-------|-------|
| Ì≥ß Test Photographer | `photographer@test.com` | Password: `password123` |
| Ìø∑Ô∏è Test Bib Numbers | `12345`, `12346`, `67890` | Search these to see photos |
| ÌøÉ Test Events | Boston Marathon, NYC Half, Chicago 10K | 2026 dates |

---

## Ì≥ñ Documentation

- [Feature Specification](specs/001-v1-marketplace/spec.md)
- [Implementation Plan](specs/001-v1-marketplace/plan.md)
- [Data Model](specs/001-v1-marketplace/data-model.md)
- [API Contracts](specs/001-v1-marketplace/contracts/openapi.yaml)
- [Original Prompt](docs/marathon-photo-marketplace-prp.md)

---

## Ì≥Ñ License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>ÌøÉ Find your finish line photos. Ì≥∏ Monetize your race photography.</strong>
</p>
