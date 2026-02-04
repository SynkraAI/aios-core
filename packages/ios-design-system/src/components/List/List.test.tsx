import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { List } from './List'

describe('List', () => {
  it('renders list container', () => {
    const { container } = render(
      <List>
        <div>Item 1</div>
      </List>
    )
    const list = container.querySelector('.ios-list')
    expect(list).toBeInTheDocument()
  })

  it('renders children', () => {
    const { container } = render(
      <List>
        <div>Item 1</div>
        <div>Item 2</div>
      </List>
    )
    expect(container.textContent).toContain('Item 1')
    expect(container.textContent).toContain('Item 2')
  })

  it('applies grouped style by default', () => {
    const { container } = render(
      <List>
        <div>Item</div>
      </List>
    )
    const list = container.querySelector('.ios-list')
    expect(list).toHaveClass('ios-list--grouped')
  })

  it('applies inset style when specified', () => {
    const { container } = render(
      <List style="inset">
        <div>Item</div>
      </List>
    )
    const list = container.querySelector('.ios-list')
    expect(list).toHaveClass('ios-list--inset')
  })

  it('applies custom className', () => {
    const { container } = render(
      <List className="custom-list">
        <div>Item</div>
      </List>
    )
    const list = container.querySelector('.ios-list')
    expect(list).toHaveClass('custom-list')
  })
})
