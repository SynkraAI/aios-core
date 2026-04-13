#!/usr/bin/env node

/**
 * Ecosystem Index Generator
 *
 * Generates a centralized markdown index of all minds and agents in the AIOS ecosystem.
 *
 * Usage:
 *   node scripts/generate-ecosystem-index.js [options]
 *
 * Options:
 *   --quiet         Suppress output
 *   --minds         Generate only minds section
 *   --agents        Generate only agents section
 *   --squads        Generate only squads section
 *
 * Performance: < 5 seconds
 * Exit code: Always 0 (graceful degradation)
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// CLI flags
const args = process.argv.slice(2);
const flags = {
  quiet: args.includes('--quiet'),
  mindsOnly: args.includes('--minds'),
  agentsOnly: args.includes('--agents'),
  squadsOnly: args.includes('--squads')
};

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    log('🚀 Starting ecosystem index generation...');

    const minds = await scanMinds();
    const agentsCore = await scanAgentsCore();
    const agentsSquads = await scanAgentsSquads();

    const markdown = buildMarkdown({ minds, agentsCore, agentsSquads });

    const outputPath = path.join(process.cwd(), 'docs/ECOSYSTEM-INDEX.md');
    fs.writeFileSync(outputPath, markdown, 'utf8');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`✅ Generated: docs/ECOSYSTEM-INDEX.md (${duration}s)`);

  } catch (error) {
    // Graceful degradation: log error but exit 0
    console.error(`❌ Error: ${error.message}`);
    if (!flags.quiet) {
      console.error(error.stack);
    }
  }

  // Always exit 0 (graceful failure)
  process.exit(0);
}

/**
 * Scan minds from mind-cloning INDEX.md
 */
