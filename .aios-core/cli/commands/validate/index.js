/**
 * Validate Command Module
 *
 * CLI command for validating AIOS-Core installation integrity.
 * Compares installed files against the install manifest.
 *
 * @module cli/commands/validate
 * @version 1.0.0
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 *
 * Usage:
 *   aios validate                    # Validate current installation
 *   aios validate --repair           # Repair missing/corrupted files
 *   aios validate --repair --dry-run # Preview repairs without applying
 *   aios validate --detailed         # Show detailed file list
 *   aios validate --json             # Output as JSON
 */

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');

// Resolve validator module path
const validatorPath = path.resolve(__dirname, '../../../../src/installer/post-install-validator');
let PostInstallValidator, formatReport, quickValidate;

try {
  const validator = require(validatorPath);
  PostInstallValidator = validator.PostInstallValidator;
  formatReport = validator.formatReport;
  quickValidate = validator.quickValidate;
} catch (error) {
  // Fallback for development/testing
  console.error(chalk.yellow('Warning: Could not load validator module'), error.message);
}

/**
 * Create the validate command
 * @returns {Command} Commander command instance
 */
function createValidateCommand() {
  const validate = new Command('validate');

  validate
    .description('Validate AIOS-Core installation integrity')
    .option('-r, --repair', 'Repair missing or corrupted files')
    .option('-d, --dry-run', 'Preview repairs without applying (use with --repair)')
    .option('--detailed', 'Show detailed file list')
    .option('--no-hash', 'Skip hash verification (faster)')
    .option('--extras', 'Detect extra files not in manifest')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--json', 'Output results as JSON')
    .option('--source <dir>', 'Source directory for repairs')
    .addHelpText(
      'after',
      `
Examples:
  ${chalk.dim('# Validate current installation')}
  $ aios validate

  ${chalk.dim('# Validate with detailed file list')}
  $ aios validate --detailed

  ${chalk.dim('# Repair missing/corrupted files')}
  $ aios validate --repair

  ${chalk.dim('# Preview what would be repaired')}
  $ aios validate --repair --dry-run

  ${chalk.dim('# Quick validation (skip hash check)')}
  $ aios validate --no-hash

  ${chalk.dim('# Output as JSON for CI/CD')}
  $ aios validate --json

Exit Codes:
  0 - Validation passed
  1 - Validation failed (missing/corrupted files)
  2 - Validation error (could not complete)
`
    )
    .action(async (options) => {
      await runValidation(options);
    });

  return validate;
}

/**
 * Run the validation process
 * @param {Object} options - Command options
 */
