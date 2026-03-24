/**
 * @brand-system/prompts — Versioned Prompt Template Library
 *
 * Provides versioned, A/B-testable prompt templates with client
 * context injection via Handlebars.
 *
 * @module prompts
 */
export type { PromptTemplate, PromptVariableSchema, ClientContext, RenderedPrompt, TemplateSummary, TemplateStatus, DeliverableType, ChangelogEntry, } from './types';
export { PromptRegistry, TemplateValidationError } from './registry';
export { render, TemplateRenderError } from './renderer';
export { loadTemplatesFromDir, createDefaultRegistry } from './loader';
//# sourceMappingURL=index.d.ts.map