/**
 * IDE Config Generator
 *
 * Story 1.4: IDE Selection
 * Generates IDE-specific configuration files with validation and rollback
 *
 * @module wizard/ide-config-generator
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const inquirer = require('inquirer');
const ora = require('ora');
const { getIDEConfig } = require('../config/ide-configs');
const { validateProjectName } = require('./validators');

/**
 * Render template with variables
 * @param {string} template - Template string
 * @param {Object} variables - Variables to interpolate
 * @returns {string} Rendered template
 */
function renderTemplate(template, variables) {
  let rendered = template;

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value);
  }

  return rendered;
}

/**
 * Validate config content based on format
 * @param {string} content - Config file content
 * @param {string} format - Format: 'json', 'yaml', or 'text'
 * @throws {Error} If validation fails
 */
function validateConfigContent(content, format) {
  if (format === 'json') {
    try {
      JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  } else if (format === 'yaml') {
    try {
      yaml.load(content);
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  }
  // Text format doesn't need validation
}

/**
 * Create backup of existing file
 * @param {string} filePath - Path to file to backup
 * @returns {Promise<string>} Backup file path
 */
async function backupFile(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;

  await fs.copy(filePath, backupPath);
  return backupPath;
}

/**
 * Prompt user for action when file exists
 * @param {string} filePath - Path to existing file
 * @returns {Promise<string>} Action: 'overwrite', 'skip', or 'backup'
 */
async function promptFileExists(filePath) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `File ${path.basename(filePath)} already exists. What would you like to do?`,
      choices: [
        { name: 'Overwrite', value: 'overwrite' },
        { name: 'Create backup and overwrite', value: 'backup' },
        { name: 'Skip', value: 'skip' }
      ],
      default: 'backup'
    }
  ]);

  return action;
}

/**
 * Sanitize and validate a candidate project name
 * Converts unsafe directory names to safe project names
 * 
 * @param {string} candidate - Candidate project name (e.g., from path.basename)
 * @returns {string} Safe, validated project name
 */
function sanitizeProjectName(candidate) {
  if (!candidate || typeof candidate !== 'string') {
    return 'my-project';
  }

  // Step 1: Convert to lowercase and replace spaces/special chars with dashes
  let sanitized = candidate
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-') // Replace non-alphanumeric (except dash/underscore) with dash
    .replace(/[-_]+/g, '-') // Collapse multiple dashes/underscores into single dash
    .replace(/^[-_]+|[-_]+$/g, ''); // Remove leading/trailing dashes/underscores

  // Step 2: Ensure it starts with alphanumeric
  sanitized = sanitized.replace(/^[^a-zA-Z0-9]+/, '');
  
  // Step 3: Limit length (validateProjectName allows up to 100)
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
    // Remove trailing dash if truncation created one
    sanitized = sanitized.replace(/-+$/, '');
  }

  // Step 4: Validate the sanitized name
  const validation = validateProjectName(sanitized);
  
  if (validation === true && sanitized.length > 0) {
    return sanitized;
  }

  // Step 5: If validation fails, generate a safe alphanumeric slug
  // Use first alphanumeric chars from original, or generate default
  const alphanumericOnly = candidate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (alphanumericOnly.length > 0 && alphanumericOnly.length <= 100) {
    const fallbackValidation = validateProjectName(alphanumericOnly);
    if (fallbackValidation === true) {
      return alphanumericOnly;
    }
  }

  // Step 6: Ultimate fallback - safe default
  return 'my-project';
}

/**
 * Generate template variables from wizard state
 * @param {Object} wizardState - Current wizard state
 * @returns {Object} Template variables
 */
function generateTemplateVariables(wizardState) {
  const timestamp = new Date().toISOString();

  // Safely get project name with validation
  // If provided, validate it; otherwise sanitize fallback from directory name
  let projectName;
  if (wizardState.projectName) {
    const validation = validateProjectName(wizardState.projectName);
    if (validation === true) {
      projectName = wizardState.projectName;
    } else {
      // If provided name is invalid, sanitize it
      projectName = sanitizeProjectName(wizardState.projectName);
    }
  } else {
    // No project name provided, sanitize fallback from directory name
    projectName = sanitizeProjectName(path.basename(process.cwd()));
  }

  return {
    projectName,
    projectType: wizardState.projectType || 'greenfield',
    timestamp,
    aiosVersion: '2.1.0' // From package.json in real implementation
  };
}

/**
 * Copy agent files from .aios-core/agents to IDE-specific agent folder
 * @param {string} projectRoot - Project root directory
 * @param {string} agentFolder - Target folder for agent files (IDE-specific)
 * @param {Object} ideConfig - IDE configuration object (optional, for special handling)
 * @returns {Promise<string[]>} List of copied files
 */
