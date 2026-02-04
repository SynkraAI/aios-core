# Getting Started - EcoFlow Design System

Welcome to the EcoFlow Design System! This guide will help you get started with using the design system in your React projects.

## Installation

```bash
npm install @fosc/ecoflow-design-system
# or
yarn add @fosc/ecoflow-design-system
# or
pnpm add @fosc/ecoflow-design-system
```

## Quick Start

### 1. Import Components

```typescript
import { Button, Input, Card, Alert } from '@fosc/ecoflow-design-system';

function App() {
  return (
    <Card>
      <Alert variant="success">Welcome to EcoFlow!</Alert>
      <Input label="Name" placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### 2. Using Design Tokens

```typescript
import { colors, spacing, typography } from '@fosc/ecoflow-design-system';

function CustomComponent() {
  return (
    <div style={{
      backgroundColor: colors.primary[500],
      padding: spacing[4],
      fontFamily: typography.fontFamily.sans,
    }}>
      Custom styled component
    </div>
  );
}
```

## Core Concepts

### Design Tokens

The design system is built on a foundation of design tokens that ensure consistency across all components.

**Available token categories:**
- **Colors:** Primary, accent, neutral, semantic colors
- **Typography:** Font families, sizes, weights, line heights
- **Spacing:** Consistent spacing scale from 0 to 96
- **Shadows:** Elevation system from sm to 2xl
- **Borders:** Border radius and widths

**Example:**
```typescript
import { colors, spacing } from '@fosc/ecoflow-design-system';

const styles = {
  backgroundColor: colors.primary[500],  // Teal
  padding: spacing[6],                   // 24px
  borderRadius: '8px',
};
```

### Component Categories

#### Typography
- **Heading:** H1-H6 headings with weight variants
- **Text:** Body text in various sizes

```tsx
<Heading level="h1" weight="bold">Page Title</Heading>
<Text size="base">Body text content</Text>
```

#### Layout
- **Container:** Max-width wrapper
- **Stack:** Flexible vertical/horizontal layout
- **Grid:** CSS Grid layout
- **Spacer:** Empty space component

```tsx
<Container size="lg">
  <Stack direction="vertical" gap={4}>
    <Heading level="h2">Section Title</Heading>
    <Text>Content goes here</Text>
  </Stack>
</Container>
```

#### Navigation
- **Sidebar:** Collapsible sidebar navigation
- **TopBar:** Header with search and user menu
- **Breadcrumb:** Hierarchical navigation trail
- **Tabs:** Horizontal tab navigation

```tsx
<Sidebar items={navItems} collapsed={false} />
<TopBar searchPlaceholder="Search..." />
<Breadcrumb items={breadcrumbItems} />
<Tabs tabs={tabItems} activeTab={0} />
```

#### Forms
- **Button:** Primary, secondary, outline, ghost, danger variants
- **Input:** Text input with label, helper text, error states
- **Select:** Dropdown select
- **Checkbox/CheckboxGroup:** Single and grouped checkboxes
- **Radio/RadioGroup:** Single and grouped radios
- **Switch:** Toggle switch

```tsx
<form>
  <Input
    label="Email"
    type="email"
    error={errors.email}
    helperText="We'll never share your email"
  />
  <Switch label="Remember me" />
  <Button variant="primary" type="submit">
    Sign In
  </Button>
</form>
```

#### Data Display
- **Badge:** Status indicators and labels
- **Avatar:** User avatars with fallback
- **StatusIndicator:** Online/offline/busy/away indicators
- **Card:** Flexible card container
- **Table:** Data table with sorting and selection

```tsx
<Card header={<h3>User Profile</h3>}>
  <Avatar name="John Doe" src="/avatar.jpg" />
  <StatusIndicator status="online" showLabel />
  <Badge variant="success">Active</Badge>
</Card>
```

#### Feedback
- **Alert:** Informational messages (info, success, warning, error)
- **Loading:** Loading indicators (spinner, dots, pulse)
- **Progress:** Progress bars (linear, circular)
- **Modal:** Dialog overlays
- **Toast:** Notification toasts

```tsx
<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Loading variant="spinner" label="Loading data..." />

<Progress variant="linear" value={65} showLabel />

<Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm Action">
  Are you sure you want to continue?
</Modal>

<Toast
  variant="info"
  message="New message received"
  position="top-right"
