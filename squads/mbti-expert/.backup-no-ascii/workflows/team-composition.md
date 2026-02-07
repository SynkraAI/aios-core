
# Workflow: Team Composition Analysis

Analyze a team and provide actionable recommendations.

---

## Steps


### 1. Collect Team Types
**Task:** Manually collect type codes from all team members


### 2. Team Dynamics Analysis
**Task:** `team-dynamics --types {comma-separated-types}`
**Output:** Composition, strengths, gaps, conflicts, recommendations


### 3. Individual Profiles (Optional)
**Task:** `type-summary --type {each-type}`
**Output:** Quick card for each member


### 4. Key Pairings Analysis
**Task:** `compatibility-analysis --type1 {x} --type2 {y} --context workplace`
**Output:** Compatibility for the most critical pairings (leader-team, conflict-prone)


### 5. Recommendations Report
Consolidate findings into actionable team improvement plan.

---


## Estimated Duration
- Type collection: varies
- Analysis generation: 5-10 minutes
- Total: ~20-30 minutes depending on team size
