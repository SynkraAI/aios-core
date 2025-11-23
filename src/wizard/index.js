/**
 * AIOS Interactive Wizard - Main Entry Point
 * 
 * Story 1.2: Interactive Wizard Foundation
 * Provides core wizard functionality with visual feedback and navigation
 * 
 * @module wizard
 */

const inquirer = require('inquirer');
const { buildQuestionSequence } = require('./questions');
const {
  showWelcome,
  showCompletion,
  showCancellation
} = require('./feedback');
const { generateIDEConfigs, showSuccessSummary } = require('./ide-config-generator');
const { configureEnvironment } = require('../../packages/installer/src/config/configure-environment');
const { installDependencies } = require('../installer/dependency-installer');

/**
 * Handle Ctrl+C gracefully
 */
let cancellationRequested = false;
let sigintHandlerAdded = false;

function setupCancellationHandler() {
  // Prevent adding multiple listeners (MaxListeners warning fix)
  if (sigintHandlerAdded) {
    return;
  }

  // Increase limit to prevent warning during testing
  process.setMaxListeners(15);
  
  const handleSigint = async () => {
    if (cancellationRequested) {
      // Second Ctrl+C - force exit
      console.log('\nForce exit');
      process.exit(0);
    }

    cancellationRequested = true;
    
    console.log('\n');
    const { confirmCancel } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCancel',
        message: 'Are you sure you want to cancel installation?',
        default: false
      }
    ]);

    if (confirmCancel) {
      showCancellation();
      process.exit(0);
    } else {
      cancellationRequested = false;
      console.log('Continuing installation...\n');
      // Note: inquirer will resume automatically
    }
  };

  process.on('SIGINT', handleSigint);
  sigintHandlerAdded = true;
}

/**
 * Main wizard execution function
 * 
 * @returns {Promise<Object>} Wizard answers object
 * 
 * @example
 * const { runWizard } = require('./src/wizard');
 * const answers = await runWizard();
 * console.log(answers.projectType); // 'greenfield' or 'brownfield'
 */
