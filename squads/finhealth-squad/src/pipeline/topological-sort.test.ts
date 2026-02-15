/**
 * Tests for Topological Sort
 * FinHealth Squad — DAG Step Ordering
 */

import { describe, it, expect } from 'vitest';
import { topologicalSort, CyclicDependencyError } from './topological-sort';
import type { WorkflowStep } from './types';

function step(id: string, dependsOn?: string[]): WorkflowStep {
  return { id, task: `task-${id}`, agent: `agent-${id}`, input: {}, dependsOn };
}

// ============================================================================
// Tests
// ============================================================================

describe('topologicalSort', () => {
  it('should return single step unchanged', () => {
    const steps = [step('a')];
    const sorted = topologicalSort(steps);
    expect(sorted.map((s) => s.id)).toEqual(['a']);
  });

  it('should sort a linear chain: a → b → c', () => {
    const steps = [step('c', ['b']), step('b', ['a']), step('a')];
    const sorted = topologicalSort(steps);
    const ids = sorted.map((s) => s.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('c'));
  });

  it('should handle diamond dependency: a → b,c → d', () => {
    const steps = [
      step('a'),
      step('b', ['a']),
      step('c', ['a']),
      step('d', ['b', 'c']),
    ];
    const sorted = topologicalSort(steps);
    const ids = sorted.map((s) => s.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('b'));
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('c'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('d'));
    expect(ids.indexOf('c')).toBeLessThan(ids.indexOf('d'));
  });

  it('should return steps with no dependencies in original order', () => {
    const steps = [step('x'), step('y'), step('z')];
    const sorted = topologicalSort(steps);
    expect(sorted.map((s) => s.id)).toEqual(['x', 'y', 'z']);
  });

  it('should throw CyclicDependencyError for cycle: a → b → a', () => {
    const steps = [step('a', ['b']), step('b', ['a'])];
    expect(() => topologicalSort(steps)).toThrow(CyclicDependencyError);
  });

  it('should throw CyclicDependencyError for self-dependency', () => {
    const steps = [step('a', ['a'])];
    expect(() => topologicalSort(steps)).toThrow(CyclicDependencyError);
  });

  it('should throw Error for dependency on unknown step', () => {
    const steps = [step('a', ['nonexistent'])];
    expect(() => topologicalSort(steps)).toThrow('depends on unknown step');
  });

  it('should sort billing-pipeline steps correctly', () => {
    const steps = [
      step('generate'),
      step('validate', ['generate']),
      step('audit', ['validate']),
      step('score-risk', ['audit']),
    ];
    const sorted = topologicalSort(steps);
    expect(sorted.map((s) => s.id)).toEqual(['generate', 'validate', 'audit', 'score-risk']);
  });

  it('should handle partial dependencies (some with, some without)', () => {
    const steps = [
      step('independent'),
      step('dependent', ['independent']),
      step('also-independent'),
    ];
    const sorted = topologicalSort(steps);
    const ids = sorted.map((s) => s.id);
    expect(ids.indexOf('independent')).toBeLessThan(ids.indexOf('dependent'));
  });
});
