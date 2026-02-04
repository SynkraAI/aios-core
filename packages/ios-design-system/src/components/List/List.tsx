import React from 'react'
import './List.css'

export interface ListProps {
  /**
   * List items (children)
   */
  children: React.ReactNode

  /**
   * List style (grouped or inset)
   */
  style?: 'grouped' | 'inset'

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS List Component
 *
 * Container for list items with:
 * - Grouped style (default, full width with rounded corners)
 * - Inset style (inset from edges, iOS 7+)
 * - Automatic separators between items
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <List>
 *   <ListItem label="Settings" icon="⚙️" onPress={() => {}} />
 *   <ListItem label="Privacy" icon="🔒" onPress={() => {}} />
 * </List>
 * ```
 */
export const List: React.FC<ListProps> = ({
  children,
  style = 'grouped',
  className = '',
}) => {
  return (
    <div className={`ios-list ios-list--${style} ${className}`}>
      {children}
    </div>
  )
}

List.displayName = 'List'
