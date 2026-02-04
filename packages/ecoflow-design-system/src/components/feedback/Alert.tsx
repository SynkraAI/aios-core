import { HTMLAttributes, ReactNode, CSSProperties } from 'react';
import { colors } from '../../tokens';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
}

const variantStyles = {
  info: {
    backgroundColor: colors.semantic.info.light,
    borderColor: colors.semantic.info.DEFAULT,
    color: colors.semantic.info.dark,
    iconColor: colors.semantic.info.DEFAULT,
  },
  success: {
    backgroundColor: colors.semantic.success.light,
    borderColor: colors.semantic.success.DEFAULT,
    color: colors.semantic.success.dark,
    iconColor: colors.semantic.success.DEFAULT,
  },
  warning: {
    backgroundColor: colors.semantic.warning.light,
    borderColor: colors.semantic.warning.DEFAULT,
    color: colors.semantic.warning.dark,
    iconColor: colors.semantic.warning.DEFAULT,
  },
  error: {
    backgroundColor: colors.semantic.error.light,
    borderColor: colors.semantic.error.DEFAULT,
    color: colors.semantic.error.dark,
    iconColor: colors.semantic.error.DEFAULT,
  },
};

const defaultIcons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  style,
  ...props
}: AlertProps) => {
  const styles = variantStyles[variant];

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '0.375rem',
    border: '1px solid',
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    color: styles.color,
    ...style,
  };

  const iconStyle: CSSProperties = {
    flexShrink: 0,
    width: '1.25rem',
    height: '1.25rem',
    color: styles.iconColor,
    fontWeight: 'bold',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyle: CSSProperties = {
    flex: 1,
  };

  const titleStyle: CSSProperties = {
    fontWeight: 600,
    marginBottom: title ? '0.25rem' : 0,
    fontSize: '0.875rem',
  };

  const messageStyle: CSSProperties = {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  };

  const closeButtonStyle: CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: styles.color,
    opacity: 0.7,
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: 'opacity 0.2s',
  };

  return (
    <div style={containerStyle} role="alert" {...props}>
      <div style={iconStyle}>{icon || defaultIcons[variant]}</div>
      <div style={contentStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        <div style={messageStyle}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="Close alert"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>
      )}
    </div>
  );
};
