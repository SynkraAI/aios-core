import fs from 'node:fs';
import path from 'node:path';
import type {
  TrainingConfig,
  TrainingGuideType,
  TrainingGenerationResult,
  TrainingBatchResult,
  LoomPlaceholder,
} from './types';
import { DEFAULT_LOOM_PLACEHOLDERS, TRAINING_SIGNED_URL_EXPIRY } from './types';
import { renderBrandUsageGuide } from './templates/brand-usage';
import { renderStaticSiteUpdateGuide } from './templates/static-site-update';
import { renderSocialMediaGuide } from './templates/social-media';
import { renderDeveloperOnboardingGuide } from './templates/developer-onboarding';
import { renderTrainingIndex } from './templates/training-index';

/**
 * File name mapping for each guide type.
 */
const GUIDE_FILE_NAMES: Record<TrainingGuideType, string> = {
  brand_usage: 'brand-usage.html',
  static_site_update: 'static-site-update.html',
  social_media: 'social-media.html',
  developer_onboarding: 'developer-onboarding.html',
};

/**
 * Validates the training configuration.
 *
 * @throws Error if required fields are missing or invalid
 */
export function validateConfig(config: TrainingConfig): void {
  if (!config.clientId || typeof config.clientId !== 'string') {
    throw new Error('Training config requires a non-empty clientId');
  }
  if (!config.clientName || typeof config.clientName !== 'string') {
    throw new Error('Training config requires a non-empty clientName');
  }
  if (!config.primaryColor || !/^#[0-9a-fA-F]{6}$/.test(config.primaryColor)) {
    throw new Error('Training config requires a valid 6-digit hex primaryColor (e.g., #3B82F6)');
  }
  if (!config.guides || typeof config.guides !== 'object') {
    throw new Error('Training config requires a guides object');
  }
  if (!config.loomPlaceholders || typeof config.loomPlaceholders !== 'object') {
    throw new Error('Training config requires a loomPlaceholders object');
  }

  const enabledGuides = Object.values(config.guides).filter(Boolean);
  if (enabledGuides.length === 0) {
    throw new Error('Training config must enable at least one guide');
  }
}

/**
 * Resolves the Loom placeholder for a guide type.
 * If a URL is provided in the config, it overrides the default placeholder URL.
 */
function resolveLoom(guideType: TrainingGuideType, config: TrainingConfig): LoomPlaceholder {
  const defaults = DEFAULT_LOOM_PLACEHOLDERS[guideType];
  const url = config.loomPlaceholders[guideType] || '';
  return { ...defaults, url };
}

/**
 * Generates a single training guide HTML.
 */
function generateGuide(
  guideType: TrainingGuideType,
  config: TrainingConfig
): TrainingGenerationResult {
  const loom = resolveLoom(guideType, config);
  const fileName = GUIDE_FILE_NAMES[guideType];

  try {
    let html: string;
    switch (guideType) {
      case 'brand_usage':
        html = renderBrandUsageGuide(config.clientName, config.primaryColor, loom);
        break;
      case 'static_site_update':
        html = renderStaticSiteUpdateGuide(config.clientName, config.primaryColor, loom);
        break;
      case 'social_media':
        html = renderSocialMediaGuide(config.clientName, config.primaryColor, loom);
        break;
      case 'developer_onboarding':
        html = renderDeveloperOnboardingGuide(
          config.clientName,
          config.clientId,
          config.primaryColor,
          config.brandTokensPackage,
          loom
        );
        break;
      default: {
        const _exhaustive: never = guideType;
        throw new Error(`Unknown guide type: ${_exhaustive}`);
      }
    }

    return { guideType, html, fileName, success: true };
  } catch (error) {
    return {
      guideType,
      html: '',
      fileName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * TrainingGenerator produces branded training HTML documents from a config file.
 *
 * Each training document uses CSS custom properties from the client's brand tokens,
 * ensuring visual consistency with the brand system. The output is static HTML
 * suitable for R2 upload and delivery via signed URLs.
 */
export class TrainingGenerator {
  private readonly config: TrainingConfig;

  constructor(config: TrainingConfig) {
    validateConfig(config);
    this.config = config;
  }

  /**
   * Generates all enabled training documents and the index page.
   */
  generate(): TrainingBatchResult {
    const guideTypes: TrainingGuideType[] = [
      'brand_usage',
      'static_site_update',
      'social_media',
      'developer_onboarding',
    ];

    const enabledGuides = guideTypes.filter((type) => this.config.guides[type]);
    const guides = enabledGuides.map((type) => generateGuide(type, this.config));
    const indexHtml = renderTrainingIndex(this.config);

    return {
      clientId: this.config.clientId,
      guides,
      indexHtml,
      successCount: guides.filter((g) => g.success).length,
      failCount: guides.filter((g) => !g.success).length,
    };
  }

  /**
   * Generates all enabled training documents and writes them to the output directory.
   */
  generateToDir(outputDir: string): TrainingBatchResult {
    const result = this.generate();

    fs.mkdirSync(outputDir, { recursive: true });

    // Write individual guides
    for (const guide of result.guides) {
      if (guide.success) {
        fs.writeFileSync(path.join(outputDir, guide.fileName), guide.html, 'utf-8');
      }
    }

    // Write index page
    fs.writeFileSync(path.join(outputDir, 'index.html'), result.indexHtml, 'utf-8');

    return result;
  }

  /**
   * Returns the R2 upload path for training files.
   */
  getR2UploadPath(): string {
    return `brand-assets/${this.config.clientId}/training/`;
  }

  /**
   * Returns the signed URL expiry for training files (30 days).
   */
  getSignedUrlExpiry(): number {
    return TRAINING_SIGNED_URL_EXPIRY;
  }
}
