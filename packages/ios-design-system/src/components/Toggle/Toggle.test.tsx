import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('renders toggle switch', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} />)
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeInTheDocument()
  })

  it('renders checked when value is true', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={true} onChange={handleChange} />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('renders unchecked when value is false', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} />)
    const label = container.querySelector('label')!

    fireEvent.click(label)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} disabled />)
    const checkbox = container.querySelector('input[type="checkbox"]')!

    fireEvent.change(checkbox, { target: { checked: true } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies disabled attribute', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} disabled />)
    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDisabled()
  })

  it('applies custom tint color', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={true} onChange={handleChange} tintColor="#FF0000" />)
    const label = container.querySelector('label')!
    expect(label.style.getPropertyValue('--toggle-tint-color')).toBe('#FF0000')
  })

  it('applies on class when value is true', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={true} onChange={handleChange} />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('ios-toggle--on')
  })

  it('applies off class when value is false', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('ios-toggle--off')
  })

  it('applies disabled class when disabled', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} disabled />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('ios-toggle--disabled')
  })

  it('forwards ref to input element', () => {
    const ref = vi.fn()
    const handleChange = vi.fn()
    render(<Toggle ref={ref} value={false} onChange={handleChange} />)
    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const handleChange = vi.fn()
    const { container } = render(<Toggle value={false} onChange={handleChange} className="custom-toggle" />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('custom-toggle')
  })
})
