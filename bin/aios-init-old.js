#!/usr/bin/env node
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * Smart path resolution for AIOS Core modules
 * Works in both development and NPM package environments (global and local)
 *
 * Package structure is consistent:
 * - Development: bin/aios-init.js → ../.aios-core/
 * - NPM Global: node_modules/@synkra/aios-core/bin/aios-init.js → ../.aios-core/
 * - NPM Local: node_modules/@synkra/aios-core/bin/aios-init.js → ../.aios-core/
 *
 * @param {string} modulePath - Relative path within .aios-core (e.g., 'utils/repository-detector')
 * @returns {any} - Required module
 */
function resolveAiosCoreModule(modulePath) {
  // Path is always ../.aios-core/ relative to bin/
  const aiosCoreModule = path.join(__dirname, '..', '.aios-core', modulePath);

  // Check if file exists (with .js extension or as directory)
  const moduleExists = fs.existsSync(aiosCoreModule + '.js') ||
                       fs.existsSync(aiosCoreModule + '/index.js') ||
                       fs.existsSync(aiosCoreModule);

  if (!moduleExists) {
    throw new Error(
      `Cannot find AIOS Core module: ${modulePath}\n` +
      `Searched: ${aiosCoreModule}\n` +
      `__dirname: ${__dirname}\n` +
      'Please ensure @synkra/aios-core is installed correctly.',
    );
  }

  return require(aiosCoreModule);
}

// Load AIOS Core modules using smart path resolution
const { detectRepositoryContext } = resolveAiosCoreModule('utils/repository-detector');
const { ClickUpAdapter } = resolveAiosCoreModule('utils/pm-adapters/clickup-adapter');
const { GitHubProjectsAdapter } = resolveAiosCoreModule('utils/pm-adapters/github-adapter');
const { JiraAdapter } = resolveAiosCoreModule('utils/pm-adapters/jira-adapter');

/**
 * Updates .gitignore file based on installation mode
 * Inline implementation (gitignore-manager was archived in Story 3.18)
 *
 * @param {string} mode - 'framework-development' or 'project-development'
 * @param {string} projectRoot - Path to project root directory
 */
function updateGitIgnore(mode, projectRoot) {
  const gitignorePath = path.join(projectRoot, '.gitignore');

  let gitignore = '';
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }

  if (mode === 'project-development') {
    // Add AIOS framework files to gitignore
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

    // Check if rules already exist
    const hasFrameworkSection = gitignore.includes('# AIOS-FullStack Framework Files');

    if (!hasFrameworkSection) {
      gitignore += frameworkRules.join('\n');
      fs.writeFileSync(gitignorePath, gitignore);
      console.log('✓ Updated .gitignore with AIOS framework rules');
    } else {
      console.log('✓ .gitignore already has AIOS framework rules');
    }
  } else if (mode === 'framework-development') {
    // In framework-development mode, ensure .aios-core/ is NOT in .gitignore
    // Check if rules exist and warn user
    if (gitignore.includes('.aios-core/')) {
      console.log('⚠️  Warning: .aios-core/ found in .gitignore but mode is framework-development');
      console.log('   Framework files should be committed. Consider removing .aios-core/ from .gitignore');
    } else {
      console.log('✓ .gitignore configuration correct for framework-development mode');
    }
  }
}

