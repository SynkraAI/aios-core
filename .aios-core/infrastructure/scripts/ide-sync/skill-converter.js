/**
 * Skill Converter - Converts AIOS Tasks to OpenCode Skills
 *
 * Source: .aios-core/development/tasks/*.md
 * Target: .opencode/skills/<task-name>/SKILL.md
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Extract description from task content
 * @param {string} content - Markdown content
 * @returns {string} - Extracted description
 */
function extractDescription(content) {
  // Try to find a header or first paragraph
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      return trimmed.substring(0, 100) + (trimmed.length > 100 ? '...' : '');
    }
  }
  return 'AIOS Task Workflow';
}

/**
 * Sync all tasks to OpenCode skills
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Sync options
 */
async function syncSkills(projectRoot, options = {}) {
  const sourceDir = path.join(projectRoot, '.aios-core', 'development', 'tasks');
  const targetBaseDir = path.join(projectRoot, '.opencode', 'skills');

  if (!(await fs.pathExists(sourceDir))) {
    return { success: false, error: 'Source tasks directory not found' };
  }

  const files = await fs.readdir(sourceDir);
  const taskFiles = files.filter((f) => f.endsWith('.md'));
  const synced = [];

  for (const file of taskFiles) {
    const taskName = file.replace('.md', '');
    // Remove prefixes like 'dev-', 'po-', etc if they exist to keep skill names clean
    const cleanSkillName = taskName.replace(/^(dev|po|sm|pm|qa|architect|analyst)-/, '');

    const sourcePath = path.join(sourceDir, file);
    const targetDir = path.join(targetBaseDir, cleanSkillName);
    const targetPath = path.join(targetDir, 'SKILL.md');

    const content = await fs.readFile(sourcePath, 'utf8');
    const description = extractDescription(content);

    const skillContent = `---
description: "${description.replace(/"/g, '\\"')}"
---

# ${cleanSkillName.charAt(0).toUpperCase() + cleanSkillName.slice(1)}

${content}

---
*AIOS Skill - Synced from .aios-core/development/tasks/${file}*
`;

    if (!options.dryRun) {
      await fs.ensureDir(targetDir);
      await fs.writeFile(targetPath, skillContent, 'utf8');
    }

    synced.push({
      name: cleanSkillName,
      originalName: taskName,
      originalFile: file,
      path: targetPath,
      description,
    });
  }

  return { success: true, synced };
}

module.exports = {
  syncSkills,
};
