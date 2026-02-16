/**
 * Event Dispatcher
 * FinHealth Squad — Pub/Sub event system for workflow triggers
 *
 * Publishes events (e.g. 'payment-received') that trigger workflows
 * configured with trigger.type = 'on-event'.
 */

import { EventEmitter } from 'events';
import type { EventBinding } from './types';
import { logger } from '../logger';

export type EventHandler = (payload: Record<string, unknown>) => void | Promise<void>;

export class EventDispatcher {
  private emitter: EventEmitter;
  private bindings: EventBinding[] = [];

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  /**
   * Register a workflow to be triggered when an event fires.
   */
  bind(eventName: string, workflowName: string, handler: EventHandler, source?: string): void {
    this.bindings.push({ eventName, workflowName, source });

    this.emitter.on(eventName, async (payload: Record<string, unknown>) => {
      try {
        await handler(payload);
      } catch (err: unknown) {
        logger.error(
          `[EventDispatcher] Handler failed for event "${eventName}" → workflow "${workflowName}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    });

    logger.info(`[EventDispatcher] Bound event "${eventName}" → workflow "${workflowName}"`);
  }

  /**
   * Emit an event, triggering all bound workflows.
   */
  async emit(eventName: string, payload: Record<string, unknown> = {}): Promise<void> {
    const listenerCount = this.emitter.listenerCount(eventName);
    if (listenerCount === 0) {
      logger.warn(`[EventDispatcher] No handlers for event "${eventName}"`);
      return;
    }

    logger.info(`[EventDispatcher] Emitting "${eventName}" to ${listenerCount} handler(s)`);
    this.emitter.emit(eventName, payload);
  }

  /**
   * Get all registered event bindings.
   */
  getBindings(): EventBinding[] {
    return [...this.bindings];
  }

  /**
   * Remove all bindings and listeners.
   */
  removeAll(): void {
    this.emitter.removeAllListeners();
    this.bindings = [];
  }

  /**
   * Get the list of unique event names with bindings.
   */
  getRegisteredEvents(): string[] {
    return [...new Set(this.bindings.map((b) => b.eventName))];
  }
}
