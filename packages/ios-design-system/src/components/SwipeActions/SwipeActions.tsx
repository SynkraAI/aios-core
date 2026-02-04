import React, { useState, useRef, useEffect } from 'react'
import './SwipeActions.css'

export interface SwipeAction {
  /**
   * Action identifier
   */
  id: string

  /**
   * Action label
   */
  label: string

  /**
   * Action icon (optional)
   */
  icon?: React.ReactNode

  /**
   * Background color
   */
  backgroundColor: string

  /**
   * Action handler
   */
  onPress: () => void
}

export interface SwipeActionsProps {
  /**
   * Content (usually a ListItem)
   */
  children: React.ReactNode

  /**
   * Leading actions (left swipe)
   */
  leadingActions?: SwipeAction[]

  /**
   * Trailing actions (right swipe)
   */
  trailingActions?: SwipeAction[]

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Swipe Actions Component
 *
 * Swipeable wrapper with reveal actions:
 * - Left swipe (leading actions)
 * - Right swipe (trailing actions)
 * - Spring animation on release
 * - Auto-close after action
 *
 * @example
 * ```tsx
 * <SwipeActions
 *   trailingActions={[
 *     { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: handleDelete }
 *   ]}
 * >
 *   <ListItem label="Message" />
 * </SwipeActions>
 * ```
 */
export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  leadingActions = [],
  trailingActions = [],
  className = '',
}) => {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const leadingWidth = leadingActions.length * 80
  const trailingWidth = trailingActions.length * 80

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = offset
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const deltaX = e.touches[0].clientX - startX.current
    let newOffset = currentX.current + deltaX

    // Limit swipe distance
    if (newOffset > leadingWidth) newOffset = leadingWidth
    if (newOffset < -trailingWidth) newOffset = -trailingWidth

    setOffset(newOffset)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    // Snap to closed or fully open
    if (Math.abs(offset) < 40) {
      setOffset(0)
    } else if (offset > 0) {
      setOffset(leadingWidth)
    } else {
      setOffset(-trailingWidth)
    }
  }

  const handleActionPress = (action: SwipeAction) => {
    action.onPress()
    setOffset(0) // Close after action
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      setOffset(0)
    }
  }

  useEffect(() => {
    if (offset !== 0) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [offset])

  return (
    <div className={`ios-swipe-actions ${className}`}>
      {/* Leading Actions (left side) */}
      {leadingActions.length > 0 && (
        <div className="ios-swipe-actions__leading">
          {leadingActions.map((action) => (
            <button
              key={action.id}
              className="ios-swipe-actions__action"
              style={{ backgroundColor: action.backgroundColor }}
              onClick={() => handleActionPress(action)}
            >
              {action.icon && <span className="ios-swipe-actions__icon">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        ref={contentRef}
        className="ios-swipe-actions__content"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Trailing Actions (right side) */}
      {trailingActions.length > 0 && (
        <div className="ios-swipe-actions__trailing">
          {trailingActions.map((action) => (
            <button
              key={action.id}
              className="ios-swipe-actions__action"
              style={{ backgroundColor: action.backgroundColor }}
              onClick={() => handleActionPress(action)}
            >
              {action.icon && <span className="ios-swipe-actions__icon">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

SwipeActions.displayName = 'SwipeActions'
