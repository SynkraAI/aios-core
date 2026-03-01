/**
 * Agent Registry Loader
 *
 * Loads and validates agent configurations from agent-registry.json.
 * Exports: loadRegistry(registryPath, projectRoot)
 *
 * @module registry
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** All 11 expected agent IDs */
const EXPECTED_AGENTS = [
  'sm', 'po', 'dev', 'qa', 'devops',
  'architect', 'pm', 'analyst',
  'data-engineer', 'ux-design-expert', 'aios-master',
];

/** Valid model identifiers (FR-029) */
const VALID_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6'];

/** Required fields and their expected types for each agent entry */
const REQUIRED_FIELDS = {
  id: 'string',
  persona: 'string',
  role: 'string',
  model: 'string',
  maxBudgetUsd: 'number',
  permissionMode: 'string',
  allowedTools: 'array',
  disallowedTools: 'array',
  systemPromptFile: 'string',
  systemPromptAppend: 'string',
  bashRestrictions: 'object_or_null',
  workflows: 'array',
};

/**
 * Validate the type of a field value against the expected type.
 *
 * @param {string} fieldName - The field being validated
 * @param {*} value - The actual value
 * @param {string} expectedType - One of: string, number, array, object_or_null
 * @returns {{ valid: boolean, message?: string }}
 */
function validateFieldType(fieldName, value, expectedType) {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return { valid: false, message: `"${fieldName}" must be a string, got ${typeof value}` };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { valid: false, message: `"${fieldName}" must be a number, got ${typeof value}` };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return { valid: false, message: `"${fieldName}" must be an array, got ${typeof value}` };
      }
      break;

    case 'object_or_null':
      if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
        return { valid: false, message: `"${fieldName}" must be an object or null, got ${typeof value}` };
      }
      break;

    default:
      return { valid: false, message: `Unknown expected type "${expectedType}" for field "${fieldName}"` };
  }

  return { valid: true };
}

/**
 * Validate a single agent configuration entry.
 *
 * @param {string} agentId - The agent key in the registry
 * @param {object} config - The agent configuration object
 * @param {string} projectRoot - Project root for systemPromptFile resolution
 * @throws {Error} If any validation fails
 */
function validateAgentConfig(agentId, config, projectRoot) {
  const errors = [];

  // Check all required fields exist and have correct types
  for (const [field, expectedType] of Object.entries(REQUIRED_FIELDS)) {
    if (!(field in config)) {
      errors.push(`Missing required field "${field}"`);
      continue;
    }

    const result = validateFieldType(field, config[field], expectedType);
    if (!result.valid) {
      errors.push(result.message);
    }
  }

  // If basic field checks failed, report now before deeper validation
  if (errors.length > 0) {
    throw new Error(`Agent "${agentId}" validation failed:\n  - ${errors.join('\n  - ')}`);
  }

  // Validate id matches the key
  if (config.id !== agentId) {
    errors.push(`"id" field ("${config.id}") does not match registry key ("${agentId}")`);
  }

  // Validate model is one of the known values
  if (!VALID_MODELS.includes(config.model)) {
    errors.push(`"model" must be one of [${VALID_MODELS.join(', ')}], got "${config.model}"`);
  }

  // Validate budget is positive
  if (config.maxBudgetUsd <= 0) {
    errors.push(`"maxBudgetUsd" must be > 0, got ${config.maxBudgetUsd}`);
  }

  // Validate bashRestrictions structure if not null
  if (config.bashRestrictions !== null) {
    if (!Array.isArray(config.bashRestrictions.blocked)) {
      errors.push('"bashRestrictions.blocked" must be an array');
    }
    if (typeof config.bashRestrictions.reason !== 'string') {
      errors.push('"bashRestrictions.reason" must be a string');
    }
  }

  // Validate systemPromptFile exists on disk
  const promptPath = resolve(projectRoot, config.systemPromptFile);
  if (!existsSync(promptPath)) {
    errors.push(`systemPromptFile not found on disk: "${config.systemPromptFile}" (resolved: ${promptPath})`);
  }

  if (errors.length > 0) {
    throw new Error(`Agent "${agentId}" validation failed:\n  - ${errors.join('\n  - ')}`);
  }
}

