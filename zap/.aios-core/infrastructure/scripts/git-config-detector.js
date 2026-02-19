/**
 * Git Config Detector - Cached Git Configuration Detection
 *
 * Detects git configuration status with caching to avoid
 * repeated git command execution overhead.
 *
 * Features:
 * - 5-minute cache TTL (configurable)
 * - Timeout protection (1000ms)
 * - Smart cache invalidation
 * - Graceful error handling
 */

const { execSync } = require('child_process');

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const GIT_TIMEOUT = 1000; // 1 second

class GitConfigDetector {
  constructor(cacheTTL = DEFAULT_CACHE_TTL) {
    this.cacheTTL = cacheTTL;
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Get git configuration (cached)
   * @returns {Object} { configured: boolean, type: string|null, branch: string|null }
   */
  get() {
    // Check cache validity
    if (this._isCacheValid()) {
      return this.cache;
    }

    // Cache miss - detect configuration
    return this.detect();
  }

  /**
   * Detect git configuration (bypass cache)
   * @returns {Object} { configured: boolean, type: string|null, branch: string|null }
   */
  detect() {
    try {
      const result = {
        configured: false,
        type: null,
        branch: null,
      };

      // Check if git repository exists
      if (!this._isGitRepository()) {
        this._updateCache(result);
        return result;
      }

      // Repository exists, get configuration details
      result.configured = true;
      result.branch = this._getCurrentBranch();

      // Detect repository type (GitHub, GitLab, etc.)
      const remoteUrl = this._getRemoteUrl();
      result.type = this._detectRepositoryType(remoteUrl);

      this._updateCache(result);
      return result;
    } catch (error) {
      // Graceful fallback on any error
      const fallbackResult = { configured: false, type: null, branch: null };
      this._updateCache(fallbackResult);
      return fallbackResult;
    }
  }

  /**
   * Invalidate cache (force fresh detection on next get())
   */
  invalidate() {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Check if cache is still valid
   * @private
   * @returns {boolean} True if cache is valid
   */
  _isCacheValid() {
    if (!this.cache || !this.cacheTimestamp) {
      return false;
    }

    const now = Date.now();
    const age = now - this.cacheTimestamp;

    return age < this.cacheTTL;
  }

  /**
   * Update cache with new data
   * @private
   * @param {Object} data - Configuration data to cache
   */
  _updateCache(data) {
    this.cache = data;
    this.cacheTimestamp = Date.now();
  }

  /**
   * Check if current directory is a git repository
   * @private
   * @returns {boolean} True if git repository
   */
  _isGitRepository() {
    try {
      const output = execSync('git rev-parse --is-inside-work-tree', {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT,
        stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
      }).trim();

      return output === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current git branch name
   * @private
   * @returns {string|null} Branch name or null
   */
  _getCurrentBranch() {
    try {
      const branch = execSync('git branch --show-current', {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      return branch || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get remote repository URL
   * @private
   * @returns {string|null} Remote URL or null
   */
  _getRemoteUrl() {
    try {
      const url = execSync('git config --get remote.origin.url', {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      return url || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect repository hosting type from URL
   * @private
   * @param {string|null} remoteUrl - Remote repository URL
   * @returns {string|null} 'github' | 'gitlab' | 'bitbucket' | 'other' | null
   */
  _detectRepositoryType(remoteUrl) {
    if (!remoteUrl) {
      return null;
    }

    const url = remoteUrl.toLowerCase();

    if (url.includes('github.com')) {
      return 'github';
    }

    if (url.includes('gitlab.com') || url.includes('gitlab')) {
      return 'gitlab';
    }

    if (url.includes('bitbucket.org') || url.includes('bitbucket')) {
      return 'bitbucket';
    }

    // Has remote but unknown type
    return 'other';
  }

  /**
   * Get cache age in milliseconds
   * @returns {number|null} Cache age or null if no cache
   */
  getCacheAge() {
    if (!this.cacheTimestamp) {
      return null;
    }

    return Date.now() - this.cacheTimestamp;
  }

  /**
   * Check if cache will expire soon (within 1 minute)
   * @returns {boolean} True if cache expires soon
   */
  isCacheExpiringSoon() {
    const age = this.getCacheAge();
    if (age === null) {
      return true;
    }

    const remaining = this.cacheTTL - age;
    return remaining < 60 * 1000; // Less than 1 minute remaining
  }

  /**
   * Get detailed git information (bypass cache)
   * Useful for debugging or detailed reports
   * @returns {Object} Detailed git configuration
   */
  getDetailed() {
    try {
      const basic = this.detect();

      if (!basic.configured) {
        return basic;
      }

      // Get additional details
      const userName = this._execGitCommand('git config user.name');
      const userEmail = this._execGitCommand('git config user.email');
      const remoteUrl = this._getRemoteUrl();
      const lastCommit = this._execGitCommand('git log -1 --format=%H');
      const hasUncommittedChanges = this._hasUncommittedChanges();

      return {
        ...basic,
        userName,
        userEmail,
        remoteUrl,
        lastCommit,
        hasUncommittedChanges,
      };
    } catch (error) {
      return this.detect(); // Fallback to basic detection
    }
  }

  /**
   * Execute git command with error handling
   * @private
   * @param {string} command - Git command to execute
   * @returns {string|null} Command output or null
   */
  _execGitCommand(command) {
    try {
      return execSync(command, {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if repository has uncommitted changes
   * @private
   * @returns {boolean} True if has uncommitted changes
   */
  _hasUncommittedChanges() {
    try {
      const status = execSync('git status --porcelain', {
        encoding: 'utf8',
        timeout: GIT_TIMEOUT,
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      return status.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = GitConfigDetector;
