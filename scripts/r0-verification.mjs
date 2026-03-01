#!/usr/bin/env node
/**
 * R0 Pre-Implementation Verification Script
 * Tests 3 load-bearing assumptions of the Session Daemon Phase 0 architecture:
 *
 * Q5: Does settingSources load CLAUDE.md into the SDK session?
 * Q2: Does resumeSession() work after session close?
 * Q6: Are deny rules enforced with bypassPermissions?
 */

import { query, unstable_v2_createSession, unstable_v2_resumeSession } from '@anthropic-ai/claude-agent-sdk';

const RESULTS = { pass: 0, fail: 0, tests: [] };

function record(name, passed, details) {
  RESULTS.tests.push({ name, passed, details });
  if (passed) RESULTS.pass++;
  else RESULTS.fail++;
  console.log(`${passed ? 'PASS' : 'FAIL'}: ${name}`);
  if (details) console.log(`  -> ${details}`);
}

// ============================================================
// TEST 1: Q5 — Does settingSources load CLAUDE.md?
// ============================================================
async function testClaudeMdLoading() {
  console.log('\n=== TEST 1: CLAUDE.md Loading (Q5) ===\n');

  let sessionId = null;
  try {
    const messages = [];
    const q = query({
      prompt: 'List the AIOS agents available (like @dev, @qa, @architect). Just list their names, nothing else. If you have no knowledge of AIOS agents, say "NO_AIOS_CONTEXT".',
      options: {
        cwd: '/home/ubuntu/aios-core',
        settingSources: ['user', 'project', 'local'],
        systemPrompt: { type: 'preset', preset: 'claude_code' },
        permissionMode: 'bypassPermissions',
        model: 'claude-haiku-4-5-20251001',
        maxTurns: 1,
        allowedTools: [],
      },
    });

    for await (const msg of q) {
      if (msg.type === 'system' && msg.subtype === 'init') {
        sessionId = msg.session_id;
        console.log(`  Session ID: ${sessionId}`);
      }
      if (msg.type === 'result') {
        const text = msg.result || '';
        messages.push(text);

        const hasAgents = text.includes('@dev') || text.includes('@qa') || text.includes('@architect');
        const noContext = text.includes('NO_AIOS_CONTEXT');

        if (hasAgents && !noContext) {
          record('Q5: settingSources loads CLAUDE.md', true, 'Agents found in response: AIOS context is loaded');
        } else {
          record('Q5: settingSources loads CLAUDE.md', false, `Response: ${text.slice(0, 200)}`);
        }
      }
    }

    return sessionId;
  } catch (err) {
    record('Q5: settingSources loads CLAUDE.md', false, `Error: ${err.message}`);
    return null;
  }
}

// ============================================================
// TEST 2: Q2 — Does resumeSession() work?
// ============================================================
async function testResumeSession(previousSessionId) {
  console.log('\n=== TEST 2: resumeSession() Reliability (Q2) ===\n');

  if (!previousSessionId) {
    record('Q2: resumeSession() works', false, 'No session ID from Test 1');
    return;
  }

  try {
    console.log(`  Resuming session: ${previousSessionId}`);

    const q = query({
      prompt: 'What was my previous question about? Answer in one sentence.',
      options: {
        cwd: '/home/ubuntu/aios-core',
        resume: previousSessionId,
        settingSources: ['user', 'project', 'local'],
        systemPrompt: { type: 'preset', preset: 'claude_code' },
        permissionMode: 'bypassPermissions',
        model: 'claude-haiku-4-5-20251001',
        maxTurns: 1,
        allowedTools: [],
      },
    });

    for await (const msg of q) {
      if (msg.type === 'result') {
        const text = msg.result || '';
        // If it remembers AIOS agents or the previous question, resume works
        const remembers = text.includes('agent') || text.includes('AIOS') || text.includes('@dev') || text.includes('list');
        const noMemory = text.includes("don't have") || text.includes('no previous') || text.includes("can't recall");

        if (remembers && !noMemory) {
          record('Q2: resumeSession() works', true, `Remembers context: ${text.slice(0, 150)}`);
        } else {
          record('Q2: resumeSession() works', false, `No memory of previous turn: ${text.slice(0, 200)}`);
        }
      }
    }
  } catch (err) {
    const isIndexBug = err.message.includes('session') || err.message.includes('index');
    record('Q2: resumeSession() works', false, `Error (${isIndexBug ? 'likely sessions-index.json bug' : 'unknown'}): ${err.message}`);
  }
}

