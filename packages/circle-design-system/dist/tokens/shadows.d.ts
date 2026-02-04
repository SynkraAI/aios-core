/**
 * Circle Design System - Shadow Tokens
 */
export declare const shadows: {
    readonly boxShadow: {
        readonly none: "none";
        readonly xs: "0 1px 2px rgba(0, 0, 0, 0.05)";
        readonly sm: "0 2px 4px rgba(169, 169, 169, 0.08)";
        readonly DEFAULT: "0 4px 8px rgba(169, 169, 169, 0.08)";
        readonly md: "0 6px 12px rgba(169, 169, 169, 0.1)";
        readonly lg: "0 10px 20px rgba(169, 169, 169, 0.12)";
        readonly xl: "0 20px 40px rgba(169, 169, 169, 0.15)";
        readonly button: "0 2px 4px rgba(80, 108, 240, 0.2)";
    };
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 10;
        readonly sticky: 20;
        readonly overlay: 30;
        readonly modal: 40;
        readonly popover: 50;
        readonly tooltip: 60;
    };
};
export declare const backdrop: {
    readonly blur: {
        readonly sm: "blur(4px)";
        readonly DEFAULT: "blur(6px)";
        readonly lg: "blur(12px)";
    };
};
export declare const opacity: {
    readonly 0: "0";
    readonly 10: "0.1";
    readonly 30: "0.3";
    readonly 60: "0.6";
    readonly 80: "0.8";
    readonly 100: "1";
};
export type Shadows = typeof shadows;
export type Backdrop = typeof backdrop;
export type Opacity = typeof opacity;
