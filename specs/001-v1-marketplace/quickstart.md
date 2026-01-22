# Quickstart Guide: V1 Core Marketplace

**Feature Branch**: `001-v1-marketplace`
**Date**: 2026-01-22

## Prerequisites

Before starting development, ensure you have:

- **Node.js** 20 LTS or higher
- **pnpm** (recommended) or npm
- **Docker** (for local Supabase)
- **Azure account** with AI Vision subscription
- **Stripe account** with Connect enabled

## Project Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd vibes
git checkout 001-v1-marketplace

pnpm install
```

### 2. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Azure AI Vision
AZURE_VISION_ENDPOINT=https://<region>.api.cognitive.microsoft.com/
AZURE_VISION_KEY=<your-key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Supabase Locally

```bash
# Start Supabase services (Postgres, Auth, Storage, Realtime)
pnpm supabase start

# Apply migrations
pnpm supabase db push

# Seed development data (optional)
pnpm supabase db seed
```

This starts:
- **PostgreSQL** on port 54322
- **Supabase Studio** at http://localhost:54323
- **Auth** at http://localhost:54321/auth/v1
- **REST API** at http://localhost:54321/rest/v1
- **Realtime** at http://localhost:54321/realtime/v1

### 4. Start Development Server

```bash
pnpm dev
```

Application runs at http://localhost:3000

## Development Workflow

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires app running)
pnpm test:e2e

# Run with coverage
pnpm test:coverage
```

### Database Migrations

```bash
# Create new migration
pnpm supabase migration new <migration-name>

# Apply migrations
pnpm supabase db push

# Reset database (destructive)
pnpm supabase db reset
```

### Stripe Testing

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Test cards:
- **Success**: 4242 4242 4242 4242
- **Requires auth**: 4000 0025 0000 3155
- **Decline**: 4000 0000 0000 0002

### Azure AI Vision Testing

For local development without Azure costs:
1. Use the mock in `tests/mocks/azure-vision.ts`
2. Set `MOCK_AZURE_VISION=true` in `.env.local`

The mock returns predictable bib detections based on test images in `tests/fixtures/`.

## Key Development Tasks

### Task 1: Implement Bib Search (FR-001, FR-002)

**Files to create/modify:**
- `src/app/(public)/search/page.tsx` - Search page
- `src/components/search/SearchInput.tsx` - Bib number input
- `src/components/search/SearchResults.tsx` - Results grid
- `src/lib/supabase/queries/search.ts` - Database queries

**Test command:**
```bash
pnpm test src/app/(public)/search
```

**Acceptance criteria:**
- Search works without authentication
- Results display in <2 seconds
- Watermarked previews only

### Task 2: Implement Guest Checkout (FR-003, FR-004, FR-005)

**Files to create/modify:**
- `src/app/(public)/checkout/page.tsx` - Checkout flow
- `src/components/checkout/Cart.tsx` - Shopping cart
- `src/app/api/checkout/session/route.ts` - Create Stripe session
- `src/app/api/webhooks/stripe/route.ts` - Handle payment completion

**Test with Stripe CLI:**
```bash
# In terminal 1
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In terminal 2
pnpm test:e2e tests/e2e/checkout.spec.ts
```

### Task 3: Implement Photo Upload (FR-009, FR-010)

**Files to create/modify:**
- `src/app/(auth)/upload/page.tsx` - Upload UI
- `src/components/upload/BulkUploader.tsx` - Multi-file uploader
- `supabase/functions/process-photo/index.ts` - AI processing function

**Local testing:**
```bash
# Test upload API
pnpm test src/app/api/upload

# Test Edge Function
pnpm supabase functions serve process-photo
```

### Task 4: Implement Photographer Dashboard (FR-012)

**Files to create/modify:**
- `src/app/(auth)/dashboard/page.tsx` - Dashboard page
- `src/components/dashboard/StatsCards.tsx` - Earnings stats
- `src/components/dashboard/SalesChart.tsx` - Sales over time
- `src/lib/supabase/queries/dashboard.ts` - Aggregation queries

**Realtime setup:**
```typescript
// Subscribe to new sales
const channel = supabase
  .channel('photographer-sales')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transaction_items',
    filter: `photographer_id=eq.${userId}`
  }, handleNewSale)
  .subscribe();
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard.

### Supabase Production

```bash
# Link to production project
pnpm supabase link --project-ref <project-id>

# Push migrations
pnpm supabase db push

# Deploy Edge Functions
pnpm supabase functions deploy
```

## Troubleshooting

### Supabase connection issues

```bash
# Check Supabase status
pnpm supabase status

# View logs
pnpm supabase logs
```

### Stripe webhook issues

```bash
# Verify webhook secret matches
stripe listen --print-secret

# Check webhook logs
stripe logs tail
```

### Azure Vision errors

1. Verify endpoint URL includes region (e.g., `westus2.api.cognitive.microsoft.com`)
2. Check API key is valid: `curl -H "Ocp-Apim-Subscription-Key: <key>" <endpoint>/vision/v3.2/read/analyze`
3. Review rate limits: default 10 TPS

## Resources

- [Spec Document](spec.md) - Functional requirements
- [Data Model](data-model.md) - Database schema
- [API Contracts](contracts/openapi.yaml) - OpenAPI specification
- [Research](research.md) - Technology decisions

External:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Azure AI Vision Docs](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
