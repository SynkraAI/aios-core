# ADR-PRO-006: Payment Gateway, Subscription Management & Device Control

**ID:** ADR-PRO-006
**Status:** Proposed
**Created:** 2026-02-11
**Author:** Atlas (@analyst) + Aria (@architect)
**Story:** PRO-9
**Deciders:** Aria (@architect), Morgan (@pm), Stakeholder

---

## Context

AIOS Pro operates as an open-core CLI product: `aios-core` is MIT-licensed and free, while `aios-pro` is a proprietary git submodule with premium squads, persistent memory, usage metrics, and enterprise integrations. The existing infrastructure (PRO-1 through PRO-8) provides feature gating, license key validation, encrypted local cache, machine fingerprinting, and graceful degradation.

**The gap:** No automated payment flow exists. Users cannot purchase, receive credentials automatically, manage subscriptions, or recover lost keys. Device limits (max 2 per license) exist in schema (`seats: { used, max }`) but are not enforced per-device.

This ADR consolidates findings from a comprehensive investigation (PRO-9) across 5 areas:
1. Payment gateway comparison (6 gateways analyzed)
2. Open-core benchmarking (10 projects analyzed)
3. Subscription and pricing model design
4. Device control strategy (hybrid identification)
5. Credential delivery and recovery flows

---

## Decision 1: Payment Gateway — Polar.sh (Primary) / LemonSqueezy (Alternative)

### Recommendation: Polar.sh as Primary Gateway

After analyzing 6 gateways, **Polar.sh** is recommended as the primary payment gateway, with **LemonSqueezy** as a strong alternative.

### Comparison Matrix

| Feature | Stripe | Paddle | LemonSqueezy | Gumroad | Polar.sh | GitHub Sponsors |
|---------|--------|--------|--------------|---------|----------|-----------------|
| **Type** | PSP | MoR | MoR | Marketplace | MoR | Sponsorship |
| **Base Fee** | 2.9%+$0.30 | 5%+$0.50 | 5%+$0.50+1.5% intl | 10%+$0.50 | 4%+$0.40 | 0-6% |
| **Tax/VAT Handled** | No (add-on) | Yes | Yes | Yes (2025+) | Yes | No |
| **Hosted Checkout** | Yes (Links) | Yes (web) | Yes (URL) | Yes | Yes (URL) | No |
| **Webhooks** | Excellent | Good | Good | Basic | Good | Limited |
| **Subscriptions** | Full | Full | Full | Basic | Full | Monthly tiers |
| **Built-in License Keys** | No | No | YES | YES | YES | No |
| **Node.js SDK** | Excellent | Good | Good | None | Excellent | N/A |
| **CLI Product Fit** | Good | Medium | Strong | Weak | Excellent | Poor |
| **Developer Focus** | General | SaaS | Indie | Creators | Dev Tools | OSS |

### Why Polar.sh

1. **Lowest MoR fees** (4% + $0.40) -- 20% cheaper than Paddle/LemonSqueezy
2. **Purpose-built for developer tools** -- exact fit for CLI open-core products
3. **Built-in license keys** with validation API -- eliminates need for custom license server for key generation
4. **GitHub repository access grants** -- can automatically manage private submodule access per subscription
5. **Type-safe Node.js SDK** (`@polar-sh/sdk`) with built-in webhook validation
6. **Open source** (Apache 2.0) -- aligns with AIOS open-core philosophy
7. **Checkout links** -- shareable URLs work perfectly for CLI products without a website

### Why LemonSqueezy as Alternative

1. More mature/battle-tested than Polar.sh
2. Acquired by Stripe (July 2024) -- signals stability
3. Strong built-in license key system with activation limits
4. Better international payment method support

### Trade-offs and Risks

| Risk | Polar.sh | LemonSqueezy |
|------|----------|--------------|
| Platform maturity | Newer, still maturing | Proven, larger user base |
| Payment methods | Cards via Stripe Connect only | Cards, PayPal, Apple Pay |
| Long-term viability | Open-source (can self-host) | May merge into Stripe MoR |
| Fee at $19/mo | $1.16 (6.1%) | $1.95 (10.3% with intl) |
| GitHub integration | Native repo access grants | Manual webhook integration |

