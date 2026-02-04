import React, { InputHTMLAttributes } from 'react'
import './Slider.css'

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /**
   * Current value (0-100 or custom min/max)
   */
  value: number

  /**
   * Minimum value (default: 0)
   */
  min?: number

  /**
   * Maximum value (default: 100)
   */
  max?: number

  /**
   * Step increment (default: 1)
   */
  step?: number

  /**
   * Change handler
   */
  onChange: (value: number) => void

  /**
   * Custom tint color for filled track (default: systemBlue #007AFF)
   */
  tintColor?: string

  /**
   * Disabled state
   */
  disabled?: boolean
}

/**
 * iOS Slider Component
 *
 * Horizontal slider for value selection with:
 * - 44pt tap target height
 * - 2pt track
 * - 28pt circular thumb
 * - Blue filled track (customizable)
 * - Gray empty track
 *
 * @example
 * ```tsx
 * <Slider value={volume} onChange={setVolume} min={0} max={100} />
 * ```
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      tintColor = '#007AFF',
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange(parseFloat(e.target.value))
      }
    }

    return (
      <div
        className={`ios-slider ${disabled ? 'ios-slider--disabled' : ''} ${className}`}
        style={
          {
            '--slider-percentage': `${percentage}%`,
            '--slider-tint-color': tintColor,
          } as React.CSSProperties
        }
      >
        <input
          ref={ref}
          type="range"
          className="ios-slider__input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          {...rest}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
