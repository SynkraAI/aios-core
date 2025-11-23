/**
 * Wizard Questions Definitions
 * 
 * Modular question system for AIOS installation wizard
 * Questions from Stories 1.3-1.6 will be added here
 * 
 * @module wizard/questions
 */

const { colors } = require('../utils/aios-colors');
const { createInquirerValidator, validateProjectType } = require('./validators');

/**
 * Get project type question (Story 1.3)
 * This is a placeholder - full implementation in Story 1.3
 * 
 * @returns {Object} Inquirer question object
 */
function getProjectTypeQuestion() {
  return {
    type: 'list',
    name: 'projectType',
    message: colors.primary('What type of project are you setting up?'),
    choices: [
      {
        name: colors.highlight('Greenfield') + colors.dim(' (new project from scratch)'),
        value: 'greenfield'
      },
      {
        name: 'Brownfield' + colors.dim(' (existing project integration)'),
        value: 'brownfield'
      }
    ],
    default: 0,
    validate: createInquirerValidator(validateProjectType)
  };
}

/**
 * Get IDE selection questions (Story 1.4)
 *
 * @returns {Object[]} Array of inquirer question objects
 */
function getIDEQuestions() {
  const { getIDESelectionQuestion } = require('./ide-selector');
  return [getIDESelectionQuestion()];
}

/**
 * Get package manager selection question (Story 1.7)
 *
 * @param {string} detectedPM - Auto-detected package manager
 * @returns {Object} Inquirer question object
 */
function getPackageManagerQuestion(detectedPM = 'npm') {
  return {
    type: 'list',
    name: 'packageManager',
    message: colors.primary('Which package manager should be used?'),
    choices: [
      {
        name: detectedPM === 'npm'
          ? colors.highlight('npm') + colors.dim(' (detected)')
          : 'npm',
        value: 'npm'
      },
      {
        name: detectedPM === 'yarn'
          ? colors.highlight('yarn') + colors.dim(' (detected)')
          : 'yarn',
        value: 'yarn'
      },
      {
        name: detectedPM === 'pnpm'
          ? colors.highlight('pnpm') + colors.dim(' (detected)')
          : 'pnpm',
        value: 'pnpm'
      },
      {
        name: detectedPM === 'bun'
          ? colors.highlight('bun') + colors.dim(' (detected)')
          : 'bun',
        value: 'bun'
      }
    ],
    default: ['npm', 'yarn', 'pnpm', 'bun'].indexOf(detectedPM) || 0
  };
}

/**
 * Get MCP selection questions (Story 1.5)
 * This is a placeholder - full implementation in Story 1.5
 * 
 * @returns {Object[]} Array of inquirer question objects
 */
function getMCPQuestions() {
  // Placeholder - Story 1.5 will implement MCP selection
  return [];
}

/**
 * Get environment configuration questions (Story 1.6)
 *
 * DESIGN NOTE: Environment configuration uses its own prompt system
 * via @clack/prompts in packages/installer/src/config/configure-environment.js
 *
 * API key prompts are NOT part of wizard questions to keep the
 * environment module self-contained and testable independently.
 *
 * The wizard calls configureEnvironment() directly after IDE selection
 * in src/wizard/index.js (Task 1.6.7)
 *
 * @returns {Object[]} Empty array - prompts handled in environment module
 */
function getEnvironmentQuestions() {
  // Environment config prompts handled in configure-environment.js
  // No wizard questions needed for this story
  return [];
}

/**
 * Build complete question sequence
 * Allows conditional questions based on previous answers
 *
 * @param {Object} context - Context with previous answers
 * @returns {Object[]} Array of questions
 */
function buildQuestionSequence(_context = {}) {
  const questions = [];

  // Story 1.2: Foundation (project type only)
  questions.push(getProjectTypeQuestion());

  // Story 1.4: IDE Selection
  questions.push(...getIDEQuestions());

  // Story 1.5: MCP Selection (when implemented)
  // questions.push(...getMCPQuestions());

  // Story 1.7: Package Manager Selection
  // Note: Detection happens in wizard, we pass detected PM to highlight it
  const { detectPackageManager } = require('../installer/dependency-installer');
  const detectedPM = detectPackageManager();
  questions.push(getPackageManagerQuestion(detectedPM));

  // Story 1.6: Environment Configuration
  // Note: Env config prompts handled directly in configureEnvironment()
  // See src/wizard/index.js integration (after IDE config step)

  // Future: Conditional questions based on projectType
  // if (context.projectType === 'greenfield') { ... }

  return questions;
}

/**
 * Get question by ID
 * Useful for testing individual questions
 * 
 * @param {string} questionId - Question identifier
 * @returns {Object|null} Question object or null if not found
 */
function getQuestionById(questionId) {
  const questionMap = {
    'projectType': getProjectTypeQuestion(),
    // Future questions will be added here
  };

  return questionMap[questionId] || null;
}

module.exports = {
  getProjectTypeQuestion,
  getIDEQuestions,
  getMCPQuestions,
  getEnvironmentQuestions,
  getPackageManagerQuestion,
  buildQuestionSequence,
  getQuestionById
};

