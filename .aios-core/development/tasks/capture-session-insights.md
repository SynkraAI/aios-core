# Capture Session Insights

**Purpose:** Capture insights from development sessions to enable persistent learning between sessions. Part of Epic 7 - Memory Layer.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Auto-capture with minimal interaction
- Uses session context to infer insights
- **Best for:** End-of-story capture, routine sessions

### 2. Interactive Mode - Balanced, Educational (3-5 prompts) **[DEFAULT]**
- Guided elicitation of insights
- Explicit validation of each category
- **Best for:** Complex stories, learning sessions

### 3. Comprehensive Mode - Full Capture
- Deep exploration of all insight categories
- Detailed examples and code snippets
- **Best for:** High-complexity stories, critical discoveries

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: captureSessionInsights()
responsible: Any Agent (typically @dev, @architect)
responsible_type: Agent
atomic_layer: Memory
elicit: true

inputs:
- field: storyId
  type: string
  source: User Input or Context
  required: true
  validation: Valid story ID (e.g., STORY-42, epic-7.1)

- field: complexity
  type: string
  source: Story metadata or User Input
  required: false
  validation: TRIVIAL|STANDARD|COMPLEX|EPIC
  default: STANDARD

- field: sessionDuration
  type: string
  source: Session context or User Input
  required: false
  validation: Duration format (e.g., "2h", "4h30m")

- field: mode
  type: string
  source: User Input
  required: false
  validation: yolo|interactive|comprehensive

outputs:
- field: insights_file
  type: json
  destination: docs/stories/{storyId}/insights/session-{timestamp}.json
  persisted: true

- field: capture_summary
  type: markdown
  destination: Console output
  persisted: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story ID provided and valid
    type: pre-condition
    blocker: true
    validation: |
      Check storyId is provided and matches expected format
    error_message: "Pre-condition failed: Valid story ID required"

  - [ ] Session has meaningful work to capture
    type: pre-condition
    blocker: false
    validation: |
      Verify session involved development work (not just browsing/reading)
    error_message: "Warning: Session may not have insights to capture"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Insights file created and valid JSON
    type: post-condition
    blocker: true
    validation: |
      Verify docs/stories/{storyId}/insights/session-{timestamp}.json exists and is valid
    error_message: "Post-condition failed: Insights file not created"

  - [ ] Insights merged with existing (if any)
    type: post-condition
    blocker: false
    validation: |
      If previous insights exist, verify merge was successful (no overwrites)
    error_message: "Warning: Merge with existing insights may have failed"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] At least one insight category populated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert at least one of: discoveries, patternsLearned, gotchasFound, decisionsMade has entries
    error_message: "Acceptance criterion not met: No insights captured"

  - [ ] JSON schema validated
    type: acceptance-criterion
    blocker: true
    validation: |
      Assert output conforms to session-insights.json schema
    error_message: "Acceptance criterion not met: Invalid insights schema"

  - [ ] No data loss from existing insights
    type: acceptance-criterion
    blocker: true
    validation: |
      If merging, assert all previous insight entries preserved
    error_message: "Acceptance criterion not met: Previous insights may have been lost"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** filesystem
  - **Purpose:** Create directories and write JSON files
  - **Source:** Node.js fs module

- **Tool:** json-validator
  - **Purpose:** Validate insights against schema
  - **Source:** Built-in validation

---

## Error Handling

**Strategy:** graceful-degradation

**Common Errors:**

1. **Error:** No Story ID Provided
   - **Cause:** Task invoked without story context
   - **Resolution:** Prompt user for story ID
   - **Recovery:** Use last active story from session if available

2. **Error:** Directory Creation Failed
   - **Cause:** Permission issues or invalid path
   - **Resolution:** Check file system permissions
   - **Recovery:** Attempt to create in fallback location (.aios/insights/)

3. **Error:** JSON Validation Failed
   - **Cause:** Malformed insight data
   - **Resolution:** Validate and sanitize input
   - **Recovery:** Show validation errors, allow correction

4. **Error:** Merge Conflict
   - **Cause:** Concurrent insight capture or corrupted existing file
   - **Resolution:** Create backup, attempt merge
   - **Recovery:** Save as new file with suffix, alert user

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 2-10 min
cost_estimated: $0.001-0.005
token_usage: ~500-2,000 tokens
```

**Optimization Notes:**
- Elicitation can be parallelized per category
- JSON write is atomic
- Merge operation reads existing file only once

---

## Metadata

```yaml
story: Epic 7 - Story 7.1
version: 1.0.0
dependencies:
  - filesystem access
