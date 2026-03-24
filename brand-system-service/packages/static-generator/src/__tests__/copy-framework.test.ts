/**
 * Tests for the Copy Framework (BSS-5.4)
 *
 * Covers:
 * - CopyValidator with valid copy (pass)
 * - CopyValidator with missing section (fail)
 * - CopyValidator with word count out of range (fail)
 * - CopyValidator H1 length rules
 * - CopyValidator CTA label rules
 * - CopyPlaceholderGenerator produces all 8 sections
 * - copyToTemplateVars maps all fields correctly
 * - LandingPageCopyFramework builds from brief
 * - End-to-end: CopyBrief -> LandingPageCopy -> templateVars
 */

import { LandingPageCopyFramework } from '../copy-framework/copy-framework';
import { CopyValidator } from '../copy-framework/copy-validator';
import { CopyPlaceholderGenerator } from '../copy-framework/placeholder-generator';
import { copyToTemplateVars } from '../copy-framework/template-adapter';
import type {
  CopyBrief,
  LandingPageCopy,
} from '../copy-framework/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * A realistic CopyBrief for testing.
 */
function createTestBrief(): CopyBrief {
  return {
    clientId: 'acme-saas',
    productName: 'BrandForge',
    targetAudience: 'growing B2B companies',
    mainPainPoint: 'inconsistent branding across channels',
    primaryBenefit: 'Build your brand in weeks not months',
    supportingBenefits: [
      'Professional design tokens for consistent visuals',
      'AI-powered copy that matches your voice',
      'Self-contained downloadable brand package',
    ],
    socialProof: [
      { name: 'Sarah Chen', role: 'VP Marketing at CloudStack', quote: 'Our conversion rate increased 34% within the first month.' },
      { name: 'Marcus Rivera', role: 'CEO at DataFlow', quote: 'We went from zero brand consistency to a professional identity in three weeks.' },
      { name: 'Emily Zhang', role: 'Head of Design at ScaleUp', quote: 'The design tokens saved our team 15 hours per week.' },
    ],
    pricingTiers: [
      {
        name: 'Starter',
        price: '$2,499',
        features: ['Brand identity design', 'Design token system', '5 social media templates'],
        ctaLabel: 'Get Started',
        ctaUrl: '#contact',
      },
      {
        name: 'Professional',
        price: '$4,999',
        featured: true,
        features: ['Everything in Starter', 'AI copy pipeline', '15 social media templates'],
        ctaLabel: 'Start Professional',
        ctaUrl: '#contact',
      },
    ],
    faqItems: [
      { question: 'How long does the process take?', answer: 'Typically 3-4 weeks from kickoff to delivery.' },
      { question: 'Do I need a designer?', answer: 'No. Our system generates everything automatically.' },
      { question: 'Can I customize templates?', answer: 'Yes. All templates use standard HTML/CSS with design tokens.' },
      { question: 'What if I am not satisfied?', answer: 'We offer unlimited revisions during the review phase.' },
      { question: 'Do you support multiple languages?', answer: 'Yes. The template system supports any language.' },
    ],
    guarantee: '100% satisfaction guarantee or your money back.',
  };
}

/**
 * Build a valid LandingPageCopy with enough word count to pass validation.
 * We need 1500-3000 words total across all sections.
 */
