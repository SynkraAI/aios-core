import { HTMLAttributes, ReactNode } from 'react';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { shadows } from '../../tokens/shadows';
import { borders } from '../../tokens/borders';

export type CardVariant = 'default' | 'elevated' | 'bordered';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card visual style variant
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * If true, adds hover effect
   * @default false
   */
  hoverable?: boolean;

  /**
   * Card content
   */
  children: ReactNode;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card title
   */
  title?: ReactNode;

  /**
   * Actions to display in header (buttons, icons, etc)
   */
  actions?: ReactNode;

  /**
   * Header content (alternative to title + actions)
   */
  children?: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Body content
   */
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Footer content
   */
  children: ReactNode;
}

/**
 * Card Component
 *
 * Container component for grouping related content.
 * Supports multiple variants (default, elevated, bordered),
 * and can include header, body, and footer sections.
 *
 * @example
 * ```tsx
 * <Card variant="elevated">
 *   <Card.Header title="Card Title" actions={<Button>Action</Button>} />
 *   <Card.Body>Card content goes here</Card.Body>
 *   <Card.Footer>Footer content</Card.Footer>
 * </Card>
 * ```
 */
export const Card = ({
  variant = 'default',
  hoverable = false,
  children,
  style,
  ...props
}: CardProps) => {
  const variantStyles = {
    default: {
      backgroundColor: colors.background.white,
      border: 'none',
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: colors.background.white,
      border: 'none',
      boxShadow: shadows.boxShadow.md,
    },
    bordered: {
      backgroundColor: colors.background.white,
      border: `${borders.width.DEFAULT} solid ${colors.neutral[200]}`,
      boxShadow: 'none',
    },
  };

  const baseStyles = {
    ...variantStyles[variant],
    borderRadius: borders.radius.xl, // 20px - Cards use larger radius
    padding: spacing[6], // 24px
    transition: 'all 0.2s ease',
    cursor: hoverable ? 'pointer' : 'default',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = shadows.boxShadow.lg;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      {...props}
      style={{ ...baseStyles, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 *
 * Header section of the card, typically containing title and actions.
 */
const CardHeader = ({
  title,
  actions,
  children,
  style,
  ...props
}: CardHeaderProps) => {
  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4], // 16px
    gap: spacing[4],
  };

  const titleStyles = {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    color: colors.neutral[900],
    margin: 0,
  };

  return (
    <div {...props} style={{ ...headerStyles, ...style }}>
      {children || (
        <>
          {title && (
            typeof title === 'string' ? (
              <h3 style={titleStyles}>{title}</h3>
            ) : (
              title
            )
          )}
          {actions && <div style={{ display: 'flex', gap: spacing[2] }}>{actions}</div>}
        </>
      )}
    </div>
  );
};

/**
 * CardBody Component
 *
 * Main content area of the card.
 */
const CardBody = ({
  children,
  style,
  ...props
}: CardBodyProps) => {
  const bodyStyles = {
    color: colors.neutral[700],
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
  };

  return (
    <div {...props} style={{ ...bodyStyles, ...style }}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 *
 * Footer section of the card, typically containing actions or metadata.
 */
const CardFooter = ({
  children,
  style,
  ...props
}: CardFooterProps) => {
  const footerStyles = {
    marginTop: spacing[4], // 16px
    paddingTop: spacing[4],
    borderTop: `${borders.width.DEFAULT} solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  };

  return (
    <div {...props} style={{ ...footerStyles, ...style }}>
      {children}
    </div>
  );
};

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
