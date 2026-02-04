import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ActivityIndicator } from './ActivityIndicator'

describe('ActivityIndicator', () => {
  it('renders activity indicator', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('applies small size', () => {
    const { container } = render(<ActivityIndicator size="small" />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('ios-activity-indicator--small')
  })

  it('applies medium size by default', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('ios-activity-indicator--medium')
  })

  it('applies large size', () => {
    const { container } = render(<ActivityIndicator size="large" />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('ios-activity-indicator--large')
  })

  it('applies animating class by default', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('ios-activity-indicator--animating')
  })

  it('applies animating class when animating is true', () => {
    const { container } = render(<ActivityIndicator animating={true} />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('ios-activity-indicator--animating')
  })

  it('does not apply animating class when animating is false', () => {
    const { container } = render(<ActivityIndicator animating={false} />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).not.toHaveClass('ios-activity-indicator--animating')
  })

  it('applies custom color', () => {
    const { container } = render(<ActivityIndicator color="#007AFF" />)
    const indicator = container.querySelector('.ios-activity-indicator') as HTMLElement
    expect(indicator?.style.borderTopColor).toBe('rgb(0, 122, 255)')
    expect(indicator?.style.borderRightColor).toBe('rgb(0, 122, 255)')
  })

  it('has status role', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('role', 'status')
  })

  it('has default accessibility label', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('aria-label', 'Loading')
  })

  it('applies custom accessibility label', () => {
    const { container } = render(<ActivityIndicator accessibilityLabel="Processing..." />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('aria-label', 'Processing...')
  })

  it('has aria-live polite', () => {
    const { container } = render(<ActivityIndicator />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('aria-live', 'polite')
  })

  it('sets aria-busy to true when animating', () => {
    const { container } = render(<ActivityIndicator animating={true} />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('aria-busy', 'true')
  })

  it('sets aria-busy to false when not animating', () => {
    const { container } = render(<ActivityIndicator animating={false} />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveAttribute('aria-busy', 'false')
  })

  it('applies custom className', () => {
    const { container } = render(<ActivityIndicator className="custom-indicator" />)
    const indicator = container.querySelector('.ios-activity-indicator')
    expect(indicator).toHaveClass('custom-indicator')
  })
})
