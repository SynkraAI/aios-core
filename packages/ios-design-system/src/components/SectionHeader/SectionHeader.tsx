import React from 'react'
import './SectionHeader.css'

export interface SectionHeaderProps {
  /**
   * Header title
   */
  title: string

  /**
   * Action button (optional)
   */
  action?: {
    label: string
    onPress: () => void
  }

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Section Header Component
 *
 * Section header for grouped lists with:
 * - Uppercase title (13pt font)
 * - Gray color (systemGray)
 * - Optional action button (right-aligned)
 * - Padding consistent with iOS HIG
 *
 * @example
 * ```tsx
 * <SectionHeader title="Settings" />
 * <List>
 *   <ListItem label="General" />
 * </List>
 *
 * <SectionHeader
 *   title="Favorites"
 *   action={{ label: 'See All', onPress: () => navigate('/favorites') }}
 * />
 * ```
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  className = '',
}) => {
  return (
    <div className={`ios-section-header ${className}`}>
      <h3 className="ios-section-header__title">{title}</h3>
      {action && (
        <button className="ios-section-header__action" onClick={action.onPress}>
          {action.label}
        </button>
      )}
    </div>
  )
}

SectionHeader.displayName = 'SectionHeader'
