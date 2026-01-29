/**
 * Post-Installation Validator
 * Validates installation integrity by comparing installed files against manifest
 *
 * @module src/installer/post-install-validator
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 * @version 1.0.0
 *
 * Features:
 * - Validates all installed files against install-manifest.yaml
 * - Verifies SHA256 hashes for integrity checking
 * - Detects missing, corrupted, and extra files
 * - Provides detailed reports with actionable remediation
 * - Supports automatic repair of missing files
 * - Cross-platform compatible (Windows, macOS, Linux)
 *
 * Usage:
 *   const { PostInstallValidator } = require('./post-install-validator');
 *   const validator = new PostInstallValidator(targetDir, sourceDir);
 *   const report = await validator.validate();
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFile, hashesMatch } = require('./file-hasher');

/**
 * Validation result severity levels
 * @enum {string}
 */
const Severity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

/**
 * Validation issue types
 * @enum {string}
 */
const IssueType = {
  MISSING_FILE: 'MISSING_FILE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  EXTRA_FILE: 'EXTRA_FILE',
  MISSING_MANIFEST: 'MISSING_MANIFEST',
  INVALID_MANIFEST: 'INVALID_MANIFEST',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SIZE_MISMATCH: 'SIZE_MISMATCH',
};

/**
 * File categories for prioritized reporting
 * @enum {string}
 */
const FileCategory = {
  CORE: 'core',
  CLI: 'cli',
  DEVELOPMENT: 'development',
  INFRASTRUCTURE: 'infrastructure',
  PRODUCT: 'product',
  WORKFLOW: 'workflow',
  WORKFLOW_INTELLIGENCE: 'workflow-intelligence',
  MONITOR: 'monitor',
  OTHER: 'other',
};

/**
 * Categorize a file path into its functional category
 * @param {string} filePath - Relative file path
 * @returns {FileCategory} - File category
 */
function categorizeFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  if (normalized.startsWith('core/')) return FileCategory.CORE;
  if (normalized.startsWith('cli/')) return FileCategory.CLI;
  if (normalized.startsWith('development/')) return FileCategory.DEVELOPMENT;
  if (normalized.startsWith('infrastructure/')) return FileCategory.INFRASTRUCTURE;
  if (normalized.startsWith('product/')) return FileCategory.PRODUCT;
  if (normalized.startsWith('workflow-intelligence/')) return FileCategory.WORKFLOW_INTELLIGENCE;
  if (normalized.startsWith('monitor/')) return FileCategory.MONITOR;
  if (normalized.includes('workflow')) return FileCategory.WORKFLOW;

  return FileCategory.OTHER;
}

/**
 * Get severity based on file category
 * @param {FileCategory} category - File category
 * @returns {Severity} - Severity level
 */
function getSeverityForCategory(category) {
  const severityMap = {
    [FileCategory.CORE]: Severity.CRITICAL,
    [FileCategory.CLI]: Severity.HIGH,
    [FileCategory.DEVELOPMENT]: Severity.HIGH,
    [FileCategory.INFRASTRUCTURE]: Severity.MEDIUM,
    [FileCategory.PRODUCT]: Severity.MEDIUM,
    [FileCategory.WORKFLOW]: Severity.MEDIUM,
    [FileCategory.WORKFLOW_INTELLIGENCE]: Severity.HIGH,
    [FileCategory.MONITOR]: Severity.MEDIUM,
    [FileCategory.OTHER]: Severity.LOW,
  };

  return severityMap[category] || Severity.LOW;
}

/**
 * Post-Installation Validator Class
 * Comprehensive validation of AIOS-Core installation
 */
