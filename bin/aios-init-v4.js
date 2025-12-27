#!/usr/bin/env node

/**
 * AIOS-FullStack Installation Wizard v4
 * Based on the original beautiful visual design with ASCII art
 * Version: 1.1.5
 */

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

// ASCII Art Banner (3D style like the original)
const BANNER = chalk.cyan(`
   ▄████████  ▄█   ▄██████▄     ▄████████           ▄████████ ███    █▄   ▄█        ▄█          ▄████████     ███        ▄████████  ▄████████    ▄█   ▄█▄
  ███    ███ ███  ███    ███   ███    ███          ███    ███ ███    ███ ███       ███         ███    ███ ▀█████████▄   ███    ███ ███    ███   ███ ▄███▀
  ███    ███ ███▌ ███    ███   ███    █▀           ███    █▀  ███    ███ ███       ███         ███    █▀     ▀███▀▀██   ███    ███ ███    █▀    ███▐██▀
  ███    ███ ███▌ ███    ███   ███                ▄███▄▄▄     ███    ███ ███       ███         ███            ███   ▀   ███    ███ ███         ▄█████▀
▀███████████ ███▌ ███    ███ ▀███████████        ▀▀███▀▀▀     ███    ███ ███       ███       ▀███████████     ███     ▀███████████ ███        ▀▀█████▄
  ███    ███ ███  ███    ███          ███          ███        ███    ███ ███       ███                ███     ███       ███    ███ ███    █▄    ███▐██▄
  ███    ███ ███  ███    ███    ▄█    ███          ███        ███    ███ ███▌    ▄ ███▌    ▄    ▄█    ███     ███       ███    ███ ███    ███   ███ ▀███▄
  ███    █▀  █▀    ▀██████▀   ▄████████▀           ███        ████████▀  █████▄▄██ █████▄▄██  ▄████████▀     ▄████▀     ███    █▀  ████████▀    ███   ▀█▀
                                                                          ▀         ▀                                                             ▀
`);

