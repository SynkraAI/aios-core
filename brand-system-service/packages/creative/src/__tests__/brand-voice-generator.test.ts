import type { BrandVoice, BrandVoiceConfig } from '@bss/core';

import {
  buildBrandVoice,
  generateDoList,
  generateDontList,
  generateManifesto,
  generateTaglines,
  generateToneSpectrum,
  generateValueProp,
  generateVoicePillars,
} from '../brand-voice-generator';

/**
 * Fixture config representing a sample tech brand.
 * Used across all tests for consistency.
 */
const testBrandConfig: BrandVoiceConfig = {
  personality: ['innovative', 'approachable', 'precise', 'bold', 'trustworthy'],
  industry: 'developer tools and automation',
  audience: 'software engineers and technical leaders',
  tone: 'professional',
  forbiddenWords: [
    'synergy',
    'leverage',
    'disrupt',
    'pivot',
    'paradigm',
    'scalable',
    'bleeding-edge',
    'guru',
    'ninja',
    'rockstar',
    'magic',
    'seamless',
    'revolutionary',
  ],
  approvedWords: [
    'build',
    'ship',
    'automate',
    'streamline',
    'reliable',
    'fast',
    'clear',
    'developer-first',
    'open',
    'composable',
    'observable',
    'tested',
    'documented',
    'type-safe',
    'idiomatic',
    'pragmatic',
    'robust',
    'consistent',
    'maintainable',
    'production-ready',
    'extensible',
    'modular',
    'deterministic',
    'reproducible',
    'auditable',
    'transparent',
  ],
  competitorBrands: ['Vercel', 'Netlify', 'Supabase'],
};

describe('buildBrandVoice', () => {
  let result: BrandVoice;

  beforeAll(() => {
    result = buildBrandVoice(testBrandConfig, 'test-client');
  });

  it('produces an object with all required BrandVoice fields', () => {
    expect(result).toHaveProperty('clientId', 'test-client');
    expect(result).toHaveProperty('generatedAt');
    expect(result).toHaveProperty('personality');
    expect(result).toHaveProperty('pillars');
    expect(result).toHaveProperty('toneSpectrum');
    expect(result).toHaveProperty('doList');
    expect(result).toHaveProperty('dontList');
    expect(result).toHaveProperty('vocabularyBank');
    expect(result).toHaveProperty('manifesto');
    expect(result).toHaveProperty('valueProp');
    expect(result).toHaveProperty('taglines');
  });

  it('generatedAt is a valid ISO timestamp', () => {
    expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
  });

  it('personality contains 3-5 adjectives', () => {
    expect(result.personality.length).toBeGreaterThanOrEqual(3);
    expect(result.personality.length).toBeLessThanOrEqual(5);
  });

  it('vocabularyBank.approved has 20-30 words', () => {
    expect(result.vocabularyBank.approved.length).toBeGreaterThanOrEqual(20);
    expect(result.vocabularyBank.approved.length).toBeLessThanOrEqual(30);
  });

  it('vocabularyBank.forbidden has 10-15 words', () => {
    expect(result.vocabularyBank.forbidden.length).toBeGreaterThanOrEqual(10);
    expect(result.vocabularyBank.forbidden.length).toBeLessThanOrEqual(15);
  });
});

describe('generateVoicePillars', () => {
  it('produces exactly 3 voice pillars', () => {
    const pillars = generateVoicePillars(testBrandConfig);
    expect(pillars).toHaveLength(3);
  });

  it('each pillar has name, description, and example as non-empty strings', () => {
    const pillars = generateVoicePillars(testBrandConfig);
    for (const pillar of pillars) {
      expect(typeof pillar.name).toBe('string');
      expect(pillar.name.length).toBeGreaterThan(0);
      expect(typeof pillar.description).toBe('string');
      expect(pillar.description.length).toBeGreaterThan(0);
      expect(typeof pillar.example).toBe('string');
      expect(pillar.example.length).toBeGreaterThan(0);
    }
  });

  it('produces at least 3 pillars even with fewer personality adjectives', () => {
    const minConfig: BrandVoiceConfig = {
      ...testBrandConfig,
      personality: ['bold'],
    };
    const pillars = generateVoicePillars(minConfig);
    expect(pillars.length).toBeGreaterThanOrEqual(3);
  });
});

