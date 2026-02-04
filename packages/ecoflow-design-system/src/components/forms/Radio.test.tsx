import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio, RadioGroup } from './Radio';

describe('Radio', () => {
  it('renders with label', () => {
    render(<Radio label="Option A" />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Radio label="Test" size={size} />);
      expect(container.querySelector('input[type="radio"]')).toBeInTheDocument();
    });
  });

  it('handles checked state', () => {
    render(<Radio checked />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('handles change events', () => {
    const handleChange = vi.fn();
    render(<Radio label="Test" onChange={handleChange} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('disables when disabled prop is true', () => {
    render(<Radio disabled />);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<Radio error="This field is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Radio error="Error" />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Radio className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with label', () => {
    render(<RadioGroup label="Select an option" name="test" options={options} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<RadioGroup name="test" options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<RadioGroup name="test" options={options} onChange={handleChange} />);
    const radio = screen.getAllByRole('radio')[0];
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('checks the selected value', () => {
    render(<RadioGroup name="test" options={options} value="option2" />);
    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it('renders in horizontal orientation', () => {
    const { container } = render(
      <RadioGroup name="test" options={options} orientation="horizontal" />
    );
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
  });

  it('renders in vertical orientation', () => {
    const { container } = render(<RadioGroup name="test" options={options} orientation="vertical" />);
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
  });

  it('disables specific options', () => {
    const optionsWithDisabled = [
      ...options,
      { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
    ];
    render(<RadioGroup name="test" options={optionsWithDisabled} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[3]).toBeDisabled();
  });

  it('renders with error message', () => {
    render(<RadioGroup name="test" options={options} error="Please select an option" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Please select an option');
  });

  it('renders all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach((size) => {
      const { container } = render(<RadioGroup name="test" options={options} size={size} />);
      expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
    });
  });

  it('groups radios with same name', () => {
    render(<RadioGroup name="test-group" options={options} />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    radios.forEach((radio) => {
      expect(radio.name).toBe('test-group');
    });
  });
});
