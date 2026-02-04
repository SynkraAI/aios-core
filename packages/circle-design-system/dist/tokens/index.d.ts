/**
 * Circle Design System - Design Tokens
 * Extracted from https://circle.so/br
 */
export { colors } from './colors';
export type { Colors } from './colors';
export { typography, typographyPresets } from './typography';
export type { Typography, TypographyPresets } from './typography';
export { spacing, container, breakpoints } from './spacing';
export type { Spacing, Container, Breakpoints } from './spacing';
export { shadows, backdrop, opacity } from './shadows';
export type { Shadows, Backdrop, Opacity } from './shadows';
export { borders } from './borders';
export type { Borders } from './borders';
export declare const tokens: {
    readonly colors: {
        readonly primary: {
            readonly DEFAULT: "#506CF0";
            readonly hover: "#3F5BD6";
            readonly active: "#2E4AC2";
            readonly light: "#8B83FF";
            readonly gradient: "linear-gradient(135deg, #506CF0, #8B83FF)";
        };
        readonly neutral: {
            readonly 50: "#FAFAFA";
            readonly 100: "#F5F5F5";
            readonly 200: "#E5E5E5";
            readonly 300: "#D1D5DB";
            readonly 400: "#9CA3AF";
            readonly 500: "#737373";
            readonly 600: "#525252";
            readonly 700: "#404040";
            readonly 800: "#262626";
            readonly 900: "#171717";
            readonly 950: "#0A0A0A";
            readonly white: "#FFFFFF";
            readonly black: "#000000";
        };
        readonly background: {
            readonly white: "#FFFFFF";
            readonly beige: "rgba(251, 249, 247, 1)";
            readonly navy: "rgba(15, 15, 53, 1)";
        };
        readonly semantic: {
            readonly success: {
                readonly light: "#D1FAE5";
                readonly DEFAULT: "#10B981";
                readonly dark: "#065F46";
            };
            readonly warning: {
                readonly light: "#FEF3C7";
                readonly DEFAULT: "#F59E0B";
                readonly dark: "#92400E";
            };
            readonly error: {
                readonly light: "#FEE2E2";
                readonly DEFAULT: "#EF4444";
                readonly dark: "#991B1B";
            };
            readonly info: {
                readonly light: "#DBEAFE";
                readonly DEFAULT: "#506CF0";
                readonly dark: "#1E40AF";
            };
        };
        readonly overlay: {
            readonly light: "rgba(255, 255, 255, 0.1)";
            readonly medium: "rgba(255, 255, 255, 0.3)";
            readonly dark: "rgba(0, 0, 0, 0.5)";
            readonly border: "rgba(72, 75, 115, 1)";
        };
        readonly gamification: {
            readonly gold: "#FFD700";
            readonly silver: "#C0C0C0";
            readonly bronze: "#CD7F32";
        };
    };
    readonly typography: {
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
    readonly typographyPresets: {
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
    readonly spacing: {
        readonly 0: "0";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 10: "2.5rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 15: "3.75rem";
        readonly 16: "4rem";
        readonly 17.5: "4.375rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 25: "6.25rem";
        readonly 30: "7.5rem";
        readonly 40: "10rem";
    };
    readonly container: {
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1200px";
        readonly '2xl': "1280px";
        readonly full: "100%";
    };
    readonly breakpoints: {
        readonly mobile: "0px";
        readonly tablet: "768px";
        readonly desktop: "992px";
        readonly wide: "1280px";
    };
    readonly shadows: {
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
    readonly backdrop: {
        readonly blur: {
            readonly sm: "blur(4px)";
            readonly DEFAULT: "blur(6px)";
            readonly lg: "blur(12px)";
        };
    };
    readonly opacity: {
        readonly 0: "0";
        readonly 10: "0.1";
        readonly 30: "0.3";
        readonly 60: "0.6";
        readonly 80: "0.8";
        readonly 100: "1";
    };
    readonly borders: {
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
};
export type Tokens = typeof tokens;
