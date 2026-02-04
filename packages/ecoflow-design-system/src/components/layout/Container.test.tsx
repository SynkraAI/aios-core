import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';
import { spacing, container } from '@/tokens/spacing';

describe('Container', () => {
  it('renders children correctly', () => {
    render(
      <Container>
        <div data-testid="child">Child Content</div>
      </Container>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies default maxWidth (xl)', () => {
    const { container: containerEl } = render(<Container>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container.xl });
  });

  it('applies correct maxWidth for each variant', () => {
    const { rerender, container: containerEl } = render(<Container maxWidth="sm">Content</Container>);
    let element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container.sm });

    rerender(<Container maxWidth="md">Content</Container>);
    element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container.md });

    rerender(<Container maxWidth="lg">Content</Container>);
    element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container.lg });

    rerender(<Container maxWidth="xl">Content</Container>);
    element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container.xl });

    rerender(<Container maxWidth="2xl">Content</Container>);
    element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: container['2xl'] });

    rerender(<Container maxWidth="full">Content</Container>);
    element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ maxWidth: '100%' });
  });

  it('applies default padding (6)', () => {
    const { container: containerEl } = render(<Container>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      paddingLeft: spacing[6],
      paddingRight: spacing[6],
    });
  });

  it('applies custom padding', () => {
    const { container: containerEl } = render(<Container padding={8}>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      paddingLeft: spacing[8],
      paddingRight: spacing[8],
    });
  });

  it('centers content with auto margins', () => {
    const { container: containerEl } = render(<Container>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      marginLeft: 'auto',
      marginRight: 'auto',
    });
  });

  it('has 100% width', () => {
    const { container: containerEl } = render(<Container>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ width: '100%' });
  });

  it('applies custom className', () => {
    const { container: containerEl } = render(<Container className="custom-class">Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const { container: containerEl } = render(<Container style={{ background: '#fff' }}>Content</Container>);
    const element = containerEl.firstChild as HTMLElement;
    expect(element).toHaveStyle({ background: '#fff' });
  });
});
