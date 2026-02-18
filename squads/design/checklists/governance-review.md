# Checklist: Governance Review

**ID:** governance-review
**Version:** 1.0
**Purpose:** Reviews the governance model ensuring decision processes, roles, contribution paths, versioning, release cadence, and communication channels are properly defined
**Agent:** @nathan-curtis
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Design system charter or mission statement exists
- [ ] At least one stakeholder from each consuming team has been identified
- [ ] Governance documentation location has been established
- [ ] Team model (solitary, centralized, federated, hybrid) has been selected

---

## Section 1: Decision Process

- [ ] Decision-making framework is documented (who decides what)
- [ ] Escalation path exists for unresolved disagreements
- [ ] RFC (Request for Comments) or proposal process is defined for new components
- [ ] Deprecation process is documented with timeline expectations
- [ ] Breaking change policy is explicit (when allowed, approval requirements)
- [ ] Decision log or ADR (Architecture Decision Records) practice is in place
- [ ] Community input mechanism exists (voting, comments, office hours)

## Section 2: Roles and Responsibilities

- [ ] Design system lead/owner is identified
- [ ] Core team members and their areas of ownership are listed
- [ ] Contributor role is defined with expectations and permissions
- [ ] Consumer role is defined with support expectations
- [ ] Review/approval authority is assigned per component area
- [ ] On-call or support rotation is defined
- [ ] Executive sponsor or champion is identified

## Section 3: Contribution Path

- [ ] Contribution guide is written and accessible
- [ ] Contribution types are defined (new component, bug fix, enhancement, docs)
- [ ] Submission process is step-by-step documented
- [ ] Review SLA is defined (e.g., first response within 48 hours)
- [ ] Quality bar for contributions is explicit (tests, docs, a11y)
- [ ] Attribution and credit process exists for contributors
- [ ] Templates exist for component proposals and bug reports

## Section 4: Versioning Strategy

- [ ] Semantic versioning (semver) is adopted and documented
- [ ] What constitutes major, minor, and patch is explicitly defined
- [ ] Pre-release versioning strategy exists (alpha, beta, rc)
- [ ] Per-component vs monolithic versioning decision is made
- [ ] Version compatibility matrix is maintained
- [ ] Dependency version policy is documented

## Section 5: Release Cadence

- [ ] Release frequency is defined (weekly, biweekly, monthly, on-demand)
- [ ] Release process is documented step-by-step
- [ ] Release notes template exists and is consistently used
- [ ] Hotfix process exists for critical issues outside normal cadence
- [ ] Release communication plan covers all consuming teams
- [ ] Release freeze periods are defined (if applicable)

## Section 6: Communication Channels

- [ ] Primary communication channel is established (Slack, Teams, etc.)
- [ ] Announcement channel exists for releases and breaking changes
- [ ] Regular sync meeting cadence is set (weekly, biweekly)
- [ ] Office hours or open forum exists for consumer questions
- [ ] Status page or dashboard tracks system health and adoption
- [ ] Feedback collection mechanism is active and monitored
- [ ] Documentation site is accessible to all stakeholders

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Decision Process | 7 | _ | PENDING |
| Roles and Responsibilities | 7 | _ | PENDING |
| Contribution Path | 7 | _ | PENDING |
| Versioning Strategy | 6 | _ | PENDING |
| Release Cadence | 6 | _ | PENDING |
| Communication Channels | 7 | _ | PENDING |

**Minimum passing score:** 80%
**Blocking items:** Decision Process and Roles items are mandatory for governance approval
