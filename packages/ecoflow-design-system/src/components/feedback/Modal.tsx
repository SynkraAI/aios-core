import { ReactNode, CSSProperties, useEffect } from 'react';
import { colors, shadows, borders } from '../../tokens';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeMap = {
  sm: '400px',
  md: '600px',
  lg: '800px',
  xl: '1000px',
};

export const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  };

  const modalStyle: CSSProperties = {
    backgroundColor: colors.neutral.white,
    borderRadius: borders.borderRadius.lg,
    boxShadow: shadows.boxShadow.xl,
    maxWidth: sizeMap[size],
    width: '100%',
    maxHeight: 'calc(100vh - 2rem)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  const headerStyle: CSSProperties = {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyle: CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.neutral[900],
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    color: colors.neutral[500],
    fontSize: '1.5rem',
    lineHeight: 1,
    transition: 'color 0.2s',
  };

  const bodyStyle: CSSProperties = {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
    color: colors.neutral[700],
  };

  const footerStyle: CSSProperties = {
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div style={modalStyle}>
        {title && (
          <div style={headerStyle}>
            <h2 id="modal-title" style={titleStyle}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={closeButtonStyle}
              aria-label="Close modal"
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.neutral[700])}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.neutral[500])}
            >
              ×
            </button>
          </div>
        )}
        <div style={bodyStyle}>{children}</div>
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
};
