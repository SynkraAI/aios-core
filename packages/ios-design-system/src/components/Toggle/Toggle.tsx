import React, { InputHTMLAttributes } from 'react'
import './Toggle.css'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /**
   * Toggle state (on/off)
   */
  value: boolean

  /**
   * Change handler
   */
  onChange: (value: boolean) => void

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Custom tint color when on (default: systemGreen #34C759)
   */
  tintColor?: string
}

/**
 * iOS Toggle (Switch) Component
 *
 * Native iOS on/off switch with:
 * - Fixed size (51pt × 31pt)
 * - Spring animation
 * - Green when on (customizable)
 * - Gray when off
 * - White thumb with shadow
 *
 * @example
 * ```tsx
 * <Toggle value={enabled} onChange={setEnabled} />
 * ```
 */
export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      tintColor = '#34C759',
      className = '',
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange(e.target.checked)
      }
    }

    return (
      <label
        className={`ios-toggle ${value ? 'ios-toggle--on' : 'ios-toggle--off'} ${
          disabled ? 'ios-toggle--disabled' : ''
        } ${className}`}
        style={
          {
            '--toggle-tint-color': tintColor,
          } as React.CSSProperties
        }
      >
        <input
          ref={ref}
          type="checkbox"
          className="ios-toggle__input"
          checked={value}
          onChange={handleChange}
          disabled={disabled}
          {...rest}
        />
        <span className="ios-toggle__track">
          <span className="ios-toggle__thumb" />
        </span>
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'
