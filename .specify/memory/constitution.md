<!--
  Sync Impact Report
  ==================
  Version Change: N/A → 1.0.0 (initial ratification)

  Modified Principles: N/A (initial version)

  Added Sections:
  - Core Principles (7 principles)
  - Technical Standards
  - Quality Gates
  - Governance

  Removed Sections: N/A (initial version)

  Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Requirements section aligns)
  - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports principles)

  Follow-up TODOs: None
-->

# Marathon Photo Marketplace Constitution

## Core Principles

### I. Runner-First Experience (NON-NEGOTIABLE)

The platform exists to help runners find and purchase their race photos with minimal friction.

- Bib number search MUST work without account creation
- Photo browsing MUST be fast (<2s page load) even on mobile networks at race venues
- Purchase flow MUST support guest checkout via Stripe
- Watermarked previews MUST be high enough quality to identify oneself but protected against screenshots
- Download of purchased photos MUST be immediate and reliable

**Rationale**: Runners are often searching for photos on-site at races or shortly after. Any friction loses the sale.

### II. Photographer Monetization

Photographers MUST have a clear, fair path to earning revenue from their work.

- Stripe Connect onboarding MUST be streamlined (target: <5 minutes to complete)
- Bulk upload MUST support 500+ photos per batch without timeout
- AI bib detection failures MUST notify photographer with clear next steps
- Earnings dashboard MUST show real-time sales and payout status
- Platform revenue split MUST be transparent and documented at signup

**Rationale**: Without photographers, there is no marketplace. Their success drives platform success.

### III. AI-Powered Automation

Azure AI Vision powers core functionality. AI features MUST enhance, not block, the user experience.

- Bib number OCR MUST achieve >90% accuracy on standard race bibs
- Photos failing bib detection MUST be handled gracefully (photographer review queue, not silent deletion)
- Face grouping MUST serve as backup identification method
- Auto-cropping MUST preserve original while generating optimized versions
- Quality scoring MUST surface best shots first without hiding lower-quality photos entirely
- AI processing MUST complete within 30 seconds per photo for batch uploads

**Rationale**: AI is a competitive differentiator but MUST NOT create data loss or frustrated users.

### IV. Payment Security & Compliance

All payment handling MUST follow PCI-DSS compliance via Stripe.

- Platform MUST NOT store raw credit card data
- Stripe Checkout MUST be used for all payment flows
- Stripe Connect MUST handle all photographer payouts
- Transaction records MUST be immutable and auditable
- Refund policies MUST be clearly documented and consistently enforced

**Rationale**: Payment trust is foundational. One security incident destroys the marketplace.

### V. Mobile-First PWA Architecture

The primary user experience is mobile; desktop is secondary.

- PWA MUST achieve Lighthouse performance score >80 on mobile
- Core flows (search, browse, purchase) MUST work offline-capable where feasible
- Touch targets MUST meet accessibility guidelines (minimum 44x44px)
- Image loading MUST use progressive/lazy loading strategies
- Native app features (push notifications, add to home screen) MUST be implemented via PWA APIs first

**Rationale**: Runners discover photos on their phones at or immediately after races.

### VI. Data Privacy & Photo Rights

User data and photographer content MUST be protected.

- Runner search history MUST NOT be sold or shared with third parties
- Photographers retain copyright; platform receives license for display/sale only
- Photo metadata (EXIF) MUST be preserved for photographers, stripped from buyer downloads
- GDPR/CCPA compliance MUST be built-in from V1
- Account deletion MUST remove all personal data within 30 days

**Rationale**: Trust from both sides of the marketplace requires clear data policies.

### VII. Simplicity & Iterative Delivery

Start simple, ship fast, iterate based on real usage.

- V1 MUST focus on core marketplace only (search, buy, upload, AI tagging, payouts)
- Features MUST be independently deployable (feature flags where needed)
- Technical debt MUST be tracked and addressed before it compounds
- YAGNI: Do not build V2-V9 features until V1 is proven
- Each version MUST deliver measurable user value before next version starts

**Rationale**: The roadmap is ambitious (V1-V9). Shipping V1 fast validates the market.

## Technical Standards

### Stack Requirements

| Layer | Technology | Constraint |
|-------|------------|------------|
| Frontend | PWA (React/Vue/Svelte TBD) | Mobile-first, Lighthouse >80 |
| AI/Vision | Azure AI Vision | Batch processing, bib OCR |
| Auth | Social + email + passwordless | No vendor lock-in on user identities |
| Payments | Stripe + Stripe Connect | PCI-DSS compliance via Stripe |
| Storage | Cloud blob storage | Originals, watermarked, thumbnails |
| Database | TBD (Postgres/Cosmos/Supabase) | Must support analytics queries |

### API Design

- REST or GraphQL endpoints MUST follow consistent naming conventions
- All endpoints MUST return structured error responses with actionable messages
- Rate limiting MUST protect against abuse (especially bib search)
- API versioning MUST be implemented from V1

### Testing Requirements

- Unit tests MUST cover business logic (payment calculations, AI result parsing)
- Integration tests MUST cover payment flows end-to-end (using Stripe test mode)
- Contract tests MUST verify API stability between frontend and backend
- Load tests MUST simulate race-day traffic patterns (spiky, mobile-heavy)

### Performance Targets

- Photo search: <500ms response time (p95)
- Image gallery: <2s initial load on 3G
- Checkout completion: <3s total flow
- AI processing: <30s per photo in batch mode
- Concurrent users: 1000+ during peak race hours

## Quality Gates

All pull requests MUST pass before merge:

1. **Constitution Compliance**: Changes align with Core Principles
2. **Test Coverage**: New code has appropriate test coverage
3. **Performance**: No regression on key metrics
4. **Security**: No new vulnerabilities introduced (dependency scanning)
5. **Accessibility**: WCAG 2.1 AA compliance for user-facing changes
6. **Mobile-First**: Changes tested on mobile viewport first

## Governance

This Constitution supersedes all other development practices for the Marathon Photo Marketplace project.

### Amendment Process

1. Propose amendment via pull request to this file
2. Document rationale and impact assessment
3. Update version number per semantic versioning:
   - MAJOR: Principle removal or fundamental redefinition
   - MINOR: New principle or significant expansion
   - PATCH: Clarifications and wording improvements
4. Propagate changes to dependent templates (plan, spec, tasks)
5. Notify all contributors of changes

### Compliance

- All code reviews MUST verify alignment with Core Principles
- Architecture decisions MUST reference relevant principles
- Complexity MUST be justified against Principle VII (Simplicity)
- Security and payment decisions MUST reference Principle IV

### Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial ratification |

**Version**: 1.0.0 | **Ratified**: 2026-01-22 | **Last Amended**: 2026-01-22
