#!/usr/bin/env node

/**
 * Checkpoint Manager Script
 * Manages checkpoint creation, listing, and restoration
 *
 * Used by: nav-checkpoint, nav-update-roadmap, git hooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Create checkpoint snapshot
 * @param {Object} options - Checkpoint options
 * @returns {Promise<Object>} Checkpoint result
 */
async function createCheckpoint(options = {}) {
  const {
    projectName = getProjectNameFromRoadmap(),
    phase,
    type = 'manual',
    description = null,
  } = options;

  const checkpointDir = `.aios/navigator/${projectName}/checkpoints`;
  ensureDirectoryExists(checkpointDir);

  // Generate checkpoint ID
  const date = new Date();
  const dateString = date.toISOString().split('T')[0];
  const checkpointId = `${dateString}-phase-${phase.id}`;
  const filename = `${checkpointId}.md`;
  const filepath = path.join(checkpointDir, filename);

  // Collect state
  const state = await collectCurrentState(phase);

  // Generate checkpoint content
  const content = generateCheckpointContent({
    checkpointId,
    date: date.toISOString(),
    type,
    projectName,
    phase,
    description: description || `Phase ${phase.id} checkpoint`,
    ...state,
  });

  // Check if checkpoint already exists
  if (fs.existsSync(filepath)) {
    // If running in non-interactive mode (hook/script), skip overwrite
    if (process.env.NAVIGATOR_AUTO_MODE === 'true' || type === 'auto') {
      console.warn(`⚠️  Checkpoint ${checkpointId} already exists. Skipping to avoid overwrite.`);
      return {
        checkpointId,
        filepath,
        phase: phase.id,
        type,
        skipped: true,
      };
    }

    // In interactive mode, ask for confirmation
    const inquirer = require('inquirer');
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Checkpoint ${checkpointId} already exists. Overwrite?`,
      default: false,
    }]);

    if (!confirm) {
      throw new Error('Checkpoint creation cancelled by user');
    }
  }

  // Save checkpoint
  fs.writeFileSync(filepath, content);

  return {
    checkpointId,
    filepath,
    phase: phase.id,
    type,
  };
}

/**
 * List all checkpoints for a project
 */
function listCheckpoints(projectName) {
  const checkpointDir = `.aios/navigator/${projectName}/checkpoints`;

  if (!fs.existsSync(checkpointDir)) {
    return [];
  }

  const files = fs.readdirSync(checkpointDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Most recent first

  return files.map(file => {
    const filepath = path.join(checkpointDir, file);
    const stats = fs.statSync(filepath);

    return {
      id: file.replace('.md', ''),
      filename: file,
      filepath,
      created: stats.birthtime,
      size: stats.size,
    };
  });
}

/**
 * Load checkpoint by ID
 */
function loadCheckpoint(checkpointId, projectName) {
  const filepath = `.aios/navigator/${projectName}/checkpoints/${checkpointId}.md`;

  if (!fs.existsSync(filepath)) {
    throw new Error(`Checkpoint not found: ${checkpointId}`);
  }

  const content = fs.readFileSync(filepath, 'utf8');
  return parseCheckpoint(content);
}

/**
 * Collect current state for checkpoint
 */
async function collectCurrentState(_phase) {
  const state = {
    completedStories: await getCompletedStories(),
    modifiedFiles: await getModifiedFiles(),
    recentCommits: await getRecentCommits(10),
    metrics: await calculateMetrics(),
  };

  return state;
}

/**
 * Get completed stories
 */
async function getCompletedStories() {
  const glob = require('glob');
  const storyFiles = glob.sync('docs/stories/story-*.md');

  const { parseFrontMatter } = require('./phase-detector');

  return storyFiles
    .map(file => {
      const content = fs.readFileSync(file, 'utf8');
      const frontMatter = parseFrontMatter(content);

      if (frontMatter && frontMatter.status === 'completed') {
        return {
          id: frontMatter.id || path.basename(file, '.md'),
          title: frontMatter.title || 'Untitled',
          file,
        };
      }

      return null;
    })
    .filter(Boolean);
}

/**
 * Get modified files from git
 */
async function getModifiedFiles() {
  try {
    const output = execSync('git diff --name-status HEAD~1 HEAD', {
      encoding: 'utf8',
    });

    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [status, file] = line.split('\t');
        return { status, file };
      });
  } catch (_error) {
    return [];
  }
}

/**
 * Get recent commits
 */
async function getRecentCommits(count = 10) {
  try {
    const output = execSync(`git log -${count} --oneline --no-decorate`, {
      encoding: 'utf8',
    });

    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [hash, ...messageParts] = line.split(' ');
        return {
          hash,
          message: messageParts.join(' '),
        };
      });
  } catch (_error) {
    return [];
  }
}

/**
 * Calculate metrics
 */
async function calculateMetrics() {
  const glob = require('glob');
  const allStories = glob.sync('docs/stories/story-*.md');
  const completedStories = await getCompletedStories();

  let commitCount = 0;
  try {
    commitCount = parseInt(
      execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim(),
    );
  } catch (_error) {
    // Ignore
  }

  return {
    totalStories: allStories.length,
    completedStories: completedStories.length,
    completionPercentage: Math.round(
      (completedStories.length / allStories.length) * 100,
    ),
    commitCount,
  };
}

/**
 * Generate checkpoint content from template
 */
function generateCheckpointContent(data) {
  // Simple template rendering (in production, use a proper template engine)
  return `# 📍 Checkpoint: Fase ${data.phase.id} — ${data.phase.name}

**Data:** ${data.date}
**Tipo:** ${data.type}
**Projeto:** ${data.projectName}
**Checkpoint ID:** ${data.checkpointId}

---

## Metadata

- **Fase ID:** ${data.phase.id}
- **Fase Nome:** ${data.phase.name}
- **Status da Fase:** ${data.phase.completion || 0}%
- **Criado por:** Navigator Agent

---

## ✅ Completed Stories

${data.completedStories.map(story => `
### ${story.id}: ${story.title}

- **Status:** ✅ Concluída
- **File:** \`${story.file}\`
`).join('\n')}

**Total:** ${data.completedStories.length} stories

---

## 📝 Modified Files

${data.modifiedFiles.map(f => `- \`${f.file}\` (${f.status})`).join('\n')}

**Total:** ${data.modifiedFiles.length} arquivos

---

## 📊 Métricas do Checkpoint

| Métrica | Valor |
|---------|-------|
| Stories concluídas | ${data.metrics.completedStories}/${data.metrics.totalStories} (${data.metrics.completionPercentage}%) |
| Commits totais | ${data.metrics.commitCount} |

---

## 💾 Restore Information

**Checkpoint ID:** ${data.checkpointId}
**Snapshot Path:** \`.aios/navigator/${data.projectName}/checkpoints/${data.checkpointId}.md\`

---

**Criado automaticamente por Navigator Agent 🧭**
`;
}

/**
 * Parse checkpoint content
 */
function parseCheckpoint(content) {
  // Extract metadata and content
  // In production, use proper markdown/YAML parsing
  return {
    content,
    parsed: true,
  };
}

/**
 * Get project name from roadmap
 */
function getProjectNameFromRoadmap() {
  // Try to extract from current directory or roadmap
  // Fallback to directory name
  return path.basename(process.cwd());
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const projectName = process.argv[3];

  if (command === 'list') {
    const checkpoints = listCheckpoints(projectName);
    console.log(JSON.stringify(checkpoints, null, 2));
  } else if (command === 'create') {
    const phaseId = parseInt(process.argv[4]);
    const type = process.argv[5] || 'manual';

    createCheckpoint({
      projectName,
      phase: { id: phaseId, name: `Phase ${phaseId}` },
      type,
    })
      .then(result => {
        console.log('✓ Checkpoint created:', result.checkpointId);
      })
      .catch(error => {
        console.error('✗ Failed:', error.message);
        process.exit(1);
      });
  } else {
    console.error('Usage: checkpoint-manager.js <list|create> <project-name> [phase-id] [type]');
    process.exit(1);
  }
}

module.exports = {
  createCheckpoint,
  listCheckpoints,
  loadCheckpoint,
};
