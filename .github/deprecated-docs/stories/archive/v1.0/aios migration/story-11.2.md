# Story 11.2: Community Engagement + Tutorial Creation

**Story ID:** 11.2
**Epic:** Epic-11 - Phase 2 - Expansion Pack Spec
**Wave:** Wave 3 (Progressive Open Source)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Docs (Ajax) + Marketing
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $3,000

---

## 📋 Objective

Create 'Build Your First Expansion Pack' tutorial, announce on dev communities, and engage with early contributors targeting 10+ community packs in 2 weeks.

---

## 🎯 Scope

Write comprehensive tutorial guiding users through pack creation step-by-step. Announce repository on dev communities (HN, Reddit, Dev.to). Engage with community pack submissions, provide feedback, encourage contributions. KILL SWITCH: <10 packs in 2 weeks → add examples, simplify specs.

---

## 📊 Tasks Breakdown

**Day 1: Tutorial Creation (8 hours)** (8 hours)
Write comprehensive pack creation tutorial
- Create docs/tutorials/build-your-first-expansion-pack.md:
- - Step 1: Set up folder structure
- - Step 2: Create manifest.yaml (pack metadata)
- - Step 3: Define agent (agent.yaml with persona, archetype)
- - Step 4: Create task workflow (task.md with elicitation)
- - Step 5: Add template (template.md with variables)
- - Step 6: Write tests (unit tests, >80% coverage)
- - Step 7: Validate with expansion-validator.js
- - Step 8: Submit PR to aios/expansion-packs community/
- Include full example: 'hello-world' expansion pack
- Add screenshots of each step
- Video walkthrough (10 minutes): screen recording of tutorial
- Embed video in tutorial doc

**Day 2: Community Announcement & Engagement (8 hours)** (8 hours)
Announce tutorial and engage with contributors
- Publish tutorial in aios/expansion-packs/docs/tutorials/
- Announce on dev communities:
- - Hacker News: 'Show HN: Build Your First AIOS Expansion Pack'
- - Reddit r/programming: 'Tutorial: Create custom AI agent packs for AIOS'
- - Dev.to: Full tutorial article + video
- - Twitter: Thread with tutorial highlights + repo link
- Engage with community:
- - Respond to questions on GitHub Discussions
- - Review community pack PRs (provide feedback within 24 hours)
- - Feature high-quality community packs in README
- Track community pack submissions:
- - Target: 10+ packs in 2 weeks
- - KILL SWITCH: If <10 packs → add more examples, simplify specs, extend deadline

---

## ✅ Acceptance Criteria

### Must Have
- [ ] 'Build Your First Expansion Pack' tutorial created and published
- [ ] Tutorial includes 8 steps with full example (hello-world pack)
- [ ] Video walkthrough (10 minutes) embedded in tutorial
- [ ] Announced on 4+ dev communities (HN, Reddit, Dev.to, Twitter)
- [ ] Community engagement: respond to PRs within 24 hours
- [ ] Track community pack submissions (target: 10+ in 2 weeks)
- [ ] KILL SWITCH criteria: <10 packs → iterate before Epic 12

### Should Have
- [ ] Screenshots for each tutorial step
- [ ] FAQ addressing common pack creation questions
- [ ] Community pack showcase in README


### Nice to Have
- [ ] Live coding session (YouTube/Twitch)
- [ ] Pack creation contest with prizes


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 11.1: Extract Verified Packs

### Dependent Stories (This Blocks)
- **Epic 12: Phase 3 - Open Core Repository

---

## 📁 Files Modified

### New Files Created
- `aios/expansion-packs/docs/tutorials/build-your-first-expansion-pack.md`
- `aios/expansion-packs/examples/hello-world/*`

### Files Modified
- `aios/expansion-packs/README.md`


### Files Referenced (No Changes)
- None


---

## 🎨 Deliverables

### Pack Creation Tutorial
**Location:** `aios/expansion-packs/docs/tutorials/`

Comprehensive tutorial with 8 steps, example pack, and video walkthrough.

### Community Announcement
**Location:** `HN, Reddit, Dev.to, Twitter`

Tutorial announced on 4+ dev communities with engagement plan.

---

## 💰 Investment Breakdown

- Day 1 (Tutorial Creation): $1,500
- Day 2 (Announcement & Engagement): $1,500
- Total: $3,000

---

## 🎯 Success Metrics

- **Tutorial Completeness:** 8-step tutorial with example and video
- **Community Reach:** Posted on 4+ platforms
- **Community Packs (GO Criteria):** >10 packs submitted in 2 weeks
- **NO-GO Criteria:** <10 packs → add examples, simplify specs, delay Epic 12

---

## ⚠️ Risks & Mitigation

### Risk 1: Low community pack submissions (<10 in 2 weeks)
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** KILL SWITCH: add more example packs, simplify specifications, extend campaign, delay Epic 12

---

## 📝 Notes

Completes Epic 11 (Phase 2). KILL SWITCH: If <10 community packs in 2 weeks → add examples, simplify specs, extend deadline before Epic 12. If GO → proceed to open core repository.

---

## 🔗 Related Documents

- **Epic:** [Epic-11](../epics/epic-11.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
