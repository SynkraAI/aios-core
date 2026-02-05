/**
 * FinHealth Squad - Main Entry Point
 * Healthcare Financial AI Module
 */

// Database
export * from './database/supabase-client';

// Runtime
export * from './runtime/agent-runtime';

// Agents
export * from './agents/billing-agent';

// Re-export types
export type {
  Patient,
  HealthInsurer,
  MedicalAccount,
  Procedure,
  Glosa,
  Payment,
} from './database/supabase-client';

export type {
  AgentDefinition,
  AgentCommand,
  TaskInput,
  TaskResult,
  RuntimeConfig,
} from './runtime/agent-runtime';
