# Extract Design Tokens from Consolidated Patterns

> Task ID: brad-extract-tokens
> Agent: Brad (Design System Architect)
> Version: 1.0.0

## Description

Generate design token system from consolidated patterns. Exports to multiple formats (YAML, JSON, CSS custom properties, Tailwind config, SCSS variables) with semantic naming conventions.

## Prerequisites

- Consolidation completed (*consolidate command run successfully)
- .state.yaml contains consolidation data
- Consolidated pattern files exist (color-clusters.txt, spacing-consolidation.txt, etc)

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure token generation.

1. **Review Consolidation Results**
   - Display consolidation summary (colors, buttons, spacing, typography)
   - Confirm token generation from these patterns
   - Ask for naming preferences (kebab-case default)

2. **Select Export Formats**
   - Ask which formats to export (JSON, CSS, Tailwind, SCSS, all)
   - Confirm output directory
   - Check for existing token files (overwrite warning)

3. **Validate Token Coverage**
   - Show coverage percentage (tokens cover X% of original usage)
   - Target: >95% coverage
   - Ask for approval before generating

### Steps

1. **Load Consolidation Data**
   - Read .state.yaml consolidation section
   - Load consolidated pattern files
   - Validate consolidation phase completed
   - Validation: Consolidation data exists and complete

2. **Extract Color Tokens**
   - Read color-clusters.txt
   - Generate semantic names (primary, primary-dark, error, success, etc)
   - Detect relationships (hover states, light/dark variants)
   - Create color token structure
   - Validation: All consolidated colors have token names

3. **Extract Spacing Tokens**
   - Read spacing-consolidation.txt
   - Map spacing values to semantic scale (xs, sm, md, lg, xl, 2xl, 3xl)
   - Generate both padding and margin tokens
   - Validation: Complete spacing scale created

4. **Extract Typography Tokens**
   - Read typography-consolidation.txt
   - Create font-family tokens
   - Create font-size tokens with semantic names
   - Create font-weight tokens
   - Create line-height tokens (calculated from sizes)
   - Validation: Complete typography system

5. **Extract Button Tokens**
   - Read button-consolidation.txt
   - Generate button variant tokens (primary, secondary, destructive)
   - Generate button size tokens (sm, md, lg)
   - Map colors and spacing to button tokens
   - Validation: Button tokens reference color/spacing tokens

6. **Generate tokens.yaml (Source of Truth)**
   - Create structured YAML with all token categories
   - Include metadata (version, generated timestamp, Brad signature)
   - Add comments explaining token usage
   - Validation: Valid YAML syntax

7. **Export to JSON**
   - Convert tokens.yaml to tokens.json
   - Flat structure for JavaScript imports
   - Validation: Valid JSON, importable by JS/TS

8. **Export to CSS Custom Properties**
   - Generate tokens.css with :root {} block
   - Convert token names to --token-name format
   - Add CSS comments for organization
   - Validation: Valid CSS, testable in browser

9. **Export to Tailwind Config**
   - Generate tokens.tailwind.js
   - Map tokens to Tailwind theme.extend structure
   - Preserve Tailwind conventions
   - Validation: Valid Tailwind config format

10. **Export to SCSS Variables**
    - Generate tokens.scss
    - Convert to $token-name format
    - Add SCSS comments
    - Validation: Valid SCSS syntax

11. **Validate Token Coverage**
    - Calculate how many original patterns are covered
    - Target: >95% coverage
    - Report any gaps
    - Validation: Coverage meets threshold

12. **Update State File**
    - Add tokens section to .state.yaml
    - Record token counts, locations, exports
    - Update phase to "tokenize_complete"
    - Validation: State updated, ready for Atlas or migration

## Output

- **tokens.yaml**: Source of truth with all design tokens
- **tokens.json**: JavaScript/TypeScript import format
- **tokens.css**: CSS custom properties (:root)
- **tokens.tailwind.js**: Tailwind config format
- **tokens.scss**: SCSS variables format
- **token-coverage-report.txt**: Coverage analysis
- **.state.yaml**: Updated with token metadata

### Output Format

```yaml
# tokens.yaml
version: "1.0.0"
generated_by: "Brad (Design System Architect)"
generated_at: "2025-10-27T13:00:00Z"

color:
  primary: "#0066CC"
  primary-dark: "#0052A3"
  secondary: "#6B7280"
  error: "#DC2626"
  error-light: "#FEE2E2"
  success: "#059669"
  success-light: "#D1FAE5"
  warning: "#F59E0B"
  neutral-50: "#F9FAFB"
  neutral-100: "#F3F4F6"
  neutral-900: "#111827"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

typography:
  font-base: "Inter, system-ui, sans-serif"
  font-mono: "JetBrains Mono, monospace"
  size-xs: "12px"
  size-sm: "14px"
  size-base: "16px"
  size-lg: "20px"
  size-xl: "24px"
  size-2xl: "32px"
  weight-light: 300
  weight-normal: 400
  weight-semibold: 600
  weight-bold: 700
  line-tight: 1.25
  line-normal: 1.5
  line-relaxed: 1.75

radius:
  sm: "4px"
  base: "8px"
  lg: "12px"
  full: "9999px"

shadow:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)"
```

## Success Criteria

- [ ] All consolidated patterns converted to tokens
- [ ] Semantic naming follows conventions (kebab-case)
- [ ] Hover states and variants detected automatically
- [ ] All 5 export formats generated successfully
- [ ] Token coverage >95% of original patterns
- [ ] Valid syntax in all export formats
- [ ] State file updated with token locations

## Error Handling

- **No consolidation data**: Exit with message to run *consolidate first
- **Invalid consolidated patterns**: Log which patterns failed, continue with valid ones
- **Export format error**: Validate syntax, report errors, fix or skip format
- **Low coverage (<95%)**: Warn user, suggest additional consolidation

## Security Considerations

- Validate color values (hex, rgb, hsl formats only)
- Sanitize token names (alphanumeric, hyphens, underscores only)
- Prevent code injection in exported files
- Validate YAML/JSON syntax before writing

## Examples

### Example 1: Full Token Generation

```bash
*tokenize
```

Output:
```
🔍 Brad: Extracting tokens from consolidated patterns...

🎨 Color tokens: 12 created
📏 Spacing tokens: 7 created
📝 Typography tokens: 10 created
🔘 Button variant tokens: 3 created

📊 Token Coverage: 96.3% of original patterns

✅ Exported to 5 formats:
  - tokens.yaml (source of truth)
  - tokens.json (JavaScript)
  - tokens.css (CSS custom properties)
  - tokens.tailwind.js (Tailwind config)
  - tokens.scss (SCSS variables)

✅ State updated: outputs/design-system/my-app/.state.yaml

Ready for Atlas to build components or generate migration strategy.
```

### Example 2: CSS Output Preview

```css
/* tokens.css */
:root {
  /* Colors */
  --color-primary: #0066CC;
  --color-primary-dark: #0052A3;
  --color-error: #DC2626;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;

  /* Typography */
  --font-base: Inter, system-ui, sans-serif;
  --font-size-base: 16px;
  --font-weight-normal: 400;
}
```

## Notes

- tokens.yaml is the single source of truth - all exports generated from it
- Semantic naming > descriptive naming (use "primary" not "blue-500")
- Hover states auto-detected by "-dark" suffix
- Coverage <95% means some patterns weren't consolidated
- Export formats stay in sync - update tokens.yaml and regenerate all
- Brad recommends: Run *migrate next to create migration strategy
- For component generation, hand off to Atlas: *agent atlas
