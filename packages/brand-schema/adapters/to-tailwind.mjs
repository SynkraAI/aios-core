/**
 * Converts a canonical brand to Tailwind CSS config extend object.
 *
 * Usage:
 *   import { toTailwind } from './to-tailwind.mjs';
 *   const extend = toTailwind(brand);
 */

/**
 * Convert canonical brand to Tailwind theme.extend object.
 * @param {object} brand - Canonical brand object
 * @returns {object} Object suitable for tailwind.config.ts theme.extend
 */
function toTailwind(brand) {
  const extend = {};

  // Colors
  if (brand.colors?.semantic) {
    extend.colors = {};
    for (const [key, value] of Object.entries(brand.colors.semantic)) {
      extend.colors[key.replace(/_/g, '-')] = value;
    }
  }

  // Add primitive palettes if present
  if (brand.colors?.primitives) {
    for (const [paletteName, shades] of Object.entries(brand.colors.primitives)) {
      extend.colors[paletteName] = { ...shades };
    }
  }

  // Font family
  if (brand.typography?.family) {
    extend.fontFamily = {};
    const fallback = brand.typography.family.fallback || 'sans-serif';
    extend.fontFamily.display = [brand.typography.family.display, fallback];
    extend.fontFamily.body = [brand.typography.family.body, fallback];
    if (brand.typography.family.mono) {
      extend.fontFamily.mono = [brand.typography.family.mono, 'monospace'];
    }
  }

  // Border radius
  if (brand.radii) {
    extend.borderRadius = {};
    for (const [key, value] of Object.entries(brand.radii)) {
      if (key !== 'default') {
        extend.borderRadius[key] = typeof value === 'number' ? `${value}px` : value;
      }
    }
  }

  // Box shadow
  if (brand.shadows) {
    extend.boxShadow = {};
    for (const [key, value] of Object.entries(brand.shadows)) {
      if (key !== 'none') {
        extend.boxShadow[key] = value;
      }
    }
  }

  // Spacing (named)
  if (brand.spacing?.named) {
    extend.spacing = { ...brand.spacing.named };
  }

  return extend;
}

/**
 * Generate a complete tailwind.config.ts content string.
 * @param {object} brand - Canonical brand object
 * @returns {string} TypeScript config file content
 */
function toTailwindConfig(brand) {
  const extend = toTailwind(brand);
  return `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: ${JSON.stringify(extend, null, 6).replace(/"([^"]+)":/g, '$1:')},
  },
  plugins: [],
};

export default config;
`;
}

export { toTailwind, toTailwindConfig };
