#!/usr/bin/env node

// build-tips-index.mjs — Compiles tasks, workflows, and squad configs
// into a searchable JSON index for the Guardrails Tips System.
//
// Reads: squads/{squad}/config.yaml, tasks/*.md, workflows/*.md
// Outputs: .synapse/cache/tips-index.json
//
// @module scripts/build-tips-index
// @version 1.0.0

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

const SQUADS_DIR = path.join(ROOT, 'squads');
const CACHE_DIR = path.join(ROOT, '.synapse', 'cache');
const OUTPUT_FILE = path.join(CACHE_DIR, 'tips-index.json');

// ---------------------------------------------------------------------------
// PT-BR Stopwords
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos',
  'nas', 'um', 'uma', 'uns', 'umas', 'com', 'por', 'para', 'que', 'se',
  'ou', 'ao', 'os', 'as', 'este', 'esta', 'esse', 'essa', 'isso', 'aqui',
  'ali', 'la', 'mais', 'menos', 'muito', 'pouco', 'bem', 'mal', 'como',
  'quando', 'onde', 'quem', 'qual', 'ser', 'ter', 'fazer', 'dar', 'ir',
  'vir', 'ver', 'saber', 'poder', 'querer', 'dizer', 'cada', 'todo',
  'toda', 'todos', 'todas', 'seu', 'sua', 'seus', 'suas', 'meu', 'minha',
  'ele', 'ela', 'nos', 'eles', 'elas', 'voce', 'ja', 'ate', 'entre',
  'sobre', 'apos', 'ate', 'sem', 'sob', 'desde', 'the', 'and', 'for',
  'with', 'from', 'into', 'this', 'that', 'are', 'was', 'were', 'been',
  'has', 'have', 'had', 'but', 'not', 'you', 'all', 'can', 'her', 'his',
  'they', 'them', 'then', 'than', 'other', 'which', 'their', 'will',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Remove accents from a string for keyword normalization.
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Tokenize text into keywords, removing stopwords and short tokens.
 */
function tokenize(text) {
  if (!text) return [];
  const normalized = removeAccents(text.toLowerCase());
  const tokens = normalized
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  return [...new Set(tokens)];
}

/**
 * Parse embedded YAML from a markdown file (```yaml ... ``` block).
 */
