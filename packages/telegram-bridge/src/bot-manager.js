import { Bot } from 'grammy';
import { EventEmitter } from 'node:events';

/**
 * BotManager — Creates and manages grammY bot instances for multi-bot Telegram bridge.
 * Auth middleware restricts all bots to a single owner (Lucas).
 */
export class BotManager extends EventEmitter {
  /** @param {object} config - Parsed bots.yaml */
  /** @param {number} ownerId - Telegram user ID of the owner */
  constructor(config, ownerId, logger) {
    super();
    this.config = config;
    this.ownerId = ownerId;
    this.logger = logger;
    /** @type {Map<string, { bot: Bot, config: object }>} agentId -> { bot, config } */
    this.bots = new Map();
    /** @type {Map<string, number>} agentId -> chatId */
    this.chatIds = new Map();
    this._commandQueue = null;
    this._healthProvider = null;
    this._trackProvider = null;
    this._digestFlushProvider = null;
    this._agentsProvider = null;
    this._startTime = Date.now();
  }

  setCommandQueue(queue) {
    this._commandQueue = queue;
  }

  setHealthProvider(provider) {
    this._healthProvider = provider;
  }

  setTrackProvider(provider) {
    this._trackProvider = provider;
  }

  setDigestFlushProvider(provider) {
    this._digestFlushProvider = provider;
  }

  setAgentsProvider(provider) {
    this._agentsProvider = provider;
  }