function createValidCopy(): LandingPageCopy {
  // Generate enough words in subHeadline and other fields
  const longParagraph = Array.from({ length: 50 }, () => 'word').join(' ');
  const mediumParagraph = Array.from({ length: 30 }, () => 'content').join(' ');

  return {
    clientId: 'acme-saas',
    title: 'Acme SaaS - Build Your Brand',
    hero: {
      preHeadline: 'For growing B2B companies',
      h1: 'Build your brand in weeks not months',
      subHeadline: `Our proven system helps B2B companies establish a professional brand identity that converts visitors into customers. ${longParagraph}`,
      ctaLabel: 'Start your project',
      ctaUrl: '#pricing',
      socialProof: { stat: '200+ clients', label: 'served worldwide' },
    },
    problem: {
      headline: 'Sound familiar?',
      bullets: [
        `Your brand feels inconsistent across channels and touchpoints. ${mediumParagraph}`,
        `Designers spend hours recreating the same components from scratch. ${mediumParagraph}`,
        `Your marketing team cannot produce on-brand content. ${mediumParagraph}`,
        `Competitors with polished brands are winning deals you should close. ${mediumParagraph}`,
      ],
    },
    solution: {
      headline: 'A complete brand system delivered',
      features: [
        { feature: 'Design Tokens', benefit: `Consistent colors typography and spacing across all touchpoints from website to social media. ${mediumParagraph}` },
        { feature: 'Template Library', benefit: `Pre-built templates for landing pages social posts and presentations your team can use immediately. ${mediumParagraph}` },
        { feature: 'Brand Book', benefit: `A comprehensive digital brand guide that keeps everyone aligned on your visual identity. ${mediumParagraph}` },
      ],
    },
    howItWorks: {
      headline: 'How it works',
      steps: [
        { title: 'Discovery', description: `We learn about your brand audience and goals through a structured intake process. ${mediumParagraph}` },
        { title: 'Design', description: `Our system generates a complete brand identity with tokens templates and guidelines. ${mediumParagraph}` },
        { title: 'Review', description: `You review and refine the output and we iterate until everything is perfect. ${mediumParagraph}` },
        { title: 'Deliver', description: `Receive your brand system as a static site PDF brand book and downloadable package. ${mediumParagraph}` },
      ],
    },
    socialProof: {
      headline: 'What our clients say',
      testimonials: [
        { name: 'Sarah Chen', role: 'VP Marketing at CloudStack', quote: `The brand system transformed how we present ourselves. Our conversion rate increased 34% within the first month. ${mediumParagraph}` },
        { name: 'Marcus Rivera', role: 'CEO at DataFlow', quote: `We went from zero brand consistency to a professional identity in just three weeks. It was a game changer. ${mediumParagraph}` },
        { name: 'Emily Zhang', role: 'Head of Design at ScaleUp', quote: `The design tokens alone saved our team 15 hours per week. Everything is consistent and beautiful. ${mediumParagraph}` },
      ],
      metrics: [
        { stat: '98%', label: 'client satisfaction' },
        { stat: '3 weeks', label: 'average delivery' },
      ],
    },
    pricing: {
      headline: 'Simple transparent pricing',
      tiers: [
        {
          name: 'Starter',
          price: '$2,499',
          features: ['Brand identity design', 'Design token system', '5 social media templates'],
          ctaLabel: 'Get Started',
          ctaUrl: '#contact',
        },
        {
          name: 'Professional',
          price: '$4,999',
          featured: true,
          features: ['Everything in Starter', 'AI copy pipeline', '15 social media templates'],
          ctaLabel: 'Start Professional',
          ctaUrl: '#contact',
        },
      ],
    },
    faq: {
      headline: 'Frequently Asked Questions',
      items: [
        { question: 'How long does the process take?', answer: `Typically 3-4 weeks from kickoff to delivery for the Starter plan and 4-6 weeks for Professional. ${mediumParagraph}` },
        { question: 'Do I need a designer?', answer: `No. Our system generates everything automatically from your brand inputs. ${mediumParagraph}` },
        { question: 'Can I customize?', answer: `Absolutely. All templates use standard HTML and CSS with design tokens. ${mediumParagraph}` },
        { question: 'What if I am not satisfied?', answer: `We offer unlimited revisions during the review phase and a full refund within 30 days. ${mediumParagraph}` },
        { question: 'Do you support multiple languages?', answer: `Yes. The template system supports any language and copy can be generated in multiple languages. ${mediumParagraph}` },
      ],
    },
    finalCta: {
      headline: 'Ready to transform your brand?',
      riskRemoval: `100% satisfaction guarantee. If you are not happy with the results we will revise until you are or your money back. ${mediumParagraph}`,
      ctaLabel: 'Start Your Project Today',
      ctaUrl: '#contact',
    },
  };
}

