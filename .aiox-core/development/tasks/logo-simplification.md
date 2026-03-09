# logo-simplification

> **Logo Simplification Task** - Reduce complex logos to essential forms
> Apply Draplin's "Remove Until It Hurts" methodology

## Task Definition

```yaml
task:
  name: logo-simplification
  agent: aaron-draplin
  category: logo-design
  complexity: medium
  estimated_time: "1-2 hours"

  description: |
    Take an existing logo (complex, detailed, or problematic) and systematically
    reduce it to its essential form. This task applies the Logo Reduction Process
    framework - removing elements until nothing else can be removed without
    breaking the communication.

  inputs:
    required:
      - current_logo: "Existing logo file or description"
      - problem_context: "Why simplification is needed"
    optional:
      - must_keep: "Elements that cannot be removed"
      - target_applications: "Where simplified logo will be used"

  outputs:
    - element_inventory: "List of all current elements"
    - reduction_rounds: "Documentation of removal process"
    - simplified_logo: "Final reduced version"
    - comparison_analysis: "Before/after comparison"
```

---

## Draplin Philosophy

```
"The delete key is your best friend."

"Every element has to earn its place."

"Simplify until it hurts - then you know it's right."

"If you can't draw it in 10 seconds, it's too complicated."
```

---

## Step 1: Element Inventory

**Goal:** Identify EVERY element in the current logo.

### 1.1 Visual Element Audit

```markdown
## ELEMENT INVENTORY

### Text Elements
| # | Element | Description | Essential? |
|---|---------|-------------|------------|
| 1 | Primary text | Company name | Likely yes |
| 2 | Secondary text | Tagline | Likely no |
| 3 | Tertiary text | Est. date, location | Likely no |

### Graphic Elements
| # | Element | Description | Essential? |
|---|---------|-------------|------------|
| 1 | Main icon/symbol | [describe] | Check |
| 2 | Secondary icon | [describe] | Likely no |
| 3 | Container/shape | [describe] | Test |
| 4 | Background shape | [describe] | Likely no |

### Decorative Elements
| # | Element | Description | Essential? |
|---|---------|-------------|------------|
| 1 | Borders | [describe] | Likely no |
| 2 | Ornaments | [describe] | Likely no |
| 3 | Lines/rules | [describe] | Likely no |
| 4 | Dots/stars | [describe] | Likely no |

### Effects
| # | Element | Description | Essential? |
|---|---------|-------------|------------|
| 1 | Gradients | [describe] | REMOVE |
| 2 | Shadows | [describe] | REMOVE |
| 3 | 3D effects | [describe] | REMOVE |
| 4 | Glows/blurs | [describe] | REMOVE |

### Colors
| # | Color | Usage | Essential? |
|---|-------|-------|------------|
| 1 | [color] | [where] | Test |
| 2 | [color] | [where] | Likely no |
| 3 | [color] | [where] | Likely no |

**TOTAL ELEMENTS:** ___
```

### 1.2 Complexity Score

```markdown
## COMPLEXITY ASSESSMENT

Current State:
- Text elements: ___ (aim for 1-2)
- Graphic elements: ___ (aim for 1-2)
- Decorative elements: ___ (aim for 0)
- Effects: ___ (aim for 0)
- Colors: ___ (aim for 1-3)

COMPLEXITY SCORE: ___ / 20
- 1-5: Already simple (minor refinements)
- 6-10: Moderately complex (needs work)
- 11-15: Overly complex (significant reduction)
- 16-20: Critically complex (major overhaul)
```

---

## Step 2: Reduction Rounds

**Goal:** Systematically remove elements, testing at each step.

### Round 1: Effects Removal

```markdown
## ROUND 1: REMOVE ALL EFFECTS

Effects are NEVER essential. Remove immediately:

- [ ] Remove all drop shadows
- [ ] Remove all gradients -> flat color
- [ ] Remove all 3D/bevel effects
- [ ] Remove all glows
- [ ] Remove all blurs
- [ ] Remove all textures

**Result after Round 1:**
- Elements removed: ___
- Still works? [ ] Yes [ ] No
- Notes: _________________
```

### Round 2: Decorative Removal

