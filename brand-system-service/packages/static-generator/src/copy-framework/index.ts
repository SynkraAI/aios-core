/**
 * Copy Framework — barrel export
 *
 * Re-exports all types, classes, and functions from the copy framework module.
 *
 * @module copy-framework
 */

export { LandingPageCopyFramework } from './copy-framework';
export { CopyValidator } from './copy-validator';
export { CopyPlaceholderGenerator } from './placeholder-generator';
export { copyToTemplateVars } from './template-adapter';

export type {
  // Input types
  CopyBrief,
  Testimonial,
  PricingTierBrief,
  FaqItemBrief,

  // Output types
  LandingPageCopy,
  HeroCopy,
  ProblemCopy,
  SolutionCopy,
  SolutionFeature,
  HowItWorksCopy,
  HowItWorksStep,
  SocialProofCopy,
  SocialProofTestimonial,
  SocialProofMetric,
  PricingCopy,
  PricingTier,
  FaqCopy,
  FaqItem,
  FinalCtaCopy,
  HeroSocialProof,

  // Validation types
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  SectionWordCount,
} from './types';
