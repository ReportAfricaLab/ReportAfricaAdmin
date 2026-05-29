# ReportAfrica — Future Roadmap

## Deferred Features (Build When Platform Has Traction)

These features were evaluated and intentionally deferred. They are not over-engineering — they are **premature** at current stage. Revisit when the platform has 50K+ active users.

---

### #2 — Bounty Reports
**What:** Organizations/NGOs/government post bounties for specific information (e.g., "₦50,000 for verified footage of illegal dumping at X location"). Reporters who fulfill the bounty get paid.

**Why deferred:** Complex marketplace mechanics. Needs critical mass of organizations on the platform first.

**When to build:** When 10+ organizations are actively using the platform and requesting specific content.

**Technical notes:**
- New entity: `bounty.entity.ts` (organizationId, title, description, amount, currency, category, location, deadline, status, fulfilledBy)
- New module: `modules/bounties/` (CRUD, claim, verify, payout)
- Integration: Paystack/KoraPay for payouts, existing earnings system
- UI: Bounty board on mobile/web, "Claim Bounty" flow on report submission

---

### #4 — Paid Subscriptions / Premium Reporter Profiles
**What:** Trusted/Elite reporters offer premium content (deep investigations, exclusive livestreams) behind a paywall with recurring revenue.

**Why deferred:** Too early. Need massive user base before paywalling content. Paywalling too early kills growth.

**When to build:** When top reporters have 1000+ followers and are requesting monetization beyond tips.

**Technical notes:**
- New entity: `subscription.entity.ts` (subscriberId, reporterId, tier, amount, currency, status, expiresAt)
- Paystack recurring billing integration
- Content gating middleware (check subscription before serving premium reports)
- Reporter dashboard: subscriber count, revenue analytics
- Tiers: Free, Supporter (₦500/mo), Premium (₦2000/mo)

---

### #5 — Ad Revenue Sharing
**What:** Share ad revenue with top reporters based on views/engagement on their reports.

**Why deferred:** Needs millions of views to be meaningful. Premature optimization of monetization.

**When to build:** When platform has 1M+ monthly page views and ad partnerships in place.

**Technical notes:**
- Integration with Google AdMob (mobile) and Google AdSense (web)
- Revenue tracking per report (impressions, clicks)
- Monthly payout calculation: reporter gets 60% of ad revenue attributed to their content
- Minimum payout threshold (e.g., ₦5,000)
- Add to existing earnings system with source: 'ad_revenue'

---

### #11 — Collaborative Investigations
**What:** Multiple reporters contribute to a single story/thread, building a comprehensive picture of a developing situation.

**Why deferred:** Cool but niche. Journalists can coordinate outside the app. The existing report-updates feature partially covers this.

**When to build:** When journalist/NGO users request it and there are clear use cases (e.g., election monitoring teams).

**Technical notes:**
- New entity: `investigation.entity.ts` (title, description, leadReporterId, status, isPublic)
- New entity: `investigation-member.entity.ts` (investigationId, userId, role, joinedAt)
- Extend report entity: optional `investigationId` to link reports to an investigation
- Permissions: lead reporter invites collaborators, approves contributions
- UI: Investigation timeline view, contributor list, shared evidence board

---

### #15 — Business/SME Alerts
**What:** Businesses pay a subscription to get real-time alerts about incidents near their locations (traffic, security, infrastructure).

**Why deferred:** B2B feature. Different sales motion entirely. Requires dedicated sales team.

**When to build:** When 5+ businesses express interest or when pursuing B2B revenue stream.

**Technical notes:**
- Extend existing watchlist system with `businessId` and `planTier`
- New entity: `business-subscription.entity.ts` (businessName, contactEmail, plan, locations[], categories[], expiresAt)
- API key authentication for business integrations
- Webhook delivery for real-time alerts (POST to business endpoint)
- Dashboard: business portal showing alerts, analytics, coverage map
- Pricing: Basic (1 location, ₦10K/mo), Pro (5 locations, ₦40K/mo), Enterprise (unlimited, custom)

---

### #16 — Insurance Partnerships
**What:** Verified reports (accidents, floods, theft) serve as evidence for insurance claims. Partner with insurers to provide timestamped, geo-tagged, community-verified incident reports.

**Why deferred:** Business development deal, not a code feature. Requires legal agreements and insurance company partnerships.

**When to build:** When an insurance company approaches or when pursuing this revenue stream.

**Technical notes:**
- Report export API: generate PDF/JSON evidence package (report + media + verification stats + timestamps)
- Digital signature/hash for tamper-proof evidence
- New endpoint: `POST /api/v1/reports/:id/export-evidence` (generates signed evidence package)
- Partner portal: insurance companies can verify report authenticity via reference code
- Revenue model: per-verification fee or monthly partnership fee

---

### #17 — Data API for Researchers/NGOs
**What:** Sell anonymized, aggregated report data to researchers, NGOs, and urban planners as a paid API.

**Why deferred:** Already have analytics module internally. This is a business deal and API productization effort, not a feature priority.

**When to build:** When researchers/NGOs request data access or when pursuing data-as-a-service revenue.

**Technical notes:**
- New module: `modules/data-api/` (rate-limited, API key authenticated)
- Endpoints: aggregated stats by region/category/time, heatmap data, trend analysis
- Data anonymization layer: strip user PII, generalize locations to ward/LGA level
- Pricing tiers: Academic (free, 100 req/day), NGO (₦50K/mo, 10K req/day), Commercial (₦200K/mo, unlimited)
- Existing analytics module can be extended rather than rebuilt
- OpenAPI/Swagger documentation for external developers

---

## Priority Order (When Ready)

1. **#15 Business/SME Alerts** — Easiest to build (extends existing watchlist), clear revenue
2. **#2 Bounty Reports** — High user engagement, drives content quality
3. **#17 Data API** — Low effort (extend analytics), recurring B2B revenue
4. **#16 Insurance Partnerships** — High-value partnerships, unique differentiator
5. **#4 Paid Subscriptions** — Only after top reporters have large audiences
6. **#5 Ad Revenue Sharing** — Only after massive scale
7. **#11 Collaborative Investigations** — Only if journalist segment grows significantly

---

## How to Use This Document

- Review quarterly during product planning
- Move items to active development when trigger conditions are met
- Each item has enough technical detail to estimate and begin implementation
- When building, create a feature branch: `feature/bounty-reports`, `feature/business-alerts`, etc.
