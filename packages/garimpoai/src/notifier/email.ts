// Email notification sender using Nodemailer

import nodemailer from 'nodemailer';
import { EmailConfig } from '../types/config';

export class EmailNotifier {
  private transporter: nodemailer.Transporter;
  private from: string;
  private to: string;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
    this.from = config.from;
    this.to = config.to;
  }

  /** Send an HTML email */
  async send(subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: this.to,
      subject: `[GarimpoAI] ${subject}`,
      html,
    });
  }

  /** Verify SMTP connection */
  async test(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
