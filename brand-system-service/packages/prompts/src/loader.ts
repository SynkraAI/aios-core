/**
 * Template file loader — reads JSON templates from the templates/ directory.
 *
 * @see BSS-3.3: Prompt Template Library
 */

import * as fs from 'fs';
import * as path from 'path';
import type { PromptTemplate } from './types';
import { PromptRegistry } from './registry';

/**
 * Load all JSON template files from the given directory into the registry.
 * Uses `fs.readdirSync` — no glob library needed per Dev Notes.
 */
export function loadTemplatesFromDir(
  registry: PromptRegistry,
  templatesDir?: string,
): void {
  const dir = templatesDir ?? path.resolve(__dirname, '..', 'templates');

  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const template: PromptTemplate = JSON.parse(content);
    registry.registerTemplate(template);
  }
}

/**
 * Create a pre-loaded registry with all bundled templates.
 */
export function createDefaultRegistry(templatesDir?: string): PromptRegistry {
  const registry = new PromptRegistry();
  loadTemplatesFromDir(registry, templatesDir);
  return registry;
}
