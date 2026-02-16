/**
 * Scheduler CLI
 * FinHealth Squad — CLI commands for workflow scheduler
 *
 * Commands:
 *   finhealth scheduler start       — Start the scheduler daemon
 *   finhealth scheduler status      — Show scheduler status
 *   finhealth scheduler trigger <w> — Manually trigger a workflow
 *   finhealth scheduler list        — List all workflows and their triggers
 *   finhealth scheduler emit <evt>  — Emit an event to trigger event-based workflows
 *
 * Designed to run as a long-lived CLI process inside a Docker container.
 */

import * as path from 'path';
import { WorkflowScheduler } from './workflow-scheduler';
import { PipelineExecutor } from '../pipeline/pipeline-executor';
import { CircuitBreaker } from '../pipeline/circuit-breaker';
import type { AgentRuntime } from '../runtime/agent-runtime';
import { createRuntime } from '../runtime/agent-runtime';
import { logger } from '../logger';

// ============================================================================
// CLI output helpers
// ============================================================================

function print(message: string): void {
  process.stdout.write(message + '\n');
}

function printJson(data: unknown): void {
  print(JSON.stringify(data, null, 2));
}

function printTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
  );

  const line = colWidths.map((w) => '-'.repeat(w + 2)).join('+');
  const headerRow = headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join('|');

  print(line);
  print(headerRow);
  print(line);
  for (const row of rows) {
    print(row.map((c, i) => ` ${(c || '').padEnd(colWidths[i])} `).join('|'));
  }
  print(line);
}

// ============================================================================
// Command handlers
// ============================================================================

