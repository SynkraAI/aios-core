#!/usr/bin/env node

/**
 * Smart Browser — AI-powered browser automation via Stagehand + OpenRouter
 *
 * Usage:
 *   node run.js --task "go to example.com and extract all links"
 *   node run.js --task "search google for 'AI tools' and extract top 5 results" --model "openai/gpt-4.1"
 *   node run.js --task "login to site.com" --headed
 *   node run.js --url "https://example.com" --extract "product names and prices"
 *   node run.js --interactive
 */

import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// ENV loader (simple, no dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// ---------------------------------------------------------------------------
// CLI args parser
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    task: null,
    url: null,
    extract: null,
    model: process.env.SMART_BROWSER_MODEL || 'openai/gpt-4o-mini',
    headed: process.env.SMART_BROWSER_HEADLESS !== 'true',
    interactive: false,
    dryRun: false,
    timeout: 120000,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--task': case '-t':
        opts.task = args[++i]; break;
      case '--url': case '-u':
        opts.url = args[++i]; break;
      case '--extract': case '-e':
        opts.extract = args[++i]; break;
      case '--model': case '-m':
        opts.model = args[++i]; break;
      case '--headed':
        opts.headed = true; break;
      case '--headless':
        opts.headed = false; break;
      case '--interactive': case '-i':
        opts.interactive = true; break;
      case '--dry-run':
        opts.dryRun = true; break;
      case '--timeout':
        opts.timeout = parseInt(args[++i], 10); break;
      case '--help': case '-h':
        printHelp(); process.exit(0);
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
Smart Browser — AI-powered browser automation

USAGE:
  node run.js --task "describe what you want"      Full autonomous agent
  node run.js --url URL --extract "what to get"    Navigate + extract
  node run.js --interactive                        Interactive mode (ask step by step)

OPTIONS:
  --task, -t      Natural language task for the agent
  --url, -u       URL to navigate to first
  --extract, -e   What to extract from the page (used with --url)
  --model, -m     OpenRouter model (default: openai/gpt-4o-mini)
  --headed        Show browser window (default)
  --headless      Hide browser window
  --interactive   Interactive mode — agent asks before each action
  --timeout       Max time in ms (default: 120000)
  --dry-run       Show config without running
  --help, -h      Show this help

EXAMPLES:
  node run.js --task "go to github.com/trending and extract the top 10 repos"
  node run.js --url "https://news.ycombinator.com" --extract "top 5 stories with title, points, and link"
  node run.js --task "search google for 'best AI tools 2026'" --model "openai/gpt-4.1"
  node run.js --interactive

ENV:
  OPENROUTER_API_KEY       Required — your OpenRouter API key
  SMART_BROWSER_MODEL      Default model (optional)
  SMART_BROWSER_HEADLESS   Set to 'true' for headless (optional)
