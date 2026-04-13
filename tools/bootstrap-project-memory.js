#!/usr/bin/env node

/**
 * Bootstrap Project Memory — v1.0
 *
 * Cria estrutura memory/ automática para projetos que não têm.
 * Lê INDEX.md e sessions/ existentes para extrair contexto.
 *
 * Usage:
 *   node tools/bootstrap-project-memory.js              # All projects missing memory
 *   node tools/bootstrap-project-memory.js --dry-run     # Preview only
 *   node tools/bootstrap-project-memory.js --project X   # Single project
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const AIOS_CORE = path.join(os.homedir(), 'aios-core');
const { parseActiveProjects } = require('./audit-project-configs');

const TODAY = new Date().toISOString().split('T')[0];

// ============================================================
// CONTEXT EXTRACTION
// ============================================================

function extractFromIndex(indexPath) {
  const context = {
    description: '',
    status: '',
    stack: [],
    decisions: [],
    agents: [],
    squads: [],
    history: []
  };

  if (!fs.existsSync(indexPath)) return context;

  const content = fs.readFileSync(indexPath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Description
    if (/descri[çc][aã]o/i.test(line)) {
      const val = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
      if (val) context.description = val;
    }

    // Status
    if (/status/i.test(line) && !line.startsWith('#') && !line.startsWith('|')) {
      const val = line.split(':').slice(1).join(':').trim().replace(/\*\*/g, '');
      if (val) context.status = val;
    }

    // Stack hints from content
    if (/node\.?js|javascript|typescript/i.test(line)) context.stack.push('Node.js');
    if (/next\.?js/i.test(line)) context.stack.push('Next.js');
    if (/react/i.test(line)) context.stack.push('React');
    if (/supabase/i.test(line)) context.stack.push('Supabase');
    if (/google.?sheets/i.test(line)) context.stack.push('Google Sheets');
    if (/postgres/i.test(line)) context.stack.push('PostgreSQL');
    if (/python/i.test(line)) context.stack.push('Python');
    if (/evolution.?api/i.test(line)) context.stack.push('Evolution API');
    if (/tailwind/i.test(line)) context.stack.push('Tailwind CSS');
    if (/chrome|brave|extension/i.test(line)) context.stack.push('Browser Extension');
    if (/figma/i.test(line)) context.stack.push('Figma');

    // Agent mentions
    if (/@dev\b/.test(line)) context.agents.push('@dev');
    if (/@pm\b/.test(line)) context.agents.push('@pm');
    if (/@sm\b/.test(line)) context.agents.push('@sm');
    if (/@po\b/.test(line)) context.agents.push('@po');
    if (/@qa\b/.test(line)) context.agents.push('@qa');
    if (/@architect\b/.test(line)) context.agents.push('@architect');
    if (/@devops\b/.test(line)) context.agents.push('@devops');
    if (/@analyst\b/.test(line)) context.agents.push('@analyst');
    if (/@data-engineer\b/.test(line)) context.agents.push('@data-engineer');

    // Squad mentions
    if (/copy/i.test(line) && /squad|chief/i.test(line)) context.squads.push('copywriting');
    if (/design/i.test(line) && /squad|chief|system/i.test(line)) context.squads.push('design');
    if (/mind.?clon/i.test(line)) context.squads.push('mind-cloning');
    if (/squad-creator/i.test(line)) context.squads.push('squad-creator-pro');
    if (/tech.?search/i.test(line)) context.squads.push('tech-search');
    if (/story/i.test(line) && /squad|chief/i.test(line)) context.squads.push('storytelling');

    // History table rows
    if (line.startsWith('|') && /\d{4}-\d{2}/.test(line) && !line.includes('---')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 2) {
        context.history.push(`${cols[0]}: ${cols[1]}`);
      }
    }
  }

  // Dedupe
  context.stack = [...new Set(context.stack)];
  context.agents = [...new Set(context.agents)];
  context.squads = [...new Set(context.squads)];

  return context;
}

function getLatestSession(aiosPath) {
  const sessionsDir = path.join(aiosPath, 'sessions');
  if (!fs.existsSync(sessionsDir)) return null;

  try {
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.endsWith('.md') && /\d{4}-\d{2}-\d{2}/.test(f))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const content = fs.readFileSync(path.join(sessionsDir, files[0]), 'utf8');
    return { filename: files[0], content: content.slice(0, 2000) };
  } catch {
    return null;
  }
}

// ============================================================
// TEMPLATE GENERATION
// ============================================================

function generateProjectContext(project, context) {
  const stackList = context.stack.length > 0
    ? context.stack.map(s => `- **${s}**`).join('\n')
    : '- (não detectado — preencher manualmente)';

  return `# Project Context: ${project.name}

**Criado:** ${TODAY}
**Última atualização:** ${TODAY}

---

## Stack Técnica

${stackList}

---

## Decisões de Arquitetura

### Padrões de código
- (A ser preenchido durante desenvolvimento)

---

## Escolhas Técnicas Permanentes

- (A ser preenchido — decisões que NÃO devem ser questionadas novamente)

---

## Regras de Ouro

- (A ser preenchido — regras que TODOS os agents devem seguir neste projeto)

---

## Contexto de Negócio

${context.description || '(A ser preenchido — por que este projeto existe?)'}

---

## Notas

${context.status ? `- Status: ${context.status}` : ''}
${context.history.length > 0 ? context.history.map(h => `- ${h}`).join('\n') : ''}
`;
}

