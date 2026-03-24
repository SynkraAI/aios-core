/**
 * CopyValidator
 *
 * Validates a LandingPageCopy object for completeness, H1 length,
 * CTA label format, and word count constraints.
 *
 * Word count rules (FR-3.1):
 * - Target range: 1500-3000 words
 * - Warn below 1200
 * - Fail below 1000 or above 3500
 *
 * H1 rules:
 * - Target: 5-10 words
 * - Warn at 4 words
 * - Fail at <= 3 or >= 12
 *
 * CTA label rules:
 * - Must start with an approved action verb
 *
 * @module copy-framework/copy-validator
 */

import type {
  LandingPageCopy,
  ValidationResult,
  ValidationIssue,
  SectionWordCount,
} from './types';

/**
 * Approved action verbs for CTA labels.
 */
const APPROVED_CTA_VERBS: readonly string[] = [
  'Start',
  'Get',
  'Download',
  'Book',
  'Schedule',
  'Try',
  'Request',
  'Join',
  'See',
  'Discover',
] as const;

/**
 * Count words in a string by splitting on whitespace.
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Collect all text from a section into a single string for word counting.
 */
function collectSectionText(section: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const value of Object.values(section)) {
    if (typeof value === 'string') {
      parts.push(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          parts.push(item);
        } else if (typeof item === 'object' && item !== null) {
          parts.push(collectSectionText(item as Record<string, unknown>));
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      parts.push(collectSectionText(value as Record<string, unknown>));
    }
  }

  return parts.join(' ');
}

/**
 * The 8 required section keys that must be present in a LandingPageCopy.
 * Note: pricing is optional per the schema.
 */
const REQUIRED_SECTIONS = [
  'hero',
  'problem',
  'solution',
  'howItWorks',
  'socialProof',
  'faq',
  'finalCta',
] as const;

/**
 * All sections that contribute to word count (including optional pricing).
 */
const ALL_SECTIONS = [
  'hero',
  'problem',
  'solution',
  'howItWorks',
  'socialProof',
  'pricing',
  'faq',
  'finalCta',
] as const;

/**
 * Validates a LandingPageCopy object.
 */
export class CopyValidator {
  /**
   * Validate a LandingPageCopy and return a structured result.
   */
  validate(copy: LandingPageCopy): ValidationResult {
    const issues: ValidationIssue[] = [];
    const wordCounts: SectionWordCount[] = [];
    let totalWordCount = 0;

    // 1. Validate required sections are present and populated
    this.validateRequiredSections(copy, issues);

    // 2. Validate H1 word count
    this.validateH1(copy, issues);

    // 3. Validate CTA labels
    this.validateCtaLabels(copy, issues);

    // 4. Calculate word counts per section
    for (const section of ALL_SECTIONS) {
      const sectionData = copy[section as keyof LandingPageCopy];
      if (sectionData && typeof sectionData === 'object') {
        const text = collectSectionText(sectionData as unknown as Record<string, unknown>);
        const wc = countWords(text);
        wordCounts.push({ section, wordCount: wc });
        totalWordCount += wc;
      }
    }

    // 5. Validate total word count
    this.validateWordCount(totalWordCount, issues);

    // Determine overall validity: valid if no errors (warnings are OK)
    const hasErrors = issues.some((i) => i.severity === 'error');

    return {
      valid: !hasErrors,
      issues,
      wordCounts,
      totalWordCount,
    };
  }

