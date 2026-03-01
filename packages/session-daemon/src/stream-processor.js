import { EventEmitter } from 'events';

/**
 * StreamProcessor — Parses SDK message stream from SessionAdapter.
 *
 * Consumes AsyncGenerator<SDKMessage> and classifies each message into:
 * - progress (text output from assistant)
 * - agent_switch (detected @agent pattern in content)
 * - tool_use (tool invocation)
 * - error (SDK or execution error)
 * - final (result/completion)
 *
 * Writes classified messages to outbox via OutboxWriter.
 * Emits events for HealthMonitor and other consumers.
 */
export class StreamProcessor extends EventEmitter {
  /**
   * @param {object} opts
   * @param {import('./outbox-writer.js').OutboxWriter} opts.outboxWriter
   * @param {object} opts.logger
   * @param {number} opts.progressThrottleMs - Min interval between progress messages
   * @param {number} opts.toolSummaryMaxLen - Max chars for tool input summary
   */
  constructor({ outboxWriter, logger, progressThrottleMs = 3000, toolSummaryMaxLen = 200 }) {
    super();
    this.outbox = outboxWriter;
    this.logger = logger || console;
    this.progressThrottleMs = progressThrottleMs;
    this.toolSummaryMaxLen = toolSummaryMaxLen;

    /** @type {string} Current agent (heuristic tracking) */
    this.currentAgent = 'aios-master';
    this.lastProgressAt = 0;
    this.messageCount = 0;
  }

  /**
   * Process the full SDK message stream for a command.
   *
   * @param {AsyncGenerator<object>} stream - SDK message stream from SessionAdapter
   * @param {object} context - Command context
   * @param {string} context.commandId - Original inbox message ID
   * @param {string} context.channel - Reply channel
   * @param {object} [context.target] - Reply target
   * @returns {Promise<{ success: boolean, messageCount: number, finalText: string|null }>}
   */
  async process(stream, context) {
    const { commandId, channel, target } = context;
    this.messageCount = 0;
    this.lastProgressAt = 0;
    let finalText = null;
    let hasResult = false;
    let success = false;

    try {
      for await (const msg of stream) {
        this.messageCount++;
        this.emit('message', msg);

        switch (msg.type) {
          case 'system':
            this.handleSystem(msg, context);
            break;

          case 'assistant':
            finalText = this.handleAssistant(msg, context);
            break;

          case 'result':
            hasResult = true;
            finalText = this.handleResult(msg, context);
            success = msg.subtype !== 'error';
            break;

          case 'error':
            this.handleError(msg, context);
            hasResult = true;
            success = false;
            break;

          default:
            this.logger.debug({ type: msg.type, subtype: msg.subtype }, 'Unhandled SDK message type');
        }
      }

      // If no explicit result message, consider stream completion as success
      if (!hasResult && this.messageCount > 0) {
        success = true;
      }

      return { success, messageCount: this.messageCount, finalText };
    } catch (err) {
      this.logger.error({ err, commandId }, 'Stream processing error');
      this.outbox.writeError({
        inReplyTo: commandId,
        channel,
        target,
        message: `Stream error: ${err.message}`,
        agent: this.currentAgent,
      });
      // Use 'stream_error' to avoid EventEmitter's default 'error' throw behavior
      this.emit('stream_error', err);
      return { success: false, messageCount: this.messageCount, finalText: null };
    }
  }

  /** Handle system messages (init, session info) */
  handleSystem(msg, context) {
    if (msg.subtype === 'init') {
      this.emit('session_init', { sessionId: msg.session_id });
      this.logger.info({ sessionId: msg.session_id }, 'Session initialized');
    }
  }

  /** Handle assistant messages (text, tool_use) */
  handleAssistant(msg, context) {
    const { commandId, channel, target } = context;
    let lastText = null;

    // Assistant messages can have content array or direct content
    const content = msg.message?.content || msg.content;
    if (!content) return null;

    const contentBlocks = Array.isArray(content) ? content : [content];

    for (const block of contentBlocks) {
      if (block.type === 'text' && block.text) {
        lastText = block.text;

        // Detect agent switches
        const agentSwitch = this.detectAgentSwitch(block.text);
        if (agentSwitch) {
          const fromAgent = this.currentAgent;
          this.currentAgent = agentSwitch;
          this.outbox.writeAgentSwitch({
            inReplyTo: commandId,
            channel,
            target,
            fromAgent,
            toAgent: agentSwitch,
          });
          this.emit('agent_switch', { from: fromAgent, to: agentSwitch });
        }

        // Throttled progress updates
        this.maybeWriteProgress(block.text, context);
      }

      if (block.type === 'tool_use') {
        const summary = this.summarizeToolInput(block.name, block.input);
        this.outbox.writeToolUse({
          inReplyTo: commandId,
          channel,
          target,
          agent: this.currentAgent,
          tool: block.name,
          summary,
        });
        this.emit('tool_use', { tool: block.name, agent: this.currentAgent });
      }
    }

    return lastText;
  }

