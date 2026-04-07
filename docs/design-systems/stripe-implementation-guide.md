# Stripe Design System — Implementation Guide

Reference: Premium financial/consulting brand pattern  
Source: stripe.com (April 2026)

---

## Quick Copy-Paste Components

### HTML + Inline CSS

#### Primary Button
```html
<button style="
  background-color: #533afd;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-family: sohne-var, 'SF Pro Display', sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 240ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
">
  Get Started
</button>

<style>
  button:hover {
    background-color: #4032c8;
  }
  button:disabled {
    background-color: #e5edf5;
    color: #95a4ba;
    cursor: not-allowed;
  }
</style>
```

#### Secondary Button
```html
<button style="
  background-color: transparent;
  color: #533afd;
  border: 1px solid #d6d9fc;
  border-radius: 4px;
  padding: 12px 16px;
  font-family: sohne-var, 'SF Pro Display', sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  cursor: pointer;
  transition: all 240ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
">
  Learn More
</button>

<style>
  button:hover {
    border-color: #4032c8;
    color: #4032c8;
  }
</style>
```

#### Hero Heading
```html
<h1 style="
  font-family: sohne-var, 'SF Pro Display', sans-serif;
  font-size: 3rem;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #061b31;
  margin: 0;
  margin-bottom: 24px;
">
  Financial infrastructure for the internet
</h1>
```

#### Card with Shadow
```html
<div style="
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0px 6px 22px 0px rgba(0, 55, 112, 0.1), 
              0px 4px 8px 0px rgba(0, 59, 137, 0.05);
  padding: 32px;
  margin-bottom: 16px;
">
  <h3 style="
    font-size: 1.375rem;
    font-weight: 300;
    color: #061b31;
    margin: 0 0 12px 0;
  ">Card Title</h3>
  
  <p style="
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.4;
    color: #50617a;
    margin: 0;
  ">Card description text</p>
</div>
```

#### Input Field
```html
<input 
  type="email"
  placeholder="Enter your email"
  style="
    width: 100%;
    background-color: rgba(255, 255, 255, 0.25);
    border: 1.25px solid rgba(212, 222, 233, 0.75);
    border-radius: 4px;
    padding: 10px 13px;
    font-family: sohne-var, 'SF Pro Display', sans-serif;
    font-size: 0.875rem;
    color: #273951;
    box-sizing: border-box;
    transition: all 240ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
  "
/>

<style>
  input:focus {
    outline: none;
    background-color: rgba(255, 255, 255, 0.5);
    border-color: rgba(212, 222, 233, 0.75);
    box-shadow: 0px 2px 10px 0px rgba(0, 55, 112, 0.09);
  }
  input::placeholder {
    color: #7d8ba4;
  }
</style>
```

#### Section Layout (96px gaps)
```html
<section style="
  max-width: 1264px;
  margin: 0 auto;
  padding: 96px 16px;
">
  <h2 style="
    font-size: 2rem;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #061b31;
    margin-bottom: 24px;
  ">Section Title</h2>
  
  <p style="
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.4;
    color: #50617a;
    margin: 0;
    max-width: 600px;
  ">Section description</p>
</section>
```

---

## Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['sohne-var', 'SF Pro Display', 'sans-serif'],
        code: ['SourceCodePro', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Brand
        brand: {
          50: '#e8e9ff',
          100: '#d6d9fc',
          200: '#b9b9f9',
          300: '#9a9afe',
          400: '#7f7dfc',
          500: '#665efd',
          600: '#533afd',
          700: '#4032c8',
          800: '#2e2b8c',
          900: '#1c1e54',
          950: '#0f1137',
        },
        // Neutral
        neutral: {
          0: '#fff',
          25: '#f8fafd',
          50: '#e5edf5',
          100: '#d4dee9',
          200: '#bac8da',
          300: '#95a4ba',
          400: '#7d8ba4',
          500: '#64748d',
          600: '#50617a',
          700: '#3c4f69',
          800: '#273951',
          900: '#1a2c44',
          950: '#11273e',
          975: '#0d253d',
          990: '#061b31',
        },
        // Semantics
        success: '#00b261',
        error: '#d8351e',
        warning: '#f9b900',
      },
      fontSize: {
        // Headings
        'h1-xl': ['3.5rem', { lineHeight: '1.03', letterSpacing: '-0.025em', fontWeight: '300' }],
        'h1-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        'h2-lg': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '300' }],
        'h2-md': ['1.625rem', { lineHeight: '1.12', letterSpacing: '-0.01em', fontWeight: '300' }],
        'h3-sm': ['1.375rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '300' }],
        // Body
        'body-lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: '300' }],
        'body-md': ['1rem', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: '300' }],
        'body-sm': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: '300' }],
        'body-xs': ['0.75rem', { lineHeight: '1.45', letterSpacing: '0em', fontWeight: '300' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '36px',
        section: '96px',
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '16px',
        xl: '32px',
        full: '99999px',
      },
      boxShadow: {
        xs: '0px 2px 10px 0px rgba(0, 55, 112, 0.09), 0px 1px 4px 0px rgba(0, 59, 137, 0.06)',
        sm: '0px 5px 14px 0px rgba(0, 55, 112, 0.08), 0px 2px 8px 0px rgba(0, 59, 137, 0.05)',
        md: '0px 6px 22px 0px rgba(0, 55, 112, 0.1), 0px 4px 8px 0px rgba(0, 59, 137, 0.03)',
        lg: '0px 15px 40px -2px rgba(0, 55, 112, 0.1), 0px 5px 20px -2px rgba(0, 59, 137, 0.04)',
        xl: '0px 20px 80px -16px rgba(0, 55, 112, 0.14), 0px 10px 60px -16px rgba(0, 59, 137, 0.06)',
      },
      transitionDuration: {
        default: '240ms',
      },
      transitionTimingFunction: {
        'stripe-ease': 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        // Buttons
        '.btn-primary': {
          '@apply px-4 py-3 bg-brand-600 text-white rounded-sm font-normal text-sm transition-all duration-default hover:bg-brand-700 disabled:bg-neutral-50 disabled:text-neutral-300 disabled:cursor-not-allowed': {},
        },
        '.btn-secondary': {
          '@apply px-4 py-3 bg-transparent border border-brand-100 text-brand-600 rounded-sm font-normal text-sm transition-all duration-default hover:border-brand-700 hover:text-brand-700': {},
        },
        // Headings
        '.h1-xl': {
          '@apply text-h1-xl': {},
        },
        '.h1-lg': {
          '@apply text-h1-lg': {},
        },
        '.h2-lg': {
          '@apply text-h2-lg': {},
        },
        // Body
        '.body-md': {
          '@apply text-body-md': {},
        },
        '.body-sm': {
          '@apply text-body-sm': {},
        },
        // Inputs
        '.input-primary': {
          '@apply w-full bg-white bg-opacity-25 border border-neutral-100 border-opacity-75 rounded-sm px-3 py-2 font-normal text-sm text-neutral-800 placeholder-neutral-400 transition-all duration-default focus:outline-none focus:bg-opacity-50 focus:shadow-xs': {},
        },
        // Cards
        '.card': {
          '@apply bg-white rounded-lg shadow-md p-8': {},
        },
      });
    },
  ],
};
```

---

## CSS-in-JS (styled-components)

```javascript
import styled from 'styled-components';

const COLORS = {
  brand: '#533afd',
  brandHover: '#4032c8',
  text: '#061b31',
  textSecondary: '#50617a',
  neutral100: '#d4dee9',
  neutral50: '#e5edf5',
};

const TYPOGRAPHY = {
  heading: `
    font-family: sohne-var, 'SF Pro Display', sans-serif;
    font-weight: 300;
    line-height: 1.15;
    letter-spacing: -0.02em;
  `,
  body: `
    font-family: sohne-var, 'SF Pro Display', sans-serif;
    font-weight: 300;
    line-height: 1.4;
    letter-spacing: 0em;
  `,
};

const SHADOWS = {
  md: '0px 6px 22px 0px rgba(0, 55, 112, 0.1), 0px 4px 8px 0px rgba(0, 59, 137, 0.03)',
  lg: '0px 15px 40px -2px rgba(0, 55, 112, 0.1), 0px 5px 20px -2px rgba(0, 59, 137, 0.04)',
};

export const PrimaryButton = styled.button`
  ${TYPOGRAPHY.body}
  font-size: 0.875rem;
  background-color: ${COLORS.brand};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 240ms cubic-bezier(0.45, 0.05, 0.55, 0.95);

  &:hover {
    background-color: ${COLORS.brandHover};
  }

  &:disabled {
    background-color: ${COLORS.neutral50};
    color: #95a4ba;
    cursor: not-allowed;
  }
`;

export const Card = styled.div`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: ${SHADOWS.md};
  padding: 32px;
`;

export const H1 = styled.h1`
  ${TYPOGRAPHY.heading}
  font-size: 3rem;
  color: ${COLORS.text};
  margin: 0 0 24px 0;
`;

export const H2 = styled.h2`
  ${TYPOGRAPHY.heading}
  font-size: 1.625rem;
  color: ${COLORS.text};
  margin: 0 0 16px 0;
`;

