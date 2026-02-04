import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders slider input', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toBeInTheDocument()
  })

  it('renders with correct value', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={75} onChange={handleChange} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.value).toBe('75')
  })

  it('renders with default min/max/step', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} />)
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.min).toBe('0')
    expect(input.max).toBe('100')
    expect(input.step).toBe('1')
  })

  it('renders with custom min/max/step', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <Slider value={20} onChange={handleChange} min={10} max={30} step={0.5} />
    )
    const input = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(input.min).toBe('10')
    expect(input.max).toBe('30')
    expect(input.step).toBe('0.5')
  })

  it('calls onChange when slider moves', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} />)
    const input = container.querySelector('input[type="range"]')!

    fireEvent.change(input, { target: { value: '75' } })
    expect(handleChange).toHaveBeenCalledWith(75)
  })

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} disabled />)
    const input = container.querySelector('input[type="range"]')!

    fireEvent.change(input, { target: { value: '75' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies disabled attribute', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} disabled />)
    const input = container.querySelector('input[type="range"]')
    expect(input).toBeDisabled()
  })

  it('applies disabled class', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} disabled />)
    const wrapper = container.querySelector('.ios-slider')
    expect(wrapper).toHaveClass('ios-slider--disabled')
  })

  it('applies custom tint color', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={50} onChange={handleChange} tintColor="#FF0000" />)
    const wrapper = container.querySelector('.ios-slider') as HTMLDivElement
    expect(wrapper.style.getPropertyValue('--slider-tint-color')).toBe('#FF0000')
  })

  it('calculates percentage correctly', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={75} onChange={handleChange} min={0} max={100} />)
    const wrapper = container.querySelector('.ios-slider') as HTMLDivElement
    expect(wrapper.style.getPropertyValue('--slider-percentage')).toBe('75%')
  })

  it('calculates percentage with custom range', () => {
    const handleChange = vi.fn()
    const { container } = render(<Slider value={15} onChange={handleChange} min={10} max={20} />)
    const wrapper = container.querySelector('.ios-slider') as HTMLDivElement
    expect(wrapper.style.getPropertyValue('--slider-percentage')).toBe('50%')
  })

  it('forwards ref to input element', () => {
    const ref = vi.fn()
    const handleChange = vi.fn()
    render(<Slider ref={ref} value={50} onChange={handleChange} />)
    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <Slider value={50} onChange={handleChange} className="custom-slider" />
    )
    const wrapper = container.querySelector('.ios-slider')
    expect(wrapper).toHaveClass('custom-slider')
  })
})
