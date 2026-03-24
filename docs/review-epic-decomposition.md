# Epic Decomposition Review - Brand System Service

**Reviewer:** Aria (Architect Agent)
**Date:** 2026-03-04
**Epic Map Version:** 1.0
**Epic Map Author:** Pax (PO Agent)
**PRD Version:** 1.1 (Reviewed, all 5 architect conditions incorporated)
**Previous Review:** `C:\Users\mrapa\projects\my-projects\aios-core\docs\review-prd-brand-system-service.md`

---

## Review Scope

This review validates the decomposition of PRD v1.1 into 14 epics (68 stories) across 6 execution waves. The analysis covers 8 specific areas requested by the lead.

---

## 1. Dependency Sequence (Wave Order)

**Verdict: APPROVED**

The 6-wave sequence is technically sound. The dependency graph has no circular dependencies and correctly identifies BSS-1 (Foundation) as the universal prerequisite.

### Wave-by-Wave Analysis

| Wave | Epics | Technical Rationale | Assessment |
|------|-------|-------------------|------------|
| **Wave 1** (Weeks 1-4) | BSS-1 | Auth, schema, RLS, R2, multi-tenant routing. Everything depends on this. | Correct. No other epic can function without tenant isolation and auth. |
| **Wave 2** (Weeks 3-8) | BSS-2, BSS-3 in parallel | Token engine (BSS-2) and AI pipeline (BSS-3) are independent of each other but both need BSS-1. | Correct. Tokens and AI are orthogonal concerns that converge only at BSS-4. |
| **Wave 3** (Weeks 6-12) | BSS-4, BSS-5, BSS-6 in parallel | Creative production needs tokens + AI. CMS needs tokens + foundation. Portal needs foundation + tokens. | Correct. Three teams can work independently. |
| **Wave 4** (Weeks 10-14) | BSS-7, BSS-8 | Onboarding needs portal (BSS-6). QA pipeline needs AI (BSS-3) + creatives (BSS-4). | Correct. Late in the sequence because onboarding is the "glue" that ties everything together. |
| **Wave 5** (Weeks 12-18) | BSS-9, BSS-10 | Figma library needs tokens (BSS-2). Observability needs foundation (BSS-1). | Correct for P1 priority. |
| **Wave 6** (Post-MVP) | BSS-11 to BSS-14 | Expansion pillars. All have correct upstream dependencies. | Correct. Incremental additions. |

### One Observation

The overlap between Wave 1 and Wave 2 (Waves 2 starts at Week 3, Wave 1 ends at Week 4) is tight. BSS-2 and BSS-3 can only start once BSS-1 delivers at minimum: (a) Supabase schema with RLS (BSS-1.2, BSS-1.3), (b) Auth (BSS-1.5), and (c) R2 setup (BSS-1.7). Stories BSS-1.8 (Security Hardening), BSS-1.9 (GDPR), and BSS-1.10 (Monitoring) are NOT blockers for Wave 2 and can run concurrently.

**Recommendation:** Explicitly mark BSS-1.2, BSS-1.3, BSS-1.5, BSS-1.7 as "Wave 2 gate" stories. The remaining BSS-1 stories (BSS-1.1, BSS-1.4, BSS-1.8, BSS-1.9, BSS-1.10) can overlap with Wave 2 start.

---

## 2. Epic Granularity

**Verdict: SUGGEST ADJUSTMENT**

Most epics are well-scoped. Two deserve scrutiny.

### BSS-1 (Foundation) -- 10 stories, XL

This is the largest epic by far. However, its stories are cohesive: they all establish infrastructure. Splitting it would create artificial dependency management overhead between the two halves. The stories naturally partition into two groups:

- **Core Infrastructure** (BSS-1.1 to BSS-1.7): Schema, RLS, Auth, routing, R2 -- these ARE the foundation.
- **Hardening & Compliance** (BSS-1.8 to BSS-1.10): Security hardening, GDPR, monitoring -- these are important but not gating Wave 2.