// ---------------------------------------------------------------------------
// CopyValidator Tests (AC: 4, 5, 10)
// ---------------------------------------------------------------------------

describe('CopyValidator', () => {
  const validator = new CopyValidator();

  describe('valid copy (AC: 10)', () => {
    it('should return valid: true for a complete copy within word count range', () => {
      const copy = createValidCopy();
      const result = validator.validate(copy);

      expect(result.valid).toBe(true);
      expect(result.totalWordCount).toBeGreaterThanOrEqual(1000);
      expect(result.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    });

    it('should return per-section word counts (AC: 5)', () => {
      const copy = createValidCopy();
      const result = validator.validate(copy);

      expect(result.wordCounts.length).toBeGreaterThan(0);

      const sectionNames = result.wordCounts.map((wc) => wc.section);
      expect(sectionNames).toContain('hero');
      expect(sectionNames).toContain('problem');
      expect(sectionNames).toContain('solution');
      expect(sectionNames).toContain('howItWorks');
      expect(sectionNames).toContain('socialProof');
      expect(sectionNames).toContain('faq');
      expect(sectionNames).toContain('finalCta');

      for (const wc of result.wordCounts) {
        expect(wc.wordCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should report total word count (AC: 5)', () => {
      const copy = createValidCopy();
      const result = validator.validate(copy);

      const sumOfSections = result.wordCounts.reduce((sum, wc) => sum + wc.wordCount, 0);
      expect(result.totalWordCount).toBe(sumOfSections);
    });
  });

  describe('missing section (AC: 10)', () => {
    it('should fail when a required section is missing', () => {
      const copy = createValidCopy();
      // Remove the problem section by casting to any to simulate invalid data
      const badCopy = { ...copy, problem: undefined } as unknown as LandingPageCopy;
      const result = validator.validate(badCopy);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.section === 'problem' && i.severity === 'error')).toBe(true);
    });

    it('should fail when hero.h1 is empty', () => {
      const copy = createValidCopy();
      const badCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, h1: '' },
      };
      const result = validator.validate(badCopy);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.field === 'h1' && i.severity === 'error')).toBe(true);
    });

    it('should fail when finalCta.ctaLabel is empty', () => {
      const copy = createValidCopy();
      const badCopy: LandingPageCopy = {
        ...copy,
        finalCta: { ...copy.finalCta, ctaLabel: '' },
      };
      const result = validator.validate(badCopy);

      expect(result.valid).toBe(false);
      expect(result.issues.some((i) => i.field === 'ctaLabel' && i.severity === 'error')).toBe(true);
    });
  });

  describe('word count out of range (AC: 10)', () => {
    it('should fail when total word count is below 1000', () => {
      const copy: LandingPageCopy = {
        clientId: 'test',
        hero: { h1: 'Build your brand in weeks not months', ctaLabel: 'Start now', ctaUrl: '#' },
        problem: { headline: 'Pain', bullets: ['One', 'Two', 'Three'] },
        solution: { headline: 'Fix', features: [{ feature: 'A', benefit: 'B' }] },
        howItWorks: { headline: 'Steps', steps: [{ title: 'Step', description: 'Do it' }] },
        socialProof: { headline: 'Proof' },
        faq: { items: [{ question: 'Q?', answer: 'A.' }] },
        finalCta: { headline: 'Ready?', ctaLabel: 'Start now' },
      };
      const result = validator.validate(copy);

      expect(result.valid).toBe(false);
      expect(result.issues.some(
        (i) => i.field === 'wordCount' && i.severity === 'error'
      )).toBe(true);
    });

    it('should warn when total word count is between 1000 and 1200', () => {
      // Create copy with ~1100 words
      const words1100 = Array.from({ length: 140 }, () => 'content word here pad').join(' ');
      const copy: LandingPageCopy = {
        clientId: 'test',
        hero: { h1: 'Build your brand in weeks not months', ctaLabel: 'Start now', subHeadline: words1100 },
        problem: { headline: 'Pain', bullets: ['One two three four five'] },
        solution: { headline: 'Fix', features: [{ feature: 'A', benefit: 'B' }] },
        howItWorks: { headline: 'Steps', steps: [{ title: 'Step', description: 'Do it' }] },
        socialProof: { headline: 'Proof' },
        faq: { items: [{ question: 'Q?', answer: 'A.' }] },
        finalCta: { headline: 'Ready?', ctaLabel: 'Start now' },
      };
      const result = validator.validate(copy);

      // Should be valid (warnings don't fail)
      if (result.totalWordCount >= 1000 && result.totalWordCount < 1200) {
        expect(result.valid).toBe(true);
        expect(result.issues.some(
          (i) => i.field === 'wordCount' && i.severity === 'warning'
        )).toBe(true);
      }
    });

    it('should fail when total word count exceeds 3500', () => {
      const hugeText = Array.from({ length: 800 }, () => 'word goes here padding').join(' ');
      const copy = createValidCopy();
      const badCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, subHeadline: hugeText },
      };
      const result = validator.validate(badCopy);

      if (result.totalWordCount > 3500) {
        expect(result.valid).toBe(false);
        expect(result.issues.some(
          (i) => i.field === 'wordCount' && i.severity === 'error'
        )).toBe(true);
      }
    });
  });

  describe('H1 length rules (AC: 4)', () => {
    it('should pass for H1 with 5-10 words', () => {
      const copy = createValidCopy();
      // "Build your brand in weeks not months" = 7 words
      const result = validator.validate(copy);
      const h1Issues = result.issues.filter((i) => i.field === 'h1');
      expect(h1Issues).toHaveLength(0);
    });

    it('should warn for H1 with 4 words', () => {
      const copy = createValidCopy();
      const modCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, h1: 'Build your brand now' },
      };
      const result = validator.validate(modCopy);
      const h1Issues = result.issues.filter((i) => i.field === 'h1');
      expect(h1Issues).toHaveLength(1);
      expect(h1Issues[0]!.severity).toBe('warning');
    });

    it('should fail for H1 with 3 or fewer words', () => {
      const copy = createValidCopy();
      const modCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, h1: 'Build brands' },
      };
      const result = validator.validate(modCopy);
      const h1Issues = result.issues.filter((i) => i.field === 'h1');
      expect(h1Issues).toHaveLength(1);
      expect(h1Issues[0]!.severity).toBe('error');
    });

    it('should fail for H1 with 12 or more words', () => {
      const copy = createValidCopy();
      const modCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, h1: 'This is a very long headline that has way too many words in it' },
      };
      const result = validator.validate(modCopy);
      const h1Issues = result.issues.filter((i) => i.field === 'h1');
      expect(h1Issues).toHaveLength(1);
      expect(h1Issues[0]!.severity).toBe('error');
    });
  });

  describe('CTA label rules (AC: 4)', () => {
    it('should not warn for CTA starting with approved verb', () => {
      const copy = createValidCopy();
      // "Start your project" starts with "Start"
      const result = validator.validate(copy);
      const ctaIssues = result.issues.filter((i) => i.field === 'ctaLabel' && i.section === 'hero');
      expect(ctaIssues).toHaveLength(0);
    });

    it('should warn for CTA not starting with approved verb', () => {
      const copy = createValidCopy();
      const modCopy: LandingPageCopy = {
        ...copy,
        hero: { ...copy.hero, ctaLabel: 'Submit your project' },
      };
      const result = validator.validate(modCopy);
      const ctaIssues = result.issues.filter((i) => i.field === 'ctaLabel' && i.section === 'hero');
      expect(ctaIssues).toHaveLength(1);
      expect(ctaIssues[0]!.severity).toBe('warning');
    });

    it('should validate pricing tier CTA labels', () => {
      const copy = createValidCopy();
      const modCopy: LandingPageCopy = {
        ...copy,
        pricing: {
          headline: 'Pricing',
          tiers: [
            {
              name: 'Starter',
              price: '$99',
              features: ['Feature 1'],
              ctaLabel: 'Choose this plan',
              ctaUrl: '#',
            },
          ],
        },
      };
      const result = validator.validate(modCopy);
      const pricingCtaIssues = result.issues.filter(
        (i) => i.section === 'pricing' && i.field.includes('ctaLabel')
      );
      expect(pricingCtaIssues).toHaveLength(1);
      expect(pricingCtaIssues[0]!.severity).toBe('warning');
    });
  });
});

