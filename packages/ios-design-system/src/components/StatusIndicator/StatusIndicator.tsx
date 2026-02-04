import React from 'react'
import './StatusIndicator.css'

export interface StatusIndicatorProps {
  /**
   * Status type
   */
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd'

  /**
   * Size of the indicator
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Show pulse animation for online status
   */
  pulse?: boolean

  /**
   * Custom label text (optional)
   */
  label?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS StatusIndicator Component
 *
 * Status indicator with:
 * - Multiple status types (online, offline, away, busy, dnd)
 * - Sizes (small 8px, medium 12px, large 16px)
 * - Pulse animation for online status
 * - Optional text label
 * - iOS system colors
 *
 * @example
 * ```tsx
 * <StatusIndicator status="online" pulse />
 * <StatusIndicator status="busy" label="In a meeting" />
 * <StatusIndicator status="away" size="large" />
 * ```
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  pulse = false,
  label,
  className = '',
}) => {
  const indicatorClasses = [
    'ios-status-indicator',
    `ios-status-indicator--${status}`,
    `ios-status-indicator--${size}`,
    pulse && status === 'online' ? 'ios-status-indicator--pulse' : '',
    label ? 'ios-status-indicator--with-label' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={indicatorClasses}>
      <span className="ios-status-indicator__dot" />
      {label && <span className="ios-status-indicator__label">{label}</span>}
    </div>
  )
}

StatusIndicator.displayName = 'StatusIndicator'
