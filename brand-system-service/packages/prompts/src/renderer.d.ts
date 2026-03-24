/**
 * Template renderer — Handlebars-based variable injection.
 *
 * @see BSS-3.3: Prompt Template Library
 */
import type { PromptTemplate, ClientContext, RenderedPrompt } from './types';
/**
 * Error thrown when a required variable is missing from the context.
 */
export declare class TemplateRenderError extends Error {
    readonly code = "TEMPLATE_RENDER_ERROR";
    readonly missingVariables: string[];
    constructor(templateId: string, missingVariables: string[]);
}
/**
 * Render a prompt template by substituting context variables.
 *
 * @throws TemplateRenderError if required variables are missing.
 */
export declare function render(template: PromptTemplate, context: ClientContext): RenderedPrompt;
//# sourceMappingURL=renderer.d.ts.map