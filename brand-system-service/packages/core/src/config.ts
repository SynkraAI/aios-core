import path from 'node:path';

import { config as loadDotenv } from 'dotenv';

import { ConfigError } from './errors';

/**
 * BSS configuration interface.
 * Values loaded from environment variables with defaults.
 */
export interface BSSConfig {
  readonly clientId: string;
  readonly outputDir: string;
  readonly hostingTarget: 'vercel' | 'netlify' | 'generic';
  readonly debug: boolean;
  readonly r2: {
    readonly accountId: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
    readonly bucketName: string;
    readonly publicUrl: string;
  };
  readonly sentry: {
    readonly dsn: string;
    readonly environment: string;
  };
}

/**
 * Load BSS configuration from environment variables.
 * Searches for .env file in project root.
 *
 * @param rootDir - Project root directory (defaults to cwd)
 * @returns Validated BSSConfig
 * @throws ConfigError if required variables are missing
 */
export function loadConfig(rootDir?: string): BSSConfig {
  const envPath = rootDir ? path.resolve(rootDir, '.env') : undefined;
  loadDotenv({ path: envPath });

  return {
    clientId: getEnv('BSS_CLIENT_ID', 'demo'),
    outputDir: getEnv('BSS_OUTPUT_DIR', 'output'),
    hostingTarget: getEnvEnum('BSS_HOSTING_TARGET', ['vercel', 'netlify', 'generic'], 'generic'),
    debug: getEnv('BSS_DEBUG', 'false') === 'true',
    r2: {
      accountId: getEnv('R2_ACCOUNT_ID', ''),
      accessKeyId: getEnv('R2_ACCESS_KEY_ID', ''),
      secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY', ''),
      bucketName: getEnv('R2_BUCKET_NAME', 'brand-assets'),
      publicUrl: getEnv('R2_PUBLIC_URL', ''),
    },
    sentry: {
      dsn: getEnv('SENTRY_DSN', ''),
      environment: getEnv('SENTRY_ENVIRONMENT', 'development'),
    },
  };
}

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function getEnvEnum<T extends string>(key: string, allowed: T[], defaultValue: T): T {
  const value = process.env[key] as T | undefined;
  if (value && !allowed.includes(value)) {
    throw new ConfigError(`Invalid value for ${key}: "${value}". Allowed: ${allowed.join(', ')}`);
  }
  return value ?? defaultValue;
}
