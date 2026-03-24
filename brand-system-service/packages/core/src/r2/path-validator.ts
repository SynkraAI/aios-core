/**
 * Security: Path validation for R2 operations.
 * Prevents path traversal attacks and enforces client-id prefix.
 *
 * @module r2/path-validator
 */

import path from 'node:path';

import type { AssetFolder, FileValidationConfig } from './types';
import { ASSET_FOLDERS, DEFAULT_FILE_VALIDATION } from './types';

/** Result of a path validation check. */
export interface PathValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

/**
 * Validate that an R2 key is safe and belongs to the specified client.
 *
 * Security checks:
 * 1. No path traversal (../, ..\)
 * 2. No absolute paths (leading /)
 * 3. No double slashes (//)
 * 4. No null bytes
 * 5. Key must start with client-id prefix
 * 6. Client-id must be alphanumeric with hyphens/underscores
 *
 * @param clientId - The client identifier
 * @param r2Key - The R2 object key to validate
 * @returns Validation result
 */
export function validatePath(clientId: string, r2Key: string): PathValidationResult {
  // Validate client-id format
  if (!isValidClientId(clientId)) {
    return {
      valid: false,
      error: `Invalid client-id format: "${clientId}". Must be alphanumeric with hyphens/underscores.`,
    };
  }

  // Check for null bytes
  if (r2Key.includes('\0')) {
    return { valid: false, error: 'Path contains null bytes.' };
  }

  // Check for empty key
  if (!r2Key || r2Key.trim() === '') {
    return { valid: false, error: 'R2 key cannot be empty.' };
  }

  // Check for absolute paths
  if (r2Key.startsWith('/')) {
    return { valid: false, error: 'Absolute paths are not allowed.' };
  }

  // Check for path traversal
  if (containsPathTraversal(r2Key)) {
    return { valid: false, error: 'Path traversal detected (../ or ..\\ sequences).' };
  }

  // Check for double slashes
  if (r2Key.includes('//')) {
    return { valid: false, error: 'Double slashes are not allowed in paths.' };
  }

  // Enforce client-id prefix
  const expectedPrefix = `${clientId}/`;
  if (!r2Key.startsWith(expectedPrefix)) {
    return { valid: false, error: `Key must start with client prefix "${expectedPrefix}".` };
  }

  // Enforce folder membership against ASSET_FOLDERS (FR-8.8)
  const afterPrefix = r2Key.slice(expectedPrefix.length);
  if (afterPrefix) {
    const folder = afterPrefix.split('/')[0];
    if (folder && !ASSET_FOLDERS.includes(folder as AssetFolder)) {
      return {
        valid: false,
        error: `Invalid folder "${folder}". Must be one of: ${ASSET_FOLDERS.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Build a safe R2 key from components.
 *
 * @param clientId - Client identifier
 * @param folder - Asset folder (e.g., '01-brand-identity')
 * @param filename - File name
 * @returns Safe R2 key
 */
export function buildR2Key(clientId: string, folder: string, filename: string): string {
  const sanitizedFilename = sanitizeFilename(filename);
  return `${clientId}/${folder}/${sanitizedFilename}`;
}

/**
 * Validate a file against the allowed types and size constraints.
 *
 * @param filename - File name to check extension
 * @param sizeBytes - File size in bytes
 * @param mimeType - Optional MIME type to validate
 * @param config - Validation config (defaults to DEFAULT_FILE_VALIDATION)
 * @returns Validation result
 */
export function validateFile(
  filename: string,
  sizeBytes: number,
  mimeType?: string,
  config: FileValidationConfig = DEFAULT_FILE_VALIDATION,
): PathValidationResult {
  // Check file size
  if (sizeBytes > config.maxSizeBytes) {
    const maxMB = Math.round(config.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size ${Math.round(sizeBytes / (1024 * 1024))}MB exceeds maximum ${maxMB}MB.`,
    };
  }

  if (sizeBytes <= 0) {
    return { valid: false, error: 'File size must be greater than zero.' };
  }

  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  if (!ext) {
    return { valid: false, error: 'File must have an extension.' };
  }

  if (!config.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed. Allowed: ${config.allowedExtensions.join(', ')}`,
    };
  }

  // Check MIME type if provided
  if (mimeType && !config.allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: `MIME type "${mimeType}" is not allowed.` };
  }

  return { valid: true };
}

/**
 * Validate client-id format.
 * Must be 1-64 chars, alphanumeric with hyphens and underscores.
 */
function isValidClientId(clientId: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(clientId);
}

/**
 * Check if path contains traversal sequences.
 */
function containsPathTraversal(p: string): boolean {
  // Normalize to forward slashes for consistent checking
  const normalized = p.replace(/\\/g, '/');

  // Check for ../ or parent directory references
  const segments = normalized.split('/');
  for (const segment of segments) {
    if (segment === '..' || segment === '.') {
      return true;
    }
  }

  return false;
}

/**
 * Sanitize a filename, removing dangerous characters.
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  return filename
    .replace(/[\\/\0]/g, '')
    .replace(/\.\./g, '')
    .trim();
}
