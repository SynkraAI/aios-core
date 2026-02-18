#!/usr/bin/env node
/**
 * AIOS Context Setter
 * Updates session context to display in terminal tab title and status bar
 *
 * Usage:
 *   aios context set <text>
 *   aios context set epic "Epic name"
 *   aios context set story "Story name"
 *   aios context set task "Task name"
 *   aios context clear
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SESSION_FILE = '.aios/session.json';

async function setContext(args) {
  const projectRoot = process.cwd();
  const sessionPath = path.join(projectRoot, SESSION_FILE);

  try {
    // Read current session
    let session = {};
    try {
      session = JSON.parse(await fs.readFile(sessionPath, 'utf-8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // Create default session if doesn't exist
      session = {
        version: '1.0.0',
        pid: process.pid,
        sessionId: `session-${Date.now()}`,
        project: {
          type: 'unknown',
          name: path.basename(projectRoot),
          emoji: '📦',
        },
        status: {
          phase: 'active',
          progress: '',
          currentTask: '',
          emoji: '',
        },
        context: {},
        metadata: {
          startedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    }

    // Parse arguments
    const [type, ...valueParts] = args;
    const value = valueParts.join(' ');

    if (!session.context) {
      session.context = {};
    }

    // Handle different commands
    if (type === 'clear') {
      session.context = {};
      console.log('✅ Context cleared');
    } else if (type === 'epic' || type === 'story' || type === 'task') {
      if (!value) {
        console.error(`❌ Error: Please provide a ${type} name`);
        process.exit(1);
      }
      session.context[type] = value;
      console.log(`✅ ${type} set: ${value}`);
    } else {
      // Default: set as current task
      const contextText = [type, ...valueParts].join(' ');
      session.context.task = contextText;
      console.log(`✅ Context set: ${contextText}`);
    }

    // Update timestamp
    session.metadata = session.metadata || {};
    session.metadata.lastUpdatedAt = new Date().toISOString();

    // Write back
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');

    // Update terminal title
    try {
      const updateScript = path.join(projectRoot, '.aios-core/infrastructure/scripts/terminal/update-tab-title.sh');
      execSync(`bash "${updateScript}"`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Could not update terminal title');
    }

    // Show current context
    const contextParts = [
      session.context.epic,
      session.context.story,
      session.context.task,
    ].filter(Boolean);

    if (contextParts.length > 0) {
      console.log(`📍 Current context: ${contextParts.join(' → ')}`);
    }

  } catch (error) {
    console.error('❌ Error setting context:', error.message);
    process.exit(1);
  }
}

// Get arguments (skip node and script name)
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
AIOS Context Setter

Usage:
  aios context set <text>              Set context as current task
  aios context set epic "Epic name"    Set epic level context
  aios context set story "Story name"  Set story level context
  aios context set task "Task name"    Set task level context
  aios context clear                   Clear all context

Examples:
  aios context set "Landing Page Help"
  aios context set epic "Q1 2026 Features"
  aios context set story "User Authentication"
  aios context set task "Implement login form"
  aios context clear
  `);
  process.exit(0);
}

setContext(args);
