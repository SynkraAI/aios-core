# iOS 16 Component Inventory

**Project:** iOS Design System
**Story:** 2.1 - iOS 16 Design System
**Phase:** 1 - Figma Analysis & Token Extraction
**Created:** 2026-02-04
**Author:** @ux-design-expert (Uma)

**Related Document:** `01-ios-design-tokens-analysis.md` (Design tokens reference)

---

## Executive Summary

This document provides a comprehensive inventory of iOS 16 native components extracted from Apple's Human Interface Guidelines and iOS 16 design patterns. Each component is mapped to design tokens from `01-ios-design-tokens-analysis.md`.

**Total Components:** 20 core iOS components organized into 5 categories
**Atomic Design Levels:** Atoms (9) → Molecules (6) → Organisms (5)
**Priority for v0.1.0:** 15-18 components (excluding advanced gestures)

---

## Component Organization

### Atomic Design Classification

Following **Brad Frost's Atomic Design** methodology:

| Level | Definition | iOS Examples | Count |
|-------|------------|--------------|-------|
| **Atoms** | Basic building blocks | Button, Label, Icon, Switch | 9 |
| **Molecules** | Simple component groups | TextField (label+input), ListItem (icon+text+disclosure) | 6 |
| **Organisms** | Complex UI sections | TabBar, NavigationBar, List, ActionSheet | 5 |
| **Templates** | Page layouts | (Out of scope for v0.1.0) | - |
| **Pages** | Specific instances | (Out of scope for v0.1.0) | - |

---

## 1. Navigation Components (4 components)

### 1.1 Tab Bar (Organism)

**Atomic Level:** Organism
**Description:** Bottom navigation bar with 3-5 tabs, icons, and labels
**iOS Usage:** Primary app navigation (e.g., Instagram, Twitter, Settings)

**Visual Specifications:**
- **Height:** 49pt (standard), 83pt (with safe area on notched iPhones)
- **Background:** `systemGroupedBackground` with blur effect (`backdrop-filter: blur(20px)`)
- **Top Border:** 0.5pt `separator` color
- **Padding:** 0pt horizontal (full width), safe-area-inset-bottom

**Tab Item Specifications:**
| Property | Value | Token Reference |
|----------|-------|-----------------|
| Icon Size | 25pt × 25pt | Custom (SF Symbols scale) |
| Label Font | Caption 2 (11pt, Regular) | `typography.styles.caption2` |
| Active Color | `systemBlue` | `colors.system.blue` |
| Inactive Color | `systemGray` | `colors.systemGray` |
| Spacing (Icon-Label) | 2pt | `spacing.grid × 0.25` |
| Min Tap Target | 44pt × 44pt | `spacing.minTapTarget` |

**States:**
- Default (inactive): Gray icon + gray label
- Active: Blue icon + blue label
- Badge: Red notification badge (top-right of icon)

**Props (TypeScript):**
```typescript
interface TabBarProps {
  items: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  safeAreaBottom?: boolean; // Respect safe area insets
}

interface TabItem {
  icon: string; // SF Symbol name or icon component
  label: string;
  badge?: number | boolean; // Notification count or dot
}
```

**Priority:** 🔥 **High** (Core navigation pattern)

---

### 1.2 Navigation Bar (Organism)

**Atomic Level:** Organism
**Description:** Top navigation bar with title, back button, and trailing actions
**iOS Usage:** Page headers, navigation hierarchy (e.g., Settings, Mail)

**Visual Specifications:**
- **Height:** 44pt (standard), 96pt (large title expanded)
- **Background:** `systemBackground` with blur effect
- **Bottom Border:** 0.5pt `separator` color
- **Padding:** 16pt horizontal, safe-area-inset-top

**Title Specifications:**
| Style | Font | Color | Position |
|-------|------|-------|----------|
| **Standard Title** | Headline (17pt, Semibold) | `label` (primary) | Center or leading |
| **Large Title** | Large Title (34pt, Regular) | `label` (primary) | Leading, scrolls to standard |

