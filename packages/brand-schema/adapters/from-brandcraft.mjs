/**
 * Converts BrandCraft vault YAML (tokens nested under `tokens:` key) to canonical format.
 *
 * BrandCraft format has:
 *   tokens.colors: { primary, secondary, accent, background, surface, text_primary, text_secondary }
 *   tokens.typography: { font_heading, font_body, size_h1..size_body, weight_heading, weight_body }
 *   tokens.spacing: { xs..xxl: "Npx" }
 *   logos: { primary: path, icon: path }
 */

function fromBrandcraft(raw, slug) {
  const t = raw.tokens || {};
  const c = t.colors || {};
  const ty = t.typography || {};
  const sp = t.spacing || {};

  return {
    meta: {
      name: raw.name || slug,
      slug,
      version: 1,
      theme: isLight(c.background) ? 'light' : 'dark',
      source: raw.source_url || 'extracted',
    },
    colors: {
      semantic: {
        background: c.background || '#000000',
        surface: c.surface || '#111111',
        text: c.text_primary || '#FFFFFF',
        text_secondary: c.text_secondary || '#AAAAAA',
        primary: c.primary || '#6366F1',
        primary_hover: lighten(c.primary || '#6366F1', 15),
        accent: c.accent || c.secondary || '#EC4899',
        accent_hover: lighten(c.accent || c.secondary || '#EC4899', 15),
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#818CF8',
      },
    },
    typography: {
      family: {
        display: ty.font_heading || 'Inter',
        body: ty.font_body || 'Inter',
      },
      scale: {
        h1: { size: ty.size_h1 || '48px', weight: ty.weight_heading || 700, line_height: 1.1 },
        h2: { size: ty.size_h2 || '36px', weight: ty.weight_heading || 700, line_height: 1.2 },
        h3: { size: ty.size_h3 || '28px', weight: ty.weight_heading || 600, line_height: 1.3 },
        body: { size: ty.size_body || '16px', weight: ty.weight_body || 400, line_height: 1.6 },
      },
    },
    spacing: {
      named: sp,
      scale: Object.values(sp).map((v) => parseInt(v, 10)).filter(Boolean).sort((a, b) => a - b),
    },
    logos: raw.logos
      ? { main: raw.logos.primary || '', icon: raw.logos.icon || '' }
      : { main: '', icon: '' },
    anti_slop: [],
  };
}

function isLight(hex) {
  if (!hex) return false;
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

export { fromBrandcraft };
