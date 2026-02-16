/**
 * Event Dispatcher Tests
 * FinHealth Squad — Phase 10
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventDispatcher } from './event-dispatcher';

describe('EventDispatcher', () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    dispatcher = new EventDispatcher();
  });

  describe('bind()', () => {
    it('should register an event binding', () => {
      const handler = vi.fn();
      dispatcher.bind('payment-received', 'reconciliation-pipeline', handler);

      const bindings = dispatcher.getBindings();
      expect(bindings).toHaveLength(1);
      expect(bindings[0]).toEqual({
        eventName: 'payment-received',
        workflowName: 'reconciliation-pipeline',
        source: undefined,
      });
    });

    it('should register binding with source', () => {
      const handler = vi.fn();
      dispatcher.bind('payment-received', 'reconciliation-pipeline', handler, 'banking-integration');

      const bindings = dispatcher.getBindings();
      expect(bindings[0].source).toBe('banking-integration');
    });

    it('should support multiple bindings for same event', () => {
      dispatcher.bind('payment-received', 'workflow-a', vi.fn());
      dispatcher.bind('payment-received', 'workflow-b', vi.fn());

      const bindings = dispatcher.getBindings();
      expect(bindings).toHaveLength(2);
    });
  });

  describe('emit()', () => {
    it('should trigger handler when event is emitted', async () => {
      const handler = vi.fn();
      dispatcher.bind('payment-received', 'reconciliation-pipeline', handler);

      const payload = { paymentId: 'pay-001', amount: 1500 };
      await dispatcher.emit('payment-received', payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should trigger multiple handlers for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      dispatcher.bind('payment-received', 'workflow-a', handler1);
      dispatcher.bind('payment-received', 'workflow-b', handler2);

      await dispatcher.emit('payment-received', { id: '1' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should not throw for events with no handlers', async () => {
      // Should not throw
      await dispatcher.emit('unknown-event', {});
    });

    it('should handle handler errors gracefully', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));
      dispatcher.bind('test-event', 'workflow', handler);

      // Should not throw
      await dispatcher.emit('test-event', {});
    });

    it('should emit with empty payload by default', async () => {
      const handler = vi.fn();
      dispatcher.bind('test', 'workflow', handler);

      await dispatcher.emit('test');

      expect(handler).toHaveBeenCalledWith({});
    });
  });

  describe('getRegisteredEvents()', () => {
    it('should return unique event names', () => {
      dispatcher.bind('event-a', 'workflow-1', vi.fn());
      dispatcher.bind('event-a', 'workflow-2', vi.fn());
      dispatcher.bind('event-b', 'workflow-3', vi.fn());

      const events = dispatcher.getRegisteredEvents();
      expect(events).toEqual(['event-a', 'event-b']);
    });
  });

  describe('removeAll()', () => {
    it('should remove all bindings and listeners', async () => {
      const handler = vi.fn();
      dispatcher.bind('test', 'workflow', handler);
      dispatcher.removeAll();

      await dispatcher.emit('test', {});
      expect(handler).not.toHaveBeenCalled();
      expect(dispatcher.getBindings()).toHaveLength(0);
    });
  });
});
