# Design Principles - EcoFlow Design System

## Overview

The EcoFlow Design System is built on a foundation of design principles that ensure consistency, accessibility, and usability across all components and applications.

## Core Principles

### 1. **Consistency First**

Maintain visual and behavioral consistency across all components and interactions.

**Why it matters:**
- Reduces cognitive load for users
- Creates predictable user experiences
- Simplifies development and maintenance

**How we achieve it:**
- Unified design token system
- Consistent component API patterns
- Standardized interaction patterns
- Comprehensive Storybook documentation

**Example:**
```tsx
// All buttons follow the same pattern
<Button variant="primary" size="md">Primary Action</Button>
<Button variant="secondary" size="md">Secondary Action</Button>
<Button variant="outline" size="md">Outline Action</Button>
```

### 2. **Accessibility by Default**

Design for everyone, not just the average user. WCAG 2.1 AA compliance minimum.

**Why it matters:**
- Inclusive design benefits all users
- Legal compliance requirements
- Broader market reach

**How we achieve it:**
- Proper ARIA attributes on all components
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Focus management

**Example:**
```tsx
// Alert with proper accessibility
<Alert
  variant="error"
  role="alert"           // Proper ARIA role
  aria-live="polite"     // Screen reader announcement
>
  Error message
</Alert>
```

### 3. **Mobile-First, Desktop-Optimized**

Design for mobile devices first, then enhance for larger screens.

**Why it matters:**
- Mobile usage continues to grow
- Progressive enhancement approach
- Better performance on constrained devices

**How we achieve it:**
- Responsive component sizing
- Touch-friendly interaction targets
- Flexible layouts with Stack/Grid
- Container size breakpoints

**Example:**
```tsx
// Responsive grid
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap={4}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

### 4. **Progressive Disclosure**

Show only what users need, when they need it.

**Why it matters:**
- Reduces overwhelming interfaces
- Improves task completion rates
- Better mobile experiences

**How we achieve it:**
- Collapsible Sidebar navigation
- Modal dialogs for focused tasks
- Tabs for organized content
- Expandable sections

**Example:**
```tsx
// Collapsible navigation
<Sidebar collapsed={isCollapsed} onToggle={setCollapsed}>
  {/* Navigation items */}
</Sidebar>
```

### 5. **Performance Matters**

Fast, lightweight components that don't compromise user experience.

**Why it matters:**
- User satisfaction and retention
- SEO rankings
- Accessibility (faster = more accessible)

**How we achieve it:**
- Minimal dependencies
- Tree-shakeable exports
- Optimized bundle size
- CSS-in-JS with inline styles (no runtime CSS processing)

**Bundle Size:**
- Core tokens: < 10KB gzipped
- Individual components: 2-5KB each
- Full library: < 50KB gzipped

### 6. **Developer Experience**

Make it easy for developers to build great user experiences.

**Why it matters:**
- Faster development cycles
- Fewer bugs and errors
- Better adoption rates

**How we achieve it:**
- Full TypeScript support with IntelliSense
- Comprehensive Storybook documentation
- Clear, consistent API patterns
- Helpful prop types and error messages

**Example:**
```typescript
// Full TypeScript support
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  // ... autocomplete helps developers
}
```

## Visual Identity

### Color System

The EcoFlow design system uses a professional, modern color palette:

**Primary Color: Teal/Cyan**
- Main brand color: `#00a896`
- Professional, modern, trustworthy
- Excellent for project management and dashboard interfaces

**Accent Color: Warm Yellow**
- Attention-drawing: `#ffd23f`
- Used for CTAs and important highlights
- Provides visual energy and warmth

**Neutral Colors**
- 10-stop gray scale for text and backgrounds
- Ensures proper contrast ratios
- Supports both light and dark UI elements

