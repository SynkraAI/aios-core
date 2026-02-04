import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Data Display/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Badge color variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Badge size',
    },
    badgeStyle: {
      control: 'select',
      options: ['solid', 'subtle', 'outline'],
      description: 'Badge visual style',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge
export const Default: Story = {
  args: {
    children: 'Default',
  },
};

// Primary badge
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

// Success badge
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

// Warning badge
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

// Danger badge
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
};

// Info badge
export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

// Styles
export const Solid: Story = {
  args: {
    variant: 'primary',
    badgeStyle: 'solid',
    children: 'Solid',
  },
};

export const Subtle: Story = {
  args: {
    variant: 'primary',
    badgeStyle: 'subtle',
    children: 'Subtle',
  },
};

export const Outline: Story = {
  args: {
    variant: 'primary',
    badgeStyle: 'outline',
    children: 'Outline',
  },
};

// With icons
const DotIcon = () => (
  <span style={{ fontSize: '8px' }}>●</span>
);

export const WithLeftIcon: Story = {
  args: {
    variant: 'success',
    leftIcon: <DotIcon />,
    children: 'Active',
  },
};

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M6 4.586L9.293 1.293l1.414 1.414L7.414 6l3.293 3.293-1.414 1.414L6 7.414l-3.293 3.293-1.414-1.414L4.586 6 1.293 2.707l1.414-1.414L6 4.586z" />
  </svg>
);

export const WithRightIcon: Story = {
  args: {
    variant: 'danger',
    rightIcon: <CloseIcon />,
    children: 'Remove',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Badge size="sm" variant="primary">Small</Badge>
      <Badge size="md" variant="primary">Medium</Badge>
      <Badge size="lg" variant="primary">Large</Badge>
    </div>
  ),
};

// All styles showcase
export const AllStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Badge variant="primary" badgeStyle="solid">Solid</Badge>
        <Badge variant="success" badgeStyle="solid">Solid</Badge>
        <Badge variant="danger" badgeStyle="solid">Solid</Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Badge variant="primary" badgeStyle="subtle">Subtle</Badge>
        <Badge variant="success" badgeStyle="subtle">Subtle</Badge>
        <Badge variant="danger" badgeStyle="subtle">Subtle</Badge>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Badge variant="primary" badgeStyle="outline">Outline</Badge>
        <Badge variant="success" badgeStyle="outline">Outline</Badge>
        <Badge variant="danger" badgeStyle="outline">Outline</Badge>
      </div>
    </div>
  ),
};

// Practical examples
export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Badge variant="success" leftIcon={<DotIcon />}>Online</Badge>
      <Badge variant="warning" leftIcon={<DotIcon />}>Away</Badge>
      <Badge variant="danger" leftIcon={<DotIcon />}>Offline</Badge>
      <Badge variant="default" leftIcon={<DotIcon />}>Invisible</Badge>
    </div>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ fontSize: '24px' }}>🔔</span>
        <Badge
          variant="danger"
          size="sm"
          style={{ position: 'absolute', top: -4, right: -8 }}
        >
          3
        </Badge>
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ fontSize: '24px' }}>💬</span>
        <Badge
          variant="primary"
          size="sm"
          style={{ position: 'absolute', top: -4, right: -8 }}
        >
          12
        </Badge>
      </div>
    </div>
  ),
};

export const CategoryBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <Badge badgeStyle="subtle" variant="primary">TypeScript</Badge>
      <Badge badgeStyle="subtle" variant="success">React</Badge>
      <Badge badgeStyle="subtle" variant="info">Design System</Badge>
      <Badge badgeStyle="subtle" variant="warning">Beta</Badge>
    </div>
  ),
};
