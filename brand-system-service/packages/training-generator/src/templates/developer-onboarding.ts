import { wrapLayout, loomSection } from './shared';
import type { LoomPlaceholder } from '../types';

/**
 * Generates the Developer Onboarding Guide HTML document.
 * Covers: token package import, CSS custom properties,
 * Tailwind config integration, and token update requests.
 */
export function renderDeveloperOnboardingGuide(
  clientName: string,
  clientId: string,
  primaryColor: string,
  brandTokensPackage: string,
  loom: LoomPlaceholder
): string {
  const body = `
  <div class="header">
    <h1>Design System Onboarding for Developers</h1>
    <p>How to integrate the ${clientName} design tokens into your development workflow.</p>
  </div>

  <h2>1. Installing the Token Package</h2>
  <div class="section">
    <p>The brand tokens are distributed as an npm package:</p>
    <pre><code>npm install ${brandTokensPackage}</code></pre>
    <p>This package contains:</p>
    <ul>
      <li>CSS custom properties file (<code>tokens.css</code>)</li>
      <li>JavaScript/TypeScript token constants</li>
      <li>Tailwind CSS theme configuration</li>
      <li>SCSS variables (if applicable)</li>
    </ul>
  </div>

  <h2>2. CSS Custom Properties Reference</h2>
  <div class="section">
    <p>Import the token CSS file in your project's entry point:</p>
    <pre><code>/* In your main CSS file or entry point */
@import '${brandTokensPackage}/tokens.css';</code></pre>
    <p>Available custom properties:</p>
    <pre><code>/* Colors */
var(--color-primary)       /* Primary brand color */
var(--color-secondary)     /* Secondary color */
var(--color-accent)        /* Accent color */
var(--color-text)          /* Default text color */
var(--color-bg)            /* Background color */

/* Typography */
var(--font-heading)        /* Heading font family */
var(--font-body)           /* Body font family */
var(--font-size-base)      /* Base font size (16px) */

/* Spacing */
var(--spacing-xs)          /* 0.5rem */
var(--spacing-sm)          /* 1rem */
var(--spacing-md)          /* 1.5rem */
var(--spacing-lg)          /* 2rem */
var(--spacing-xl)          /* 3rem */

/* Breakpoints */
var(--breakpoint-sm)       /* 375px (mobile) */
var(--breakpoint-md)       /* 768px (tablet) */
var(--breakpoint-lg)       /* 1440px (desktop) */</code></pre>
  </div>

  <h2>3. Tailwind CSS Integration</h2>
  <div class="section">
    <p>Extend your <code>tailwind.config.js</code> with the brand tokens:</p>
    <pre><code>// tailwind.config.js
const brandTokens = require('${brandTokensPackage}/tailwind');

module.exports = {
  theme: {
    extend: {
      colors: brandTokens.colors,
      fontFamily: brandTokens.fontFamily,
      spacing: brandTokens.spacing,
    },
  },
};</code></pre>
    <p>Then use brand tokens in your Tailwind classes:</p>
    <pre><code>&lt;button class="bg-primary text-white font-heading"&gt;
  Get Started
&lt;/button&gt;</code></pre>
  </div>

  <h2>4. Requesting Token Updates</h2>
  <div class="section">
    <p>If the brand tokens need to be updated (new colors, fonts, spacing):</p>
    <ol>
      <li>Create a request specifying the exact changes needed (e.g., "change primary color from #3B82F6 to #2563EB").</li>
      <li>Submit via the project's ClickUp task board or email the brand team.</li>
      <li>The brand team will update the token source, regenerate the package, and publish a new version.</li>
      <li>Update your dependency: <code>npm update ${brandTokensPackage}</code></li>
    </ol>
    <p><strong>Important:</strong> Never hardcode color values or override token variables. All brand values should come from the token package so they can be updated centrally.</p>
  </div>

  <h2>5. Troubleshooting</h2>
  <div class="section">
    <ul>
      <li><strong>Tokens not applying:</strong> Ensure the CSS import is at the top of your stylesheet, before any component styles.</li>
      <li><strong>Tailwind not picking up tokens:</strong> Restart the Tailwind JIT compiler after updating <code>tailwind.config.js</code>.</li>
      <li><strong>Font not loading:</strong> The token package includes font references but may require the font files to be served. Check the package README for font setup instructions.</li>
      <li><strong>Version conflicts:</strong> Run <code>npm ls ${brandTokensPackage}</code> to check for duplicate installations.</li>
    </ul>
  </div>

  ${loomSection(loom.title, loom.duration, loom.outline, loom.url)}`;

  return wrapLayout('Developer Onboarding Guide', clientName, primaryColor, body);
}