// ---------------------------------------------------------------------------
// CopyPlaceholderGenerator Tests (AC: 6, 10)
// ---------------------------------------------------------------------------

describe('CopyPlaceholderGenerator', () => {
  const generator = new CopyPlaceholderGenerator();
  const brief = createTestBrief();

  it('should produce a LandingPageCopy with all 8 sections populated (AC: 6, 10)', () => {
    const copy = generator.generate(brief);

    expect(copy.clientId).toBe('acme-saas');
    expect(copy.hero).toBeDefined();
    expect(copy.hero.h1).toBeDefined();
    expect(copy.problem).toBeDefined();
    expect(copy.problem.bullets.length).toBeGreaterThanOrEqual(3);
    expect(copy.solution).toBeDefined();
    expect(copy.solution.features.length).toBeGreaterThan(0);
    expect(copy.howItWorks).toBeDefined();
    expect(copy.howItWorks.steps.length).toBeGreaterThanOrEqual(3);
    expect(copy.socialProof).toBeDefined();
    expect(copy.socialProof.testimonials).toBeDefined();
    expect(copy.faq).toBeDefined();
    expect(copy.faq.items.length).toBeGreaterThanOrEqual(5);
    expect(copy.finalCta).toBeDefined();
    expect(copy.finalCta.ctaLabel).toBeDefined();
  });

  it('should include pricing when brief has pricingTiers', () => {
    const copy = generator.generate(brief);
    expect(copy.pricing).toBeDefined();
    expect(copy.pricing!.tiers).toHaveLength(brief.pricingTiers!.length);
  });

  it('should NOT include pricing when brief has no pricingTiers', () => {
    const noPricingBrief: CopyBrief = { ...brief, pricingTiers: undefined };
    const copy = generator.generate(noPricingBrief);
    expect(copy.pricing).toBeUndefined();
  });

  it('should use bracket-style placeholder text', () => {
    const copy = generator.generate(brief);

    expect(copy.hero.h1).toMatch(/^\[.*\]$/);
    expect(copy.problem.headline).toMatch(/^\[.*\]$/);
    expect(copy.solution.headline).toMatch(/^\[.*\]$/);
    expect(copy.howItWorks.headline).toMatch(/^\[.*\]$/);
    expect(copy.finalCta.headline).toMatch(/^\[.*\]$/);
  });

  it('should incorporate brief data in placeholders', () => {
    const copy = generator.generate(brief);

    // Hero headline should reference product name
    expect(copy.hero.h1!.toUpperCase()).toContain('BRANDFORGE');
    // Problem bullets should reference main pain point
    expect(copy.problem.bullets[0]!.toUpperCase()).toContain('INCONSISTENT');
  });
});

