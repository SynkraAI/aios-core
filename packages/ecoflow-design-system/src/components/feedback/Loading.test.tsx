import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
  it('renders spinner variant', () => {
    render(<Loading variant="spinner" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders dots variant', () => {
    render(<Loading variant="dots" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders pulse variant', () => {
    render(<Loading variant="pulse" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders small size', () => {
    render(<Loading size="sm" label="Small loading" />);
    expect(screen.getByText('Small loading')).toBeInTheDocument();
  });

  it('renders medium size', () => {
    render(<Loading size="md" label="Medium loading" />);
    expect(screen.getByText('Medium loading')).toBeInTheDocument();
  });

  it('renders large size', () => {
    render(<Loading size="lg" label="Large loading" />);
    expect(screen.getByText('Large loading')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Loading label="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Loading />);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('applies custom color', () => {
    render(<Loading color="#ff0000" label="Custom color" />);
    expect(screen.getByText('Custom color')).toBeInTheDocument();
  });

  it('has proper ARIA label', () => {
    render(<Loading label="Loading content" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading content');
  });

  it('has default ARIA label when no label provided', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(<Loading style={{ margin: '10px' }} label="Styled loading" />);
    const loadingContainer = container.firstChild as HTMLElement;
    expect(loadingContainer).toHaveStyle({ margin: '10px' });
  });
});
