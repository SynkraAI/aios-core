# Brand Portfolio Strategy

> Task ID: brand-portfolio-strategy
> Agent: Marty Neumeier (Brand Strategy Pioneer)
> Version: 1.0.0

## Description

Structure brand architecture using Neumeier's approach to brand portfolio management. Determine the optimal structure: branded house (one master brand), house of brands (independent brands), endorsed brands (sub-brands with parent connection), or hybrid approaches. This task protects brand charisma while enabling growth.

## Prerequisites

- Understanding of current brand structure
- List of all brands, sub-brands, and products
- Business growth strategy and objectives
- Knowledge of target tribes for each brand/product

## Workflow

### Interactive Elicitation

1. **Gather Portfolio Context**
   - Ask for list of all brands and products
   - Request current architecture description
   - Identify business growth plans
   - Understand resource constraints

2. **Map Current State**
   - Document existing relationships
   - Identify confusion points
   - Note brand overlap or conflict

3. **Confirm Scope**
   - Show portfolio analysis plan
   - Confirm decision criteria
   - Begin architecture evaluation

### Steps

#### Phase 1: Portfolio Audit

1. **Inventory All Brands**
   - List all brand entities (master brand, sub-brands, product names)
   - Document current relationships
   - Map to business units/products
   - Validation: Complete brand inventory

2. **Assess Brand Strength**
   - Evaluate awareness for each brand
   - Assess charisma score (from charisma audit)
   - Measure customer loyalty
   - Validation: Strength metrics documented

3. **Map Tribe Overlap**
   - Identify target tribe for each brand
   - Document tribe overlap/conflict
   - Note where tribes differ significantly
   - Validation: Tribe analysis complete

4. **Evaluate Brand Relationships**
   - How do customers perceive connections?
   - Is parent brand helping or hurting sub-brands?
   - Are there confusing overlaps?
   - Validation: Relationship health assessed

#### Phase 2: Architecture Options

5. **Option 1: Branded House**
   - Definition: One master brand, descriptive sub-names
   - Example: Google (Google Search, Google Maps, Google Docs)
   - Pros: Efficiency, brand equity leverage, clarity
   - Cons: Risk concentration, limited positioning flexibility
   - Best when: Master brand is strong and charismatic

6. **Option 2: House of Brands**
   - Definition: Independent brands, parent hidden or minimal
   - Example: P&G (Tide, Pampers, Gillette - different brands)
   - Pros: Positioning flexibility, risk isolation, M&A flexibility
   - Cons: Higher marketing costs, no equity leverage
   - Best when: Products serve very different tribes

7. **Option 3: Endorsed Brands**
   - Definition: Sub-brands with visible parent endorsement
   - Example: Marriott (Marriott Courtyard, Marriott Residence Inn)
   - Pros: Independence + credibility, flexible positioning
   - Cons: Complexity, unclear when to use
   - Best when: Sub-brands need credibility boost

8. **Option 4: Hybrid**
   - Definition: Mix of approaches for different products
   - Example: Apple (branded house for hardware, house of brands for services)
   - Pros: Optimized per situation
   - Cons: Complexity, harder to manage
   - Best when: Portfolio is diverse with different needs

#### Phase 3: Architecture Decision

9. **Apply Decision Framework**
   - Key questions:
     - How strong is the master brand?
     - How different are the target tribes?
     - How different are the positioning needs?
     - What's the M&A strategy?
     - What are the resource constraints?
   - Validation: All questions answered

10. **Score Architecture Options**
    - Rate each option on:
      - Tribe clarity (does each brand serve a clear tribe?)
      - Efficiency (can we leverage marketing investment?)
      - Flexibility (can we grow and adapt?)
      - Risk management (is failure isolated?)
      - Charisma potential (can each brand be charismatic?)
    - Validation: Options scored

11. **Select Architecture**
    - Choose primary architecture model
    - Document rationale
    - Identify exceptions/special cases
    - Validation: Architecture selected

#### Phase 4: Implementation

12. **Define Brand Roles**
    - Master brand role and scope
    - Sub-brand roles and boundaries
    - Product naming conventions
    - Validation: Roles documented

13. **Create Hierarchy Rules**
    - Visual hierarchy (logo relationships)
    - Verbal hierarchy (naming conventions)
    - Communication rules (when to use what)
    - Validation: Rules established

14. **Design Governance**
    - Who approves new brands/sub-brands?
    - What criteria for brand creation vs product name?
    - How to sunset declining brands?
    - Validation: Governance model defined

