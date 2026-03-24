/**
 * PromptRegistry — versioned template registry with A/B variant support.
 *
 * @see BSS-3.3: Prompt Template Library
 */
import type { PromptTemplate, DeliverableType, TemplateSummary } from './types';
/**
 * Error thrown when template validation fails on registration.
 */
export declare class TemplateValidationError extends Error {
    readonly code = "TEMPLATE_VALIDATION_ERROR";
    constructor(message: string);
}
/**
 * Registry for versioned prompt templates with A/B variant support.
 *
 * Templates are indexed by `deliverableType`. Multiple versions and
 * variants can coexist. `getTemplate()` resolves the latest active
 * version by default.
 */
export declare class PromptRegistry {
    private readonly templates;
    /**
     * Register a template. Validates version format and changelog presence.
     * @throws TemplateValidationError if validation fails.
     */
    registerTemplate(template: PromptTemplate): void;
    /**
     * Get a template by deliverable type.
     * - If `version` is omitted, returns the latest active version.
     * - If `variant` is omitted, returns variant "A".
     */
    getTemplate(deliverableType: DeliverableType, version?: string, variant?: string): PromptTemplate | undefined;
    /**
     * List metadata for all registered templates.
     */
    listTemplates(): TemplateSummary[];
}
//# sourceMappingURL=registry.d.ts.map