/**
 * AIOS Orchestrator — Package entry point
 *
 * Re-exports registry loader, session manager, comms bridge, governance hooks,
 * workflow engine, decision parsers, state persistence, and error types.
 *
 * @module @aios/orchestrator
 */

export { loadRegistry } from './registry.mjs';
export { createSessionManager, extractCost } from './session-manager.mjs';
export { createCommsBridge, CommsBridge } from './comms-bridge.mjs';
export {
  createGovernanceHooks,
  createBudgetTracker,
  setLogger,
} from './governance-hooks.mjs';
export {
  OrchestratorError,
  ConfigError,
  BudgetError,
  TransientError,
} from './errors.mjs';
export {
  createWorkflowEngine,
  WorkflowAbortError,
  BudgetExceededError,
} from './workflow-engine.mjs';
export {
  checkGoNoGo,
  checkQaVerdict,
  DECISIONS,
} from './decision-parsers.mjs';
export {
  createWorkflowState,
  createStatePersistence,
} from './state-persistence.mjs';
