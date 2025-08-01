#!/usr/bin/env node

/**
 * AIOS-FULLSTACK NPX Entry Point
 * Main executable for npx aios-fullstack commands
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const packageJson = require('../package.json');

// Import command handlers
const InstallCommand = require('../install/commands/install');
const InitCommand = require('../install/commands/init');
const InfoCommand = require('../install/commands/info');
const DoctorCommand = require('../install/commands/doctor');

// Create main program
const program = new Command();

// ASCII Art Logo
const logo = `
╔═══════════════════════════════════════════════╗
║     ___    ____  ____  _____                  ║
║    / _ \\  |  _ \\|  _ \\/ ____|                 ║
║   / /_\\ \\ | |_) | |_) | (___                  ║
║  / /___\\ \\|  _ <|  _ < \\___ \\                 ║
║ /_/     \\_\\_| \\_\\_| \\_\\____) |                ║
║                                               ║
║        F U L L S T A C K   v${packageJson.version.padEnd(17)}║
╚═══════════════════════════════════════════════╝
`;

// Display logo for interactive commands
if (!process.argv.includes('--no-logo')) {
  console.log(chalk.cyan(logo));
}

// Configure program
program
  .name('aios-fullstack')
  .description('AIOS-FULLSTACK - AI-powered self-modifying development framework')
  .version(packageJson.version)
  .option('--no-logo', 'Skip displaying the logo')
  .option('--debug', 'Enable debug output');

// Install command
program
  .command('install')
  .alias('i')
  .description('Install AIOS-FULLSTACK in the current directory')
  .option('-f, --force', 'Force installation even if directory is not empty')
  .option('-s, --skip-git', 'Skip git initialization')
  .option('-q, --quiet', 'Minimal output')
  .option('--no-telemetry', 'Disable telemetry')
  .action(async (options) => {
    try {
      const installer = new InstallCommand(options);
      await installer.run();
    } catch (error) {
      console.error(chalk.red('Installation failed:'), error.message);
      if (options.debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Init command
program
  .command('init [project-name]')
  .description('Initialize a new AIOS-FULLSTACK project')
  .option('-t, --template <template>', 'Use a specific template', 'default')
  .option('-f, --force', 'Force initialization in non-empty directory')
  .option('-s, --skip-install', 'Skip dependency installation')
  .option('--no-git', 'Skip git initialization')
  .action(async (projectName, options) => {
    try {
      const initCmd = new InitCommand(options);
      await initCmd.run(projectName);
    } catch (error) {
      console.error(chalk.red('Initialization failed:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Display system information and compatibility')
  .action(async () => {
    try {
      const infoCmd = new InfoCommand();
      await infoCmd.run();
    } catch (error) {
      console.error(chalk.red('Info command failed:'), error.message);
      process.exit(1);
    }
  });

// Doctor command
program
  .command('doctor')
  .description('Run system diagnostics and fix common issues')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(async (options) => {
    try {
      const doctorCmd = new DoctorCommand(options);
      await doctorCmd.run();
    } catch (error) {
      console.error(chalk.red('Doctor command failed:'), error.message);
      process.exit(1);
    }
  });

// Quick start command (default when no command specified)
program
  .command('quickstart', { isDefault: true, hidden: true })
  .action(async () => {
    console.log(chalk.blue('Welcome to AIOS-FULLSTACK! 🚀\n'));
    console.log('Available commands:\n');
    console.log(chalk.green('  npx aios-fullstack init [project-name]') + '  - Create a new project');
    console.log(chalk.green('  npx aios-fullstack install') + '              - Install in current directory');
    console.log(chalk.green('  npx aios-fullstack info') + '                 - Display system information');
    console.log(chalk.green('  npx aios-fullstack doctor') + '               - Run diagnostics\n');
    console.log('For more information, visit: https://aios-fullstack.dev');
  });

// Error handling
program.exitOverride();

try {
  // Check Node.js version
  const requiredVersion = packageJson.engines.node;
  if (!semver.satisfies(process.version, requiredVersion)) {
    console.error(chalk.red(`Error: Node.js ${requiredVersion} or higher is required.`));
    console.error(chalk.yellow(`You are using Node.js ${process.version}`));
    process.exit(1);
  }

  // Parse arguments
  program.parse(process.argv);
} catch (error) {
  if (error.code === 'commander.unknownCommand') {
    console.error(chalk.red('Unknown command:', error.message));
    console.log('\nRun', chalk.cyan('npx aios-fullstack --help'), 'for available commands');
  } else {
    console.error(chalk.red('Error:'), error.message);
    if (program.opts().debug) {
      console.error(error.stack);
    }
  }
  process.exit(1);
}