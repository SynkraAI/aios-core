/**
 * PromptRegistry — versioned template registry with A/B variant support.
 *
 * @see BSS-3.3: Prompt Template Library
 */

import * as semver from 'semver';
import type {
  PromptTemplate,
  DeliverableType,
  TemplateSummary,
} from './types';

const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Error thrown when template validation fails on registration.
 */
export class TemplateValidationError extends Error {
  public readonly code = 'TEMPLATE_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Registry for versioned prompt templates with A/B variant support.
 *
 * Templates are indexed by `deliverableType`. Multiple versions and
 * variants can coexist. `getTemplate()` resolves the latest active
 * version by default.
 */
export class PromptRegistry {
  private readonly templates: PromptTemplate[] = [];

  /**
   * Register a template. Validates version format and changelog presence.
   * @throws TemplateValidationError if validation fails.
   */
  registerTemplate(template: PromptTemplate): void {
    // 1. Version must match semver
    if (!SEMVER_REGEX.test(template.version)) {
      throw new TemplateValidationError(
        `Invalid version "${template.version}" for template "${template.id}". Must be MAJOR.MINOR.PATCH.`,
      );
    }

    // 2. Changelog must have an entry for the current version
    const hasChangelogEntry = template.changelog.some(
      (entry) => entry.version === template.version,
    );
    if (!hasChangelogEntry) {
      throw new TemplateValidationError(
        `Template "${template.id}" v${template.version} is missing a changelog entry for version ${template.version}.`,
      );
    }

    this.templates.push(template);
  }

  /**
   * Get a template by deliverable type.
   * - If `version` is omitted, returns the latest active version.
   * - If `variant` is omitted, returns variant "A".
   */
  getTemplate(
    deliverableType: DeliverableType,
    version?: string,
    variant?: string,
  ): PromptTemplate | undefined {
    const targetVariant = variant ?? 'A';

    const candidates = this.templates.filter(
      (t) =>
        t.deliverableType === deliverableType &&
        t.variant === targetVariant &&
        t.status === 'active',
    );

    if (candidates.length === 0) return undefined;

    if (version) {
      return candidates.find((t) => t.version === version);
    }

    // Return highest semver
    candidates.sort((a, b) => semver.compare(b.version, a.version));
    return candidates[0];
  }

  /**
   * List metadata for all registered templates.
   */
  listTemplates(): TemplateSummary[] {
    return this.templates.map((t) => ({
      id: t.id,
      deliverableType: t.deliverableType,
      version: t.version,
      status: t.status,
      variant: t.variant,
    }));
  }
}
