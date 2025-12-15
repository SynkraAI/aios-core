# Architectural Review: Contextual Agent Load System

**Review ID:** AR-6.1.2.5
**Requested By:** Pax (po)
**Requested Date:** 2025-01-15
**Reviewer:** Aria (@architect)
**Status:** 🔄 Pending Review
**Priority:** 🟡 Medium (Enhancement for Story 6.1.2.x series)

---

## 📋 Executive Summary

**Proposal:** Implement intelligent agent greeting system that adapts based on:
1. **Git Configuration Status** (configured vs unconfigured project)
2. **Session Context** (new window vs existing context vs recurring workflow)
3. **Command Visibility** (full vs quick vs key commands based on context)

**Goal:** Improve agent UX by showing relevant information and commands based on current context, reducing cognitive load.

**Estimated Impact:**
- Better onboarding for new sessions
- Faster workflow navigation for recurring tasks
- Reduced greeting noise for experienced users in workflows

---

## 🎯 Problem Statement

### Current State (After Story 6.1.2.4)

**Agent Greeting Today:**
```
⚖️ Pax (Balancer) ready. Let's prioritize together!

📊 Project Status
- Branch: main
- Modified: story-6.1.2.md, story-6.1.6.md
- Recent: Story 6.1.2.1 complete

Type `*help` to see available commands, or let me know how I can assist you!
```

