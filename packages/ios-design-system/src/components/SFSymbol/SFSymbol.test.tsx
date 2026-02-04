import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SFSymbol } from './SFSymbol'

describe('SFSymbol', () => {
  it('renders symbol', () => {
    const { container } = render(<SFSymbol name="⭐️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toBeInTheDocument()
  })

  it('renders symbol name', () => {
    const { container } = render(<SFSymbol name="❤️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol?.textContent).toBe('❤️')
  })

  it('applies small size', () => {
    const { container } = render(<SFSymbol name="⭐️" size="small" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--small')
  })

  it('applies medium size by default', () => {
    const { container } = render(<SFSymbol name="⭐️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--medium')
  })

  it('applies large size', () => {
    const { container } = render(<SFSymbol name="⭐️" size="large" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--large')
  })

  it('applies xlarge size', () => {
    const { container } = render(<SFSymbol name="⭐️" size="xlarge" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--xlarge')
  })

  it('applies xxlarge size', () => {
    const { container } = render(<SFSymbol name="⭐️" size="xxlarge" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--xxlarge')
  })

  it('applies ultralight weight', () => {
    const { container } = render(<SFSymbol name="⭐️" weight="ultralight" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--ultralight')
  })

  it('applies regular weight by default', () => {
    const { container } = render(<SFSymbol name="⭐️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--regular')
  })

  it('applies bold weight', () => {
    const { container } = render(<SFSymbol name="⭐️" weight="bold" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--bold')
  })

  it('applies monochrome rendering by default', () => {
    const { container } = render(<SFSymbol name="⭐️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--monochrome')
  })

  it('applies multicolor rendering', () => {
    const { container } = render(<SFSymbol name="⭐️" renderingMode="multicolor" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--multicolor')
  })

  it('applies hierarchical rendering', () => {
    const { container } = render(<SFSymbol name="⭐️" renderingMode="hierarchical" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--hierarchical')
  })

  it('applies custom color', () => {
    const { container } = render(<SFSymbol name="⭐️" color="#FF3B30" />)
    const symbol = container.querySelector('.ios-sf-symbol') as HTMLElement
    expect(symbol?.style.color).toBe('rgb(255, 59, 48)')
  })

  it('applies interactive class when onClick is provided', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('ios-sf-symbol--interactive')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol') as HTMLElement
    fireEvent.click(symbol)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol') as HTMLElement
    fireEvent.keyDown(symbol, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol') as HTMLElement
    fireEvent.keyDown(symbol, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has button role when interactive', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveAttribute('role', 'button')
  })

  it('is keyboard focusable when interactive', () => {
    const handleClick = vi.fn()
    const { container } = render(<SFSymbol name="⭐️" onClick={handleClick} />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveAttribute('tabIndex', '0')
  })

  it('uses symbol name as default aria-label', () => {
    const { container } = render(<SFSymbol name="⭐️" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveAttribute('aria-label', '⭐️')
  })

  it('applies custom accessibility label', () => {
    const { container } = render(<SFSymbol name="⭐️" accessibilityLabel="Star icon" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveAttribute('aria-label', 'Star icon')
  })

  it('applies custom className', () => {
    const { container } = render(<SFSymbol name="⭐️" className="custom-symbol" />)
    const symbol = container.querySelector('.ios-sf-symbol')
    expect(symbol).toHaveClass('custom-symbol')
  })
})
