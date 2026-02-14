#!/usr/bin/env node
/**
 * Test Monitor Cleanup - BOB-BUGFIX-1 Manual Validation
 *
 * Tests that monitor processes are properly cleaned up after agent execution
 */

const { execSync } = require('child_process');
const { spawnAgent } = require('./.aios-core/core/orchestration/terminal-spawner');

function countMonitors() {
  try {
    // Use pgrep to be more precise - only processes actually running the script
    const output = execSync('pgrep -f "monitor-claude-status.sh" 2>/dev/null || true', {
      encoding: 'utf8',
    }).trim();
    return output ? output.split('\n').filter(Boolean).length : 0;
  } catch {
    return 0;
  }
}

async function test() {
  console.log('🧪 Testing Monitor Process Cleanup (BOB-BUGFIX-1)\n');

  // Step 1: Check initial state
  const before = countMonitors();
  console.log(`✓ Before spawn: ${before} monitor processes`);
  if (before !== 0) {
    console.warn(`⚠️  Warning: Expected 0 monitors before test, found ${before}`);
  }

  // Step 2: Spawn a simple agent (dev with a simple task)
  console.log('\n📡 Spawning @dev agent with simple task...');
  console.log('   (This will open a terminal tab briefly)');

  try {
    const result = await spawnAgent('dev', 'help', {
      debug: true,
      timeout: 10000, // 10 seconds timeout for quick test
    });

    console.log('\n✓ Agent execution completed');
    console.log(`  Result: ${result.success ? 'Success' : 'Failed'}`);
  } catch (error) {
    console.log(`\n⚠️  Agent execution error: ${error.message}`);
    console.log('   (This is OK for testing - we just want to verify cleanup)');
  }

  // Step 3: Wait for cleanup (terminal may take a few seconds to fully close)
  console.log('\n⏳ Waiting 5 seconds for cleanup...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 4: Check final state
  const after = countMonitors();
  console.log(`\n📊 Final Results:`);
  console.log(`   Before: ${before} monitors`);
  console.log(`   After:  ${after} monitors`);

  if (after === 0) {
    console.log('\n✅ SUCCESS: All monitor processes cleaned up!');
    console.log('   BOB-BUGFIX-1 validation PASSED ✓');
    process.exit(0);
  } else {
    console.log('\n❌ FAILURE: Orphan monitor processes detected!');
    console.log(`   Expected: 0, Found: ${after}`);
    console.log('\n   Orphan processes:');
    try {
      const orphans = execSync('ps aux | grep "monitor-claude-status.sh" | grep -v grep', {
        encoding: 'utf8',
      });
      console.log(orphans);
    } catch {}
    process.exit(1);
  }
}

test().catch(err => {
  console.error('\n💥 Test failed with error:', err);
  process.exit(1);
});
