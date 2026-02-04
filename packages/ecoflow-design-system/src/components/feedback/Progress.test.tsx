import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';

describe('Progress', () => {
  it('renders linear variant', () => {
    render(<Progress variant="linear" value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders circular variant', () => {
    render(<Progress variant="circular" value={75} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays correct progress value', () => {
    render(<Progress value={60} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '60');
  });

  it('clamps value to 0-100 range (below)', () => {
    render(<Progress value={-10} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value to 0-100 range (above)', () => {
    render(<Progress value={150} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('renders small size', () => {
    render(<Progress size="sm" value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders medium size', () => {
    render(<Progress size="md" value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders large size', () => {
    render(<Progress size="lg" value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows label when showLabel is true', () => {
    render(<Progress value={45} showLabel />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows custom label', () => {
    render(<Progress value={70} label="Uploading" showLabel />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('does not show label when showLabel is false', () => {
    render(<Progress value={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('applies custom color', () => {
    render(<Progress value={50} color="#ff0000" showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(<Progress value={50} style={{ margin: '10px' }} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ margin: '10px' });
  });

  it('has correct ARIA attributes', () => {
    render(<Progress value={80} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '80');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });
});
