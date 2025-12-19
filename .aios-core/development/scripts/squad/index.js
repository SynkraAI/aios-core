/**
 * Squad Scripts Module
 *
 * Central exports for squad-related utilities used by the squad-creator agent.
 *
 * @module squad
 * @see {@link ./squad-loader.js} - Load and resolve squad manifests
 * @see {@link ./squad-validator.js} - Validate squad structure (SQS-3)
 * @see {@link ./squad-generator.js} - Generate new squads (SQS-4)
 * @see {@link ./squad-designer.js} - Design squads from documentation (SQS-9)
 */

const {
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,
} = require('./squad-loader');

const {
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,
} = require('./squad-validator');

const {
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  DEFAULT_DESIGNS_PATH,
  SQUAD_DESIGN_SCHEMA_PATH,
  isValidSquadName,
  getGitUserName,
} = require('./squad-generator');

const {
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
} = require('./squad-designer');

module.exports = {
  // Squad Loader (SQS-2)
  SquadLoader,
  SquadLoaderError,
  MANIFEST_FILES,
  DEFAULT_SQUADS_PATH,
  ErrorCodes,

  // Squad Validator (SQS-3)
  SquadValidator,
  ValidationErrorCodes,
  TASK_REQUIRED_FIELDS,

  // Squad Generator (SQS-4)
  SquadGenerator,
  SquadGeneratorError,
  GeneratorErrorCodes,
  AVAILABLE_TEMPLATES,
  AVAILABLE_LICENSES,
  CONFIG_MODES,
  DEFAULT_DESIGNS_PATH,
  SQUAD_DESIGN_SCHEMA_PATH,
  isValidSquadName,
  getGitUserName,

  // Squad Designer (SQS-9)
  SquadDesigner,
  SquadDesignerError,
  DesignerErrorCodes,
};
