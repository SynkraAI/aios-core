/**
 * Circle Design System - Border Tokens
 */
export declare const borders: {
    readonly radius: {
        readonly none: "0";
        readonly xs: "0.125rem";
        readonly sm: "0.25rem";
        readonly DEFAULT: "0.5rem";
        readonly md: "0.75rem";
        readonly lg: "1rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "2rem";
        readonly full: "9999px";
    };
    readonly width: {
        readonly 0: "0";
        readonly DEFAULT: "1px";
        readonly 2: "2px";
        readonly 4: "4px";
        readonly 8: "8px";
    };
    readonly styles: {
        readonly solid: "solid";
        readonly dashed: "dashed";
        readonly dotted: "dotted";
        readonly none: "none";
    };
};
export type Borders = typeof borders;
