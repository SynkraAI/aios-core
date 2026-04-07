/**
 * Converts a canonical brand to CSS custom properties.
 *
 * Usage:
 *   import { toCssVars } from './to-css-vars.mjs';
 *   const css = toCssVars(brand);
 */

/**
 * Flatten an object to dot-notation paths.
 * { colors: { semantic: { primary: '#fff' } } } → { 'colors-semantic-primary': '#fff' }
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = prefix ? `${prefix}-${key.replace(/_/g, '-')}` : key.replace(/_/g, '-');
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, cssKey));
    } else if (typeof value === 'string' || typeof value === 'number') {
      result[cssKey] = value;
    }
  }
  return result;
}

/**
 * Convert canonical brand to CSS custom properties string.
 * @param {object} brand - Canonical brand object
 * @param {object} [options]
 * @param {string[]} [options.sections] - Sections to include (default: all)
 * @returns {string} CSS :root block
 */
function toCssVars(brand, options = {}) {
  const sections = options.sections || ['colors', 'typography', 'spacing', 'radii', 'shadows', 'animation'];
  const vars = {};

  for (const section of sections) {
    if (brand[section]) {
      const flattened = flattenObject(brand[section], section === 'colors' ? '' : section);
      // For colors, only flatten semantic (skip primitives for CSS vars)
      if (section === 'colors' && brand.colors.semantic) {
        Object.assign(vars, flattenObject(brand.colors.semantic, 'color'));
      } else if (section !== 'colors') {
        Object.assign(vars, flattened);
      }
    }
  }

  // Add font family shortcuts
  if (brand.typography?.family) {
    vars['font-display'] = brand.typography.family.display;
    vars['font-body'] = brand.typography.family.body;
    if (brand.typography.family.mono) {
      vars['font-mono'] = brand.typography.family.mono;
    }
  }

  const lines = Object.entries(vars)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  return `:root {\n${lines}\n}`;
}

export { toCssVars, flattenObject };
