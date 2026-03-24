import { wrapLayout, loomSection } from './shared';
import type { LoomPlaceholder } from '../types';

/**
 * Generates the Static Site Update Guide HTML document.
 * Covers: editing HTML content, updating images, R2 upload,
 * and self-service vs developer escalation.
 */
export function renderStaticSiteUpdateGuide(
  clientName: string,
  primaryColor: string,
  loom: LoomPlaceholder
): string {
  const body = `
  <div class="header">
    <h1>Static Site Update Guide</h1>
    <p>How to update text and images on your ${clientName} static website without developer assistance.</p>
  </div>

  <h2>1. Updating Text Content</h2>
  <div class="section">
    <p>Your website is built from static HTML files. To update text:</p>
    <ol>
      <li>Open the HTML file in any text editor (VS Code, Notepad++, or even Notepad).</li>
      <li>Find the text you want to change — use <code>Ctrl+F</code> to search.</li>
      <li>Edit the text between the HTML tags. For example:</li>
    </ol>
    <pre><code>&lt;h2&gt;Old Heading Text&lt;/h2&gt;
&lt;!-- Change to: --&gt;
&lt;h2&gt;New Heading Text&lt;/h2&gt;</code></pre>
    <p><strong>Important:</strong> Do not modify HTML tags (<code>&lt;div&gt;</code>, <code>&lt;section&gt;</code>, etc.) or CSS classes. Only change the visible text content.</p>
  </div>

  <h2>2. Updating Images</h2>
  <div class="section">
    <h3>Naming Convention</h3>
    <p>Images must follow the naming convention:</p>
    <pre><code>{client-id}-{asset-type}-{variant}-{size}.{ext}</code></pre>
    <p>Example: <code>acme-hero-desktop-1440.jpg</code></p>

    <h3>Replacement Steps</h3>
    <ol>
      <li>Prepare the new image at the <strong>exact same dimensions</strong> as the original.</li>
      <li>Name the file using the same filename as the one you're replacing.</li>
      <li>Upload to the R2 bucket at the correct path (see section 3).</li>
      <li>If using a local package, replace the file in the <code>assets/images/</code> folder.</li>
    </ol>
  </div>

  <h2>3. R2 Upload Path</h2>
  <div class="section">
    <p>Assets are stored in Cloudflare R2 at:</p>
    <pre><code>r2://brand-assets/{client-id}/site/images/</code></pre>
    <p>Upload new images to this path. The signed URL for your site will automatically serve the updated asset.</p>
  </div>

  <h2>4. Self-Service vs. Developer Escalation</h2>
  <div class="section">
    <h3>You Can Do (Self-Service)</h3>
    <ul>
      <li>Change text content (headings, paragraphs, button labels)</li>
      <li>Replace images with same-dimension alternatives</li>
      <li>Update contact information (phone, email, address)</li>
      <li>Fix typos and update dates</li>
    </ul>

    <h3>Escalate to Developer</h3>
    <ul>
      <li>Add or remove entire sections or pages</li>
      <li>Change the layout or page structure</li>
      <li>Add new features (forms, animations, integrations)</li>
      <li>Modify the navigation menu structure</li>
      <li>Update brand tokens or color scheme</li>
    </ul>
  </div>

  ${loomSection(loom.title, loom.duration, loom.outline, loom.url)}`;

  return wrapLayout('Static Site Update Guide', clientName, primaryColor, body);
}
