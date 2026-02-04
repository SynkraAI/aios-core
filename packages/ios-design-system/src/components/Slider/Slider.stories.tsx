import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Slider } from './Slider'

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default slider (0-100)
 */
export const Default: Story = {
  render: () => {
    const [volume, setVolume] = useState(50)
    return (
      <div style={{ width: '300px' }}>
        <Slider value={volume} onChange={setVolume} />
      </div>
    )
  },
  args: { value: 50, onChange: () => {} },
}

/**
 * Slider states
 */
export const States: Story = {
  render: () => {
    const [value1, setValue1] = useState(30)
    const [value2, setValue2] = useState(70)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '300px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Normal
          </div>
          <Slider value={value1} onChange={setValue1} />
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Disabled
          </div>
          <Slider value={value2} onChange={setValue2} disabled />
        </div>
      </div>
    )
  },
  args: { value: 50, onChange: () => {} },
}

/**
 * Custom ranges
 */
export const CustomRanges: Story = {
  render: () => {
    const [temp, setTemp] = useState(20)
    const [brightness, setBrightness] = useState(50)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '300px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Temperature (16-30°C)
          </div>
          <Slider value={temp} onChange={setTemp} min={16} max={30} step={0.5} />
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginTop: '8px' }}>
            {temp}°C
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Brightness (0-100%)
          </div>
          <Slider value={brightness} onChange={setBrightness} />
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginTop: '8px' }}>
            {brightness}%
          </div>
        </div>
      </div>
    )
  },
  args: { value: 50, onChange: () => {} },
}

/**
 * Custom tint colors
 */
export const CustomColors: Story = {
  render: () => {
    const [blue, setBlue] = useState(50)
    const [green, setGreen] = useState(50)
    const [red, setRed] = useState(50)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '300px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Blue (default)
          </div>
          <Slider value={blue} onChange={setBlue} />
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Green
          </div>
          <Slider value={green} onChange={setGreen} tintColor="#34C759" />
        </div>
        <div>
          <div style={{ fontSize: '13px', color: '#3C3C43', opacity: 0.6, marginBottom: '8px' }}>
            Red
          </div>
          <Slider value={red} onChange={setRed} tintColor="#FF3B30" />
        </div>
      </div>
    )
  },
  args: { value: 50, onChange: () => {} },
}

/**
 * iOS Settings example - Volume control
 */
export const VolumeControl: Story = {
  render: () => {
    const [volume, setVolume] = useState(65)

    return (
      <div
        style={{
          width: '300px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔈</span>
          <Slider value={volume} onChange={setVolume} />
          <span style={{ fontSize: '20px' }}>🔊</span>
        </div>
      </div>
    )
  },
  args: { value: 50, onChange: () => {} },
}
