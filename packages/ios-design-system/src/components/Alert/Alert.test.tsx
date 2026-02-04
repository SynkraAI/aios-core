import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  const mockButtons = [
    { id: '1', label: 'Cancel', style: 'cancel' as const, onPress: vi.fn() },
    { id: '2', label: 'OK', onPress: vi.fn() },
  ]

  it('renders alert when visible', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const alert = container.querySelector('.ios-alert')
    expect(alert).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    const { container } = render(
      <Alert visible={false} title="Alert Title" buttons={mockButtons} />
    )
    const alert = container.querySelector('.ios-alert')
    expect(alert).not.toBeInTheDocument()
  })

  it('renders title', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const title = container.querySelector('.ios-alert__title')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toBe('Alert Title')
  })

  it('renders message when provided', () => {
    const { container } = render(
      <Alert
        visible={true}
        title="Alert Title"
        message="This is the alert message"
        buttons={mockButtons}
      />
    )
    const message = container.querySelector('.ios-alert__message')
    expect(message).toBeInTheDocument()
    expect(message?.textContent).toBe('This is the alert message')
  })

  it('does not render message when not provided', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const message = container.querySelector('.ios-alert__message')
    expect(message).not.toBeInTheDocument()
  })

  it('renders all buttons', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const buttons = container.querySelectorAll('.ios-alert__button')
    expect(buttons).toHaveLength(2)
  })

  it('renders button labels', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const buttons = container.querySelectorAll('.ios-alert__button')
    expect(buttons[0].textContent).toBe('Cancel')
    expect(buttons[1].textContent).toBe('OK')
  })

  it('calls button onPress when clicked', () => {
    const handlePress = vi.fn()
    const buttons = [{ id: '1', label: 'OK', onPress: handlePress }]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const button = container.querySelector('.ios-alert__button') as HTMLElement
    fireEvent.click(button)
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss after button press', () => {
    const handleDismiss = vi.fn()
    const { container } = render(
      <Alert
        visible={true}
        title="Alert Title"
        buttons={mockButtons}
        onDismiss={handleDismiss}
      />
    )
    const button = container.querySelector('.ios-alert__button') as HTMLElement
    fireEvent.click(button)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('applies default style to button', () => {
    const buttons = [{ id: '1', label: 'OK', style: 'default' as const, onPress: vi.fn() }]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const button = container.querySelector('.ios-alert__button')
    expect(button).toHaveClass('ios-alert__button--default')
  })

  it('applies cancel style to button', () => {
    const buttons = [{ id: '1', label: 'Cancel', style: 'cancel' as const, onPress: vi.fn() }]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const button = container.querySelector('.ios-alert__button')
    expect(button).toHaveClass('ios-alert__button--cancel')
  })

  it('applies destructive style to button', () => {
    const buttons = [{ id: '1', label: 'Delete', style: 'destructive' as const, onPress: vi.fn() }]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const button = container.querySelector('.ios-alert__button')
    expect(button).toHaveClass('ios-alert__button--destructive')
  })

  it('uses horizontal layout for 2 buttons', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const buttons = container.querySelector('.ios-alert__buttons')
    expect(buttons).toHaveClass('ios-alert__buttons--horizontal')
  })

  it('uses vertical layout for 1 button', () => {
    const buttons = [{ id: '1', label: 'OK', onPress: vi.fn() }]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const buttonsContainer = container.querySelector('.ios-alert__buttons')
    expect(buttonsContainer).toHaveClass('ios-alert__buttons--vertical')
  })

  it('uses vertical layout for 3 buttons', () => {
    const buttons = [
      { id: '1', label: 'Option 1', onPress: vi.fn() },
      { id: '2', label: 'Option 2', onPress: vi.fn() },
      { id: '3', label: 'Cancel', onPress: vi.fn() },
    ]
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={buttons} />
    )
    const buttonsContainer = container.querySelector('.ios-alert__buttons')
    expect(buttonsContainer).toHaveClass('ios-alert__buttons--vertical')
  })

  it('has alertdialog role', () => {
    const { container } = render(
      <Alert visible={true} title="Alert Title" buttons={mockButtons} />
    )
    const alert = container.querySelector('.ios-alert')
    expect(alert).toHaveAttribute('role', 'alertdialog')
    expect(alert).toHaveAttribute('aria-modal', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Alert
        visible={true}
        title="Alert Title"
        buttons={mockButtons}
        className="custom-alert"
      />
    )
    const backdrop = container.querySelector('.ios-alert-backdrop')
    expect(backdrop).toHaveClass('custom-alert')
  })
})
