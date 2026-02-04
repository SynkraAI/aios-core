import React, { ButtonHTMLAttributes } from 'react'
import './Button.css'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * Button visual variant following iOS styles
   * - filled: Primary actions (Save, Submit, Sign In)
   * - tinted: Secondary actions in colored context
   * - gray: Secondary actions (Cancel, Dismiss)
   * - plain: Tertiary actions, navigation links
   * - borderless: In-line actions, list actions
   */
  variant?: 'filled' | 'tinted' | 'gray' | 'plain' | 'borderless'

  /**
   * Button size
   * - small: 36pt height
   * - standard: 44pt height (default, matches iOS tap target)
   * - large: 50pt height
   */
  size?: 'small' | 'standard' | 'large'

  /**
   * Make button full width of container
   */
  fullWidth?: boolean

  /**
   * Disabled state (opacity: 0.4)
   */
  disabled?: boolean

  /**
   * Show ActivityIndicator (loading spinner)
   */
  loading?: boolean

  /**
   * SF Symbol icon on the left
   */
  leftIcon?: React.ReactNode

  /**
   * SF Symbol icon on the right
   */
  rightIcon?: React.ReactNode

  /**
   * Click handler
   */
  onPress?: () => void

  /**
   * Button label
   */
  children: React.ReactNode
}

/**
 * iOS Button Component
 *
 * Primary action button with 5 iOS-native variants:
 * - Filled: Primary actions with system blue background
 * - Tinted: Secondary actions with tinted background
 * - Gray: Secondary actions with gray fill
 * - Plain: Tertiary actions, transparent
 * - Borderless: In-line actions
 *
 * @example
 * ```tsx
 * <Button variant="filled" onPress={() => alert('Saved')}>
 *   Save
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'standard',
      fullWidth = false,
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      onPress,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onPress) {
        onPress()
      }
      rest.onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={`ios-button ios-button--${variant} ios-button--${size} ${
          fullWidth ? 'ios-button--full-width' : ''
        } ${disabled ? 'ios-button--disabled' : ''} ${loading ? 'ios-button--loading' : ''} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        {...rest}
      >
        {loading && (
          <span className="ios-button__spinner" aria-label="Loading">
            <svg
              className="ios-button__spinner-icon"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="50.265"
                strokeDashoffset="12.566"
              />
            </svg>
          </span>
        )}
        {!loading && leftIcon && <span className="ios-button__icon ios-button__icon--left">{leftIcon}</span>}
        <span className="ios-button__label">{children}</span>
        {!loading && rightIcon && <span className="ios-button__icon ios-button__icon--right">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
