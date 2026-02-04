import React from 'react'
import './Card.css'

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode

  /**
   * Card title (optional)
   */
  title?: string

  /**
   * Card subtitle (optional)
   */
  subtitle?: string

  /**
   * Leading image/icon
   */
  image?: React.ReactNode

  /**
   * Trailing accessory
   */
  accessory?: React.ReactNode

  /**
   * Click handler
   */
  onPress?: () => void

  /**
   * Card variant
   */
  variant?: 'default' | 'elevated' | 'filled'

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Card Component
 *
 * Card container with:
 * - Default (bordered)
 * - Elevated (shadow)
 * - Filled (background color)
 * - Optional title/subtitle
 * - Image support
 * - Accessory support
 * - 10pt border radius
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <Card
 *   title="Welcome"
 *   subtitle="Get started with our app"
 *   variant="elevated"
 *   onPress={() => navigate('/onboarding')}
 * >
 *   <p>Card content here</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  image,
  accessory,
  onPress,
  variant = 'default',
  className = '',
}) => {
  const hasHeader = title || subtitle || image || accessory

  return (
    <div
      className={`ios-card ios-card--${variant} ${
        onPress ? 'ios-card--clickable' : ''
      } ${className}`}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
    >
      {hasHeader && (
        <div className="ios-card__header">
          {image && <div className="ios-card__image">{image}</div>}
          {(title || subtitle) && (
            <div className="ios-card__header-content">
              {title && <h3 className="ios-card__title">{title}</h3>}
              {subtitle && <p className="ios-card__subtitle">{subtitle}</p>}
            </div>
          )}
          {accessory && <div className="ios-card__accessory">{accessory}</div>}
        </div>
      )}
      <div className="ios-card__content">{children}</div>
    </div>
  )
}

Card.displayName = 'Card'
