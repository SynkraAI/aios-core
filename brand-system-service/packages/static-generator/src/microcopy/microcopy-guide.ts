/**
 * Microcopy Guide
 *
 * Validates microcopy input and produces structured data for template rendering.
 * All 9 sections are required with at least one entry each.
 *
 * BSS-5.7 AC-5, AC-6 — FR-3.8.
 */

import type {
  MicrocopyInput,
  MicrocopyData,
  MicrocopySection,
  MicrocopyValidationError,
} from './types';

/**
 * The 9 required microcopy sections and their display titles.
 */
const REQUIRED_SECTIONS = [
  { key: 'buttons', title: 'Button Labels', slug: 'button-labels' },
  { key: 'formLabels', title: 'Form Labels', slug: 'form-labels' },
  { key: 'placeholders', title: 'Placeholders', slug: 'placeholders' },
  { key: 'errorMessages', title: 'Error Messages', slug: 'error-messages' },
  { key: 'emptyStates', title: 'Empty States', slug: 'empty-states' },
  { key: 'loadingStates', title: 'Loading States', slug: 'loading-states' },
  { key: 'successConfirmations', title: 'Success Confirmations', slug: 'success-confirmations' },
  { key: 'notFoundCopy', title: '404 Copy', slug: 'not-found-copy' },
  { key: 'cookieBanner', title: 'Cookie Banner Copy', slug: 'cookie-banner' },
] as const;

/**
 * MicrocopyGuide validates microcopy input and produces structured data
 * for the microcopy guide template.
 */
export class MicrocopyGuide {
  /**
   * Validate microcopy input.
   * Returns an array of validation errors. Empty array = valid.
   */
  validate(input: MicrocopyInput): MicrocopyValidationError[] {
    const errors: MicrocopyValidationError[] = [];

    for (const section of REQUIRED_SECTIONS) {
      const items = input[section.key as keyof MicrocopyInput];
      if (!Array.isArray(items) || items.length === 0) {
        errors.push({
          section: section.title,
          message: `Section "${section.title}" is required and must have at least one entry`,
        });
      }
    }

    return errors;
  }

  /**
   * Build structured MicrocopyData from validated input.
   * Throws if validation fails.
   */
  build(input: MicrocopyInput): MicrocopyData {
    const errors = this.validate(input);
    if (errors.length > 0) {
      const messages = errors.map((e) => e.message).join('; ');
      throw new Error(`Microcopy validation failed: ${messages}`);
    }

    const sections: MicrocopySection[] = REQUIRED_SECTIONS.map((section) => ({
      title: section.title,
      slug: section.slug,
      items: input[section.key as keyof MicrocopyInput] as readonly import('./types').MicrocopyItem[],
    }));

    const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

    return {
      clientId: input.clientId,
      brandName: input.brandName,
      sections,
      totalItems,
    };
  }
}
