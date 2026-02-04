# Testing Strategy - EcoFlow Design System

## Overview

This document outlines the testing strategy for the EcoFlow Design System, including test coverage, types of tests, and best practices.

## Test Coverage Summary

**Current Coverage (322 tests):**
- **Statements:** 91.74% ✅
- **Branches:** 90.57% ✅
- **Functions:** 55.65%
- **Lines:** 91.74% ✅

**Target:** 80%+ coverage for statements, branches, and lines (ACHIEVED)

## Testing Stack

- **Test Framework:** Vitest 1.6.1
- **Testing Library:** @testing-library/react + @testing-library/user-event
- **Assertions:** expect from Vitest
- **Mocking:** vi from Vitest
- **Coverage Tool:** V8 (built into Vitest)

## Test Organization

Tests are co-located with components using the `.test.tsx` extension:

```
src/components/
├── typography/
│   ├── Heading.tsx
│   ├── Heading.test.tsx
│   └── Heading.stories.tsx
```

## Test Categories

### 1. Component Rendering Tests
Verify that components render correctly with various props and states.

**Example:**
```typescript
it('renders with children', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### 2. Props Validation Tests
Test all prop variants, sizes, colors, and states.

**Example:**
```typescript
it('renders all variants', () => {
  const variants = ['primary', 'secondary', 'outline'] as const;
  variants.forEach((variant) => {
    render(<Button variant={variant}>Button</Button>);
  });
});
```

### 3. Interaction Tests
Test user interactions like clicks, keyboard navigation, and form inputs.

**Example:**
```typescript
it('calls onClick when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 4. Accessibility Tests
Verify ARIA attributes, roles, and keyboard navigation.

**Example:**
```typescript
it('has proper ARIA attributes', () => {
  render(<Alert variant="info">Message</Alert>);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
```

### 5. Style Tests
Verify custom styles and className props are applied.

**Example:**
```typescript
it('applies custom className', () => {
  const { container } = render(<Button className="custom">Button</Button>);
  expect(container.querySelector('.custom')).toBeInTheDocument();
});
```

## Test Coverage by Component Category

### Typography Components
- **Heading:** 11 tests (100% coverage)
- **Text:** 14 tests (100% coverage)

### Layout Components
- **Container:** 9 tests (100% coverage)
- **Stack:** 12 tests (100% coverage)
- **Grid:** 13 tests (100% coverage)
- **Spacer:** 9 tests (100% coverage)

### Navigation Components
- **Sidebar:** 9 tests (97.71% statements)
- **TopBar:** 9 tests (93.88% statements)
- **Breadcrumb:** 7 tests (97.48% statements)
- **Tabs:** 8 tests (84.86% statements)

### Form Components
- **Button:** 14 tests (100% coverage)
- **Input:** 17 tests (99.36% statements)
- **Select:** 17 tests (100% coverage)
- **Checkbox:** 17 tests (100% statements)
- **Radio:** 18 tests (100% coverage)
- **Switch:** 15 tests (100% coverage)

### Data Display Components
- **Badge:** 7 tests (100% coverage)
- **Avatar:** 11 tests (98.34% statements)
- **StatusIndicator:** 10 tests (100% coverage)
- **Card:** 10 tests (100% coverage)
- **Table:** 13 tests (93.65% statements)

### Feedback Components
- **Alert:** 14 tests (100% statements)
- **Loading:** 13 tests (97.52% statements)
- **Progress:** 15 tests (95.94% statements)
- **Modal:** 14 tests (100% statements)
- **Toast:** 16 tests (100% statements)

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- src/components/forms/Button.test.tsx
```

### Run tests for a directory
```bash
npm test -- src/components/forms
```

## Testing Best Practices

### 1. Test User Behavior, Not Implementation
```typescript
// ✓ Good - tests user behavior
it('shows error message when validation fails', () => {
  render(<Input error="Invalid email" />);
  expect(screen.getByText('Invalid email')).toBeInTheDocument();
});

// ✗ Bad - tests implementation details
it('sets error state to true', () => {
  const wrapper = shallow(<Input error="Invalid" />);
  expect(wrapper.state('hasError')).toBe(true);
});
```

### 2. Use Semantic Queries
Prefer queries that reflect how users interact with the app:
- `getByRole` (most preferred)
- `getByLabelText`
- `getByPlaceholderText`
- `getByText`
- `getByTestId` (last resort)

### 3. Test Accessibility
Always verify ARIA attributes, roles, and keyboard navigation:
```typescript
it('is keyboard accessible', () => {
  render(<Button>Click</Button>);
  const button = screen.getByRole('button');
  button.focus();
  expect(button).toHaveFocus();
  fireEvent.keyDown(button, { key: 'Enter' });
  // Verify action triggered
});
```

### 4. Mock External Dependencies
```typescript
const mockOnChange = vi.fn();
render(<Input onChange={mockOnChange} />);
fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
expect(mockOnChange).toHaveBeenCalled();
```

### 5. Test Edge Cases
- Empty states
- Maximum values
- Disabled states
- Error states
- Loading states

## Known Issues & Warnings

### Function Coverage
Function coverage is 55.65% primarily because:
1. Token accessor functions are not directly tested (tested via component usage)
2. Export-only `index.ts` files have no testable functions
3. Some helper functions in components are not explicitly tested

This is acceptable because:
- Token functions are used and tested within components
- Statement and branch coverage are excellent (>90%)
- All user-facing functionality is thoroughly tested

### React Warnings
Some tests show React warnings (controlled inputs, act() wrapping) which are expected and do not affect functionality:
- Controlled input warnings: Occur in tests that check rendering without onChange
- Act() warnings: Occur in timing-sensitive tests (Toast auto-dismiss)

## Future Improvements

1. **Accessibility Testing:**
   - Integrate axe-core for automated a11y testing
   - Add more keyboard navigation tests
   - Screen reader testing documentation

2. **Visual Regression Testing:**
   - Integrate Chromatic or Percy for visual diffs
   - Snapshot testing for critical components

3. **Integration Tests:**
   - Test component composition patterns
   - Test common user workflows

4. **Performance Testing:**
   - Render performance benchmarks
   - Bundle size monitoring

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
