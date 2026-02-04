import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders with message', () => {
    render(<Alert>This is an alert message</Alert>);
    expect(screen.getByText('This is an alert message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Alert message</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders info variant', () => {
    render(<Alert variant="info">Info alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('renders success variant', () => {
    render(<Alert variant="success">Success alert</Alert>);
    expect(screen.getByText('Success alert')).toBeInTheDocument();
  });

  it('renders warning variant', () => {
    render(<Alert variant="warning">Warning alert</Alert>);
    expect(screen.getByText('Warning alert')).toBeInTheDocument();
  });

  it('renders error variant', () => {
    render(<Alert variant="error">Error alert</Alert>);
    expect(screen.getByText('Error alert')).toBeInTheDocument();
  });

  it('renders default icon for each variant', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByText('ℹ️')).toBeInTheDocument();

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByText('✓')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(<Alert icon={<span>🚀</span>}>Custom icon alert</Alert>);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Alert with close</Alert>);
    const closeButton = screen.getByLabelText('Close alert');
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Alert with close</Alert>);
    const closeButton = screen.getByLabelText('Close alert');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose not provided', () => {
    render(<Alert>Alert without close</Alert>);
    expect(screen.queryByLabelText('Close alert')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Alert className="custom-class">Alert</Alert>);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(<Alert style={{ margin: '10px' }}>Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveStyle({ margin: '10px' });
  });

  it('has proper ARIA role', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
