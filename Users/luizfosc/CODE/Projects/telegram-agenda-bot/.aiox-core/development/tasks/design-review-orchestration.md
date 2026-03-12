# Design Review Orchestration - Multi-Agent Review Coordination

> Task ID: design-review-orchestration
> Agent: Design Chief (Orchestrator)
> Version: 1.0.0

## Purpose

Coordinate multi-agent design reviews by gathering structured feedback from relevant specialists based on the deliverable type. Ensures comprehensive quality validation through multiple expert perspectives while maintaining clear synthesis of feedback for actionable improvements.

## Context

Design reviews in the Design Squad involve multiple specialists providing feedback from their domain expertise:

| Deliverable Type | Review Participants |
|-----------------|---------------------|
| Brand Strategy | @marty-neumeier (lead), @chris-do (business viability) |
| Logo Design | @aaron-draplin (lead), @marty-neumeier (strategy alignment) |
| Design System | @brad-frost (lead), @dave-malouf (scalability) |
| Thumbnail | @paddy-galloway (lead), @peter-mckinnon (visual quality) |
| Photography | @joe-mcnally (lead), @peter-mckinnon (post-production) |
| Editing Work | @peter-mckinnon (lead), @joe-mcnally (lighting/capture quality) |

Design Chief orchestrates the review process, synthesizes feedback, and facilitates resolution of conflicting opinions.

## Prerequisites

- Active Design Chief context
- Deliverable ready for review (completed by specialist)
- Access to original project brief and success criteria
- Review participants identified based on deliverable type

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| deliverable | object | Yes | The work being reviewed (files, links, description) |
| deliverable_type | string | Yes | Type: brand, logo, system, thumbnail, photo, edit |
| project_context | object | Yes | Original brief, constraints, success criteria |
| creating_specialist | string | Yes | Agent who created the deliverable |
| review_depth | string | No | quick, standard, comprehensive (default: standard) |

## Workflow

### Phase 1: Review Setup

**Step 1.1: Validate Review Readiness**

Check deliverable completeness:
```yaml
completeness_check:
  - deliverable_files_accessible: true
  - original_brief_available: true
  - success_criteria_defined: true
  - creating_specialist_identified: true
```

- Validation: All readiness checks pass

**Step 1.2: Identify Review Participants**

Based on deliverable type, select reviewers:

```yaml
review_matrix:
  brand_strategy:
    lead_reviewer: "@marty-neumeier"
    secondary_reviewers:
      - agent: "@chris-do"
        focus: "Business viability and market positioning"
    optional_reviewers:
      - agent: "@dave-malouf"
        focus: "Operational implications"
        condition: "If strategy affects team structure"

  logo_design:
    lead_reviewer: "@aaron-draplin"
    secondary_reviewers:
      - agent: "@marty-neumeier"
        focus: "Brand strategy alignment"
    optional_reviewers:
      - agent: "@brad-frost"
        focus: "System integration potential"
        condition: "If design system exists or planned"

  design_system:
    lead_reviewer: "@brad-frost"
    secondary_reviewers:
      - agent: "@dave-malouf"
        focus: "Scalability and team adoption"
    optional_reviewers:
      - agent: "@aaron-draplin"
        focus: "Visual consistency with brand"
        condition: "If brand identity exists"

  thumbnail:
    lead_reviewer: "@paddy-galloway"
    secondary_reviewers:
      - agent: "@peter-mckinnon"
        focus: "Visual quality and editing"
    optional_reviewers: []

  photography:
    lead_reviewer: "@joe-mcnally"
    secondary_reviewers:
      - agent: "@peter-mckinnon"
        focus: "Post-production potential"
    optional_reviewers: []

  photo_video_edit:
    lead_reviewer: "@peter-mckinnon"
    secondary_reviewers:
      - agent: "@joe-mcnally"
        focus: "Capture quality assessment"
        condition: "If reviewing edited photos"
      - agent: "@paddy-galloway"
        focus: "CTR potential"
        condition: "If YouTube thumbnail"
    optional_reviewers: []
```

- Validation: At least 2 reviewers identified

**Step 1.3: Prepare Review Brief**

Create standardized review brief for all participants:

