'use strict';

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const path = require('path');
const fs = require('fs');
const { ContractLoader } = require('./contract-loader');
const { ContractValidator } = require('./contract-validator');

const VALID_AGENTS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm',
  'analyst', 'data-engineer', 'ux-design-expert', 'devops', 'aios-master'
];

/**
 * AIOS MCP Server — Exposes AIOS tools via MCP protocol.
 * Contract-driven: tool definitions and schemas come from the contract YAML.
 */
class AiosMcpServer {
  constructor(options = {}) {
    const contractPath = options.contractPath ||
      path.join(__dirname, '..', 'contracts', 'aios-openclaw-contract.yaml');

    this._loader = new ContractLoader(contractPath);
    this._validator = new ContractValidator();
    this._projectRoot = options.projectRoot || process.cwd();
    this._server = null;
    this._startTime = Date.now();
  }

  /**
   * Create and configure the MCP server with tools from the contract.
   * @returns {McpServer} Configured MCP server instance
   */
  create() {
    const contract = this._loader.load();
    const metadata = this._loader.getMetadata();

    // Validate contract on startup
    const validation = this._validator.validateContract(contract);
    if (!validation.valid) {
      const errorSummary = validation.errors.map(e => `  ${e.path}: ${e.message}`).join('\n');
      throw new Error(`Invalid contract:\n${errorSummary}`);
    }

    this._server = new McpServer({
      name: metadata.parties.provider.name,
      version: metadata.version
    });

    this._registerTools();

    return this._server;
  }

  /**
   * Start the server on stdio transport.
   */
  async start() {
    if (!this._server) this.create();

    const transport = new StdioServerTransport();
    await this._server.connect(transport);
  }

  /**
   * Register all AIOS tools from the contract.
   * @private
   */
  _registerTools() {
    const aiosTools = this._loader.getAiosTools();

    for (const toolDef of aiosTools) {
      const handler = this._getHandler(toolDef.name);
      if (!handler) continue;

      this._server.tool(
        toolDef.name,
        toolDef.description,
        toolDef.input_schema.properties || {},
        async (params) => {
          // Validate input against contract
          const inputValidation = this._validator.validateInput(toolDef.name, params, toolDef);
          if (!inputValidation.valid) {
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: 'VALIDATION_ERROR',
                  message: 'Input validation failed',
                  details: inputValidation.errors
                })
              }],
              isError: true
            };
          }

          try {
            const result = await handler(params);

            // Validate output against contract
            const outputValidation = this._validator.validateOutput(toolDef.name, result, toolDef);
            if (!outputValidation.valid) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: 'OUTPUT_VALIDATION_ERROR',
                    message: 'Response does not match contract schema',
                    details: outputValidation.errors,
                    partial_result: result
                  })
                }],
                isError: true
              };
            }

            return {
              content: [{
                type: 'text',
                text: JSON.stringify(result)
              }]
            };
          } catch (err) {
            const errorCode = err.code || 'INTERNAL_ERROR';
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  error: errorCode,
                  message: err.message
                })
              }],
              isError: true
            };
          }
        }
      );
    }
  }

  /**
   * Get the handler function for a given tool name.
   * @private
   */
  _getHandler(toolName) {
    const handlers = {
      'aios_agent_execute': (params) => this._handleAgentExecute(params),
      'aios_system_status': (params) => this._handleSystemStatus(params),
      'aios_story_list': (params) => this._handleStoryList(params)
    };
    return handlers[toolName] || null;
  }

  /**
   * Handler: aios_agent_execute
   * Executes an AIOS agent with the given prompt.
   */
  async _handleAgentExecute(params) {
    const { agent, prompt, story_id, sender, channel } = params;
    const startMs = Date.now();

    if (!VALID_AGENTS.includes(agent)) {
      const err = new Error(`Agent '${agent}' not found. Valid agents: ${VALID_AGENTS.join(', ')}`);
      err.code = 'AGENT_NOT_FOUND';
      throw err;
    }

    if (!prompt || prompt.trim().length === 0) {
      const err = new Error('Prompt cannot be empty');
      err.code = 'INVALID_PROMPT';
      throw err;
    }

    // In Phase 1, agent execution returns a structured acknowledgment.
    // Full execution (spawning Claude Code agent sessions) is Phase 2.
    const response = `[AIOS Federation] Agent @${agent} received task via MCP. ` +
      `Channel: ${channel || 'api'}. ` +
      (story_id ? `Story: ${story_id}. ` : '') +
      (sender ? `From: ${sender}. ` : '') +
      `Prompt: "${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}"`;

    return {
      success: true,
      agent,
      response,
      story_id: story_id || undefined,
      timestamp: new Date().toISOString(),
      execution_ms: Date.now() - startMs
    };
  }

  /**
   * Handler: aios_system_status
   * Returns current AIOS system status.
   */
  async _handleSystemStatus(params) {
    const { include_agents = true, include_stories = true, include_health = false } = params;

    const result = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: this._loader.getMetadata().version
    };

    if (include_agents) {
      result.agents = VALID_AGENTS.map(name => ({
        name,
        available: true
      }));
    }

    if (include_stories) {
      result.active_stories = this._getActiveStories();
    }

    if (include_health) {
      result.health = {
        uptime_seconds: Math.floor((Date.now() - this._startTime) / 1000),
        memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
      };
    }

    return result;
  }

  /**
   * Handler: aios_story_list
   * Lists development stories from the stories directory.
   */
  async _handleStoryList(params) {
    const { status = 'all', limit = 10 } = params;

    const storiesDir = path.join(this._projectRoot, 'docs', 'stories', 'active');
    let stories = [];

    if (fs.existsSync(storiesDir)) {
      const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.story.md'));

      for (const file of files) {
        const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');
        const storyData = this._parseStoryMetadata(content, file);
        if (storyData) {
          if (status === 'all' || storyData.status === status) {
            stories.push(storyData);
          }
        }
      }
    }

    stories = stories.slice(0, limit);

    return {
      stories,
      total: stories.length
    };
  }

  /**
   * Parse minimal metadata from a story markdown file.
   * @private
   */
  _parseStoryMetadata(content, filename) {
    const titleMatch = content.match(/^# Story[:\s]+(\S+)\s*[—-]\s*(.+)$/m);
    const statusMatch = content.match(/\*\*Current:\*\*\s*(.+)$/m);
    const leadMatch = content.match(/\*\*Lead:\*\*\s*(.+)$/m) ||
      content.match(/\*\*Executor\*\*\s*\|\s*(@\w+)/m);

    if (!titleMatch) return null;

    return {
      id: titleMatch[1],
      title: titleMatch[2].trim(),
      status: statusMatch ? statusMatch[1].trim() : 'Unknown',
      lead: leadMatch ? (leadMatch[1] || leadMatch[2] || '').trim() : undefined,
      path: `docs/stories/active/${filename}`
    };
  }

  /**
   * Get active stories from the filesystem.
   * @private
   */
  _getActiveStories() {
    const storiesDir = path.join(this._projectRoot, 'docs', 'stories', 'active');

    if (!fs.existsSync(storiesDir)) return [];

    const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.story.md'));

    return files.slice(0, 5).map(file => {
      const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');
      const meta = this._parseStoryMetadata(content, file);
      return meta ? { id: meta.id, title: meta.title, status: meta.status } : null;
    }).filter(Boolean);
  }
}

module.exports = { AiosMcpServer };
