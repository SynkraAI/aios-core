import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
    variants.forEach((variant) => {
      const { container } = render(<Badge variant={variant}>Badge</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Badge size={size}>Badge</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(<Badge style={{ margin: '10px' }}>Badge</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveStyle({ margin: '10px' });
  });

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with default size', () => {
    render(<Badge>Medium</Badge>);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
