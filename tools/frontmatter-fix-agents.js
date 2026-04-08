#!/usr/bin/env node

/**
 * Frontmatter Fix — Agent .md files
 *
 * Reads each agent .md file, extracts name from filename/title,
 * detects squad context, and injects standard YAML frontmatter
 * BEFORE the existing content (preserving ACTIVATION-NOTICE etc.)
 *
 * Usage:
 *   node tools/frontmatter-fix-agents.js              # Dry run (preview)
 *   node tools/frontmatter-fix-agents.js --apply       # Apply changes
 *   node tools/frontmatter-fix-agents.js --scope=core  # Only AIOS core agents
 *   node tools/frontmatter-fix-agents.js --scope=squads # Only squad agents
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const CORE_AGENTS_DIR = path.join(AIOS_CORE, '.aios-core', 'development', 'agents');
const SQUADS_DIR = path.join(AIOS_CORE, 'squads');

const apply = process.argv.includes('--apply');
const scopeArg = process.argv.find((a) => a.startsWith('--scope='));
const scope = scopeArg ? scopeArg.split('=')[1] : 'all';

// ============================================================
// ROLE DETECTION
// ============================================================

const CORE_ROLES = {
  dev: 'developer',
  qa: 'qa',
  architect: 'architect',
  devops: 'devops',
  pm: 'product-manager',
  po: 'product-owner',
  sm: 'scrum-master',
  analyst: 'analyst',
  'data-engineer': 'data-engineer',
  'ux-design-expert': 'ux-designer',
  'aios-master': 'master',
  navigator: 'navigator',
};

function detectRole(name, content) {
  if (CORE_ROLES[name]) return CORE_ROLES[name];

  const lower = name.toLowerCase();
  if (lower.includes('chief') || lower.includes('orchestrat')) return 'chief';
  if (lower.includes('miner') || lower.includes('research')) return 'analyst';
  if (lower.includes('review') || lower.includes('audit')) return 'reviewer';
  if (lower.includes('cutter') || lower.includes('editor')) return 'specialist';
  if (lower.includes('creator') || lower.includes('writer')) return 'creator';

  // Check content for clues
  if (content.includes('orchestrat') || content.includes('coordinat')) return 'chief';
  if (content.includes('specialist')) return 'specialist';

  return 'specialist';
}

function extractDescription(content, name) {
  const lines = content.split('\n');

  // Try to find a description after the title
  let foundTitle = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && trimmed === '') continue;
    if (foundTitle && trimmed.startsWith('ACTIVATION-NOTICE')) {
      // No description between title and activation — generate one
      break;
    }
    if (foundTitle && !trimmed.startsWith('#') && !trimmed.startsWith('```') && !trimmed.startsWith('CRITICAL')) {
      // Found a description line
      let desc = trimmed.replace(/^>\s*/, '').replace(/[*_`]/g, '');
      if (desc.length > 10 && desc.length < 200) return desc;
      break;
    }
  }

  // Try to extract from persona/role section inside YAML block
  const personaMatch = content.match(/role_tagline:\s*["']?([^"'\n]+)/);
  if (personaMatch) return personaMatch[1].trim();

  const greetingMatch = content.match(/greeting[^:]*:\s*["']?([^"'\n]{10,100})/);
  if (greetingMatch) {
    const g = greetingMatch[1].replace(/[*_`]/g, '').trim();
    if (g.length > 15) return g;
  }

  // Fallback: use name
  return `Agente ${name} do ecossistema AIOS.`;
}

// ============================================================
// SCAN & FIX
// ============================================================

function processAgent(filePath, squadName) {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf-8');
  const trimmed = content.trimStart();

  // Already has YAML frontmatter
  if (trimmed.startsWith('---')) return null;

  const name = path.basename(filePath, '.md');
  const desc = extractDescription(content, name);
  const role = detectRole(name, content);

  let frontmatter;
  if (squadName) {
    frontmatter = `---
name: ${name}
description: "${desc.replace(/"/g, '\\"')}"
role: ${role}
squad: ${squadName}
---

`;
  } else {
    frontmatter = `---
name: ${name}
description: "${desc.replace(/"/g, '\\"')}"
role: ${role}
---

`;
  }

  return {
    name,
    squad: squadName || 'core',
    path: filePath,
    relativePath: filePath.replace(os.homedir() + '/', '~/'),
    desc: desc.slice(0, 70) + (desc.length > 70 ? '...' : ''),
    role,
    newContent: frontmatter + content,
  };
}

function scanCoreAgents() {
  const results = [];
  if (!fs.existsSync(CORE_AGENTS_DIR)) return results;

  for (const file of fs.readdirSync(CORE_AGENTS_DIR)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(CORE_AGENTS_DIR, file);
    // Skip directories (agent memory dirs)
    if (fs.statSync(filePath).isDirectory()) continue;
    const result = processAgent(filePath, null);
    if (result) results.push(result);
  }

  return results;
}

function scanSquadAgents() {
  const results = [];
  if (!fs.existsSync(SQUADS_DIR)) return results;

  for (const squadName of fs.readdirSync(SQUADS_DIR)) {
    const agentsDir = path.join(SQUADS_DIR, squadName, 'agents');
    if (!fs.existsSync(agentsDir) || !fs.statSync(agentsDir).isDirectory()) continue;

    for (const file of fs.readdirSync(agentsDir)) {
      if (!file.endsWith('.md')) continue;
      const filePath = path.join(agentsDir, file);
      if (fs.statSync(filePath).isDirectory()) continue;
      const result = processAgent(filePath, squadName);
      if (result) results.push(result);
    }
  }

  return results;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  let changes = [];

  if (scope === 'all' || scope === 'core') {
    changes = changes.concat(scanCoreAgents());
  }
  if (scope === 'all' || scope === 'squads') {
    changes = changes.concat(scanSquadAgents());
  }

  if (changes.length === 0) {
    console.log('All agent files already have frontmatter.');
    return;
  }

  console.log(`\n${apply ? 'APPLYING' : 'DRY RUN'}: ${changes.length} agents need frontmatter\n`);

  // Group by squad for readability
  const groups = {};
  for (const c of changes) {
    if (!groups[c.squad]) groups[c.squad] = [];
    groups[c.squad].push(c);
  }

  let applied = 0;
  for (const [squad, items] of Object.entries(groups)) {
    console.log(`  \x1b[35m[${squad}]\x1b[0m (${items.length})`);
    for (const c of items) {
      const prefix = apply ? '\x1b[32m✓\x1b[0m' : '\x1b[33m~\x1b[0m';
      console.log(`    ${prefix} ${c.name} [${c.role}] — ${c.desc}`);

      if (apply) {
        fs.writeFileSync(c.path, c.newContent, 'utf-8');
        applied++;
      }
    }
  }

  console.log(`\n${apply ? `Done! Applied to ${applied}` : `Preview of ${changes.length}`} files.`);
  if (!apply) {
    console.log('Run with --apply to write changes.');
  }
}

main();
