/**
 * EcoFlow Design System - Grid Component
 *
 * Responsive CSS Grid layout component
 */

import { CSSProperties, ReactNode } from 'react';
import { spacing, SpacingKey } from '@/tokens/spacing';

export interface GridProps {
  /** Number of columns (can be responsive object) */
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between grid items (uses spacing scale, defaults to 6 = 24px) */
  gap?: number;
  /** Content to lay out in grid */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Grid component for responsive grid layouts
 *
 * @example
 * ```tsx
 * // Simple 4-column grid
 * <Grid columns={4}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 *   <Card>Item 4</Card>
 * </Grid>
 *
 * // Responsive grid: 1 col mobile, 2 tablet, 4 desktop
 * <Grid columns={{ sm: 1, md: 2, lg: 4 }} gap={6}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </Grid>
 *
 * // Custom gap
 * <Grid columns={3} gap={8}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * ```
 */
export const Grid = ({
  columns = 4,
  gap = 6,
  children,
  className = '',
  style = {},
}: GridProps) => {
  const getGridTemplateColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }

    // Responsive columns will be handled by media queries in the future
    // For now, default to xl breakpoint
    return `repeat(${columns.xl || columns.lg || columns.md || columns.sm || 4}, 1fr)`;
  };

  const combinedStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumns(),
    gap: spacing[gap as SpacingKey],
    ...style,
  };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';