**Problems:**
1. **Same greeting regardless of context** (new user vs experienced user in workflow)
2. **No git config warnings** (user may not realize project isn't configured)
3. **Commands hidden** (user must type *help to discover)
4. **No workflow awareness** (during validate→develop→review cycle, shows generic greeting)

### Desired State

**[New Window] Full Onboarding Greeting:**
```
⚖️ Pax (Balancer) ready. Let's prioritize together!

As Product Owner, I help with backlog management, story refinement, acceptance
criteria, and prioritization decisions.

📊 Project Status
- Branch: main
- Modified: story-6.1.2.md, story-6.1.6.md
- Recent: Story 6.1.2.1 complete

Available Commands (use *help to see full list):
  1. *create-epic - Create epic for brownfield projects
  2. *create-story - Create user story from requirements
  3. *validate-story-draft {story} - Validate story against standards
  4. *sync-story {story} - Sync story to PM tool
  5. *backlog-review - Generate backlog review report
  6. *backlog-summary - Quick status summary
  ...8 more (type *help)
```

**[Existing Context] Quick Greeting:**
```
⚖️ Pax (Balancer) ready.

📊 Project Status
- Branch: main
- Modified: story-6.1.6-output-formatter-implementation.md
- Recent: Story 6.1.2.1 complete

📌 Current Context
- Working on: Story 6.1.6 validation
- Last action: Validation report generated (4 critical issues)

Quick Commands:
  Story Validation:
  - *validate-story-draft {story} - Validate against template
  - *create-story - Create new user story

  Backlog Management:
  - *backlog-review - Sprint planning review
  - *backlog-prioritize {item} {priority} - Re-prioritize item

Type *help for all commands
```

**[Recurring Workflow] Minimal Greeting:**
```
⚖️ Pax ready.

📊 Project Status
- Branch: main | Modified: 1 file | Recent: Story 6.1.2.1 ✅

📌 Context: Story 6.1.6 validation in progress

Key Commands:
  - *validate-story-draft {story} - Continue validation
  - *create-story - Draft next story
  - *exit - Exit workflow
```

**[No Git Config] Warning Greeting:**
```
⚖️ Pax (Balancer) ready. Let's prioritize together!

As Product Owner, I help with backlog management, story refinement, acceptance
criteria, and prioritization decisions.

Available Commands:
  1. *create-story - Create user story (local mode)
  2. *validate-story-draft {story} - Validate story
  3. *validate-story-draft {story} - Validate against template
  4. *backlog-review - Sprint planning review
  5. *backlog-summary - Quick status summary
  ...6 more (type *help)

⚠️ Warning: This project is not configured with Git. Some features may be limited.
Run @devops to configure, or disable this warning in core-config.yaml.
```

**Note:** Warning appears at END of greeting, not in place of Project Status section.

---

## 🏗️ Proposed Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│   Agent Activation (@dev, @po, @qa, etc.)               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│   ContextDetector.js (NEW)                              │
│   - detectSessionType() → new | existing | workflow     │
│   - analyzeConversationHistory()                        │
│   - detectWorkflowPattern()                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│   GitConfigDetector.js (NEW)                            │
│   - checkGitConfigured() → boolean                      │
│   - getGitConfigType() → aios-core | project | none     │
│   - shouldShowWarning() → boolean                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│   GreetingBuilder.js (NEW)                              │
│   - buildGreeting(agent, sessionType, gitConfig)        │
│   - selectCommandSet(sessionType) → full|quick|key      │
│   - injectProjectStatus(gitConfig)                      │
│   - injectCurrentContext(sessionType)                   │
│   - appendGitWarning(gitConfig) → WARNING AT END        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│   Agent Greeting Output (Layer 1)                       │
│   {{presentation}} + {{role}} + {{commands}} + ...      │
└─────────────────────────────────────────────────────────┘
```

### Integration Points

**Existing Components:**
- ✅ `project-status-loader.js` (Story 6.1.2.4) - reuse for {{Project Status}}
- ✅ `persona_profile` (Story 6.1.2) - use for {{presentation}}
- 🔄 `core-config.yaml` (Story 6.1.4) - add git-config fields

**New Components:**
- 🆕 `context-detector.js` - session type detection
- 🆕 `git-config-detector.js` - git configuration validation
- 🆕 `greeting-builder.js` - assemble contextual greeting
- 🆕 `command-metadata.yaml` - command categorization (full/quick/key)

---

## ❓ Architectural Questions for @architect

### 1. Context Detection Strategy

**Question:** How should we detect session type (new vs existing vs workflow)?

**Options:**

**A. Conversation History Analysis (Stateful)**
```javascript
// Pros: Accurate, knows exact context
// Cons: Requires message history access, may have privacy concerns

function detectSessionType(conversationHistory) {
  if (conversationHistory.length === 0) return 'new';

  const recentCommands = extractCommands(conversationHistory, last10Messages);
  if (isWorkflowPattern(recentCommands)) return 'workflow';

  return 'existing';
}
```

**B. File-Based Session Tracking (Stateless)**
```javascript
// Pros: Privacy-friendly, works across IDE restarts
// Cons: Requires .aios/session-state.json, may be stale

function detectSessionType() {
  const session = readSessionFile('.aios/session-state.json');
  if (!session || session.age > 1hour) return 'new';
  if (session.workflowActive) return 'workflow';
  return 'existing';
}
```

**C. Hybrid Approach**
```javascript
// Pros: Best of both worlds
// Cons: More complex implementation

function detectSessionType(conversationHistory) {
  const session = readSessionFile('.aios/session-state.json');

  // Prefer conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    return analyzeConversationHistory(conversationHistory);
  }

  // Fallback to session file
  return analyzeSessionFile(session);
}
```

**Your Recommendation:** **C. Hybrid Approach** ✅

**Reasoning:**
- **Prefer conversation history when available** - Most accurate signal of current context
- **Fallback to file-based tracking** - Handles IDE restarts, privacy-conscious users
- **Privacy-first design** - Conversation analysis happens client-side, no data sent externally
- **Implementation path:** Start with file-based (simple), add conversation analysis when stable
- **Performance:** Conversation analysis is fast (~10-20ms), file read is instant
- **Future-proof:** Can add more sophisticated heuristics without breaking existing logic

**Implementation Notes:**
```javascript
function detectSessionType(conversationHistory, sessionFile) {
  // Level 1: File-based (always available, instant)
  const fileSignal = analyzeSessionFile(sessionFile);

  // Level 2: Conversation-based (more accurate if available)
  if (conversationHistory?.length > 0) {
    const conversationSignal = analyzeConversationHistory(conversationHistory);
    // Trust conversation over file if they conflict
    return conversationSignal;
  }

  return fileSignal;
}
```

---

### 2. Workflow Detection Algorithm

**Question:** How should we identify recurring workflows?

**Options:**

**A. Hardcoded Workflow Patterns**
```yaml
# .aios-core/data/workflow-patterns.yaml

workflows:
  story_development:
    pattern: [validate-story-draft, develop, review-qa, pre-push]
    agent_sequence: [po, dev, qa, dev]
    key_commands: [validate, develop, review, gate]

  epic_creation:
    pattern: [create-epic, create-story, validate-story-draft]
    agent_sequence: [pm, po, po]
    key_commands: [create-epic, create-story, validate]
```

**B. Dynamic Pattern Learning**
```javascript
// Machine learning approach - learns user workflows over time
// Pros: Adapts to user habits
// Cons: Complex, requires training data, may be overkill

