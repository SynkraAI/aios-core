const execa = require('execa');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const WorktreeManager = require('./worktree-manager');

/**
 * ProjectStatusLoader - Dynamic project status for agent activation context
 *
 * Story 6.1.2.4: Captures git state, recent work, and current story/epic
 * for display in agent greetings across all 11 AIOS agents.
 *
 * Features:
 * - Git integration (branch, status, recent commits)
 * - Current story/epic detection from docs/stories/
 * - 60-second cache mechanism for performance
 * - Cross-platform support (Windows/Linux/macOS)
 * - Graceful fallback for non-git projects
 */
class ProjectStatusLoader {
  constructor(rootPath = null) {
    this.rootPath = rootPath || process.cwd();
    this.cacheFile = path.join(this.rootPath, '.aios', 'project-status.yaml');
    this.cacheTTL = 60; // seconds

    // Load config values (QA Fix: Issue 6.1.2.4-I1)
    this.config = this.loadConfig();
    this.maxModifiedFiles = this.config?.projectStatus?.maxModifiedFiles || 5;
    this.maxRecentCommits = this.config?.projectStatus?.maxRecentCommits || 2;
  }

  /**
   * Load configuration from core-config.yaml
   *
   * @returns {Object|null} Config object or null if not found
   */
  loadConfig() {
    try {
      const configPath = path.join(this.rootPath, '.aios-core', 'core-config.yaml');
      const configContent = require('fs').readFileSync(configPath, 'utf8');
      return yaml.load(configContent);
    } catch (error) {
      // Config not found - use defaults
      return null;
    }
  }

  /**
   * Load project status with caching
   *
   * @returns {Promise<ProjectStatus>} Current project status
   */
  async loadProjectStatus() {
    try {
      // Try to load from cache first
      const cached = await this.loadCache();
      if (cached && this.isCacheValid(cached)) {
        return cached.status;
      }

      // Cache miss or expired - generate fresh status
      const status = await this.generateStatus();

      // Save to cache
      await this.saveCache(status);

      return status;
    } catch (error) {
      console.warn('Project status loading failed, using defaults:', error.message);
      return this.getDefaultStatus();
    }
  }

  /**
   * Generate fresh project status
   *
   * @returns {Promise<ProjectStatus>}
   */
  async generateStatus() {
    const isGit = await this.isGitRepository();

    if (!isGit) {
      return this.getNonGitStatus();
    }

    const [branch, modifiedFilesResult, recentCommits, storyInfo, worktrees] = await Promise.all([
      this.getGitBranch(),
      this.getModifiedFiles(),
      this.getRecentCommits(),
      this.getCurrentStoryInfo(),
      this.getWorktreesStatus(),
    ]);

    const status = {
      branch,
      modifiedFiles: modifiedFilesResult.files,
      modifiedFilesTotalCount: modifiedFilesResult.totalCount,
      recentCommits,
      currentEpic: storyInfo.epic || null,
      currentStory: storyInfo.story || null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: true,
    };

    // Story 1.5: Include worktrees section if any exist
    if (worktrees) {
      status.worktrees = worktrees;
    }

    return status;
  }

