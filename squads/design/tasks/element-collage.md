# Task: Create Element Collage

**Task ID:** element-collage
**Version:** 1.0
**Purpose:** Create element collages as exploratory design artifacts for early design direction alignment
**Agent:** @dan-mall
**Mode:** Elicitation-based (interactive)
**Quality Standard:** AIOS Level

---

## Overview

Creates element collages: exploratory design artifacts that present UI elements in context without committing to full page layouts. Unlike traditional mockups, element collages show typography, color, imagery, iconography, and component treatments side by side to establish visual direction quickly. This technique, pioneered by Dan Mall, accelerates stakeholder alignment by focusing feedback on aesthetic direction rather than layout specifics.

```
INPUT (brand guidelines, content samples, mood direction)
    |
[PHASE 1: INGREDIENT GATHERING]
    -> Collect brand assets, content, and visual references
    |
[PHASE 2: COLLAGE CREATION]
    -> Compose element collage with representative UI elements
    |
[PHASE 3: ALIGNMENT]
    -> Present, gather feedback, and refine direction
    |
OUTPUT: Element collage with annotated design direction and stakeholder feedback
```

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| brand_assets | file | Yes | Brand guidelines, logos, color palette, typography specifications |
| content_samples | list | Yes | Real content snippets: headlines, body copy, CTAs, imagery subjects |
| mood_direction | string | Yes | Desired mood or aesthetic direction (e.g., "modern and approachable", "bold and editorial") |
| target_audience | string | No | Who will use the final product; helps inform visual tone |
| competitor_refs | list | No | URLs or screenshots of competitor or aspirational designs |
| platform | enum(web, mobile, both) | No | Target platform for element sizing and density; defaults to web |

---

## Preconditions

- Brand guidelines or at least a logo and color palette are available in a usable format
- Real content samples exist (not lorem ipsum) to ground the exploration in actual use cases
- Stakeholders understand that element collages are not page layouts and have been briefed on the format
- The project is at an early enough stage that visual direction is not yet locked
- A design tool (Figma, Sketch, or equivalent) is available for composition
- Feedback session is scheduled with stakeholders within 1 week of collage creation

---

## Steps

### Phase 1: Ingredient Gathering
1. Review brand guidelines and extract core visual assets: logo variants, color palette, typography families and scales
2. Collect 5-10 real content samples spanning different content types: headlines, subheads, body paragraphs, CTAs, navigation labels
3. Curate 3-5 representative images or illustration styles that match the mood direction
4. Gather iconography samples or identify icon style families that align with the brand
5. Review competitor or aspirational references to identify visual patterns to adopt or avoid
6. Document any explicit constraints: accessibility requirements, platform guidelines, brand restrictions

### Phase 2: Collage Composition
1. Set up a freeform canvas (not a page layout) at a comfortable working size (e.g., 1400x900px)
2. Place typography specimens: heading hierarchy, body text in context, pull quotes, captions
3. Add color application samples: buttons in primary/secondary colors, backgrounds, text-on-color combinations
4. Compose 2-3 component vignettes: a card with real content, a navigation fragment, a form element group
5. Include imagery treatments: photo styling, image-text overlays, illustration placement
6. Add spacing and rhythm samples: demonstrate the visual density and white space philosophy
7. Annotate key design decisions directly on the collage: "This font communicates X", "This color ratio ensures accessibility"
8. Create 1-3 variations if the direction is not yet clear, each exploring a different mood

### Phase 3: Alignment and Feedback
1. Present the element collage to stakeholders with a clear framing: "This is about direction, not layout"
2. Guide feedback with specific questions: "Does this typography feel right for your brand?", "Is this color balance appropriate?"
3. Document feedback organized by element type: typography reactions, color reactions, imagery reactions, overall mood
4. Identify convergence points (elements everyone agrees on) and divergence points (elements needing exploration)
5. If divergence exists, create focused follow-up collages exploring the contested elements in more depth
6. Refine the collage based on feedback, creating a "direction confirmed" version with stakeholder sign-off
7. Extract confirmed design decisions into a design direction brief for downstream work
8. Identify initial design token candidates from the confirmed direction: specific color values, type pairings, spacing rhythms

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| element_collage | design file (Figma/Sketch) | The composed element collage with annotated design decisions |
| variation_collages | design file (Figma/Sketch) | Alternative direction explorations if multiple moods were explored |
| direction_brief | markdown | Summary of confirmed visual direction decisions with rationale |
| feedback_log | markdown | Organized stakeholder feedback by element category |
| token_candidates | markdown table | Design tokens suggested by the collage: colors, type scales, spacing |

---

## Validation

| Criterion | Type | Description |
|-----------|------|-------------|
| Real content used | blocking | Collage must use actual content samples, not placeholder text |
| Brand alignment | blocking | All visual elements must be traceable to brand guidelines or documented deviations |
| Element diversity | blocking | Collage must include at least: typography, color, imagery, and one component vignette |
| Stakeholder feedback captured | warning | Feedback from at least one stakeholder should be documented |
| Accessibility consideration | warning | Color combinations shown should meet WCAG AA contrast requirements |
| Mood consistency | warning | All elements should reinforce the stated mood direction cohesively |

---

## Handoff

- **On direction confirmed:** Hand to @brad-frost for atomic design token extraction and component architecture
- **On CSS implementation:** Hand to @andy-bell for design token implementation and fluid type scale creation
- **On UX structure:** Hand to @sophia-prater for object model alignment with visual direction
- **On multiple directions:** Iterate with stakeholders using focused follow-up collages before proceeding
- **On issues:** Escalate to @design-chief

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Atoms** — Smallest UI building blocks (button, icon, label, input)
- **Molecules** — Functional units composed of atoms (search bar = input + button)
- **Organisms** — Complex components composed of molecules (header, sidebar)
- **Templates** — Page-level layouts of organisms without real data
- **Barrel export** — `index.ts` re-exporting modules for cleaner import paths

---

## Don't Do

- Do not classify components without understanding their composition (atoms combine into molecules, not vice versa)
- Do not create molecules that depend on specific page context — they should be reusable
- Do not skip barrel exports when reorganizing component directories
- Do not refactor atoms and molecules simultaneously — refactor bottom-up (atoms first)
- Do not break existing imports during atomic restructuring — update all consumers

