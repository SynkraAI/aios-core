# Rebuild Artifact with Design Tokens

> Task ID: ds-rebuild-artifact
> Agent: design-system
> Version: 1.0.0

## Description

Rebuilds HTML artifact using design tokens to produce clean, token-based version with identical visual output. This is a pragmatic alternative to manual migration - takes messy HTML (inline styles, hardcoded values) and outputs clean HTML using tokens.css.

**Goal**: Same design, better code, in minutes not hours.

## Prerequisites

- Tokenization completed (*tokenize command run successfully)
- tokens.css exists in outputs/design-system/{project}/
- Artifact to rebuild available (file path or HTML content)
- .state.yaml contains token data

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure rebuild.

1. **Select Source Artifact**
   - Ask for artifact source (file path, artifact ID from scan, or paste HTML)
   - Validate artifact exists and is readable
   - Show preview of current state (inline styles count, hardcoded values)

2. **Confirm Rebuild Approach**
   - Show what will be changed (inline → classes, hardcoded → var())
   - Ask if user wants component extraction (optional)
   - Confirm output location

3. **Validate Tokens Available**
   - Check tokens.css exists
   - Show token coverage for this artifact
   - Warn if artifact uses patterns not in token system

### Steps

1. **Load Source Artifact**
   - Read artifact HTML (from file, scan ID, or direct paste)
   - Parse HTML structure
   - Identify current styling approach (inline, hardcoded, mixed)
   - Validation: Valid HTML, parseable structure

2. **Load Token System**
   - Read tokens.css from project directory
   - Parse available tokens (colors, spacing, typography, etc)
   - Build token lookup table
   - Validation: tokens.css valid and complete

3. **Analyze Current Patterns**
   - Extract all color declarations (inline, hardcoded)
   - Extract all spacing values
   - Extract all typography styles
   - Map to nearest token matches
   - Validation: All patterns have token equivalents

4. **Generate Clean HTML Structure**
   - Preserve semantic HTML structure
   - Remove inline styles
   - Apply semantic class names
   - Use token-based utility classes
   - Maintain visual hierarchy
   - Validation: HTML structure preserved

5. **Apply Token-Based Styling**
   - Replace inline colors with token classes (`.text-success`, `.bg-secondary`)
   - Replace hardcoded values with `var()` references
   - Replace spacing with token utilities
   - Replace typography with token classes
   - Validation: Zero hardcoded values, 100% token usage

6. **Generate Companion CSS**
   - Create artifact-specific CSS file (if needed)
   - Use tokens.css as base
   - Add only custom styles not covered by tokens
   - Document any deviations
   - Validation: Minimal custom CSS, extends tokens.css

7. **Visual Validation**
   - Compare visual output (automated if possible)
   - Check color accuracy (HSL distance < 5%)
   - Check spacing consistency
   - Check typography rendering
   - Validation: Visual output matches original

8. **Generate Output Files**
   - Write rebuilt HTML to output directory
   - Copy/link tokens.css
   - Write companion CSS if needed
   - Generate comparison report
   - Validation: All files created successfully

9. **Create Rebuild Report**
   - Document changes made (inline removed, tokens applied)
   - Show before/after metrics
   - List any patterns that couldn't be tokenized
   - Include visual comparison screenshots/descriptions
   - Validation: Complete rebuild documentation

10. **Update State File**
    - Add rebuild to agent history
    - Record artifact ID, output location
    - Update component metrics
    - Set phase flag if applicable
    - Validation: State updated correctly

## Output

- **{artifact-name}-rebuilt.html**: Clean HTML with token-based styling
- **{artifact-name}.css**: Companion CSS (minimal, extends tokens.css)
- **rebuild-report-{artifact-id}.md**: Before/after comparison report
- **.state.yaml**: Updated with rebuild history

### Output Format

```html
<!-- {artifact-name}-rebuilt.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Original Title}</title>

  <!-- Design System Tokens -->
  <link rel="stylesheet" href="tokens.css">

  <!-- Artifact-specific styles (if needed) -->
  <link rel="stylesheet" href="{artifact-name}.css">
</head>
<body>
  <!-- Clean semantic HTML with token classes -->
  <div class="bg-secondary text-primary p-xl rounded-lg">
    <h1 class="text-hero font-bold">Example</h1>
    <span class="text-success">✓</span>
  </div>
</body>
</html>
```

### Rebuild Report Format

```markdown
# Rebuild Report: {artifact-name}

**Artifact ID**: {id}
**Rebuilt**: 2025-10-28
**Agent**: Brad (Design System Architect)

---

## Summary

✅ **Rebuild Complete**
- Visual output: 100% match
- Code quality: Improved 85%
- Token usage: 100%

## Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Inline styles | 110 | 0 | -100% |
| Hardcoded colors | 15 | 0 | -100% |
| Token usage | 0% | 100% | +100% |
| File size | 2.4 KB | 1.8 KB | -25% |
| Maintainability | 15/100 | 95/100 | +533% |

## Changes Made

### Colors
- `style="color: rgb(72, 187, 120)"` → `class="text-success"`
- `#262625` → `var(--bg-secondary)`

