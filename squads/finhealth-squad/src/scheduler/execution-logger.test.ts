/**
 * Execution Logger Tests
 * FinHealth Squad — Phase 10
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionLogger } from './execution-logger';

describe('ExecutionLogger', () => {
  let logger: ExecutionLogger;

  beforeEach(() => {
    logger = new ExecutionLogger();
  });

  describe('start()', () => {
    it('should create a new execution entry and return an ID', () => {
      const id = logger.start('audit-pipeline', 'scheduled');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^exec-/);
    });

    it('should store execution with running status', () => {
      const id = logger.start('audit-pipeline', 'scheduled');
      const exec = logger.get(id);

      expect(exec).toBeDefined();
      expect(exec!.workflowName).toBe('audit-pipeline');
      expect(exec!.triggerType).toBe('scheduled');
      expect(exec!.status).toBe('running');
      expect(exec!.startedAt).toBeInstanceOf(Date);
      expect(exec!.finishedAt).toBeUndefined();
    });

    it('should store parameters if provided', () => {
      const params = { batchSize: 50 };
      const id = logger.start('audit-pipeline', 'manual', params);
      const exec = logger.get(id);

      expect(exec!.parameters).toEqual(params);
    });
  });

  describe('finish()', () => {
    it('should mark execution as success', () => {
      const id = logger.start('audit-pipeline', 'scheduled');
      const summary = { totalAudited: 42 };
      logger.finish(id, 'success', summary);

      const exec = logger.get(id);
      expect(exec!.status).toBe('success');
      expect(exec!.finishedAt).toBeInstanceOf(Date);
      expect(exec!.outputSummary).toEqual(summary);
    });

    it('should mark execution as failed with error', () => {
      const id = logger.start('audit-pipeline', 'scheduled');
      logger.finish(id, 'failed', undefined, 'Connection timeout');

      const exec = logger.get(id);
      expect(exec!.status).toBe('failed');
      expect(exec!.error).toBe('Connection timeout');
    });

    it('should handle non-existent execution gracefully', () => {
      // Should not throw
      logger.finish('non-existent-id', 'success');
    });
  });

  describe('getRecent()', () => {
    it('should return recent executions in reverse order', () => {
      logger.start('workflow-a', 'scheduled');
      logger.start('workflow-b', 'manual');
      logger.start('workflow-c', 'on-event');

      const recent = logger.getRecent(10);
      expect(recent).toHaveLength(3);
      expect(recent[0].workflowName).toBe('workflow-c');
      expect(recent[2].workflowName).toBe('workflow-a');
    });

    it('should respect limit', () => {
      for (let i = 0; i < 10; i++) {
        logger.start(`workflow-${i}`, 'scheduled');
      }

      const recent = logger.getRecent(3);
      expect(recent).toHaveLength(3);
    });

    it('should filter by workflow name', () => {
      logger.start('audit-pipeline', 'scheduled');
      logger.start('billing-pipeline', 'manual');
      logger.start('audit-pipeline', 'manual');

      const recent = logger.getRecent(10, 'audit-pipeline');
      expect(recent).toHaveLength(2);
      expect(recent.every((e) => e.workflowName === 'audit-pipeline')).toBe(true);
    });
  });

  describe('getLastFor()', () => {
    it('should return the most recent execution for a workflow', () => {
      const id1 = logger.start('audit-pipeline', 'scheduled');
      logger.finish(id1, 'success');

      const id2 = logger.start('audit-pipeline', 'manual');

      const last = logger.getLastFor('audit-pipeline');
      expect(last).toBeDefined();
      expect(last!.id).toBe(id2);
    });

    it('should return undefined for unknown workflow', () => {
      const last = logger.getLastFor('unknown');
      expect(last).toBeUndefined();
    });
  });

  describe('getStats()', () => {
    it('should count executions by status', () => {
      const id1 = logger.start('a', 'scheduled');
      logger.finish(id1, 'success');

      const id2 = logger.start('b', 'scheduled');
      logger.finish(id2, 'failed');

      logger.start('c', 'scheduled'); // still running

      const stats = logger.getStats();
      expect(stats.success).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.running).toBe(1);
      expect(stats.cancelled).toBe(0);
    });
  });

  describe('clear()', () => {
    it('should remove all executions', () => {
      logger.start('a', 'scheduled');
      logger.start('b', 'manual');
      logger.clear();

      expect(logger.getRecent()).toHaveLength(0);
    });
  });
});
