import React, { useEffect, useRef } from 'react'
import './ActionSheet.css'

export interface ActionSheetAction {
  id: string
  label: string
  icon?: React.ReactNode
  destructive?: boolean
  disabled?: boolean
  onPress: () => void
}

export interface ActionSheetProps {
  /**
   * Whether the action sheet is visible
   */
  visible: boolean

  /**
   * Title of the action sheet
   */
  title?: string

  /**
   * Message/description
   */
  message?: string

  /**
   * List of actions
   */
  actions: ActionSheetAction[]

  /**
   * Cancel button label
   */
  cancelLabel?: string

  /**
   * Callback when action sheet is dismissed
   */
  onDismiss: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS ActionSheet Component
 *
 * Modal action picker with:
 * - Title and message
 * - Multiple action buttons
 * - Destructive action styling
 * - Separate cancel button
 * - Backdrop dismiss
 * - Spring animations
 * - Safe area support
 *
 * @example
 * ```tsx
 * <ActionSheet
 *   visible={showSheet}
 *   title="Choose an option"
 *   actions={[
 *     { id: '1', label: 'Edit', onPress: () => {} },
 *     { id: '2', label: 'Delete', destructive: true, onPress: () => {} },
 *   ]}
 *   onDismiss={() => setShowSheet(false)}
 * />
 * ```
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  title,
  message,
  actions,
  cancelLabel = 'Cancel',
  onDismiss,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) {
      // Prevent body scroll when action sheet is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onDismiss()
    }
  }

  const handleActionPress = (action: ActionSheetAction) => {
    if (!action.disabled) {
      action.onPress()
      onDismiss()
    }
  }

  if (!visible) {
    return null
  }

  return (
    <div
      className={`ios-action-sheet-backdrop ${className}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className="ios-action-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'action-sheet-title' : undefined}
      >
        {(title || message) && (
          <div className="ios-action-sheet__header">
            {title && (
              <div id="action-sheet-title" className="ios-action-sheet__title">
                {title}
              </div>
            )}
            {message && <div className="ios-action-sheet__message">{message}</div>}
          </div>
        )}

        <div className="ios-action-sheet__actions">
          {actions.map((action) => (
            <button
              key={action.id}
              className={[
                'ios-action-sheet__action',
                action.destructive ? 'ios-action-sheet__action--destructive' : '',
                action.disabled ? 'ios-action-sheet__action--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleActionPress(action)}
              disabled={action.disabled}
              type="button"
            >
              {action.icon && <span className="ios-action-sheet__action-icon">{action.icon}</span>}
              <span className="ios-action-sheet__action-label">{action.label}</span>
            </button>
          ))}
        </div>

        <button
          className="ios-action-sheet__cancel"
          onClick={onDismiss}
          type="button"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}

ActionSheet.displayName = 'ActionSheet'
