import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SegmentedControl, SegmentedControlOption } from './SegmentedControl'

const mockOptions: SegmentedControlOption[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
]

describe('SegmentedControl', () => {
  it('renders segmented control', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const control = container.querySelector('.ios-segmented-control')
    expect(control).toBeInTheDocument()
  })

  it('renders all segments', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const segments = container.querySelectorAll('.ios-segmented-control__segment')
    expect(segments.length).toBe(3)
  })

  it('renders segment labels', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const labels = Array.from(container.querySelectorAll('.ios-segmented-control__segment')).map(
      (el) => el.textContent
    )
    expect(labels).toEqual(['All', 'Active', 'Done'])
  })

  it('applies selected class to active segment', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="active" onChange={handleChange} />
    )
    const segments = container.querySelectorAll('.ios-segmented-control__segment')
    expect(segments[1]).toHaveClass('ios-segmented-control__segment--selected')
    expect(segments[0]).not.toHaveClass('ios-segmented-control__segment--selected')
  })

  it('calls onChange when segment is clicked', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const segments = container.querySelectorAll('.ios-segmented-control__segment')
    fireEvent.click(segments[1])
    expect(handleChange).toHaveBeenCalledWith('active')
  })

  it('renders indicator element', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const indicator = container.querySelector('.ios-segmented-control__indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('applies full width class', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} fullWidth />
    )
    const control = container.querySelector('.ios-segmented-control')
    expect(control).toHaveClass('ios-segmented-control--full-width')
  })

  it('renders segment icon when provided', () => {
    const optionsWithIcons: SegmentedControlOption[] = [
      { id: 'list', label: 'List', icon: '☰' },
      { id: 'grid', label: 'Grid', icon: '⊞' },
    ]
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={optionsWithIcons} selectedId="list" onChange={handleChange} />
    )
    const icons = container.querySelectorAll('.ios-segmented-control__icon')
    expect(icons.length).toBe(2)
    expect(icons[0].textContent).toBe('☰')
  })

  it('sets aria-selected on selected segment', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="active" onChange={handleChange} />
    )
    const segments = container.querySelectorAll('.ios-segmented-control__segment')
    expect(segments[1]).toHaveAttribute('aria-selected', 'true')
    expect(segments[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('sets role="tab" on segments', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const segments = container.querySelectorAll('.ios-segmented-control__segment')
    segments.forEach((segment) => {
      expect(segment).toHaveAttribute('role', 'tab')
    })
  })

  it('sets role="tablist" on container', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="all" onChange={handleChange} />
    )
    const control = container.querySelector('.ios-segmented-control')
    expect(control).toHaveAttribute('role', 'tablist')
  })

  it('applies custom className', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl
        options={mockOptions}
        selectedId="all"
        onChange={handleChange}
        className="custom-control"
      />
    )
    const control = container.querySelector('.ios-segmented-control')
    expect(control).toHaveClass('custom-control')
  })

  it('sets CSS custom properties for indicator position', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <SegmentedControl options={mockOptions} selectedId="active" onChange={handleChange} />
    )
    const control = container.querySelector('.ios-segmented-control') as HTMLElement
    expect(control.style.getPropertyValue('--segment-count')).toBe('3')
    expect(control.style.getPropertyValue('--selected-index')).toBe('1')
  })
})
