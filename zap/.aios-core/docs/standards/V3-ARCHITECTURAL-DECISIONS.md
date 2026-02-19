# V3.0 Architectural Decisions Summary

**Date:** 2025-11-13  
**Version:** 3.0.0  
**Status:** Standard  
**Author:** Brad Frost Cognitive Clone

---

## DECISION A: Naming Conventions

### JSON/JavaScript: camelCase

```javascript
// ✅ CORRECT
{
  adAnalysis: { ... },
  formatConfig: { ... },
  brandColors: { ... }
}

// ❌ WRONG
{
  ad_analysis: { ... },
  format-config: { ... }
}
```

### CSS: kebab-case

```css
/* ✅ CORRECT */
.content-area { }
--content-padding-top: 50px;
--spacing-md: 200px;

/* ❌ WRONG */
.contentArea { }
--content_padding_top: 50px;
```

### Database: snake_case

```sql
-- ✅ CORRECT
tasks.responsavel_type
workflow_executions.started_at

-- ❌ WRONG
tasks.responsavelType
workflow_executions.startedAt
```

### Filenames: kebab-case

```
✅ CORRECT: design-cta-component.md, analyze-ad-brief.md
❌ WRONG: designCTAComponent.md, analyze_ad_brief.md
```

---

## DECISION B: Phase Reorganization

### v2.0 Structure (7 fases, confusing)

```
FASE 0: Initialization & Configuration
FASE 1: Content Analysis & Planning
FASE 2: Content Creation
FASE 3: Component Design
FASE 4: Layout Composition
FASE 5: Visual Selection & Positioning
FASE 6: Rendering & Export
```

### v3.0 Structure (6 fases, Atomic Design aligned)

```
FASE 0: Configuration & Initialization (Setup)
  Steps: 0, 1, 2, 12

FASE 1: Content Planning (Strategy)
  Steps: 3, 4, 5, 6

FASE 2: Atoms Creation (Base Components)
  Steps: 7a, 7b, 7c

FASE 3: Molecules & Organisms (Composition)
  Steps: 8a, 8b, 8c

FASE 4: Media & Layout (Assets & Positioning)
  Steps: 9, 10, 11

FASE 5: Template & Page (Rendering)
  Steps: 13a, 13b, 14
```

**Rationale:** Each phase maps to Atomic Design layer or functional stage.

---

## DECISION C: Step Renumbering

### v2.0 → v3.0 Mapping

| v2.0 | v3.0 | Name | Breaking? |
|------|------|------|-----------|
| 0 | 0 | Initialize Orchestrator | ❌ No |
| 1 | 1 | Load Format Configuration | ❌ No |
| 2 | 2 | Load Brand Configuration | ❌ No |
| 3 | 3 | Analyze Brief | ❌ No |
| 4 | 4 | Select Ad Template | ❌ No |
| 5 | 5 | Craft Ad Copy | ❌ No |
| 6 | 6 | Apply Typography | ❌ No |
| **7** | **7a, 7b, 7c** | **Design CTA, Badge, Validate** | ✅ **YES** |
| **8** | **8a, 8b, 8c** | **Text Group, Action Group, Content Area** | ✅ **YES** |
| 9 | 9 | Select Image | ❌ No |
| 10 | 10 | Detect Faces | ❌ No |
| 11 | 11 | Determine Optimal Positioning | ❌ No |
| **12** | **12** | **Load Design Tokens (moved to FASE 0)** | ⚠️ **Phase change** |
| **13** | **13a, 13b** | **Inject CSS, Render HTML** | ✅ **YES** |
| 14 | 14 | Export to PNG | ❌ No |

**Total: 14 steps → 19 steps** (more granular, more testable)

---

## DECISION D: Executor Mapping per Step

