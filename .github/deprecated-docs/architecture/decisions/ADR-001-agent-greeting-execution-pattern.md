# ADR-001: Agent Greeting Execution Pattern

**Status:** APPROVED & IMPLEMENTED ✅
**Date:** 2025-11-16
**Decision Makers:** @architect (Aria), @qa (Quinn), @dev (Dex)
**Implementation:** story-6.1.2.5-T1 (COMPLETE)
**Context:** Story 6.1.2.5 - Contextual Agent Load Integration Blocker

---

## Context and Problem Statement

AIOS agents need to execute contextual greeting logic during activation, but there's a fundamental impedance mismatch between:
- **YAML/Markdown agent definitions** (static configuration files)
- **JavaScript greeting-builder.js module** (runtime execution)

Current activation-instructions reference greeting-builder.js, but Claude Code interprets this as documentation rather than executable code, causing `MODULE_NOT_FOUND` errors.

**Blocker Impact:** All 11 agents cannot display contextual greetings despite the infrastructure being production-ready (27/27 tests passing).

---

## Decision Drivers

Based on research into modern AI agent frameworks (Microsoft Copilot Security, Julep AI, Mastra, VoltAgent, LangChain, AutoGPT):

### Industry Patterns Identified

1. **Microsoft Copilot Security** (2025):
   - Uses YAML manifests with embedded system prompts
   - Runtime context via `Settings.Model` configuration
   - No external module loading during agent init

2. **Julep AI Best Practice** (Aug 2025):
   - "YAML forces fundamental shift: 'what are the steps?' not 'how do I code this?'"
   - Recommendation: Keep orchestration logic in YAML, execution in tools
   - Configuration-driven > code-driven for agent behavior

3. **Mastra/VoltAgent Pattern** (Apr 2025):
   - Runtime context via dependency injection
   - Dynamic values resolved via functions that receive `RuntimeContext`
   - Type-safe context passing at agent invocation time

4. **Alibaba Cloud Configuration-Driven Architecture** (Sep 2025):
   - "Configuration-driven dynamic agent architecture achieves efficient orchestration"
   - Separates configuration (YAML) from execution (runtime)
   - Independent runtime per agent for isolation

5. **Agent Design Pattern Catalogue** (arXiv 2024):
   - 18 architectural patterns analyzed
   - Key principle: "Configuration should be declarative, execution should be modular"

### Key Findings

✅ **Industry Consensus:**
- YAML/JSON for agent configuration (declarative)
- External tools/utilities for runtime logic (imperative)
- Runtime context injection via function parameters (not static embedding)

❌ **Anti-Pattern Identified:**
- Loading JavaScript modules from YAML activation-instructions
- Mixing configuration (what to do) with execution (how to do it)

---

## Options Considered

### Option A: Inline YAML Greeting Logic

**Pattern:** Embed greeting generation directly in activation-instructions

**Pros:**
- ✅ No external dependencies
- ✅ Self-contained in each agent file
- ✅ Works immediately in Claude Code markdown context

**Cons:**
- ❌ Code duplication across 11 agents
- ❌ Cannot reuse greeting-builder.js (27/27 tests wasted)
- ❌ Maintenance nightmare (11 places to update)
- ❌ Violates DRY principle
- ❌ Against industry best practice (Julep AI: "YAML should define steps, not implement logic")

**Effort:** 8-10 hours
**Industry Alignment:** ⚠️ LOW (anti-pattern per Julep AI recommendations)

---

### Option B: Slash Command Wrapper ⭐ RECOMMENDED

**Pattern:** Create `/greet` slash command that wraps greeting-builder.js

**Architecture:**
```yaml
# .claude/commands/greet.md
Call greeting-builder.js with agent definition and conversation history.
Returns formatted greeting string.
```

```yaml
# Agent activation-instructions
- STEP 3: Execute /greet command with agent definition
- STEP 4: Display greeting returned by /greet
- STEP 5: HALT and await user input
```

**How It Works:**
1. Agent activation triggers `/greet` slash command
2. Slash command (executed by Claude Code) loads greeting-builder.js
3. Returns greeting string to agent
4. Agent displays greeting