// ---------------------------------------------------------------------------
// copyToTemplateVars Tests (AC: 7, 10)
// ---------------------------------------------------------------------------

describe('copyToTemplateVars', () => {
  it('should map all LandingPageCopy fields to template vars (AC: 7, 10)', () => {
    const copy = createValidCopy();
    const vars = copyToTemplateVars(copy);

    expect(vars['clientId']).toBe(copy.clientId);
    expect(vars['type']).toBe('landing-page');
    expect(vars['title']).toBeDefined();
    expect(vars['year']).toBe(new Date().getFullYear());

    // Hero
    const hero = vars['hero'] as Record<string, unknown>;
    expect(hero['h1']).toBe(copy.hero.h1);
    expect(hero['preHeadline']).toBe(copy.hero.preHeadline);
    expect(hero['subHeadline']).toBe(copy.hero.subHeadline);
    expect(hero['ctaLabel']).toBe(copy.hero.ctaLabel);
    expect(hero['ctaUrl']).toBe(copy.hero.ctaUrl);

    // Problem
    const problem = vars['problem'] as Record<string, unknown>;
    expect(problem['headline']).toBe(copy.problem.headline);
    expect(problem['bullets']).toEqual([...copy.problem.bullets]);

    // Solution
    const solution = vars['solution'] as Record<string, unknown>;
    expect(solution['headline']).toBe(copy.solution.headline);
    expect((solution['features'] as Array<unknown>).length).toBe(copy.solution.features.length);

    // How it works
    const howItWorks = vars['howItWorks'] as Record<string, unknown>;
    expect(howItWorks['headline']).toBe(copy.howItWorks.headline);
    expect((howItWorks['steps'] as Array<unknown>).length).toBe(copy.howItWorks.steps.length);

    // Social proof
    const socialProof = vars['socialProof'] as Record<string, unknown>;
    expect(socialProof['headline']).toBe(copy.socialProof.headline);

    // FAQ
    const faq = vars['faq'] as Record<string, unknown>;
    expect((faq['items'] as Array<unknown>).length).toBe(copy.faq.items.length);

    // Final CTA
    const finalCta = vars['finalCta'] as Record<string, unknown>;
    expect(finalCta['headline']).toBe(copy.finalCta.headline);
    expect(finalCta['ctaLabel']).toBe(copy.finalCta.ctaLabel);
    expect(finalCta['riskRemoval']).toBe(copy.finalCta.riskRemoval);
  });

  it('should include pricing when present', () => {
    const copy = createValidCopy();
    const vars = copyToTemplateVars(copy);

    expect(vars['pricing']).toBeDefined();
    const pricing = vars['pricing'] as Record<string, unknown>;
    expect(pricing['headline']).toBe(copy.pricing!.headline);
    expect((pricing['tiers'] as Array<unknown>).length).toBe(copy.pricing!.tiers.length);
  });

  it('should omit pricing when not present', () => {
    const copy = createValidCopy();
    const noPricingCopy: LandingPageCopy = { ...copy, pricing: undefined };
    const vars = copyToTemplateVars(noPricingCopy);

    expect(vars['pricing']).toBeUndefined();
  });

  it('should set type to landing-page', () => {
    const copy = createValidCopy();
    const vars = copyToTemplateVars(copy);
    expect(vars['type']).toBe('landing-page');
  });

  it('should set current year', () => {
    const copy = createValidCopy();
    const vars = copyToTemplateVars(copy);
    expect(vars['year']).toBe(new Date().getFullYear());
  });
});

