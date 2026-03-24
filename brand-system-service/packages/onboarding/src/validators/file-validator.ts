/**
 * File validator for asset uploads (AC-5).
 *
 * Validates file type, MIME type, and size constraints
 * for logo and asset uploads.
 *
 * @module onboarding/validators/file-validator
 */

import type { AssetFileInfo, ValidationResult, ValidationError } from '../types';
import {
  ALLOWED_LOGO_EXTENSIONS,
  ALLOWED_LOGO_MIME_TYPES,
  MAX_ASSET_FILE_SIZE_BYTES,
} from '../types';

/**
 * Validate a logo file upload.
 *
 * Rules per AC-5:
 * - SVG, PNG, or AI format
 * - Max 10 MB per file
 *
 * @param file - File info to validate
 * @returns Validation result
 */
export function validateLogoFile(file: AssetFileInfo): ValidationResult {
  const errors: ValidationError[] = [];

  // Check file extension
  const ext = getFileExtension(file.filename);
  if (!ALLOWED_LOGO_EXTENSIONS.includes(ext as (typeof ALLOWED_LOGO_EXTENSIONS)[number])) {
    errors.push({
      field: 'filename',
      message: `File extension "${ext}" is not allowed. Allowed: ${ALLOWED_LOGO_EXTENSIONS.join(', ')}.`,
      code: 'INVALID_EXTENSION',
    });
  }

  // Check MIME type
  if (
    !ALLOWED_LOGO_MIME_TYPES.includes(
      file.mimeType as (typeof ALLOWED_LOGO_MIME_TYPES)[number],
    )
  ) {
    errors.push({
      field: 'mimeType',
      message: `MIME type "${file.mimeType}" is not allowed. Allowed: ${ALLOWED_LOGO_MIME_TYPES.join(', ')}.`,
      code: 'INVALID_MIME_TYPE',
    });
  }

  // Check file size (AC-5: max 10 MB per file)
  if (file.sizeBytes > MAX_ASSET_FILE_SIZE_BYTES) {
    const maxMB = Math.round(MAX_ASSET_FILE_SIZE_BYTES / (1024 * 1024));
    const fileMB = (file.sizeBytes / (1024 * 1024)).toFixed(1);
    errors.push({
      field: 'sizeBytes',
      message: `File size ${fileMB}MB exceeds maximum ${maxMB}MB.`,
      code: 'FILE_TOO_LARGE',
    });
  }

  // Check for zero-size files
  if (file.sizeBytes <= 0) {
    errors.push({
      field: 'sizeBytes',
      message: 'File size must be greater than zero.',
      code: 'FILE_EMPTY',
    });
  }

  // Check filename is not empty
  if (!file.filename || file.filename.trim() === '') {
    errors.push({
      field: 'filename',
      message: 'Filename cannot be empty.',
      code: 'EMPTY_FILENAME',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate the complete asset upload step.
 *
 * @param primaryLogo - Required primary logo file info
 * @param secondaryLogo - Optional secondary logo file info
 * @returns Validation result
 */
export function validateAssetUpload(
  primaryLogo: AssetFileInfo,
  secondaryLogo?: AssetFileInfo,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Primary logo is required per AC-5
  const primaryResult = validateLogoFile(primaryLogo);
  if (!primaryResult.valid) {
    errors.push(
      ...primaryResult.errors.map((e) => ({
        ...e,
        field: `primaryLogo.${e.field}`,
      })),
    );
  }

  // Secondary logo is optional, but if provided must be valid
  if (secondaryLogo) {
    const secondaryResult = validateLogoFile(secondaryLogo);
    if (!secondaryResult.valid) {
      errors.push(
        ...secondaryResult.errors.map((e) => ({
          ...e,
          field: `secondaryLogo.${e.field}`,
        })),
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract file extension from filename (lowercase, with dot).
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return filename.slice(lastDot).toLowerCase();
}
