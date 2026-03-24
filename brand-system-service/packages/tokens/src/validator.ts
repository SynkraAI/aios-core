import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  DTCGTokenType,
  TokenSchema,
  ValidationError,
  FileValidationResult,
  ValidationResult,
  ClientConfig,
} from './types';

/**
 * Reference pattern for DTCG token references: {path.to.token}
 */
const REFERENCE_PATTERN = /^\{(.+)\}$/;

/**
 * Valid W3C DTCG $type values.
 */
const VALID_TOKEN_TYPES: ReadonlySet<string> = new Set<DTCGTokenType>([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'shadow',
  'strokeStyle',
  'border',
  'transition',
  'gradient',
  'typography',
]);

/**
 * Checks if a node is a DTCG token leaf (has $value).
 */
function isTokenLeaf(node: unknown): boolean {
  return node !== null && typeof node === 'object' && '$value' in (node as Record<string, unknown>);
}

/**
 * TokenValidator validates W3C DTCG token files.
 *
 * Checks performed:
 * - Required fields: $value, $type, $description
 * - Valid $type values per W3C DTCG spec
 * - Reference resolution across all loaded token files
 * - Circular reference detection via depth-first traversal
 */
export class TokenValidator {
  private readonly tokensDir: string;
  private readonly allTokens: Map<string, TokenSchema> = new Map();
  private readonly flatTokenIndex: Map<string, unknown> = new Map();
  private clientConfig: ClientConfig | null = null;

  constructor(tokensDir: string) {
    this.tokensDir = tokensDir;
  }

