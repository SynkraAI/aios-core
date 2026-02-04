# EcoFlow Design System - Component Inventory

**Story:** 1.1 - EcoFlow Design System
**Phase:** 1 - Design Analysis
**Created by:** @ux-design-expert (Uma)
**Date:** 2026-02-04

---

## Component Organization

Following **Atomic Design** principles:
- **Atoms:** Basic building blocks (Button, Input, Badge)
- **Molecules:** Simple combinations (FormField, NavItem)
- **Organisms:** Complex sections (Sidebar, Table, DashboardCard)

---

## Layout Components (4)

### 1. Sidebar
**Type:** Organism
**Screenshot:** #1, #2
**Description:** Fixed left navigation panel

**Features:**
- Logo at top
- Collapsible navigation items with icons
- Active state highlighting (teal background)
- Fixed width (~240-280px)
- Dark teal background (#00BFA5)
- White text and icons

**Props (proposed):**
```typescript
interface SidebarProps {
  logo?: React.ReactNode;
  items: NavItem[];
  activeItem?: string;
  collapsed?: boolean;
  onItemClick?: (id: string) => void;
}
```

---

### 2. TopBar / Header
**Type:** Organism
**Screenshot:** #1, #2
**Description:** Horizontal header with utilities

**Features:**
- Search bar (left)
- Notification bell icon
- User avatar (right)
- Background: white
- Border bottom: 1px solid neutral.200

**Props (proposed):**
```typescript
interface TopBarProps {
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: number;
  user: {
    name: string;
    avatar?: string;
  };
}
```

---

### 3. Container
**Type:** Atom
**Screenshot:** All
**Description:** Max-width content wrapper

**Features:**
- Max-width: 1280px (xl)
- Padding: 24px (6)
- Centered with auto margins

**Props (proposed):**
```typescript
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: number;
  children: React.ReactNode;
}
```

---

### 4. Grid
**Type:** Molecule
**Screenshot:** #2 (project image grid)
**Description:** Responsive grid layout

**Features:**
- Columns: 4 (desktop), 2 (tablet), 1 (mobile)
- Gap: 24px (6)
- Grid items: equal height

**Props (proposed):**
```typescript
interface GridProps {
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  children: React.ReactNode;
}
```

---

## Navigation Components (3)

### 5. NavItem
**Type:** Molecule
**Screenshot:** #1, #2 (sidebar)
**Description:** Sidebar navigation link

**Features:**
- Icon + label layout
- Active state: darker teal background
- Hover state: lighter teal background
- Padding: 12px 16px

**Props (proposed):**
```typescript
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number; // Optional notification count
}
```

---

### 6. Breadcrumb
**Type:** Molecule
**Screenshot:** Not prominent, but standard pattern
**Description:** Hierarchical navigation

**Features:**
- Separator: "/" or ">"
- Last item: bold (current page)
- Color: neutral.600
- Hover: primary.500

**Props (proposed):**
```typescript
interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  separator?: React.ReactNode;
}
```

---

### 7. Tabs
**Type:** Molecule
**Screenshot:** #1 (Activity, Inventory, Events, Documents, Reports, Overview)
**Description:** Horizontal tab navigation

**Features:**
- Active tab: underline (2px solid primary.500)
- Inactive tabs: neutral.600 text
- Hover: neutral.800 text
- Gap between tabs: 32px (8)

**Props (proposed):**
```typescript
interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}
```

---

## Data Display Components (7)

### 8. Card
**Type:** Organism
**Screenshot:** #1, #2 (multiple cards)
**Description:** Elevated container for content

**Features:**
- Background: white
- Border radius: 6px (md)
- Shadow: default
- Padding: 24px (6)
- Optional header/footer sections

**Props (proposed):**
```typescript
interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  elevation?: 'none' | 'sm' | 'default' | 'md' | 'lg';
}
```

---

### 9. Table
**Type:** Organism
**Screenshot:** #5 (reports table)
**Description:** Data table with sorting and selection

**Features:**
- Checkbox column (row selection)
- Header row: bold, background neutral.50
- Row borders: 1px solid neutral.200
- Hover row: background neutral.50
- Cell padding: 12px (3)
- Sortable columns (implied)

**Props (proposed):**
```typescript
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onRowSelect?: (rows: T[]) => void;
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}
```

---

### 10. Badge
**Type:** Atom
**Screenshot:** #5, #6 (status indicators, toasts)
**Description:** Small status indicator

**Features:**
- Pill shape (border-radius: full)
- Sizes: sm (12px text), md (14px text)
- Color variants: primary, success, warning, error, neutral
- Padding: 4px 12px (Y:1, X:3)

**Props (proposed):**
```typescript
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}
```

---

### 11. StatusIndicator
**Type:** Atom
**Screenshot:** #5 (Approved, Direct, In Review)
**Description:** Semantic status badge

**Features:**
- Same as Badge but with predefined semantic colors
- Text: uppercase, 12px, bold
- Icons optional (checkmark for approved, etc.)

**Props (proposed):**
```typescript
interface StatusIndicatorProps {
  status: 'approved' | 'pending' | 'rejected' | 'in-review' | 'direct';
  showIcon?: boolean;
}
```

**Color Mapping:**
- Approved → `success` (green)
- In Review → `warning` (yellow/amber)
- Direct → `error` (red/coral)
- Pending → `neutral` (gray)
- Rejected → `error` (red)

---

### 12. Avatar
**Type:** Atom
**Screenshot:** #2 (Amin Watkins user avatar)
**Description:** Circular user image or initials

**Features:**
- Border-radius: full (circle)
- Sizes: xs (24px), sm (32px), md (40px), lg (48px), xl (64px)
- Fallback: initials with background color
- Optional status indicator (online/offline dot)

**Props (proposed):**
```typescript
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string; // Initials
  status?: 'online' | 'offline' | 'busy';
}
```

---

### 13. ProgressRing
**Type:** Atom
**Screenshot:** #2 (circular "56" indicator)
**Description:** Circular progress indicator

**Features:**
- SVG-based circle
- Value displayed in center (large, bold)
- Stroke: primary.500 for progress, neutral.200 for background
- Stroke width: 8px
- Size: 120px diameter (typical)

**Props (proposed):**
```typescript
interface ProgressRingProps {
  value: number; // 0-100
  max?: number;
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
}
```

---

### 14. ProgressBar
**Type:** Atom
**Screenshot:** #2 (horizontal bars under "North America", "Asia", etc.)
**Description:** Horizontal progress bar

**Features:**
- Background: neutral.200
- Fill: primary.500 or accent.yellow.500
- Height: 8px (2)
- Border-radius: full (pill)
- Optional label above/below

**Props (proposed):**
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
  label?: string;
  showPercentage?: boolean;
}
```

---

## Form Components (6)

### 15. Button
**Type:** Atom
**Screenshot:** #6, #7 (extensive button states)
**Description:** Interactive button element

**Features:**
- **Variants:**
  - `solid`: Filled background (primary, accent, neutral)
  - `outline`: Border only (transparent background)
  - `ghost`: No border, transparent background
- **Sizes:** sm, md, lg
- **States:** default, hover, active, disabled
- **Icon support:** leading/trailing icon

**Props (proposed):**
```typescript
interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost';
  color?: 'primary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Size Specs:**
