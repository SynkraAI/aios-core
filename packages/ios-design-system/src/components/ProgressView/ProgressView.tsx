import React from 'react'
import './ProgressView.css'

export interface ProgressViewProps {
  /**
   * Progress value (0-1)
   */
  progress: number

  /**
   * Style variant
   */
  variant?: 'default' | 'bar'

  /**
   * Progress bar color
   */
  progressColor?: string

  /**
   * Track color
   */
  trackColor?: string

  /**
   * Show percentage label
   */
  showLabel?: boolean

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
 * iOS ProgressView Component
 *
 * Progress bar with:
 * - Progress value (0-1)
 * - Two variants (default thin, bar thick)
 * - Custom colors
 * - Optional percentage label
 * - Smooth animations
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ProgressView progress={0.5} />
 * <ProgressView progress={0.75} variant="bar" showLabel />
 * <ProgressView progress={0.3} progressColor="#34C759" />
 * ```
 */
export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  variant = 'default',
  progressColor,
  trackColor,
  showLabel = false,
  accessibilityLabel,
  className = '',
}) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const percentage = Math.round(clampedProgress * 100)

  const progressClasses = [
    'ios-progress-view',
    `ios-progress-view--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const trackStyle: React.CSSProperties = trackColor
    ? { backgroundColor: trackColor }
    : {}

  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    ...(progressColor ? { backgroundColor: progressColor } : {}),
  }

  return (
    <div className={progressClasses}>
      <div
        className="ios-progress-view__track"
        style={trackStyle}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={accessibilityLabel || `${percentage}% complete`}
      >
        <div className="ios-progress-view__fill" style={fillStyle} />
      </div>
      {showLabel && (
        <div className="ios-progress-view__label">{percentage}%</div>
      )}
    </div>
  )
}

ProgressView.displayName = 'ProgressView'
