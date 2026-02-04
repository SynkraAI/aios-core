# Accessibility Guide

The iOS Design System is built with accessibility as a core principle, ensuring all components are usable by everyone.

## Table of Contents

- [Overview](#overview)
- [WCAG Compliance](#wcag-compliance)
- [Component Accessibility](#component-accessibility)
- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Color Contrast](#color-contrast)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## Overview

All components in the iOS Design System follow **WCAG 2.1 Level AA** guidelines and iOS accessibility standards.

### Key Features

- ✅ **Semantic HTML** - Proper element usage
- ✅ **ARIA Attributes** - Screen reader support
- ✅ **Keyboard Navigation** - Full keyboard access
- ✅ **Focus Management** - Visible focus indicators
- ✅ **Color Contrast** - WCAG AA minimum (4.5:1)
- ✅ **Touch Targets** - 44pt minimum size
- ✅ **Alternative Text** - Images and icons
- ✅ **Error Identification** - Clear error messages

---

## WCAG Compliance

### Level AA Requirements (Met)

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **1.1.1 Non-text Content** | ✅ | All icons have `aria-label` |
| **1.3.1 Info and Relationships** | ✅ | Semantic HTML, ARIA roles |
| **1.4.3 Contrast (Minimum)** | ✅ | 4.5:1 for text, 3:1 for UI |
| **2.1.1 Keyboard** | ✅ | All interactive elements keyboard accessible |
| **2.4.7 Focus Visible** | ✅ | Clear focus indicators |
| **3.2.1 On Focus** | ✅ | No unexpected behavior |
| **3.3.1 Error Identification** | ✅ | Clear error messages |
| **3.3.2 Labels or Instructions** | ✅ | All inputs have labels |
| **4.1.2 Name, Role, Value** | ✅ | Proper ARIA attributes |

### Level AAA (Partial)

| Criterion | Status | Notes |
|-----------|--------|-------|
| **1.4.6 Contrast (Enhanced)** | ⚠️ | 7:1 ratio recommended but not required |
| **2.4.8 Location** | ✅ | Navigation breadcrumbs available |
| **2.5.5 Target Size** | ✅ | 44pt minimum (exceeds 24×24px requirement) |

---

## Component Accessibility

### Navigation Components

#### TabBar
```tsx
<TabBar
  items={[...]}
  activeTab="home"
  onChange={...}
/>
```

**Accessibility Features:**
- `role="navigation"` on container
- `role="tab"` on each tab
- `aria-selected="true"` on active tab
- `aria-label` for each tab
- Badge has `aria-label="3 notifications"`
- Keyboard navigation (Arrow keys)

#### NavigationBar
```tsx
<NavigationBar
  title="Settings"
  leftButton={{ label: 'Back', ... }}
  rightButton={{ label: 'Done', ... }}
/>
```

**Accessibility Features:**
- `role="banner"` on container
- `aria-label` on buttons
- Keyboard navigation (Tab, Enter)
- Focus trap during navigation

### Form Components

#### Button
```tsx
<Button
  label="Submit"
  onPress={...}
  disabled={false}
/>
```

**Accessibility Features:**
- Native `<button>` element
- `aria-label` for icon-only buttons
- `aria-disabled="true"` when disabled
- `aria-busy="true"` when loading
- Keyboard support (Enter, Space)
- Clear focus indicator

#### TextField
```tsx
<TextField
  label="Email"
  value={email}
  onChange={...}
  error="Invalid email"
/>
```

**Accessibility Features:**
- `<label>` associated with `<input>`
- `aria-invalid="true"` on error
- `aria-describedby` linking to error message
- `aria-required="true"` for required fields
- Clear focus indicator
- Placeholder as hint, not replacement for label

#### Toggle
```tsx
<Toggle
  checked={enabled}
  onChange={...}
/>
```

**Accessibility Features:**
- `role="switch"` on checkbox
- `aria-checked="true/false"`
- `aria-label` describing purpose
- Keyboard support (Space to toggle)
- Clear focus indicator

### Feedback Components

#### ActionSheet
```tsx
<ActionSheet
  visible={true}
  title="Options"
  actions={[...]}
  onDismiss={...}
/>
```

**Accessibility Features:**
- `role="dialog"` on container
- `aria-modal="true"`
- `aria-labelledby` referencing title
- Focus trap inside modal
- Escape key to dismiss
- Focus returns to trigger on close

#### Alert
```tsx
<Alert
  visible={true}
  title="Confirm"
  message="Are you sure?"
  buttons={[...]}
/>
```

**Accessibility Features:**
- `role="alertdialog"`
- `aria-modal="true"`
- `aria-labelledby` and `aria-describedby`
- Focus trap
- First button receives focus
- Escape key to dismiss

#### ActivityIndicator
```tsx
<ActivityIndicator
  size="medium"
  animating={true}
/>
```

**Accessibility Features:**
- `role="status"`
- `aria-live="polite"`
- `aria-busy="true"` when animating
- `aria-label="Loading"`
- Not announced on every state change

#### ProgressView
```tsx
<ProgressView
  progress={0.5}
  showLabel
/>
```

**Accessibility Features:**
- `role="progressbar"`
- `aria-valuenow="50"`
- `aria-valuemin="0"`
- `aria-valuemax="100"`
- `aria-label="50% complete"`

---

## Keyboard Navigation

All interactive components support keyboard navigation.

### Key Bindings

| Key | Action | Components |
|-----|--------|------------|
| **Tab** | Move focus forward | All interactive elements |
| **Shift + Tab** | Move focus backward | All interactive elements |
| **Enter** | Activate | Buttons, links |
| **Space** | Activate/toggle | Buttons, checkboxes, toggles |
| **Escape** | Close/dismiss | Modals, ActionSheet, Alert |
| **Arrow Keys** | Navigate | TabBar, SegmentedControl, Slider |
| **Home/End** | First/last item | Lists |

### Focus Management

#### Visible Focus Indicators

All focusable elements have clear focus indicators:

```css
.ios-button:focus-visible {
  outline: 2px solid #007AFF;
  outline-offset: 2px;
}
```

#### Focus Trap

Modals trap focus inside:

```typescript
// ActionSheet, Alert automatically trap focus
<ActionSheet visible={true} ... />
// Focus stays within modal until dismissed
```

#### Focus Return

Focus returns to trigger element after modal closes:

```typescript
const [showAlert, setShowAlert] = useState(false)

<Button onPress={() => setShowAlert(true)} />
<Alert visible={showAlert} onDismiss={() => setShowAlert(false)} />
// Focus returns to Button after Alert closes
```

---

## Screen Reader Support

All components include screen reader support.

### VoiceOver (iOS/macOS)

Components work with VoiceOver:

```tsx
// Button announces: "Submit button"
<Button label="Submit" onPress={...} />

// Toggle announces: "Notifications switch, on"
<Toggle checked={true} aria-label="Notifications" />

// ActivityIndicator announces: "Loading"
<ActivityIndicator aria-label="Loading" />
```

### NVDA/JAWS (Windows)

Components work with NVDA and JAWS screen readers.

### Testing with Screen Readers

**macOS VoiceOver:**
```bash
Command + F5  # Enable VoiceOver
Control + Option + Arrow Keys  # Navigate
```

**Windows NVDA:**
```bash
Control + Alt + N  # Start NVDA
Arrow Keys  # Navigate
```

---

## Color Contrast

All colors meet WCAG AA contrast requirements.

### Text Contrast

| Text Type | Ratio | Status |
|-----------|-------|--------|
| **Normal text** (17px) | 4.5:1 | ✅ Met |
| **Large text** (24px+) | 3:1 | ✅ Met |
| **UI components** | 3:1 | ✅ Met |

### Color Combinations (Light Mode)

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#000000` (label) | `#FFFFFF` (background) | 21:1 | ✅ AAA |
| `#007AFF` (blue) | `#FFFFFF` (background) | 4.5:1 | ✅ AA |
| `#8E8E93` (gray) | `#FFFFFF` (background) | 4.6:1 | ✅ AA |

### Color Combinations (Dark Mode)

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#FFFFFF` (label) | `#000000` (background) | 21:1 | ✅ AAA |
| `#0A84FF` (blue) | `#000000` (background) | 8.6:1 | ✅ AAA |
| `#98989D` (gray) | `#000000` (background) | 5.1:1 | ✅ AA |

### Testing Contrast

Use browser DevTools or online tools:

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Chrome DevTools → Inspect → Contrast

---

## Testing

### Automated Testing

```bash
# Run accessibility tests
npm run test:a11y

# Test with axe-core
npm run test -- --coverage
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] All elements reachable
- [ ] Focus visible
- [ ] Logical tab order
- [ ] Enter/Space activate elements
- [ ] Escape closes modals

#### Screen Reader
- [ ] All content announced
- [ ] Meaningful labels
- [ ] State changes announced
- [ ] Error messages clear
- [ ] Form labels present

#### Visual
- [ ] Sufficient color contrast
- [ ] Text readable at 200% zoom
- [ ] No information conveyed by color alone
- [ ] Focus indicators visible
- [ ] Touch targets 44pt minimum

#### Forms
- [ ] All inputs have labels
- [ ] Error messages clear
- [ ] Required fields marked
- [ ] Validation helpful
- [ ] Success confirmation

---

## Best Practices

### 1. Use Semantic HTML

✅ **Do:** Use semantic elements
```tsx
<button>Click me</button>
<nav>...</nav>
<main>...</main>
```

❌ **Don't:** Use divs for everything
```tsx
<div onClick={...}>Click me</div>
```

### 2. Provide Text Alternatives

✅ **Do:** Add aria-label for icons
```tsx
<SFSymbol name="⭐️" accessibilityLabel="Favorite" />
```

❌ **Don't:** Use icons without labels
```tsx
<SFSymbol name="⭐️" />
```

### 3. Maintain Focus Order

✅ **Do:** Logical tab order
```tsx
<form>
  <TextField /> {/* Tab 1 */}
  <TextField /> {/* Tab 2 */}
  <Button />    {/* Tab 3 */}
</form>
```

❌ **Don't:** Use tabIndex to reorder
```tsx
<TextField tabIndex={3} />
<TextField tabIndex={1} />
<Button tabIndex={2} />
```

### 4. Handle Dynamic Content

✅ **Do:** Announce changes
```tsx
<div role="status" aria-live="polite">
  {message}
</div>
```

❌ **Don't:** Silent updates
```tsx
<div>{message}</div>
```

### 5. Test with Real Users

- Test with keyboard only
- Test with screen reader
- Test with users who have disabilities
- Test at different zoom levels
- Test with reduced motion enabled

---

## Resources

### Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://pa11y.org/)

### Screen Readers
- [VoiceOver (macOS/iOS)](https://support.apple.com/guide/voiceover/)
- [NVDA (Windows)](https://www.nvaccess.org/)
- [JAWS (Windows)](https://www.freedomscientific.com/products/software/jaws/)

---

## Need Help?

If you find accessibility issues:

1. Open an issue on GitHub
2. Include component name
3. Describe the issue
4. Include steps to reproduce
5. Mention assistive technology used

We're committed to making the iOS Design System accessible to everyone. 🌟