function generateAgentsUsed(project, context) {
  let agentEntries = '';
  if (context.agents.length > 0) {
    agentEntries = context.agents.map(a => `### ${a}
- **Detectado em:** INDEX.md/sessions
- **Contexto:** (preencher)
`).join('\n');
  } else {
    agentEntries = '(Nenhum agent detectado — adicionar conforme uso)\n';
  }

  let squadEntries = '';
  if (context.squads.length > 0) {
    squadEntries = context.squads.map(s => `### ${s}
- **Detectado em:** INDEX.md/sessions
- **Contexto:** (preencher)
`).join('\n');
  } else {
    squadEntries = '(Nenhum squad detectado — adicionar conforme uso)\n';
  }

  return `# Agents/Squads Usados Neste Projeto

**Última atualização:** ${TODAY}

---

## Agents AIOX

${agentEntries}
---

## Squads

${squadEntries}`;
}

function generateSquadsConfig(project, context) {
  return `# Configuração de Squads Neste Projeto

**Última atualização:** ${TODAY}

---

(Adicionar configurações de squads conforme são usados neste projeto)
`;
}

// ============================================================
// BOOTSTRAP
// ============================================================

function bootstrapProject(project, dryRun) {
  // Determine .aios path
  let aiosPath;
  if (project.mode === 'HYBRID') {
    aiosPath = path.join(project.projectPath, '.aios');
  } else {
    aiosPath = project.projectPath;
  }

  const memoryPath = path.join(aiosPath, 'memory');

  // Skip if memory/ already has project-context.md
  const contextPath = path.join(memoryPath, 'project-context.md');
  if (fs.existsSync(contextPath)) {
    return { skipped: true, reason: 'memory/project-context.md already exists' };
  }

  // Skip if .aiox/ doesn't exist for HYBRID
  if (project.mode === 'HYBRID' && !fs.existsSync(aiosPath)) {
    return { skipped: true, reason: '.aiox/ does not exist' };
  }

  // Extract context
  const context = extractFromIndex(project.indexPath);
  const session = getLatestSession(aiosPath);

  // Enrich from session if available
  if (session) {
    const sessionContext = extractFromIndex(
      // Trick: reuse extractFromIndex on session content
      project.indexPath // We'll just use indexPath context
    );
    // Merge session agents/squads
    if (session.content) {
      if (/@dev\b/.test(session.content)) context.agents.push('@dev');
      if (/@pm\b/.test(session.content)) context.agents.push('@pm');
      if (/@sm\b/.test(session.content)) context.agents.push('@sm');
      if (/copy/i.test(session.content)) context.squads.push('copywriting');
      if (/mind/i.test(session.content)) context.squads.push('mind-cloning');
      context.agents = [...new Set(context.agents)];
      context.squads = [...new Set(context.squads)];
    }
  }

  // Generate files
  const files = {
    [contextPath]: generateProjectContext(project, context),
    [path.join(memoryPath, 'agents-used.md')]: generateAgentsUsed(project, context),
    [path.join(memoryPath, 'squads-config.md')]: generateSquadsConfig(project, context),
  };

  if (dryRun) {
    return { skipped: false, dryRun: true, files: Object.keys(files), context };
  }

  // Create directories
  fs.mkdirSync(memoryPath, { recursive: true });
  fs.mkdirSync(path.join(memoryPath, 'feedback'), { recursive: true });

  // Write files
  let written = 0;
  for (const [filePath, content] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      written++;
    }
  }

  return { skipped: false, written, files: Object.keys(files) };
}

// ============================================================
// MAIN
// ============================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const projectFilter = args.includes('--project')
    ? args[args.indexOf('--project') + 1]
    : null;

  console.log(`Bootstrap Project Memory ${dryRun ? '(DRY RUN)' : ''}\n`);

  try {
    const { projects, warnings } = parseActiveProjects();

    let targets = projects;
    if (projectFilter) {
      targets = projects.filter(p =>
        p.name.toLowerCase().includes(projectFilter.toLowerCase())
      );
      if (targets.length === 0) {
        console.log(`Nenhum projeto encontrado com "${projectFilter}"`);
        process.exit(1);
      }
    }

    console.log(`Processando ${targets.length} projetos...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const proj of targets) {
      process.stdout.write(`  ${proj.name}... `);
      try {
        const result = bootstrapProject(proj, dryRun);
        if (result.skipped) {
          console.log(`SKIP (${result.reason})`);
          skipped++;
        } else if (dryRun) {
          console.log(`WOULD CREATE ${result.files.length} files`);
          result.files.forEach(f => {
            const short = f.replace(os.homedir(), '~');
            console.log(`    ${short}`);
          });
          created++;
        } else {
          console.log(`CREATED ${result.written} files`);
          created++;
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
        errors++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (e) {
    if (e.vetoId) {
      console.error(`VETO: ${e.message}`);
      process.exit(2);
    }
    throw e;
  }
}

if (require.main === module) {
  main();
}

module.exports = { bootstrapProject, extractFromIndex };
