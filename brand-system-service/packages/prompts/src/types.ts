/**
 * Prompt Template Library — Type Definitions
 *
 * @see BSS-3.3: Prompt Template Library
 */

/** Template lifecycle status. */
export type TemplateStatus = 'draft' | 'active' | 'deprecated';

/** Supported deliverable types. */
export type DeliverableType =
  | 'brand-voice-guide'
  | 'social-post'
  | 'carousel-caption'
  | 'landing-page-copy'
  | 'email-sequence'
  | 'ad-copy'
  | 'video-script'
  | 'hashtag-set'
  | 'quality-evaluator';

/** Schema definition for a single template variable. */
export interface PromptVariableSchema {
  readonly type: 'string' | 'string[]' | 'number' | 'boolean';
  readonly required: boolean;
  readonly default?: unknown;
  readonly description?: string;
}

/** Changelog entry for a template version. */
export interface ChangelogEntry {
  readonly version: string;
  readonly description: string;
  readonly date: string;
}

/** A versioned prompt template with A/B variant support. */
export interface PromptTemplate {
  readonly id: string;
  readonly deliverableType: DeliverableType;
  readonly version: string;
  readonly status: TemplateStatus;
  readonly variant: string;
  readonly changelog: ChangelogEntry[];
  readonly variables: Record<string, PromptVariableSchema>;
  readonly systemPrompt: string;
  readonly userPromptTemplate: string;
}

/** Client context for variable injection into templates. */
export interface ClientContext {
  readonly clientId: string;
  readonly brandName: string;
  readonly brandPersonality: string[];
  readonly industryVertical: string;
  readonly toneSpectrum: string;
  readonly vocabularyBank: string[];
  readonly forbiddenWords: string[];
  readonly competitorNames: string[];
  readonly deliverablePurpose?: string;
  /** Additional dynamic variables for template-specific fields. */
  readonly [key: string]: unknown;
}

/** Result of rendering a prompt template with context. */
export interface RenderedPrompt {
  readonly system: string;
  readonly user: string;
}

/** Metadata summary for listing templates. */
export interface TemplateSummary {
  readonly id: string;
  readonly deliverableType: DeliverableType;
  readonly version: string;
  readonly status: TemplateStatus;
  readonly variant: string;
}
