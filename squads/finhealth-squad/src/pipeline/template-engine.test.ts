/**
 * Tests for Template Engine
 * FinHealth Squad — Expression Resolution
 */

import { describe, it, expect } from 'vitest';
import {
  getByPath,
  resolveValue,
  resolveObject,
  resolveStepOutput,
  evaluateCondition,
} from './template-engine';
import type { PipelineContext } from './types';

// ============================================================================
// Fixtures
// ============================================================================

function makeContext(overrides?: Partial<PipelineContext>): PipelineContext {
  return {
    input: {
      accountId: 'acc-001',
      patientId: 'pat-123',
      amount: 1500.5,
      includeProjections: true,
    },
    steps: {
      generate: {
        stepId: 'generate',
        success: true,
        skipped: false,
        output: {
          guideXml: '<xml>guide</xml>',
          guideNumber: 'G-42',
        },
      },
      validate: {
        stepId: 'validate',
        success: true,
        skipped: false,
        output: {
          isValid: true,
          errors: [],
        },
      },
      'score-risk': {
        stepId: 'score-risk',
        success: true,
        skipped: false,
        output: {
          riskScore: 0.15,
          factors: ['clean-history'],
        },
      },
      'failed-step': {
        stepId: 'failed-step',
        success: false,
        skipped: false,
        output: {},
        error: 'Something broke',
      },
      'skipped-step': {
        stepId: 'skipped-step',
        success: false,
        skipped: true,
        output: {},
      },
    },
    ...overrides,
  };
}

// ============================================================================
// getByPath
// ============================================================================

describe('getByPath', () => {
  it('should resolve top-level key', () => {
    expect(getByPath({ a: 1 }, 'a')).toBe(1);
  });

  it('should resolve nested path', () => {
    expect(getByPath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42);
  });

  it('should return undefined for missing path', () => {
    expect(getByPath({ a: 1 }, 'b.c')).toBeUndefined();
  });

  it('should return undefined for null intermediate', () => {
    expect(getByPath({ a: null }, 'a.b')).toBeUndefined();
  });

  it('should resolve array length', () => {
    expect(getByPath({ items: [1, 2, 3] }, 'items.length')).toBe(3);
  });

  it('should handle empty path segments gracefully', () => {
    expect(getByPath({ a: 1 }, '')).toBeUndefined();
  });
});

// ============================================================================
// resolveValue
// ============================================================================

describe('resolveValue', () => {
  const ctx = makeContext();

  it('should pass through non-string values', () => {
    expect(resolveValue(42, ctx)).toBe(42);
    expect(resolveValue(true, ctx)).toBe(true);
    expect(resolveValue(null, ctx)).toBeNull();
  });

  it('should resolve a full template to typed value', () => {
    expect(resolveValue('{{input.accountId}}', ctx)).toBe('acc-001');
  });

  it('should resolve full template to number', () => {
    expect(resolveValue('{{input.amount}}', ctx)).toBe(1500.5);
  });

  it('should resolve full template to boolean', () => {
    expect(resolveValue('{{input.includeProjections}}', ctx)).toBe(true);
  });

  it('should resolve step output path', () => {
    expect(resolveValue('{{steps.generate.output.guideXml}}', ctx)).toBe('<xml>guide</xml>');
  });

  it('should interpolate mixed text', () => {
    expect(resolveValue('Account: {{input.accountId}} done', ctx)).toBe('Account: acc-001 done');
  });

  it('should replace missing values with empty string in mixed text', () => {
    expect(resolveValue('Value: {{input.nonexistent}} end', ctx)).toBe('Value:  end');
  });

  it('should return undefined for missing full template', () => {
    expect(resolveValue('{{input.nonexistent}}', ctx)).toBeUndefined();
  });

  it('should resolve array value', () => {
    const result = resolveValue('{{steps.score-risk.output.factors}}', ctx);
    expect(result).toEqual(['clean-history']);
  });

  it('should resolve object value', () => {
    const result = resolveValue('{{steps.generate.output}}', ctx);
    expect(result).toEqual({ guideXml: '<xml>guide</xml>', guideNumber: 'G-42' });
  });
});

// ============================================================================
// resolveObject
// ============================================================================

describe('resolveObject', () => {
  const ctx = makeContext();

  it('should resolve all template values in flat object', () => {
    const result = resolveObject(
      {
        accountId: '{{input.accountId}}',
        xml: '{{steps.generate.output.guideXml}}',
      },
      ctx,
    );
    expect(result).toEqual({
      accountId: 'acc-001',
      xml: '<xml>guide</xml>',
    });
  });

  it('should pass through non-template values', () => {
    const result = resolveObject(
      {
        literal: 'hello',
        num: 42,
        flag: true,
      },
      ctx,
    );
    expect(result).toEqual({ literal: 'hello', num: 42, flag: true });
  });

  it('should resolve nested objects', () => {
    const result = resolveObject(
      {
        outer: {
          inner: '{{input.accountId}}',
        },
      },
      ctx,
    );
    expect(result).toEqual({ outer: { inner: 'acc-001' } });
  });

  it('should resolve arrays', () => {
    const result = resolveObject(
      {
        items: ['{{input.accountId}}', 'literal', '{{input.amount}}'],
      },
      ctx,
    );
    expect(result).toEqual({ items: ['acc-001', 'literal', 1500.5] });
  });

  it('should handle null and undefined values', () => {
    const result = resolveObject({ n: null, u: undefined } as Record<string, unknown>, ctx);
    expect(result.n).toBeNull();
    expect(result.u).toBeUndefined();
  });
});

