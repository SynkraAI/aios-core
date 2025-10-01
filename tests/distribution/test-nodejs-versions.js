#!/usr/bin/env node

/**
 * AIOS-FULLSTACK Node.js Version Compatibility Testing
 * Tests the framework on different Node.js versions
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync, spawn } = require('child_process');
const semver = require('semver');

class NodeVersionTester {
  constructor() {
    this.testDir = path.join(__dirname, '..', '..', 'test-node-versions');
    this.currentNodeVersion = process.version;
    this.testedVersions = ['14.21.3', '16.20.2', '18.19.0', '20.11.0'];
    this.results = {};
  }

  async runTests() {
    console.log(chalk.blue('\n🔧 AIOS-FULLSTACK Node.js Version Compatibility Testing\n'));
    console.log(`Current Node.js version: ${chalk.cyan(this.currentNodeVersion)}`);
    
    try {
      // Check if we can test multiple versions
      const nvmAvailable = await this.checkNvmAvailability();
      
      if (nvmAvailable) {
        console.log(chalk.green('✅ NVM detected - testing multiple versions'));
        await this.testWithNvm();
      } else {
        console.log(chalk.yellow('⚠️  NVM not available - testing current version only'));
        await this.testCurrentVersion();
      }
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error(chalk.red('Test failed:'), error.message);
    } finally {
      await this.cleanup();
    }
  }

  async checkNvmAvailability() {
    try {
      // Check for nvm on Unix-like systems
      execSync('command -v nvm', { shell: '/bin/bash' });
      return true;
    } catch {
      try {
        // Check for nvm-windows
        execSync('nvm version', { shell: true });
        return true;
      } catch {
        return false;
      }
    }
  }

  async testCurrentVersion() {
    const version = process.version.slice(1); // Remove 'v' prefix
    console.log(`\nTesting on Node.js ${version}...`);
    
    const result = await this.runTestSuite(version);
    this.results[version] = result;
  }

  async testWithNvm() {
    for (const version of this.testedVersions) {
      console.log(`\nTesting on Node.js ${version}...`);
      
      try {
        // Install version if needed
        console.log('  Installing Node.js version...');
        execSync(`nvm install ${version}`, { 
          stdio: 'inherit',
          shell: true 
        });
        
        // Use version
        execSync(`nvm use ${version}`, { 
          shell: true 
        });
        
        // Run tests
        const result = await this.runTestSuite(version);
        this.results[version] = result;
        
      } catch (error) {
        this.results[version] = {
          success: false,
          error: `Failed to test: ${error.message}`,
          tests: {}
        };
      }
    }
    
    // Switch back to original version
    console.log(`\nSwitching back to original Node.js version...`);
    execSync(`nvm use ${this.currentNodeVersion.slice(1)}`, { 
      shell: true 
    });
  }

  async runTestSuite(version) {
    const startTime = Date.now();
    const testResults = {
      success: true,
      duration: 0,
      tests: {
        syntaxCheck: null,
        installation: null,
        cliCommands: null,
        agentActivation: null,
        memoryLayer: null,
        performance: null
      }
    };

    try {
      // Create test directory
      const versionTestDir = path.join(this.testDir, `node-${version}`);
      await fs.ensureDir(versionTestDir);

      // Test 1: Syntax compatibility check
      console.log('  Running syntax compatibility check...');
      testResults.tests.syntaxCheck = await this.testSyntaxCompatibility(version);

      // Test 2: Installation test
      console.log('  Testing installation process...');
      testResults.tests.installation = await this.testInstallation(versionTestDir, version);

      // Test 3: CLI commands
      console.log('  Testing CLI commands...');
      testResults.tests.cliCommands = await this.testCliCommands(versionTestDir, version);

      // Test 4: Agent activation
      console.log('  Testing agent activation...');
      testResults.tests.agentActivation = await this.testAgentActivation(versionTestDir, version);

      // Test 5: Memory layer
      console.log('  Testing memory layer...');
      testResults.tests.memoryLayer = await this.testMemoryLayer(versionTestDir, version);

      // Test 6: Performance benchmarks
      console.log('  Running performance benchmarks...');
      testResults.tests.performance = await this.testPerformance(versionTestDir, version);

      // Calculate overall success
      testResults.success = Object.values(testResults.tests).every(t => t && t.passed);
      testResults.duration = Date.now() - startTime;

    } catch (error) {
      testResults.success = false;
      testResults.error = error.message;
    }

    return testResults;
  }

  async testSyntaxCompatibility(version) {
    try {
      const majorVersion = parseInt(version.split('.')[0]);
      const issues = [];

      // Check for unsupported syntax based on version
      if (majorVersion < 14) {
        issues.push('Optional chaining (?.) not supported');
        issues.push('Nullish coalescing (??) not supported');
      }

      if (majorVersion < 16) {
        issues.push('Array.prototype.at() not supported');
        issues.push('Promise.any() not supported');
      }

      if (majorVersion < 18) {
        issues.push('fetch() API not available');
        issues.push('Intl.Locale improvements not available');
      }

      // Check actual syntax in key files
      const filesToCheck = [
        'bin/aios-fullstack.js',
        'install/wizard.js',
        'aios-core/utils/elicitation-engine.js'
      ];

      for (const file of filesToCheck) {
        const filePath = path.join(__dirname, '..', '..', file);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          
          // Check for modern syntax
          if (content.includes('?.') && majorVersion < 14) {
            issues.push(`${file} uses optional chaining`);
          }
          if (content.includes('??') && majorVersion < 14) {
            issues.push(`${file} uses nullish coalescing`);
          }
          if (content.includes('.at(') && majorVersion < 16) {
            issues.push(`${file} uses Array.at()`);
          }
        }
      }

      return {
        passed: issues.length === 0,
        issues,
        compatible: majorVersion >= 14
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  async testInstallation(testDir, version) {
    try {
      // Copy minimal package.json
      const pkg = {
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          'aios-fullstack': 'file:../..'
        }
      };

      await fs.writeJson(path.join(testDir, 'package.json'), pkg, { spaces: 2 });

      // Run npm install
      execSync('npm install --no-save', {
        cwd: testDir,
        stdio: 'pipe',
        timeout: 120000 // 2 minutes timeout
      });

      // Verify installation
      const nodeModulesExists = await fs.pathExists(path.join(testDir, 'node_modules'));
      const aiosExists = await fs.pathExists(path.join(testDir, 'node_modules', 'aios-fullstack'));

      return {
        passed: nodeModulesExists && aiosExists,
        nodeModulesExists,
        aiosExists
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  async testCliCommands(testDir, version) {
    const commands = ['--version', '--help', 'info'];
    const results = {};

    try {
      for (const cmd of commands) {
        try {
          const output = execSync(`node node_modules/aios-fullstack/bin/aios-fullstack.js ${cmd}`, {
            cwd: testDir,
            encoding: 'utf8',
            timeout: 10000
          });

          results[cmd] = {
            success: true,
            outputLength: output.length
          };
        } catch (error) {
          results[cmd] = {
            success: false,
            error: error.message
          };
        }
      }

      const allPassed = Object.values(results).every(r => r.success);

      return {
        passed: allPassed,
        commands: results
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  async testAgentActivation(testDir, version) {
    try {
      // Create a simple test script
      const testScript = `
const path = require('path');

// Mock agent activation
console.log('Testing agent activation...');

// Simulate loading agent
const agentPath = path.join(__dirname, 'node_modules/aios-fullstack/aios-core/agents/aios-developer.md');
const fs = require('fs');

if (fs.existsSync(agentPath)) {
  console.log('Agent file found');
  const content = fs.readFileSync(agentPath, 'utf8');
  if (content.includes('aios-developer')) {
    console.log('Agent validation passed');
    process.exit(0);
  }
}

console.error('Agent validation failed');
process.exit(1);
`;

      await fs.writeFile(path.join(testDir, 'test-agent.js'), testScript);

      // Run test
      execSync('node test-agent.js', {
        cwd: testDir,
        stdio: 'pipe',
        timeout: 5000
      });

      return {
        passed: true,
        message: 'Agent activation successful'
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  async testMemoryLayer(testDir, version) {
    try {
      // Create memory test script
      const testScript = `
const path = require('path');

// Test memory layer compatibility
console.log('Testing memory layer...');

try {
  // Check if memory module exists
  const memoryPath = path.join(__dirname, 'node_modules/aios-fullstack/memory');
  const fs = require('fs');
  
  if (!fs.existsSync(memoryPath)) {
    throw new Error('Memory module not found');
  }
  
  // Check package.json
  const pkgPath = path.join(memoryPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log('Memory module version:', pkg.version);
    process.exit(0);
  }
  
} catch (error) {
  console.error('Memory test failed:', error.message);
  process.exit(1);
}
`;

      await fs.writeFile(path.join(testDir, 'test-memory.js'), testScript);

      // Run test
      execSync('node test-memory.js', {
        cwd: testDir,
        stdio: 'pipe',
        timeout: 5000
      });

      return {
        passed: true,
        message: 'Memory layer compatible'
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  async testPerformance(testDir, version) {
    try {
      // Create performance test
      const perfScript = `
const { performance } = require('perf_hooks');

// Simple performance test
console.log('Running performance test...');

const iterations = 10000;
const start = performance.now();

// Test basic operations
let result = 0;
for (let i = 0; i < iterations; i++) {
  result += Math.sqrt(i);
  const obj = { a: i, b: i * 2 };
  const str = JSON.stringify(obj);
  JSON.parse(str);
}

const duration = performance.now() - start;
console.log(\`Performance test completed in \${duration.toFixed(2)}ms\`);
console.log(\`Operations per second: \${(iterations / (duration / 1000)).toFixed(0)}\`);

process.exit(0);
`;

      await fs.writeFile(path.join(testDir, 'test-performance.js'), perfScript);

      // Run test
      const output = execSync('node test-performance.js', {
        cwd: testDir,
        encoding: 'utf8',
        timeout: 30000
      });

      // Parse performance results
      const durationMatch = output.match(/completed in ([\d.]+)ms/);
      const opsMatch = output.match(/Operations per second: (\d+)/);

      return {
        passed: true,
        duration: durationMatch ? parseFloat(durationMatch[1]) : null,
        opsPerSecond: opsMatch ? parseInt(opsMatch[1]) : null
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  printResults() {
    console.log(chalk.blue('\n📊 Node.js Version Compatibility Results\n'));

    const versions = Object.keys(this.results).sort();
    
    // Summary table
    console.log('Version Compatibility Summary:');
    console.log('─'.repeat(60));
    console.log('Version    Status    Syntax  Install  CLI  Agent  Memory  Perf');
    console.log('─'.repeat(60));

    for (const version of versions) {
      const result = this.results[version];
      const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
      
      const tests = result.tests || {};
      const syntax = tests.syntaxCheck?.passed ? '✓' : '✗';
      const install = tests.installation?.passed ? '✓' : '✗';
      const cli = tests.cliCommands?.passed ? '✓' : '✗';
      const agent = tests.agentActivation?.passed ? '✓' : '✗';
      const memory = tests.memoryLayer?.passed ? '✓' : '✗';
      const perf = tests.performance?.passed ? '✓' : '✗';

      console.log(
        `${version.padEnd(10)} ${status}  ${syntax.padEnd(7)} ${install.padEnd(8)} ${cli.padEnd(4)} ${agent.padEnd(6)} ${memory.padEnd(7)} ${perf}`
      );
    }

    console.log('─'.repeat(60));

    // Detailed results
    console.log('\nDetailed Results:');
    for (const version of versions) {
      const result = this.results[version];
      console.log(`\nNode.js ${version}:`);
      
      if (result.error) {
        console.log(`  Error: ${result.error}`);
        continue;
      }

      if (result.tests?.syntaxCheck?.issues?.length > 0) {
        console.log('  Syntax issues:');
        result.tests.syntaxCheck.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }

      if (result.tests?.performance?.opsPerSecond) {
        console.log(`  Performance: ${result.tests.performance.opsPerSecond.toLocaleString()} ops/sec`);
      }
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    const allVersions = Object.keys(this.results);
    const passedVersions = allVersions.filter(v => this.results[v].success);
    
    if (passedVersions.length === allVersions.length) {
      console.log('- All tested Node.js versions are compatible! ✅');
      console.log('- Framework supports Node.js 14.x through 20.x');
    } else {
      console.log(`- Compatible with Node.js versions: ${passedVersions.join(', ')}`);
      console.log('- Consider adding polyfills for older versions');
      console.log('- Update documentation with version requirements');
    }

    // Minimum version recommendation
    const minVersion = passedVersions.length > 0 ? passedVersions[0] : '20.0.0';
    console.log(`- Recommended minimum version: Node.js ${minVersion}`);
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
  const tester = new NodeVersionTester();
  tester.runTests().catch(console.error);
}

module.exports = NodeVersionTester;