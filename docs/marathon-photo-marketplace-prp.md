# GitHub Copilot PRP: Marathon Photo Marketplace

## Product Name
*(Working title — TBD)*

## One-Sentence Idea
A two-sided marketplace where runners search for race photos by bib number and pay photographers $1/photo to download watermark-free versions.

---

## Target Audience

### Runners
- All levels, all race types (5K to ultramarathon)
- Looking for their race photos post-event
- Pain point: Digging through thousands of photos to find themselves

### Photographers
- Amateur to professional
- Covering local races to major marathons
- Want to monetize their shots without manual tagging overhead

---

## User Journey

### Runner Flow
1. Discover app (word of mouth, Google, Facebook ads)
2. Search by bib number (no account required)
3. Browse watermarked photo previews
4. Purchase individual photos or bundles ($1/photo)
5. Checkout via Stripe (guest or account)
6. Download high-res, watermark-free photos
7. Optional: Create account to save order history, get notified of new uploads for their bib

### Photographer Flow
1. Create account (required for Stripe Connect)
2. Bulk upload photos from an event
3. AI (Azure Vision) auto-detects and tags bib numbers
4. Photos that fail bib recognition are deleted, photographer notified
5. Photos go live with watermarks
6. Track sales, earnings, and analytics via dashboard
7. Get paid via Stripe Connect

---

## Core Features (V1)

### Runner-Facing
- Bib number search
- Photo preview gallery (watermarked)
- Purchase individual photos or bundles
- Download purchased photos
- Account/order history (optional)

### Photographer-Facing
- Bulk photo upload
- AI bib number detection/tagging (Azure Vision)
- Face grouping as backup identification
- Auto-cropping
- Quality scoring to surface best shots
- Dashboard (uploads, sales, earnings)
- Stripe Connect payouts
- Analytics (which photos sell, event performance)

### Platform/Admin
- Event/race management (organize photos by race, date, location)
- Revenue split handling (platform cut TBD)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | PWA (native later) |
| AI/Vision | Azure AI Vision (bib OCR, batch processing) |
| AI Features | Face grouping, auto-crop, quality scoring |
| Auth | Social (Google, Facebook, Apple) + email/password + passwordless (magic link/OTP) |
| Payments | Stripe (checkout) + Stripe Connect (photographer payouts) |
| Storage | Cloud blob storage for photos (originals, watermarked, thumbnails) |
| Database | TBD (user profiles, transactions, AI metadata, event data, analytics) |

---

## Data Model (High-Level)

### Users
- Runner profiles (bib history, purchased photos, payment history)
- Photographer profiles (uploads, earnings, Stripe Connect ID, payout history)

### Photos
- Originals
- Watermarked versions
- Thumbnails

### AI Metadata
- Bib numbers
- Face embeddings
- Quality scores

### Events
- Race name
- Date
- Location

### Transactions
- Orders
- Payments
- Payouts
- Download entitlements

### Analytics
- Events
- Engagement
- Conversion metrics

### Reviews/Ratings
- Photographer ratings

---

## Design Vibe

**High-energy / Athletic** — Nike Run Club inspired.

- Bold typography
- Action imagery
- Celebrates the achievement of crossing the finish line
- Mobile-first experience for runners at the event

---

## Competitive Landscape

### Building to Beat
- MarathonFoto
- GameFace Media
- Finisher Pix
- Unsplash/Shutterstock (marketplace mechanics)
- Strava (community/athletic vibe)

### Differentiators
- AI-first bib detection (no manual tagging)
- Modern PWA experience (not legacy web)
- Clean $1/photo model
- Fast, low-friction checkout (guest OK)

---

## Roadmap

| Version | Feature |
|---------|---------|
| V1 | Core marketplace (search, buy, upload, AI tagging, payouts) |
| V2 | Subscription model for photographers |
| V3 | Race organizer partnerships |
| V4 | Video clips (finish line crossings, highlights) |
| V5 | Social sharing (branded overlays, "I finished!" templates) |
| V6 | Runner-to-runner tagging |
| V7 | Leaderboards / gamification for photographers |
| V8 | Print fulfillment (canvas, photo books) |
| V9 | API for race timing companies |

---

## Open Questions for Scoping

- [ ] Product name?
- [ ] Platform revenue split (% on top of $1)?
- [ ] Auth provider preference (Azure AD B2C, Supabase, Clerk)?
- [ ] Database choice (Cosmos, Postgres, Supabase)?
- [ ] Photo storage (Azure Blob, S3, Cloudflare R2)?
- [ ] What's the "bundle" pricing model?

---

## Instructions for GitHub Copilot

Using this PRP, generate a scoped product plan that includes:

1. **Project structure** — folder organization for a PWA
2. **Database schema** — tables/collections for all data models listed
3. **API endpoints** — RESTful or GraphQL endpoints for all user flows
4. **AI integration plan** — Azure Vision implementation for bib detection, face grouping, quality scoring
5. **Auth implementation** — multi-provider auth setup
6. **Stripe integration** — checkout flow and Connect onboarding
7. **Component breakdown** — UI components needed for both runner and photographer experiences
8. **Deployment strategy** — CI/CD, hosting recommendations
9. **MVP scope** — what to build first vs. defer

Focus on V1 features only. Future versions are for reference but should not be implemented yet.