See Section 7 for the detailed BSS-1 split analysis.

### BSS-9 (Figma Component Library) -- 6 stories, L

This epic contains both Figma design work (BSS-9.1 to BSS-9.4, which is essentially design system creation) and technical pipeline work (BSS-9.5 Token Integration, BSS-9.6 Code Export). These two concerns have different skill requirements: the first needs a Figma designer, the second needs a developer. However, since BSS-9 is P1 and the stories are sequential (you build components before exporting them), splitting would add overhead without benefit.

### BSS-13 (Video & Motion) -- 7 stories, L, 4-5 weeks

This is appropriately sized. Remotion setup, various template types, and the explainer video pipeline are all tightly coupled through the motion token system.

### Potential Merges

| Candidate | Current | Recommendation |
|-----------|---------|----------------|
| BSS-11 (Email, M) + BSS-14 (Corporate, M) | Separate P2 epics | Keep separate. Different skill sets (email HTML vs print design) despite similar complexity. |
| BSS-10 (Observability, M, 4 stories) | Standalone P1 epic | Keep standalone. Observability is a cross-cutting concern that should not be buried inside another epic. |

---

## 3. Separation of Concerns

**Verdict: APPROVED**

The epic boundaries respect the Single Responsibility Principle at the architecture level.

### Concern Mapping

| Layer | Epic(s) | Assessment |
|-------|---------|------------|
| **Infrastructure** | BSS-1 | Clean. All infra concerns (auth, DB, storage, routing, security) in one place. |
| **Design Token Engine** | BSS-2 | Clean. Token schema, build pipeline, color, typography, grid, brand book -- all token-centric. |
| **AI Orchestration** | BSS-3 | Clean. Service abstraction, queue, prompts, moderation, cost tracking -- all AI pipeline concerns. |
| **Content Production** | BSS-4 | Clean. Template engine, platform templates, batch pipeline -- all rendering concerns. |
| **CMS & Web** | BSS-5 | Clean. Payload CMS, landing pages, site templates, SEO, ISR -- all web publishing concerns. |
| **Client-Facing** | BSS-6, BSS-7 | Clean separation. BSS-6 is the ongoing portal, BSS-7 is the onboarding funnel. Different user journeys. |
| **Quality** | BSS-8 | Clean. QA checklists, revision management, training -- all quality assurance concerns. |
| **Design System** | BSS-9 | Clean. Figma components, token integration, code export -- all design system concerns. |
| **Operations** | BSS-10 | Clean. Logging, dashboards, monitoring -- all observability concerns. |

### Cross-Cutting Concern Handling

One area that deserves attention: **HMAC webhook validation** (NFR-8.3) is mentioned in BSS-1.8 (Security Hardening) but is also needed by BSS-5.6 (ISR via Payload webhooks). The epic map correctly places the foundational implementation in BSS-1 and references it in BSS-5.6 ("HMAC validated per NFR-8.3"). This is the right approach -- implement the utility once in foundation, consume it in downstream epics.

---

## 4. Complexity vs Timeline

**Verdict: SUGGEST ADJUSTMENT**

### Estimate Assessment