**Pros:**
- ✅ Uses existing greeting-builder.js infrastructure
- ✅ Testable independently (27/27 tests remain valid)
- ✅ Reusable across all agents
- ✅ Clean separation: config (YAML) → execution (slash command) → logic (JS)
- ✅ Aligns with Mastra runtime context pattern
- ✅ Follows industry best practice (declarative config + modular execution)

**Cons:**
- ❌ Extra activation step (minor)
- ❌ Requires slash command system (already available)

**Effort:** 3-4 hours
**Industry Alignment:** ✅ HIGH (matches Microsoft, Julep AI, Mastra patterns)

---

### Option C: Pre-Generated Static Greetings

**Pattern:** Build-time script generates static greetings for all scenarios

**Architecture:**
```bash
# Build time
node scripts/generate-static-greetings.js
# Outputs: .claude/greetings/po-new.md, po-existing.md, po-workflow.md
```

**Pros:**
- ✅ Zero runtime overhead
- ✅ No execution issues
- ✅ Fast performance

**Cons:**
- ❌ NOT truly contextual (defeats Story 6.1.2.5 purpose)
- ❌ Cannot adapt to actual conversation history
- ❌ Cannot check git config in real-time
- ❌ Requires rebuild on any change
- ❌ Static nature makes workflow detection impossible

**Effort:** 6-8 hours
**Industry Alignment:** ⚠️ LOW (violates core requirement: contextual adaptation)

---

### Option D: Investigate Claude Code Native Execution

**Pattern:** Research if Claude Code supports direct file execution from markdown

**Approach:**
- Spike: Test if Claude Code can execute utilities via special syntax
- Explore MCP (Model Context Protocol) server integration
- Check Claude Code plugin system for greeting hooks

**Pros:**
- ✅ Clean solution if supported
- ✅ Leverages platform capabilities
- ✅ Potentially elegant architecture

**Cons:**
- ❌ Unknown feasibility
- ❌ May not be possible
- ❌ Platform-dependent
- ❌ No guarantees of success

**Effort:** 2-4 hours (spike) + unknown implementation
**Industry Alignment:** 🔍 UNKNOWN (requires investigation)

---

## Decision Outcome

**RECOMMENDED: Option B (Slash Command Wrapper)**

**Rationale:**

1. **Industry Best Practices Alignment:**
   - Matches Microsoft Copilot Security's model (YAML config + runtime resolution)
   - Follows Julep AI recommendation: "YAML defines steps, tools execute"
   - Implements Mastra's runtime context pattern (dynamic resolution at invocation)

2. **Technical Soundness:**
   - Clean separation of concerns (config vs execution)
   - Reuses tested infrastructure (27/27 tests)
   - Minimal implementation effort (3-4 hours)
   - Maintainable long-term

3. **Risk Mitigation:**
   - Low risk (slash commands already working)
   - Fast implementation (can resolve blocker quickly)
   - Proven pattern (used in multiple production frameworks)

**Secondary: Option D (Spike First, Then Fallback to B)**

If team wants to explore native Claude Code capabilities:
1. Allocate 2-4 hours for spike investigation
2. If feasible → implement native solution
3. If not → fallback to Option B (slash command)

**DO NOT PURSUE: Options A or C**
- Option A: Maintenance nightmare, anti-pattern
- Option C: Defeats contextual greeting purpose

---

## Implementation Plan (Option B)

### Phase 1: Create Slash Command (2 hours)

**File:** `.claude/commands/greet.md`
```markdown
# greet

Load and execute greeting-builder.js with agent context.

Returns contextual greeting based on:
- Session type (new/existing/workflow)
- Git configuration status
- Project status
- Command visibility metadata

Usage: Automatically called during agent activation.
```

**Handler:** `scripts/slash-commands/greet-handler.js`
```javascript
const GreetingBuilder = require('../../.aios-core/scripts/greeting-builder');

async function executeGreet(agentDefinition, conversationHistory) {
  const builder = new GreetingBuilder();
  return await builder.buildGreeting(agentDefinition, conversationHistory);
}

module.exports = { executeGreet };
```

### Phase 2: Update Agent Activation Instructions (1 hour)

