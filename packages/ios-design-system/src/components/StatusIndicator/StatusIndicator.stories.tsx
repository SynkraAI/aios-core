import type { Meta, StoryObj } from '@storybook/react'
import { StatusIndicator } from './StatusIndicator'

const meta = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default online status with medium size
 */
export const Default: Story = {
  args: {
    status: 'online',
  },
}

/**
 * All status types
 */
export const StatusTypes: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Online</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="offline" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Offline</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="away" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Away</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="busy" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Busy</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="dnd" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>DND</div>
      </div>
    </div>
  ),
}

/**
 * All sizes
 */
export const Sizes: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" size="small" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" size="medium" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" size="large" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Large</div>
      </div>
    </div>
  ),
}

/**
 * With pulse animation
 */
export const WithPulse: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" pulse />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>No Pulse</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <StatusIndicator status="online" pulse size="large" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>With Pulse</div>
      </div>
    </div>
  ),
}

/**
 * With text labels
 */
export const WithLabels: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <StatusIndicator status="online" label="Available" pulse />
      <StatusIndicator status="offline" label="Offline" />
      <StatusIndicator status="away" label="Away" />
      <StatusIndicator status="busy" label="In a meeting" />
      <StatusIndicator status="dnd" label="Do Not Disturb" />
    </div>
  ),
}

/**
 * In user list context
 */
export const InUserList: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', padding: '20px' }}>
      {[
        { name: 'John Smith', status: 'online' as const, label: 'Active now' },
        { name: 'Jane Doe', status: 'away' as const, label: 'Away' },
        { name: 'Bob Johnson', status: 'busy' as const, label: 'In a meeting' },
        { name: 'Alice Williams', status: 'dnd' as const, label: 'Do not disturb' },
        { name: 'Charlie Brown', status: 'offline' as const, label: 'Offline' },
      ].map((user) => (
        <div
          key={user.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              position: 'relative',
            }}
          >
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}>
              <StatusIndicator status={user.status} size="small" pulse={user.status === 'online'} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: 400 }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: '#8E8E93' }}>{user.label}</div>
          </div>
        </div>
      ))}
    </div>
  ),
}

/**
 * In profile header
 */
export const InProfileHeader: Story = {
  args: {},
  render: () => (
    <div style={{ width: '400px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 600,
            position: 'relative',
          }}
        >
          JS
          <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
            <StatusIndicator status="online" size="large" pulse />
          </div>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>John Smith</h2>
          <div style={{ marginTop: '8px' }}>
            <StatusIndicator status="online" label="Available" pulse />
          </div>
        </div>
      </div>
    </div>
  ),
}

/**
 * In chat interface
 */
export const InChat: Story = {
  args: {},
  render: () => (
    <div style={{ width: '350px', padding: '20px', background: '#F2F2F7' }}>
      <div style={{ marginBottom: '16px', fontSize: '11px', fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase' }}>
        Recent Chats
      </div>
      {[
        { name: 'Sarah Connor', status: 'online' as const, lastMessage: 'See you tomorrow!', time: '2m' },
        { name: 'Kyle Reese', status: 'away' as const, lastMessage: 'Thanks for the update', time: '1h' },
        { name: 'Miles Dyson', status: 'busy' as const, lastMessage: 'In a meeting right now', time: '3h' },
      ].map((chat) => (
        <div
          key={chat.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'white',
            borderRadius: '10px',
            marginBottom: '8px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#34C759',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {chat.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
              <StatusIndicator status={chat.status} size="small" pulse={chat.status === 'online'} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '17px', fontWeight: 600 }}>{chat.name}</span>
              <span style={{ fontSize: '13px', color: '#8E8E93' }}>{chat.time}</span>
            </div>
            <div style={{ fontSize: '15px', color: '#8E8E93' }}>{chat.lastMessage}</div>
          </div>
        </div>
      ))}
    </div>
  ),
}
