/**
 * R2 Client — S3-compatible client configured for Cloudflare R2.
 * Uses AWS SDK v3 per ADR-004.
 *
 * @module r2/client
 */

import { S3Client } from '@aws-sdk/client-s3';

import { ConfigError } from '../errors';

import type { R2Config } from './types';

/** Default R2 region (Cloudflare uses 'auto'). */
const DEFAULT_REGION = 'auto';

/** Default request timeout in milliseconds. */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Create an S3Client configured for Cloudflare R2.
 *
 * @param config - R2 configuration from environment
 * @returns Configured S3Client instance
 * @throws ConfigError if required config values are missing
 */
export function createR2Client(config: R2Config): S3Client {
  validateR2Config(config);

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: config.region ?? DEFAULT_REGION,
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestHandler: {
      requestTimeout: DEFAULT_TIMEOUT_MS,
    } as unknown as undefined,
    // R2 requires path-style addressing
    forcePathStyle: true,
  });
}

/**
 * Build R2Config from environment variables.
 * Falls back to BSSConfig.r2 if available.
 *
 * @returns R2Config from environment
 */
export function r2ConfigFromEnv(): R2Config {
  return {
    accountId: process.env['R2_ACCOUNT_ID'] ?? '',
    accessKeyId: process.env['R2_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] ?? '',
    bucketName: process.env['R2_BUCKET_NAME'] ?? 'brand-assets',
    region: process.env['R2_REGION'] ?? DEFAULT_REGION,
  };
}

/**
 * Validate that all required R2 config values are present.
 */
function validateR2Config(config: R2Config): void {
  if (!config.accountId) {
    throw new ConfigError('R2_ACCOUNT_ID is required. Set it in your .env file.');
  }
  if (!config.accessKeyId) {
    throw new ConfigError('R2_ACCESS_KEY_ID is required. Set it in your .env file.');
  }
  if (!config.secretAccessKey) {
    throw new ConfigError('R2_SECRET_ACCESS_KEY is required. Set it in your .env file.');
  }
  if (!config.bucketName) {
    throw new ConfigError('R2_BUCKET_NAME is required. Set it in your .env file.');
  }
}
