import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with message', () => {
    render(<Toast message="Toast message" />);
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Toast title="Toast Title" message="Toast message" />);
    expect(screen.getByText('Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Toast message')).toBeInTheDocument();
  });

  it('renders info variant', () => {
    render(<Toast variant="info" message="Info toast" />);
    expect(screen.getByText('Info toast')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('renders success variant', () => {
    render(<Toast variant="success" message="Success toast" />);
    expect(screen.getByText('Success toast')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders warning variant', () => {
    render(<Toast variant="warning" message="Warning toast" />);
    expect(screen.getByText('Warning toast')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders error variant', () => {
    render(<Toast variant="error" message="Error toast" />);
    expect(screen.getByText('Error toast')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders at top-right position by default', () => {
    render(<Toast message="Toast" />);
    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('renders at all positions', () => {
    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ] as const;

    positions.forEach((position) => {
      const { unmount } = render(<Toast message="Toast" position={position} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      unmount();
    });
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Toast" onClose={onClose} />);
    const closeButton = screen.getByLabelText('Close toast');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after duration', async () => {
    const onClose = vi.fn();
    render(<Toast message="Toast" duration={3000} onClose={onClose} visible={true} />);

    expect(screen.getByText('Toast')).toBeInTheDocument();

    // Fast-forward time and flush pending promises
    vi.advanceTimersByTime(3000);

    // Wait for onClose to be called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const onClose = vi.fn();
    render(<Toast message="Toast" duration={0} onClose={onClose} />);

    expect(screen.getByText('Toast')).toBeInTheDocument();

    vi.advanceTimersByTime(10000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides when visible is false', () => {
    render(<Toast message="Toast" visible={false} />);
    expect(screen.queryByText('Toast')).not.toBeInTheDocument();
  });

  it('shows when visible is true', () => {
    render(<Toast message="Toast" visible={true} />);
    expect(screen.getByText('Toast')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Toast message="Toast" className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(<Toast message="Toast" style={{ margin: '10px' }} />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveStyle({ margin: '10px' });
  });

  it('has proper ARIA attributes', () => {
    render(<Toast message="Toast" />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });
});
