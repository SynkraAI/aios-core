/**
 * EcoFlow Design System
 *
 * Corporate modern design system with teal + yellow aesthetic
 * Optimized for project management dashboards
 *
 * @packageDocumentation
 */

// Export all tokens
export * from './tokens';

// Export components
export * from './components';

// Export utilities (to be implemented in Phase 3)
// export * from './utils';

/**
 * Design System Metadata
 */
export const designSystem = {
  name: 'EcoFlow',
  version: '0.1.0',
  description: 'Corporate modern design system with teal + yellow aesthetic',
  primaryColor: '#00BFA5',
  accentColor: '#FFB800',
  targetPlatform: 'web',
  framework: 'React',
  language: 'TypeScript',
} as const;