  /** Handle result messages (success or error) */
  handleResult(msg, context) {
    const { commandId, channel, target } = context;

    if (msg.subtype === 'error') {
      const errorMsg = msg.error?.message || msg.result || 'Unknown error';
      this.outbox.writeError({
        inReplyTo: commandId,
        channel,
        target,
        message: errorMsg,
        agent: this.currentAgent,
      });
      this.emit('result_error', { error: errorMsg });
      return null;
    }

    // Success result
    const resultText = typeof msg.result === 'string' ? msg.result : JSON.stringify(msg.result);
    this.outbox.writeFinal({
      inReplyTo: commandId,
      channel,
      target,
      message: resultText,
      agent: this.currentAgent,
    });
    this.emit('result_success', { text: resultText });
    return resultText;
  }

  /** Handle error messages from SDK */
  handleError(msg, context) {
    const { commandId, channel, target } = context;
    const errorMsg = msg.error?.message || msg.message || 'SDK error';
    this.outbox.writeError({
      inReplyTo: commandId,
      channel,
      target,
      message: errorMsg,
      agent: this.currentAgent,
    });
    this.emit('sdk_error', { error: errorMsg });
  }

  /**
   * Detect agent switch from text content.
   * Heuristic: look for @agent patterns and known agent greeting patterns.
   *
   * @param {string} text
   * @returns {string|null} Agent name or null
   */
  detectAgentSwitch(text) {
    // Pattern 1: Explicit @agent activation
    const agentMatch = text.match(/@(dev|qa|architect|pm|po|sm|analyst|data-engineer|ux-design-expert|devops|aios-master)\b/i);
    if (agentMatch) {
      const agent = agentMatch[1].toLowerCase();
      if (agent !== this.currentAgent) {
        return agent;
      }
    }

    // Pattern 2: Agent persona greeting patterns (e.g., "I'm Dex, the Dev agent")
    const personaMap = {
      dex: 'dev',
      quinn: 'qa',
      aria: 'architect',
      morgan: 'pm',
      pax: 'po',
      river: 'sm',
      alex: 'analyst',
      dara: 'data-engineer',
      uma: 'ux-design-expert',
      gage: 'devops',
    };

    for (const [persona, agent] of Object.entries(personaMap)) {
      if (text.toLowerCase().includes(`i'm ${persona}`) || text.toLowerCase().includes(`i am ${persona}`)) {
        if (agent !== this.currentAgent) {
          return agent;
        }
      }
    }

    return null;
  }

  /**
   * Write a throttled progress update.
   * Only writes if enough time has passed since last progress.
   */
  maybeWriteProgress(text, context) {
    const now = Date.now();
    if (now - this.lastProgressAt < this.progressThrottleMs) return;

    // Truncate long text for progress
    const truncated = text.length > 500 ? text.slice(0, 497) + '...' : text;

    this.outbox.writeProgress({
      inReplyTo: context.commandId,
      channel: context.channel,
      target: context.target,
      message: truncated,
      agent: this.currentAgent,
    });
    this.lastProgressAt = now;
  }

  /**
   * Summarize tool input for readability.
   * @param {string} toolName
   * @param {object} input
   * @returns {string}
   */
  summarizeToolInput(toolName, input) {
    if (!input) return `Using ${toolName}`;

    // Tool-specific summaries
    switch (toolName) {
      case 'Read':
        return `Reading ${input.file_path || 'file'}`;
      case 'Write':
        return `Writing ${input.file_path || 'file'}`;
      case 'Edit':
        return `Editing ${input.file_path || 'file'}`;
      case 'Bash':
        return `Running: ${(input.command || '').slice(0, 100)}`;
      case 'Grep':
        return `Searching for "${input.pattern}" in ${input.path || 'cwd'}`;
      case 'Glob':
        return `Finding files: ${input.pattern}`;
      case 'Task':
        return `Launching ${input.subagent_type || 'agent'}: ${(input.description || '').slice(0, 80)}`;
      case 'WebSearch':
        return `Searching web: ${(input.query || '').slice(0, 100)}`;
      case 'WebFetch':
        return `Fetching: ${(input.url || '').slice(0, 100)}`;
      default: {
        const str = JSON.stringify(input);
        return str.length > this.toolSummaryMaxLen
          ? `${toolName}: ${str.slice(0, this.toolSummaryMaxLen)}...`
          : `${toolName}: ${str}`;
      }
    }
  }

  /** Reset state for a new command */
  reset() {
    this.currentAgent = 'aios-master';
    this.lastProgressAt = 0;
    this.messageCount = 0;
  }
}
