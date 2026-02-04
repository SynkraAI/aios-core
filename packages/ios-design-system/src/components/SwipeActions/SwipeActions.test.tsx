import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SwipeActions, SwipeAction } from './SwipeActions'

const mockTrailingActions: SwipeAction[] = [
  { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: vi.fn() },
]

const mockLeadingActions: SwipeAction[] = [
  { id: 'archive', label: 'Archive', backgroundColor: '#34C759', onPress: vi.fn() },
]

describe('SwipeActions', () => {
  it('renders swipe actions container', () => {
    const { container } = render(
      <SwipeActions>
        <div>Content</div>
      </SwipeActions>
    )
    const swipeActions = container.querySelector('.ios-swipe-actions')
    expect(swipeActions).toBeInTheDocument()
  })

  it('renders children', () => {
    const { container } = render(
      <SwipeActions>
        <div>Test Content</div>
      </SwipeActions>
    )
    expect(container.textContent).toContain('Test Content')
  })

  it('renders trailing actions', () => {
    const { container } = render(
      <SwipeActions trailingActions={mockTrailingActions}>
        <div>Content</div>
      </SwipeActions>
    )
    const trailing = container.querySelector('.ios-swipe-actions__trailing')
    expect(trailing).toBeInTheDocument()
  })

  it('renders leading actions', () => {
    const { container } = render(
      <SwipeActions leadingActions={mockLeadingActions}>
        <div>Content</div>
      </SwipeActions>
    )
    const leading = container.querySelector('.ios-swipe-actions__leading')
    expect(leading).toBeInTheDocument()
  })

  it('renders action labels', () => {
    const { container } = render(
      <SwipeActions trailingActions={mockTrailingActions}>
        <div>Content</div>
      </SwipeActions>
    )
    expect(container.textContent).toContain('Delete')
  })

  it('renders action icons', () => {
    const actionsWithIcon: SwipeAction[] = [
      { id: 'delete', label: 'Delete', icon: '🗑️', backgroundColor: '#FF3B30', onPress: vi.fn() },
    ]
    const { container } = render(
      <SwipeActions trailingActions={actionsWithIcon}>
        <div>Content</div>
      </SwipeActions>
    )
    const icon = container.querySelector('.ios-swipe-actions__icon')
    expect(icon).toBeInTheDocument()
    expect(icon?.textContent).toBe('🗑️')
  })

  it('calls action onPress when clicked', () => {
    const handlePress = vi.fn()
    const actions: SwipeAction[] = [
      { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: handlePress },
    ]
    const { container } = render(
      <SwipeActions trailingActions={actions}>
        <div>Content</div>
      </SwipeActions>
    )
    const actionButton = container.querySelector('.ios-swipe-actions__action')!
    fireEvent.click(actionButton)
    expect(handlePress).toHaveBeenCalled()
  })

  it('applies action background color', () => {
    const { container } = render(
      <SwipeActions trailingActions={mockTrailingActions}>
        <div>Content</div>
      </SwipeActions>
    )
    const actionButton = container.querySelector('.ios-swipe-actions__action') as HTMLElement
    expect(actionButton.style.backgroundColor).toBe('rgb(255, 59, 48)')
  })

  it('renders both leading and trailing actions', () => {
    const { container } = render(
      <SwipeActions leadingActions={mockLeadingActions} trailingActions={mockTrailingActions}>
        <div>Content</div>
      </SwipeActions>
    )
    const leading = container.querySelector('.ios-swipe-actions__leading')
    const trailing = container.querySelector('.ios-swipe-actions__trailing')
    expect(leading).toBeInTheDocument()
    expect(trailing).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SwipeActions className="custom-swipe">
        <div>Content</div>
      </SwipeActions>
    )
    const swipeActions = container.querySelector('.ios-swipe-actions')
    expect(swipeActions).toHaveClass('custom-swipe')
  })
})
