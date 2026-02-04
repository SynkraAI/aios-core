/**
 * EcoFlow Design System - Tabs Component
 *
 * Horizontal tab navigation with active state indicator
 */

import { CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { spacing } from '@/tokens/spacing';
import { typography } from '@/tokens/typography';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab items */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Tab change handler */
  onChange: (tabId: string) => void;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Tabs component for horizontal tab navigation
 *
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'overview', label: 'Overview' },
 *     { id: 'activity', label: 'Activity' },
 *     { id: 'settings', label: 'Settings' },
 *   ]}
 *   activeTab="overview"
 *   onChange={(tabId) => setActiveTab(tabId)}
 * />
 * ```
 */
export const Tabs = ({ tabs, activeTab, onChange, className = '', style = {} }: TabsProps) => {
  const tabsContainerStyle: CSSProperties = {
    display: 'flex',
    borderBottom: `2px solid ${colors.neutral[200]}`,
    gap: spacing[8],
    ...style,
  };

  const getTabStyle = (tab: Tab): CSSProperties => {
    const isActive = tab.id === activeTab;
    const isDisabled = tab.disabled;

    return {
      position: 'relative',
      padding: `${spacing[3]} ${spacing[1]}`,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.sans,
      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
      color: isDisabled
        ? colors.neutral[400]
        : isActive
          ? colors.primary[500]
          : colors.neutral[600],
      background: 'transparent',
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'color 0.2s ease',
      outline: 'none',
      whiteSpace: 'nowrap',
    };
  };

  const getUnderlineStyle = (isActive: boolean): CSSProperties => ({
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    background: isActive ? colors.primary[500] : 'transparent',
    transition: 'background 0.2s ease',
  });

  const handleTabClick = (tab: Tab) => {
    if (!tab.disabled && tab.id !== activeTab) {
      onChange(tab.id);
    }
  };

  return (
    <div className={className} style={tabsContainerStyle} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            tabIndex={tab.disabled ? -1 : 0}
            style={getTabStyle(tab)}
            onClick={() => handleTabClick(tab)}
            onMouseEnter={(e) => {
              if (!tab.disabled && tab.id !== activeTab) {
                e.currentTarget.style.color = colors.neutral[800];
              }
            }}
            onMouseLeave={(e) => {
              if (!tab.disabled && tab.id !== activeTab) {
                e.currentTarget.style.color = colors.neutral[600];
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab);
              }
              // Arrow key navigation
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const currentIndex = tabs.findIndex((t) => t.id === tab.id);
                const nextIndex =
                  e.key === 'ArrowLeft'
                    ? (currentIndex - 1 + tabs.length) % tabs.length
                    : (currentIndex + 1) % tabs.length;
                const nextTab = tabs[nextIndex];
                if (nextTab && !nextTab.disabled) {
                  onChange(nextTab.id);
                  // Focus the next tab
                  const nextButton = e.currentTarget.parentElement?.children[
                    nextIndex
                  ] as HTMLButtonElement;
                  nextButton?.focus();
                }
              }
            }}
          >
            {tab.label}
            <div style={getUnderlineStyle(isActive)} />
          </button>
        );
      })}
    </div>
  );
};

Tabs.displayName = 'Tabs';
