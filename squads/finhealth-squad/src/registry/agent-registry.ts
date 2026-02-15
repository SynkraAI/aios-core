/**
 * Agent Registry
 * FinHealth Squad
 *
 * Central router that maps agentId + taskName to native TypeScript
 * agent implementations. Falls back to LLM-based runtime execution
 * for unregistered agents/tasks.
 */

import type { AgentRuntime, TaskInput, TaskResult } from '../runtime/agent-runtime';
import { BillingAgent } from '../agents/billing-agent';
import { AuditorAgent } from '../agents/auditor-agent';
import { CashflowAgent } from '../agents/cashflow-agent';
import { ReconciliationAgent } from '../agents/reconciliation-agent';
import { SupervisorAgent } from '../agents/supervisor-agent';
import { logger } from '../logger';

type TaskMethod = (input: unknown) => Promise<TaskResult>;

interface RegisteredAgent {
  instance: Record<string, TaskMethod>;
  tasks: Map<string, string>; // taskName → methodName
}

export interface AgentRegistryConfig {
  runtime: AgentRuntime;
  organizationId?: string;
}

export class AgentRegistry {
  private agents = new Map<string, RegisteredAgent>();
  private runtime: AgentRuntime;

  constructor(config: AgentRegistryConfig) {
    this.runtime = config.runtime;
    this.registerAll(config.organizationId);
  }

  private registerAll(organizationId?: string): void {
    // All agents require organizationId for DB access
    if (organizationId) {
      this.register(
        'billing-agent',
        new BillingAgent(this.runtime, organizationId),
        {
          'validate-tiss': 'validateTiss',
          'generate-tiss-guide': 'generateTissGuide',
        },
      );

      this.register(
        'auditor-agent',
        new AuditorAgent(this.runtime, organizationId),
        {
          'audit-batch': 'auditBatch',
          'audit-account': 'auditAccount',
          'score-glosa-risk': 'scoreGlosaRisk',
          'detect-inconsistencies': 'detectInconsistencies',
        },
      );

      this.register(
        'cashflow-agent',
        new CashflowAgent(this.runtime, organizationId),
        {
          'forecast-cashflow': 'forecastCashflow',
          'detect-anomalies': 'detectAnomalies',
          'generate-financial-report': 'generateFinancialReport',
        },
      );

      this.register(
        'reconciliation-agent',
        new ReconciliationAgent(this.runtime, organizationId),
        {
          'reconcile-payment': 'reconcilePayment',
          'match-invoices': 'matchInvoices',
          'generate-appeal': 'generateAppeal',
          'prioritize-appeals': 'prioritizeAppeals',
        },
      );

      this.register(
        'supervisor-agent',
        new SupervisorAgent(this.runtime, organizationId),
        {
          'route-request': 'routeRequest',
          'generate-consolidated-report': 'generateConsolidatedReport',
        },
      );
    }
  }

  private register(
    agentId: string,
    instance: Record<string, unknown>,
    taskMap: Record<string, string>,
  ): void {
    this.agents.set(agentId, {
      instance: instance as Record<string, TaskMethod>,
      tasks: new Map(Object.entries(taskMap)),
    });
  }

  hasNativeImplementation(agentId: string, taskName: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    return agent.tasks.has(taskName);
  }

  listRegisteredTasks(): Array<{ agentId: string; taskName: string; methodName: string }> {
    const result: Array<{ agentId: string; taskName: string; methodName: string }> = [];
    for (const [agentId, agent] of this.agents) {
      for (const [taskName, methodName] of agent.tasks) {
        result.push({ agentId, taskName, methodName });
      }
    }
    return result;
  }

  async executeTask(input: TaskInput): Promise<TaskResult> {
    const agent = this.agents.get(input.agentId);
    if (!agent) {
      logger.info(`[Registry] No native agent for "${input.agentId}", falling back to LLM`);
      return this.runtime.executeTask(input);
    }

    const methodName = agent.tasks.get(input.taskName);
    if (!methodName) {
      logger.info(`[Registry] No native task "${input.taskName}" on "${input.agentId}", falling back to LLM`);
      return this.runtime.executeTask(input);
    }

    logger.info(`[Registry] Native execution: ${input.agentId}/${input.taskName}`);
    return agent.instance[methodName](input.parameters);
  }
}
