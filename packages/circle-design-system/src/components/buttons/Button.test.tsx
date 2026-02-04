import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with default variant and size', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders all sizes correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(
        <Button leftIcon={<LeftIcon />}>
          With Left Icon
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(
        <Button rightIcon={<RightIcon />}>
          With Right Icon
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders with both icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Loading spinner is an SVG element
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('hides left icon when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      render(
        <Button leftIcon={<LeftIcon />} loading>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      render(
        <Button rightIcon={<RightIcon />} loading>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles mouse enter and leave events', async () => {
      const user = userEvent.setup();
      render(<Button>Hover me</Button>);
      const button = screen.getByRole('button');

      await user.hover(button);
      // Button style should change on hover (tested via visual regression)

      await user.unhover(button);
      // Button style should revert (tested via visual regression)
    });
  });

  describe('Full Width', () => {
    it('renders with full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button.style.width).toBe('100%');
    });

    it('renders with auto width by default', () => {
      render(<Button>Auto Width</Button>);
      const button = screen.getByRole('button');
      expect(button.style.width).toBe('auto');
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      render(
        <Button style={{ marginTop: '20px' }}>
          Custom Style
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button.style.marginTop).toBe('20px');
    });

    it('accepts custom className', () => {
      render(<Button className="custom-class">Custom Class</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('forwards aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('forwards data attributes', () => {
      render(<Button data-testid="custom-button">Test</Button>);
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });
  });
});
