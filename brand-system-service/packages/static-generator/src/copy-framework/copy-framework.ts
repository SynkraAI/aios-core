/**
 * LandingPageCopyFramework
 *
 * Accepts a CopyBrief and builds a complete LandingPageCopy object
 * structured to match the BSS-5.2 landing-page.schema.json.
 *
 * This is the main orchestration class for the copy framework.
 *
 * @module copy-framework/copy-framework
 */

import type {
  CopyBrief,
  LandingPageCopy,
  HeroCopy,
  ProblemCopy,
  SolutionCopy,
  HowItWorksCopy,
  SocialProofCopy,
  PricingCopy,
  FaqCopy,
  FinalCtaCopy,
} from './types';

/**
 * Builds a `LandingPageCopy` from a `CopyBrief`.
 *
 * Usage:
 * ```ts
 * const framework = new LandingPageCopyFramework(brief);
 * const copy = framework.build();
 * ```
 */
export class LandingPageCopyFramework {
  private readonly brief: CopyBrief;

  constructor(brief: CopyBrief) {
    this.brief = brief;
  }

  /**
   * Build a complete LandingPageCopy from the brief.
   */
  build(): LandingPageCopy {
    const copy: LandingPageCopy = {
      clientId: this.brief.clientId,
      title: `${this.brief.productName} - ${this.brief.primaryBenefit}`,
      hero: this.buildHero(),
      problem: this.buildProblem(),
      solution: this.buildSolution(),
      howItWorks: this.buildHowItWorks(),
      socialProof: this.buildSocialProof(),
      faq: this.buildFaq(),
      finalCta: this.buildFinalCta(),
    };

    // Only include pricing if tiers were provided
    if (this.brief.pricingTiers && this.brief.pricingTiers.length > 0) {
      return {
        ...copy,
        pricing: this.buildPricing(),
      };
    }

    return copy;
  }

  private buildHero(): HeroCopy {
    return {
      preHeadline: `For ${this.brief.targetAudience}`,
      h1: this.brief.primaryBenefit,
      subHeadline: `${this.brief.productName} helps ${this.brief.targetAudience} overcome ${this.brief.mainPainPoint}.`,
      ctaLabel: `Start with ${this.brief.productName}`,
      ctaUrl: '#pricing',
      socialProof:
        this.brief.socialProof.length > 0
          ? {
              stat: `${this.brief.socialProof.length}+ clients`,
              label: 'trust us',
            }
          : undefined,
    };
  }

  private buildProblem(): ProblemCopy {
    const bullets: string[] = [
      this.brief.mainPainPoint,
    ];

    // Add up to 3 more pain-adjacent bullets derived from supporting benefits (inverted)
    for (const benefit of this.brief.supportingBenefits.slice(0, 3)) {
      bullets.push(`Without ${benefit.toLowerCase()}, your results suffer`);
    }

    return {
      headline: 'Sound familiar?',
      bullets,
    };
  }

  private buildSolution(): SolutionCopy {
    const features = [
      {
        feature: this.brief.productName,
        benefit: this.brief.primaryBenefit,
      },
      ...this.brief.supportingBenefits.slice(0, 3).map((b, i) => ({
        feature: `Benefit ${i + 1}`,
        benefit: b,
      })),
    ];

    return {
      headline: `How ${this.brief.productName} solves this`,
      features,
    };
  }

  private buildHowItWorks(): HowItWorksCopy {
    return {
      headline: 'How it works',
      steps: [
        { title: 'Discovery', description: `We learn about your needs and ${this.brief.mainPainPoint}.` },
        { title: 'Strategy', description: `We design a plan tailored to ${this.brief.targetAudience}.` },
        { title: 'Implementation', description: `We deliver ${this.brief.productName} with ${this.brief.primaryBenefit}.` },
      ],
    };
  }

  private buildSocialProof(): SocialProofCopy {
    return {
      headline: 'What our clients say',
      testimonials: this.brief.socialProof.map((t) => ({
        name: t.name,
        role: t.role,
        quote: t.quote,
      })),
      metrics: [
        { stat: `${this.brief.socialProof.length}+`, label: 'happy clients' },
      ],
    };
  }

  private buildPricing(): PricingCopy {
    const tiers = this.brief.pricingTiers ?? [];
    return {
      headline: 'Simple, transparent pricing',
      tiers: tiers.map((t) => ({
        name: t.name,
        price: t.price,
        featured: t.featured,
        features: [...t.features],
        ctaLabel: t.ctaLabel ?? 'Get Started',
        ctaUrl: t.ctaUrl ?? '#contact',
      })),
    };
  }

  private buildFaq(): FaqCopy {
    const items = this.brief.faqItems ?? [];
    return {
      headline: 'Frequently Asked Questions',
      items: items.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
    };
  }

  private buildFinalCta(): FinalCtaCopy {
    return {
      headline: `Ready to ${this.brief.primaryBenefit.toLowerCase()}?`,
      riskRemoval: this.brief.guarantee,
      ctaLabel: `Start with ${this.brief.productName}`,
      ctaUrl: '#contact',
    };
  }
}
