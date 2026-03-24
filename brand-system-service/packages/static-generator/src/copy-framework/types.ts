/**
 * Copy Framework Types
 *
 * Defines the data contracts between the copy generation pipeline (BSS-3.7)
 * and the template rendering layer (BSS-5.2).
 *
 * CopyBrief = input from client brief
 * LandingPageCopy = output matching landing-page.schema.json 1:1
 *
 * @module copy-framework/types
 */

// ---------------------------------------------------------------------------
// CopyBrief — Input contract
// ---------------------------------------------------------------------------

/**
 * Input brief that feeds the copy framework.
 * Produced from a client brief or by the BSS-3.7 AI copy pipeline.
 */
export interface CopyBrief {
  /** Client identifier for token resolution */
  readonly clientId: string;
  /** Name of the product or service being promoted */
  readonly productName: string;
  /** Description of the target audience */
  readonly targetAudience: string;
  /** The primary pain point the audience faces */
  readonly mainPainPoint: string;
  /** The primary benefit the product delivers */
  readonly primaryBenefit: string;
  /** Supporting benefits (max 3) */
  readonly supportingBenefits: readonly string[];
  /** Social proof testimonials */
  readonly socialProof: readonly Testimonial[];
  /** Pricing tiers (optional) */
  readonly pricingTiers?: readonly PricingTierBrief[];
  /** FAQ items (optional) */
  readonly faqItems?: readonly FaqItemBrief[];
  /** Guarantee or risk-reversal statement (optional) */
  readonly guarantee?: string;
}

/**
 * A testimonial entry within the brief.
 */
export interface Testimonial {
  readonly name: string;
  readonly role?: string;
  readonly quote: string;
}

/**
 * A pricing tier within the brief.
 */
export interface PricingTierBrief {
  readonly name: string;
  readonly price: string;
  readonly featured?: boolean;
  readonly features: readonly string[];
  readonly ctaLabel?: string;
  readonly ctaUrl?: string;
}

/**
 * An FAQ item within the brief.
 */
export interface FaqItemBrief {
  readonly question: string;
  readonly answer: string;
}

// ---------------------------------------------------------------------------
// LandingPageCopy — Output contract (maps 1:1 to landing-page.schema.json)
// ---------------------------------------------------------------------------

/**
 * Social proof stat shown in the hero section.
 */
export interface HeroSocialProof {
  readonly stat: string;
  readonly label: string;
}

/**
 * Hero section copy.
 */
export interface HeroCopy {
  readonly preHeadline?: string;
  readonly h1: string;
  readonly subHeadline?: string;
  readonly ctaLabel?: string;
  readonly ctaUrl?: string;
  readonly socialProof?: HeroSocialProof;
}

/**
 * Problem section copy.
 */
export interface ProblemCopy {
  readonly headline: string;
  readonly bullets: readonly string[];
}

/**
 * A feature-benefit pair in the solution section.
 */
export interface SolutionFeature {
  readonly feature: string;
  readonly benefit: string;
}

/**
 * Solution section copy.
 */
export interface SolutionCopy {
  readonly headline: string;
  readonly features: readonly SolutionFeature[];
}

/**
 * A step in the how-it-works section.
 */
export interface HowItWorksStep {
  readonly title: string;
  readonly description: string;
}

/**
 * How-it-works section copy.
 */
export interface HowItWorksCopy {
  readonly headline: string;
  readonly steps: readonly HowItWorksStep[];
}

/**
 * A testimonial in the social proof section.
 */
export interface SocialProofTestimonial {
  readonly name: string;
  readonly role?: string;
  readonly quote: string;
}

/**
 * A metric in the social proof section.
 */
export interface SocialProofMetric {
  readonly stat: string;
  readonly label: string;
}

/**
 * Social proof section copy.
 */
export interface SocialProofCopy {
  readonly headline: string;
  readonly testimonials?: readonly SocialProofTestimonial[];
  readonly metrics?: readonly SocialProofMetric[];
}

/**
 * A pricing tier in the pricing section.
 */
export interface PricingTier {
  readonly name: string;
  readonly price: string;
  readonly featured?: boolean;
  readonly features: readonly string[];
  readonly ctaLabel?: string;
  readonly ctaUrl?: string;
}

/**
 * Pricing section copy (optional section).
 */
export interface PricingCopy {
  readonly headline?: string;
  readonly tiers: readonly PricingTier[];
}

/**
 * An FAQ item.
 */
export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/**
 * FAQ section copy.
 */
export interface FaqCopy {
  readonly headline?: string;
  readonly items: readonly FaqItem[];
}

/**
 * Final CTA section copy.
 */
export interface FinalCtaCopy {
  readonly headline: string;
  readonly riskRemoval?: string;
  readonly ctaLabel: string;
  readonly ctaUrl?: string;
}

/**
 * Complete landing page copy output.
 * Maps 1:1 to landing-page.schema.json from BSS-5.2.
 *
 * Required sections (per schema): hero, problem, solution, howItWorks,
 * socialProof, faq, finalCta. Pricing is optional.
 */
export interface LandingPageCopy {
  readonly clientId: string;
  readonly title?: string;
  readonly hero: HeroCopy;
  readonly problem: ProblemCopy;
  readonly solution: SolutionCopy;
  readonly howItWorks: HowItWorksCopy;
  readonly socialProof: SocialProofCopy;
  readonly pricing?: PricingCopy;
  readonly faq: FaqCopy;
  readonly finalCta: FinalCtaCopy;
}

// ---------------------------------------------------------------------------
// Validation types
// ---------------------------------------------------------------------------

/** Severity level for validation issues. */
export type ValidationSeverity = 'error' | 'warning';

/**
 * A single validation issue found by CopyValidator.
 */
export interface ValidationIssue {
  readonly section: string;
  readonly field: string;
  readonly message: string;
  readonly severity: ValidationSeverity;
}

/**
 * Per-section word count entry.
 */
export interface SectionWordCount {
  readonly section: string;
  readonly wordCount: number;
}

/**
 * Result returned by CopyValidator.validate().
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly wordCounts: readonly SectionWordCount[];
  readonly totalWordCount: number;
}