15. **Plan Transition**
    - If changing architecture, define migration path
    - Prioritize changes by impact
    - Set timeline
    - Validation: Transition plan complete

16. **Generate Portfolio Strategy Document**
    - Compile architecture decision
    - Document all rules and governance
    - Provide implementation roadmap
    - Validation: Strategy document complete

## Output

- **brand-portfolio-audit.yaml**: Current state assessment
- **architecture-decision.md**: Selected architecture with rationale
- **brand-hierarchy.yaml**: Defined roles and relationships
- **portfolio-governance.md**: Rules and decision criteria
- **portfolio-transition-plan.md**: Migration roadmap (if needed)

### Output Format

```yaml
brand_portfolio_strategy:
  company: "TechCorp"
  analysis_date: "2026-02-02"
  analyst: "Marty Neumeier"

  current_state:
    portfolio_inventory:
      master_brand: "TechCorp"
      sub_brands:
        - name: "TechCorp Pro"
          target: "Enterprise"
          relationship: "Descriptive sub-brand"
          charisma_score: 12

        - name: "TechCorp Lite"
          target: "SMB"
          relationship: "Descriptive sub-brand"
          charisma_score: 10

        - name: "Workflow.io"
          target: "Freelancers"
          relationship: "Separate brand (acquired)"
          charisma_score: 18

        - name: "DataSync"
          target: "Developers"
          relationship: "Product name"
          charisma_score: 8

    issues_identified:
      - "TechCorp brand is weak (low charisma)"
      - "Workflow.io acquisition created confusion"
      - "Too many products under umbrella brand"
      - "Tribes are very different (enterprise vs freelancer)"

  tribe_analysis:
    techcorp_pro_tribe:
      description: "Enterprise IT decision makers"
      values: "Security, reliability, vendor stability"
      overlap_with_other_brands: "Low"

    techcorp_lite_tribe:
      description: "SMB owners/managers"
      values: "Simplicity, value, self-service"
      overlap_with_other_brands: "Medium with Pro"

    workflow_io_tribe:
      description: "Creative freelancers"
      values: "Independence, design, flexibility"
      overlap_with_other_brands: "Very low"

  architecture_evaluation:
    branded_house:
      score: 2
      rationale: "Master brand not strong enough, tribes too different"

    house_of_brands:
      score: 4
      rationale: "Tribes are different, Workflow.io already has charisma"

    endorsed_brands:
      score: 3
      rationale: "Could work but adds complexity, parent brand weak"

    hybrid:
      score: 4
      rationale: "Best fit - keep Workflow.io separate, consolidate others"

  architecture_decision:
    selected: "Hybrid"
    structure:
      brand_group_1:
        type: "Branded House"
        master: "TechCorp"
        includes:
          - "TechCorp Pro"
          - "TechCorp Lite"
          - "DataSync (as TechCorp DataSync)"
        target: "Business users (enterprise to SMB)"
        rationale: "Consolidate business-focused products under master brand"

      brand_group_2:
        type: "House of Brands (Independent)"
        brand: "Workflow.io"
        parent_visibility: "None/Minimal"
        target: "Creative freelancers"
        rationale: "Different tribe, existing charisma, protect positioning"

    rationale: |
      The portfolio requires a hybrid approach because:
      1. TechCorp serves business users - consolidation makes sense
      2. Workflow.io serves a completely different tribe (creatives)
      3. Workflow.io already has brand charisma - don't dilute it
      4. TechCorp brand needs strengthening - focus resources

  brand_roles:
    techcorp:
      role: "Master brand for business productivity"
      scope: "All B2B/SMB products"
      charisma_goal: "Build from 12 to 20"

    workflow_io:
      role: "Independent brand for creative professionals"
      scope: "Freelancer/creative market"
      charisma_goal: "Maintain 18+, grow to 22"

  hierarchy_rules:
    naming_convention:
      new_business_products: "TechCorp [Product Name]"
      new_creative_products: "Workflow.io [Feature Name] or new brand"

    visual_hierarchy:
      techcorp_products: "TechCorp logo primary, product name secondary"
      workflow_io: "Workflow.io logo only, no TechCorp reference"

    communication_rules:
      - "Never mix TechCorp and Workflow.io in same marketing"
      - "Workflow.io can reference 'backed by TechCorp resources' in investor contexts only"
      - "Customer-facing: keep brands completely separate"

  governance:
    new_brand_criteria:
      - "Serves fundamentally different tribe than existing brands"
      - "Requires different positioning than possible under existing brand"
      - "Has charisma potential score of 15+"

    brand_creation_authority: "Brand Council (CMO, CEO, Product Lead)"
    review_frequency: "Quarterly portfolio review"

    sunset_criteria:
      - "Charisma score below 10 for 2 years"
      - "Tribe no longer exists or viable"
      - "Strategic decision to consolidate"

  transition_plan:
    phase_1:
      duration: "Q2 2026"
      actions:
        - "Rename DataSync to TechCorp DataSync"
        - "Update all collateral for consistency"
        - "Align visual identity across TechCorp products"

    phase_2:
      duration: "Q3 2026"
      actions:
        - "Launch brand strengthening campaign for TechCorp"
        - "Ensure Workflow.io remains clearly differentiated"
        - "Update website architecture to reflect brand structure"

    phase_3:
      duration: "Q4 2026"
      actions:
        - "Measure brand metrics post-change"
        - "Adjust based on tribe feedback"
        - "Document learnings for governance"

  success_metrics:
    techcorp_charisma_score:
      baseline: 12
      target: 18
      timeline: "12 months"

    workflow_io_charisma_score:
      baseline: 18
      target: 20
      timeline: "12 months"

    brand_confusion_reduction:
      baseline: "35% of customers confused"
      target: "Less than 10% confused"
      timeline: "12 months"
```