/**
 * Load and validate the agent registry from a JSON file.
 *
 * @param {string} [registryPath] - Path to agent-registry.json (defaults to ../agent-registry.json)
 * @param {string} [projectRoot] - Project root for resolving systemPromptFile paths (defaults to two levels up from src/)
 * @returns {{ agents: Record<string, object>, getAgent: (id: string) => object, listAgents: () => string[] }}
 * @throws {Error} If the file cannot be read, parsed, or contains invalid configs
 */
export function loadRegistry(registryPath, projectRoot) {
  // Default registry path: ../agent-registry.json relative to this file
  const resolvedRegistryPath = registryPath
    ? resolve(registryPath)
    : resolve(__dirname, '..', 'agent-registry.json');

  // Default project root: three levels up from src/ (packages/aios-orchestrator/src -> aios-core/)
  const resolvedProjectRoot = projectRoot
    ? resolve(projectRoot)
    : resolve(__dirname, '..', '..', '..');

  // Read and parse
  let raw;
  try {
    raw = readFileSync(resolvedRegistryPath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read agent registry at "${resolvedRegistryPath}": ${err.message}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse agent registry JSON: ${err.message}`);
  }

  // Validate top-level structure
  if (!data.agents || typeof data.agents !== 'object' || Array.isArray(data.agents)) {
    throw new Error('Agent registry must have a top-level "agents" object');
  }

  // Validate all expected agents are present
  const presentIds = Object.keys(data.agents);
  const missingAgents = EXPECTED_AGENTS.filter((id) => !presentIds.includes(id));
  if (missingAgents.length > 0) {
    throw new Error(`Missing agents in registry: ${missingAgents.join(', ')}`);
  }

  // Validate each agent config
  for (const [agentId, config] of Object.entries(data.agents)) {
    validateAgentConfig(agentId, config, resolvedProjectRoot);
  }

  // Build the registry API
  const agents = data.agents;

  return {
    /** Raw agents map */
    agents,

    /**
     * Get a single agent config by ID.
     * @param {string} id - Agent identifier
     * @returns {object} Agent configuration
     * @throws {Error} If agent not found
     */
    getAgent(id) {
      if (!agents[id]) {
        throw new Error(`Agent "${id}" not found in registry. Available: ${Object.keys(agents).join(', ')}`);
      }
      return agents[id];
    },

    /**
     * List all agent IDs in the registry.
     * @returns {string[]}
     */
    listAgents() {
      return Object.keys(agents);
    },

    /**
     * Validate a config object against the registry schema (useful for testing).
     * @param {object} config - Agent config to validate
     * @param {string} [root] - Project root override
     */
    validateConfig(config, root) {
      validateAgentConfig(config.id || 'unknown', config, root || resolvedProjectRoot);
    },
  };
}

// Self-test when executed directly: node src/registry.mjs
if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  console.log('Running agent registry self-test...\n');

  try {
    const registry = loadRegistry();
    const agentIds = registry.listAgents();

    console.log(`Loaded ${agentIds.length} agents: ${agentIds.join(', ')}\n`);

    for (const id of agentIds) {
      const agent = registry.getAgent(id);
      const tools = agent.allowedTools.length > 0 ? agent.allowedTools.join(', ') : '(all)';
      const bash = agent.bashRestrictions
        ? `blocked: [${agent.bashRestrictions.blocked.join(', ')}]`
        : 'unrestricted';
      console.log(
        `  ${id.padEnd(18)} | ${agent.persona.padEnd(12)} | ${agent.model.padEnd(18)} | $${agent.maxBudgetUsd.toFixed(2).padStart(5)} | tools: ${tools} | bash: ${bash}`
      );
    }

    console.log('\nAll 11 agents loaded and validated successfully.');
    process.exit(0);
  } catch (err) {
    console.error(`Registry validation FAILED: ${err.message}`);
    process.exit(1);
  }
}
