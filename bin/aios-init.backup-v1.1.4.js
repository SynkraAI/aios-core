#!/usr/bin/env node

/**
 * AIOS-FullStack Modern Installation Wizard
 * Uses @clack/prompts for beautiful CLI experience
 * Version: 1.1.4
 */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('yaml');
const { execSync } = require('child_process');
const p = require('@clack/prompts');
const pc = require('picocolors');

/**
 * Smart path resolution for AIOS Core modules
 */
function resolveAiosCoreModule(modulePath) {
  const aiosCoreModule = path.join(__dirname, '..', '.aios-core', modulePath);

  const moduleExists = fs.existsSync(aiosCoreModule + '.js') ||
                       fs.existsSync(aiosCoreModule + '/index.js') ||
                       fs.existsSync(aiosCoreModule);

  if (!moduleExists) {
    throw new Error(
      `Cannot find AIOS Core module: ${modulePath}\n` +
      `Searched: ${aiosCoreModule}\n` +
      'Please ensure @synkra/aios-core is installed correctly.',
    );
  }

  return require(aiosCoreModule);
}

// Load AIOS Core modules
const { detectRepositoryContext } = resolveAiosCoreModule('utils/repository-detector');
const { ClickUpAdapter } = resolveAiosCoreModule('utils/pm-adapters/clickup-adapter');
const { GitHubProjectsAdapter } = resolveAiosCoreModule('utils/pm-adapters/github-adapter');
const { JiraAdapter } = resolveAiosCoreModule('utils/pm-adapters/jira-adapter');

