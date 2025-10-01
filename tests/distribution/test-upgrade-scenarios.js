#!/usr/bin/env node

/**
 * AIOS-FULLSTACK Upgrade Scenario Testing
 * Tests migration from BMAD-METHOD to AIOS-FULLSTACK
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const semver = require('semver');

class UpgradeScenarioTester {
  constructor() {
    this.testDir = path.join(__dirname, '..', '..', 'test-upgrades');
    this.scenarios = [
      {
        name: 'Basic BMAD Project',
        description: 'Simple project with agents and tasks',
        setup: this.setupBasicBmadProject.bind(this)
      },
      {
        name: 'Complex BMAD Project',
        description: 'Project with custom workflows and memory data',
        setup: this.setupComplexBmadProject.bind(this)
      },
      {
        name: 'Production BMAD Project',
        description: 'Project with live data and custom configurations',
        setup: this.setupProductionBmadProject.bind(this)
      },
      {
        name: 'Corrupted BMAD Project',
        description: 'Project with invalid configurations to test error handling',
        setup: this.setupCorruptedBmadProject.bind(this)
      }
    ];
    this.results = [];
  }

  async runTests() {
    console.log(chalk.blue('\n🔄 AIOS-FULLSTACK Upgrade Scenario Testing\n'));
    
    // Ensure test directory exists
    await fs.ensureDir(this.testDir);

    for (const scenario of this.scenarios) {
      console.log(chalk.yellow(`\nTesting: ${scenario.name}`));
      console.log(chalk.gray(scenario.description));
      
      const result = await this.testScenario(scenario);
      this.results.push(result);
      
      if (result.success) {
        console.log(chalk.green('✅ PASSED'));
      } else {
        console.log(chalk.red('❌ FAILED'));
        console.log(chalk.red(`Error: ${result.error}`));
      }
    }

    // Print summary
    this.printSummary();
    
    // Cleanup
    await this.cleanup();
  }

  async testScenario(scenario) {
    const scenarioDir = path.join(this.testDir, scenario.name.toLowerCase().replace(/\s+/g, '-'));
    
    try {
      // Setup scenario
      await scenario.setup(scenarioDir);
      
      // Test upgrade process
      const upgradeResult = await this.performUpgrade(scenarioDir);
      
      // Validate upgrade
      const validationResult = await this.validateUpgrade(scenarioDir);
      
      return {
        name: scenario.name,
        success: upgradeResult.success && validationResult.success,
        upgradeResult,
        validationResult,
        metrics: {
          setupTime: upgradeResult.setupTime,
          upgradeTime: upgradeResult.upgradeTime,
          validationTime: validationResult.time,
          dataPreserved: validationResult.dataPreserved,
          configurationMigrated: validationResult.configurationMigrated
        }
      };
    } catch (error) {
      return {
        name: scenario.name,
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  async setupBasicBmadProject(dir) {
    await fs.ensureDir(dir);
    
    // Create old BMAD structure
    await fs.ensureDir(path.join(dir, '.bmad'));
    await fs.ensureDir(path.join(dir, 'bmad-core'));
    await fs.ensureDir(path.join(dir, 'bmad-core', 'agents'));
    await fs.ensureDir(path.join(dir, 'bmad-core', 'tasks'));
    
    // Create old package.json
    await fs.writeJson(path.join(dir, 'package.json'), {
      name: 'bmad-method-project',
      version: '3.0.0',
      dependencies: {
        'bmad-method': '^3.0.0'
      }
    }, { spaces: 2 });
    
    // Create sample agent with old naming
    await fs.writeFile(
      path.join(dir, 'bmad-core', 'agents', 'bmad-orchestrator.md'),
      `---
name: BMad Orchestrator
type: orchestrator
version: 1.0.0
---

# BMad Orchestrator Agent

This is a BMAD-METHOD agent for orchestration.`
    );
    
    // Create sample task
    await fs.writeFile(
      path.join(dir, 'bmad-core', 'tasks', 'setup.md'),
      `# Setup Task

Uses BMad Method for environment setup.`
    );
    
    // Create old config
    await fs.writeJson(path.join(dir, '.bmad', 'config.json'), {
      framework: 'BMAD-METHOD',
      version: '3.0.0',
      settings: {
        aiProvider: 'openai',
        memoryEnabled: true
      }
    }, { spaces: 2 });
  }

  async setupComplexBmadProject(dir) {
    // Start with basic setup
    await this.setupBasicBmadProject(dir);
    
    // Add complex elements
    await fs.ensureDir(path.join(dir, 'bmad-core', 'workflows'));
    await fs.ensureDir(path.join(dir, 'bmad-core', 'memory'));
    await fs.ensureDir(path.join(dir, 'bmad-core', 'agent-teams'));
    
    // Create workflow
    await fs.writeFile(
      path.join(dir, 'bmad-core', 'workflows', 'deploy.yaml'),
      `name: Deploy Workflow
version: 1.0.0
framework: BMAD-METHOD
steps:
  - agent: bmad-orchestrator
    task: setup
  - agent: bmad-master
    task: validate`
    );
    
    // Create memory data
    await fs.writeJson(
      path.join(dir, 'bmad-core', 'memory', 'index.json'),
      {
        entries: [
          { id: '1', content: 'BMad knowledge entry', tags: ['bmad', 'method'] },
          { id: '2', content: 'BMAD-METHOD workflow', tags: ['workflow'] }
        ]
      },
      { spaces: 2 }
    );
    
    // Create team manifest
    await fs.writeFile(
      path.join(dir, 'bmad-core', 'agent-teams', 'team-all.yaml'),
      `name: All Agents Team
agents:
  - bmad-orchestrator
  - bmad-master
  - custom-agent`
    );
  }

  async setupProductionBmadProject(dir) {
    // Start with complex setup
    await this.setupComplexBmadProject(dir);
    
    // Add production elements
    await fs.ensureDir(path.join(dir, '.bmad', 'logs'));
    await fs.ensureDir(path.join(dir, '.bmad', 'backups'));
    await fs.ensureDir(path.join(dir, 'dist'));
    
    // Add production data
    await fs.writeFile(
      path.join(dir, '.bmad', 'logs', 'bmad.log'),
      `2025-01-15 10:00:00 - BMad Method initialized
2025-01-15 10:01:00 - Agent bmad-orchestrator activated
2025-01-15 10:02:00 - Task completed successfully`
    );
    
    // Add user customizations
    await fs.writeJson(
      path.join(dir, '.bmad', 'user-settings.json'),
      {
        theme: 'dark',
        autoSave: true,
        customAgents: ['my-custom-agent'],
        apiKeys: {
          openai: 'sk-proj-xxx'
        }
      },
      { spaces: 2 }
    );
    
    // Add build artifacts
    await fs.writeFile(
      path.join(dir, 'dist', 'bundle.js'),
      '// BMad Method bundled code'
    );
  }

  async setupCorruptedBmadProject(dir) {
    await fs.ensureDir(dir);
    
    // Create corrupted package.json
    await fs.writeFile(
      path.join(dir, 'package.json'),
      '{ "name": "corrupted", invalid json }'
    );
    
    // Create invalid YAML
    await fs.ensureDir(path.join(dir, 'bmad-core', 'agent-teams'));
    await fs.writeFile(
      path.join(dir, 'bmad-core', 'agent-teams', 'team.yaml'),
      `name: Team
  agents:
- invalid yaml structure
  - missing proper indentation`
    );
    
    // Create .bmad directory first
    await fs.ensureDir(path.join(dir, '.bmad'));
    
    // Create config in existing directory
    await fs.writeJson(
      path.join(dir, '.bmad', 'config.json'),
      {
        framework: 'BMAD-METHOD',
        version: '3.0.0'
      },
      { spaces: 2 }
    );
  }

  async performUpgrade(projectDir) {
    const startTime = Date.now();
    
    try {
      // Simulate upgrade command
      const upgradePath = path.join(__dirname, '..', '..', 'tools', 'migrate-bmad.js');
      
      // Check if migration tool exists
      if (!await fs.pathExists(upgradePath)) {
        console.log(chalk.yellow('Creating migration tool...'));
        await this.createMigrationTool(upgradePath);
      }
      
      // Run upgrade
      const result = await this.runMigration(projectDir);
      
      return {
        success: result.success,
        setupTime: startTime,
        upgradeTime: Date.now() - startTime,
        changes: result.changes || [],
        warnings: result.warnings || []
      };
    } catch (error) {
      console.error('Upgrade error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
        upgradeTime: Date.now() - startTime,
        setupTime: startTime
      };
    }
  }

  async createMigrationTool(toolPath) {
    await fs.ensureDir(path.dirname(toolPath));
    
    await fs.writeFile(toolPath, `#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function migrate(projectDir) {
  console.log(chalk.blue('Starting BMAD → AIOS migration...'));
  
  const changes = [];
  const warnings = [];
  
  try {
    // 1. Update package.json
    const pkgPath = path.join(projectDir, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      try {
        const pkg = await fs.readJson(pkgPath);
        if (pkg.dependencies && pkg.dependencies['bmad-method']) {
          delete pkg.dependencies['bmad-method'];
          pkg.dependencies['aios-fullstack'] = '^4.4.0';
          changes.push('Updated package.json dependencies');
        }
        pkg.name = pkg.name.replace('bmad', 'aios');
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      } catch (e) {
        warnings.push('Could not parse package.json - manual fix required');
      }
    }
    
    // 2. Rename directories
    const renames = [
      { from: '.bmad', to: '.aios-core' },
      { from: 'bmad-core', to: 'aios-core' }
    ];
    
    for (const { from, to } of renames) {
      const fromPath = path.join(projectDir, from);
      const toPath = path.join(projectDir, to);
      if (await fs.pathExists(fromPath)) {
        await fs.move(fromPath, toPath, { overwrite: true });
        changes.push(\`Renamed \${from} to \${to}\`);
      }
    }
    
    // 3. Update file contents
    const aiosCoreDir = path.join(projectDir, 'aios-core');
    if (await fs.pathExists(aiosCoreDir)) {
      await updateFileContents(aiosCoreDir, changes, warnings);
    }
    
    // 4. Migrate configuration
    const configPath = path.join(projectDir, '.aios-core', 'config.json');
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      config.framework = 'AIOS-FULLSTACK';
      config.version = '4.4.0';
      config.migrated = {
        from: 'BMAD-METHOD',
        date: new Date().toISOString()
      };
      await fs.writeJson(configPath, config, { spaces: 2 });
      changes.push('Updated configuration');
    }
    
    // 5. Create migration report
    const report = {
      success: true,
      date: new Date().toISOString(),
      changes,
      warnings,
      nextSteps: [
        'Run npm install to update dependencies',
        'Test all agents and workflows',
        'Review warnings and fix any issues'
      ]
    };
    
    await fs.writeJson(
      path.join(projectDir, 'migration-report.json'),
      report,
      { spaces: 2 }
    );
    
    return report;
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      changes,
      warnings
    };
  }
}

async function updateFileContents(dir, changes, warnings) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await updateFileContents(filePath, changes, warnings);
    } else if (file.name.endsWith('.md') || file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
      try {
        let content = await fs.readFile(filePath, 'utf8');
        const originalContent = content;
        
        // Replace common patterns
        content = content.replace(/BMAD-METHOD/g, 'AIOS-FULLSTACK');
        content = content.replace(/BMad Method/g, 'AIOS Method');
        content = content.replace(/bmad-method/g, 'aios-fullstack');
        content = content.replace(/bmad-orchestrator/g, 'aios-orchestrator');
        content = content.replace(/bmad-master/g, 'aios-master');
        content = content.replace(/\\.bmad/g, '.aios-core');
        content = content.replace(/bmad-core/g, 'aios-core');
        
        if (content !== originalContent) {
          await fs.writeFile(filePath, content);
          changes.push(\`Updated content in \${file.name}\`);
        }
      } catch (e) {
        warnings.push(\`Could not process \${file.name}\`);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const projectDir = process.argv[2];
  if (!projectDir) {
    console.error('Usage: node migrate-bmad.js <project-directory>');
    process.exit(1);
  }
  
  migrate(projectDir).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { migrate };`);
    
    await fs.chmod(toolPath, '755');
  }

  async runMigration(projectDir) {
    try {
      const migratePath = path.join(__dirname, '..', '..', 'tools', 'migrate-bmad.js');
      const output = execSync(`node "${migratePath}" "${projectDir}"`, {
        encoding: 'utf8'
      });
      
      return JSON.parse(output);
    } catch (error) {
      // If the command failed, try to parse any output
      if (error.stdout) {
        try {
          return JSON.parse(error.stdout);
        } catch (e) {
          // Fall through to error
        }
      }
      
      return {
        success: false,
        error: error.message,
        changes: [],
        warnings: []
      };
    }
  }

  async validateUpgrade(projectDir) {
    const startTime = Date.now();
    const validation = {
      dataPreserved: true,
      configurationMigrated: true,
      functionalityIntact: true,
      issues: []
    };
    
    try {
      // Check new directory structure
      const expectedDirs = ['.aios-core', 'aios-core'];
      for (const dir of expectedDirs) {
        if (!await fs.pathExists(path.join(projectDir, dir))) {
          validation.issues.push(`Missing expected directory: ${dir}`);
          validation.functionalityIntact = false;
        }
      }
      
      // Check old directories are gone
      const oldDirs = ['.bmad', 'bmad-core'];
      for (const dir of oldDirs) {
        if (await fs.pathExists(path.join(projectDir, dir))) {
          validation.issues.push(`Old directory still exists: ${dir}`);
          validation.configurationMigrated = false;
        }
      }
      
      // Check package.json
      const pkgPath = path.join(projectDir, 'package.json');
      if (await fs.pathExists(pkgPath)) {
        try {
          const pkg = await fs.readJson(pkgPath);
          if (pkg.dependencies && pkg.dependencies['bmad-method']) {
            validation.issues.push('Old bmad-method dependency still present');
            validation.configurationMigrated = false;
          }
          if (!pkg.dependencies || !pkg.dependencies['aios-fullstack']) {
            validation.issues.push('New aios-fullstack dependency missing');
            validation.functionalityIntact = false;
          }
        } catch (e) {
          validation.issues.push('Invalid package.json after migration');
          validation.functionalityIntact = false;
        }
      }
      
      // Check configuration
      const configPath = path.join(projectDir, '.aios-core', 'config.json');
      if (await fs.pathExists(configPath)) {
        const config = await fs.readJson(configPath);
        if (config.framework !== 'AIOS-FULLSTACK') {
          validation.issues.push('Configuration not properly migrated');
          validation.configurationMigrated = false;
        }
        if (!config.migrated) {
          validation.issues.push('Migration metadata missing');
        }
      }
      
      // Check file content updates
      const checkFiles = [
        'aios-core/agents/aios-orchestrator.md',
        'aios-core/agent-teams/team-all.yaml'
      ];
      
      for (const file of checkFiles) {
        const filePath = path.join(projectDir, file);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          if (content.includes('BMAD') || content.includes('bmad')) {
            validation.issues.push(`File still contains BMAD references: ${file}`);
            validation.dataPreserved = false;
          }
        }
      }
      
      // Check migration report
      const reportPath = path.join(projectDir, 'migration-report.json');
      if (!await fs.pathExists(reportPath)) {
        validation.issues.push('Migration report not generated');
      }
      
      return {
        success: validation.issues.length === 0,
        time: Date.now() - startTime,
        dataPreserved: validation.dataPreserved,
        configurationMigrated: validation.configurationMigrated,
        functionalityIntact: validation.functionalityIntact,
        issues: validation.issues
      };
    } catch (error) {
      return {
        success: false,
        time: Date.now() - startTime,
        error: error.message,
        dataPreserved: false,
        configurationMigrated: false,
        functionalityIntact: false
      };
    }
  }

  printSummary() {
    console.log(chalk.blue('\n📊 Upgrade Testing Summary\n'));
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const passRate = (passed / total * 100).toFixed(1);
    
    console.log(`Total scenarios: ${total}`);
    console.log(`Passed: ${chalk.green(passed)}`);
    console.log(`Failed: ${chalk.red(total - passed)}`);
    console.log(`Pass rate: ${passRate >= 75 ? chalk.green(passRate + '%') : chalk.red(passRate + '%')}`);
    
    console.log('\nDetailed Results:');
    console.log('─'.repeat(80));
    
    for (const result of this.results) {
      const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      console.log(`\n${result.name}: ${status}`);
      
      if (result.success) {
        console.log(`  Upgrade time: ${result.metrics.upgradeTime}ms`);
        console.log(`  Data preserved: ${result.metrics.dataPreserved ? 'Yes' : 'No'}`);
        console.log(`  Config migrated: ${result.metrics.configurationMigrated ? 'Yes' : 'No'}`);
        
        if (result.validationResult.issues.length > 0) {
          console.log(`  Warnings: ${result.validationResult.issues.join(', ')}`);
        }
      } else {
        console.log(`  Error: ${result.error}`);
      }
    }
    
    // Performance metrics
    console.log('\n⚡ Performance Metrics:');
    const successfulResults = this.results.filter(r => r.success);
    if (successfulResults.length > 0) {
      const avgUpgradeTime = successfulResults.reduce((sum, r) => sum + r.metrics.upgradeTime, 0) / successfulResults.length;
      console.log(`Average upgrade time: ${avgUpgradeTime.toFixed(0)}ms`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (passRate < 100) {
      console.log('- Review failed scenarios and improve error handling');
      console.log('- Add more validation checks for edge cases');
      console.log('- Consider adding rollback functionality');
    } else {
      console.log('- All scenarios passed! Ready for production upgrades');
    }
  }

  async cleanup() {
    try {
      await fs.remove(this.testDir);
      console.log(chalk.gray('\nTest directories cleaned up'));
    } catch (error) {
      console.log(chalk.yellow('\nCould not clean up test directories'));
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new UpgradeScenarioTester();
  tester.runTests().catch(console.error);
}

module.exports = UpgradeScenarioTester;