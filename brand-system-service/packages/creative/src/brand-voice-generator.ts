import fs from 'node:fs';
import path from 'node:path';

import type {
  BrandVoice,
  BrandVoiceConfig,
  DoEntry,
  DontEntry,
  Manifesto,
  Tagline,
  ToneChannel,
  ValueProp,
  VoicePillar,
} from '@bss/core';
import { createLogger } from '@bss/core';

/**
 * Pillar templates keyed by personality adjective.
 * Fallback generates a generic pillar from the adjective.
 */
const PILLAR_MAP: Record<string, { name: string; description: string; example: string }> = {
  innovative: {
    name: 'Innovation-Led',
    description: 'We push boundaries and explore new solutions rather than following convention.',
    example: 'We chose a novel approach to solve the caching problem rather than defaulting to Redis.',
  },
  approachable: {
    name: 'Human-Centered Clarity',
    description: 'We communicate complex ideas in plain language that anyone can understand.',
    example: 'Our docs read like a conversation, not a spec sheet.',
  },
  precise: {
    name: 'Precision & Accuracy',
    description: 'Every claim we make is specific, measurable, and backed by evidence.',
    example: 'Reduced build time by 47%, not "significantly faster".',
  },
  bold: {
    name: 'Confident Authority',
    description: 'We state our position clearly and stand behind our technical decisions.',
    example: 'We chose TypeScript because type safety prevents entire categories of bugs.',
  },
  trustworthy: {
    name: 'Earned Trust',
    description: 'We build trust through transparency, honest communication, and consistent delivery.',
    example: 'When something breaks, we publish a post-mortem the same day.',
  },
  pragmatic: {
    name: 'Practical Focus',
    description: 'We favor working solutions over theoretical perfection.',
    example: 'Ship a good solution today instead of a perfect one next quarter.',
  },
  technical: {
    name: 'Technical Depth',
    description: 'We demonstrate deep technical knowledge without gatekeeping.',
    example: 'Our blog posts include runnable code samples, not just architecture diagrams.',
  },
  reliable: {
    name: 'Unwavering Reliability',
    description: 'We deliver on our promises consistently, every single time.',
    example: '99.99% uptime is not a marketing number; it is our SLA.',
  },
};

/**
 * Tone score baselines by tone setting.
 * Channels: social, email, web, technical, exec
 */
const TONE_BASELINES: Record<string, Record<string, number>> = {
  professional: { social: 6, email: 4, web: 5, technical: 3, exec: 2 },
  conversational: { social: 9, email: 7, web: 8, technical: 5, exec: 4 },
  technical: { social: 5, email: 3, web: 4, technical: 2, exec: 2 },
  inspirational: { social: 8, email: 6, web: 7, technical: 4, exec: 3 },
};

const CHANNEL_DESCRIPTIONS: Record<string, Record<string, string>> = {
  social: {
    professional: 'Friendly but polished. Short sentences. Active voice. Can use light humor.',
    conversational: 'Casual and warm. Emojis sparingly. Feels like a friend who codes.',
    technical: 'Concise and factual. Share insights, not opinions. Link to docs.',
    inspirational: 'Energetic and motivating. Celebrate wins. Share the mission.',
  },
  email: {
    professional: 'Clear subject lines. Scannable format. Respectful of time.',
    conversational: 'Warm opener. Bullet points for action items. Personal sign-off.',
    technical: 'Structured with sections. Data-first. Minimal fluff.',
    inspirational: 'Story-driven opener. Clear CTA. Mission-aligned closing.',
  },
  web: {
    professional: 'Balanced tone. Benefit-driven headlines. Clean copy blocks.',
    conversational: 'Approachable headers. Short paragraphs. Direct address (you/your).',
    technical: 'Feature-specification style. Code examples inline. Precise claims.',
    inspirational: 'Vision-forward headlines. Aspirational but grounded. Social proof.',
  },
  technical: {
    professional: 'Specification language. Precise terminology. No ambiguity.',
    conversational: 'Developer-friendly docs. Explain the why. Use analogies.',
    technical: 'RFC-style precision. Standard terminology only. No marketing.',
    inspirational: 'Mission context first, then specs. Show the bigger picture.',
  },
  exec: {
    professional: 'Executive summary format. Impact metrics. Strategic framing.',
    conversational: 'Less formal than traditional exec comms, but still strategic.',
    technical: 'Data-heavy. ROI focused. Technical terms only when necessary.',
    inspirational: 'Vision-led. Market opportunity. Bold claims backed by data.',
  },
};

