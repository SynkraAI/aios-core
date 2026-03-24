/**
 * Template file loader — reads JSON templates from the templates/ directory.
 *
 * @see BSS-3.3: Prompt Template Library
 */
import { PromptRegistry } from './registry';
/**
 * Load all JSON template files from the given directory into the registry.
 * Uses `fs.readdirSync` — no glob library needed per Dev Notes.
 */
export declare function loadTemplatesFromDir(registry: PromptRegistry, templatesDir?: string): void;
/**
 * Create a pre-loaded registry with all bundled templates.
 */
export declare function createDefaultRegistry(templatesDir?: string): PromptRegistry;
//# sourceMappingURL=loader.d.ts.map