function parseEmbeddedYaml(content) {
  const match = content.match(/```ya?ml\n([\s\S]*?)```/);
  if (!match) return {};
  const yamlText = match[1];
  const result = {};
  for (const line of yamlText.split('\n')) {
    const kv = line.match(/^(\w[\w_-]*)\s*:\s*(.+)/);
    if (kv) {
      let val = kv[2].trim().replace(/^["']|["']$/g, '');
      result[kv[1]] = val;
    }
  }
  return result;
}

/**
 * Parse a simple YAML file (top-level keys only, no nesting needed).
 */
function parseSimpleYaml(content) {
  const result = {};
  let currentKey = null;
  for (const line of content.split('\n')) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) continue;
    // Top-level key: value
    const kv = line.match(/^(\w[\w_-]*)\s*:\s*(.+)/);
    if (kv) {
      let val = kv[2].trim().replace(/^["']|["']$/g, '');
      // Handle >- multiline (just use first line)
      if (val === '>-' || val === '|') {
        currentKey = kv[1];
        result[currentKey] = '';
        continue;
      }
      result[kv[1]] = val;
      currentKey = null;
    } else if (currentKey && line.startsWith('  ')) {
      result[currentKey] += (result[currentKey] ? ' ' : '') + line.trim();
    }
  }
  return result;
}

/**
 * Extract description from markdown (first paragraph after ## Overview or similar).
 */
function extractDescription(content) {
  // Try YAML description first
  const yamlData = parseEmbeddedYaml(content);
  if (yamlData.description) return yamlData.description;

  // Try first paragraph after a heading
  const match = content.match(/##\s+(?:Overview|Vis[aã]o Geral|Descri[cç][aã]o)\s*\n+([^\n#]+)/i);
  if (match) return match[1].trim();

  // Fallback: first non-heading, non-empty line after the title
  const lines = content.split('\n');
  for (let i = 1; i < lines.length && i < 20; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('|') && !line.startsWith('-')) {
      return line;
    }
  }
  return '';
}

/**
 * Extract prerequisites from workflow content.
 */
function getPrerequisites(content) {
  const prereqs = [];
  // Check for dependencies section
  const depMatch = content.match(/dependencies:\s*\n([\s\S]*?)(?:\n\w|\n---|\n```|$)/);
  if (depMatch) {
    const lines = depMatch[1].split('\n');
    for (const line of lines) {
      const item = line.match(/^\s*-\s+(.+)/);
      if (item) prereqs.push(item[1].trim());
    }
  }
  // Check for preflight checks
  const preMatch = content.match(/preflight:\s*\n\s*checks:\s*\n([\s\S]*?)(?:\n\w|\n---|\n```|$)/);
  if (preMatch) {
    const lines = preMatch[1].split('\n');
    for (const line of lines) {
      const item = line.match(/^\s*-\s+(.+)/);
      if (item) prereqs.push(item[1].trim());
    }
  }
  return prereqs.length > 0 ? prereqs : undefined;
}

/**
 * Extract trigger command from workflow content.
 */
function getTrigger(content) {
  const match = content.match(/trigger:\s*\n\s*command:\s*["']?([^"'\n]+)/);
  if (match) return match[1].trim();
  // Check for slash command pattern
  const slashMatch = content.match(/\*(\w[\w-]+)/);
  return slashMatch ? `*${slashMatch[1]}` : undefined;
}

/**
 * Count stages/phases in workflow content.
 */
function getStagesCount(content) {
  // Count PASSO or Phase or Step headings
  const passos = content.match(/###\s+PASSO\s+\d/gi);
  if (passos) return passos.length;
  const phases = content.match(/###\s+(?:Phase|Fase|Etapa|Step)\s+\d/gi);
  if (phases) return phases.length;
  return undefined;
}

// ---------------------------------------------------------------------------
// Squad Scanner
// ---------------------------------------------------------------------------

function scanSquads() {
  const entries = [];
  const squadMap = {};

  if (!fs.existsSync(SQUADS_DIR)) {
    console.error(`[build-tips-index] Squads directory not found: ${SQUADS_DIR}`);
    return { entries, squadMap };
  }

  const squadDirs = fs.readdirSync(SQUADS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'));

  for (const squadDir of squadDirs) {
    const squadPath = path.join(SQUADS_DIR, squadDir.name);
    const squadName = squadDir.name;

    // Parse config
    let config = {};
    const configPaths = [
      path.join(squadPath, 'config.yaml'),
      path.join(squadPath, 'config', 'config.yaml'),
    ];
    for (const cp of configPaths) {
      if (fs.existsSync(cp)) {
        try {
          const raw = fs.readFileSync(cp, 'utf8');
          config = parseSimpleYaml(raw);
          // Handle pack: nested structure
          if (!config.name && !config.entry_agent) {
            const packMatch = raw.match(/name:\s*(.+)/);
            const entryMatch = raw.match(/entry_agent:\s*(.+)/);
            if (packMatch) config.name = packMatch[1].trim();
            if (entryMatch) config.entry_agent = entryMatch[1].trim();
          }
        } catch { /* skip */ }
        break;
      }
    }

    squadMap[squadName] = {
      name: config.name || squadName,
      entry_agent: config.entry_agent || null,
      description: config.description || '',
      slashPrefix: config.slashPrefix || null,
    };

    // Scan tasks
    const tasksDirs = [
      path.join(squadPath, 'tasks'),
      path.join(squadPath, 'task'),
    ];
    for (const tasksDir of tasksDirs) {
      if (!fs.existsSync(tasksDir)) continue;
      const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md') || f.endsWith('.yaml'));
      for (const file of files) {
        if (file === 'INDEX.md' || file === 'README.md') continue;
        try {
          const content = fs.readFileSync(path.join(tasksDir, file), 'utf8');
          const name = file.replace(/\.(md|yaml)$/, '');
          const title = extractTitle(content, name);
          const description = extractDescription(content);
          const keywords = tokenize(`${title} ${description} ${squadName}`);

          entries.push({
            type: 'task',
            name,
            title,
            squad: squadName,
            entry_agent: squadMap[squadName].entry_agent,
            keywords,
            description: description.slice(0, 200),
          });
        } catch { /* skip */ }
      }
    }

    // Scan workflows
    const workflowsDirs = [
      path.join(squadPath, 'workflows'),
      path.join(squadPath, 'workflow'),
    ];
    for (const wfDir of workflowsDirs) {
      if (!fs.existsSync(wfDir)) continue;
      const files = fs.readdirSync(wfDir).filter(f => f.endsWith('.md') || f.endsWith('.yaml'));
      for (const file of files) {
        if (file === 'INDEX.md' || file === 'README.md') continue;
        try {
          const content = fs.readFileSync(path.join(wfDir, file), 'utf8');
          const name = file.replace(/\.(md|yaml)$/, '');
          const title = extractTitle(content, name);
          const description = extractDescription(content);
          const keywords = tokenize(`${title} ${description} ${squadName}`);
          const prerequisites = getPrerequisites(content);
          const trigger = getTrigger(content);
          const stages = getStagesCount(content);

          const entry = {
            type: 'workflow',
            name,
            title,
            squad: squadName,
            entry_agent: squadMap[squadName].entry_agent,
            keywords,
            description: description.slice(0, 200),
          };
          if (prerequisites) entry.prerequisites = prerequisites;
          if (trigger) entry.trigger = trigger;
          if (stages) entry.stages = stages;

          entries.push(entry);
        } catch { /* skip */ }
      }
    }

    // Scan agents (for agent indexing)
    const agentsDirs = [
      path.join(squadPath, 'agents'),
      path.join(squadPath, 'agent'),
    ];
    for (const agDir of agentsDirs) {
      if (!fs.existsSync(agDir)) continue;
      const files = fs.readdirSync(agDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        if (file === 'INDEX.md' || file === 'README.md') continue;
        try {
          const content = fs.readFileSync(path.join(agDir, file), 'utf8');
          const name = file.replace(/\.md$/, '');
          const title = extractTitle(content, name);
          const description = extractDescription(content);
          const keywords = tokenize(`${title} ${description} ${squadName} agente agent`);

          entries.push({
            type: 'agent',
            name,
            title,
            squad: squadName,
            keywords,
            description: description.slice(0, 200),
          });
        } catch { /* skip */ }
      }
    }
  }

  return { entries, squadMap };
}

/**
 * Extract title from content.
 */
function extractTitle(content, fallback) {
  // Try H1 heading
  const h1 = content.match(/^#\s+(?:Task:|Workflow:|Agent:)?\s*(.+)/m);
  if (h1) return h1[1].trim();
  // Try YAML title
  const yamlTitle = content.match(/title:\s*["']?([^"'\n]+)/);
  if (yamlTitle) return yamlTitle[1].trim();
  // Try task_name
  const taskName = content.match(/task_name:\s*["']?([^"'\n]+)/);
  if (taskName) return taskName[1].trim();
  // Fallback: humanize filename
  return fallback.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// IDF Calculation
// ---------------------------------------------------------------------------

function calculateIDF(entries) {
  const docFreq = {};
  const totalDocs = entries.length;

  for (const entry of entries) {
    const uniqueKws = new Set(entry.keywords);
    for (const kw of uniqueKws) {
      docFreq[kw] = (docFreq[kw] || 0) + 1;
    }
  }

  const idf = {};
  for (const [kw, freq] of Object.entries(docFreq)) {
    idf[kw] = Math.log2(totalDocs / freq);
  }

  return idf;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const start = Date.now();

  const { entries, squadMap } = scanSquads();
  const idf = calculateIDF(entries);

  // Collect all keywords
  const allKeywords = new Set();
  for (const entry of entries) {
    for (const kw of entry.keywords) {
      allKeywords.add(kw);
    }
  }

  const index = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    stats: {
      totalEntries: entries.length,
      tasks: entries.filter(e => e.type === 'task').length,
      workflows: entries.filter(e => e.type === 'workflow').length,
      agents: entries.filter(e => e.type === 'agent').length,
      squads: Object.keys(squadMap).length,
      keywords: allKeywords.size,
    },
    entries,
    squadMap,
    idf,
  };

  // Ensure cache dir exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8');

  const elapsed = Date.now() - start;
  const stats = index.stats;
  console.log(
    `[build-tips-index] Generated ${OUTPUT_FILE}\n` +
    `  ${stats.totalEntries} entries (${stats.tasks} tasks, ${stats.workflows} workflows, ${stats.agents} agents)\n` +
    `  ${stats.squads} squads, ${stats.keywords} keywords\n` +
    `  Built in ${elapsed}ms`
  );
}

main();