```yaml
review_brief:
  project:
    name: "{Project name}"
    type: "{Deliverable type}"
    created_by: "@{creating_specialist}"

  context:
    original_request: "{User's original request}"
    success_criteria:
      - "{Criterion 1}"
      - "{Criterion 2}"
    constraints:
      timeline: "{If applicable}"
      technical: "{If applicable}"
      brand: "{If applicable}"

  deliverable:
    description: "{What is being reviewed}"
    files:
      - "{File/link 1}"
      - "{File/link 2}"
    key_decisions: "{Major decisions made during creation}"

  review_focus:
    lead: "{Specific focus for lead reviewer}"
    secondary: "{Specific focus for secondary reviewers}"
```

- Validation: Review brief complete

**Step 1.4: Set Review Parameters**

```yaml
review_parameters:
  quick:
    lead_review: true
    secondary_reviews: 1
    depth: "High-level pass/fail with key issues"
    timeout: "15 minutes"

  standard:
    lead_review: true
    secondary_reviews: 2
    depth: "Detailed feedback with improvement suggestions"
    timeout: "30 minutes"

  comprehensive:
    lead_review: true
    secondary_reviews: "all"
    optional_reviews: true
    depth: "Exhaustive review with alternative approaches"
    timeout: "60 minutes"
```

- Validation: Parameters set based on review_depth input

### Phase 2: Lead Review

**Step 2.1: Activate Lead Reviewer**

Transfer context to lead reviewer:
```yaml
lead_review_request:
  role: "LEAD_REVIEWER"
  deliverable: "{Deliverable reference}"
  brief: "{Review brief}"
  focus_areas:
    - "Overall quality against success criteria"
    - "Domain-specific excellence"
    - "Alignment with best practices"
    - "Critical issues that block approval"
```

- Validation: Lead reviewer activated

**Step 2.2: Collect Lead Review**

Lead reviewer provides structured feedback:

```yaml
lead_review_structure:
  overall_assessment:
    status: "APPROVED | APPROVED_WITH_NOTES | NEEDS_REVISION | REJECTED"
    confidence: 1-10
    summary: "{One paragraph assessment}"

  success_criteria_evaluation:
    - criterion: "{Criterion 1}"
      met: true|false
      notes: "{Why/why not}"
    - criterion: "{Criterion 2}"
      met: true|false
      notes: "{Why/why not}"

  domain_specific_feedback:
    strengths:
      - "{Strength 1}"
      - "{Strength 2}"
    areas_for_improvement:
      - area: "{Issue 1}"
        severity: "critical | major | minor"
        suggestion: "{How to fix}"
      - area: "{Issue 2}"
        severity: "critical | major | minor"
        suggestion: "{How to fix}"

  best_practice_alignment:
    aligned:
      - "{Practice followed}"
    gaps:
      - "{Practice missed}"

  blocking_issues:
    - "{If any critical issues that prevent approval}"

  recommendation: "{Final recommendation with reasoning}"
```

- Validation: Lead review complete with all sections

### Phase 3: Secondary Reviews

**Step 3.1: Distribute to Secondary Reviewers**

For each secondary reviewer (parallel if possible):

```yaml
secondary_review_request:
  role: "SECONDARY_REVIEWER"
  deliverable: "{Deliverable reference}"
  brief: "{Review brief}"
  lead_review_summary: "{Lead's overall assessment - for context only}"
  specific_focus: "{This reviewer's specific focus area}"
```

- Validation: All secondary reviewers activated

**Step 3.2: Collect Secondary Reviews**

Each secondary reviewer provides focused feedback:

```yaml
secondary_review_structure:
  focus_area: "{Reviewer's assigned focus}"
  assessment:
    status: "ENDORSED | CONCERNS | DISAGREE"
    notes: "{Assessment within focus area}"

  specific_feedback:
    observations:
      - "{Observation 1}"
      - "{Observation 2}"
    concerns:
      - concern: "{If any}"
        severity: "critical | major | minor"
        suggestion: "{How to address}"

  agreement_with_lead:
    agrees: true|false
    notes: "{If disagrees, explain why}"

  additional_perspective: "{Unique insight from this specialist's domain}"
```

