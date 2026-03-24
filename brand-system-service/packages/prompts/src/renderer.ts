/**
 * Template renderer — Handlebars-based variable injection.
 *
 * @see BSS-3.3: Prompt Template Library
 */

import Handlebars from 'handlebars';
import type { PromptTemplate, ClientContext, RenderedPrompt } from './types';

/**
 * Error thrown when a required variable is missing from the context.
 */
export class TemplateRenderError extends Error {
  public readonly code = 'TEMPLATE_RENDER_ERROR';
  public readonly missingVariables: string[];

  constructor(templateId: string, missingVariables: string[]) {
    super(
      `Template "${templateId}" render failed. Missing required variables: ${missingVariables.join(', ')}`,
    );
    this.name = 'TemplateRenderError';
    this.missingVariables = missingVariables;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Render a prompt template by substituting context variables.
 *
 * @throws TemplateRenderError if required variables are missing.
 */
export function render(
  template: PromptTemplate,
  context: ClientContext,
): RenderedPrompt {
  // Check required variables
  const missing: string[] = [];
  for (const [varName, schema] of Object.entries(template.variables)) {
    if (schema.required) {
      const value = (context as Record<string, unknown>)[varName];
      if (value === undefined || value === null) {
        // Check if there's a default
        if (schema.default === undefined) {
          missing.push(varName);
        }
      }
    }
  }

  if (missing.length > 0) {
    throw new TemplateRenderError(template.id, missing);
  }

  // Build context with defaults applied
  const renderContext: Record<string, unknown> = { ...context };
  for (const [varName, schema] of Object.entries(template.variables)) {
    if (
      renderContext[varName] === undefined &&
      schema.default !== undefined
    ) {
      renderContext[varName] = schema.default;
    }
  }

  const compiledSystem = Handlebars.compile(template.systemPrompt);
  const compiledUser = Handlebars.compile(template.userPromptTemplate);

  return {
    system: compiledSystem(renderContext),
    user: compiledUser(renderContext),
  };
}
