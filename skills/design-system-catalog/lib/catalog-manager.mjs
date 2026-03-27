#!/usr/bin/env node

/**
 * catalog-manager.mjs
 *
 * Manages the global design system catalog at ~/CODE/design-systems/CATALOG.md.
 *
 * Usage:
 *   node catalog-manager.mjs list
 *   node catalog-manager.mjs add <path>
 *   node catalog-manager.mjs status <name>
 *   node catalog-manager.mjs scan
 *   node catalog-manager.mjs remove <name>
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

const CATALOG_DIR = join(homedir(), 'CODE', 'design-systems');
const CATALOG_FILE = join(CATALOG_DIR, 'CATALOG.md');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreData(projectPath) {
  const scriptPath = join(import.meta.dirname, 'score-calculator.mjs');
  try {
    const output = execSync(`node "${scriptPath}" --path "${projectPath}" --json`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return JSON.parse(output);
  } catch (err) {
    console.error(`  Error calculating score for ${projectPath}: ${err.message}`);
    return null;
  }
}

function parseCatalog() {
  if (!existsSync(CATALOG_FILE)) return [];
  const content = readFileSync(CATALOG_FILE, 'utf-8');
  const entries = [];

  for (const line of content.split('\n')) {
    // Match table rows: | # | Nome | URL | Status | Components | Score | Path |
    const match = line.match(
      /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/
    );
    if (match && match[1] !== '#') {
      entries.push({
        index: parseInt(match[1]),
        name: match[2].trim(),
        url: match[3].trim(),
        status: match[4].trim(),
        components: match[5].trim(),
        score: match[6].trim(),
        path: match[7].trim(),
      });
    }
  }

  return entries;
}

function writeCatalog(entries) {
  const date = new Date().toISOString().split('T')[0];
  const rows = entries.map((e, i) =>
    `| ${i + 1} | ${e.name} | ${e.url} | ${e.status} | ${e.components} | ${e.score} | ${e.path} |`
  );

  const content = `# Design System Catalog

> Catalogo global de design systems. Gerado por \`/design-system-catalog\`.
> Ultima atualizacao: ${date}

| # | Nome | URL Original | Status | Componentes | Score | Path |
|---|------|-------------|--------|-------------|-------|------|
${rows.join('\n')}

## Status Legend
- **Extracted** — dados extraidos, sem scaffold
- **Scaffolded** — projeto criado, sem componentes
- **In Progress** — componentes sendo gerados
- **Complete** — todos os componentes gerados e validados
`;

  writeFileSync(CATALOG_FILE, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdList() {
  const entries = parseCatalog();
  if (entries.length === 0) {
    console.log('\n  Catalogo vazio. Use "add <path>" ou "scan" para adicionar design systems.\n');
    return;
  }

  console.log(`\n  Design Systems (${entries.length} total)\n`);
  console.log('  | # | Nome | URL | Status | Componentes | Score |');
  console.log('  |---|------|-----|--------|-------------|-------|');
  for (const e of entries) {
    console.log(`  | ${e.index} | ${e.name} | ${e.url} | ${e.status} | ${e.components} | ${e.score} |`);
  }
  console.log('');
}

function cmdAdd(projectPath) {
  const resolvedPath = resolve(projectPath);
  if (!existsSync(resolvedPath)) {
    console.error(`  Error: path not found: ${resolvedPath}`);
    process.exit(1);
  }

  const entries = parseCatalog();
  const name = basename(resolvedPath);

  // Check if already exists
  if (entries.find((e) => e.name === name)) {
    console.log(`  "${name}" already in catalog. Updating...`);
    return cmdUpdate(name, resolvedPath);
  }

  const score = getScoreData(resolvedPath);
  if (!score) {
    console.error('  Could not calculate score. Check that design-system/ exists.');
    process.exit(1);
  }

  entries.push({
    name: score.name,
    url: score.sourceUrl,
    status: score.status,
    components: `${score.generated}/${score.detected}`,
    score: `${score.score}%`,
    path: `~/CODE/design-systems/${score.name}/`,
  });

  writeCatalog(entries);
  console.log(`\n  Added "${score.name}" to catalog.`);
  console.log(`  Status: ${score.status} | Score: ${score.score}% (${score.generated}/${score.detected})\n`);
}

function cmdUpdate(name, projectPath) {
  const entries = parseCatalog();
  const idx = entries.findIndex((e) => e.name === name);
  if (idx === -1) {
    console.error(`  "${name}" not found in catalog.`);
    process.exit(1);
  }

  const resolvedPath = projectPath || join(CATALOG_DIR, name);
  const score = getScoreData(resolvedPath);
  if (!score) {
    console.error('  Could not calculate score.');
    process.exit(1);
  }

  entries[idx] = {
    ...entries[idx],
    status: score.status,
    components: `${score.generated}/${score.detected}`,
    score: `${score.score}%`,
  };

  writeCatalog(entries);
  console.log(`\n  Updated "${name}". Score: ${score.score}%\n`);
}

function cmdStatus(name) {
  const projectPath = join(CATALOG_DIR, name);
  if (!existsSync(projectPath)) {
    console.error(`  Design system "${name}" not found at ${projectPath}`);
    process.exit(1);
  }

  const scriptPath = join(import.meta.dirname, 'score-calculator.mjs');
  try {
    execSync(`node "${scriptPath}" --path "${projectPath}"`, {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 10000,
    });
  } catch {
    console.error('  Error getting status.');
  }
}

function cmdScan() {
  if (!existsSync(CATALOG_DIR)) {
    console.log(`  Directory not found: ${CATALOG_DIR}`);
    return;
  }

  const dirs = readdirSync(CATALOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const entries = parseCatalog();
  let added = 0;

  for (const dir of dirs) {
    const dsPath = join(CATALOG_DIR, dir, 'design-system');
    if (!existsSync(dsPath)) continue;
    if (entries.find((e) => e.name === dir)) continue;

    const score = getScoreData(join(CATALOG_DIR, dir));
    if (!score) continue;

    entries.push({
      name: score.name,
      url: score.sourceUrl,
      status: score.status,
      components: `${score.generated}/${score.detected}`,
      score: `${score.score}%`,
      path: `~/CODE/design-systems/${score.name}/`,
    });
    added++;
    console.log(`  Found: ${dir} (${score.status})`);
  }

  if (added > 0) {
    writeCatalog(entries);
    console.log(`\n  Added ${added} design systems to catalog.\n`);
  } else {
    console.log('\n  No new design systems found.\n');
  }
}

function cmdRemove(name) {
  const entries = parseCatalog();
  const filtered = entries.filter((e) => e.name !== name);

  if (filtered.length === entries.length) {
    console.error(`  "${name}" not found in catalog.`);
    process.exit(1);
  }

  writeCatalog(filtered);
  console.log(`\n  Removed "${name}" from catalog. (Files not deleted.)\n`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'list':
    cmdList();
    break;
  case 'add':
    if (!arg) { console.error('  Usage: catalog-manager.mjs add <path>'); process.exit(1); }
    cmdAdd(arg);
    break;
  case 'status':
    if (!arg) { console.error('  Usage: catalog-manager.mjs status <name>'); process.exit(1); }
    cmdStatus(arg);
    break;
  case 'scan':
    cmdScan();
    break;
  case 'remove':
    if (!arg) { console.error('  Usage: catalog-manager.mjs remove <name>'); process.exit(1); }
    cmdRemove(arg);
    break;
  default:
    console.log(`
  Design System Catalog Manager

  Commands:
    list              List all cataloged design systems
    add <path>        Add a design system to the catalog
    status <name>     Show detailed status of a design system
    scan              Auto-detect and add new design systems
    remove <name>     Remove from catalog (keeps files)
`);
}
