import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders with online status', () => {
    render(<StatusIndicator status="online" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Online');
  });

  it('renders with offline status', () => {
    render(<StatusIndicator status="offline" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Offline');
  });

  it('renders with busy status', () => {
    render(<StatusIndicator status="busy" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Busy');
  });

  it('renders with away status', () => {
    render(<StatusIndicator status="away" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Away');
  });

  it('renders label when showLabel is true', () => {
    render(<StatusIndicator status="online" showLabel />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('does not render label when showLabel is false', () => {
    render(<StatusIndicator status="online" showLabel={false} />);
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<StatusIndicator status="online" label="Active" showLabel />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<StatusIndicator status="online" size={size} />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<StatusIndicator status="online" className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(<StatusIndicator status="online" style={{ margin: '10px' }} />);
    expect(container.querySelector('[role="status"]')).toHaveStyle({ margin: '10px' });
  });
});
