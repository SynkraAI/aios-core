import React from 'react'
import './SegmentedControl.css'

export interface SegmentedControlOption {
  /**
   * Unique identifier
   */
  id: string

  /**
   * Segment label
   */
  label: string

  /**
   * Icon (optional)
   */
  icon?: React.ReactNode
}

export interface SegmentedControlProps {
  /**
   * Segment options (2-5 segments recommended)
   */
  options: SegmentedControlOption[]

  /**
   * Currently selected segment ID
   */
  selectedId: string

  /**
   * Selection change handler
   */
  onChange: (segmentId: string) => void

  /**
   * Full width (stretch to container)
   */
  fullWidth?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Segmented Control Component
 *
 * Tab-like switcher with:
 * - 2-5 segments (recommended)
 * - Smooth sliding indicator
 * - 32pt height
 * - Rounded 9pt corners
 * - Gray background with white selected state
 *
 * @example
 * ```tsx
 * const options = [
 *   { id: 'all', label: 'All' },
 *   { id: 'active', label: 'Active' },
 *   { id: 'done', label: 'Done' }
 * ]
 * <SegmentedControl
 *   options={options}
 *   selectedId="all"
 *   onChange={setSelected}
 * />
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedId,
  onChange,
  fullWidth = false,
  className = '',
}) => {
  const selectedIndex = options.findIndex((opt) => opt.id === selectedId)

  return (
    <div
      className={`ios-segmented-control ${
        fullWidth ? 'ios-segmented-control--full-width' : ''
      } ${className}`}
      role="tablist"
      style={
        {
          '--segment-count': options.length,
          '--selected-index': selectedIndex,
        } as React.CSSProperties
      }
    >
      <div className="ios-segmented-control__background" />
      <div className="ios-segmented-control__indicator" />

      {options.map((option) => (
        <button
          key={option.id}
          className={`ios-segmented-control__segment ${
            selectedId === option.id ? 'ios-segmented-control__segment--selected' : ''
          }`}
          onClick={() => onChange(option.id)}
          role="tab"
          aria-selected={selectedId === option.id}
        >
          {option.icon && <span className="ios-segmented-control__icon">{option.icon}</span>}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

SegmentedControl.displayName = 'SegmentedControl'
