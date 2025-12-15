# Decision Logging Guide

**Version:** 1.0
**Story:** 6.1.2.6.2 - Complete Decision Log Automation Infrastructure
**Created:** 2025-11-16

---

## Overview

The AIOS Decision Logging System automatically tracks architectural decisions and technical choices during **yolo mode** (autonomous) development. Decision logs follow the Architecture Decision Record (ADR) format and are generated automatically without manual effort.

### Key Features

- ✅ **Automatic Tracking** - Decisions captured during yolo mode execution
- ✅ **ADR Format** - Follows industry-standard Architecture Decision Record format
- ✅ **Rollback Information** - Git commit hash and file list for safe rollback
- ✅ **Performance Metrics** - Execution time, agent load time, test results
- ✅ **Zero Overhead** - Async logging doesn't block development workflow

---

## Quick Start

### For Framework Users

Decision logging is **enabled by default** for yolo mode development. No configuration required.

When you run `*develop-yolo story-X.Y.Z`, a decision log is automatically created at:
```
.ai/decision-log-X.Y.Z.md
```

### Viewing Decision Logs

```bash
# View most recent decision log
ls -lt .ai/decision-log-*.md | head -1 | xargs cat

# List all decision logs
ls .ai/decision-log-*.md
```

---

## How It Works

### 1. Initialization

When yolo mode starts, decision logging initializes automatically:

```javascript
const { initializeDecisionLogging } = require('.aios-core/scripts/decision-recorder');

// Automatically called by dev agent in yolo mode
const context = await initializeDecisionLogging('dev', 'docs/stories/story-6.1.2.6.2.md');
```

### 2. Decision Recording

During execution, autonomous decisions are recorded:

```javascript
const { recordDecision } = require('.aios-core/scripts/decision-recorder');

// Example: Library selection decision
recordDecision({
  description: 'Use Axios instead of Fetch API for HTTP client',
  reason: 'Better error handling, interceptor support, and TypeScript definitions',
  alternatives: ['Fetch API (native)', 'Got library', 'node-fetch'],
  type: 'library-choice',  // See Decision Types below
  priority: 'medium'        // See Priority Levels below
});
```

### 3. File & Test Tracking

File modifications and test results are tracked automatically:

```javascript
const { trackFile, trackTest } = require('.aios-core/scripts/decision-recorder');

// Track file modifications
trackFile('src/api/client.js', 'created');
trackFile('package.json', 'modified');

// Track test results
trackTest({
  name: 'api.test.js',
  passed: true,
  duration: 125
});
```

### 4. Log Generation

On completion, the decision log is generated automatically:

```javascript
const { completeDecisionLogging } = require('.aios-core/scripts/decision-recorder');

// Automatically called by dev agent on yolo mode completion
const logPath = await completeDecisionLogging('6.1.2.6.2', 'completed');
// Returns: .ai/decision-log-6.1.2.6.2.md
```

---

## Decision Types

Use these standard decision types for classification (AC7):

| Type | Description | Example |
|------|-------------|---------|
| `library-choice` | Selecting external dependencies | "Use Axios vs Fetch" |
| `architecture` | System design decisions | "Use React Context vs Redux" |
| `algorithm` | Algorithm selection | "Use binary search vs linear" |
| `error-handling` | Error handling strategies | "Use try-catch vs error boundaries" |
| `testing-strategy` | Test approach decisions | "Unit tests vs integration tests" |
| `performance` | Performance optimizations | "Use memoization vs recalculation" |
| `security` | Security implementations | "Use bcrypt vs argon2" |
| `database` | Data model decisions | "Use PostgreSQL vs MongoDB" |

---

## Priority Levels

Assign priority to decisions based on impact (AC7):

| Priority | Description | When to Use |
|----------|-------------|-------------|
| `critical` | High-impact architectural decisions | Framework changes, breaking changes |
| `high` | Significant technical choices | Multi-component changes, new patterns |
| `medium` | Standard implementation decisions | Library selection, local architecture |
| `low` | Minor preference decisions | Naming conventions, code style |

---

## Decision Log Format (ADR)

Decision logs follow the Architecture Decision Record format with these sections:

### Context
- Story being implemented
- Execution time and status
- Files modified and tests run

### Decisions Made
- Each decision with timestamp
- Type and priority classification
- Reason for the choice

### Rationale & Alternatives
- Why each choice was made
- What alternatives were considered
- Trade-offs evaluated

### Implementation Changes
- Files created/modified/deleted
- Test results (passed/failed)

### Consequences & Rollback
- Git commit hash before execution
- Rollback command
- Performance impact

---

## Example Decision Log

```markdown
# Decision Log: Story 6.1.2.6.2

**Generated:** 2025-11-16T14:30:00.000Z
**Agent:** dev
**Mode:** Yolo (Autonomous Development)
**Story:** docs/stories/story-6.1.2.6.2.md
**Rollback:** `git reset --hard abc123def`

---

## Context

**Story Implementation:** 6.1.2.6.2
**Execution Time:** 15m 30s
**Status:** completed

**Files Modified:** 5 files
**Tests Run:** 8 tests
**Decisions Made:** 3 autonomous decisions

---

## Decisions Made

### Decision 1: Use Axios for HTTP client

**Timestamp:** 2025-11-16T14:32:15.000Z
**Type:** library-choice
**Priority:** medium

**Reason:** Better error handling, interceptor support, and TypeScript definitions

**Alternatives Considered:**
- Fetch API (native)
- Got library
- node-fetch

---

### Decision 2: Use React Context for state management

**Timestamp:** 2025-11-16T14:35:00.000Z
**Type:** architecture
**Priority:** high

**Reason:** Simple state sharing without Redux overhead

**Alternatives Considered:**
- Redux
- Zustand
- Jotai

---

## Implementation Changes

### Files Modified

- `src/api/client.js` (created)
- `src/context/AppContext.js` (created)
- `package.json` (modified)

### Test Results

- ✅ PASS: `api.test.js` (125ms)
- ✅ PASS: `context.test.js` (85ms)

---

## Consequences & Rollback

### Rollback Instructions

\`\`\`bash
# Full rollback
git reset --hard abc123def

# Selective file rollback
git checkout abc123def -- <file-path>
\`\`\`

### Performance Impact

- Agent Load Time: 150ms
- Task Execution Time: 15m 30s
- Logging Overhead: Minimal (async, non-blocking)
```

