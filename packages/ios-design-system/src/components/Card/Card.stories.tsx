import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default card (bordered)
 */
export const Default: Story = {
  args: {
    children: <p>This is a basic iOS card with default styling.</p>,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card {...args} />
    </div>
  ),
}

/**
 * Card with title and subtitle
 */
export const WithHeader: Story = {
  args: {
    title: 'Welcome',
    subtitle: 'Get started with our app',
    children: <p>Complete your profile to unlock all features and personalize your experience.</p>,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card {...args} />
    </div>
  ),
}

/**
 * Card with image
 */
export const WithImage: Story = {
  args: {
    title: 'John Doe',
    subtitle: 'Software Engineer',
    image: '👤',
    children: <p>Passionate about building great user experiences.</p>,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card {...args} />
    </div>
  ),
}

/**
 * Elevated card (with shadow)
 */
export const Elevated: Story = {
  args: {
    title: 'Premium Feature',
    subtitle: 'Upgrade to unlock',
    variant: 'elevated',
    children: <p>Get access to advanced features and priority support.</p>,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px', background: '#F2F2F7', borderRadius: '12px' }}>
      <Card {...args} />
    </div>
  ),
}

/**
 * Filled card (background color)
 */
export const Filled: Story = {
  args: {
    title: 'Information',
    subtitle: 'Important notice',
    variant: 'filled',
    children: <p>Your account has been successfully verified.</p>,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card {...args} />
    </div>
  ),
}

/**
 * Clickable card
 */
export const Clickable: Story = {
  args: {
    title: 'Settings',
    subtitle: 'Manage your preferences',
    image: '⚙️',
    accessory: '›',
    onPress: () => console.log('Card clicked'),
    children: null,
  },
  render: (args) => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card {...args}>
        <p>Tap this card to open settings.</p>
      </Card>
    </div>
  ),
}

/**
 * Card grid
 */
export const Grid: Story = {
  args: { children: null },
  render: () => (
    <div style={{ width: '750px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      <Card title="Photos" image="📷" variant="elevated" onPress={() => {}}>
        <p style={{ margin: 0 }}>1,234 photos</p>
      </Card>
      <Card title="Videos" image="🎬" variant="elevated" onPress={() => {}}>
        <p style={{ margin: 0 }}>56 videos</p>
      </Card>
      <Card title="Music" image="🎵" variant="elevated" onPress={() => {}}>
        <p style={{ margin: 0 }}>3,456 songs</p>
      </Card>
      <Card title="Files" image="📁" variant="elevated" onPress={() => {}}>
        <p style={{ margin: 0 }}>89 files</p>
      </Card>
    </div>
  ),
}

/**
 * App Store card example
 */
export const AppStore: Story = {
  args: { children: null },
  render: () => (
    <div style={{ width: '350px', padding: '20px' }}>
      <Card
        title="Amazing App"
        subtitle="Productivity • #1 in Category"
        image={<div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px' }} />}
        accessory={
          <button style={{ background: '#007AFF', color: '#FFFFFF', border: 'none', borderRadius: '15px', padding: '6px 16px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            GET
          </button>
        }
      >
        <p style={{ margin: '0 0 12px' }}>Boost your productivity with powerful tools.</p>
        <div style={{ fontSize: '13px', color: '#8E8E93' }}>
          ⭐️ 4.8 • 10K Ratings
        </div>
      </Card>
    </div>
  ),
}
