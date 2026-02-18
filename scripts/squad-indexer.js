#!/usr/bin/env node

/**
 * Squad Indexer - Automatic Squad to Slash Command Indexer
 *
 * Automates the process of indexing squads from squads/ to .claude/commands/
 *
 * Features:
 * - Auto-detect new squads in squads/
 * - Validate squad structure (README, config.yaml, agents, tasks, workflows)
 * - Create symlinks for slash commands
 * - Update MEMORY.md with new squad info
 * - Generate indexing report
 *
 * Usage:
 *   node scripts/squad-indexer.js --scan        # Scan for new squads
 *   node scripts/squad-indexer.js --index       # Index all unindexed squads
 *   node scripts/squad-indexer.js --validate    # Validate all indexed squads
 *   node scripts/squad-indexer.js --report      # Generate comprehensive report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  squadsDir: path.join(__dirname, '..', 'squads'),
  commandsDir: path.join(__dirname, '..', '.claude', 'commands'),
  memoryFile: path.join(process.env.HOME, '.claude', 'projects', '-Users-luizfosc-aios-core', 'memory', 'MEMORY.md'),

  // Directories to symlink (if they exist)
  symlinkDirs: ['agents', 'tasks', 'workflows', 'checklists', 'templates', 'data'],

  // Required files for a valid squad
  requiredFiles: {
    essential: ['README.md'],
    recommended: ['config.yaml']
  },

  // Squads to exclude from indexing
  excludeSquads: [
    'squad-creator.backup-2026-02-12-114018', // Backup directories
    '.DS_Store'
  ]
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  dim: (msg) => console.log(`${colors.gray}  ${msg}${colors.reset}`)
};

/**
 * Scan squads directory and return all valid squad directories
 */
function scanSquads() {
  const squads = [];
  const entries = fs.readdirSync(CONFIG.squadsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (CONFIG.excludeSquads.includes(entry.name)) continue;

    const squadPath = path.join(CONFIG.squadsDir, entry.name);
    squads.push({
      name: entry.name,
      path: squadPath
    });
  }

  return squads;
}

/**
 * Get list of currently indexed squads
 */
function getIndexedSquads() {
  const indexed = [];

  if (!fs.existsSync(CONFIG.commandsDir)) {
    return indexed;
  }

  const entries = fs.readdirSync(CONFIG.commandsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'AIOS') continue; // Skip AIOS skills directory

    indexed.push(entry.name);
  }

  return indexed;
}

/**
 * Validate squad structure
 */
function validateSquad(squad) {
  const validation = {
    valid: true,
    errors: [],
    warnings: [],
    structure: {}
  };

  // Check essential files
  for (const file of CONFIG.requiredFiles.essential) {
    const filePath = path.join(squad.path, file);
    const exists = fs.existsSync(filePath);
    validation.structure[file] = exists;

    if (!exists) {
      validation.valid = false;
      validation.errors.push(`Missing essential file: ${file}`);
    }
  }

  // Check recommended files
  for (const file of CONFIG.requiredFiles.recommended) {
    const filePath = path.join(squad.path, file);
    const exists = fs.existsSync(filePath);
    validation.structure[file] = exists;

    if (!exists) {
      validation.warnings.push(`Missing recommended file: ${file}`);
    }
  }

  // Check for component directories
  for (const dir of CONFIG.symlinkDirs) {
    const dirPath = path.join(squad.path, dir);
    const exists = fs.existsSync(dirPath);

    if (exists) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') || f.endsWith('.yaml'));
      validation.structure[dir] = files.length;
    } else {
      validation.structure[dir] = 0;
    }
  }

  // Try to parse config.yaml if it exists
  if (validation.structure['config.yaml']) {
    try {
      const configPath = path.join(squad.path, 'config.yaml');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(configContent);
      validation.config = config;
    } catch (error) {
      validation.warnings.push(`Failed to parse config.yaml: ${error.message}`);
    }
  }

  return validation;
}

