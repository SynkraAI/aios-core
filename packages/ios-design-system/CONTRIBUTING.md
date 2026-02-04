# Contributing to iOS Design System

Thank you for your interest in contributing to the iOS Design System! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Component Guidelines](#component-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and iOS design patterns

### Setup

1. Clone the repository:
```bash
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core/packages/ios-design-system
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Start Storybook:
```bash
npm run storybook
```

5. Run demo:
```bash
npm run dev
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `feat/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Branch

```bash
git checkout -b feat/component-name
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new Picker component
fix: resolve toggle animation issue
docs: update Button component documentation
test: add tests for TextField validation
refactor: simplify Card component logic
```

## Component Guidelines

### File Structure

Each component must include 5 files:

```
src/components/ComponentName/
├── ComponentName.tsx       # Component implementation
├── ComponentName.css       # Styles
├── ComponentName.test.tsx  # Unit tests
├── ComponentName.stories.tsx # Storybook documentation
└── index.ts               # Exports
```

### Component Template

```typescript
import React from 'react'
import './ComponentName.css'

export interface ComponentNameProps {
  /**
   * Component prop description
   */
  prop: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS ComponentName Component
 *
 * Brief description with:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 *
 * @example
 * ```tsx
 * <ComponentName prop="value" />
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  prop,
  className = '',
}) => {
  return (
    <div className={`ios-component-name ${className}`}>
      {/* Implementation */}
    </div>
  )
}

ComponentName.displayName = 'ComponentName'
```

### CSS Guidelines

1. **BEM Naming Convention**:
```css
.ios-component-name { }
.ios-component-name__element { }
.ios-component-name--modifier { }
```

2. **iOS Design Tokens**:
```css
/* Use design tokens */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
color: #007AFF; /* systemBlue */
```

3. **Dark Mode Support**:
```css
@media (prefers-color-scheme: dark) {
  .ios-component { color: #0A84FF; }
}
```

4. **Animations**:
```css
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### iOS HIG Compliance

All components must follow [iOS 16 Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/):

- ✅ **44pt minimum tap targets**
- ✅ **SF Pro typography**
- ✅ **8pt grid spacing**
- ✅ **System colors** (light + dark mode)
- ✅ **Native animations** (spring, scale, fade)
- ✅ **Safe area insets**
- ✅ **Translucent backgrounds**
- ✅ **WCAG AA accessibility**

### Accessibility Requirements

- Use semantic HTML elements
- Add ARIA attributes when needed
- Support keyboard navigation
- Test with screen readers
- Ensure color contrast meets WCAG AA

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders component', () => {
    const { container } = render(<ComponentName prop="value" />)
    const component = container.querySelector('.ios-component-name')
    expect(component).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    const handleClick = vi.fn()
    const { container } = render(<ComponentName onClick={handleClick} />)
    const button = container.querySelector('button')
    fireEvent.click(button!)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Test Coverage Requirements

- **Minimum 80% coverage** for all components
- Test all props and variants
- Test user interactions
- Test accessibility attributes
- Test edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Documentation Guidelines

### Storybook Stories

Each component must have at least:

1. **Default**: Basic usage
2. **Variants**: All visual variants
3. **Sizes**: All size options
4. **States**: Interactive states
5. **Examples**: Real-world use cases

Example:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    prop: 'value',
  },
}
```

### Component Documentation

- Add JSDoc comments to all props
- Include usage examples
- Document accessibility features
- Link to iOS HIG reference

## Pull Request Process

### Before Submitting

1. ✅ Run tests: `npm test`
2. ✅ Run linting: `npm run lint`
3. ✅ Build successfully: `npm run build`
4. ✅ Update CHANGELOG.md
5. ✅ Update documentation
6. ✅ Add Storybook stories

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New component
- [ ] Bug fix
- [ ] Enhancement
- [ ] Documentation
- [ ] Refactoring

## Components Changed
- ComponentName

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Storybook stories added
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] iOS HIG compliant
- [ ] Accessibility tested

## Screenshots (if applicable)
Light mode:
Dark mode:
```

### Review Process

1. Submit PR with descriptive title
2. Wait for automated checks (tests, lint, build)
3. Address reviewer feedback
4. Squash commits before merge
5. PR will be merged by maintainers

## Questions?

- Open an issue on GitHub
- Join our Discord community
- Check existing documentation

Thank you for contributing! 🎉
