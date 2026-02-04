/**
 * EcoFlow Design System - TopBar Component
 *
 * Horizontal header with search, notifications, and user profile
 */

import { CSSProperties, ReactNode, useState } from 'react';
import { colors } from '@/tokens/colors';
import { spacing } from '@/tokens/spacing';
import { typography } from '@/tokens/typography';
import { shadows } from '@/tokens/shadows';

export interface TopBarProps {
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Number of unread notifications */
  notifications?: number;
  /** Notification click handler */
  onNotificationsClick?: () => void;
  /** User information */
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  /** User menu click handler */
  onUserClick?: () => void;
  /** Additional content (left side) */
  leftContent?: ReactNode;
  /** Additional content (right side, before user) */
  rightContent?: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

/**
 * TopBar component for application header
 *
 * @example
 * ```tsx
 * <TopBar
 *   searchPlaceholder="Search projects..."
 *   onSearch={(query) => console.log(query)}
 *   notifications={3}
 *   user={{ name: 'John Doe', avatar: '/avatar.jpg' }}
 *   onUserClick={() => navigate('/profile')}
 * />
 * ```
 */
export const TopBar = ({
  searchPlaceholder = 'Search...',
  onSearch,
  notifications = 0,
  onNotificationsClick,
  user,
  onUserClick,
  leftContent,
  rightContent,
  className = '',
  style = {},
}: TopBarProps) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const topBarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    padding: `${spacing[3]} ${spacing[6]}`,
    background: colors.neutral.white,
    borderBottom: `1px solid ${colors.neutral[200]}`,
    height: '64px',
    boxShadow: shadows.boxShadow.sm,
    ...style,
  };

  const searchContainerStyle: CSSProperties = {
    flex: 1,
    maxWidth: '400px',
    position: 'relative',
  };

  const searchInputStyle: CSSProperties = {
    width: '100%',
    padding: `${spacing[2]} ${spacing[3]}`,
    paddingLeft: spacing[10],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: spacing[1],
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const searchIconStyle: CSSProperties = {
    position: 'absolute',
    left: spacing[3],
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.neutral[400],
    pointerEvents: 'none',
  };

  const rightSectionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    marginLeft: 'auto',
  };

  const notificationButtonStyle: CSSProperties = {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing[2],
    borderRadius: spacing[1],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s ease',
  };

  const badgeStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    background: colors.semantic.error.DEFAULT,
    color: colors.neutral.white,
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const userButtonStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing[2],
    borderRadius: spacing[1],
    transition: 'background 0.2s ease',
  };

  const avatarStyle: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colors.primary[500],
    color: colors.neutral.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  };

  const userInfoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  };

  const userNameStyle: CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[900],
    lineHeight: 1.2,
  };

  const userRoleStyle: CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[500],
    lineHeight: 1.2,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={className} style={topBarStyle}>
      {leftContent}

      <div style={searchContainerStyle}>
        <span style={searchIconStyle}>🔍</span>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={handleSearchChange}
          style={searchInputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary[500];
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.neutral[300];
          }}
        />
      </div>

      <div style={rightSectionStyle}>
        {rightContent}

        {onNotificationsClick && (
          <button
            style={notificationButtonStyle}
            onClick={onNotificationsClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label={`Notifications${notifications > 0 ? ` (${notifications})` : ''}`}
          >
            <span style={{ fontSize: '20px' }}>🔔</span>
            {notifications > 0 && <span style={badgeStyle}>{notifications}</span>}
          </button>
        )}

        {user && (
          <button
            style={userButtonStyle}
            onClick={onUserClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.neutral[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="User menu"
          >
            <div style={avatarStyle}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div style={userInfoStyle}>
              <span style={userNameStyle}>{user.name}</span>
              {user.role && <span style={userRoleStyle}>{user.role}</span>}
            </div>
          </button>
        )}
      </div>
    </header>
  );
};

TopBar.displayName = 'TopBar';