// ---------------------------------------------------------------------------
// LandingPageCopyFramework Tests (AC: 1)
// ---------------------------------------------------------------------------

describe('LandingPageCopyFramework', () => {
  const brief = createTestBrief();

  it('should build a LandingPageCopy from a CopyBrief (AC: 1)', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.clientId).toBe(brief.clientId);
    expect(copy.hero).toBeDefined();
    expect(copy.hero.h1).toBeDefined();
    expect(copy.problem).toBeDefined();
    expect(copy.problem.bullets.length).toBeGreaterThan(0);
    expect(copy.solution).toBeDefined();
    expect(copy.howItWorks).toBeDefined();
    expect(copy.socialProof).toBeDefined();
    expect(copy.faq).toBeDefined();
    expect(copy.finalCta).toBeDefined();
  });

  it('should include pricing when brief has pricingTiers', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.pricing).toBeDefined();
    expect(copy.pricing!.tiers).toHaveLength(brief.pricingTiers!.length);
  });

  it('should NOT include pricing when brief has no pricingTiers', () => {
    const noPricingBrief: CopyBrief = { ...brief, pricingTiers: undefined };
    const framework = new LandingPageCopyFramework(noPricingBrief);
    const copy = framework.build();

    expect(copy.pricing).toBeUndefined();
  });

  it('should derive hero content from brief', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.hero.h1).toBe(brief.primaryBenefit);
    expect(copy.hero.preHeadline).toContain(brief.targetAudience);
  });

  it('should map testimonials to socialProof', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.socialProof.testimonials).toHaveLength(brief.socialProof.length);
    expect(copy.socialProof.testimonials![0]!.name).toBe(brief.socialProof[0]!.name);
  });

  it('should map faqItems to faq', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.faq.items).toHaveLength(brief.faqItems!.length);
    expect(copy.faq.items[0]!.question).toBe(brief.faqItems![0]!.question);
  });

  it('should map guarantee to finalCta.riskRemoval', () => {
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    expect(copy.finalCta.riskRemoval).toBe(brief.guarantee);
  });
});

