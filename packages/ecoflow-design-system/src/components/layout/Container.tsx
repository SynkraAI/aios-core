/**
 * EcoFlow Design System - Container Component
 *
 * Max-width content wrapper with responsive sizing
 */

import { CSSProperties, ReactNode } from 'react';
import { spacing, container, SpacingKey } from '@/tokens/spacing';

export interface ContainerProps {
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Padding size (uses spacing scale) */
  padding?: number;
  /** Content to wrap */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const maxWidthMap = {
  sm: container.sm, // 640px
  md: container.md, // 768px
  lg: container.lg, // 1024px
  xl: container.xl, // 1280px
  '2xl': container['2xl'], // 1536px
  full: '100%',
} as const;

/**
 * Container component for max-width content wrapping
 *
 * @example
 * ```tsx
 * <Container maxWidth="xl">
 *   <h1>Page Content</h1>
 * </Container>
 *
 * <Container maxWidth="md" padding={8}>
 *   <p>Narrower container with more padding</p>
 * </Container>
 * ```
 */
export const Container = ({
  maxWidth = 'xl',
  padding = 6,
  children,
  className = '',
  style = {},
}: ContainerProps) => {
  const combinedStyle: CSSProperties = {
    maxWidth: maxWidthMap[maxWidth],
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: spacing[padding as SpacingKey],
    paddingRight: spacing[padding as SpacingKey],
    width: '100%',
    ...style,
  };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
};

Container.displayName = 'Container';
