/**
 * Rule Porter - Translates Claude Code rules to OpenCode format
 *
 * Source: .claude/rules/*.md
 * Target: .opencode/rules/*.md
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Translates content from Claude terminology to OpenCode
 * @param {string} content - Markdown content
 * @returns {string} - Translated content
 */
function translateContent(content) {
  return content
    .replace(/Claude Code/g, 'OpenCode')
    .replace(/CLAUDE\.md/g, 'AGENTS.md')
    .replace(/\.claude\//g, '.opencode/')
    .replace(/\.claude\.json/g, 'opencode.json')
    .replace(/~\/\.claude/g, '~/.config/opencode')
    .replace(/@claude/g, '@opencode');
}

/**
 * Port all rules to OpenCode
 * @param {string} projectRoot - Project root directory
 * @param {object} options - Options
 */
async function portRules(projectRoot, options = {}) {
  const sourceDir = path.join(projectRoot, '.claude', 'rules');
  const targetDir = path.join(projectRoot, '.opencode', 'rules');

  if (!(await fs.pathExists(sourceDir))) {
    return { success: false, error: 'Source Claude rules not found' };
  }

  const files = await fs.readdir(sourceDir);
  const ruleFiles = files.filter((f) => f.endsWith('.md'));
  const ported = [];

  for (const file of ruleFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    const content = await fs.readFile(sourcePath, 'utf8');
    const translated = translateContent(content);

    if (!options.dryRun) {
      await fs.ensureDir(targetDir);
      await fs.writeFile(targetPath, translated, 'utf8');
    }

    ported.push(file);
  }

  return { success: true, ported };
}

module.exports = {
  portRules,
  translateContent,
};
