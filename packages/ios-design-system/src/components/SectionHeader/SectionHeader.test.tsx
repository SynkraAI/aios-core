import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders section header', () => {
    const { container } = render(<SectionHeader title="Settings" />)
    const header = container.querySelector('.ios-section-header')
    expect(header).toBeInTheDocument()
  })

  it('renders title', () => {
    const { container } = render(<SectionHeader title="Settings" />)
    const title = container.querySelector('.ios-section-header__title')
    expect(title?.textContent).toBe('Settings')
  })

  it('renders action button when provided', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <SectionHeader title="Favorites" action={{ label: 'See All', onPress: handlePress }} />
    )
    const action = container.querySelector('.ios-section-header__action')
    expect(action).toBeInTheDocument()
    expect(action?.textContent).toBe('See All')
  })

  it('does not render action button when not provided', () => {
    const { container } = render(<SectionHeader title="Settings" />)
    const action = container.querySelector('.ios-section-header__action')
    expect(action).not.toBeInTheDocument()
  })

  it('calls action onPress when clicked', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <SectionHeader title="Favorites" action={{ label: 'See All', onPress: handlePress }} />
    )
    const action = container.querySelector('.ios-section-header__action')!
    fireEvent.click(action)
    expect(handlePress).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<SectionHeader title="Settings" className="custom-header" />)
    const header = container.querySelector('.ios-section-header')
    expect(header).toHaveClass('custom-header')
  })
})
