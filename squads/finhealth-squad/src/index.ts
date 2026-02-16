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
export { AuditorAgent } from './agents/auditor-agent';
export { CashflowAgent } from './agents/cashflow-agent';
export { ReconciliationAgent } from './agents/reconciliation-agent';
export { SupervisorAgent } from './agents/supervisor-agent';

// Parsers
export * from './parsers/tiss-xml-parser';
export * from './parsers/payment-xml-parser';

// Validators
export * from './validators/tiss-validator';

// Scrapers
export { AnsScraper } from './scrapers/ans-scraper';
export { CbhpmScraper } from './scrapers/cbhpm-scraper';
export { DatasusScraper } from './scrapers/datasus-scraper';
export { ScraperManager, createScraperManager } from './scrapers/scraper-manager';
export type {
  ScrapeResult,
  ScrapeSource,
  ScraperConfig,
  ScraperManagerConfig,
  ScraperManagerResult,
  HttpClient,
  LlmClient,
  FileSystem as ScraperFileSystem,
  TussProcedure,
  CbhpmProcedure,
  PorteInfo,
  CbhpmData,
  SigtapProcedure,
} from './scrapers/types';

// Templates
export { TemplateManager, createTemplateManager } from './templates/template-manager';
export {
  renderAppeal,
  createDefaultDateProvider,
  createDefaultIdGenerator,
  getAppealTypeLabel,
} from './templates/appeal-renderer';
export {
  renderReport,
  renderKpiDashboard,
  renderSection,
  getReportLevelLabel,
} from './templates/report-renderer';
export {
  formatCurrency,
  formatDate,
  formatDateIso,
  formatPercent,
  renderMarkdownTable,
  heading,
  kvList,
  kvLine,
  joinSections,
  bulletList,
  numberedList,
  blockquote,
  horizontalRule,
  escapeMarkdown,
} from './templates/template-helpers';
export type {
  OutputFormat,
  RenderResult,
  RenderMetadata,
  TemplateType,
  TemplateManagerDeps,
  DateProvider,
  IdGenerator,
  AppealType,
  AppealRenderInput,
  AppealGlosaData,
  AppealGlosaItem,
  AppealGuiaData,
  AppealOperadoraData,
  AppealEvidencia,
  AppealNorma,
  AppealArgumento,
  AppealAnexo,
  ReportLevel,
  ReportRenderInput,
  ReportKeyMetrics,
  ReportSection as ReportSectionType,
  ReportTable,
  ReportChartReference,
  ReportComparativo,
} from './templates/types';

// Registry
export { AgentRegistry } from './registry/agent-registry';
export type { AgentRegistryConfig } from './registry/agent-registry';

// Pipeline
export { PipelineExecutor } from './pipeline/pipeline-executor';
export type {
  WorkflowDefinition,
  WorkflowStep,
  StepResult,
  PipelineResult,
  PipelineContext,
  PipelineMetadata,
} from './pipeline/types';

// Circuit Breaker & Error Classification
export { CircuitBreaker } from './pipeline/circuit-breaker';
export type { CircuitState, CircuitBreakerConfig } from './pipeline/circuit-breaker';
export { classifyError, isRetryable } from './pipeline/error-classifier';
export type { ErrorCategory } from './pipeline/error-classifier';

// Crypto
export { CertificateManager } from './crypto/certificate-manager';
export { XmlSigner } from './crypto/xml-signer';
export type {
  CertificateInfo,
  CertificateValidation,
  SigningResult,
  VerificationResult,
} from './crypto/types';

// Scheduler
export { WorkflowScheduler } from './scheduler/workflow-scheduler';
export { EventDispatcher } from './scheduler/event-dispatcher';
export { ExecutionLogger } from './scheduler/execution-logger';
export { runSchedulerCli } from './scheduler/scheduler-cli';
export type {
  ScheduledJob,
  EventBinding,
  WorkflowExecution,
  SchedulerStatus,
  SchedulerConfig,
  TriggerType,
  ExecutionStatus,
} from './scheduler/types';

// Billing Batch
export {
  groupAccountsByBatch,
  generateBatchId,
  generateLoteNumber,
  buildBatchXml,
  computeTotalAmount,
  createBatchFromGroup,
} from './billing/tiss-batch-generator';
export { BatchProcessor } from './billing/batch-processor';
export { runBatchCli } from './billing/batch-cli';
export type {
  TissBatch,
  BatchStatus,
  BatchConfig,
  BatchGroupKey,
  BatchGenerateInput,
  BatchGenerateResult,
} from './billing/types';

// Onboarding
export { TenantProvisioner, generateSlug } from './onboarding/tenant-provisioner';
export { runOnboardingCli } from './onboarding/onboarding-cli';
export type {
  TenantCreateInput,
  ProvisioningResult,
  ProvisioningStep,
  OrgType,
  OrgPlan,
  MemberRole,
} from './onboarding/types';

// Logger
export { logger, createAgentLogger } from './logger';

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