function detectWorkflow(commandHistory) {
  const patterns = loadLearnedPatterns('.aios/learned-workflows.json');
  const currentSequence = commandHistory.slice(-5);

  for (const pattern of patterns) {
    if (sequenceMatches(currentSequence, pattern.sequence)) {
      return pattern.name;
    }
  }
  return null;
}
```

**C. Agent Memory Integration**
```javascript
// Uses Story 4.5 memory layer to track workflow state
// Pros: Leverages existing memory system
// Cons: Depends on memory layer being active

function detectWorkflow(agentMemory) {
  const activeWorkflow = agentMemory.get('active_workflow');
  if (activeWorkflow && activeWorkflow.age < 2hours) {
    return activeWorkflow.name;
  }
  return null;
}
```

**Your Recommendation:** **A. Hardcoded Workflow Patterns** (MVP), evolve to **C. Memory Integration** ✅

**Reasoning:**
- **Start simple:** Hardcoded patterns cover 80% of use cases (validate→develop→review)
- **Deterministic behavior:** Users can predict what triggers workflow mode
- **Easy to maintain:** YAML file is human-readable, no ML complexity
- **Evolution path:** Add memory integration when Story 4.5 stabilizes
- **Hybrid future:** Hardcoded as baseline + memory for custom workflows

**Recommended Implementation:**
```yaml
# .aios-core/data/workflow-patterns.yaml
workflows:
  story_development:
    pattern: [validate-story-draft, develop, review]
    triggers: [po, dev, qa]  # Agent sequence
    key_commands: [validate-story-draft, develop, review-qa, gate]

  epic_creation:
    pattern: [create-epic, create-story]
    triggers: [pm, po]
    key_commands: [create-epic, create-story, validate-story-draft]
```

**Future Enhancement (Story 4.5 integration):**
```javascript
// Check hardcoded patterns first, then check memory layer
function detectWorkflow(commandHistory, agentMemory) {
  // Check hardcoded patterns
  const hardcodedWorkflow = matchHardcodedPattern(commandHistory);
  if (hardcodedWorkflow) return hardcodedWorkflow;

  // Check memory layer (if enabled)
  if (agentMemory?.enabled) {
    return agentMemory.get('active_workflow');
  }

  return null;
}
```

---

### 3. Git Config Detection Performance

**Question:** How to balance git detection accuracy vs performance?

**Options:**

**A. On-Demand Detection (Every Agent Load)**
```javascript
// Pros: Always accurate
// Cons: Adds 50-200ms latency per agent activation (git commands are slow)

async function checkGitConfigured() {
  const isGitRepo = await exec('git rev-parse --is-inside-work-tree');
  const hasRemote = await exec('git remote -v');
  const hasBranches = await exec('git branch');

  return {
    configured: isGitRepo && hasRemote && hasBranches,
    type: detectGitConfigType()
  };
}
```

**B. Cached Detection (5-minute TTL)**
```javascript
// Pros: Fast (0ms after first check), good enough accuracy
// Cons: May be stale if user configures git mid-session

const GIT_CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let gitConfigCache = null;

async function checkGitConfigured() {
  if (gitConfigCache && gitConfigCache.age < GIT_CONFIG_CACHE_TTL) {
    return gitConfigCache.data;
  }

  gitConfigCache = {
    data: await detectGitConfig(),
    timestamp: Date.now()
  };

  return gitConfigCache.data;
}
```

**C. Background Detection (Async)**
```javascript
// Pros: Zero latency impact on agent load
// Cons: First greeting may show stale/missing git status

// On agent load
async function loadAgent() {
  showGreeting(lastKnownGitConfig); // Show immediately with cached data

  // Update in background
  detectGitConfig().then(config => {
    updateProjectStatus(config);
  });
}
```

**Your Recommendation:** **B. Cached Detection (5-minute TTL)** with smart invalidation ✅

**Reasoning:**
- **Performance-first:** 0ms latency on 95% of agent loads (after first check)
- **Good enough accuracy:** 5-minute staleness is acceptable for git config changes
- **User-friendly:** If user runs `@devops` to configure git, we can invalidate cache manually
- **Simple implementation:** No async complexity, predictable behavior
- **Low risk:** Even if stale, user can disable warning in config

**Recommended Implementation:**
```javascript
const GIT_CONFIG_CACHE = {
  data: null,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutes

  async get() {
    const now = Date.now();
    if (this.data && (now - this.timestamp) < this.TTL) {
      return this.data; // Cache hit
    }

    // Cache miss - detect and cache
    this.data = await this.detect();
    this.timestamp = now;
    return this.data;
  },

  async detect() {
    try {
      const isGitRepo = await exec('git rev-parse --is-inside-work-tree', { timeout: 1000 });
      const hasRemote = await exec('git remote -v', { timeout: 500 });
      return {
        configured: !!isGitRepo && !!hasRemote,
        type: detectGitConfigType()
      };
    } catch (error) {
      return { configured: false, type: null };
    }
  },

  invalidate() {
    this.data = null; // Force re-check on next get()
  }
};