**Button Specifications:**
- **Back Button:** Chevron + previous page title (truncated to ~10 chars)
- **Trailing Actions:** Text buttons or icon buttons (44pt tap target)
- **Button Color:** `systemBlue` (default), custom tintColor supported

**Props (TypeScript):**
```typescript
interface NavigationBarProps {
  title: string;
  largeTitle?: boolean; // Enable large title mode
  backButton?: boolean | string; // true = auto, string = custom label
  trailingActions?: NavigationAction[];
  tintColor?: string; // Custom accent color
  onBackPress?: () => void;
}

interface NavigationAction {
  label?: string;
  icon?: string;
  onPress: () => void;
}
```

**Priority:** 🔥 **High** (Core navigation pattern)

---

### 1.3 Toolbar (Molecule)

**Atomic Level:** Molecule
**Description:** Bottom action bar with 1-5 action buttons
**iOS Usage:** Contextual actions (e.g., Safari bottom bar, Mail actions)

**Visual Specifications:**
- **Height:** 44pt (standard), 78pt (with safe area)
- **Background:** `systemBackground` with blur effect
- **Top Border:** 0.5pt `separator` color
- **Button Spacing:** Evenly distributed or grouped

**Props (TypeScript):**
```typescript
interface ToolbarProps {
  actions: ToolbarAction[];
  distribution?: 'fill' | 'leading' | 'trailing' | 'spaced'; // Button layout
}

interface ToolbarAction {
  icon: string;
  label?: string; // Optional label below icon
  disabled?: boolean;
  onPress: () => void;
}
```

**Priority:** 🟡 **Medium** (Less common than TabBar/NavigationBar)

---

### 1.4 Segmented Control (Molecule)

**Atomic Level:** Molecule
**Description:** Horizontal tab switcher with 2-5 segments
**iOS Usage:** View mode switcher (e.g., Calendar: Day/Week/Month)

**Visual Specifications:**
- **Height:** 32pt (compact), 40pt (standard)
- **Background:** `tertiarySystemFill`
- **Selected Segment:** `systemBackground` with subtle shadow
- **Corner Radius:** 8pt (outer), 6pt (inner segments)
- **Padding:** 2pt (outer padding for inner shadow effect)

**Props (TypeScript):**
```typescript
interface SegmentedControlProps {
  segments: string[]; // 2-5 segment labels
  selectedIndex: number;
  onChange: (index: number) => void;
  size?: 'compact' | 'standard';
}
```

**Priority:** 🟡 **Medium** (Common in iOS apps)

---

## 2. Form Components (5 components)

### 2.1 Button (Atom)

**Atomic Level:** Atom
**Description:** Primary action button with 5 iOS-native variants
**iOS Usage:** Actions, forms, CTAs throughout iOS

**Variants:**
| Variant | Background | Foreground | Border | Usage |
|---------|------------|------------|--------|-------|
| **Filled** | `systemBlue` | White | None | Primary actions (Save, Submit, Sign In) |
| **Tinted** | `systemBlue` @ 15% opacity | `systemBlue` | None | Secondary actions in colored context |
| **Gray** | `tertiarySystemFill` | `label` | None | Secondary actions (Cancel, Dismiss) |
| **Plain** | None (transparent) | `systemBlue` | None | Tertiary actions, navigation links |
| **Borderless** | None | `systemBlue` | None | In-line actions, list actions |

**Visual Specifications:**
- **Height:** 44pt (standard), 50pt (large), 36pt (small)
- **Padding Horizontal:** 16pt (standard), 20pt (large), 12pt (small)
- **Corner Radius:** 10pt (standard), 12pt (large), 8pt (small)
- **Font:** Headline (17pt, Semibold) for standard
- **Min Tap Target:** 44pt × 44pt (add padding if content smaller)

**States:**
- Default
- Pressed (scale: 0.97, opacity: 0.8)
- Disabled (opacity: 0.4)

**Props (TypeScript):**
```typescript
interface ButtonProps {
  variant?: 'filled' | 'tinted' | 'gray' | 'plain' | 'borderless';
  size?: 'small' | 'standard' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean; // Show ActivityIndicator
  leftIcon?: string; // SF Symbol
  rightIcon?: string;
  onPress: () => void;
  children: React.ReactNode; // Button label
}
```

