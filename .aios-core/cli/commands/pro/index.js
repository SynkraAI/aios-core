/**
 * Pro Command Module
 *
 * CLI commands for AIOS Pro license management and feature gating.
 *
 * Subcommands:
 *   aios pro activate --key <KEY>    Activate a license key
 *   aios pro status                   Show license status
 *   aios pro deactivate               Deactivate the current license
 *   aios pro features                 List all pro features
 *   aios pro validate                 Force online revalidation
 *   aios pro setup                    Configure GitHub Packages access (AC-12)
 *
 * @module cli/commands/pro
 * @version 1.1.0
 * @story PRO-6 — License Key & Feature Gating System
 */

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Resolve license modules (relative from .aios-core/cli/commands/pro/)
const licensePath = path.resolve(__dirname, '..', '..', '..', '..', 'pro', 'license');

/**
 * Lazy-load license modules (avoids failing if pro module not installed)
 */
function loadLicenseModules() {
  try {
    const { featureGate } = require(path.join(licensePath, 'feature-gate'));
    const { licenseApi } = require(path.join(licensePath, 'license-api'));
    const {
      writeLicenseCache,
      readLicenseCache,
      deleteLicenseCache,
      hasPendingDeactivation,
      setPendingDeactivation,
      clearPendingDeactivation,
    } = require(path.join(licensePath, 'license-cache'));
    const {
      generateMachineId,
      maskKey,
      validateKeyFormat,
    } = require(path.join(licensePath, 'license-crypto'));
    const { ProFeatureError, LicenseActivationError } = require(path.join(licensePath, 'errors'));

    return {
      featureGate,
      licenseApi,
      writeLicenseCache,
      readLicenseCache,
      deleteLicenseCache,
      hasPendingDeactivation,
      setPendingDeactivation,
      clearPendingDeactivation,
      generateMachineId,
      maskKey,
      validateKeyFormat,
      ProFeatureError,
      LicenseActivationError,
    };
  } catch (error) {
    console.error('AIOS Pro license module not available.');
    console.error('Install AIOS Pro: npm install @aios/pro');
    process.exit(1);
  }
}

/**
 * Get AIOS Core version from package.json
 */
