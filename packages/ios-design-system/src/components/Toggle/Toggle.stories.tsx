import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Toggle } from './Toggle'

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default toggle (green when on)
 */
export const Default: Story = {
  args: { value: false, onChange: () => {} },
  render: () => {
    const [enabled, setEnabled] = useState(true)
    return <Toggle value={enabled} onChange={setEnabled} />
  },
}

/**
 * Toggle states
 */
export const States: Story = {
  args: { value: false, onChange: () => {} },
  render: () => {
    const [on, setOn] = useState(true)
    const [off, setOff] = useState(false)
    const [disabled, setDisabled] = useState(true)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={on} onChange={setOn} />
          <span>On</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={off} onChange={setOff} />
          <span>Off</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={disabled} onChange={setDisabled} disabled />
          <span>Disabled</span>
        </div>
      </div>
    )
  },
}

/**
 * Custom tint colors
 */
export const CustomColors: Story = {
  args: { value: false, onChange: () => {} },
  render: () => {
    const [green, setGreen] = useState(true)
    const [blue, setBlue] = useState(true)
    const [red, setRed] = useState(true)
    const [orange, setOrange] = useState(true)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={green} onChange={setGreen} tintColor="#34C759" />
          <span>Green (default)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={blue} onChange={setBlue} tintColor="#007AFF" />
          <span>Blue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={red} onChange={setRed} tintColor="#FF3B30" />
          <span>Red</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Toggle value={orange} onChange={setOrange} tintColor="#FF9500" />
          <span>Orange</span>
        </div>
      </div>
    )
  },
}

/**
 * iOS Settings example
 */
export const SettingsExample: Story = {
  args: { value: false, onChange: () => {} },
  render: () => {
    const [wifi, setWifi] = useState(true)
    const [bluetooth, setBluetooth] = useState(true)
    const [airplane, setAirplane] = useState(false)

    return (
      <div
        style={{
          width: '300px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)',
          }}
        >
          <span style={{ fontSize: '17px' }}>Wi-Fi</span>
          <Toggle value={wifi} onChange={setWifi} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            borderBottom: '0.5px solid rgba(60, 60, 67, 0.29)',
          }}
        >
          <span style={{ fontSize: '17px' }}>Bluetooth</span>
          <Toggle value={bluetooth} onChange={setBluetooth} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
          }}
        >
          <span style={{ fontSize: '17px' }}>Airplane Mode</span>
          <Toggle value={airplane} onChange={setAirplane} tintColor="#FF9500" />
        </div>
      </div>
    )
  },
}
