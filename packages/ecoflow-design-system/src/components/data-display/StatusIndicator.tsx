import { HTMLAttributes, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';

export interface StatusIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  status: 'online' | 'offline' | 'busy' | 'away';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusIndicator = ({
  status,
  label,
  size = 'md',
  showLabel = false,
  className = '',
  style,
  ...props
}: StatusIndicatorProps) => {
  // Size styles
  const sizeMap = {
    sm: { dotSize: '8px', fontSize: typography.fontSize.xs },
    md: { dotSize: '10px', fontSize: typography.fontSize.sm },
    lg: { dotSize: '12px', fontSize: typography.fontSize.base },
  };

  // Status colors and labels
  const statusConfig = {
    online: {
      color: colors.semantic.success.DEFAULT,
      label: label || 'Online',
    },
    offline: {
      color: colors.neutral[400],
      label: label || 'Offline',
    },
    busy: {
      color: colors.semantic.error.DEFAULT,
      label: label || 'Busy',
    },
    away: {
      color: colors.semantic.warning.DEFAULT,
      label: label || 'Away',
    },
  };

  const config = statusConfig[status];

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing[6],
    ...style,
  };

  const dotStyle: CSSProperties = {
    width: sizeMap[size].dotSize,
    height: sizeMap[size].dotSize,
    borderRadius: borders.borderRadius.full,
    backgroundColor: config.color,
    flexShrink: 0,
  };

  const labelStyle: CSSProperties = {
    fontFamily: typography.fontFamily.sans,
    fontSize: sizeMap[size].fontSize,
    color: colors.neutral[700],
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      role="status"
      aria-label={`Status: ${config.label}`}
      {...props}
    >
      <span style={dotStyle} aria-hidden="true" />
      {showLabel && <span style={labelStyle}>{config.label}</span>}
    </div>
  );
};