class PostInstallValidator {
  /**
   * Create a new PostInstallValidator instance
   *
   * @param {string} targetDir - Directory where AIOS was installed (project root)
   * @param {string} [sourceDir] - Source directory for repairs (optional, for npx installs)
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.verifyHashes=true] - Whether to verify file hashes
   * @param {boolean} [options.detectExtras=false] - Whether to detect extra files not in manifest
   * @param {boolean} [options.verbose=false] - Enable verbose logging
   * @param {Function} [options.onProgress] - Progress callback (current, total, file)
   */
  constructor(targetDir, sourceDir = null, options = {}) {
    this.targetDir = path.resolve(targetDir);
    this.sourceDir = sourceDir ? path.resolve(sourceDir) : null;
    this.aiosCoreTarget = path.join(this.targetDir, '.aios-core');
    this.aiosCoreSource = this.sourceDir ? path.join(this.sourceDir, '.aios-core') : null;

    this.options = {
      verifyHashes: options.verifyHashes !== false,
      detectExtras: options.detectExtras === true,
      verbose: options.verbose === true,
      onProgress: options.onProgress || (() => {}),
    };

    this.manifest = null;
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      missingFiles: 0,
      corruptedFiles: 0,
      extraFiles: 0,
      skippedFiles: 0,
    };
  }

  /**
   * Load and parse the install manifest
   * Prefers source manifest (with hashes) over installed manifest (simple list)
   *
   * @returns {Promise<Object|null>} - Parsed manifest or null if not found
   * @throws {Error} - If manifest is invalid
   */
  async loadManifest() {
    // Prefer source manifest (has hashes for integrity checking)
    const sourceManifestPath = this.aiosCoreSource
      ? path.join(this.aiosCoreSource, 'install-manifest.yaml')
      : null;
    const targetManifestPath = path.join(this.aiosCoreTarget, 'install-manifest.yaml');

    let manifestPath = targetManifestPath;
    let usingSourceManifest = false;

    // Use source manifest if available (has hashes)
    if (sourceManifestPath && fs.existsSync(sourceManifestPath)) {
      manifestPath = sourceManifestPath;
      usingSourceManifest = true;
      this.log(`Using source manifest: ${sourceManifestPath}`);
    } else if (!fs.existsSync(targetManifestPath)) {
      this.issues.push({
        type: IssueType.MISSING_MANIFEST,
        severity: Severity.CRITICAL,
        message: 'Install manifest not found',
        details: `Expected at: ${targetManifestPath}`,
        remediation: 'Re-run installation or copy manifest from source package',
      });
      return null;
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf8');
      this.manifest = yaml.load(content);

      if (!this.manifest || !Array.isArray(this.manifest.files)) {
        throw new Error('Manifest missing required "files" array');
      }

      // Check manifest format: source has objects {path, hash, size}, installed may have strings
      const firstEntry = this.manifest.files[0];
      if (typeof firstEntry === 'string') {
        // Convert simple string list to object format
        this.log('Converting simple manifest format to object format');
        this.manifest.files = this.manifest.files.map((filePath) => ({
          path: filePath.replace(/\\/g, '/'),
          hash: null,
          size: null,
        }));
      }

      this.log(
        `Loaded manifest v${this.manifest.version} with ${this.manifest.files.length} files` +
          (usingSourceManifest ? ' (from source)' : '')
      );
      return this.manifest;
    } catch (error) {
      this.issues.push({
        type: IssueType.INVALID_MANIFEST,
        severity: Severity.CRITICAL,
        message: 'Install manifest is invalid or corrupted',
        details: error.message,
        remediation: 'Re-run installation to regenerate manifest',
      });
      return null;
    }
  }

  /**
   * Validate a single file against manifest entry
   *
   * @param {Object} entry - Manifest file entry
   * @param {string} entry.path - Relative file path
   * @param {string} entry.hash - Expected SHA256 hash (prefixed with "sha256:")
   * @param {number} entry.size - Expected file size in bytes
   * @returns {Promise<Object>} - Validation result for this file
   */
  async validateFile(entry) {
    // Guard against invalid manifest entries
    if (!entry || typeof entry.path !== 'string') {
      this.log(`Skipping invalid manifest entry: ${JSON.stringify(entry)}`);
      this.stats.skippedFiles++;
      return {
        path: 'unknown',
        category: FileCategory.OTHER,
        exists: false,
        hashValid: null,
        sizeValid: null,
        issue: {
          type: IssueType.INVALID_MANIFEST,
          severity: Severity.LOW,
          message: 'Invalid manifest entry (missing path)',
          details: JSON.stringify(entry),
        },
      };
    }

    const relativePath = entry.path;
    const absolutePath = path.join(this.aiosCoreTarget, relativePath);
    const category = categorizeFile(relativePath);

    const result = {
      path: relativePath,
      category,
      exists: false,
      hashValid: null,
      sizeValid: null,
      issue: null,
    };

    // Check file existence
    if (!fs.existsSync(absolutePath)) {
      result.issue = {
        type: IssueType.MISSING_FILE,
        severity: getSeverityForCategory(category),
        message: `Missing file: ${relativePath}`,
        details: `Expected at: ${absolutePath}`,
        category,
        remediation: this.sourceDir
          ? `Copy from source: ${path.join(this.aiosCoreSource, relativePath)}`
          : 'Re-run installation to restore missing files',
      };
      this.stats.missingFiles++;
      return result;
    }

    result.exists = true;

    // Verify file size (quick check)
    try {
      const stats = fs.statSync(absolutePath);
      result.sizeValid = stats.size === entry.size;

      if (!result.sizeValid && this.options.verbose) {
        this.log(`Size mismatch: ${relativePath} (expected ${entry.size}, got ${stats.size})`);
      }
    } catch (error) {
      result.issue = {
        type: IssueType.PERMISSION_ERROR,
        severity: Severity.HIGH,
        message: `Cannot read file: ${relativePath}`,
        details: error.message,
        category,
        remediation: 'Check file permissions and try again',
      };
      this.stats.skippedFiles++;
      return result;
    }

    // Verify hash (thorough check)
    if (this.options.verifyHashes && entry.hash) {
      try {
        const actualHash = `sha256:${hashFile(absolutePath)}`;
        const expectedHash = entry.hash.toLowerCase();
        result.hashValid = hashesMatch(actualHash, expectedHash);

        if (!result.hashValid) {
          result.issue = {
            type: IssueType.CORRUPTED_FILE,
            severity: getSeverityForCategory(category),
            message: `Corrupted file (hash mismatch): ${relativePath}`,
            details: `Expected: ${expectedHash.substring(0, 24)}..., Got: ${actualHash.substring(0, 24)}...`,
            category,
            remediation: this.sourceDir
              ? `Replace from source: ${path.join(this.aiosCoreSource, relativePath)}`
              : 'Re-run installation to restore corrupted files',
          };
          this.stats.corruptedFiles++;
          return result;
        }
      } catch (error) {
        this.log(`Hash verification failed for ${relativePath}: ${error.message}`);
        result.hashValid = null;
        this.stats.skippedFiles++;
      }
    }

    // File is valid
    this.stats.validFiles++;
    return result;
  }

  /**
   * Scan for extra files not in manifest (optional)
   *
   * @returns {Promise<Array>} - List of extra file paths
   */
  async detectExtraFiles() {
    if (!this.options.detectExtras || !this.manifest) {
      return [];
    }

    const manifestPaths = new Set(this.manifest.files.map((f) => f.path.toLowerCase()));
    const extraFiles = [];

    const scanDir = async (dir, basePath) => {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          await scanDir(fullPath, basePath);
        } else if (entry.isFile()) {
          // Skip manifest itself and installed manifest
          if (
            relativePath === 'install-manifest.yaml' ||
            relativePath === '.installed-manifest.yaml'
          ) {
            continue;
          }

          if (!manifestPaths.has(relativePath.toLowerCase())) {
            extraFiles.push(relativePath);
            this.stats.extraFiles++;
          }
        }
      }
    };

    await scanDir(this.aiosCoreTarget, this.aiosCoreTarget);
    return extraFiles;
  }

  /**
   * Run full validation
   *
   * @returns {Promise<Object>} - Comprehensive validation report
   */
  async validate() {
    const startTime = Date.now();

    this.log('Starting post-installation validation...');

    // Reset state
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      validFiles: 0,
      missingFiles: 0,
      corruptedFiles: 0,
      extraFiles: 0,
      skippedFiles: 0,
    };

    // Check target directory exists
    if (!fs.existsSync(this.aiosCoreTarget)) {
      this.issues.push({
        type: IssueType.MISSING_FILE,
        severity: Severity.CRITICAL,
        message: 'AIOS-Core directory not found',
        details: `Expected at: ${this.aiosCoreTarget}`,
        remediation: 'Run `npx aios-core install` to install AIOS-Core',
      });

      return this.generateReport(startTime);
    }

    // Load manifest
    const manifest = await this.loadManifest();
    if (!manifest) {
      return this.generateReport(startTime);
    }

    this.stats.totalFiles = manifest.files.length;

    // Validate each file
    const fileResults = [];
    for (let i = 0; i < manifest.files.length; i++) {
      const entry = manifest.files[i];
      this.options.onProgress(i + 1, manifest.files.length, entry.path);

      const result = await this.validateFile(entry);
      fileResults.push(result);

      if (result.issue) {
        this.issues.push(result.issue);
      }
    }

    // Detect extra files (optional)
    const extraFiles = await this.detectExtraFiles();
    for (const extraPath of extraFiles) {
      this.issues.push({
        type: IssueType.EXTRA_FILE,
        severity: Severity.INFO,
        message: `Extra file not in manifest: ${extraPath}`,
        details: 'This file was not part of the original installation',
        category: categorizeFile(extraPath),
        remediation: 'Review if this file should be kept or removed',
      });
    }

    return this.generateReport(startTime, fileResults);
  }

  /**
   * Generate comprehensive validation report
   *
   * @param {number} startTime - Validation start timestamp
   * @param {Array} [fileResults] - Individual file validation results
   * @returns {Object} - Validation report
   */
  generateReport(startTime, fileResults = []) {
    const duration = Date.now() - startTime;

    // Group issues by severity
    const issuesBySeverity = {
      [Severity.CRITICAL]: [],
      [Severity.HIGH]: [],
      [Severity.MEDIUM]: [],
      [Severity.LOW]: [],
      [Severity.INFO]: [],
    };

    for (const issue of this.issues) {
      issuesBySeverity[issue.severity].push(issue);
    }

    // Group missing files by category
    const missingByCategory = {};
    for (const issue of this.issues.filter((i) => i.type === IssueType.MISSING_FILE)) {
      const category = issue.category || FileCategory.OTHER;
      if (!missingByCategory[category]) {
        missingByCategory[category] = [];
      }
      missingByCategory[category].push(issue.message.replace('Missing file: ', ''));
    }

    // Determine overall status
    let status = 'success';
    if (issuesBySeverity[Severity.CRITICAL].length > 0) {
      status = 'failed';
    } else if (
      issuesBySeverity[Severity.HIGH].length > 0 ||
      issuesBySeverity[Severity.MEDIUM].length > 0
    ) {
      status = 'warning';
    } else if (this.issues.length > 0) {
      status = 'info';
    }

    // Calculate integrity score (0-100)
    const integrityScore =
      this.stats.totalFiles > 0
        ? Math.round((this.stats.validFiles / this.stats.totalFiles) * 100)
        : 0;

    return {
      status,
      integrityScore,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      manifest: this.manifest
        ? {
            version: this.manifest.version,
            generatedAt: this.manifest.generated_at,
            totalFiles: this.manifest.file_count,
          }
        : null,
      stats: { ...this.stats },
      issues: this.issues,
      issuesBySeverity,
      missingByCategory,
      summary: {
        total: this.stats.totalFiles,
        valid: this.stats.validFiles,
        missing: this.stats.missingFiles,
        corrupted: this.stats.corruptedFiles,
        extra: this.stats.extraFiles,
        skipped: this.stats.skippedFiles,
      },
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate actionable recommendations based on issues
   *
   * @returns {Array<string>} - List of recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.missingFiles > 0) {
      if (this.stats.missingFiles > 50) {
        recommendations.push(
          'Large number of missing files detected. Consider re-running `npx aios-core install` with fresh install option.'
        );
      } else {
        recommendations.push(
          `${this.stats.missingFiles} file(s) missing. Run \`npx aios-core validate --repair\` to restore missing files.`
        );
      }
    }

    if (this.stats.corruptedFiles > 0) {
      recommendations.push(
        `${this.stats.corruptedFiles} file(s) corrupted. Run \`npx aios-core validate --repair\` to restore original files.`
      );
    }

    // Check for critical categories
    const criticalMissing = this.issues.filter(
      (i) => i.type === IssueType.MISSING_FILE && i.severity === Severity.CRITICAL
    );

    if (criticalMissing.length > 0) {
      recommendations.push(
        'Critical core files are missing. The framework may not function correctly until repaired.'
      );
    }

    if (this.stats.validFiles === this.stats.totalFiles) {
      recommendations.push('Installation is complete and verified. No action required.');
    }

    return recommendations;
  }

  /**
   * Repair installation by copying missing/corrupted files from source
   *
   * @param {Object} [options] - Repair options
   * @param {boolean} [options.dryRun=false] - If true, only report what would be repaired
   * @param {Function} [options.onProgress] - Progress callback
   * @returns {Promise<Object>} - Repair result
   */
  async repair(options = {}) {
    const dryRun = options.dryRun === true;
    const onProgress = options.onProgress || (() => {});

    if (!this.sourceDir || !fs.existsSync(this.aiosCoreSource)) {
      return {
        success: false,
        error: 'Source directory not available for repair',
        repaired: [],
        failed: [],
      };
    }

    // Run validation first if not already done
    if (this.issues.length === 0 && this.stats.totalFiles === 0) {
      await this.validate();
    }

    const repairableIssues = this.issues.filter(
      (i) => i.type === IssueType.MISSING_FILE || i.type === IssueType.CORRUPTED_FILE
    );

    const result = {
      success: true,
      dryRun,
      repaired: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < repairableIssues.length; i++) {
      const issue = repairableIssues[i];
      const relativePath = issue.message.replace(/^(Missing|Corrupted) file.*: /, '');
      const sourcePath = path.join(this.aiosCoreSource, relativePath);
      const targetPath = path.join(this.aiosCoreTarget, relativePath);

      onProgress(i + 1, repairableIssues.length, relativePath);

      if (!fs.existsSync(sourcePath)) {
        result.failed.push({
          path: relativePath,
          reason: 'Source file not found',
        });
        result.success = false;
        continue;
      }

      if (dryRun) {
        result.repaired.push({
          path: relativePath,
          action: issue.type === IssueType.MISSING_FILE ? 'copy' : 'replace',
        });
        continue;
      }

      try {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copy(sourcePath, targetPath, { overwrite: true });
        result.repaired.push({
          path: relativePath,
          action: issue.type === IssueType.MISSING_FILE ? 'copied' : 'replaced',
        });
      } catch (error) {
        result.failed.push({
          path: relativePath,
          reason: error.message,
        });
        result.success = false;
      }
    }

    return result;
  }

  /**
   * Log message if verbose mode is enabled
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.options.verbose) {
      console.log(`[PostInstallValidator] ${message}`);
    }
  }
}

/**
 * Format validation report for console output
 *
 * @param {Object} report - Validation report from PostInstallValidator
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.colors=true] - Use ANSI colors
 * @param {boolean} [options.detailed=false] - Show detailed file list
 * @returns {string} - Formatted report string
 */