| Epic | Size | Estimate | My Assessment | Delta | Reasoning |
|------|------|----------|---------------|-------|-----------|
| BSS-1 | XL | 4-5 weeks | 4-5 weeks | OK | 10 stories, but most are well-understood infrastructure patterns. RLS testing (BSS-1.4) and GDPR (BSS-1.9) are the unknowns. |
| BSS-2 | L | 3-4 weeks | 3-4 weeks | OK | Style Dictionary pipeline is well-documented. Brand book site generator (BSS-2.6) is the bulk of work. |
| BSS-3 | L | 3-4 weeks | 4-5 weeks | +1 week | Prompt quality scoring pipeline (BSS-3.4) and content moderation (BSS-3.5) are R&D-heavy. No existing reference implementations to copy. The A/B testing for prompts with minimum 10 evaluations (FR-9.3) requires infrastructure that takes time to get right. |
| BSS-4 | L | 3-4 weeks | 3-4 weeks | OK | Satori + Sharp is proven. Template work is repetitive across platforms. |
| BSS-5 | L | 3-4 weeks | 3-4 weeks | OK | Payload CMS integration is well-documented. ISR is native Vercel feature. |
| BSS-6 | L | 3-4 weeks | 3-4 weeks | OK | Standard portal CRUD with approval workflow. |
| BSS-7 | M | 2-3 weeks | 3-4 weeks | +1 week | The 5-phase onboarding flow (BSS-7.1 to BSS-7.5) involves AI analysis (Claude Vision for competitor screenshots, Flux for moodboard generation). This depends on BSS-3 being complete AND stable. The AI Analysis Pipeline (BSS-7.2) is essentially a complex orchestration of multiple AI services -- more complex than a typical M epic. |
| BSS-8 | M | 2-3 weeks | 2-3 weeks | OK | Checklist-driven QA is straightforward to implement. |
| BSS-9 | L | 3-4 weeks | 3-4 weeks | OK | Template Figma work is parallelizable across component categories. |
| BSS-10 | M | 2-3 weeks | 2-3 weeks | OK | Logging and dashboards are well-understood patterns. |

### Adjusted MVP Timeline

Original estimate: 14-18 weeks. With the two adjustments above:
- BSS-3 adds 1 week to Wave 2 critical path
- BSS-7 adds 1 week to Wave 4

Since BSS-3 runs in parallel with BSS-2 (Wave 2), and BSS-7 runs in Wave 4, the critical path impact is:

**Adjusted MVP timeline: 16-20 weeks (4-5 months)**

The 2-week increase comes primarily from BSS-3 (AI pipeline) being on the critical path for BSS-4 (Creative Production). If BSS-3 takes 5 weeks instead of 4, it pushes the Wave 3 start by 1 week, cascading to Wave 4.

---

## 5. MVP vs Enhancement Line

**Verdict: SUGGEST ADJUSTMENT**

### Current Classification Assessment

| Epic | Current Priority | My Assessment | Reasoning |
|------|-----------------|---------------|-----------|
| BSS-1 (Foundation) | P0 | P0 | Non-negotiable. |
| BSS-2 (Tokens & Brand Book) | P0 | P0 | Core deliverable. Without tokens, no brand book, no creatives. |
| BSS-3 (AI Pipeline) | P0 | P0 | Core differentiator. Without AI pipeline, no time compression. |
| BSS-4 (Creatives) | P0 | P0 | Pillar 2 is MVP scope. |
| BSS-5 (Landing Pages) | P0 | P0 | Pillar 3 is MVP scope. |
| BSS-6 (Client Portal) | P0 | P0 | Clients need to review and approve deliverables. |
| BSS-7 (Onboarding) | P0 | P0 | Entry point for every client. |
| BSS-8 (QA Pipeline) | P1 | **Should be P0** | See below. |
| BSS-9 (Figma Library) | P1 | P1 | Correct. Tier 1 ($8K) does not include component library. |
| BSS-10 (Observability) | P1 | P1 | Correct. Can run manually for first 5 pilot clients. |

### BSS-8 Should Be P0

BSS-8 (Quality Assurance & Review Pipeline) is currently P1, but it covers:

- **FR-8.5:** Quality Review Queue -- checklist-based QA before client delivery
- **FR-8.7:** Revision Management -- 3 rounds per deliverable type (CON-14)
- **NFR-7.1-7.4:** Documentation quality checklists

The QA pipeline is not a "nice to have." Without it, the first client delivery has no systematic quality gate between AI-generated content and client-facing delivery. The PRD itself emphasizes "No AI output goes directly to client without human QA pass." BSS-8 is the system that enforces this.

However, BSS-8 depends on BSS-3 and BSS-4 (which are Wave 2-3). So even as P0, its execution timing in Wave 4 is correct. The priority change is about commitment: P0 means "must ship before accepting paying clients," which is the correct framing.

