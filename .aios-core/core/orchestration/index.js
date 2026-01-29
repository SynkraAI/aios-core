/**
 * AIOS Core Orchestration Module
 *
 * Multi-agent workflow orchestration with:
 * - Real subagent dispatch with persona transformation
 * - Task-based execution (no generic prompts)
 * - Deterministic code for file operations
 * - Checklist-based quality validation
 * - V3.1: Pre-flight stack detection and Skill dispatch
 *
 * @module core/orchestration
 * @version 1.1.0
 */

const WorkflowOrchestrator = require('./workflow-orchestrator');
const SubagentPromptBuilder = require('./subagent-prompt-builder');
const ContextManager = require('./context-manager');
const ChecklistRunner = require('./checklist-runner');
const ParallelExecutor = require('./parallel-executor');

// V3.1 Components
const TechStackDetector = require('./tech-stack-detector');
const ConditionEvaluator = require('./condition-evaluator');
const SkillDispatcher = require('./skill-dispatcher');

// Epic 0: Master Orchestrator (ADE)
const MasterOrchestrator = require('./master-orchestrator');
const { RecoveryHandler, RecoveryStrategy, RecoveryResult } = require('./recovery-handler');
const { GateEvaluator, GateVerdict, DEFAULT_GATE_CONFIG } = require('./gate-evaluator');

// Story 0.7: Agent Invoker
const { AgentInvoker, SUPPORTED_AGENTS, InvocationStatus } = require('./agent-invoker');

// Story 0.8: Dashboard Integration
const { DashboardIntegration, NotificationType } = require('./dashboard-integration');

// Story 0.9: CLI Commands
const cliCommands = require('./cli-commands');

module.exports = {
  // Main orchestrators
  WorkflowOrchestrator,
  MasterOrchestrator, // Epic 0: ADE Master Orchestrator

  // Supporting modules
  SubagentPromptBuilder,
  ContextManager,
  ChecklistRunner,
  ParallelExecutor,

  // V3.1: Pre-flight and Skill modules
  TechStackDetector,
  ConditionEvaluator,
  SkillDispatcher,

  // Epic 0: Orchestrator constants
  OrchestratorState: MasterOrchestrator.OrchestratorState,
  EpicStatus: MasterOrchestrator.EpicStatus,
  EPIC_CONFIG: MasterOrchestrator.EPIC_CONFIG,

  // Story 0.5: Recovery Handler
  RecoveryHandler,
  RecoveryStrategy,
  RecoveryResult,

  // Story 0.6: Gate Evaluator
  GateEvaluator,
  GateVerdict,
  DEFAULT_GATE_CONFIG,

  // Story 0.7: Agent Invoker
  AgentInvoker,
  SUPPORTED_AGENTS,
  InvocationStatus,

  // Story 0.8: Dashboard Integration
  DashboardIntegration,
  NotificationType,

  // Story 0.9: CLI Commands
  cliCommands,
  orchestrate: cliCommands.orchestrate,
  orchestrateStatus: cliCommands.orchestrateStatus,
  orchestrateStop: cliCommands.orchestrateStop,
  orchestrateResume: cliCommands.orchestrateResume,

  // Factory function for easy instantiation
  createOrchestrator(workflowPath, options = {}) {
    return new WorkflowOrchestrator(workflowPath, options);
  },

  // Factory function for MasterOrchestrator (Epic 0)
  createMasterOrchestrator(projectRoot, options = {}) {
    return new MasterOrchestrator(projectRoot, options);
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

  // V3.1: Utility to detect tech stack standalone
  async detectTechStack(projectRoot) {
    const detector = new TechStackDetector(projectRoot);
    return await detector.detect();
  },
};
