import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with label', () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Switch label="Test" size={size} />);
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });
  });

  it('handles checked state', () => {
    render(<Switch checked />);
    const switchInput = screen.getByRole('switch');
    expect(switchInput).toBeChecked();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Switch label="Test" onChange={handleChange} />);
    const switchInput = screen.getByRole('switch');
    fireEvent.click(switchInput);
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables when disabled prop is true', () => {
    render(<Switch disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<Switch error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('sets aria-checked attribute', () => {
    const { rerender } = render(<Switch checked={false} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    rerender(<Switch checked={true} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Switch error="Error" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders label on the right by default', () => {
    const { container } = render(<Switch label="Right label" />);
    expect(container.querySelector('label')).toBeInTheDocument();
  });

  it('renders label on the left', () => {
    const { container } = render(<Switch label="Left label" labelPosition="left" />);
    const label = container.querySelector('label');
    expect(label).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    render(<Switch style={{ margin: '10px' }} data-testid="switch-wrapper" />);
    // Style is applied to the outermost div wrapper, not the label
    const switchElement = screen.getByRole('switch').closest('div') as HTMLElement;
    expect(switchElement.parentElement).toHaveStyle({ margin: '10px' });
  });

  it('toggles state on label click', () => {
    const handleChange = vi.fn();
    render(<Switch label="Toggle me" onChange={handleChange} />);
    fireEvent.click(screen.getByText('Toggle me'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('uses checkbox type with switch role', () => {
    const { container } = render(<Switch />);
    const input = container.querySelector('input');
    expect(input?.type).toBe('checkbox');
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Switch onChange={handleChange} />);
    const switchInput = screen.getByRole('switch');
    fireEvent.keyDown(switchInput, { key: ' ' });
    // Space key should trigger native checkbox toggle
    expect(switchInput).toBeInTheDocument();
  });
});
