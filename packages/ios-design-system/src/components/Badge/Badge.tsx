import React from 'react'
import './Badge.css'

export interface BadgeProps {
  /**
   * Badge count or label
   */
  value: number | string

  /**
   * Badge color variant
   */
  variant?: 'red' | 'gray' | 'blue' | 'green' | 'orange' | 'purple'

  /**
   * Badge size
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Badge Component
 *
 * Notification badge with:
 * - Number or text
 * - Color variants (red, gray, blue, green, orange, purple)
 * - Sizes (small, medium, large)
 * - Shows "99+" for values > 99
 * - Circular for single digit, pill for 2+
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <Badge value={3} variant="red" />
 * <Badge value={127} variant="blue" />
 * <Badge value="New" variant="green" />
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  value,
  variant = 'red',
  size = 'medium',
  className = '',
}) => {
  const displayValue = typeof value === 'number' && value > 99 ? '99+' : value

  return (
    <span
      className={`ios-badge ios-badge--${variant} ios-badge--${size} ${className}`}
    >
      {displayValue}
    </span>
  )
}

Badge.displayName = 'Badge'