### Architect Review Note

> **Aria (@architect):** Both are viable. The decision should weigh platform maturity (LemonSqueezy advantage) against cost savings and developer-focus (Polar.sh advantage). For a launch with <500 subscribers, the risk of Polar.sh's relative newness is manageable, and the 40% fee savings compound meaningfully. The open-source nature of Polar provides an escape hatch. **Recommendation: Start with Polar.sh, keep LemonSqueezy as documented fallback. Architecture must be gateway-agnostic at the webhook handler level.**

### Why Stripe is NOT Recommended as Primary

- No built-in license key system (requires custom infrastructure)
- YOU are the Merchant of Record -- full tax compliance burden
- Stripe Tax adds 0.5% and still does not remit
- Higher operational complexity for a small team
- Stripe Managed Payments (MoR) is in private preview, not GA

---

## Decision 2: Subscription Model — Hybrid Tiered ($19/mo Individual, $39/mo Team)

### Pricing Tiers

| Tier | Target | Seats | Monthly | Annual |
|------|--------|-------|---------|--------|
| **Pro Individual** | Solo developers | 1 (2 devices) | $19/mo | $190/yr (~17% off) |
| **Pro Team** | Small teams | 5 (2 devices each) | $39/mo | $390/yr (~17% off) |
| **Enterprise** | Organizations | Custom | Contact sales | Contact sales |

### Price Justification

**$19/month Individual:**
- Aligns with GitHub Copilot Business ($19/user/mo) and Cursor Pro ($20/mo)
- Below the "pause threshold" (tools above $30/mo get canceled first during tight months)
- Above the "not serious" threshold (tools below $10/mo are perceived as hobby-grade)

**$39/month Team:**
- Per-seat equivalent of $7.80/seat for 5 seats -- extremely competitive
- Below Cursor Teams ($40/user/mo per user) and Warp Business ($50/user/mo)
- The value proposition: "5 seats for less than 2 seats on Cursor"

**Annual Discount (17%):**
- Matches industry median (JetBrains ~17%, GitHub Copilot ~17%, Ghost ~17%)
- Conservative enough to maintain healthy MRR while incentivizing annual commitment

### Feature Comparison

| Feature | Free (aios-core) | Pro Individual | Pro Team | Enterprise |
|---------|-------------------|----------------|----------|------------|
| Core agents | Yes | Yes | Yes | Yes |
| Open-source squads | Yes | Yes | Yes | Yes |
| Premium squads | No | Yes | Yes | Yes |
| Persistent memory (MIS) | No | Yes | Yes | Yes |
| Usage metrics | No | Yes | Yes | Yes |
| Enterprise integrations | No | No | Limited | Full |
| Team management | No | No | Yes | Yes |
| SSO/SAML | No | No | No | Yes |
| Priority support | No | No | Yes | Yes |
| Devices per seat | N/A | 2 | 2 | Custom |
| Offline period | N/A | 30 days | 30 days | 90 days |

### Subscription Lifecycle

```
Free User --> 14-day Trial (no CC required) --> Subscribe or Revert
                                                    |
                                        Active --> Renewal (auto)
                                                    |
                                        Payment fails --> Retry (3 weeks)
                                                    |
                                        All retries fail --> Grace Period (7 days)
                                                    |
                                        Grace expires --> Degraded (Pro features disabled)
                                                    |
                                        Data preserved 90 days --> Reactivation possible
```

**Cancellation:** End-of-period (default). Pro features remain until period ends. No immediate revocation.

**Upgrade/Downgrade:** Individual to Team: prorated upgrade, immediate. Team to Individual: effective at period end, team members notified.

### Architect Review Note

> **Aria (@architect):** The pricing is well-researched and market-aligned. The 7-day grace period matches existing `license-cache.js` implementation (30-day cache + 7-day grace). The Team tier fills an important gap -- without it, teams of 5 would buy individual licenses, leaking revenue. **Concern: Semi-annual billing was analyzed but dropped. Consider adding in Phase 2 if user demand signals warrant it.**