`);
}

// ---------------------------------------------------------------------------
// Readline helper for interactive mode
// ---------------------------------------------------------------------------
function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs();

  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('\n❌ OPENAI_API_KEY not set.');
    console.error('   Copy .env.example to .env and add your key:\n');
    console.error('   cp .env.example .env');
    console.error('   # Edit .env with your OpenAI API key\n');
    process.exit(1);
  }

  // Validate task
  if (!opts.task && !opts.url && !opts.interactive) {
    console.error('\n❌ No task specified. Use --task, --url, or --interactive.\n');
    printHelp();
    process.exit(1);
  }

  // Dry run — show config and exit
  if (opts.dryRun) {
    console.log('\n🔧 Config (dry run):\n');
    console.log(`  Model:       ${opts.model}`);
    console.log(`  Headed:      ${opts.headed}`);
    console.log(`  Task:        ${opts.task || '(none)'}`);
    console.log(`  URL:         ${opts.url || '(none)'}`);
    console.log(`  Extract:     ${opts.extract || '(none)'}`);
    console.log(`  Interactive: ${opts.interactive}`);
    console.log(`  Timeout:     ${opts.timeout}ms`);
    console.log(`  API Key:     ${apiKey.slice(0, 12)}...`);
    console.log('');
    return;
  }

  console.log(`\n🧠 Smart Browser starting...`);
  console.log(`   Model: ${opts.model}`);
  console.log(`   Mode:  ${opts.headed ? 'headed (visible)' : 'headless'}\n`);

  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: 'LOCAL',
    localBrowserLaunchOptions: {
      headless: !opts.headed,
      viewport: { width: 1280, height: 720 },
    },
    apiKey: apiKey,
    model: {
      modelName: opts.model,
      apiKey: apiKey,
    },
  });

  try {
    await stagehand.init();
    const page = await stagehand.resolvePage();
    console.log('✅ Browser initialized\n');

    // Helper: navigate to URL
    async function navigateTo(url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      console.log(`📍 Navigating to ${fullUrl}...`);
      await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
    }

    // ---------------------------------------------------------------------------
    // Mode 1: Interactive — step by step with human input
    // ---------------------------------------------------------------------------
    if (opts.interactive) {
      console.log('🎯 Interactive mode — type your commands, "quit" to exit\n');

      let running = true;
      while (running) {
        const command = await ask('> What should I do? ');

        if (['quit', 'exit', 'q'].includes(command.toLowerCase())) {
          running = false;
          continue;
        }

        if (command.toLowerCase().startsWith('go to ') || command.toLowerCase().startsWith('navigate ')) {
          const url = command.replace(/^(go to |navigate )/i, '').trim();
          await navigateTo(url);
          console.log('  ✅ Done\n');
        } else if (command.toLowerCase().startsWith('extract ')) {
          const instruction = command.replace(/^extract /i, '').trim();
          console.log(`  → Extracting: ${instruction}...`);
          const result = await stagehand.extract({
            instruction: instruction,
            schema: z.object({
              data: z.array(z.record(z.string())).describe('Extracted data'),
            }),
          });
          console.log('\n📦 Result:\n');
          console.log(JSON.stringify(result, null, 2));
          console.log('');
        } else {
          console.log(`  → Acting: ${command}...`);
          try {
            await stagehand.act({ action: command });
            console.log('  ✅ Done\n');
          } catch (err) {
            console.error(`  ❌ Failed: ${err.message}`);
            const retry = await ask('  → Want me to try differently? (describe or "skip"): ');
            if (retry.toLowerCase() !== 'skip') {
              try {
                await stagehand.act({ action: retry });
                console.log('  ✅ Done\n');
              } catch (retryErr) {
                console.error(`  ❌ Still failed: ${retryErr.message}\n`);
              }
            }
          }
        }
      }
    }

    // ---------------------------------------------------------------------------
    // Mode 2: URL + Extract — navigate and extract
    // ---------------------------------------------------------------------------
    else if (opts.url && opts.extract) {
      await navigateTo(opts.url);

      console.log(`🔍 Extracting: ${opts.extract}...\n`);
      const result = await stagehand.extract({
        instruction: opts.extract,
        schema: z.object({
          data: z.array(z.record(z.string())).describe('Extracted data'),
        }),
      });

      console.log('📦 Result:\n');
      console.log(JSON.stringify(result, null, 2));
    }

    // ---------------------------------------------------------------------------
    // Mode 3: Full agent — autonomous task execution
    // ---------------------------------------------------------------------------
    else if (opts.task) {
      console.log(`🤖 Agent running: "${opts.task}"\n`);

      // If task mentions a URL, navigate first
      const urlMatch = opts.task.match(/https?:\/\/[^\s"']+/);
      if (urlMatch) {
        await navigateTo(urlMatch[0]);
      }

      const agent = stagehand.agent({
        modelName: opts.model,
      });

      const result = await agent.execute(opts.task);

      console.log('\n📦 Agent result:\n');
      console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (err.message.includes('401')) {
      console.error('   → Check your OPENROUTER_API_KEY');
    }
    if (err.message.includes('model')) {
      console.error(`   → Model "${opts.model}" may not be available on OpenRouter`);
    }
    process.exit(1);
  } finally {
    console.log('\n🛑 Closing browser...');
    await stagehand.close();
    console.log('Done.\n');
  }
}

main();