// When @devops configures git, invalidate cache
// In devops agent: GitConfigCache.invalidate()
```

**Smart Invalidation Triggers:**
- User runs `@devops` (manual cache clear)
- User runs `git init`, `git remote add` via agents
- User manually updates `core-config.yaml` git settings

---

### 4. Command Categorization Strategy

**Question:** How should we categorize commands as full/quick/key?

**Options:**

**A. Metadata in Command Definitions**
```yaml
# In each agent file (e.g., po.md)

commands:
  - help:
      category: [full, quick, key]  # Show in all contexts
      description: "Show available commands"

  - create-epic:
      category: [full]  # Only in new window
      description: "Create epic for brownfield projects"

  - validate-story-draft:
      category: [full, quick, key]  # Show everywhere
      description: "Validate story against template"
```

**B. Separate Command Metadata File**
```yaml
# .aios-core/data/command-categories.yaml

categories:
  full:  # New window - up to 12 commands
    - help
    - create-epic
    - create-story
    - validate-story-draft
    - sync-story
    ...

  quick:  # Existing context - 6-8 commands
    - validate-story-draft
    - create-story
    - backlog-review
    - sync-story

  key:  # Workflow - 3-5 commands only
    - validate-story-draft
    - develop
    - review-qa
```

**C. Dynamic Selection Based on Usage**
```javascript
// Pros: Adapts to user behavior
// Cons: Complex, requires usage tracking

function selectCommands(sessionType, usageStats) {
  const allCommands = agent.commands;

  if (sessionType === 'new') {
    return allCommands.slice(0, 12); // Top 12 by usage
  }

  if (sessionType === 'workflow') {
    return getMostUsedInWorkflow(usageStats, currentWorkflow);
  }

  return getRecentlyUsed(usageStats, last7Days).slice(0, 8);
}
```

**Your Recommendation:** **A. Metadata in Command Definitions** (inline in agent files) ✅

**Reasoning:**
- **Single source of truth:** Command metadata lives with command definition
- **Agent-specific control:** Each agent decides which commands are important
- **Easy maintenance:** Update command + metadata in same place
- **No synchronization issues:** Can't forget to update separate YAML file
- **Gradual migration:** Old agents without metadata still work (show all commands)

**Recommended Schema:**
```yaml
# In agent files (e.g., .aios-core/agents/po.md)
commands:
  - name: help
    visibility: [full, quick, key]  # Always visible
    description: "Show available commands"

  - name: validate-story-draft
    visibility: [full, quick, key]  # Core command, always show
    description: "Validate story against template"

  - name: create-epic
    visibility: [full]  # Only show in new sessions
    description: "Create epic for brownfield projects"

  - name: backlog-review
    visibility: [full, quick]  # Show except in workflows
    description: "Generate backlog review report"
```

**Fallback for Agents Without Metadata:**
```javascript
function getVisibleCommands(agent, sessionType) {
  const allCommands = agent.commands;

  // Filter by visibility metadata if available
  const commandsWithMetadata = allCommands.filter(cmd =>
    cmd.visibility?.includes(sessionType)
  );

  if (commandsWithMetadata.length > 0) {
    return commandsWithMetadata; // Use metadata
  }

  // Fallback: show all commands (old agents)
  return allCommands.slice(0, 12);
}
```

**Migration Strategy:**
- Phase 1: Add metadata to 3-4 high-traffic agents (po, dev, qa)
- Phase 2: User feedback on command selection
- Phase 3: Migrate remaining 8 agents
- Backwards compatible: Agents without metadata show all commands

---

### 5. Core-Config Schema Changes

**Question:** What fields should we add to `core-config.yaml`?

**Proposed Schema:**
```yaml
# core-config.yaml additions

git:
  enabled: true                    # Master switch for git features
  configured: false                # Auto-detected (cached)
  configType: null                 # 'aios-core' | 'project' | null
  showWarning: true                # User can disable warning
  cacheTimeSeconds: 300            # 5 minutes cache for git detection

