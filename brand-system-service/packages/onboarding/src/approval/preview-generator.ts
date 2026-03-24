/**
 * Preview Generator (BSS-7.8).
 *
 * Generates a self-contained static HTML preview page for client review.
 * The HTML uses only inline CSS and relative paths -- no absolute URLs,
 * no external dependencies, and no server requirements (CON-22).
 *
 * @module onboarding/approval/preview-generator
 */

import type { ApprovalR2Client, ClientPreviewData } from './approval-types';
import { buildClientPreviewR2Key, PREVIEW_DISCLAIMER } from './approval-types';

// ---------------------------------------------------------------------------
// PreviewGenerator
// ---------------------------------------------------------------------------

/**
 * Generates self-contained static HTML preview pages for client brand review.
 */
export class PreviewGenerator {
  private readonly r2Client: ApprovalR2Client;

  constructor(r2Client: ApprovalR2Client) {
    this.r2Client = r2Client;
  }

  /**
   * Generate a static HTML string from the approved direction data.
   *
   * The generated HTML is fully self-contained with inline CSS.
   * It does not reference any external stylesheets, scripts, or absolute URLs.
   *
   * @param data - All brand direction data needed for the preview.
   * @returns The complete HTML document as a string.
   */
  generatePreview(data: ClientPreviewData): string {
    const colorSwatches = this.renderColorSwatches(data);
    const typographySection = this.renderTypography(data);
    const moodboardGrid = this.renderMoodboard(data);
    const voiceSection = this.renderVoice(data);
    const tokenPreview = this.renderTokenPreview(data);
    const disclaimerSection = this.renderDisclaimer();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brand Direction Preview - ${this.escapeHtml(data.clientId)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #fafafa; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #111; }
    h2 { font-size: 22px; margin-top: 40px; margin-bottom: 16px; color: #222; border-bottom: 2px solid #eee; padding-bottom: 8px; }
    h3 { font-size: 16px; margin-top: 16px; margin-bottom: 8px; color: #444; }
    .subtitle { color: #666; margin-bottom: 32px; }
    .swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .swatch { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
    .swatch-color { height: 80px; }
    .swatch-info { padding: 8px 12px; background: #fff; }
    .swatch-role { font-weight: 600; font-size: 13px; text-transform: capitalize; }
    .swatch-hex { font-family: monospace; font-size: 12px; color: #666; }
    .type-sample { margin-bottom: 16px; padding: 16px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .type-label { font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 4px; }
    .moodboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .moodboard-img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; background: #e0e0e0; }
    .voice-scales { margin-bottom: 16px; }
    .scale-row { display: flex; align-items: center; margin-bottom: 8px; padding: 8px 12px; background: #fff; border-radius: 6px; }
    .scale-label { width: 100px; font-size: 13px; color: #666; flex-shrink: 0; }
    .scale-bar { flex: 1; height: 8px; background: #e8e8e8; border-radius: 4px; position: relative; margin: 0 12px; }
    .scale-marker { width: 16px; height: 16px; background: #333; border-radius: 50%; position: absolute; top: -4px; }
    .scale-poles { display: flex; justify-content: space-between; font-size: 11px; color: #999; width: 100%; }
    .vocab-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .vocab-tag { padding: 4px 10px; border-radius: 12px; font-size: 13px; }
    .vocab-use { background: #e8f5e9; color: #2e7d32; }
    .vocab-avoid { background: #ffebee; color: #c62828; }
    .guideline { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .token-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .token-card { padding: 12px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .token-name { font-size: 12px; color: #999; font-family: monospace; margin-bottom: 4px; }
    .token-value { font-size: 14px; font-weight: 600; }
    .token-swatch { width: 100%; height: 32px; border-radius: 4px; margin-bottom: 8px; }
    .disclaimer { margin-top: 48px; padding: 16px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800; font-size: 13px; color: #6d4c00; }
    .reviewer-notes { margin-top: 24px; padding: 16px; background: #e3f2fd; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Brand Direction Preview</h1>
    <p class="subtitle">Client: ${this.escapeHtml(data.clientId)}</p>

${colorSwatches}
${typographySection}
${moodboardGrid}
${voiceSection}
${tokenPreview}
${data.reviewerNotes ? `    <div class="reviewer-notes"><strong>Reviewer Notes:</strong> ${this.escapeHtml(data.reviewerNotes)}</div>` : ''}
${disclaimerSection}
  </div>
</body>
</html>`;
  }

  /**
   * Generate the preview HTML and upload it to R2.
   *
   * @param clientId - The client identifier.
   * @param data - All brand direction data needed for the preview.
   * @returns The R2 key where the HTML was stored.
   */
  async generateAndStore(clientId: string, data: ClientPreviewData): Promise<string> {
    const html = this.generatePreview(data);
    const r2Key = buildClientPreviewR2Key(clientId);
    const buffer = Buffer.from(html, 'utf-8');
    await this.r2Client.uploadFile(r2Key, buffer, 'text/html');
    return r2Key;
  }

  // ---------------------------------------------------------------------------
  // Private Render Methods
  // ---------------------------------------------------------------------------

  /** Render color palette swatches section. */
  private renderColorSwatches(data: ClientPreviewData): string {
    const swatches = data.colorPalette.colors
      .map(
        (c) => `      <div class="swatch">
        <div class="swatch-color" style="background-color: ${this.escapeHtml(c.color.hex)};"></div>
        <div class="swatch-info">
          <div class="swatch-role">${this.escapeHtml(c.role)}</div>
          <div class="swatch-hex">${this.escapeHtml(c.color.hex)}</div>
        </div>
      </div>`
      )
      .join('\n');

    return `    <h2>Color Palette</h2>
    <div class="swatch-grid">
${swatches}
    </div>`;
  }

  /** Render typography samples section. */
  private renderTypography(data: ClientPreviewData): string {
    const headingFamily = this.escapeHtml(data.typography.heading.family);
    const bodyFamily = this.escapeHtml(data.typography.body.family);
    const headingWeight = data.typography.heading.weight;
    const bodyWeight = data.typography.body.weight;

    return `    <h2>Typography</h2>
    <div class="type-sample">
      <div class="type-label">Heading Font</div>
      <div style="font-family: '${headingFamily}', sans-serif; font-weight: ${headingWeight}; font-size: 32px;">
        ${headingFamily}
      </div>
      <div style="font-family: '${headingFamily}', sans-serif; font-weight: ${headingWeight}; font-size: 24px; margin-top: 8px;">
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
    <div class="type-sample">
      <div class="type-label">Body Font</div>
      <div style="font-family: '${bodyFamily}', sans-serif; font-weight: ${bodyWeight}; font-size: 24px;">
        ${bodyFamily}
      </div>
      <div style="font-family: '${bodyFamily}', sans-serif; font-weight: ${bodyWeight}; font-size: 16px; margin-top: 8px;">
        The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
      </div>
    </div>`;
  }

  /** Render moodboard image grid section. */
  private renderMoodboard(data: ClientPreviewData): string {
    if (data.moodboardApprovedKeys.length === 0) {
      return `    <h2>Moodboard</h2>
    <p>No moodboard images approved.</p>`;
    }

    const images = data.moodboardApprovedKeys
      .map(
        (key) =>
          `      <img class="moodboard-img" src="${this.escapeHtml(key)}" alt="Moodboard image" />`
      )
      .join('\n');

    return `    <h2>Moodboard</h2>
    <div class="moodboard-grid">
${images}
    </div>`;
  }

  /** Render brand voice summary section. */
  private renderVoice(data: ClientPreviewData): string {
    const scales = data.voiceDefinition.toneScales
      .map((s) => {
        const pct = ((s.position - 1) / 4) * 100;
        return `      <div class="scale-row">
        <div class="scale-label">${this.escapeHtml(s.dimension)}</div>
        <div style="flex: 1;">
          <div class="scale-bar">
            <div class="scale-marker" style="left: calc(${pct}% - 8px);"></div>
          </div>
          <div class="scale-poles">
            <span>${this.escapeHtml(s.leftPole)}</span>
            <span>${this.escapeHtml(s.rightPole)}</span>
          </div>
        </div>
      </div>`;
      })
      .join('\n');

    const useWords = data.voiceDefinition.vocabularyGuide.useWords
      .map((w) => `<span class="vocab-tag vocab-use">${this.escapeHtml(w)}</span>`)
      .join('');

    const avoidWords = data.voiceDefinition.vocabularyGuide.avoidWords
      .map((w) => `<span class="vocab-tag vocab-avoid">${this.escapeHtml(w)}</span>`)
      .join('');

    const guidelines = data.voiceDefinition.communicationGuidelines
      .map((g) => `      <div class="guideline">${this.escapeHtml(g)}</div>`)
      .join('\n');

    return `    <h2>Brand Voice</h2>
    <h3>Tone Scales</h3>
    <div class="voice-scales">
${scales}
    </div>
    <h3>Vocabulary</h3>
    <p style="font-size: 13px; color: #666; margin-bottom: 6px;">Use:</p>
    <div class="vocab-list">${useWords}</div>
    <p style="font-size: 13px; color: #666; margin-bottom: 6px;">Avoid:</p>
    <div class="vocab-list">${avoidWords}</div>
    <h3>Communication Guidelines</h3>
${guidelines}`;
  }

  /** Render token preview section with color and typography tokens. */
  private renderTokenPreview(data: ClientPreviewData): string {
    const colorTokens = this.flattenTokenGroup(data.tokens.color, 'color');
    const typographyTokens = this.flattenTokenGroup(data.tokens.typography, 'typography');

    const colorCards = colorTokens
      .map(
        (t) => `      <div class="token-card">
        <div class="token-swatch" style="background-color: ${this.escapeHtml(String(t.value))};"></div>
        <div class="token-name">${this.escapeHtml(t.name)}</div>
        <div class="token-value">${this.escapeHtml(String(t.value))}</div>
      </div>`
      )
      .join('\n');

    const typoCards = typographyTokens
      .map(
        (t) => `      <div class="token-card">
        <div class="token-name">${this.escapeHtml(t.name)}</div>
        <div class="token-value" style="font-family: '${this.escapeHtml(String(t.value))}', sans-serif;">
          ${this.escapeHtml(String(t.value))}
        </div>
      </div>`
      )
      .join('\n');

    return `    <h2>Design Tokens</h2>
    <h3>Color Tokens</h3>
    <div class="token-grid">
${colorCards}
    </div>
    <h3>Typography Tokens</h3>
    <div class="token-grid">
${typoCards}
    </div>`;
  }

  /** Render footer disclaimer. */
  private renderDisclaimer(): string {
    return `    <div class="disclaimer">${this.escapeHtml(PREVIEW_DISCLAIMER)}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  /**
   * Flatten a DTCG token group into name-value pairs for rendering.
   * Only processes one level of nesting.
   */
  private flattenTokenGroup(
    group: Record<string, unknown>,
    _prefix: string
  ): Array<{ name: string; value: string | number }> {
    const result: Array<{ name: string; value: string | number }> = [];

    for (const [key, entry] of Object.entries(group)) {
      if (entry && typeof entry === 'object' && '$value' in entry) {
        const token = entry as { $value: string | number };
        result.push({ name: key, value: token.$value });
      }
    }

    return result;
  }

  /** Escape HTML special characters to prevent XSS. */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
