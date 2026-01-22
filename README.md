# 🏃 Marathon Photo Marketplace

> A two-sided marketplace where runners find and purchase race photos by bib number, and photographers monetize their work with instant payouts.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E.svg)](https://supabase.com/)

---

## 📊 Project Status

### Overall Progress

```
█████████████░░░░░░░░░░░░░░░░░  45% Complete
```

### Phase Completion

| Phase | Status | Progress | Description |
|-------|--------|----------|-------------|
| 🔧 **Phase 1: Setup** | ✅ Complete | `██████████` 100% | Infrastructure & tooling |
| 🏗️ **Phase 2: Foundation** | ✅ Complete | `██████████` 100% | Database, auth, UI components |
| 🛒 **Phase 3: MVP (Runner Purchase)** | ✅ Complete | `██████████` 100% | Search → Cart → Checkout → Download |
| 📸 **Phase 4: Photographer Upload** | ⏳ Pending | `░░░░░░░░░░` 0% | Bulk upload with AI bib detection |
| 📈 **Phase 5: Photographer Dashboard** | ⏳ Pending | `░░░░░░░░░░` 0% | Sales analytics & earnings |
| 👤 **Phase 6: Runner Accounts** | ⏳ Pending | `░░░░░░░░░░` 0% | Order history & notifications |
| ✨ **Phase 7: Polish** | ⏳ Pending | `░░░░░░░░░░` 0% | Performance, PWA, cross-browser |

### MVP Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| 🔍 Bib Number Search | ✅ Working | <2s response time |
| 🖼️ Watermarked Previews | ✅ Working | Gallery + modal preview |
| 🛒 Shopping Cart | ✅ Working | Zustand state management |
| 💳 Guest Checkout | ✅ Working | Stripe integration |
| 📥 Photo Downloads | ✅ Working | Signed URLs |
| 📱 Mobile Responsive | ✅ Working | Mobile-first design |

---

## 🎯 Features

### For Runners 🏃

- **🔍 Instant Bib Search** — Find your photos by bib number, no account required
- **👀 Preview Before Buy** — View watermarked previews before purchasing
- **🛒 Easy Checkout** — Guest checkout with credit card via Stripe
- **📥 Instant Downloads** — Get high-res, watermark-free photos immediately
- **📦 Bundle Pricing** — Save with photo bundles (5 for $4, 10 for $7, 20 for $12)

### For Photographers 📸

- **📤 Bulk Upload** — Upload 500+ photos per batch
- **🤖 AI Bib Detection** — Automatic bib number tagging via Azure AI Vision
- **💰 70% Revenue Share** — Keep $0.70 for every $1 photo sold
- **📊 Real-time Dashboard** — Track sales and earnings instantly
- **🏦 Auto Payouts** — Direct deposits via Stripe Connect

---

## 🛠️ Tech Stack

### Version Matrix

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

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js PWA)                      │
├─────────────────────────────────────────────────────────────────┤
│  📱 Mobile-First UI  │  🔍 Search  │  🛒 Cart  │  📊 Dashboard  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
           ┌────────▼────────┐       ┌───────▼────────┐
           │   Supabase      │       │    Stripe      │
           │   ┌──────────┐  │       │   ┌────────┐   │
           │   │   Auth   │  │       │   │Checkout│   │
           │   ├──────────┤  │       │   ├────────┤   │
           │   │ Postgres │  │       │   │Connect │   │
           │   ├──────────┤  │       │   └────────┘   │
           │   │ Storage  │  │       └────────────────┘
           │   ├──────────┤  │
           │   │ Realtime │  │       ┌────────────────┐
           │   ├──────────┤  │       │  Azure AI      │
           │   │  Edge    │◄─┼──────►│  Vision API    │
           │   │Functions │  │       │  (Bib OCR)     │
           │   └──────────┘  │       └────────────────┘
           └─────────────────┘
```

---

## 🚀 Quick Start

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
# Start the development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Database Setup

```bash
# Push migrations to Supabase
pnpm supabase:db:push

