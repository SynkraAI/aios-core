import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'tinted', 'gray', 'plain', 'borderless'],
      description: 'Button visual variant',
    },
    size: {
      control: 'select',
      options: ['small', 'standard', 'large'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default button with filled variant (primary action)
 */
export const Default: Story = {
  args: {
    children: 'Continue',
    variant: 'filled',
    size: 'standard',
  },
}

/**
 * All button variants side by side
 */
export const AllVariants: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
      <Button variant="filled">Filled Button</Button>
      <Button variant="tinted">Tinted Button</Button>
      <Button variant="gray">Gray Button</Button>
      <Button variant="plain">Plain Button</Button>
      <Button variant="borderless">Borderless Button</Button>
    </div>
  ),
}

/**
 * Button sizes
 */
export const Sizes: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Button size="small" variant="filled">Small (36pt)</Button>
      <Button size="standard" variant="filled">Standard (44pt)</Button>
      <Button size="large" variant="filled">Large (50pt)</Button>
    </div>
  ),
}

/**
 * Button states
 */
export const States: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
      <Button variant="filled">Normal</Button>
      <Button variant="filled" disabled>Disabled</Button>
      <Button variant="filled" loading>Loading</Button>
    </div>
  ),
}

/**
 * Full width button (common in iOS forms)
 */
export const FullWidth: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{ width: '300px' }}>
      <Button variant="filled" fullWidth>Sign In</Button>
    </div>
  ),
}

/**
 * Buttons with icons (using simple emoji as placeholder for SF Symbols)
 */
export const WithIcons: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '200px' }}>
      <Button variant="filled" leftIcon={<span>+</span>}>Add Item</Button>
      <Button variant="filled" rightIcon={<span>→</span>}>Next</Button>
      <Button variant="tinted" leftIcon={<span>🔍</span>} rightIcon={<span>⌘K</span>}>Search</Button>
    </div>
  ),
}

/**
 * iOS Login Form example
 */
export const LoginForm: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      backgroundColor: '#F2F2F7',
      borderRadius: '12px'
    }}>
      <Button variant="filled" fullWidth>Sign In</Button>
      <Button variant="gray" fullWidth>Cancel</Button>
      <Button variant="plain" fullWidth>Forgot Password?</Button>
    </div>
  ),
}

/**
 * iOS Action Sheet buttons
 */
export const ActionSheetButtons: Story = {
  args: { children: 'Button' },
  render: () => (
    <div style={{
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <Button variant="plain" fullWidth style={{ borderRadius: 0, height: '57px' }}>
        Share
      </Button>
      <div style={{ height: '0.5px', backgroundColor: 'rgba(60, 60, 67, 0.29)' }} />
      <Button variant="plain" fullWidth style={{ borderRadius: 0, height: '57px', color: '#FF3B30' }}>
        Delete
      </Button>
    </div>
  ),
}
