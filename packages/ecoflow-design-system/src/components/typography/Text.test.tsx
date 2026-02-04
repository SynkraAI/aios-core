import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';

describe('Text', () => {
  it('renders with default props', () => {
    render(<Text>Test Text</Text>);
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('renders as paragraph by default', () => {
    const { container } = render(<Text>Paragraph</Text>);
    expect(container.querySelector('p')).toBeInTheDocument();
  });

  it('renders as different HTML elements', () => {
    const { rerender, container } = render(<Text as="span">Span</Text>);
    expect(container.querySelector('span')).toBeInTheDocument();

    rerender(<Text as="div">Div</Text>);
    expect(container.querySelector('div')).toBeInTheDocument();

    rerender(<Text as="label">Label</Text>);
    expect(container.querySelector('label')).toBeInTheDocument();
  });

  it('applies correct font size for each size variant', () => {
    const { rerender } = render(<Text size="xs">Extra Small</Text>);
    expect(screen.getByText('Extra Small')).toHaveStyle({ fontSize: typography.fontSize.xs });

    rerender(<Text size="sm">Small</Text>);
    expect(screen.getByText('Small')).toHaveStyle({ fontSize: typography.fontSize.sm });

    rerender(<Text size="base">Base</Text>);
    expect(screen.getByText('Base')).toHaveStyle({ fontSize: typography.fontSize.base });

    rerender(<Text size="lg">Large</Text>);
    expect(screen.getByText('Large')).toHaveStyle({ fontSize: typography.fontSize.lg });
  });

  it('applies correct font weight', () => {
    const { rerender } = render(<Text weight="normal">Normal</Text>);
    expect(screen.getByText('Normal')).toHaveStyle({
      fontWeight: typography.fontWeight.normal,
    });

    rerender(<Text weight="medium">Medium</Text>);
    expect(screen.getByText('Medium')).toHaveStyle({
      fontWeight: typography.fontWeight.medium,
    });

    rerender(<Text weight="semibold">Semibold</Text>);
    expect(screen.getByText('Semibold')).toHaveStyle({
      fontWeight: typography.fontWeight.semibold,
    });
  });

  it('applies default color when not specified', () => {
    render(<Text>Default Color</Text>);
    expect(screen.getByText('Default Color')).toHaveStyle({ color: colors.neutral[700] });
  });

  it('applies custom color', () => {
    render(<Text color="#FF0000">Custom Color</Text>);
    expect(screen.getByText('Custom Color')).toHaveStyle({ color: '#FF0000' });
  });

  it('applies truncate styles when truncate is true', () => {
    render(<Text truncate>Long text that should be truncated</Text>);
    const element = screen.getByText('Long text that should be truncated');
    expect(element).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
  });

  it('does not apply truncate styles by default', () => {
    render(<Text>Normal text</Text>);
    const element = screen.getByText('Normal text');
    expect(element).not.toHaveStyle({ overflow: 'hidden' });
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Custom Class</Text>);
    expect(screen.getByText('Custom Class')).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    render(<Text style={{ marginTop: '10px' }}>Custom Style</Text>);
    expect(screen.getByText('Custom Style')).toHaveStyle({ marginTop: '10px' });
  });

  it('has correct line height', () => {
    render(<Text>Normal Line Height</Text>);
    expect(screen.getByText('Normal Line Height')).toHaveStyle({
      lineHeight: typography.lineHeight.normal,
    });
  });

  it('uses correct font family', () => {
    render(<Text>Font Family</Text>);
    expect(screen.getByText('Font Family')).toHaveStyle({
      fontFamily: typography.fontFamily.sans,
    });
  });

  it('has no margin by default', () => {
    render(<Text>No Margin</Text>);
    expect(screen.getByText('No Margin')).toHaveStyle({ margin: 0 });
  });
});