**Priority:** 🔥 **High** (Most common component)

---

### 2.2 Text Field (Molecule)

**Atomic Level:** Molecule (Label + Input + Optional Icons)
**Description:** Single-line text input with label, placeholder, and clear button
**iOS Usage:** Forms, search, login/signup

**Visual Specifications:**
- **Height:** 44pt (input only), 60pt+ (with label)
- **Background:** `tertiarySystemFill` (rounded) or `systemBackground` (underlined)
- **Border:** None (filled style) or 0.5pt bottom (underlined style)
- **Corner Radius:** 10pt (filled style)
- **Padding:** 12pt horizontal, 10pt vertical
- **Label Font:** Subheadline (15pt, Regular)
- **Input Font:** Body (17pt, Regular)
- **Placeholder Color:** `tertiaryLabel`

**Features:**
- **Floating Label:** Label animates to top on focus (optional)
- **Clear Button:** ⓧ icon appears when text entered (trailing)
- **Leading Icon:** Optional icon (e.g., 🔍 for search)
- **Error State:** Red border, error message below

**Props (TypeScript):**
```typescript
interface TextFieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  leadingIcon?: string;
  clearButton?: boolean; // Show clear button (default: true)
  error?: string; // Error message
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
}
```

**Priority:** 🔥 **High** (Essential form component)

---

### 2.3 Toggle (Switch) (Atom)

**Atomic Level:** Atom
**Description:** iOS-native on/off switch
**iOS Usage:** Settings, feature toggles, binary choices

**Visual Specifications:**
- **Size:** 51pt × 31pt (fixed size, non-scalable)
- **Track Color (Off):** `systemGray5` (light), `systemGray4` (dark)
- **Track Color (On):** `systemGreen` (default), custom tintColor supported
- **Thumb Color:** White (`systemBackground`)
- **Thumb Shadow:** `0 2pt 4pt rgba(0, 0, 0, 0.15)`
- **Animation:** Smooth spring animation (300ms, cubic-bezier)

**Props (TypeScript):**
```typescript
interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  tintColor?: string; // Custom on-state color (default: systemGreen)
}
```

**Priority:** 🔥 **High** (Very common in iOS)

---

### 2.4 Slider (Atom)

**Atomic Level:** Atom
**Description:** Horizontal slider for value selection (0-100 or custom range)
**iOS Usage:** Volume, brightness, numeric adjustments

**Visual Specifications:**
- **Height:** 44pt (tap target), 2pt (track)
- **Track Color (Empty):** `systemGray4`
- **Track Color (Filled):** `systemBlue` (default), custom tintColor
- **Thumb Size:** 28pt × 28pt (circular)
- **Thumb Color:** White with shadow
- **Thumb Shadow:** `0 2pt 4pt rgba(0, 0, 0, 0.20)`

**Props (TypeScript):**
```typescript
interface SliderProps {
  value: number; // 0-100 (or custom min/max)
  min?: number; // Default: 0
  max?: number; // Default: 100
  step?: number; // Default: 1
  onChange: (value: number) => void;
  tintColor?: string; // Custom filled track color
  disabled?: boolean;
}
```

**Priority:** 🟡 **Medium** (Less common than Button/TextField/Toggle)

---

### 2.5 Text View (Multi-line) (Atom)

**Atomic Level:** Atom
**Description:** Multi-line text input area
**iOS Usage:** Long-form text entry (notes, messages, comments)

**Visual Specifications:**
- **Min Height:** 88pt (2 lines of body text)
- **Background:** `tertiarySystemFill`
- **Border:** None (filled style) or 0.5pt (outlined style)
- **Corner Radius:** 10pt
- **Padding:** 12pt all sides
- **Font:** Body (17pt, Regular)
- **Placeholder Color:** `tertiaryLabel`

**Priority:** 🟡 **Medium** (Include if time permits)

---

## 3. List Components (4 components)

### 3.1 List (Organism)

**Atomic Level:** Organism (Container for ListItems)
**Description:** Scrollable list with 3 style variants (Plain, Inset, Inset Grouped)
**iOS Usage:** Settings, contacts, mail, any list-based interface

