/**
 * @brand-system/training-generator — Training & Enablement Document Generator
 *
 * Generates branded static HTML training documents for BSS clients.
 * Uses CSS custom properties from the client's token package to ensure
 * visual consistency with the brand system.
 *
 * Training documents:
 * - Brand Usage Training (brand book, colors, typography, logo, tone)
 * - Static Site Update Guide (HTML editing, image replacement, R2)
 * - Social Media Training (calendar, templates, hashtags, cadence)
 * - Developer Onboarding (tokens, CSS vars, Tailwind, updates)
 */

// Types
export type {
  TrainingGuideType,
  LoomPlaceholder,
  TrainingConfig,
  TrainingGenerationResult,
  TrainingBatchResult,
  TrainingUploadConfig,
} from './types';

export {
  DEFAULT_LOOM_PLACEHOLDERS,
  TRAINING_SIGNED_URL_EXPIRY,
} from './types';

// Generator
export { TrainingGenerator, validateConfig } from './training-generator';

// Templates (for advanced usage / customization)
export { renderBrandUsageGuide } from './templates/brand-usage';
export { renderStaticSiteUpdateGuide } from './templates/static-site-update';
export { renderSocialMediaGuide } from './templates/social-media';
export { renderDeveloperOnboardingGuide } from './templates/developer-onboarding';
export { renderTrainingIndex } from './templates/training-index';
export { wrapLayout, loomSection, escapeHtml } from './templates/shared';
