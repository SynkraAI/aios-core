import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Select label="Choose an option" options={options} />);
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose an option')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Select placeholder="Select..." options={options} />);
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Select options={options} size={size} />);
      expect(container.querySelector('select')).toBeInTheDocument();
    });
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables when disabled prop is true', () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<Select options={options} error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('renders with helper text', () => {
    render(<Select options={options} helperText="Choose the best option" />);
    expect(screen.getByText('Choose the best option')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(<Select options={options} error="Error" helperText="Helper" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders full width', () => {
    const { container } = render(<Select options={options} fullWidth />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '100%' });
  });

  it('disables specific options', () => {
    const optionsWithDisabled = [
      ...options,
      { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
    ];
    render(<Select options={optionsWithDisabled} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const disabledOption = select.querySelector('option[value="option4"]') as HTMLOptionElement;
    expect(disabledOption).toBeDisabled();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Select options={options} error="Error" />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links error message with aria-describedby', () => {
    render(<Select options={options} error="Error message" id="test-select" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
  });

  it('applies custom className', () => {
    const { container } = render(<Select options={options} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('applies custom styles', () => {
    const { container } = render(<Select options={options} style={{ margin: '10px' }} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ margin: '10px' });
  });

  it('supports default value', () => {
    render(<Select options={options} defaultValue="option2" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });
});
