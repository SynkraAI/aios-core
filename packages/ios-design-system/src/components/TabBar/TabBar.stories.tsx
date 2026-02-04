import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TabBar, TabBarItem } from './TabBar'

const meta = {
  title: 'Components/TabBar',
  component: TabBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TabBar>

export default meta
type Story = StoryObj<typeof meta>

const defaultTabs: TabBarItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'favorites', label: 'Favorites', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

/**
 * Default tab bar with 5 tabs
 */
export const Default: Story = {
  args: { items: defaultTabs, activeTab: 'home', onChange: () => {} },
  render: () => {
    const [activeTab, setActiveTab] = useState('home')
    return (
      <div style={{ height: '100vh', position: 'relative', background: '#F2F2F7' }}>
        <div style={{ padding: '20px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>
            Tab Bar Demo
          </h1>
          <p>Active Tab: {activeTab}</p>
        </div>
        <TabBar items={defaultTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    )
  },
}

/**
 * Tab bar with badges
 */
export const WithBadges: Story = {
  args: { items: defaultTabs, activeTab: 'home', onChange: () => {} },
  render: () => {
    const [activeTab, setActiveTab] = useState('home')
    const tabsWithBadges: TabBarItem[] = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'messages', label: 'Messages', icon: '💬', badge: 3 },
      { id: 'notifications', label: 'Notifications', icon: '🔔', badge: 127 },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ]

    return (
      <div style={{ height: '100vh', position: 'relative', background: '#F2F2F7' }}>
        <div style={{ padding: '20px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>
            With Badges
          </h1>
          <p>Messages has 3 notifications</p>
          <p>Notifications shows 99+ (127 actual)</p>
        </div>
        <TabBar items={tabsWithBadges} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    )
  },
}

/**
 * Minimal 3-tab layout
 */
export const ThreeTabs: Story = {
  args: { items: defaultTabs, activeTab: 'home', onChange: () => {} },
  render: () => {
    const [activeTab, setActiveTab] = useState('feed')
    const minimalTabs: TabBarItem[] = [
      { id: 'feed', label: 'Feed', icon: '📰' },
      { id: 'explore', label: 'Explore', icon: '🌍' },
      { id: 'account', label: 'Account', icon: '👤' },
    ]

    return (
      <div style={{ height: '100vh', position: 'relative', background: '#F2F2F7' }}>
        <div style={{ padding: '20px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>
            Three Tabs
          </h1>
          <p>Minimal layout for simpler apps</p>
        </div>
        <TabBar items={minimalTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    )
  },
}

/**
 * Custom tint color (green)
 */
export const CustomColor: Story = {
  args: { items: defaultTabs, activeTab: 'home', onChange: () => {} },
  render: () => {
    const [activeTab, setActiveTab] = useState('home')
    return (
      <div style={{ height: '100vh', position: 'relative', background: '#F2F2F7' }}>
        <div style={{ padding: '20px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>
            Custom Tint Color
          </h1>
          <p>Green tint color instead of blue</p>
        </div>
        <TabBar
          items={defaultTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          tintColor="#34C759"
        />
      </div>
    )
  },
}

/**
 * Music app example
 */
export const MusicApp: Story = {
  args: { items: defaultTabs, activeTab: 'home', onChange: () => {} },
  render: () => {
    const [activeTab, setActiveTab] = useState('library')
    const musicTabs: TabBarItem[] = [
      { id: 'listen-now', label: 'Listen Now', icon: '▶️' },
      { id: 'browse', label: 'Browse', icon: '🎵' },
      { id: 'library', label: 'Library', icon: '📚' },
      { id: 'search', label: 'Search', icon: '🔍' },
    ]

    return (
      <div style={{ height: '100vh', position: 'relative', background: '#F2F2F7' }}>
        <div style={{ padding: '20px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: 'bold', marginBottom: '20px' }}>
            Music App
          </h1>
          <p>Apple Music-style navigation</p>
        </div>
        <TabBar items={musicTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    )
  },
}
