/**
 * Governance Hooks — Authority Matrix + Evasion-Resistant Bash Filtering
 *
 * Provides PreToolUse governance hooks that structurally enforce the agent
 * authority matrix. Multi-layer regex Bash filtering resists evasion attempts
 * (base64, eval, heredoc, variable interpolation, subshell, path-qualified).
 *
 * Story: E7.1.4
 * Architecture: sdk-orchestrator-architecture.md Section 8
 * Validation: F1 fix (multi-layer regex), N1 fix (narrow var pattern), N3 fix (wildcard heredoc)
 *
 * @module governance-hooks
 */

// ---------------------------------------------------------------------------
// Logger — lightweight wrapper, replaceable via setLogger()
// ---------------------------------------------------------------------------

let logger = {
  warn(obj, msg) {
    console.warn(msg || '', JSON.stringify(obj));
  },
  debug(obj, msg) {
    if (process.env.AIOS_DEBUG === 'true') {
      console.debug(msg || '', JSON.stringify(obj));
    }
  },
  error(obj, msg) {
    console.error(msg || '', JSON.stringify(obj));
  },
};

/**
 * Replace the default console logger with an external logger (e.g., pino).
 * Session Manager calls this during initialization.
 *
 * @param {object} externalLogger - Logger with warn/debug/error methods
 */
export function setLogger(externalLogger) {
  if (externalLogger && typeof externalLogger.warn === 'function') {
    logger = externalLogger;
  }
}

// ---------------------------------------------------------------------------
// Pre-compiled Evasion Wrapper Patterns (applied to ALL restricted agents)
// ---------------------------------------------------------------------------

/**
 * Evasion wrappers that can wrap ANY blocked command.
 * Agents with bash restrictions cannot use these regardless of the specific
 * blocked command, because they could wrap anything.
 *
 * N1 fix: variable pattern narrowed to single-char vars ($A $B, not $HOME $PWD)
 * N3 fix: heredoc uses \w+ wildcard instead of fixed delimiter list
 */
