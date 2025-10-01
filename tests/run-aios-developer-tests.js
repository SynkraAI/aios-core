#!/usr/bin/env node
/**
 * Test runner for AIOS Developer Meta-Agent tests
 * Since npm test is not configured, this provides a way to run the tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

async function runTests() {
  console.log('🧪 Running AIOS Developer Meta-Agent Tests\n');
  
  const testFile = path.join(__dirname, 'unit/agents/aios-developer.test.js');
  
  // Check if test file exists
  if (!await fs.pathExists(testFile)) {
    console.error('❌ Test file not found:', testFile);
    process.exit(1);
  }
  
  // Check if jest is available globally or locally
  let jestCommand = 'jest';
  let jestArgs = [testFile, '--verbose'];
  
  // Try to find jest
  const localJest = path.join(__dirname, '../node_modules/.bin/jest');
  if (await fs.pathExists(localJest)) {
    jestCommand = localJest;
  }
  
  console.log(`Running: ${jestCommand} ${jestArgs.join(' ')}\n`);
  
  // Run jest
  const jest = spawn(jestCommand, jestArgs, {
    stdio: 'inherit',
    shell: true
  });
  
  jest.on('error', (err) => {
    console.error('❌ Failed to run tests:', err.message);
    console.log('\nℹ️  Jest may not be installed. To run tests manually:');
    console.log('1. Install Jest: npm install --save-dev jest');
    console.log('2. Run: npx jest tests/unit/agents/aios-developer.test.js');
    process.exit(1);
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log(`\n❌ Tests failed with code ${code}`);
    }
    process.exit(code);
  });
}

// Alternative: Run tests with Node's assert if Jest is not available
async function runWithNodeAssert() {
  console.log('ℹ️  Running basic validation with Node.js assert...\n');
  
  try {
    // Basic file existence checks
    const checks = [
      { path: 'aios-core/agents/aios-developer.md', name: 'Agent definition' },
      { path: 'aios-core/tasks/create-agent.md', name: 'Create agent task' },
      { path: 'aios-core/tasks/create-task.md', name: 'Create task task' },
      { path: 'aios-core/tasks/create-workflow.md', name: 'Create workflow task' },
      { path: 'aios-core/tasks/update-manifest.md', name: 'Update manifest task' },
      { path: 'aios-core/utils/security-checker.js', name: 'Security checker' },
      { path: 'aios-core/utils/yaml-validator.js', name: 'YAML validator' },
      { path: 'docs/aios-developer/README.md', name: 'Documentation' },
      { path: 'tests/unit/agents/aios-developer.test.js', name: 'Unit tests' }
    ];
    
    const projectRoot = path.join(__dirname, '..');
    let allPassed = true;
    
    for (const check of checks) {
      const fullPath = path.join(projectRoot, check.path);
      const exists = await fs.pathExists(fullPath);
      console.log(`${exists ? '✅' : '❌'} ${check.name}: ${check.path}`);
      if (!exists) allPassed = false;
    }
    
    // Check manifest registration
    const manifestPath = path.join(projectRoot, 'aios-core/agent-teams/team-all.yaml');
    if (await fs.pathExists(manifestPath)) {
      const content = await fs.readFile(manifestPath, 'utf8');
      const hasAgent = content.includes('aios-developer');
      console.log(`${hasAgent ? '✅' : '❌'} Agent registered in manifest`);
      if (!hasAgent) allPassed = false;
    }
    
    console.log(`\n${allPassed ? '✅ Basic validation passed!' : '❌ Some checks failed'}`);
    return allPassed;
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  // Try to run with Jest first
  try {
    await runTests();
  } catch (error) {
    // If Jest fails, run basic validation
    console.log('\n⚠️  Jest not available, running basic validation...\n');
    const passed = await runWithNodeAssert();
    process.exit(passed ? 0 : 1);
  }
})();