function formatReport(report, options = {}) {
  const useColors = options.colors !== false;
  const detailed = options.detailed === true;

  // Color helpers
  const c = {
    reset: useColors ? '\x1b[0m' : '',
    bold: useColors ? '\x1b[1m' : '',
    dim: useColors ? '\x1b[2m' : '',
    red: useColors ? '\x1b[31m' : '',
    green: useColors ? '\x1b[32m' : '',
    yellow: useColors ? '\x1b[33m' : '',
    blue: useColors ? '\x1b[34m' : '',
    cyan: useColors ? '\x1b[36m' : '',
    gray: useColors ? '\x1b[90m' : '',
  };

  const lines = [];

  // Header
  lines.push('');
  lines.push(`${c.bold}AIOS-Core Installation Validation Report${c.reset}`);
  lines.push(`${c.gray}${'─'.repeat(50)}${c.reset}`);

  // Status indicator
  const statusIcon =
    {
      success: `${c.green}✓${c.reset}`,
      warning: `${c.yellow}⚠${c.reset}`,
      failed: `${c.red}✗${c.reset}`,
      info: `${c.blue}ℹ${c.reset}`,
    }[report.status] || '?';

  const statusText =
    {
      success: `${c.green}PASSED${c.reset}`,
      warning: `${c.yellow}WARNING${c.reset}`,
      failed: `${c.red}FAILED${c.reset}`,
      info: `${c.blue}INFO${c.reset}`,
    }[report.status] || 'UNKNOWN';

  lines.push(`${statusIcon} Status: ${statusText}`);
  lines.push(`${c.dim}  Integrity Score: ${report.integrityScore}%${c.reset}`);

  if (report.manifest) {
    lines.push(`${c.dim}  Manifest Version: ${report.manifest.version}${c.reset}`);
  }

  lines.push('');

  // Summary stats
  lines.push(`${c.bold}Summary${c.reset}`);
  lines.push(`  Total files:     ${report.summary.total}`);
  lines.push(`  ${c.green}Valid:${c.reset}           ${report.summary.valid}`);

  if (report.summary.missing > 0) {
    lines.push(`  ${c.red}Missing:${c.reset}         ${report.summary.missing}`);
  }
  if (report.summary.corrupted > 0) {
    lines.push(`  ${c.yellow}Corrupted:${c.reset}       ${report.summary.corrupted}`);
  }
  if (report.summary.extra > 0) {
    lines.push(`  ${c.cyan}Extra:${c.reset}           ${report.summary.extra}`);
  }
  if (report.summary.skipped > 0) {
    lines.push(`  ${c.gray}Skipped:${c.reset}         ${report.summary.skipped}`);
  }

  // Missing files by category
  if (Object.keys(report.missingByCategory).length > 0) {
    lines.push('');
    lines.push(`${c.bold}Missing Files by Category${c.reset}`);

    for (const [category, files] of Object.entries(report.missingByCategory)) {
      const categoryColor =
        {
          core: c.red,
          cli: c.yellow,
          development: c.yellow,
          infrastructure: c.cyan,
          product: c.cyan,
          workflow: c.blue,
        }[category] || c.gray;

      lines.push(`  ${categoryColor}${category}/${c.reset} (${files.length} files)`);

      if (detailed) {
        for (const file of files.slice(0, 10)) {
          lines.push(`    ${c.dim}- ${file}${c.reset}`);
        }
        if (files.length > 10) {
          lines.push(`    ${c.dim}... and ${files.length - 10} more${c.reset}`);
        }
      }
    }
  }

  // Critical issues
  const criticalIssues = report.issuesBySeverity[Severity.CRITICAL] || [];
  if (criticalIssues.length > 0) {
    lines.push('');
    lines.push(`${c.red}${c.bold}Critical Issues${c.reset}`);
    for (const issue of criticalIssues.slice(0, 5)) {
      lines.push(`  ${c.red}✗${c.reset} ${issue.message}`);
      if (issue.remediation) {
        lines.push(`    ${c.dim}→ ${issue.remediation}${c.reset}`);
      }
    }
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    lines.push('');
    lines.push(`${c.bold}Recommendations${c.reset}`);
    for (const rec of report.recommendations) {
      lines.push(`  ${c.cyan}→${c.reset} ${rec}`);
    }
  }

  lines.push('');
  lines.push(`${c.dim}Validation completed in ${report.duration}${c.reset}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Quick validation function for CLI usage
 *
 * @param {string} targetDir - Project directory to validate
 * @param {Object} [options] - Validation options
 * @returns {Promise<Object>} - Validation report
 */
async function quickValidate(targetDir, options = {}) {
  const validator = new PostInstallValidator(targetDir, options.sourceDir, {
    verifyHashes: options.verifyHashes !== false,
    detectExtras: options.detectExtras === true,
    verbose: options.verbose === true,
    onProgress: options.onProgress,
  });

  return validator.validate();
}

module.exports = {
  PostInstallValidator,
  formatReport,
  quickValidate,
  Severity,
  IssueType,
  FileCategory,
};