tags:
  - memory-layer
  - learning
  - insights
  - session-capture
created_at: 2026-01-29
updated_at: 2026-01-29
```

---

## JSON Schema: session-insights.json

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Session Insights",
  "type": "object",
  "required": ["storyId", "capturedAt"],
  "properties": {
    "storyId": {
      "type": "string",
      "description": "Identifier of the story this session relates to"
    },
    "capturedAt": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of capture"
    },
    "sessionDuration": {
      "type": "string",
      "description": "Duration of the session (e.g., '4h', '2h30m')"
    },
    "complexity": {
      "type": "string",
      "enum": ["TRIVIAL", "STANDARD", "COMPLEX", "EPIC"],
      "description": "Story complexity level"
    },
    "discoveries": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["category", "description", "relevance"],
        "properties": {
          "category": {
            "type": "string",
            "enum": ["api", "framework", "tooling", "architecture", "testing", "performance", "security", "other"]
          },
          "description": {
            "type": "string",
            "minLength": 10
          },
          "relevance": {
            "type": "string",
            "enum": ["high", "medium", "low"]
          },
          "relatedFiles": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },
    "patternsLearned": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "description", "applicability"],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 3
          },
          "description": {
            "type": "string",
            "minLength": 10
          },
          "example": {
            "type": "string",
            "description": "File path and line range, e.g., 'stores/authStore.ts:15-25'"
          },
          "applicability": {
            "type": "string",
            "description": "When this pattern should be applied"
          }
        }
      }
    },
    "gotchasFound": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["wrong", "right", "reason", "severity"],
        "properties": {
          "wrong": {
            "type": "string",
            "description": "The incorrect approach"
          },
          "right": {
            "type": "string",
            "description": "The correct approach"
          },
          "reason": {
            "type": "string",
            "description": "Why the wrong approach fails"
          },
          "severity": {
            "type": "string",
            "enum": ["high", "medium", "low"]
          }
        }
      }
    },
    "decisionsMade": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["decision", "rationale"],
        "properties": {
          "decision": {
            "type": "string",
            "description": "The decision that was made"
          },
          "rationale": {
            "type": "string",
            "description": "Why this decision was made"
          },
          "alternatives": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Other options that were considered"
          },
          "reversible": {
            "type": "boolean",
            "description": "Whether this decision can be easily reversed"
          }
        }
      }
    }
  }
}
```

---

## Command Pattern

```bash
# Manual invocation
*capture-insights {story-id}
*capture-insights STORY-42 --mode comprehensive
*capture-insights epic-7.1 --duration "4h"

# Auto-trigger (configured in autoClaude)
# Triggers automatically when story with complexity >= STANDARD completes
```

---

## Interactive Elicitation Process

### Step 1: Session Context

```
ELICIT: Session Context

1. Which story did this session work on?
   [TEXT INPUT - Required]
   Example: "STORY-42", "epic-7.1", "feat/auth-flow"

2. How long was this session?
   [TEXT INPUT - Optional]
   Example: "4h", "2h30m"

3. What was the complexity level?
   [CHOICE: TRIVIAL / STANDARD / COMPLEX / EPIC]
   Default: STANDARD
```

### Step 2: Discoveries

```
ELICIT: Discoveries

What new things did you discover during this session?
(APIs, frameworks, tools, patterns that were previously unknown)

For each discovery:
1. What category? [api/framework/tooling/architecture/testing/performance/security/other]
2. Describe the discovery
3. How relevant is it? [high/medium/low]
4. Which files are related? (optional)

Example:
- Category: api
- Description: "Zustand persist middleware requires async hydration"
- Relevance: high
- Related files: ["src/stores/authStore.ts"]
```

### Step 3: Patterns Learned

```
ELICIT: Patterns Learned

What patterns or best practices did you learn or reinforce?
(Approaches that worked well and should be repeated)

For each pattern:
1. Give it a name
2. Describe how it works
3. Where is an example? (file:lines)
4. When should it be applied?

Example:
- Name: "Async Store Hydration"
- Description: "Use onRehydrateStorage callback for SSR"
- Example: "stores/authStore.ts:15-25"
- Applicability: "All Zustand stores with persist"
```

### Step 4: Gotchas Found

