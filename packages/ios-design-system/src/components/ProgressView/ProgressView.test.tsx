import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ProgressView } from './ProgressView'

describe('ProgressView', () => {
  it('renders progress view', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const progressView = container.querySelector('.ios-progress-view')
    expect(progressView).toBeInTheDocument()
  })

  it('renders track', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toBeInTheDocument()
  })

  it('renders fill', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const fill = container.querySelector('.ios-progress-view__fill')
    expect(fill).toBeInTheDocument()
  })

  it('sets fill width based on progress', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const fill = container.querySelector('.ios-progress-view__fill') as HTMLElement
    expect(fill?.style.width).toBe('50%')
  })

  it('clamps progress to minimum 0', () => {
    const { container } = render(<ProgressView progress={-0.5} />)
    const fill = container.querySelector('.ios-progress-view__fill') as HTMLElement
    expect(fill?.style.width).toBe('0%')
  })

  it('clamps progress to maximum 1', () => {
    const { container } = render(<ProgressView progress={1.5} />)
    const fill = container.querySelector('.ios-progress-view__fill') as HTMLElement
    expect(fill?.style.width).toBe('100%')
  })

  it('applies default variant by default', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const progressView = container.querySelector('.ios-progress-view')
    expect(progressView).toHaveClass('ios-progress-view--default')
  })

  it('applies bar variant', () => {
    const { container } = render(<ProgressView progress={0.5} variant="bar" />)
    const progressView = container.querySelector('.ios-progress-view')
    expect(progressView).toHaveClass('ios-progress-view--bar')
  })

  it('applies custom progress color', () => {
    const { container } = render(<ProgressView progress={0.5} progressColor="#34C759" />)
    const fill = container.querySelector('.ios-progress-view__fill') as HTMLElement
    expect(fill?.style.backgroundColor).toBe('rgb(52, 199, 89)')
  })

  it('applies custom track color', () => {
    const { container } = render(<ProgressView progress={0.5} trackColor="#F2F2F7" />)
    const track = container.querySelector('.ios-progress-view__track') as HTMLElement
    expect(track?.style.backgroundColor).toBe('rgb(242, 242, 247)')
  })

  it('does not show label by default', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const label = container.querySelector('.ios-progress-view__label')
    expect(label).not.toBeInTheDocument()
  })

  it('shows label when showLabel is true', () => {
    const { container } = render(<ProgressView progress={0.5} showLabel />)
    const label = container.querySelector('.ios-progress-view__label')
    expect(label).toBeInTheDocument()
  })

  it('displays correct percentage in label', () => {
    const { container } = render(<ProgressView progress={0.75} showLabel />)
    const label = container.querySelector('.ios-progress-view__label')
    expect(label?.textContent).toBe('75%')
  })

  it('rounds percentage to nearest integer', () => {
    const { container } = render(<ProgressView progress={0.667} showLabel />)
    const label = container.querySelector('.ios-progress-view__label')
    expect(label?.textContent).toBe('67%')
  })

  it('has progressbar role', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('role', 'progressbar')
  })

  it('sets aria-valuenow to percentage', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('aria-valuenow', '50')
  })

  it('sets aria-valuemin to 0', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('aria-valuemin', '0')
  })

  it('sets aria-valuemax to 100', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('aria-valuemax', '100')
  })

  it('has default accessibility label', () => {
    const { container } = render(<ProgressView progress={0.5} />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('aria-label', '50% complete')
  })

  it('applies custom accessibility label', () => {
    const { container } = render(<ProgressView progress={0.5} accessibilityLabel="Upload progress" />)
    const track = container.querySelector('.ios-progress-view__track')
    expect(track).toHaveAttribute('aria-label', 'Upload progress')
  })

  it('applies custom className', () => {
    const { container } = render(<ProgressView progress={0.5} className="custom-progress" />)
    const progressView = container.querySelector('.ios-progress-view')
    expect(progressView).toHaveClass('custom-progress')
  })
})
