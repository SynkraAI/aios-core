/**
 * Circle Design System - Typography Tokens
 * Font: Inter
 */
export declare const typography: {
    readonly fontFamily: {
        readonly sans: "var(--font-inter), Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif";
    };
    readonly fontSize: {
        readonly xs: "0.625rem";
        readonly sm: "0.75rem";
        readonly base: "0.875rem";
        readonly lg: "1rem";
        readonly xl: "1.125rem";
        readonly '2xl': "1.25rem";
        readonly '3xl': "1.5rem";
        readonly '4xl': "2rem";
        readonly '5xl': "2.5rem";
        readonly '6xl': "3rem";
        readonly '7xl': "4rem";
    };
    readonly fontWeight: {
        readonly normal: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
    };
    readonly lineHeight: {
        readonly tightest: 1.1;
        readonly tighter: 1.2;
        readonly tight: 1.3;
        readonly normal: 1.4;
        readonly loose: 1.5;
        readonly relaxed: 1.6;
    };
    readonly letterSpacing: {
        readonly tightest: "-1.5px";
        readonly tighter: "-1px";
        readonly tight: "-0.25px";
        readonly normal: "0";
        readonly wide: "0.05em";
    };
};
export declare const typographyPresets: {
    readonly h1: {
        readonly fontSize: "4rem";
        readonly fontWeight: 700;
        readonly lineHeight: 1.1;
        readonly letterSpacing: "-1.5px";
    };
    readonly h2: {
        readonly fontSize: "3rem";
        readonly fontWeight: 700;
        readonly lineHeight: 1.2;
        readonly letterSpacing: "-1px";
    };
    readonly h3: {
        readonly fontSize: "2.5rem";
        readonly fontWeight: 700;
        readonly lineHeight: 1.2;
        readonly letterSpacing: "-1px";
    };
    readonly h4: {
        readonly fontSize: "2rem";
        readonly fontWeight: 700;
        readonly lineHeight: 1.3;
        readonly letterSpacing: "-0.25px";
    };
    readonly h5: {
        readonly fontSize: "1.5rem";
        readonly fontWeight: 700;
        readonly lineHeight: 1.3;
    };
    readonly h6: {
        readonly fontSize: "1.25rem";
        readonly fontWeight: 600;
        readonly lineHeight: 1.4;
    };
    readonly bodyLarge: {
        readonly fontSize: "1.25rem";
        readonly fontWeight: 500;
        readonly lineHeight: 1.5;
    };
    readonly body: {
        readonly fontSize: "1rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.5;
    };
    readonly bodySmall: {
        readonly fontSize: "0.875rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.4;
    };
    readonly caption: {
        readonly fontSize: "0.75rem";
        readonly fontWeight: 400;
        readonly lineHeight: 1.4;
    };
    readonly button: {
        readonly fontSize: "1rem";
        readonly fontWeight: 600;
        readonly lineHeight: 1.4;
    };
    readonly badge: {
        readonly fontSize: "0.75rem";
        readonly fontWeight: 500;
        readonly lineHeight: 1.3;
    };
};
export type Typography = typeof typography;
export type TypographyPresets = typeof typographyPresets;
