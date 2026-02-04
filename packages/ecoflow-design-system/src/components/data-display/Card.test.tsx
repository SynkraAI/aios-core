import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with header', () => {
    render(<Card header={<div>Header</div>}>Content</Card>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(<Card footer={<div>Footer</div>}>Content</Card>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders with header, body, and footer', () => {
    render(
      <Card header={<div>Header</div>} footer={<div>Footer</div>}>
        Body
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = ['default', 'outlined', 'elevated'] as const;
    variants.forEach((variant) => {
      const { container } = render(<Card variant={variant}>Content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders all padding sizes', () => {
    const paddings = ['none', 'sm', 'md', 'lg'] as const;
    paddings.forEach((padding) => {
      const { container } = render(<Card padding={padding}>Content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('applies hover effect when hoverable', () => {
    const { container } = render(<Card hoverable>Hoverable</Card>);
    const card = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('translateY(-2px)');

    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('translateY(0)');
  });

  it('does not apply hover effect when not hoverable', () => {
    const { container } = render(<Card hoverable={false}>Not hoverable</Card>);
    const card = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(card);
    expect(card.style.transform).not.toBe('translateY(-2px)');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(<Card style={{ margin: '10px' }}>Content</Card>);
    expect(container.firstChild).toHaveStyle({ margin: '10px' });
  });
});