---

## Decision 3: Device Control — Hybrid Machine ID + Fallback Fingerprint

### Strategy: Hybrid Identification (2 devices per license)

**Primary identifier:** Existing `generateMachineId()` in `pro/license/license-crypto.js` (lines 50-81) -- SHA-256 hash of hostname + CPU model + first MAC address.

**Fallback identifier:** New `generateFallbackFingerprint()` -- SHA-256 hash of CPU model + logical core count + RAM (rounded to 4GB) + platform + arch. Excludes volatile signals (hostname, MAC).

### How It Works

```
Activation request arrives:
  1. Exact match on primary machineId? --> Update lastSeen, return OK
  2. No exact match? --> Try fallback fingerprint match
     a. Match found? --> Silent migration (update machineId), return OK
     b. No match? --> New device. Seats available? Register. Full? --> SEAT_LIMIT_EXCEEDED
```

### Device Data Model

```
License Record {
  key: "PRO-XXXX-XXXX-XXXX-XXXX",
  seats: { used: N, max: 2 },
  devices: [
    {
      machineId: "sha256-hex-64-chars",
      fallbackFingerprint: "sha256-hex-64-chars",
      friendlyName: "DESKTOP-WORK",
      activatedAt: "2026-02-11T10:00:00Z",
      lastSeenAt: "2026-02-11T14:30:00Z",
      platform: "win32",
      status: "active"
    }
  ]
}
```

### New CLI Commands

| Command | Purpose |
|---------|---------|
| `aios pro devices` | List registered devices with seat usage |
| `aios pro device-reset --slot N` | Remote deactivation of a device slot |

### New Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/license/devices` | GET | List devices for a license |
| `/v1/license/devices/:id` | DELETE | Deactivate a specific device |
| `/v1/license/device-reset` | POST | Self-service device reset |

### Edge Cases Covered

| Edge Case | Resolution |
|-----------|------------|
| OS reinstall | Fallback fingerprint match + silent migration |
| VPN usage | No impact (device ID is hardware-based, not IP-based) |
| VM/WSL2 | Counted as separate device (correct behavior) |
| Format without deactivate | Self-service reset from other device, or stale cleanup at 60 days |
| Concurrent activation race | Database transaction with `SELECT ... FOR UPDATE` |
| License sharing abuse | Rate limiting: max 5 device swaps per 30 days |
| Docker/CI | Not designed for ephemeral environments; use aios-core (free) for CI |

### Rate Limiting

| Action | Limit | Window |
|--------|-------|--------|
| Activation attempts | 10 per key | 1 hour |
| New device registrations | 6 per key | 30 days |
| Fallback migrations | 4 per slot | 30 days |
| Self-service resets | 4 per key | 30 days |

### Architect Review Note

> **Aria (@architect):** The Hybrid approach is architecturally sound. It is **additive** to existing infrastructure -- no breaking changes to `generateMachineId()` or existing API contracts. The fallback fingerprint is intentionally less unique (trade-off: small false-positive window vs. much better UX for legitimate hardware changes). **The stale device cleanup at 60 days is critical -- without it, dead devices permanently consume seats. Recommend implementing as a server-side cron job, not lazy evaluation during activation.**

---

## Decision 4: Credential Delivery — Webhook + Email (Resend)

### End-to-End Flow

```
User clicks "Buy Pro" on synkra.ai/pro
  --> Redirect to Polar.sh hosted checkout
    --> Payment succeeds
      --> Polar.sh fires webhook POST to api.synkra.ai/v1/webhook/polar
        --> Verify HMAC-SHA256 signature
        --> Check idempotency (webhook_events table)
        --> Generate license key (PRO-XXXX-XXXX-XXXX-XXXX)
        --> Store in licenses table
        --> Send email via Resend with key + activation command
          --> User runs: aios pro activate --key PRO-XXXX
```

### Webhook Handler Architecture