/**
 * Create symlinks for a squad
 */
function createSymlinks(squad) {
  const targetDir = path.join(CONFIG.commandsDir, squad.name);
  const symlinkCount = { created: 0, skipped: 0 };

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    log.dim(`Created directory: ${targetDir}`);
  }

  // Symlink README.md
  const readmeSrc = path.join(squad.path, 'README.md');
  const readmeDst = path.join(targetDir, 'README.md');

  if (fs.existsSync(readmeSrc)) {
    const relativePath = path.relative(targetDir, readmeSrc);

    if (fs.existsSync(readmeDst)) {
      fs.unlinkSync(readmeDst);
    }

    fs.symlinkSync(relativePath, readmeDst);
    symlinkCount.created++;
    log.dim(`  ✓ README.md → ${relativePath}`);
  }

  // Symlink component directories
  for (const dir of CONFIG.symlinkDirs) {
    const srcDir = path.join(squad.path, dir);
    const dstDir = path.join(targetDir, dir);

    if (!fs.existsSync(srcDir)) continue;

    // Create target subdirectory
    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true });
    }

    // Get all .md and .yaml files
    const files = fs.readdirSync(srcDir).filter(f =>
      f.endsWith('.md') || f.endsWith('.yaml')
    );

    if (files.length === 0) continue;

    log.dim(`  Symlinking ${dir}/ (${files.length} files)...`);

    // Create symlinks for each file
    for (const file of files) {
      const srcFile = path.join(srcDir, file);
      const dstFile = path.join(dstDir, file);
      const relativePath = path.relative(dstDir, srcFile);

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

/**
 * Update MEMORY.md with squad information
 */
function updateMemory(squads) {
  if (!fs.existsSync(CONFIG.memoryFile)) {
    log.warn(`MEMORY.md not found at ${CONFIG.memoryFile}`);
    return false;
  }

  let memoryContent = fs.readFileSync(CONFIG.memoryFile, 'utf8');

  // Find or create "Squads Indexados" section
  const sectionRegex = /## Squads Indexados \([\d-]+\)([\s\S]*?)(?=\n## |$)/;
  const match = memoryContent.match(sectionRegex);

  // Build squad table
  const today = new Date().toISOString().split('T')[0];
  const tableHeader = `## Squads Indexados (${today})
Squads disponiveis como slash commands em \`.claude/commands/\`:

| Squad | Agents | Tasks | Workflows | Local | Ativacao |
|-------|--------|-------|-----------|-------|----------|`;

  const tableRows = squads.map(squad => {
    const validation = validateSquad(squad);
    const agentCount = validation.structure.agents || 0;
    const taskCount = validation.structure.tasks || 0;
    const workflowCount = validation.structure.workflows || 0;

    return `| **${squad.name}** | ${agentCount} | ${taskCount} | ${workflowCount} | \`.claude/commands/${squad.name}/\` | \`/${squad.name}:*\` |`;
  }).join('\n');

  const newSection = `${tableHeader}\n${tableRows}\n`;

  if (match) {
    // Replace existing section
    memoryContent = memoryContent.replace(sectionRegex, newSection);
  } else {
    // Find "Key Locations" section and insert before it
    const keyLocationsRegex = /(## Key Locations)/;
    if (memoryContent.match(keyLocationsRegex)) {
      memoryContent = memoryContent.replace(keyLocationsRegex, `${newSection}\n$1`);
    } else {
      // Append at the end
      memoryContent += `\n${newSection}\n`;
    }
  }

  fs.writeFileSync(CONFIG.memoryFile, memoryContent, 'utf8');
  return true;
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  log.section('📊 Squad Indexing Report');

  const allSquads = scanSquads();
  const indexed = getIndexedSquads();

  log.info(`Total squads found: ${allSquads.length}`);
  log.info(`Currently indexed: ${indexed.length}`);

  // Check which squads are not indexed
  const unindexed = allSquads.filter(s => !indexed.includes(s.name));

  if (unindexed.length > 0) {
    log.section('🔍 Unindexed Squads');

    for (const squad of unindexed) {
      const validation = validateSquad(squad);

      console.log(`\n${colors.bright}${squad.name}${colors.reset}`);
      log.dim(`  Path: ${squad.path}`);

      if (validation.valid) {
        log.success('  Valid structure');
      } else {
        log.error('  Invalid structure');
        validation.errors.forEach(err => log.error(`    ${err}`));
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warn => log.warn(`    ${warn}`));
      }

      // Show component counts
      const components = [];
      if (validation.structure.agents > 0) components.push(`${validation.structure.agents} agents`);
      if (validation.structure.tasks > 0) components.push(`${validation.structure.tasks} tasks`);
      if (validation.structure.workflows > 0) components.push(`${validation.structure.workflows} workflows`);
      if (validation.structure.checklists > 0) components.push(`${validation.structure.checklists} checklists`);
      if (validation.structure.templates > 0) components.push(`${validation.structure.templates} templates`);

      if (components.length > 0) {
        log.dim(`  Components: ${components.join(', ')}`);
      }

      if (validation.config) {
        log.dim(`  Version: ${validation.config.version || 'N/A'}`);
        if (validation.config.entry_agent) {
          log.dim(`  Entry Agent: @${validation.config.entry_agent}`);
        }
      }
    }
  }

  // Show indexed squads
  if (indexed.length > 0) {
    log.section('✅ Indexed Squads');

    for (const squadName of indexed) {
      const squadPath = path.join(CONFIG.squadsDir, squadName);
      const squad = { name: squadName, path: squadPath };

      if (!fs.existsSync(squadPath)) {
        log.warn(`${squadName} (source not found - orphaned index)`);
        continue;
      }

      const validation = validateSquad(squad);
      const components = [];

      if (validation.structure.agents > 0) components.push(`${validation.structure.agents} agents`);
      if (validation.structure.tasks > 0) components.push(`${validation.structure.tasks} tasks`);
      if (validation.structure.workflows > 0) components.push(`${validation.structure.workflows} workflows`);

      const componentStr = components.length > 0 ? ` (${components.join(', ')})` : '';
      log.success(`${squadName}${componentStr}`);

      // Count symlinks
      const targetDir = path.join(CONFIG.commandsDir, squadName);
      let symlinkCount = 0;

      for (const dir of CONFIG.symlinkDirs) {
        const dirPath = path.join(targetDir, dir);
        if (fs.existsSync(dirPath)) {
          symlinkCount += fs.readdirSync(dirPath).length;
        }
      }

      if (fs.existsSync(path.join(targetDir, 'README.md'))) {
        symlinkCount++;
      }

      log.dim(`  ${symlinkCount} symlinks created`);
    }
  }

  // Summary
  log.section('📈 Summary');
  console.log(`  Total Squads: ${allSquads.length}`);
  console.log(`  Indexed: ${colors.green}${indexed.length}${colors.reset}`);
  console.log(`  Unindexed: ${unindexed.length > 0 ? colors.yellow : colors.green}${unindexed.length}${colors.reset}`);

  if (unindexed.length > 0) {
    console.log(`\n  ${colors.bright}Run with --index to index unindexed squads${colors.reset}`);
  }
}

/**
 * Index all unindexed squads
 */
function indexSquads() {
  log.section('🔧 Indexing Squads');

  const allSquads = scanSquads();
  const indexed = getIndexedSquads();
  const unindexed = allSquads.filter(s => !indexed.includes(s.name));

  if (unindexed.length === 0) {
    log.success('All squads are already indexed!');
    return;
  }

  log.info(`Found ${unindexed.length} unindexed squads`);

  const indexedSquads = [];

  for (const squad of unindexed) {
    console.log(`\n${colors.bright}Indexing: ${squad.name}${colors.reset}`);

    // Validate squad
    const validation = validateSquad(squad);

    if (!validation.valid) {
      log.error(`Skipping ${squad.name} - invalid structure`);
      validation.errors.forEach(err => log.error(`  ${err}`));
      continue;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => log.warn(`  ${warn}`));
    }

    // Create symlinks
    const counts = createSymlinks(squad);
    log.success(`Created ${counts.created} symlinks`);

    indexedSquads.push(squad);
  }

  // Update MEMORY.md
  if (indexedSquads.length > 0) {
    log.info('\nUpdating MEMORY.md...');
    const allIndexed = [...indexed.map(name => ({
      name,
      path: path.join(CONFIG.squadsDir, name)
    })), ...indexedSquads];

    if (updateMemory(allIndexed)) {
      log.success('MEMORY.md updated successfully');
    } else {
      log.warn('Failed to update MEMORY.md');
    }
  }

  log.section('✅ Indexing Complete');
  console.log(`  Indexed: ${colors.green}${indexedSquads.length}${colors.reset} squads`);
  console.log(`  Total indexed: ${colors.green}${indexed.length + indexedSquads.length}${colors.reset} squads`);
}

