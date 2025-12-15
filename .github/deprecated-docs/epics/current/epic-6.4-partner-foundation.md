# Epic 6.4: Partner Program Foundation

**Epic ID:** Epic-6.4
**Parent:** Epic-Master-AIOS-2.0 (Wave 1)
**Status:** 🟢 Ready to Start
**Priority:** 🟡 Medium (Quick Win)
**Owner:** PM (Morgan) + SM (River - to be named)
**Created:** 2025-01-14
**Target Completion:** Q1 2026, Week 4
**Duration:** 1 week (0.5 sprint)
**Investment:** $7.5K

---

## 📋 Executive Summary

Create foundational infrastructure for Founding Partners Program (Decision #3) by preparing legal templates, onboarding materials, and ClickUp workspace. This enables Phase 0 (30-day validation) to start in Q2 with 4 pre-identified partners.

### 🎯 Objectives

1. **Legal Templates:** Partner agreement, revenue share terms, proprietary pack requirements
2. **Onboarding Checklist:** 30-day Phase 0 validation checklist
3. **ClickUp Workspace:** Partner tracking and deal support system
4. **Documentation:** Partner handbook and training materials
5. **Zero Code Changes:** Infrastructure only (templates and processes)

### 💰 Value

- **Investment:** $7.5K (1 week)
- **Unblocks:** Epic 14 (Founding Partners Onboarding) in Q3 2026
- **Partners:** Alan Nicolas, Taynã Puri, Steven Phil, Marco Marcelino
- **Revenue Target:** $10K MRR by Month 3 (Day 90)

---

## 🏗️ Current State

### Partner Program Status
- ❌ **No Legal Templates:** Partner agreements not drafted
- ❌ **No Onboarding Process:** No structured 30-day validation
- ❌ **No Tracking System:** No ClickUp workspace configured
- ✅ **4 Partners Identified:** Alan, Taynã, Steven, Marco (ready to onboard)

### Business Model (from Decision #3)
- **3-Tier Model:** Explorer (Free), Builder ($499/mo OR 30% share), Legend (Earned)
- **Revenue Share:** 70% partner / 30% AIOS
- **Proprietary Packs Required:** Prevents HashiCorp failure (prevents free-riding)

---

## 📦 Target State

### Documentation Structure

```
docs/partners/
├── founding-partner-agreement.md          # Legal template
├── revenue-share-terms.md                 # 70/30 model details
├── proprietary-pack-requirements.md       # Pack ownership rules
├── onboarding-checklist.md                # Phase 0 checklist
├── partner-handbook.md                    # Complete guide
└── training-materials/
    ├── expansion-pack-creation-guide.md
    ├── deal-support-process.md
    └── revenue-reporting-guide.md
```

### ClickUp Workspace Structure

```
AIOS Partner Program (Workspace)
├── 📁 Founding Partners (Folder)
│   ├── Alan Nicolas - Education Vertical
│   ├── Taynã Puri - Content Vertical
│   ├── Steven Phil - Enterprise Vertical
│   └── Marco Marcelino - Data Vertical
├── 📁 Deals Pipeline (Folder)
│   ├── List: Leads
│   ├── List: In Progress
│   ├── List: Closed Won
│   └── List: Closed Lost
├── 📁 Proprietary Packs (Folder)
│   ├── List: In Development
│   ├── List: Review/QA
│   └── List: Published
└── 📁 Support Tickets (Folder)
    ├── List: Open (<24h response time)
    ├── List: In Progress
    └── List: Resolved
```

---

## 📊 Stories Breakdown

### Story 6.4.1: Legal Templates Creation
**Objective:** Draft legal agreements and terms for partner program

**Templates to Create:**

**1. Founding Partner Agreement (`founding-partner-agreement.md`):**
```markdown
# AIOS Founding Partner Agreement

**Effective Date:** [DATE]
**Partner Name:** [PARTNER NAME]
**Partner Entity:** [COMPANY NAME]

## 1. Program Overview
This agreement governs participation in AIOS Founding Partners Program.

## 2. Partner Tier: Builder
- Monthly Fee: $499/month OR 30% revenue share (partner chooses)
- Benefits: Certified partner status, co-marketing, lead matching, white-label assets

## 3. Proprietary Pack Requirement
Partner MUST create and maintain at least ONE proprietary expansion pack:
- Cannot be open-sourced
- AIOS receives 30% revenue share
- Partner retains 70% revenue share
- Prevents client lock-in via switching costs

## 4. Revenue Share Terms
- 70% Partner / 30% AIOS split on all proprietary pack sales
- Monthly payout via Stripe
- Minimum payout: $100
- Payment terms: Net 30

## 5. Co-Marketing Rights
- Partner logo on AIOS website
- Joint case studies
- Shared social media promotion
- Conference booth sharing

## 6. Term and Termination
- Initial term: 12 months
- Auto-renewal: Yes (annual)
- Termination: 60-day notice
- Proprietary packs: Ownership retained by partner

## 7. Signatures
[Signature blocks]
```

**2. Revenue Share Terms (`revenue-share-terms.md`):**
- Detailed calculation methodology
- Payment schedule (monthly, Net 30)
- Tax implications (partners responsible for own taxes)
- Stripe Connect integration (future)

**3. Proprietary Pack Requirements (`proprietary-pack-requirements.md`):**
- Definition of "proprietary" (cannot be open-sourced)
- Minimum pack requirements (1 agent, 3 tasks)
- Quality standards (Code Rabbit passing, tests >80% coverage)
- Prevents HashiCorp failure (partners can't free-ride on open-source)

**Acceptance Criteria:**
- [ ] 3 legal templates drafted
- [ ] Legal review completed (CEO/CTO or external counsel)
- [ ] Templates use plain language (not legalese)
- [ ] Revenue share terms clear and actionable
- [ ] Proprietary pack requirements prevent free-riding

**Estimated Time:** 3 days

---

### Story 6.4.2: Onboarding and Training Materials
**Objective:** Create partner handbook and training materials

**Deliverables:**

**1. Onboarding Checklist (`onboarding-checklist.md`):**
Phase 0 (30 days) validation checklist:
- [ ] Day 1: Sign partner agreement
- [ ] Day 3: ClickUp workspace access granted
- [ ] Day 7: First proprietary pack idea validated
- [ ] Day 14: First client prospect identified
- [ ] Day 21: Proprietary pack development started
- [ ] Day 30: KILL SWITCH - Partner commits to program or exits

**2. Partner Handbook (`partner-handbook.md`):**
Sections:
- Welcome to AIOS Partner Program
- Program tiers (Explorer, Builder, Legend)
- Revenue share model (70/30)
- Proprietary pack creation guide
- Deal support process (<24h response time)
- ClickUp workspace tutorial
- FAQ (common questions)

**3. Training Materials:**
- Expansion pack creation guide (technical)
- Deal support process (sales methodology)
- Revenue reporting guide (financial tracking)

**Acceptance Criteria:**
- [ ] Onboarding checklist covers 30-day Phase 0
- [ ] Partner handbook is comprehensive (20+ pages)
- [ ] Training materials are actionable
- [ ] Content reviewed by at least 1 partner (Taynã Puri - already using AIOS)

**Estimated Time:** 2 days

---

### Story 6.4.3: ClickUp Workspace Configuration
**Objective:** Set up partner tracking and deal support system

**Configuration Steps:**
1. Create "AIOS Partner Program" workspace in ClickUp
2. Create 4 folders (Founding Partners, Deals Pipeline, Proprietary Packs, Support Tickets)
3. Create lists and custom fields:
   - Partner Status (Active, Inactive, Churned)
   - Revenue Share % (default: 30%)
   - Monthly Fee (default: $499 or "Revenue Share")
   - Proprietary Packs Count (min: 1)
   - Last Check-in Date (weekly cadence)
4. Set up automations:
   - Weekly check-in reminder (every Monday)
   - Support ticket <24h alert (if no response)
   - Deal won → revenue share calculation
5. Invite partners (Alan, Taynã, Steven, Marco) as guests

**Custom Views:**
- **Partner Dashboard:** Overview of all partners, revenue, pack count
- **Deal Funnel:** Pipeline view (Leads → In Progress → Closed)
- **Support Queue:** Tickets sorted by priority and response time
- **Pack Registry:** All proprietary packs with status

**Acceptance Criteria:**
- [ ] ClickUp workspace created and configured
- [ ] 4 folders + lists set up
- [ ] Custom fields configured
- [ ] Automations tested
- [ ] Dashboard views created
- [ ] 4 partners invited as guests

**Estimated Time:** 1.5 days

---

## 📈 Success Metrics

### Completion Criteria
- ✅ 3 legal templates reviewed and approved
- ✅ Partner handbook and training materials complete
- ✅ ClickUp workspace configured and tested
- ✅ 4 partners invited to ClickUp
- ✅ Onboarding checklist validated

### Phase 0 Validation (Day 30 - Q2 2026)
- ✅ 4/4 partners sign agreement (KILL SWITCH: <4 → ABORT)
- ✅ 4/4 partners onboarded to ClickUp
- ✅ At least 2 partners identify first client prospect
- ✅ At least 1 proprietary pack in development

---

## ⚠️ Risks & Mitigation

### Risk 1: Partners refuse proprietary pack requirement
- **Probability:** MEDIUM (50% partners may resist)
- **Impact:** CRITICAL (prevents HashiCorp failure mitigation)
- **Mitigation:** Explain switching cost benefits, showcase Taynã Puri example

### Risk 2: Legal templates are unenforceable
- **Probability:** LOW (will get legal review)
- **Impact:** HIGH (partnership disputes)
- **Mitigation:** External legal counsel review ($1K budget)

### Risk 3: ClickUp workspace becomes overwhelming
- **Probability:** MEDIUM
- **Impact:** MEDIUM (partner frustration)
- **Mitigation:** Simple setup initially, iterate based on feedback

---

## 🔗 Related Resources

### Parent Epic
- [Epic Master: AIOS 2.0](epic-master-aios-2.0.md)

### Decision Documents
- [Decision #3: Founding Partners Program](../one-pagers/DECISION-3-FOUNDING-PARTNERS-PROGRAM.md)

### Downstream Epics
- [Epic 14: Founding Partners Onboarding](epic-14-partners-onboarding.md) - Uses templates created here

### Tools
- **ClickUp:** Partner tracking and deal support
- **Stripe Connect:** Revenue share automation (Phase 2, Epic 15)

---

## 📝 Notes

### 4 Founding Partners (Pre-Identified)
1. **Alan Nicolas** - Education vertical (10K+ community)
2. **Taynã Puri** - Content vertical (already using AIOS in production)
3. **Steven Phil** - Enterprise vertical (government connections)
4. **Marco Marcelino** - Data vertical (non-technical specialist)

### Proprietary Pack Requirement Rationale
From Decision #4: "Prevents HashiCorp failure (Terraform modules → AWS/Google free-ride)"
- Without proprietary packs, partners could use open-source AIOS without revenue share
- Proprietary packs create switching costs (clients depend on partner's packs)
- 70/30 split aligns incentives (partner makes more when they sell more)

### Kill Switch (Day 30)
If <4/4 partners commit → ABORT program, revisit partner model

---

**Last Updated:** 2025-01-14
**Next Review:** 2025-01-21
**Owner:** PM (Morgan) + SM (River)
**Status:** 🟢 Ready to Start (Week 4, Q1 2026)
