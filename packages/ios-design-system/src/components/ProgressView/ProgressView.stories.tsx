import type { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { ProgressView } from './ProgressView'

const meta = {
  title: 'Components/ProgressView',
  component: ProgressView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressView>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default progress view at 50%
 */
export const Default: Story = {
  args: {
    progress: 0.5,
  },
}

/**
 * Different progress values
 */
export const ProgressValues: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>0%</div>
        <ProgressView progress={0} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>25%</div>
        <ProgressView progress={0.25} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>50%</div>
        <ProgressView progress={0.5} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>75%</div>
        <ProgressView progress={0.75} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>100%</div>
        <ProgressView progress={1} />
      </div>
    </div>
  ),
}

/**
 * Variants (default thin, bar thick)
 */
export const Variants: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Default (4px)</div>
        <ProgressView progress={0.6} variant="default" />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Bar (8px)</div>
        <ProgressView progress={0.6} variant="bar" />
      </div>
    </div>
  ),
}

/**
 * With percentage label
 */
export const WithLabel: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ProgressView progress={0.25} showLabel />
      <ProgressView progress={0.5} showLabel />
      <ProgressView progress={0.75} showLabel />
      <ProgressView progress={1} showLabel />
    </div>
  ),
}

/**
 * Custom colors
 */
export const CustomColors: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Green (Success)</div>
        <ProgressView progress={0.6} progressColor="#34C759" variant="bar" />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Red (Error)</div>
        <ProgressView progress={0.3} progressColor="#FF3B30" variant="bar" />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Orange (Warning)</div>
        <ProgressView progress={0.5} progressColor="#FF9500" variant="bar" />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8E8E93', marginBottom: '8px' }}>Purple</div>
        <ProgressView progress={0.8} progressColor="#AF52DE" variant="bar" />
      </div>
    </div>
  ),
}

/**
 * Animated progress
 */
export const Animated: Story = {
  args: {},
  render: () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) return 0
          return prev + 0.01
        })
      }, 100)

      return () => clearInterval(interval)
    }, [])

    return (
      <div style={{ width: '300px' }}>
        <ProgressView progress={progress} variant="bar" showLabel />
      </div>
    )
  },
}

/**
 * File upload example
 */
export const FileUpload: Story = {
  args: {},
  render: () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval)
            return 1
          }
          return prev + 0.02
        })
      }, 100)

      return () => clearInterval(interval)
    }, [])

    return (
      <div style={{ width: '350px', padding: '20px', background: '#F2F2F7', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '32px' }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: 600 }}>document.pdf</div>
            <div style={{ fontSize: '13px', color: '#8E8E93' }}>2.5 MB</div>
          </div>
        </div>
        <ProgressView progress={progress} variant="bar" showLabel />
        <div style={{ marginTop: '8px', fontSize: '13px', color: '#8E8E93', textAlign: 'center' }}>
          {progress < 1 ? 'Uploading...' : 'Upload complete'}
        </div>
      </div>
    )
  },
}

/**
 * Download example
 */
export const Download: Story = {
  args: {},
  render: () => (
    <div style={{ width: '300px', padding: '16px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '24px' }}>⬇️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>Downloading...</div>
          <div style={{ fontSize: '13px', color: '#8E8E93' }}>movie.mp4 • 1.2 GB</div>
        </div>
      </div>
      <ProgressView progress={0.45} progressColor="#34C759" showLabel />
    </div>
  ),
}

/**
 * Installation progress
 */
export const Installation: Story = {
  args: {},
  render: () => {
    const steps = [
      { label: 'Downloading', progress: 1, color: '#34C759' },
      { label: 'Installing', progress: 0.6, color: '#007AFF' },
      { label: 'Configuring', progress: 0.2, color: '#8E8E93' },
    ]

    return (
      <div style={{ width: '350px', padding: '20px', background: '#F2F2F7', borderRadius: '12px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Installing App</div>
        {steps.map((step, i) => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: step.progress === 1 ? 600 : 400 }}>
                {step.label}
                {step.progress === 1 && ' ✓'}
              </span>
              <span style={{ fontSize: '13px', color: '#8E8E93' }}>
                {Math.round(step.progress * 100)}%
              </span>
            </div>
            <ProgressView progress={step.progress} progressColor={step.color} variant="bar" />
          </div>
        ))}
      </div>
    )
  },
}
