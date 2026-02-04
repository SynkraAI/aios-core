import React from 'react'
import './Toolbar.css'

export interface ToolbarAction {
  /**
   * Unique identifier
   */
  id: string

  /**
   * Action label
   */
  label: string

  /**
   * Icon (emoji or SVG)
   */
  icon?: React.ReactNode

  /**
   * Action handler
   */
  onPress: () => void

  /**
   * Disabled state
   */
  disabled?: boolean
}

export interface ToolbarProps {
  /**
   * Toolbar actions (max 5 recommended)
   */
  actions: ToolbarAction[]

  /**
   * Position (top or bottom)
   */
  position?: 'top' | 'bottom'

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
 * iOS Toolbar Component
 *
 * Action bar with buttons:
 * - 44pt height
 * - Flexible spacing between buttons
 * - Icon + label or icon-only
 * - Top or bottom positioning
 * - Translucent background with blur
 *
 * @example
 * ```tsx
 * const actions = [
 *   { id: 'share', label: 'Share', icon: '↗️', onPress: share },
 *   { id: 'delete', label: 'Delete', icon: '🗑️', onPress: deleteItem }
 * ]
 * <Toolbar actions={actions} />
 * ```
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  actions,
  position = 'bottom',
  translucent = true,
  className = '',
}) => {
  return (
    <div
      className={`ios-toolbar ios-toolbar--${position} ${
        translucent ? 'ios-toolbar--translucent' : ''
      } ${className}`}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          className={`ios-toolbar__button ${
            action.disabled ? 'ios-toolbar__button--disabled' : ''
          }`}
          onClick={action.onPress}
          disabled={action.disabled}
          aria-label={action.label}
        >
          {action.icon && <span className="ios-toolbar__icon">{action.icon}</span>}
          <span className="ios-toolbar__label">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

Toolbar.displayName = 'Toolbar'