```
POST /v1/webhook/{provider}

[1] Signature Verification (HMAC-SHA256, timing-safe compare)
  |
[2] Idempotency Check (webhook_events table, provider + event_id unique)
  |
[3] Event Router:
    order_created --> Generate key, store license, queue email
    subscription_updated --> Update plan/seats
    subscription_cancelled --> Mark for expiry at period end
    subscription_payment_failed --> Enter grace period
```

### Database Additions

```sql
CREATE TABLE webhook_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    TEXT NOT NULL,
  event_id    TEXT NOT NULL,
  event_type  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'processing',
  payload     JSONB NOT NULL,
  error       TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(provider, event_id)
);
```

### Email Provider: Resend

- Modern API, excellent deliverability
- React email templates
- Free tier: 3000 emails/month (covers early growth)
- Simple integration with Vercel serverless

### Fallback: Checkout Success Page

The checkout success page (`synkra.ai/pro/thank-you?order_id={id}`) displays the license key immediately, providing a safety net if email delivery fails.

### Architect Review Note

> **Aria (@architect):** The webhook handler is well-designed with signature verification and idempotency as first-class concerns. **Critical architectural requirement: The webhook handler MUST be gateway-agnostic at the routing level.** Use a provider adapter pattern so switching from Polar.sh to LemonSqueezy or Stripe requires only a new adapter, not a rewrite. The existing `verifyHMAC()` in `license-crypto.js` (line 237) provides the right pattern for signature verification.

---

## Decision 5: Credential Recovery — Email-Based with Time-Limited Reveal

### Recovery Flow

```
User visits synkra.ai/pro/recover (or runs: aios pro recover --email user@example.com)
  --> Enters email
    --> Server ALWAYS responds: "If a license exists, we'll send recovery instructions"
       (never reveals whether email has a license)
    --> If license found:
       --> Generate single-use token (32 random bytes, 1-hour expiry)
       --> Store in recovery_tokens table
       --> Send email with masked key (PRO-A1B2-****-****-G7H8) + reveal link
         --> User clicks link within 1 hour
           --> Full key displayed on HTTPS page
           --> Token marked as used (single-use)
```

### Database Additions

