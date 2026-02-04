import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SegmentedControl, SegmentedControlOption } from './SegmentedControl'

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const threeOptions: SegmentedControlOption[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
]

/**
 * Default segmented control (3 segments)
 */
export const Default: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('all')
    return (
      <div style={{ padding: '20px' }}>
        <SegmentedControl options={threeOptions} selectedId={selected} onChange={setSelected} />
      </div>
    )
  },
}

/**
 * Two segments
 */
export const TwoSegments: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('list')
    const twoOptions: SegmentedControlOption[] = [
      { id: 'list', label: 'List' },
      { id: 'grid', label: 'Grid' },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <SegmentedControl options={twoOptions} selectedId={selected} onChange={setSelected} />
      </div>
    )
  },
}

/**
 * With icons
 */
export const WithIcons: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('list')
    const iconOptions: SegmentedControlOption[] = [
      { id: 'list', label: 'List', icon: '☰' },
      { id: 'grid', label: 'Grid', icon: '⊞' },
      { id: 'columns', label: 'Columns', icon: '⫿' },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <SegmentedControl options={iconOptions} selectedId={selected} onChange={setSelected} />
      </div>
    )
  },
}

/**
 * Full width
 */
export const FullWidth: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('all')
    return (
      <div style={{ padding: '20px', width: '300px' }}>
        <SegmentedControl
          options={threeOptions}
          selectedId={selected}
          onChange={setSelected}
          fullWidth
        />
      </div>
    )
  },
}

/**
 * Five segments
 */
export const FiveSegments: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('day')
    const fiveOptions: SegmentedControlOption[] = [
      { id: 'day', label: 'Day' },
      { id: 'week', label: 'Week' },
      { id: 'month', label: 'Month' },
      { id: 'year', label: 'Year' },
      { id: 'all', label: 'All' },
    ]

    return (
      <div style={{ padding: '20px', width: '400px' }}>
        <SegmentedControl
          options={fiveOptions}
          selectedId={selected}
          onChange={setSelected}
          fullWidth
        />
      </div>
    )
  },
}

/**
 * Maps app example
 */
export const MapsApp: Story = {
  args: { options: threeOptions, selectedId: 'all', onChange: () => {} },
  render: () => {
    const [selected, setSelected] = useState('explore')
    const mapOptions: SegmentedControlOption[] = [
      { id: 'explore', label: 'Explore' },
      { id: 'driving', label: 'Driving' },
      { id: 'transit', label: 'Transit' },
    ]

    return (
      <div
        style={{
          width: '375px',
          height: '600px',
          background: '#F2F2F7',
          padding: '16px',
          borderRadius: '12px',
        }}
      >
        <SegmentedControl
          options={mapOptions}
          selectedId={selected}
          onChange={setSelected}
          fullWidth
        />
        <div
          style={{
            marginTop: '16px',
            height: '500px',
            background: '#E5E5EA',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8E8E93',
          }}
        >
          🗺️ Map View: {selected}
        </div>
      </div>
    )
  },
}
