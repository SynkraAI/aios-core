/**
 * Circle Design System - Color Tokens
 * Extracted from https://circle.so/br
 */
export declare const colors: {
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
export type Colors = typeof colors;