**List Styles:**

#### Plain List
- **Background:** `systemBackground`
- **Separator:** Full-width `separator` color (0.5pt)
- **Cell Background:** `systemBackground`
- **Usage:** Standard lists (e.g., Contacts)

#### Inset List
- **Background:** `systemGroupedBackground`
- **Separator:** Inset 16pt leading, `separator` color
- **Cell Background:** `secondarySystemGroupedBackground`
- **Corner Radius:** 10pt (first/last cells)
- **Horizontal Inset:** 16pt
- **Usage:** Settings, forms

#### Inset Grouped List
- **Background:** `systemGroupedBackground`
- **Separator:** Inset 16pt leading (within sections)
- **Section Background:** `secondarySystemGroupedBackground`
- **Section Spacing:** 24pt vertical
- **Corner Radius:** 10pt (per section)
- **Usage:** Settings, grouped content

**Props (TypeScript):**
```typescript
interface ListProps {
  style: 'plain' | 'inset' | 'insetGrouped';
  sections?: ListSection[]; // For grouped lists
  items?: ListItemProps[]; // For plain lists
  sectionHeaderRenderer?: (section: ListSection) => React.ReactNode;
  sectionFooterRenderer?: (section: ListSection) => React.ReactNode;
}

interface ListSection {
  header?: string;
  footer?: string;
  items: ListItemProps[];
}
```

**Priority:** 🔥 **High** (Core iOS pattern)

---

### 3.2 List Item (Molecule)

**Atomic Level:** Molecule (Icon + Text + Disclosure/Accessory)
**Description:** Individual row in a list with icon, text, and trailing accessory
**iOS Usage:** Every list in iOS (Settings, Contacts, Mail, etc.)

**Visual Specifications:**
- **Height:** 44pt (standard), 60pt+ (with subtitle), variable (auto-height)
- **Padding:** 16pt horizontal, 11pt vertical
- **Leading Icon Size:** 29pt × 29pt (rounded square) or 40pt × 40pt (avatar)
- **Text Spacing:** 4pt (title-subtitle vertical spacing)
- **Disclosure Chevron:** 13pt × 22pt, `systemGray3` color

**Content Layout:**
```
[Icon(optional)] [Title + Subtitle(optional)] [Trailing Accessory]
     29×29           Body + Footnote              Disclosure/Detail/Switch
```

**Trailing Accessories:**
| Accessory | Description | Usage |
|-----------|-------------|-------|
| **Disclosure Indicator** | Chevron (›) | Navigates to detail screen |
| **Detail Button** | Info circle (ⓘ) | Shows additional detail |
| **Detail Disclosure** | Info + Chevron | Detail screen with info |
| **Checkmark** | Blue checkmark (✓) | Selection indicator |
| **Switch** | Toggle | Binary setting |
| **Custom Text** | Detail text (gray) | Secondary info (e.g., "Wi-Fi") |

**Props (TypeScript):**
```typescript
interface ListItemProps {
  title: string;
  subtitle?: string;
  leadingIcon?: string; // SF Symbol or image URL
  leadingIconColor?: string; // Icon tint color
  trailingAccessory?: 'disclosure' | 'detail' | 'detailDisclosure' | 'checkmark' | 'switch' | 'text';
  trailingText?: string; // For 'text' accessory
  switchValue?: boolean; // For 'switch' accessory
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
}
```

**Priority:** 🔥 **High** (Essential for List component)

---

### 3.3 Swipe Actions (Molecule)

**Atomic Level:** Molecule (Hidden action buttons revealed by swipe)
**Description:** Swipe-to-reveal action buttons (leading/trailing)
**iOS Usage:** Mail (delete, archive), Messages (delete, pin), any list with actions

**Visual Specifications:**
- **Button Width:** 74pt (standard), expandable to 100% on full swipe
- **Button Height:** Matches list item height (44pt+)
- **Button Colors:**
  - Delete: `systemRed` background, white text
  - Archive: `systemOrange` background, white text
  - Pin: `systemYellow` background, white text
  - Custom: Any `system*` color