**Recommendation:** Promote BSS-8 from P1 to P0. This changes the MVP from 7 epics (44 stories) to 8 epics (48 stories). The timeline does not change because BSS-8 already runs in Wave 4 parallel to BSS-7.

### Nothing Critical Misplaced in P1/P2

BSS-9 (Figma Library) at P1 is correct -- Tier 1 clients get basic brand assets, not a full component library. BSS-10 (Observability) at P1 is correct -- manual monitoring works for pilot phase. All P2 epics are expansion pillars that the PRD explicitly defers.

---

## 6. Risk Coverage

**Verdict: APPROVED**

All 5 technical risks from my previous review are traceable to specific epics and stories.

### Risk Traceability Matrix

| Risk | Epic | Story | How Addressed |
|------|------|-------|---------------|
| **1. Claude API rate limits break batch timing** | BSS-3 | BSS-3.2 (Job Queue & Rate Limit Management) | Queue with backpressure, throttling to stay within RPM limits. Timing estimates adjusted to 10-15 min for 30 posts. |
| **2. Vercel custom domain cap at 50** | BSS-1 | BSS-1.6 (Multi-Tenant Subdomain Routing) | Subdomain routing (*.brand.aioxsquad.ai) avoids custom domain cap for most clients. Cap only matters for clients wanting brand.acme.com. Documented in PRD risk table. |
| **3. Figma token sync direction conflict** | BSS-9 | BSS-9.5 (Token Integration via Tokens Studio) | CON-13 enforces unidirectional flow: Code -> Figma. Story explicitly references "unidirectional per CON-13." |
| **4. Payload CMS webhook security** | BSS-1 | BSS-1.8 (Security Hardening) | HMAC webhook validation. BSS-5.6 references "HMAC validated per NFR-8.3." |
| **5. Prompt engineering dependency on automation promise** | BSS-3 | BSS-3.3 (Prompt Template Library), BSS-3.4 (Prompt Quality Scoring Pipeline) | Two dedicated stories with versioning, quality scoring (avg >= 4.0), and A/B testing. |

### Additional Risks Not Covered in Epics

One risk that should be called out at the epic level but is not: **Payload CMS 3.x maturity risk.** The PRD review noted Payload 3.x is "relatively new (GA in 2024)" and recommended a POC before commitment. BSS-5.1 (Payload CMS 3.x Integration) should include a POC validation step in its acceptance criteria. This is a story-level concern, not an epic-level gap.

---

## 7. Foundation Epic (BSS-1) Structure

**Verdict: SUGGEST ADJUSTMENT**

### Split Analysis

BSS-1 has 10 stories. The question is whether to split into BSS-1a (Foundation Core) and BSS-1b (Security Hardening).

**Arguments for splitting:**

1. Different skill requirements: BSS-1.1-1.7 is backend infrastructure; BSS-1.8-1.10 is security/compliance engineering.
2. Different urgency: BSS-1.1-1.7 gates Wave 2; BSS-1.8-1.10 does not.
3. XL epics are harder to track and report progress on.

**Arguments against splitting:**

1. Added dependency management overhead (BSS-1b depends on BSS-1a, trivially).
2. All 10 stories are conceptually "foundation" -- they set up the infrastructure layer.
3. The stories are individually small enough that an XL epic is not unwieldy.
4. BSS-1.4 (RLS Automated Test Suite) logically belongs with BSS-1.3 (RLS Policies) but would cross the split boundary.

### My Recommendation

**Keep BSS-1 as a single XL epic, but add explicit "gate" markers within the epic.**

Instead of splitting into two epics, mark stories BSS-1.2, BSS-1.3, BSS-1.5, and BSS-1.7 as "Gate: Wave 2 Start" in the story descriptions. This communicates that these 4 stories are the critical path, while BSS-1.8-1.10 can continue in parallel with Wave 2 without needing a separate epic.

This approach gives you the tracking clarity of a split without the dependency management overhead.

