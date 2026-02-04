import { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import { colors } from '@/tokens/colors';
import { spacing } from '@/tokens/spacing';
import { borders } from '@/tokens/borders';
import { shadows } from '@/tokens/shadows';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = ({
  header,
  footer,
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  style,
  ...props
}: CardProps) => {
  // Padding styles
  const paddingMap = {
    none: '0',
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
  };

  // Variant styles
  const variantStyles: Record<string, CSSProperties> = {
    default: {
      backgroundColor: colors.neutral.white,
      border: 'none',
      boxShadow: shadows.boxShadow.sm,
    },
    outlined: {
      backgroundColor: colors.neutral.white,
      border: `${borders.borderWidth.DEFAULT} solid ${colors.neutral[200]}`,
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: colors.neutral.white,
      border: 'none',
      boxShadow: shadows.boxShadow.md,
    },
  };

  const cardStyle: CSSProperties = {
    borderRadius: borders.borderRadius.md,
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ...variantStyles[variant],
    ...(hoverable && {
      cursor: 'pointer',
    }),
    ...style,
  };

  const headerStyle: CSSProperties = {
    padding: paddingMap[padding],
    borderBottom: `${borders.borderWidth.DEFAULT} solid ${colors.neutral[200]}`,
  };

  const bodyStyle: CSSProperties = {
    padding: paddingMap[padding],
  };

  const footerStyle: CSSProperties = {
    padding: paddingMap[padding],
    borderTop: `${borders.borderWidth.DEFAULT} solid ${colors.neutral[200]}`,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = shadows.boxShadow.lg;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      const boxShadow = variantStyles[variant]?.boxShadow;
      e.currentTarget.style.boxShadow = boxShadow || '';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {header && <div style={headerStyle}>{header}</div>}
      <div style={bodyStyle}>{children}</div>
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  );
};