  /**
   * Validate all token files in the tokens directory.
   */
  validate(): ValidationResult {
    this.loadClientConfig();
    this.loadAllTokenFiles();
    this.buildFlatIndex();

    const fileResults: FileValidationResult[] = [];

    for (const [filePath, schema] of this.allTokens) {
      const errors: ValidationError[] = [];
      let tokenCount = 0;

      this.walkTokens(schema, '', filePath, errors, () => {
        tokenCount++;
      });

      fileResults.push({
        file: filePath,
        valid: errors.length === 0,
        errors,
        tokenCount,
      });
    }

    // Check for circular references across all files
    const circularErrors = this.detectCircularReferences();

    const allErrors = [...fileResults.flatMap((r) => r.errors), ...circularErrors];

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      fileResults,
      totalTokens: fileResults.reduce((sum, r) => sum + r.tokenCount, 0),
    };
  }

  /**
   * Load client configuration if available.
   */
  private loadClientConfig(): void {
    const configPath = path.join(this.tokensDir, 'client.config.json');
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        this.clientConfig = JSON.parse(raw) as ClientConfig;
      } catch {
        // Client config is optional — proceed without it
        this.clientConfig = null;
      }
    }
  }

  /**
   * Recursively discover and load all .json token files from the tokens directory.
   */
  private loadAllTokenFiles(): void {
    this.allTokens.clear();
    const tiers = ['primitive', 'semantic', 'component'];

    for (const tier of tiers) {
      const tierDir = path.join(this.tokensDir, tier);
      if (!fs.existsSync(tierDir)) {
        continue;
      }

      const files = fs.readdirSync(tierDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(tierDir, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const schema = JSON.parse(raw) as TokenSchema;
          this.allTokens.set(filePath, schema);
        } catch (error) {
          // Skip malformed JSON — will be caught elsewhere
          throw new Error(
            `Failed to parse token file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
    }
  }

  /**
   * Build a flat index of all token paths across all files.
   * This enables reference resolution across tier boundaries.
   */
  private buildFlatIndex(): void {
    this.flatTokenIndex.clear();

    for (const [, schema] of this.allTokens) {
      this.indexTokens(schema, '');
    }
  }

  /**
   * Recursively index all tokens into the flat lookup map.
   */
  private indexTokens(node: unknown, prefix: string): void {
    if (node === null || typeof node !== 'object') {
      return;
    }

    const obj = node as Record<string, unknown>;

    if (isTokenLeaf(obj)) {
      this.flatTokenIndex.set(prefix, obj);
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) {
        continue;
      }
      const newPath = prefix ? `${prefix}.${key}` : key;
      this.indexTokens(value, newPath);
    }
  }

  /**
   * Walk the token tree and validate each leaf token.
   */
  private walkTokens(
    node: unknown,
    currentPath: string,
    filePath: string,
    errors: ValidationError[],
    onToken: () => void,
  ): void {
    if (node === null || typeof node !== 'object') {
      return;
    }

    const obj = node as Record<string, unknown>;

    if (isTokenLeaf(obj)) {
      onToken();
      this.validateToken(obj, currentPath, filePath, errors);
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('$')) {
        continue;
      }
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      this.walkTokens(value, newPath, filePath, errors, onToken);
    }
  }

  /**
   * Validate a single token leaf node.
   */
  private validateToken(
    token: Record<string, unknown>,
    tokenPath: string,
    filePath: string,
    errors: ValidationError[],
  ): void {
    // Check $type
    if (!('$type' in token)) {
      errors.push({
        file: filePath,
        tokenPath,
        code: 'MISSING_TYPE',
        message: `Token "${tokenPath}" is missing required "$type" field`,
      });
    } else if (!VALID_TOKEN_TYPES.has(token['$type'] as string)) {
      errors.push({
        file: filePath,
        tokenPath,
        code: 'INVALID_TYPE',
        message: `Token "${tokenPath}" has invalid $type "${String(token['$type'])}" — valid types: ${[...VALID_TOKEN_TYPES].join(', ')}`,
      });
    }

    // Check $description
    if (
      !('$description' in token) ||
      typeof token['$description'] !== 'string' ||
      token['$description'] === ''
    ) {
      errors.push({
        file: filePath,
        tokenPath,
        code: 'MISSING_DESCRIPTION',
        message: `Token "${tokenPath}" is missing required "$description" field`,
      });
    }

    // Check reference resolution
    const value = token['$value'];
    if (typeof value === 'string') {
      const refMatch = REFERENCE_PATTERN.exec(value);
      if (refMatch) {
        const refPath = refMatch[1];
        if (!this.flatTokenIndex.has(refPath)) {
          errors.push({
            file: filePath,
            tokenPath,
            code: 'UNRESOLVED_REFERENCE',
            message: `Token "${tokenPath}" references "{${refPath}}" which does not exist`,
          });
        }
      }
    }
  }

  /**
   * Detect circular references using depth-first traversal.
   * Follows reference chains and detects cycles.
   */
  private detectCircularReferences(): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [tokenPath, tokenNode] of this.flatTokenIndex) {
      const visited = new Set<string>();
      const cycle = this.followReferences(tokenPath, tokenNode, visited);
      if (cycle) {
        errors.push({
          file: '',
          tokenPath,
          code: 'CIRCULAR_REFERENCE',
          message: `Circular reference detected: ${cycle.join(' -> ')}`,
        });
      }
    }

    return errors;
  }

  /**
   * Follow a reference chain and return the cycle path if a cycle is detected.
   */
  private followReferences(
    tokenPath: string,
    node: unknown,
    visited: Set<string>,
  ): string[] | null {
    if (visited.has(tokenPath)) {
      return [...visited, tokenPath];
    }

    if (node === null || typeof node !== 'object') {
      return null;
    }

    const obj = node as Record<string, unknown>;
    const value = obj['$value'];

    if (typeof value !== 'string') {
      return null;
    }

    const refMatch = REFERENCE_PATTERN.exec(value);
    if (!refMatch) {
      return null;
    }

    const refPath = refMatch[1];
    const refNode = this.flatTokenIndex.get(refPath);
    if (!refNode) {
      return null;
    }

    visited.add(tokenPath);
    return this.followReferences(refPath, refNode, visited);
  }

  /**
   * Get the client config prefix. Defaults to 'bss'.
   */
  getPrefix(): string {
    return this.clientConfig?.prefix ?? 'bss';
  }
}