# Seed test data
pnpm supabase:db:seed
```

### Stripe Webhook (Local Development)

```bash
# In a separate terminal
pnpm stripe:listen
```

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/            # 🌐 Public routes (no auth)
│   │   ├── search/          # 🔍 Bib number search
│   │   ├── photos/[id]/     # 🖼️ Photo detail/preview
│   │   └── checkout/        # 💳 Guest checkout flow
│   ├── (auth)/              # 🔒 Protected routes
│   │   ├── dashboard/       # 📊 Photographer dashboard
│   │   ├── upload/          # 📤 Photo upload flow
│   │   └── account/         # ⚙️ Account settings
│   └── api/                 # 🔌 API routes
├── components/              # 🧩 React components
│   ├── ui/                  # Base UI components
│   ├── photos/              # Photo gallery, preview, cart
│   ├── search/              # Search input, results
│   └── checkout/            # Cart, payment UI
├── lib/                     # 📚 Utilities & clients
│   ├── supabase/            # Supabase client, hooks
│   ├── stripe/              # Stripe client, helpers
│   └── utils/               # Shared utilities
├── hooks/                   # 🪝 Custom React hooks
├── types/                   # 📝 TypeScript definitions
└── styles/                  # 🎨 Global styles

supabase/
├── migrations/              # 🗃️ Database migrations
├── functions/               # ⚡ Edge Functions
└── seed.sql                 # 🌱 Test data

tests/
├── e2e/                     # 🎭 Playwright E2E tests
├── integration/             # 🔗 API tests
└── unit/                    # 🧪 Unit tests
```

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | 🚀 Start development server |
| `pnpm build` | 📦 Production build |
| `pnpm start` | ▶️ Start production server |
| `pnpm lint` | 🔍 Run ESLint |
| `pnpm typecheck` | 📝 TypeScript type check |
| `pnpm test` | 🧪 Run unit tests |
| `pnpm test:e2e` | 🎭 Run Playwright E2E tests |
| `pnpm test:coverage` | 📊 Run tests with coverage |
| `pnpm format` | ✨ Format code with Prettier |
| `pnpm supabase:db:push` | 🗃️ Push database migrations |
| `pnpm stripe:listen` | 📡 Start Stripe webhook listener |

---

## 💰 Pricing Model

| Option | Price | Per Photo |
|--------|-------|-----------|
| Single Photo | $1.00 | $1.00 |
| 5-Photo Bundle | $4.00 | $0.80 |
| 10-Photo Bundle | $7.00 | $0.70 |
| 20-Photo Bundle | $12.00 | $0.60 |

**Revenue Split**: 70% Photographer / 30% Platform

---

## 🎯 Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| 🔍 Photo search response | < 2 seconds | ✅ Achieved |
| 🛒 Purchase flow completion | < 3 minutes | ✅ Achieved |
| 📤 Upload 100 photos | < 15 minutes | ⏳ Pending |
| 🤖 AI bib detection accuracy | > 90% | ⏳ Pending |
| 👥 Concurrent users | 1000+ | ⏳ Pending |
| 💳 Checkout completion rate | > 80% | ⏳ Pending |
| 📱 Lighthouse mobile score | > 80 | ⏳ Pending |

---

## 🧪 Test Data

For development and testing:

| Type | Value | Notes |
|------|-------|-------|
| 📧 Test Photographer | `photographer@test.com` | Password: `password123` |
| 🏷️ Test Bib Numbers | `12345`, `12346`, `67890` | Search these to see photos |
| 🏃 Test Events | Boston Marathon, NYC Half, Chicago 10K | 2026 dates |

---

## 📖 Documentation

- [📋 Feature Specification](specs/001-v1-marketplace/spec.md)
- [🗺️ Implementation Plan](specs/001-v1-marketplace/plan.md)
- [🗃️ Data Model](specs/001-v1-marketplace/data-model.md)
- [🔌 API Contracts](specs/001-v1-marketplace/contracts/openapi.yaml)
- [✅ Requirements Checklist](specs/001-v1-marketplace/checklists/requirements.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- Payments powered by [Stripe](https://stripe.com/)
- AI vision by [Azure AI Vision](https://azure.microsoft.com/en-us/products/ai-services/ai-vision)
- Icons by [Lucide](https://lucide.dev/)

---

<p align="center">
  <strong>🏃 Find your finish line photos. 📸 Monetize your race photography.</strong>
</p>