```
ELICIT: Gotchas Found

What "gotchas" or pitfalls did you encounter?
(Things that don't work as expected, common mistakes to avoid)

For each gotcha:
1. What's the wrong approach?
2. What's the right approach?
3. Why does the wrong approach fail?
4. How severe is this? [high/medium/low]

Example:
- Wrong: "Using persist() directly in create()"
- Right: "Wrap entire store in persist()"
- Reason: "TypeScript inference breaks otherwise"
- Severity: medium
```

### Step 5: Decisions Made

```
ELICIT: Decisions Made

What technical decisions were made during this session?
(Architecture choices, library selections, approach decisions)

For each decision:
1. What was decided?
2. Why was this chosen?
3. What alternatives were considered?
4. Is it easily reversible?

Example:
- Decision: "Use localStorage over sessionStorage"
- Rationale: "User preference should persist across sessions"
- Alternatives: ["sessionStorage", "IndexedDB"]
- Reversible: true
```

---

## Implementation Steps

### 1. Collect Session Context

```javascript
const sessionContext = {
  storyId: await elicit('storyId'),
  sessionDuration: await elicit('sessionDuration', { optional: true }),
  complexity: await elicit('complexity', { default: 'STANDARD' }),
  capturedAt: new Date().toISOString()
};
```

### 2. Elicit Insights by Category

```javascript
const insights = {
  ...sessionContext,
  discoveries: await elicitCategory('discoveries'),
  patternsLearned: await elicitCategory('patternsLearned'),
  gotchasFound: await elicitCategory('gotchasFound'),
  decisionsMade: await elicitCategory('decisionsMade')
};
```

### 3. Validate Against Schema

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(sessionInsightsSchema);

if (!validate(insights)) {
  throw new Error(`Validation failed: ${ajv.errorsText(validate.errors)}`);
}
```

### 4. Create Output Directory

```javascript
const path = require('path');
const fs = require('fs').promises;

const outputDir = path.join(
  process.cwd(),
  'docs/stories',
  sessionContext.storyId,
  'insights'
);

await fs.mkdir(outputDir, { recursive: true });
```

### 5. Merge with Existing Insights

```javascript
async function mergeInsights(outputDir, newInsights) {
  const existingFiles = await fs.readdir(outputDir).catch(() => []);

  // Don't overwrite - always create new file with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `session-${timestamp}.json`;

  return { filename, merged: true };
}
```

### 6. Write Insights File

```javascript
const outputPath = path.join(outputDir, filename);
await fs.writeFile(outputPath, JSON.stringify(insights, null, 2));

console.log(`Insights captured: ${outputPath}`);
```

---

## Auto-Trigger Configuration

Add to `autoClaude.yaml` for automatic capture:

```yaml
memory:
  captureInsights:
    enabled: true
    triggerOn:
      - event: story_completed
        condition: complexity >= STANDARD
    defaultMode: interactive
```

---

## Success Output

```
=== Session Insights Captured ===

Story: {storyId}
Session Duration: {sessionDuration}
Complexity: {complexity}

Captured:
  - Discoveries: {discoveryCount}
  - Patterns Learned: {patternCount}
  - Gotchas Found: {gotchaCount}
  - Decisions Made: {decisionCount}

Output: docs/stories/{storyId}/insights/session-{timestamp}.json

These insights will improve future sessions working on similar features.
```

---

## Integration with Memory Layer

This task is the primary capture mechanism for Epic 7 - Memory Layer:

1. **Input to Pattern Matching**: Captured patterns feed into the pattern-matching system for future suggestions
2. **Gotcha Prevention**: Gotchas are surfaced when similar work is detected
3. **Decision Context**: Decisions provide context for understanding past architectural choices
4. **Discovery Sharing**: Discoveries are indexed for cross-project learning

---

## Validation Checklist

- [ ] Story ID is valid and accessible
- [ ] At least one insight category has entries
- [ ] All entries conform to schema
- [ ] Output directory created successfully
- [ ] JSON file written and valid
- [ ] No existing insights overwritten
- [ ] Merge completed successfully (if applicable)

---

## Notes

- This task can be run multiple times per story (creates new timestamped file each time)
- Empty categories are allowed but at least one must have content
- Insights are append-only - never delete or modify existing insight files
- For TRIVIAL complexity stories, manual invocation is required
- Integration with autoClaude enables automatic capture at story completion
