# Feature Specification: V1 Core Marketplace

**Feature Branch**: `001-v1-marketplace`
**Created**: 2026-01-22
**Status**: Draft
**Input**: User description: "Two-sided photo marketplace where runners search for race photos by bib number and pay photographers $1/photo to download watermark-free versions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Runner Finds and Purchases Race Photo (Priority: P1)

A runner who just completed a race wants to find and purchase their race photos. They open the marketplace on their phone, enter their bib number, browse the watermarked previews, select photos they want, complete checkout, and download high-resolution watermark-free versions.

**Why this priority**: This is the core value proposition. Without runners successfully finding and buying photos, there is no marketplace. This single flow validates the entire business model.

**Independent Test**: Can be fully tested by searching for a known bib number, adding a photo to cart, completing payment, and verifying download access. Delivers immediate revenue and proves product-market fit.

**Acceptance Scenarios**:

1. **Given** a runner at the race venue with a smartphone, **When** they enter their bib number without creating an account, **Then** they see all photos tagged with that bib number displayed as watermarked previews.

2. **Given** a runner viewing their watermarked photos, **When** they tap on a photo, **Then** they see a larger preview with purchase option showing the $1 price.

3. **Given** a runner who has selected photos to purchase, **When** they proceed to checkout as a guest, **Then** they can complete payment via credit card without creating an account.

4. **Given** a runner who has completed payment, **When** the transaction succeeds, **Then** they immediately receive download links for high-resolution, watermark-free versions of their purchased photos.

5. **Given** a runner viewing search results, **When** there are no photos matching their bib number, **Then** they see a helpful message indicating no photos found with suggestions (check bib number, photos may still be uploading).

---

### User Story 2 - Photographer Uploads and Monetizes Race Photos (Priority: P2)

A photographer who shot photos at a local 5K race wants to upload their photos and earn money when runners purchase them. They create an account, connect their Stripe account for payouts, bulk upload their photos, and the system automatically detects bib numbers. They can then track sales and earnings.

**Why this priority**: Without photographers uploading content, runners have nothing to purchase. This is the supply side of the marketplace and must work seamlessly for photographers to participate.

**Independent Test**: Can be fully tested by creating a photographer account, completing Stripe Connect onboarding, uploading a batch of race photos, and verifying bib numbers are detected and photos appear in search results.

**Acceptance Scenarios**:

1. **Given** a photographer visiting the platform for the first time, **When** they choose to sign up as a photographer, **Then** they are guided through account creation and Stripe Connect onboarding.

2. **Given** a photographer with a connected Stripe account, **When** they upload a batch of 100+ photos from a race, **Then** the system processes all photos without timeout and shows upload progress.

3. **Given** photos being processed after upload, **When** bib number detection completes, **Then** photos with detected bib numbers are automatically tagged and made searchable.

4. **Given** photos that fail bib number detection, **When** processing completes, **Then** the photographer is notified which photos failed with options to manually review or delete them.

5. **Given** a photographer with photos live on the platform, **When** a runner purchases one of their photos, **Then** the photographer sees the sale reflected in their dashboard with earnings attributed to their account.

---

### User Story 3 - Photographer Tracks Sales and Receives Payouts (Priority: P3)

A photographer who has been selling photos on the platform wants to understand their performance and receive their earnings. They access their dashboard to view sales analytics, see which events and photos perform best, and receive automatic payouts to their bank account.

**Why this priority**: Ongoing photographer engagement depends on transparent earnings tracking and reliable payouts. Without this, photographers will not return to upload more content.

**Independent Test**: Can be fully tested by logging in as a photographer with existing sales, viewing the earnings dashboard, and verifying payout information matches Stripe Connect records.

**Acceptance Scenarios**:

1. **Given** a photographer logged into their account, **When** they navigate to their dashboard, **Then** they see real-time sales data including total earnings, number of photos sold, and earnings by event.

2. **Given** a photographer viewing their dashboard, **When** they examine individual photo performance, **Then** they see which specific photos have sold and how many times.

3. **Given** a photographer with accumulated earnings, **When** the payout threshold is reached, **Then** funds are automatically transferred to their connected bank account via Stripe Connect.

4. **Given** a photographer viewing their payout history, **When** they check past payouts, **Then** they see a complete history with dates, amounts, and status.

---

### User Story 4 - Runner Creates Account for Order History (Priority: P4)

A runner who has purchased photos previously wants to create an account to access their order history and be notified when new photos of them are uploaded. They sign up, link their previous purchases, and set notification preferences.

**Why this priority**: Account creation is optional for purchase but valuable for retention. This increases lifetime value but is not required for core marketplace functionality.

**Independent Test**: Can be fully tested by creating a runner account after a guest purchase, verifying previous orders appear in history, and confirming notification preferences can be set.

**Acceptance Scenarios**:

1. **Given** a runner who has purchased photos as a guest, **When** they create an account using the same email, **Then** their previous orders are automatically linked to their new account.

2. **Given** a runner with an account, **When** they log in and view order history, **Then** they see all past purchases with download links still active.

3. **Given** a runner with an account, **When** they enable notifications for their bib number, **Then** they receive alerts when new photos matching their bib are uploaded.

