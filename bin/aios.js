#!/usr/bin/env node

/**
 * AIOS-FullStack CLI
 * Main entry point - Standalone (no external dependencies for npx compatibility)
 * Version: 1.2.0
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];

// Helper: Run initialization wizard
async function runWizard() {
  // Use the new v2.1 wizard from src/wizard/index.js
  const wizardPath = path.join(__dirname, '..', 'src', 'wizard', 'index.js');

  if (!fs.existsSync(wizardPath)) {
    // Fallback to legacy wizard if new wizard not found
    const legacyScript = path.join(__dirname, 'aios-init.js');
    if (fs.existsSync(legacyScript)) {
      console.log('⚠️  Using legacy wizard (src/wizard not found)');
      require(legacyScript);
      return;
    }
    console.error('❌ Initialization wizard not found');
    console.error('Please ensure AIOS-FullStack is installed correctly.');
    process.exit(1);
  }

  try {
    // Run the new v2.1 wizard
    const { runWizard: executeWizard } = require(wizardPath);
    await executeWizard();
  } catch (error) {
    console.error('❌ Wizard error:', error.message);
    process.exit(1);
  }
}

// Helper: Show help
function showHelp() {
  console.log(`
AIOS-FullStack v${packageJson.version}
AI-Orchestrated System for Full Stack Development

USAGE:
  npx @synkra/aios-core@latest              # Run installation wizard
  npx @synkra/aios-core@latest install      # Install in current project
  npx @synkra/aios-core@latest init <name>  # Create new project
  npx @synkra/aios-core@latest validate     # Validate installation integrity
  npx @synkra/aios-core@latest info         # Show system info
  npx @synkra/aios-core@latest doctor       # Run diagnostics
  npx @synkra/aios-core@latest --version    # Show version
  npx @synkra/aios-core@latest --help       # Show this help

VALIDATION:
  aios validate                    # Validate installation integrity
  aios validate --repair           # Repair missing/corrupted files
  aios validate --repair --dry-run # Preview repairs
  aios validate --detailed         # Show detailed file list

SERVICE DISCOVERY:
  aios workers search <query>            # Search for workers
  aios workers search "json" --category=data
  aios workers search "transform" --tags=etl,data
  aios workers search "api" --format=json

EXAMPLES:
  # Install in current directory
  npx @synkra/aios-core@latest

  # Install with minimal mode (only expansion-creator)
  npx @synkra/aios-core-minimal@latest

  # Create new project
  npx @synkra/aios-core@latest init my-project

  # Search for workers
  aios workers search "json csv"

For more information, visit: https://github.com/SynkraAI/aios-core
`);
}

// Helper: Show version
function showVersion() {
  console.log(packageJson.version);
}

// Helper: Show system info
function showInfo() {
  console.log('📊 AIOS-FullStack System Information\n');
  console.log(`Version: ${packageJson.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log(`Install Location: ${path.join(__dirname, '..')}`);

  // Check if .aios-core exists
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    console.log('\n✓ AIOS Core installed');

    // Count components
    const countFiles = (dir) => {
      try {
        return fs.readdirSync(dir).length;
      } catch {
        return 0;
      }
    };

    console.log(`  - Agents: ${countFiles(path.join(aiosCoreDir, 'agents'))}`);
    console.log(`  - Tasks: ${countFiles(path.join(aiosCoreDir, 'tasks'))}`);
    console.log(`  - Templates: ${countFiles(path.join(aiosCoreDir, 'templates'))}`);
    console.log(`  - Workflows: ${countFiles(path.join(aiosCoreDir, 'workflows'))}`);
  } else {
    console.log('\n⚠️  AIOS Core not found');
  }
}

// Helper: Run installation validation
async function runValidate() {
  const validateArgs = args.slice(1); // Remove 'validate' from args

  try {
    // Load the validate command module
    const { createValidateCommand } = require('../.aios-core/cli/commands/validate/index.js');
    const validateCmd = createValidateCommand();

    // Parse and execute
    await validateCmd.parseAsync(['node', 'aios', 'validate', ...validateArgs]);
  } catch (_error) {
    // Fallback: Run quick validation inline
    console.log('Running installation validation...\n');

    try {
      const validatorPath = path.join(
        __dirname,
        '..',
        'src',
        'installer',
        'post-install-validator.js',
      );
      const { PostInstallValidator, formatReport } = require(validatorPath);

      const projectRoot = process.cwd();
      const validator = new PostInstallValidator(projectRoot, path.join(__dirname, '..'));
      const report = await validator.validate();

      console.log(formatReport(report, { colors: true }));

      if (
        report.status === 'failed' ||
        report.stats.missingFiles > 0 ||
        report.stats.corruptedFiles > 0
      ) {
        process.exit(1);
      }
    } catch (validatorError) {
      console.error(`❌ Validation error: ${validatorError.message}`);
      if (args.includes('--verbose') || args.includes('-v')) {
        console.error(validatorError.stack);
      }
      process.exit(2);
    }
  }
}

// Helper: Run doctor diagnostics
function runDoctor() {
  console.log('🏥 AIOS System Diagnostics\n');

  let hasErrors = false;

  // Check Node.js version
  const nodeVersion = process.version.replace('v', '');
  const requiredNodeVersion = '18.0.0';
  const compareVersions = (a, b) => {
    const pa = a.split('.').map((n) => parseInt(n, 10));
    const pb = b.split('.').map((n) => parseInt(n, 10));
    for (let i = 0; i < 3; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  };
  const nodeOk = compareVersions(nodeVersion, requiredNodeVersion) >= 0;

  console.log(
    `${nodeOk ? '✔' : '✗'} Node.js version: ${process.version} ${nodeOk ? '(meets requirement: >=18.0.0)' : '(requires >=18.0.0)'}`,
  );
  if (!nodeOk) hasErrors = true;

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✔ npm version: ${npmVersion}`);
  } catch {
    console.log('✗ npm not found');
    hasErrors = true;
  }

  // Check git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`✔ Git installed: ${gitVersion}`);
  } catch {
    console.log('⚠️  Git not found (optional but recommended)');
  }

  // Check AIOS installation
  const aiosCoreDir = path.join(__dirname, '..', '.aios-core');
  if (fs.existsSync(aiosCoreDir)) {
    console.log(`✔ Synkra AIOS: v${packageJson.version}`);
  } else {
    console.log('✗ AIOS Core not installed');
    console.log('  Run: npx @synkra/aios-core@latest');
    hasErrors = true;
  }

  // Summary
  console.log('');
  if (hasErrors) {
    console.log('⚠️  Some issues were detected.');
    process.exit(1);
  } else {
    console.log('✅ All checks passed! Your installation is healthy.');
  }
}

// Helper: Create new project
async function initProject(projectName) {
  if (!projectName) {
    console.error('❌ Project name is required');
    console.log('\nUsage: npx @synkra/aios-core@latest init <project-name>');
    process.exit(1);
  }

  // Handle "." to install in current directory
  const isCurrentDir = projectName === '.';
  const targetPath = isCurrentDir ? process.cwd() : path.join(process.cwd(), projectName);
  const displayName = isCurrentDir ? path.basename(process.cwd()) : projectName;

  console.log(`Creating new AIOS project: ${displayName}\n`);

  // Check if directory exists
  if (fs.existsSync(targetPath)) {
    // Allow if directory is empty or only has hidden files
    const contents = fs.readdirSync(targetPath).filter((f) => !f.startsWith('.'));
    if (contents.length > 0 && !isCurrentDir) {
      console.error(`❌ Directory already exists and is not empty: ${projectName}`);
      console.log('Use a different name or remove the existing directory.');
      process.exit(1);
    }
    // Directory exists but is empty or is current dir - proceed
    if (!isCurrentDir) {
      console.log(`✓ Using existing empty directory: ${projectName}`);
    }
  } else {
    // Create project directory
    fs.mkdirSync(targetPath, { recursive: true });
    console.log(`✓ Created directory: ${projectName}`);
  }

  // Change to project directory (if not already there)
  if (!isCurrentDir) {
    process.chdir(targetPath);
  }

  // Run the initialization wizard
  await runWizard();
}

// Command routing (async main function)
async function main() {
  switch (command) {
    case 'workers':
      // Service Discovery CLI - Story 2.7
      try {
        const { run } = require('../.aios-core/cli/index.js');
        await run(process.argv);
      } catch (error) {
        console.error(`❌ Workers command error: ${error.message}`);
        process.exit(1);
      }
      break;

    case 'install':
      // Install in current project
      console.log('AIOS-FullStack Installation\n');
      await runWizard();
      break;

    case 'init': {
      // Create new project
      const projectName = args[1];
      await initProject(projectName);
      break;
    }

    case 'info':
      showInfo();
      break;

    case 'doctor':
      runDoctor();
      break;

    case 'validate':
      // Post-installation validation - Story 6.19
      await runValidate();
      break;

    case '--version':
    case '-v':
    case '-V':
      showVersion();
      break;

    case '--help':
    case '-h':
      showHelp();
      break;

    case undefined:
      // No arguments - run wizard directly (npx default behavior)
      console.log('AIOS-FullStack Installation\n');
      await runWizard();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('\nRun with --help to see available commands');
      process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
