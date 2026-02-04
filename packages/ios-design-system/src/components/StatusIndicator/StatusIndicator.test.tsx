import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatusIndicator } from './StatusIndicator'

describe('StatusIndicator', () => {
  it('renders status indicator', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('renders online status', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--online')
  })

  it('renders offline status', () => {
    const { container } = render(<StatusIndicator status="offline" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--offline')
  })

  it('renders away status', () => {
    const { container } = render(<StatusIndicator status="away" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--away')
  })

  it('renders busy status', () => {
    const { container } = render(<StatusIndicator status="busy" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--busy')
  })

  it('renders dnd status', () => {
    const { container } = render(<StatusIndicator status="dnd" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--dnd')
  })

  it('applies small size', () => {
    const { container } = render(<StatusIndicator status="online" size="small" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--small')
  })

  it('applies medium size by default', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--medium')
  })

  it('applies large size', () => {
    const { container } = render(<StatusIndicator status="online" size="large" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--large')
  })

  it('applies pulse animation when enabled', () => {
    const { container } = render(<StatusIndicator status="online" pulse />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--pulse')
  })

  it('does not apply pulse animation by default', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).not.toHaveClass('ios-status-indicator--pulse')
  })

  it('renders label when provided', () => {
    const { container } = render(<StatusIndicator status="online" label="Available" />)
    const label = container.querySelector('.ios-status-indicator__label')
    expect(label).toBeInTheDocument()
    expect(label?.textContent).toBe('Available')
  })

  it('does not render label when not provided', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const label = container.querySelector('.ios-status-indicator__label')
    expect(label).not.toBeInTheDocument()
  })

  it('applies with-label class when label is provided', () => {
    const { container } = render(<StatusIndicator status="online" label="Available" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('ios-status-indicator--with-label')
  })

  it('renders dot element', () => {
    const { container } = render(<StatusIndicator status="online" />)
    const dot = container.querySelector('.ios-status-indicator__dot')
    expect(dot).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StatusIndicator status="online" className="custom-status" />)
    const indicator = container.querySelector('.ios-status-indicator')
    expect(indicator).toHaveClass('custom-status')
  })
})
