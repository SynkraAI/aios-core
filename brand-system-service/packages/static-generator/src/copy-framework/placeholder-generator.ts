/**
 * CopyPlaceholderGenerator
 *
 * Generates a complete LandingPageCopy with placeholder text
 * for all fields, enabling designers to preview page structure
 * before final copy is written.
 *
 * Placeholder convention: [SECTION FIELD] in uppercase within brackets.
 *
 * @module copy-framework/placeholder-generator
 */

import type {
  CopyBrief,
  LandingPageCopy,
} from './types';

/**
 * Generates a LandingPageCopy populated with labeled placeholder text.
 */
export class CopyPlaceholderGenerator {
  /**
   * Generate a complete LandingPageCopy with placeholder text
   * derived from the CopyBrief structure.
   */
  generate(brief: CopyBrief): LandingPageCopy {
    const copy: LandingPageCopy = {
      clientId: brief.clientId,
      title: `[PAGE TITLE FOR ${brief.productName.toUpperCase()}]`,
      hero: {
        preHeadline: `[HERO PRE-HEADLINE]`,
        h1: `[HERO HEADLINE FOR ${brief.productName.toUpperCase()}]`,
        subHeadline: `[HERO SUB-HEADLINE DESCRIBING ${brief.primaryBenefit.toUpperCase()}]`,
        ctaLabel: `[HERO CTA LABEL]`,
        ctaUrl: '#pricing',
        socialProof: {
          stat: `[HERO SOCIAL PROOF STAT]`,
          label: `[HERO SOCIAL PROOF LABEL]`,
        },
      },
      problem: {
        headline: `[PROBLEM HEADLINE]`,
        bullets: this.generateProblemBullets(brief),
      },
      solution: {
        headline: `[SOLUTION HEADLINE]`,
        features: this.generateSolutionFeatures(brief),
      },
      howItWorks: {
        headline: `[HOW IT WORKS HEADLINE]`,
        steps: [
          { title: `[STEP 1 TITLE]`, description: `[STEP 1 DESCRIPTION]` },
          { title: `[STEP 2 TITLE]`, description: `[STEP 2 DESCRIPTION]` },
          { title: `[STEP 3 TITLE]`, description: `[STEP 3 DESCRIPTION]` },
        ],
      },
      socialProof: {
        headline: `[SOCIAL PROOF HEADLINE]`,
        testimonials: this.generateTestimonialPlaceholders(brief),
        metrics: [
          { stat: `[METRIC 1 STAT]`, label: `[METRIC 1 LABEL]` },
          { stat: `[METRIC 2 STAT]`, label: `[METRIC 2 LABEL]` },
        ],
      },
      faq: {
        headline: `[FAQ HEADLINE]`,
        items: this.generateFaqPlaceholders(brief),
      },
      finalCta: {
        headline: `[FINAL CTA HEADLINE]`,
        riskRemoval: brief.guarantee
          ? `[GUARANTEE: ${brief.guarantee.toUpperCase()}]`
          : `[ENTER GUARANTEE OR RISK REMOVAL STATEMENT]`,
        ctaLabel: `[FINAL CTA LABEL]`,
        ctaUrl: '#contact',
      },
    };

    // Include pricing if tiers are provided in the brief
    if (brief.pricingTiers && brief.pricingTiers.length > 0) {
      return {
        ...copy,
        pricing: {
          headline: `[PRICING HEADLINE]`,
          tiers: brief.pricingTiers.map((tier, i) => ({
            name: tier.name || `[TIER ${i + 1} NAME]`,
            price: tier.price || `[TIER ${i + 1} PRICE]`,
            featured: tier.featured,
            features: tier.features.length > 0
              ? tier.features.map((_, fi) => `[TIER ${i + 1} FEATURE ${fi + 1}]`)
              : [`[TIER ${i + 1} FEATURE 1]`, `[TIER ${i + 1} FEATURE 2]`, `[TIER ${i + 1} FEATURE 3]`],
            ctaLabel: `[TIER ${i + 1} CTA LABEL]`,
            ctaUrl: '#contact',
          })),
        },
      };
    }

    return copy;
  }

  private generateProblemBullets(brief: CopyBrief): string[] {
    const count = Math.max(3, Math.min(4, 1 + brief.supportingBenefits.length));
    const bullets: string[] = [];

    bullets.push(`[PAIN POINT 1: ${brief.mainPainPoint.toUpperCase()}]`);

    for (let i = 1; i < count; i++) {
      bullets.push(`[PAIN POINT ${i + 1}]`);
    }

    return bullets;
  }

  private generateSolutionFeatures(
    brief: CopyBrief
  ): Array<{ feature: string; benefit: string }> {
    const features: Array<{ feature: string; benefit: string }> = [];

    features.push({
      feature: `[FEATURE 1: ${brief.productName.toUpperCase()}]`,
      benefit: `[BENEFIT 1: ${brief.primaryBenefit.toUpperCase()}]`,
    });

    for (let i = 0; i < brief.supportingBenefits.length && i < 3; i++) {
      features.push({
        feature: `[FEATURE ${i + 2}]`,
        benefit: `[BENEFIT ${i + 2}: ${brief.supportingBenefits[i]!.toUpperCase()}]`,
      });
    }

    return features;
  }

  private generateTestimonialPlaceholders(
    brief: CopyBrief
  ): Array<{ name: string; role: string; quote: string }> {
    if (brief.socialProof.length > 0) {
      return brief.socialProof.map((t, i) => ({
        name: t.name || `[TESTIMONIAL ${i + 1} NAME]`,
        role: t.role || `[TESTIMONIAL ${i + 1} ROLE]`,
        quote: `[TESTIMONIAL ${i + 1} QUOTE]`,
      }));
    }

    // Default: generate 3 placeholder testimonials
    return [
      { name: `[TESTIMONIAL 1 NAME]`, role: `[TESTIMONIAL 1 ROLE]`, quote: `[TESTIMONIAL 1 QUOTE]` },
      { name: `[TESTIMONIAL 2 NAME]`, role: `[TESTIMONIAL 2 ROLE]`, quote: `[TESTIMONIAL 2 QUOTE]` },
      { name: `[TESTIMONIAL 3 NAME]`, role: `[TESTIMONIAL 3 ROLE]`, quote: `[TESTIMONIAL 3 QUOTE]` },
    ];
  }

  private generateFaqPlaceholders(
    brief: CopyBrief
  ): Array<{ question: string; answer: string }> {
    if (brief.faqItems && brief.faqItems.length > 0) {
      return brief.faqItems.map((_, i) => ({
        question: `[FAQ ${i + 1} QUESTION]`,
        answer: `[FAQ ${i + 1} ANSWER]`,
      }));
    }

    // Default: generate 5 placeholder FAQ items (minimum per schema)
    return Array.from({ length: 5 }, (_, i) => ({
      question: `[FAQ ${i + 1} QUESTION]`,
      answer: `[FAQ ${i + 1} ANSWER]`,
    }));
  }
}