/**
 * Validate all indexed squads
 */
function validateIndexed() {
  log.section('🔍 Validating Indexed Squads');

  const indexed = getIndexedSquads();

  if (indexed.length === 0) {
    log.warn('No indexed squads found');
    return;
  }

  let validCount = 0;
  let invalidCount = 0;

  for (const squadName of indexed) {
    const squadPath = path.join(CONFIG.squadsDir, squadName);
    const squad = { name: squadName, path: squadPath };

    console.log(`\n${colors.bright}${squadName}${colors.reset}`);

    if (!fs.existsSync(squadPath)) {
      log.error('Source directory not found - orphaned index');
      invalidCount++;
      continue;
    }

    const validation = validateSquad(squad);

    if (validation.valid) {
      log.success('Valid structure');
      validCount++;
    } else {
      log.error('Invalid structure');
      validation.errors.forEach(err => log.error(`  ${err}`));
      invalidCount++;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => log.warn(`  ${warn}`));
    }

    // Check symlinks
    const targetDir = path.join(CONFIG.commandsDir, squadName);
    let brokenSymlinks = 0;

    for (const dir of CONFIG.symlinkDirs) {
      const dirPath = path.join(targetDir, dir);
      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const linkPath = path.join(dirPath, file);
        try {
          fs.readlinkSync(linkPath);
          if (!fs.existsSync(linkPath)) {
            brokenSymlinks++;
          }
        } catch (error) {
          // Not a symlink
        }
      }
    }

    if (brokenSymlinks > 0) {
      log.error(`  ${brokenSymlinks} broken symlinks found`);
    }
  }

  log.section('📊 Validation Summary');
  console.log(`  Valid: ${colors.green}${validCount}${colors.reset}`);
  console.log(`  Invalid: ${invalidCount > 0 ? colors.red : colors.green}${invalidCount}${colors.reset}`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--scan':
    generateReport();
    break;

  case '--index':
    indexSquads();
    break;

  case '--validate':
    validateIndexed();
    break;

  case '--report':
    generateReport();
    break;

  default:
    console.log(`
${colors.bright}Squad Indexer - Automatic Squad to Slash Command Indexer${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/squad-indexer.js --scan        ${colors.gray}# Scan for new squads${colors.reset}
  node scripts/squad-indexer.js --index       ${colors.gray}# Index all unindexed squads${colors.reset}
  node scripts/squad-indexer.js --validate    ${colors.gray}# Validate all indexed squads${colors.reset}
  node scripts/squad-indexer.js --report      ${colors.gray}# Generate comprehensive report${colors.reset}

${colors.cyan}Examples:${colors.reset}
  # Check what squads need indexing
  node scripts/squad-indexer.js --scan

  # Index all unindexed squads automatically
  node scripts/squad-indexer.js --index

  # Validate existing indexes
  node scripts/squad-indexer.js --validate
    `);
    process.exit(1);
}
