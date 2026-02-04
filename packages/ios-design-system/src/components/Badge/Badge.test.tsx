import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders badge', () => {
    const { container } = render(<Badge value={5} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    const { container } = render(<Badge value={5} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge?.textContent).toBe('5')
  })

  it('renders text value', () => {
    const { container } = render(<Badge value="New" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge?.textContent).toBe('New')
  })

  it('shows 99+ for values over 99', () => {
    const { container } = render(<Badge value={127} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge?.textContent).toBe('99+')
  })

  it('shows exact value for 99', () => {
    const { container } = render(<Badge value={99} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge?.textContent).toBe('99')
  })

  it('applies red variant by default', () => {
    const { container } = render(<Badge value={5} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--red')
  })

  it('applies blue variant', () => {
    const { container } = render(<Badge value={5} variant="blue" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--blue')
  })

  it('applies green variant', () => {
    const { container } = render(<Badge value={5} variant="green" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--green')
  })

  it('applies medium size by default', () => {
    const { container } = render(<Badge value={5} />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--medium')
  })

  it('applies small size', () => {
    const { container } = render(<Badge value={5} size="small" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--small')
  })

  it('applies large size', () => {
    const { container } = render(<Badge value={5} size="large" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('ios-badge--large')
  })

  it('applies custom className', () => {
    const { container } = render(<Badge value={5} className="custom-badge" />)
    const badge = container.querySelector('.ios-badge')
    expect(badge).toHaveClass('custom-badge')
  })
})