## Success Criteria

- [ ] Complete brand inventory documented
- [ ] All brands assessed for strength/charisma
- [ ] Tribe overlap/conflict analyzed
- [ ] Architecture options evaluated with scores
- [ ] Architecture selected with clear rationale
- [ ] Brand roles and hierarchy defined
- [ ] Governance model established
- [ ] Transition plan created (if needed)

## Error Handling

- **Existing brands conflict badly**: May need to sunset or rebrand
- **M&A adds conflicting brand**: Evaluate integration vs independence
- **Resources insufficient for house of brands**: Consolidate to branded house
- **Master brand too weak for branded house**: Strengthen before consolidating

## Architecture Decision Matrix

| Factor | Branded House | House of Brands | Endorsed | Hybrid |
|--------|---------------|-----------------|----------|--------|
| Master brand strong? | Required | Not needed | Helpful | Mixed |
| Tribes different? | No | Yes | Somewhat | Mixed |
| Resource constrained? | Best choice | Expensive | Medium | Flexible |
| M&A active? | Harder | Easier | Medium | Flexible |
| Risk tolerance? | Higher risk | Lower risk | Medium | Flexible |

## Security Considerations

- Protect strategic brand decisions until announced
- M&A-related architecture changes require confidentiality
- Competitive intelligence on portfolio structure should be limited
- Brand governance decisions involve sensitive business strategy

## Neumeier Principles Applied

- **"Focus is the hallmark of a powerful brand."** - Each brand needs clear tribe
- **"If you're not the only, you're not memorable."** - Don't dilute charisma with over-extension
- **"A charismatic brand is any brand for which people believe there's no substitute."** - Protect charismatic brands
- **"Brands are built by tribes, not demographics."** - Architecture follows tribe structure

## Examples

### Example 1: Branded House (Strong Master)

```
Scenario: Strong master brand, related products, similar tribe

DECISION: Branded House
- Virgin Atlantic, Virgin Mobile, Virgin Media
- All leverage Richard Branson's Virgin brand
- Same rebellious tribe across categories
- Efficient marketing spend
```

### Example 2: House of Brands (Different Tribes)

```
Scenario: Very different tribes, different positioning needs

DECISION: House of Brands
- P&G: Tide, Pampers, Gillette
- Completely different buyers
- Different emotional positioning
- Risk isolation if one brand fails
```

### Example 3: Endorsed Brands (Need Credibility)

```
Scenario: New brands need parent credibility

DECISION: Endorsed Brands
- Marriott Courtyard, Marriott Residence Inn
- Sub-brands have own identity
- Marriott endorsement provides trust
- Allows premium vs value positioning
```

## Notes

- Brand architecture should serve business strategy, not vice versa
- Charismatic brands should generally be protected from dilution
- Architecture changes are expensive - decide thoughtfully
- Re-evaluate architecture when tribes change or M&A occurs
- Run this after completing brand-differentiation for each brand
- Use brand-charisma-audit scores as input to architecture decisions
