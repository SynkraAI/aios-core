# AIOS Color Palette - Quick Reference

**Version:** 2.1.0 | **Status:** ✅ Active

---

## 🎨 Visual Palette

### Brand Colors

```
🟣 PRIMARY   #8B5CF6  │ Purple  │ ClickUp-inspired │ Questions, headers, CTAs
🔴 SECONDARY #EC4899  │ Magenta │ Logo gradient    │ Highlights, emphasis
🔵 TERTIARY  #3B82F6  │ Blue    │ Logo gradient    │ Secondary actions, links
```

### Functional Colors

```
🟢 SUCCESS  #10B981  │ Green  │ Checkmarks, completed steps
🟠 WARNING  #F59E0B  │ Orange │ Warnings, confirmations
🔴 ERROR    #EF4444  │ Red    │ Errors, critical alerts
🔷 INFO     #06B6D4  │ Cyan   │ Info messages, tips
```

### Neutral Colors

```
⚪ MUTED  #94A3B8  │ Light Gray │ Subtle text, disabled states
⚫ DIM    #64748B  │ Dark Gray  │ Secondary text
```

---

## 🚀 Quick Start

### JavaScript/Node.js

```javascript
// Import the AIOS color system
const { colors, status, headings } = require('./src/utils/aios-colors');

// Use in your code
console.log(headings.h1('Welcome to AIOS!'));
console.log(status.success('Installation complete!'));
console.log(status.tip('Press Enter to continue'));
```

### CSS/Tailwind

```css
/* Import CSS variables */
:root {
  --aios-primary: #8B5CF6;
  --aios-success: #10B981;
  --aios-error: #EF4444;
}

/* Use in your styles */
.button-primary {
  background: var(--aios-primary);
}
```

---

## 📋 Common Patterns

### Welcome Screen
```javascript
console.log(headings.h1('🎉 Welcome to AIOS v4.0.4 Installer!'));
console.log(colors.info('Let\'s configure your project...\n'));
```

### Interactive Question
```javascript
{
  type: 'list',
  name: 'choice',
  message: colors.primary('Select an option:'),
  choices: [
    { name: colors.highlight('Option 1') + colors.dim(' (recommended)'), value: '1' },
    { name: 'Option 2', value: '2' }
  ]
}
```

### Status Feedback
```javascript
console.log(status.loading('Installing dependencies...'));
// ... async operation ...
console.log(status.success('Dependencies installed!'));
```

### Error Handling
```javascript
try {
  // operation
} catch (error) {
  console.log(status.error('Operation failed'));
  console.log(colors.dim(`  Details: ${error.message}`));
  console.log(status.tip('Try running with --verbose for more info'));
}
```

---

## 🎯 Usage Rules

### ✅ DO

- Use `colors.primary` for main questions
- Use `status.*` helpers for feedback (includes icons)
- Use `colors.highlight` for key information
- Use `colors.dim` for secondary text
- Always include text indicators with colors (✓, ✗, ⚠️)

### ❌ DON'T

- Don't hardcode hex colors (use the module)
- Don't use red for anything except errors
- Don't use too many colors in one line
- Don't rely solely on color (accessibility)

---

## 📊 Color Hierarchy

```
Level 1: Brand Emphasis
├─ colors.brandPrimary    (Purple bold)
└─ headings.h1()          (Purple bold + spacing)

Level 2: Primary Content
├─ colors.primary         (Purple)
├─ headings.h2()          (Purple bold)
└─ status.*               (Colored + icon)

Level 3: Secondary Content
├─ colors.info            (Cyan)
└─ Regular text           (Terminal default)

Level 4: Tertiary Content
├─ colors.muted           (Light gray)
└─ colors.dim             (Dark gray)
```

---

## 🧪 Test Your Implementation

Run the visual demo:
```bash
node examples/color-palette-demo.js
```

Expected output:
- ✅ All brand colors display correctly
- ✅ Status indicators show with icons
- ✅ Gradients are smooth
- ✅ Text hierarchy is clear

---

## 📚 Full Documentation

- **Complete Guide:** [AIOS-COLOR-PALETTE-V2.1.md](./AIOS-COLOR-PALETTE-V2.1.md)
- **Color Module:** `src/utils/aios-colors.js`
- **Demo:** `examples/color-palette-demo.js`

---

## 🔗 Brand References

- **Logo:** Gradient (Magenta → Orange → Purple → Blue)
- **Primary Brand:** ClickUp Purple (#8B5CF6)
- **Accessibility:** WCAG AA compliant

---

**Created by:** Uma (UX-Design Expert) 🎨  
**Last Updated:** 2025-01-20

— Uma, desenhando com empatia 💝

