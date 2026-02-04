/**
 * EcoFlow Design System - Sidebar Component
 *
 * Fixed left navigation panel with collapsible sections
 */

import { CSSProperties, ReactNode, useState } from 'react';
import { colors } from '@/tokens/colors';
import { spacing } from '@/tokens/spacing';
import { typography } from '@/tokens/typography';

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  badge?: number;
  children?: NavItem[];
}

export interface SidebarProps {
  /** Logo or brand element at top */
  logo?: ReactNode;
  /** Navigation items */
  items: NavItem[];
  /** Currently active item ID */
  activeItem?: string;
  /** Sidebar collapsed state */
  collapsed?: boolean;
  /** Width when expanded (default: 240px) */
  width?: string;
  /** Item click handler */
  onItemClick?: (id: string) => void;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * Sidebar navigation component with collapsible sections
 *
 * @example
 * ```tsx
 * <Sidebar
 *   logo={<img src="/logo.svg" alt="Logo" />}
 *   items={[
 *     { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
 *     { id: 'projects', label: 'Projects', icon: <ProjectsIcon /> },
 *   ]}
 *   activeItem="dashboard"
 *   onItemClick={(id) => navigate(id)}
 * />
 * ```
 */
export const Sidebar = ({
  logo,
  items,
  activeItem,
  collapsed = false,
  width = '240px',
  onItemClick,
  className = '',
  style = {},
}: SidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      toggleSection(item.id);
    } else {
      onItemClick?.(item.id);
    }
  };

  const sidebarStyle: CSSProperties = {
    width: collapsed ? '64px' : width,
    minHeight: '100vh',
    background: colors.primary[500],
    color: colors.neutral.white,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    overflowY: 'auto',
    ...style,
  };

  const logoStyle: CSSProperties = {
    padding: spacing[4],
    borderBottom: `1px solid ${colors.primary[600]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    minHeight: '64px',
  };

  const navStyle: CSSProperties = {
    flex: 1,
    padding: `${spacing[2]} 0`,
  };

  return (
    <aside className={className} style={sidebarStyle}>
      {logo && <div style={logoStyle}>{logo}</div>}
      <nav style={navStyle}>
        {items.map((item) => (
          <NavItemComponent
            key={item.id}
            item={item}
            active={activeItem === item.id}
            collapsed={collapsed}
            expanded={expandedSections.has(item.id)}
            onItemClick={() => handleItemClick(item)}
            onChildClick={onItemClick}
          />
        ))}
      </nav>
    </aside>
  );
};

interface NavItemComponentProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  expanded: boolean;
  onItemClick: () => void;
  onChildClick?: ((id: string) => void) | undefined;
  level?: number;
}

const NavItemComponent = ({
  item,
  active,
  collapsed,
  expanded,
  onItemClick,
  onChildClick,
  level = 0,
}: NavItemComponentProps) => {
  const itemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    padding: collapsed ? spacing[3] : `${spacing[3]} ${spacing[4]}`,
    paddingLeft: collapsed ? spacing[3] : `calc(${spacing[4]} + ${level * 16}px)`,
    cursor: 'pointer',
    background: active ? colors.primary[700] : 'transparent',
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.normal,
    transition: 'background 0.2s ease',
    textDecoration: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    position: 'relative',
  };

  const iconStyle: CSSProperties = {
    fontSize: '20px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyle: CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const badgeStyle: CSSProperties = {
    background: colors.accent.yellow[500],
    color: colors.neutral[900],
    borderRadius: spacing[4],
    padding: `${spacing[0.5]} ${spacing[2]}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    minWidth: '20px',
    textAlign: 'center',
  };

  const chevronStyle: CSSProperties = {
    fontSize: '16px',
    transition: 'transform 0.2s ease',
    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
  };

  return (
    <>
      <div
        style={itemStyle}
        onClick={onItemClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = active
            ? colors.primary[700]
            : colors.primary[600];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = active ? colors.primary[700] : 'transparent';
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onItemClick();
          }
        }}
      >
        {item.icon && <span style={iconStyle}>{item.icon}</span>}
        {!collapsed && (
          <>
            <span style={labelStyle}>{item.label}</span>
            {item.badge !== undefined && <span style={badgeStyle}>{item.badge}</span>}
            {item.children && <span style={chevronStyle}>›</span>}
          </>
        )}
      </div>
      {!collapsed && expanded && item.children && (
        <div>
          {item.children.map((child) => (
            <NavItemComponent
              key={child.id}
              item={child}
              active={false}
              collapsed={false}
              expanded={false}
              onItemClick={() => onChildClick?.(child.id)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
};

Sidebar.displayName = 'Sidebar';
