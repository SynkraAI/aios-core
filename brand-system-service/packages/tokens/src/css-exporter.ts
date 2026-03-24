/**
 * CSS Custom Properties Exporter
 *
 * Reads W3C DTCG token JSON files for a given client and generates
 * CSS Custom Properties output. Used by the static generator pipeline
 * to inject design tokens into builds.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively flatten a nested token object into CSS Custom Properties.
 *
 * @param obj - Token object (nested groups or leaf tokens)
 * @param prefix - Current CSS variable prefix
 * @param result - Accumulated CSS variable declarations
 */
function flattenTokens(
  obj: Record<string, unknown>,
  prefix: string,
  result: string[]
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (typeof value !== 'object' || value === null) continue;

    const record = value as Record<string, unknown>;
    const varName = prefix ? `${prefix}-${key}` : key;

    if ('$value' in record && record.$value !== undefined) {
      const cssValue = String(record.$value);
      result.push(`  --${varName}: ${cssValue};`);
    } else {
      flattenTokens(record, varName, result);
    }
  }
}

/**
 * Export design tokens as CSS Custom Properties for a given client.
 *
 * Reads token JSON files from the configured tokens path (BSS_TOKENS_PATH env var
 * or default ./data/tokens) and produces a CSS string with :root variables.
 *
 * @param clientId - Client identifier for token resolution
 * @returns CSS string with :root custom properties
 */
export async function exportTokensAsCSS(clientId: string): Promise<string> {
  const tokensBasePath = process.env['BSS_TOKENS_PATH'] || './data/tokens';
  const clientTokenDir = path.resolve(tokensBasePath, clientId);
  const fallbackDir = path.resolve(tokensBasePath);

  // Resolve the token directory: try client-specific first, then fallback
  const tokenDir = fs.existsSync(clientTokenDir) ? clientTokenDir : fallbackDir;

  const tokenFiles = [
    'primitive/colors.json',
    'primitive/typography.json',
    'primitive/spacing.json',
    'primitive/effects.json',
    'semantic/colors.json',
  ];

  const cssVars: string[] = [];

  for (const file of tokenFiles) {
    const filePath = path.join(tokenDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
      flattenTokens(data, '', cssVars);
    } catch {
      // Skip files that cannot be parsed
    }
  }

  if (cssVars.length === 0) {
    return `/* tokens.css - ${clientId} */\n:root {\n  /* No tokens found */\n}\n`;
  }

  return `/* tokens.css - Design Tokens for ${clientId} */\n:root {\n${cssVars.join('\n')}\n}\n`;
}
