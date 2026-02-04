import { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeStyle = 'solid' | 'subtle' | 'outline';
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
    /**
     * Badge color variant
     * @default 'default'
     */
    variant?: BadgeVariant;
    /**
     * Badge size
     * @default 'md'
     */
    size?: BadgeSize;
    /**
     * Badge visual style
     * @default 'solid'
     */
    badgeStyle?: BadgeStyle;
    /**
     * Icon to display before the badge text
     */
    leftIcon?: ReactNode;
    /**
     * Icon to display after the badge text
     */
    rightIcon?: ReactNode;
    /**
     * Badge content
     */
    children: ReactNode;
    /**
     * Custom inline styles
     */
    style?: React.CSSProperties;
}
/**
 * Badge Component
 *
 * Small label for displaying status, categories, or counts.
 * Supports multiple variants, sizes, and styles.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="primary" badgeStyle="subtle">New</Badge>
 * <Badge variant="warning" leftIcon={<Icon />}>Warning</Badge>
 * ```
 */
export declare const Badge: ({ variant, size, badgeStyle, leftIcon, rightIcon, children, style: customStyle, ...props }: BadgeProps) => import("react/jsx-runtime").JSX.Element;
