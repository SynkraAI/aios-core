#!/usr/bin/env node

/**
 * Generate AGENT-CATALOG.md from squad config.yaml files
 *
 * Reads each squad's config.yaml and produces a unified catalog
 * at docs/AGENT-CATALOG.md with squad info, agents, and stats.
 *
 * Usage:
 *   node .aios-core/infrastructure/scripts/generate-agent-catalog.js
 *   npm run generate:catalog
 *
 * @module generate-agent-catalog
 * @created Structural audit 2026-02-18
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SQUADS_DIR = path.resolve(__dirname, '../../../squads');
const OUTPUT_FILE = path.resolve(__dirname, '../../../docs/AGENT-CATALOG.md');

function loadSquadConfig(squadDir) {
  const configPath = path.join(squadDir, 'config.yaml');
  if (!fs.existsSync(configPath)) return null;
  try {
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.warn(`  Warning: Failed to parse ${configPath}: ${err.message}`);
    return null;
  }
}

function extractAgents(config, squadDir) {
  // Handle different config formats
  // Format A (dan-koe): config.agents[] with { id, name, role, tier }
  if (Array.isArray(config.agents)) {
    return config.agents.map(a => ({
      id: a.id,
      name: a.name || a.id,
      role: a.role || '',
      tier: a.tier != null ? a.tier : '-',
    }));
  }
  // Format B (copywriting-squad): config.components.agents[] as filenames
  if (config.components && Array.isArray(config.components.agents)) {
    return config.components.agents.map(filename => ({
      id: filename.replace('.md', ''),
      name: filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: '',
      tier: '-',
    }));
  }
  // Format C (design): config.squad.tier_structure
  if (config.squad && config.squad.tier_structure) {
    const agents = [];
    const ts = config.squad.tier_structure;
    if (ts.orchestrator) agents.push({ id: ts.orchestrator, name: ts.orchestrator, role: 'Orchestrator', tier: 0 });
    for (const [tierKey, tierAgents] of Object.entries(ts)) {
      if (tierKey === 'orchestrator') continue;
      const tierNum = parseInt(tierKey.replace('tier_', ''), 10);
      if (Array.isArray(tierAgents)) {
        tierAgents.forEach(a => agents.push({ id: a, name: a, role: '', tier: isNaN(tierNum) ? '-' : tierNum }));
      }
    }
    return agents;
  }
  // Format D (fallback): read agents/*.md from squad directory
  const agentsDir = path.join(squadDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const mdFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    if (mdFiles.length > 0) {
      return mdFiles.map(filename => ({
        id: filename.replace('.md', ''),
        name: filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: '',
        tier: '-',
      }));
    }
  }
  return [];
}

function getSquadMeta(config) {
  // Normalize different config formats
  return {
    name: config.pack?.name || config.name || 'unknown',
    title: config.pack?.title || config['short-title'] || config.pack?.name || config.name || '',
    version: config.pack?.version || config.version || '0.0.0',
    description: config.pack?.description || config.description || '',
    icon: config.pack?.icon || '',
    entryAgent: config.pack?.entry_agent || config.entry_agent || config.slashPrefix || '',
    slashPrefix: config.pack?.slash_prefix || config.slashPrefix || '',
  };
}

function generate() {
  console.log('Generating AGENT-CATALOG.md...\n');

  const squadDirs = fs.readdirSync(SQUADS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'wip' && d.name !== '.designs' && !d.name.startsWith('.'))
    .map(d => d.name)
    .sort();

  const squads = [];
  let totalAgents = 0;

  for (const squadName of squadDirs) {
    const squadPath = path.join(SQUADS_DIR, squadName);
    const config = loadSquadConfig(squadPath);
    if (!config) {
      console.log(`  Skipping ${squadName} (no config.yaml)`);
      continue;
    }

    const meta = getSquadMeta(config);
    const agents = extractAgents(config, squadPath);
    totalAgents += agents.length;

    squads.push({ dirName: squadName, meta, agents, config });
    console.log(`  ${meta.icon || '>'} ${meta.title || squadName}: ${agents.length} agents`);
  }

  // Build markdown
  const lines = [];
  const now = new Date().toISOString().split('T')[0];

  lines.push('# AIOS Agent Catalog');
  lines.push('');
  lines.push(`> Auto-generated on ${now} by \`generate-agent-catalog.js\``);
  lines.push('> Do not edit manually. Run `npm run generate:catalog` to regenerate.');
  lines.push('');
  lines.push(`**${squads.length} squads** | **${totalAgents} agents**`);
  lines.push('');

  // Summary table
  lines.push('## Summary');
  lines.push('');
  lines.push('| Squad | Version | Agents | Entry Point | Prefix |');
  lines.push('|-------|---------|--------|-------------|--------|');
  for (const s of squads) {
    lines.push(`| ${s.meta.icon} ${s.meta.title || s.dirName} | ${s.meta.version} | ${s.agents.length} | \`${s.meta.entryAgent}\` | \`${s.meta.slashPrefix}\` |`);
  }
  lines.push('');

  // Detailed sections
  for (const s of squads) {
    lines.push(`## ${s.meta.icon} ${s.meta.title || s.dirName}`);
    lines.push('');
    if (s.meta.description) {
      lines.push(`> ${s.meta.description}`);
      lines.push('');
    }
    lines.push(`- **Version:** ${s.meta.version}`);
    lines.push(`- **Directory:** \`squads/${s.dirName}/\``);
    lines.push(`- **Slash prefix:** \`${s.meta.slashPrefix}\``);
    lines.push('');

    if (s.agents.length > 0) {
      lines.push('| Agent | Role | Tier |');
      lines.push('|-------|------|------|');
      for (const a of s.agents) {
        const name = a.name || a.id;
        lines.push(`| \`${a.id}\` | ${a.role || '-'} | ${a.tier} |`);
      }
      lines.push('');
    }
  }

  // WIP section
  const wipDir = path.join(SQUADS_DIR, 'wip');
  if (fs.existsSync(wipDir)) {
    const wipSquads = fs.readdirSync(wipDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      .map(d => d.name)
      .sort();

    if (wipSquads.length > 0) {
      lines.push('## Work in Progress');
      lines.push('');
      lines.push('Squads in `squads/wip/` (incomplete, not yet ready):');
      lines.push('');
      for (const name of wipSquads) {
        lines.push(`- \`${name}\``);
      }
      lines.push('');
    }
  }

  const content = lines.join('\n');
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log(`\nCatalog written to ${OUTPUT_FILE}`);
  console.log(`  ${squads.length} squads, ${totalAgents} agents`);
}

generate();