**Semantic Colors**
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Info: Blue (#3b82f6)

### Typography

**Font Family:**
- Primary: Inter (modern, highly readable)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- 10 sizes from xs (12px) to 6xl (60px)
- Base size: 16px (1rem)
- Consistent line heights for readability

**Font Weights:**
- Light (300): Subtle text
- Normal (400): Body text
- Medium (500): Emphasized text
- Semibold (600): Headings and labels
- Bold (700): Strong emphasis
- Extrabold (800): Large display text

### Spacing System

**Base Unit: 4px**
- All spacing values are multiples of 4
- Creates visual rhythm and consistency
- 32 spacing stops from 0 to 96

**Common Values:**
- `spacing[2]` = 8px (tight spacing)
- `spacing[4]` = 16px (default spacing)
- `spacing[6]` = 24px (comfortable spacing)
- `spacing[8]` = 32px (generous spacing)

### Elevation System

**8 Shadow Levels:**
- `sm`: Subtle hover states
- `DEFAULT`: Standard cards
- `md`: Elevated cards
- `lg`: Modals and popovers
- `xl`: Dropdown menus
- `2xl`: Large modals
- `inner`: Input fields

**Z-Index Strategy:**
- Base content: 0-10
- Dropdowns/tooltips: 20
- Sticky headers: 30
- Modal overlays: 40
- Modal content: 50

## Component Design Patterns

### Atomic Design Methodology

Components are organized following Atomic Design principles:

**Atoms:** Basic building blocks
- Button, Input, Text, Badge, Avatar

**Molecules:** Simple combinations
- FormField (Label + Input + Helper Text)
- NavItem (Icon + Text + Badge)

**Organisms:** Complex UI sections
- Sidebar, TopBar, Card, Table

**Templates:** Page layouts
- Dashboard layout, Form layout

### Composition over Configuration

Prefer composing simple components over complex configuration:

```tsx
// ✓ Good - composition
<Card
  header={<Heading level="h3">Title</Heading>}
  footer={<Button>Action</Button>}
>
  <Text>Content</Text>
</Card>

// ✗ Avoid - over-configuration
<Card
  title="Title"
  titleLevel="h3"
  actionText="Action"
  actionVariant="primary"
  content="Content"
/>
```

### Controlled vs Uncontrolled

Provide both controlled and uncontrolled modes where appropriate:

```tsx
// Controlled mode
const [value, setValue] = useState('');
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// Uncontrolled mode
<Input defaultValue="initial" />
```

### Prop API Consistency

All components follow consistent patterns:

- `variant`: Visual style variations
- `size`: Size variations (sm, md, lg)
- `disabled`: Disabled state
- `className`: Custom CSS class
- `style`: Custom inline styles
- `children`: Component content (when applicable)

## Accessibility Guidelines

### Color Contrast

- **Normal text:** 4.5:1 minimum contrast ratio
- **Large text:** 3:1 minimum contrast ratio
- **UI elements:** 3:1 minimum contrast ratio

**Implementation:**
```tsx
// Text uses darker shades for contrast
<Text style={{ color: colors.primary[600] }}>  // ✓ AA compliant
<Text style={{ color: colors.primary[400] }}>  // ✗ May fail AA
```

### Keyboard Navigation

All interactive components must be keyboard accessible:

- **Tab:** Navigate between elements
- **Enter/Space:** Activate buttons and controls
- **Arrow keys:** Navigate lists and menus
- **Escape:** Close modals and dropdowns

### Focus Management

- Visible focus indicators on all interactive elements
- Focus trap in modals
- Return focus after modal close
- Skip links for screen reader users

### Screen Reader Support

- Semantic HTML elements
- ARIA labels and roles
- Live regions for dynamic content
- Alternative text for images

## Best Practices

### Do's ✓

1. **Use design tokens** - Always use tokens over hardcoded values
2. **Compose components** - Build complex UIs from simple pieces
3. **Test accessibility** - Verify keyboard and screen reader support
4. **Follow conventions** - Use consistent prop names and patterns
5. **Document usage** - Add Storybook stories for new components
6. **Write tests** - Ensure components work as expected

### Don'ts ✗

1. **Hardcode colors** - Use design tokens instead
2. **Skip accessibility** - Always include ARIA attributes
3. **Over-configure** - Prefer composition over complex props
4. **Ignore TypeScript** - Use proper types for all props
5. **Create one-offs** - Build reusable components
6. **Forget mobile** - Test on mobile devices

## Design Tokens Philosophy

### Single Source of Truth

All design decisions are encoded in design tokens:

```typescript
// ✓ Good - uses tokens
const styles = {
  color: colors.primary[600],
  padding: spacing[4],
  borderRadius: borders.borderRadius.md,
};

// ✗ Avoid - magic numbers
const styles = {
  color: '#00a896',
  padding: '16px',
  borderRadius: '8px',
};
```

### Token Categories

1. **Primitive Tokens:** Raw values (colors, sizes)
2. **Semantic Tokens:** Meaningful names (primary, success)
3. **Component Tokens:** Component-specific (button-padding)

## Responsive Design

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** 1024px - 1280px
- **Large Desktop:** > 1280px

### Container Sizes

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px (primary target)
- `2xl`: 1536px
- `full`: 100%

## Future Considerations

### Dark Mode (Future)

Design system is prepared for dark mode support:
- Token-based color system
- Semantic color mappings
- Component theme switching

### Internationalization (Future)

Consider RTL (right-to-left) languages:
- Logical properties (margin-inline, padding-block)
- Flexible layouts
- Text direction support

### Animation Guidelines (Future)

- Respect reduced motion preferences
- Use CSS transitions for simple animations
- Spring physics for natural motion

---

## References

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens W3C Spec](https://design-tokens.github.io/community-group/format/)
- [Inclusive Components](https://inclusive-components.design/)