- sm: padding 8px 12px, fontSize 14px
- md: padding 10px 16px, fontSize 16px ★ DEFAULT
- lg: padding 12px 20px, fontSize 18px

---

### 16. Input
**Type:** Atom
**Screenshot:** #2 (search bar), implied in forms
**Description:** Text input field

**Features:**
- Border: 1px solid neutral.300
- Border-radius: 4px (default)
- Padding: 10px 12px
- Focus state: 2px solid primary.500, outline-offset 0
- Disabled: background neutral.100, cursor not-allowed
- Error state: border error.500

**Props (proposed):**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

---

### 17. Select / Dropdown
**Type:** Molecule
**Screenshot:** #2 ("View all" dropdown implied)
**Description:** Dropdown select menu

**Features:**
- Same styling as Input
- Chevron down icon (trailing)
- Dropdown menu: white background, shadow-lg
- Options: hover background neutral.50
- Selected option: checkmark icon

**Props (proposed):**
```typescript
interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}
```

---

### 18. Checkbox
**Type:** Atom
**Screenshot:** #5 (table row selection)
**Description:** Checkbox input

**Features:**
- Size: 16px (4)
- Border: 2px solid neutral.400
- Border-radius: 2px (sm)
- Checked: background primary.500, white checkmark
- Hover: border primary.500
- Disabled: background neutral.100

**Props (proposed):**
```typescript
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean; // For "select all" state
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}
```

---

### 19. Radio
**Type:** Atom
**Screenshot:** Not visible, but standard pattern
**Description:** Radio button input

**Features:**
- Size: 16px (4)
- Border: 2px solid neutral.400
- Border-radius: full (circle)
- Selected: inner dot (primary.500, 8px diameter)
- Hover: border primary.500

**Props (proposed):**
```typescript
interface RadioProps {
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
}
```

---

### 20. Switch / Toggle
**Type:** Atom
**Screenshot:** #7 (toggle pills)
**Description:** Toggle switch

**Features:**
- Track: width 44px, height 24px, border-radius full
- Thumb: 20px circle, white
- Off state: background neutral.300, thumb left
- On state: background primary.500, thumb right
- Transition: 200ms ease

**Props (proposed):**
```typescript
interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}
```

