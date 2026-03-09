# Brand Naming

> Task ID: brand-naming
> Agent: Marty Neumeier (Brand Strategy Pioneer)
> Version: 1.0.0

## Description

Generate and validate brand names using Neumeier's 7 criteria for effective naming. A brand name is a customer's shortcut to a buying decision - it must help, not hurt, your zag. This task provides a systematic approach to creating, evaluating, and selecting brand names that support radical differentiation.

## Prerequisites

- Completed brand strategy (positioning, onlyness statement)
- Understanding of target tribe
- Competitive brandscape mapping
- Legal/trademark search capability

## Workflow

### Interactive Elicitation

1. **Gather Naming Context**
   - Ask for brand category and positioning
   - Request onlyness statement (if available)
   - Identify naming constraints (legal, cultural, existing assets)
   - Understand naming goals (new brand, rebrand, sub-brand)

2. **Define Naming Territory**
   - Identify naming types to explore
   - Confirm target tribe characteristics
   - Set evaluation criteria weights

3. **Confirm Scope**
   - Show naming approach
   - Confirm number of candidates needed
   - Begin name generation

### Steps

#### Phase 1: Strategy Alignment

1. **Review Brand Strategy**
   - Confirm positioning and onlyness statement
   - Identify key brand attributes to convey
   - Document tribe characteristics
   - Validation: Strategy documented for naming reference

2. **Define Naming Objectives**
   - What should the name accomplish?
   - What feeling should it evoke?
   - What differentiation must it support?
   - Validation: Naming objectives clear

3. **Set Constraints**
   - Legal restrictions (trademark availability)
   - Domain availability requirements
   - Cultural/linguistic considerations
   - Character length limits
   - Validation: Constraints documented

#### Phase 2: Name Generation

4. **Explore Naming Types**
   - **Founder names**: Using a person's name (Ford, Dell)
   - **Descriptive names**: What it does (General Electric)
   - **Fabricated names**: Made-up words (Kodak, Xerox)
   - **Metaphor names**: Suggestive imagery (Amazon, Apple)
   - **Acronym names**: Letter combinations (IBM, BMW)
   - **Combination names**: Merged words (Facebook, Instagram)
   - **Abstract names**: No literal meaning (Nike, Uber)
   - Validation: Multiple naming territories explored

5. **Generate Candidate Names**
   - Create 20-50 initial candidates
   - Vary across naming types
   - Include unexpected options
   - Validation: Diverse name pool created

#### Phase 3: Evaluation (7 Criteria)

6. **Criterion 1: Distinctiveness**
   - Does the name stand out from competitors?
   - Is it unique in the category?
   - Will it be confused with existing brands?
   - Score: 1-5
   - Validation: Distinctiveness assessed

7. **Criterion 2: Brevity**
   - Is the name short enough to remember?
   - Can it be said in one or two syllables?
   - Does it fit comfortably in conversation?
   - Score: 1-5
   - Validation: Brevity assessed

8. **Criterion 3: Appropriateness**
   - Does the name fit the brand personality?
   - Is it appropriate for the category?
   - Does it support the positioning?
   - Score: 1-5
   - Validation: Appropriateness assessed

9. **Criterion 4: Easy Spelling and Pronunciation**
   - Can people spell it after hearing it?
   - Can people pronounce it correctly?
   - Does it work across languages (if needed)?
   - Score: 1-5
   - Validation: Usability assessed

10. **Criterion 5: Likability**
    - Do people enjoy saying the name?
    - Does it have positive associations?
    - Does it evoke the right emotion?
    - Score: 1-5
    - Validation: Likability assessed

11. **Criterion 6: Extendability**
    - Can the name grow with the brand?
    - Does it allow for sub-brands?
    - Will it still work in 10 years?
    - Score: 1-5
    - Validation: Extendability assessed