describe('generateToneSpectrum', () => {
  it('produces exactly 5 channels', () => {
    const channels = generateToneSpectrum(testBrandConfig);
    expect(channels).toHaveLength(5);
  });

  it('covers all 5 required channel names', () => {
    const channels = generateToneSpectrum(testBrandConfig);
    const names = channels.map((c) => c.channel);
    expect(names).toEqual(['social', 'email', 'web', 'technical', 'exec']);
  });

  it('each channel has toneScore between 1 and 10', () => {
    const channels = generateToneSpectrum(testBrandConfig);
    for (const ch of channels) {
      expect(ch.toneScore).toBeGreaterThanOrEqual(1);
      expect(ch.toneScore).toBeLessThanOrEqual(10);
    }
  });

  it('each channel has description and example as non-empty strings', () => {
    const channels = generateToneSpectrum(testBrandConfig);
    for (const ch of channels) {
      expect(typeof ch.description).toBe('string');
      expect(ch.description.length).toBeGreaterThan(0);
      expect(typeof ch.example).toBe('string');
      expect(ch.example.length).toBeGreaterThan(0);
    }
  });
});

describe('generateDoList', () => {
  it('produces at least 10 entries', () => {
    const doList = generateDoList(testBrandConfig);
    expect(doList.length).toBeGreaterThanOrEqual(10);
  });

  it('each entry has context, do, and example as non-empty strings', () => {
    const doList = generateDoList(testBrandConfig);
    for (const entry of doList) {
      expect(typeof entry.context).toBe('string');
      expect(entry.context.length).toBeGreaterThan(0);
      expect(typeof entry.do).toBe('string');
      expect(entry.do.length).toBeGreaterThan(0);
      expect(typeof entry.example).toBe('string');
      expect(entry.example.length).toBeGreaterThan(0);
    }
  });
});

describe('generateDontList', () => {
  it('produces at least 10 entries', () => {
    const dontList = generateDontList(testBrandConfig);
    expect(dontList.length).toBeGreaterThanOrEqual(10);
  });

  it('each entry has context, dont, example, and instead as non-empty strings', () => {
    const dontList = generateDontList(testBrandConfig);
    for (const entry of dontList) {
      expect(typeof entry.context).toBe('string');
      expect(entry.context.length).toBeGreaterThan(0);
      expect(typeof entry.dont).toBe('string');
      expect(entry.dont.length).toBeGreaterThan(0);
      expect(typeof entry.example).toBe('string');
      expect(entry.example.length).toBeGreaterThan(0);
      expect(typeof entry.instead).toBe('string');
      expect(entry.instead.length).toBeGreaterThan(0);
    }
  });
});

describe('generateManifesto', () => {
  it('has all 3 fields: belief, bridge, bold', () => {
    const manifesto = generateManifesto(testBrandConfig);
    expect(typeof manifesto.belief).toBe('string');
    expect(typeof manifesto.bridge).toBe('string');
    expect(typeof manifesto.bold).toBe('string');
  });

  it('all fields are non-empty strings', () => {
    const manifesto = generateManifesto(testBrandConfig);
    expect(manifesto.belief.length).toBeGreaterThan(0);
    expect(manifesto.bridge.length).toBeGreaterThan(0);
    expect(manifesto.bold.length).toBeGreaterThan(0);
  });

  it('belief contains a sentence about the industry', () => {
    const manifesto = generateManifesto(testBrandConfig);
    expect(manifesto.belief).toContain('developer tools and automation');
  });
});

