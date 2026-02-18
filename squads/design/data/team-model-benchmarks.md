# Team Model Comparison Data

**ID:** team-model-benchmarks
**Version:** 1.0
**Purpose:** Reference data comparing design system team models with sizing, organizational fit, advantages, disadvantages, and maturity indicators
**Maintained By:** @nathan-curtis

---

## Team Model Comparison

| Dimension | Solitary | Centralized | Federated | Hybrid |
|-----------|----------|-------------|-----------|--------|
| **Team Size** | 1 person | 3-8 people | 8-20 distributed | 3-5 core + 10-20 contributors |
| **Org Size** | Startup (10-100) | Mid-size (100-1000) | Enterprise (1000+) | Mid to Large (500-5000) |
| **Decision Speed** | Very fast | Fast | Slow | Moderate |
| **Consistency** | High (one voice) | High (unified team) | Variable | High (core enforces) |
| **Scalability** | Low | Moderate | High | High |
| **Bus Factor Risk** | Critical (1 person) | Low | Very low | Low |
| **Cost** | Low | Moderate | High | Moderate-High |
| **Maturity Level** | Level 1-2 | Level 2-4 | Level 3-5 | Level 3-5 |
| **Governance** | Informal | Formal, centralized | Formal, distributed | Formal, layered |

---

## Solitary Model

**Description:** A single person (or occasionally two) owns the entire design system. Common in startups and small companies where resources are limited.

**Best for:**
- Startups and small companies (10-100 employees)
- Teams just beginning a design system initiative
- Organizations with fewer than 5 product teams

**Pros:**
- Extremely fast decision-making and iteration
- No coordination overhead between team members
- Deep understanding of the entire system by one person
- Low cost to maintain

**Cons:**
- Single point of failure (bus factor = 1)
- Limited capacity for growth and maintenance
- One perspective may miss edge cases
- Burnout risk is high

**Typical role:** Senior frontend developer or product designer with strong opinions on consistency

---

## Centralized Model

**Description:** A dedicated team owns, builds, and maintains the design system. Consuming teams submit requests and receive supported components.

**Best for:**
- Mid-size companies (100-1000 employees)
- Organizations with 5-20 product teams
- Companies investing seriously in UI consistency

**Pros:**
- Consistent quality and standards
- Clear ownership and accountability
- Dedicated roadmap and release cadence
- Professional documentation and support

**Cons:**
- Can become a bottleneck for consumer requests
- Risk of building what the team thinks is needed vs. what teams actually need
- Higher cost due to dedicated headcount
- Potential disconnect from product team realities

**Typical team composition:**

| Role | Count | Responsibility |
|------|-------|----------------|
| DS Lead / Manager | 1 | Strategy, roadmap, stakeholder management |
| DS Engineer | 2-3 | Component development, tooling, CI/CD |
| DS Designer | 1-2 | Component design, token management, Figma library |
| DX / Docs Specialist | 1 | Documentation, onboarding, developer experience |
| A11y Specialist | 0.5-1 | Accessibility audits, ARIA patterns, testing |

---

## Federated Model

**Description:** Design system ownership is distributed across multiple product teams. Contributors from each team participate in building and maintaining the system.

**Best for:**
- Large enterprises (1000+ employees)
- Organizations with 20+ product teams
- Companies with mature engineering cultures

**Pros:**
- Scales with the organization naturally
- Contributors understand their product context
- No single-team bottleneck
- Broad buy-in and ownership across the org

**Cons:**
- Coordination is complex and time-consuming
- Quality can be inconsistent without strong governance
- Decision-making is slow (consensus-driven)
- Requires significant governance infrastructure

**Typical structure:**

| Layer | People | Responsibility |
|-------|--------|----------------|
| Steering Committee | 3-5 | Strategic direction, budget, prioritization |
| Core Maintainers | 5-8 | Review, merge, release, quality gates |
| Team Contributors | 10-20 | Build components, submit PRs, participate in reviews |
| Community | All developers | Use the system, file issues, give feedback |

---

## Hybrid Model

**Description:** A small core team sets standards, provides tooling, and maintains critical components. Product teams contribute components relevant to their domain, following core team guidelines.

**Best for:**
- Mid to large companies (500-5000 employees)
- Organizations transitioning from centralized to federated
- Companies wanting core consistency with distributed contribution

**Pros:**
- Core team ensures quality and consistency
- Distributed contribution scales beyond the core team
- Product teams feel ownership without full burden
- Balances speed with governance

**Cons:**
- Requires clear guidelines for contribution quality
- Coordination between core and contributors needs active management
- Can create two tiers of components (core-built vs. contributed)
- Onboarding contributors requires training investment

**Typical structure:**

| Layer | People | Responsibility |
|-------|--------|----------------|
| Core Team | 3-5 | Standards, tooling, critical components, review |
| Embedded Contributors | 1 per product team | Build domain components, align with core |
| Community Champions | 2-5 | Advocacy, training, feedback collection |

---

## Model Selection Guide

| Signal | Recommended Model |
|--------|-------------------|
| < 5 product teams, limited budget | Solitary |
| 5-15 product teams, dedicated budget | Centralized |
| 15+ product teams, strong engineering culture | Federated |
| 10+ product teams, want speed + quality | Hybrid |
| Just starting out | Solitary, evolving to Centralized |
| Scaling rapidly | Centralized, evolving to Hybrid |
| Mature organization with many platforms | Federated or Hybrid |

---

## Evolution Path

```
Solitary --> Centralized --> Hybrid --> Federated
  (1)          (2-3)         (3-4)       (4-5)
              Maturity Level Progression
```

Most organizations follow this progression naturally:
1. One person starts building shared components
2. Success leads to a dedicated team being formed
3. Demand exceeds core team capacity, so contribution opens up
4. At scale, ownership distributes fully across the organization

**Key transition triggers:**
- Solitary to Centralized: When one person cannot keep up with demand
- Centralized to Hybrid: When the core team becomes a bottleneck
- Hybrid to Federated: When contribution quality is consistent enough to distribute ownership