- Validation: All secondary reviews collected

### Phase 4: Optional Reviews (Comprehensive Only)

**Step 4.1: Activate Optional Reviewers**

If review_depth is "comprehensive" and conditions are met:

```yaml
optional_review_request:
  role: "OPTIONAL_REVIEWER"
  condition_met: "{Why this reviewer was included}"
  deliverable: "{Deliverable reference}"
  brief: "{Review brief}"
  specific_focus: "{This reviewer's edge case focus}"
```

- Validation: Optional reviewers activated if applicable

**Step 4.2: Collect Optional Reviews**

Same structure as secondary reviews but marked as optional:

```yaml
optional_review_structure:
  # Same as secondary_review_structure
  review_type: "optional"
  value_added: "{What unique perspective this adds}"
```

- Validation: Optional reviews collected

### Phase 5: Feedback Synthesis

**Step 5.1: Consolidate All Feedback**

Merge all reviews into unified structure:

```yaml
consolidated_feedback:
  review_metadata:
    deliverable_type: "{Type}"
    review_depth: "{quick|standard|comprehensive}"
    total_reviewers: 3
    review_duration: "25 minutes"

  reviews_collected:
    lead:
      reviewer: "@{lead}"
      status: "{Status}"
      blocking_issues: 0
    secondary:
      - reviewer: "@{secondary_1}"
        focus: "{Focus}"
        status: "{Status}"
      - reviewer: "@{secondary_2}"
        focus: "{Focus}"
        status: "{Status}"
    optional:
      - reviewer: "@{optional_1}"
        focus: "{Focus}"
        status: "{Status}"
```

- Validation: All feedback consolidated

**Step 5.2: Identify Consensus and Conflicts**

```yaml
consensus_analysis:
  unanimous_approval: true|false
  consensus_areas:
    - area: "{Area where all agree}"
      sentiment: "positive | negative | neutral"
  conflict_areas:
    - area: "{Area of disagreement}"
      position_a:
        holders: ["@agent1"]
        stance: "{Their position}"
      position_b:
        holders: ["@agent2"]
        stance: "{Their position}"
      resolution_needed: true|false
```

- Validation: Consensus and conflicts identified

**Step 5.3: Prioritize Issues**

```yaml
issue_prioritization:
  critical:  # Must fix before approval
    - issue: "{Issue}"
      raised_by: ["@agent1", "@agent2"]
      consensus: true
  major:  # Should fix, can be post-approval
    - issue: "{Issue}"
      raised_by: ["@agent1"]
      consensus: false
  minor:  # Nice to have improvements
    - issue: "{Issue}"
      raised_by: ["@agent2"]
      consensus: false
```

- Validation: Issues prioritized by severity

### Phase 6: Conflict Resolution (If Needed)

**Step 6.1: Identify Unresolved Conflicts**

```yaml
unresolved_conflicts:
  - conflict_id: 1
    area: "{What the conflict is about}"
    parties:
      - agent: "@agent1"
        position: "{Their stance}"
        reasoning: "{Why they hold this view}"
      - agent: "@agent2"
        position: "{Their stance}"
        reasoning: "{Why they hold this view}"
```

- Validation: Conflicts documented

**Step 6.2: Design Chief Mediation**

For each conflict, Design Chief facilitates resolution:

```yaml
mediation_approach:
  defer_to_lead: true  # Default: lead reviewer has final say
  escalate_to_user: false  # Ask user to decide
  synthesis: false  # Find middle ground

resolution_template:
  conflict_id: 1
  resolution_method: "defer_to_lead"
  final_decision: "{What was decided}"
  rationale: "{Why this resolution}"
  dissent_noted: true  # Record minority opinion
```

- Validation: All conflicts resolved

**Step 6.3: Escalate to User (If Needed)**

For conflicts that cannot be resolved internally:

```
Os revisores tem perspectivas diferentes sobre [{area}]:

**Posicao 1** (@{agent1}):
{Their stance and reasoning}

**Posicao 2** (@{agent2}):
{Their stance and reasoning}

**Minha recomendacao:** {Design Chief's recommendation}

Como voce gostaria de proceder?
```

- Validation: User decision received

### Phase 7: Review Report Generation

