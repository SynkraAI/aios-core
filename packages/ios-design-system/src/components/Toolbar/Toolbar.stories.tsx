import type { Meta, StoryObj } from '@storybook/react'
import { Toolbar, ToolbarAction } from './Toolbar'

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

const defaultActions: ToolbarAction[] = [
  { id: 'share', label: 'Share', icon: '↗️', onPress: () => console.log('Share') },
  { id: 'favorite', label: 'Favorite', icon: '❤️', onPress: () => console.log('Favorite') },
  { id: 'delete', label: 'Delete', icon: '🗑️', onPress: () => console.log('Delete') },
]

/**
 * Default toolbar at bottom
 */
export const Default: Story = {
  args: { actions: defaultActions },
  render: (args) => (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#F2F2F7' }}>
      <div style={{ padding: '20px', paddingBottom: '70px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 'bold' }}>Toolbar Demo</h1>
        <p>Actions at the bottom</p>
      </div>
      <Toolbar {...args} />
    </div>
  ),
}

/**
 * Toolbar at top
 */
export const TopPosition: Story = {
  args: { actions: defaultActions, position: 'top' },
  render: (args) => (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#F2F2F7' }}>
      <Toolbar {...args} />
      <div style={{ padding: '20px', marginTop: '60px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 'bold' }}>Top Toolbar</h1>
        <p>Actions at the top</p>
      </div>
    </div>
  ),
}

/**
 * Toolbar with disabled actions
 */
export const WithDisabled: Story = {
  args: {
    actions: [
      { id: 'undo', label: 'Undo', icon: '↶', onPress: () => {}, disabled: true },
      { id: 'redo', label: 'Redo', icon: '↷', onPress: () => {} },
      { id: 'share', label: 'Share', icon: '↗️', onPress: () => {} },
    ],
  },
  render: (args) => (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#F2F2F7' }}>
      <div style={{ padding: '20px', paddingBottom: '70px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 'bold' }}>Disabled Actions</h1>
        <p>Undo is disabled</p>
      </div>
      <Toolbar {...args} />
    </div>
  ),
}

/**
 * Non-translucent toolbar
 */
export const Solid: Story = {
  args: { actions: defaultActions, translucent: false },
  render: (args) => (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#F2F2F7' }}>
      <div style={{ padding: '20px', paddingBottom: '70px' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 'bold' }}>Solid Toolbar</h1>
        <p>No translucency or blur</p>
      </div>
      <Toolbar {...args} />
    </div>
  ),
}

/**
 * Photos app example
 */
export const PhotosApp: Story = {
  args: {
    actions: [
      { id: 'favorite', label: 'Favorite', icon: '❤️', onPress: () => {} },
      { id: 'share', label: 'Share', icon: '↗️', onPress: () => {} },
      { id: 'edit', label: 'Edit', icon: '✏️', onPress: () => {} },
      { id: 'delete', label: 'Delete', icon: '🗑️', onPress: () => {} },
    ],
  },
  render: (args) => (
    <div style={{ minHeight: '100vh', position: 'relative', background: '#000000' }}>
      <div
        style={{
          padding: '20px',
          paddingBottom: '70px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '90%',
            maxWidth: '400px',
            aspectRatio: '4/3',
            background: '#333',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          📷 Photo
        </div>
      </div>
      <Toolbar {...args} />
    </div>
  ),
}