  async initialize() {
    for (const [key, botConfig] of Object.entries(this.config.bots)) {
      const token = process.env[botConfig.token_env];
      if (!token) {
        this.logger.warn(`No token for bot ${key} (${botConfig.token_env}), skipping`);
        continue;
      }

      const bot = new Bot(token);

      // Auth middleware: only accept messages from owner
      bot.use(async (ctx, next) => {
        if (ctx.from?.id !== this.ownerId) {
          await ctx.reply('Unauthorized. This bot is private.');
          return;
        }
        await next();
      });

      // /start — register chat ID
      bot.command('start', async (ctx) => {
        this.chatIds.set(botConfig.agent_id, ctx.chat.id);
        this.logger.info({ agent: botConfig.agent_id, chatId: ctx.chat.id }, 'Chat ID registered');
        await ctx.reply(
          `Connected to AIOS agent: @${botConfig.agent_id}\n` +
          `Mode: ${botConfig.mode}\n` +
          `Ready to ${botConfig.mode === 'command' ? 'receive commands' : 'broadcast updates'}.`
        );
      });

      // /ping — quick liveness check
      bot.command('ping', async (ctx) => {
        const uptime = Math.floor((Date.now() - this._startTime) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        await ctx.reply(`Pong! Uptime: ${h}h ${m}m`, { parse_mode: 'HTML' });
      });

      // /status — detailed system status
      bot.command('status', async (ctx) => {
        const activeBots = [...this.bots.keys()];
        const uptime = Math.floor((Date.now() - this._startTime) / 1000);
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const health = this._healthProvider?.() || {};
        const mem = Math.round(process.memoryUsage.rss() / 1024 / 1024);

        const lines = [
          `<b>AIOS Telegram Bridge</b>`,
          `Uptime: ${h}h ${m}m`,
          `Memory: ${mem}MB`,
          `Bots: ${activeBots.join(', ')}`,
          `Chats registered: ${this.chatIds.size}`,
        ];
        if (health.outbox) {
          lines.push(`Outbox processed: ${health.outbox.processedCount}`);
          lines.push(`Outbox failed: ${health.outbox.failedCount}`);
          lines.push(`Watcher active: ${health.outbox.watcherActive ? 'yes' : 'NO'}`);
        }
        if (health.daemon) {
          lines.push(`Daemon: ${health.daemon.state || 'unknown'}`);
        }
        await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
      });

      // /help — available commands
      bot.command('help', async (ctx) => {
        const commands = botConfig.mode === 'command'
          ? '/start - Initialize connection\n/ping - Quick liveness check\n/status - Detailed system status\n/agents - Session daemon and agent info\n/track - Command lifecycle status\n/digest - Summary mode (less noise)\n/verbose - Full mode + suppressed log\n/help - This message\n/queue - Show pending commands\n/cancel - Cancel current operation\n\nSend any text to execute as AIOS command.'
          : '/start - Initialize connection\n/ping - Quick liveness check\n/status - System status\n/help - This message\n\nThis bot is in observe mode. Send text to relay to the agent.';
        await ctx.reply(`<b>@${botConfig.agent_id} Commands</b>\n\n${commands}`, { parse_mode: 'HTML' });
      });

      // /queue — show pending commands
      bot.command('queue', async (ctx) => {
        const size = this._commandQueue?.size ?? 0;
        await ctx.reply(size > 0 ? `${size} command(s) in queue.` : 'Queue is empty.');
      });

      // /track — command lifecycle tracking
      bot.command('track', async (ctx) => {
        if (!this._trackProvider) {
          await ctx.reply('Tracking not available.');
          return;
        }
        const status = await this._trackProvider();
        await ctx.reply(status, { parse_mode: 'HTML' });
      });

      // /agents — daemon session info and agent context
      bot.command('agents', async (ctx) => {
        if (!this._agentsProvider) {
          await ctx.reply('Agent info not available.');
          return;
        }
        const info = await this._agentsProvider();
        await ctx.reply(info, { parse_mode: 'HTML' });
      });

      // /digest — switch to summary-only mode
      bot.command('digest', async (ctx) => {
        this.emit('set_digest', true);
        await ctx.reply('Digest mode ON. Only agent_switch, error, and final messages will be delivered.\nUse /verbose to see full log.');
      });

      // /verbose — switch back to full streaming mode + dump suppressed
      bot.command('verbose', async (ctx) => {
        this.emit('set_digest', false);
        const suppressed = this._digestFlushProvider?.() || [];
        if (suppressed.length > 0) {
          const summary = suppressed.slice(-20).map(m => `[${m.type}] ${m.formatted.slice(0, 80)}`).join('\n');
          await ctx.reply(`Verbose mode ON. ${suppressed.length} suppressed messages:\n<pre>${summary}</pre>`, { parse_mode: 'HTML' });
        } else {
          await ctx.reply('Verbose mode ON. No suppressed messages.');
        }
      });

      // /cancel — cancel current operation
      bot.command('cancel', async (ctx) => {
        this.emit('cancel_command', { agent: botConfig.agent_id });
        await ctx.reply('Cancel requested.');
      });

      // Text messages → emit for InboxWriter
      bot.on('message:text', async (ctx) => {
        const text = ctx.message.text;
        this.logger.info({ agent: botConfig.agent_id, text: text.slice(0, 100) }, 'User message received');

        // Store chatId on first message too
        if (!this.chatIds.has(botConfig.agent_id)) {
          this.chatIds.set(botConfig.agent_id, ctx.chat.id);
        }

        this.emit('user_message', {
          text,
          agentId: botConfig.agent_id,
          chatId: ctx.chat.id,
          senderId: String(ctx.from.id),
          messageId: String(ctx.message.message_id),
        });
      });

      this.bots.set(botConfig.agent_id, { bot, config: botConfig });
      this.logger.info({ agent: botConfig.agent_id, username: botConfig.username }, 'Bot created');
    }
  }

  async startPolling() {
    const starts = [];
    for (const [agentId, { bot }] of this.bots) {
      starts.push(
        bot.start({
          onStart: () => this.logger.info({ agent: agentId }, 'Bot polling started'),
        })
      );
    }
    // bot.start() blocks, so we don't await all — they run concurrently
  }

  /**
   * Send a message to a specific agent's bot chat.
   * @param {string} agentId
   * @param {string} message
   * @param {object} [options]
   */
  async sendToAgent(agentId, message, options = {}) {
    const botKey = this.config.agent_to_bot_map[agentId] || 'master';
    const entry = this._findBotByMapKey(botKey);

    const resolvedAgentId = entry?.config?.agent_id || 'aios-master';
    const chatId = this.chatIds.get(resolvedAgentId) || this.chatIds.get('aios-master');

    if (!chatId || !entry) {
      this.logger.warn({ agentId, botKey }, 'No chat ID or bot for agent, message dropped');
      return false;
    }

    try {
      await entry.bot.api.sendMessage(chatId, message, {
        parse_mode: options.parseMode || 'HTML',
        disable_notification: options.silent || false,
      });
      return true;
    } catch (err) {
      // Fallback to plain text if HTML parsing fails
      if (err?.error_code === 400) {
        this.logger.warn({ agentId }, 'HTML parse failed, retrying as plain text');
        try {
          await entry.bot.api.sendMessage(chatId, message, {
            disable_notification: options.silent || false,
          });
          return true;
        } catch (retryErr) {
          this.logger.error({ agentId, err: retryErr.message }, 'Plain text fallback also failed');
          return false;
        }
      }
      this.logger.error({ agentId, err: err.message }, 'Failed to send message');
      return false;
    }
  }

  _findBotByMapKey(mapKey) {
    // mapKey is the value from agent_to_bot_map (e.g. "master", "dev")
    // Find the bot entry whose key in bots config matches
    const botConfig = this.config.bots[mapKey];
    if (!botConfig) return null;
    return this.bots.get(botConfig.agent_id) || null;
  }

  async stopAll() {
    for (const [agentId, { bot }] of this.bots) {
      try {
        await bot.stop();
        this.logger.info({ agent: agentId }, 'Bot stopped');
      } catch (err) {
        this.logger.warn({ agent: agentId, err: err.message }, 'Error stopping bot');
      }
    }
  }
}