```sql
CREATE TABLE recovery_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT NOT NULL UNIQUE,
  license_id  UUID NOT NULL REFERENCES licenses(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at     TIMESTAMPTZ,
  ip_address  INET,
  user_agent  TEXT
);

CREATE TABLE recovery_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash  TEXT NOT NULL,     -- SHA-256 of email (not plain)
  action      TEXT NOT NULL,     -- 'request', 'reveal', 'expired', 'rate_limited'
  ip_address  INET,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| POST /v1/license/recover | 3 requests | 15 minutes | IP |
| POST /v1/license/recover | 10 requests | 24 hours | Email (hashed) |
| GET /v1/license/recover/:token | 5 requests | 15 minutes | IP |

### Security Properties

- **No email enumeration:** Generic response regardless of email existence
- **Time-limited access:** Reveal links expire in 1 hour, single-use
- **Masked keys in email:** Full key only on authenticated HTTPS page
- **Audit trail:** All recovery attempts logged with IP, user agent, timestamps
- **Rate limiting:** Multi-tier (IP + email-based)

### Portal Strategy: Hybrid (Email-Only MVP, Portal On-Demand)

**Phase 1 (Launch):** Email-only delivery + recovery. CLI for management. ~10-13 dev-days.

**Phase 2 (When Triggered):** Minimal portal with magic link auth. ~10-15 dev-days.

**Trigger criteria for Phase 2:**
- Support tickets about "lost key" / "device management" > 10/week
- Active license count > 500
- Enterprise customer requires portal as procurement condition

### Architect Review Note

> **Aria (@architect):** Email-only MVP is the right call for launch. It aligns with CLI-First (Constitution Article I) and minimizes attack surface. The constant-time "generic response" for recovery requests is essential -- never reveal whether an email has a license. **Recommendation: Add the `aios pro recover --email` CLI command in Phase 1. It keeps the entire user journey CLI-native.**

---

## Open-Core Benchmarking Summary

10 projects were analyzed. The 3 most structurally similar to AIOS Pro:

### Sidekiq Pro (HIGHEST SIMILARITY)
- Private gem server with credential-based access (analogous to private git submodule)
- Stripe payment, credentials emailed after purchase
- Per-organization licensing (unlimited servers), $995/year
- Minimal billing portal, no phone-home

### Nx Powerpack (HIGH SIMILARITY)
- CLI tool with premium extensions activated by license key
- `nx activate-powerpack <key>` + environment variable for CI
- **No phone-home** -- fully offline validation
- Local license file (`.nx/powerpack/license.ini`)

### Cal.com (HIGH SIMILARITY)
- EE code visible in public repo but license-restricted
- License key as environment variable
- Graceful degradation when license invalid

### Key Patterns Adopted

| Pattern | Source | AIOS Pro Application |
|---------|--------|---------------------|
| Credential delivery via email | Sidekiq Pro | Webhook -> generate key -> email |
| Environment variable for CI | Nx Powerpack, Cal.com | `AIOS_PRO_LICENSE=<key>` |
| Per-organization licensing | Sidekiq Pro | Flat-rate per license (not per-seat) |
| Offline-capable validation | Nx Powerpack | 30-day cache already implemented |
| CLI activation command | Nx Powerpack | `aios pro activate --key <KEY>` (exists) |
| Graceful degradation | Cal.com, Metabase | `withGracefulDegradation()` (exists) |

---

## Implementation Roadmap

### Phase 1: Payment Integration (PRO-10) — ~8-10 dev-days
- Polar.sh account setup and product configuration
- Webhook handler with signature verification and idempotency
- License key generation in webhook handler
- Email delivery via Resend (with retry mechanism)
- Checkout success page fallback

### Phase 2: Subscription Lifecycle (PRO-11) — ~8-12 dev-days
- Subscription webhook events (updated, cancelled, payment_failed)
- Grace period integration (7-day, matching existing cache)
- Trial flow (14-day, no CC required)
- Upgrade/downgrade between Individual and Team tiers
- Stripe Customer Portal equivalent for billing management

### Phase 3: Device Enforcement (PRO-12) — ~10-13 dev-days
- `generateFallbackFingerprint()` in license-crypto.js
- Server-side device tracking with `devices[]` array
- Silent migration on fallback match
- `aios pro devices` and `aios pro device-reset` CLI commands
- Server endpoints: `/v1/license/devices`, `/v1/license/device-reset`
- Rate limiting on device swaps
- Stale device cleanup (60-day cron)

### Phase 4: Recovery & Portal (PRO-13) — ~10-15 dev-days
- Recovery flow (request + reveal endpoints)
- `aios pro recover --email` CLI command
- Recovery tokens table and audit logging
- Rate limiting on recovery endpoints
- Portal (Phase 2, triggered by volume/demand criteria)

**Total estimated effort: ~36-50 dev-days across 4 stories.**

---

## Changes Required by Module

| File | Change | Phase |
|------|--------|-------|
| `pro/license/license-crypto.js` | ADD `generateFallbackFingerprint()` | PRO-12 |
| `pro/license/license-api.js` | MODIFY `activate()` to send fallback fingerprint | PRO-12 |
| `pro/license/license-api.js` | ADD `getDevices()`, `resetDevice()` | PRO-12 |
| `pro/license/errors.js` | ADD `deviceSwapLimitExceeded()`, `deviceNotRegistered()` | PRO-12 |
| `.aios-core/cli/commands/pro/index.js` | ADD `devices`, `device-reset`, `recover` subcommands | PRO-12/13 |
| License Server (external) | ADD webhook handler, recovery endpoints, device endpoints | PRO-10/12/13 |
| License Server DB | ADD `webhook_events`, `recovery_tokens`, `recovery_audit_log` tables | PRO-10/13 |
| License Server DB | MODIFY `licenses` table (email tracking columns) | PRO-10 |
| License Server DB | MODIFY `activations` -> `devices[]` array with fallback fields | PRO-12 |

### Backward Compatibility

All changes are **ADDITIVE**. The existing `{ key, machineId }` contract continues to work. New fields are optional from the server perspective. Pre-update clients function normally; they just don't get fallback migration benefits.

---

## Alternatives Considered

### A1: Stripe as PSP (Rejected)
- No built-in license keys, no MoR tax handling
- Higher operational complexity for small team
- Stripe Managed Payments (MoR) is in private preview, not GA

### A2: IP-Based Device Tracking (Rejected)
- IPs change with VPN, DHCP, mobile hotspot
- Determinism: NONE. Stability: NONE.
- Not viable for any form of device identification

### A3: Per-Device Pricing (Rejected)
- Universally disliked by developers in 2026
- JetBrains moved away from this model in 2015
- Creates friction for legitimate multi-device workflows

### A4: Usage-Based Pricing (Rejected for V1)
- AIOS Pro runs locally with 30-day offline support
- Pure usage-based is architecturally incompatible with offline-first
- Creates "meter anxiety" that suppresses adoption

### A5: User Portal at Launch (Deferred)
- 4-6 weeks additional development
- Auth system, sessions, CSRF protection, 4-5 pages
- Over-engineering for <500 initial users
- Deferred to Phase 2, triggered by explicit demand criteria

### A6: Lifetime License (Deferred to V2)
- Not sustainable as sole model
- Consider adding at $299 (Individual) / $899 (Team) after subscription PMF
- JetBrains perpetual fallback model is good reference

---

## Consequences

### Positive
- MoR eliminates tax compliance burden globally
- Built-in license keys reduce custom infrastructure
- Hybrid device ID provides excellent UX for hardware changes
- Email-only MVP minimizes attack surface and time-to-revenue
- Architecture is gateway-agnostic (can switch providers)

### Negative
- Polar.sh is newer/less battle-tested than alternatives
- No portal at launch may feel "basic" to some users
- 2-device limit may frustrate WSL2 + Windows users (consumes both slots)

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Polar.sh pivots/shuts down | Low | High | Open-source (can self-host), gateway-agnostic architecture |
| Email delivery failure | Medium | Medium | Checkout success page fallback, retry with exponential backoff |
| Device ID collisions | Very Low | Low | Fallback is secondary check only, requires valid key |
| License sharing abuse | Medium | Low | Rate limiting, 60-day stale cleanup, pragmatic enforcement |

---

## Architect's Final Review

> **Aria (@architect) — Architectural Review Summary**
>
> **Verdict: APPROVED with 3 recommendations**
>
> **Strengths:**
> 1. Well-researched with quantitative data from 6 gateways and 10 open-core projects
> 2. All decisions align with existing infrastructure (license-crypto.js, license-cache.js, license-api.js)
> 3. Hybrid device ID is elegant -- additive to existing code, no breaking changes
> 4. CLI-First philosophy maintained throughout (Constitution Article I)
> 5. Grace period (7 days) matches existing implementation perfectly
>
> **Recommendations:**
> 1. **Gateway Adapter Pattern:** The webhook handler MUST use a provider adapter interface. Define `WebhookProvider { verifySignature(), parseEvent(), mapToLicenseAction() }` so switching gateways requires only a new adapter.
> 2. **Team Tier Launch Timing:** Consider launching Individual tier first (simpler), adding Team tier in Phase 2 once individual adoption validates the pricing.
> 3. **Monitoring:** Add webhook delivery monitoring from day 1. Track: webhook latency, email delivery rate, activation success rate, device migration frequency.
>
> **Open Items for Stakeholder:**
> 1. **Polar.sh vs LemonSqueezy:** Final gateway selection (both are viable, different risk profiles)
> 2. **Team Tier Pricing:** $39/mo for 5 seats -- confirm or adjust
> 3. **Annual Discount Rate:** 17% (conservative, matches market) vs 26% (aggressive, better cash flow)
> 4. **Trial Duration:** 14 days recommended, confirm

---

*ADR-PRO-006 v1.0 | Investigation PRO-9 | 2026-02-11*
*Aria, arquitetando o futuro*
