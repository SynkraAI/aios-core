/**
 * EcoFlow Design System - Spacer Component
 *
 * Simple spacing component for creating visual separation
 */

import { CSSProperties } from 'react';
import { spacing, SpacingKey } from '@/tokens/spacing';

export interface SpacerProps {
  /** Vertical spacing size (uses spacing scale) */
  size?: number;
  /** Horizontal mode (width instead of height) */
  horizontal?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Spacer component for creating empty space between elements
 *
 * @example
 * ```tsx
 * // Vertical spacer (default)
 * <div>
 *   <Text>First element</Text>
 *   <Spacer size={4} />
 *   <Text>Second element</Text>
 * </div>
 *
 * // Horizontal spacer
 * <div style={{ display: 'flex' }}>
 *   <Button>Left</Button>
 *   <Spacer size={6} horizontal />
 *   <Button>Right</Button>
 * </div>
 *
 * // Custom size
 * <Spacer size={12} />
 * ```
 */
export const Spacer = ({
  size = 4,
  horizontal = false,
  className = '',
  style = {},
}: SpacerProps) => {
  const combinedStyle: CSSProperties = {
    [horizontal ? 'width' : 'height']: spacing[size as SpacingKey],
    flexShrink: 0,
    ...style,
  };

  return <div className={className} style={combinedStyle} aria-hidden="true" />;
};

Spacer.displayName = 'Spacer';
