/**
 * Template Adapter
 *
 * Converts a LandingPageCopy object into the flat Nunjucks context
 * object expected by the BSS-5.2 landing page templates.
 *
 * The Nunjucks templates (index.njk and partials) expect top-level keys:
 * clientId, type, title, year, hero, problem, solution, howItWorks,
 * socialProof, pricing, faq, finalCta.
 *
 * @module copy-framework/template-adapter
 */

import type { LandingPageCopy } from './types';

/**
 * Convert a LandingPageCopy into the Nunjucks context object
 * expected by the BSS-5.2 `index.njk` template.
 *
 * @param copy - The validated LandingPageCopy object
 * @returns A Record<string, unknown> suitable for Nunjucks rendering
 */
export function copyToTemplateVars(
  copy: LandingPageCopy
): Record<string, unknown> {
  const vars: Record<string, unknown> = {
    clientId: copy.clientId,
    type: 'landing-page' as const,
    title: copy.title ?? `${copy.clientId} - Landing Page`,
    year: new Date().getFullYear(),

    hero: {
      preHeadline: copy.hero.preHeadline,
      h1: copy.hero.h1,
      subHeadline: copy.hero.subHeadline,
      ctaLabel: copy.hero.ctaLabel,
      ctaUrl: copy.hero.ctaUrl ?? '#pricing',
      socialProof: copy.hero.socialProof
        ? {
            stat: copy.hero.socialProof.stat,
            label: copy.hero.socialProof.label,
          }
        : undefined,
    },

    problem: {
      headline: copy.problem.headline,
      bullets: [...copy.problem.bullets],
    },

    solution: {
      headline: copy.solution.headline,
      features: copy.solution.features.map((f) => ({
        feature: f.feature,
        benefit: f.benefit,
      })),
    },

    howItWorks: {
      headline: copy.howItWorks.headline,
      steps: copy.howItWorks.steps.map((s) => ({
        title: s.title,
        description: s.description,
      })),
    },

    socialProof: {
      headline: copy.socialProof.headline,
      testimonials: copy.socialProof.testimonials
        ? copy.socialProof.testimonials.map((t) => ({
            name: t.name,
            role: t.role,
            quote: t.quote,
          }))
        : [],
      metrics: copy.socialProof.metrics
        ? copy.socialProof.metrics.map((m) => ({
            stat: m.stat,
            label: m.label,
          }))
        : [],
    },

    faq: {
      headline: copy.faq.headline ?? 'Frequently Asked Questions',
      items: copy.faq.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },

    finalCta: {
      headline: copy.finalCta.headline,
      riskRemoval: copy.finalCta.riskRemoval,
      ctaLabel: copy.finalCta.ctaLabel,
      ctaUrl: copy.finalCta.ctaUrl ?? '#contact',
    },
  };

  // Only include pricing if present in the copy
  if (copy.pricing) {
    vars['pricing'] = {
      headline: copy.pricing.headline ?? 'Pricing',
      tiers: copy.pricing.tiers.map((tier) => ({
        name: tier.name,
        price: tier.price,
        featured: tier.featured ?? false,
        features: [...tier.features],
        ctaLabel: tier.ctaLabel ?? 'Get Started',
        ctaUrl: tier.ctaUrl ?? '#contact',
      })),
    };
  }

  return vars;
}
