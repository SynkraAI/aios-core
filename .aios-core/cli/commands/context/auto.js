/**
 * Context Auto Command
 * Auto-detect session context from project
 *
 * Usage: aios context auto [--dry-run]
 *
 * @module cli/commands/context/auto
 */

const SessionStateManager = require('../../../core/session/state-manager');
const ContextTracker = require('../../../core/session/context-tracker');
const { updateTerminalTitle } = require('../../../../bin/utils/terminal-title');
const readline = require('readline');

async function execute(args) {
  const isDryRun = args.includes('--dry-run');

  try {
    // Create tracker and detect context
    const tracker = new ContextTracker();
    const detected = await tracker.detectContext();

    // Display detected values
    console.log('Auto-detected context:\n');

    console.log('  Project:');
    console.log(`    Type: ${detected.project.type} (confidence: ${Math.round(detected.confidence.projectType * 100)}%)`);
    console.log(`    Name: ${detected.project.name}`);
    console.log(`    Emoji: ${detected.project.emoji}`);

    if (detected.git.branch) {
      console.log('\n  Git Status:');
      console.log(`    Branch: ${detected.git.branch}`);
      console.log(`    Uncommitted Changes: ${detected.git.hasChanges ? 'yes' : 'no'} ${detected.git.emoji}`);
    }

    if (detected.status.phase) {
      console.log('\n  Status:');
      console.log(`    Phase: ${detected.status.phase} (confidence: ${Math.round(detected.confidence.phase * 100)}%)`);
      if (detected.status.progress) {
        const [current, total] = detected.status.progress.split('/').map(Number);
        const percentage = Math.round((current / total) * 100);
        console.log(`    Progress: ${detected.status.progress} (${percentage}%)`);
      }
    }

    // Dry run - stop here
    if (isDryRun) {
      console.log('\n🔍 Dry run - no changes made.');
      return;
    }

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('\nApply this context? [Y/n]: ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      console.log('❌ Cancelled.');
      process.exit(0);
    }

    // Apply detected context
    const manager = SessionStateManager;
    await manager.update({
      project: detected.project,
      status: {
        phase: detected.status.phase,
        progress: detected.status.progress,
        emoji: detected.status.emoji || (detected.git.hasChanges ? '🟡' : '🟢')
      }
    });

    // Update terminal title
    const session = await manager.read();
    updateTerminalTitle(session);

    console.log('\n✓ Context updated');
  } catch (error) {
    console.error(`Error detecting context: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { execute };
