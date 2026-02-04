import React, { useState, useRef, InputHTMLAttributes } from 'react'
import './TextField.css'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  /**
   * Label text (optional)
   */
  label?: string

  /**
   * Placeholder text
   */
  placeholder: string

  /**
   * Current value
   */
  value: string

  /**
   * Change handler
   */
  onChange: (value: string) => void

  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search'

  /**
   * Leading icon (left side)
   */
  leadingIcon?: React.ReactNode

  /**
   * Show clear button when text is entered
   */
  clearButton?: boolean

  /**
   * Error message (shows error state)
   */
  error?: string

  /**
   * Disabled state
   */
  disabled?: boolean

  /**
   * Auto focus on mount
   */
  autoFocus?: boolean

  /**
   * Maximum character length
   */
  maxLength?: number
}

/**
 * iOS TextField Component
 *
 * Single-line text input with iOS-native styling:
 * - Floating label animation
 * - Clear button (⊗) when text entered
 * - Leading icon support
 * - Error state with message
 * - Filled or underlined style
 *
 * @example
 * ```tsx
 * <TextField
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={setEmail}
 *   type="email"
 * />
 * ```
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      leadingIcon,
      clearButton = true,
      error,
      disabled = false,
      autoFocus = false,
      maxLength,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const hasValue = value.length > 0
    const showClearButton = clearButton && hasValue && !disabled

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    }

    const handleClear = () => {
      onChange('')
      inputRef.current?.focus()
    }

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    return (
      <div className={`ios-textfield ${error ? 'ios-textfield--error' : ''} ${className}`}>
        <div
          className={`ios-textfield__container ${isFocused ? 'ios-textfield__container--focused' : ''} ${
            disabled ? 'ios-textfield__container--disabled' : ''
          }`}
        >
          {leadingIcon && <div className="ios-textfield__leading-icon">{leadingIcon}</div>}

          <div className="ios-textfield__input-wrapper">
            {label && (
              <label
                className={`ios-textfield__label ${
                  isFocused || hasValue ? 'ios-textfield__label--floating' : ''
                }`}
              >
                {label}
              </label>
            )}

            <input
              ref={(node) => {
                inputRef.current = node
                if (typeof ref === 'function') {
                  ref(node)
                } else if (ref) {
                  ref.current = node
                }
              }}
              className="ios-textfield__input"
              type={type}
              placeholder={isFocused || !label ? placeholder : ''}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              autoFocus={autoFocus}
              maxLength={maxLength}
              {...rest}
            />
          </div>

          {showClearButton && (
            <button
              type="button"
              className="ios-textfield__clear-button"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear text"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.3" />
                <path
                  d="M5 5L11 11M11 5L5 11"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {error && <div className="ios-textfield__error-message">{error}</div>}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