export const Body = styled.p`
  ${TYPOGRAPHY.body}
  font-size: 1rem;
  color: ${COLORS.textSecondary};
  margin: 0;
`;
```

---

## Stripe-Inspired Color Palettes for Accents

If you want to add accent colors beyond the primary purple, use these pre-designed gradients:

### Accent Usage Examples

#### Magenta Section
```css
background: linear-gradient(135deg, #f98bf9, #f96bee);
```

#### Lemon Highlight
```css
background: linear-gradient(135deg, #ffd552, #ff9014);
```

#### Ruby Feature
```css
background: linear-gradient(135deg, #f84c31, #f03ca4);
```

#### Orange Callout
```css
background: linear-gradient(135deg, #fe8c2d, #fd5d7c);
```

---

## Best Practices

### 1. Typography Hierarchy
- **H1:** 3rem (brand/hero sections)
- **H2:** 2rem (major sections)
- **H3:** 1.625rem (subsections)
- **Body:** 1rem (default)
- **Small:** 0.875rem (secondary text, labels)

All use **font-weight: 300** (light) for airy premium feel.

### 2. Color Usage
- **Primary action:** Always `#533afd` (brand purple)
- **Text:** `#061b31` (neutral-990)
- **Secondary text:** `#50617a` (neutral-600)
- **Muted text:** `#7d8ba4` (neutral-400)
- **Borders:** `#d4dee9` (neutral-100)

### 3. Spacing Rhythm
- **Components:** 4px, 8px, 12px, 16px
- **Sections:** 96px between major sections (!)
- **Button padding:** 12px vertical, 16px horizontal

### 4. Shadows (Dark + Blue overlay)
Never use pure black shadows. Stripe layers two:
- Dark shadow: `#003770` (dark navy) ~10% opacity
- Blue shadow: `#003b89` (deeper blue) ~5% opacity

This creates sophisticated depth without harshness.

### 5. Hover States
- **Buttons:** -1 shade darker (e.g., brand-700 from brand-600)
- **Links:** Slightly darker text or underline with brand color
- **Cards:** Subtle shadow increase (xs → sm)

### 6. Focus States (Accessibility)
```css
/* Apply to all interactive elements */
:focus {
  outline: 2px solid #533afd;
  outline-offset: 2px;
}
```

### 7. Animations
- **Duration:** 240ms (normal), 300ms (slow)
- **Easing:** `cubic-bezier(0.45, 0.05, 0.55, 0.95)`
- **Use for:** Hover, focus, transitions, navigation

### 8. Section Padding
Sections with 96px top/bottom padding feel **premium**. This creates breathing room and visual hierarchy.

```css
section {
  padding: 96px 16px;
  max-width: 1264px;
  margin: 0 auto;
}
```

---

## Common Component Patterns

### CTA Section
```html
<section style="padding: 96px 16px; text-align: center;">
  <h2 style="font-size: 2rem; font-weight: 300; margin-bottom: 16px;">
    Ready to get started?
  </h2>
  <p style="font-size: 1rem; color: #50617a; margin-bottom: 32px;">
    Join 100+ companies already using our platform.
  </p>
  <button style="
    background-color: #533afd;
    color: #fff;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
  ">
    Get Started Free
  </button>
</section>
```

### Feature Grid (3 columns)
```html
<div style="
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1264px;
  margin: 0 auto;
  padding: 96px 16px;
">
  <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0px 6px 22px 0px rgba(0,55,112,0.1);">
    <h3 style="font-size: 1.375rem; font-weight: 300; margin-bottom: 12px;">Feature 1</h3>
    <p style="color: #50617a; line-height: 1.4;">Description of feature</p>
  </div>
  <!-- Repeat 2x -->
</div>
```

### Stats Row
```html
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 48px 0;">
  <div style="text-align: center;">
    <div style="font-size: 2rem; font-weight: 300; color: #533afd;">100M+</div>
    <div style="font-size: 0.875rem; color: #50617a; margin-top: 8px;">Active Users</div>
  </div>
  <!-- Repeat 3x -->
</div>
```

---

## Files Generated

✅ **stripe-tokens.md** — Complete token reference (10,000+ words)  
✅ **stripe-tokens-quick-ref.json** — JSON for programmatic use  
✅ **stripe-implementation-guide.md** — This file

**Location:** `/Users/luizfosc/aios-core/docs/design-systems/`

---

## Attribution

Design tokens extracted from stripe.com (April 2026) using Playwright + browser inspection.  
System Name: **HDS (Harmony Design System)**  
Token count: **750+** CSS variables  
Color palette: **11-step grays + 5 accent modes**