describe('generateValueProp', () => {
  it('headline is under 10 words', () => {
    const vp = generateValueProp(testBrandConfig);
    const wordCount = vp.headline.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(10);
  });

  it('subHeadline is under 30 words', () => {
    const vp = generateValueProp(testBrandConfig);
    const wordCount = vp.subHeadline.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(30);
  });

  it('has exactly 3 benefit bullets', () => {
    const vp = generateValueProp(testBrandConfig);
    expect(vp.benefitBullets).toHaveLength(3);
  });

  it('each bullet is between 5 and 20 words', () => {
    const vp = generateValueProp(testBrandConfig);
    for (const bullet of vp.benefitBullets) {
      const wordCount = bullet.split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(5);
      expect(wordCount).toBeLessThanOrEqual(20);
    }
  });

  it('antiVP is a non-empty string', () => {
    const vp = generateValueProp(testBrandConfig);
    expect(typeof vp.antiVP).toBe('string');
    expect(vp.antiVP.length).toBeGreaterThan(0);
  });

  it('all fields are plain text (no Markdown)', () => {
    const vp = generateValueProp(testBrandConfig);
    const allText = [vp.headline, vp.subHeadline, vp.antiVP, ...vp.benefitBullets].join(' ');
    expect(allText).not.toMatch(/[#*_`\[\]]/);
  });
});

describe('generateTaglines', () => {
  it('produces between 5 and 10 taglines', () => {
    const taglines = generateTaglines(testBrandConfig);
    expect(taglines.length).toBeGreaterThanOrEqual(5);
    expect(taglines.length).toBeLessThanOrEqual(10);
  });

  it('uses all 5 formulas', () => {
    const taglines = generateTaglines(testBrandConfig);
    const formulas = new Set(taglines.map((t) => t.formula));
    expect(formulas.has('Direct Benefit')).toBe(true);
    expect(formulas.has('Metaphor')).toBe(true);
    expect(formulas.has('Contrast')).toBe(true);
    expect(formulas.has('Provocation')).toBe(true);
    expect(formulas.has('Identity')).toBe(true);
  });

  it('each tagline has text, formula, and rationale as non-empty strings', () => {
    const taglines = generateTaglines(testBrandConfig);
    for (const tag of taglines) {
      expect(typeof tag.text).toBe('string');
      expect(tag.text.length).toBeGreaterThan(0);
      expect(typeof tag.formula).toBe('string');
      expect(tag.formula.length).toBeGreaterThan(0);
      expect(typeof tag.rationale).toBe('string');
      expect(tag.rationale.length).toBeGreaterThan(0);
    }
  });
});

describe('edge cases', () => {
  it('handles minimal config (empty arrays)', () => {
    const minConfig: BrandVoiceConfig = {
      personality: [],
      industry: '',
      audience: '',
      tone: 'professional',
      forbiddenWords: [],
      approvedWords: [],
      competitorBrands: [],
    };

    const result = buildBrandVoice(minConfig, 'minimal');
    expect(result.clientId).toBe('minimal');
    expect(result.pillars.length).toBeGreaterThanOrEqual(3);
    expect(result.toneSpectrum).toHaveLength(5);
    expect(result.doList.length).toBeGreaterThanOrEqual(10);
    expect(result.dontList.length).toBeGreaterThanOrEqual(10);
    expect(result.taglines.length).toBeGreaterThanOrEqual(5);
    expect(result.manifesto.belief.length).toBeGreaterThan(0);
    expect(result.manifesto.bridge.length).toBeGreaterThan(0);
    expect(result.manifesto.bold.length).toBeGreaterThan(0);
  });

  it('handles config with single personality adjective', () => {
    const singleConfig: BrandVoiceConfig = {
      ...testBrandConfig,
      personality: ['bold'],
    };

    const result = buildBrandVoice(singleConfig, 'single');
    expect(result.personality).toEqual(['bold']);
    expect(result.pillars.length).toBeGreaterThanOrEqual(3);
    expect(result.valueProp.benefitBullets).toHaveLength(3);
  });
});