async function main() {
  console.clear();

  p.intro(pc.bgCyan(pc.black(' AIOS-FullStack Installation ')));

  const projectRoot = process.cwd();
  let context = detectRepositoryContext();

  // Setup prerequisites if needed
  if (!context) {
    const s = p.spinner();
    s.start('Setting up project prerequisites');

    // Check for git repository
    let hasGit = false;
    try {
      execSync('git rev-parse --git-dir', { cwd: projectRoot, stdio: 'ignore' });
      hasGit = true;
    } catch (err) {
      // Not a git repo
    }

    if (!hasGit) {
      try {
        execSync('git init', { cwd: projectRoot, stdio: 'ignore' });
        s.message('Git repository initialized');
      } catch (err) {
        s.stop('Failed to initialize git repository');
        p.cancel('Installation cancelled');
        process.exit(1);
      }
    }

    // Check for package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const dirName = path.basename(projectRoot);
      const defaultPackage = {
        name: dirName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: 'AIOS-FullStack project',
        main: 'index.js',
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
        keywords: [],
        author: '',
        license: 'ISC',
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackage, null, 2));
      s.message('package.json created');
    }

    s.stop('Prerequisites ready');

    // Try to detect context again
    context = detectRepositoryContext();

    // If still no context, create minimal one
    if (!context) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      context = {
        projectRoot,
        packageName: packageJson.name,
        packageVersion: packageJson.version,
        repositoryUrl: 'local-repository',
        frameworkLocation: path.join(__dirname, '..'),
      };
    }
  }

  p.note(`Package: ${context.packageName}`, 'Project Context');

  // Step 1: Installation Mode
  const installMode = await p.select({
    message: 'How are you using AIOS-FullStack?',
    options: [
      {
        value: 'project-development',
        label: 'Using AIOS in a project',
        hint: 'Framework files added to .gitignore',
      },
      {
        value: 'framework-development',
        label: 'Developing AIOS framework itself',
        hint: 'Framework files are source code',
      },
    ],
  });

  if (p.isCancel(installMode)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // Save installation config
  const config = {
    installation: {
      mode: installMode,
      detected_at: new Date().toISOString(),
    },
    repository: {
      url: context.repositoryUrl,
      auto_detect: true,
    },
    framework: {
      source: installMode === 'framework-development' ? 'local' : 'npm',
      version: context.packageVersion,
      location: context.frameworkLocation,
    },
    git_ignore_rules: {
      mode: installMode,
      ignore_framework_files: installMode === 'project-development',
    },
  };

  const configPath = path.join(context.projectRoot, '.aios-installation-config.yaml');
  fs.writeFileSync(configPath, yaml.stringify(config));

  // Update .gitignore
  updateGitIgnore(installMode, context.projectRoot);

  // Step 2: PM Tool
  const pmTool = await p.select({
    message: 'Do you use a project management tool?',
    options: [
      { value: 'local', label: 'None (local YAML files only)', hint: 'Recommended' },
      { value: 'clickup', label: 'ClickUp', hint: 'Requires API token' },
      { value: 'github-projects', label: 'GitHub Projects', hint: 'Uses gh auth' },
      { value: 'jira', label: 'Jira', hint: 'Requires API token' },
    ],
  });

  if (p.isCancel(pmTool)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // Save PM config
  savePMConfig(pmTool, {}, context.projectRoot);

  // Step 3: IDE Selection
  const ide = await p.select({
    message: 'Which IDE will you use?',
    options: [
      { value: 'claude', label: 'Claude Code', hint: 'Recommended' },
      { value: 'windsurf', label: 'Windsurf' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'none', label: 'Skip IDE setup' },
    ],
  });

  if (p.isCancel(ide)) {
    p.cancel('Installation cancelled');
    process.exit(0);
  }

  // Step 4: Copy AIOS Core files
  const s = p.spinner();
  s.start('Installing AIOS Core files');

  const sourceCoreDir = path.join(context.frameworkLocation, '.aios-core');
  const targetCoreDir = path.join(context.projectRoot, '.aios-core');

  if (fs.existsSync(sourceCoreDir)) {
    await fse.copy(sourceCoreDir, targetCoreDir);
    s.message('AIOS Core files installed (11 agents, 68 tasks, 23 templates)');
  } else {
    s.stop('AIOS Core files not found');
    p.cancel('Installation failed');
    process.exit(1);
  }

  // Copy IDE rules if IDE was selected
  if (ide !== 'none') {
    const ideRulesMap = {
      'claude': { source: 'claude-rules.md', target: '.claude/CLAUDE.md' },
      'windsurf': { source: 'windsurf-rules.md', target: '.windsurf/rules.md' },
      'cursor': { source: 'cursor-rules.md', target: '.cursor/rules.md' },
    };

    const ideConfig = ideRulesMap[ide];
    if (ideConfig) {
      const sourceRules = path.join(targetCoreDir, 'templates', 'ide-rules', ideConfig.source);
      const targetRules = path.join(context.projectRoot, ideConfig.target);

      if (fs.existsSync(sourceRules)) {
        await fse.ensureDir(path.dirname(targetRules));
        await fse.copy(sourceRules, targetRules);
        s.message(`${ide.charAt(0).toUpperCase() + ide.slice(1)} rules installed`);
      }
    }
  }

  s.stop('Core files installed');

  // Step 5: Expansion Packs
  const sourceExpansionDir = path.join(context.frameworkLocation, 'expansion-packs');
  const availablePacks = [];

  if (fs.existsSync(sourceExpansionDir)) {
    const packs = fs.readdirSync(sourceExpansionDir).filter(f =>
      fs.statSync(path.join(sourceExpansionDir, f)).isDirectory(),
    );
    availablePacks.push(...packs);
  }

  if (availablePacks.length > 0) {
    const expansionPacks = await p.multiselect({
      message: 'Select expansion packs to install (optional)',
      options: availablePacks.map(pack => ({
        value: pack,
        label: pack,
      })),
      required: false,
    });

    if (!p.isCancel(expansionPacks) && expansionPacks.length > 0) {
      const s2 = p.spinner();
      s2.start('Installing expansion packs');

      const targetExpansionDir = path.join(context.projectRoot, 'expansion-packs');

      for (const pack of expansionPacks) {
        const sourcePack = path.join(sourceExpansionDir, pack);
        const targetPack = path.join(targetExpansionDir, pack);
        await fse.copy(sourcePack, targetPack);
        s2.message(`Installed: ${pack}`);
      }

      s2.stop(`${expansionPacks.length} expansion pack(s) installed`);
    }
  }

  p.outro(pc.green('✓ AIOS-FullStack installation complete!'));

  console.log('');
  p.note(
    `Mode: ${installMode}\n` +
    `Repository: ${context.repositoryUrl}\n` +
    `IDE: ${ide !== 'none' ? ide : 'none'}\n` +
    `PM Tool: ${pmTool}`,
    'Configuration Summary',
  );

  console.log('');
  console.log(pc.cyan('Next steps:'));
  console.log('  • Activate agents using @agent-name (e.g., @dev, @github-devops)');
  console.log('  • Run "aios --help" to see available commands');
  console.log('  • Check documentation in docs/ directory');
  console.log('');
}

/**
 * Updates .gitignore file based on installation mode
 */
function updateGitIgnore(mode, projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  let gitignore = '';
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }

  if (mode === 'project-development') {
    const frameworkRules = [
      '',
      '# AIOS-FullStack Framework Files (auto-managed - do not edit)',
      '.aios-core/',
      'node_modules/@aios/',
      'outputs/minds/',
      '.aios-installation-config.yaml',
      '# End AIOS-FullStack auto-managed section',
      '',
    ];

    const hasFrameworkSection = gitignore.includes('# AIOS-FullStack Framework Files');

    if (!hasFrameworkSection) {
      gitignore += frameworkRules.join('\n');
      fs.writeFileSync(gitignorePath, gitignore);
    }
  }
}

/**
 * Save PM configuration
 */
function savePMConfig(pmTool, config, projectRoot) {
  const pmConfigData = {
    pm_tool: {
      type: pmTool,
      configured_at: new Date().toISOString(),
      config: config,
    },
    sync_behavior: {
      auto_sync_on_status_change: true,
      create_tasks_on_story_creation: false,
      bidirectional_sync: false,
    },
  };

  const configPath = path.join(projectRoot, '.aios-pm-config.yaml');
  fs.writeFileSync(configPath, yaml.stringify(pmConfigData));
}

// Run installer with error handling
main().catch((error) => {
  p.log.error('Installation failed: ' + error.message);
  process.exit(1);
});