```markdown
## ROUND 2: REMOVE DECORATIVE ELEMENTS

Decoration adds visual noise without communication value:

- [ ] Remove ornamental borders
- [ ] Remove decorative lines/rules
- [ ] Remove stars/dots that don't communicate
- [ ] Remove flourishes/swashes
- [ ] Simplify multi-line borders to single line (if keeping)

**Result after Round 2:**
- Elements removed: ___
- Still works? [ ] Yes [ ] No
- Notes: _________________
```

### Round 3: Secondary Text Removal

```markdown
## ROUND 3: EVALUATE SECONDARY TEXT

Text hierarchy - keep only what's essential:

Tagline:
- [ ] Does logo work without tagline?
- [ ] If yes: Move tagline to separate lockup
- [ ] If no: Simplify tagline

Tertiary text (dates, locations, etc.):
- [ ] Remove "Est. YYYY" (can be separate lockup)
- [ ] Remove location text
- [ ] Remove descriptor text

**Result after Round 3:**
- Elements removed: ___
- Still works? [ ] Yes [ ] No
- Notes: _________________
```

### Round 4: Color Reduction

```markdown
## ROUND 4: COLOR EVALUATION

Test in BLACK & WHITE first:

- [ ] Convert entire logo to black
- [ ] Does it work? [ ] Yes [ ] No

If YES: Color is not essential (good!)
If NO: What needs color to work? (problem!)

Color reduction:
- [ ] Can reduce to 1 color? Test.
- [ ] Can reduce to 2 colors? Test.
- [ ] What is the MINIMUM colors needed?

**Result after Round 4:**
- Colors before: ___
- Colors after: ___
- Works in B&W? [ ] Yes [ ] No
- Notes: _________________
```

### Round 5: Structural Elements

```markdown
## ROUND 5: STRUCTURAL SIMPLIFICATION

Test removing structural elements:

Container/Frame:
- [ ] Test logo without container shape
- [ ] Still works? [ ] Yes [ ] No
- [ ] If no: Is simpler container possible?

Icon Complexity:
- [ ] Can icon details be reduced?
- [ ] What is the SIMPLEST recognizable form?
- [ ] Test with 50% detail removed

Typography:
- [ ] Can typeface be simplified?
- [ ] Are custom modifications necessary?
- [ ] Can letter count be reduced? (initials vs. full name)

**Result after Round 5:**
- Elements removed: ___
- Still works? [ ] Yes [ ] No
- Notes: _________________
```

### Round 6: Final Reduction

```markdown
## ROUND 6: PUSH TO THE LIMIT

The Draplin Test - remove ONE more thing:

Current state after Round 5: ___

- [ ] Remove ONE more element
- [ ] Does it still work? [ ] Yes [ ] No

If YES: Continue removing
If NO: Go back one step - you've found the limit

**FINAL ELEMENT COUNT:** ___
**REDUCTION PERCENTAGE:** ___% fewer elements
```

---

## Step 3: Validation Testing

**Goal:** Ensure simplified logo passes all requirements.

### 3.1 The Draplin Tests

```markdown
## VALIDATION TESTS

### COIN TEST (Scalability)
Display at 16x16 pixels:
- [ ] Shape is recognizable
- [ ] No details lost to blur
- [ ] Works as favicon
RESULT: [ ] PASS [ ] FAIL

### SQUINT TEST (Silhouette)
Squint at logo from arm's length:
- [ ] Overall shape is clear
- [ ] Doesn't become a blob
- [ ] Distinctive silhouette
RESULT: [ ] PASS [ ] FAIL

### BLACK & WHITE TEST (Color Independence)
Convert to pure black:
- [ ] All elements visible
- [ ] Hierarchy maintained
- [ ] No confusion from missing color
RESULT: [ ] PASS [ ] FAIL

### MEMORY TEST (Memorability)
Show someone for 3 seconds, then ask them to describe:
- [ ] They can describe the main shape
- [ ] They remember key elements
- [ ] They don't confuse it with another logo
RESULT: [ ] PASS [ ] FAIL

### EMBROIDERY TEST (Reproducibility)
Could this be stitched?
- [ ] No lines thinner than thread
- [ ] No tiny details
- [ ] No gradients or effects
- [ ] Countable colors (max 6)
RESULT: [ ] PASS [ ] FAIL

### 10-SECOND SKETCH TEST (Simplicity)
Can you sketch it in 10 seconds?
- [ ] Basic shape drawable quickly
- [ ] No complex details to remember
- [ ] Essential form clear
RESULT: [ ] PASS [ ] FAIL
```