| Step | Task | Executor | Conditional? | Rationale |
|------|------|----------|--------------|-----------|
| 0 | Initialize | **Worker** | ❌ No | Deterministic validation |
| 1 | Load Format | **Worker** | ❌ No | File read + calculation |
| 2 | Load Brand | **Worker** | ❌ No | File read + validation |
| 3 | Analyze Brief | **Agente** / **Worker** | ✅ Yes (ready_copy) | AI if full gen, skip if ready_copy |
| 4 | Select Template | **Agente** / **Worker** | ✅ Yes (template_id) | AI if not specified, skip if provided |
| 5 | Craft Copy | **Agente** / **Worker** | ✅ Yes (ready_copy) | AI if full gen, passthrough if ready_copy |
| 6 | Apply Typography | **Agente** | ❌ No | AI decides transformations |
| 7a | Design CTA | **Agente** / **Worker** | ✅ Yes (ready_copy) | AI if full gen, defaults if ready_copy |
| 7b | Design Badge | **Agente** / **Worker** | ✅ Yes (urgency) | AI if high urgency, skip if low |
| 7c | Validate Components | **Clone** | ❌ No | Brad Frost validates Atomic Design |
| 8a | Compose Text Group | **Agente** | ❌ No | AI groups atoms into molecule |
| 8b | Compose Action Group | **Agente** | ⚠️ Optional | Only if badge exists |
| 8c | Compose Content Area | **Agente** | ❌ No | AI composes organism |
| 9 | Select Image | **Agente** | ❌ No | AI semantic search |
| 10 | Detect Faces | **Agente** | ❌ No | External AI API (Gemini Vision) |
| 11 | Determine Positioning | **Agente** / **Worker** | ✅ Yes (faces?) | AI if complex, heuristics if simple |
| 12 | Load Design Tokens | **Worker** | ❌ No | Parse CSS file |
| 13a | Inject CSS Variables | **Worker** | ❌ No | Template injection |
| 13b | Render HTML | **Worker** | ❌ No | Handlebars compilation |
| 14 | Export PNG | **Worker** | ❌ No | Puppeteer screenshot |

**Conditional Logic Summary:**

```yaml
Step 3 (Analyze Brief):
  if ready_copy=true: Worker (skip AI)
  else: Agente (AI analysis)

Step 4 (Select Template):
  if template_id provided: Worker (use provided)
  else if ready_copy=true: Agente (AI with ready_copy context)
  else: Agente (AI with brief analysis)

Step 5 (Craft Copy):
  if ready_copy=true: Worker (passthrough)
  else: Agente (AI generation)

Step 7a (Design CTA):
  if ready_copy=true: Worker (brand colors)
  else: Agente (AI design)

Step 7b (Design Badge):
  if urgencyLevel=high: Agente (design badge)
  else: skip (no badge)

Step 11 (Positioning):
  if faces.length > 0: Agente (complex positioning)
  else: Worker (default spacing)
```

---

## DECISION E: Separation of Concerns Fixes

### Fix 1: Step 7 → 7a, 7b, 7c

**Problem:** Step 7 does THREE things (design CTA + design badge + validate)

**Solution:**

```
Step 7a: Design CTA Component (Atom)
  responsavel_type: Agente | Worker
  atomic_layer: Atom
  output: ctaComponent { text, style, colors }

Step 7b: Design Badge Component (Atom)
  responsavel_type: Agente | Worker
  atomic_layer: Atom
  output: badgeComponent { text, style, colors } | null

Step 7c: Validate Components (Post-condition)
  responsavel_type: Clone (Brad Frost)
  atomic_layer: Atom
  output: validation_result { valid, violations }
```

---

### Fix 2: Step 8 → 8a, 8b, 8c

**Problem:** Step 8 skips Molecule layer and conflates Organism + Positioning

**Solution:**

```
Step 8a: Compose Text Group (Molecule)
  responsavel_type: Agente
  atomic_layer: Molecule
  input: typography.title, typography.body, ctaComponent
  output: textGroupMolecule { title, body, cta }

Step 8b: Compose Action Group (Molecule) (optional)
  responsavel_type: Agente
  atomic_layer: Molecule
  input: ctaComponent, badgeComponent
  output: actionGroupMolecule { cta, badge }
  skippable_when: [badgeComponent=null]

Step 8c: Compose Content Area (Organism)
  responsavel_type: Agente
  atomic_layer: Organism
  input: textGroupMolecule, actionGroupMolecule, imageUrl, brand
  output: contentAreaOrganism { structure, alignment }
  # NO positioning data!
```