agentGreeting:
  contextDetection: true           # Enable contextual greetings
  sessionTypeDetection: 'hybrid'   # 'conversation' | 'file' | 'hybrid'
  workflowDetection: 'hardcoded'   # 'hardcoded' | 'memory' | 'learned'
  commandDisplay:
    new: 'full'                    # Show 12 commands
    existing: 'quick'              # Show 6-8 commands
    workflow: 'key'                # Show 3-5 commands

  performance:
    gitCheckCache: true
    gitCheckTTL: 300               # seconds
    asyncGitCheck: false           # Background vs blocking
```

**Your Feedback:** **Approved with simplifications** ✅

**Recommended Schema (Simplified):**
```yaml
# core-config.yaml additions

# Git configuration (separate top-level section)
git:
  showConfigWarning: true          # User can disable
  cacheTimeSeconds: 300            # 5 minutes

# Agent greeting system (nest under agentIdentity from Story 6.1.4)
agentIdentity:
  level: named                     # minimal | named | archetypal (Story 6.1.4)

  greeting:                        # NEW: Contextual greeting settings
    contextDetection: true         # Enable smart greeting
    sessionDetection: hybrid       # hybrid | file | conversation
    workflowDetection: hardcoded   # hardcoded | memory | learned

    performance:
      gitCheckCache: true
      gitCheckTTL: 300             # seconds
```

**Rationale for Changes:**
1. **Nest under agentIdentity:** Logical grouping with Story 6.1.4 config
2. **Remove redundant fields:**
   - `git.enabled` → Implied by presence of git config
   - `git.configured` → Auto-detected, no need to store
   - `git.configType` → Auto-detected, no need to store
   - `agentGreeting.commandDisplay` → Determined by agent metadata, not config
3. **Keep only user-facing settings:**
   - Users care about: enabling/disabling features, performance tuning
   - Users don't care about: internal implementation details
4. **Backwards compatible:** If `agentIdentity.greeting` missing, use simple greeting

**No Conflicts Detected:**
- Existing `projectStatus` section (Story 6.1.2.4) is orthogonal
- `agentIdentity.level` from Story 6.1.4 doesn't conflict
- Git section is independent

**Migration Path:**
- Story 6.1.4 creates `agentIdentity` section
- Story 6.1.2.5 (this) adds `agentIdentity.greeting` subsection
- Story 6.1.2.5 adds `git` top-level section

---

### 6. Backwards Compatibility

**Question:** How to ensure agents work during migration?

**Concerns:**
1. Old agents without command metadata
2. Context detection may fail gracefully
3. Git detection errors shouldn't break agent load

**Proposed Fallback Strategy:**
```javascript
function buildGreeting(agent, context) {
  try {
    // Try contextual greeting
    const sessionType = detectSessionType(context);
    const gitConfig = await checkGitConfigured();
    return buildContextualGreeting(agent, sessionType, gitConfig);

  } catch (error) {
    // Fallback to simple greeting (Story 6.1.2 format)
    console.warn('Contextual greeting failed, using fallback', error);
    return buildSimpleGreeting(agent);
  }
}
```

**Your Feedback:** **Excellent fallback strategy - Approved with additions** ✅

**Enhanced Fallback Strategy:**
```javascript
function buildGreeting(agent, context) {
  const fallbackGreeting = buildSimpleGreeting(agent); // Pre-compute fallback

  try {
    // Try contextual greeting with timeout
    const greetingPromise = buildContextualGreeting(agent, context);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Greeting timeout')), 150)
    );

    return await Promise.race([greetingPromise, timeoutPromise]);

  } catch (error) {
    // Log error for debugging (non-blocking)
    console.warn('[GreetingBuilder] Fallback to simple greeting:', error.message);

    // Track failures for monitoring
    if (typeof trackGreetingFailure === 'function') {
      trackGreetingFailure(agent.id, error);
    }

    return fallbackGreeting;
  }
}

async function buildContextualGreeting(agent, context) {
  // Each sub-system has its own try-catch
  const sessionType = await safeDetectSessionType(context);
  const gitConfig = await safeCheckGitConfig();
  const commands = safeFilterCommands(agent, sessionType);

  return assembleGreeting({
    agent,
    sessionType,
    gitConfig,
    commands
  });
}

// Helper: Safe wrappers for each subsystem
async function safeDetectSessionType(context) {
  try {
    return await detectSessionType(context);
  } catch {
    return 'new'; // Conservative default
  }
}

async function safeCheckGitConfig() {
  try {
    return await GIT_CONFIG_CACHE.get();
  } catch {
    return { configured: false, type: null }; // Safe default
  }
}

