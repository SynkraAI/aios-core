/**
 * Generates a full canonical brand from a single hex color.
 * Replaces the ad-hoc runtime derivation in carrossel-instagram.
 *
 * Usage:
 *   import { fromHexColor } from './from-hex-color.mjs';
 *   const brand = fromHexColor('#A855F7', { name: 'My Brand', fontPreset: 'modern' });
 */

const FONT_PRESETS = {
  editorial:  { display: 'Playfair Display', body: 'DM Sans' },
  modern:     { display: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans' },
  accessible: { display: 'Lora', body: 'Nunito Sans' },
  technical:  { display: 'Space Grotesk', body: 'Space Grotesk' },
  bold:       { display: 'Fraunces', body: 'Outfit' },
  classic:    { display: 'Libre Baskerville', body: 'Work Sans' },
};

/**
 * Parse hex to RGB components.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function lighten(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const amount = 255 * percent / 100;
  return rgbToHex(r + amount, g + amount, b + amount);
}

function darken(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - percent / 100;
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Determine if a color has warm hue (red/orange/yellow).
 * @param {string} hex
 * @returns {boolean}
 */
function isWarmHue(hex) {
  const { r, g, b } = hexToRgb(hex);
  return r > b;
}

/**
 * Generate a full canonical brand from one hex color.
 *
 * @param {string} primaryHex - Primary brand color (#RRGGBB)
 * @param {object} [options]
 * @param {string} [options.name] - Brand name
 * @param {string} [options.fontPreset] - One of: editorial, modern, accessible, technical, bold, classic
 * @param {string} [options.theme] - dark or light (auto-detected from primary if omitted)
 * @returns {object} Canonical brand object
 */
function fromHexColor(primaryHex, options = {}) {
  const hex = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const theme = options.theme || (luminance > 0.6 ? 'light' : 'dark');
  const warm = isWarmHue(hex);
  const preset = FONT_PRESETS[options.fontPreset] || FONT_PRESETS.modern;

  // Derive semantic colors (replicates carrossel-instagram logic + extends it)
  const primaryLight = lighten(hex, 20);
  const primaryDark = darken(hex, 30);

  const lightBg = warm ? '#FFFBF5' : '#F8FAFC';
  const lightBorder = warm ? '#F5E6D3' : '#E2E8F0';
  const darkBg = warm ? '#1A1918' : '#0F172A';
  const darkSurface = warm ? '#262524' : '#1E293B';

  const semantic = theme === 'dark'
    ? {
        background: darkBg,
        surface: darkSurface,
        surface_elevated: lighten(darkSurface, 5),
        border: lighten(darkBg, 12),
        border_hover: lighten(darkBg, 20),
        text: '#F2F2F2',
        text_secondary: primaryLight,
        text_muted: '#9CA3AF',
        primary: hex,
        primary_hover: primaryLight,
        accent: lighten(hex, 30),
        accent_hover: lighten(hex, 40),
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#818CF8',
      }
    : {
        background: lightBg,
        surface: '#FFFFFF',
        surface_elevated: '#FFFFFF',
        border: lightBorder,
        border_hover: darken(lightBorder, 10),
        text: '#1A1A1A',
        text_secondary: '#4B5563',
        text_muted: '#9CA3AF',
        primary: hex,
        primary_hover: darken(hex, 10),
        accent: darken(hex, 20),
        accent_hover: darken(hex, 30),
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
        info: '#4F46E5',
      };

  return {
    meta: {
      name: options.name || 'Generated Brand',
      slug: (options.name || 'generated').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      version: 1,
      theme,
      source: 'from-hex-color',
    },
    colors: { semantic },
    typography: {
      family: {
        display: preset.display,
        body: preset.body,
        mono: 'JetBrains Mono',
        fallback: '-apple-system, BlinkMacSystemFont, sans-serif',
      },
      scale: {
        h1: { size: '56px', weight: 800, line_height: 1.05, letter_spacing: '-0.03em' },
        h2: { size: '40px', weight: 700, line_height: 1.15, letter_spacing: '-0.02em' },
        h3: { size: '28px', weight: 700, line_height: 1.25 },
        h4: { size: '22px', weight: 600, line_height: 1.3 },
        body: { size: '16px', weight: 400, line_height: 1.6 },
        body_sm: { size: '14px', weight: 400, line_height: 1.5 },
        caption: { size: '13px', weight: 400, line_height: 1.5 },
        label: { size: '11px', weight: 700, line_height: 1.4, letter_spacing: '0.08em', text_transform: 'uppercase' },
      },
    },
    spacing: {
      scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
      section_padding: '80px',
      card_padding: '24px',
      button_padding_x: '24px',
      button_padding_y: '12px',
    },
    radii: { none: 0, sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px', default: '8px' },
    shadows: {
      none: 'none',
      sm: `0 1px 3px rgba(0,0,0,0.1)`,
      md: `0 4px 12px rgba(0,0,0,0.15)`,
      lg: `0 8px 30px rgba(0,0,0,0.2)`,
    },
    animation: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      hover_scale: 1.02,
    },
    carousel: {
      dimensions: { width: 1080, height: 1350 },
      font_preset: options.fontPreset || 'modern',
    },
    logos: { main: '', icon: '' },
    anti_slop: [],
  };
}

// CLI: node from-hex-color.mjs "#A855F7" --name "My Brand" --font modern
if (process.argv[1]?.includes('from-hex-color')) {
  const hex = process.argv[2];
  if (!hex) {
    console.error('Usage: node from-hex-color.mjs "#RRGGBB" [--name "Name"] [--font preset]');
    process.exit(1);
  }
  const nameIdx = process.argv.indexOf('--name');
  const fontIdx = process.argv.indexOf('--font');
  const name = nameIdx > -1 ? process.argv[nameIdx + 1] : undefined;
  const fontPreset = fontIdx > -1 ? process.argv[fontIdx + 1] : undefined;

  const brand = fromHexColor(hex, { name, fontPreset });
  console.log(JSON.stringify(brand, null, 2));
}

export { fromHexColor, FONT_PRESETS };
