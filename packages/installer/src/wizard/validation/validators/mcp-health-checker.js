/**
 * MCP Health Checker
 * Task 1.8.3: MCP health checks (deferred from Story 1.5)
 *
 * Validates that installed MCPs are functioning correctly
 *
 * @module wizard/validation/validators/mcp-health-checker
 */

const fs = require('fs');

/**
 * Validate MCPs with health checks
 *
 * @param {Object} mcpContext - MCP installation result
 * @param {Object} mcpContext.installedMCPs - Map of installed MCPs
 * @param {string} mcpContext.configPath - Path to .mcp.json
 * @returns {Promise<Object>} Validation result
 */
async function validateMCPs(mcpContext = {}) {
  const results = {
    success: true,
    healthChecks: [],
    errors: [],
    warnings: [],
  };

  if (!mcpContext.installedMCPs || Object.keys(mcpContext.installedMCPs).length === 0) {
    results.checks = [{
      component: 'MCPs',
      status: 'skipped',
      message: 'No MCPs installed',
    }];
    return results;
  }

  try {
    // Load .mcp.json to get MCP configurations
    const mcpConfigPath = mcpContext.configPath || '.mcp.json';
    if (!fs.existsSync(mcpConfigPath)) {
      results.warnings.push({
        severity: 'medium',
        message: '.mcp.json not found - skipping health checks',
        code: 'MCP_CONFIG_MISSING',
      });
      return results;
    }

    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));

    // Run health checks for each installed MCP
    const healthCheckPromises = Object.entries(mcpContext.installedMCPs).map(
      async ([mcpId, installStatus]) => {
        if (installStatus.status !== 'success') {
          return {
            mcp: mcpId,
            status: 'skipped',
            message: 'Installation failed - skipping health check',
          };
        }

        try {
          const healthResult = await runHealthCheck(mcpId, mcpConfig.mcpServers[mcpId]);
          return {
            mcp: mcpId,
            status: healthResult.success ? 'success' : 'warning',
            message: healthResult.message,
            responseTime: healthResult.duration,
            details: healthResult.details,
          };
        } catch (error) {
          return {
            mcp: mcpId,
            status: 'failed',
            message: `Health check failed: ${error.message}`,
            error: error.message,
          };
        }
      },
    );

    const healthCheckResults = await Promise.all(healthCheckPromises);

    // Process results
    for (const healthCheck of healthCheckResults) {
      results.healthChecks.push(healthCheck);

      if (healthCheck.status === 'failed') {
        results.warnings.push({
          severity: 'medium',
          message: `${healthCheck.mcp} health check failed: ${healthCheck.message}`,
          code: 'MCP_HEALTH_CHECK_FAILED',
          mcp: healthCheck.mcp,
        });
      } else if (healthCheck.status === 'warning') {
        results.warnings.push({
          severity: 'low',
          message: `${healthCheck.mcp} health check warning: ${healthCheck.message}`,
          code: 'MCP_HEALTH_CHECK_WARNING',
          mcp: healthCheck.mcp,
        });
      }
    }

    // Overall success if at least one MCP is healthy
    const healthyCount = healthCheckResults.filter(r => r.status === 'success').length;
    const failedCount = healthCheckResults.filter(r => r.status === 'failed').length;

    if (healthyCount === 0 && failedCount > 0) {
      results.success = false;
      results.errors.push({
        severity: 'high',
        message: 'All MCP health checks failed',
        code: 'ALL_MCP_HEALTH_CHECKS_FAILED',
      });
    }

    return results;
  } catch (error) {
    results.errors.push({
      severity: 'medium',
      message: `MCP health check validation failed: ${error.message}`,
      code: 'MCP_HEALTH_CHECK_ERROR',
      details: error.stack,
    });

    return results;
  }
}

/**
 * Run health check for a specific MCP
 * @private
 *
 * @param {string} mcpId - MCP identifier
 * @param {Object} mcpConfig - MCP configuration from .mcp.json
 * @returns {Promise<Object>} Health check result
 */
async function runHealthCheck(mcpId, mcpConfig) {
  const startTime = Date.now();

  try {
    let result;

    switch (mcpId) {
      case 'browser':
        result = await testBrowserMCP(mcpConfig);
        break;

      case 'context7':
        result = await testContext7MCP(mcpConfig);
        break;

      case 'exa':
        result = await testExaMCP(mcpConfig);
        break;

      case 'desktop-commander':
        result = await testDesktopCommanderMCP(mcpConfig);
        break;

      default:
        result = {
          success: true,
          message: 'Unknown MCP type - basic config validation only',
          details: { configValid: !!mcpConfig },
        };
    }

    return {
      success: result.success,
      message: result.message,
      duration: Date.now() - startTime,
      details: result.details,
    };
  } catch (error) {
    return {
      success: false,
      message: `Health check error: ${error.message}`,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Test Browser MCP (Puppeteer)
 * @private
 */
async function testBrowserMCP(config) {
  // Basic validation: Check if command is configured
  if (!config || !config.command) {
    return {
      success: false,
      message: 'Invalid configuration - missing command',
      details: { configValid: false },
    };
  }

  // Note: Full browser test would require spawning puppeteer
  // For validation, we just check configuration validity
  return {
    success: true,
    message: 'Configuration valid (runtime test requires browser launch)',
    details: {
      configValid: true,
      command: config.command,
      note: 'Full test deferred to first use',
    },
  };
}

/**
 * Test Context7 MCP (npx/stdio configuration)
 * Now uses @upstash/context7-mcp package via npx
 * @private
 */
async function testContext7MCP(config) {
  // Context7 now uses npx/stdio transport instead of HTTP
  if (!config || !config.command) {
    return {
      success: false,
      message: 'Invalid configuration - missing command',
      details: { configValid: false },
    };
  }

  // Basic validation: Check if command is configured for npx execution
  return {
    success: true,
    message: 'Configuration valid (runtime test requires MCP server launch)',
    details: {
      configValid: true,
      command: config.command,
      note: 'Full test deferred to first use',
    },
  };
}

/**
 * Test Exa MCP (API test)
 * @private
 */
async function testExaMCP(config) {
  if (!config || !config.env || !config.env.EXA_API_KEY) {
    return {
      success: false,
      message: 'API key not configured in .env',
      details: {
        configValid: true,
        apiKeyConfigured: false,
        solution: 'Add EXA_API_KEY to .env file',
      },
    };
  }

  // Check if API key is a placeholder
  const apiKey = config.env.EXA_API_KEY;
  if (apiKey.includes('${') || apiKey === 'your-api-key-here') {
    return {
      success: false,
      message: 'API key is placeholder - update .env with real key',
      details: {
        configValid: true,
        apiKeyConfigured: false,
        solution: 'Replace ${EXA_API_KEY} or placeholder in .env',
      },
    };
  }

  return {
    success: true,
    message: 'Configuration valid (API test requires real API call)',
    details: {
      configValid: true,
      apiKeyConfigured: true,
      note: 'Full API test deferred to first use',
    },
  };
}

/**
 * Test Desktop Commander MCP (File access)
 * @private
 */
async function testDesktopCommanderMCP(config) {
  if (!config || !config.command) {
    return {
      success: false,
      message: 'Invalid configuration - missing command',
      details: { configValid: false },
    };
  }

  // Basic validation: Check if command is configured
  return {
    success: true,
    message: 'Configuration valid (file access test requires runtime)',
    details: {
      configValid: true,
      command: config.command,
      note: 'Full test deferred to first use',
    },
  };
}

module.exports = {
  validateMCPs,
  runHealthCheck,
};