- **Icon + Label:** SF Symbol (20pt) + label below (Caption 1, 12pt)
- **Haptic Feedback:** Light impact on reveal, medium on full-swipe delete

**Swipe Directions:**
- **Trailing (Leading-to-Trailing swipe):** Primary destructive actions (Delete)
- **Leading (Trailing-to-Leading swipe):** Secondary actions (Archive, Mark as Read)

**Props (TypeScript):**
```typescript
interface SwipeActionsProps {
  leadingActions?: SwipeAction[]; // Left-to-right swipe
  trailingActions?: SwipeAction[]; // Right-to-left swipe (primary)
  children: React.ReactNode; // ListItem content
}

interface SwipeAction {
  label: string;
  icon?: string; // SF Symbol
  backgroundColor: string; // systemRed, systemOrange, etc.
  onPress: () => void;
  destructive?: boolean; // Full-swipe to execute
}
```

**Priority:** 🟡 **Medium** (Advanced interaction, nice-to-have)

---

### 3.4 Section Header / Footer (Atom)

**Atomic Level:** Atom
**Description:** Header and footer text for grouped lists
**iOS Usage:** Section titles and footers in Settings, grouped lists

**Visual Specifications:**
- **Header Font:** Footnote (13pt, Regular)
- **Header Color:** `secondaryLabel`
- **Header Padding:** 16pt leading, 8pt top, 6pt bottom
- **Footer Font:** Footnote (13pt, Regular)
- **Footer Color:** `secondaryLabel`
- **Footer Padding:** 16pt horizontal, 8pt top/bottom
- **Text Transform:** UPPERCASE for headers (iOS style)

**Props (TypeScript):**
```typescript
interface SectionHeaderProps {
  title: string;
}

interface SectionFooterProps {
  text: string;
}
```

**Priority:** 🟡 **Medium** (Used with List component)

---

## 4. Data Display Components (4 components)

### 4.1 Card (Molecule)

**Atomic Level:** Molecule
**Description:** Rounded container for grouped content
**iOS Usage:** Widgets, content cards, info panels

**Visual Specifications:**
- **Background:** `secondarySystemGroupedBackground`
- **Corner Radius:** 10pt (standard), 12pt (large)
- **Padding:** 16pt all sides (standard), 20pt (large)
- **Shadow:** `0 2pt 10pt rgba(0, 0, 0, 0.10)`
- **Border:** None (uses shadow for depth)

**Props (TypeScript):**
```typescript
interface CardProps {
  padding?: 'none' | 'small' | 'standard' | 'large';
  shadow?: boolean; // Default: true
  children: React.ReactNode;
}
```

**Priority:** 🟡 **Medium**

---

### 4.2 Badge (Atom)

**Atomic Level:** Atom
**Description:** Small notification badge (number or dot)
**iOS Usage:** Tab bar notifications, app icon badges, list item indicators

**Visual Specifications:**
- **Size (Dot):** 8pt × 8pt (circular)
- **Size (Number):** 20pt height, auto width (min 20pt)
- **Background:** `systemRed` (default), custom color supported
- **Text Color:** White
- **Font:** Caption 2 (11pt, Semibold)
- **Padding:** 4pt horizontal (for numbers)
- **Border:** 2pt white (on colored backgrounds for contrast)

**Props (TypeScript):**
```typescript
interface BadgeProps {
  count?: number; // Show number, or dot if undefined
  max?: number; // Max display (e.g., 99+), default: 99
  color?: string; // Custom background color (default: systemRed)
  showZero?: boolean; // Show badge when count is 0 (default: false)
}
```

**Priority:** 🟡 **Medium**

---

### 4.3 SF Symbol Icon (Atom)

**Atomic Level:** Atom
**Description:** iOS system icon from SF Symbols library
**iOS Usage:** Throughout iOS (icons in lists, buttons, tab bars, etc.)

**Visual Specifications:**
- **Size Scale:** Small (17pt), Medium (20pt), Large (25pt), Custom
- **Weight:** Ultralight to Black (matches text weight when paired)
- **Color:** `tintColor` (system-wide) or custom
- **Rendering Mode:** Monochrome, Hierarchical, Multicolor