---

## Feedback Components (5)

### 21. Toast / Notification
**Type:** Molecule
**Screenshot:** #6 (4 colored toasts)
**Description:** Temporary notification message

**Features:**
- **Variants:** success (green), error (red), warning (yellow), info (black)
- Position: top-right or bottom-right
- Width: 360px max
- Padding: 16px (4)
- Border-radius: 6px (md)
- Shadow: lg
- Icon (leading) + message + close button
- Auto-dismiss after 5s (configurable)

**Props (proposed):**
```typescript
interface ToastProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // ms
  onClose?: () => void;
  showCloseButton?: boolean;
}
```

---

### 22. Modal / Dialog
**Type:** Organism
**Screenshot:** #7 (implied, not directly shown)
**Description:** Overlay modal window

**Features:**
- Overlay: black with 50% opacity
- Content: white background, rounded (lg)
- Max-width: 640px (md modal size)
- Shadow: 2xl
- Close button (top-right)
- Optional header/footer sections

**Props (proposed):**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}
```

---

### 23. Alert
**Type:** Molecule
**Screenshot:** #2 (yellow warning box)
**Description:** Inline alert message

**Features:**
- **Variants:** info, success, warning, error
- Background: variant light color (e.g., warning.light)
- Border-left: 4px solid variant color
- Padding: 16px (4)
- Border-radius: 4px (default)
- Icon (leading) + message
- Optional close button

**Props (proposed):**
```typescript
interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
}
```

---

### 24. Loading / Spinner
**Type:** Atom
**Screenshot:** Not visible, but standard pattern
**Description:** Loading indicator

**Features:**
- **Variants:**
  - Spinner (circular, animated)
  - Dots (3 bouncing dots)
  - Skeleton (content placeholder)
- Sizes: sm, md, lg
- Color: primary.500 (default)

**Props (proposed):**
```typescript
interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string; // "Loading..."
}
```

---

### 25. Progress (Linear)
**Type:** Same as ProgressBar (#14)

---

## Typography Components (2)

### 26. Heading
**Type:** Atom
**Description:** Heading text (H1-H6)

**Features:**
- Levels: h1, h2, h3, h4, h5, h6
- Font-weight: 600 (semibold) or 700 (bold)
- Color: neutral.800 or neutral.900
- Line-height: tight (1.25)

**Props (proposed):**
```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  color?: string;
  weight?: 'semibold' | 'bold';
}
```

**Size Mapping:**
- H1: 4xl (36px)
- H2: 3xl (30px)
- H3: 2xl (24px)
- H4: xl (20px)
- H5: lg (18px)
- H6: base (16px)

---

### 27. Text
**Type:** Atom
**Description:** Body text with variants

**Features:**
- Sizes: xs, sm, base, lg
- Weights: normal (400), medium (500), semibold (600)
- Colors: full neutral palette
- Line-height: normal (1.5)

**Props (proposed):**
```typescript
interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold';
  color?: string;
  children: React.ReactNode;
  truncate?: boolean;
}
```

---

## Component Priority Matrix

### Phase 3 Implementation Priority

**Must Have (High Priority):**
1. Button
2. Input
3. Card
4. Badge
5. Heading
6. Text
7. Sidebar
8. Container

**Should Have (Medium Priority):**
9. Table
10. NavItem
11. Tabs
12. Select
13. Checkbox
14. Toast
15. Alert
16. Avatar

**Nice to Have (Low Priority):**
17. Modal
18. ProgressRing
19. ProgressBar
20. Radio
21. Switch
22. Loading
23. Breadcrumb
24. TopBar
25. Grid
26. StatusIndicator

---

## Atomic Design Hierarchy

### Atoms (12)
- Button
- Input
- Checkbox
- Radio
- Switch
- Badge
- Avatar
- ProgressBar
- ProgressRing
- Loading
- Heading
- Text

### Molecules (7)
- FormField (Input + Label + Error)
- NavItem (Icon + Text)
- Breadcrumb
- Tabs
- Select
- Alert
- Toast

### Organisms (8)
- Sidebar
- TopBar
- Card
- Table
- Modal
- DashboardCard (Card + ProgressRing + Stats)
- HeroBanner
- DataGrid

---

## Next Steps

1. ✅ Phase 1 Complete: All 27 components identified and documented
2. ⏩ Phase 2: Architecture & Setup
   - Create project structure
   - Implement design tokens in TypeScript
   - Set up Storybook
3. ⏩ Phase 3: Component Implementation
   - Start with high-priority atoms (Button, Input, Badge)
   - Build molecules (FormField, NavItem)
   - Compose organisms (Sidebar, Table, Card)

---

*Component inventory created by @ux-design-expert (Uma)*
*Ready for handoff to @architect for token implementation architecture*