async function copyAgentFiles(projectRoot, agentFolder, ideConfig = null) {
  const sourceDir = path.join(__dirname, '..', '..', '.aios-core', 'agents');
  const targetDir = path.join(projectRoot, agentFolder);
  const copiedFiles = [];

  // Ensure target directory exists
  await fs.ensureDir(targetDir);

  // Get all agent files (excluding backup files)
  const files = await fs.readdir(sourceDir);
  const agentFiles = files.filter(file =>
    file.endsWith('.md') &&
    !file.includes('.backup') &&
    !file.startsWith('test-')  // Exclude test agents
  );

  // Check if this is AntiGravity - needs workflow files instead of direct copy
  const isAntiGravity = ideConfig && ideConfig.specialConfig && ideConfig.specialConfig.type === 'antigravity';

  for (const file of agentFiles) {
    const sourcePath = path.join(sourceDir, file);
    const agentName = file.replace('.md', '');

    // Only copy if source is a file (not directory)
    const stat = await fs.stat(sourcePath);
    if (stat.isFile()) {
      if (isAntiGravity) {
        // For AntiGravity: create workflow activation files
        const workflowContent = generateAntiGravityWorkflow(agentName);
        const targetPath = path.join(targetDir, file);
        await fs.writeFile(targetPath, workflowContent, 'utf8');
        copiedFiles.push(targetPath);

        // Also copy the actual agent to .antigravity/agents
        const agentsDir = path.join(projectRoot, ideConfig.specialConfig.agentsFolder);
        await fs.ensureDir(agentsDir);
        const agentTargetPath = path.join(agentsDir, file);
        await fs.copy(sourcePath, agentTargetPath);
        copiedFiles.push(agentTargetPath);
      } else {
        // Normal copy for other IDEs
        const targetPath = path.join(targetDir, file);
        await fs.copy(sourcePath, targetPath);
        copiedFiles.push(targetPath);
      }
    }
  }

  return copiedFiles;
}

/**
 * Generate AntiGravity workflow activation file content
 * @param {string} agentName - Name of the agent (e.g., 'dev', 'architect')
 * @returns {string} Workflow file content
 */
function generateAntiGravityWorkflow(agentName) {
  // Capitalize first letter for display
  const displayName = agentName.charAt(0).toUpperCase() + agentName.slice(1);

  return `---
description: Ativa o agente ${displayName}
---

# Ativação do Agente ${displayName}

**INSTRUÇÕES CRÍTICAS PARA O ANTIGRAVITY:**

1. Leia COMPLETAMENTE o arquivo \`.antigravity/agents/${agentName}.md\`
2. Siga EXATAMENTE as \`activation-instructions\` definidas no bloco YAML do agente
3. Adote a persona conforme definido no agente
4. Execute a saudação conforme \`greeting_levels\` definido no agente
5. **MANTENHA esta persona até receber o comando \`*exit\`**
6. Responda aos comandos com prefixo \`*\` conforme definido no agente
7. Siga as regras globais do projeto em \`.antigravity/rules.md\`

**Comandos disponíveis:** Use \`*help\` para ver todos os comandos do agente.
`;
}

/**
 * Create AntiGravity configuration JSON file
 * @param {string} projectRoot - Project root directory
 * @param {Object} ideConfig - AntiGravity IDE config
 * @returns {Promise<string>} Path to created file
 */
async function createAntiGravityConfigJson(projectRoot, ideConfig) {
  const configPath = path.join(projectRoot, ideConfig.specialConfig.configJsonPath);
  const projectName = path.basename(projectRoot);

  const config = {
    version: '1.0',
    project: projectName,
    workspace: projectRoot.replace(/\\/g, '/'),
    agents: {
      enabled: true,
      directory: ideConfig.specialConfig.agentsFolder,
      default: 'aios-master'
    },
    rules: {
      enabled: true,
      file: ideConfig.configFile
    },
    features: {
      storyDrivenDevelopment: true,
      agentActivation: true,
      workflowAutomation: true
    },
    paths: {
      stories: 'docs/stories',
      prd: 'docs/prd',
      architecture: 'docs/architecture',
      tasks: '.aios-core/tasks',
      workflows: '.aios-core/workflows'
    }
  };

  await fs.ensureDir(path.dirname(configPath));
  await fs.writeFile(configPath, JSON.stringify(config, null, 4), 'utf8');

  return configPath;
}

/**
 * Generate IDE configuration files
 *
 * AC2: Creates appropriate config file for each selected IDE
 * AC3: Validates config content before writing
 * AC4: Handles existing files with user prompt
 * AC5: Shows progress feedback
 *
 * @param {string[]} selectedIDEs - Array of IDE keys
 * @param {Object} wizardState - Current wizard state
 * @param {Object} options - Options
 * @param {string} options.projectRoot - Project root directory (defaults to cwd)
 * @returns {Promise<{success: boolean, files: string[], errors: Array}>}
 *
 * @example
 * const result = await generateIDEConfigs(['cursor', 'windsurf'], wizardState);
 * console.log(result.files); // ['.cursorrules', '.windsurfrules']
 */
