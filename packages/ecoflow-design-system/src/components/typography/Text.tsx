/**
 * EcoFlow Design System - Text Component
 *
 * Body text component with size, weight, and color variants
 */

import { CSSProperties, ReactNode } from 'react';
import { typography } from '@/tokens/typography';
import { colors } from '@/tokens/colors';

export interface TextProps {
  /** Text size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold';
  /** Text color (defaults to neutral.700) */
  color?: string;
  /** Content to display */
  children: ReactNode;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Render as specific HTML element */
  as?: 'p' | 'span' | 'div' | 'label';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const weightMap = {
  normal: typography.fontWeight.normal,
  medium: typography.fontWeight.medium,
  semibold: typography.fontWeight.semibold,
} as const;

/**
 * Text component for body text with multiple size and weight variants
 *
 * @example
 * ```tsx
 * <Text>Default body text</Text>
 * <Text size="sm" weight="medium">Small medium text</Text>
 * <Text size="lg" color="#00BFA5">Large custom color</Text>
 * <Text truncate>This text will be truncated with ellipsis...</Text>
 * ```
 */
export const Text = ({
  size = 'base',
  weight = 'normal',
  color = colors.neutral[700],
  children,
  truncate = false,
  as: Component = 'p',
  className = '',
  style = {},
}: TextProps) => {
  const combinedStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize[size],
    fontWeight: weightMap[weight],
    lineHeight: typography.lineHeight.normal,
    color,
    margin: 0,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...style,
  };

  return (
    <Component className={className} style={combinedStyle}>
      {children}
    </Component>
  );
};

Text.displayName = 'Text';
