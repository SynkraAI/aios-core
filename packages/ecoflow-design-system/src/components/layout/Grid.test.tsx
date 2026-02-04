import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';
import { spacing } from '@/tokens/spacing';

describe('Grid', () => {
  it('renders children correctly', () => {
    render(
      <Grid>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </Grid>
    );
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('applies default columns (4)', () => {
    const { container } = render(<Grid>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
    });
  });

  it('applies custom number of columns', () => {
    const { container } = render(<Grid columns={3}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
  });

  it('applies responsive columns (uses xl breakpoint)', () => {
    const { container } = render(
      <Grid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>Content</Grid>
    );
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
  });

  it('falls back to lg when xl not specified', () => {
    const { container } = render(<Grid columns={{ sm: 1, md: 2, lg: 3 }}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
  });

  it('falls back to md when lg/xl not specified', () => {
    const { container } = render(<Grid columns={{ sm: 1, md: 2 }}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(2, 1fr)' });
  });

  it('falls back to sm when only sm specified', () => {
    const { container } = render(<Grid columns={{ sm: 1 }}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(1, 1fr)' });
  });

  it('falls back to 4 columns when empty object', () => {
    const { container } = render(<Grid columns={{}}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
  });

  it('applies default gap (6)', () => {
    const { container } = render(<Grid>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gap: spacing[6] });
  });

  it('applies custom gap', () => {
    const { container } = render(<Grid gap={8}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ gap: spacing[8] });
  });

  it('applies custom className', () => {
    const { container } = render(<Grid className="custom-class">Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const { container } = render(<Grid style={{ background: '#fff' }}>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ background: '#fff' });
  });

  it('uses display grid', () => {
    const { container } = render(<Grid>Content</Grid>);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ display: 'grid' });
  });
});
