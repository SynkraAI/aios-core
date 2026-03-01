/**
 * MessageFormatter — Formats outbox messages for Telegram HTML.
 * Handles tool icons, truncation, code blocks, and credential redaction.
 * Uses HTML parse_mode for reliable formatting (no Markdown escaping issues).
 */

const TOOL_ICONS = {
  Bash: '[&gt;_]',
  Read: '[R]',
  Edit: '[E]',
  Write: '[W]',
  Grep: '[?]',
  Glob: '[*]',
  Task: '[T]',
  WebSearch: '[S]',
  WebFetch: '[F]',
};

const MAX_LENGTH = 4000; // Telegram max is 4096, leave margin

// Patterns that look like credentials/tokens in context
const CREDENTIAL_PATTERN = /(?:token|key|secret|password|credential|auth)[=: ]+["']?([A-Za-z0-9_\-:]{20,})["']?/gi;

export class MessageFormatter {
  /**
   * Format an outbox message for Telegram display (HTML).
   * @param {object} message - Outbox message object
   * @returns {string|null} Formatted text or null if nothing to send
   */
  format(message) {
    const { content } = message;
    if (!content) return null;

    switch (content.type) {
      case 'ack':
        return this._formatAck(content);
      case 'progress':
        return this._formatProgress(content);
      case 'agent_switch':
        return this._formatAgentSwitch(content);
      case 'tool_use':
        return this._formatToolUse(content);
      case 'error':
        return this._formatError(content);
      case 'final':
        return this._formatFinal(content);
      default:
        return this._truncate(this._escapeHtml(content.message || `[${content.type}]`));
    }
  }

  _formatAck(content) {
    return `Command received, processing...`;
  }

  _formatProgress(content) {
    const agent = content.agent ? `<b>@${this._escapeHtml(content.agent)}</b>: ` : '';
    return this._truncate(`${agent}${this._redact(this._escapeHtml(content.message))}`);
  }

  _formatAgentSwitch(content) {
    const agent = content.agent || 'unknown';
    const msg = content.message || '';
    return `Agent switch: <b>@${this._escapeHtml(agent)}</b>\n${this._truncate(this._redact(this._escapeHtml(msg)))}`;
  }

  _formatToolUse(content) {
    const tool = content.tool || 'unknown';
    const icon = TOOL_ICONS[tool] || `[${this._escapeHtml(tool)}]`;
    const msg = this._redact(content.message || '');
    const formatted = msg.includes('\n')
      ? `${icon} <b>${this._escapeHtml(tool)}</b>\n<pre>${this._escapeHtml(msg)}</pre>`
      : `${icon} <b>${this._escapeHtml(tool)}</b>: ${this._escapeHtml(msg)}`;
    return this._truncate(formatted);
  }

  _formatError(content) {
    return this._truncate(`<b>ERROR</b>: ${this._redact(this._escapeHtml(content.message || 'Unknown error'))}`);
  }

  _formatFinal(content) {
    const agent = content.agent ? `<b>@${this._escapeHtml(content.agent)}</b>: ` : '';
    return this._truncate(`${agent}${this._redact(this._escapeHtml(content.message || 'Done.'))}`);
  }

  /**
   * Redact potential credentials from message text.
   */
  _redact(text) {
    if (!text) return '';
    return text.replace(CREDENTIAL_PATTERN, (match, value) => {
      return match.replace(value, `${value.slice(0, 4)}****`);
    });
  }

  /**
   * Escape HTML special characters for Telegram HTML parse mode.
   */
  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Truncate text to Telegram's safe limit.
   */
  _truncate(text) {
    if (!text) return '';
    if (text.length <= MAX_LENGTH) return text;
    return text.slice(0, MAX_LENGTH - 20) + '\n... (truncated)';
  }
}
