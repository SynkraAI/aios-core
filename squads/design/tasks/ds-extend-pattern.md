# Extend Existing Pattern

> Task ID: atlas-extend-pattern
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Add new variant, size, or feature to existing component without breaking compatibility. Maintains consistency with design system patterns.

## Prerequisites

- Component exists
- Design system setup complete
- Tokens available for new variant

## Workflow

### Steps

1. **Load Existing Component** - Read component file and structure
2. **Validate Extension Request** - Check compatibility with existing API
3. **Add New Variant/Size** - Extend props and implementation
4. **Update Styles** - Add new variant styles using tokens
5. **Update Tests** - Add tests for new variant
6. **Update Stories** - Add story for new variant
7. **Update Documentation** - Document new variant
8. **Validate Backward Compatibility** - Ensure existing usage still works

## Output

- Updated component file
- Updated styles
- Updated tests
- Updated documentation

## Success Criteria

- [ ] New variant implemented correctly
- [ ] Backward compatible (existing code works)
- [ ] Tests updated and passing
- [ ] Documentation reflects changes
- [ ] No breaking changes

## Example

```bash
*extend button --variant warning

Atlas: "Adding 'warning' variant to Button..."
✓ Updated Button.tsx (new variant prop)
✓ Updated Button.module.css (warning styles)
✓ Updated Button.test.tsx (warning tests)
✓ Updated Button.stories.tsx (warning story)
✓ Backward compatibility: ✓

Warning variant uses:
  - color: var(--color-warning)
  - color (hover): var(--color-warning-dark)
```

## Notes

- Maintain prop interface compatibility
- Add, don't replace
- Test existing variants still work
- Document migration if API changes

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

