import React from 'react'
import './ListItem.css'

export interface ListItemProps {
  /**
   * Item label (primary text)
   */
  label: string

  /**
   * Leading icon (emoji or SVG)
   */
  icon?: React.ReactNode

  /**
   * Icon background color
   */
  iconBackground?: string

  /**
   * Detail text (secondary text below label)
   */
  detail?: string

  /**
   * Value text (right-aligned gray text)
   */
  value?: string

  /**
   * Accessory type
   */
  accessory?: 'none' | 'chevron' | 'disclosure' | 'checkmark' | 'info'

  /**
   * Badge count
   */
  badge?: number

  /**
   * Toggle switch
   */
  toggle?: {
    value: boolean
    onChange: (value: boolean) => void
  }

  /**
   * Click handler
   */
  onPress?: () => void

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS List Item Component
 *
 * List item with:
 * - Icon (optional, with colored background)
 * - Label + detail text
 * - Value text (right-aligned)
 * - Accessories (chevron, checkmark, info, disclosure)
 * - Toggle switch support
 * - Badge support
 * - 44pt minimum tap target
 *
 * @example
 * ```tsx
 * <ListItem
 *   label="Settings"
 *   icon="⚙️"
 *   iconBackground="#007AFF"
 *   accessory="chevron"
 *   onPress={() => navigate('/settings')}
 * />
 * ```
 */
export const ListItem: React.FC<ListItemProps> = ({
  label,
  icon,
  iconBackground,
  detail,
  value,
  accessory = 'none',
  badge,
  toggle,
  onPress,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled && onPress) {
      onPress()
    }
  }

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (toggle && !disabled) {
      e.stopPropagation()
      toggle.onChange(e.target.checked)
    }
  }

  const accessorySymbols = {
    none: null,
    chevron: '›',
    disclosure: 'ⓘ',
    checkmark: '✓',
    info: 'ⓘ',
  }

  return (
    <div
      className={`ios-list-item ${disabled ? 'ios-list-item--disabled' : ''} ${
        onPress ? 'ios-list-item--clickable' : ''
      } ${className}`}
      onClick={handleClick}
      role={onPress ? 'button' : undefined}
      aria-disabled={disabled}
    >
      {/* Leading Icon */}
      {icon && (
        <div
          className="ios-list-item__icon"
          style={
            iconBackground
              ? ({ backgroundColor: iconBackground } as React.CSSProperties)
              : undefined
          }
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="ios-list-item__content">
        <div className="ios-list-item__label-container">
          <span className="ios-list-item__label">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ios-list-item__badge">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        {detail && <span className="ios-list-item__detail">{detail}</span>}
      </div>

      {/* Value */}
      {value && !toggle && <span className="ios-list-item__value">{value}</span>}

      {/* Toggle Switch */}
      {toggle && (
        <label className="ios-list-item__toggle" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={toggle.value}
            onChange={handleToggleChange}
            disabled={disabled}
            className="ios-list-item__toggle-input"
          />
          <span className="ios-list-item__toggle-slider" />
        </label>
      )}

      {/* Accessory */}
      {accessory !== 'none' && !toggle && (
        <span className={`ios-list-item__accessory ios-list-item__accessory--${accessory}`}>
          {accessorySymbols[accessory]}
        </span>
      )}
    </div>
  )
}

ListItem.displayName = 'ListItem'
