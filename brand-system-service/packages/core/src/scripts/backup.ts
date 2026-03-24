/**
 * Daily backup script — copies active R2 objects to _backups/{YYYY-MM-DD}/.
 * Incremental: only copies objects modified since last backup.
 *
 * Usage: pnpm backup
 *
 * @module scripts/backup
 */

import { CopyObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { createR2Client, r2ConfigFromEnv } from '../r2/client';
import { createLogger } from '../logger';
import { GDPR_PATHS } from '../gdpr/types';

const logger = createLogger('scripts:backup');

interface BackupState {
  lastBackupAt: string;
}

async function main(): Promise<void> {
  const r2Config = r2ConfigFromEnv();
  const r2Client = createR2Client(r2Config);
  const bucket = r2Config.bucketName;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const backupPrefix = `${GDPR_PATHS.BACKUPS_PREFIX}/${today}/`;

  // Load last backup state
  const statePath = GDPR_PATHS.BACKUP_STATE;
  let lastBackupAt: Date | null = null;

  if (existsSync(statePath)) {
    try {
      const state: BackupState = JSON.parse(readFileSync(statePath, 'utf-8'));
      lastBackupAt = new Date(state.lastBackupAt);
    } catch {
      logger.warn('Could not read backup state, running full backup');
    }
  }

  logger.info('Starting backup', {
    date: today,
    incremental: lastBackupAt !== null,
    since: lastBackupAt?.toISOString() ?? 'full',
  });

  let copied = 0;
  let skipped = 0;
  let continuationToken: string | undefined;

  // List all active objects
  do {
    const response = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );

    for (const obj of response.Contents ?? []) {
      if (!obj.Key) continue;

      // Skip internal prefixes
      if (
        obj.Key.includes(`/${GDPR_PATHS.DELETED_PREFIX}/`) ||
        obj.Key.includes(`/${GDPR_PATHS.BACKUPS_PREFIX}/`) ||
        obj.Key.includes(`/${GDPR_PATHS.EXPORTS_PREFIX}/`)
      ) {
        skipped++;
        continue;
      }

      // Incremental: skip if not modified since last backup
      if (lastBackupAt && obj.LastModified && obj.LastModified <= lastBackupAt) {
        skipped++;
        continue;
      }

      // Copy to backup prefix
      const backupKey = `${backupPrefix}${obj.Key}`;
      try {
        await r2Client.send(
          new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${obj.Key}`,
            Key: backupKey,
          }),
        );
        copied++;
      } catch (err) {
        logger.error(`Failed to backup ${obj.Key}`, {
          error: err instanceof Error ? err.message : 'unknown',
        });
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  // Save backup state
  const dir = dirname(statePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const newState: BackupState = { lastBackupAt: new Date().toISOString() };
  writeFileSync(statePath, JSON.stringify(newState, null, 2), 'utf-8');

  logger.info('Backup complete', { copied, skipped, date: today });
}

main().catch((err) => {
  logger.error('Backup failed', { error: err instanceof Error ? err.message : 'unknown' });
  process.exit(1);
});
