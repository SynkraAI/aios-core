import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders with default props', () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText('Default Badge')).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      const variants: Array<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = [
        'default',
        'primary',
        'success',
        'warning',
        'danger',
        'info',
      ];

      variants.forEach(variant => {
        const { rerender } = render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant)).toBeInTheDocument();
        rerender(<></>);
      });
    });

    it('renders all sizes correctly', () => {
      const { rerender } = render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toBeInTheDocument();

      rerender(<Badge size="md">Medium</Badge>);
      expect(screen.getByText('Medium')).toBeInTheDocument();

      rerender(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('renders all badge styles correctly', () => {
      const { rerender } = render(<Badge badgeStyle="solid">Solid</Badge>);
      expect(screen.getByText('Solid')).toBeInTheDocument();

      rerender(<Badge badgeStyle="subtle">Subtle</Badge>);
      expect(screen.getByText('Subtle')).toBeInTheDocument();

      rerender(<Badge badgeStyle="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      const Icon = () => <span data-testid="left-icon">•</span>;
      render(<Badge leftIcon={<Icon />}>With Icon</Badge>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const Icon = () => <span data-testid="right-icon">×</span>;
      render(<Badge rightIcon={<Icon />}>With Icon</Badge>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders with both icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">•</span>;
      const RightIcon = () => <span data-testid="right-icon">×</span>;
      render(
        <Badge leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Both Icons
        </Badge>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Variant Combinations', () => {
    it('renders primary variant with all styles', () => {
      const { rerender } = render(<Badge variant="primary" badgeStyle="solid">Solid</Badge>);
      expect(screen.getByText('Solid')).toBeInTheDocument();

      rerender(<Badge variant="primary" badgeStyle="subtle">Subtle</Badge>);
      expect(screen.getByText('Subtle')).toBeInTheDocument();

      rerender(<Badge variant="primary" badgeStyle="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('renders success variant with all styles', () => {
      const { rerender } = render(<Badge variant="success" badgeStyle="solid">Solid</Badge>);
      expect(screen.getByText('Solid')).toBeInTheDocument();

      rerender(<Badge variant="success" badgeStyle="subtle">Subtle</Badge>);
      expect(screen.getByText('Subtle')).toBeInTheDocument();

      rerender(<Badge variant="success" badgeStyle="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      render(<Badge style={{ marginTop: '10px' }}>Custom Style</Badge>);
      const badge = screen.getByText('Custom Style');
      expect(badge.style.marginTop).toBe('10px');
    });

    it('accepts custom className', () => {
      render(<Badge className="custom-badge">Custom Class</Badge>);
      const badge = screen.getByText('Custom Class');
      expect(badge).toHaveClass('custom-badge');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards data attributes', () => {
      render(<Badge data-testid="custom-badge">Test Badge</Badge>);
      expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
    });

    it('forwards aria-label', () => {
      render(<Badge aria-label="Status badge">Active</Badge>);
      expect(screen.getByLabelText('Status badge')).toBeInTheDocument();
    });

    it('forwards title attribute', () => {
      render(<Badge title="Badge tooltip">Info</Badge>);
      expect(screen.getByTitle('Badge tooltip')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('renders number content', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders complex content', () => {
      render(
        <Badge>
          <span>Complex</span>
        </Badge>
      );
      expect(screen.getByText('Complex')).toBeInTheDocument();
    });
  });

  describe('Size and Style Combinations', () => {
    it('renders small subtle badge', () => {
      render(<Badge size="sm" badgeStyle="subtle">Small Subtle</Badge>);
      expect(screen.getByText('Small Subtle')).toBeInTheDocument();
    });

    it('renders large outline badge', () => {
      render(<Badge size="lg" badgeStyle="outline">Large Outline</Badge>);
      expect(screen.getByText('Large Outline')).toBeInTheDocument();
    });
  });
});