If the team prefers formal split for reporting purposes, the clean cut is:

| Sub-Epic | Stories | Estimate |
|----------|---------|----------|
| BSS-1a: Core Infrastructure | BSS-1.1 to BSS-1.7 (7 stories) | 3-4 weeks |
| BSS-1b: Security & Compliance | BSS-1.8 to BSS-1.10 (3 stories) | 1-2 weeks |

BSS-1b would run in parallel with Wave 2, with no critical path impact.

---

## 8. Parallelization & Hidden Bottlenecks

**Verdict: SUGGEST ADJUSTMENT**

### Wave 2 Parallelization (BSS-2 + BSS-3)

BSS-2 (Tokens) and BSS-3 (AI Pipeline) have **no technical dependency** on each other. They share only BSS-1 as a prerequisite. This parallelization is valid.

**Hidden bottleneck:** Both epics need the Supabase schema to be ready (BSS-1.2). If BSS-1.2 (Schema & Multi-Tenant Data Model) is delayed, both Wave 2 epics are blocked. This is a single point of failure in the critical path.

**Mitigation:** BSS-1.2 should be the FIRST story completed in BSS-1, ideally by Week 1.5.

### Wave 3 Parallelization (BSS-4 + BSS-5 + BSS-6)

These three epics can run in parallel with different developers, but:

**Resource bottleneck:** Three L-sized epics running simultaneously requires at least 3 developers working in parallel. If the team has fewer than 3 developers, these become sequential, adding 6-8 weeks to the timeline.

**Technical bottleneck for BSS-4:** BSS-4 (Creative Production) depends on BOTH BSS-2 (tokens for template styling) AND BSS-3 (AI pipeline for copy/image generation). If BSS-3 takes 5 weeks (my adjusted estimate from Section 4), BSS-4 cannot start until Week 8, pushing it to finish at Week 12 instead of Week 10. This cascades to BSS-8 (QA Pipeline) which depends on BSS-4.

**BSS-5 and BSS-6 are safer:** Both depend only on BSS-1 and BSS-2 (not BSS-3), so they can start as soon as tokens are ready (~Week 5-6).

### Wave 4 Dependency on BSS-6

BSS-7 (Onboarding) depends on BSS-6 (Client Portal). This means the onboarding flow cannot be built until the portal shell exists. However, the onboarding wizard (BSS-7.1) is a standalone multi-step form that could start development earlier if BSS-6.1 (Portal Shell & Navigation) is delivered first. The dependency is really on BSS-6.1, not all of BSS-6.

**Recommendation:** Make BSS-7 depend on BSS-6.1 (Portal Shell) specifically, not on the full BSS-6 epic. This allows BSS-7 to start 1-2 weeks earlier in Wave 4.

### Wave 5 Has No Bottleneck

BSS-9 (Figma Library) and BSS-10 (Observability) depend on different upstream epics (BSS-2 and BSS-1 respectively) and require different skills. No conflicts.

### Team Size Assumption

The epic map assumes 3+ parallel work streams in Wave 3. If the team is smaller:

| Team Size | Wave 3 Impact | Total MVP Timeline |
|-----------|--------------|-------------------|
| 3+ devs | All parallel, 16-20 weeks | On schedule |
| 2 devs | BSS-4 sequential after BSS-5/6, +3-4 weeks | 20-24 weeks |
| 1 dev | All sequential, +8-10 weeks | 26-30 weeks |

This should be documented as a planning assumption.

---

## Summary of Verdicts