async function createScheduler(squadPath: string, verbose: boolean): Promise<WorkflowScheduler> {
  const workflowsPath = path.resolve(squadPath, 'workflows');

  let runtime: AgentRuntime;
  try {
    runtime = await createRuntime({
      squadPath,
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: process.env.FINHEALTH_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      verbose,
    });
  } catch (err: unknown) {
    print(`[ERROR] Failed to create runtime: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const circuitBreaker = new CircuitBreaker();
  const executor = new PipelineExecutor(runtime, {
    workflowsPath,
    verbose,
    circuitBreaker,
  });

  const scheduler = new WorkflowScheduler(executor, {
    workflowsPath,
    verbose,
    timezone: process.env.TZ || 'America/Sao_Paulo',
  });

  await scheduler.initialize();
  return scheduler;
}

async function handleStart(squadPath: string, verbose: boolean): Promise<void> {
  const scheduler = await createScheduler(squadPath, verbose);

  scheduler.start();
  print('[Scheduler] Running. Press Ctrl+C to stop.');

  const status = scheduler.getStatus();
  print(`\nScheduled jobs: ${status.scheduledJobs.length}`);
  for (const job of status.scheduledJobs) {
    print(`  - ${job.workflowName}: ${job.cronExpression} (${job.timezone})`);
  }

  print(`\nEvent bindings: ${status.eventBindings.length}`);
  for (const binding of status.eventBindings) {
    print(`  - ${binding.eventName} → ${binding.workflowName}`);
  }

  // Keep process alive
  const shutdown = () => {
    print('\n[Scheduler] Shutting down...');
    scheduler.destroy();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Heartbeat to keep alive
  const heartbeat = setInterval(() => {
    if (verbose) {
      logger.debug('[Scheduler] Heartbeat — running');
    }
  }, 60_000);

  // Prevent GC of interval
  heartbeat.unref();

  // Keep event loop alive
  await new Promise(() => {
    // Never resolves — process stays alive until signal
  });
}

async function handleStatus(squadPath: string, verbose: boolean): Promise<void> {
  const scheduler = await createScheduler(squadPath, verbose);

  const status = scheduler.getStatus();

  print('\n=== Workflow Scheduler Status ===\n');
  print(`Running: ${status.running ? 'YES' : 'NO'}`);
  if (status.startedAt) {
    print(`Started: ${status.startedAt.toISOString()}`);
  }

  print('\n--- Scheduled Jobs ---');
  if (status.scheduledJobs.length === 0) {
    print('  (none)');
  } else {
    printTable(
      ['Workflow', 'Cron', 'Timezone', 'Enabled'],
      status.scheduledJobs.map((j) => [j.workflowName, j.cronExpression, j.timezone, j.enabled ? 'yes' : 'no']),
    );
  }

  print('\n--- Event Bindings ---');
  if (status.eventBindings.length === 0) {
    print('  (none)');
  } else {
    printTable(
      ['Event', 'Workflow', 'Source'],
      status.eventBindings.map((b) => [b.eventName, b.workflowName, b.source || '-']),
    );
  }

  print('');
  scheduler.destroy();
}

async function handleList(squadPath: string, verbose: boolean): Promise<void> {
  const scheduler = await createScheduler(squadPath, verbose);

  const status = scheduler.getStatus();

  print('\n=== Available Workflows ===\n');

  const rows: string[][] = [];
  for (const job of status.scheduledJobs) {
    rows.push([job.workflowName, 'scheduled', job.cronExpression, job.timezone]);
  }
  for (const binding of status.eventBindings) {
    rows.push([binding.workflowName, 'on-event', binding.eventName, binding.source || '-']);
  }

  // Add manual workflows
  const workflowsPath = path.resolve(squadPath, 'workflows');
  const { loadWorkflowsFromDir } = await import('../pipeline/workflow-loader');
  const allWorkflows = loadWorkflowsFromDir(workflowsPath);
  for (const [name, wf] of allWorkflows) {
    if (wf.trigger?.type === 'manual') {
      rows.push([name, 'manual', '-', '-']);
    }
  }

  if (rows.length === 0) {
    print('  (no workflows found)');
  } else {
    printTable(['Workflow', 'Trigger', 'Schedule/Event', 'Timezone/Source'], rows);
  }

  print('');
  scheduler.destroy();
}

async function handleTrigger(
  squadPath: string,
  workflowName: string,
  params: Record<string, unknown>,
  verbose: boolean,
): Promise<void> {
  const scheduler = await createScheduler(squadPath, verbose);

  print(`\nTriggering workflow: ${workflowName}...`);

  const result = await scheduler.trigger(workflowName, params);

  if (result.success) {
    print(`\nSUCCESS (execution: ${result.executionId})`);
  } else {
    print(`\nFAILED (execution: ${result.executionId})`);
    if (result.error) {
      print(`Error: ${result.error}`);
    }
  }

  scheduler.destroy();
  process.exit(result.success ? 0 : 1);
}

async function handleEmit(
  squadPath: string,
  eventName: string,
  payload: Record<string, unknown>,
  verbose: boolean,
): Promise<void> {
  const scheduler = await createScheduler(squadPath, verbose);
  scheduler.start();

  print(`\nEmitting event: ${eventName}`);
  await scheduler.emitEvent(eventName, payload);

  // Give event handlers time to complete
  await new Promise((r) => setTimeout(r, 5000));

  const executions = scheduler.getExecutionLogger().getRecent(5);
  if (executions.length > 0) {
    print('\nTriggered executions:');
    for (const exec of executions) {
      print(`  - ${exec.workflowName}: ${exec.status} (${exec.id})`);
    }
  }

  scheduler.destroy();
}

// ============================================================================
// Main CLI entry
// ============================================================================

export async function runSchedulerCli(args: string[]): Promise<void> {
  const command = args[0];
  const verbose = process.env.AIOS_DEBUG === 'true' || args.includes('--verbose');
  const squadPath = process.env.SQUAD_PATH || path.resolve(__dirname, '../..');

  switch (command) {
    case 'start':
      await handleStart(squadPath, verbose);
      break;

    case 'status':
      await handleStatus(squadPath, verbose);
      break;

    case 'list':
      await handleList(squadPath, verbose);
      break;

    case 'trigger': {
      const workflowName = args[1];
      if (!workflowName) {
        print('Usage: finhealth scheduler trigger <workflow-name> [--param key=value]');
        process.exit(2);
      }
      const params: Record<string, unknown> = {};
      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--param' && args[i + 1]) {
          const [key, ...rest] = args[i + 1].split('=');
          params[key] = rest.join('=');
          i++;
        }
      }
      await handleTrigger(squadPath, workflowName, params, verbose);
      break;
    }

    case 'emit': {
      const eventName = args[1];
      if (!eventName) {
        print('Usage: finhealth scheduler emit <event-name> [--payload \'{"key":"value"}\']');
        process.exit(2);
      }
      let payload: Record<string, unknown> = {};
      const payloadIdx = args.indexOf('--payload');
      if (payloadIdx !== -1 && args[payloadIdx + 1]) {
        try {
          payload = JSON.parse(args[payloadIdx + 1]);
        } catch {
          print('Error: invalid JSON payload');
          process.exit(2);
        }
      }
      await handleEmit(squadPath, eventName, payload, verbose);
      break;
    }

    default:
      print('FinHealth Scheduler CLI');
      print('');
      print('Commands:');
      print('  start                          Start the scheduler daemon');
      print('  status                         Show scheduler status');
      print('  list                           List all workflows and triggers');
      print('  trigger <workflow> [--param]   Manually trigger a workflow');
      print('  emit <event> [--payload]       Emit an event');
      print('');
      print('Options:');
      print('  --verbose                      Enable verbose logging');
      print('');
      print('Environment:');
      print('  SQUAD_PATH                     Path to squad root (default: auto-detect)');
      print('  TZ                             Timezone (default: America/Sao_Paulo)');
      print('  AIOS_DEBUG=true                Enable debug logging');
      break;
  }
}

// Direct execution
if (require.main === module) {
  const args = process.argv.slice(2);
  runSchedulerCli(args).catch((err) => {
    print(`[FATAL] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
