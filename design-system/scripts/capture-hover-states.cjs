#!/usr/bin/env node
/**
 * Hover State Screenshot Capturer
 *
 * Captures before/after screenshots of interactive elements (buttons, links, cards)
 * showing their default state vs :hover state.
 *
 * Usage:
 *   node capture-hover-states.cjs <url> --name <name> --output <dir>
 *
 * Output:
 *   {output}/states/
 *   ├── hover-report.json        # Summary of all captured states
 *   ├── btn-0-default.png        # Button 0 default state
 *   ├── btn-0-hover.png          # Button 0 hover state
 *   ├── link-0-default.png       # Link 0 default state
 *   ├── link-0-hover.png         # Link 0 hover state
 *   └── ...
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Parse args
const args = process.argv.slice(2);
let target = null;
let name = 'states';
let outputDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' || args[i] === '-n') name = args[++i];
  else if (args[i] === '--output' || args[i] === '-o') outputDir = args[++i];
  else if (!args[i].startsWith('-') && !target) target = args[i];
}

if (!target) {
  console.error('Usage: node capture-hover-states.cjs <url> --name <name> --output <dir>');
  process.exit(1);
}

if (!outputDir) outputDir = path.join(process.cwd(), 'design-system', 'patterns', 'tokens', name, 'states');

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto(target, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log(`Warning: ${e.message}`);
    try {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    } catch (e2) {
      console.error(`Failed to load ${target}`);
      await browser.close();
      process.exit(1);
    }
  }

  const report = {
    url: target,
    name: name,
    captured_at: new Date().toISOString(),
    elements: [],
  };

  // Capture buttons
  const buttons = await page.locator('button, a[class*="btn"], a[class*="button"], a[class*="cta"], [role="button"]').all();
  const maxButtons = Math.min(buttons.length, 8);

  for (let i = 0; i < maxButtons; i++) {
    try {
      const btn = buttons[i];
      const isVisible = await btn.isVisible();
      if (!isVisible) continue;

      const box = await btn.boundingBox();
      if (!box || box.width < 20 || box.height < 10) continue;

      // Scroll into view
      await btn.scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.waitForTimeout(300);

      // Get text content
      const text = (await btn.textContent() || '').trim().slice(0, 50);

      // Get default styles
      const defaultStyles = await btn.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          background: cs.backgroundColor,
          color: cs.color,
          borderColor: cs.borderColor,
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          opacity: cs.opacity,
          borderRadius: cs.borderRadius,
          textDecoration: cs.textDecoration,
        };
      });

      // Screenshot default state
      const defaultPath = path.join(outputDir, `btn-${i}-default.png`);
      await btn.screenshot({ path: defaultPath });

      // Hover
      await btn.hover();
      await page.waitForTimeout(400);

      // Get hover styles
      const hoverStyles = await btn.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          background: cs.backgroundColor,
          color: cs.color,
          borderColor: cs.borderColor,
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          opacity: cs.opacity,
          borderRadius: cs.borderRadius,
          textDecoration: cs.textDecoration,
        };
      });

      // Screenshot hover state
      const hoverPath = path.join(outputDir, `btn-${i}-hover.png`);
      await btn.screenshot({ path: hoverPath });

      // Calculate diffs
      const diffs = {};
      for (const [key, val] of Object.entries(hoverStyles)) {
        if (val !== defaultStyles[key]) {
          diffs[key] = { from: defaultStyles[key], to: val };
        }
      }

      // Move mouse away to reset
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);

      report.elements.push({
        type: 'button',
        index: i,
        text,
        tag: await btn.evaluate((el) => el.tagName.toLowerCase()),
        classes: await btn.evaluate((el) => [...el.classList].join(' ')),
        defaultStyles,
        hoverStyles,
        diffs,
        hasVisualChange: Object.keys(diffs).length > 0,
        screenshots: {
          default: `btn-${i}-default.png`,
          hover: `btn-${i}-hover.png`,
        },
      });

      console.log(`  btn-${i}: "${text}" — ${Object.keys(diffs).length} changes on hover`);
    } catch (e) {
      // Skip elements that can't be interacted with
    }
  }

  // Capture nav links
  const navLinks = await page.locator('nav a, header a').all();
  const maxLinks = Math.min(navLinks.length, 5);

  for (let i = 0; i < maxLinks; i++) {
    try {
      const link = navLinks[i];
      const isVisible = await link.isVisible();
      if (!isVisible) continue;

      const box = await link.boundingBox();
      if (!box || box.width < 10 || box.height < 10) continue;

      const text = (await link.textContent() || '').trim().slice(0, 50);
      if (!text) continue;

      const defaultStyles = await link.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          color: cs.color,
          textDecoration: cs.textDecoration,
          opacity: cs.opacity,
          transform: cs.transform,
        };
      });

      const defaultPath = path.join(outputDir, `link-${i}-default.png`);
      await link.screenshot({ path: defaultPath });

      await link.hover();
      await page.waitForTimeout(300);

      const hoverStyles = await link.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          color: cs.color,
          textDecoration: cs.textDecoration,
          opacity: cs.opacity,
          transform: cs.transform,
        };
      });

      const hoverPath = path.join(outputDir, `link-${i}-hover.png`);
      await link.screenshot({ path: hoverPath });

      const diffs = {};
      for (const [key, val] of Object.entries(hoverStyles)) {
        if (val !== defaultStyles[key]) {
          diffs[key] = { from: defaultStyles[key], to: val };
        }
      }

      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);

      report.elements.push({
        type: 'nav-link',
        index: i,
        text,
        defaultStyles,
        hoverStyles,
        diffs,
        hasVisualChange: Object.keys(diffs).length > 0,
        screenshots: {
          default: `link-${i}-default.png`,
          hover: `link-${i}-hover.png`,
        },
      });

      console.log(`  link-${i}: "${text}" — ${Object.keys(diffs).length} changes on hover`);
    } catch (e) {
      // Skip
    }
  }

  // Capture cards (if any)
  const cards = await page.locator('[class*="card"], [class*="Card"], article').all();
  const maxCards = Math.min(cards.length, 3);

  for (let i = 0; i < maxCards; i++) {
    try {
      const card = cards[i];
      const isVisible = await card.isVisible();
      if (!isVisible) continue;

      const box = await card.boundingBox();
      if (!box || box.width < 100 || box.height < 50) continue;

      await card.scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.waitForTimeout(300);

      const defaultStyles = await card.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          borderColor: cs.borderColor,
          background: cs.backgroundColor,
        };
      });

      const defaultPath = path.join(outputDir, `card-${i}-default.png`);
      await card.screenshot({ path: defaultPath });

      await card.hover();
      await page.waitForTimeout(400);

      const hoverStyles = await card.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          boxShadow: cs.boxShadow,
          transform: cs.transform,
          borderColor: cs.borderColor,
          background: cs.backgroundColor,
        };
      });

      const hoverPath = path.join(outputDir, `card-${i}-hover.png`);
      await card.screenshot({ path: hoverPath });

      const diffs = {};
      for (const [key, val] of Object.entries(hoverStyles)) {
        if (val !== defaultStyles[key]) {
          diffs[key] = { from: defaultStyles[key], to: val };
        }
      }

      await page.mouse.move(0, 0);

      report.elements.push({
        type: 'card',
        index: i,
        defaultStyles,
        hoverStyles,
        diffs,
        hasVisualChange: Object.keys(diffs).length > 0,
        screenshots: {
          default: `card-${i}-default.png`,
          hover: `card-${i}-hover.png`,
        },
      });

      console.log(`  card-${i}: ${Object.keys(diffs).length} changes on hover`);
    } catch (e) {
      // Skip
    }
  }

  // Write report
  const reportPath = path.join(outputDir, 'hover-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const totalWithChanges = report.elements.filter((e) => e.hasVisualChange).length;
  console.log(`\n  Total: ${report.elements.length} elements, ${totalWithChanges} with hover changes`);
  console.log(`  Report: ${reportPath}`);

  await browser.close();
}

main().catch(console.error);
