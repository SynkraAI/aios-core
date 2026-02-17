/**
 * Mode Detector Module
 *
 * Detects installation mode for AIOS projects with three-mode support:
 * - FRAMEWORK_DEV: Contributing to aios-core itself
 * - GREENFIELD: New empty project
 * - BROWNFIELD: Existing project being integrated
 *
 * @module documentation-integrity/mode-detector
 * @version 1.0.0
 * @story 6.9
 */

const fs = require('fs');
const path = require('path');

/**
 * Installation modes supported by AIOS
 * @enum {string}
 */
const InstallationMode = {
  FRAMEWORK_DEV: 'framework-dev',
  GREENFIELD: 'greenfield',
  BROWNFIELD: 'brownfield',
  UNKNOWN: 'unknown',
};

/**
 * Legacy project type mappings (for backward compatibility)
 * @enum {string}
 */
const LegacyProjectType = {
  EXISTING_AIOS: 'EXISTING_AIOS',
  GREENFIELD: 'GREENFIELD',
  BROWNFIELD: 'BROWNFIELD',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Mode descriptions for display in wizard
 * @type {Object.<string, Object>}
 */
const ModeDescriptions = {
  [InstallationMode.FRAMEWORK_DEV]: {
    label: '🔧 Framework Development',
    hint: 'Developing aios-core itself - uses framework standards, skips project setup',
    description: 'For AIOS contributors working on the framework',
  },
  [InstallationMode.GREENFIELD]: {
    label: '🆕 New Project (Greenfield)',
    hint: 'Start a fresh project with AIOS - generates project docs, config, and infrastructure',
    description: 'Empty directory setup with full scaffolding',
  },
  [InstallationMode.BROWNFIELD]: {
    label: '📂 Existing Project (Brownfield)',
    hint: 'Add AIOS to existing project - analyzes current structure and adapts',
    description: 'Integration with existing codebase',
  },
  [InstallationMode.UNKNOWN]: {
    label: '❓ Unknown',
    hint: 'Could not determine project type - manual selection required',
    description: 'Manual mode selection needed',
  },
};

/**
 * Detection result with confidence and reasoning
 * @typedef {Object} DetectionResult
 * @property {string} mode - Detected installation mode
 * @property {string} legacyType - Legacy project type for backward compatibility
 * @property {number} confidence - Detection confidence (0-100)
 * @property {string} reason - Human-readable reason for detection
 * @property {Object} markers - Detected markers in the directory
 */

/**
 * Detects the installation mode for a target directory
 *
 * Detection Priority Order:
 * 1. FRAMEWORK_DEV - .aios-core/ exists AND is aios-core repo
 * 2. GREENFIELD - directory is empty
 * 3. BROWNFIELD - has package.json, .git, or other project markers
 * 4. UNKNOWN - has files but no recognized markers
 *
 * @param {string} targetDir - Directory to analyze
 * @returns {DetectionResult} Detection result with mode and metadata
 * @throws {Error} If directory cannot be accessed
 */
function detectInstallationMode(targetDir = process.cwd()) {
  // Validate input
  if (!targetDir || typeof targetDir !== 'string') {
    throw new Error('Invalid targetDir parameter: must be a non-empty string');
  }

  const normalizedDir = path.resolve(targetDir);

  // Check if directory exists
  if (!fs.existsSync(normalizedDir)) {
    throw new Error(`Directory does not exist: ${normalizedDir}`);
  }

  // Collect markers
  const markers = collectMarkers(normalizedDir);

  // Priority 1: Check for AIOS framework development
  if (markers.hasAiosCore && markers.isAiosCoreRepo) {
    return {
      mode: InstallationMode.FRAMEWORK_DEV,
      legacyType: LegacyProjectType.EXISTING_AIOS,
      confidence: 100,
      reason: 'Detected aios-core repository with .aios-core directory',
      markers,
    };
  }

  // Priority 2: Check for existing AIOS installation (non-framework)
  if (markers.hasAiosCore && !markers.isAiosCoreRepo) {
    return {
      mode: InstallationMode.BROWNFIELD,
      legacyType: LegacyProjectType.EXISTING_AIOS,
      confidence: 95,
      reason: 'AIOS already installed in user project - treating as brownfield update',
      markers,
    };
  }

  // Priority 3: Check for empty directory (greenfield)
  if (markers.isEmpty) {
    return {
      mode: InstallationMode.GREENFIELD,
      legacyType: LegacyProjectType.GREENFIELD,
      confidence: 100,
      reason: 'Empty directory detected',
      markers,
    };
  }

  // Priority 4: Check for project markers (brownfield)
  if (
    markers.hasPackageJson ||
    markers.hasGit ||
    markers.hasPythonProject ||
    markers.hasGoMod ||
    markers.hasCargoToml
  ) {
    const projectTypes = [];
    if (markers.hasPackageJson) projectTypes.push('Node.js');
    if (markers.hasPythonProject) projectTypes.push('Python');
    if (markers.hasGoMod) projectTypes.push('Go');
    if (markers.hasCargoToml) projectTypes.push('Rust');

    return {
      mode: InstallationMode.BROWNFIELD,
      legacyType: LegacyProjectType.BROWNFIELD,
      confidence: 90,
      reason: `Existing project detected: ${projectTypes.join(', ') || 'Git repository'}`,
      markers,
    };
  }

  // Priority 5: Directory has files but no recognized markers
  return {
    mode: InstallationMode.UNKNOWN,
    legacyType: LegacyProjectType.UNKNOWN,
    confidence: 0,
    reason: 'Directory has files but no recognized project markers',
    markers,
  };
}

/**
 * Collects all relevant markers from a directory
 *
 * @param {string} targetDir - Directory to scan
 * @returns {Object} Object containing all detected markers
 */
function collectMarkers(targetDir) {
  const dirContents = fs.readdirSync(targetDir);

  return {
    // AIOS markers
    hasAiosCore: fs.existsSync(path.join(targetDir, '.aios-core')),
    isAiosCoreRepo: isAiosCoreRepository(targetDir),

    // Directory state
    isEmpty: dirContents.length === 0,
    fileCount: dirContents.length,

    // Project markers
    hasPackageJson: fs.existsSync(path.join(targetDir, 'package.json')),
    hasGit: fs.existsSync(path.join(targetDir, '.git')),

    // Python markers
    hasPythonProject:
      fs.existsSync(path.join(targetDir, 'requirements.txt')) ||
      fs.existsSync(path.join(targetDir, 'pyproject.toml')) ||
      fs.existsSync(path.join(targetDir, 'setup.py')),

    // Go markers
    hasGoMod: fs.existsSync(path.join(targetDir, 'go.mod')),

    // Rust markers
    hasCargoToml: fs.existsSync(path.join(targetDir, 'Cargo.toml')),

    // Existing standards markers
    hasEslintrc:
      fs.existsSync(path.join(targetDir, '.eslintrc.js')) ||
      fs.existsSync(path.join(targetDir, '.eslintrc.json')) ||
      fs.existsSync(path.join(targetDir, '.eslintrc.yaml')),
    hasPrettierrc:
      fs.existsSync(path.join(targetDir, '.prettierrc')) ||
      fs.existsSync(path.join(targetDir, '.prettierrc.json')) ||
      fs.existsSync(path.join(targetDir, 'prettier.config.js')),
    hasTsconfig: fs.existsSync(path.join(targetDir, 'tsconfig.json')),

    // CI/CD markers
    hasGithubWorkflows: fs.existsSync(path.join(targetDir, '.github', 'workflows')),
    hasGitlabCi: fs.existsSync(path.join(targetDir, '.gitlab-ci.yml')),
  };
}

/**
 * Checks if the target directory is the aios-core repository itself
 *
 * @param {string} targetDir - Directory to check
 * @returns {boolean} True if this is the aios-core repository
 */
function isAiosCoreRepository(targetDir) {
  const packageJsonPath = path.join(targetDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Primary check: explicit aios-core package names
    if (packageJson.name === '@aios/core' || packageJson.name === 'aios-core') {
      return true;
    }

    // Secondary check: workspaces pattern + aios-specific marker file
    // This prevents false positives for generic monorepos
    const hasAiosMarker = fs.existsSync(path.join(targetDir, '.aios-core', 'infrastructure'));
    const hasWorkspaces =
      Array.isArray(packageJson.workspaces) && packageJson.workspaces.includes('packages/*');

    return hasWorkspaces && hasAiosMarker;
  } catch (error) {
    // Log error for debugging but don't throw - return false for safety
    if (process.env.AIOS_DEBUG) {
      console.warn(`[mode-detector] Error checking aios-core repository: ${error.message}`);
    }
    return false;
  }
}

/**
 * Maps legacy project type to new installation mode
 *
 * @deprecated Use detectInstallationMode().mode directly instead.
 * This function cannot distinguish between FRAMEWORK_DEV and BROWNFIELD
 * for EXISTING_AIOS legacy type (both use EXISTING_AIOS but with different modes).
 * For accurate mode detection, use the mode property from detectInstallationMode().
 *
 * @param {string} legacyType - Legacy project type (EXISTING_AIOS, GREENFIELD, etc.)
 * @param {Object} [context] - Optional context for disambiguation
 * @param {boolean} [context.isAiosCoreRepo] - True if this is the aios-core repository
 * @returns {string} New installation mode
 */
function mapLegacyTypeToMode(legacyType, context = {}) {
  // EXISTING_AIOS is ambiguous: it can be FRAMEWORK_DEV (aios-core repo)
  // or BROWNFIELD (user project with AIOS installed)
  if (legacyType === LegacyProjectType.EXISTING_AIOS) {
    // Use context to disambiguate if provided
    if (context.isAiosCoreRepo === true) {
      return InstallationMode.FRAMEWORK_DEV;
    }
    if (context.isAiosCoreRepo === false) {
      return InstallationMode.BROWNFIELD;
    }
    // Default to BROWNFIELD as it's safer (won't skip project setup)
    return InstallationMode.BROWNFIELD;
  }

  const mapping = {
    [LegacyProjectType.GREENFIELD]: InstallationMode.GREENFIELD,
    [LegacyProjectType.BROWNFIELD]: InstallationMode.BROWNFIELD,
    [LegacyProjectType.UNKNOWN]: InstallationMode.UNKNOWN,
  };

  return mapping[legacyType] || InstallationMode.UNKNOWN;
}

/**
 * Validates user mode selection against auto-detection
 *
 * @param {string} selectedMode - User-selected mode
 * @param {DetectionResult} detected - Auto-detected result
 * @returns {Object} Validation result with warnings if mismatch
 */
function validateModeSelection(selectedMode, detected) {
  const result = {
    isValid: true,
    warnings: [],
    suggestions: [],
  };

  // Allow any selection for UNKNOWN detection
  if (detected.mode === InstallationMode.UNKNOWN) {
    return result;
  }

  // Check for mismatches
  if (selectedMode !== detected.mode) {
    if (selectedMode === InstallationMode.GREENFIELD && !detected.markers.isEmpty) {
      result.warnings.push(
        'Selected greenfield but directory is not empty. Existing files may be overwritten.',
      );
    }

    if (selectedMode === InstallationMode.FRAMEWORK_DEV && !detected.markers.isAiosCoreRepo) {
      result.warnings.push(
        'Selected framework-dev but this does not appear to be the aios-core repository.',
      );
    }

    if (selectedMode === InstallationMode.BROWNFIELD && detected.markers.isEmpty) {
      result.warnings.push(
        'Selected brownfield but directory is empty. Consider using greenfield instead.',
      );
      result.suggestions.push(InstallationMode.GREENFIELD);
    }
  }

  return result;
}

/**
 * Gets mode options for wizard display
 *
 * @param {DetectionResult} [detected] - Optional detected result to highlight recommended
 * @returns {Array<Object>} Array of mode options for wizard
 */
function getModeOptions(detected = null) {
  const options = [
    {
      value: InstallationMode.GREENFIELD,
      label: ModeDescriptions[InstallationMode.GREENFIELD].label,
      hint: ModeDescriptions[InstallationMode.GREENFIELD].hint,
    },
    {
      value: InstallationMode.BROWNFIELD,
      label: ModeDescriptions[InstallationMode.BROWNFIELD].label,
      hint: ModeDescriptions[InstallationMode.BROWNFIELD].hint,
    },
    {
      value: InstallationMode.FRAMEWORK_DEV,
      label: ModeDescriptions[InstallationMode.FRAMEWORK_DEV].label,
      hint: ModeDescriptions[InstallationMode.FRAMEWORK_DEV].hint,
    },
  ];

  // If we have detection, mark recommended option
  if (detected && detected.mode !== InstallationMode.UNKNOWN) {
    const recommendedIndex = options.findIndex((opt) => opt.value === detected.mode);
    if (recommendedIndex >= 0) {
      options[recommendedIndex].hint += ' (Recommended)';
      // Move recommended to top
      const recommended = options.splice(recommendedIndex, 1)[0];
      options.unshift(recommended);
    }
  }

  return options;
}

module.exports = {
  detectInstallationMode,
  collectMarkers,
  isAiosCoreRepository,
  mapLegacyTypeToMode,
  validateModeSelection,
  getModeOptions,
  InstallationMode,
  LegacyProjectType,
  ModeDescriptions,
};
