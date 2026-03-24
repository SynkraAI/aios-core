/**
 * Static Package Exporter — Type Definitions
 *
 * BSS-5.8: Static Package Export (NFR-9.5).
 */

import type { BuildType } from '../static-generator';

/**
 * Options for exporting a static site to a ZIP archive.
 */
export interface ExportOptions {
  /** Client identifier */
  readonly clientId: string;
  /** Build type that was generated */
  readonly buildType: BuildType;
  /** Path to a completed static build output directory */
  readonly sourceDir: string;
  /** Destination ZIP file path */
  readonly outputPath: string;
  /** Include README.txt with deployment instructions (default: true) */
  readonly includeReadme?: boolean;
  /** Include sitemap.xml if present (default: true) */
  readonly includeSitemap?: boolean;
  /** Deduplicate assets so each file appears only once (default: true) */
  readonly deduplicateAssets?: boolean;
}

/**
 * Result of a successful export operation.
 */
export interface ExportResult {
  /** Absolute path to the created ZIP file */
  readonly zipPath: string;
  /** Number of files in the ZIP */
  readonly fileCount: number;
  /** Total ZIP size in bytes */
  readonly sizeBytes: number;
  /** Total ZIP size formatted as KB */
  readonly sizeKB: string;
}

/**
 * Error thrown when ZIP export fails verification.
 */
export class ExportError extends Error {
  public readonly zipPath: string;

  constructor(message: string, zipPath: string) {
    super(message);
    this.name = 'ExportError';
    this.zipPath = zipPath;
  }
}