---

### Fix 3: Step 13 → 13a, 13b

**Problem:** Step 13 does THREE things (inject CSS + render HTML + populate)

**Solution:**

```
Step 13a: Inject CSS Variables
  responsavel_type: Worker
  atomic_layer: Template
  input: positioning, designTokens, formatConfig
  output: cssVars object

Step 13b: Render HTML Template
  responsavel_type: Worker
  atomic_layer: Template
  input: templateId, cssVars, contentAreaOrganism, adSpec
  output: htmlContent (final HTML string)
  # Handlebars compilation includes population
```

---

## DECISION F: Parallelization Opportunities

### Parallel Group 1: Configuration (Steps 1 + 2)

```javascript
const [formatConfig, brand] = await Promise.all([
  loadFormatConfig(format_id),  // Step 1
  loadBrand(brand_id)            // Step 2
]);
```

**Savings:** ~100ms

---

### Parallel Group 2: Template + Image (Steps 4 + 9)

```javascript
// After Step 5 (Craft Copy)
const [selectedTemplate, visualPlan] = await Promise.all([
  selectTemplate(adAnalysis, brand),  // Step 4
  selectImage(adAnalysis, adCopy)     // Step 9
]);
```

**Savings:** ~2-3 seconds

---

### Parallel Group 3: CTA + Badge (Steps 7a + 7b)

```javascript
const [ctaComponent, badgeComponent] = await Promise.all([
  designCTAComponent(typography.cta, brand),    // Step 7a
  urgencyLevel === 'high' 
    ? designBadgeComponent(adAnalysis, brand)   // Step 7b
    : Promise.resolve(null)
]);
```

**Savings:** ~1-2 seconds (if both run)

---

### Parallel Group 4: Positioning + Tokens (Steps 11 + 12)

**BETTER:** Move Step 12 EARLIER (after Step 1) and cache globally

```javascript
// Step 1 completion → immediately load tokens
const formatConfig = await loadFormatConfig(format_id);
const designTokens = await loadDesignTokens(formatConfig);  // Cache!

// Later, Step 11 runs alone (no parallelization needed)
```

**Savings:** ~500ms (one-time load, cached for all subsequent ads)

---

### Total Parallelization Savings

- Group 1: ~100ms
- Group 2: ~2500ms
- Group 3: ~1500ms (conditional)
- Group 4: ~500ms (via caching)

**Total: ~4.6 seconds (30-40% faster)**

---

## DECISION G: Error Handling Strategy

### Strategy 1: Retry (Transient Errors)

```yaml
**Error Handling:**
- strategy: retry
- retry:
    max_attempts: 3
    backoff: exponential
    backoff_ms: 1000  # 1s, 2s, 4s
- abort_workflow: false
- notification: log

# Use for: API timeouts, rate limits, network errors
```

---

### Strategy 2: Fallback (Recoverable Errors)

```yaml
**Error Handling:**
- strategy: fallback
- fallback: Use default value or skip step
- retry:
    max_attempts: 1
    backoff: linear
    backoff_ms: 0
- abort_workflow: false
- notification: log + warning

# Use for: AI failures, optional steps, non-critical tasks
```

---

### Strategy 3: Abort (Critical Errors)

```yaml
**Error Handling:**
- strategy: abort
- retry:
    max_attempts: 2
    backoff: linear
    backoff_ms: 500
- abort_workflow: true
- notification: log + email + slack

# Use for: Missing config, invalid brand_id, template not found
```

---

### Error Strategy per Step

