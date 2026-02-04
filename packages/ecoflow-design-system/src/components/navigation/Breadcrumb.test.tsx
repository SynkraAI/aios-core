import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  const mockItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Product Details' },
  ];

  it('renders all breadcrumb items', () => {
    render(<Breadcrumb items={mockItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
  });

  it('renders default separator', () => {
    const { container } = render(<Breadcrumb items={mockItems} />);
    expect(container.textContent).toMatch(/Home.*\/.*Products.*\/.*Product Details/);
  });

  it('renders custom separator', () => {
    render(<Breadcrumb items={mockItems} separator=">" />);
    expect(screen.getAllByText('>').length).toBe(2);
  });

  it('marks last item as current page', () => {
    render(<Breadcrumb items={mockItems} />);
    const lastItem = screen.getByText('Product Details');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('calls onItemClick when clicking clickable item', () => {
    const onItemClick = vi.fn();
    render(<Breadcrumb items={mockItems} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Home'));
    expect(onItemClick).toHaveBeenCalledWith(mockItems[0], 0);
  });

  it('does not call onItemClick for last item', () => {
    const onItemClick = vi.fn();
    render(<Breadcrumb items={mockItems} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Product Details'));
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation', () => {
    const onItemClick = vi.fn();
    render(<Breadcrumb items={mockItems} onItemClick={onItemClick} />);
    const homeItem = screen.getByText('Home');
    fireEvent.keyDown(homeItem, { key: 'Enter' });
    expect(onItemClick).toHaveBeenCalledWith(mockItems[0], 0);
  });
});
