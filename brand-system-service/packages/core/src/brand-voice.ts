/**
 * Brand Voice types for Brand System Service.
 *
 * These interfaces define the machine-readable brand voice schema
 * consumed by EPIC-BSS-3 AI copy generation prompts.
 * All string fields are clean text (no Markdown, no HTML).
 */

/**
 * A core voice pillar derived from brand personality.
 */
export interface VoicePillar {
  readonly name: string;
  readonly description: string;
  readonly example: string;
}

/**
 * Tone configuration for a specific communication channel.
 * Score 1 = ultra-formal, 10 = ultra-casual.
 */
export interface ToneChannel {
  readonly channel: string;
  readonly toneScore: number;
  readonly description: string;
  readonly example: string;
}

/**
 * An approved voice pattern with context and example.
 */
export interface DoEntry {
  readonly context: string;
  readonly do: string;
  readonly example: string;
}

/**
 * A forbidden voice pattern with alternative suggestion.
 */
export interface DontEntry {
  readonly context: string;
  readonly dont: string;
  readonly example: string;
  readonly instead: string;
}

/**
 * A tagline option generated from a specific formula.
 */
export interface Tagline {
  readonly text: string;
  readonly formula: string;
  readonly rationale: string;
}

/**
 * Manifesto using the Belief-Bridge-Bold framework.
 */
export interface Manifesto {
  readonly belief: string;
  readonly bridge: string;
  readonly bold: string;
}

/**
 * Value Proposition Canvas with headline, sub, bullets, and anti-VP.
 */
export interface ValueProp {
  readonly headline: string;
  readonly subHeadline: string;
  readonly benefitBullets: string[];
  readonly antiVP: string;
}

/**
 * Root brand voice object — primary context for AI copy generation.
 * Injected into all EPIC-BSS-3 prompts as structured JSON.
 */
export interface BrandVoice {
  readonly clientId: string;
  readonly generatedAt: string;
  readonly personality: string[];
  readonly pillars: VoicePillar[];
  readonly toneSpectrum: ToneChannel[];
  readonly doList: DoEntry[];
  readonly dontList: DontEntry[];
  readonly vocabularyBank: {
    readonly approved: string[];
    readonly forbidden: string[];
  };
  readonly manifesto: Manifesto;
  readonly valueProp: ValueProp;
  readonly taglines: Tagline[];
}