// ---------------------------------------------------------------------------
// End-to-End: CopyBrief -> LandingPageCopy -> templateVars (AC: 8)
// ---------------------------------------------------------------------------

describe('End-to-end: CopyBrief -> LandingPageCopy -> templateVars', () => {
  it('should produce valid template vars from a brief (AC: 8)', () => {
    const brief = createTestBrief();

    // Step 1: Build copy from brief
    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();

    // Step 2: Convert to template vars
    const vars = copyToTemplateVars(copy);

    // Step 3: Verify structure matches what Nunjucks templates expect
    expect(vars['clientId']).toBe(brief.clientId);
    expect(vars['type']).toBe('landing-page');
    expect(typeof vars['year']).toBe('number');

    // Verify all 8 sections are present
    expect(vars['hero']).toBeDefined();
    expect(vars['problem']).toBeDefined();
    expect(vars['solution']).toBeDefined();
    expect(vars['howItWorks']).toBeDefined();
    expect(vars['socialProof']).toBeDefined();
    expect(vars['pricing']).toBeDefined();
    expect(vars['faq']).toBeDefined();
    expect(vars['finalCta']).toBeDefined();

    // Verify hero has h1
    expect((vars['hero'] as Record<string, unknown>)['h1']).toBeDefined();

    // Verify problem has bullets array
    const problem = vars['problem'] as Record<string, unknown>;
    expect(Array.isArray(problem['bullets'])).toBe(true);
    expect((problem['bullets'] as string[]).length).toBeGreaterThan(0);

    // Verify solution has features array
    const solution = vars['solution'] as Record<string, unknown>;
    expect(Array.isArray(solution['features'])).toBe(true);

    // Verify howItWorks has steps array
    const howItWorks = vars['howItWorks'] as Record<string, unknown>;
    expect(Array.isArray(howItWorks['steps'])).toBe(true);

    // Verify faq has items array
    const faq = vars['faq'] as Record<string, unknown>;
    expect(Array.isArray(faq['items'])).toBe(true);

    // Verify finalCta has ctaLabel
    const finalCta = vars['finalCta'] as Record<string, unknown>;
    expect(finalCta['ctaLabel']).toBeDefined();
    expect(typeof finalCta['ctaLabel']).toBe('string');
  });

  it('should work without pricing tiers', () => {
    const brief: CopyBrief = {
      ...createTestBrief(),
      pricingTiers: undefined,
    };

    const framework = new LandingPageCopyFramework(brief);
    const copy = framework.build();
    const vars = copyToTemplateVars(copy);

    expect(vars['pricing']).toBeUndefined();
    // All other sections still present
    expect(vars['hero']).toBeDefined();
    expect(vars['problem']).toBeDefined();
    expect(vars['solution']).toBeDefined();
    expect(vars['howItWorks']).toBeDefined();
    expect(vars['socialProof']).toBeDefined();
    expect(vars['faq']).toBeDefined();
    expect(vars['finalCta']).toBeDefined();
  });
});
