import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Button visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interactions',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button (default)
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// Secondary button
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

// Ghost button
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

// Danger button
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

// Small size
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

// Medium size (default)
export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

// Large size
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

// With left icon
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0v16M0 8h16" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const WithLeftIcon: Story = {
  args: {
    leftIcon: <PlusIcon />,
    children: 'Add Item',
  },
};

// With right icon
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export const WithRightIcon: Story = {
  args: {
    rightIcon: <ArrowIcon />,
    children: 'Next Step',
  },
};

// Full width
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="danger">Danger Button</Button>
    </div>
  ),
};

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Interactive states showcase
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
      <Button>Normal</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button leftIcon={<PlusIcon />}>With Icon</Button>
    </div>
  ),
};