### Spacing
- `padding: 16px` → `class="p-lg"`
- `margin: 24px` → `class="m-xl"`

### Typography
- `font-size: 24px` → `class="text-section"`
- `font-weight: 600` → `class="font-semibold"`

## Patterns Not Tokenized

None - 100% token coverage achieved.

## Visual Validation

✅ Colors match (HSL distance < 1%)
✅ Spacing preserved
✅ Typography identical
✅ Layout unchanged

## Next Steps

- Deploy rebuilt version
- Archive old version
- Update references
```

## Success Criteria

- [ ] Original HTML parsed successfully
- [ ] All patterns mapped to tokens
- [ ] Clean HTML generated (zero inline styles)
- [ ] Visual output matches original (automated or manual check)
- [ ] Rebuild report documents all changes
- [ ] State file updated with rebuild metadata

## Error Handling

- **Source artifact not found**: Exit with helpful message, suggest *scan to find artifact IDs
- **tokens.css missing**: Exit with message to run *tokenize first
- **Pattern not in tokens**: Warn user, offer to add to custom CSS or skip
- **HTML parsing error**: Report error location, suggest manual cleanup
- **Visual mismatch**: Generate comparison report, let user decide to accept or reject

## Security Considerations

- Validate HTML input (prevent XSS)
- Sanitize artifact names for file system
- No code execution from artifact content
- Backup original before rebuild
- Rollback option if rebuild fails

## Examples

### Example 1: Rebuild Scanned Artifact

```bash
*rebuild 005
```

**Output:**
```
🔍 Brad: Rebuilding artifact-005 (tabela-comparativa)...

📊 Current State:
  - 110 inline color declarations
  - 45 hardcoded spacing values
  - 15 unique colors (all in token system ✅)

🔨 Rebuilding...
  ✅ HTML structure preserved
  ✅ 110 inline styles → token classes
  ✅ 45 spacing values → token utilities
  ✅ Visual output validated (100% match)

📁 Output:
  - tabela-comparativa-rebuilt.html (1.8 KB, was 2.4 KB)
  - tokens.css (linked)
  - rebuild-report-005.md

⏱️ Rebuild time: 8 minutes

✅ Ready to deploy! Old version backed up.
```

### Example 2: Rebuild from File Path

```bash
*rebuild outputs/courses/claude-code/resources/guia-reducao-tokens-claude.html
```

**Output:**
```
🔍 Brad: Rebuilding from file path...

📊 Current State:
  - Already 95% token-based (artifact-001) ✅
  - Only typography needs tokenization

🔨 Adding typography tokens...
  ✅ Font sizes → token classes
  ✅ Line heights → token utilities
  ✅ 100% token coverage achieved

📁 Output:
  - guia-reducao-tokens-claude-rebuilt.html
  - rebuild-report-001.md

✅ Polish complete! Now 100% token-based.
```

### Example 3: Rebuild with Component Extraction

```bash
*rebuild 005 --extract-components
```

**Output:**
```
🔍 Brad: Rebuilding with component extraction...

🧩 Components Identified:
  - StatusIcon (✓, ◐, ✕) - 45 instances
  - ComparisonCell - 30 instances
  - TableHeader - 5 instances

🔨 Extracting components...
  ✅ StatusIcon.html (reusable component)
  ✅ ComparisonCell.html (reusable component)
  ✅ tabela-comparativa-rebuilt.html (uses components)

📁 Output:
  - tabela-comparativa-rebuilt.html
  - components/StatusIcon.html
  - components/ComparisonCell.html
  - rebuild-report-005.md

✅ Ready for component library integration!
```

## Notes

- Rebuild is **non-destructive** - original artifact preserved
- Visual validation is critical - always review output
- Rebuild time: ~10 minutes per artifact (vs hours of manual migration)
- Components can be extracted optionally for reuse
- Rebuilt artifacts are standalone (include tokens.css)
- Brad recommends: Rebuild artifacts 004-005 first (highest inline style count)
- After rebuild, use rebuilt version as new source of truth
- Original artifacts can be archived or deleted

## Comparison: Rebuild vs Migrate

| Aspect | *rebuild | *migrate |
|--------|----------|----------|
| **Speed** | 10 min/artifact | 12+ hours total |
| **Approach** | Automated rebuild | Manual step-by-step |
| **Output** | New clean files | Modified existing |
| **Risk** | Low (original preserved) | Medium (changes in place) |
| **Best for** | Small # of artifacts | Large codebase |
| **Learning** | Fast results | Educational process |

**Use *rebuild when**: You have 5-10 artifacts and want fast results
**Use *migrate when**: You have large codebase and need phased rollout

---

*Brad's recommendation: "Rebuild is faster. Migration is safer at scale. Pick based on your context."*
