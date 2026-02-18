# Generate Pattern Library Documentation

> Task ID: atlas-generate-documentation
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Generate comprehensive pattern library documentation from built components. Creates searchable, navigable docs with usage examples, prop tables, accessibility notes, and live previews.

## Prerequisites

- At least 1 component built
- Design system setup complete
- Component .md files exist

## Workflow

### Steps

1. **Scan Built Components** - Find all atoms, molecules, organisms
2. **Parse Component Metadata** - Extract props, types, variants
3. **Generate Pattern Library Index** - Main navigation page
4. **Generate Component Pages** - Detailed pages per component
5. **Generate Usage Examples** - Code snippets and live previews
6. **Generate Accessibility Guide** - WCAG compliance notes
7. **Generate Token Reference** - Token usage documentation
8. **Create Search Index** - Searchable component library

## Output

- **index.md**: Pattern library homepage
- **components/{Component}.md**: Per-component pages
- **tokens.md**: Token reference guide
- **accessibility.md**: Accessibility guidelines
- **getting-started.md**: Setup and usage guide

## Success Criteria

- [ ] All components documented
- [ ] Props documented with types
- [ ] Usage examples for each variant
- [ ] Accessibility notes included
- [ ] Searchable and navigable
- [ ] Up-to-date with latest components

## Example

```bash
*document
```

Output:
```
📚 Atlas: Generating pattern library documentation...

Scanning components:
  ✓ 8 atoms found
  ✓ 5 molecules found
  ✓ 2 organisms found

Generating documentation:
  ✓ index.md (pattern library home)
  ✓ components/Button.md
  ✓ components/Input.md
  ✓ components/FormField.md
  ...
  ✓ tokens.md (token reference)
  ✓ accessibility.md (WCAG guide)
  ✓ getting-started.md

✅ Pattern library: design-system/docs/

Atlas says: "Documentation is code. Keep it fresh."
```

## Notes

- Auto-generates from TypeScript types
- Updates when components change
- Includes live Storybook links (if enabled)
- Searchable by component name, prop, or token

---

## Glossary

> Full glossary: [design-glossary.md](../data/design-glossary.md)

**Key terms for this task:**

- **Design tokens** — Platform-agnostic key-value pairs encoding design decisions (colors, spacing, typography)
- **Pattern consolidation** — Merging similar UI patterns to reduce redundancy
- **Greenfield** — Starting from scratch; **Brownfield** — Integrating into existing codebase
- **State file (.state.yaml)** — Progress tracking file for audit/extraction state
- **Component API** — Props interface defining how a component is consumed

---

## Don't Do

- Do not skip the consolidation phase — extracting tokens from unconsolidated patterns produces duplicates
- Do not create tokens with descriptive names (blue-500) instead of semantic names (primary)
- Do not hardcode values in components when a token exists — always reference the token
- Do not modify .state.yaml manually — let the task update it programmatically
- Do not assume greenfield when the codebase has existing styles — check for brownfield indicators first