12. **Criterion 7: Protectability**
    - Can the name be trademarked?
    - Is the domain available?
    - Can it be defended legally?
    - Score: 1-5
    - Validation: Protectability assessed

#### Phase 4: Selection

13. **Calculate Total Scores**
    - Sum all 7 criteria scores (max 35)
    - Rank candidates by total score
    - Validation: Scores calculated

14. **Shortlist Top Candidates**
    - Select top 3-5 names
    - Document reasoning for each
    - Validation: Shortlist created

15. **Conduct Validation Testing**
    - Test with target tribe members
    - Check for unintended meanings
    - Verify across cultures (if global)
    - Validation: Testing complete

16. **Generate Naming Report**
    - Present shortlist with scores
    - Include evaluation rationale
    - Provide final recommendation
    - Validation: Report complete

## Output

- **naming-candidates.yaml**: All candidates with scores
- **naming-evaluation.md**: Detailed evaluation for shortlist
- **naming-recommendation.md**: Final recommendation with rationale

### Output Format

```yaml
brand_naming:
  brand_context:
    category: "Project Management Software"
    positioning: "The only PM tool that celebrates completion, not just tracking"
    onlyness: "The ONLY project management tool that makes finishing feel as good as starting"
    tribe: "Achievement-driven professionals who value progress over process"

  naming_objectives:
    convey: "Accomplishment, momentum, satisfaction"
    evoke: "Pride, progress, closure"
    avoid: "Corporate, complicated, generic"

  constraints:
    trademark: "Must be available in US, EU"
    domain: ".com required"
    length: "Max 10 characters"

  candidates:
    finalist_1:
      name: "Finito"
      type: "Fabricated (Italian)"
      rationale: "Means 'finished' - directly supports positioning"
      scores:
        distinctiveness: 5
        brevity: 5
        appropriateness: 5
        spelling_pronunciation: 4
        likability: 5
        extendability: 4
        protectability: 4
      total_score: 32
      concerns: "May sound too casual for enterprise"

    finalist_2:
      name: "Donely"
      type: "Fabricated"
      rationale: "Play on 'done' + friendly suffix"
      scores:
        distinctiveness: 4
        brevity: 5
        appropriateness: 4
        spelling_pronunciation: 4
        likability: 4
        extendability: 4
        protectability: 5
      total_score: 30
      concerns: "Might seem made-up in negative way"

    finalist_3:
      name: "Checkmark"
      type: "Descriptive"
      rationale: "Universal symbol of completion"
      scores:
        distinctiveness: 3
        brevity: 3
        appropriateness: 5
        spelling_pronunciation: 5
        likability: 4
        extendability: 3
        protectability: 3
      total_score: 26
      concerns: "Common word, trademark challenges"

  testing_results:
    finalist_1_finito:
      tribe_reaction: "Positive - fun, memorable, different"
      concerns_raised: "Some wondered if too playful"
      recommendation: "Proceed with testing in enterprise context"

    finalist_2_donely:
      tribe_reaction: "Mixed - some found it clever, some found it odd"
      concerns_raised: "Pronunciation varied"
      recommendation: "Consider as backup"

  final_recommendation:
    name: "Finito"
    rationale: |
      Finito scores highest on the 7 criteria, particularly in distinctiveness,
      appropriateness, and likability. It directly supports the brand's
      "celebration of completion" positioning. The Italian origin adds charm
      without being pretentious. Tribe testing showed strong positive response.

      While there's some concern about enterprise perception, this can be
      addressed through visual identity and positioning - the name itself
      reinforces the brand's unique approach.

    implementation_notes:
      - "Secure trademark in key markets immediately"
      - "Register finito.com domain"
      - "Create pronunciation guide for press"
      - "Develop tagline to complement name"
```

## Success Criteria

- [ ] 20+ candidates generated across naming types
- [ ] All candidates scored on 7 criteria
- [ ] Top 3-5 shortlisted with rationale
- [ ] Tribe validation testing completed
- [ ] Trademark/domain availability verified
- [ ] Final recommendation provided