---

## Configuration

Decision logging is configured in `.aios-core/core-config.yaml`:

```yaml
decisionLogging:
  enabled: true          # Enable/disable decision logging
  async: true            # Non-blocking log writing
  location: .ai/         # Log file directory
  indexFile: decision-logs-index.md
  format: adr            # Architecture Decision Record format
  performance:
    maxOverhead: 50      # Maximum logging overhead in ms
```

### Disabling Decision Logging

To disable decision logging (not recommended):

```yaml
decisionLogging:
  enabled: false
```

---

## Best Practices

### When to Record Decisions

Record decisions when you autonomously choose between alternatives:

✅ **DO Record:**
- Library selection ("Why Axios over Fetch?")
- Architecture patterns ("Why Context over Redux?")
- Algorithm choices ("Why binary search?")
- Error handling strategies
- Testing approaches

❌ **DON'T Record:**
- Following story requirements exactly (not a decision)
- Standard coding practices (already documented)
- Trivial formatting choices

### Writing Good Decision Rationale

**Good:**
```javascript
recordDecision({
  description: 'Use Axios for HTTP client',
  reason: 'Provides better error handling with interceptors, supports request/response transformation, and includes TypeScript definitions out of the box',
  alternatives: [
    'Fetch API (native) - Rejected: No interceptors, limited error handling',
    'Got library - Rejected: Server-side only, not suitable for browser'
  ],
  type: 'library-choice',
  priority: 'medium'
});
```

**Bad:**
```javascript
recordDecision({
  description: 'Use Axios',
  reason: 'Better',
  alternatives: ['Fetch'],
  type: 'library-choice',
  priority: 'medium'
});
```

---

## Troubleshooting

### Decision Log Not Generated

**Problem:** No decision log file created after yolo mode

**Solutions:**
1. Check configuration: `decisionLogging.enabled` in core-config.yaml
2. Verify `.ai/` directory exists and is writable
3. Check console for error messages

### Decisions Not Appearing in Log

**Problem:** recordDecision() called but decision not in log

**Solutions:**
1. Ensure `initializeDecisionLogging()` was called first
2. Verify decision logging is enabled (check config)
3. Check that `completeDecisionLogging()` was called at end

### Performance Issues

**Problem:** Yolo mode slower with decision logging

**Solutions:**
1. Verify `async: true` in configuration (should be default)
2. Check logging overhead in decision log Performance Impact section
3. If overhead >50ms, report to framework team

---

## API Reference

### initializeDecisionLogging(agentId, storyPath, options)

Initialize decision logging for yolo mode session.

**Parameters:**
- `agentId` (string): Agent identifier (e.g., 'dev')
- `storyPath` (string): Path to story file
- `options` (object): Configuration options
  - `enabled` (boolean): Override config setting
  - `agentLoadTime` (number): Agent load time in ms

**Returns:** Promise<DecisionContext>

### recordDecision(decision)

Record an autonomous decision.

**Parameters:**
- `decision` (object):
  - `description` (string): What decision was made
  - `reason` (string): Why this choice was made
  - `alternatives` (string[]): Other options considered
  - `type` (string): Decision type (see Decision Types)
  - `priority` (string): Priority level (see Priority Levels)

**Returns:** Object (recorded decision with timestamp)

### trackFile(filePath, action)

Track file modification.

**Parameters:**
- `filePath` (string): Path to file
- `action` (string): 'created', 'modified', or 'deleted'

### trackTest(test)

Track test execution.

**Parameters:**
- `test` (object):
  - `name` (string): Test file/suite name
  - `passed` (boolean): Whether test passed
  - `duration` (number): Execution time in ms
  - `error` (string): Error message if failed

### completeDecisionLogging(storyId, status)

Complete logging and generate decision log file.

**Parameters:**
- `storyId` (string): Story identifier (e.g., '6.1.2.6.2')
- `status` (string): 'completed', 'failed', or 'cancelled'

**Returns:** Promise<string> (path to generated log file)

---

## Integration with Yolo Mode

Decision logging is automatically integrated into the dev agent's yolo mode workflow. The integration happens in `.aios-core/agents/dev.md`.

**Conceptual Integration:**

```javascript
// On yolo mode start
const context = await initializeDecisionLogging('dev', storyPath);

// During execution
recordDecision({ description, reason, alternatives, type, priority });
trackFile(filePath, action);
trackTest({ name, passed, duration });

// On completion
await completeDecisionLogging(storyId, 'completed');
```

No manual intervention required - it just works! 🚀

---

## Related Documentation

- **Story:** [Story 6.1.2.6.2 - Decision Log Automation](../stories/aios migration/story-6.1.2.6.2-complete-decision-log-automation.md)
- **Parent Story:** [Story 6.1.2.6 - Framework Config System](../stories/aios migration/story-6.1.2.6-framework-config-system.md)
- **Tests:** [Unit Tests for Decision Log Generator](../stories/aios migration/story-6.1.2.6.1-add-unit-tests-decision-log-generator.md)

---

*Generated: 2025-11-16*
*Author: Dex (Dev Agent)*
*Version: 1.0*
