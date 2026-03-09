# Brand Charisma Audit

> Task ID: brand-charisma-audit
> Agent: Marty Neumeier (Brand Strategy Pioneer)
> Version: 1.0.0

## Description

Evaluate a brand against the 5 pillars of charismatic brands. A charismatic brand is any brand for which people believe there's no substitute. This audit measures clarity, differentiation, authenticity, relevance, and coherence to determine if a brand has genuine charisma or is at risk of commoditization.

## Prerequisites

- Brand materials for review (website, marketing, product)
- Access to customer feedback data (reviews, surveys, NPS)
- Competitive context for comparison
- Internal stakeholder perspectives

## Workflow

### Interactive Elicitation

1. **Gather Brand Context**
   - Ask for brand name and category
   - Request access to brand materials
   - Identify available customer data
   - Understand competitive context

2. **Confirm Scope**
   - List materials to be audited
   - Confirm scoring approach
   - Begin charisma evaluation

### Steps

#### Pillar 1: Clarity (1-5)

1. **Assess Message Clarity**
   - Can you explain the brand in one sentence?
   - Does visual identity match verbal identity?
   - Is the promise clear and believable?
   - Validation: Clarity score assigned with evidence

2. **Test Brand Comprehension**
   - Would a new customer immediately understand what this brand does?
   - Are there conflicting messages across touchpoints?
   - Is the brand promise simple or convoluted?
   - Validation: Comprehension issues documented

#### Pillar 2: Differentiation (1-5)

3. **Evaluate Uniqueness**
   - Is brand radically different from competitors?
   - Would customers miss this brand if it disappeared?
   - Can competitors easily copy this brand?
   - Validation: Differentiation score assigned

4. **Test Onlyness**
   - Can you complete: "This brand is the ONLY ___ that ___"?
   - Is the differentiation meaningful or superficial?
   - Does the brand own a distinct position in customer minds?
   - Validation: Onlyness assessment complete

#### Pillar 3: Authenticity (1-5)

5. **Verify Promise Delivery**
   - Does the brand deliver on its promises?
   - Is internal culture aligned with external brand?
   - Does the brand have a clear enemy or purpose?
   - Validation: Authenticity score assigned

6. **Check Consistency**
   - Is the brand genuine across all contexts?
   - Are there gaps between what's said and what's done?
   - Do employees embody the brand?
   - Validation: Authenticity evidence documented

#### Pillar 4: Relevance (1-5)

7. **Assess Customer Fit**
   - Does the brand solve a real problem?
   - Is the brand aligned with customer identity?
   - Would customers recommend enthusiastically?
   - Validation: Relevance score assigned

8. **Evaluate Tribe Connection**
   - Does the brand serve a tribe, not just a demographic?
   - Do customers use the brand to express identity?
   - Is there emotional connection beyond function?
   - Validation: Tribe connection documented

#### Pillar 5: Coherence (1-5)

9. **Audit Touchpoint Consistency**
   - Is the experience consistent everywhere?
   - Do all touchpoints reinforce positioning?
   - Is the brand protected by guidelines?
   - Validation: Coherence score assigned

10. **Check Cross-Channel Alignment**
    - Does website match social media match product?
    - Are all team members telling the same story?
    - Is there brand governance in place?
    - Validation: Alignment assessment complete

#### Scoring and Recommendations

11. **Calculate Charisma Score**
    - Sum all pillar scores (max 25)
    - Determine charisma level:
      - 20-25: Charismatic (strong brand moat)
      - 15-19: Emerging (potential, needs work)
      - 10-14: Weak (significant gaps)
      - 0-9: Commodity (at risk of irrelevance)
    - Validation: Score calculated with evidence

12. **Identify Priority Actions**
    - Rank pillars by improvement impact
    - Document specific actions for each weak area
    - Create improvement roadmap
    - Validation: Action plan complete

13. **Generate Charisma Report**
    - Compile all findings
    - Present scorecard with evidence
    - Provide prioritized recommendations
    - Validation: Report ready for stakeholders