async function generateIDEConfigs(selectedIDEs, wizardState, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const createdFiles = [];
  const createdFolders = [];
  const backupFiles = [];
  const errors = [];

  // Generate template variables
  const templateVars = generateTemplateVariables(wizardState);

  const spinner = ora();

  try {
    for (const ideKey of selectedIDEs) {
      const ide = getIDEConfig(ideKey);

      if (!ide) {
        errors.push({ ide: ideKey, error: 'IDE configuration not found' });
        continue;
      }

      spinner.start(`Configuring ${ide.name}...`);

      try {
        // Create directory if needed
        const configPath = path.join(projectRoot, ide.configFile);
        const configDir = path.dirname(configPath);

        if (ide.requiresDirectory) {
          await fs.ensureDir(configDir);
        }

        // Check if file exists
        const exists = await fs.pathExists(configPath);
        if (exists) {
          spinner.stop();
          const action = await promptFileExists(ide.configFile);

          if (action === 'skip') {
            spinner.succeed(`Skipped ${ide.name} (file exists)`);
            continue;
          }

          if (action === 'backup') {
            const backupPath = await backupFile(configPath);
            backupFiles.push(backupPath);
            spinner.info(`Created backup: ${path.basename(backupPath)}`);
          }

          spinner.start(`Configuring ${ide.name}...`);
        }

        // Load template from .aios-core/product/templates/
        const templatePath = path.join(__dirname, '..', '..', '.aios-core', 'product', 'templates', ide.template);

        if (!await fs.pathExists(templatePath)) {
          throw new Error(`Template file not found: ${ide.template}`);
        }

        const template = await fs.readFile(templatePath, 'utf8');

        // Render template
        const rendered = renderTemplate(template, templateVars);

        // Validate content
        validateConfigContent(rendered, ide.format);

        // Write file
        await fs.writeFile(configPath, rendered, 'utf8');
        createdFiles.push(configPath);

        spinner.succeed(`Created ${ide.configFile}`);

        // Copy agent files to IDE-specific agent folder
        if (ide.agentFolder) {
          spinner.start(`Copying agents to ${ide.agentFolder}...`);
          const agentFiles = await copyAgentFiles(projectRoot, ide.agentFolder, ide);
          createdFiles.push(...agentFiles);
          createdFolders.push(path.join(projectRoot, ide.agentFolder));

          // For AntiGravity, also create the antigravity.json config file
          if (ide.specialConfig && ide.specialConfig.type === 'antigravity') {
            const configJsonPath = await createAntiGravityConfigJson(projectRoot, ide);
            createdFiles.push(configJsonPath);
            spinner.succeed(`Created AntiGravity config and ${agentFiles.length} workflow files`);
          } else {
            spinner.succeed(`Copied ${agentFiles.length} agent files to ${ide.agentFolder}`);
          }
        }

      } catch (error) {
        spinner.fail(`Failed to configure ${ide.name}`);
        errors.push({ ide: ide.name, error: error.message });

        // Rollback: Delete all created files
        for (const file of createdFiles) {
          await fs.remove(file).catch(() => {});
        }

        // Rollback: Delete created folders
        for (const folder of createdFolders) {
          await fs.remove(folder).catch(() => {});
        }

        // Restore backups
        for (const backup of backupFiles) {
          const original = backup.replace(/\.backup\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/, '');
          await fs.move(backup, original, { overwrite: true }).catch(() => {});
        }

        throw new Error(`IDE config generation failed for ${ide.name}: ${error.message}`);
      }
    }

    return {
      success: true,
      files: createdFiles,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      files: [],
      errors: [{ error: error.message }]
    };
  }
}

/**
 * Show success summary after config generation
 * @param {Object} result - Result from generateIDEConfigs
 */
function showSuccessSummary(result) {
  if (result.files.length === 0) {
    console.log('\nNo IDE configurations created.');
    return;
  }

  console.log(`\n✅ Created ${result.files.length} IDE configuration(s):`);

  for (const file of result.files) {
    console.log(`  - ${path.basename(file)}`);
  }

  console.log('\n📋 Next Steps:');
  console.log('  1. Open your project in your selected IDE(s)');
  console.log('  2. The IDE should automatically recognize AIOS configuration');
  console.log('  3. Try activating an agent with @agent-name');
  console.log('  4. Use * commands to interact with agents\n');
}

module.exports = {
  generateIDEConfigs,
  showSuccessSummary,
  renderTemplate,
  validateConfigContent,
  backupFile,
  promptFileExists,
  generateTemplateVariables
};
