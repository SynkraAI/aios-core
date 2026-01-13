/**
 * AIOS Core Orchestration Module
 *
 * Multi-agent workflow orchestration with:
 * - Real subagent dispatch with persona transformation
 * - Task-based execution (no generic prompts)
 * - Deterministic code for file operations
 * - Checklist-based quality validation
 *
 * @module core/orchestration
 * @version 1.0.0
 */

const WorkflowOrchestrator = require('./workflow-orchestrator');
const SubagentPromptBuilder = require('./subagent-prompt-builder');
const ContextManager = require('./context-manager');
const ChecklistRunner = require('./checklist-runner');
const ParallelExecutor = require('./parallel-executor');

module.exports = {
  // Main orchestrator
  WorkflowOrchestrator,

  // Supporting modules
  SubagentPromptBuilder,
  ContextManager,
  ChecklistRunner,
  ParallelExecutor,

  // Factory function for easy instantiation
  createOrchestrator(workflowPath, options = {}) {
    return new WorkflowOrchestrator(workflowPath, options);
  },

  // Utility to create context manager standalone
  createContextManager(workflowId, projectRoot) {
    return new ContextManager(workflowId, projectRoot);
  },

  // Utility to run checklists standalone
  async runChecklist(checklistName, targetPaths, projectRoot) {
    const runner = new ChecklistRunner(projectRoot);
    return await runner.run(checklistName, targetPaths);
  },
};
