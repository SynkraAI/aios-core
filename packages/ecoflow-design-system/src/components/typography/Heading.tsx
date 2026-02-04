/**
 * EcoFlow Design System - Heading Component
 *
 * Semantic heading component (h1-h6) with consistent typography tokens
 */

import { CSSProperties, ElementType, ReactNode } from 'react';
import { typography } from '@/tokens/typography';
import { colors } from '@/tokens/colors';

export interface HeadingProps {
  /** Heading level (1-6) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Content to display */
  children: ReactNode;
  /** Text color (defaults to neutral.900) */
  color?: string;
  /** Font weight (defaults to semibold) */
  weight?: 'semibold' | 'bold';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const headingSizeMap = {
  1: typography.fontSize['4xl'], // 36px
  2: typography.fontSize['3xl'], // 30px
  3: typography.fontSize['2xl'], // 24px
  4: typography.fontSize.xl, // 20px
  5: typography.fontSize.lg, // 18px
  6: typography.fontSize.base, // 16px
} as const;

const weightMap = {
  semibold: typography.fontWeight.semibold,
  bold: typography.fontWeight.bold,
} as const;

/**
 * Heading component for displaying semantic headings (h1-h6)
 *
 * @example
 * ```tsx
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2} weight="bold">Section Title</Heading>
 * <Heading level={3} color="#00BFA5">Custom Color</Heading>
 * ```
 */
export const Heading = ({
  level,
  children,
  color = colors.neutral[900],
  weight = 'semibold',
  className = '',
  style = {},
}: HeadingProps) => {
  const Tag = `h${level}` as ElementType;

  const combinedStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: headingSizeMap[level],
    fontWeight: weightMap[weight],
    lineHeight: typography.lineHeight.tight,
    color,
    margin: 0,
    ...style,
  };

  return (
    <Tag className={className} style={combinedStyle}>
      {children}
    </Tag>
  );
};

Heading.displayName = 'Heading';