### 3.2 Before/After Comparison

```markdown
## COMPARISON ANALYSIS

### Element Count
| Category | Before | After | Reduced |
|----------|--------|-------|---------|
| Text elements | ___ | ___ | ___% |
| Graphic elements | ___ | ___ | ___% |
| Decorative elements | ___ | ___ | ___% |
| Effects | ___ | ___ | 100% |
| Colors | ___ | ___ | ___% |
| **TOTAL** | ___ | ___ | **___%** |

### Test Results
| Test | Before | After |
|------|--------|-------|
| Coin test | [ ] | [x] |
| Squint test | [ ] | [x] |
| B&W test | [ ] | [x] |
| Memory test | [ ] | [x] |
| Embroidery test | [ ] | [x] |
| 10-sec sketch | [ ] | [x] |

### Key Changes
1. _________________
2. _________________
3. _________________

### What Was Preserved
1. _________________
2. _________________
```

---

## Step 4: Documentation

### 4.1 Simplification Report

```markdown
## SIMPLIFICATION REPORT

**Client:** [Name]
**Date:** [Date]
**Simplified by:** Aaron Draplin methodology

### Original Logo Issues
1. _________________ (e.g., "Too many colors")
2. _________________ (e.g., "Fails at small sizes")
3. _________________ (e.g., "Gradient dependent")

### Simplification Actions
1. _________________ (e.g., "Removed gradient, solid black")
2. _________________ (e.g., "Eliminated tagline")
3. _________________ (e.g., "Simplified icon to essential shape")

### Results
- **Elements reduced:** X to Y (Z% reduction)
- **Colors reduced:** X to Y
- **Now passes:** Coin test, B&W test, Embroidery test

### Recommendations
- Primary use: Simplified version
- Full version: Reserved for large format only
- Badge version: Consider for merch (see badge-design task)
```

---

## Common Simplification Patterns

### Pattern 1: Illustration to Shape

```
BEFORE: Detailed illustration of object
AFTER: Geometric simplification of essence

Example:
- Detailed owl illustration -> Simple owl eyes shape
- Realistic mountain -> Triangle silhouette
- Full tree illustration -> Simple tree icon
```

### Pattern 2: Wordmark + Icon to Combined Mark

```
BEFORE: Separate wordmark and icon
AFTER: Integrated mark where icon IS part of text

Example:
- "ARROW" + arrow icon -> Arrow integrated into letter A
- "PEAK" + mountain -> K becomes mountain shape
```

### Pattern 3: Multi-element to Single Shape

```
BEFORE: Multiple separate elements
AFTER: Single unified shape

Example:
- Sun + waves + bird -> Single abstract shape combining all
- Multiple letters -> Single monogram
```

### Pattern 4: Outline to Solid

```
BEFORE: Outline/stroke-based design
AFTER: Solid fill shapes

Why: Solids scale better, embroider better, read faster
```

### Pattern 5: Gradient to Flat

```
BEFORE: Color gradients
AFTER: Flat solid colors

Why: Works in any reproduction method
```

---

## Draplin Warnings

```
RED FLAGS - If you see these, simplify more:

- "It needs color to make sense" -> WRONG, fix the form
- "The details are important" -> If they disappear small, they're not
- "It's unique because of the complexity" -> Unique ≠ complex
- "The gradient adds dimension" -> Flat works everywhere
- "We need all this text" -> You don't
```

---

## Completion Criteria

```yaml
task_complete_when:
  - "All effects removed (shadows, gradients, 3D)"
  - "Passes coin test (works at 16px)"
  - "Passes B&W test (works without color)"
  - "Passes embroidery test (can be stitched)"
  - "Element count reduced by minimum 30%"
  - "Documentation complete with before/after"

success_indicators:
  - "Can sketch it in 10 seconds"
  - "Can describe it in one sentence"
  - "Works in all intended applications"
  - "Client can see the essence preserved"
```

---

## Related Files

- **Task:** `logo-design-process.md` (full process)
- **Task:** `logo-system-creation.md` (variations)
- **Checklist:** `logo-quality-checklist.md`
- **Workflow:** `logo-project-workflow.md`

---

*Task Version: 1.0*
*Created: 2026-02-02*
*Agent: aaron-draplin*
*Philosophy: Simplify until it hurts.*
