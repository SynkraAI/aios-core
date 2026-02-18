#!/usr/bin/env node

/**
 * Navigator Post-Commit Hook
 * Auto-updates roadmap when stories/epics change
 *
 * Triggered by: .husky/post-commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const _path = require('path');

// Main execution
(async function main() {
  try {
    // Check if stories changed in this commit
    const changedFiles = getChangedFiles();
    const storyChanges = changedFiles.filter(f =>
      f.startsWith('docs/stories/') && f.endsWith('.md'),
    );

    if (storyChanges.length === 0) {
      // No story changes, exit silently
      process.exit(0);
    }

    // Find project roadmap
    const projectName = findProjectName();

    if (!projectName) {
      // No roadmap found, exit silently
      process.exit(0);
    }

    console.log('\n🧭 Navigator: Detecting story changes...');
    console.log(`   Changed: ${storyChanges.length} stories`);

    // Update roadmap
    await updateRoadmap(projectName, storyChanges);

    console.log('   ✓ Roadmap updated automatically\n');

    process.exit(0);
  } catch (_error) {
    // Silent failure - don't block commit
    // console.error('Navigator hook error:', _error.message);
    process.exit(0);
  }
})();

/**
 * Get files changed in last commit
 */
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1 HEAD', {
      encoding: 'utf8',
    });

    return output.trim().split('\n').filter(Boolean);
  } catch (_error) {
    return [];
  }
}

/**
 * Find project name from roadmap
 */
function findProjectName() {
  // Try to find roadmap in .aios/navigator/
  const navigatorDir = '.aios/navigator';

  if (!fs.existsSync(navigatorDir)) {
    return null;
  }

  const projects = fs.readdirSync(navigatorDir);

  if (projects.length === 0) {
    return null;
  }

  // Return first project (in production, detect active project)
  return projects[0];
}

/**
 * Update roadmap
 */
async function updateRoadmap(projectName, _changedFiles) {
  // Import required modules
  const { syncRoadmap } = require('./roadmap-sync');
  const { detectPhase } = require('./phase-detector');

  try {
    // Detect current phase
    const _currentPhase = await detectPhase(process.cwd());

    // Sync roadmaps
    await syncRoadmap(projectName);

    // Check if phase changed (would trigger checkpoint)
    // In production, compare with previous phase and create checkpoint

    return true;
  } catch (_error) {
    // Silent failure
    return false;
  }
}
