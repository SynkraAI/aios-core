import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ListItem } from './ListItem'

describe('ListItem', () => {
  it('renders list item', () => {
    const { container } = render(<ListItem label="Settings" />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toBeInTheDocument()
  })

  it('renders label', () => {
    const { container } = render(<ListItem label="Settings" />)
    const label = container.querySelector('.ios-list-item__label')
    expect(label?.textContent).toBe('Settings')
  })

  it('renders icon when provided', () => {
    const { container } = render(<ListItem label="Settings" icon="⚙️" />)
    const icon = container.querySelector('.ios-list-item__icon')
    expect(icon).toBeInTheDocument()
    expect(icon?.textContent).toBe('⚙️')
  })

  it('applies icon background color', () => {
    const { container } = render(
      <ListItem label="Settings" icon="⚙️" iconBackground="#007AFF" />
    )
    const icon = container.querySelector('.ios-list-item__icon') as HTMLElement
    expect(icon.style.backgroundColor).toBe('rgb(0, 122, 255)')
  })

  it('renders detail text', () => {
    const { container } = render(<ListItem label="Settings" detail="Manage your settings" />)
    const detail = container.querySelector('.ios-list-item__detail')
    expect(detail?.textContent).toBe('Manage your settings')
  })

  it('renders value text', () => {
    const { container } = render(<ListItem label="Language" value="English" />)
    const value = container.querySelector('.ios-list-item__value')
    expect(value?.textContent).toBe('English')
  })

  it('renders badge when provided', () => {
    const { container } = render(<ListItem label="Messages" badge={5} />)
    const badge = container.querySelector('.ios-list-item__badge')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('5')
  })

  it('shows 99+ for badges over 99', () => {
    const { container } = render(<ListItem label="Messages" badge={127} />)
    const badge = container.querySelector('.ios-list-item__badge')
    expect(badge?.textContent).toBe('99+')
  })

  it('does not render badge when count is 0', () => {
    const { container } = render(<ListItem label="Messages" badge={0} />)
    const badge = container.querySelector('.ios-list-item__badge')
    expect(badge).not.toBeInTheDocument()
  })

  it('renders chevron accessory', () => {
    const { container } = render(<ListItem label="Settings" accessory="chevron" />)
    const accessory = container.querySelector('.ios-list-item__accessory--chevron')
    expect(accessory).toBeInTheDocument()
  })

  it('renders checkmark accessory', () => {
    const { container } = render(<ListItem label="Selected" accessory="checkmark" />)
    const accessory = container.querySelector('.ios-list-item__accessory--checkmark')
    expect(accessory).toBeInTheDocument()
  })

  it('calls onPress when clicked', () => {
    const handlePress = vi.fn()
    const { container } = render(<ListItem label="Settings" onPress={handlePress} />)
    const item = container.querySelector('.ios-list-item')!
    fireEvent.click(item)
    expect(handlePress).toHaveBeenCalled()
  })

  it('does not call onPress when disabled', () => {
    const handlePress = vi.fn()
    const { container } = render(<ListItem label="Settings" onPress={handlePress} disabled />)
    const item = container.querySelector('.ios-list-item')!
    fireEvent.click(item)
    expect(handlePress).not.toHaveBeenCalled()
  })

  it('applies disabled class', () => {
    const { container } = render(<ListItem label="Settings" disabled />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toHaveClass('ios-list-item--disabled')
  })

  it('applies clickable class when onPress is provided', () => {
    const { container } = render(<ListItem label="Settings" onPress={() => {}} />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toHaveClass('ios-list-item--clickable')
  })

  it('renders toggle switch', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <ListItem label="Wi-Fi" toggle={{ value: true, onChange: handleChange }} />
    )
    const toggle = container.querySelector('.ios-list-item__toggle')
    expect(toggle).toBeInTheDocument()
  })

  it('toggle is checked when value is true', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <ListItem label="Wi-Fi" toggle={{ value: true, onChange: handleChange }} />
    )
    const input = container.querySelector('.ios-list-item__toggle-input') as HTMLInputElement
    expect(input.checked).toBe(true)
  })

  it('calls toggle onChange when switched', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <ListItem label="Wi-Fi" toggle={{ value: false, onChange: handleChange }} />
    )
    const input = container.querySelector('.ios-list-item__toggle-input') as HTMLInputElement
    fireEvent.click(input)
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('does not call toggle onChange when disabled', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <ListItem label="Wi-Fi" toggle={{ value: false, onChange: handleChange }} disabled />
    )
    const input = container.querySelector('.ios-list-item__toggle-input')!
    fireEvent.change(input, { target: { checked: true } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(<ListItem label="Settings" className="custom-item" />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toHaveClass('custom-item')
  })

  it('sets role="button" when clickable', () => {
    const { container } = render(<ListItem label="Settings" onPress={() => {}} />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toHaveAttribute('role', 'button')
  })

  it('sets aria-disabled when disabled', () => {
    const { container } = render(<ListItem label="Settings" disabled />)
    const item = container.querySelector('.ios-list-item')
    expect(item).toHaveAttribute('aria-disabled', 'true')
  })
})
