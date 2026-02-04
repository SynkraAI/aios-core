import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox, CheckboxGroup } from './Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Checkbox label="Test" size={size} />);
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });
  });

  it('handles checked state', () => {
    render(<Checkbox checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Test" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables when disabled prop is true', () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<Checkbox error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Checkbox error="Error" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Checkbox className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('CheckboxGroup', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with label', () => {
    render(<CheckboxGroup label="Select options" options={options} />);
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<CheckboxGroup options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<CheckboxGroup options={options} value={[]} onChange={handleChange} />);
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(['option1']);
  });

  it('handles unchecking items', () => {
    const handleChange = vi.fn();
    render(<CheckboxGroup options={options} value={['option1']} onChange={handleChange} />);
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('renders in horizontal orientation', () => {
    const { container } = render(<CheckboxGroup options={options} orientation="horizontal" />);
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  it('renders in vertical orientation', () => {
    const { container } = render(<CheckboxGroup options={options} orientation="vertical" />);
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  it('disables specific options', () => {
    const optionsWithDisabled = [
      ...options,
      { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
    ];
    render(<CheckboxGroup options={optionsWithDisabled} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[3]).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<CheckboxGroup options={options} error="Select at least one option" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one option');
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<CheckboxGroup options={options} size={size} />);
      expect(container.querySelector('[role="group"]')).toBeInTheDocument();
    });
  });
});
