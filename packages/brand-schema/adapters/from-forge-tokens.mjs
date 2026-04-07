/**
 * Converts Design System Forge tokens.yaml (raw dissect output) to canonical format.
 *
 * Forge output has:
 *   colors: [{ value: "#hex", count: N, source: "dissect" }]
 *   background_colors: [{ value: "#hex", count: N }]
 *   typography: [{ font_family, font_size, font_weight }]
 *   spacing: [{ value: "Npx", name: "" }]
 *   shadows: ["CSS shadow string"]
 *   gradients: ["CSS gradient string"]
 */

/**
 * Convert Forge tokens.yaml to canonical brand format.
 * Uses occurrence count to pick primary colors.
 *
 * @param {object} raw - Parsed tokens.yaml from design-system-forge
 * @param {string} slug - Brand slug
 * @param {object} [options]
 * @param {string} [options.name] - Brand name
 * @param {string} [options.source] - Source URL
 * @returns {object} Canonical brand object
 */
function fromForgeTokens(raw, slug, options = {}) {
  // Sort colors by count (most used first)
  const colors = (raw.colors || []).sort((a, b) => (b.count || 0) - (a.count || 0));
  const bgColors = (raw.background_colors || []).sort((a, b) => (b.count || 0) - (a.count || 0));
  const typography = raw.typography || [];
  const spacing = raw.spacing || [];

  // Pick semantic colors from sorted occurrence data
  const bg = bgColors[0]?.value || '#FFFFFF';
  const isLight = isLightHex(bg);
  const primary = colors[0]?.value || '#6366F1';
  const accent = colors[1]?.value || colors[0]?.value || '#EC4899';

  // Pick fonts (most common first)
  const fonts = typography
    .filter((t) => t.font_family && t.font_family !== 'unnamed')
    .reduce((acc, t) => {
      if (!acc.includes(t.font_family)) acc.push(t.font_family);
      return acc;
    }, []);

  return {
    meta: {
      name: options.name || slug,
      slug,
      version: 1,
      theme: isLight ? 'light' : 'dark',
      source: options.source || 'design-system-forge',
    },
    colors: {
      semantic: {
        background: bg,
        surface: bgColors[1]?.value || (isLight ? '#FFFFFF' : '#111111'),
        text: isLight ? '#1A1A1A' : '#F2F2F2',
        text_secondary: isLight ? '#4B5563' : '#9CA3AF',
        primary,
        primary_hover: lighten(primary, 10),
        accent,
        accent_hover: lighten(accent, 10),
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#818CF8',
      },
    },
    typography: {
      family: {
        display: fonts[0] || 'Inter',
        body: fonts[1] || fonts[0] || 'Inter',
      },
      scale: buildScaleFromForge(typography),
    },
    spacing: {
      scale: spacing
        .map((s) => parseInt(s.value, 10))
        .filter(Boolean)
        .sort((a, b) => a - b),
    },
    shadows: raw.shadows
      ? { sm: raw.shadows[0], md: raw.shadows[1], lg: raw.shadows[2] }
      : {},
    anti_slop: [],
  };
}

function buildScaleFromForge(typography) {
  const sorted = [...typography]
    .filter((t) => t.font_size)
    .map((t) => ({ ...t, sizePx: parseInt(t.font_size, 10) || 16 }))
    .sort((a, b) => b.sizePx - a.sizePx);

  const scale = {};
  const keys = ['h1', 'h2', 'h3', 'h4', 'body', 'body_sm', 'caption'];
  for (let i = 0; i < Math.min(keys.length, sorted.length); i++) {
    scale[keys[i]] = {
      size: `${sorted[i].sizePx}px`,
      weight: parseInt(sorted[i].font_weight, 10) || 400,
      line_height: sorted[i].sizePx > 30 ? 1.15 : 1.6,
    };
  }
  return scale;
}

function isLightHex(hex) {
  if (!hex) return true;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function lighten(hex, percent) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round(255 * percent / 100));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round(255 * percent / 100));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round(255 * percent / 100));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export { fromForgeTokens };
