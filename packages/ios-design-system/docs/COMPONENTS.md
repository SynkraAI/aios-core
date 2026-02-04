# Components Documentation

Complete reference for all 24 iOS Design System components.

## Table of Contents

- [Navigation Components](#navigation-components)
- [Form Components](#form-components)
- [List Components](#list-components)
- [Data Display Components](#data-display-components)
- [Feedback Components](#feedback-components)

---

## Navigation Components

### TabBar

Bottom navigation bar with badge support.

**Props:**
- `items: TabBarItem[]` - Tab items with id, label, icon, optional badge
- `activeTab: string` - Currently active tab ID
- `onChange: (tabId: string) => void` - Tab change handler
- `tintColor?: string` - Custom tint color
- `className?: string` - Additional CSS classes

**Features:**
- 49pt height (iOS standard)
- Max 5 tabs recommended
- Badge support for notifications
- Translucent background with blur
- Safe area insets (home indicator)

**Example:**
```tsx
<TabBar
  items={[
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'messages', label: 'Messages', icon: '💬', badge: 3 },
  ]}
  activeTab="home"
  onChange={(id) => console.log(id)}
/>
```

---

### NavigationBar

Top navigation bar with title and action buttons.

**Props:**
- `title: string` - Navigation title
- `leftButton?: { label, icon, onPress }` - Left button
- `rightButton?: { label, icon, onPress }` - Right button
- `largeTitle?: boolean` - Use large title (34px)
- `translucent?: boolean` - Translucent background
- `className?: string` - Additional CSS classes

**Features:**
- 44pt height (standard) or 96pt (large title)
- Safe area insets (notch)
- Translucent background option
- Left/right action buttons

**Example:**
```tsx
<NavigationBar
  title="Settings"
  largeTitle
  leftButton={{ label: 'Back', onPress: () => navigate(-1) }}
  rightButton={{ icon: '⚙️', onPress: () => openSettings() }}
/>
```

---

### Toolbar

Action toolbar with flexible button layout.

**Props:**
- `actions: ToolbarAction[]` - Action buttons
- `position?: 'top' | 'bottom'` - Toolbar position
- `translucent?: boolean` - Translucent background
- `className?: string` - Additional CSS classes

**Features:**
- 44pt height
- Top or bottom positioning
- Flexible button layout
- Disabled state support
- Translucent background option

**Example:**
```tsx
<Toolbar
  position="bottom"
  actions={[
    { id: 'share', label: 'Share', icon: '📤', onPress: () => share() },
    { id: 'edit', label: 'Edit', icon: '✏️', onPress: () => edit() },
  ]}
/>
```

---

### SegmentedControl

Tab switcher with sliding indicator animation.

**Props:**
- `options: SegmentedControlOption[]` - Segments
- `selectedId: string` - Currently selected segment ID
- `onChange: (segmentId: string) => void` - Selection handler
- `fullWidth?: boolean` - Fill container width
- `className?: string` - Additional CSS classes

**Features:**
- 32pt height
- 2-5 segments recommended
- Sliding indicator animation
- Optional icons
- Full width or compact

**Example:**
```tsx
<SegmentedControl
  options={[
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
  ]}
  selectedId="all"
  onChange={(id) => filterTasks(id)}
/>
```

---

## Form Components

### Button

iOS-style button with multiple variants.

**Props:**
- `label: string` - Button text
- `icon?: React.ReactNode` - Optional icon
- `iconPosition?: 'left' | 'right'` - Icon position
- `variant?: 'filled' | 'tinted' | 'gray' | 'plain'` - Visual variant
- `size?: 'small' | 'medium' | 'large'` - Button size
- `destructive?: boolean` - Destructive action styling
- `disabled?: boolean` - Disabled state
- `loading?: boolean` - Loading state with spinner
- `onPress: () => void` - Click handler
- `className?: string` - Additional CSS classes

**Features:**
- 4 variants (filled, tinted, gray, plain)
- 3 sizes (small 32px, medium 44px, large 56px)
- Destructive styling
- Loading state
- Icon support
- Scale animation on press

**Example:**
```tsx
<Button
  label="Save Changes"
  icon="💾"
  variant="filled"
  onPress={handleSave}
/>

<Button
  label="Delete"
  variant="filled"
  destructive
  onPress={handleDelete}
/>
```

---

### TextField

Text input with label, placeholder, and validation.

**Props:**
- `value: string` - Input value
- `onChange: (value: string) => void` - Change handler
- `label?: string` - Input label
- `placeholder?: string` - Placeholder text
- `type?: 'text' | 'email' | 'password' | 'number'` - Input type
- `error?: string` - Error message
- `disabled?: boolean` - Disabled state
- `clearButton?: boolean` - Show clear button
- `maxLength?: number` - Max character length
- `className?: string` - Additional CSS classes

**Features:**
- Multiple input types
- Label and placeholder
- Error state with message
- Clear button
- Character counter
- Disabled state

**Example:**
```tsx
<TextField
  label="Email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={setEmail}
  error={emailError}
  clearButton
/>
```

---

### Toggle

iOS-style switch with smooth animation.

**Props:**
- `checked: boolean` - Toggle state
- `onChange: (checked: boolean) => void` - Change handler
- `disabled?: boolean` - Disabled state
- `className?: string` - Additional CSS classes

**Features:**
- 31px × 51px dimensions
- Smooth spring animation (0.3s)
- Green when on, gray when off
- Disabled state

**Example:**
```tsx
<Toggle
  checked={notifications}
  onChange={setNotifications}
/>
```

---

### Slider

Range slider for numeric values.

**Props:**
- `value: number` - Current value
- `onChange: (value: number) => void` - Change handler
- `min?: number` - Minimum value (default 0)
- `max?: number` - Maximum value (default 100)
- `step?: number` - Step increment (default 1)
- `color?: string` - Track color
- `disabled?: boolean` - Disabled state
- `className?: string` - Additional CSS classes

**Features:**
- Customizable range
- Step increments
- Custom colors
- Smooth thumb animation
- Disabled state

**Example:**
```tsx
<Slider
  value={volume}
  onChange={setVolume}
  min={0}
  max={100}
  step={5}
  color="#34C759"
/>
```

---

## List Components

### List

Container for list items with grouped/inset styles.

**Props:**
- `children: React.ReactNode` - List items
- `style?: 'grouped' | 'inset'` - List style
- `className?: string` - Additional CSS classes

**Features:**
- Grouped style (full width)
- Inset style (rounded, padded)
- Automatic separators
- iOS-native styling

**Example:**
```tsx
<List style="inset">
  <ListItem label="Settings" icon="⚙️" accessory="chevron" />
  <ListItem label="Privacy" icon="🔒" accessory="chevron" />
</List>
```

---

### ListItem

Rich list item with multiple features.

**Props:**
- `label: string` - Item label
- `icon?: React.ReactNode` - Leading icon
- `iconBackground?: string` - Icon background color
- `detail?: string` - Detail text
- `value?: string` - Trailing value text
- `accessory?: 'none' | 'chevron' | 'disclosure' | 'checkmark' | 'info'` - Trailing accessory
- `badge?: number` - Badge count
- `toggle?: { value, onChange }` - Integrated toggle
- `onPress?: () => void` - Click handler
- `disabled?: boolean` - Disabled state
- `className?: string` - Additional CSS classes

**Features:**
- 44pt minimum height
- Icon with background (29px × 29px)
- Detail and value text
- 5 accessory types
- Badge support
- Integrated toggle switch
- Disabled state

**Example:**
```tsx
<ListItem
  icon="🔔"
  iconBackground="#FF3B30"
  label="Notifications"
  detail="Messages, calls, and more"
  toggle={{ value: true, onChange: setNotifications }}
/>

<ListItem
  icon="📧"
  label="Inbox"
  badge={12}
  accessory="chevron"
  onPress={() => openInbox()}
/>
```

---

### SectionHeader

Section header with optional action button.

**Props:**
- `title: string` - Header title
- `action?: { label, onPress }` - Optional action button
- `className?: string` - Additional CSS classes

**Features:**
- 13pt uppercase font
- systemGray color
- Optional action button
- iOS-native styling

**Example:**
```tsx
<SectionHeader
  title="Settings"
  action={{ label: 'Edit', onPress: () => edit() }}
/>
```

---

### SwipeActions

Swipeable wrapper with reveal actions.

**Props:**
- `children: React.ReactNode` - Content to wrap
- `leadingActions?: SwipeAction[]` - Left swipe actions
- `trailingActions?: SwipeAction[]` - Right swipe actions
- `className?: string` - Additional CSS classes

**Features:**
- Touch gesture support
- Leading (left) and trailing (right) actions
- Smooth spring animation
- Custom action colors
- Icon support

**Example:**
```tsx
<SwipeActions
  leadingActions={[
    { id: 'pin', label: 'Pin', icon: '📌', backgroundColor: '#FF9500', onPress: () => pin() }
  ]}
  trailingActions={[
    { id: 'delete', label: 'Delete', icon: '🗑️', backgroundColor: '#FF3B30', onPress: () => delete() }
  ]}
>
  <ListItem label="Swipe me" />
</SwipeActions>
```

---

## Data Display Components

### Card

Container card with variants and optional header.

**Props:**
- `children: React.ReactNode` - Card content
- `title?: string` - Card title
- `subtitle?: string` - Card subtitle
- `image?: React.ReactNode` - Header image
- `accessory?: React.ReactNode` - Header accessory
- `onPress?: () => void` - Click handler (makes card clickable)
- `variant?: 'default' | 'elevated' | 'filled'` - Visual variant
- `className?: string` - Additional CSS classes

**Features:**
- 3 variants (default, elevated, filled)
- Optional header with title, subtitle, image, accessory
- Clickable with scale animation
- 10pt border radius
- iOS-native shadows

**Example:**
```tsx
<Card
  variant="elevated"
  title="Welcome"
  subtitle="Get started with iOS Design System"
  image={<img src="banner.jpg" />}
  onPress={() => navigate('/welcome')}
>
  <p>Card content goes here...</p>
</Card>
```

---

### Badge

Notification badge with number or text.

**Props:**
- `value: number | string` - Badge value
- `variant?: 'red' | 'gray' | 'blue' | 'green' | 'orange' | 'purple'` - Color variant
- `size?: 'small' | 'medium' | 'large'` - Badge size
- `className?: string` - Additional CSS classes

**Features:**
- 6 color variants (system colors)
- 3 sizes (small 16px, medium 20px, large 24px)
- Shows "99+" for values > 99
- Circular for single digit, pill for 2+
- Dark mode support

**Example:**
```tsx
<Badge value={3} variant="red" />
<Badge value={127} variant="blue" /> {/* Shows "99+" */}
<Badge value="New" variant="green" />
```

---

### SFSymbol

Icon component with SF Symbols styling (emoji fallback).

**Props:**
- `name: string` - Symbol name or emoji
- `size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'` - Icon size
- `weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black'` - Font weight
- `color?: string` - Custom color
- `renderingMode?: 'monochrome' | 'multicolor' | 'hierarchical'` - Rendering mode
- `accessibilityLabel?: string` - Accessibility label
- `onClick?: () => void` - Click handler (makes interactive)
- `className?: string` - Additional CSS classes

**Features:**
- 5 sizes (14pt → 34pt)
- 9 font weights
- 3 rendering modes
- Custom colors
- Interactive state
- Keyboard accessible

**Example:**
```tsx
<SFSymbol name="⭐️" size="large" color="#FFCC00" />
<SFSymbol name="❤️" size="xlarge" onClick={handleLike} />
```

---

### StatusIndicator

Online/offline/busy status indicator.

**Props:**
- `status: 'online' | 'offline' | 'away' | 'busy' | 'dnd'` - Status type
- `size?: 'small' | 'medium' | 'large'` - Indicator size
- `pulse?: boolean` - Show pulse animation (online only)
- `label?: string` - Optional text label
- `className?: string` - Additional CSS classes

**Features:**
- 5 status types with system colors
- 3 sizes (8px, 12px, 16px)
- Pulse animation for online status
- Optional text label
- Dark mode support

**Example:**
```tsx
<StatusIndicator status="online" pulse />
<StatusIndicator status="busy" label="In a meeting" />
```

---

## Feedback Components

### ActionSheet

Modal action picker with slide-up animation.

**Props:**
- `visible: boolean` - Visibility state
- `title?: string` - Sheet title
- `message?: string` - Sheet message
- `actions: ActionSheetAction[]` - Action buttons
- `cancelLabel?: string` - Cancel button label
- `onDismiss: () => void` - Dismiss handler
- `className?: string` - Additional CSS classes

**Features:**
- Slide-up animation
- Title and message
- Multiple actions with icons
- Destructive action styling
- Separate cancel button
- Backdrop dismiss
- Body scroll lock

**Example:**
```tsx
<ActionSheet
  visible={showSheet}
  title="Photo Options"
  actions={[
    { id: 'share', label: 'Share', icon: '📤', onPress: () => share() },
    { id: 'delete', label: 'Delete', icon: '🗑️', destructive: true, onPress: () => delete() },
  ]}
  onDismiss={() => setShowSheet(false)}
/>
```

---

### Alert

Modal alert dialog with buttons.

**Props:**
- `visible: boolean` - Visibility state
- `title: string` - Alert title
- `message?: string` - Alert message
- `buttons: AlertButton[]` - Alert buttons (1-3)
- `onDismiss?: () => void` - Dismiss handler
- `className?: string` - Additional CSS classes

**Features:**
- Scale-in animation
- Title and message
- 1-3 buttons
- Intelligent layout (2 buttons = horizontal, others = vertical)
- Button styles (default, cancel, destructive)
- Backdrop blur
- Body scroll lock

**Example:**
```tsx
<Alert
  visible={showAlert}
  title="Delete Item?"
  message="This action cannot be undone."
  buttons={[
    { id: 'cancel', label: 'Cancel', style: 'cancel', onPress: () => close() },
    { id: 'delete', label: 'Delete', style: 'destructive', onPress: () => delete() },
  ]}
/>
```

---

### ActivityIndicator

Loading spinner with iOS styling.

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Spinner size
- `color?: string` - Custom color
- `animating?: boolean` - Animation state
- `accessibilityLabel?: string` - Accessibility label
- `className?: string` - Additional CSS classes

**Features:**
- 3 sizes (20px, 30px, 44px)
- Custom colors
- Smooth rotation (0.8s linear)
- Animation control
- Accessibility support
- Dark mode support

**Example:**
```tsx
<ActivityIndicator size="large" color="#007AFF" />
<ActivityIndicator size="small" animating={isLoading} />
```

---

### ProgressView

Progress bar with optional percentage label.

**Props:**
- `progress: number` - Progress value (0-1)
- `variant?: 'default' | 'bar'` - Visual variant
- `progressColor?: string` - Progress bar color
- `trackColor?: string` - Track color
- `showLabel?: boolean` - Show percentage label
- `accessibilityLabel?: string` - Accessibility label
- `className?: string` - Additional CSS classes

**Features:**
- Progress value 0-1 (clamped automatically)
- 2 variants (default 4px, bar 8px)
- Custom colors (progress + track)
- Optional percentage label
- Smooth transition animation
- Accessibility support

**Example:**
```tsx
<ProgressView progress={0.75} showLabel />
<ProgressView progress={0.5} variant="bar" progressColor="#34C759" />
```

---

## Common Patterns

### Using with TypeScript

All components are fully typed:

```typescript
import { ButtonProps, AlertButton } from '@synkra/ios-design-system'

const button: ButtonProps = {
  label: 'Click me',
  onPress: () => console.log('clicked'),
}

const alertButtons: AlertButton[] = [
  { id: '1', label: 'OK', onPress: () => {} }
]
```

### Dark Mode

All components support dark mode automatically:

```css
/* Automatically adapts based on system preference */
@media (prefers-color-scheme: dark) {
  /* Dark mode styles applied automatically */
}
```

### Accessibility

All components include:
- Semantic HTML elements
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus indicators

### Animations

All components use iOS-native animations:
- Spring: `cubic-bezier(0.4, 0, 0.2, 1)`
- Duration: 0.15s - 0.3s
- Transform-based (better performance)

---

## Need Help?

- Check [Storybook](http://localhost:6006) for live examples
- See [README.md](../README.md) for getting started
- Review [iOS HIG](https://developer.apple.com/design/human-interface-guidelines/) for design guidance
