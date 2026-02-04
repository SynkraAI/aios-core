import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders with initials when no image provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with image when src provided', () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img', { name: /John Doe/i });
    expect(img).toBeInTheDocument();
  });

  it('renders fallback initials on image error', () => {
    render(<Avatar name="Jane Smith" src="invalid-url.jpg" />);
    const img = screen.getByRole('img', { name: /Jane Smith/i });
    fireEvent.error(img.querySelector('img')!);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders single initial for single name', () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders question mark for empty name', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Avatar name="Test" size={size} />);
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  it('renders with circle shape', () => {
    const { container } = render(<Avatar name="Test" shape="circle" />);
    expect(container.querySelector('[role="img"]')).toBeInTheDocument();
  });

  it('renders with square shape', () => {
    const { container } = render(<Avatar name="Test" shape="square" />);
    expect(container.querySelector('[role="img"]')).toBeInTheDocument();
  });

  it('applies custom fallbackColor', () => {
    render(<Avatar name="Test" fallbackColor="#ff0000" />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar name="Test" className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('has proper aria-label', () => {
    render(<Avatar name="John Doe" alt="User avatar" />);
    expect(screen.getByRole('img', { name: 'User avatar' })).toBeInTheDocument();
  });
});
