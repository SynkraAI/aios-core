/**
 * Email Sender for automated client setup (BSS-7.9, AC 7).
 *
 * Sends team notification emails with setup details including R2 paths,
 * hosting URLs, and token file locations. Never throws on failure --
 * returns a safe result object instead.
 *
 * @module onboarding/setup/email-sender
 */

import type { SetupEmailClient, TokenFilePaths } from './setup-types';

/** Parameters for sending a setup notification email. */
export interface SetupNotificationParams {
  readonly to: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly hostingUrl?: string;
  readonly tokenPaths: TokenFilePaths;
  readonly clickUpProjectUrl?: string;
}

/** Result of an email send attempt. */
export interface EmailSendResult {
  readonly sent: boolean;
  readonly error?: string;
}

/** Default sender email address. */
const DEFAULT_FROM_EMAIL = 'noreply@brand-system.com';

/**
 * Sends setup notification emails to the team.
 *
 * Wraps the injected email client with error handling that never throws.
 * On failure, returns `{ sent: false, error }` so the pipeline can
 * continue without crashing.
 */
export class SetupEmailSender {
  private readonly _emailClient: SetupEmailClient;
  private readonly _fromEmail: string;

  /**
   * Create a new SetupEmailSender.
   *
   * @param config - Email client and optional sender address.
   */
  constructor(config: { emailClient: SetupEmailClient; fromEmail?: string }) {
    this._emailClient = config.emailClient;
    this._fromEmail = config.fromEmail ?? DEFAULT_FROM_EMAIL;
  }

  /**
   * Send a setup completion notification email.
   *
   * Builds an HTML email with R2 folder paths, hosting URL (if configured),
   * ClickUp project link, and token file locations.
   *
   * @param params - Notification parameters.
   * @returns Result indicating success or failure with error details.
   */
  async sendSetupNotification(params: SetupNotificationParams): Promise<EmailSendResult> {
    try {
      const html = this._buildEmailHtml(params);

      await this._emailClient.sendEmail({
        to: params.to,
        subject: `Brand Setup Complete: ${params.clientName} (${params.clientId})`,
        html,
        from: this._fromEmail,
      });

      return { sent: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { sent: false, error: errorMessage };
    }
  }

  /**
   * Build the HTML email body.
   *
   * @param params - Notification parameters.
   * @returns The HTML string for the email body.
   */
  private _buildEmailHtml(params: SetupNotificationParams): string {
    const sections: string[] = [
      '<h2>Brand Setup Complete</h2>',
      `<p>Client <strong>${params.clientName}</strong> (${params.clientId}) has been set up successfully.</p>`,
      '<h3>R2 Storage</h3>',
      `<p>Brand assets folder: <code>brand-assets/${params.clientId}/</code></p>`,
      '<h3>Token Files</h3>',
      '<ul>',
      `<li>Primitive: <code>${params.tokenPaths.primitive}</code></li>`,
      `<li>Semantic: <code>${params.tokenPaths.semantic}</code></li>`,
      `<li>Component: <code>${params.tokenPaths.component}</code></li>`,
      '</ul>',
    ];

    if (params.hostingUrl) {
      sections.push(
        '<h3>Hosting</h3>',
        `<p>Live URL: <a href="${params.hostingUrl}">${params.hostingUrl}</a></p>`,
      );
    }

    if (params.clickUpProjectUrl) {
      sections.push(
        '<h3>Project Management</h3>',
        `<p>ClickUp: <a href="${params.clickUpProjectUrl}">${params.clickUpProjectUrl}</a></p>`,
      );
    }

    return sections.join('\n');
  }
}
