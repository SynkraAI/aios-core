/**
 * @brand-system/prompts — Versioned Prompt Template Library
 *
 * Provides versioned, A/B-testable prompt templates with client
 * context injection via Handlebars.
 *
 * @module prompts
 */

// Types
export type {
  PromptTemplate,
  PromptVariableSchema,
  ClientContext,
  RenderedPrompt,
  TemplateSummary,
  TemplateStatus,
  DeliverableType,
  ChangelogEntry,
} from './types';

// Registry
export { PromptRegistry, TemplateValidationError } from './registry';

// Renderer
export { render, TemplateRenderError } from './renderer';

// Loader
export { loadTemplatesFromDir, createDefaultRegistry } from './loader';