| Step | Strategy | Fallback/Retry | Abort Workflow? |
|------|----------|----------------|-----------------|
| 0 | abort | Retry 2x | ✅ Yes |
| 1 | abort | Retry 2x | ✅ Yes |
| 2 | abort | Retry 2x | ✅ Yes |
| 3 | fallback | Use ready_copy or defaults | ❌ No |
| 4 | fallback | Use default template | ❌ No |
| 5 | fallback | Use ready_copy | ❌ No |
| 6 | retry | Retry 3x | ❌ No |
| 7a | fallback | Use brand colors | ❌ No |
| 7b | skip | N/A (optional) | ❌ No |
| 7c | abort | Retry 1x | ✅ Yes (validation critical) |
| 8a-8c | retry | Retry 3x | ❌ No |
| 9 | fallback | Use placeholder image | ❌ No |
| 10 | retry | Retry 3x | ❌ No |
| 11 | fallback | Use default spacing | ❌ No |
| 12 | abort | Retry 2x | ✅ Yes |
| 13a-13b | abort | Retry 2x | ✅ Yes |
| 14 | abort | Retry 2x | ✅ Yes |

---

## DECISION H: Performance Optimization

### Cache Strategy

| Item | Cache Key | TTL | Rationale |
|------|-----------|-----|-----------|
| Format Config | `format_${format_id}_${orientation}` | Infinite | Never changes |
| Brand Config | `brand_${brand_id}` | 1 hour | Might update |
| Design Tokens | `tokens_${format_id}` | Infinite | Per format, static |
| Templates | `template_${template_id}_v${version}` | Infinite | Versioned |

### Early Exit Strategy

| Step | Skippable When | Savings |
|------|----------------|---------|
| 3 | `ready_copy=true` | ~4s, $0.0025 |
| 4 | `template_id` provided | ~3s, $0.0003 |
| 5 | `ready_copy=true` | ~5s, $0.005 |
| 7a | `ready_copy=true` | ~2s, $0.003 |
| 7b | `urgencyLevel!='high'` | ~2s, $0.003 |
| 11 | `faces.length=0` (potential) | ~1s, $0.001 |

**Ready Copy Mode Total Savings:** ~16s, $0.0145 per ad

---

## DECISION I: Molecule Layer Addition

### NEW: Step 8a (Text Group Molecule)

```yaml
#### Step 8a: Compose Text Group (Molecule)

task: composeTextGroup()
responsável: Layout Composer
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: typography
  tipo: object { title, body, cta }
  origem: Step 6
  obrigatório: true

**Saída:**
- campo: textGroupMolecule
  tipo: object { title, body, cta, groupType: "vertical_stack" }
  destino: Step 8c
  persistido: true

**Rationale:** Text group is reusable across templates. Different templates (hero-overlay, split-screen, minimal) can use SAME text group molecule.
```

---

### NEW: Step 8b (Action Group Molecule)

```yaml
#### Step 8b: Compose Action Group (Molecule)

task: composeActionGroup()
responsável: Layout Composer
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: ctaComponent
  tipo: object { text, style, colors }
  origem: Step 7a
  obrigatório: true

- campo: badgeComponent
  tipo: object { text, style, colors } | null
  origem: Step 7b
  obrigatório: false

**Saída:**
- campo: actionGroupMolecule
  tipo: object { cta, badge, groupType: "stacked_with_badge" | "cta_only" }
  destino: Step 8c
  persistido: true

**Skippable When:** badgeComponent=null (optional molecule)

**Rationale:** Action group (CTA + optional Badge) is a common pattern across ad templates.
```

---

## Summary: v3.0 vs v2.0

| Aspect | v2.0 | v3.0 | Improvement |
|--------|------|------|-------------|
| **Steps** | 14 | 19 | +35% granularity |
| **Atomic Design Layers** | Implicit | Explicit | +100% clarity |
| **Executor Types Defined** | 0% | 100% | All steps typed |
| **Checklists Structured** | 0% | 100% | Pre/post/acceptance |
| **Molecule Layer** | Missing | Added | +Reusability |
| **Parallelization** | 0 groups | 4 groups | ~4.6s savings |
| **Error Handling** | Implicit | Explicit | +Robustness |
| **Performance Tracking** | Missing | Complete | +Observability |
| **Naming Consistency** | 5/10 | 10/10 | +Clarity |
| **Testability** | 4/10 | 9/10 | +Isolation |

---

**END OF V3 ARCHITECTURAL DECISIONS**

**Next:** Generate WORKFLOW-COMPLETE-CONSOLIDATED-V3.md

