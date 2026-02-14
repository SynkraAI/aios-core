/**
 * Squad Entry Point
 * FinHealth Squad — AIOS Bridge
 *
 * Thin CLI wrapper that bridges AIOS orchestration invocations
 * to the squad's AgentRuntime via stdin/stdout JSON protocol.
 *
 * Protocol:
 *   stdin  → JSON { agentId, taskName, parameters, context? }
 *   stdout → JSON { success, output, errors?, metadata? }
 *
 * Exit codes:
 *   0 = success (check output.success for task result)
 *   1 = runtime error (process-level failure)
 *   2 = invalid input (malformed JSON, missing fields)
 */

import { AgentRuntime, createRuntime, TaskInput, TaskResult } from './runtime/agent-runtime';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface EntryInput {
  agentId: string;
  taskName: string;
  parameters: Record<string, unknown>;
  context?: Record<string, unknown>;
}

// ============================================================================
// stdin reader
// ============================================================================

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.on('error', reject);

    // Timeout: 30 seconds to receive input
    setTimeout(() => reject(new Error('stdin read timeout (30s)')), 30_000);
  });
}

// ============================================================================
// Output helpers — all output goes through these to guarantee valid JSON
// ============================================================================

function writeResult(result: TaskResult): void {
  process.stdout.write(JSON.stringify(result) + '\n');
}

function writeError(message: string, code: number): never {
  const result: TaskResult = {
    success: false,
    output: null,
    errors: [message],
    metadata: { exitCode: code, entryPoint: 'finhealth-squad' },
  };
  process.stdout.write(JSON.stringify(result) + '\n');
  process.exit(code);
}

// ============================================================================
// Input validation
// ============================================================================

function validateInput(raw: unknown): EntryInput {
  if (!raw || typeof raw !== 'object') {
    writeError('Invalid input: expected JSON object', 2);
  }

  const input = raw as Record<string, unknown>;

  if (!input.agentId || typeof input.agentId !== 'string') {
    writeError('Invalid input: missing or invalid "agentId" (string required)', 2);
  }

  if (!input.taskName || typeof input.taskName !== 'string') {
    writeError('Invalid input: missing or invalid "taskName" (string required)', 2);
  }

  return {
    agentId: input.agentId as string,
    taskName: input.taskName as string,
    parameters: (input.parameters as Record<string, unknown>) || {},
    context: input.context as Record<string, unknown> | undefined,
  };
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  // 1. Read JSON from stdin
  let rawInput: string;
  try {
    rawInput = await readStdin();
  } catch (err: unknown) {
    writeError(`Failed to read stdin: ${err instanceof Error ? err.message : 'Unknown'}`, 2);
  }

  // 2. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawInput!);
  } catch {
    writeError(`Invalid JSON on stdin: ${rawInput!.substring(0, 200)}`, 2);
  }

  // 3. Validate input fields
  const input = validateInput(parsed);

  // 4. Initialize runtime
  const squadPath = path.resolve(__dirname, '..');
  let runtime: AgentRuntime;
  try {
    runtime = await createRuntime({
      squadPath,
      openaiApiKey: process.env.OPENAI_API_KEY,
      model: process.env.FINHEALTH_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      verbose: process.env.AIOS_DEBUG === 'true',
    });
  } catch (err: unknown) {
    writeError(
      `Failed to initialize AgentRuntime: ${err instanceof Error ? err.message : 'Unknown'}`,
      1,
    );
  }

  // 5. Execute task
  const taskInput: TaskInput = {
    agentId: input.agentId,
    taskName: input.taskName,
    parameters: input.parameters as Record<string, any>,
    context: input.context as Record<string, any>,
  };

  let result: TaskResult;
  try {
    result = await runtime!.executeTask(taskInput);
  } catch (err: unknown) {
    writeError(
      `Task execution failed: ${err instanceof Error ? err.message : 'Unknown'}`,
      1,
    );
  }

  // 6. Write result to stdout
  writeResult(result!);
  process.exit(0);
}

// Run
main().catch((err) => {
  writeError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`, 1);
});
