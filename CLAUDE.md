# Marathon Photo Marketplace Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-22

## Active Technologies

- TypeScript 5.x, React 18+ with Next.js 14+ (App Router), Node.js 20 LTS (001-v1-marketplace)
- Supabase (Auth, Database, Storage, Realtime) (001-v1-marketplace)
- Azure AI Vision (bib OCR) (001-v1-marketplace)
- Stripe + Stripe Connect (payments) (001-v1-marketplace)

## Project Structure

```text
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
└── seed.sql                 # Development seed data

tests/
├── e2e/                     # Playwright E2E tests
├── integration/             # API/database integration tests
└── unit/                    # Component and utility unit tests
```

## Commands

```bash
# Development
pnpm dev                     # Start Next.js dev server
pnpm supabase start          # Start local Supabase
pnpm supabase db push        # Apply migrations

# Testing
pnpm test                    # Run unit tests (Vitest)
pnpm test:e2e                # Run E2E tests (Playwright)
pnpm test:coverage           # Run tests with coverage

# Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Build
pnpm build                   # Production build
pnpm lint                    # Run ESLint
pnpm typecheck               # Run TypeScript checks
```

## Code Style

**TypeScript/React**:
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Server Components by default, Client Components when needed

**Supabase**:
- Use RLS policies for authorization
- Prefer Supabase client hooks in React
- Use Edge Functions for async processing

**Testing**:
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for user flows
- Use Stripe test mode for payment tests

## Recent Changes

- 001-v1-marketplace: Added V1 Core Marketplace with Next.js + Supabase stack

## Constitution

See [.specify/memory/constitution.md](.specify/memory/constitution.md) for project principles:
1. **Runner-First Experience** - Guest bib search, <2s load, guest checkout
2. **Photographer Monetization** - Stripe Connect, bulk upload, earnings dashboard
3. **AI-Powered Automation** - Azure Vision bib OCR, >90% accuracy
4. **Payment Security** - PCI-DSS via Stripe, no raw card storage
5. **Mobile-First PWA** - Lighthouse >80, touch-friendly
6. **Data Privacy** - GDPR/CCPA compliance
7. **Simplicity** - Ship V1 fast, iterate based on real usage

## Key Specifications

- [specs/001-v1-marketplace/spec.md](specs/001-v1-marketplace/spec.md) - Feature requirements
- [specs/001-v1-marketplace/plan.md](specs/001-v1-marketplace/plan.md) - Implementation plan
- [specs/001-v1-marketplace/data-model.md](specs/001-v1-marketplace/data-model.md) - Database schema
- [specs/001-v1-marketplace/contracts/openapi.yaml](specs/001-v1-marketplace/contracts/openapi.yaml) - API contracts

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
