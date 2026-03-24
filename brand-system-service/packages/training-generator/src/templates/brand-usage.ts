import { wrapLayout, loomSection } from './shared';
import type { LoomPlaceholder } from '../types';

/**
 * Generates the Brand Usage Training HTML document.
 * Covers: brand book usage, color/typography rules, logo guidelines,
 * tone of voice, and quick-reference card.
 */
export function renderBrandUsageGuide(
  clientName: string,
  primaryColor: string,
  loom: LoomPlaceholder
): string {
  const body = `
  <div class="header">
    <h1>Brand Usage Training</h1>
    <p>A comprehensive guide to using the ${clientName} brand system correctly and consistently.</p>
  </div>

  <h2>1. Using the Brand Book</h2>
  <div class="section">
    <p>Your brand book is available in three formats:</p>
    <ul>
      <li><strong>Online:</strong> Access the interactive web version via the shared URL. This is always the most up-to-date version.</li>
      <li><strong>PDF:</strong> Download the PDF for offline reference or printing. Check the version date to ensure you have the latest.</li>
      <li><strong>Local Package:</strong> For developers, the local package (<code>.zip</code>) contains all assets and can be served locally.</li>
    </ul>
    <p>Always reference the brand book before creating new materials to ensure consistency.</p>
  </div>

  <h2>2. Color &amp; Typography Rules</h2>
  <div class="section">
    <h3>Colors</h3>
    <ul>
      <li>Use <strong>only</strong> the colors defined in the brand palette. Never use off-brand colors.</li>
      <li>The primary color is used for headings, CTAs, and accent elements.</li>
      <li>Ensure all text-on-background combinations meet WCAG AA contrast (4.5:1 minimum).</li>
      <li>Color values are available as CSS custom properties: <code>var(--color-primary)</code>, <code>var(--color-secondary)</code>, etc.</li>
    </ul>
    <h3>Typography</h3>
    <ul>
      <li>Use the approved typefaces only. Never substitute with similar-looking fonts.</li>
      <li>Follow the type scale hierarchy: headings use the heading font at defined sizes.</li>
      <li>Body text should be 16px minimum for readability.</li>
      <li>Line height should be 1.5-1.7 for body text.</li>
    </ul>
  </div>

  <h2>3. Logo Usage &amp; Clear Space</h2>
  <div class="section">
    <ul>
      <li>Minimum clear space around the logo equals the height of the logo mark.</li>
      <li>Never stretch, rotate, recolor, or add effects to the logo.</li>
      <li>Use the appropriate logo variant for each context (full color, monochrome, reversed).</li>
      <li>Minimum size: 24px height for digital, 10mm for print.</li>
    </ul>
  </div>

  <h2>4. Tone of Voice</h2>
  <div class="section">
    <ul>
      <li>Brand voice should be consistent across all channels: website, social, email, print.</li>
      <li>Refer to the tone attributes in the brand book for guidance on messaging.</li>
      <li>When in doubt, aim for clarity and authenticity over cleverness.</li>
      <li>Avoid jargon unless your audience expects it.</li>
    </ul>
  </div>

  <h2>5. Quick-Reference Card</h2>
  <div class="section">
    <p>A one-page summary of the most important brand rules:</p>
    <ul>
      <li><strong>Primary color:</strong> Use for headings, buttons, and key accents</li>
      <li><strong>Logo:</strong> Always maintain clear space; never modify</li>
      <li><strong>Typography:</strong> Use approved typefaces; follow the scale</li>
      <li><strong>Voice:</strong> Be consistent, clear, and on-brand</li>
      <li><strong>Assets:</strong> Always use the latest versions from the brand book</li>
    </ul>
  </div>

  ${loomSection(loom.title, loom.duration, loom.outline, loom.url)}`;

  return wrapLayout('Brand Usage Training', clientName, primaryColor, body);
}
