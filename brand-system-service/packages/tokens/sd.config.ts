/**
 * Style Dictionary 4.x Configuration for Brand System Service.
 *
 * Transforms W3C DTCG token files into multiple output formats:
 * - CSS Custom Properties (tokens.css)
 * - SCSS Variables (tokens.scss)
 * - Tailwind Config TypeScript (tailwind-tokens.ts)
 * - JSON Flat Export (tokens.json)
 *
 * @see ADR-002: W3C DTCG Token Format
 * @see BSS-2.2: Style Dictionary Build Pipeline
 */

import StyleDictionary from 'style-dictionary';
import type { Config, TransformedToken } from 'style-dictionary/types';
import * as path from 'node:path';

/**
 * Build configuration factory for Style Dictionary.
 * Accepts a client slug to produce isolated output per client.
 */
export function createConfig(clientSlug: string = 'default'): Config {
  const tokensDir = path.resolve(__dirname, '../../tokens');
  const buildPath = path.resolve(__dirname, `../../output/${clientSlug}/`);

  return {
    source: [`${tokensDir}/**/*.json`],
    // @ts-expect-error -- SD 4.x supports usesDtcg but types may lag
    usesDtcg: true,
    log: {
      verbosity: 'verbose',
    },
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `${buildPath}/`,
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              outputReferences: true,
            },
          },
        ],
      },
      scss: {
        transformGroup: 'scss',
        buildPath: `${buildPath}/`,
        files: [
          {
            destination: 'tokens.scss',
            format: 'scss/variables',
            options: {
              outputReferences: true,
            },
          },
        ],
      },
      tailwind: {
        transformGroup: 'js',
        buildPath: `${buildPath}/`,
        files: [
          {
            destination: 'tailwind-tokens.ts',
            format: 'tailwind/tokens',
          },
        ],
      },
      json: {
        transformGroup: 'js',
        buildPath: `${buildPath}/`,
        files: [
          {
            destination: 'tokens.json',
            format: 'json/flat',
          },
        ],
      },
      // TODO: Implement in BSS-9.5 (EPIC-BSS-9)
      // Figma Variables Push via Tokens Studio Pro integration.
      // Uncomment and configure when Tokens Studio Pro API is available.
      //
      // figma: {
      //   transformGroup: 'js',
      //   buildPath: `${buildPath}/`,
      //   files: [
      //     {
      //       destination: 'figma-tokens.json',
      //       format: 'json/flat',
      //     },
      //   ],
      //   // Configure Tokens Studio Pro:
      //   // - Set FIGMA_ACCESS_TOKEN env var
      //   // - Set FIGMA_FILE_ID env var
      //   // - Use @tokens-studio/sd-transforms for Figma-specific transforms
      //   // Reference: CON-13 — Code pushes to Figma, never the reverse
      // },
    },
  };
}

/**
 * Custom Tailwind format that generates a TypeScript default export
 * mapping token categories to Tailwind theme keys.
 */
