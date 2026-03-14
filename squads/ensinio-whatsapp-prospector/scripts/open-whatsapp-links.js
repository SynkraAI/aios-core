#!/usr/bin/env node
'use strict';

/**
 * Opens WhatsApp outreach links one by one in the default browser.
 * Press Enter to open the next link. Type 'q' to quit.
 *
 * Usage: node scripts/open-whatsapp-links.js [--start N] [--file path]
 *   --start N    Start from prospect #N (default: 1)
 *   --file path  Path to outreach-messages.md (default: auto-detected)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const SQUAD_DIR = path.resolve(__dirname, '..');
const DEFAULT_FILE = path.join(SQUAD_DIR, 'data/outputs/mentoria-50k/outreach-messages.md');

function parseArgs() {
  const args = process.argv.slice(2);
  let start = 1;
  let file = DEFAULT_FILE;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start' && args[i + 1]) {
      start = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      file = path.resolve(args[i + 1]);
      i++;
    }
  }

  return { start, file };
}

function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const prospects = [];

  const sections = content.split(/^---$/m);

  for (const section of sections) {
    const nameMatch = section.match(/^### \d+\.\s+(.+?)\s+\(Score\s+(\d+)\)/m);
    const linkMatch = section.match(/\*\*WhatsApp Link:\*\*\s+`(https:\/\/api\.whatsapp\.com\/send\?[^`]+)`/);

    if (nameMatch && linkMatch) {
      prospects.push({
        name: nameMatch[1],
        score: parseInt(nameMatch[2], 10),
        link: linkMatch[1],
      });
    }
  }

  return prospects;
}

function openInBrowser(url) {
  execSync(`open "${url}"`);
}

async function main() {
  const { start, file } = parseArgs();

  if (!fs.existsSync(file)) {
    console.error(`Arquivo não encontrado: ${file}`);
    process.exit(1);
  }

  const prospects = extractLinks(file);
  console.log(`\n📋 ${prospects.length} prospects encontrados`);
  console.log(`   Começando do #${start}\n`);
  console.log('   Enter = abrir próximo | q = sair | s = pular\n');
  console.log('─'.repeat(50));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  for (let i = start - 1; i < prospects.length; i++) {
    const p = prospects[i];
    const num = i + 1;

    console.log(`\n[${num}/${prospects.length}] ${p.name} (Score ${p.score})`);

    const answer = await ask('  → ');

    if (answer.toLowerCase() === 'q') {
      console.log(`\n✅ Parou no #${num}. Para retomar: node scripts/open-whatsapp-links.js --start ${num}`);
      break;
    }

    if (answer.toLowerCase() === 's') {
      console.log('  ⏭ Pulado');
      continue;
    }

    openInBrowser(p.link);
    console.log('  🔗 Aberto no browser');
  }

  rl.close();
  console.log('\n🏁 Fim!\n');
}

main();
