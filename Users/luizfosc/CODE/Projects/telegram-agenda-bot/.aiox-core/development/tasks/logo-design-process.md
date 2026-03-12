# logo-design-process

> **Complete Logo Design Process** - From brief to final delivery using Draplin methodology
> Full-cycle task following The Draplin Way framework

## Task Definition

```yaml
task:
  name: logo-design-process
  agent: aaron-draplin
  category: logo-design
  complexity: high
  estimated_time: "4-8 hours (spread across multiple sessions)"

  description: |
    Execute the complete logo design process from initial brief collection
    through final delivery. This task follows The Draplin Way methodology:
    Absorb -> Sketch Explosion -> Digital Refinement -> Simplification Loop ->
    Variation Expansion -> Presentation.

  inputs:
    required:
      - client_name: "Name of the client/business"
      - project_scope: "Logo only, logo + lockups, full identity"
    optional:
      - existing_materials: "Current logo, brand assets"
      - deadline: "Project deadline"
      - budget_tier: "basic, standard, premium"

  outputs:
    - logo_brief: "Completed brief document"
    - sketch_concepts: "10-20 thumbnail sketches"
    - digital_concepts: "3-5 refined vector concepts"
    - final_logo: "Approved logo in all formats"
    - lockup_system: "All lockup variations"
    - usage_rules: "Basic guidelines document"
```

---

## Phase 1: ABSORB (Brief Collection)

**Duration:** 1-2 hours
**Principle:** "What's the ONE word that describes your business?"

### 1.1 Essential Questions

```markdown
## CORE IDENTITY
- [ ] What is the full business name?
- [ ] Is there a tagline? (optional or required?)
- [ ] What does the business DO? (one sentence)
- [ ] What is the ONE WORD that captures the essence?

## HISTORY & CONTEXT
- [ ] How long has the business existed?
- [ ] Why was it started? (origin story)
- [ ] What makes it different from competitors?
- [ ] Where is it located? (local, regional, national, global)

## AUDIENCE
- [ ] Who is the primary customer?
- [ ] Why do they choose this business?
- [ ] How do they find the business?

## PERSONALITY SPECTRUM
Rate on scale (mark position):
- Formal [----•----] Casual
- Traditional [----•----] Innovative
- Serious [----•----] Playful
- Premium [----•----] Accessible
- Masculine [----•----] Feminine [----•----] Neutral
```

### 1.2 Application Requirements

```markdown
## CRITICAL APPLICATIONS (check all that apply)
- [ ] Business card
- [ ] Website / digital
- [ ] Social media profiles
- [ ] Email signature
- [ ] Signage / storefront
- [ ] Vehicle wrap
- [ ] Uniforms / embroidery
- [ ] Merchandise (t-shirts, hats)
- [ ] Packaging
- [ ] Print advertising
- [ ] Promotional items (pens, etc.)

## SPECIAL REQUIREMENTS
- [ ] Must work in single color (embroidery, stamps)
- [ ] Must work at very small sizes (favicon, app icon)
- [ ] Must work on dark backgrounds
- [ ] Must include specific element (icon, symbol)
```

### 1.3 References Collection

```markdown
## LOGOS THEY LOVE (and WHY)
1. _________________ because _________________
2. _________________ because _________________
3. _________________ because _________________

## LOGOS THEY HATE (and WHY)
1. _________________ because _________________
2. _________________ because _________________
3. _________________ because _________________

## COMPETITOR LOGOS (to be DIFFERENT from)
1. _________________
2. _________________
3. _________________
```

### 1.4 Constraints

```markdown
## COLOR REQUIREMENTS
- Required colors: _________________
- Forbidden colors: _________________
- Open to suggestions: [ ] Yes [ ] No

## STYLE DIRECTION
- [ ] Modern / Clean
- [ ] Vintage / Retro
- [ ] Badge / Emblem
- [ ] Wordmark focused
- [ ] Icon/Symbol focused
- [ ] Combination mark
- [ ] Open to exploration
```

### Phase 1 Output: Brief Document

Create formal brief using `logo-brief-tmpl.md` template.

---

## Phase 2: SKETCH EXPLOSION

**Duration:** 30-60 minutes
**Principle:** "If you can't draw it in 10 seconds, it's too complicated."

### 2.1 Sketch Rules

```
DRAPLIN SKETCH RULES:
1. Use thick marker (forces simplicity)
2. Each sketch < 10 seconds
3. NO judgment while sketching
4. Quantity over quality
5. Fill entire page
6. Minimum 10 concepts, aim for 20
7. Explore DIFFERENT directions, not variations
```

### 2.2 Direction Exploration

For each concept, try at least ONE from each category:

