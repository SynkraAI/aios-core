import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spacer } from './Spacer';
import { spacing } from '@/tokens/spacing';

describe('Spacer', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spacer />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies default height (vertical spacing with size 4)', () => {
    const { container } = render(<Spacer />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ height: spacing[4] });
  });

  it('applies custom size', () => {
    const { container } = render(<Spacer size={8} />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ height: spacing[8] });
  });

  it('applies horizontal spacing (width instead of height)', () => {
    const { container } = render(<Spacer size={6} horizontal />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ width: spacing[6] });
    expect(element).not.toHaveStyle({ height: spacing[6] });
  });

  it('does not shrink', () => {
    const { container } = render(<Spacer />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ flexShrink: 0 });
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<Spacer />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom className', () => {
    const { container } = render(<Spacer className="custom-class" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('custom-class');
  });

  it('applies custom styles', () => {
    const { container } = render(<Spacer style={{ background: '#fff' }} />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ background: '#fff' });
  });

  it('combines horizontal with custom size', () => {
    const { container } = render(<Spacer size={12} horizontal />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveStyle({ width: spacing[12] });
  });
});
