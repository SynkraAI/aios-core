#!/usr/bin/env node
/**
 * gemini-image-forge — Playwright runner for gemini.google.com
 *
 * Modes:
 *   --mode preflight  Run 1 item to validate selectors + login
 *   --mode full       Run full batch (reads state for resume)
 *   --mode resume     Resume from state file
 *   --mode dry        Dry-run (no browser, just show plan)
 *
 * Filters:
 *   --only d1,d3,p5        Only these IDs
 *   --category diagrama    Only this category
 *   --force                Overwrite existing files
 *   --debug                Headed browser + verbose logs
 *
 * Required:
 *   --prompts <path>   Path to prompts.json
 *   --output <path>    Output directory for images
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const readline = require('node:readline');

// Lazy import playwright (only when not in --mode dry)
let chromium;

// -------------------- CLI parsing --------------------

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.prompts || !args.output) {
  printHelp();
  process.exit(args.help ? 0 : 1);
}

const MODE = args.mode || 'preflight';
const PROMPTS_PATH = path.resolve(args.prompts);
const OUTPUT_DIR = path.resolve(args.output);
const ONLY_IDS = args.only ? args.only.split(',').map((s) => s.trim()) : null;
const ONLY_CATEGORY = args.category || null;
const FORCE = !!args.force;
const DEBUG = !!args.debug;

const STATE_PATH = path.join(OUTPUT_DIR, '.forge-state.json');
const PROFILE_DIR = path.join(os.homedir(), '.gemini-image-forge', 'chrome-profile');

const GEMINI_URL = 'https://gemini.google.com/app';

// Logger (declared before main IIFE because referenced inside)
const log = {
  info: (msg) => console.log(`\x1b[36m[info]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[ok]\x1b[0m ${msg}`),
  warn: (msg) => console.log(`\x1b[33m[warn]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[err]\x1b[0m ${msg}`),
  debug: (msg) => {
    if (DEBUG) console.log(`\x1b[90m[dbg]\x1b[0m ${msg}`);
  },
};

// -------------------- Main --------------------

(async () => {
  banner();

  // Load prompts
  const prompts = loadPrompts(PROMPTS_PATH);
  log.info(`Loaded ${prompts.items.length} prompts from ${PROMPTS_PATH}`);

  // Filter
  let items = prompts.items.slice();
  if (ONLY_IDS) {
    items = items.filter((it) => ONLY_IDS.includes(it.id));
    log.info(`Filtered by IDs: ${items.length} items`);
  }
  if (ONLY_CATEGORY) {
    items = items.filter((it) => it.category === ONLY_CATEGORY);
    log.info(`Filtered by category "${ONLY_CATEGORY}": ${items.length} items`);
  }
  if (MODE === 'preflight') {
    items = items.slice(0, 1);
    log.info('Pre-flight mode: only first item');
  }

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load or init state
  const state = loadOrInitState(STATE_PATH, prompts, OUTPUT_DIR);

  // Skip already-done items unless --force
  if (!FORCE) {
    const beforeCount = items.length;
    items = items.filter((it) => {
      const filePath = path.join(OUTPUT_DIR, it.filename);
      if (fs.existsSync(filePath)) {
        log.warn(`Skip ${it.id} — file exists (${it.filename})`);
        updateItemState(state, it.id, 'done', { reason: 'already_exists' });
        return false;
      }
      const stateItem = state.items.find((s) => s.id === it.id);
      if (stateItem && stateItem.status === 'done') {
        log.warn(`Skip ${it.id} — state=done`);
        return false;
      }
      return true;
    });
    if (beforeCount !== items.length) {
      saveState(STATE_PATH, state);
    }
  }

  if (items.length === 0) {
    log.success('Nothing to generate — all items already done. Use --force to regenerate.');
    printReport(state);
    process.exit(0);
  }

  // Dry run
  if (MODE === 'dry') {
    log.info('DRY RUN — no browser will be launched');
    console.log('');
    console.log('Plan:');
    items.forEach((it, i) => {
      console.log(`  [${i + 1}/${items.length}] ${it.id} → ${it.filename} (${it.aspectRatio || '—'})`);
    });
    console.log('');
    console.log(`Output dir: ${OUTPUT_DIR}`);
    console.log(`State file: ${STATE_PATH}`);
    console.log(`Profile:    ${PROFILE_DIR}`);
    process.exit(0);
  }

  // Import Playwright
  try {
    chromium = require('playwright').chromium;
  } catch (err) {
    log.error('Playwright not installed. Run: npm install playwright');
    log.error(`Details: ${err.message}`);
    process.exit(1);
  }

  // Ensure profile dir exists
  fs.mkdirSync(PROFILE_DIR, { recursive: true });

  // Launch browser
  log.info(`Launching Chrome (profile: ${PROFILE_DIR})`);
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, // Gemini Web requires real browser
    viewport: { width: 1440, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  const page = context.pages()[0] || (await context.newPage());

  try {
    // Navigate to Gemini
    log.info(`Navigating to ${GEMINI_URL}`);
    await page.goto(GEMINI_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);

    // Check login (polling — no TTY required)
    let loggedIn = await checkLoggedIn(page);
    if (!loggedIn) {
      log.warn('Not logged in. Please log in manually in the Chrome window that just opened.');
      log.warn('Script will poll every 3s and continue automatically once login is detected.');
      log.warn('(Max wait: 5 minutes)');

      const loginDeadline = Date.now() + 5 * 60 * 1000;
      while (Date.now() < loginDeadline) {
        await sleep(3000);
        loggedIn = await checkLoggedIn(page);
        if (loggedIn) break;
        log.debug('Still waiting for login...');
      }

      if (!loggedIn) {
        log.error('Login not detected after 5 minutes. Aborting.');
        await context.close();
        process.exit(1);
      }
    }
    log.success('Logged in to Gemini');

    // Main loop
    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const label = `[${i + 1}/${items.length}] ${item.id}`;

      process.stdout.write(`${label} ${item.filename.padEnd(40)} `);

      updateItemState(state, item.id, 'generating', {});
      saveState(STATE_PATH, state);

      const startTime = Date.now();

      try {
        const result = await generateOne(page, item, OUTPUT_DIR);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (result.ok) {
          success++;
          console.log(`\x1b[32m✓\x1b[0m ${elapsed}s`);
          updateItemState(state, item.id, 'done', {
            filepath: result.filepath,
            elapsed: elapsed,
            generated_at: new Date().toISOString(),
          });
        } else {
          failed++;
          console.log(`\x1b[31m✗\x1b[0m ${result.reason}`);
          updateItemState(state, item.id, 'failed', {
            reason: result.reason,
            elapsed: elapsed,
          });
        }
      } catch (err) {
        failed++;
        console.log(`\x1b[31m✗\x1b[0m exception: ${err.message}`);
        updateItemState(state, item.id, 'failed', { reason: `exception: ${err.message}` });
        if (DEBUG) console.error(err);
      }

      saveState(STATE_PATH, state);

      // Human-like delay (skip after last item)
      if (i < items.length - 1) {
        const delay = 15000 + Math.random() * 15000;
        log.debug(`Waiting ${(delay / 1000).toFixed(1)}s before next image...`);
        await sleep(delay);
      }
    }

    console.log('');
    log.success(`Batch complete: ${success} done, ${failed} failed, ${skipped} skipped`);
    printReport(state);

    if (process.platform === 'darwin') {
      try {
        require('node:child_process').exec(`open "${OUTPUT_DIR}"`);
      } catch {
        // ignore
      }
    }
  } catch (err) {
    log.error(`Fatal error: ${err.message}`);
    if (DEBUG) console.error(err);
  } finally {
    if (!DEBUG) {
      await context.close();
    } else {
      log.warn('DEBUG mode — leaving browser open. Close it manually.');
    }
  }
})().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

// -------------------- Gemini Web interaction --------------------

async function checkLoggedIn(page) {
  // Guard 1: URL must be on gemini.google.com/app (not accounts.google.com login flow)
  const url = page.url();
  if (!url.includes('gemini.google.com')) {
    return false;
  }
  if (url.includes('accounts.google.com') || url.includes('signin') || url.includes('ServiceLogin')) {
    return false;
  }

  // Guard 2: Gemini-specific selectors only (rich-textarea is a Gemini custom element)
  const selectors = [
    'rich-textarea [contenteditable="true"]',
    'rich-textarea textarea',
    'textarea[aria-label*="Prompt" i]',
    '[aria-label*="Enter a prompt" i]',
    '[aria-label*="Pergunte ao Gemini" i]',
  ];

  for (const sel of selectors) {
    try {
      const el = await page.waitForSelector(sel, { timeout: 2000, state: 'visible' });
      if (el) {
        // Guard 3: element must be inside a rich-textarea ancestor OR have gemini-specific aria-label
        const isReal = await el.evaluate((node) => {
          const ariaLabel = node.getAttribute('aria-label') || '';
          if (/prompt|gemini|pergunte/i.test(ariaLabel)) return true;
          let parent = node.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            if (parent.tagName && parent.tagName.toLowerCase() === 'rich-textarea') return true;
            parent = parent.parentElement;
          }
          return false;
        }).catch(() => false);
        if (isReal) return true;
      }
    } catch {
      // try next
    }
  }
  return false;
}

async function generateOne(page, item, outputDir) {
  const finalPath = path.join(outputDir, item.filename);

  // Register response interceptor BEFORE sending prompt.
  // Captures any image/* response larger than 20KB (filters out icons/avatars).
  const capturedImages = [];
  const responseHandler = async (response) => {
    try {
      const url = response.url();
      const ct = (response.headers()['content-type'] || '').toLowerCase();
      if (!ct.startsWith('image/')) return;
      // Skip Google static assets (logos, avatars, UI icons)
      if (/gstatic\.com|googlelogo|avatar|profile_photo|\/logo/i.test(url)) return;
      const buf = await response.body();
      if (buf && buf.length > 20000) {
        capturedImages.push({ url, contentType: ct, buf, size: buf.length, ts: Date.now() });
        log.debug(`Intercepted ${ct} ${(buf.length / 1024).toFixed(0)}KB from ${url.slice(0, 80)}`);
      }
    } catch {
      // non-fatal
    }
  };
  page.on('response', responseHandler);

  // 1. Find prompt input
  const inputSelectors = [
    'rich-textarea [contenteditable="true"]',
    'rich-textarea textarea',
    '[role="textbox"][contenteditable="true"]',
    'textarea[aria-label*="Prompt" i]',
  ];

  let input = null;
  for (const sel of inputSelectors) {
    try {
      input = await page.waitForSelector(sel, { timeout: 5000, state: 'visible' });
      if (input) break;
    } catch {
      // try next
    }
  }

  if (!input) {
    return { ok: false, reason: 'input_not_found' };
  }

  // 2. Clear and type prompt
  // IMPORTANT: flatten newlines to spaces — in Gemini Web, Enter submits the message,
  // so any \n in the prompt would cause premature submission mid-typing.
  const flatPrompt = item.prompt.replace(/\s*\n+\s*/g, ' ').trim();
  const finalPrompt = `Generate an image. ${flatPrompt}`;

  await input.click();
  await sleep(300);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await sleep(500);

  // Use evaluate + input event to set content directly — faster, avoids keystroke issues
  const setOk = await input.evaluate((el, text) => {
    try {
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      // contenteditable path
      el.focus();
      el.innerText = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      return true;
    } catch (err) {
      return false;
    }
  }, finalPrompt).catch(() => false);

  // Fallback: type character by character (skipping any newlines)
  if (!setOk) {
    log.debug('Direct set failed, falling back to type()');
    await input.type(finalPrompt, { delay: 8 });
  }

  await sleep(1500);

  // 3. Press Enter (single Enter — prompt has no internal newlines now)
  await page.keyboard.press('Enter');

  // 4. Wait for image to appear
  log.debug('Waiting for image generation...');

  let imageEl = null;
  const deadline = Date.now() + 180000; // 180s max wait (Imagen can be slow)

  while (Date.now() < deadline) {
    // Check for safety filter first
    const safetyText = await page.locator('text=/can.*t help|policy|safety|not able to|unable to generate|cannot create/i').first().isVisible().catch(() => false);
    if (safetyText) {
      return { ok: false, reason: 'safety_filter' };
    }

    // Generic query: any large img that isn't an avatar/icon (width > 300)
    try {
      imageEl = await page.evaluateHandle(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        for (const img of imgs) {
          if (!img.isConnected) continue;
          if (img.width < 300 || img.naturalWidth < 300) continue;
          const src = img.src || '';
          // Filter out avatars, google logos, icons
          if (/\/avatar|\/logo|googlelogo|profile_photo/i.test(src)) continue;
          // Must be either base64, blob, or googleusercontent with image content
          if (src.startsWith('data:image') || src.startsWith('blob:') || /googleusercontent|lh3\.google/.test(src)) {
            return img;
          }
        }
        return null;
      });

      const exists = imageEl && await imageEl.evaluate((n) => n !== null).catch(() => false);
      if (exists) break;
      imageEl = null;
    } catch {
      // keep trying
    }

    await sleep(2000);
  }

  if (!imageEl) {
    return { ok: false, reason: 'timeout_waiting_image' };
  }

  await sleep(3000); // let image fully load and any HTTP requests settle

  // 5. Download strategy: prefer the biggest intercepted image from network
  page.off('response', responseHandler);

  let saved = false;

  if (capturedImages.length > 0) {
    // Pick the biggest captured image (real Gemini image, not thumbnails/icons)
    const best = capturedImages.sort((a, b) => b.size - a.size)[0];
    log.debug(`Using intercepted image: ${(best.size / 1024).toFixed(0)}KB (${best.contentType})`);
    try {
      fs.writeFileSync(finalPath, best.buf);
      saved = true;
    } catch (err) {
      log.debug(`Write intercepted failed: ${err.message}`);
    }
  }

  // Fallback 1: try fetch inside page
  if (!saved) {
    const src = await imageEl.evaluate((img) => img.src).catch(() => null);
    if (src) {
      log.debug(`Fallback fetch: ${src.slice(0, 60)}...`);
      if (src.startsWith('data:image')) {
        const match = src.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          fs.writeFileSync(finalPath, Buffer.from(match[2], 'base64'));
          saved = true;
        }
      } else {
        try {
          const buffer = await page.evaluate(async (url) => {
            const res = await fetch(url);
            const blob = await res.blob();
            const ab = await blob.arrayBuffer();
            return Array.from(new Uint8Array(ab));
          }, src);
          if (buffer && buffer.length > 0) {
            fs.writeFileSync(finalPath, Buffer.from(buffer));
            saved = true;
          }
        } catch (err) {
          log.debug(`fetch failed: ${err.message}`);
        }
      }
    }
  }

  // Fallback 2: screenshot the image element (low-res but better than nothing)
  if (!saved) {
    try {
      const box = await imageEl.evaluate((img) => {
        const r = img.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      if (box && box.width > 0 && box.height > 0) {
        await page.screenshot({ path: finalPath, clip: box });
        saved = true;
        log.warn('Saved via screenshot fallback — LOW RES. Check image quality.');
      }
    } catch (err) {
      return { ok: false, reason: `download_failed: ${err.message}` };
    }
  }

  // 7. Clear chat for next prompt (new chat)
  try {
    const newChatBtn = await page.$('[aria-label*="New chat" i], [aria-label*="Nova conversa" i], button:has-text("New chat")');
    if (newChatBtn) {
      await newChatBtn.click();
      await sleep(1500);
    }
  } catch {
    // non-fatal — new chat is nice-to-have
  }

  return { ok: true, filepath: finalPath };
}

// -------------------- State management --------------------

function loadOrInitState(statePath, prompts, outputDir) {
  if (fs.existsSync(statePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      log.info(`Loaded state: ${state.items.filter((i) => i.status === 'done').length}/${state.items.length} done`);
      return state;
    } catch (err) {
      log.warn(`State file corrupted, reinitializing: ${err.message}`);
    }
  }

  const state = {
    project: prompts.meta && prompts.meta.project ? prompts.meta.project : 'unknown',
    prompts_file: PROMPTS_PATH,
    output_dir: outputDir,
    started_at: new Date().toISOString(),
    total: prompts.items.length,
    items: prompts.items.map((it) => ({
      id: it.id,
      filename: it.filename,
      category: it.category,
      status: 'pending',
    })),
  };
  saveState(statePath, state);
  return state;
}

function updateItemState(state, id, status, extra) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  item.status = status;
  Object.assign(item, extra || {});
}