```markdown
## WORDMARK DIRECTIONS
- [ ] All caps, bold
- [ ] Mixed case, custom lettering
- [ ] Initials/monogram
- [ ] Ligatures/connected letters

## ICON/SYMBOL DIRECTIONS
- [ ] Abstract geometric shape
- [ ] Symbolic representation (not literal)
- [ ] Letter-based mark
- [ ] Negative space concept

## STRUCTURE DIRECTIONS
- [ ] Horizontal lockup
- [ ] Stacked/vertical
- [ ] Badge/emblem contained
- [ ] Standalone icon
```

### 2.3 Sketch Evaluation

After sketching, mark with symbols:

```
★ = Strong direction (develop further)
? = Interesting, needs exploration
✗ = Dead end (learn from it)
```

### Phase 2 Output: Sketch Selection

Select 3-5 strongest concepts for digital development.

---

## Phase 3: DIGITAL REFINEMENT

**Duration:** 2-4 hours per concept
**Principle:** "Vector is life. Thick lines, baby!"

### 3.1 Vector Construction Rules

```yaml
construction_rules:
  always:
    - Start in BLACK only (no color yet)
    - Use geometric construction (circles, rectangles)
    - Align to grid where possible
    - Maintain consistent stroke weight
    - Remove unnecessary anchor points

  stroke_weights:
    minimum: "Never less than 0.5pt at business card size"
    recommended: "5-10% of logo height"
    consistency: "Same weight throughout"

  typography:
    - Convert to outlines when final
    - Adjust kerning optically (not mathematically)
    - Custom modifications welcome
    - Bold weights preferred
```

### 3.2 Construction Process

```markdown
## FOR EACH CONCEPT:

1. [ ] Construct basic shapes
2. [ ] Apply thick lines philosophy
3. [ ] Refine proportions
4. [ ] Adjust optical balance
5. [ ] Clean up paths
6. [ ] Test at multiple sizes (see 3.3)
7. [ ] Test in black and white
```

### 3.3 Size Testing (Coin Test)

```
TEST AT THESE SIZES:
- 16px (favicon) - Must be recognizable
- 32px (small digital) - Details visible
- 64px (social avatar) - Clear and crisp
- Business card (1.5-2") - Standard use
- Large (8"+) - No jagged edges or artifacts
```

### Phase 3 Output: 3-5 Refined Concepts

Each concept ready for presentation with:
- Black version on white
- White version on black
- One simple mockup

---

## Phase 4: SIMPLIFICATION LOOP

**Duration:** 30-60 minutes per concept
**Principle:** "Simplify until it hurts."

### 4.1 Element Inventory

For each concept, list ALL elements:

```markdown
## ELEMENT INVENTORY - Concept [X]

| # | Element | Essential? | Remove? |
|---|---------|------------|---------|
| 1 | Main text | Yes | No |
| 2 | Tagline | No | Test |
| 3 | Icon | Yes | No |
| 4 | Container | Maybe | Test |
| 5 | Border | No | Yes |
| 6 | Decorative line | No | Yes |
```

### 4.2 Removal Testing

```markdown
## REMOVAL ROUNDS

### Round 1: Effects & Decoration
- [ ] Remove all shadows
- [ ] Remove all gradients
- [ ] Remove decorative elements
- [ ] Remove secondary borders
Result: Still works? Continue.

### Round 2: Secondary Text
- [ ] Remove tagline (move to separate lockup)
- [ ] Remove secondary info
Result: Still works? Continue.

### Round 3: Structural Elements
- [ ] Test without container
- [ ] Test without background shape
Result: Still works? You've found the essential form.
```

### 4.3 Validation Tests

```markdown
## SIMPLIFICATION VALIDATION

- [ ] COIN TEST: Recognizable at 16px
- [ ] B&W TEST: Works without color
- [ ] SQUINT TEST: Clear silhouette
- [ ] MEMORY TEST: Describable after 3 seconds
- [ ] EMBROIDERY TEST: Could be stitched
```

### Phase 4 Output: Simplified Concepts

Each concept reduced to essential form.

---

## Phase 5: VARIATION EXPANSION

**Duration:** 1-2 hours
**Principle:** "One logo, infinite applications."

### 5.1 Lockup System

Create for approved concept:

```markdown
## REQUIRED LOCKUPS

### Primary Lockup
- [ ] The preferred version
- [ ] Defined proportions
- [ ] Clear hierarchy

### Horizontal Lockup
- [ ] Icon + text side by side
- [ ] Ratio typically 3:1 to 5:1
- [ ] For headers, banners

### Stacked Lockup
- [ ] Icon above text
- [ ] Ratio typically 1:1 to 1:1.5
- [ ] For square applications

### Icon Only
- [ ] Symbol/mark alone
- [ ] Must work independently
- [ ] For favicon, app icon

### Wordmark Only (optional)
- [ ] Text without icon
- [ ] For contexts where icon unnecessary
```

