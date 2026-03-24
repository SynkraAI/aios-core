/**
 * Sentry error tracking integration for Brand System Service.
 * Initializes Sentry SDK and provides captureError wrapper.
 *
 * @module monitoring/sentry
 */

import * as Sentry from '@sentry/node';

import type { BSSConfig } from '../config';
import { createLogger } from '../logger';

const logger = createLogger('monitoring:sentry');

let sentryInitialized = false;

/**
 * Check if Sentry is enabled via environment variable.
 * Default: true. Set BSS_SENTRY_ENABLED=false in unit tests.
 */
function isSentryEnabled(): boolean {
  return process.env['BSS_SENTRY_ENABLED'] !== 'false';
}

/**
 * Initialize Sentry error tracking.
 * Should be called once at application startup.
 *
 * @param config - BSS configuration with sentry.dsn and sentry.environment
 */
export function initSentry(config: BSSConfig): void {
  if (!isSentryEnabled()) {
    logger.info('Sentry disabled via BSS_SENTRY_ENABLED=false');
    return;
  }

  if (sentryInitialized) {
    logger.warn('Sentry already initialized, skipping duplicate init');
    return;
  }

  if (!config.sentry.dsn) {
    logger.warn('SENTRY_DSN not configured, Sentry will not capture errors');
    return;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    tracesSampleRate: 0.1,
  });

  sentryInitialized = true;
  logger.info('Sentry initialized', {
    environment: config.sentry.environment,
    tracesSampleRate: 0.1,
  });
}

/**
 * Capture an error in Sentry with optional context.
 * No-op if Sentry is not initialized or disabled.
 *
 * @param error - The error to capture
 * @param context - Optional context key-value pairs
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!isSentryEnabled() || !sentryInitialized) {
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Send a test message to Sentry for health check purposes.
 * Returns true if no exception was thrown during send.
 */
export function sentrySendTestPing(): boolean {
  if (!isSentryEnabled() || !sentryInitialized) {
    return false;
  }

  try {
    Sentry.captureMessage('health-check-ping', 'debug');
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset Sentry initialization state.
 * Used for testing purposes only.
 */
export function resetSentryState(): void {
  sentryInitialized = false;
}
