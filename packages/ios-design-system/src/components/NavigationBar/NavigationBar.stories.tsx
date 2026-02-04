import type { Meta, StoryObj } from '@storybook/react'
import { NavigationBar } from './NavigationBar'

const meta = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationBar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Standard navigation bar with back button
 */
export const Default: Story = {
  args: {
    title: 'Settings',
    leftButton: { label: 'Back', onPress: () => console.log('Back') },
  },
  render: (args) => (
    <div style={{ minHeight: '200px' }}>
      <NavigationBar {...args} />
    </div>
  ),
}

/**
 * Navigation bar with left and right buttons
 */
export const WithButtons: Story = {
  args: {
    title: 'Edit Profile',
    leftButton: { label: 'Cancel', onPress: () => {} },
    rightButton: { label: 'Done', onPress: () => {} },
  },
  render: (args) => (
    <div style={{ minHeight: '200px' }}>
      <NavigationBar {...args} />
    </div>
  ),
}

/**
 * Large title variant (iOS 11+)
 */
export const LargeTitle: Story = {
  args: {
    title: 'Messages',
    largeTitle: true,
    rightButton: { label: 'Compose', icon: '✏️', onPress: () => {} },
  },
  render: (args) => (
    <div style={{ minHeight: '250px', background: '#F2F2F7' }}>
      <NavigationBar {...args} />
      <div style={{ padding: '20px', marginTop: '140px' }}>
        <p>Content below large title navigation bar</p>
      </div>
    </div>
  ),
}

/**
 * Non-translucent variant
 */
export const Solid: Story = {
  args: {
    title: 'Photos',
    translucent: false,
    leftButton: { label: 'Back', onPress: () => {} },
  },
  render: (args) => (
    <div style={{ minHeight: '200px' }}>
      <NavigationBar {...args} />
    </div>
  ),
}

/**
 * With icon buttons
 */
export const WithIcons: Story = {
  args: {
    title: 'Inbox',
    leftButton: { label: '', icon: '☰', onPress: () => {} },
    rightButton: { label: '', icon: '🔍', onPress: () => {} },
  },
  render: (args) => (
    <div style={{ minHeight: '200px' }}>
      <NavigationBar {...args} />
    </div>
  ),
}

/**
 * Mail app example
 */
export const MailApp: Story = {
  args: {
    title: 'All Inboxes',
    leftButton: { label: 'Mailboxes', onPress: () => {} },
    rightButton: { label: 'Compose', icon: '✏️', onPress: () => {} },
  },
  render: (args) => (
    <div style={{ minHeight: '400px', background: '#F2F2F7' }}>
      <NavigationBar {...args} />
      <div style={{ padding: '20px', marginTop: '70px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '8px',
          }}
        >
          <strong>John Doe</strong>
          <p style={{ margin: '4px 0 0', color: '#8E8E93', fontSize: '15px' }}>
            Meeting tomorrow at 10am
          </p>
        </div>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '10px',
            padding: '12px 16px',
          }}
        >
          <strong>Jane Smith</strong>
          <p style={{ margin: '4px 0 0', color: '#8E8E93', fontSize: '15px' }}>
            Project update
          </p>
        </div>
      </div>
    </div>
  ),
}
