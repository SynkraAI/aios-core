/**
 * Retention policy enforcement script.
 * Deletes soft-deleted assets older than 7 days and backups older than 30 days.
 *
 * Usage: pnpm retention
 *
 * @module scripts/retention
 */

import { createR2Client, r2ConfigFromEnv } from '../r2/client';
import { createLogger } from '../logger';
import { enforceRetentionPolicy } from '../gdpr/retention';

const logger = createLogger('scripts:retention');

async function main(): Promise<void> {
  const r2Config = r2ConfigFromEnv();
  const r2Client = createR2Client(r2Config);
  const bucket = r2Config.bucketName;

  logger.info('Starting retention policy enforcement');

  const report = await enforceRetentionPolicy(r2Client, bucket);

  logger.info('Retention policy enforcement complete', {
    scanned: report.scanned,
    permanentlyDeleted: report.permanentlyDeleted,
    backupsDeleted: report.backupsDeleted,
    errors: report.errors.length,
  });

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      logger.error('Retention error', { error });
    }
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error('Retention script failed', {
    error: err instanceof Error ? err.message : 'unknown',
  });
  process.exit(1);
});