// ============================================================================
// resolveStepOutput
// ============================================================================

describe('resolveStepOutput', () => {
  it('should map result paths to output keys', () => {
    const taskOutput = { xml: '<guide/>', guideNumber: 'G-99' };
    const result = resolveStepOutput(
      {
        guideXml: '{{result.xml}}',
        guideNumber: '{{result.guideNumber}}',
      },
      taskOutput,
    );
    expect(result).toEqual({
      guideXml: '<guide/>',
      guideNumber: 'G-99',
    });
  });

  it('should return empty object when mapping is undefined', () => {
    expect(resolveStepOutput(undefined, { data: 1 })).toEqual({});
  });

  it('should resolve nested result paths', () => {
    const taskOutput = { nested: { deep: 'value' } };
    const result = resolveStepOutput({ val: '{{result.nested.deep}}' }, taskOutput);
    expect(result).toEqual({ val: 'value' });
  });

  it('should keep non-result-pattern strings as literal', () => {
    const result = resolveStepOutput({ key: 'literal-value' }, {});
    expect(result).toEqual({ key: 'literal-value' });
  });

  it('should return undefined for missing result paths', () => {
    const result = resolveStepOutput({ key: '{{result.missing}}' }, {});
    expect(result.key).toBeUndefined();
  });
});

// ============================================================================
// evaluateCondition
// ============================================================================

describe('evaluateCondition', () => {
  const ctx = makeContext();

  it('should return true for truthy value', () => {
    expect(evaluateCondition('{{steps.validate.output.isValid}}', ctx)).toBe(true);
  });

  it('should return false for falsy value', () => {
    const ctx2 = makeContext({
      steps: {
        ...makeContext().steps,
        validate: {
          stepId: 'validate',
          success: true,
          skipped: false,
          output: { isValid: false, errors: ['bad'] },
        },
      },
    });
    expect(evaluateCondition('{{steps.validate.output.isValid}}', ctx2)).toBe(false);
  });

  it('should evaluate "any" as true', () => {
    expect(evaluateCondition('any', ctx)).toBe(true);
  });

  it('should detect step failure', () => {
    expect(evaluateCondition('steps.failed-step.failed', ctx)).toBe(true);
  });

  it('should return false for step failure check on successful step', () => {
    expect(evaluateCondition('steps.validate.failed', ctx)).toBe(false);
  });

  it('should return false for step failure check on skipped step', () => {
    expect(evaluateCondition('steps.skipped-step.failed', ctx)).toBe(false);
  });

  it('should return false for step failure check on unknown step', () => {
    expect(evaluateCondition('steps.nonexistent.failed', ctx)).toBe(false);
  });

  it('should evaluate < comparison', () => {
    expect(evaluateCondition('{{steps.score-risk.output.riskScore < 0.3}}', ctx)).toBe(true);
    expect(evaluateCondition('{{steps.score-risk.output.riskScore < 0.1}}', ctx)).toBe(false);
  });

  it('should evaluate > comparison', () => {
    expect(evaluateCondition('{{steps.score-risk.output.riskScore > 0.1}}', ctx)).toBe(true);
  });

  it('should evaluate && (logical AND)', () => {
    expect(
      evaluateCondition(
        '{{steps.validate.output.isValid && steps.score-risk.output.riskScore < 0.3}}',
        ctx,
      ),
    ).toBe(true);
  });

  it('should return false when one side of && is false', () => {
    expect(
      evaluateCondition(
        '{{steps.validate.output.isValid && steps.score-risk.output.riskScore < 0.05}}',
        ctx,
      ),
    ).toBe(false);
  });

  it('should evaluate || (logical OR)', () => {
    expect(evaluateCondition('{{input.nonexistent || input.accountId}}', ctx)).toBe(true);
  });

  it('should evaluate .length > 0', () => {
    expect(evaluateCondition('{{steps.score-risk.output.factors.length > 0}}', ctx)).toBe(true);
  });

  it('should evaluate .length > 0 on empty array as false', () => {
    expect(evaluateCondition('{{steps.validate.output.errors.length > 0}}', ctx)).toBe(false);
  });

  it('should handle boolean input condition', () => {
    expect(evaluateCondition('{{input.includeProjections}}', ctx)).toBe(true);
  });

  it('should treat undefined as falsy', () => {
    expect(evaluateCondition('{{input.nonexistent}}', ctx)).toBe(false);
  });

  it('should treat null as falsy', () => {
    const ctx2 = makeContext({ input: { value: null } });
    expect(evaluateCondition('{{input.value}}', ctx2)).toBe(false);
  });

  it('should treat zero as falsy', () => {
    const ctx2 = makeContext({ input: { count: 0 } });
    expect(evaluateCondition('{{input.count}}', ctx2)).toBe(false);
  });
});
