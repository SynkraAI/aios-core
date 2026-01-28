const { translateContent } = require('./rule-porter');

/**
 * AGENTS.md Generator - Creates the project-level rules file using a template
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Generate AGENTS.md file
 * @param {string} projectRoot - Project root directory
 * @param {object[]} agents - List of parsed agents
 * @param {object} options - Generation options
 */
async function generateAgentsMd(projectRoot, agents, options = {}) {
  const templatePath = path.join(
    projectRoot,
    '.aios-core',
    'product',
    'templates',
    'ide-rules',
    'opencode-rules.md'
  );
  const targetPath = path.join(projectRoot, 'AGENTS.md');

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  let rawContent = await fs.readFile(templatePath, 'utf8');

  // Apply terminology translation (Claude Code -> OpenCode)
  let content = translateContent(rawContent);

  // Replace placeholders
  const projectName = path.basename(projectRoot);
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const projectType = fs.existsSync(path.join(projectRoot, 'package.json'))
    ? 'Node.js/NPM'
    : 'Standard AIOS';

  // Extract project context (summary of agents)
  const agentList = agents
    .map((a) => {
      const title = a.agent?.title || a.id;
      const desc = a.agent?.whenToUse || a.agent?.description || '';
      return `- **@${a.id}**: ${title}${desc ? ' - ' + desc : ''}`;
    })
    .join('\n');

  content = content
    .replace(/{{projectName}}/g, projectName)
    .replace(/{{timestamp}}/g, timestamp)
    .replace(/{{projectType}}/g, projectType)
    .replace(/{{projectContext}}/g, `\n### Available Agents\n\n${agentList}\n`);

  if (!options.dryRun) {
    await fs.writeFile(targetPath, content, 'utf8');
  }

  return {
    path: targetPath,
    content,
    agentCount: agents.length,
  };
}

module.exports = {
  generateAgentsMd,
};
