#!/usr/bin/env node

/**
 * Frontmatter Fix — Squad READMEs
 *
 * Reads each squad README.md, extracts title + first paragraph,
 * and injects standard YAML frontmatter.
 *
 * Usage:
 *   node tools/frontmatter-fix-squads.js              # Dry run (preview)
 *   node tools/frontmatter-fix-squads.js --apply       # Apply changes
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const SQUADS_DIR = path.join(os.homedir(), 'aios-core', 'squads');
const apply = process.argv.includes('--apply');

const CATEGORY_MAP = {
  'content-creator': 'content',
  'content-engine': 'content',
  'conteudo': 'content',
  'copywriting-squad': 'content',
  'storytelling-masters-fosc': 'content',
  'video-content-distillery': 'content',
  'viral-squad': 'content',
  'ai-reels': 'content',
  'media-processor': 'content',
  'transcript-sculptor': 'content',
  'mind-content-updater': 'content',
  'repertoire-mapper': 'content',
  'palestras-master': 'content',
  'branding': 'business',
  'brandcraft': 'business',
  'marketing-board': 'business',
  'high-ticket-mastery': 'business',
  'high-ticket-sales': 'business',
  'money-makers-vtd': 'business',
  'conversao-extrema': 'business',
  'affiliates': 'business',
  'negotiation': 'business',
  'seo': 'business',
  'advisor-board': 'business',
  'hormozi': 'business',
  'dan-koe': 'business',
  'icaro-de-carvalho': 'business',
  'leandro-ladeira': 'business',
  'italo-marsili': 'business',
  'jose-amorim': 'business',
  'paulo-vieira': 'business',
  'tathi-deandhela': 'business',
  'renner-silva': 'business',
  'luiz-fosc': 'business',
  'zona-genialidade': 'business',
  'icp-cloning': 'research',
  'insight': 'research',
  'file-research': 'research',
  'root-diagnosis': 'research',
  'dopamine-learning': 'research',
  'relationship-therapy-squad': 'research',
  'design': 'design',
  'claude-code-mastery': 'development',
  'playwright-architect': 'development',
  'kaizen': 'development',
  'synapse': 'development',
  'site-performance-audit': 'development',
  'etl-squad': 'development',
  'business-rules-extraction': 'development',
  'sop-factory': 'development',
  'knowledge-base-builder': 'development',
  'mind-cloning': 'development',
  'mmos-squad': 'development',
  'openclaw-manager': 'development',
  'whatsapp-prospector': 'integration',
  'gui-avila': 'integration',
  'ensinio-mind': 'integration',
};

function extractDescription(content) {
  const lines = content.split('\n');
  let desc = '';

  // Skip title line(s) and blank lines, get first paragraph
  let started = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!started) {
      // Skip headers, blank lines, HTML tags, badges
      if (trimmed.startsWith('#') || trimmed === '' || trimmed.startsWith('<') || trimmed.startsWith('!') || trimmed.startsWith('[![')) continue;
      // Skip blockquotes that are taglines
      if (trimmed.startsWith('>')) {
        desc = trimmed.replace(/^>\s*/, '').replace(/[*_]/g, '');
        started = true;
        continue;
      }
      started = true;
      desc = trimmed;
    } else {
      if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('|') || trimmed.startsWith('```')) break;
      desc += ' ' + trimmed;
    }
  }

  // Clean up
  desc = desc.replace(/[*_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();

  // Truncate to ~200 chars
  if (desc.length > 200) {
    desc = desc.slice(0, 197) + '...';
  }

  return desc || 'Squad do ecossistema AIOS.';
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  if (!match) return null;
  return match[1].replace(/[*_`]/g, '').replace(/—.*$/, '').trim();
}

function processSquad(squadName) {
  const readmePath = path.join(SQUADS_DIR, squadName, 'README.md');
  if (!fs.existsSync(readmePath)) return null;

  const content = fs.readFileSync(readmePath, 'utf-8');
  const trimmed = content.trimStart();

  // Already has frontmatter
  if (trimmed.startsWith('---')) return null;

  const title = extractTitle(content) || squadName;
  const desc = extractDescription(content);
  const category = CATEGORY_MAP[squadName] || 'general';

  const frontmatter = `---
name: ${squadName}
description: |
  ${desc}
version: 1.0.0
category: ${category}
---

`;

  const newContent = frontmatter + content;

  return {
    name: squadName,
    path: readmePath,
    title,
    desc: desc.slice(0, 80) + (desc.length > 80 ? '...' : ''),
    category,
    newContent,
  };
}

function main() {
  const entries = fs.readdirSync(SQUADS_DIR).filter((name) => {
    const readmePath = path.join(SQUADS_DIR, name, 'README.md');
    return fs.existsSync(readmePath);
  });

  const changes = [];
  for (const name of entries) {
    const result = processSquad(name);
    if (result) changes.push(result);
  }

  if (changes.length === 0) {
    console.log('All squad READMEs already have frontmatter.');
    return;
  }

  console.log(`\n${apply ? 'APPLYING' : 'DRY RUN'}: ${changes.length} squads need frontmatter\n`);

  for (const c of changes) {
    const prefix = apply ? '\x1b[32m✓\x1b[0m' : '\x1b[33m~\x1b[0m';
    console.log(`  ${prefix} ${c.name} [${c.category}] — ${c.desc}`);

    if (apply) {
      fs.writeFileSync(c.path, c.newContent, 'utf-8');
    }
  }

  console.log(`\n${apply ? 'Done! Applied to' : 'Preview of'} ${changes.length} files.`);
  if (!apply) {
    console.log('Run with --apply to write changes.');
  }
}

main();