async function init() {
  console.log('🚀 AIOS-FullStack Initialization\n');

  const { execSync } = require('child_process');
  const projectRoot = process.cwd();

  // Detect current context
  let context = detectRepositoryContext();

  // If no context, help user set up prerequisites
  if (!context) {
    console.log('⚙️  Setting up project prerequisites...\n');

    // Check for git repository
    let hasGit = false;
    try {
      execSync('git rev-parse --git-dir', { cwd: projectRoot, stdio: 'ignore' });
      hasGit = true;
    } catch (err) {
      // Not a git repo
    }

    if (!hasGit) {
      console.log('📦 Initializing git repository...');
      try {
        execSync('git init', { cwd: projectRoot, stdio: 'inherit' });
        console.log('✓ Git repository created\n');
      } catch (err) {
        console.error('❌ Failed to initialize git repository:', err.message);
        console.error('Please run: git init');
        process.exit(1);
      }
    }

    // Check for package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('📦 Creating package.json...');
      const dirName = path.basename(projectRoot);
      const defaultPackage = {
        name: dirName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: 'AIOS-FullStack project',
        main: 'index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
        },
        keywords: [],
        author: '',
        license: 'ISC',
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackage, null, 2));
      console.log('✓ package.json created\n');
    }

    // Try to detect context again (might still be null if no remote origin)
    context = detectRepositoryContext();

    // If still no context, create a minimal one
    if (!context) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      context = {
        projectRoot,
        packageName: packageJson.name,
        packageVersion: packageJson.version,
        repositoryUrl: 'local-repository', // No remote yet
        frameworkLocation: path.join(__dirname, '..'),
      };
      console.log('✓ Project context created (no remote origin yet)\n');
    }
  }

  if (context.repositoryUrl !== 'local-repository') {
    console.log(`Detected repository: ${context.repositoryUrl}`);
  }
  console.log(`Package: ${context.packageName}\n`);

  // Ask user for mode
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Como você está usando o AIOS-FullStack?',
      choices: [
        {
          name: '1. Desenvolvendo o próprio framework AIOS-FullStack',
          value: 'framework-development',
        },
        {
          name: '2. Usando AIOS-FullStack em um projeto',
          value: 'project-development',
        },
      ],
    },
  ]);

  // Create installation config
  const config = {
    installation: {
      mode: answers.mode,
      detected_at: new Date().toISOString(),
    },
    repository: {
      url: context.repositoryUrl,
      auto_detect: true,
    },
    framework: {
      source: answers.mode === 'framework-development' ? 'local' : 'npm',
      version: context.packageVersion,
      location: context.frameworkLocation,
    },
    git_ignore_rules: {
      mode: answers.mode,
      ignore_framework_files: answers.mode === 'project-development',
    },
  };

  // Save config
  const configPath = path.join(context.projectRoot, '.aios-installation-config.yaml');
  fs.writeFileSync(configPath, yaml.dump(config));
  console.log(`\n✓ Created ${configPath}`);

  // Update .gitignore
  updateGitIgnore(answers.mode, context.projectRoot);

  // Step 3: PM Tool Configuration (Optional)
  console.log('\n📋 Step 3: Project Management Tool (Optional)\n');

  const pmToolAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'pmTool',
      message: 'Do you use a project management tool?',
      choices: [
        {
          name: '1. ClickUp (requires API token)',
          value: 'clickup',
        },
        {
          name: '2. GitHub Projects (uses existing gh auth)',
          value: 'github-projects',
        },
        {
          name: '3. Jira (requires API token)',
          value: 'jira',
        },
        {
          name: '4. None (local YAML files only)',
          value: 'local',
        },
      ],
    },
  ]);

  const pmTool = pmToolAnswer.pmTool;
  let pmConfig = null;

  if (pmTool !== 'local') {
    pmConfig = await collectPMConfig(pmTool, context.projectRoot);

    if (pmConfig) {
      // Test connection
      console.log('\n🔌 Testing connection...');
      const adapter = createAdapter(pmTool, pmConfig);
      const testResult = await adapter.testConnection();

      if (testResult.success) {
        console.log('✅ Connection successful!');
        savePMConfig(pmTool, pmConfig, context.projectRoot);
      } else {
        console.error('❌ Connection failed:', testResult.error);
        console.log('⚠️  Falling back to local-only mode');
        savePMConfig('local', {}, context.projectRoot);
      }
    } else {
      console.log('⚠️  Configuration cancelled - using local-only mode');
      savePMConfig('local', {}, context.projectRoot);
    }
  } else {
    console.log('✓ Local-only mode selected - no PM tool integration');
    savePMConfig('local', {}, context.projectRoot);
  }

  // Step 4: IDE Selection
  console.log('\n💻 Step 4: IDE Configuration\n');

  const ideAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'ide',
      message: 'Which IDE will you use?',
      choices: [
        { name: '1. Claude Code (recommended)', value: 'claude' },
        { name: '2. Windsurf', value: 'windsurf' },
        { name: '3. Cursor', value: 'cursor' },
        { name: '4. Skip IDE setup', value: 'none' },
      ],
    },
  ]);

  // Step 5: Copy AIOS Core files
  console.log('\n📦 Step 5: Installing AIOS Core files...\n');

  const fse = require('fs-extra');
  const sourceCoreDir = path.join(context.frameworkLocation, '.aios-core');
  const targetCoreDir = path.join(context.projectRoot, '.aios-core');

  if (fs.existsSync(sourceCoreDir)) {
    await fse.copy(sourceCoreDir, targetCoreDir);
    console.log('✓ AIOS Core files installed');
  } else {
    console.error('❌ AIOS Core files not found at:', sourceCoreDir);
  }

  // Copy IDE rules if IDE was selected
  if (ideAnswer.ide !== 'none') {
    const ideRulesMap = {
      'claude': { source: 'claude-rules.md', target: '.claude/CLAUDE.md' },
      'windsurf': { source: 'windsurf-rules.md', target: '.windsurf/rules.md' },
      'cursor': { source: 'cursor-rules.md', target: '.cursor/rules.md' },
    };

    const ideConfig = ideRulesMap[ideAnswer.ide];
    if (ideConfig) {
      const sourceRules = path.join(targetCoreDir, 'templates', 'ide-rules', ideConfig.source);
      const targetRules = path.join(context.projectRoot, ideConfig.target);

      if (fs.existsSync(sourceRules)) {
        await fse.copy(sourceRules, targetRules);
        console.log(`✓ ${ideAnswer.ide} rules installed: ${ideConfig.target}`);
      }
    }
  }

  // Step 6: Expansion Packs Selection
  console.log('\n🎁 Step 6: Expansion Packs (Optional)\n');

  const sourceExpansionDir = path.join(context.frameworkLocation, 'expansion-packs');
  const availablePacks = [];

  if (fs.existsSync(sourceExpansionDir)) {
    const packs = fs.readdirSync(sourceExpansionDir).filter(f =>
      fs.statSync(path.join(sourceExpansionDir, f)).isDirectory(),
    );
    availablePacks.push(...packs);
  }

  if (availablePacks.length > 0) {
    const expansionAnswer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'packs',
        message: 'Select expansion packs to install:',
        choices: [
          ...availablePacks.map(pack => ({ name: pack, value: pack })),
          { name: 'None (skip)', value: '__none__' },
        ],
      },
    ]);

    if (expansionAnswer.packs.length > 0 && !expansionAnswer.packs.includes('__none__')) {
      const targetExpansionDir = path.join(context.projectRoot, 'expansion-packs');

      for (const pack of expansionAnswer.packs) {
        const sourcePack = path.join(sourceExpansionDir, pack);
        const targetPack = path.join(targetExpansionDir, pack);
        await fse.copy(sourcePack, targetPack);
        console.log(`✓ Installed expansion pack: ${pack}`);
      }
    } else {
      console.log('✓ No expansion packs selected');
    }
  } else {
    console.log('⚠️  No expansion packs available');
  }

  console.log('\n✅ AIOS-FullStack initialization complete!');
  console.log(`\nMode: ${answers.mode}`);
  console.log('Repository: ' + context.repositoryUrl);

  if (answers.mode === 'project-development') {
    console.log('\n📝 Note: Framework files (.aios-core/) added to .gitignore');
  } else {
    console.log('\n📝 Note: Framework files (.aios-core/) are SOURCE CODE and will be committed');
  }

  console.log('\n🎯 Next steps:');
  console.log('  - Activate agents using @agent-name (e.g., @dev, @github-devops)');
  console.log('  - Run "aios --help" to see available commands');
  console.log('  - Check documentation in docs/ directory');
}

