import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders card', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toBeInTheDocument()
  })

  it('renders children', () => {
    const { container } = render(<Card>Test Content</Card>)
    expect(container.textContent).toContain('Test Content')
  })

  it('renders title when provided', () => {
    const { container } = render(<Card title="Test Title">Content</Card>)
    const title = container.querySelector('.ios-card__title')
    expect(title?.textContent).toBe('Test Title')
  })

  it('renders subtitle when provided', () => {
    const { container } = render(<Card subtitle="Test Subtitle">Content</Card>)
    const subtitle = container.querySelector('.ios-card__subtitle')
    expect(subtitle?.textContent).toBe('Test Subtitle')
  })

  it('renders image when provided', () => {
    const { container } = render(<Card image="📷">Content</Card>)
    const image = container.querySelector('.ios-card__image')
    expect(image).toBeInTheDocument()
    expect(image?.textContent).toBe('📷')
  })

  it('renders accessory when provided', () => {
    const { container } = render(<Card accessory="›">Content</Card>)
    const accessory = container.querySelector('.ios-card__accessory')
    expect(accessory).toBeInTheDocument()
    expect(accessory?.textContent).toBe('›')
  })

  it('applies default variant by default', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveClass('ios-card--default')
  })

  it('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveClass('ios-card--elevated')
  })

  it('applies filled variant', () => {
    const { container } = render(<Card variant="filled">Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveClass('ios-card--filled')
  })

  it('applies clickable class when onPress is provided', () => {
    const { container } = render(<Card onPress={() => {}}>Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveClass('ios-card--clickable')
  })

  it('calls onPress when clicked', () => {
    const handlePress = vi.fn()
    const { container } = render(<Card onPress={handlePress}>Content</Card>)
    const card = container.querySelector('.ios-card')!
    fireEvent.click(card)
    expect(handlePress).toHaveBeenCalled()
  })

  it('sets role="button" when clickable', () => {
    const { container } = render(<Card onPress={() => {}}>Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveAttribute('role', 'button')
  })

  it('does not render header when no header props provided', () => {
    const { container } = render(<Card>Content</Card>)
    const header = container.querySelector('.ios-card__header')
    expect(header).not.toBeInTheDocument()
  })

  it('renders header when title is provided', () => {
    const { container } = render(<Card title="Title">Content</Card>)
    const header = container.querySelector('.ios-card__header')
    expect(header).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>)
    const card = container.querySelector('.ios-card')
    expect(card).toHaveClass('custom-card')
  })
})
