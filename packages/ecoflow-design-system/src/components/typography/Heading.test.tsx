import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';

describe('Heading', () => {
  it('renders with default props', () => {
    render(<Heading level={1}>Test Heading</Heading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Heading');
  });

  it('renders correct HTML element for each level', () => {
    const { rerender } = render(<Heading level={1}>H1</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    rerender(<Heading level={2}>H2</Heading>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(<Heading level={3}>H3</Heading>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();

    rerender(<Heading level={4}>H4</Heading>);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();

    rerender(<Heading level={5}>H5</Heading>);
    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();

    rerender(<Heading level={6}>H6</Heading>);
    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
  });

  it('applies correct font size for each level', () => {
    const { rerender } = render(<Heading level={1}>H1</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize['4xl'] });

    rerender(<Heading level={2}>H2</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize['3xl'] });

    rerender(<Heading level={3}>H3</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize['2xl'] });

    rerender(<Heading level={4}>H4</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize.xl });

    rerender(<Heading level={5}>H5</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize.lg });

    rerender(<Heading level={6}>H6</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: typography.fontSize.base });
  });

  it('applies custom color', () => {
    render(
      <Heading level={2} color="#FF0000">
        Colored Heading
      </Heading>
    );
    expect(screen.getByRole('heading')).toHaveStyle({ color: '#FF0000' });
  });

  it('applies default color when not specified', () => {
    render(<Heading level={2}>Default Color</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({ color: colors.neutral[900] });
  });

  it('applies semibold weight by default', () => {
    render(<Heading level={2}>Semibold</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({
      fontWeight: typography.fontWeight.semibold,
    });
  });

  it('applies bold weight when specified', () => {
    render(
      <Heading level={2} weight="bold">
        Bold Heading
      </Heading>
    );
    expect(screen.getByRole('heading')).toHaveStyle({ fontWeight: typography.fontWeight.bold });
  });

  it('applies custom className', () => {
    render(
      <Heading level={2} className="custom-class">
        Custom Class
      </Heading>
    );
    expect(screen.getByRole('heading')).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    render(
      <Heading level={2} style={{ marginTop: '20px' }}>
        Custom Style
      </Heading>
    );
    expect(screen.getByRole('heading')).toHaveStyle({ marginTop: '20px' });
  });

  it('has correct line height', () => {
    render(<Heading level={2}>Tight Line Height</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({
      lineHeight: typography.lineHeight.tight,
    });
  });

  it('uses correct font family', () => {
    render(<Heading level={2}>Font Family</Heading>);
    expect(screen.getByRole('heading')).toHaveStyle({
      fontFamily: typography.fontFamily.sans,
    });
  });
});
