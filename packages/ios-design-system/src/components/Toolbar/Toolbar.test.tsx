import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Toolbar, ToolbarAction } from './Toolbar'

const mockActions: ToolbarAction[] = [
  { id: 'share', label: 'Share', icon: '↗️', onPress: vi.fn() },
  { id: 'favorite', label: 'Favorite', icon: '❤️', onPress: vi.fn() },
  { id: 'delete', label: 'Delete', icon: '🗑️', onPress: vi.fn() },
]

describe('Toolbar', () => {
  it('renders toolbar', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const buttons = container.querySelectorAll('.ios-toolbar__button')
    expect(buttons.length).toBe(3)
  })

  it('renders action labels', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const labels = Array.from(container.querySelectorAll('.ios-toolbar__label')).map(
      (el) => el.textContent
    )
    expect(labels).toEqual(['Share', 'Favorite', 'Delete'])
  })

  it('renders action icons', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const icons = container.querySelectorAll('.ios-toolbar__icon')
    expect(icons.length).toBe(3)
  })

  it('calls onPress when action is clicked', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const buttons = container.querySelectorAll('.ios-toolbar__button')
    fireEvent.click(buttons[0])
    expect(mockActions[0].onPress).toHaveBeenCalled()
  })

  it('applies bottom position by default', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).toHaveClass('ios-toolbar--bottom')
  })

  it('applies top position when specified', () => {
    const { container } = render(<Toolbar actions={mockActions} position="top" />)
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).toHaveClass('ios-toolbar--top')
  })

  it('applies translucent class by default', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).toHaveClass('ios-toolbar--translucent')
  })

  it('does not apply translucent class when translucent is false', () => {
    const { container } = render(<Toolbar actions={mockActions} translucent={false} />)
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).not.toHaveClass('ios-toolbar--translucent')
  })

  it('applies disabled class to disabled actions', () => {
    const actionsWithDisabled: ToolbarAction[] = [
      { id: 'undo', label: 'Undo', onPress: vi.fn(), disabled: true },
      { id: 'redo', label: 'Redo', onPress: vi.fn() },
    ]
    const { container } = render(<Toolbar actions={actionsWithDisabled} />)
    const buttons = container.querySelectorAll('.ios-toolbar__button')
    expect(buttons[0]).toHaveClass('ios-toolbar__button--disabled')
    expect(buttons[1]).not.toHaveClass('ios-toolbar__button--disabled')
  })

  it('disables button when action is disabled', () => {
    const actionsWithDisabled: ToolbarAction[] = [
      { id: 'undo', label: 'Undo', onPress: vi.fn(), disabled: true },
    ]
    const { container } = render(<Toolbar actions={actionsWithDisabled} />)
    const button = container.querySelector('.ios-toolbar__button')
    expect(button).toBeDisabled()
  })

  it('does not call onPress when disabled action is clicked', () => {
    const handlePress = vi.fn()
    const actionsWithDisabled: ToolbarAction[] = [
      { id: 'undo', label: 'Undo', onPress: handlePress, disabled: true },
    ]
    const { container } = render(<Toolbar actions={actionsWithDisabled} />)
    const button = container.querySelector('.ios-toolbar__button')!
    fireEvent.click(button)
    expect(handlePress).not.toHaveBeenCalled()
  })

  it('sets aria-label on each button', () => {
    const { container } = render(<Toolbar actions={mockActions} />)
    const buttons = container.querySelectorAll('.ios-toolbar__button')
    expect(buttons[0]).toHaveAttribute('aria-label', 'Share')
    expect(buttons[1]).toHaveAttribute('aria-label', 'Favorite')
    expect(buttons[2]).toHaveAttribute('aria-label', 'Delete')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Toolbar actions={mockActions} className="custom-toolbar" />
    )
    const toolbar = container.querySelector('.ios-toolbar')
    expect(toolbar).toHaveClass('custom-toolbar')
  })
})
