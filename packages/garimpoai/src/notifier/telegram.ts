// Telegram Bot notification sender

import TelegramBot from 'node-telegram-bot-api';
import { TelegramConfig } from '../types/config';

export class TelegramNotifier {
  private bot: TelegramBot;
  private chatId: string;

  constructor(config: TelegramConfig) {
    // Polling disabled — we only send, not receive
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.chatId = config.chatId;
  }

  /** Send a markdown-formatted message */
  async send(message: string): Promise<void> {
    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    });
  }

  /** Send a plain text message (fallback) */
  async sendPlain(message: string): Promise<void> {
    await this.bot.sendMessage(this.chatId, message);
  }

  /** Check if the bot can reach the chat */
  async test(): Promise<boolean> {
    try {
      await this.bot.getChat(this.chatId);
      return true;
    } catch {
      return false;
    }
  }
}