## Output

- **charisma-scorecard.yaml**: Quantified charisma metrics
- **charisma-audit.md**: Detailed findings with evidence
- **charisma-improvement-plan.md**: Prioritized action roadmap

### Output Format

```yaml
charisma_audit:
  brand_name: "Example Brand"
  audit_date: "2026-02-02"
  analyst: "Marty Neumeier"

  pillar_scores:

    clarity:
      score: 3
      max: 5
      questions:
        - question: "Can you explain brand in one sentence?"
          answer: "Somewhat - message is present but not crisp"
          evidence: "Tagline is 12 words, could be 5"
        - question: "Does visual identity match verbal identity?"
          answer: "Partially - colors align, but typography is inconsistent"
          evidence: "Website uses 4 different font families"
        - question: "Is promise clear and believable?"
          answer: "No - promise is generic ('best quality')"
          evidence: "Same promise used by 3 competitors"
      improvement_actions:
        - "Simplify tagline to 5 words or fewer"
        - "Consolidate typography to 2 families"
        - "Rewrite promise to be specific and provable"

    differentiation:
      score: 2
      max: 5
      questions:
        - question: "Is brand radically different from competitors?"
          answer: "No - playing in same space with same language"
          evidence: "Messaging overlaps 80% with top competitor"
        - question: "Would customers miss you if you disappeared?"
          answer: "Unlikely - substitutes readily available"
          evidence: "Low switching cost, no emotional attachment"
        - question: "Can competitors easily copy you?"
          answer: "Yes - no defensible moat"
          evidence: "Features, price, service all replicable"
      improvement_actions:
        - "Run Zag differentiation process"
        - "Find category convention to break"
        - "Develop onlyness statement"

    authenticity:
      score: 4
      max: 5
      questions:
        - question: "Does brand deliver on promises?"
          answer: "Yes - product quality matches claims"
          evidence: "4.5 star average reviews"
        - question: "Is internal culture aligned with external brand?"
          answer: "Mostly - some gaps in customer service"
          evidence: "Employee NPS 45, could be higher"
        - question: "Does brand have a clear enemy or purpose?"
          answer: "Somewhat - purpose present but not prominent"
          evidence: "About page mentions purpose but not featured"
      improvement_actions:
        - "Address customer service culture gap"
        - "Elevate purpose in brand communications"

    relevance:
      score: 4
      max: 5
      questions:
        - question: "Does brand solve a real problem?"
          answer: "Yes - clear functional value"
          evidence: "Strong repeat purchase rate"
        - question: "Is brand aligned with customer identity?"
          answer: "Partially - functional, not emotional"
          evidence: "Customers use product but don't identify with brand"
        - question: "Would customers recommend enthusiastically?"
          answer: "Moderately - NPS is 35"
          evidence: "Satisfied but not evangelists"
      improvement_actions:
        - "Build emotional connection through tribe strategy"
        - "Enable identity expression for customers"

    coherence:
      score: 3
      max: 5
      questions:
        - question: "Is experience consistent everywhere?"
          answer: "No - significant touchpoint variation"
          evidence: "Website premium feel, packaging generic"
        - question: "Do all touchpoints reinforce positioning?"
          answer: "Partially - some touchpoints off-brand"
          evidence: "Social media tone doesn't match brand voice"
        - question: "Is brand protected by guidelines?"
          answer: "Guidelines exist but not followed"
          evidence: "Brand guide from 2023, not updated"
      improvement_actions:
        - "Audit and align all touchpoints"
        - "Update and enforce brand guidelines"
        - "Train all teams on brand standards"

  total_score: 16
  max_score: 25
  charisma_level: "Emerging"
  verdict: "Brand has potential but significant gaps in differentiation and coherence prevent charismatic status"

  priority_actions:
    priority_1:
      pillar: "Differentiation"
      action: "Run Zag differentiation process"
      impact: "High - currently the biggest gap"
      timeline: "Q2 2026"

    priority_2:
      pillar: "Coherence"
      action: "Touchpoint alignment project"
      impact: "Medium - inconsistency erodes trust"
      timeline: "Q2-Q3 2026"

    priority_3:
      pillar: "Clarity"
      action: "Messaging simplification"
      impact: "Medium - supports differentiation"
      timeline: "Q3 2026"

  neumeier_recommendation: |
    "A charismatic brand is any brand for which people believe there's no substitute.
    This brand currently HAS substitutes. The path to charisma requires radical
    differentiation (Zag) combined with relentless touchpoint coherence.
    Address differentiation first - everything else becomes easier when you own
    a unique position in customer minds."
```