// ============================================================
// TEST 3: Q6 — Are deny rules enforced with bypassPermissions?
// ============================================================
async function testDenyRules() {
  console.log('\n=== TEST 3: Deny Rules with bypassPermissions (Q6) ===\n');

  try {
    const q = query({
      prompt: 'Read the file at .aios-core/constitution.md and tell me the first line. If you cannot read it, say "DENIED".',
      options: {
        cwd: '/home/ubuntu/aios-core',
        settingSources: ['user', 'project', 'local'],
        systemPrompt: { type: 'preset', preset: 'claude_code' },
        permissionMode: 'bypassPermissions',
        model: 'claude-haiku-4-5-20251001',
        maxTurns: 3,
        allowedTools: ['Read'],
      },
    });

    let readAttempted = false;
    let readSucceeded = false;
    let resultText = '';

    for await (const msg of q) {
      if (msg.type === 'assistant' && msg.message) {
        const content = msg.message.content || [];
        for (const block of content) {
          if (block.type === 'tool_use' && block.name === 'Read') {
            readAttempted = true;
            console.log(`  Read tool attempted on: ${block.input?.file_path || 'unknown'}`);
          }
        }
      }
      if (msg.type === 'user' && msg.message) {
        const content = msg.message.content || [];
        for (const block of content) {
          if (block.type === 'tool_result' && !block.is_error) {
            readSucceeded = true;
          }
        }
      }
      if (msg.type === 'result') {
        resultText = msg.result || '';
      }
    }

    const denied = resultText.includes('DENIED') || resultText.includes('denied') || resultText.includes('cannot') || resultText.includes('not allowed');

    if (readAttempted && !readSucceeded) {
      record('Q6: Deny rules enforced with bypassPermissions', true, 'Read was attempted but blocked by deny rules');
    } else if (denied) {
      record('Q6: Deny rules enforced with bypassPermissions', true, 'Agent reported denial');
    } else if (readSucceeded) {
      record('Q6: Deny rules enforced with bypassPermissions', false, 'Read SUCCEEDED — deny rules NOT enforced. Constitution L1 files are readable.');
    } else {
      record('Q6: Deny rules enforced with bypassPermissions', false, `Inconclusive. Response: ${resultText.slice(0, 200)}`);
    }
  } catch (err) {
    record('Q6: Deny rules enforced with bypassPermissions', false, `Error: ${err.message}`);
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  R0 Pre-Implementation Verification Script       ║');
  console.log('║  Session Daemon Phase 0 — 3 Critical Assumptions ║');
  console.log('╚══════════════════════════════════════════════════╝');

  const sessionId = await testClaudeMdLoading();
  await testResumeSession(sessionId);
  await testDenyRules();

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                    RESULTS                        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  for (const t of RESULTS.tests) {
    console.log(`║  ${t.passed ? 'PASS' : 'FAIL'}  ${t.name}`);
  }
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Total: ${RESULTS.pass} PASS, ${RESULTS.fail} FAIL                         ║`);
  console.log('╚══════════════════════════════════════════════════╝');

  if (RESULTS.fail === 0) {
    console.log('\n✅ ALL TESTS PASSED — Architecture APPROVED for implementation.');
  } else {
    console.log('\n❌ SOME TESTS FAILED — Review before proceeding with implementation.');
  }

  process.exit(RESULTS.fail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
