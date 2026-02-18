# Integrate with Squad

> Task ID: atlas-integrate-squad
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Connect design system with MMOS, CreatorOS, or InnerLens expansion packs. Generates pack-specific patterns, token variations, and integration documentation.

## Prerequisites

- Design system setup complete
- Components built
- Target expansion pack installed

## Workflow

### Steps

1. **Detect Target Pack** - Identify MMOS, CreatorOS, or InnerLens
2. **Load Pack Requirements** - Read pack-specific pattern needs
3. **Generate Token Variations** - Personality/theme-based tokens
4. **Generate Pack-Specific Patterns** - Custom components for pack
5. **Create Integration Hooks** - Connect pack workflows
6. **Generate Integration Docs** - Usage guide for pack
7. **Test Integration** - Validate pack can use patterns
8. **Update State** - Track integration completion

## Output

- Pack-specific components
- Token variations
- Integration documentation
- Example usage

## Success Criteria

- [ ] Pack can import and use design system
- [ ] Token variations work correctly
- [ ] Pack-specific patterns functional
- [ ] Integration documented
- [ ] No regressions in pack functionality

## Examples

### MMOS Integration

```typescript
// Personality token variations
{
  formal: {
    fontFamily: 'var(--font-serif)',
    spacing: 'var(--space-formal)',
    colorPrimary: 'var(--color-corporate)'
  },
  casual: {
    fontFamily: 'var(--font-sans)',
    spacing: 'var(--space-relaxed)',
    colorPrimary: 'var(--color-friendly)'
  }
}

// CloneChatInterface component
<CloneChatInterface
  personality="formal"
  tokens={personalityTokens.formal}
/>
```

### CreatorOS Integration

```typescript
// Educational token variations
{
  fonts: 'readable (18px)',
  lineHeight: '1.6 (comprehension)',
  spacing: 'generous',
  colors: 'highlight focus'
}

// CourseVideoPlayer component
<CourseVideoPlayer
  tokens={educationalTokens}
  accessibility="WCAG AAA"
/>
```

### InnerLens Integration

```typescript
// Minimal distraction tokens
{
  colors: 'neutral, minimal',
  layout: 'clean, focused',
  spacing: 'balanced'
}

// AssessmentForm component
<AssessmentForm
  tokens={minimalTokens}
  validationUI={systemValidation}
/>
```

## Notes

- Each pack has unique requirements
- Token variations maintain consistency
- Pack-specific components extend base system
- Integration is bidirectional (pack ↔ design system)
- Document in pack's README

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

