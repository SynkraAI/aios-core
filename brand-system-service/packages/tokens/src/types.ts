/**
 * W3C DTCG Token Types
 *
 * TypeScript type definitions for the 3-tier token architecture.
 * Provides compile-time type safety for token paths and values.
 */

/**
 * Valid W3C DTCG token type values.
 * @see https://design-tokens.github.io/community-group/format/
 */
export type DTCGTokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'shadow'
  | 'strokeStyle'
  | 'border'
  | 'transition'
  | 'gradient'
  | 'typography';

/**
 * A single W3C DTCG token node.
 * Every leaf token MUST have $value, $type, and $description.
 */
export interface DTCGToken {
  readonly $value: string | number;
  readonly $type: DTCGTokenType;
  readonly $description: string;
  readonly $extensions?: Record<string, unknown>;
}

/**
 * A token group is either a DTCGToken leaf or a nested group of tokens.
 */
export type TokenGroup = DTCGToken | { readonly [key: string]: TokenGroup };

/**
 * Root structure of a token file — nested groups with token leaves.
 */
export interface TokenSchema {
  readonly [key: string]: TokenGroup;
}

/**
 * Result of a single token value lookup.
 */
export type TokenValue = string | number;

/**
 * Structured validation error from the token validator.
 */
export interface ValidationError {
  /** File path where the error was found */
  readonly file: string;
  /** Dot-notation path to the token within the file */
  readonly tokenPath: string;
  /** Error code for programmatic handling */
  readonly code:
    | 'MISSING_VALUE'
    | 'MISSING_TYPE'
    | 'MISSING_DESCRIPTION'
    | 'INVALID_TYPE'
    | 'UNRESOLVED_REFERENCE'
    | 'CIRCULAR_REFERENCE';
  /** Human-readable error message */
  readonly message: string;
}

/**
 * Result of token validation for a single file.
 */
export interface FileValidationResult {
  readonly file: string;
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly tokenCount: number;
}

/**
 * Aggregate validation result across all token files.
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly fileResults: ReadonlyArray<FileValidationResult>;
  readonly totalTokens: number;
}

/**
 * Client configuration for token namespace prefixing.
 */
export interface ClientConfig {
  readonly prefix: string;
  readonly client_id: string;
  readonly brand_name: string;
}

/**
 * Primitive token paths — union type of all valid dot-notation paths
 * in the primitive token tier.
 *
 * Note: This is a representative subset. A full generation from token files
 * would be handled by a build-time codegen step in BSS-2.2.
 */
export type PrimitiveColorPath =
  | 'color.blue.50'
  | 'color.blue.100'
  | 'color.blue.200'
  | 'color.blue.300'
  | 'color.blue.400'
  | 'color.blue.500'
  | 'color.blue.600'
  | 'color.blue.700'
  | 'color.blue.800'
  | 'color.blue.900'
  | 'color.blue.950'
  | 'color.neutral.50'
  | 'color.neutral.100'
  | 'color.neutral.200'
  | 'color.neutral.300'
  | 'color.neutral.400'
  | 'color.neutral.500'
  | 'color.neutral.600'
  | 'color.neutral.700'
  | 'color.neutral.800'
  | 'color.neutral.900'
  | 'color.neutral.950'
  | 'color.green.500'
  | 'color.amber.500'
  | 'color.red.500'
  | 'color.sky.500'
  | 'color.white'
  | 'color.black';

export type PrimitiveTypographyPath =
  | 'typography.fontFamily.sans'
  | 'typography.fontFamily.mono'
  | 'typography.fontSize.xs'
  | 'typography.fontSize.sm'
  | 'typography.fontSize.base'
  | 'typography.fontSize.lg'
  | 'typography.fontSize.xl'
  | 'typography.fontSize.2xl'
  | 'typography.fontSize.3xl'
  | 'typography.fontSize.4xl'
  | 'typography.fontSize.5xl'
  | 'typography.fontSize.6xl'
  | 'typography.fontSize.7xl'
  | 'typography.lineHeight.tight'
  | 'typography.lineHeight.normal'
  | 'typography.lineHeight.relaxed'
  | 'typography.letterSpacing.tight'
  | 'typography.letterSpacing.normal'
  | 'typography.letterSpacing.wide'
  | 'typography.fontWeight.regular'
  | 'typography.fontWeight.medium'
  | 'typography.fontWeight.semibold'
  | 'typography.fontWeight.bold';

export type PrimitiveSpacingPath =
  | 'spacing.0'
  | 'spacing.1'
  | 'spacing.2'
  | 'spacing.3'
  | 'spacing.4'
  | 'spacing.5'
  | 'spacing.6'
  | 'spacing.8'
  | 'spacing.10'
  | 'spacing.12'
  | 'spacing.16';

export type PrimitiveEffectsPath =
  | 'borderRadius.sm'
  | 'borderRadius.md'
  | 'borderRadius.lg'
  | 'borderRadius.xl'
  | 'borderRadius.full'
  | 'shadow.sm'
  | 'shadow.md'
  | 'shadow.lg'
  | 'motion.duration.fast'
  | 'motion.duration.normal'
  | 'motion.duration.slow'
  | 'motion.duration.slower'
  | 'motion.easing.default'
  | 'motion.easing.in'
  | 'motion.easing.out';

/**
 * Union of all valid primitive token paths.
 */
export type TokenPath =
  | PrimitiveColorPath
  | PrimitiveTypographyPath
  | PrimitiveSpacingPath
  | PrimitiveEffectsPath;

/**
 * Type-safe accessor for primitive token values.
 * Retrieves the raw $value for a given token path from loaded token data.
 *
 * @param tokens - Parsed token schema (loaded from JSON files)
 * @param path - Dot-notation path to the token
 * @returns The raw $value (string or number)
 */
export function getPrimitiveToken(tokens: TokenSchema, path: TokenPath): string | number {
  const segments = path.split('.');
  let current: unknown = tokens;

  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new Error(`Token path "${path}" not found: segment "${segment}" is not an object`);
    }
    current = (current as Record<string, unknown>)[segment];
  }

  if (current === null || current === undefined || typeof current !== 'object') {
    throw new Error(`Token path "${path}" does not resolve to a token node`);
  }

  const node = current as Record<string, unknown>;
  if (!('$value' in node)) {
    throw new Error(`Token path "${path}" does not have a $value field`);
  }

  return node['$value'] as string | number;
}
