/**
 * @bss/core - Core utilities for Brand System Service
 *
 * Provides shared configuration, logging, error handling, and
 * environment variable management across all BSS packages.
 */

export { loadConfig, type BSSConfig } from './config';
export { loadBrandVoiceConfig, type BrandVoiceConfig } from './brand-voice-config';
export { BSSError, ConfigError, BuildError, StorageError } from './errors';
export { createLogger, type Logger } from './logger';

// Brand Voice types (consumed by EPIC-BSS-3 AI pipeline)
export type {
  BrandVoice,
  VoicePillar,
  ToneChannel,
  DoEntry,
  DontEntry,
  Tagline,
  Manifesto,
  ValueProp,
} from './brand-voice';

// R2 Storage module
export * from './r2';

// Security module
export * from './security';

// GDPR Compliance module
export * from './gdpr';

// Monitoring module
export * from './monitoring';