const CHANNEL_EXAMPLES: Record<string, Record<string, string>> = {
  social: {
    professional: 'Just shipped v3.0 with 40% faster builds. Try it out and let us know what you think.',
    conversational: 'v3.0 is live! Builds are 40% faster and we are honestly still surprised by the numbers.',
    technical: 'v3.0: Build times reduced 40% via incremental compilation. Benchmarks in the release notes.',
    inspirational: 'What if every developer could ship in half the time? v3.0 gets us closer to that world.',
  },
  email: {
    professional: 'We are writing to share that version 3.0 is now available with significant performance improvements.',
    conversational: 'Hey! We just released v3.0 and we think you will love the speed improvements.',
    technical: 'Release summary: v3.0 introduces incremental compilation, reducing average build time by 40%.',
    inspirational: 'We started this journey to make developer tools faster. Today, v3.0 proves it is possible.',
  },
  web: {
    professional: 'Build faster with confidence. Our platform reduces build times by 40% without compromising reliability.',
    conversational: 'Your builds just got 40% faster. No catch. No config changes. Just upgrade.',
    technical: 'Incremental compilation engine: 40% build time reduction. Zero configuration. Full type safety.',
    inspirational: 'The future of development is fast, reliable, and open. Welcome to v3.0.',
  },
  technical: {
    professional: 'The incremental compilation engine processes only changed modules, reducing cold build times by 40%.',
    conversational: 'Instead of rebuilding everything, we now only rebuild what changed. Result: 40% faster builds.',
    technical: 'Directed acyclic graph-based incremental compilation. Changed-module detection via content hashing.',
    inspirational: 'Every millisecond saved in a build is a moment returned to creative problem-solving.',
  },
  exec: {
    professional: 'Platform v3.0 delivers a 40% build time reduction, projected to save 120 engineering hours per quarter.',
    conversational: 'Good news: v3.0 means your teams build 40% faster. That is about 120 hours per quarter back.',
    technical: 'v3.0 ROI: 40% build time reduction. 120h/quarter saved at current team size. Payback in 2 sprints.',
    inspirational: 'v3.0 is not just a release. It is a step toward our mission: making every developer 2x productive.',
  },
};

/**
 * Generate 3 voice pillars from personality adjectives.
 */
export function generateVoicePillars(config: BrandVoiceConfig): VoicePillar[] {
  const pillars: VoicePillar[] = [];
  const adjectives = config.personality.slice(0, 5);

  for (const adj of adjectives) {
    const key = adj.toLowerCase();
    if (PILLAR_MAP[key]) {
      pillars.push(PILLAR_MAP[key]);
    } else {
      pillars.push({
        name: `${capitalize(adj)}-Driven`,
        description: `Our communication reflects a ${adj} character in every interaction.`,
        example: `When writing content, ask: does this feel ${adj}?`,
      });
    }
    if (pillars.length >= 3) break;
  }

  // Ensure at least 3 pillars
  while (pillars.length < 3) {
    const idx = pillars.length;
    const adj = adjectives[idx] || 'authentic';
    pillars.push({
      name: `${capitalize(adj)}-Driven`,
      description: `Our communication reflects a ${adj} character in every interaction.`,
      example: `When writing content, ask: does this feel ${adj}?`,
    });
  }

  return pillars;
}

/**
 * Generate tone spectrum for 5 channels.
 */
export function generateToneSpectrum(config: BrandVoiceConfig): ToneChannel[] {
  const baseline = TONE_BASELINES[config.tone] || TONE_BASELINES.professional;
  const channels = ['social', 'email', 'web', 'technical', 'exec'] as const;

  return channels.map((channel) => ({
    channel,
    toneScore: baseline[channel],
    description: CHANNEL_DESCRIPTIONS[channel]?.[config.tone]
      || CHANNEL_DESCRIPTIONS[channel]?.professional
      || `${capitalize(channel)} channel tone.`,
    example: CHANNEL_EXAMPLES[channel]?.[config.tone]
      || CHANNEL_EXAMPLES[channel]?.professional
      || `Example ${channel} communication.`,
  }));
}

/**
 * Expand approved words into do-list entries (10+ entries).
 */
export function generateDoList(config: BrandVoiceConfig): DoEntry[] {
  const entries: DoEntry[] = [];
  const contexts = [
    'marketing copy',
    'documentation',
    'social media',
    'email campaigns',
    'technical writing',
    'blog posts',
    'landing pages',
    'release notes',
    'support responses',
    'presentations',
    'onboarding',
    'product descriptions',
  ];

  for (let i = 0; i < config.approvedWords.length && entries.length < 15; i++) {
    const word = config.approvedWords[i];
    const context = contexts[i % contexts.length];
    entries.push({
      context,
      do: `Use "${word}" to describe our approach`,
      example: `Our platform helps you ${word} with confidence.`,
    });
  }

  // Ensure at least 10
  while (entries.length < 10) {
    const idx = entries.length;
    entries.push({
      context: contexts[idx % contexts.length],
      do: 'Use clear, direct language',
      example: 'Ship code that works, not code that impresses.',
    });
  }

  return entries;
}