async function runValidation(options) {
  const projectRoot = process.cwd();
  const aiosCoreDir = path.join(projectRoot, '.aios-core');

  // Check if AIOS-Core is installed
  if (!fs.existsSync(aiosCoreDir)) {
    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'failed',
            error: 'AIOS-Core not found in current directory',
            path: projectRoot,
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red('\nError: AIOS-Core not found in current directory'));
      console.error(chalk.dim(`Expected at: ${aiosCoreDir}`));
      console.error(chalk.dim('\nRun `npx aios-core install` to install AIOS-Core'));
    }
    process.exit(2);
  }

  // Check if validator module is available
  if (!PostInstallValidator) {
    console.error(chalk.red('\nError: Validator module not available'));
    console.error(chalk.dim('This may indicate a corrupted installation'));
    process.exit(2);
  }

  // Determine source directory for repairs
  let sourceDir = options.source;
  if (!sourceDir && options.repair) {
    // Try to find source in common locations
    const possibleSources = [
      path.join(__dirname, '../../../../..'), // npm package root
      path.join(projectRoot, 'node_modules/aios-core'),
      path.join(projectRoot, 'node_modules/@synkra/aios-core'),
    ];

    for (const src of possibleSources) {
      if (fs.existsSync(path.join(src, '.aios-core', 'install-manifest.yaml'))) {
        sourceDir = src;
        break;
      }
    }
  }

  // Create validator instance
  const validator = new PostInstallValidator(projectRoot, sourceDir, {
    verifyHashes: options.hash !== false,
    detectExtras: options.extras === true,
    verbose: options.verbose === true,
    onProgress: options.json
      ? () => {}
      : (current, total, file) => {
          if (spinner) {
            spinner.text = `Validating ${current}/${total}: ${truncatePath(file, 40)}`;
          }
        },
  });

  // Show spinner for non-JSON output
  let spinner;
  if (!options.json) {
    console.log('');
    spinner = ora({
      text: 'Loading installation manifest...',
      color: 'cyan',
    }).start();
  }

  try {
    // Run validation
    const report = await validator.validate();

    if (spinner) {
      spinner.succeed('Validation complete');
    }

    // Handle repair mode
    if (options.repair && (report.stats.missingFiles > 0 || report.stats.corruptedFiles > 0)) {
      if (!sourceDir) {
        if (!options.json) {
          console.error(chalk.yellow('\nWarning: Cannot repair - source directory not found'));
          console.error(
            chalk.dim('Specify source with --source <dir> or ensure package is installed')
          );
        }
      } else {
        await runRepair(validator, options, spinner);
      }
    }

    // Output results
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatReport(report, { colors: true, detailed: options.detailed }));
    }

    // Exit with appropriate code
    if (report.status === 'failed') {
      process.exit(1);
    } else if (report.status === 'warning' && report.stats.missingFiles > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    if (spinner) {
      spinner.fail('Validation failed');
    }

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: 'error',
            error: error.message,
            stack: options.verbose ? error.stack : undefined,
          },
          null,
          2
        )
      );
    } else {
      console.error(chalk.red(`\nError: ${error.message}`));
      if (options.verbose) {
        console.error(chalk.dim(error.stack));
      }
    }

    process.exit(2);
  }
}

/**
 * Run repair process
 * @param {PostInstallValidator} validator - Validator instance
 * @param {Object} options - Command options
 * @param {Object} spinner - Ora spinner instance
 */
async function runRepair(validator, options, spinner) {
  const dryRun = options.dryRun === true;

  if (!options.json) {
    console.log('');
    if (dryRun) {
      spinner = ora({
        text: 'Analyzing files to repair (dry run)...',
        color: 'yellow',
      }).start();
    } else {
      spinner = ora({
        text: 'Repairing files...',
        color: 'green',
      }).start();
    }
  }

  const repairResult = await validator.repair({
    dryRun,
    onProgress: options.json
      ? () => {}
      : (current, total, file) => {
          if (spinner) {
            const action = dryRun ? 'Checking' : 'Repairing';
            spinner.text = `${action} ${current}/${total}: ${truncatePath(file, 40)}`;
          }
        },
  });

  if (spinner) {
    if (repairResult.success) {
      const action = dryRun ? 'would be repaired' : 'repaired';
      spinner.succeed(`${repairResult.repaired.length} file(s) ${action}`);
    } else {
      spinner.warn('Repair completed with some failures');
    }
  }

  if (!options.json) {
    // Show repair summary
    if (repairResult.repaired.length > 0) {
      console.log('');
      console.log(chalk.bold(dryRun ? 'Files that would be repaired:' : 'Repaired files:'));
      for (const file of repairResult.repaired.slice(0, 20)) {
        const icon = dryRun ? chalk.yellow('○') : chalk.green('✓');
        console.log(`  ${icon} ${file.path}`);
      }
      if (repairResult.repaired.length > 20) {
        console.log(chalk.dim(`  ... and ${repairResult.repaired.length - 20} more`));
      }
    }

    if (repairResult.failed.length > 0) {
      console.log('');
      console.log(chalk.bold(chalk.red('Failed to repair:')));
      for (const file of repairResult.failed) {
        console.log(`  ${chalk.red('✗')} ${file.path}: ${file.reason}`);
      }
    }
  }
}

/**
 * Truncate path for display
 * @param {string} filePath - File path
 * @param {number} maxLen - Maximum length
 * @returns {string} - Truncated path
 */
function truncatePath(filePath, maxLen) {
  if (!filePath || filePath.length <= maxLen) return filePath;
  return '...' + filePath.slice(-(maxLen - 3));
}

module.exports = {
  createValidateCommand,
};