  private validateRequiredSections(
    copy: LandingPageCopy,
    issues: ValidationIssue[]
  ): void {
    for (const section of REQUIRED_SECTIONS) {
      const value = copy[section as keyof LandingPageCopy];
      if (!value) {
        issues.push({
          section,
          field: section,
          message: `Required section "${section}" is missing`,
          severity: 'error',
        });
      }
    }

    // Check that specific sub-fields are populated
    if (copy.hero && !copy.hero.h1) {
      issues.push({
        section: 'hero',
        field: 'h1',
        message: 'Hero section is missing the H1 headline',
        severity: 'error',
      });
    }

    if (copy.problem && (!copy.problem.bullets || copy.problem.bullets.length === 0)) {
      issues.push({
        section: 'problem',
        field: 'bullets',
        message: 'Problem section must have at least one bullet point',
        severity: 'error',
      });
    }

    if (copy.solution && (!copy.solution.features || copy.solution.features.length === 0)) {
      issues.push({
        section: 'solution',
        field: 'features',
        message: 'Solution section must have at least one feature',
        severity: 'error',
      });
    }

    if (copy.howItWorks && (!copy.howItWorks.steps || copy.howItWorks.steps.length === 0)) {
      issues.push({
        section: 'howItWorks',
        field: 'steps',
        message: 'How It Works section must have at least one step',
        severity: 'error',
      });
    }

    if (copy.faq && (!copy.faq.items || copy.faq.items.length === 0)) {
      issues.push({
        section: 'faq',
        field: 'items',
        message: 'FAQ section must have at least one item',
        severity: 'error',
      });
    }

    if (copy.finalCta && !copy.finalCta.ctaLabel) {
      issues.push({
        section: 'finalCta',
        field: 'ctaLabel',
        message: 'Final CTA section is missing the CTA label',
        severity: 'error',
      });
    }
  }

  private validateH1(copy: LandingPageCopy, issues: ValidationIssue[]): void {
    if (!copy.hero?.h1) return;

    const wordCount = countWords(copy.hero.h1);

    if (wordCount <= 3) {
      issues.push({
        section: 'hero',
        field: 'h1',
        message: `H1 has ${wordCount} words (must be 5-10, minimum 4)`,
        severity: 'error',
      });
    } else if (wordCount === 4) {
      issues.push({
        section: 'hero',
        field: 'h1',
        message: `H1 has ${wordCount} words (recommended 5-10)`,
        severity: 'warning',
      });
    } else if (wordCount >= 12) {
      issues.push({
        section: 'hero',
        field: 'h1',
        message: `H1 has ${wordCount} words (must be 5-10, maximum 11)`,
        severity: 'error',
      });
    }
    // 5-10 words: pass (no issue)
    // 11 words: also pass (fail is >= 12)
  }

  private validateCtaLabels(
    copy: LandingPageCopy,
    issues: ValidationIssue[]
  ): void {
    const ctaLabels: Array<{ section: string; field: string; label: string }> = [];

    if (copy.hero?.ctaLabel) {
      ctaLabels.push({ section: 'hero', field: 'ctaLabel', label: copy.hero.ctaLabel });
    }

    if (copy.finalCta?.ctaLabel) {
      ctaLabels.push({ section: 'finalCta', field: 'ctaLabel', label: copy.finalCta.ctaLabel });
    }

    if (copy.pricing?.tiers) {
      for (let i = 0; i < copy.pricing.tiers.length; i++) {
        const tier = copy.pricing.tiers[i];
        if (tier?.ctaLabel) {
          ctaLabels.push({
            section: 'pricing',
            field: `tiers[${i}].ctaLabel`,
            label: tier.ctaLabel,
          });
        }
      }
    }

    for (const cta of ctaLabels) {
      const firstWord = cta.label.trim().split(/\s+/)[0] ?? '';
      const isApproved = APPROVED_CTA_VERBS.some(
        (verb) => verb.toLowerCase() === firstWord.toLowerCase()
      );

      if (!isApproved) {
        issues.push({
          section: cta.section,
          field: cta.field,
          message: `CTA label "${cta.label}" does not start with an approved action verb (${APPROVED_CTA_VERBS.join(', ')})`,
          severity: 'warning',
        });
      }
    }
  }

  private validateWordCount(
    totalWordCount: number,
    issues: ValidationIssue[]
  ): void {
    if (totalWordCount < 1000) {
      issues.push({
        section: 'total',
        field: 'wordCount',
        message: `Total word count is ${totalWordCount} (minimum 1000)`,
        severity: 'error',
      });
    } else if (totalWordCount < 1200) {
      issues.push({
        section: 'total',
        field: 'wordCount',
        message: `Total word count is ${totalWordCount} (recommended minimum 1500)`,
        severity: 'warning',
      });
    } else if (totalWordCount > 3500) {
      issues.push({
        section: 'total',
        field: 'wordCount',
        message: `Total word count is ${totalWordCount} (maximum 3500)`,
        severity: 'error',
      });
    } else if (totalWordCount > 3000) {
      issues.push({
        section: 'total',
        field: 'wordCount',
        message: `Total word count is ${totalWordCount} (recommended maximum 3000)`,
        severity: 'warning',
      });
    }
  }
}