| # | Area | Verdict | Key Finding |
|---|------|---------|-------------|
| 1 | Dependency Sequence | APPROVED | No circular dependencies. Wave overlap at W1-W2 needs "gate" markers on BSS-1 stories. |
| 2 | Epic Granularity | SUGGEST ADJUSTMENT | BSS-1 is large but cohesive. Recommend gate markers instead of formal split. |
| 3 | Separation of Concerns | APPROVED | Clean concern boundaries across all 14 epics. Cross-cutting concerns handled correctly. |
| 4 | Complexity vs Timeline | SUGGEST ADJUSTMENT | BSS-3 and BSS-7 underestimated by ~1 week each. Adjusted MVP: 16-20 weeks (was 14-18). |
| 5 | MVP vs Enhancement Line | SUGGEST ADJUSTMENT | BSS-8 (QA Pipeline) should be promoted from P1 to P0. QA is not optional before accepting paying clients. |
| 6 | Risk Coverage | APPROVED | All 5 identified risks traceable to specific stories. Payload CMS maturity needs POC in BSS-5.1. |
| 7 | Foundation (BSS-1) Structure | SUGGEST ADJUSTMENT | Keep as single XL epic with gate markers. Formal split is optional for reporting clarity. |
| 8 | Parallelization | SUGGEST ADJUSTMENT | 3+ devs required for Wave 3 parallel execution. BSS-1.2 (schema) is a single point of failure. BSS-7 can start earlier if dependency is narrowed to BSS-6.1. |

---

## Recommended Adjustments

### High Priority (should be applied before story drafting)

1. **Promote BSS-8 to P0.** QA pipeline is essential for MVP quality gate. (MVP becomes 8 epics, 48 stories.)

2. **Add gate markers to BSS-1.** Mark BSS-1.2, BSS-1.3, BSS-1.5, BSS-1.7 as "Gate: Wave 2 Start" so the team knows which stories are critical path.

3. **Adjust BSS-3 estimate to 4-5 weeks (L+).** Prompt quality scoring (BSS-3.4) and content moderation (BSS-3.5) are R&D-heavy with no reference implementations.

4. **Adjust BSS-7 estimate to 3-4 weeks (upgrade from M to L).** The AI Analysis Pipeline (BSS-7.2) orchestrates multiple AI services (Claude Vision, Flux, token generation) and is more complex than a typical M epic.

5. **Narrow BSS-7 dependency to BSS-6.1** (Portal Shell) instead of full BSS-6 epic. This allows earlier start.

### Medium Priority (nice to have for planning clarity)

6. **Document team size assumption** (3+ developers for Wave 3 parallel execution) in the epic map.

7. **Add POC validation step** to BSS-5.1 (Payload CMS) acceptance criteria to address Payload 3.x maturity risk.

8. **Prioritize BSS-1.2** (Schema) as the first story to complete in Wave 1, since both Wave 2 epics depend on it.

### Low Priority (cosmetic)

9. **Adjust total MVP timeline** from 14-18 weeks to 16-20 weeks to reflect BSS-3 and BSS-7 adjustments.

10. **Update summary statistics** to reflect BSS-8 promotion: MVP Stories becomes 48 (was 44), Post-MVP becomes 20 (was 24).

---

## Final Approval

**GO WITH ADJUSTMENTS**

The epic decomposition is architecturally sound. The dependency graph is clean, the separation of concerns is well-structured, and all identified technical risks are traceable to specific stories. The 5 conditions from my PRD review are all properly incorporated.

The adjustments recommended above are refinements, not redesigns. The most important one -- promoting BSS-8 (QA Pipeline) to P0 -- is a priority change, not a structural change. The timeline adjustments (+2 weeks on MVP) reflect conservative realism based on the R&D nature of the prompt engineering and AI orchestration work.

Pax has done solid work decomposing a complex 675-line PRD into a manageable set of epics with clear boundaries and dependencies. The decomposition is ready for story drafting by @sm, with the adjustments above incorporated.

---

**Documents Cross-Referenced:**
- `C:\Users\mrapa\projects\my-projects\aios-core\docs\prd-brand-system-service.md` (PRD v1.1)
- `C:\Users\mrapa\projects\my-projects\aios-core\docs\epics-brand-system-service.md` (Epic Map v1.0)
- `C:\Users\mrapa\projects\my-projects\aios-core\docs\review-prd-brand-system-service.md` (PRD Technical Review)

-- Aria, arquitetando o futuro