/**
 * Expand forbidden words into don't-list entries (10+ entries).
 */
export function generateDontList(config: BrandVoiceConfig): DontEntry[] {
  const entries: DontEntry[] = [];
  const alternatives: Record<string, string> = {
    synergy: 'collaboration',
    leverage: 'use',
    disrupt: 'improve',
    pivot: 'adjust',
    paradigm: 'approach',
    scalable: 'grows with your team',
    'bleeding-edge': 'modern',
    guru: 'expert',
    ninja: 'specialist',
    rockstar: 'experienced engineer',
    magic: 'automation',
    seamless: 'smooth',
    revolutionary: 'significant',
  };

  const contexts = [
    'marketing copy',
    'blog posts',
    'social media',
    'email campaigns',
    'documentation',
    'landing pages',
    'presentations',
    'job postings',
    'press releases',
    'product descriptions',
    'support responses',
    'technical writing',
    'release notes',
  ];

  for (let i = 0; i < config.forbiddenWords.length && entries.length < 15; i++) {
    const word = config.forbiddenWords[i];
    const alt = alternatives[word.toLowerCase()] || 'a more specific term';
    const context = contexts[i % contexts.length];
    entries.push({
      context,
      dont: `Avoid "${word}"`,
      example: `We ${word} the industry with our solution.`,
      instead: `Replace with "${alt}": We ${alt} the development workflow.`,
    });
  }

  // Ensure at least 10
  while (entries.length < 10) {
    const idx = entries.length;
    entries.push({
      context: contexts[idx % contexts.length],
      dont: 'Avoid vague superlatives',
      example: 'Our product is the best in the market.',
      instead: 'Be specific: Our product reduces build time by 40%.',
    });
  }

  return entries;
}

/**
 * Generate manifesto using Belief-Bridge-Bold framework.
 * Template-driven from config fields (no AI generation).
 */
export function generateManifesto(config: BrandVoiceConfig): Manifesto {
  const personality = config.personality.slice(0, 3).join(', ') || 'innovative';
  const industry = config.industry || 'technology';
  const audience = config.audience || 'professionals';

  return {
    belief: `We believe that ${industry} should be ${personality} — built for ${audience} who demand tools that respect their time and intelligence.`,
    bridge: `That is why we build every product with ${config.personality[0] || 'care'} at the core, ensuring that ${audience} can focus on what matters most: creating great work.`,
    bold: `Our promise: every tool we ship will be ${config.personality[1] || 'reliable'}, every experience will be ${config.personality[2] || 'clear'}, and every interaction will prove we earn your trust daily.`,
  };
}

/**
 * Generate Value Proposition Canvas.
 * Template-driven from config fields.
 */
export function generateValueProp(config: BrandVoiceConfig): ValueProp {
  const adj = config.personality[0] || 'powerful';
  const audience = config.audience || 'professionals';
  const industry = config.industry || 'technology';
  const competitor = config.competitorBrands[0] || 'generic tools';

  // Headline must be <10 words per AC 4. Truncate industry/audience to key terms.
  const industryShort = industry.split(/\s+/).slice(0, 2).join(' ');
  const audienceShort = audience.split(/\s+/).slice(0, 2).join(' ');
  const headline = `${capitalize(adj)} ${industryShort} for ${audienceShort}`;
  const subHeadline = `A ${config.personality.slice(0, 2).join(' and ') || 'modern'} platform built for ${audienceShort} who value ${config.personality[2] || 'quality'}.`;

  const bulletMap: Record<string, string> = {
    innovative: 'Stay ahead with tools that evolve as fast as your stack',
    approachable: 'Onboard your team in minutes, not days',
    precise: 'Get exact results with deterministic, reproducible pipelines',
    bold: 'Ship with confidence backed by automated quality gates',
    trustworthy: 'Rely on transparent operations with full audit trails',
    pragmatic: 'Solve real problems with practical, battle-tested solutions',
    reliable: 'Count on consistent performance under any workload',
    fast: 'Eliminate wait times with optimized build and deploy cycles',
  };

  const bullets = config.personality
    .slice(0, 3)
    .map((a: string) => bulletMap[a.toLowerCase()] || `Experience ${a} tooling that adapts to your workflow`);

  while (bullets.length < 3) {
    bullets.push('Focus on building, not configuring');
  }

  const antiVP = `Not just another ${industry} tool like ${competitor} — we are purpose-built for teams who value ${config.personality[0] || 'quality'} over hype.`;

  return {
    headline,
    subHeadline,
    benefitBullets: bullets,
    antiVP,
  };
}

