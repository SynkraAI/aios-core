import type { Meta, StoryObj } from '@storybook/react'
import { SFSymbol } from './SFSymbol'

const meta = {
  title: 'Components/SFSymbol',
  component: SFSymbol,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SFSymbol>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default symbol with medium size
 */
export const Default: Story = {
  args: {
    name: '⭐️',
  },
}

/**
 * All sizes
 */
export const Sizes: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="small" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Small</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="medium" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="large" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Large</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>XLarge</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="xxlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>XXLarge</div>
      </div>
    </div>
  ),
}

/**
 * Different weights
 */
export const Weights: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="ultralight" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Ultralight</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="thin" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Thin</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="light" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Light</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="regular" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Regular</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="medium" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Medium</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="semibold" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Semibold</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="bold" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Bold</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="heavy" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Heavy</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="●" size="xlarge" weight="black" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Black</div>
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
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <SFSymbol name="❤️" size="xlarge" color="#FF3B30" />
      <SFSymbol name="💙" size="xlarge" color="#007AFF" />
      <SFSymbol name="💚" size="xlarge" color="#34C759" />
      <SFSymbol name="💛" size="xlarge" color="#FFCC00" />
      <SFSymbol name="💜" size="xlarge" color="#AF52DE" />
      <SFSymbol name="🧡" size="xlarge" color="#FF9500" />
    </div>
  ),
}

/**
 * Rendering modes
 */
export const RenderingModes: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="xxlarge" renderingMode="monochrome" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Monochrome</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="xxlarge" renderingMode="multicolor" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Multicolor</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⭐️" size="xxlarge" renderingMode="hierarchical" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Hierarchical</div>
      </div>
    </div>
  ),
}

/**
 * Interactive symbols (clickable)
 */
export const Interactive: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <SFSymbol
        name="❤️"
        size="xlarge"
        color="#FF3B30"
        onClick={() => alert('Liked!')}
        accessibilityLabel="Like button"
      />
      <SFSymbol
        name="⭐️"
        size="xlarge"
        color="#FFCC00"
        onClick={() => alert('Favorited!')}
        accessibilityLabel="Favorite button"
      />
      <SFSymbol
        name="🔖"
        size="xlarge"
        color="#007AFF"
        onClick={() => alert('Bookmarked!')}
        accessibilityLabel="Bookmark button"
      />
      <SFSymbol
        name="📤"
        size="xlarge"
        color="#34C759"
        onClick={() => alert('Shared!')}
        accessibilityLabel="Share button"
      />
    </div>
  ),
}

/**
 * Common iOS symbols
 */
export const CommonSymbols: Story = {
  args: {},
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="🏠" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Home</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="🔍" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Search</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="⚙️" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Settings</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="👤" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Profile</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="💬" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Messages</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="🔔" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Notifications</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="📧" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Mail</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="📅" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Calendar</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="📁" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Folder</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="📷" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Camera</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="🎵" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Music</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <SFSymbol name="📱" size="xlarge" />
        <div style={{ fontSize: '11px', marginTop: '8px', color: '#8E8E93' }}>Phone</div>
      </div>
    </div>
  ),
}

/**
 * In context (with text)
 */
export const InContext: Story = {
  args: {},
  render: () => (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
        <SFSymbol name="🏠" size="medium" color="#007AFF" />
        <span>Home</span>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
        <SFSymbol name="🔍" size="medium" color="#007AFF" />
        <span>Search</span>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
        <SFSymbol name="💬" size="medium" color="#007AFF" />
        <span>Messages</span>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px' }}>
        <SFSymbol name="⚙️" size="medium" color="#8E8E93" />
        <span>Settings</span>
      </div>
    </div>
  ),
}
