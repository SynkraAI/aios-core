import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { List } from './List'
import { ListItem } from '../ListItem/ListItem'

const meta = {
  title: 'Components/List',
  component: List,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic grouped list with navigation items
 */
export const Default: Story = {
  args: { children: null },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
      <List>
        <ListItem label="General" icon="⚙️" accessory="chevron" onPress={() => {}} />
        <ListItem label="Privacy" icon="🔒" accessory="chevron" onPress={() => {}} />
        <ListItem label="Notifications" icon="🔔" badge={3} accessory="chevron" onPress={() => {}} />
        <ListItem label="About" icon="ℹ️" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * Inset list style
 */
export const InsetStyle: Story = {
  args: { children: null },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
      <List style="inset">
        <ListItem label="Profile" icon="👤" iconBackground="#007AFF" accessory="chevron" onPress={() => {}} />
        <ListItem label="Appearance" icon="🎨" iconBackground="#5856D6" accessory="chevron" onPress={() => {}} />
        <ListItem label="Sounds" icon="🔊" iconBackground="#FF9500" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * List with toggle switches
 */
export const WithToggles: Story = {
  args: { children: null },
  render: () => {
    const [wifi, setWifi] = useState(true)
    const [bluetooth, setBluetooth] = useState(false)
    const [airplane, setAirplane] = useState(false)

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
        <List>
          <ListItem
            label="Wi-Fi"
            icon="📶"
            iconBackground="#007AFF"
            value="Home Network"
            toggle={{ value: wifi, onChange: setWifi }}
          />
          <ListItem
            label="Bluetooth"
            icon="🔵"
            iconBackground="#007AFF"
            toggle={{ value: bluetooth, onChange: setBluetooth }}
          />
          <ListItem
            label="Airplane Mode"
            icon="✈️"
            iconBackground="#FF9500"
            toggle={{ value: airplane, onChange: setAirplane }}
          />
        </List>
      </div>
    )
  },
}

/**
 * List with values (right-aligned text)
 */
export const WithValues: Story = {
  args: { children: null },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
      <List>
        <ListItem label="Name" value="John Doe" accessory="chevron" onPress={() => {}} />
        <ListItem label="Email" value="john@example.com" accessory="chevron" onPress={() => {}} />
        <ListItem label="Phone" value="+1 234 567 890" accessory="chevron" onPress={() => {}} />
        <ListItem label="Language" value="English" accessory="chevron" onPress={() => {}} />
      </List>
    </div>
  ),
}

/**
 * List with detail text
 */
export const WithDetails: Story = {
  args: { children: null },
  render: () => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
      <List>
        <ListItem
          label="iCloud"
          detail="john@icloud.com"
          icon="☁️"
          iconBackground="#007AFF"
          accessory="chevron"
          onPress={() => {}}
        />
        <ListItem
          label="Password & Security"
          detail="Two-Factor Authentication is on"
          icon="🔑"
          iconBackground="#FF3B30"
          accessory="chevron"
          onPress={() => {}}
        />
        <ListItem
          label="Payment & Shipping"
          detail="2 credit cards, 1 address"
          icon="💳"
          iconBackground="#34C759"
          accessory="chevron"
          onPress={() => {}}
        />
      </List>
    </div>
  ),
}

/**
 * iOS Settings example
 */
export const SettingsExample: Story = {
  args: { children: null },
  render: () => {
    const [notifications, setNotifications] = useState(true)
    const [location, setLocation] = useState(true)

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '20px 0' }}>
        <h3 style={{ fontSize: '13px', color: '#8E8E93', textTransform: 'uppercase', padding: '0 32px', marginBottom: '8px' }}>
          Settings
        </h3>
        <List>
          <ListItem
            label="Profile"
            icon="👤"
            iconBackground="#007AFF"
            detail="Update your photo and personal details"
            accessory="chevron"
            onPress={() => {}}
          />
          <ListItem
            label="Notifications"
            icon="🔔"
            iconBackground="#FF3B30"
            toggle={{ value: notifications, onChange: setNotifications }}
          />
          <ListItem
            label="Location Services"
            icon="📍"
            iconBackground="#5856D6"
            toggle={{ value: location, onChange: setLocation }}
          />
        </List>

        <h3 style={{ fontSize: '13px', color: '#8E8E93', textTransform: 'uppercase', padding: '0 32px', marginTop: '24px', marginBottom: '8px' }}>
          More
        </h3>
        <List>
          <ListItem label="Privacy Policy" accessory="chevron" onPress={() => {}} />
          <ListItem label="Terms of Service" accessory="chevron" onPress={() => {}} />
          <ListItem label="About" value="v1.0.0" accessory="chevron" onPress={() => {}} />
        </List>
      </div>
    )
  },
}