/**
 * Collect PM tool-specific configuration
 */
async function collectPMConfig(pmTool, projectRoot) {
  try {
    if (pmTool === 'clickup') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'team_id',
          message: 'ClickUp Team ID:',
          validate: input => input.length > 0 || 'Team ID is required',
        },
        {
          type: 'input',
          name: 'space_id',
          message: 'ClickUp Space ID:',
          validate: input => input.length > 0 || 'Space ID is required',
        },
        {
          type: 'input',
          name: 'list_id',
          message: 'ClickUp List ID (for stories):',
          validate: input => input.length > 0 || 'List ID is required',
        },
      ]);

      console.log('\n📝 Note: Set CLICKUP_API_TOKEN environment variable with your API token');

      return {
        api_token: '${CLICKUP_API_TOKEN}',
        team_id: answers.team_id,
        space_id: answers.space_id,
        list_id: answers.list_id,
      };
    }

    if (pmTool === 'github-projects') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'org',
          message: 'GitHub Organization or Username:',
          validate: input => input.length > 0 || 'Organization is required',
        },
        {
          type: 'number',
          name: 'project_number',
          message: 'GitHub Project Number:',
          validate: input => input > 0 || 'Project number must be positive',
        },
      ]);

      console.log('\n📝 Note: GitHub Projects uses existing "gh auth" authentication');

      return {
        org: answers.org,
        project_number: answers.project_number,
      };
    }

    if (pmTool === 'jira') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'base_url',
          message: 'Jira Base URL (e.g., https://yourcompany.atlassian.net):',
          validate: input => input.startsWith('http') || 'Must be a valid URL',
        },
        {
          type: 'input',
          name: 'project_key',
          message: 'Jira Project Key (e.g., AIOS):',
          validate: input => input.length > 0 || 'Project key is required',
        },
        {
          type: 'input',
          name: 'email',
          message: 'Jira Account Email:',
          validate: input => input.includes('@') || 'Must be a valid email',
        },
      ]);

      console.log('\n📝 Note: Set JIRA_API_TOKEN environment variable with your API token');

      return {
        base_url: answers.base_url,
        project_key: answers.project_key,
        email: answers.email,
        api_token: '${JIRA_API_TOKEN}',
      };
    }

    return null;
  } catch (error) {
    if (error.isTtyError || error.name === 'ExitPromptError') {
      // User cancelled or TTY issue
      return null;
    }
    throw error;
  }
}

/**
 * Create adapter instance for testing
 */
function createAdapter(pmTool, config) {
  switch (pmTool) {
    case 'clickup':
      return new ClickUpAdapter(config);
    case 'github-projects':
      return new GitHubProjectsAdapter(config);
    case 'jira':
      return new JiraAdapter(config);
    default:
      throw new Error(`Unknown PM tool: ${pmTool}`);
  }
}

/**
 * Save PM configuration to .aios-pm-config.yaml
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
  console.log(`✓ Created ${configPath}`);
}

init().catch(error => {
  console.error('❌ Initialization failed:', error);
  process.exit(1);
});