---

### Edge Cases

- What happens when a bib number appears in multiple races on the same day? System displays photos grouped by event with clear event labels.
- What happens when a photo contains multiple bib numbers? Photo is tagged with all detected bibs and appears in search results for each.
- What happens if payment fails during checkout? Transaction is cancelled, no charge occurs, user sees clear error with retry option.
- What happens if a photographer's Stripe account is disconnected? Photos remain visible but purchases are blocked until reconnected; photographer is notified.
- What happens if bulk upload exceeds storage limits? Upload is paused with clear message; photographer can delete older photos or upgrade (future feature).
- What happens when a runner disputes a charge? Standard Stripe dispute process; platform notifies photographer and holds payout until resolved.
- What happens if AI detects wrong bib number? Photographer can manually correct tags; runner can report incorrect tagging.

## Requirements *(mandatory)*

### Functional Requirements

**Runner Experience**
- **FR-001**: System MUST allow bib number search without requiring account creation or login.
- **FR-002**: System MUST display search results as watermarked photo previews within 2 seconds.
- **FR-003**: System MUST support guest checkout via credit card payment.
- **FR-004**: System MUST provide immediate download access after successful payment.
- **FR-005**: System MUST deliver watermark-free, high-resolution photos upon purchase.
- **FR-006**: System MUST allow runners to optionally create accounts using social login (Google, Facebook, Apple), email/password, or passwordless (magic link).

**Photographer Experience**
- **FR-007**: System MUST require photographers to create accounts before uploading.
- **FR-008**: System MUST require Stripe Connect onboarding before photos can be sold.
- **FR-009**: System MUST support bulk photo upload of 500+ photos per batch.
- **FR-010**: System MUST automatically detect and tag bib numbers using AI vision.
- **FR-011**: System MUST notify photographers of photos that fail bib detection with options to review.
- **FR-012**: System MUST provide real-time sales and earnings dashboard for photographers.
- **FR-013**: System MUST process photographer payouts via Stripe Connect.

**Photo Processing**
- **FR-014**: System MUST generate watermarked preview versions of all uploaded photos.
- **FR-015**: System MUST generate optimized thumbnail versions for gallery display.
- **FR-016**: System MUST preserve original high-resolution photos for purchase delivery.
- **FR-017**: System MUST complete AI bib detection within 30 seconds per photo.
- **FR-018**: System MUST apply quality scoring to surface best shots first in search results.

**Event Management**
- **FR-019**: System MUST organize photos by race event (name, date, location).
- **FR-020**: System MUST allow photographers to associate uploads with specific events.

**Payments**
- **FR-021**: System MUST charge $1 per photo for individual purchases.
- **FR-022**: System MUST support bundle pricing: 5 photos for $4, 10 photos for $7, 20 photos for $12.
- **FR-023**: System MUST NOT store raw credit card data (PCI-DSS compliance via Stripe).
- **FR-024**: System MUST split revenue 70/30 between photographer and platform (photographer receives $0.70 per $1 photo sold).

### Key Entities

- **Runner**: Person searching for and purchasing photos. Attributes: optional account (email, name, auth provider), purchase history, saved bib numbers, notification preferences.

- **Photographer**: Person uploading and selling photos. Attributes: account (required), Stripe Connect ID, payout preferences, uploaded photos, sales history, earnings balance.

- **Photo**: Individual race photograph. Attributes: original file, watermarked version, thumbnail, detected bib numbers, quality score, associated event, photographer owner, price, purchase count.

- **Event**: Race or athletic event. Attributes: name, date, location, associated photos, participating photographers.

- **Transaction**: Purchase record. Attributes: buyer (runner or guest email), photos purchased, total amount, payment status, photographer payouts, download entitlements.

- **Payout**: Photographer payment record. Attributes: photographer, amount, status, Stripe transfer ID, transaction date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Runners can find photos by bib number and complete purchase in under 3 minutes from first visit.
- **SC-002**: 90% of runners who find their photos complete at least one purchase.
- **SC-003**: Photographers can upload and publish 100 photos within 15 minutes including processing time.
- **SC-004**: AI bib detection achieves greater than 90% accuracy on standard race bibs.
- **SC-005**: System handles 1000+ concurrent users during peak race-day traffic.
- **SC-006**: Photo search results load in under 2 seconds on mobile networks.
- **SC-007**: Guest checkout completion rate exceeds 80% (users who start checkout complete it).
- **SC-008**: Photographer dashboard shows accurate sales data within 1 minute of transaction.
- **SC-009**: Platform processes payouts within 7 business days of accumulated sales.
- **SC-010**: Less than 1% of transactions result in payment disputes.

## Assumptions

- Photographers will have race photos with visible bib numbers in the majority of shots.
- Standard race bibs use high-contrast numbering that AI can reliably detect.
- Runners will primarily access the platform on mobile devices at or near race venues.
- $1 per photo is an acceptable price point validated by competitive analysis.
- Photographers are willing to complete Stripe Connect onboarding for payment processing.
- Events can be uniquely identified by name + date + location combination.
- Watermarks provide sufficient protection while allowing runners to identify themselves.