const EVASION_WRAPPER_PATTERNS = [
  // base64 decode piped to bash/sh/zsh/exec
  /base64\s+(-d|--decode).*\|\s*(bash|sh|zsh|exec)\b/i,

  // eval with string argument (quotes or subshell)
  /\beval\s+["'$(]/i,

  // bash -c / sh -c / zsh -c with string argument
  /\b(bash|sh|zsh)\s+-c\s+["'$]/i,

  // heredoc piped to or used with bash/sh (wildcard delimiter — N3 fix)
  /\b(bash|sh|zsh)\s*<<[-~]?\s*['"]?\w+['"]?/i,

  // here-string (<<<) piped to bash/sh
  /\b(bash|sh|zsh)\s*<<<\s*/i,

  // Variable interpolation with short vars: $A $B pattern (N1 fix — narrowed)
  // Only matches single-char uppercase variable names that look like command splitting
  /\$\{?[A-Z]\}?\s+\$\{?[A-Z]\}?/,

  // Subshell execution: $(...) containing assignment-like patterns
  // This catches $(eval ...) and similar
  /\$\(\s*eval\b/i,

  // source or dot-execution of temp/dev/proc files
  /\b(source|\.)\s+\/?(tmp|dev|proc)\//i,
];

// ---------------------------------------------------------------------------
// Persona File Protection Path
// ---------------------------------------------------------------------------

const PERSONA_PATH_PATTERN = '.claude/commands/AIOS/agents';

/**
 * Normalize a file path to forward slashes for consistent matching.
 * @param {string} filePath
 * @returns {string}
 */
function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

// ---------------------------------------------------------------------------
// Bash Pattern Builder — Pre-compiled per blocked command
// ---------------------------------------------------------------------------

/**
 * Build evasion-resistant regex patterns for a single blocked command.
 *
 * Layer 1: Direct match with flexible whitespace, case-insensitive
 * Layer 2: Path-prefixed binary (/usr/bin/, /usr/local/bin/, /bin/)
 * Layer 3: Escaped characters (backslash insertion between chars)
 * Layer 4: Quote-split chars (gi"t" pu"sh")
 * Layer 5: Subshell wrapping ($(...) and backticks)
 * Layer 6: Path traversal (../../usr/bin/...)
 *
 * @param {string} command - The command to block (e.g., "git push")
 * @returns {Array<{ pattern: RegExp, layer: string }>}
 */
function buildBlockPatterns(command) {
  // Escape special regex characters
  const escaped = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Allow flexible whitespace between words
  const flexSpaced = escaped.replace(/\s+/g, '\\s+');

  const patterns = [];

  // Layer 1: Direct match (case-insensitive, flexible whitespace)
  patterns.push({
    pattern: new RegExp(`\\b${flexSpaced}\\b`, 'i'),
    layer: 'direct',
  });

  // Layer 2: Path-prefixed binary
  patterns.push({
    pattern: new RegExp(`(/[\\w./]*bin/)${flexSpaced}`, 'i'),
    layer: 'path-prefixed',
  });

  // Layer 3: Backslash-escaped characters (gi\t pu\sh)
  // Insert optional backslash between each character of each word
  const words = command.split(/\s+/);
  const escapedWords = words.map((word) => {
    return word
      .split('')
      .map((ch) => {
        const esc = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `${esc}\\\\?`;
      })
      .join('');
  });
  const backslashPattern = escapedWords.join('\\s+');
  patterns.push({
    pattern: new RegExp(backslashPattern, 'i'),
    layer: 'backslash-escaped',
  });

  // Layer 4: Quote-split characters (gi"t" pu"sh", gi't' pu'sh')
  const quoteSplitWords = words.map((word) => {
    return word
      .split('')
      .map((ch) => {
        const esc = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return `["']?${esc}["']?`;
      })
      .join('');
  });
  const quoteSplitPattern = quoteSplitWords.join('\\s+');
  patterns.push({
    pattern: new RegExp(quoteSplitPattern, 'i'),
    layer: 'quote-split',
  });

  // Layer 5: Subshell wrapping — $( command ) and backtick ` command `
  patterns.push({
    pattern: new RegExp(`\\$\\(\\s*${flexSpaced}`, 'i'),
    layer: 'subshell-dollar',
  });
  patterns.push({
    pattern: new RegExp(`\`\\s*${flexSpaced}`, 'i'),
    layer: 'subshell-backtick',
  });

  // Layer 6: Path traversal (../../usr/bin/git push)
  patterns.push({
    pattern: new RegExp(`(\\.\\./)+[\\w./]*bin/${flexSpaced}`, 'i'),
    layer: 'path-traversal',
  });

  return patterns;
}

/**
 * Check if a base64-encoded payload contains a blocked command.
 * Extracts potential base64 strings from the command, decodes them,
 * and checks if any blocked command appears in the decoded output.
 *
 * @param {string} cmd - The full Bash command string
 * @param {Array<{ command: string }>} compiledBlocks - Blocked commands
 * @returns {{ blocked: boolean, command?: string, decoded?: string }}
 */
function checkBase64Payload(cmd, compiledBlocks) {
  // Match base64-like strings (at least 4 chars, valid base64 alphabet)
  const base64Regex = /["']?([A-Za-z0-9+/]{4,}={0,3})["']?/g;
  let match;
  while ((match = base64Regex.exec(cmd)) !== null) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      // Check if the decoded string contains any blocked command
      for (const block of compiledBlocks) {
        const flexPattern = new RegExp(
          block.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'),
          'i'
        );
        if (flexPattern.test(decoded)) {
          return { blocked: true, command: block.command, decoded };
        }
      }
    } catch {
      // Not valid base64, skip
    }
  }
  return { blocked: false };
}

// ---------------------------------------------------------------------------
// Budget Tracker
// ---------------------------------------------------------------------------

/**
 * Create a budget tracker for a workflow session.
 *
 * @param {number} maxBudgetUsd - Maximum budget in USD
 * @returns {{ track: (cost: number) => { allowed: boolean, remaining: number, total: number }, reset: () => void, getTotal: () => number }}
 */
export function createBudgetTracker(maxBudgetUsd) {
  let totalCostUsd = 0;

  return {
    /**
     * Track a tool call cost increment.
     * @param {number} cost - Cost of this tool call in USD
     * @returns {{ allowed: boolean, remaining: number, total: number }}
     */
    track(cost = 0) {
      totalCostUsd += cost;
      return {
        allowed: totalCostUsd <= maxBudgetUsd,
        remaining: Math.max(0, maxBudgetUsd - totalCostUsd),
        total: totalCostUsd,
      };
    },

    /** Reset the tracker to zero. */
    reset() {
      totalCostUsd = 0;
    },

    /** Get the current total cost. */
    getTotal() {
      return totalCostUsd;
    },
  };
}

// ---------------------------------------------------------------------------
// Governance Hooks Factory
// ---------------------------------------------------------------------------

/**
 * The governance hooks object. Provides forAgent(agentId) to get hooks
 * compatible with the SDK query() hooks parameter.
 *
 * @param {object} registry - Registry object from loadRegistry()
 * @returns {object} governanceHooks with forAgent() method
 */
export function createGovernanceHooks(registry) {
  return {
    /**
     * Create governance hooks for a specific agent.
     *
     * @param {string} agentId - Agent identifier (e.g., 'dev', 'qa')
     * @returns {{ preToolUse: Function } | null} Hooks object or null for aios-master
     * @throws {Error} If agentId is not found in registry (ConfigError)
     */
    forAgent(agentId) {
      // aios-master has no restrictions
      if (agentId === 'aios-master') {
        return null;
      }

      // Validate agent exists
      let config;
      try {
        config = registry.getAgent(agentId);
      } catch (err) {
        const configError = new Error(`ConfigError: Agent "${agentId}" not found in registry`);
        configError.code = 'CONFIG_ERROR';
        throw configError;
      }

      // Pre-compile regex patterns for this agent's blocked commands
      const blockedCommands = config.bashRestrictions?.blocked || [];
      const compiledBlocks = blockedCommands.map((cmd) => ({
        command: cmd,
        patterns: buildBlockPatterns(cmd),
      }));

      const hasBashRestrictions = compiledBlocks.length > 0;
      const disallowedTools = new Set(config.disallowedTools || []);

      /**
       * PreToolUse hook — checks tool restrictions, bash filtering, persona protection.
       *
       * @param {string} toolName - The tool being invoked
       * @param {object} toolInput - The tool's input parameters
       * @returns {{ decision: string, reason?: string }}
       */
      async function preToolUse(toolName, toolInput) {
        try {
          // ---------------------------------------------------------------
          // Check 1: Tool disallow list (secondary check — SDK primary)
          // ---------------------------------------------------------------
          if (disallowedTools.has(toolName)) {
            const result = {
              decision: 'deny',
              reason: `Tool ${toolName} is not allowed for agent ${agentId}`,
            };
            logger.warn({
              event: 'governance_deny',
              agentId,
              tool: toolName,
              input: _sanitizeInput(toolInput),
              reason: 'disallowed_tool',
              blockedPattern: toolName,
            });
            return result;
          }

          // ---------------------------------------------------------------
          // Check 2: Persona file protection (AC6 — FR-012)
          // ---------------------------------------------------------------
          if (toolName === 'Write' || toolName === 'Edit') {
            const filePath = toolInput?.file_path || toolInput?.filePath || '';
            const normalizedPath = normalizePath(filePath);
            if (normalizedPath.includes(PERSONA_PATH_PATTERN)) {
              const result = {
                decision: 'deny',
                reason: `Agent ${agentId} cannot modify persona files. Only aios-master has this authority.`,
              };
              logger.warn({
                event: 'governance_deny',
                agentId,
                tool: toolName,
                input: _sanitizeInput(toolInput),
                reason: 'persona_protection',
                blockedPattern: PERSONA_PATH_PATTERN,
              });
              return result;
            }
          }

          // ---------------------------------------------------------------
          // Check 3: Bash command filtering (evasion-resistant)
          // ---------------------------------------------------------------
          if (toolName === 'Bash' && hasBashRestrictions) {
            const cmd = toolInput?.command || '';

            // 3a: Direct command patterns (multi-layer regex)
            for (const block of compiledBlocks) {
              for (const { pattern, layer } of block.patterns) {
                if (pattern.test(cmd)) {
                  const result = {
                    decision: 'deny',
                    reason: `Blocked command "${block.command}" detected (${layer}) for agent ${agentId}`,
                  };
                  logger.warn({
                    event: 'governance_deny',
                    agentId,
                    tool: 'Bash',
                    input: _truncate(cmd, 120),
                    reason: 'blocked_command',
                    blockedPattern: block.command,
                    detectionLayer: layer,
                  });
                  return result;
                }
              }
            }

            // 3b: Base64 payload inspection
            if (/base64/i.test(cmd)) {
              const base64Check = checkBase64Payload(cmd, compiledBlocks);
              if (base64Check.blocked) {
                const result = {
                  decision: 'deny',
                  reason: `Base64-encoded blocked command "${base64Check.command}" detected for agent ${agentId}`,
                };
                logger.warn({
                  event: 'governance_deny',
                  agentId,
                  tool: 'Bash',
                  input: _truncate(cmd, 120),
                  reason: 'base64_evasion',
                  blockedPattern: base64Check.command,
                  decoded: _truncate(base64Check.decoded, 60),
                });
                return result;
              }
            }

            // 3c: Evasion wrapper patterns (generic)
            for (const evasionPattern of EVASION_WRAPPER_PATTERNS) {
              if (evasionPattern.test(cmd)) {
                const result = {
                  decision: 'deny',
                  reason: `Evasion pattern detected for agent ${agentId}. Agents with bash restrictions cannot use base64, eval, heredoc, or variable interpolation to execute commands.`,
                };
                logger.warn({
                  event: 'governance_deny',
                  agentId,
                  tool: 'Bash',
                  input: _truncate(cmd, 120),
                  reason: 'evasion_wrapper',
                  blockedPattern: evasionPattern.source,
                });
                return result;
              }
            }

            // 3d: Log allowed Bash commands at DEBUG level
            logger.debug({
              event: 'governance_allow',
              agentId,
              tool: 'Bash',
              input: _truncate(cmd, 80),
            });
          }

          // ---------------------------------------------------------------
          // Default: Allow
          // ---------------------------------------------------------------
          return { decision: 'allow' };
        } catch (err) {
          // Fail-open: if the hook throws, treat as ALLOW but log ERROR
          logger.error({
            event: 'governance_error',
            agentId,
            tool: toolName,
            error: err.message,
          }, 'Governance hook error — failing open');
          return { decision: 'allow' };
        }
      }

      return {
        preToolUse,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Truncate a string to maxLen characters for safe logging.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
function _truncate(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

/**
 * Sanitize tool input for logging — remove potentially sensitive content.
 * @param {object} input
 * @returns {object}
 */
function _sanitizeInput(input) {
  if (!input || typeof input !== 'object') return {};
  const safe = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      // Truncate long values, skip anything that looks like a token/key
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
        safe[key] = '[REDACTED]';
      } else {
        safe[key] = _truncate(value, 120);
      }
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

// ---------------------------------------------------------------------------
// Exports for testing internals
// ---------------------------------------------------------------------------

export const _internals = {
  buildBlockPatterns,
  checkBase64Payload,
  EVASION_WRAPPER_PATTERNS,
  normalizePath,
  PERSONA_PATH_PATTERN,
};
