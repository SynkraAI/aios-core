/**
 * Squad Executor — Process-based bridge for AIOS ↔ Squad runtime
 *
 * Spawns squad entry points as child processes, communicating via
 * JSON over stdin/stdout. This enables AIOS core (JavaScript) to
 * invoke squad agents (TypeScript/Python/etc.) in process isolation.
 *
 * Used by AgentInvoker to route squad agent invocations.
 *
 * @module core/orchestration/squad-executor
 * @version 1.0.0
 */

const { spawn } = require('child_process');
const path = require('path');
const { SquadLoader } = require('../../development/scripts/squad/squad-loader');

// ═══════════════════════════════════════════════════════════════════════════════
//                              CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Default timeout for squad task execution (5 minutes)
 * @constant {number}
 */
const DEFAULT_TIMEOUT = 300_000;

/**
 * Entry point filename convention
 * @constant {string}
 */
const ENTRY_POINT_FILE = 'src/entry.ts';

/**
 * Command to run TypeScript entry points
 * @constant {string}
 */
const TSX_COMMAND = 'npx';
const TSX_ARGS = ['tsx'];

// ═══════════════════════════════════════════════════════════════════════════════
//                              SQUAD EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SquadExecutor — Spawns squad entry points and manages communication
 */
class SquadExecutor {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.projectRoot - Project root path
   * @param {string} [options.squadsPath] - Path to squads directory (default: projectRoot/squads)
   * @param {number} [options.timeout] - Execution timeout in ms (default: 300000)
   * @param {boolean} [options.verbose] - Enable verbose logging
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.squadsPath = options.squadsPath || path.join(this.projectRoot, 'squads');
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.verbose = options.verbose || false;

    this.loader = new SquadLoader({ squadsPath: this.squadsPath, verbose: this.verbose });

    // Cache of resolved squad paths: squadName → squadPath
    this._squadPaths = new Map();
  }

  /**
   * Execute a squad agent task
   *
   * @param {string} squadName - Squad name (e.g., 'finhealth-squad')
   * @param {string} agentId - Agent ID within the squad (e.g., 'billing-agent')
   * @param {string} taskName - Task to execute (e.g., 'validate-tiss')
   * @param {Object} [parameters={}] - Task parameters
   * @param {Object} [context={}] - Additional context
   * @returns {Promise<Object>} Task result { success, output, errors?, metadata? }
   */
  async executeSquadTask(squadName, agentId, taskName, parameters = {}, context = {}) {
    const startTime = Date.now();
    this._log(`Executing ${squadName}:${agentId} → ${taskName}`);

    // Resolve squad path
    const squadPath = await this._resolveSquadPath(squadName);

    // Build entry point path
    const entryPoint = path.join(squadPath, ENTRY_POINT_FILE);

    // Build payload
    const payload = JSON.stringify({
      agentId,
      taskName,
      parameters,
      context,
    });

    // Spawn process and communicate
    const result = await this._spawnAndCommunicate(entryPoint, payload, squadPath);

    result.metadata = {
      ...result.metadata,
      squadName,
      agentId,
      taskName,
      duration: Date.now() - startTime,
      bridge: 'squad-executor',
    };

    this._log(`Completed ${squadName}:${agentId} → ${taskName} in ${Date.now() - startTime}ms`);
    return result;
  }

  /**
   * Create an executor function compatible with AgentInvoker's executor interface
   *
   * @returns {Function} executor(agent, task, context) → Promise<result>
   */
  createExecutorFn() {
    return async (agent, task, context) => {
      // Extract squad info from agent metadata
      const squadName = agent.squadName;
      const agentId = agent.squadAgentId || agent.name;

      if (!squadName) {
        throw new Error(`Agent ${agent.name} is not a squad agent (missing squadName)`);
      }

      return this.executeSquadTask(
        squadName,
        agentId,
        task.name,
        context.inputs || {},
        {
          orchestration: context.orchestration,
          projectRoot: context.projectRoot,
          timestamp: context.timestamp,
        },
      );
    };
  }

  /**
   * Check if a squad has a valid entry point
   *
   * @param {string} squadName - Squad name
   * @returns {Promise<boolean>} True if entry point exists
   */
  async hasEntryPoint(squadName) {
    try {
      const squadPath = await this._resolveSquadPath(squadName);
      const entryPoint = path.join(squadPath, ENTRY_POINT_FILE);
      const fs = require('fs');
      return fs.existsSync(entryPoint);
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //                              PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Resolve squad path using SquadLoader (with cache)
   * @private
   */
  async _resolveSquadPath(squadName) {
    if (this._squadPaths.has(squadName)) {
      return this._squadPaths.get(squadName);
    }

    const resolved = await this.loader.resolve(squadName);
    this._squadPaths.set(squadName, resolved.path);
    return resolved.path;
  }

  /**
   * Spawn entry point process and communicate via stdin/stdout
   * @private
   */
  _spawnAndCommunicate(entryPoint, payload, cwd) {
    return new Promise((resolve, reject) => {
      const args = [...TSX_ARGS, entryPoint];

      this._log(`Spawning: ${TSX_COMMAND} ${args.join(' ')}`);

      // Use shell on Windows (npx requires it), direct spawn on Unix
      const isWindows = process.platform === 'win32';

      const child = spawn(TSX_COMMAND, args, {
        cwd,
        env: {
          ...process.env,
          AIOS_SQUAD_BRIDGE: 'true',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: isWindows,
        timeout: this.timeout,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (this.verbose) {
          process.stderr.write(`[squad-executor:stderr] ${data}`);
        }
      });

      // Write payload to stdin and close
      child.stdin.write(payload);
      child.stdin.end();

      // Timeout handler
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({
          success: false,
          output: null,
          errors: [`Squad task timed out after ${this.timeout}ms`],
          metadata: { timeout: true },
        });
      }, this.timeout);

      child.on('close', (code) => {
        clearTimeout(timer);

        // Parse stdout as JSON
        const trimmed = stdout.trim();

        if (!trimmed) {
          resolve({
            success: false,
            output: null,
            errors: [
              `Squad process exited with code ${code} and no output`,
              stderr ? `stderr: ${stderr.substring(0, 500)}` : '',
            ].filter(Boolean),
            metadata: { exitCode: code },
          });
          return;
        }

        try {
          // Take only the last line of stdout (in case of debug output)
          const lines = trimmed.split('\n');
          const lastLine = lines[lines.length - 1];
          const result = JSON.parse(lastLine);
          resolve(result);
        } catch (parseError) {
          resolve({
            success: false,
            output: null,
            errors: [
              `Failed to parse squad output as JSON: ${parseError.message}`,
              `Raw output: ${trimmed.substring(0, 500)}`,
              stderr ? `stderr: ${stderr.substring(0, 500)}` : '',
            ].filter(Boolean),
            metadata: { exitCode: code, parseError: true },
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({
          success: false,
          output: null,
          errors: [`Failed to spawn squad process: ${err.message}`],
          metadata: { spawnError: true },
        });
      });
    });
  }

  /**
   * Log message if verbose
   * @private
   */
  _log(message) {
    if (this.verbose) {
      console.log(`[SquadExecutor] ${message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                              EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  SquadExecutor,
  DEFAULT_TIMEOUT,
  ENTRY_POINT_FILE,
};