  /**
   * Check if current directory is a git repository
   *
   * @returns {Promise<boolean>}
   */
  async isGitRepository() {
    try {
      await execa('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd: this.rootPath,
        stderr: 'ignore',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current git branch name
   *
   * @returns {Promise<string>}
   */
  async getGitBranch() {
    try {
      // Try modern git command first (git >= 2.22)
      const { stdout } = await execa('git', ['branch', '--show-current'], {
        cwd: this.rootPath,
      });
      return stdout.trim();
    } catch (error) {
      // Fallback for older git versions
      try {
        const { stdout } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
          cwd: this.rootPath,
        });
        return stdout.trim();
      } catch (fallbackError) {
        return 'unknown';
      }
    }
  }

  /**
   * Get modified files from git status
   *
   * @returns {Promise<string[]>}
   */
  async getModifiedFiles() {
    try {
      const { stdout } = await execa('git', ['status', '--porcelain'], {
        cwd: this.rootPath,
      });

      if (!stdout) return { files: [], totalCount: 0 };

      // Parse porcelain output
      const allFiles = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // Remove status prefix (e.g., " M ", "A  ", "?? ")
          return line.substring(3).trim();
        });

      const totalCount = allFiles.length;
      const files = allFiles.slice(0, this.maxModifiedFiles); // Use config value

      return { files, totalCount };
    } catch (error) {
      return { files: [], totalCount: 0 };
    }
  }

  /**
   * Get recent commits
   *
   * @returns {Promise<string[]>}
   */
  async getRecentCommits() {
    try {
      const { stdout } = await execa(
        'git',
        ['log', `-${this.maxRecentCommits}`, '--oneline', '--no-decorate'],
        {
          cwd: this.rootPath,
        }
      );

      if (!stdout) return [];

      // Parse commit lines (remove hash, keep message)
      const commits = stdout
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // Remove commit hash (first 7-8 characters)
          return line.substring(8).trim();
        });

      return commits;
    } catch (error) {
      // No commits yet or error
      return [];
    }
  }

  /**
   * Get worktrees status using WorktreeManager
   *
   * Story 1.5: Worktree Status Integration
   *
   * @returns {Promise<Object>} Worktrees status object
   */
  async getWorktreesStatus() {
    try {
      const worktreeManager = new WorktreeManager(this.rootPath);
      const worktrees = await worktreeManager.list();

      if (worktrees.length === 0) {
        return null;
      }

      const worktreesStatus = {};

      for (const wt of worktrees) {
        worktreesStatus[wt.storyId] = {
          path: wt.path,
          branch: wt.branch,
          createdAt: wt.createdAt instanceof Date ? wt.createdAt.toISOString() : wt.createdAt,
          lastActivity: new Date().toISOString(), // Updated on status check
          uncommittedChanges: wt.uncommittedChanges,
          status: wt.status,
        };
      }

      return worktreesStatus;
    } catch (error) {
      // WorktreeManager failed - likely not a git repo or git not available
      return null;
    }
  }

  /**
   * Detect current story and epic from docs/stories/
   *
   * Scans for Status: InProgress or Status: In Progress
   *
   * @returns {Promise<{story: string|null, epic: string|null}>}
   */
  async getCurrentStoryInfo() {
    try {
      const storiesDir = path.join(this.rootPath, 'docs', 'stories');

      // Check if stories directory exists
      try {
        await fs.access(storiesDir);
      } catch {
        return { story: null, epic: null };
      }

      // Read all markdown files recursively
      const storyFiles = await this.findMarkdownFiles(storiesDir);

      for (const file of storyFiles) {
        const content = await fs.readFile(file, 'utf8');

        // Check for InProgress status
        const statusMatch = content.match(
          /\*\*Status:\*\*\s*(InProgress|In Progress|🔄\s*InProgress|🔄\s*In Progress)/i
        );

        if (statusMatch) {
          // Extract story ID and epic
          const storyIdMatch = content.match(/\*\*Story ID:\*\*\s*([A-Z]+-[\d.]+)/);
          const epicMatch = content.match(/\*\*Epic:\*\*\s*([^\n]+)/);

          return {
            story: storyIdMatch ? storyIdMatch[1] : path.basename(file, '.md'),
            epic: epicMatch ? epicMatch[1].trim() : null,
          };
        }
      }

      return { story: null, epic: null };
    } catch (error) {
      return { story: null, epic: null };
    }
  }

  /**
   * Find all markdown files in directory recursively
   *
   * @param {string} dir - Directory to search
   * @returns {Promise<string[]>}
   */
  async findMarkdownFiles(dir) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors (permission denied, etc.)
    }

    return files;
  }

  /**
   * Load status from cache file
   *
   * @returns {Promise<{status: ProjectStatus, timestamp: number, ttl: number}|null>}
   */
  async loadCache() {
    try {
      const content = await fs.readFile(this.cacheFile, 'utf8');
      return yaml.load(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if cache is still valid
   *
   * @param {{timestamp: number, ttl: number}} cache
   * @returns {boolean}
   */
  isCacheValid(cache) {
    if (!cache || !cache.timestamp) return false;

    const age = Date.now() - cache.timestamp;
    const ttl = cache.ttl || this.cacheTTL;

    return age < ttl * 1000;
  }

  /**
   * Save status to cache file
   *
   * @param {ProjectStatus} status
   */
  async saveCache(status) {
    try {
      // Ensure .aios directory exists
      const cacheDir = path.dirname(this.cacheFile);
      await fs.mkdir(cacheDir, { recursive: true });

      const cache = {
        status,
        timestamp: Date.now(),
        ttl: this.cacheTTL,
      };

      const content = yaml.dump(cache);
      await fs.writeFile(this.cacheFile, content, 'utf8');
    } catch (error) {
      // Cache write failure is non-critical, just log
      console.warn('Failed to write status cache:', error.message);
    }
  }

  /**
   * Clear cache file
   */
  async clearCache() {
    try {
      await fs.unlink(this.cacheFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get default status for non-git projects
   *
   * @returns {ProjectStatus}
   */
  getNonGitStatus() {
    return {
      branch: null,
      modifiedFiles: [],
      recentCommits: [],
      currentEpic: null,
      currentStory: null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: false,
    };
  }

  /**
   * Get default status on error
   *
   * @returns {ProjectStatus}
   */
  getDefaultStatus() {
    return {
      branch: 'unknown',
      modifiedFiles: [],
      recentCommits: [],
      currentEpic: null,
      currentStory: null,
      lastUpdate: new Date().toISOString(),
      isGitRepo: false,
    };
  }

  /**
   * Format status for display in agent greeting
   *
   * @param {ProjectStatus} status
   * @returns {string}
   */
  formatStatusDisplay(status) {
    if (!status.isGitRepo) {
      return '  (Not a git repository)';
    }

    const lines = [];

    if (status.branch) {
      lines.push(`  - Branch: ${status.branch}`);
    }

    if (status.modifiedFiles && status.modifiedFiles.length > 0) {
      let filesDisplay = status.modifiedFiles.join(', ');

      // QA Fix: Issue 6.1.2.4-I3 - Add truncation message
      const totalCount = status.modifiedFilesTotalCount || status.modifiedFiles.length;
      if (totalCount > status.modifiedFiles.length) {
        const remaining = totalCount - status.modifiedFiles.length;
        filesDisplay += ` ...and ${remaining} more`;
      }

      lines.push(`  - Modified: ${filesDisplay}`);
    }

    if (status.recentCommits && status.recentCommits.length > 0) {
      lines.push(`  - Recent: ${status.recentCommits.join(', ')}`);
    }

    if (status.currentStory) {
      lines.push(`  - Story: ${status.currentStory}`);
    }

    // Story 1.5: Display worktrees status
    if (status.worktrees && Object.keys(status.worktrees).length > 0) {
      const worktreeCount = Object.keys(status.worktrees).length;
      const activeCount = Object.values(status.worktrees).filter(
        (w) => w.status === 'active'
      ).length;
      const withChanges = Object.values(status.worktrees).filter(
        (w) => w.uncommittedChanges > 0
      ).length;

      let worktreeInfo = `${activeCount}/${worktreeCount} active`;
      if (withChanges > 0) {
        worktreeInfo += `, ${withChanges} with changes`;
      }
      lines.push(`  - Worktrees: ${worktreeInfo}`);
    }

    if (lines.length === 0) {
      return '  (No recent activity)';
    }

    return lines.join('\n');
  }
}

/**
 * @typedef {Object} WorktreeStatusInfo
 * @property {string} path - Relative path to worktree (.aios/worktrees/{story-id})
 * @property {string} branch - Branch name (auto-claude/{story-id})
 * @property {string} createdAt - ISO timestamp when worktree was created
 * @property {string} lastActivity - ISO timestamp of last activity check
 * @property {number} uncommittedChanges - Number of uncommitted changes
 * @property {'active'|'stale'} status - Worktree status (stale if > 30 days)
 */

/**
 * @typedef {Object} ProjectStatus
 * @property {string|null} branch - Current git branch
 * @property {string[]} modifiedFiles - List of modified files (max 5)
 * @property {string[]} recentCommits - Recent commit messages (max 2)
 * @property {string|null} currentEpic - Current epic name
 * @property {string|null} currentStory - Current story ID
 * @property {string} lastUpdate - ISO timestamp of last update
 * @property {boolean} isGitRepo - Whether this is a git repository
 * @property {Object<string, WorktreeStatusInfo>} [worktrees] - Worktrees status by story ID (Story 1.5)
 */

// Export singleton instance
const loader = new ProjectStatusLoader();

module.exports = {
  loadProjectStatus: () => loader.loadProjectStatus(),
  clearCache: () => loader.clearCache(),
  formatStatusDisplay: (status) => loader.formatStatusDisplay(status),
  ProjectStatusLoader,
};
