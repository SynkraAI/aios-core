import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextField } from './TextField'

describe('TextField', () => {
  it('renders input with placeholder', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="" onChange={handleChange} />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    const handleChange = vi.fn()
    render(<TextField label="Email" placeholder="email" value="" onChange={handleChange} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="" onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'hello' } })

    expect(handleChange).toHaveBeenCalledWith('hello')
  })

  it('displays current value', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="test value" onChange={handleChange} />)

    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('shows clear button when has value', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="test" onChange={handleChange} />)

    expect(screen.getByLabelText('Clear text')).toBeInTheDocument()
  })

  it('hides clear button when empty', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="" onChange={handleChange} />)

    expect(screen.queryByLabelText('Clear text')).not.toBeInTheDocument()
  })

  it('clears value when clear button clicked', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="test" onChange={handleChange} />)

    const clearButton = screen.getByLabelText('Clear text')
    fireEvent.click(clearButton)

    expect(handleChange).toHaveBeenCalledWith('')
  })

  it('does not show clear button when clearButton=false', () => {
    const handleChange = vi.fn()
    render(
      <TextField placeholder="Enter text" value="test" onChange={handleChange} clearButton={false} />
    )

    expect(screen.queryByLabelText('Clear text')).not.toBeInTheDocument()
  })

  it('renders leading icon', () => {
    const handleChange = vi.fn()
    render(
      <TextField
        placeholder="Search"
        value=""
        onChange={handleChange}
        leadingIcon={<span data-testid="search-icon">🔍</span>}
      />
    )

    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('shows error message when error prop provided', () => {
    const handleChange = vi.fn()
    render(
      <TextField
        placeholder="Email"
        value="invalid"
        onChange={handleChange}
        error="Invalid email"
      />
    )

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('applies disabled attribute', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="" onChange={handleChange} disabled />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeDisabled()
  })

  it('hides clear button when disabled', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="test" onChange={handleChange} disabled />)

    expect(screen.queryByLabelText('Clear text')).not.toBeInTheDocument()
  })

  it('applies maxLength attribute', () => {
    const handleChange = vi.fn()
    render(<TextField placeholder="Enter text" value="" onChange={handleChange} maxLength={10} />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('forwards ref to input element', () => {
    const ref = vi.fn()
    const handleChange = vi.fn()
    render(<TextField ref={ref} placeholder="Enter text" value="" onChange={handleChange} />)

    expect(ref).toHaveBeenCalled()
  })

  it('supports different input types', () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <TextField placeholder="Email" value="" onChange={handleChange} type="email" />
    )

    let input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<TextField placeholder="Password" value="" onChange={handleChange} type="password" />)

    input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })
})
