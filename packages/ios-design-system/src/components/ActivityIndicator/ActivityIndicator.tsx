import React from 'react'
import './ActivityIndicator.css'

export interface ActivityIndicatorProps {
  /**
   * Size of the indicator
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Color of the indicator
   */
  color?: string

  /**
   * Whether the indicator is animating
   */
  animating?: boolean

  /**
   * Accessibility label
   */
  accessibilityLabel?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS ActivityIndicator Component
 *
 * Loading spinner with:
 * - Multiple sizes (small 20px, medium 30px, large 44px)
 * - Custom colors
 * - Smooth rotation animation
 * - iOS-style spinner design
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ActivityIndicator size="medium" />
 * <ActivityIndicator size="large" color="#007AFF" />
 * <ActivityIndicator size="small" animating={isLoading} />
 * ```
 */
export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  size = 'medium',
  color,
  animating = true,
  accessibilityLabel = 'Loading',
  className = '',
}) => {
  const indicatorClasses = [
    'ios-activity-indicator',
    `ios-activity-indicator--${size}`,
    animating ? 'ios-activity-indicator--animating' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const indicatorStyle: React.CSSProperties = color
    ? { borderTopColor: color, borderRightColor: color }
    : {}

  return (
    <div
      className={indicatorClasses}
      style={indicatorStyle}
      role="status"
      aria-label={accessibilityLabel}
      aria-live="polite"
      aria-busy={animating}
    />
  )
}

ActivityIndicator.displayName = 'ActivityIndicator'