function safeFilterCommands(agent, sessionType) {
  try {
    return getVisibleCommands(agent, sessionType);
  } catch {
    return agent.commands.slice(0, 12); // Show all commands
  }
}
```

**Additional Safety Measures:**
1. **Timeout protection:** 150ms max for greeting generation
2. **Granular error handling:** Each subsystem has its own try-catch
3. **Conservative defaults:** Fallbacks assume "new session" for better UX
4. **Non-blocking telemetry:** Track failures without impacting UX
5. **Graceful degradation:** Partial failures still show useful greeting

---

### 7. Performance Budget

**Question:** What's acceptable latency for agent greeting?

**Current Performance (Story 6.1.2.4):**
- Agent load: ~50-100ms (load persona_profile + project-status)
- Project status: ~30ms (cached git data)
- Total greeting: ~80-130ms

**Proposed Performance Budget:**
- Context detection: +20ms (conversation history analysis)
- Git config detection: +0ms (cached) or +50ms (first check)
- Command filtering: +10ms (metadata lookup)
- Greeting build: +20ms (template assembly)
- **Total: ~130-230ms** (worst case on first load)

**Your Recommendation:** **150ms hard limit with 100ms target** ✅

**Performance Requirements:**
- **Hard Limit:** 150ms maximum (enforced by timeout in fallback strategy)
- **Target:** 100ms average for contextual greeting
- **Baseline:** 80-130ms (current simple greeting from Story 6.1.2.4)
- **Budget:** +20-70ms for contextual features

**Breakdown:**
```
Total Budget: 150ms maximum
├─ Agent Load (existing): ~50ms
├─ Project Status (cached): ~30ms
├─ Context Detection: +20ms
├─ Git Config (cached): +0-5ms
├─ Command Filtering: +10ms
└─ Greeting Assembly: +10ms
─────────────────────────────
Total: 120-150ms (within budget)
```

**Optimization Strategy:**
1. **Parallelize operations:** Run context detection + git config + command filtering concurrently
2. **Cache aggressively:** Git config (5min TTL), command metadata (in-memory)
3. **Timeout protection:** 150ms hard limit with fallback
4. **Measure in production:** Add performance telemetry to track P50, P95, P99 latencies

**Performance Targets by Percentile:**
- P50 (median): <100ms
- P95: <130ms
- P99: <150ms (hard limit)

**Acceptable Trade-offs:**
- First load may be slower (150ms) if git detection cache miss
- Subsequent loads should be fast (80-100ms) with all caches warm
- Async background updates NOT needed with 5-minute cache TTL

---

### 8. Integration with Story 6.1.4 (Configuration System)

**Question:** Should this be part of Story 6.1.4 or separate?

**Story 6.1.4 Current Scope:**
- Add `agentIdentity` section to core-config.yaml
- Implement 3 personification levels (Minimal, Named, Archetypal)
- CLI commands: `aios config set/get agentIdentity.level`
- Greeting logic for 3 levels

**Overlap:**
- Both modify greeting behavior
- Both add core-config fields
- Both affect all 11 agents

**Options:**
- **A. Expand Story 6.1.4** (add contextual greeting to existing scope)
- **B. New Story 6.1.2.5** (separate concern, depends on 6.1.4)
- **C. New Story 6.1.4.1** (sub-story of 6.1.4, sequential implementation)

**Your Recommendation:** **B. New Story 6.1.2.5** (separate from 6.1.4, sequential dependency) ✅

**Reasoning:**
1. **Separation of Concerns:**
   - Story 6.1.4: Personification levels (Minimal, Named, Archetypal)
   - Story 6.1.2.5: Contextual greeting intelligence (session-aware, workflow-aware)
   - Different features, different complexity, different testing needs

2. **Clear Dependency Chain:**
   - Story 6.1.4 creates `agentIdentity` config section
   - Story 6.1.2.5 extends `agentIdentity.greeting` subsection
   - Sequential implementation reduces merge conflicts

3. **Independent Testing:**
   - 6.1.4 tests: 3 greeting levels work correctly
   - 6.1.2.5 tests: Context detection accuracy, workflow detection, git config warnings
   - Easier to isolate bugs and measure success

4. **Flexibility:**
   - If 6.1.2.5 needs to be deferred, 6.1.4 still delivers value
   - Can adjust 6.1.2.5 scope based on 6.1.4 user feedback
   - Lower risk than expanding 6.1.4 scope

5. **Story Size:**
   - 6.1.4: 2 days ($200) - well-scoped
   - 6.1.2.5: 2-3 days ($200-$300) - also well-scoped
   - Combined: 4-5 days ($400-$500) - too large for single story

**Implementation Sequence:**
```
1. Story 6.1.4: Configuration System
   - Add agentIdentity.level config
   - Implement 3 personification levels
   - Test greeting levels work

