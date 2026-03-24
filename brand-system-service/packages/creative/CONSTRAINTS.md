# Creative Package Constraints

## CSS Grid NOT Supported by Satori (ADR-005)

**Satori does NOT support CSS Grid layout.** All template components MUST use **flexbox only** for layout.

### What This Means

- No `display: grid` in any template component
- No `grid-template-columns`, `grid-template-rows`, `grid-gap`, or any CSS Grid property
- All layouts must use `display: flex` with `flexDirection`, `flexWrap`, `justifyContent`, `alignItems`, etc.

### Why

Satori is a lightweight JSX-to-SVG renderer designed for serverless edge environments. It implements a subset of CSS that includes flexbox but excludes CSS Grid. This is a known limitation documented by Vercel.

### Workarounds

For layouts that would traditionally use CSS Grid:

1. **Nested flexbox** -- Use nested `<div style={{ display: 'flex' }}>` containers to achieve grid-like layouts
2. **Fixed-width flex items** -- Use `flexBasis` or explicit `width` on flex items to simulate columns
3. **Puppeteer fallback** -- For layouts that absolutely require CSS Grid, consider a Puppeteer-based rendering path (out of scope for the current pipeline; would be a separate story)

### Examples

```tsx
// WRONG - CSS Grid (will not render correctly)
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
  <div>Left</div>
  <div>Right</div>
</div>

// CORRECT - Flexbox equivalent
<div style={{ display: 'flex', flexDirection: 'row' }}>
  <div style={{ flex: 1 }}>Left</div>
  <div style={{ flex: 1 }}>Right</div>
</div>
```

### Reference

- [Satori Supported CSS](https://github.com/vercel/satori#css)
- ADR-005: Creative Rendering Pipeline (Satori + Sharp)
