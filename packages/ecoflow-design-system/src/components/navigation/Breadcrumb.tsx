/**
 * EcoFlow Design System - Breadcrumb Component
 *
 * Hierarchical navigation breadcrumb trail
 */

import { CSSProperties, ReactNode } from 'react';
import { colors } from '@/tokens/colors';
import { spacing } from '@/tokens/spacing';
import { typography } from '@/tokens/typography';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator element (default: "/") */
  separator?: ReactNode;
  /** Item click handler */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Breadcrumb component for hierarchical navigation
 *
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Project Alpha' },
 *   ]}
 *   onItemClick={(item) => navigate(item.href)}
 * />
 * ```
 */
export const Breadcrumb = ({
  items,
  separator = '/',
  onItemClick,
  className = '',
  style = {},
}: BreadcrumbProps) => {
  const breadcrumbStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
    ...style,
  };

  const itemStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    color: colors.neutral[600],
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  };

  const linkStyle: CSSProperties = {
    ...itemStyle,
    cursor: 'pointer',
  };

  const currentItemStyle: CSSProperties = {
    ...itemStyle,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
    cursor: 'default',
  };

  const separatorStyle: CSSProperties = {
    color: colors.neutral[400],
    fontSize: typography.fontSize.sm,
    userSelect: 'none',
  };

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.href && onItemClick) {
      onItemClick(item, index);
    }
  };

  return (
    <nav
      className={className}
      style={breadcrumbStyle}
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = item.href && !isLast;

          return (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              {isClickable ? (
                <span
                  style={linkStyle}
                  onClick={() => handleItemClick(item, index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.primary[500];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.neutral[600];
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(item, index);
                    }
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <span style={currentItemStyle} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}

              {!isLast && <span style={separatorStyle}>{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
