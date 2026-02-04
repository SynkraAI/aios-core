import { HTMLAttributes, ReactNode, CSSProperties, useEffect, useState } from 'react';
import { colors, shadows, borders } from '../../tokens';

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration?: number; // milliseconds, 0 for persistent
  onClose?: () => void;
  visible?: boolean;
}

const variantStyles = {
  info: {
    backgroundColor: colors.semantic.info.DEFAULT,
    color: colors.neutral.white,
    icon: 'ℹ️',
  },
  success: {
    backgroundColor: colors.semantic.success.DEFAULT,
    color: colors.neutral.white,
    icon: '✓',
  },
  warning: {
    backgroundColor: colors.semantic.warning.DEFAULT,
    color: colors.neutral[900],
    icon: '⚠️',
  },
  error: {
    backgroundColor: colors.semantic.error.DEFAULT,
    color: colors.neutral.white,
    icon: '✕',
  },
};

const positionStyles = {
  'top-left': { top: '1rem', left: '1rem' },
  'top-center': { top: '1rem', left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: '1rem', right: '1rem' },
  'bottom-left': { bottom: '1rem', left: '1rem' },
  'bottom-center': { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: '1rem', right: '1rem' },
};

export const Toast = ({
  variant = 'info',
  title,
  message,
  position = 'top-right',
  duration = 5000,
  onClose,
  visible: controlledVisible,
  style,
  ...props
}: ToastProps) => {
  const [internalVisible, setInternalVisible] = useState(true);
  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible;

  useEffect(() => {
    if (!visible || duration === 0) return;

    const timer = setTimeout(() => {
      setInternalVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const styles = variantStyles[variant];
  const posStyles = positionStyles[position];

  const containerStyle: CSSProperties = {
    position: 'fixed',
    ...posStyles,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    minWidth: '300px',
    maxWidth: '500px',
    padding: '1rem',
    backgroundColor: styles.backgroundColor,
    color: styles.color,
    borderRadius: borders.borderRadius.md,
    boxShadow: shadows.boxShadow.lg,
    zIndex: 9999,
    animation: 'slideIn 0.3s ease-out',
    ...style,
  };

  const iconStyle: CSSProperties = {
    flexShrink: 0,
    fontSize: '1.25rem',
    width: '1.5rem',
    height: '1.5rem',
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
    opacity: 0.95,
  };

  const closeButtonStyle: CSSProperties = {
    flexShrink: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: 'currentColor',
    opacity: 0.7,
    fontSize: '1.25rem',
    lineHeight: 1,
    transition: 'opacity 0.2s',
  };

  const handleClose = () => {
    setInternalVisible(false);
    onClose?.();
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: ${position.includes('top') ? 'translateY(-1rem)' : 'translateY(1rem)'} ${position.includes('center') ? 'translateX(-50%)' : ''};
          }
          to {
            opacity: 1;
            transform: translateY(0) ${position.includes('center') ? 'translateX(-50%)' : ''};
          }
        }
      `}</style>
      <div style={containerStyle} role="alert" aria-live="polite" {...props}>
        <div style={iconStyle}>{styles.icon}</div>
        <div style={contentStyle}>
          {title && <div style={titleStyle}>{title}</div>}
          <div style={messageStyle}>{message}</div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          style={closeButtonStyle}
          aria-label="Close toast"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          ×
        </button>
      </div>
    </>
  );
};
