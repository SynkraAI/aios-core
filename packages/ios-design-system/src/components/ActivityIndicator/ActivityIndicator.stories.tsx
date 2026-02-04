import type { Meta, StoryObj } from '@storybook/react'
import { ActivityIndicator } from './ActivityIndicator'

const meta = {
  title: 'Components/ActivityIndicator',
  component: ActivityIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityIndicator>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default medium size activity indicator
 */
export const Default: Story = {
  args: {},
}

/**
 * All sizes
 */
export const Sizes: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator size="small" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator size="medium" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator size="large" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Large</div>
      </div>
    </div>
  ),
}

/**
 * Custom colors
 */
export const Colors: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#007AFF" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Blue</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#34C759" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Green</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#FF3B30" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Red</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#FF9500" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Orange</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#AF52DE" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Purple</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator color="#8E8E93" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Gray</div>
      </div>
    </div>
  ),
}

/**
 * Not animating (paused)
 */
export const NotAnimating: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator animating={true} />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Animating</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <ActivityIndicator animating={false} />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Not Animating</div>
      </div>
    </div>
  ),
}

/**
 * In loading state context
 */
export const InLoadingState: Story = {
  args: {},
  render: () => (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <div style={{ marginTop: '16px', fontSize: '17px', color: '#8E8E93' }}>Loading...</div>
    </div>
  ),
}

/**
 * In button (inline)
 */
export const InButton: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: '#007AFF',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '17px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <ActivityIndicator size="small" color="white" />
        Loading...
      </button>

      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 24px',
          background: 'transparent',
          color: '#007AFF',
          border: '2px solid #007AFF',
          borderRadius: '10px',
          fontSize: '17px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <ActivityIndicator size="small" color="#007AFF" />
        Processing...
      </button>
    </div>
  ),
}

/**
 * In empty state
 */
export const InEmptyState: Story = {
  args: {},
  render: () => (
    <div
      style={{
        width: '300px',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: '#F2F2F7',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <ActivityIndicator size="large" />
      <div style={{ fontSize: '17px', fontWeight: 600, color: '#000000' }}>Loading Content</div>
      <div style={{ fontSize: '13px', color: '#8E8E93', textAlign: 'center' }}>
        Please wait while we fetch your data...
      </div>
    </div>
  ),
}

/**
 * In list item
 */
export const InListItem: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px' }}>
      {[
        { label: 'Syncing Messages', loading: true },
        { label: 'Downloading Photos', loading: true },
        { label: 'Updating Contacts', loading: false },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)',
          }}
        >
          <span style={{ fontSize: '17px' }}>{item.label}</span>
          {item.loading && <ActivityIndicator size="small" color="#007AFF" />}
          {!item.loading && <span style={{ fontSize: '17px', color: '#34C759' }}>✓</span>}
        </div>
      ))}
    </div>
  ),
}