### 5.2 Color Variations

```markdown
## COLOR VERSIONS

### Full Color
- [ ] RGB version defined
- [ ] CMYK version defined
- [ ] Pantone(s) specified

### One Color
- [ ] Black version
- [ ] White version
- [ ] Primary brand color version

### Reversed
- [ ] For dark backgrounds
- [ ] Optical adjustments if needed
```

### 5.3 Badge Version

```markdown
## BADGE/EMBLEM VERSION

If appropriate for brand:
- [ ] Contained in shape (circle, shield, etc.)
- [ ] Text on path option
- [ ] Suitable for patches/pins/merch
- [ ] Maintains simplicity
```

### Phase 5 Output: Complete Lockup System

All variations documented and ready.

---

## Phase 6: PRESENTATION

**Duration:** Preparation 1-2 hours, Meeting 30-60 minutes
**Principle:** "Show options, have an opinion."

### 6.1 Presentation Structure

```markdown
## PRESENTATION DECK

### Slide 1: Brief Recap
- Client name
- Essence word
- Key challenge/opportunity

### Slides 2-4: Option A (Safe)
- Logo on white
- Logo on dark
- One mockup
- Brief rationale

### Slides 5-7: Option B (Recommended)
- Logo on white
- Logo on dark
- Multiple mockups
- Clear recommendation

### Slides 8-10: Option C (Bold)
- Logo on white
- Logo on dark
- Impactful mockup
- Why this is interesting

### Slide 11: Side by Side
- All three options
- Only show after individual reveals

### Slide 12: Next Steps
- Selection
- Refinement timeline
- Final deliverables
```

### 6.2 Mockup Selection

```markdown
## MOCKUP PRIORITIES

Essential:
- [ ] Business card
- [ ] Website header
- [ ] Social media avatar

Recommended:
- [ ] Signage/storefront
- [ ] T-shirt/merch
- [ ] Email signature

Nice to have:
- [ ] Vehicle wrap
- [ ] Packaging
- [ ] Environmental
```

### Phase 6 Output: Client Presentation

Ready to present with confidence and clear recommendation.

---

## Phase 7: FINAL DELIVERY

**Duration:** 2-3 hours
**Principle:** "Ship it!"

### 7.1 File Organization

```
/[ClientName]_Logo_Final/
├── /Vector/
│   ├── [Name]_Primary.ai
│   ├── [Name]_Primary.eps
│   ├── [Name]_Primary.svg
│   ├── [Name]_Primary.pdf
│   ├── [Name]_Horizontal.ai
│   ├── [Name]_Stacked.ai
│   ├── [Name]_Icon.ai
│   └── [Name]_Badge.ai (if applicable)
├── /PNG/
│   ├── /FullColor/
│   ├── /OneColor_Black/
│   ├── /OneColor_White/
│   └── /Reversed/
├── /Web/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── og-image.png
└── /Guidelines/
    └── [Name]_Usage_Guide.pdf
```

### 7.2 Deliverables Checklist

```markdown
## VECTOR FILES
- [ ] AI (native Illustrator)
- [ ] EPS (universal vector)
- [ ] SVG (web)
- [ ] PDF (print)

## RASTER FILES
- [ ] PNG transparent (multiple sizes)
- [ ] JPG for simple backgrounds
- [ ] Favicon .ico
- [ ] Social media sizes

## DOCUMENTATION
- [ ] Color specifications (Pantone, RGB, CMYK, HEX)
- [ ] Typography specifications
- [ ] Minimum size requirements
- [ ] Clearspace rules
- [ ] Do's and Don'ts
```

---

## Completion Criteria

```yaml
task_complete_when:
  brief:
    - "Essence captured in ONE word"
    - "All applications identified"
    - "References collected"

  design:
    - "Coin test passed (works at 16px)"
    - "B&W test passed (works without color)"
    - "Embroidery test passed (can be stitched)"
    - "All lockups created"
    - "All color variations done"

  delivery:
    - "All file formats provided"
    - "Files properly organized"
    - "Usage guide included"
    - "Client approved"

draplin_final_test: |
  Before delivery, ask yourself:
  "Will this logo work in 50 years?"
  "Would I wear this on a t-shirt with pride?"
  "Is it BOLD enough?"

  If yes to all: SHIP IT!
```

---

## Related Files

- **Checklist:** `logo-quality-checklist.md`
- **Checklist:** `logo-versatility-checklist.md`
- **Workflow:** `logo-project-workflow.md`
- **Task:** `logo-simplification.md`
- **Task:** `logo-system-creation.md`
- **Task:** `vintage-badge-design.md`

---

*Task Version: 1.0*
*Created: 2026-02-02*
*Agent: aaron-draplin*
*Philosophy: Thick lines, baby!*
