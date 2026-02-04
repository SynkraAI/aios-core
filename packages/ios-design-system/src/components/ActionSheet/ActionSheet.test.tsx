import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ActionSheet } from './ActionSheet'

describe('ActionSheet', () => {
  const mockActions = [
    { id: '1', label: 'Edit', onPress: vi.fn() },
    { id: '2', label: 'Share', onPress: vi.fn() },
  ]

  it('renders action sheet when visible', () => {
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={vi.fn()} />
    )
    const actionSheet = container.querySelector('.ios-action-sheet')
    expect(actionSheet).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    const { container } = render(
      <ActionSheet visible={false} actions={mockActions} onDismiss={vi.fn()} />
    )
    const actionSheet = container.querySelector('.ios-action-sheet')
    expect(actionSheet).not.toBeInTheDocument()
  })

  it('renders title when provided', () => {
    const { container } = render(
      <ActionSheet
        visible={true}
        title="Choose an option"
        actions={mockActions}
        onDismiss={vi.fn()}
      />
    )
    const title = container.querySelector('.ios-action-sheet__title')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toBe('Choose an option')
  })

  it('renders message when provided', () => {
    const { container } = render(
      <ActionSheet
        visible={true}
        message="Select one of the options below"
        actions={mockActions}
        onDismiss={vi.fn()}
      />
    )
    const message = container.querySelector('.ios-action-sheet__message')
    expect(message).toBeInTheDocument()
    expect(message?.textContent).toBe('Select one of the options below')
  })

  it('renders all actions', () => {
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={vi.fn()} />
    )
    const actions = container.querySelectorAll('.ios-action-sheet__action')
    expect(actions).toHaveLength(2)
  })

  it('renders action labels', () => {
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={vi.fn()} />
    )
    const labels = container.querySelectorAll('.ios-action-sheet__action-label')
    expect(labels[0].textContent).toBe('Edit')
    expect(labels[1].textContent).toBe('Share')
  })

  it('calls action onPress when clicked', () => {
    const handlePress = vi.fn()
    const actions = [{ id: '1', label: 'Edit', onPress: handlePress }]
    const { container } = render(
      <ActionSheet visible={true} actions={actions} onDismiss={vi.fn()} />
    )
    const action = container.querySelector('.ios-action-sheet__action') as HTMLElement
    fireEvent.click(action)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss after action press', () => {
    const handleDismiss = vi.fn()
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={handleDismiss} />
    )
    const action = container.querySelector('.ios-action-sheet__action') as HTMLElement
    fireEvent.click(action)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('applies destructive class to destructive action', () => {
    const actions = [{ id: '1', label: 'Delete', destructive: true, onPress: vi.fn() }]
    const { container } = render(
      <ActionSheet visible={true} actions={actions} onDismiss={vi.fn()} />
    )
    const action = container.querySelector('.ios-action-sheet__action')
    expect(action).toHaveClass('ios-action-sheet__action--destructive')
  })

  it('applies disabled class to disabled action', () => {
    const actions = [{ id: '1', label: 'Edit', disabled: true, onPress: vi.fn() }]
    const { container } = render(
      <ActionSheet visible={true} actions={actions} onDismiss={vi.fn()} />
    )
    const action = container.querySelector('.ios-action-sheet__action')
    expect(action).toHaveClass('ios-action-sheet__action--disabled')
  })

  it('does not call action onPress when disabled', () => {
    const handlePress = vi.fn()
    const actions = [{ id: '1', label: 'Edit', disabled: true, onPress: handlePress }]
    const { container } = render(
      <ActionSheet visible={true} actions={actions} onDismiss={vi.fn()} />
    )
    const action = container.querySelector('.ios-action-sheet__action') as HTMLElement
    fireEvent.click(action)
    expect(handlePress).not.toHaveBeenCalled()
  })

  it('renders action icon when provided', () => {
    const actions = [{ id: '1', label: 'Edit', icon: '✏️', onPress: vi.fn() }]
    const { container } = render(
      <ActionSheet visible={true} actions={actions} onDismiss={vi.fn()} />
    )
    const icon = container.querySelector('.ios-action-sheet__action-icon')
    expect(icon).toBeInTheDocument()
    expect(icon?.textContent).toBe('✏️')
  })

  it('renders cancel button with default label', () => {
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={vi.fn()} />
    )
    const cancel = container.querySelector('.ios-action-sheet__cancel')
    expect(cancel).toBeInTheDocument()
    expect(cancel?.textContent).toBe('Cancel')
  })

  it('renders cancel button with custom label', () => {
    const { container } = render(
      <ActionSheet
        visible={true}
        actions={mockActions}
        cancelLabel="Close"
        onDismiss={vi.fn()}
      />
    )
    const cancel = container.querySelector('.ios-action-sheet__cancel')
    expect(cancel?.textContent).toBe('Close')
  })

  it('calls onDismiss when cancel button is clicked', () => {
    const handleDismiss = vi.fn()
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={handleDismiss} />
    )
    const cancel = container.querySelector('.ios-action-sheet__cancel') as HTMLElement
    fireEvent.click(cancel)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when backdrop is clicked', () => {
    const handleDismiss = vi.fn()
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={handleDismiss} />
    )
    const backdrop = container.querySelector('.ios-action-sheet-backdrop') as HTMLElement
    fireEvent.click(backdrop)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not call onDismiss when action sheet content is clicked', () => {
    const handleDismiss = vi.fn()
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={handleDismiss} />
    )
    const actionSheet = container.querySelector('.ios-action-sheet') as HTMLElement
    fireEvent.click(actionSheet)
    expect(handleDismiss).not.toHaveBeenCalled()
  })

  it('has dialog role', () => {
    const { container } = render(
      <ActionSheet visible={true} actions={mockActions} onDismiss={vi.fn()} />
    )
    const actionSheet = container.querySelector('.ios-action-sheet')
    expect(actionSheet).toHaveAttribute('role', 'dialog')
    expect(actionSheet).toHaveAttribute('aria-modal', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ActionSheet
        visible={true}
        actions={mockActions}
        onDismiss={vi.fn()}
        className="custom-sheet"
      />
    )
    const backdrop = container.querySelector('.ios-action-sheet-backdrop')
    expect(backdrop).toHaveClass('custom-sheet')
  })
})
