import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { NavigationBar } from './NavigationBar'

describe('NavigationBar', () => {
  it('renders navigation bar', () => {
    const { container } = render(<NavigationBar title="Settings" />)
    const nav = container.querySelector('.ios-navigation-bar')
    expect(nav).toBeInTheDocument()
  })

  it('renders title', () => {
    const { container } = render(<NavigationBar title="Settings" />)
    const title = container.querySelector('.ios-navigation-bar__title')
    expect(title?.textContent).toBe('Settings')
  })

  it('renders left button when provided', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <NavigationBar
        title="Settings"
        leftButton={{ label: 'Back', onPress: handlePress }}
      />
    )
    const button = container.querySelector('.ios-navigation-bar__button--left')
    expect(button).toBeInTheDocument()
    expect(button?.textContent).toContain('Back')
  })

  it('renders right button when provided', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <NavigationBar
        title="Settings"
        rightButton={{ label: 'Done', onPress: handlePress }}
      />
    )
    const button = container.querySelector('.ios-navigation-bar__button--right')
    expect(button).toBeInTheDocument()
    expect(button?.textContent).toContain('Done')
  })

  it('calls onPress when left button is clicked', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <NavigationBar
        title="Settings"
        leftButton={{ label: 'Back', onPress: handlePress }}
      />
    )
    const button = container.querySelector('.ios-navigation-bar__button--left')!
    fireEvent.click(button)
    expect(handlePress).toHaveBeenCalled()
  })

  it('calls onPress when right button is clicked', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <NavigationBar
        title="Settings"
        rightButton={{ label: 'Done', onPress: handlePress }}
      />
    )
    const button = container.querySelector('.ios-navigation-bar__button--right')!
    fireEvent.click(button)
    expect(handlePress).toHaveBeenCalled()
  })

  it('renders large title when largeTitle is true', () => {
    const { container } = render(<NavigationBar title="Messages" largeTitle />)
    const largeTitle = container.querySelector('.ios-navigation-bar__large-title h1')
    expect(largeTitle).toBeInTheDocument()
    expect(largeTitle?.textContent).toBe('Messages')
  })

  it('does not render standard title when largeTitle is true', () => {
    const { container } = render(<NavigationBar title="Messages" largeTitle />)
    const standardTitle = container.querySelector('.ios-navigation-bar__title')
    expect(standardTitle).not.toBeInTheDocument()
  })

  it('applies large title class', () => {
    const { container } = render(<NavigationBar title="Messages" largeTitle />)
    const nav = container.querySelector('.ios-navigation-bar')
    expect(nav).toHaveClass('ios-navigation-bar--large')
  })

  it('applies translucent class by default', () => {
    const { container } = render(<NavigationBar title="Settings" />)
    const nav = container.querySelector('.ios-navigation-bar')
    expect(nav).toHaveClass('ios-navigation-bar--translucent')
  })

  it('does not apply translucent class when translucent is false', () => {
    const { container } = render(<NavigationBar title="Settings" translucent={false} />)
    const nav = container.querySelector('.ios-navigation-bar')
    expect(nav).not.toHaveClass('ios-navigation-bar--translucent')
  })

  it('renders button icon when provided', () => {
    const handlePress = vi.fn()
    const { container } = render(
      <NavigationBar
        title="Settings"
        leftButton={{ label: 'Menu', icon: '☰', onPress: handlePress }}
      />
    )
    const icon = container.querySelector('.ios-navigation-bar__button-icon')
    expect(icon).toBeInTheDocument()
    expect(icon?.textContent).toBe('☰')
  })

  it('applies custom className', () => {
    const { container } = render(
      <NavigationBar title="Settings" className="custom-nav" />
    )
    const nav = container.querySelector('.ios-navigation-bar')
    expect(nav).toHaveClass('custom-nav')
  })
})
