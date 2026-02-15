/**
 * Template Engine
 * FinHealth Squad — Pipeline Expression Resolution
 *
 * Resolves {{expression}} patterns against PipelineContext.
 * No eval() — uses safe dot-path resolution and comparison operators.
 */

import type { PipelineContext } from './types';

// ============================================================================
// Path resolution
// ============================================================================

/**
 * Walk a dot-separated path on an object: `a.b.c` → obj.a.b.c
 */
export function getByPath(obj: unknown, dotPath: string): unknown {
  const segments = dotPath.split('.');
  let current: unknown = obj;

  for (const seg of segments) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[seg];
  }

  return current;
}

// ============================================================================
// Template resolution
// ============================================================================

const TEMPLATE_RE = /\{\{(.+?)\}\}/g;
const FULL_TEMPLATE_RE = /^\{\{(.+?)\}\}$/;

/**
 * Resolve a single value against context.
 * - If the entire string is one `{{expr}}`, return the typed value (not stringified).
 * - If mixed text with `{{expr}}` fragments, return interpolated string.
 * - Non-strings pass through unchanged.
 */
export function resolveValue(template: unknown, ctx: PipelineContext): unknown {
  if (typeof template !== 'string') return template;

  // Entire string is a single expression → return typed value
  const fullMatch = template.match(FULL_TEMPLATE_RE);
  if (fullMatch) {
    return resolveExpression(fullMatch[1].trim(), ctx);
  }

  // Mixed text with embedded expressions → interpolate as string
  return template.replace(TEMPLATE_RE, (_match, expr) => {
    const val = resolveExpression(expr.trim(), ctx);
    return val === undefined || val === null ? '' : String(val);
  });
}

/**
 * Resolve a single expression (the contents inside `{{ }}`).
 * Handles dot-path lookups against the context.
 */
function resolveExpression(expr: string, ctx: PipelineContext): unknown {
  return getByPath(ctx, expr);
}

/**
 * Recursively resolve all template strings in an object/array.
 */
export function resolveObject(
  obj: Record<string, unknown>,
  ctx: PipelineContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = resolveValue(value, ctx);
    } else if (Array.isArray(value)) {
      result[key] = resolveArray(value, ctx);
    } else if (value !== null && typeof value === 'object') {
      result[key] = resolveObject(value as Record<string, unknown>, ctx);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function resolveArray(arr: unknown[], ctx: PipelineContext): unknown[] {
  return arr.map((item) => {
    if (typeof item === 'string') return resolveValue(item, ctx);
    if (Array.isArray(item)) return resolveArray(item, ctx);
    if (item !== null && typeof item === 'object') {
      return resolveObject(item as Record<string, unknown>, ctx);
    }
    return item;
  });
}

// ============================================================================
// Step output mapping
// ============================================================================

/**
 * Map task output through a step's output definition.
 * Output mapping uses `{{result.xxx}}` patterns that resolve against the raw task output.
 */
export function resolveStepOutput(
  mapping: Record<string, string> | undefined,
  taskOutput: unknown,
): Record<string, unknown> {
  if (!mapping) return {};

  const result: Record<string, unknown> = {};
  const RESULT_RE = /^\{\{result\.(.+?)\}\}$/;

  for (const [key, template] of Object.entries(mapping)) {
    const match = template.match(RESULT_RE);
    if (match) {
      result[key] = getByPath(taskOutput, match[1]);
    } else {
      // Fallback: try treating as a raw value or full template
      result[key] = template;
    }
  }

  return result;
}

// ============================================================================
// Condition evaluation
// ============================================================================

/**
 * Evaluate a condition string.
 * Resolves template expressions and checks truthiness.
 *
 * Supports:
 * - Simple truthy: `{{steps.validate.output.isValid}}`
 * - Comparisons: `{{steps.x.output.score < 0.3}}`
 * - Logical AND: `{{a && b}}`
 * - Logical OR: `{{a || b}}`
 * - Length checks: `{{steps.x.output.items.length > 0}}`
 * - Step failure: `steps.xxx.failed`
 */
export function evaluateCondition(condition: string, ctx: PipelineContext): boolean {
  // Strip outer {{ }} if present
  let expr = condition.trim();
  const fullMatch = expr.match(FULL_TEMPLATE_RE);
  if (fullMatch) {
    expr = fullMatch[1].trim();
  }

  // Special: "any" always true
  if (expr === 'any') return true;

  // Special: step failure check — `steps.xxx.failed`
  const failedMatch = expr.match(/^steps\.([a-zA-Z0-9_-]+)\.failed$/);
  if (failedMatch) {
    const stepResult = ctx.steps[failedMatch[1]];
    return stepResult ? !stepResult.success && !stepResult.skipped : false;
  }

  // Logical OR — split first (lower precedence)
  if (expr.includes('||')) {
    return expr.split('||').some((part) => evaluateCondition(part.trim(), ctx));
  }

  // Logical AND
  if (expr.includes('&&')) {
    return expr.split('&&').every((part) => evaluateCondition(part.trim(), ctx));
  }

  // Comparison operators: <, >, <=, >=, ===, !==
  const compMatch = expr.match(/^(.+?)\s*(<=|>=|<|>|===|!==)\s*(.+)$/);
  if (compMatch) {
    const left = resolveOrParseLiteral(compMatch[1].trim(), ctx);
    const op = compMatch[2];
    const right = resolveOrParseLiteral(compMatch[3].trim(), ctx);
    return compareValues(left, op, right);
  }

  // Simple truthiness — resolve the path and check
  const value = getByPath(ctx, expr);
  return isTruthy(value);
}

function resolveOrParseLiteral(token: string, ctx: PipelineContext): unknown {
  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(token)) return Number(token);
  // String literal
  if (/^["'].*["']$/.test(token)) return token.slice(1, -1);
  // Boolean literal
  if (token === 'true') return true;
  if (token === 'false') return false;
  // Path resolution
  return getByPath(ctx, token);
}

function compareValues(left: unknown, op: string, right: unknown): boolean {
  const l = typeof left === 'number' ? left : Number(left);
  const r = typeof right === 'number' ? right : Number(right);

  if (op === '<') return l < r;
  if (op === '>') return l > r;
  if (op === '<=') return l <= r;
  if (op === '>=') return l >= r;

  // Strict equality uses original values
  if (op === '===') return left === right;
  if (op === '!==') return left !== right;

  return false;
}

function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
