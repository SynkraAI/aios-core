import React from 'react'
import './NavigationBar.css'

export interface NavigationBarProps {
  /**
   * Navigation bar title
   */
  title: string

  /**
   * Left button (usually back button)
   */
  leftButton?: {
    label: string
    icon?: React.ReactNode
    onPress: () => void
  }

  /**
   * Right button (action button)
   */
  rightButton?: {
    label: string
    icon?: React.ReactNode
    onPress: () => void
  }

  /**
   * Large title mode (iOS 11+)
   */
  largeTitle?: boolean

  /**
   * Translucent background with blur
   */
  translucent?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Navigation Bar Component
 *
 * Top navigation bar with:
 * - 44pt height (standard) or 96pt (large title)
 * - Safe area aware (notch support)
 * - Left/right buttons
 * - Translucent background with blur
 * - Large title support (iOS 11+)
 *
 * @example
 * ```tsx
 * <NavigationBar
 *   title="Settings"
 *   leftButton={{ label: 'Back', onPress: goBack }}
 *   rightButton={{ label: 'Done', onPress: save }}
 * />
 * ```
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  leftButton,
  rightButton,
  largeTitle = false,
  translucent = true,
  className = '',
}) => {
  return (
    <header
      className={`ios-navigation-bar ${
        largeTitle ? 'ios-navigation-bar--large' : ''
      } ${translucent ? 'ios-navigation-bar--translucent' : ''} ${className}`}
    >
      <div className="ios-navigation-bar__content">
        {/* Left Button */}
        {leftButton && (
          <button className="ios-navigation-bar__button ios-navigation-bar__button--left" onClick={leftButton.onPress}>
            {leftButton.icon && <span className="ios-navigation-bar__button-icon">{leftButton.icon}</span>}
            <span>{leftButton.label}</span>
          </button>
        )}

        {/* Title */}
        {!largeTitle && <h1 className="ios-navigation-bar__title">{title}</h1>}

        {/* Right Button */}
        {rightButton && (
          <button className="ios-navigation-bar__button ios-navigation-bar__button--right" onClick={rightButton.onPress}>
            {rightButton.icon && <span className="ios-navigation-bar__button-icon">{rightButton.icon}</span>}
            <span>{rightButton.label}</span>
          </button>
        )}
      </div>

      {/* Large Title */}
      {largeTitle && (
        <div className="ios-navigation-bar__large-title">
          <h1>{title}</h1>
        </div>
      )}
    </header>
  )
}

NavigationBar.displayName = 'NavigationBar'