## Success Criteria

- [ ] All 5 pillars scored with evidence
- [ ] Total charisma score calculated
- [ ] Charisma level determined
- [ ] Improvement actions identified for each pillar
- [ ] Priority roadmap created
- [ ] Report ready for stakeholder presentation

## Error Handling

- **Insufficient data for pillar**: Score as "Unable to assess" and flag for research
- **Conflicting evidence**: Document both perspectives, recommend validation
- **Stakeholder disagrees with score**: Present evidence, facilitate discussion
- **Score changes significantly**: Track over time, note context changes

## Scoring Guide

### Clarity (1-5)
- 5: Crystal clear - anyone instantly understands
- 4: Clear - minor ambiguities
- 3: Adequate - gets the point across with effort
- 2: Confusing - multiple interpretations possible
- 1: Incoherent - no one understands the brand

### Differentiation (1-5)
- 5: Category of one - no substitutes exist
- 4: Strongly differentiated - clear unique position
- 3: Somewhat different - some unique elements
- 2: Marginally different - could be confused with competitors
- 1: Commodity - only price distinguishes

### Authenticity (1-5)
- 5: Completely genuine - walk matches talk perfectly
- 4: Mostly authentic - minor gaps
- 3: Adequate - some inconsistencies
- 2: Questionable - visible gaps between promise and delivery
- 1: Inauthentic - brand is a facade

### Relevance (1-5)
- 5: Essential - customers can't imagine life without
- 4: Important - strong preference
- 3: Useful - functional value
- 2: Optional - nice to have
- 1: Irrelevant - customers don't care

### Coherence (1-5)
- 5: Perfect alignment - every touchpoint reinforces
- 4: Strong coherence - minor inconsistencies
- 3: Adequate - some touchpoints off-brand
- 2: Fragmented - significant inconsistencies
- 1: Chaotic - no alignment across touchpoints

## Security Considerations

- Protect customer feedback data
- Secure competitive analysis
- Limit distribution of candid internal assessments
- Handle stakeholder criticisms professionally

## Neumeier Principles Applied

- **"A charismatic brand is any brand for which people believe there's no substitute."** - Definition of goal
- **"Charisma cannot be faked. It must be earned through genuine differentiation."** - Authenticity pillar
- **"Every touchpoint is an opportunity to build brand charisma."** - Coherence pillar
- **"The magic is in the consistency."** - Cross-pillar theme

## Examples

### Example 1: High-Charisma Brand (Apple)

```
Clarity: 5 - "Think Different" - instantly understood
Differentiation: 5 - Only Apple is Apple
Authenticity: 5 - Product delivers on promise
Relevance: 5 - Identity expression for customers
Coherence: 5 - Every touchpoint is Apple

TOTAL: 25/25 - Charismatic
```

### Example 2: Low-Charisma Brand (Generic SaaS)

```
Clarity: 2 - "Enterprise solutions for modern businesses"
Differentiation: 1 - Same features as 50 competitors
Authenticity: 3 - Delivers functional value
Relevance: 2 - Interchangeable with alternatives
Coherence: 2 - Website vs product disconnect

TOTAL: 10/25 - Weak
```

## Notes

- Charisma audit synthesizes Brand Gap and Zag frameworks
- Run after initial brand strategy to establish baseline
- Repeat annually to track progress
- Low differentiation score should trigger *brand-differentiation task
- Low coherence score should trigger *brand-gap-analysis
- For naming issues, run *brand-naming task
