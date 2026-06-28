# TODO — Infrastructure & Features

## Pending Features

### Banner Ad System (Phase 2 — after Promo Challenges)
- [ ] Ad entity (table: `ads`) — advertiser, image_url, link, placement, impressions, clicks, budget, status
- [ ] Ad management API (CRUD, targeting by country/category)
- [ ] Impression & click tracking endpoints
- [ ] Ad rotation logic (fill existing placeholder slots in feed + report pages)
- [ ] Advertiser dashboard (create ad, set budget, view performance)
- [ ] Admin panel: approve/reject ads
- [ ] Paystack payment for ad campaigns (CPM or flat monthly)
- [ ] Replace current "Ad Space Available" mockups with real ads from DB

### Navigation Fixes
- [ ] Add `/business` link to main nav (feed sidebar + mobile menu)
- [ ] Add `/challenges` link to main nav (after building promo challenges)

### Misc
- [ ] OG meta tags for other pages (donations/campaign, elections)
- [ ] Sentry config cleanup (move to instrumentation.ts per warnings)
- [ ] npm audit fix for 99 vulnerabilities

### Admin 2FA (Add when 50K+ users)
- [ ] Add TOTP-based 2FA for admin portal (Google Authenticator / Authy)
- [ ] IP whitelist option for admin routes
- [ ] Login attempt rate limiting specific to admin (stricter than regular)
- [ ] Session timeout (auto-logout after 30 min inactivity)

### Emergency SMS Gateway (When budget allows ~$50/month)
- [ ] Integrate Africa's Talking API or Twilio for SMS
- [ ] Auto-send SMS to local emergency number on SOS trigger
- [ ] Include GPS coordinates in SMS body
- [ ] Country-specific emergency number routing

### Street Correspondent Stipend Automation
- [ ] Monthly cron job to calculate top 50 per city
- [ ] Auto-credit tip balance based on available revenue pool
- [ ] "🏅 Street Correspondent" badge auto-assigned
- [ ] Dashboard for tracking monthly payouts

### Scalability (When approaching 50K+ DAU)
- [ ] Move from single EC2 to ECS/Fargate with auto-scaling (2-5 containers)
- [ ] Add ALB (Application Load Balancer)
- [ ] RDS read replicas for heavy read queries
- [ ] Increase RDS connection pool to 100+
- [ ] CloudFront CDN for S3 media delivery
- [ ] Separate Socket.IO to dedicated service

### Voice Distortion for Reporter Safety (Post-launch, needs ffmpeg)
- [ ] Add ffmpeg binary to Docker image (~80MB increase)
- [ ] Bull queue (Redis-backed) for async audio processing
- [ ] Voice pitch-shift / distortion filter endpoint
- [ ] Apply distortion to voice notes on reports where reporter opts in
- [ ] Memory testing on EC2 (ffmpeg is CPU/RAM intensive)
- [ ] Option in mobile app: "Disguise my voice" toggle on report creation

### Official Results Comparison (Election Day Feature)
- [ ] Admin UI to input/upload official results per polling unit
- [ ] CSV bulk upload for official results (INEC format)
- [ ] Diff comparison logic: citizen-submitted vs official per PU
- [ ] Discrepancy flagging (highlight PUs where citizen ≠ official by >10%)
- [ ] Visual comparison table on web elections page
- [ ] Gov dashboard: side-by-side citizen vs official view
- [ ] Only activate when official data is available (election day/after)

### Mobile Heat Map (Post-launch, needs native module)
- [ ] Install `@rnmapbox/maps` (native module)
- [ ] Configure EAS Build for native Mapbox SDK (iOS pod install + Android gradle)
- [ ] Add Mapbox access token to app.config / EAS secrets
- [ ] Build heat map component for mobile Elections Hotspots tab
- [ ] Test on both iOS and Android EAS builds
- [ ] Note: Cannot use Expo Go after this — requires development build
