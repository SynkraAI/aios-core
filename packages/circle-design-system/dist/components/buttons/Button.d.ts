import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Button visual style variant
     * @default 'primary'
     */
    variant?: ButtonVariant;
    /**
     * Button size
     * @default 'md'
     */
    size?: ButtonSize;
    /**
     * If true, button will show loading spinner and be disabled
     * @default false
     */
    loading?: boolean;
    /**
     * Icon to display before the button text
     */
    leftIcon?: ReactNode;
    /**
     * Icon to display after the button text
     */
    rightIcon?: ReactNode;
    /**
     * If true, button will take full width of container
     * @default false
     */
    fullWidth?: boolean;
    /**
     * Button content
     */
    children: ReactNode;
}
/**
 * Button Component
 *
 * Primary interactive element for user actions.
 * Supports multiple variants (primary, secondary, ghost, danger),
 * sizes (sm, md, lg), loading state, and icons.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 *
 * <Button variant="secondary" leftIcon={<Icon />} loading>
 *   Loading...
 * </Button>
 * ```
 */
export declare const Button: ({ variant, size, loading, leftIcon, rightIcon, fullWidth, disabled, children, style, ...props }: ButtonProps) => import("react/jsx-runtime").JSX.Element;