async function runWizard() {
  try {
    // Setup graceful cancellation
    setupCancellationHandler();

    // Show welcome message with AIOS branding
    showWelcome();

    // Build question sequence
    const questions = buildQuestionSequence();

    // Performance tracking (AC: < 100ms per question)
    const startTime = Date.now();

    // Run wizard with inquirer
    const answers = await inquirer.prompt(questions);

    // Log performance metrics
    const duration = Date.now() - startTime;
    const avgTimePerQuestion = questions.length > 0 ? duration / questions.length : 0;

    if (avgTimePerQuestion > 100) {
      console.warn(`Warning: Average question response time (${avgTimePerQuestion.toFixed(0)}ms) exceeds 100ms target`);
    }

    // Story 1.4: Generate IDE configs if IDEs were selected
    if (answers.selectedIDEs && answers.selectedIDEs.length > 0) {
      const configResult = await generateIDEConfigs(answers.selectedIDEs, answers);

      if (configResult.success) {
        showSuccessSummary(configResult);
      } else {
        console.error('\n⚠️  Some IDE configurations could not be created:');
        if (configResult.errors) {
          configResult.errors.forEach(err => {
            console.error(`  - ${err.ide || 'Unknown'}: ${err.error}`);
          });
        }
      }
    }

    // Story 1.6: Environment Configuration
    console.log('\n📝 Configuring environment...');

    try {
      const envResult = await configureEnvironment({
        targetDir: process.cwd(),
        projectType: answers.projectType || 'greenfield',
        selectedIDEs: answers.selectedIDEs || [],
        mcpServers: answers.mcpServers || [],
        skipPrompts: false  // Interactive mode
      });

      if (envResult.envCreated && envResult.coreConfigCreated) {
        console.log('\n✅ Environment configuration complete!');
        console.log(`  - .env file created`);
        console.log(`  - .env.example file created`);
        console.log(`  - .aios-core/core-config.yaml created`);
        if (envResult.gitignoreUpdated) {
          console.log(`  - .gitignore updated`);
        }
      }

      // Store env config result for downstream stories
      answers.envConfigured = true;
      answers.envResult = envResult;

    } catch (error) {
      console.error('\n⚠️  Environment configuration failed:');
      console.error(`  ${error.message}`);

      // Ask user if they want to continue without env config
      const { continueWithoutEnv } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithoutEnv',
          message: 'Continue installation without environment configuration?',
          default: false
        }
      ]);

      if (!continueWithoutEnv) {
        throw new Error('Installation cancelled - environment configuration required');
      }

      answers.envConfigured = false;
      console.log('\n⚠️  Continuing without environment configuration...');
    }

    // Story 1.7: Dependency Installation
    console.log('\n📦 Installing dependencies...');

    try {
      const depsResult = await installDependencies({
        packageManager: answers.packageManager,
        projectPath: process.cwd()
      });

      if (depsResult.success) {
        if (depsResult.offlineMode) {
          console.log('✅ Using existing dependencies (offline mode)');
        } else {
          console.log(`✅ Dependencies installed with ${depsResult.packageManager}!`);
        }
        answers.depsInstalled = true;
        answers.depsResult = depsResult;
      } else {
        console.error('\n⚠️  Dependency installation failed:');
        console.error(`  ${depsResult.errorMessage}`);
        console.error(`  Solution: ${depsResult.solution}`);

        // Ask user if they want to retry
        const { retryDeps } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'retryDeps',
            message: 'Retry dependency installation?',
            default: true
          }
        ]);

        if (retryDeps) {
          // Recursive retry with exponential backoff (built into installDependencies)
          const retryResult = await installDependencies({
            packageManager: answers.packageManager,
            projectPath: process.cwd()
          });

          if (retryResult.success) {
            console.log(`\n✅ Dependencies installed with ${retryResult.packageManager}!`);
            answers.depsInstalled = true;
            answers.depsResult = retryResult;
          } else {
            console.log('\n⚠️  Installation still failed. You can run `npm install` manually later.');
            answers.depsInstalled = false;
            answers.depsResult = retryResult;
          }
        } else {
          console.log('\n⚠️  Skipping dependency installation. Run manually with `npm install`.');
          answers.depsInstalled = false;
          answers.depsResult = depsResult;
        }
      }
    } catch (error) {
      console.error('\n⚠️  Dependency installation error:', error.message);
      answers.depsInstalled = false;
    }

    // Show completion
    showCompletion();

    return answers;
  } catch (error) {
    if (error.isTtyError) {
      console.error('Error: Prompt couldn\'t be rendered in the current environment');
    } else {
      console.error('Wizard error:', error.message);
    }
    throw error;
  }
}

/**
 * Answer object schema (for integration documentation)
 *
 * @typedef {Object} WizardAnswers
 * @property {string} projectType - 'greenfield' or 'brownfield' (Story 1.3)
 * @property {string[]} [selectedIDEs] - Selected IDEs array (Story 1.4)
 * @property {string[]} [mcpServers] - Selected MCP servers (Story 1.5)
 * @property {boolean} [envConfigured] - Whether env config succeeded (Story 1.6)
 * @property {Object} [envResult] - Environment configuration result (Story 1.6)
 * @property {boolean} envResult.envCreated - .env file created
 * @property {boolean} envResult.envExampleCreated - .env.example file created
 * @property {boolean} envResult.coreConfigCreated - core-config.yaml created
 * @property {boolean} envResult.gitignoreUpdated - .gitignore updated
 * @property {Array<string>} envResult.errors - Any errors encountered
 * @property {string} packageManager - Selected package manager (Story 1.7)
 * @property {boolean} [depsInstalled] - Whether dependencies installed successfully (Story 1.7)
 * @property {Object} [depsResult] - Dependency installation result (Story 1.7)
 * @property {boolean} depsResult.success - Installation succeeded
 * @property {boolean} [depsResult.offlineMode] - Used existing node_modules
 * @property {string} depsResult.packageManager - Package manager used
 * @property {string} [depsResult.error] - Error message if failed
 */

module.exports = {
  runWizard
};

