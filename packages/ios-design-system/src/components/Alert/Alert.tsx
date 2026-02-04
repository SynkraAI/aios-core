import React, { useEffect } from 'react'
import './Alert.css'

export interface AlertButton {
  id: string
  label: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress: () => void
}

export interface AlertProps {
  /**
   * Whether the alert is visible
   */
  visible: boolean

  /**
   * Alert title
   */
  title: string

  /**
   * Alert message
   */
  message?: string

  /**
   * Alert buttons (1-3 buttons recommended)
   */
  buttons: AlertButton[]

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Alert Component
 *
 * Modal alert dialog with:
 * - Title and message
 * - 1-3 buttons (default, cancel, destructive)
 * - Center screen positioning
 * - Backdrop blur
 * - Spring animations
 * - iOS-native button layout
 *
 * @example
 * ```tsx
 * <Alert
 *   visible={showAlert}
 *   title="Delete Item?"
 *   message="This action cannot be undone."
 *   buttons={[
 *     { id: '1', label: 'Cancel', style: 'cancel', onPress: () => {} },
 *     { id: '2', label: 'Delete', style: 'destructive', onPress: () => {} },
 *   ]}
 * />
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  buttons,
  onDismiss,
  className = '',
}) => {
  useEffect(() => {
    if (visible) {
      // Prevent body scroll when alert is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  const handleButtonPress = (button: AlertButton) => {
    button.onPress()
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!visible) {
    return null
  }

  // iOS alert layout changes based on number of buttons
  const buttonLayout = buttons.length === 2 ? 'horizontal' : 'vertical'

  return (
    <div
      className={`ios-alert-backdrop ${className}`}
      role="presentation"
    >
      <div
        className="ios-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby={message ? 'alert-message' : undefined}
      >
        <div className="ios-alert__content">
          <div id="alert-title" className="ios-alert__title">
            {title}
          </div>
          {message && (
            <div id="alert-message" className="ios-alert__message">
              {message}
            </div>
          )}
        </div>

        <div className={`ios-alert__buttons ios-alert__buttons--${buttonLayout}`}>
          {buttons.map((button) => (
            <button
              key={button.id}
              className={[
                'ios-alert__button',
                `ios-alert__button--${button.style || 'default'}`,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleButtonPress(button)}
              type="button"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

Alert.displayName = 'Alert'
