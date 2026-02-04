import type { Meta, StoryObj } from '@storybook/react'
import { SectionHeader } from './SectionHeader'
import { List } from '../List/List'
import { ListItem } from '../ListItem/ListItem'

const meta = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic section header
 */
export const Default: Story = {
  args: { title: 'Settings' },
  render: (args) => (
    <div style={{ background: '#F2F2F7', minHeight: '200px', paddingTop: '20px' }}>
      <SectionHeader {...args} />
      <List>
        <ListItem label="General" accessory="chevron" onPress={() => {}} />
        <ListItem label="Privacy" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * Section header with action button
 */
export const WithAction: Story = {
  args: {
    title: 'Favorites',
    action: { label: 'See All', onPress: () => console.log('See All') },
  },
  render: (args) => (
    <div style={{ background: '#F2F2F7', minHeight: '200px', paddingTop: '20px' }}>
      <SectionHeader {...args} />
      <List>
        <ListItem label="Photos" icon="📷" iconBackground="#34C759" accessory="chevron" onPress={() => {}} />
        <ListItem label="Music" icon="🎵" iconBackground="#FF3B30" accessory="chevron" onPress={() => {}} />
        <ListItem label="Videos" icon="🎬" iconBackground="#007AFF" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * Multiple sections
 */
export const MultipleSections: Story = {
  args: { title: 'Settings' },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
      <SectionHeader title="Account" />
      <List>
        <ListItem label="Profile" icon="👤" iconBackground="#007AFF" accessory="chevron" onPress={() => {}} />
        <ListItem label="Security" icon="🔒" iconBackground="#FF3B30" accessory="chevron" onPress={() => {}} />
      </List>

      <SectionHeader title="Preferences" />
      <List>
        <ListItem label="Notifications" icon="🔔" iconBackground="#FF9500" accessory="chevron" onPress={() => {}} />
        <ListItem label="Appearance" icon="🎨" iconBackground="#5856D6" accessory="chevron" onPress={() => {}} />
      </List>

      <SectionHeader
        title="More"
        action={{ label: 'Edit', onPress: () => console.log('Edit') }}
      />
      <List>
        <ListItem label="Help" accessory="chevron" onPress={() => {}} />
        <ListItem label="About" value="v1.0.0" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * iOS Photos app example
 */
export const PhotosApp: Story = {
  args: { title: 'Settings' },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
      <SectionHeader
        title="Recents"
        action={{ label: 'See All', onPress: () => {} }}
      />
      <List>
        <ListItem label="All Photos" value="1,234" accessory="chevron" onPress={() => {}} />
        <ListItem label="Favorites" value="56" accessory="chevron" onPress={() => {}} />
        <ListItem label="Recently Deleted" value="12" accessory="chevron" onPress={() => {}} />
      </List>

      <SectionHeader title="Albums" />
      <List>
        <ListItem label="People & Places" value="3 albums" accessory="chevron" onPress={() => {}} />
        <ListItem label="Media Types" value="5 albums" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}