const SUBTITLE = chalk.magenta('🚀 Universal AI Agent Framework for Any Domain');
const VERSION = chalk.yellow('✨ Installer v4.31.0');

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

  // Display beautiful banner
  console.log(BANNER);
  console.log(SUBTITLE);
  console.log(VERSION);
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');

  const projectRoot = process.cwd();
  let context = detectRepositoryContext();

  // Setup prerequisites if needed
  if (!context) {
    console.log(chalk.blue('⚙️  Setting up project prerequisites...\n'));

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
        console.log(chalk.green('✓') + ' Git repository initialized');
      } catch (err) {
        console.error(chalk.red('✗') + ' Failed to initialize git repository');
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
      console.log(chalk.green('✓') + ' package.json created');
    }

    console.log(chalk.green('✓') + ' Prerequisites ready\n');

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

  console.log(chalk.cyan('📦 Package:') + ` ${context.packageName}`);
  console.log('');

  // Step 1: Installation Mode
  console.log(chalk.gray('─'.repeat(80)));
  const { installMode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installMode',
      message: chalk.white('How are you using AIOS-FullStack?'),
      choices: [
        {
          name: '  Using AIOS in a project ' + chalk.gray('(Framework files added to .gitignore)'),
          value: 'project-development',
        },
        {
          name: '  Developing AIOS framework itself ' + chalk.gray('(Framework files are source code)'),
          value: 'framework-development',
        },
      ],
    },
  ]);

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
  fs.writeFileSync(configPath, yaml.dump(config));

  // Update .gitignore
  updateGitIgnore(installMode, context.projectRoot);

  // Step 2: PM Tool
  console.log('');
  const { pmTool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'pmTool',
      message: chalk.white('Do you use a project management tool?'),
      choices: [
        { name: '  None (local YAML files only) ' + chalk.gray('- Recommended'), value: 'local' },
        { name: '  ClickUp ' + chalk.gray('- Requires API token'), value: 'clickup' },
        { name: '  GitHub Projects ' + chalk.gray('- Uses gh auth'), value: 'github-projects' },
        { name: '  Jira ' + chalk.gray('- Requires API token'), value: 'jira' },
      ],
    },
  ]);

  // Save PM config
  savePMConfig(pmTool, {}, context.projectRoot);

  // Step 3: IDE Selection (CHECKBOX with instructions)
  console.log('');
  console.log(chalk.gray('─'.repeat(80)));
  console.log(chalk.dim('  Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed'));
  console.log('');

  const { ides } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'ides',
      message: chalk.white('Which IDE(s) will you use?'),
      choices: [
        { name: '  Claude Code ' + chalk.blue('(v1.0)') + chalk.gray(' - Recommended'), value: 'claude' },
        { name: '  Windsurf ' + chalk.blue('(v1.0)'), value: 'windsurf' },
        { name: '  Cursor ' + chalk.blue('(v0.43)'), value: 'cursor' },
        { name: '  Skip IDE setup', value: 'none' },
      ],
      validate: function(answer) {
        if (answer.length < 1) {
          return 'You must choose at least one option.';
        }
        return true;
      },
    },
  ]);

  // Step 4: Copy AIOS Core files
  console.log('');
  console.log(chalk.blue('📦 Installing AIOS Core files...'));

  const sourceCoreDir = path.join(context.frameworkLocation, '.aios-core');
  const targetCoreDir = path.join(context.projectRoot, '.aios-core');

  if (fs.existsSync(sourceCoreDir)) {
    await fse.copy(sourceCoreDir, targetCoreDir);
    console.log(chalk.green('✓') + ' AIOS Core files installed ' + chalk.gray('(11 agents, 68 tasks, 23 templates)'));
  } else {
    console.error(chalk.red('✗') + ' AIOS Core files not found');
    process.exit(1);
  }

  // Copy IDE rules if IDE was selected
  if (!ides.includes('none')) {
    const ideRulesMap = {
      'claude': { source: 'claude-rules.md', target: '.claude/CLAUDE.md' },
      'windsurf': { source: 'windsurf-rules.md', target: '.windsurf/rules.md' },
      'cursor': { source: 'cursor-rules.md', target: '.cursor/rules.md' },
    };

    for (const ide of ides) {
      if (ide !== 'none' && ideRulesMap[ide]) {
        const ideConfig = ideRulesMap[ide];
        const sourceRules = path.join(targetCoreDir, 'templates', 'ide-rules', ideConfig.source);
        const targetRules = path.join(context.projectRoot, ideConfig.target);

        if (fs.existsSync(sourceRules)) {
          await fse.ensureDir(path.dirname(targetRules));
          await fse.copy(sourceRules, targetRules);
          console.log(chalk.green('✓') + ` ${ide.charAt(0).toUpperCase() + ide.slice(1)} rules installed`);
        }
      }
    }
  }

  // Step 5: Expansion Packs (CHECKBOX with visual)
  const sourceExpansionDir = path.join(context.frameworkLocation, 'expansion-packs');
  const availablePacks = [];

  if (fs.existsSync(sourceExpansionDir)) {
    const packs = fs.readdirSync(sourceExpansionDir).filter(f =>
      fs.statSync(path.join(sourceExpansionDir, f)).isDirectory(),
    );
    availablePacks.push(...packs);
  }

  if (availablePacks.length > 0) {
    console.log('');
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.dim('  Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed'));
    console.log('');

    const { expansionPacks } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'expansionPacks',
        message: chalk.white('Select expansion packs to install (optional)'),
        choices: availablePacks.map(pack => ({
          name: '  ' + pack,
          value: pack,
        })),
      },
    ]);

    if (expansionPacks.length > 0) {
      console.log('');
      console.log(chalk.blue('📦 Installing expansion packs...'));

      const targetExpansionDir = path.join(context.projectRoot, 'expansion-packs');

      for (const pack of expansionPacks) {
        const sourcePack = path.join(sourceExpansionDir, pack);
        const targetPack = path.join(targetExpansionDir, pack);
        await fse.copy(sourcePack, targetPack);
        console.log(chalk.green('✓') + ` Installed: ${pack}`);
      }
    }
  }

  // Summary
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
  console.log('');
  console.log(chalk.green.bold('✓ AIOS-FullStack installation complete! 🎉'));
  console.log('');
  console.log(chalk.cyan('📋 Configuration Summary:'));
  console.log('  ' + chalk.dim('Mode:       ') + installMode);
  console.log('  ' + chalk.dim('Repository: ') + context.repositoryUrl);
  console.log('  ' + chalk.dim('IDE(s):     ') + (ides.includes('none') ? 'none' : ides.join(', ')));
  console.log('  ' + chalk.dim('PM Tool:    ') + pmTool);
  console.log('');
  console.log(chalk.cyan('📚 Next steps:'));
  console.log('  • Activate agents using @agent-name (e.g., @dev, @github-devops)');
  console.log('  • Run ' + chalk.yellow('"aios --help"') + ' to see available commands');
  console.log('  • Check documentation in ' + chalk.yellow('docs/') + ' directory');
  console.log('');
  console.log(chalk.gray('═'.repeat(80)));
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
  fs.writeFileSync(configPath, yaml.dump(pmConfigData));
}

// Run installer with error handling
main().catch((error) => {
  console.error('');
  console.error(chalk.red('✗ Installation failed: ') + error.message);
  console.error('');
  process.exit(1);
});
