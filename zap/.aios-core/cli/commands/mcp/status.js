/**
 * MCP Status Command
 *
 * Shows global/project MCP configuration status.
 *
 * @module cli/commands/mcp/status
 * @version 1.0.0
 * @story 2.11 - MCP System Global
 */

const { Command } = require('commander');
const {
  globalConfigExists,
  listServers,
  readGlobalConfig,
} = require('../../../core/mcp/global-config-manager');
const {
  checkLinkStatus,
  LINK_STATUS,
} = require('../../../core/mcp/symlink-manager');
const {
  getGlobalConfigPath,
  getGlobalMcpDir,
  getOSInfo,
  getLinkType,
} = require('../../../core/mcp/os-detector');
const { detectProjectConfig } = require('../../../core/mcp/config-migrator');

/**
 * Create the status command
 * @returns {Command} Commander command instance
 */
function createStatusCommand() {
  const status = new Command('status');

  status
    .description('Show global and project MCP configuration status')
    .option('--json', 'Output as JSON')
    .option('-v, --verbose', 'Show detailed server information')
    .action(async (options) => {
      await executeStatus(options);
    });

  return status;
}

/**
 * Execute the status command
 * @param {Object} options - Command options
 */
async function executeStatus(options) {
  const projectRoot = process.cwd();

  // Gather status information
  const globalExists = globalConfigExists();
  const linkStatus = checkLinkStatus(projectRoot);
  const projectConfig = detectProjectConfig(projectRoot);
  const osInfo = getOSInfo();
  const serverList = globalExists ? listServers() : { servers: [], total: 0, enabled: 0 };
  const globalConfig = globalExists ? readGlobalConfig() : null;

  // JSON output
  if (options.json) {
    const jsonOutput = {
      global: {
        exists: globalExists,
        path: getGlobalConfigPath(),
        version: globalConfig?.version || null,
        servers: serverList,
      },
      project: {
        path: projectRoot,
        linkStatus: linkStatus.status,
        linkPath: linkStatus.linkPath,
        linkTarget: linkStatus.target || null,
        hasLocalConfig: projectConfig.found,
        localConfigPath: projectConfig.path,
      },
      os: {
        type: osInfo.type,
        linkType: getLinkType(),
      },
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Human-readable output
  console.log('MCP Configuration Status\n');
  console.log('═'.repeat(50));

  // Global Config Section
  console.log('\n📁 Global Config');
  console.log('─'.repeat(30));

  if (globalExists) {
    console.log(`  Path: ${getGlobalConfigPath()}`);
    console.log(`  Version: ${globalConfig?.version || 'unknown'}`);
    console.log(`  Servers: ${serverList.total} configured, ${serverList.enabled} enabled`);
  } else {
    console.log('  Status: ❌ Not configured');
    console.log('  Run "aios mcp setup" to create global config');
  }

  // Project Link Section
  console.log('\n🔗 Project Link');
  console.log('─'.repeat(30));
  console.log(`  Path: ${linkStatus.linkPath}`);

  switch (linkStatus.status) {
    case LINK_STATUS.LINKED:
      console.log('  Status: ✅ Linked to global');
      console.log(`  Target: ${linkStatus.target}`);
      console.log(`  Type: ${linkStatus.type}`);
      break;
    case LINK_STATUS.NOT_LINKED:
      console.log('  Status: ⚪ Not linked');
      console.log('  Run "aios mcp link" to link project to global config');
      break;
    case LINK_STATUS.BROKEN:
      console.log('  Status: 🔴 Broken link');
      console.log(`  Target: ${linkStatus.target}`);
      console.log('  Run "aios mcp link --force" to fix');
      break;
    case LINK_STATUS.DIRECTORY:
      console.log('  Status: 📁 Local directory (not linked)');
      if (projectConfig.found) {
        console.log(`  Local config: ${projectConfig.serverCount} servers`);
        console.log('  Run "aios mcp link --migrate" to use global config');
      }
      break;
    default:
      console.log(`  Status: ⚠️ ${linkStatus.message}`);
  }

  // Servers Section
  if (globalExists && serverList.servers.length > 0) {
    console.log('\n📡 Servers');
    console.log('─'.repeat(30));

    for (const server of serverList.servers) {
      const statusIcon = server.enabled ? '✅' : '❌';
      const typeLabel = server.type === 'sse' ? '(SSE)' : '(npx)';

      console.log(`  ${statusIcon} ${server.name} ${typeLabel}`);

      if (options.verbose) {
        if (server.url) {
          console.log(`     URL: ${server.url}`);
        }
        if (server.command) {
          console.log(`     Command: ${server.command}`);
        }
      }
    }
  }

  // OS Information
  if (options.verbose) {
    console.log('\n💻 System');
    console.log('─'.repeat(30));
    console.log(`  OS: ${osInfo.type} (${osInfo.platform})`);
    console.log(`  Arch: ${osInfo.arch}`);
    console.log(`  Link type: ${getLinkType()}`);
    console.log(`  Home: ${osInfo.homeDir}`);
  }

  console.log('\n' + '═'.repeat(50));

  // Quick actions
  if (!globalExists) {
    console.log('\n💡 Quick start: aios mcp setup --with-defaults');
  } else if (linkStatus.status === LINK_STATUS.NOT_LINKED) {
    console.log('\n💡 Link project: aios mcp link');
  } else if (serverList.enabled === 0) {
    console.log('\n💡 Add server: aios mcp add context7');
  }
}

module.exports = {
  createStatusCommand,
  executeStatus,
};