function getAiosCoreVersion() {
  try {
    const pkgPath = path.resolve(__dirname, '..', '..', '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Ask user for confirmation
 */
async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// ---------------------------------------------------------------------------
// aios pro activate
// ---------------------------------------------------------------------------

async function activateAction(options) {
  const {
    licenseApi,
    writeLicenseCache,
    generateMachineId,
    maskKey,
    validateKeyFormat,
    featureGate,
    LicenseActivationError,
  } = loadLicenseModules();

  const key = options.key;

  if (!key) {
    console.error('Error: License key is required');
    console.error('Usage: aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    process.exit(1);
  }

  // Validate key format
  if (!validateKeyFormat(key)) {
    console.error('Error: Invalid license key format');
    console.error('Expected format: PRO-XXXX-XXXX-XXXX-XXXX');
    process.exit(1);
  }

  console.log('\nActivating AIOS Pro license...');
  console.log(`Key: ${maskKey(key)}`);
  console.log('');

  try {
    const machineId = generateMachineId();
    const aiosCoreVersion = getAiosCoreVersion();

    const result = await licenseApi.activate(key, machineId, aiosCoreVersion);

    // Write encrypted cache
    const cacheData = {
      key: result.key,
      activatedAt: result.activatedAt,
      expiresAt: result.expiresAt,
      features: result.features,
      seats: result.seats,
      cacheValidDays: result.cacheValidDays,
      gracePeriodDays: result.gracePeriodDays,
    };

    const writeResult = writeLicenseCache(cacheData);
    if (!writeResult.success) {
      console.error(`Warning: Could not save license cache: ${writeResult.error}`);
    }

    // Reload feature gate
    featureGate.reload();

    // Display success
    console.log('License activated successfully!\n');
    console.log('  Status:       Active');
    console.log(`  Key:          ${maskKey(result.key)}`);
    console.log(`  Features:     ${result.features.join(', ')}`);
    console.log(`  Seats:        ${result.seats.used}/${result.seats.max} used`);
    console.log(`  Valid until:  ${formatDate(result.expiresAt)}`);
    console.log(`  Cache:        ${result.cacheValidDays} days offline operation`);
    console.log('');

  } catch (error) {
    if (error instanceof LicenseActivationError) {
      console.error(`\nActivation failed: ${error.message}`);
      console.error(`Error code: ${error.code}`);
      if (error.details && Object.keys(error.details).length > 0) {
        console.error('Details:', JSON.stringify(error.details, null, 2));
      }
    } else {
      console.error(`\nActivation failed: ${error.message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aios pro status
// ---------------------------------------------------------------------------

function statusAction() {
  const {
    featureGate,
    readLicenseCache,
    maskKey,
    hasPendingDeactivation,
  } = loadLicenseModules();

  console.log('\nAIOS Pro License Status\n');

  const cache = readLicenseCache();
  const state = featureGate.getLicenseState();
  const info = featureGate.getLicenseInfo();

  // State display
  const stateEmoji = {
    'Active': '\u2705',     // Green check
    'Grace': '\u26A0\uFE0F', // Warning
    'Expired': '\u274C',    // Red X
    'Not Activated': '\u2796', // Minus
  };

  console.log(`  License:       ${stateEmoji[state] || ''} ${state}`);

  if (!cache) {
    console.log('\n  No license activated.');
    console.log('  Activate: aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    console.log('  Purchase: https://synkra.ai/pro');
    console.log('');
    return;
  }

  // Key (masked)
  console.log(`  Key:           ${maskKey(cache.key)}`);

  // Features
  if (info && info.features) {
    console.log(`  Features:      ${info.features.join(', ')}`);
  }

  // Seats
  if (cache.seats) {
    console.log(`  Seats:         ${cache.seats.used}/${cache.seats.max} used`);
  }

  // Cache validity
  if (cache.activatedAt) {
    const activatedDate = new Date(cache.activatedAt);
    const cacheValidDays = cache.cacheValidDays || 30;
    const expiryDate = new Date(activatedDate.getTime() + cacheValidDays * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

    if (daysRemaining > 0) {
      console.log(`  Cache:         Valid until ${formatDate(expiryDate)} (${daysRemaining} days remaining)`);
    } else {
      console.log(`  Cache:         Expired ${formatDate(expiryDate)}`);
    }
  }

  // Grace period warning
  if (info && info.inGrace) {
    const gracePeriodDays = cache.gracePeriodDays || 7;
    console.log(`\n  \u26A0\uFE0F  Grace Period Active (${gracePeriodDays} days)`);
    console.log('  Please revalidate your license: aios pro validate');
  }

  // Pending deactivation warning
  const pending = hasPendingDeactivation();
  if (pending && pending.pending) {
    console.log('\n  \u26A0\uFE0F  Pending Offline Deactivation');
    console.log('  A deactivation is pending sync to the server.');
    console.log('  This will be synced on next online activation or validation.');
  }

  // Next validation
  console.log(`\n  Next validation: ${state === 'Active' ? 'Background (when online)' : 'Required'}`);
  console.log('');
}

// ---------------------------------------------------------------------------
// aios pro deactivate
// ---------------------------------------------------------------------------

async function deactivateAction(options) {
  const {
    licenseApi,
    readLicenseCache,
    deleteLicenseCache,
    setPendingDeactivation,
    generateMachineId,
    maskKey,
    featureGate,
  } = loadLicenseModules();

  const cache = readLicenseCache();

  if (!cache) {
    console.log('\nNo license is currently activated.');
    return;
  }

  // Confirm unless forced
  if (!options.force) {
    console.log('\nDeactivating AIOS Pro License');
    console.log(`Key: ${maskKey(cache.key)}`);
    console.log('\nThis will:');
    console.log('  - Remove the license from this machine');
    console.log('  - Free up a seat for use on another machine');
    console.log('  - Disable all Pro features (Core features remain available)');
    console.log('  - Preserve all your data and configurations');
    console.log('');

    const confirmed = await confirm('Are you sure you want to deactivate? (y/N): ');
    if (!confirmed) {
      console.log('Deactivation cancelled.');
      return;
    }
  }

  console.log('\nDeactivating license...');

  try {
    const machineId = generateMachineId();

    // Try online deactivation first
    const isOnline = await licenseApi.isOnline();

    if (isOnline) {
      try {
        await licenseApi.deactivate(cache.key, machineId);
        console.log('');
        console.log('License deactivated successfully.');
        console.log('Seat has been freed for use on another machine.');
      } catch (error) {
        // Online deactivation failed, fall back to offline
        console.log(`\n\u26A0\uFE0F  Could not reach server: ${error.message}`);
        console.log('Proceeding with offline deactivation...');
        setPendingDeactivation(cache.key);
        console.log('\nSeat will be freed when you next connect online.');
      }
    } else {
      // Offline deactivation
      console.log('\n\u26A0\uFE0F  No internet connection detected.');
      console.log('Performing offline deactivation...');
      setPendingDeactivation(cache.key);
      console.log('\nSeat will be freed on next online connection.');
    }

    // Delete local cache
    deleteLicenseCache();

    // Reload feature gate
    featureGate.reload();

    console.log('');
    console.log('Your data and configurations have been preserved.');
    console.log('Core features remain available.');
    console.log('');
    console.log('To reactivate: aios pro activate --key <KEY>');
    console.log('');

  } catch (error) {
    console.error(`\nDeactivation error: ${error.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aios pro features
// ---------------------------------------------------------------------------

function featuresAction() {
  const { featureGate } = loadLicenseModules();

  console.log('\nAIOS Pro Features\n');

  const byModule = featureGate.listByModule();
  const modules = Object.keys(byModule).sort();

  for (const moduleName of modules) {
    const features = byModule[moduleName];

    console.log(`${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}:`);

    for (const feature of features) {
      const status = feature.available
        ? '\u2705'  // Green check
        : '\u274C'; // Red X

      console.log(`  ${status} ${feature.name}`);
      console.log(`     ID: ${feature.id}`);
      if (feature.description) {
        console.log(`     ${feature.description}`);
      }
    }
    console.log('');
  }

  const available = featureGate.listAvailable();
  const total = Object.values(byModule).reduce((sum, arr) => sum + arr.length, 0);

  console.log(`Summary: ${available.length}/${total} features available`);
  console.log('');
}

// ---------------------------------------------------------------------------
// aios pro validate
// ---------------------------------------------------------------------------

async function validateAction() {
  const {
    licenseApi,
    readLicenseCache,
    writeLicenseCache,
    generateMachineId,
    maskKey,
    featureGate,
    LicenseActivationError,
  } = loadLicenseModules();

  console.log('\nValidating AIOS Pro license...\n');

  const cache = readLicenseCache();

  if (!cache) {
    console.log('No license is currently activated.');
    console.log('Activate: aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
    return;
  }

  console.log(`Key: ${maskKey(cache.key)}`);

  try {
    const machineId = generateMachineId();

    const result = await licenseApi.validate(cache.key, machineId);

    if (!result.valid) {
      console.log('\n\u274C License validation failed.');
      console.log('The license may have been revoked or expired.');
      console.log('Please contact support or activate a new license.');
      return;
    }

    // Update cache with refreshed data
    const updatedCache = {
      ...cache,
      features: result.features,
      seats: result.seats,
      expiresAt: result.expiresAt,
      cacheValidDays: result.cacheValidDays,
      gracePeriodDays: result.gracePeriodDays,
      lastValidated: new Date().toISOString(),
    };

    const writeResult = writeLicenseCache(updatedCache);
    if (!writeResult.success) {
      console.log(`Warning: Could not update cache: ${writeResult.error}`);
    }

    // Reload feature gate
    featureGate.reload();

    // Display result
    console.log('\n\u2705 License validated successfully!\n');
    console.log(`  Features:     ${result.features.join(', ')}`);
    console.log(`  Seats:        ${result.seats.used}/${result.seats.max} used`);
    console.log(`  Valid until:  ${formatDate(result.expiresAt)}`);
    console.log(`  Cache:        Refreshed for ${result.cacheValidDays} days`);
    console.log('');

  } catch (error) {
    if (error instanceof LicenseActivationError) {
      console.error(`\nValidation failed: ${error.message}`);
      console.error(`Error code: ${error.code}`);
    } else {
      console.error(`\nValidation failed: ${error.message}`);
    }
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// aios pro setup (AC-12: Install-gate)
// ---------------------------------------------------------------------------

/**
 * Setup GitHub Packages access for @aios/pro installation.
 *
 * This command helps users configure their .npmrc to access
 * the private @aios scope on GitHub Packages.
 *
 * @param {object} options - Command options
 * @param {string} options.token - GitHub Personal Access Token
 * @param {boolean} options.global - Configure globally vs project-level
 */
async function setupAction(options) {
  const os = require('os');
  const homedir = os.homedir();

  console.log('\nAIOS Pro - GitHub Packages Setup\n');
  console.log('This will configure npm to access @aios/pro from GitHub Packages.');
  console.log('');

  // Determine .npmrc location
  const npmrcPath = options.global
    ? path.join(homedir, '.npmrc')
    : path.join(process.cwd(), '.npmrc');

  const scopeConfig = '@aios:registry=https://npm.pkg.github.com';
  const tokenConfig = '//npm.pkg.github.com/:_authToken=';

  // Check if token provided
  let token = options.token;

  if (!token) {
    console.log('To install @aios/pro, you need a GitHub Personal Access Token (PAT)');
    console.log('with the "read:packages" scope.');
    console.log('');
    console.log('Create one at: https://github.com/settings/tokens/new');
    console.log('');
    console.log('Required scopes:');
    console.log('  - read:packages (download packages from GitHub Packages)');
    console.log('');

    // Interactive token input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    token = await new Promise((resolve) => {
      rl.question('Enter your GitHub PAT (or press Enter to skip): ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!token) {
      console.log('\nSetup cancelled. You can run this command again with:');
      console.log('  aios pro setup --token <YOUR_GITHUB_PAT>');
      console.log('');
      console.log('Or manually add to your .npmrc:');
      console.log(`  ${scopeConfig}`);
      console.log(`  ${tokenConfig}<YOUR_GITHUB_PAT>`);
      return;
    }
  }

  // Validate token format (basic check)
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    console.log('\n⚠️  Warning: Token does not appear to be a valid GitHub PAT.');
    console.log('Expected format: ghp_... or github_pat_...');

    const confirmed = await confirm('Continue anyway? (y/N): ');
    if (!confirmed) {
      console.log('Setup cancelled.');
      return;
    }
  }

  // Read existing .npmrc or create new
  let npmrcContent = '';
  try {
    npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
  } catch {
    // File doesn't exist, will create new
  }

  // Check if already configured
  if (npmrcContent.includes('@aios:registry')) {
    console.log(`\n⚠️  @aios registry already configured in ${npmrcPath}`);

    const overwrite = await confirm('Overwrite existing configuration? (y/N): ');
    if (!overwrite) {
      console.log('Setup cancelled. Existing configuration preserved.');
      return;
    }

    // Remove existing @aios config
    npmrcContent = npmrcContent
      .split('\n')
      .filter((line) => !line.includes('@aios:') && !line.includes('npm.pkg.github.com/:_authToken'))
      .join('\n');
  }

  // Add new configuration
  const newConfig = [
    '',
    '# AIOS Pro - GitHub Packages (added by aios pro setup)',
    scopeConfig,
    `${tokenConfig}${token}`,
    '',
  ].join('\n');

  npmrcContent = npmrcContent.trimEnd() + newConfig;

  // Write .npmrc
  try {
    fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
    console.log(`\n✅ Configuration written to ${npmrcPath}`);
  } catch (error) {
    console.error(`\n❌ Failed to write ${npmrcPath}: ${error.message}`);
    console.log('\nManually add these lines to your .npmrc:');
    console.log(`  ${scopeConfig}`);
    console.log(`  ${tokenConfig}<YOUR_TOKEN>`);
    process.exit(1);
  }

  // Add .npmrc to .gitignore if project-level
  if (!options.global) {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    try {
      let gitignore = '';
      try {
        gitignore = fs.readFileSync(gitignorePath, 'utf8');
      } catch {
        // No .gitignore exists
      }

      if (!gitignore.includes('.npmrc')) {
        gitignore += '\n# AIOS Pro credentials (DO NOT COMMIT)\n.npmrc\n';
        fs.writeFileSync(gitignorePath, gitignore, 'utf8');
        console.log('✅ Added .npmrc to .gitignore');
      }
    } catch {
      console.log('⚠️  Could not update .gitignore. Please add .npmrc manually.');
    }
  }

  // Verify access
  console.log('\nVerifying access to GitHub Packages...');

  try {
    const { execSync } = require('child_process');
    execSync('npm view @aios/pro --registry=https://npm.pkg.github.com', {
      stdio: 'pipe',
      timeout: 15000,
    });
    console.log('✅ Access verified! You can now install @aios/pro');
  } catch {
    console.log('⚠️  Could not verify access (package may not be published yet)');
    console.log('   Configuration is saved. Try: npm install @aios/pro');
  }

  console.log('\n--- Setup Complete ---');
  console.log('');
  console.log('To install AIOS Pro:');
  console.log('  npm install @aios/pro');
  console.log('');
  console.log('To activate your license:');
  console.log('  aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX');
  console.log('');
  console.log('Documentation: https://synkra.ai/pro/docs');
  console.log('');
}

// ---------------------------------------------------------------------------
// Command builder
// ---------------------------------------------------------------------------

/**
 * Create the `aios pro` command with all subcommands.
 * @returns {Command}
 */
function createProCommand() {
  const proCmd = new Command('pro')
    .description('AIOS Pro license management');

  // aios pro activate
  proCmd
    .command('activate')
    .description('Activate a license key')
    .requiredOption('-k, --key <key>', 'License key (PRO-XXXX-XXXX-XXXX-XXXX)')
    .action(activateAction);

  // aios pro status
  proCmd
    .command('status')
    .description('Show current license status')
    .action(statusAction);

  // aios pro deactivate
  proCmd
    .command('deactivate')
    .description('Deactivate the current license')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(deactivateAction);

  // aios pro features
  proCmd
    .command('features')
    .description('List all pro features and their availability')
    .action(featuresAction);

  // aios pro validate
  proCmd
    .command('validate')
    .description('Force online license revalidation')
    .action(validateAction);

  // aios pro setup (AC-12: Install-gate)
  proCmd
    .command('setup')
    .description('Configure GitHub Packages access for @aios/pro')
    .option('-t, --token <token>', 'GitHub Personal Access Token')
    .option('-g, --global', 'Configure globally (~/.npmrc) instead of project-level')
    .action(setupAction);

  return proCmd;
}

module.exports = {
  createProCommand,
};
