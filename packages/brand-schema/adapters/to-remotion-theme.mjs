/**
 * Converts a canonical brand to Remotion-compatible theme.
 * Sizes in px (no rem), durations in frames, spring configs.
 *
 * Usage:
 *   import { toRemotionTheme } from './to-remotion-theme.mjs';
 *   const theme = toRemotionTheme(brand, { fps: 30 });
 */

/**
 * Convert ms duration string to frame count.
 * @param {string|number} ms - Duration like "200ms" or 200
 * @param {number} fps - Frames per second
 * @returns {number} Frame count
 */
function msToFrames(ms, fps) {
  const msNum = typeof ms === 'string' ? parseInt(ms, 10) : ms;
  return Math.round((msNum / 1000) * fps);
}

/**
 * Convert rem/px size string to numeric px.
 * @param {string} size - Size like "16px" or "1rem"
 * @returns {number} Pixel value
 */
function toPx(size) {
  if (typeof size === 'number') return size;
  if (size.endsWith('rem')) return parseFloat(size) * 16;
  return parseFloat(size);
}

/**
 * Derive motion preset from brand personality.
 * Based on video-generator's heuristic: color analysis → motion style.
 * @param {object} brand - Canonical brand
 * @returns {{ damping: number, stiffness: number, enter: string, exit: string }}
 */
function deriveMotionPreset(brand) {
  if (brand.motion?.spring) {
    return {
      ...brand.motion.spring,
      enter: 'fadeIn',
      exit: 'fadeOut',
    };
  }

  const primary = brand.colors?.semantic?.primary || '#000000';
  const bg = brand.colors?.semantic?.background || '#FFFFFF';
  const isMinimal = primary.match(/^#[0-2]/) && bg.match(/^#[fF]/);
  const isCorporate = primary.match(/^#[0-2]/) && !bg.match(/^#[fF]/);
  const isBold = primary.match(/^#[e-fE-F]/);

  if (isMinimal) return { damping: 20, stiffness: 100, enter: 'fadeIn', exit: 'fadeOut' };
  if (isCorporate) return { damping: 25, stiffness: 80, enter: 'fadeIn', exit: 'fadeOut' };
  if (isBold) return { damping: 12, stiffness: 200, enter: 'scaleUp', exit: 'slideOut' };
  return { damping: 20, stiffness: 100, enter: 'fadeIn', exit: 'fadeOut' };
}

/**
 * Convert canonical brand to Remotion theme object.
 * @param {object} brand - Canonical brand
 * @param {object} [options]
 * @param {number} [options.fps=30] - Target FPS
 * @returns {object} Remotion-compatible theme
 */
function toRemotionTheme(brand, options = {}) {
  const fps = options.fps || brand.motion?.fps || 30;
  const motion = deriveMotionPreset(brand);

  const theme = {
    // Video config
    video: {
      width: 1080,
      height: 1920,
      fps,
    },

    // Colors (flat for easy destructuring)
    colors: {
      background: brand.colors?.semantic?.background || '#000000',
      foreground: brand.colors?.semantic?.text || '#FFFFFF',
      primary: brand.colors?.semantic?.primary || '#6366F1',
      accent: brand.colors?.semantic?.accent || '#EC4899',
      muted: brand.colors?.semantic?.text_muted || '#9CA3AF',
      success: brand.colors?.semantic?.success || '#34D399',
      error: brand.colors?.semantic?.error || '#F87171',
      warning: brand.colors?.semantic?.warning || '#FBBF24',
    },

    // Typography (px values for Remotion canvas)
    typography: {
      ui: brand.typography?.family?.display || 'Inter',
      body: brand.typography?.family?.body || 'Inter',
      weights: {
        regular: 400,
        semibold: 600,
        bold: 700,
      },
      sizes: {},
    },

    // Spacing (px numbers)
    spacing: {
      base: 8,
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
      xxl: 64,
    },

    // Animation (in frames)
    animation: {
      instant: 0,
      fast: msToFrames(brand.animation?.duration?.fast || 150, fps),
      normal: msToFrames(brand.animation?.duration?.normal || 250, fps),
      slow: msToFrames(brand.animation?.duration?.slow || 400, fps),
      easing: {
        smooth: { damping: motion.damping, stiffness: motion.stiffness },
        snappy: { damping: 12, stiffness: 200 },
        bouncy: { damping: 8, stiffness: 150 },
        gentle: { damping: 20, stiffness: 80 },
      },
    },

    // Motion
    motion: {
      enter: motion.enter,
      exit: motion.exit,
    },

    // Layout
    layout: {
      safeZone: { top: 120, bottom: 120 },
      margin: 40,
      contentWidth: 1000,
    },
  };

  // Build typography sizes from scale (convert to px numbers for Remotion)
  if (brand.typography?.scale) {
    const sizeMap = {
      h1: 'headline',
      h2: 'title',
      h3: 'subtitle',
      body: 'body',
      caption: 'label',
      label: 'small',
    };
    for (const [scaleKey, remotionKey] of Object.entries(sizeMap)) {
      if (brand.typography.scale[scaleKey]?.size) {
        theme.typography.sizes[remotionKey] = toPx(brand.typography.scale[scaleKey].size);
      }
    }
  }

  // Override spacing from brand if available
  if (brand.spacing?.scale) {
    const scale = brand.spacing.scale;
    if (scale[0]) theme.spacing.xs = scale[0];
    if (scale[1]) theme.spacing.sm = scale[1];
    if (scale[3]) theme.spacing.md = scale[3];
    if (scale[5]) theme.spacing.lg = scale[5];
    if (scale[7]) theme.spacing.xl = scale[7];
    if (scale[9]) theme.spacing.xxl = scale[9];
  }

  return theme;
}

export { toRemotionTheme, msToFrames, toPx, deriveMotionPreset };