**Step 7.1: Generate Executive Summary**

```yaml
executive_summary:
  overall_status: "APPROVED | APPROVED_WITH_NOTES | NEEDS_REVISION | REJECTED"
  confidence_score: 8.5  # Average of all reviewers
  summary: "{2-3 sentence summary}"
  key_strengths:
    - "{Strength 1}"
    - "{Strength 2}"
  key_improvements:
    - "{Improvement 1}"
    - "{Improvement 2}"
  next_steps: "{What should happen next}"
```

- Validation: Executive summary generated

**Step 7.2: Generate Detailed Report**

```yaml
detailed_review_report:
  metadata:
    deliverable: "{Name/type}"
    created_by: "@{creating_specialist}"
    reviewed: "{ISO timestamp}"
    review_depth: "{quick|standard|comprehensive}"

  executive_summary: "{From Step 7.1}"

  success_criteria_status:
    - criterion: "{Criterion 1}"
      status: "MET | PARTIALLY_MET | NOT_MET"
      evidence: "{Supporting observation}"

  reviewer_feedback:
    lead:
      reviewer: "@{lead}"
      full_assessment: "{Complete lead review}"
    secondary:
      - reviewer: "@{secondary}"
        focus: "{Focus area}"
        assessment: "{Complete secondary review}"

  issue_summary:
    critical:
      count: 0
      items: []
    major:
      count: 2
      items:
        - "{Issue 1}"
        - "{Issue 2}"
    minor:
      count: 3
      items:
        - "{Issue 1}"
        - "{Issue 2}"
        - "{Issue 3}"

  conflict_resolutions:
    - conflict: "{What was in conflict}"
      resolution: "{How resolved}"
      method: "{defer_to_lead|escalate|synthesis}"

  recommendations:
    immediate:
      - "{Action 1}"
    post_approval:
      - "{Action 2}"
    future_consideration:
      - "{Action 3}"
```

- Validation: Detailed report generated

**Step 7.3: Create Revision Checklist (If Needed)**

If status is NEEDS_REVISION:

```yaml
revision_checklist:
  - item: "{What needs to be fixed}"
    priority: "critical"
    assigned_to: "@{creating_specialist}"
    guidance: "{How to fix}"
  - item: "{What needs to be fixed}"
    priority: "major"
    assigned_to: "@{creating_specialist}"
    guidance: "{How to fix}"
```

- Validation: Revision checklist created if applicable

### Phase 8: Handoff

**Step 8.1: Communicate Results**

Present review results to user and creating specialist:

```
## Review Complete: {Deliverable Name}

**Status:** {APPROVED | APPROVED_WITH_NOTES | NEEDS_REVISION}
**Reviewers:** @{lead}, @{secondary1}, @{secondary2}
**Confidence:** {Score}/10

### Key Findings

**Strengths:**
{Bullet list of strengths}

**Areas for Improvement:**
{Bullet list with severity}

### Next Steps

{What happens now based on status}

{If NEEDS_REVISION: Include revision checklist}
{If APPROVED_WITH_NOTES: Include notes for future iterations}
```

- Validation: Results communicated

**Step 8.2: Update Session State**

```yaml
session_update:
  review_completed: true
  deliverable: "{Name}"
  final_status: "{Status}"
  revision_required: true|false
  next_action: "{What happens next}"
```

- Validation: Session state updated

**Step 8.3: Initiate Re-Review Loop (If Needed)**

If NEEDS_REVISION:
- Track revision status
- Schedule re-review after revisions
- Validation: Re-review scheduled

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| review_report | object | Complete multi-agent review report |
| executive_summary | object | High-level status and key findings |
| revision_checklist | array | Items to fix (if NEEDS_REVISION) |
| consensus_analysis | object | Areas of agreement and conflict |

### Output Format

```yaml
review_orchestration_result:
  status: "APPROVED_WITH_NOTES"
  confidence: 8.5

  executive_summary:
    summary: "Logo meets brand strategy requirements with strong visual identity. Minor refinements suggested for digital applications."
    strengths: ["Memorable mark", "Strong brand alignment", "Versatile applications"]
    improvements: ["Digital favicon variant", "Animation guidelines"]

  review_participation:
    lead: "@aaron-draplin"
    secondary: ["@marty-neumeier"]
    optional: []

  issues:
    critical: 0
    major: 1
    minor: 2

  conflicts_resolved: 0

  next_steps: "Proceed with design system integration after minor refinements"
```

