import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default red badge with number
 */
export const Default: Story = {
  args: {
    value: 3,
  },
}

/**
 * All color variants
 */
export const Colors: Story = {
  args: { value: 5 },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge value={3} variant="red" />
      <Badge value={5} variant="blue" />
      <Badge value={7} variant="green" />
      <Badge value={9} variant="orange" />
      <Badge value={11} variant="purple" />
      <Badge value={13} variant="gray" />
    </div>
  ),
}

/**
 * All sizes
 */
export const Sizes: Story = {
  args: { value: 5 },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge value={3} size="small" />
      <Badge value={5} size="medium" />
      <Badge value={7} size="large" />
    </div>
  ),
}

/**
 * Large numbers (shows 99+)
 */
export const LargeNumbers: Story = {
  args: { value: 5 },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Badge value={9} />
      <Badge value={99} />
      <Badge value={127} />
      <Badge value={999} />
    </div>
  ),
}

/**
 * Text badges
 */
export const TextBadges: Story = {
  args: { value: 'New' },
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge value="New" variant="green" />
      <Badge value="Hot" variant="red" />
      <Badge value="Sale" variant="orange" />
      <Badge value="Pro" variant="purple" />
      <Badge value="Beta" variant="blue" />
    </div>
  ),
}

/**
 * In context (with other components)
 */
export const InContext: Story = {
  args: { value: 5 },
  render: () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px' }}>Messages</span>
          <Badge value={3} variant="red" />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px' }}>Notifications</span>
          <Badge value={127} variant="blue" />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '17px' }}>Updates</span>
          <Badge value="5" variant="green" size="small" />
        </div>
      </div>
    </div>
  ),
}

/**
 * App icon badges example
 */
export const AppIcons: Story = {
  args: { value: 5 },
  render: () => (
    <div style={{ display: 'flex', gap: '24px', padding: '20px' }}>
      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        <div style={{ width: '60px', height: '60px', background: '#007AFF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          📧
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <Badge value={3} variant="red" />
        </div>
      </div>

      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        <div style={{ width: '60px', height: '60px', background: '#34C759', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          💬
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <Badge value={127} variant="red" />
        </div>
      </div>

      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        <div style={{ width: '60px', height: '60px', background: '#FF9500', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          🔔
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <Badge value={5} variant="red" />
        </div>
      </div>
    </div>
  ),
}