function saveState(statePath, state) {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function printReport(state) {
  const done = state.items.filter((i) => i.status === 'done').length;
  const failed = state.items.filter((i) => i.status === 'failed').length;
  const pending = state.items.filter((i) => i.status === 'pending').length;

  console.log('');
  console.log('┌─ Report ──────────────────────────────');
  console.log(`│ 🟢 Done:    ${done}`);
  console.log(`│ 🔴 Failed:  ${failed}`);
  console.log(`│ 🟡 Pending: ${pending}`);
  console.log(`│ 📁 ${state.output_dir}`);
  console.log('└───────────────────────────────────────');

  if (failed > 0) {
    console.log('');
    console.log('Failed items:');
    state.items
      .filter((i) => i.status === 'failed')
      .forEach((i) => console.log(`  ${i.id} ${i.filename} — ${i.reason || 'unknown'}`));
  }
}

// -------------------- Utilities --------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

function printHelp() {
  console.log(`
gemini-image-forge — Batch image generation via Gemini Web

Usage:
  node batch-generate.cjs --prompts <path> --output <path> [options]

Required:
  --prompts <path>      Path to prompts.json
  --output <path>       Output directory

Options:
  --mode <mode>         preflight|full|resume|dry (default: preflight)
  --only <ids>          Only generate these IDs (comma-separated)
  --category <name>     Only this category
  --force               Overwrite existing files
  --debug               Headed browser + verbose logs
  --help                Show this help

Examples:
  # First run — pre-flight
  node batch-generate.cjs --prompts ./prompts.json --output ./imagens --mode preflight

  # Full batch
  node batch-generate.cjs --prompts ./prompts.json --output ./imagens --mode full

  # Regenerate specific IDs
  node batch-generate.cjs --prompts ./prompts.json --output ./imagens --only d1,d3 --force
`);
}

function loadPrompts(file) {
  if (!fs.existsSync(file)) {
    log.error(`Prompts file not found: ${file}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.items || !Array.isArray(data.items)) {
    log.error('Invalid prompts.json — must have "items" array');
    process.exit(1);
  }
  return data;
}

function banner() {
  console.log('');
  console.log('\x1b[33m╔══════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[33m║\x1b[0m  \x1b[36mGEMINI IMAGE FORGE\x1b[0m                  \x1b[33m║\x1b[0m');
  console.log('\x1b[33m║\x1b[0m  Batch image gen via Gemini Web      \x1b[33m║\x1b[0m');
  console.log('\x1b[33m╚══════════════════════════════════════╝\x1b[0m');
  console.log('');
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Press ENTER to continue... ', () => {
      rl.close();
      resolve();
    });
  });
}
