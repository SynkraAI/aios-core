/**
 * Microcopy Guide — Type Definitions
 *
 * BSS-5.7 AC-5, AC-6: Microcopy guide page and validation.
 */

/**
 * A single microcopy item with context and copy text.
 */
export interface MicrocopyItem {
  /** Where this microcopy is used (e.g., "Login button", "Email field") */
  readonly context: string;
  /** The actual microcopy text */
  readonly copy: string;
  /** Optional notes about usage or tone */
  readonly notes?: string;
}

/**
 * Input for the MicrocopyGuide class.
 * All 9 sections are required with at least one entry each.
 */
export interface MicrocopyInput {
  readonly clientId: string;
  readonly brandName: string;
  readonly buttons: readonly MicrocopyItem[];
  readonly formLabels: readonly MicrocopyItem[];
  readonly placeholders: readonly MicrocopyItem[];
  readonly errorMessages: readonly MicrocopyItem[];
  readonly emptyStates: readonly MicrocopyItem[];
  readonly loadingStates: readonly MicrocopyItem[];
  readonly successConfirmations: readonly MicrocopyItem[];
  readonly notFoundCopy: readonly MicrocopyItem[];
  readonly cookieBanner: readonly MicrocopyItem[];
}

/**
 * Section definition for the microcopy guide.
 */
export interface MicrocopySection {
  /** Section title */
  readonly title: string;
  /** Section slug for anchor links */
  readonly slug: string;
  /** Items in this section */
  readonly items: readonly MicrocopyItem[];
}

/**
 * Processed microcopy data ready for template rendering.
 */
export interface MicrocopyData {
  readonly clientId: string;
  readonly brandName: string;
  readonly sections: readonly MicrocopySection[];
  readonly totalItems: number;
}

/**
 * Validation error for microcopy input.
 */
export interface MicrocopyValidationError {
  readonly section: string;
  readonly message: string;
}