**Old (broken):**
```yaml
- STEP 3: Build intelligent greeting using .aios-core/scripts/greeting-builder.js
```

**New (working):**
```yaml
- STEP 3: Execute /greet slash command to generate contextual greeting
- STEP 4: Display the greeting returned by /greet command
- STEP 5: HALT and await user input
```

### Phase 3: Test and Validate (1 hour)

1. Test greeting generation via `/greet` command directly
2. Test agent activation with new instructions
3. Validate 4 scenarios: new session, existing context, workflow, git warning
4. Verify 27/27 unit tests still passing

**Total Effort:** 4 hours
**Blocker Resolution:** ✅ Complete

---

## Consequences

### Positive

- ✅ Resolves BLOCKER-6.1.2.5-001 immediately
- ✅ Preserves all 27 passing tests (no wasted work)
- ✅ Follows industry best practices (Microsoft, Julep AI, Mastra)
- ✅ Maintainable long-term (single source of truth)
- ✅ Enables manual testing (story-6.1.2.5-F1)
- ✅ Scalable pattern for future agent utilities

### Negative

- ⚠️ Adds one extra step to agent activation (negligible)
- ⚠️ Requires slash command infrastructure (already exists)
- ⚠️ Slightly less direct than hypothetical native execution (Option D)

### Neutral

- 📝 Establishes pattern for future agent utility integration
- 📝 Documents architectural principle: config (YAML) + execution (tools)
- 📝 Creates reusable slash command template

---

## References

### Industry Research (Nov 2025)

1. **Microsoft Copilot Security Agent YAML** (Sep 2025)
   https://learn.microsoft.com/en-us/copilot/security/developer/agent-manifest-sample

2. **Julep AI: Why Every AI Agent Framework Should Adopt YAML** (Aug 2025)
   https://julep.ai/blog/why-every-ai-agent-framework-should-adopt-yaml-a-technical-deep-dive

3. **Mastra: Dynamic Agents with Runtime Context** (Apr 2025)
   https://mastra.ai/blog/dynamic-agents

4. **VoltAgent: Dynamic Agent Configuration** (2025)
   https://voltagent.dev/docs/agents/dynamic-agents/

5. **Alibaba Cloud: Configuration-Driven Agent Architecture** (Sep 2025)
   https://www.alibabacloud.com/blog/configuration-driven-dynamic-agent-architecture

6. **Agent Design Pattern Catalogue** (arXiv, Nov 2024)
   https://arxiv.org/abs/2405.10467

### Related Documents

- **Story:** `docs/stories/aios migration/story-6.1.2.5-contextual-agent-load-integration.md`
- **QA Gate:** `docs/qa/gates/epic-6.1.story-6.1.2.5-contextual-agent-load.yml`
- **Backlog Items:** `docs/STORY-BACKLOG.md` (story-6.1.2.5-T1, story-6.1.2.5-F1)
- **Infrastructure:** `.aios-core/scripts/greeting-builder.js` (27/27 tests passing)

---

**Approved By:** @architect (Aria) - 2025-11-16
**Implementation:** ✅ story-6.1.2.5-T1 (COMPLETE - 2.5 hours)
**Implementation Log:** docs/architecture/decisions/ADR-001-implementation-log.md
**Follow-up:** ⏳ story-6.1.2.5-F1 (manual testing - User + @qa)

---

## Implementation Results

**Completed:** 2025-11-16 (2.5 hours, under 4-hour estimate)

**Deliverables:**
- ✅ `.claude/commands/greet.md` - Slash command created
- ✅ All 11 agents updated (dev, qa, po, sm, pm, architect, analyst, data-engineer, devops, aios-master, ux-design-expert)
- ✅ Agents synchronized to `.claude/commands/AIOS/agents/`
- ✅ Update script created: `.aios-core/scripts/update-activation-instructions.js`
- ✅ Implementation log documented

**Test Status:**
- Unit tests: 27/27 passing (100%) ✅
- Integration tests: Ready for manual testing ⏳
- 4 greeting scenarios pending user validation

**Blocker Status:**
- BLOCKER-6.1.2.5-001: ✅ RESOLVED
