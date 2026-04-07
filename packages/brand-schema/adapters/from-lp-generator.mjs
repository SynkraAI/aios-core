/**
 * Converts existing lp-generator brand YAML files to canonical format.
 * Since lp-generator brands are already 90% canonical, this is mostly
 * restructuring the root-level fields into meta.* namespace.
 *
 * Usage:
 *   import { fromLpGenerator } from './from-lp-generator.mjs';
 *   const canonical = fromLpGenerator(rawYaml, 'specta');
 */

/**
 * Convert an lp-generator brand YAML object to canonical format.
 * @param {object} raw - Raw parsed YAML from skills/lp-generator/brands/*.yaml
 * @param {string} slug - Brand slug (from filename)
 * @returns {object} Canonical brand object
 */
function fromLpGenerator(raw, slug) {
  return {
    meta: {
      name: raw.name,
      slug,
      version: raw.version || 1,
      theme: raw.theme || 'dark',
      source: raw.source || 'manual',
    },
    colors: raw.colors,
    typography: raw.typography,
    spacing: raw.spacing,
    radii: raw.radii,
    shadows: raw.shadows,
    animation: raw.animation,
    motion: raw.motion,
    effects: raw.effects,
    components: raw.components,
    carousel: raw.carousel,
    cover: raw.cover,
    logos: raw.logos || { main: '', icon: '' },
    anti_slop: raw.anti_slop || [],
  };
}

export { fromLpGenerator };
