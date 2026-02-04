import { HTMLAttributes, ReactNode } from 'react';

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
export declare const Card: {
    ({ variant, hoverable, children, style, ...props }: CardProps): import("react/jsx-runtime").JSX.Element;
    Header: ({ title, actions, children, style, ...props }: CardHeaderProps) => import("react/jsx-runtime").JSX.Element;
    Body: ({ children, style, ...props }: CardBodyProps) => import("react/jsx-runtime").JSX.Element;
    Footer: ({ children, style, ...props }: CardFooterProps) => import("react/jsx-runtime").JSX.Element;
};
