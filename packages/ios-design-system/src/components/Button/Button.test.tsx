import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onPress when clicked', () => {
    const handlePress = vi.fn()
    render(<Button onPress={handlePress}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handlePress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const handlePress = vi.fn()
    render(<Button disabled onPress={handlePress}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handlePress).not.toHaveBeenCalled()
  })

  it('does not call onPress when loading', () => {
    const handlePress = vi.fn()
    render(<Button loading onPress={handlePress}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handlePress).not.toHaveBeenCalled()
  })

  it('renders with filled variant by default', () => {
    const { container } = render(<Button>Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--filled')
  })

  it('renders with specified variant', () => {
    const { container } = render(<Button variant="tinted">Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--tinted')
  })

  it('renders with standard size by default', () => {
    const { container } = render(<Button>Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--standard')
  })

  it('renders with specified size', () => {
    const { container } = render(<Button size="large">Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--large')
  })

  it('renders full width when specified', () => {
    const { container } = render(<Button fullWidth>Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--full-width')
  })

  it('renders disabled class when disabled', () => {
    const { container } = render(<Button disabled>Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('ios-button--disabled')
    expect(button).toBeDisabled()
  })

  it('renders loading spinner when loading', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">←</span>}>Click me</Button>)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Click me</Button>)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('hides icons when loading', () => {
    render(
      <Button
        loading
        leftIcon={<span data-testid="left-icon">←</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Click me
      </Button>
    )
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
  })

  it('forwards ref to button element', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Click me</Button>)
    expect(ref).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Click me</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })

  it('supports HTML button attributes', () => {
    const { container } = render(
      <Button name="submit-btn" value="submit">
        Submit
      </Button>
    )
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('name', 'submit-btn')
    expect(button).toHaveAttribute('value', 'submit')
  })
})
