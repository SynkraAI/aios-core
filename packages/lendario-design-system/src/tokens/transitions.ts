/**
 * Lendário AI Design System - Transition Tokens
 *
 * Extracted from cohort.lendario.ai
 */

export const transitions = {
  // Duration values
  duration: {
    instant: '0ms',
    fast: '150ms',
    DEFAULT: '200ms',
    normal: '250ms',     // Modal slide-in (cohort)
    slow: '300ms',       // Standard transitions (cohort)
    slower: '400ms',
    slowest: '500ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',        // Modal animation (cohort)
    easeInOut: 'ease-in-out',
    // Custom cubic-bezier if needed
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common transition properties
  property: {
    all: 'all',
    colors: 'background-color, border-color, color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
} as const

// Preset transitions (cohort patterns)
export const transitionPresets = {
  // Standard transition for most interactions (cohort: all 0.3s)
  default: {
    property: 'all',
    duration: transitions.duration.slow,
    easing: transitions.easing.ease,
    value: 'all 0.3s ease',
  },

  // Button hover (cohort)
  button: {
    property: 'all',
    duration: transitions.duration.slow,
    easing: transitions.easing.ease,
    value: 'all 0.3s ease',
  },

  // Modal slide-in (cohort: modalSlideIn 0.25s ease-out)
  modal: {
    property: 'transform, opacity',
    duration: transitions.duration.normal,
    easing: transitions.easing.easeOut,
    value: 'transform 0.25s ease-out, opacity 0.25s ease-out',
  },

  // Fast color changes
  color: {
    property: transitions.property.colors,
    duration: transitions.duration.fast,
    easing: transitions.easing.easeInOut,
    value: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out',
  },

  // Transform effects (button hover translateY)
  transform: {
    property: 'transform',
    duration: transitions.duration.slow,
    easing: transitions.easing.ease,
    value: 'transform 0.3s ease',
  },
} as const

// Animation keyframes (cohort specific)
export const animations = {
  // Pulse animation (cohort: 2s infinite for badge dots)
  pulse: {
    duration: '2s',
    iterationCount: 'infinite',
    timingFunction: 'ease-in-out',
    keyframes: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  },

  // Modal slide-in (cohort: modalSlideIn 0.25s ease-out)
  modalSlideIn: {
    duration: '0.25s',
    iterationCount: '1',
    timingFunction: 'ease-out',
    keyframes: `
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  },

  // Fade in
  fadeIn: {
    duration: '0.3s',
    iterationCount: '1',
    timingFunction: 'ease-in',
    keyframes: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  },
} as const

// Type exports
export type Transitions = typeof transitions
export type TransitionPresets = typeof transitionPresets
export type Animations = typeof animations
