# Brand Gap Analysis

> Task ID: brand-gap-analysis
> Agent: Marty Neumeier (Brand Strategy Pioneer)
> Version: 1.0.0

## Description

Analyze the gap between company strategy and customer experience using Neumeier's Brand Gap framework. The brand gap is the dangerous chasm between left-brain strategy and right-brain creativity. This task identifies where strategy and execution disconnect and provides a bridge plan.

## Prerequisites

- Access to brand strategy documents (positioning, mission, values)
- Access to customer experience touchpoints (website, product, communications)
- Stakeholder input on brand promise vs delivery
- Competitor context for comparison

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to gather brand context.

1. **Gather Brand Context**
   - Ask for brand name and category
   - Request existing brand strategy documents
   - Identify key customer touchpoints to audit
   - Understand current business challenges

2. **Validate Inputs**
   - Confirm strategy documentation exists
   - Verify access to customer-facing materials
   - Check for internal alignment data (surveys, interviews)

3. **Confirm Scope**
   - Show analysis plan summary
   - Confirm which touchpoints to evaluate
   - Begin gap diagnosis

### Steps

1. **Document Current Strategy**
   - Extract stated positioning from strategy docs
   - Identify mission, vision, values
   - Map stated brand promise
   - Document target audience definition
   - Validation: Strategy is documented and clear

2. **Audit Customer Experience**
   - Review visual identity vs verbal positioning
   - Analyze marketing vs product experience
   - Compare internal culture vs external brand
   - Evaluate promise vs actual delivery
   - Validation: All major touchpoints reviewed

3. **Diagnose Gap Symptoms**
   - Identify disconnects between strategy and execution
   - Document specific gap manifestations:
     - Mission statement that no one can remember
     - Visual identity that doesn't match brand promise
     - Customer experience that contradicts marketing
     - Internal culture disconnected from external brand
   - Validation: Gaps clearly identified with evidence

4. **Measure Gap Severity**
   - Rate each gap on 1-5 scale (1=aligned, 5=severe disconnect)
   - Calculate overall brand gap score
   - Prioritize gaps by impact on customer perception
   - Validation: Quantified gap assessment complete

5. **Create Bridge Plan**
   - Define alignment mechanisms for each gap
   - Recommend tools: visual brand briefs, experience prototypes, cross-functional workshops
   - Set timeline for closing each gap
   - Assign ownership for bridge initiatives
   - Validation: Actionable bridge plan documented

6. **Design Validation Approach**
   - Define metrics to track gap closure
   - Establish feedback loops (customer research, internal surveys, mystery shopping)
   - Create monitoring schedule
   - Validation: Measurement plan in place

7. **Generate Gap Report**
   - Create comprehensive Brand Gap Audit document
   - Include all findings with evidence
   - Present bridge plan with priorities
   - Define success metrics
   - Validation: Report complete and actionable

## Output

- **brand-gap-audit.md**: Comprehensive gap analysis with findings and bridge plan
- **gap-scorecard.yaml**: Quantified gap metrics by category
- **bridge-plan.md**: Detailed action plan for closing identified gaps

### Output Format

```yaml
brand_gap_audit:
  brand_name: "Example Brand"
  audit_date: "2026-02-02"
  analyst: "Marty Neumeier"

  strategy_documented:
    positioning: "Description of stated positioning"
    mission: "Mission statement"
    vision: "Vision statement"
    values:
      - value_1
      - value_2
    promise: "Core brand promise"
    target: "Target audience definition"

  gaps_identified:
    - category: "Visual vs Verbal"
      strategy_says: "Premium, sophisticated"
      experience_delivers: "Generic, corporate"
      gap_severity: 4
      evidence: "Homepage uses stock imagery, generic messaging"

    - category: "Promise vs Delivery"
      strategy_says: "Exceptional customer service"
      experience_delivers: "Automated responses, long wait times"
      gap_severity: 5
      evidence: "Customer reviews cite poor support"

    - category: "Internal vs External"
      strategy_says: "Innovation-driven culture"
      experience_delivers: "Risk-averse decisions"
      gap_severity: 3
      evidence: "Employee survey shows frustration with bureaucracy"

  overall_gap_score: 4.0

  bridge_plan:
    priority_1:
      gap: "Promise vs Delivery"
      action: "Customer service overhaul"
      owner: "CX Lead"
      timeline: "Q2 2026"
      tools:
        - "Experience prototypes"
        - "Service design workshop"

    priority_2:
      gap: "Visual vs Verbal"
      action: "Brand refresh project"
      owner: "Creative Director"
      timeline: "Q3 2026"
      tools:
        - "Visual brand brief"
        - "Photography direction"

  validation_metrics:
    - metric: "Brand consistency score"
      baseline: 45
      target: 80

    - metric: "Customer NPS"
      baseline: 32
      target: 50
```

## Success Criteria

- [ ] Current strategy clearly documented
- [ ] All major touchpoints audited
- [ ] Gaps identified with specific evidence
- [ ] Gap severity quantified (1-5 scale)
- [ ] Bridge plan includes actions, owners, and timelines
- [ ] Validation metrics defined

## Error Handling

- **No strategy documentation exists**: Facilitate strategy articulation session first
- **Limited touchpoint access**: Document accessible touchpoints, flag gaps in audit
- **Stakeholder disagreement on gaps**: Document different perspectives, recommend alignment workshop
- **Insufficient evidence**: Mark gaps as "suspected" and recommend research

## Security Considerations

- Handle confidential strategy documents appropriately
- Protect customer data used in experience audit
- Secure storage of competitive intelligence
- Limit report distribution to authorized stakeholders

## Neumeier Principles Applied

- **"Strategy without creativity is dead. Creativity without strategy is art."** - This audit bridges both sides
- **"The brand gap is the distance between business strategy and customer experience."** - Core diagnostic framework
- **"A brand is not what YOU say it is. It's what THEY say it is."** - Focus on customer perception, not company intention

## Examples

### Example 1: Tech Startup Gap Analysis

```
Brand: TechFlow
Category: B2B SaaS

STRATEGY SAYS:
- "Human-centered, intuitive software"
- "Innovation that simplifies"

EXPERIENCE DELIVERS:
- Complex onboarding (7+ steps)
- Technical jargon in UI
- No human support option

GAP IDENTIFIED:
- Severity: 4/5
- Bridge needed: UX redesign, content strategy, support model

BRIDGE PLAN:
1. Simplify onboarding (reduce to 3 steps)
2. Plain language audit of all UI copy
3. Add human chat support option
```

### Example 2: Retail Brand Gap Analysis

```
Brand: Heritage Home
Category: Home Furnishings

STRATEGY SAYS:
- "Sustainable, artisanal quality"
- "Stories behind every piece"

EXPERIENCE DELIVERS:
- No sustainability info on products
- Mass-market photography style
- Generic product descriptions

GAP IDENTIFIED:
- Severity: 4/5
- Bridge needed: Product storytelling, visual refresh, sustainability transparency

BRIDGE PLAN:
1. Add maker stories to each product page
2. Commission artisan photography
3. Publish sustainability certifications
```

## Notes

- The Brand Gap was introduced in Neumeier's 2003 book of the same name
- This framework bridges left-brain (strategy) and right-brain (creativity)
- Gap closure is iterative - expect multiple rounds of bridge/validate
- Use this audit before major brand initiatives to establish baseline
- Recommend running every 12-18 months to prevent gap widening
- For differentiation strategy, run *brand-differentiation next