## Error Handling

- **All names fail trademark**: Expand search to fabricated names
- **Tribe reacts negatively to all options**: Revisit naming territory, consider new directions
- **Scoring ties**: Use weighted criteria based on brand priorities
- **Domain unavailable**: Consider alternatives (.co, .io) or modifications

## The 7 Criteria Deep Dive

### 1. Distinctiveness
- **Why it matters**: In a crowded market, sameness is death
- **Test**: Say the name next to competitors - does it stand out?
- **Pitfall**: Generic names feel safe but fail to differentiate

### 2. Brevity
- **Why it matters**: Short names are easier to remember and say
- **Test**: Can you say it in one breath?
- **Pitfall**: Long names get shortened by customers anyway (Chevrolet → Chevy)

### 3. Appropriateness
- **Why it matters**: Name must fit the brand's personality
- **Test**: Does it feel right for what you're selling?
- **Pitfall**: Cool names that don't match the brand confuse customers

### 4. Easy Spelling and Pronunciation
- **Why it matters**: If people can't spell it, they can't find you
- **Test**: Say it over the phone - can they spell it?
- **Pitfall**: Clever spellings (Lyft, Flickr) create search challenges

### 5. Likability
- **Why it matters**: People should enjoy saying your name
- **Test**: Do people smile when they hear it?
- **Pitfall**: Names that are "correct" but boring fail to create connection

### 6. Extendability
- **Why it matters**: Brand names need to grow with the business
- **Test**: Will this name work for adjacent products/services?
- **Pitfall**: Too narrow limits future growth

### 7. Protectability
- **Why it matters**: Legal protection creates lasting brand equity
- **Test**: Can you own this name exclusively?
- **Pitfall**: Common words are hard to defend

## Security Considerations

- Protect naming candidates before announcement
- Secure trademark filings before public discussion
- Domain registrations should be done quietly
- Limit sharing of final decision until legal protection secured

## Neumeier Principles Applied

- **"A brand is a customer's shortcut to a buying decision."** - Name is the first shortcut
- **"If you're not the only, you're not memorable."** - Name should support onlyness
- **"Different is better than better."** - Distinctive names win
- **"Simplicity wins."** - Brevity matters

## Examples

### Example 1: Tech Startup Naming

```
Category: AI Writing Assistant
Positioning: The only AI that writes like a senior strategist

CANDIDATES:
1. Stratego - 28/35 (strategy + go, action-oriented)
2. ProseAI - 26/35 (clear, descriptive)
3. Cipher - 25/35 (clever but obscure connection)

WINNER: Stratego
- Distinctive: Yes - no competitors use strategy angle
- Brief: Yes - 3 syllables
- Appropriate: Yes - implies strategic thinking
- Spellable: Yes - familiar word structure
- Likable: Yes - sounds smart, approachable
- Extendable: Yes - could cover multiple products
- Protectable: Check trademark - word variation
```

### Example 2: Consumer Product Naming

```
Category: Sustainable Water Bottles
Positioning: The only bottle that tracks your hydration and environmental impact

CANDIDATES:
1. Ripple - 31/35 (water imagery, environmental ripple effect)
2. FlowTrack - 27/35 (functional, clear)
3. Aqua Impact - 24/35 (too long, generic)

WINNER: Ripple
- Distinctive: Yes - evocative, not functional
- Brief: Yes - 2 syllables
- Appropriate: Yes - water + impact
- Spellable: Yes - common word
- Likable: Yes - pleasant sound
- Extendable: Yes - app, accessories
- Protectable: Check - common word challenge
```

## Notes

- Naming is one of the most important brand decisions
- A bad name can be overcome, but why start with handicap?
- Test names with real tribe members, not just internal team
- Domain and trademark should be checked early, not late
- Consider how name sounds in customer conversations
- Run this task after brand-differentiation to ensure name supports zag