2. Story 6.1.2.5: Contextual Agent Load
   - Add agentIdentity.greeting config
   - Add git top-level config
   - Implement context detection
   - Implement workflow detection
   - Add command visibility metadata
   - Test contextual greetings

3. Integration Testing (after both complete)
   - Test personification level + context detection together
   - Verify config schema compatibility
   - Performance testing
```

---

## 🎯 Recommended Implementation Approach

**Please choose ONE of the following:**

### Option A: Minimal Viable Product (MVP)
- Hardcoded workflow patterns
- File-based session tracking
- Cached git detection (5min TTL)
- Metadata in agent files for command categories
- Fallback to simple greeting on errors
- **Effort:** 2 days ($200)

### Option B: Balanced Approach
- Hybrid context detection (conversation + file)
- Hardcoded workflow patterns + memory integration
- Cached git detection with background updates
- Separate command-categories.yaml
- Graceful degradation
- **Effort:** 3 days ($300)

### Option C: Full-Featured System
- Dynamic pattern learning
- Memory-based workflow tracking
- Real-time git detection with async updates
- Usage-based command selection
- Comprehensive error handling
- **Effort:** 5 days ($500)

**Your Recommendation:** **Option B: Balanced Approach** ✅

**Reasoning:**

**Why Not Option A (MVP)?**
- File-only session tracking is too limited
- Missing conversation history analysis means poor context detection
- Would require significant refactoring to add later
- User experience wouldn't be notably better than current greeting

**Why Not Option C (Full-Featured)?**
- Dynamic pattern learning is overkill (adds complexity with marginal benefit)
- Usage-based command selection requires analytics infrastructure
- 5 days ($500) too expensive for incremental UX improvement
- Over-engineering risk

**Why Option B (Balanced)?**
- **Right feature set:** Hybrid detection + hardcoded workflows covers 95% of use cases
- **Sensible performance:** Cached git + background updates = best UX
- **Evolution path:** Can add memory integration (Story 4.5) later without refactoring
- **Cost-effective:** 3 days ($300) is appropriate investment for UX improvement
- **Low technical debt:** Clean architecture, easy to extend

**Implementation Plan (3 days):**

**Day 1: Core Detection Systems**
- Implement ContextDetector.js (hybrid approach)
- Implement GitConfigDetector.js (cached with invalidation)
- Create workflow-patterns.yaml (5-10 common patterns)
- Unit tests for detection logic

**Day 2: Greeting Builder & Integration**
- Implement GreetingBuilder.js
- Add command visibility metadata to 3 agents (po, dev, qa)
- Update core-config.yaml schema
- Integration with existing project-status-loader.js

**Day 3: Testing & Polish**
- Add .aios/session-state.json tracking
- Fallback strategy implementation + timeout protection
- Performance testing (meet 150ms budget)
- Update 8 remaining agents with command metadata
- Documentation

**Deliverables:**
- 3 new scripts (context-detector, git-config-detector, greeting-builder)
- 1 data file (workflow-patterns.yaml)
- Updated core-config.yaml schema
- 11 agents with command visibility metadata
- 80%+ test coverage
- Performance benchmarks

---

## 📊 Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Context detection inaccurate | Medium | Medium | Fallback to simple greeting |
| Git detection adds latency | High | Low | Use caching + async updates |
| Workflow patterns too rigid | Medium | Low | Start hardcoded, evolve based on feedback |
| Command categorization subjective | Low | Low | User testing with 5-10 users |
| Breaking existing agents | Low | High | Comprehensive fallback strategy |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Conflicts with Story 6.1.4 | Medium | Medium | Coordinate with config schema |
| Project-status-loader.js API changes | Low | Medium | Version API, maintain backwards compat |
| Memory layer dependency | Low | High | Make memory integration optional |

---

## 🔗 Dependencies

**Prerequisites (Must Complete First):**
- ✅ Story 6.1.2 - Agent File Updates (agents have persona_profile)
- ✅ Story 6.1.2.4 - Project Status Context (project-status-loader.js exists)
- 🔄 Story 6.1.4 - Configuration System (git-config fields needed)

**Dependent Stories (This Blocks):**
- None (enhancement, doesn't block critical path)

**Optional Integrations:**
- Story 4.5 - Memory Layer Integration (for workflow tracking)

---

## 📝 Architect Review Checklist

Please review and provide feedback on:

- [x] **Question 1:** Context detection strategy → **C. Hybrid Approach**
- [x] **Question 2:** Workflow detection algorithm → **A. Hardcoded Patterns** (evolve to Memory)
- [x] **Question 3:** Git config detection performance → **B. Cached Detection (5min TTL)**
- [x] **Question 4:** Command categorization strategy → **A. Metadata in Agent Files**
- [x] **Question 5:** Core-config schema changes → **Approved with simplifications**
- [x] **Question 6:** Backwards compatibility approach → **Approved with enhancements**
- [x] **Question 7:** Performance budget → **150ms hard limit, 100ms target**
- [x] **Question 8:** Integration with Story 6.1.4 → **B. New Story 6.1.2.5** (separate)
- [x] **Implementation Approach:** → **B. Balanced Approach** (3 days, $300)
- [x] **Overall Architecture:** ✅ **APPROVED**

**Additional Comments/Concerns:**

**Architectural Strengths:**
1. ✅ Clean separation of concerns (context detection, git config, greeting assembly)
2. ✅ Excellent performance strategy (caching + timeout protection)
3. ✅ Robust fallback mechanisms (graceful degradation at every layer)
4. ✅ Evolution path clear (hardcoded → memory → learned patterns)
5. ✅ Backwards compatible (agents without metadata still work)

**Required Before Implementation:**
1. **Coordinate with Story 6.1.4** - Ensure `agentIdentity` schema is compatible
2. **Test with 5-10 users** - Validate command categorization choices (full/quick/key)
3. **Performance baseline** - Measure current greeting latency before changes
4. **Document workflow patterns** - Get user feedback on hardcoded workflows

**Recommended Extensions (Future Stories):**
- **Story 6.1.2.6:** Memory Layer Integration (when Story 4.5 is stable)
  - Replace hardcoded workflows with learned patterns
  - Track user command preferences over time
  - Adaptive command filtering based on usage

- **Story 6.1.2.7:** Agent Collaboration Hints
  - "Working on Story 6.1.6? Consider consulting @architect for reviews"
  - Context-aware agent suggestions

**Performance SLA:**
- P50 latency: <100ms (target)
- P95 latency: <130ms (acceptable)
- P99 latency: <150ms (hard limit via timeout)
- Failure rate: <0.1% (with fallback to simple greeting)

**Success Metrics (Post-Launch):**
- 80%+ users prefer contextual greeting over simple greeting
- <5% users disable contextual greeting in config
- Zero breaking changes to existing agent activation
- Performance regression: 0ms (with warm caches)

---

**Review Status:** ✅ **APPROVED** by Aria (@architect) - 2025-01-15

**Next Steps After Review:**
1. ✅ **Architect feedback incorporated** - All 8 questions answered
2. ✅ **Create Story 6.1.2.5** - Contextual Agent Load System (separate from 6.1.4)
3. ✅ **Workflow Navigation Extension** - Added WorkflowNavigator.js (Day 4, +$100)
4. ✅ **Estimate updated:** 4 days ($400) - Balanced Approach + Workflow Navigation
5. ⏭️ **Add to Epic 6.1 backlog** - After Story 6.1.4 completes
6. ⏭️ **Coordinate with @dev** - Ensure 6.1.4 schema is compatible

**Post-Approval Enhancement (2025-01-15):**
- **Workflow Navigation System** added to scope based on user proposal
- New component: `WorkflowNavigator.js` for next-step suggestions
- Enhanced `workflow-patterns.yaml` with state transitions
- Agent exit hooks to save workflow context
- Pre-populated command suggestions (e.g., *develop-yolo story-path.md)
- Investment increased from $300 to $400 (3 days → 4 days)

**Implementation Dependencies:**
- ✅ Story 6.1.2 - Agent File Updates (completed)
- ✅ Story 6.1.2.4 - Project Status Context (completed)
- 🔄 Story 6.1.4 - Configuration System (must complete first)

**Approved Architecture:**
- **Context Detection:** Hybrid (conversation history + file-based)
- **Workflow Detection:** Hardcoded patterns → Memory integration later
- **Git Config:** Cached (5min TTL) with smart invalidation
- **Git Warning Placement:** At END of greeting (not replacing Project Status)
- **Command Categorization:** Metadata in agent files
- **Performance Budget:** 150ms hard limit, 100ms target
- **Backwards Compatibility:** Graceful fallback to simple greeting

---

*Document created by: Pax (po) - 2025-01-15*
*Architecture review completed by: Aria (@architect) - 2025-01-15*
*Post-review adjustment: Git warning placement moved to END of greeting (approved by user)*
*Review template v1.0*
*Status: APPROVED - Ready for Story 6.1.2.5 creation*