/>
```

## TypeScript Support

All components are fully typed with TypeScript. Import types alongside components:

```typescript
import { Button, ButtonProps } from '@fosc/ecoflow-design-system';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Styling

### Using Design Tokens

Prefer using design tokens over hardcoded values:

```typescript
// ✓ Good - uses design tokens
import { colors, spacing } from '@fosc/ecoflow-design-system';

const styles = {
  color: colors.primary[600],
  padding: spacing[4],
};

// ✗ Avoid - hardcoded values
const styles = {
  color: '#00a896',
  padding: '16px',
};
```

### Custom Styling

All components support `className` and `style` props:

```tsx
<Button
  className="my-custom-button"
  style={{ marginTop: '1rem' }}
>
  Custom Button
</Button>
```

### CSS-in-JS

Components use inline styles with TypeScript `CSSProperties` for type safety:

```tsx
const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: spacing[4],
};
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Proper ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast compliance

**Example: Accessible Form**
```tsx
<Input
  label="Email Address"
  type="email"
  required
  error={emailError}
  helperText="We'll never share your email"
  aria-describedby="email-helper"
/>
```

## Best Practices

### 1. Component Composition

Build complex UIs by composing simple components:

```tsx
<Card
  header={
    <Stack direction="horizontal" justify="space-between" align="center">
      <Heading level="h3">Dashboard</Heading>
      <Badge variant="info">3 new</Badge>
    </Stack>
  }
  footer={
    <Stack direction="horizontal" gap={2} justify="flex-end">
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save</Button>
    </Stack>
  }
>
  <Text>Card content goes here</Text>
</Card>
```

### 2. Consistent Spacing

Use the spacing scale consistently:

```tsx
<Stack gap={4}>  {/* 16px gap */}
  <Section />
  <Section />
</Stack>
```

### 3. Semantic HTML

Use appropriate heading levels and semantic elements:

```tsx
// ✓ Good
<Heading level="h1">Page Title</Heading>
<Heading level="h2">Section Title</Heading>
<Heading level="h3">Subsection Title</Heading>

// ✗ Avoid
<Heading level="h1">Page Title</Heading>
<Heading level="h1">Section Title</Heading>  // Wrong level
```

### 4. Form Validation

Provide clear error messages:

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText={errors.email || "Enter a valid email address"}
/>
```

### 5. Loading States

Always provide feedback for async operations:

```tsx
{isLoading ? (
  <Loading variant="spinner" label="Loading data..." />
) : (
  <Table columns={columns} data={data} />
)}
```

## Examples

### Dashboard Layout

```tsx
import {
  Container,
  Stack,
  Sidebar,
  TopBar,
  Card,
  Heading,
  Text
} from '@fosc/ecoflow-design-system';

function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar items={navItems} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <TopBar searchPlaceholder="Search..." />
        <Container size="xl">
          <Stack gap={6}>
            <Heading level="h1">Dashboard</Heading>
            <Grid columns={3} gap={4}>
              <Card>
                <Heading level="h3">Total Users</Heading>
                <Text size="xl" weight="bold">12,543</Text>
              </Card>
              {/* More cards */}
            </Grid>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
```

### Form Example

```tsx
import {
  Stack,
  Input,
  Select,
  Checkbox,
  Button,
  Alert
} from '@fosc/ecoflow-design-system';

function SignupForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <Stack gap={4}>
      <Alert variant="info">
        Create an account to get started
      </Alert>

      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />

      <Select
        label="Country"
        options={countries}
        value={formData.country}
        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
      />

      <Checkbox
        label="I agree to the terms and conditions"
        checked={formData.agreed}
        onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
      />

      <Button variant="primary" fullWidth>
        Create Account
      </Button>
    </Stack>
  );
}
```

## Storybook Documentation

View interactive examples and API documentation in Storybook:

```bash
npm run storybook
```

Browse all components, experiment with props, and see live code examples.

## Resources

- **Design Tokens:** See `TESTING.md` for design token reference
- **Component API:** See Storybook for full API documentation
- **Accessibility:** See individual component docs for a11y features
- **Testing:** See `TESTING.md` for testing guidelines

## Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](#)
- Documentation: See component-specific docs in Storybook
- Examples: Browse Storybook stories for code examples

---

**Next Steps:**
1. Explore components in Storybook
2. Read design principles documentation
3. Check out example projects
4. Start building! 🚀
