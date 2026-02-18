#!/usr/bin/env node
/**
 * AIOS Terminal Integration Setup
 * Story CLI-DX-1 Phase 2
 *
 * Sets up terminal integration for visual context system:
 * - Creates symlink to zsh-integration.sh in user's home directory
 * - Adds source command to ~/.zshrc
 * - Provides instructions for bash users
 *
 * @module infrastructure/terminal/setup-terminal-integration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

/**
 * Setup terminal integration
 * @param {Object} options - Setup options
 * @param {boolean} [options.quiet=false] - Skip prompts (use defaults)
 * @param {boolean} [options.force=false] - Force overwrite existing setup
 * @returns {Promise<Object>} Setup result
 */
async function setupTerminalIntegration(options = {}) {
  const { quiet = false, force = false } = options;

  const result = {
    success: false,
    symlinkCreated: false,
    zshrcUpdated: false,
    alreadyConfigured: false,
    skipped: false,
    errors: [],
  };

  const homeDir = os.homedir();
  const zshrcPath = path.join(homeDir, '.zshrc');
  const integrationScriptName = '.aios-core-terminal-integration.sh';
  const integrationScriptPath = path.join(homeDir, integrationScriptName);

  // Detect AIOS Core path (support both installed and development modes)
  let sourceScriptPath;
  const possiblePaths = [
    // Development mode (in aios-core repo)
    path.join(process.cwd(), '.aios-core/infrastructure/scripts/terminal/zsh-integration.sh'),
    // Installed mode (project with AIOS installed)
    path.join(homeDir, 'aios-core/.aios-core/infrastructure/scripts/terminal/zsh-integration.sh'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      sourceScriptPath = p;
      break;
    }
  }

  if (!sourceScriptPath) {
    result.errors.push('zsh-integration.sh not found in expected locations');
    return result;
  }

  // Check if already configured
  if (fs.existsSync(integrationScriptPath) && !force) {
    // Check if it points to the correct source
    try {
      const linkTarget = fs.readlinkSync(integrationScriptPath);
      if (linkTarget === sourceScriptPath) {
        result.alreadyConfigured = true;
        result.success = true;
        result.symlinkCreated = true;

        // Check if zshrc is also configured
        if (fs.existsSync(zshrcPath)) {
          const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
          if (zshrcContent.includes(integrationScriptName)) {
            result.zshrcUpdated = true;
          }
        }

        return result;
      }
    } catch {
      // Not a symlink or broken, proceed with setup
    }
  }

  // Ask user for confirmation (unless quiet mode)
  if (!quiet) {
    const answer = await askQuestion(
      '\nSetup terminal integration? (shows project context in tab title) [Y/n]: ',
    );

    if (answer.toLowerCase() === 'n') {
      result.skipped = true;
      result.success = true;
      return result;
    }
  }

  try {
    // Create symlink (remove existing if force)
    if (fs.existsSync(integrationScriptPath) && force) {
      fs.unlinkSync(integrationScriptPath);
    }

    if (!fs.existsSync(integrationScriptPath)) {
      fs.symlinkSync(sourceScriptPath, integrationScriptPath);
      result.symlinkCreated = true;
    }

    // Add to .zshrc
    const sourceCommand = `\n# AIOS Terminal Integration\n[[ -f ~/${integrationScriptName} ]] && source ~/${integrationScriptName}\n`;

    if (fs.existsSync(zshrcPath)) {
      const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
      if (!zshrcContent.includes(integrationScriptName)) {
        fs.appendFileSync(zshrcPath, sourceCommand);
        result.zshrcUpdated = true;
      } else {
        result.zshrcUpdated = true; // Already present
      }
    } else {
      // Create .zshrc if it doesn't exist
      fs.writeFileSync(zshrcPath, sourceCommand);
      result.zshrcUpdated = true;
    }

    result.success = true;
  } catch (error) {
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Ask user a question and return answer
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User's answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Show setup results
 * @param {Object} result - Setup result from setupTerminalIntegration
 */
function showSetupResults(result) {
  if (result.skipped) {
    console.log('   ℹ️  Terminal integration skipped');
    return;
  }

  if (result.alreadyConfigured) {
    console.log('   ✓ Terminal integration already configured');
    return;
  }

  if (result.success) {
    console.log('✅ Terminal integration configured!');
    if (result.symlinkCreated) {
      console.log('   • Symlink created: ~/.aios-core-terminal-integration.sh');
    }
    if (result.zshrcUpdated) {
      console.log('   • ~/.zshrc updated');
      console.log('\n   💡 Restart your terminal or run: source ~/.zshrc');
    }
  } else {
    console.error('⚠️  Terminal integration setup failed:');
    result.errors.forEach((err) => console.error(`   - ${err}`));
  }
}

// CLI mode - run directly if invoked as script
if (require.main === module) {
  const args = process.argv.slice(2);
  const quiet = args.includes('--quiet');
  const force = args.includes('--force');

  setupTerminalIntegration({ quiet, force })
    .then((result) => {
      showSetupResults(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  setupTerminalIntegration,
  showSetupResults,
};
