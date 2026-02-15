/**
 * Topological Sort
 * FinHealth Squad — DAG Step Ordering
 *
 * Kahn's algorithm for ordering workflow steps by their dependsOn edges.
 * Detects cyclic dependencies.
 */

import type { WorkflowStep } from './types';

export class CyclicDependencyError extends Error {
  constructor(remainingSteps: string[]) {
    super(`Cyclic dependency detected among steps: ${remainingSteps.join(', ')}`);
    this.name = 'CyclicDependencyError';
  }
}

/**
 * Sort steps topologically based on `dependsOn` edges.
 * Steps with no dependencies come first.
 * Throws CyclicDependencyError if cycles exist.
 */
export function topologicalSort(steps: WorkflowStep[]): WorkflowStep[] {
  const stepMap = new Map<string, WorkflowStep>();
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Build graph
  for (const step of steps) {
    stepMap.set(step.id, step);
    inDegree.set(step.id, 0);
    adjacency.set(step.id, []);
  }

  for (const step of steps) {
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        if (!stepMap.has(dep)) {
          throw new Error(`Step "${step.id}" depends on unknown step "${dep}"`);
        }
        adjacency.get(dep)!.push(step.id);
        inDegree.set(step.id, (inDegree.get(step.id) || 0) + 1);
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: WorkflowStep[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(stepMap.get(current)!);

    for (const neighbor of adjacency.get(current)!) {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length < steps.length) {
    const remaining = steps
      .filter((s) => !sorted.some((o) => o.id === s.id))
      .map((s) => s.id);
    throw new CyclicDependencyError(remaining);
  }

  return sorted;
}
