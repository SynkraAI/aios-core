import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TabBar, TabBarItem } from './TabBar'

const mockTabs: TabBarItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

describe('TabBar', () => {
  it('renders all tab items', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} />
    )
    const buttons = container.querySelectorAll('.ios-tab-bar__item')
    expect(buttons.length).toBe(3)
  })

  it('renders tab labels', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} />
    )
    const labels = Array.from(container.querySelectorAll('.ios-tab-bar__label')).map(
      (el) => el.textContent
    )
    expect(labels).toEqual(['Home', 'Search', 'Profile'])
  })

  it('renders tab icons', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} />
    )
    const icons = container.querySelectorAll('.ios-tab-bar__icon')
    expect(icons.length).toBe(3)
  })

  it('applies active class to active tab', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="search" onChange={handleChange} />
    )
    const buttons = container.querySelectorAll('.ios-tab-bar__item')
    expect(buttons[1]).toHaveClass('ios-tab-bar__item--active')
    expect(buttons[0]).not.toHaveClass('ios-tab-bar__item--active')
  })

  it('calls onChange when tab is clicked', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} />
    )
    const buttons = container.querySelectorAll('.ios-tab-bar__item')
    fireEvent.click(buttons[1])
    expect(handleChange).toHaveBeenCalledWith('search')
  })

  it('renders badge when provided', () => {
    const tabsWithBadge: TabBarItem[] = [
      { id: 'home', label: 'Home', icon: '🏠', badge: 5 },
      { id: 'search', label: 'Search', icon: '🔍' },
    ]
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={tabsWithBadge} activeTab="home" onChange={handleChange} />
    )
    const badge = container.querySelector('.ios-tab-bar__badge')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('5')
  })

  it('shows 99+ for badges over 99', () => {
    const tabsWithLargeBadge: TabBarItem[] = [
      { id: 'home', label: 'Home', icon: '🏠', badge: 127 },
    ]
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={tabsWithLargeBadge} activeTab="home" onChange={handleChange} />
    )
    const badge = container.querySelector('.ios-tab-bar__badge')
    expect(badge?.textContent).toBe('99+')
  })

  it('does not render badge when count is 0', () => {
    const tabsWithZeroBadge: TabBarItem[] = [
      { id: 'home', label: 'Home', icon: '🏠', badge: 0 },
    ]
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={tabsWithZeroBadge} activeTab="home" onChange={handleChange} />
    )
    const badge = container.querySelector('.ios-tab-bar__badge')
    expect(badge).not.toBeInTheDocument()
  })

  it('applies custom tint color', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} tintColor="#FF0000" />
    )
    const nav = container.querySelector('.ios-tab-bar') as HTMLElement
    expect(nav.style.getPropertyValue('--tab-tint-color')).toBe('#FF0000')
  })

  it('applies custom className', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar
        items={mockTabs}
        activeTab="home"
        onChange={handleChange}
        className="custom-tab-bar"
      />
    )
    const nav = container.querySelector('.ios-tab-bar')
    expect(nav).toHaveClass('custom-tab-bar')
  })

  it('sets aria-current on active tab', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="search" onChange={handleChange} />
    )
    const buttons = container.querySelectorAll('.ios-tab-bar__item')
    expect(buttons[1]).toHaveAttribute('aria-current', 'page')
    expect(buttons[0]).not.toHaveAttribute('aria-current')
  })

  it('sets aria-label on each tab', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <TabBar items={mockTabs} activeTab="home" onChange={handleChange} />
    )
    const buttons = container.querySelectorAll('.ios-tab-bar__item')
    expect(buttons[0]).toHaveAttribute('aria-label', 'Home')
    expect(buttons[1]).toHaveAttribute('aria-label', 'Search')
    expect(buttons[2]).toHaveAttribute('aria-label', 'Profile')
  })

  it('warns when more than 5 tabs are provided', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manyTabs: TabBarItem[] = [
      { id: '1', label: 'Tab 1', icon: '1️⃣' },
      { id: '2', label: 'Tab 2', icon: '2️⃣' },
      { id: '3', label: 'Tab 3', icon: '3️⃣' },
      { id: '4', label: 'Tab 4', icon: '4️⃣' },
      { id: '5', label: 'Tab 5', icon: '5️⃣' },
      { id: '6', label: 'Tab 6', icon: '6️⃣' },
    ]
    const handleChange = vi.fn()
    render(<TabBar items={manyTabs} activeTab="1" onChange={handleChange} />)
    expect(consoleSpy).toHaveBeenCalledWith('TabBar: iOS guidelines recommend maximum 5 tabs')
    consoleSpy.mockRestore()
  })
})
