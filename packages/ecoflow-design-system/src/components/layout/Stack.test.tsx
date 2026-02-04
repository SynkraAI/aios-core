import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';
import { spacing } from '@/tokens/spacing';

describe('Stack', () => {
  it('renders children correctly', () => {
    render(
      <Stack>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </Stack>
    );
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('applies vertical direction by default', () => {
    const { container } = render(<Stack>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
  });

  it('applies horizontal direction when specified', () => {
    const { container } = render(<Stack direction="horizontal">Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      display: 'flex',
      flexDirection: 'row',
    });
  });

  it('applies default gap (4)', () => {
    const { container } = render(<Stack>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gap: spacing[4] });
  });

  it('applies custom gap', () => {
    const { container } = render(<Stack gap={8}>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gap: spacing[8] });
  });

  it('applies correct align values', () => {
    const { rerender, container } = render(<Stack align="start">Content</Stack>);
    let element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ alignItems: 'flex-start' });

    rerender(<Stack align="center">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ alignItems: 'center' });

    rerender(<Stack align="end">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ alignItems: 'flex-end' });

    rerender(<Stack align="stretch">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ alignItems: 'stretch' });
  });

  it('applies correct justify values', () => {
    const { rerender, container } = render(<Stack justify="start">Content</Stack>);
    let element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'flex-start' });

    rerender(<Stack justify="center">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'center' });

    rerender(<Stack justify="end">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'flex-end' });

    rerender(<Stack justify="space-between">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'space-between' });

    rerender(<Stack justify="space-around">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'space-around' });

    rerender(<Stack justify="space-evenly">Content</Stack>);
    element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ justifyContent: 'space-evenly' });
  });

  it('does not wrap by default', () => {
    const { container } = render(<Stack>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ flexWrap: 'nowrap' });
  });

  it('wraps when wrap is true', () => {
    const { container } = render(<Stack wrap>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ flexWrap: 'wrap' });
  });

  it('applies custom className', () => {
    const { container } = render(<Stack className="custom-class">Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const { container } = render(<Stack style={{ background: '#fff' }}>Content</Stack>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ background: '#fff' });
  });

  it('combines direction and alignment correctly', () => {
    const { container } = render(
      <Stack direction="horizontal" align="center" justify="space-between">
        Content
      </Stack>
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });
});
