# Build Production-Ready Component

> Task ID: atlas-build-component
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Generate production-ready React TypeScript component from design tokens. Includes component file, styles (CSS Modules), tests, optional Storybook stories, and documentation. All styling uses tokens (zero hardcoded values).

## Prerequisites

- Setup completed (*setup command run successfully)
- Tokens loaded and accessible
- React and TypeScript configured

## Workflow

### Interactive Elicitation

This task uses interactive elicitation to configure component.

1. **Select Component Type**
   - Atomic level (atom, molecule, organism)
   - Component name (Button, Input, Card, etc)
   - Confirm token availability for this component

2. **Configure Component Features**
   - Variants needed (primary, secondary, destructive)
   - Sizes needed (sm, md, lg)
   - States needed (hover, disabled, loading, error)
   - Additional props

3. **Review Generation Plan**
   - Show files to be generated
   - Confirm test coverage requirements
   - Ask for Storybook stories (if enabled)

### Steps

1. **Validate Prerequisites**
   - Check tokens are loaded
   - Verify component doesn't already exist (or confirm overwrite)
   - Validate component name (PascalCase)
   - Validation: Ready to generate

2. **Load Token References**
   - Identify which tokens this component needs
   - Validate token availability
   - Generate token import statements
   - Validation: All required tokens exist

3. **Generate Component File**
   - Create TypeScript React component
   - Add prop type definitions (strict typing)
   - Implement variants, sizes, states
   - Add accessibility attributes (ARIA)
   - Use semantic HTML elements
   - Validation: Valid TypeScript, compiles without errors

4. **Generate Component Styles**
   - Create CSS Module file ({Component}.module.css)
   - Use CSS custom properties from tokens
   - Implement all variants and states
   - Add responsive styles if needed
   - Zero hardcoded values (all from tokens)
   - Validation: Valid CSS, tokens referenced correctly

5. **Generate Unit Tests**
   - Create test file ({Component}.test.tsx)
   - Test all variants render correctly
   - Test all sizes work
   - Test disabled state
   - Test onClick/events
   - Aim for >80% coverage
   - Validation: Tests pass, good coverage

6. **Generate Storybook Stories (Optional)**
   - If Storybook enabled, create {Component}.stories.tsx
   - Story for each variant
   - Story for each size
   - Interactive controls for props
   - Validation: Stories display correctly

7. **Run Accessibility Checks**
   - Validate ARIA attributes present
   - Check color contrast (WCAG AA minimum)
   - Ensure keyboard navigation works
   - Add focus indicators
   - Validation: Meets WCAG AA standards

8. **Generate Component Documentation**
   - Create {Component}.md in docs/
   - Document props and types
   - Show usage examples
   - List variants and sizes
   - Include accessibility notes
   - Validation: Documentation complete

9. **Update Component Index**
   - Add to design-system/index.ts
   - Export component for easy import
   - Update barrel exports
   - Validation: Component importable

10. **Update State File**
    - Add component to patterns_built in .state.yaml
    - Record atomic level, variants, test coverage
    - Increment component count
    - Validation: State tracking updated

## Output

- **{Component}.tsx**: React TypeScript component
- **{Component}.module.css**: Styles using tokens
- **{Component}.test.tsx**: Unit tests
- **{Component}.stories.tsx**: Storybook stories (optional)
- **{Component}.md**: Component documentation
- **Updated index.ts**: Component exported
- **.state.yaml**: Updated with component metadata

### Output Format

```typescript
// Button.tsx
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const className = `${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};
```

```css
/* Button.module.css */
.btn {
  font-family: var(--font-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-base);
  padding: var(--space-md) var(--space-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-secondary);
  color: white;
}

.btn-destructive {
  background: var(--color-error);
  color: white;
}

.btn-sm {
  font-size: var(--font-size-sm);
  padding: var(--space-sm) var(--space-md);
}

.btn-lg {
  font-size: var(--font-size-lg);
  padding: var(--space-lg) var(--space-xl);
}
```

## Success Criteria

- [ ] Component compiles without TypeScript errors
- [ ] All styling uses tokens (zero hardcoded values)
- [ ] Props fully typed with TSDoc comments
- [ ] All variants and sizes implemented
- [ ] Disabled state handled correctly
- [ ] WCAG AA accessibility standards met
- [ ] Unit tests pass with >80% coverage
- [ ] Component documented with examples
- [ ] Storybook stories work (if enabled)

## Error Handling

- **Token not found**: Report which token is missing, suggest alternatives
- **Component exists**: Ask to overwrite or use different name
- **TypeScript errors**: Display errors, suggest fixes
- **Test failures**: Show failing tests, don't complete until fixed
- **Accessibility violations**: Warn and suggest improvements

## Security Considerations

- Sanitize component name (prevent injection)
- Validate token references
- Escape user content in examples
- No eval() or dynamic code execution

## Examples

### Example 1: Build Button Component

```bash
*build button
```

Output:
```
🏗️ Atlas: Building Button component...

📋 Configuration:
  - Type: Atom
  - Variants: primary, secondary, destructive
  - Sizes: sm, md, lg
  - Tests: Yes (>80% coverage)
  - Storybook: Yes

✓ Generated Button.tsx (142 lines)
✓ Generated Button.module.css (89 lines, 0 hardcoded values)
✓ Generated Button.test.tsx (18 tests)
✓ Generated Button.stories.tsx (6 stories)
✓ Generated Button.md (documentation)

🧪 Running tests...
  ✓ renders with default props
  ✓ renders all variants correctly
  ✓ renders all sizes correctly
  ✓ handles disabled state
  ✓ calls onClick handler
  ... 13 more tests
  Coverage: 94.2%

♿ Accessibility check:
  ✓ ARIA attributes present
  ✓ Color contrast: 4.8:1 (WCAG AA ✓)
  ✓ Keyboard navigable
  ✓ Focus indicators visible

✅ Button component ready!

Import: import { Button } from '@/design-system';
Usage: <Button variant="primary">Click me</Button>

Atlas says: "Built right. Built once."
```

### Example 2: Build Input Component

```bash
*build input
```

Output includes additional features:
- Validation states (error, success)
- Helper text prop
- Label integration
- Icon slots

## Notes

- All components strictly typed with TypeScript
- Zero hardcoded values enforced (tokens only)
- Accessibility is non-negotiable (WCAG AA minimum)
- Test coverage >80% required
- CSS Modules scope styles automatically
- Variants and sizes are extensible
- Components are tree-shakeable
- Storybook stories enable visual testing
- Documentation auto-generated from types
- Components follow Atomic Design principles
- Atlas ensures quality at every step