async function scanMinds() {
  if (flags.agentsOnly || flags.squadsOnly) return [];

  log('📖 Scanning minds...');

  try {
    const indexPath = path.join(process.cwd(), 'squads/mind-cloning/minds/INDEX.md');
    const content = fs.readFileSync(indexPath, 'utf8');

    const minds = [];
    const lines = content.split('\n');
    let inTable = false;

    for (const line of lines) {
      if (line.startsWith('| # | Mente |')) {
        inTable = true;
        continue;
      }
      if (line.startsWith('|---')) continue;
      if (inTable && line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 6 && parts[0] !== '#') {
          minds.push({
            number: parts[0],
            name: parts[1],
            slug: parts[2].replace(/`/g, ''),
            status: parts[3],
            fidelity: parts[4],
            domain: parts[5]
          });
        }
      } else if (inTable) {
        break;
      }
    }

    log(`  Found ${minds.length} minds`);
    return minds;

  } catch (error) {
    log(`  ⚠️  Failed to scan minds: ${error.message}`);
    return [];
  }
}

/**
 * Scan core AIOS agents
 */
async function scanAgentsCore() {
  if (flags.mindsOnly || flags.squadsOnly) return [];

  log('🤖 Scanning core agents...');

  try {
    const pattern = path.join(process.cwd(), '.aiox-core/development/agents/*.md');
    const files = globSync(pattern);

    const agents = [];

    for (const file of files) {
      const basename = path.basename(file, '.md');
      const metadata = parseYamlFrontmatter(file);

      if (metadata) {
        agents.push({
          name: metadata.name || basename,
          id: metadata.id || basename,
          speciality: metadata.description || metadata.speciality || 'N/A',
          authority: metadata.authority || 'N/A',
          file: path.relative(process.cwd(), file)
        });
      }
    }

    log(`  Found ${agents.length} core agents`);
    return agents;

  } catch (error) {
    log(`  ⚠️  Failed to scan core agents: ${error.message}`);
    return [];
  }
}

/**
 * Scan squad agents
 */
async function scanAgentsSquads() {
  if (flags.mindsOnly || flags.agentsOnly) return [];

  log('🏢 Scanning squad agents...');

  try {
    const pattern = path.join(process.cwd(), 'squads/*/agents/*.md');
    const files = globSync(pattern);

    const agentsBySquad = {};

    for (const file of files) {
      const basename = path.basename(file, '.md');
      const squadMatch = file.match(/squads\/([^/]+)\//);
      const squad = squadMatch ? squadMatch[1] : 'unknown';

      const metadata = parseYamlFrontmatter(file);

      if (!agentsBySquad[squad]) {
        agentsBySquad[squad] = [];
      }

      agentsBySquad[squad].push({
        name: metadata?.name || basename,
        speciality: metadata?.description || metadata?.speciality || 'N/A',
        file: path.relative(process.cwd(), file)
      });
    }

    const totalAgents = Object.values(agentsBySquad).reduce((sum, agents) => sum + agents.length, 0);
    log(`  Found ${totalAgents} squad agents across ${Object.keys(agentsBySquad).length} squads`);

    return agentsBySquad;

  } catch (error) {
    log(`  ⚠️  Failed to scan squad agents: ${error.message}`);
    return {};
  }
}

/**
 * Parse YAML frontmatter from markdown file
 */
function parseYamlFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match) return null;

    const yamlContent = match[1];
    const metadata = {};

    // Simple YAML parser (handles basic key: value pairs)
    const lines = yamlContent.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }

        metadata[key] = value;
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : null;

  } catch (error) {
    // Graceful degradation: skip file
    return null;
  }
}

/**
 * Build markdown document
 */
function buildMarkdown({ minds, agentsCore, agentsSquads }) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let md = `# AIOS Ecosystem Index\n\n`;
  md += `*Atualizado: ${timestamp}*  \n`;
  md += `*Regenerar: \`node scripts/generate-ecosystem-index.js\`*\n\n`;
  md += `---\n\n`;

  // Section 1: Minds
  if (!flags.agentsOnly && !flags.squadsOnly && minds.length > 0) {
    md += `## 🧠 Minds (${minds.length})\n\n`;
    md += `| # | Mind | Slug | Status | Fidelidade | Especialidade |\n`;
    md += `|---|------|------|--------|------------|---------------|\n`;

    for (const mind of minds) {
      md += `| ${mind.number} | **${mind.name}** | \`${mind.slug}\` | ${mind.status} | ${mind.fidelity} | ${mind.domain} |\n`;
    }

    md += `\n---\n\n`;
  }

  // Section 2: Core Agents
  if (!flags.mindsOnly && !flags.squadsOnly && agentsCore.length > 0) {
    md += `## 🤖 Agentes Core AIOS (${agentsCore.length})\n\n`;
    md += `| Agente | ID | Especialidade | Autoridade Exclusiva |\n`;
    md += `|--------|-----|---------------|----------------------|\n`;

    for (const agent of agentsCore) {
      md += `| **${agent.name}** | \`${agent.id}\` | ${agent.speciality} | ${agent.authority} |\n`;
    }

    md += `\n---\n\n`;
  }

  // Section 5: Agents by Squad
  if (!flags.mindsOnly && !flags.agentsOnly) {
    const squadNames = Object.keys(agentsSquads).sort();
    const totalSquadAgents = Object.values(agentsSquads).reduce((sum, agents) => sum + agents.length, 0);

    if (totalSquadAgents > 0) {
      md += `## 🏢 Agentes por Squad (${totalSquadAgents})\n\n`;

      for (const squad of squadNames) {
        const agents = agentsSquads[squad];
        md += `### Squad: ${squad} (${agents.length})\n\n`;

        for (const agent of agents) {
          md += `- **${agent.name}** — ${agent.speciality}\n`;
        }

        md += `\n`;
      }

      md += `---\n\n`;
    }
  }

  // Section 6: Statistics
  md += `## 📊 Estatísticas\n\n`;
  md += `| Categoria | Quantidade |\n`;
  md += `|-----------|------------|\n`;
  md += `| **Minds** | ${minds.length} |\n`;
  md += `| **Agentes Core** | ${agentsCore.length} |\n`;

  const squadCount = Object.keys(agentsSquads).length;
  const squadAgentCount = Object.values(agentsSquads).reduce((sum, agents) => sum + agents.length, 0);

  md += `| **Squads** | ${squadCount} |\n`;
  md += `| **Agentes de Squads** | ${squadAgentCount} |\n`;
  md += `| **TOTAL** | ${minds.length + agentsCore.length + squadAgentCount} |\n`;

  md += `\n---\n\n`;
  md += `*Gerado automaticamente em ${timestamp}*\n`;

  return md;
}

/**
 * Log helper (respects --quiet flag)
 */
function log(message) {
  if (!flags.quiet) {
    console.log(message);
  }
}

// Run
main();