**Symbol Categories (Subset for v0.1.0):**
- **Navigation:** chevron.left, chevron.right, chevron.up, chevron.down
- **Interface:** plus, minus, xmark, checkmark, magnifyingglass
- **Communication:** phone, envelope, message, bell
- **Common:** house, person, star, heart, gear (settings)

**Props (TypeScript):**
```typescript
interface SFSymbolProps {
  name: string; // SF Symbol name (e.g., 'chevron.right')
  size?: number; // Point size (default: 20pt)
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: string; // Tint color (default: inherit from parent)
  renderingMode?: 'monochrome' | 'hierarchical' | 'multicolor';
}
```

**Priority:** 🔥 **High** (Used everywhere in iOS components)

**Note:** For web, use inline SVG or icon font. Provide SF Symbols subset as SVG exports (licensed appropriately).

---

### 4.4 Status Indicator (Atom)

**Atomic Level:** Atom
**Description:** Small dot indicating status (online, offline, busy, away)
**iOS Usage:** Contacts, messaging apps, user presence

**Visual Specifications:**
- **Size:** 10pt × 10pt (circular)
- **Colors:**
  - Online: `systemGreen` (#34C759)
  - Offline: `systemGray3` (#C7C7CC)
  - Busy: `systemRed` (#FF3B30)
  - Away: `systemYellow` (#FFCC00)
- **Border:** 2pt white (on dark backgrounds for visibility)
- **Position:** Typically bottom-right of avatar (absolute positioned)

**Props (TypeScript):**
```typescript
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: number; // Default: 10pt
}
```

**Priority:** 🟢 **Low** (Nice-to-have)

---

## 5. Feedback Components (4 components)

### 5.1 Action Sheet (Organism)

**Atomic Level:** Organism
**Description:** Bottom sheet with action buttons
**iOS Usage:** Contextual actions (Share, Delete, Cancel), destructive confirmations

**Visual Specifications:**
- **Background:** `systemBackground` with heavy blur (`backdrop-filter: blur(40px)`)
- **Corner Radius:** 12pt (top corners only)
- **Padding:** 0pt (actions are full-width)
- **Shadow:** `0 -10pt 40pt rgba(0, 0, 0, 0.25)` (top shadow)
- **Animation:** Slide-up from bottom (300ms spring animation)

**Action Button Specifications:**
- **Height:** 57pt (each action)
- **Font:** Body (17pt, Regular for normal, Semibold for default action)
- **Color:** `systemBlue` (normal), `systemRed` (destructive)
- **Separator:** 0.5pt `separator` between actions
- **Cancel Button:** Separate, bottom-most, 8pt gap above

**Props (TypeScript):**
```typescript
interface ActionSheetProps {
  title?: string; // Optional title
  message?: string; // Optional message (Footnote font)
  actions: ActionSheetAction[];
  cancelLabel?: string; // Default: "Cancel"
  onCancel: () => void;
  visible: boolean;
}

interface ActionSheetAction {
  label: string;
  style?: 'default' | 'destructive'; // default = blue, destructive = red
  onPress: () => void;
}
```

**Priority:** 🔥 **High** (Common iOS pattern)

---

### 5.2 Alert (Organism)

**Atomic Level:** Organism
**Description:** Center modal alert with title, message, and 1-2 buttons
**iOS Usage:** Confirmations, warnings, errors

**Visual Specifications:**
- **Width:** 270pt (fixed on iPhone)
- **Background:** `systemBackground` with blur
- **Corner Radius:** 12pt
- **Padding:** 16pt horizontal, 16pt top, 0pt bottom (buttons are full-width)
- **Shadow:** `0 10pt 40pt rgba(0, 0, 0, 0.30)`
- **Animation:** Fade + scale (200ms)

**Content Specifications:**
- **Title Font:** Headline (17pt, Semibold)
- **Title Color:** `label` (primary)
- **Message Font:** Subheadline (15pt, Regular)
- **Message Color:** `secondaryLabel`
- **Button Height:** 44pt each
- **Button Separator:** 0.5pt `separator`

**Button Layout:**
- **1 Button:** Full-width button at bottom
- **2 Buttons:** Side-by-side (Cancel | OK), 0.5pt vertical separator

**Props (TypeScript):**
```typescript
interface AlertProps {
  title: string;
  message?: string;
  buttons: AlertButton[]; // 1-2 buttons
  visible: boolean;
  onDismiss?: () => void; // Called when alert closes
}

interface AlertButton {
  label: string;
  style?: 'default' | 'cancel' | 'destructive'; // default = blue, cancel = bold, destructive = red
  onPress: () => void;
}
```

**Priority:** 🔥 **High** (Very common)

---

### 5.3 Activity Indicator (Atom)

**Atomic Level:** Atom
**Description:** Animated spinner for loading states
**iOS Usage:** Loading screens, button loading states, pull-to-refresh

**Visual Specifications:**
- **Size:** Small (20pt), Medium (37pt), Large (44pt)
- **Color:** `systemGray` (default on light), `systemGray3` (default on dark), custom tintColor
- **Animation:** Continuous rotation (1 second per rotation)
- **Style:** iOS-native spinning dots (12 dots, fade-in-out animation)

**Props (TypeScript):**
```typescript
interface ActivityIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: string; // Tint color (default: systemGray)
  animating?: boolean; // Control animation (default: true)
}
```

**Priority:** 🔥 **High** (Essential feedback)

---

### 5.4 Progress View (Atom)

**Atomic Level:** Atom
**Description:** Linear or circular progress bar
**iOS Usage:** Downloads, uploads, task progress

**Visual Specifications:**

#### Linear Progress
- **Height:** 4pt (track)
- **Track Color:** `systemGray5`
- **Progress Color:** `systemBlue` (default), custom tintColor
- **Corner Radius:** 2pt (fully rounded ends)
- **Animation:** Smooth width transition (200ms ease-out)

#### Circular Progress
- **Size:** 20pt, 40pt, or 60pt (diameter)
- **Track Width:** 2pt (20pt size), 3pt (40pt+)
- **Track Color:** `systemGray5`
- **Progress Color:** `systemBlue` (default), custom tintColor
- **Animation:** Smooth stroke-dasharray transition

**Props (TypeScript):**
```typescript
interface ProgressViewProps {
  variant: 'linear' | 'circular';
  value: number; // 0-100 (percentage)
  size?: 'small' | 'medium' | 'large'; // For circular only
  color?: string; // Custom progress color
  showLabel?: boolean; // Show "42%" text (circular only)
}
```

**Priority:** 🟡 **Medium**

---

## Component Priority Matrix

### v0.1.0 Scope (15-18 components)

| Priority | Components | Count |
|----------|-----------|-------|
| 🔥 **Must Have** | Button, TextField, Toggle, List, ListItem, TabBar, NavigationBar, SFSymbol, ActionSheet, Alert, ActivityIndicator | 11 |
| 🟡 **Should Have** | Card, Badge, Segmented Control, Toolbar, Slider, Section Header/Footer, ProgressView | 7 |
| 🟢 **Nice to Have** | SwipeActions, StatusIndicator, TextView | 3 |

**Total v0.1.0:** 15-18 components (prioritize Must Have + Should Have)

---

## Atomic Design Summary

| Level | Components | Count |
|-------|-----------|-------|
| **Atoms** | Button, Toggle, Slider, TextField (input part), SFSymbol, Badge, StatusIndicator, ActivityIndicator, ProgressView, SectionHeader | 10 |
| **Molecules** | TextField (complete), ListItem, Card, SegmentedControl, Toolbar, SwipeActions | 6 |
| **Organisms** | TabBar, NavigationBar, List, ActionSheet, Alert | 5 |

**Total:** 21 components across 3 atomic levels

---

## Implementation Roadmap

### Phase 3: Component Implementation

**Task 3.1: Navigation Components** (5 hours)
- [ ] TabBar (Organism) - 1.5h
- [ ] NavigationBar (Organism) - 2h
- [ ] Toolbar (Molecule) - 0.75h
- [ ] SegmentedControl (Molecule) - 0.75h

**Task 3.2: Form Components** (5 hours)
- [ ] Button (Atom) - 1.5h (5 variants)
- [ ] TextField (Molecule) - 2h (floating label, clear button, error states)
- [ ] Toggle (Atom) - 0.75h (spring animation)
- [ ] Slider (Atom) - 0.75h

**Task 3.3: List Components** (4 hours)
- [ ] List (Organism) - 1.5h (3 style variants)
- [ ] ListItem (Molecule) - 1.5h (6 accessory types)
- [ ] SwipeActions (Molecule) - 0.5h (nice-to-have)
- [ ] SectionHeader/Footer (Atom) - 0.5h

**Task 3.4: Data Display Components** (3 hours)
- [ ] Card (Molecule) - 0.75h
- [ ] Badge (Atom) - 0.5h
- [ ] SFSymbol (Atom) - 1h (SVG wrapper + subset)
- [ ] StatusIndicator (Atom) - 0.25h (low priority)

**Task 3.5: Feedback Components** (3 hours)
- [ ] ActionSheet (Organism) - 1h (slide-up animation)
- [ ] Alert (Organism) - 1h (fade + scale animation)
- [ ] ActivityIndicator (Atom) - 0.5h (spinner animation)
- [ ] ProgressView (Atom) - 0.5h (linear + circular)

**Total Implementation Time:** 20 hours (matches story estimate)

---

## Token Mapping Reference

All components use design tokens from `01-ios-design-tokens-analysis.md`:

### Color Tokens
- `colors.system.*` - System colors (blue, green, red, etc.)
- `colors.systemGray*` - Gray scale (gray, gray2-gray6)
- `colors.label.*` - Text hierarchy (primary, secondary, tertiary, quaternary)
- `colors.fill.*` - Fill hierarchy (primary, secondary, tertiary, quaternary)
- `colors.background.*` - Background hierarchy (primary, secondary, tertiary)
- `colors.separator` - Hairline separator color

### Typography Tokens
- `typography.family.*` - SF Pro Text, Display, Rounded
- `typography.styles.*` - Text styles (largeTitle, title1-3, headline, body, callout, etc.)

### Spacing Tokens
- `spacing.grid` - 8pt base grid
- `spacing.margins.*` - Standard margins (16pt, 20pt)
- `spacing.padding.*` - Standard padding (8pt, 12pt, 16pt, 24pt)
- `spacing.safeArea.*` - Safe area insets (top, bottom)
- `spacing.minTapTarget` - 44pt minimum

### Shadow Tokens
- `shadows.card` - `0 2pt 10pt rgba(0, 0, 0, 0.10)`
- `shadows.modal` - `0 10pt 40pt rgba(0, 0, 0, 0.20)`
- `shadows.actionSheet` - `0 -10pt 40pt rgba(0, 0, 0, 0.25)`

### Border Tokens
- `borders.radius.*` - Corner radius (8pt, 10pt, 12pt)
- `borders.separator` - 0.5pt hairline

---

## Next Steps

### Phase 2: Architecture & Setup (Aria + Dex)

**Task 2.1:** Create `packages/ios-design-system/` structure
**Task 2.2:** Implement token system architecture using this inventory
**Task 2.3:** Setup development tooling (Vite, Storybook, Vitest)

**Deliverable:** Complete project structure ready for component implementation

---

## References

- **Design Tokens:** `01-ios-design-tokens-analysis.md`
- **Apple HIG - Components:** https://developer.apple.com/design/human-interface-guidelines/components
- **iOS Design Guidelines:** https://ivomynttinen.com/blog/ios-design-guidelines/
- **Atomic Design Methodology:** Brad Frost - Atomic Design

---

**Document Status:** ✅ Complete
**Next Phase:** Phase 2 - Architecture & Setup (@architect + @dev)
**Author:** @ux-design-expert (Uma)
**Story:** 2.1 - iOS 16 Design System
**Phase 1 Tasks:** ✅ 1.1, ✅ 1.2, ✅ 1.3, ✅ 1.4 (All Complete)
