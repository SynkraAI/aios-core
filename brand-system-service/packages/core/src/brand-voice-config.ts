import fs from 'node:fs';

import { createLogger } from './logger';

/**
 * Input configuration for brand voice generation.
 * Read from brand-voice.config.json at project root.
 */
export interface BrandVoiceConfig {
  /** 3-5 personality adjectives that define the brand voice */
  readonly personality: string[];
  /** Industry the brand operates in */
  readonly industry: string;
  /** Target audience description */
  readonly audience: string;
  /** Overall tone setting */
  readonly tone: 'professional' | 'conversational' | 'technical' | 'inspirational';
  /** Words the brand should never use */
  readonly forbiddenWords: string[];
  /** Words the brand prefers to use */
  readonly approvedWords: string[];
  /** Competitor brands to differentiate from */
  readonly competitorBrands: string[];
}

const VALID_TONES = ['professional', 'conversational', 'technical', 'inspirational'] as const;

/**
 * Load and validate brand-voice.config.json.
 *
 * Missing optional fields produce warnings, not errors.
 * Partial configs are allowed per AC 10.
 *
 * @param configPath - Absolute path to brand-voice.config.json
 * @returns Validated BrandVoiceConfig
 */
export function loadBrandVoiceConfig(configPath: string): BrandVoiceConfig {
  const logger = createLogger('BrandVoiceConfig', false);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Brand voice config not found: ${configPath}`);
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Validate personality
  if (!Array.isArray(raw.personality) || raw.personality.length === 0) {
    logger.warn('personality is missing or empty, defaulting to empty array');
  }
  const personality: string[] = Array.isArray(raw.personality)
    ? raw.personality.filter((p: unknown) => typeof p === 'string')
    : [];

  // Validate industry
  if (!raw.industry || typeof raw.industry !== 'string') {
    logger.warn('industry is missing, defaulting to empty string');
  }

  // Validate audience
  if (!raw.audience || typeof raw.audience !== 'string') {
    logger.warn('audience is missing, defaulting to empty string');
  }

  // Validate tone
  const tone = VALID_TONES.includes(raw.tone) ? raw.tone : 'professional';
  if (!VALID_TONES.includes(raw.tone)) {
    logger.warn(`Invalid tone "${raw.tone}", defaulting to "professional"`);
  }

  // Validate arrays
  const forbiddenWords = Array.isArray(raw.forbiddenWords)
    ? raw.forbiddenWords.filter((w: unknown) => typeof w === 'string')
    : [];
  const approvedWords = Array.isArray(raw.approvedWords)
    ? raw.approvedWords.filter((w: unknown) => typeof w === 'string')
    : [];
  const competitorBrands = Array.isArray(raw.competitorBrands)
    ? raw.competitorBrands.filter((b: unknown) => typeof b === 'string')
    : [];

  if (forbiddenWords.length === 0) {
    logger.warn('forbiddenWords is empty');
  }
  if (approvedWords.length === 0) {
    logger.warn('approvedWords is empty');
  }
  if (competitorBrands.length === 0) {
    logger.warn('competitorBrands is empty');
  }

  return {
    personality,
    industry: raw.industry || '',
    audience: raw.audience || '',
    tone,
    forbiddenWords,
    approvedWords,
    competitorBrands,
  };
}
