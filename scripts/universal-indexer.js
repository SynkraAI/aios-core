#!/usr/bin/env node

/**
 * Universal AIOS Indexer - Index Everything Automatically
 *
 * Indexes all AIOS assets automatically:
 * - Squads (squads/ → .claude/commands/)
 * - Skills (.aios/skills/ → .claude/commands/AIOS/skills/)
 * - Tools (tools/ → tools registry)
 * - Agents (.aios-core/development/agents/ → IDE sync)
 *
 * Usage:
 *   node scripts/universal-indexer.js --scan        # Scan all assets
 *   node scripts/universal-indexer.js --index       # Index everything
 *   node scripts/universal-indexer.js --validate    # Validate all indexes
 *   node scripts/universal-indexer.js --report      # Comprehensive report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  // Squads
  squadsDir: path.join(__dirname, '..', 'squads'),
  squadsCommandsDir: path.join(__dirname, '..', '.claude', 'commands'),

  // Skills
  skillsSourceDir: path.join(__dirname, '..', '.aios', 'skills'),
  skillsCommandsDir: path.join(__dirname, '..', '.claude', 'commands', 'AIOS', 'skills'),
  skillsIndexFile: path.join(__dirname, '..', '.claude', 'commands', 'AIOS', 'SKILLS-INDEX.md'),

  // Tools
  toolsDir: path.join(__dirname, '..', 'tools'),
  toolsReadme: path.join(__dirname, '..', 'tools', 'README.md'),

  // Agents (reference IDE sync, don't duplicate)
  agentsDir: path.join(__dirname, '..', '.aios-core', 'development', 'agents'),

  // Memory
  memoryFile: path.join(process.env.HOME, '.claude', 'projects', '-Users-luizfosc-aios-core', 'memory', 'MEMORY.md'),

  // Exclusions
  excludePatterns: [
    /\.backup/,
    /\.DS_Store/,
    /node_modules/,
    /\.git/,
    /\.venv/,
    /__pycache__/
  ]
};

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m'
};

// Logging
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  subsection: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}`),
  dim: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

// Utility: Check if path should be excluded
function shouldExclude(name) {
  return CONFIG.excludePatterns.some(pattern => pattern.test(name));
}

// Utility: Create symlinks for directory
function createSymlinksForDir(srcDir, dstDir, componentTypes = []) {
  let symlinkCount = { created: 0, skipped: 0 };

  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }

  // Symlink README if exists
  const readmeSrc = path.join(srcDir, 'README.md');
  const readmeDst = path.join(dstDir, 'README.md');

  if (fs.existsSync(readmeSrc)) {
    const relativePath = path.relative(dstDir, readmeSrc);
    if (fs.existsSync(readmeDst)) fs.unlinkSync(readmeDst);
    fs.symlinkSync(relativePath, readmeDst);
    symlinkCount.created++;
  }

  // Symlink component directories
  for (const compType of componentTypes) {
    const srcCompDir = path.join(srcDir, compType);
    const dstCompDir = path.join(dstDir, compType);

    if (!fs.existsSync(srcCompDir)) continue;

    if (!fs.existsSync(dstCompDir)) {
      fs.mkdirSync(dstCompDir, { recursive: true });
    }

    const files = fs.readdirSync(srcCompDir).filter(f =>
      f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.yml')
    );

    for (const file of files) {
      const srcFile = path.join(srcCompDir, file);
      const dstFile = path.join(dstCompDir, file);
      const relativePath = path.relative(dstCompDir, srcFile);

      if (fs.existsSync(dstFile)) {
        fs.unlinkSync(dstFile);
        symlinkCount.skipped++;
      }

      fs.symlinkSync(relativePath, dstFile);
      symlinkCount.created++;
    }
  }

  return symlinkCount;
}

// ============================================================================
// SQUADS INDEXER
// ============================================================================

function scanSquads() {
  const squads = [];
  if (!fs.existsSync(CONFIG.squadsDir)) return squads;

  const entries = fs.readdirSync(CONFIG.squadsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || shouldExclude(entry.name)) continue;

    const squadPath = path.join(CONFIG.squadsDir, entry.name);
    const hasReadme = fs.existsSync(path.join(squadPath, 'README.md'));

    if (hasReadme) {
      squads.push({
        type: 'squad',
        name: entry.name,
        path: squadPath
      });
    }
  }

  return squads;
}

function getIndexedSquads() {
  const indexed = [];
  if (!fs.existsSync(CONFIG.squadsCommandsDir)) return indexed;

  const entries = fs.readdirSync(CONFIG.squadsCommandsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'AIOS') continue;
    indexed.push(entry.name);
  }

  return indexed;
}

function indexSquads(squads) {
  const indexed = [];
  const componentTypes = ['agents', 'tasks', 'workflows', 'checklists', 'templates', 'data'];

  for (const squad of squads) {
    const targetDir = path.join(CONFIG.squadsCommandsDir, squad.name);
    const counts = createSymlinksForDir(squad.path, targetDir, componentTypes);

    if (counts.created > 0) {
      indexed.push(squad);
      log.dim(`  ${squad.name}: ${counts.created} symlinks`);
    }
  }

  return indexed;
}

// ============================================================================
// SKILLS INDEXER
// ============================================================================

function scanSkills() {
  const skills = [];
  if (!fs.existsSync(CONFIG.skillsSourceDir)) return skills;

  const entries = fs.readdirSync(CONFIG.skillsSourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || shouldExclude(entry.name)) continue;

    const skillPath = path.join(CONFIG.skillsSourceDir, entry.name);
    const hasReadme = fs.existsSync(path.join(skillPath, 'README.md'));

    if (hasReadme) {
      skills.push({
        type: 'skill',
        name: entry.name,
        path: skillPath
      });
    }
  }

  return skills;
}

function getIndexedSkills() {
  const indexed = [];
  if (!fs.existsSync(CONFIG.skillsCommandsDir)) return indexed;

  const entries = fs.readdirSync(CONFIG.skillsCommandsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() || entry.name.endsWith('.md')) {
      indexed.push(entry.name.replace('.md', ''));
    }
  }

  return indexed;
}

function indexSkills(skills) {
  const indexed = [];

  if (!fs.existsSync(CONFIG.skillsCommandsDir)) {
    fs.mkdirSync(CONFIG.skillsCommandsDir, { recursive: true });
  }

  for (const skill of skills) {
    // Skills can be:
    // 1. Single file (skill.md) → symlink as skill.md
    // 2. Directory with structure → symlink entire directory

    const readmePath = path.join(skill.path, 'README.md');
    const hasSubdirs = fs.readdirSync(skill.path, { withFileTypes: true })
      .some(e => e.isDirectory());

    if (hasSubdirs) {
      // Directory-based skill - create subdirectory with symlinks
      const targetDir = path.join(CONFIG.skillsCommandsDir, skill.name);
      const componentTypes = ['examples', 'references', 'resources', 'assets', 'prompts', 'templates'];
      const counts = createSymlinksForDir(skill.path, targetDir, componentTypes);

      if (counts.created > 0) {
        indexed.push(skill);
        log.dim(`  ${skill.name}: ${counts.created} symlinks`);
      }
    } else {
      // Single-file skill - symlink README.md as skill-name.md
      const targetFile = path.join(CONFIG.skillsCommandsDir, `${skill.name}.md`);
      const relativePath = path.relative(CONFIG.skillsCommandsDir, readmePath);

      if (fs.existsSync(targetFile)) fs.unlinkSync(targetFile);
      fs.symlinkSync(relativePath, targetFile);

      indexed.push(skill);
      log.dim(`  ${skill.name}: 1 symlink`);
    }
  }

  return indexed;
}

// ============================================================================
// TOOLS INDEXER
// ============================================================================

function scanTools() {
  const tools = [];
  if (!fs.existsSync(CONFIG.toolsDir)) return tools;

  const entries = fs.readdirSync(CONFIG.toolsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || shouldExclude(entry.name)) continue;

    const toolPath = path.join(CONFIG.toolsDir, entry.name);

    // Check for README or main script
    const hasReadme = fs.existsSync(path.join(toolPath, 'README.md'));
    const hasPackageJson = fs.existsSync(path.join(toolPath, 'package.json'));
    const hasPyProject = fs.existsSync(path.join(toolPath, 'pyproject.toml'));
    const hasScript = fs.readdirSync(toolPath).some(f =>
      f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.sh')
    );

    if (hasReadme || hasPackageJson || hasPyProject || hasScript) {
      tools.push({
        type: 'tool',
        name: entry.name,
        path: toolPath,
        hasReadme,
        hasPackageJson,
        hasPyProject
      });
    }
  }

  return tools;
}

function updateToolsReadme(tools) {
  let content = `# AIOS Tools\n\n`;
  content += `Auto-generated tools registry. Updated: ${new Date().toISOString().split('T')[0]}\n\n`;
  content += `## Available Tools\n\n`;

  for (const tool of tools) {
    const readmePath = path.join(tool.path, 'README.md');
    let description = 'No description available';
    let language = 'Unknown';

    // Detect language
    if (tool.hasPackageJson) language = 'Node.js';
    else if (tool.hasPyProject) language = 'Python';
    else if (fs.existsSync(path.join(tool.path, 'setup.py'))) language = 'Python';

    // Extract description from README
    if (fs.existsSync(readmePath)) {
      const readme = fs.readFileSync(readmePath, 'utf8');
      const lines = readme.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        description = lines[1].replace(/^[#*\s]+/, '').trim();
      }
    }

    content += `### ${tool.name}\n\n`;
    content += `- **Language:** ${language}\n`;
    content += `- **Description:** ${description}\n`;
    content += `- **Path:** \`tools/${tool.name}/\`\n`;

    if (tool.hasReadme) {
      content += `- **Docs:** [README](${tool.name}/README.md)\n`;
    }

    content += `\n`;
  }

  content += `\n---\n\n`;
  content += `**Total Tools:** ${tools.length}\n`;
  content += `**Auto-indexed:** Yes\n`;

  fs.writeFileSync(CONFIG.toolsReadme, content, 'utf8');
  return true;
}

// ============================================================================
// MEMORY UPDATER
// ============================================================================

function updateMemory(squads, skills, tools) {
  if (!fs.existsSync(CONFIG.memoryFile)) {
    log.warn(`MEMORY.md not found at ${CONFIG.memoryFile}`);
    return false;
  }

  let memoryContent = fs.readFileSync(CONFIG.memoryFile, 'utf8');
  const today = new Date().toISOString().split('T')[0];

  // Update Squads section
  const squadsSectionRegex = /## Squads Indexados \([\d-]+\)([\s\S]*?)(?=\n## |$)/;

  const squadsTable = `## Squads Indexados (${today})
Squads disponiveis como slash commands em \`.claude/commands/\`:

| Squad | Agents | Tasks | Workflows | Local | Ativacao |
|-------|--------|-------|-----------|-------|----------|
${squads.map(s => {
  const agentCount = fs.existsSync(path.join(s.path, 'agents')) ?
    fs.readdirSync(path.join(s.path, 'agents')).filter(f => f.endsWith('.md')).length : 0;
  const taskCount = fs.existsSync(path.join(s.path, 'tasks')) ?
    fs.readdirSync(path.join(s.path, 'tasks')).filter(f => f.endsWith('.md')).length : 0;
  const workflowCount = fs.existsSync(path.join(s.path, 'workflows')) ?
    fs.readdirSync(path.join(s.path, 'workflows')).filter(f => f.endsWith('.md') || f.endsWith('.yaml')).length : 0;

  return `| **${s.name}** | ${agentCount} | ${taskCount} | ${workflowCount} | \`.claude/commands/${s.name}/\` | \`/${s.name}:*\` |`;
}).join('\n')}

**Total:** ${squads.length} squads indexados
`;

  if (memoryContent.match(squadsSectionRegex)) {
    memoryContent = memoryContent.replace(squadsSectionRegex, squadsTable);
  } else {
    memoryContent += `\n${squadsTable}\n`;
  }

  // Add/Update Skills section
  const skillsSectionRegex = /## Skills Indexados \([\d-]+\)([\s\S]*?)(?=\n## |$)/;

  const skillsTable = `## Skills Indexados (${today})
Skills runtime disponiveis em \`.aios/skills/\` e slash commands em \`.claude/commands/AIOS/skills/\`:

| Skill | Type | Local | Ativacao |
|-------|------|-------|----------|
${skills.map(s => {
  const isDirectory = fs.readdirSync(s.path, { withFileTypes: true }).some(e => e.isDirectory());
  const type = isDirectory ? 'Multi-file' : 'Single-file';
  return `| **${s.name}** | ${type} | \`.aios/skills/${s.name}/\` | \`/AIOS:skills:${s.name}\` |`;
}).join('\n')}

**Total:** ${skills.length} skills indexadas
`;

  if (memoryContent.match(skillsSectionRegex)) {
    memoryContent = memoryContent.replace(skillsSectionRegex, skillsTable);
  } else {
    memoryContent += `\n${skillsTable}\n`;
  }

  // Add/Update Tools section
  const toolsSectionRegex = /## Tools Indexados \([\d-]+\)([\s\S]*?)(?=\n## |$)/;

  const toolsTable = `## Tools Indexados (${today})
Utilitarios e ferramentas disponiveis em \`tools/\`:

| Tool | Language | Local |
|------|----------|-------|
${tools.map(t => {
  let lang = 'Unknown';
  if (t.hasPackageJson) lang = 'Node.js';
  else if (t.hasPyProject) lang = 'Python';
  return `| **${t.name}** | ${lang} | \`tools/${t.name}/\` |`;
}).join('\n')}

**Total:** ${tools.length} tools indexadas
**Registry:** \`tools/README.md\` (auto-atualizado)
`;

  if (memoryContent.match(toolsSectionRegex)) {
    memoryContent = memoryContent.replace(toolsSectionRegex, toolsTable);
  } else {
    memoryContent += `\n${toolsTable}\n`;
  }

  fs.writeFileSync(CONFIG.memoryFile, memoryContent, 'utf8');
  return true;
}

// ============================================================================
// MAIN OPERATIONS
// ============================================================================

function scanAll() {
  log.section('🔍 Universal Asset Scanner');

  const squads = scanSquads();
  const skills = scanSkills();
  const tools = scanTools();

  const indexedSquads = getIndexedSquads();
  const indexedSkills = getIndexedSkills();

  const unindexedSquads = squads.filter(s => !indexedSquads.includes(s.name));
  const unindexedSkills = skills.filter(s => !indexedSkills.includes(s.name));

  // Squads
  log.subsection(`📦 Squads`);
  log.info(`Total found: ${squads.length}`);
  log.info(`Indexed: ${indexedSquads.length}`);
  log.info(`Unindexed: ${unindexedSquads.length}`);

  if (unindexedSquads.length > 0) {
    console.log('');
    unindexedSquads.forEach(s => log.warn(`  ${s.name}`));
  }

  // Skills
  log.subsection(`🎯 Skills`);
  log.info(`Total found: ${skills.length}`);
  log.info(`Indexed: ${indexedSkills.length}`);
  log.info(`Unindexed: ${skills.length - indexedSkills.length}`);

  if (unindexedSkills.length > 0) {
    console.log('');
    unindexedSkills.forEach(s => log.warn(`  ${s.name}`));
  }

  // Tools
  log.subsection(`🔧 Tools`);
  log.info(`Total found: ${tools.length}`);

  if (tools.length > 0) {
    console.log('');
    tools.forEach(t => {
      const lang = t.hasPackageJson ? 'Node.js' : t.hasPyProject ? 'Python' : 'Script';
      log.dim(`  ${t.name} (${lang})`);
    });
  }

  // Summary
  log.section('📊 Summary');
  console.log(`  Total Assets: ${squads.length + skills.length + tools.length}`);
  console.log(`  Squads: ${squads.length} (${unindexedSquads.length} unindexed)`);
  console.log(`  Skills: ${skills.length} (${unindexedSkills.length} unindexed)`);
  console.log(`  Tools: ${tools.length}`);

  if (unindexedSquads.length > 0 || unindexedSkills.length > 0) {
    console.log(`\n  ${colors.bright}Run with --index to index all unindexed assets${colors.reset}`);
  }
}

function indexAll() {
  log.section('🔧 Universal Asset Indexer');

  const squads = scanSquads();
  const skills = scanSkills();
  const tools = scanTools();

  const indexedSquads = getIndexedSquads();
  const indexedSkills = getIndexedSkills();

  const unindexedSquads = squads.filter(s => !indexedSquads.includes(s.name));
  const unindexedSkills = skills.filter(s => !indexedSkills.includes(s.name));

  let totalIndexed = 0;

  // Index Squads
  if (unindexedSquads.length > 0) {
    log.subsection(`📦 Indexing Squads (${unindexedSquads.length})`);
    const indexed = indexSquads(unindexedSquads);
    totalIndexed += indexed.length;
    log.success(`Indexed ${indexed.length} squads`);
  }

  // Index Skills
  if (unindexedSkills.length > 0) {
    log.subsection(`🎯 Indexing Skills (${unindexedSkills.length})`);
    const indexed = indexSkills(unindexedSkills);
    totalIndexed += indexed.length;
    log.success(`Indexed ${indexed.length} skills`);
  }

  // Update Tools README
  if (tools.length > 0) {
    log.subsection(`🔧 Updating Tools Registry`);
    updateToolsReadme(tools);
    log.success(`Registered ${tools.length} tools`);
  }

  // Update MEMORY.md
  log.subsection(`💾 Updating MEMORY.md`);
  const allSquads = squads;
  const allSkills = skills;

  if (updateMemory(allSquads, allSkills, tools)) {
    log.success('MEMORY.md updated');
  } else {
    log.warn('Failed to update MEMORY.md');
  }

  // Summary
  log.section('✅ Indexing Complete');
  console.log(`  Total indexed: ${colors.green}${totalIndexed}${colors.reset} assets`);
  console.log(`  Squads: ${unindexedSquads.length} indexed`);
  console.log(`  Skills: ${unindexedSkills.length} indexed`);
  console.log(`  Tools: ${tools.length} registered`);
}

function validateAll() {
  log.section('🔍 Universal Asset Validator');

  // Validate Squads
  log.subsection(`📦 Validating Squads`);
  const indexedSquads = getIndexedSquads();
  let validSquads = 0;
  let invalidSquads = 0;

  indexedSquads.forEach(name => {
    const squadPath = path.join(CONFIG.squadsDir, name);
    if (fs.existsSync(squadPath)) {
      validSquads++;
      log.success(`${name}`);
    } else {
      invalidSquads++;
      log.error(`${name} (orphaned)`);
    }
  });

  // Validate Skills
  log.subsection(`🎯 Validating Skills`);
  const indexedSkills = getIndexedSkills();
  let validSkills = 0;
  let invalidSkills = 0;

  indexedSkills.forEach(name => {
    const skillPath = path.join(CONFIG.skillsSourceDir, name);
    if (fs.existsSync(skillPath)) {
      validSkills++;
      log.success(`${name}`);
    } else {
      invalidSkills++;
      log.error(`${name} (orphaned)`);
    }
  });

  // Summary
  log.section('📊 Validation Summary');
  console.log(`  Squads: ${colors.green}${validSquads}${colors.reset} valid, ${invalidSquads > 0 ? colors.red : colors.green}${invalidSquads}${colors.reset} invalid`);
  console.log(`  Skills: ${colors.green}${validSkills}${colors.reset} valid, ${invalidSkills > 0 ? colors.red : colors.green}${invalidSkills}${colors.reset} invalid`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--scan':
    scanAll();
    break;

  case '--index':
    indexAll();
    break;

  case '--validate':
    validateAll();
    break;

  case '--report':
    scanAll();
    break;

  default:
    console.log(`
${colors.bright}Universal AIOS Indexer - Index Everything Automatically${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/universal-indexer.js --scan        ${colors.gray}# Scan all assets${colors.reset}
  node scripts/universal-indexer.js --index       ${colors.gray}# Index everything${colors.reset}
  node scripts/universal-indexer.js --validate    ${colors.gray}# Validate all indexes${colors.reset}
  node scripts/universal-indexer.js --report      ${colors.gray}# Comprehensive report${colors.reset}

${colors.cyan}What gets indexed:${colors.reset}
  📦 Squads      squads/ → .claude/commands/
  🎯 Skills      .aios/skills/ → .claude/commands/AIOS/skills/
  🔧 Tools       tools/ → tools/README.md registry

${colors.cyan}Examples:${colors.reset}
  # Check status of all assets
  node scripts/universal-indexer.js --scan

  # Index everything automatically
  node scripts/universal-indexer.js --index

  # Validate all indexes
  node scripts/universal-indexer.js --validate
    `);
    process.exit(1);
}
