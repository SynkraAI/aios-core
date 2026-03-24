/**
 * Health check script — tests R2 connectivity and Sentry.
 *
 * Usage: pnpm health
 * Exit code: 0 = healthy, 1 = unhealthy
 *
 * @module scripts/health-check
 */

import { ListObjectsV2Command } from '@aws-sdk/client-s3';

import { createR2Client, r2ConfigFromEnv } from '../r2/client';
import { loadConfig } from '../config';
import { createLogger } from '../logger';
import { initSentry, sentrySendTestPing } from '../monitoring/sentry';
import type { HealthCheckResult } from '../monitoring/types';

const logger = createLogger('scripts:health-check');

const R2_TIMEOUT_MS = 5_000;

async function main(): Promise<void> {
  const config = loadConfig();
  const r2Config = r2ConfigFromEnv();
  const result: HealthCheckResult = {
    r2: 'error',
    sentry: 'error',
    timestamp: new Date().toISOString(),
  };

  // Test R2 connectivity
  try {
    const r2Client = createR2Client(r2Config);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), R2_TIMEOUT_MS);

    await r2Client.send(
      new ListObjectsV2Command({
        Bucket: r2Config.bucketName,
        MaxKeys: 1,
      }),
      { abortSignal: controller.signal },
    );

    clearTimeout(timeout);
    (result as { r2: string }).r2 = 'ok';
  } catch (err) {
    logger.error('R2 health check failed', {
      error: err instanceof Error ? err.message : 'unknown',
    });
  }

  // Test Sentry
  try {
    initSentry(config);
    const sentryOk = sentrySendTestPing();
    (result as { sentry: string }).sentry = sentryOk ? 'ok' : 'error';
  } catch (err) {
    logger.error('Sentry health check failed', {
      error: err instanceof Error ? err.message : 'unknown',
    });
  }

  // Output result
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));

  const healthy = result.r2 === 'ok' && result.sentry === 'ok';
  process.exit(healthy ? 0 : 1);
}

main().catch((err) => {
  logger.error('Health check failed', { error: err instanceof Error ? err.message : 'unknown' });
  process.exit(1);
});