## Completion Criteria

- [ ] All required reviewers participated
- [ ] Lead review complete with all sections
- [ ] Secondary reviews collected and synthesized
- [ ] Conflicts identified and resolved
- [ ] Issues prioritized by severity
- [ ] Executive summary generated
- [ ] Detailed report created
- [ ] Revision checklist created (if NEEDS_REVISION)
- [ ] Results communicated to user and creating specialist
- [ ] Session state updated

## Error Handling

| Error | Recovery |
|-------|----------|
| Reviewer unavailable | Use alternate from same domain or skip optional |
| Conflicting schedules | Sequential review instead of parallel |
| Incomplete deliverable | Request missing components from creator |
| Irreconcilable conflict | Escalate to user for decision |
| Review timeout | Extend deadline or proceed with available reviews |

## Security Considerations

- Only involve relevant specialists (need-to-know basis)
- Maintain objectivity - creator does not review own work
- Document all decisions for audit trail
- Protect client confidential information in review process

## Examples

### Example 1: Logo Design Standard Review

**Input:**
```yaml
deliverable_type: "logo"
creating_specialist: "@aaron-draplin"
review_depth: "standard"
```

**Review Flow:**
1. Lead: @aaron-draplin reviews technical execution
2. Secondary: @marty-neumeier reviews brand alignment
3. Synthesis: Design Chief consolidates feedback

**Output:**
```
## Review Complete: FinTech Startup Logo

**Status:** APPROVED_WITH_NOTES
**Reviewers:** @aaron-draplin (lead), @marty-neumeier
**Confidence:** 8.5/10

### Key Findings

**Strengths:**
- Strong, bold mark that conveys trust
- Works at all sizes from favicon to billboard
- Clear brand personality expression

**Areas for Improvement:**
- Minor: Add monochrome variant for legal documents
- Minor: Create animated version for digital touchpoints

### Next Steps

Logo approved for production use. Consider creating system variants during design system phase with @brad-frost.
```

### Example 2: Design System Comprehensive Review

**Input:**
```yaml
deliverable_type: "design_system"
creating_specialist: "@brad-frost"
review_depth: "comprehensive"
```

**Review Flow:**
1. Lead: @brad-frost reviews Atomic Design compliance
2. Secondary: @dave-malouf reviews team scalability
3. Optional: @aaron-draplin reviews brand consistency
4. Conflict: @dave-malouf and @brad-frost disagree on token naming
5. Resolution: Defer to lead (Brad Frost)

**Output:**
```
## Review Complete: Design System v1.0

**Status:** APPROVED_WITH_NOTES
**Reviewers:** @brad-frost (lead), @dave-malouf, @aaron-draplin
**Confidence:** 9.0/10

### Key Findings

**Strengths:**
- Comprehensive token system covering all primitives
- Clear Atomic Design hierarchy (atoms -> molecules -> organisms)
- Excellent documentation and usage examples

**Areas for Improvement:**
- Major: Add migration guide for legacy components
- Minor: Consider semantic token aliases for ease of adoption

### Conflict Resolution

Token naming convention: Followed @brad-frost recommendation for `{category}-{property}-{variant}` pattern over @dave-malouf's `{property}-{category}-{variant}` preference. Rationale: Aligns with industry standard (Style Dictionary, Figma Tokens).

### Next Steps

System approved for pilot adoption. Schedule @dave-malouf session for team onboarding and governance setup.
```

## Notes

- Review depth should match project importance (quick for iterations, comprehensive for launches)
- Lead reviewer's assessment carries most weight in synthesis
- Design Chief facilitates but does not impose opinions
- Conflict resolution defaults to lead reviewer unless user escalation
- Re-review should be faster (focus on revision items only)

## Related Tasks

- `design-triage.md` - Initial request routing
- `design-handoff-checklist.md` - Handoff validation between agents

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-02 | Initial task definition for Design Chief |
