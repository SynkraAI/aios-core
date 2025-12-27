#!/usr/bin/env node

/**
 * PM Configuration Migration Script
 *
 * Auto-detects existing PM tool configuration from environment variables
 * and creates .aios-pm-config.yaml for backward compatibility.
 *
 * @see Story 3.20 - PM Tool-Agnostic Integration (TR-3.20.10)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Detect existing PM tool from environment variables
 */
function detectExistingPMTool() {
  // Check for ClickUp environment variables
  if (process.env.CLICKUP_API_TOKEN) {
    console.log('✓ Detected ClickUp configuration from environment variables');

    return {
      type: 'clickup',
      config: {
        api_token: '${CLICKUP_API_TOKEN}',
        team_id: process.env.CLICKUP_TEAM_ID || '',
        space_id: process.env.CLICKUP_SPACE_ID || '',
        list_id: process.env.CLICKUP_LIST_ID || '',
      },
    };
  }

  // Check for Jira environment variables
  if (process.env.JIRA_API_TOKEN && process.env.JIRA_BASE_URL) {
    console.log('✓ Detected Jira configuration from environment variables');

    return {
      type: 'jira',
      config: {
        base_url: process.env.JIRA_BASE_URL,
        api_token: '${JIRA_API_TOKEN}',
        email: process.env.JIRA_EMAIL || '',
        project_key: process.env.JIRA_PROJECT_KEY || 'AIOS',
      },
    };
  }

  // Check for GitHub (gh CLI authenticated)
  try {
    const { execSync } = require('child_process');
    const ghStatus = execSync('gh auth status 2>&1', { encoding: 'utf8' });

    if (ghStatus.includes('Logged in')) {
      console.log('✓ Detected GitHub CLI authentication');

      // Check if user wants to use GitHub Projects
      if (process.env.GITHUB_PROJECT_NUMBER) {
        return {
          type: 'github-projects',
          config: {
            org: process.env.GITHUB_ORG || '',
            project_number: parseInt(process.env.GITHUB_PROJECT_NUMBER) || 0,
          },
        };
      }
    }
  } catch (error) {
    // gh CLI not available or not authenticated
  }

  return null;
}

/**
 * Save PM configuration to .aios-pm-config.yaml
 */
function savePMConfig(pmToolData, projectRoot) {
  const config = {
    pm_tool: {
      type: pmToolData.type,
      configured_at: new Date().toISOString(),
      config: pmToolData.config,
      migrated_from_env: true,
    },
    sync_behavior: {
      auto_sync_on_status_change: true,
      create_tasks_on_story_creation: false,
      bidirectional_sync: false,
    },
  };

  const configPath = path.join(projectRoot, '.aios-pm-config.yaml');

  // Backup existing config if present
  if (fs.existsSync(configPath)) {
    const backupPath = `${configPath}.backup-${Date.now()}`;
    fs.copyFileSync(configPath, backupPath);
    console.log(`✓ Backed up existing config to ${path.basename(backupPath)}`);
  }

  fs.writeFileSync(configPath, yaml.dump(config));
  console.log(`✓ Created ${configPath}`);

  return configPath;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🔄 AIOS PM Configuration Migration\n');

  const projectRoot = process.cwd();

  // Check if config already exists
  const configPath = path.join(projectRoot, '.aios-pm-config.yaml');

  if (fs.existsSync(configPath)) {
    console.log('ℹ️  Configuration already exists: .aios-pm-config.yaml');
    console.log('');

    // Read existing config
    try {
      const existingConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
      console.log(`Current PM tool: ${existingConfig.pm_tool?.type || 'unknown'}`);
      console.log('');
      console.log('To reconfigure, either:');
      console.log('  1. Delete .aios-pm-config.yaml and run this script again');
      console.log('  2. Run: aios init');
      console.log('');
    } catch (error) {
      console.error('⚠️  Existing config is malformed');
    }

    process.exit(0);
  }

  // Detect existing PM tool
  console.log('Scanning environment variables for PM tool configuration...\n');

  const detected = detectExistingPMTool();

  if (detected) {
    console.log(`\nPM Tool: ${detected.type}`);
    console.log('Configuration:');
    console.log(JSON.stringify(detected.config, null, 2));
    console.log('');

    // Validate required fields
    const missingFields = [];

    if (detected.type === 'clickup') {
      if (!detected.config.team_id) missingFields.push('CLICKUP_TEAM_ID');
      if (!detected.config.space_id) missingFields.push('CLICKUP_SPACE_ID');
      if (!detected.config.list_id) missingFields.push('CLICKUP_LIST_ID');
    }

    if (detected.type === 'jira') {
      if (!detected.config.email) missingFields.push('JIRA_EMAIL');
    }

    if (detected.type === 'github-projects') {
      if (!detected.config.org) missingFields.push('GITHUB_ORG');
      if (!detected.config.project_number) missingFields.push('GITHUB_PROJECT_NUMBER');
    }

    if (missingFields.length > 0) {
      console.log('⚠️  Missing environment variables:');
      missingFields.forEach(field => console.log(`   - ${field}`));
      console.log('');
      console.log('Options:');
      console.log('  1. Set missing variables and run migration again');
      console.log('  2. Run: aios init (interactive configuration)');
      console.log('');
      process.exit(1);
    }

    // Save config
    const savedPath = savePMConfig(detected, projectRoot);

    console.log('');
    console.log('✅ Migration complete!');
    console.log('');
    console.log('Your existing PM tool configuration has been migrated.');
    console.log('AIOS will now work with the adapter pattern while maintaining');
    console.log('full backward compatibility with your existing setup.');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  - No changes required to your workflow');
    console.log('  - sync-story and pull-story commands continue to work');
    console.log('  - All existing environment variables still used');
    console.log('');

  } else {
    console.log('ℹ️  No existing PM tool configuration detected');
    console.log('');
    console.log('To configure a PM tool, run: aios init');
    console.log('');
    console.log('AIOS will work in local-only mode (no PM tool) until configured.');
    console.log('');

    // Create local-only config
    savePMConfig({ type: 'local', config: {} }, projectRoot);

    console.log('');
    console.log('✅ Local-only configuration created');
    console.log('');
  }
}

// Run migration
migrate().catch(error => {
  console.error('❌ Migration failed:', error.message);
  console.error('');
  console.error('Run with DEBUG=* for more details');
  process.exit(1);
});
