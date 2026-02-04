import React from 'react'
import './TabBar.css'

export interface TabBarItem {
  /**
   * Unique identifier
   */
  id: string

  /**
   * Tab label
   */
  label: string

  /**
   * Icon (emoji or SVG)
   */
  icon: React.ReactNode

  /**
   * Badge count (optional)
   */
  badge?: number
}

export interface TabBarProps {
  /**
   * Tab items (max 5)
   */
  items: TabBarItem[]

  /**
   * Currently active tab ID
   */
  activeTab: string

  /**
   * Tab change handler
   */
  onChange: (tabId: string) => void

  /**
   * Custom tint color for active tab (default: systemBlue #007AFF)
   */
  tintColor?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * iOS Tab Bar Component
 *
 * Bottom navigation with up to 5 tabs:
 * - 49pt height (safe area aware)
 * - Icon + label layout
 * - Badge support
 * - Blue tint color (customizable)
 * - Translucent background with blur
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'home', label: 'Home', icon: '🏠' },
 *   { id: 'search', label: 'Search', icon: '🔍' },
 *   { id: 'profile', label: 'Profile', icon: '👤', badge: 3 }
 * ]
 * <TabBar items={tabs} activeTab="home" onChange={setActiveTab} />
 * ```
 */
export const TabBar: React.FC<TabBarProps> = ({
  items,
  activeTab,
  onChange,
  tintColor = '#007AFF',
  className = '',
}) => {
  if (items.length > 5) {
    console.warn('TabBar: iOS guidelines recommend maximum 5 tabs')
  }

  return (
    <nav
      className={`ios-tab-bar ${className}`}
      style={
        {
          '--tab-tint-color': tintColor,
        } as React.CSSProperties
      }
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`ios-tab-bar__item ${
            activeTab === item.id ? 'ios-tab-bar__item--active' : ''
          }`}
          onClick={() => onChange(item.id)}
          aria-label={item.label}
          aria-current={activeTab === item.id ? 'page' : undefined}
        >
          <span className="ios-tab-bar__icon">
            {item.icon}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ios-tab-bar__badge">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </span>
          <span className="ios-tab-bar__label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

TabBar.displayName = 'TabBar'
