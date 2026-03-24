/**
 * Form validators for all intake steps.
 *
 * Each step has a dedicated validation function that returns
 * a consistent ValidationResult.
 *
 * @module onboarding/validators/form-validators
 */

import type {
  CompanyBasics,
  BrandPersonality,
  VisualPreference,
  AssetUpload,
  CompetitorUrls,
  DeliverableSelection,
  IntakeFormData,
  ValidationResult,
  ValidationError,
  PersonalityScaleValue,
  PersonalityDimension,
} from '../types';
import { PERSONALITY_DIMENSIONS, BSS_DELIVERABLE_TYPES } from '../types';
import { getInvalidMoodIds } from '../mood-tiles';
import { validateCompetitorUrls } from './url-validator';
import { validateAssetUpload } from './file-validator';

/** Minimum mood tile selections per AC-4. */
const MIN_MOOD_SELECTIONS = 2;

/** Maximum mood tile selections per AC-4. */
const MAX_MOOD_SELECTIONS = 3;

/** Minimum deliverables required per AC-7. */
const MIN_DELIVERABLES = 1;

/**
 * Validate Step 1: Company Basics.
 */
export function validateCompanyBasics(data: CompanyBasics): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.companyName || data.companyName.trim() === '') {
    errors.push({
      field: 'companyName',
      message: 'Company name is required.',
      code: 'REQUIRED',
    });
  }

  if (!data.industry || data.industry.trim() === '') {
    errors.push({
      field: 'industry',
      message: 'Industry is required.',
      code: 'REQUIRED',
    });
  }

  if (!data.targetAudience || data.targetAudience.trim() === '') {
    errors.push({
      field: 'targetAudience',
      message: 'Target audience is required.',
      code: 'REQUIRED',
    });
  }

  if (!data.tagline || data.tagline.trim() === '') {
    errors.push({
      field: 'tagline',
      message: 'Tagline is required.',
      code: 'REQUIRED',
    });
  }

  if (!data.foundingYear || data.foundingYear < 1800 || data.foundingYear > new Date().getFullYear() + 1) {
    errors.push({
      field: 'foundingYear',
      message: `Founding year must be between 1800 and ${new Date().getFullYear() + 1}.`,
      code: 'INVALID_RANGE',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a value is a valid PersonalityScaleValue (1-5).
 */
function isValidScaleValue(value: unknown): value is PersonalityScaleValue {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Validate Step 2: Brand Personality.
 * All scale values must be integers 1-5 per AC-3.
 */
export function validateBrandPersonality(data: BrandPersonality): ValidationResult {
  const errors: ValidationError[] = [];

  for (const dimension of PERSONALITY_DIMENSIONS) {
    const value = data[dimension as PersonalityDimension];
    if (!isValidScaleValue(value)) {
      errors.push({
        field: dimension,
        message: `${dimension} must be an integer between 1 and 5. Got: ${String(value)}.`,
        code: 'INVALID_SCALE_VALUE',
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate Step 3: Visual Preferences.
 * Must select 2-3 mood tiles per AC-4.
 */
export function validateVisualPreferences(data: VisualPreference): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.selectedMoodIds.length < MIN_MOOD_SELECTIONS) {
    errors.push({
      field: 'selectedMoodIds',
      message: `At least ${MIN_MOOD_SELECTIONS} mood tiles must be selected. Got ${data.selectedMoodIds.length}.`,
      code: 'MIN_SELECTIONS',
    });
  }

  if (data.selectedMoodIds.length > MAX_MOOD_SELECTIONS) {
    errors.push({
      field: 'selectedMoodIds',
      message: `Maximum ${MAX_MOOD_SELECTIONS} mood tiles allowed. Got ${data.selectedMoodIds.length}.`,
      code: 'MAX_SELECTIONS',
    });
  }

  const invalidIds = getInvalidMoodIds(data.selectedMoodIds);
  if (invalidIds.length > 0) {
    errors.push({
      field: 'selectedMoodIds',
      message: `Invalid mood tile IDs: ${invalidIds.join(', ')}.`,
      code: 'INVALID_MOOD_ID',
    });
  }

  // Check for duplicates
  const uniqueIds = new Set(data.selectedMoodIds);
  if (uniqueIds.size !== data.selectedMoodIds.length) {
    errors.push({
      field: 'selectedMoodIds',
      message: 'Duplicate mood tile selections are not allowed.',
      code: 'DUPLICATE_SELECTION',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate Step 4: Asset Upload.
 * Uses file-validator for individual file checks.
 */
export function validateAssetUploadStep(data: AssetUpload): ValidationResult {
  const errors: ValidationError[] = [];

  // Primary logo is required
  if (!data.primaryLogo) {
    errors.push({
      field: 'primaryLogo',
      message: 'Primary logo is required.',
      code: 'REQUIRED',
    });
    return { valid: false, errors };
  }

  const fileResult = validateAssetUpload(data.primaryLogo, data.secondaryLogo);
  if (!fileResult.valid) {
    errors.push(...fileResult.errors);
  }

  // Validate brand color hex codes
  if (data.brandColors) {
    data.brandColors.forEach((color, index) => {
      if (!isValidHexColor(color)) {
        errors.push({
          field: `brandColors[${index}]`,
          message: `Invalid hex color: "${color}". Must be a valid hex color (e.g., #FF5733 or #F53).`,
          code: 'INVALID_HEX_COLOR',
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate Step 5: Competitor URLs.
 * Min 2, max 5 per AC-6.
 */
export function validateCompetitorUrlsStep(data: CompetitorUrls): ValidationResult {
  const urls = data.urls.map((entry) => entry.url);
  return validateCompetitorUrls(urls);
}

/**
 * Validate Step 6: Deliverable Selection.
 * At least one deliverable must be selected per AC-7.
 */
export function validateDeliverableSelection(data: DeliverableSelection): ValidationResult {
  const errors: ValidationError[] = [];

  if (data.selected.length < MIN_DELIVERABLES) {
    errors.push({
      field: 'selected',
      message: `At least ${MIN_DELIVERABLES} deliverable must be selected.`,
      code: 'MIN_DELIVERABLES',
    });
  }

  // Validate all selected types exist
  const invalidTypes = data.selected.filter(
    (type) => !BSS_DELIVERABLE_TYPES.includes(type),
  );
  if (invalidTypes.length > 0) {
    errors.push({
      field: 'selected',
      message: `Invalid deliverable types: ${invalidTypes.join(', ')}.`,
      code: 'INVALID_DELIVERABLE_TYPE',
    });
  }

  // Check for duplicates
  const uniqueTypes = new Set(data.selected);
  if (uniqueTypes.size !== data.selected.length) {
    errors.push({
      field: 'selected',
      message: 'Duplicate deliverable selections are not allowed.',
      code: 'DUPLICATE_SELECTION',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the complete intake form data.
 */
export function validateIntakeFormData(data: IntakeFormData): ValidationResult {
  const allErrors: ValidationError[] = [];

  const step1 = validateCompanyBasics(data.companyBasics);
  allErrors.push(...step1.errors);

  const step2 = validateBrandPersonality(data.brandPersonality);
  allErrors.push(...step2.errors);

  const step3 = validateVisualPreferences(data.visualPreferences);
  allErrors.push(...step3.errors);

  const step4 = validateAssetUploadStep(data.assetUpload);
  allErrors.push(...step4.errors);

  const step5 = validateCompetitorUrlsStep(data.competitorUrls);
  allErrors.push(...step5.errors);

  const step6 = validateDeliverableSelection(data.deliverableSelection);
  allErrors.push(...step6.errors);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Check if a string is a valid hex color.
 * Accepts #RGB, #RRGGBB, and #RRGGBBAA formats.
 */
function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}