/**
 * Generate 5-10 taglines using 5 formulas.
 */
export function generateTaglines(config: BrandVoiceConfig): Tagline[] {
  const taglines: Tagline[] = [];
  const adj1 = config.personality[0] || 'better';
  const adj2 = config.personality[1] || 'faster';
  const audience = config.audience || 'teams';
  const industry = config.industry || 'technology';

  // Formula 1: Direct Benefit (2 variants)
  taglines.push({
    text: `${capitalize(adj1)} ${industry}, delivered.`,
    formula: 'Direct Benefit',
    rationale: `Leads with the primary brand attribute (${adj1}) and the industry, creating immediate clarity about what we offer.`,
  });
  taglines.push({
    text: `Ship ${adj2}. Build ${adj1}.`,
    formula: 'Direct Benefit',
    rationale: `Pairs two personality traits as action outcomes, appealing to ${audience} who value speed and quality.`,
  });

  // Formula 2: Metaphor (2 variants)
  taglines.push({
    text: `The compass for ${audience} who build what matters.`,
    formula: 'Metaphor',
    rationale: 'Positions the brand as a guiding tool, evoking reliability and direction without technical jargon.',
  });
  taglines.push({
    text: `Your ${industry} co-pilot.`,
    formula: 'Metaphor',
    rationale: `Uses the co-pilot metaphor to suggest assistance without replacement, resonating with ${audience} who want control.`,
  });

  // Formula 3: Contrast (2 variants)
  taglines.push({
    text: `Not hype. Just ${adj1} tools.`,
    formula: 'Contrast',
    rationale: 'Directly opposes industry noise with the brand personality, establishing credibility through restraint.',
  });
  taglines.push({
    text: `Others promise. We ${adj1 === 'innovative' ? 'deliver' : adj1}.`,
    formula: 'Contrast',
    rationale: 'Contrasts competitor behavior with brand action, building trust through demonstrated difference.',
  });

  // Formula 4: Provocation (1-2 variants)
  taglines.push({
    text: `What if ${industry} actually worked for ${audience}?`,
    formula: 'Provocation',
    rationale: `Challenges the status quo in ${industry}, inviting the audience to imagine a better alternative.`,
  });
  taglines.push({
    text: `Ready to stop fighting your tools?`,
    formula: 'Provocation',
    rationale: 'Taps into a common frustration among developers, positioning the brand as the solution.',
  });

  // Formula 5: Identity (1-2 variants)
  taglines.push({
    text: `For ${audience}, by engineers who get it.`,
    formula: 'Identity',
    rationale: `Signals shared identity with the target audience, building trust through peer credibility.`,
  });
  taglines.push({
    text: `Built by builders. For builders.`,
    formula: 'Identity',
    rationale: 'Simple identity statement that creates immediate kinship with the target audience.',
  });

  return taglines;
}

/**
 * Build the complete BrandVoice object from config.
 * Combines all generators into a single structured output.
 */
export function buildBrandVoice(config: BrandVoiceConfig, clientId: string): BrandVoice {
  return {
    clientId,
    generatedAt: new Date().toISOString(),
    personality: config.personality.slice(0, 5),
    pillars: generateVoicePillars(config),
    toneSpectrum: generateToneSpectrum(config),
    doList: generateDoList(config),
    dontList: generateDontList(config),
    vocabularyBank: {
      approved: config.approvedWords.slice(0, 30),
      forbidden: config.forbiddenWords.slice(0, 15),
    },
    manifesto: generateManifesto(config),
    valueProp: generateValueProp(config),
    taglines: generateTaglines(config),
  };
}

/**
 * Build brand voice and write to output file.
 *
 * @param config - Brand voice configuration
 * @param clientId - Client slug for output path
 * @param outputDir - Base output directory
 * @returns Path to generated brand-voice.json
 */
export function writeBrandVoice(
  config: BrandVoiceConfig,
  clientId: string,
  outputDir: string,
): string {
  const logger = createLogger('BrandVoiceGenerator', false);
  const brandVoice = buildBrandVoice(config, clientId);

  const outPath = path.join(outputDir, clientId, 'brand-voice.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(brandVoice, null, 2), 'utf-8');

  logger.info('Brand voice generated', {
    clientId,
    path: outPath,
    pillars: brandVoice.pillars.length,
    toneChannels: brandVoice.toneSpectrum.length,
    doEntries: brandVoice.doList.length,
    dontEntries: brandVoice.dontList.length,
    taglines: brandVoice.taglines.length,
    approvedWords: brandVoice.vocabularyBank.approved.length,
    forbiddenWords: brandVoice.vocabularyBank.forbidden.length,
  });

  return outPath;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