function tailwindTokensFormat({
  dictionary,
}: {
  dictionary: { allTokens: TransformedToken[] };
}): string {
  const colors: Record<string, unknown> = {};
  const fontFamily: Record<string, string> = {};
  const fontSize: Record<string, string> = {};
  const spacing: Record<string, string> = {};
  const borderRadius: Record<string, string> = {};
  const boxShadow: Record<string, string> = {};
  const transitionDuration: Record<string, string> = {};
  const transitionTimingFunction: Record<string, string> = {};

  for (const token of dictionary.allTokens) {
    const tokenPath = token.path;
    const value = String(token.$value ?? token.value ?? '');

    // Colors — primitive and semantic
    if (
      token.type === 'color' ||
      token.$type === 'color' ||
      token.original?.$type === 'color'
    ) {
      buildNestedObject(colors, tokenPath, value);
    }

    // Font families
    if (
      token.type === 'fontFamily' ||
      token.$type === 'fontFamily' ||
      token.original?.$type === 'fontFamily'
    ) {
      const key = tokenPath.slice(-1)[0] || tokenPath.join('-');
      fontFamily[key] = value;
    }

    // Font sizes — primitive (fontSize.*) and semantic (typography.fontSize.*)
    if (tokenPath[0] === 'fontSize') {
      const key = tokenPath.slice(1).join('-') || 'default';
      fontSize[key] = value;
    } else if (tokenPath[0] === 'typography' && tokenPath[1] === 'fontSize') {
      const key = tokenPath.slice(2).join('-') || tokenPath.join('-');
      fontSize[key] = value;
    }

    // Spacing
    if (tokenPath[0] === 'spacing') {
      const key = tokenPath.slice(1).join('-') || 'default';
      spacing[key] = value;
    }

    // Border radius
    if (tokenPath[0] === 'borderRadius') {
      const key = tokenPath.slice(1).join('-') || 'default';
      borderRadius[key] = value;
    }

    // Box shadow
    if (
      tokenPath[0] === 'shadow' ||
      token.type === 'shadow' ||
      token.$type === 'shadow' ||
      token.original?.$type === 'shadow'
    ) {
      const key = tokenPath.slice(tokenPath[0] === 'shadow' ? 1 : 0).join('-') || 'default';
      boxShadow[key] = value;
    }

    // Transition duration
    if (tokenPath[0] === 'motion' && tokenPath[1] === 'duration') {
      const key = tokenPath.slice(2).join('-') || 'default';
      transitionDuration[key] = value;
    }

    // Transition timing function
    if (tokenPath[0] === 'motion' && tokenPath[1] === 'easing') {
      const key = tokenPath.slice(2).join('-') || 'default';
      transitionTimingFunction[key] = value;
    }
  }

  const theme: Record<string, unknown> = {};
  if (Object.keys(colors).length > 0) theme.colors = colors;
  if (Object.keys(fontFamily).length > 0) theme.fontFamily = fontFamily;
  if (Object.keys(fontSize).length > 0) theme.fontSize = fontSize;
  if (Object.keys(spacing).length > 0) theme.spacing = spacing;
  if (Object.keys(borderRadius).length > 0) theme.borderRadius = borderRadius;
  if (Object.keys(boxShadow).length > 0) theme.boxShadow = boxShadow;
  if (Object.keys(transitionDuration).length > 0) theme.transitionDuration = transitionDuration;
  if (Object.keys(transitionTimingFunction).length > 0) theme.transitionTimingFunction = transitionTimingFunction;

  return [
    '/**',
    ' * Auto-generated Tailwind theme tokens from Style Dictionary.',
    ' * DO NOT EDIT — regenerate with: pnpm build:tokens',
    ' */',
    '',
    `const tailwindTokens = ${JSON.stringify(theme, null, 2)} as const;`,
    '',
    'export default tailwindTokens;',
    '',
  ].join('\n');
}

/**
 * Build a nested object from a token path and value.
 * e.g., ['color', 'blue', '500'] -> { color: { blue: { 500: value } } }
 */
function buildNestedObject(
  target: Record<string, unknown>,
  pathSegments: string[],
  value: string,
): void {
  let current = target;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    if (!(segment in current) || typeof current[segment] !== 'object') {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }
  const lastSegment = pathSegments[pathSegments.length - 1];
  current[lastSegment] = value;
}

/**
 * Register custom formats and build all platforms.
 */
export async function buildTokens(clientSlug: string = 'default'): Promise<void> {
  const config = createConfig(clientSlug);

  const sd = new StyleDictionary(config);

  // Register the custom Tailwind format
  sd.registerFormat({
    name: 'tailwind/tokens',
    format: tailwindTokensFormat as unknown as Parameters<typeof sd.registerFormat>[0]['format'],
  });

  await sd.buildAllPlatforms();
}
