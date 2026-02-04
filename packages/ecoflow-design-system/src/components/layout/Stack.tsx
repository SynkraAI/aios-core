/**
 * EcoFlow Design System - Stack Component
 *
 * Flexible layout component for vertical/horizontal stacking with gap
 */

import { CSSProperties, ReactNode } from 'react';
import { spacing, SpacingKey } from '@/tokens/spacing';

export interface StackProps {
  /** Stack direction */
  direction?: 'vertical' | 'horizontal';
  /** Gap between items (uses spacing scale, defaults to 4 = 16px) */
  gap?: number;
  /** Alignment along main axis */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Alignment along cross axis */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  /** Allow items to wrap */
  wrap?: boolean;
  /** Content to stack */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  'space-evenly': 'space-evenly',
} as const;

/**
 * Stack component for flexible vertical or horizontal layouts
 *
 * @example
 * ```tsx
 * // Vertical stack with default gap
 * <Stack direction="vertical">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 *
 * // Horizontal stack with custom gap and centering
 * <Stack direction="horizontal" gap={6} align="center">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Stack>
 *
 * // Stack with space-between justification
 * <Stack direction="horizontal" justify="space-between">
 *   <div>Left</div>
 *   <div>Right</div>
 * </Stack>
 * ```
 */
export const Stack = ({
  direction = 'vertical',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children,
  className = '',
  style = {},
}: StackProps) => {
  const combinedStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: spacing[gap as SpacingKey],
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
};

Stack.displayName = 'Stack';
