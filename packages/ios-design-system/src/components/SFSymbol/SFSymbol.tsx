import React from 'react'
import './SFSymbol.css'

export interface SFSymbolProps {
  /**
   * Symbol name or emoji fallback
   */
  name: string

  /**
   * Symbol size
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'

  /**
   * Symbol weight
   */
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black'

  /**
   * Symbol color
   */
  color?: string

  /**
   * Rendering mode
   */
  renderingMode?: 'monochrome' | 'multicolor' | 'hierarchical'

  /**
   * Accessibility label
   */
  accessibilityLabel?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Click handler
   */
  onClick?: () => void
}

/**
 * iOS SFSymbol Component
 *
 * SF Symbols-inspired icon component with:
 * - Multiple sizes (small 14pt → xxlarge 34pt)
 * - Multiple weights (ultralight → black)
 * - Rendering modes (monochrome, multicolor, hierarchical)
 * - Custom colors
 * - Emoji fallback for web
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <SFSymbol name="⭐️" size="medium" />
 * <SFSymbol name="❤️" size="large" color="#FF3B30" />
 * <SFSymbol name="🔔" size="small" renderingMode="hierarchical" />
 * ```
 */
export const SFSymbol: React.FC<SFSymbolProps> = ({
  name,
  size = 'medium',
  weight = 'regular',
  color,
  renderingMode = 'monochrome',
  accessibilityLabel,
  className = '',
  onClick,
}) => {
  const symbolClasses = [
    'ios-sf-symbol',
    `ios-sf-symbol--${size}`,
    `ios-sf-symbol--${weight}`,
    `ios-sf-symbol--${renderingMode}`,
    onClick ? 'ios-sf-symbol--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const symbolStyle: React.CSSProperties = color
    ? { color }
    : {}

  return (
    <span
      className={symbolClasses}
      style={symbolStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={accessibilityLabel || name}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {name}
    </span>
  )
}

SFSymbol.displayName = 'SFSymbol'
