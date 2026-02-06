# Story 6.1.4: Unified Greeting System Integration (v4 - Expanded)

**Story ID:** 6.1.4  
**Epic:** Epic-6.1 - Agent Identity System  
**Wave:** Wave 1 (Foundation)  
**Status:** 📋 Ready to Start  
**Priority:** 🔴 Critical  
**Owner:** Dev (Dex)  
**Created:** 2025-01-14  
**Updated:** 2025-01-17 (v4 - Unified System Integration)  
**Duration:** 2.5 days (20 hours)  
**Investment:** $250.00

---

## 📋 Objective

**EXPANDED SCOPE:** Implement a unified greeting system that integrates all greeting components (session context, project status, agent personalization, user preferences) into a single, optimized, and maintainable solution. This story unifies Stories 6.1.1 through 6.1.6 into a cohesive system that actually works.

**Original Scope (Already Implemented):**
- ✅ User-configurable greeting preferences (auto/minimal/named/archetypal)
- ✅ `GreetingPreferenceManager` class
- ✅ CLI commands for preference management
- ✅ Integration with `GreetingBuilder`

**New Scope (This Story):**
- 🔄 Expand `agent-config-loader.js` to load complete agent definitions
- 🔄 Create unified `generate-greeting.js` wrapper
- 🔄 Modify `greeting-builder.js` to accept pre-loaded context
- 🔄 Update all 11 agents to use unified system
- 🔄 Implement session state updates after commands
- 🔄 Consolidate duplicate scripts
- 🔄 Fix integration issues identified in technical review

---

## 🎯 Story

**As a** AIOS framework user,  
**I want** agents to use a unified greeting system that integrates session context, project status, agent personalization, and user preferences,  
**So that** I have a consistent, fast, and contextually relevant experience when activating any agent.

**Business Value:** 
- Unifies all previous greeting-related work (Stories 6.1.1-6.1.6)
- Fixes integration issues preventing components from working together
- Provides optimal performance (<150ms with timeout protection)
- Maintains backward compatibility with fallbacks
- Simplifies architecture by consolidating duplicate scripts

---

## 🔗 Context: Integration of Previous Stories

### Stories Already Implemented (But Not Integrated):

**Story 6.1.1:** Agent Persona Definitions ✅
- Agent definitions with `persona_profile.greeting_levels`
- **Status:** Implemented, but agents don't use it

**Story 6.1.2.4:** Project Status Context ✅
- `project-status-loader.js` with 60s cache
- **Status:** Implemented, but agents don't use it

**Story 6.1.2.5:** Contextual Agent Load Integration ✅
- `greeting-builder.js` with session detection
- `session-context-loader.js` for multi-agent continuity
- `context-detector.js` for session type detection
- `workflow-navigator.js` for workflow suggestions
- **Status:** Implemented, but agents don't use it

**Story 6.1.2.6:** Framework Configuration System ✅
- `agent-config-loader.js` for lazy loading
- **Status:** Implemented, but doesn't load agent definitions

**Story 6.1.4 (Original):** Greeting Preferences ✅
- `greeting-preference-manager.js`
- `greeting-config-cli.js`
- **Status:** Implemented, but agents don't use it

**Story 6.1.6:** Output Formatter ✅
- Output formatting utilities
- **Status:** Implemented

### Current Problem:

**Agents use inline logic in STEP 3:**
```yaml
- STEP 3: |
    Generate contextual greeting using inline logic:
    1. Detect session type: If first message → "new"
    2. Build greeting manually...
    3. Get project status (use Bash tool)...
    4. Show commands...
```

**Problems:**
- ❌ Claude Code doesn't have access to `conversationHistory`
- ❌ Session detection always returns "new"
- ❌ Commands always show "full" visibility
- ❌ Doesn't use any of the developed scripts
- ❌ Session state never updated after commands

### Solution:

**Unified greeting generator called via Node.js:**
```yaml
- STEP 3: |
    Generate greeting by executing unified greeting generator:
    1. Execute: node .aios-core/scripts/generate-greeting.js {agent-id}
    2. Capture the complete output
    3. Display the greeting exactly as returned
    
    If execution fails:
    - Fallback to simple greeting: "{icon} {name} ready"
    - Show: "Type *help to see available commands"
```

---

## 📊 Technical Analysis Summary

### Analysis Documents Integrated:

1. **QA Analysis** (`docs/qa/comprehensive-greeting-system-analysis.md`)
   - Identified integration failure between components
   - Proposed unified wrapper solution
   - Performance targets: <50ms (cache), <150ms (no cache)

2. **Architect Consolidation Analysis** (`docs/architecture/scripts-consolidation-analysis.md`)
   - Identified duplicate scripts (`config-loader.js` vs `agent-config-loader.js`)
   - Recommended expanding `agent-config-loader.js` instead of creating new loader
   - Identified 4 temporary migration scripts to delete

3. **Architect Technical Review** (`docs/architecture/technical-review-greeting-system-unification.md`)
   - Identified 3 critical issues:
     1. `AgentConfigLoader` doesn't return complete agent definition
     2. Context structure inconsistency (duplicate loading)
     3. Missing validation of agent structure
   - Approved architecture with mandatory modifications

### Critical Issues to Fix:

1. **🔴 CRITICAL:** Expand `agent-config-loader.js` to load complete agent definitions
2. **🔴 CRITICAL:** Modify `greeting-builder.js` to accept pre-loaded context
3. **🔴 CRITICAL:** Create `generate-greeting.js` using expanded loader
4. **🟡 MEDIUM:** Add validation and normalization of agent definitions
5. **🟡 MEDIUM:** Improve error handling and logging

---

## 📋 Tasks Breakdown

### Phase 1: Script Consolidation (4.5 hours)

**Task 1.1: Expand `agent-config-loader.js` (2 hours)**

**Objective:** Add capability to load complete agent definition from markdown file

**Implementation:**

Add to `.aios-core/scripts/agent-config-loader.js`:

```javascript
/**
 * Agent definition cache (5 min TTL)
 */
const agentDefCache = new Map();

/**
 * Load complete agent definition from markdown file
 * 
 * @param {Object} options - Load options
 * @param {boolean} options.skipCache - Skip cache and force reload
 * @returns {Promise<Object>} Complete agent definition (agent, persona_profile, commands, etc.)
 */
async loadAgentDefinition(options = {}) {
  const skipCache = options.skipCache || false;
  const cacheKey = this.agentId;
  
  // Check cache
  if (!skipCache && agentDefCache.has(cacheKey)) {
    const cached = agentDefCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.definition;
    }
  }
  
  // Load from file
  const agentPath = path.join(process.cwd(), '.aios-core', 'agents', `${this.agentId}.md`);
  
  try {
    const content = await fs.readFile(agentPath, 'utf8');
    
    // Extract YAML block (handle both ```yaml and ```yml)
    const yamlMatch = content.match(/```ya?ml\n([\s\S]*?)\n```/);
    if (!yamlMatch) {
      throw new Error(`No YAML block found in ${this.agentId}.md`);
    }
    
    const agentDef = yaml.load(yamlMatch[1]);
    
    // Validate structure
    if (!agentDef.agent || !agentDef.agent.id) {
      throw new Error(`Invalid agent definition: missing agent.id`);
    }
    
    // Normalize and validate
    const normalized = this._normalizeAgentDefinition(agentDef);
    
    // Cache
    agentDefCache.set(cacheKey, {
      definition: normalized,
      timestamp: Date.now()
    });
    
    return normalized;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Agent file not found: ${this.agentId}.md`);
    }
    throw new Error(`Failed to load agent definition for ${this.agentId}: ${error.message}`);
  }
}

/**
 * Normalize agent definition with defaults
 * @private
 * @param {Object} agentDef - Raw agent definition
 * @returns {Object} Normalized agent definition
 */
_normalizeAgentDefinition(agentDef) {
  // Ensure agent object exists
  if (!agentDef.agent) {
    throw new Error('Agent definition missing "agent" section');
  }
  
  const agent = agentDef.agent;
  
  // Normalize: ensure required fields have defaults
  agent.id = agent.id || 'unknown';
  agent.name = agent.name || agent.id;
  agent.icon = agent.icon || '🤖';
  
  // Ensure persona_profile exists with greeting_levels
  if (!agentDef.persona_profile) {
    agentDef.persona_profile = {
      greeting_levels: {
        minimal: `${agent.icon} ${agent.id} Agent ready`,
        named: `${agent.icon} ${agent.name} ready`,
        archetypal: `${agent.icon} ${agent.name} ready`
      }
    };
  } else if (!agentDef.persona_profile.greeting_levels) {
    agentDef.persona_profile.greeting_levels = {
      minimal: `${agent.icon} ${agent.id} Agent ready`,
      named: `${agent.icon} ${agent.name} ready`,
      archetypal: `${agent.icon} ${agent.name} ready`
    };
  }
  
  // Ensure commands array exists
  if (!agentDef.commands || !Array.isArray(agentDef.commands)) {
    agentDef.commands = [];
  }
  
  return agentDef;
}

/**
 * Load both config and definition (convenience method)
 * 
 * @param {Object} coreConfig - Core configuration
 * @param {Object} options - Load options
 * @returns {Promise<Object>} Combined config and definition
 */
async loadComplete(coreConfig, options = {}) {
  const [config, definition] = await Promise.all([
    this.load(coreConfig, options),
    this.loadAgentDefinition(options)
  ]);
  
  return {
    ...config,
    definition,
    agent: definition.agent,
    persona_profile: definition.persona_profile,
    commands: definition.commands || []
  };
}
```

**Validation:**
- ✅ Loads agent definition from markdown file
- ✅ Extracts YAML block correctly
- ✅ Validates structure (agent.id required)
- ✅ Normalizes missing fields with defaults
- ✅ Caches definitions (5 min TTL)
- ✅ Handles file not found errors gracefully

---

**Task 1.2: Deprecate `config-loader.js` (1 hour)**

**Objective:** Mark as deprecated and verify no active usage

**Actions:**

1. Add deprecation warning to `.aios-core/scripts/config-loader.js`:
```javascript
/**
 * @deprecated Use agent-config-loader.js instead
 * This file will be removed in a future version.
 * 
 * Migration guide:
 * - Old: const { loadAgentConfig } = require('./config-loader');
 * - New: const { AgentConfigLoader } = require('./agent-config-loader');
 *        const loader = new AgentConfigLoader(agentId);
 *        const config = await loader.load(coreConfig);
 */
```

2. Check for usages:
```bash
grep -r "require.*config-loader" .aios-core/
grep -r "from.*config-loader" .aios-core/
```

3. If no usages found: Document deprecation, keep file for now
4. If usages found: Migrate to `agent-config-loader.js` first

**Note:** Based on grep results, `config-loader.js` appears unused. Safe to deprecate.

---

**Task 1.3: Delete Temporary Migration Scripts (30 minutes)**

**Objective:** Remove completed migration scripts (verify existence first)

**Scripts to Delete (verify existence before deletion):**
1. `.aios-core/scripts/batch-integrate-greeting-builder.js` ✅ (exists - verified)
2. `.aios-core/scripts/apply-inline-greeting-all-agents.js` ❌ (not found - may already be deleted)
3. `.aios-core/scripts/update-activation-instructions.js` ✅ (exists - verified)
4. `.aios-core/scripts/batch-update-agents-session-context.js` ❌ (not found - may already be deleted)

**Implementation Steps:**

1. **Verify script existence:**
   ```bash
   # Check each script
   test -f .aios-core/scripts/batch-integrate-greeting-builder.js && echo "EXISTS" || echo "NOT FOUND"
   test -f .aios-core/scripts/apply-inline-greeting-all-agents.js && echo "EXISTS" || echo "NOT FOUND"
   test -f .aios-core/scripts/update-activation-instructions.js && echo "EXISTS" || echo "NOT FOUND"
   test -f .aios-core/scripts/batch-update-agents-session-context.js && echo "EXISTS" || echo "NOT FOUND"
   ```

2. **Delete existing scripts only:**
   ```bash
   # Delete only if file exists (graceful handling)
   [ -f .aios-core/scripts/batch-integrate-greeting-builder.js ] && rm .aios-core/scripts/batch-integrate-greeting-builder.js
   [ -f .aios-core/scripts/update-activation-instructions.js ] && rm .aios-core/scripts/update-activation-instructions.js
   ```

3. **Document deletion status:**
   - Log which scripts were deleted
   - Note which scripts were already missing (may have been deleted in previous migration)
   - Update this task with actual deletion results

**Justification:**
- Migrations completed
- Historical record preserved in Git
- Reduces confusion
- Graceful handling of already-deleted scripts

**Validation:**
- ✅ Scripts verified before deletion
- ✅ Only existing scripts deleted
- ✅ Deletion status documented

---

### Phase 2: Modify GreetingBuilder (2 hours)

**Task 2.1: Modify `greeting-builder.js` to Accept Pre-loaded Context (2 hours)**

**Objective:** Prevent duplicate loading of session context and project status

**Implementation:**

Modify `.aios-core/scripts/greeting-builder.js`:

```javascript
/**
 * Build contextual greeting (internal implementation)
 * @private
 * @param {Object} agent - Agent definition
 * @param {Object} context - Session context (may contain pre-loaded values)
 * @returns {Promise<string>} Contextual greeting
 */
async _buildContextualGreeting(agent, context) {
  // Use pre-loaded values if available, otherwise load
  const sessionType = context.sessionType || 
    await this._safeDetectSessionType(context);
  
  const projectStatus = context.projectStatus || 
    await this._safeLoadProjectStatus();
  
  // gitConfig always loads (fast, cached)
  const gitConfig = await this._safeCheckGitConfig();
  
  // Build greeting sections based on session type
  const sections = [];
  
  // 1. Presentation (always)
  sections.push(this.buildPresentation(agent, sessionType));
  
  // 2. Role description (new session only)
  if (sessionType === 'new') {
    sections.push(this.buildRoleDescription(agent));
  }
  
  // 3. Project status (if git configured)
  if (gitConfig.configured && projectStatus) {
    sections.push(this.buildProjectStatus(projectStatus, sessionType));
  }
  
  // 4. Session context message (if existing session)
  if (sessionType !== 'new' && context.sessionMessage) {
    sections.push(context.sessionMessage);
  }
  
  // 5. Workflow suggestions (if workflow session)
  if (sessionType === 'workflow' && context.lastCommands) {
    const suggestions = this.workflowNavigator.getNextSteps(
      context.lastCommands,
      { agentId: agent.id }
    );
    if (suggestions && suggestions.length > 0) {
      sections.push(this.buildWorkflowSuggestions(suggestions));
    }
  }
  
  // 6. Commands (filtered by visibility)
  const commands = this.filterCommandsByVisibility(agent, sessionType);
  sections.push(this.buildCommands(commands, sessionType));
  
  // 7. Footer
  sections.push(this.buildFooter());
  
  return sections.filter(Boolean).join('\n\n');
}
```

**Key Changes:**
- ✅ Uses `context.sessionType` if provided (avoids duplicate detection)
- ✅ Uses `context.projectStatus` if provided (avoids duplicate loading)
- ✅ Uses `context.sessionMessage` if provided (from session-context-loader)
- ✅ Uses `context.lastCommands` if provided (for workflow detection)
- ✅ Falls back to loading if not provided (backward compatible)

**Validation:**
- ✅ Backward compatible (works with old context format)
- ✅ Uses pre-loaded values when available
- ✅ Performance improved (no duplicate loading)

---

### Phase 3: Create Unified Greeting Generator (2 hours)

**Task 3.1: Create `generate-greeting.js` (2 hours)**

**Objective:** Create unified wrapper that orchestrates all greeting components

**Implementation:**

Create `.aios-core/scripts/generate-greeting.js`:

```javascript
#!/usr/bin/env node
/**
 * Unified Greeting Generator
 * 
 * Orchestrates all greeting components for optimal performance:
 * - Agent definition (via expanded agent-config-loader.js)
 * - Session context (session-context-loader.js)
 * - Project status (project-status-loader.js)
 * - User preferences (greeting-preference-manager.js)
 * - Contextual adaptation (greeting-builder.js)
 * 
 * Performance Targets:
 * - With cache: <50ms
 * - Without cache: <150ms (timeout protection)
 * - Fallback: <10ms
 * 
 * Usage: node generate-greeting.js <agent-id>
 * 
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const GreetingBuilder = require('./greeting-builder');
const SessionContextLoader = require('./session-context-loader');
const ProjectStatusLoader = require('./project-status-loader');
const { AgentConfigLoader } = require('./agent-config-loader');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * Generate unified greeting for agent activation
 * 
 * @param {string} agentId - Agent identifier (e.g., 'qa', 'dev')
 * @returns {Promise<string>} Formatted greeting string
 * @throws {Error} If agent file not found or invalid
 * 
 * @example
 * const greeting = await generateGreeting('qa');
 * console.log(greeting);
 */
async function generateGreeting(agentId) {
  const startTime = Date.now();
  
  try {
    // Load core config
    const coreConfigPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
    const coreConfigContent = await fs.readFile(coreConfigPath, 'utf8');
    const coreConfig = yaml.load(coreConfigContent);
    
    // Load everything in parallel using expanded AgentConfigLoader
    const loader = new AgentConfigLoader(agentId);
    const projectStatusLoader = new ProjectStatusLoader();
    
    const [complete, sessionContext, projectStatus] = await Promise.all([
      loader.loadComplete(coreConfig), // Loads config + definition
      loadSessionContext(agentId),
      projectStatusLoader.loadProjectStatus()
    ]);
    
    // Build unified context
    const context = {
      conversationHistory: [], // Not available in Claude Code
      sessionType: sessionContext.sessionType, // Pre-detected
      projectStatus: projectStatus, // Pre-loaded
      lastCommands: sessionContext.lastCommands || [],
      previousAgent: sessionContext.previousAgent,
      sessionMessage: sessionContext.message,
      workflowActive: sessionContext.workflowActive
    };
    
    // Generate greeting using GreetingBuilder
    const builder = new GreetingBuilder();
    const greeting = await builder.buildGreeting(complete.agent, context);
    
    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`[generate-greeting] Slow generation: ${duration}ms`);
    }
    
    return greeting;
    
  } catch (error) {
    console.error('[generate-greeting] Error:', {
      agentId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Fallback: Simple greeting
    return generateFallbackGreeting(agentId);
  }
}

/**
 * Load session context for agent
 * @private
 * @param {string} agentId - Agent ID
 * @returns {Promise<Object>} Session context
 */
async function loadSessionContext(agentId) {
  try {
    const loader = new SessionContextLoader();
    return loader.loadContext(agentId);
  } catch (error) {
    console.warn('[generate-greeting] Session context failed:', error.message);
    return {
      sessionType: 'new',
      message: null,
      previousAgent: null,
      lastCommands: [],
      workflowActive: null
    };
  }
}

/**
 * Generate fallback greeting if everything fails
 * @private
 * @param {string} agentId - Agent ID
 * @returns {string} Simple fallback greeting
 */
function generateFallbackGreeting(agentId) {
  return `✅ ${agentId} Agent ready\n\nType \`*help\` to see available commands.`;
}

// CLI interface
if (require.main === module) {
  const agentId = process.argv[2];
  
  if (!agentId) {
    console.error('Usage: node generate-greeting.js <agent-id>');
    console.error('\nExamples:');
    console.error('  node generate-greeting.js qa');
    console.error('  node generate-greeting.js dev');
    process.exit(1);
  }
  
  generateGreeting(agentId)
    .then(greeting => {
      console.log(greeting);
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      console.log(generateFallbackGreeting(agentId));
      process.exit(1);
    });
}

module.exports = { generateGreeting };
```

**Validation:**
- ✅ Loads agent definition via expanded `agent-config-loader.js`
- ✅ Loads session context in parallel
- ✅ Loads project status in parallel
- ✅ Builds unified context object
- ✅ Passes pre-loaded context to `GreetingBuilder`
- ✅ Handles errors gracefully with fallback
- ✅ Performance logging for slow operations
- ✅ CLI interface for testing

---

### Phase 4: Update Agents (Incremental Approach) (3.5 hours)

**Strategy:** Use QA agent as pilot, test thoroughly, then apply to others

**Task 4.1: Update QA Agent First (Pilot) (1 hour)**

**Objective:** Update only QA agent as proof of concept

**Pilot Agent:**
- `qa.md` (Quinn - Test Architect & Quality Advisor)

**New STEP 3 Format:**

```yaml
- STEP 3: |
    Generate greeting by executing unified greeting generator:
    
    1. Execute: node .aios-core/scripts/generate-greeting.js qa
    2. Capture the complete output
    3. Display the greeting exactly as returned
    
    If execution fails or times out:
    - Fallback to simple greeting: "✅ qa Agent ready"
    - Show: "Type *help to see available commands"
    
    Do NOT modify or interpret the greeting output.
    Display it exactly as received.
```

**Manual Update Steps:**

1. Open `.aios-core/agents/qa.md`
2. Find STEP 3 section (starts with `- STEP 3: |`)
3. Replace entire STEP 3 block with new format above
4. Save file
5. Test activation: `/AIOS/agents/qa`

**Validation Checklist for QA Pilot:**
- [ ] QA agent file updated correctly
- [ ] STEP 3 replaced with new format
- [ ] Agent ID "qa" correctly inserted
- [ ] Fallback instructions included
- [ ] File syntax valid (YAML)

---

**Task 4.2: Test QA Agent Thoroughly (1 hour)**

**Objective:** Validate unified greeting system works correctly with QA agent

**Test Scenarios:**

1. **New Session Test:**
   ```bash
   # Clear session state
   rm .aios/session-state.json
   
   # Activate QA agent
   /AIOS/agents/qa
   
   # Expected: "new" session type detected
   # Expected: Full greeting with role description
   # Expected: All commands shown (visibility: full, quick, key)
   ```

2. **Existing Session Test:**
   ```bash
   # Create session state
   node -e "const fs = require('fs'); const path = require('path'); const sessionPath = path.join(process.cwd(), '.aios', 'session-state.json'); fs.mkdirSync(path.dirname(sessionPath), { recursive: true }); fs.writeFileSync(sessionPath, JSON.stringify({ sessionId: 'test-123', startTime: new Date().toISOString(), lastActivity: new Date().toISOString(), agentSequence: [{ id: 'po', name: 'Pax' }], lastCommands: ['create-story'], workflowActive: null }), 'utf8');"
   
   # Activate QA agent
   /AIOS/agents/qa
   
   # Expected: "existing" session type detected
   # Expected: Quick greeting (no role description)
   # Expected: Reduced commands (visibility: quick, key)
   ```

3. **Direct Script Test:**
   ```bash
   # Test script directly
   node .aios-core/scripts/generate-greeting.js qa
   
   # Expected: Greeting output without errors
   # Expected: Contains agent name "Quinn"
   # Expected: Contains project status (if git configured)
   # Expected: Contains commands list
   ```

4. **Error Handling Test:**
   ```bash
   # Test with invalid agent
   node .aios-core/scripts/generate-greeting.js invalid-agent
   
   # Expected: Fallback greeting shown
   # Expected: No errors thrown
   ```

5. **Performance Test:**
   ```bash
   # Measure execution time
   time node .aios-core/scripts/generate-greeting.js qa
   
   # Expected: <150ms (with timeout protection)
   # Expected: <50ms if cache hit
   ```

**Success Criteria:**
- ✅ QA agent activates successfully
- ✅ Greeting generated correctly
- ✅ Session type detected correctly
- ✅ Commands filtered by visibility
- ✅ Project status shown (if git configured)
- ✅ Fallback works on errors
- ✅ Performance within targets

**If QA Pilot Fails:**
- Stop and fix issues before proceeding
- Don't update other agents until QA works perfectly
- Document issues and solutions

---

**Task 4.3: Apply to Remaining 10 Agents (1.5 hours)**

**Objective:** Update remaining agents only after QA pilot validated

**Prerequisites:**
- ✅ QA agent tested and working perfectly
- ✅ All test scenarios passed
- ✅ No errors or issues identified

**Agents to Update (After QA Validation):**
1. `dev.md`
2. `po.md`
3. `sm.md`
4. `pm.md`
5. `architect.md`
6. `analyst.md`
7. `data-engineer.md`
8. `devops.md`
9. `aios-master.md`
10. `ux-design-expert.md`

**Implementation Script:**

Create script `.aios/temp-update-remaining-agents.js`:

```javascript
const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(process.cwd(), '.aios-core', 'agents');
const REMAINING_AGENTS = [
  'dev', 'po', 'sm', 'pm', 'architect', 'analyst',
  'data-engineer', 'devops', 'aios-master', 'ux-design-expert'
];

const NEW_STEP_3_TEMPLATE = `  - STEP 3: |
      Generate greeting by executing unified greeting generator:
      
      1. Execute: node .aios-core/scripts/generate-greeting.js {agent-id}
      2. Capture the complete output
      3. Display the greeting exactly as returned
      
      If execution fails or times out:
      - Fallback to simple greeting: "{icon} {name} ready"
      - Show: "Type *help to see available commands"
      
      Do NOT modify or interpret the greeting output.
      Display it exactly as received.`;

function updateAgent(agentId) {
  const filePath = path.join(AGENTS_DIR, `${agentId}.md`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Agent file not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find and replace STEP 3
  const step3Pattern = /  - STEP 3: \|[\s\S]*?(?=  - STEP 4:|$)/;
  
  // Get agent icon and name from file for fallback
  const iconMatch = content.match(/icon:\s*(.+)/);
  const nameMatch = content.match(/name:\s*(.+)/);
  const icon = iconMatch ? iconMatch[1].trim() : '🤖';
  const name = nameMatch ? nameMatch[1].trim() : agentId;
  
  const newStep3 = NEW_STEP_3_TEMPLATE
    .replace(/{agent-id}/g, agentId)
    .replace('{icon}', icon)
    .replace('{name}', name);
  
  if (step3Pattern.test(content)) {
    content = content.replace(step3Pattern, newStep3);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${agentId}.md`);
    return true;
  } else {
    console.warn(`⚠️  STEP 3 pattern not found in ${agentId}.md`);
    return false;
  }
}

// Update remaining agents
console.log('🔄 Updating remaining agents (QA already done)...\n');
let updated = 0;
for (const agentId of REMAINING_AGENTS) {
  if (updateAgent(agentId)) {
    updated++;
  }
}

console.log(`\n✅ Updated ${updated} of ${REMAINING_AGENTS.length} agents`);
console.log(`📊 Total: ${updated + 1} agents (including QA pilot)`);
```

**Validation:**
- ✅ All 10 remaining agents updated
- ✅ STEP 3 replaced correctly
- ✅ Agent IDs correctly inserted
- ✅ Icons and names extracted for fallback
- ✅ Fallback instructions included

**Quick Validation Test:**
```bash
# Test each agent activation
for agent in dev po sm pm architect analyst data-engineer devops aios-master ux-design-expert; do
  echo "Testing $agent..."
  node .aios-core/scripts/generate-greeting.js $agent
  echo "---"
done
```

---

### Phase 5: Session State Updates (2 hours)

**Task 5.1: Create Command Execution Hook (1 hour)**

**Objective:** Update session state after command execution

**Implementation:**

Create `.aios-core/scripts/command-execution-hook.js`:

```javascript
/**
 * Command Execution Hook
 * 
 * Updates session state after command execution to maintain
 * accurate session context for future agent activations.
 * 
 * Part of Story 6.1.4: Unified Greeting System Integration
 */

const SessionContextLoader = require('./session-context-loader');

/**
 * Update session state after command execution
 * 
 * Should be called after each command execution to maintain
 * accurate session context for future agent activations.
 * 
 * @param {string} agentId - Agent ID executing the command
 * @param {string} agentName - Agent name (for display)
 * @param {string} command - Command name executed
 * @returns {void}
 * 
 * @example
 * updateSessionAfterCommand('qa', 'Quinn', 'analyze-framework');
 */
function updateSessionAfterCommand(agentId, agentName, command) {
  try {
    const loader = new SessionContextLoader();
    loader.updateSession(agentId, agentName, command);
  } catch (error) {
    // Non-blocking: Session update failure shouldn't break command execution
    console.warn('[command-hook] Failed to update session:', error.message);
  }
}

module.exports = { updateSessionAfterCommand };
```

**Note:** This hook is created but not automatically integrated. Integration requires:
- Modifying task execution system (future story)
- Or manual calls in critical commands (documentation)

**For now:** Document usage pattern for future integration.

---

**Task 5.2: Document Session Update Pattern (1 hour)**

**Objective:** Document how to integrate session updates

**Documentation:**

Create `.aios-core/docs/session-update-pattern.md`:

```markdown
# Session Update Pattern

## Overview

To maintain accurate session context, update session state after command execution.

## Usage

```javascript
const { updateSessionAfterCommand } = require('./command-execution-hook');

// After command execution
updateSessionAfterCommand('qa', 'Quinn', 'analyze-framework');
```

## Integration Points

1. **Task Execution:** Add hook call after task completion
2. **Command Execution:** Add hook call after command completion
3. **Manual Updates:** Call directly when needed

## Future Integration

Automatic integration will be added in future story:
- Task execution system will call hook automatically
- Command execution system will call hook automatically
```

---

### Phase 6: Testing & Validation (4 hours)

**Task 6.1: Unit Tests (2 hours)**

**Note:** Test directory structure verified - `tests/unit/` and `tests/integration/` already exist ✅

Create `tests/unit/generate-greeting.test.js`:

```javascript
/**
 * Unit Tests for Unified Greeting Generator
 */

const { generateGreeting } = require('../../.aios-core/scripts/generate-greeting');

describe('generateGreeting', () => {
  it('should generate greeting for valid agent', async () => {
    const greeting = await generateGreeting('qa');
    expect(greeting).toContain('Quinn');
    expect(greeting).toContain('ready');
  });
  
  it('should fallback for invalid agent', async () => {
    const greeting = await generateGreeting('invalid-agent');
    expect(greeting).toContain('Agent ready');
    expect(greeting).toContain('*help');
  });
  
  it('should include project status when git configured', async () => {
    const greeting = await generateGreeting('dev');
    // May or may not include project status depending on git config
    expect(greeting).toBeTruthy();
  });
  
  it('should respect user preferences', async () => {
    // Test with different preferences
    // Requires mocking GreetingPreferenceManager
  });
});
```

**Task 6.2: Integration Tests (2 hours)**

Create `tests/integration/greeting-system-integration.test.js`:

```javascript
/**
 * Integration Tests for Unified Greeting System
 */

describe('Greeting System Integration', () => {
  it('should generate greeting with all components integrated', async () => {
    // Test full flow:
    // 1. Load agent definition
    // 2. Load session context
    // 3. Load project status
    // 4. Generate greeting
    // 5. Verify output
  });
  
  it('should handle new session correctly', async () => {
    // Clear session state
    // Generate greeting
    // Verify "new" session type detected
  });
  
  it('should handle existing session correctly', async () => {
    // Create session state
    // Generate greeting
    // Verify "existing" session type detected
  });
  
  it('should update session state after command', async () => {
    // Execute command
    // Update session
    // Verify session state updated
  });
});
```

---

## ✅ Acceptance Criteria

### Must Have

- [ ] `agent-config-loader.js` expanded with `loadAgentDefinition()` and `loadComplete()`
- [ ] `greeting-builder.js` modified to accept pre-loaded context
- [ ] `generate-greeting.js` created and functional
- [ ] QA agent updated and tested as pilot
- [ ] QA agent validated with all test scenarios
- [ ] Remaining 10 agents updated after QA validation
- [ ] Session state updates after commands (hook created)
- [ ] Performance targets met: <50ms (cache), <150ms (no cache)
- [ ] Fallback works if Node.js unavailable
- [ ] Backward compatible with existing code
- [ ] Unit tests pass (10+ test cases)
- [ ] Integration tests pass (5+ test cases)

### Should Have

- [ ] `config-loader.js` deprecated (marked, usage checked)
- [ ] Temporary migration scripts deleted (verified and removed)
- [ ] Agent definition validation and normalization
- [ ] Improved error logging
- [ ] Documentation updated

### Nice to Have

- [ ] Performance metrics dashboard
- [ ] Greeting preview command
- [ ] Session state visualization

---

## 🤖 CodeRabbit Integration

### Story Type Analysis

**Primary Type:** Infrastructure/Integration  
**Secondary Type(s):** Architecture, Performance Optimization  
**Complexity:** Medium

### Specialized Agent Assignment

**Primary Agents:**
- @dev: Core implementation, code quality, integration safety
- @architect: Architecture validation, pattern compliance

**Supporting Agents:**
- @qa: Story validation, test coverage verification

### Quality Gate Tasks

- [ ] **Pre-Commit (@dev):** Run before marking story complete
  - Focus: Code quality, error handling, fallback mechanisms
  - Validate: All error paths have fallbacks
  - Check: Performance targets met (<50ms cache, <150ms no cache)
  
- [ ] **Pre-PR (@dev):** Run before creating pull request
  - Focus: Integration safety, backward compatibility
  - Validate: No breaking changes to existing agent activation
  - Check: All 11 agents still activate correctly
  
- [ ] **Pre-Deployment:** N/A (Infrastructure story, no production deployment)

### CodeRabbit Focus Areas

**Primary Focus:**
- **Error Handling:** Try-catch blocks, fallback mechanisms, graceful degradation
- **Performance:** Caching strategies, timeout protection, parallel loading
- **Integration:** Component interaction patterns, context passing, session state management

**Secondary Focus:**
- **Code Quality:** Method naming, documentation, validation logic
- **Backward Compatibility:** Existing agent activation still works, no breaking changes
- **Testing:** Unit test coverage, integration test scenarios, performance benchmarks

**Specific Patterns to Validate:**

1. **Error Handling Pattern:**
   ```javascript
   // All async operations must have try-catch
   try {
     const result = await operation();
     return result;
   } catch (error) {
     console.error('[component] Error:', error.message);
     return fallbackValue;
   }
   ```

2. **Performance Pattern:**
   ```javascript
   // Cache checks before expensive operations
   if (cache.has(key) && !isExpired(cache.get(key))) {
     return cache.get(key).value;
   }
   ```

3. **Integration Pattern:**
   ```javascript
   // Pre-loaded context prevents duplicate loading
   const context = {
     sessionType: preLoadedSessionType || await detectSessionType(),
     projectStatus: preLoadedProjectStatus || await loadProjectStatus()
   };
   ```

---

## 📁 Files Modified

### New Files Created

- `.aios-core/scripts/generate-greeting.js` (Unified greeting generator)
- `.aios-core/scripts/command-execution-hook.js` (Session update hook)
- `.aios-core/docs/session-update-pattern.md` (Documentation)
- `tests/unit/generate-greeting.test.js` (Unit tests)
- `tests/integration/greeting-system-integration.test.js` (Integration tests)

### Files Modified

- `.aios-core/scripts/agent-config-loader.js` (Expanded with `loadAgentDefinition()` and `loadComplete()`)
- `.aios-core/scripts/greeting-builder.js` (Modified to accept pre-loaded context)
- `.aios-core/scripts/config-loader.js` (Deprecated warning added)
- `.aios-core/agents/qa.md` (Pilot - STEP 3 updated first)
- `.aios-core/agents/*.md` (Remaining 10 agents - STEP 3 updated after QA validation)

### Files Deleted

- `.aios-core/scripts/batch-integrate-greeting-builder.js` (Temporary migration script)
- `.aios-core/scripts/apply-inline-greeting-all-agents.js` (Temporary migration script)
- `.aios-core/scripts/update-activation-instructions.js` (Temporary migration script)
- `.aios-core/scripts/batch-update-agents-session-context.js` (Temporary migration script)

### Files Referenced (No Changes)

- `.aios-core/scripts/session-context-loader.js` (Used by generate-greeting.js)
- `.aios-core/scripts/project-status-loader.js` (Used by generate-greeting.js)
- `.aios-core/scripts/greeting-preference-manager.js` (Used by greeting-builder.js)
- `.aios-core/scripts/context-detector.js` (Used by greeting-builder.js)
- `.aios-core/scripts/workflow-navigator.js` (Used by greeting-builder.js)

---

## 💰 Investment Breakdown

- **Phase 1: Script Consolidation:** 4.5 hours @ $12.50/hr = $56.25
- **Phase 2: Modify GreetingBuilder:** 2 hours @ $12.50/hr = $25.00
- **Phase 3: Create Unified Generator:** 2 hours @ $12.50/hr = $25.00
- **Phase 4: Update Agents (Incremental):** 3.5 hours @ $12.50/hr = $43.75
  - Task 4.1: Update QA pilot (1h)
  - Task 4.2: Test QA thoroughly (1h)
  - Task 4.3: Apply to remaining 10 agents (1.5h)
- **Phase 5: Session State Updates:** 2 hours @ $12.50/hr = $25.00
- **Phase 6: Testing & Validation:** 4 hours @ $12.50/hr = $50.00
- **Buffer (10%):** 2.05 hours @ $12.50/hr = $25.63

**Total:** 20.5 hours = $256.25

---

## 🎯 Success Metrics

- **Integration:** All components work together seamlessly
- **Performance:** <50ms (cache), <150ms (no cache), <10ms (fallback)
- **Compatibility:** 100% backward compatible
- **Test Coverage:** ≥80% for new code
- **Code Quality:** No duplicate scripts, clean architecture
- **User Experience:** Consistent, fast, contextually relevant greetings

---

## ⚠️ Risks & Mitigation

### Risk 1: Agent definition loading fails
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** 
  - Validation and normalization
  - Fallback to simple greeting
  - Error logging

### Risk 2: Performance degradation
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Cache agent definitions (5 min)
  - Parallel loading
  - Timeout protection (150ms)
  - Performance logging

### Risk 3: Breaking existing functionality
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - Backward compatible changes
  - Fallback mechanisms
  - Comprehensive testing
  - Gradual rollout

---

## 📝 Implementation Notes

### Critical Implementation Details

1. **Agent Definition Loading:**
   - Use expanded `agent-config-loader.js` (don't create new loader)
   - Cache definitions for 5 minutes
   - Validate and normalize structure

2. **Context Pre-loading:**
   - Load session context and project status in parallel
   - Pass pre-loaded values to `GreetingBuilder`
   - Avoid duplicate loading

3. **Error Handling:**
   - Fallback to simple greeting on any error
   - Log errors with context
   - Don't break agent activation

4. **Performance:**
   - Parallel loading where possible
   - Cache everything that can be cached
   - Timeout protection (150ms)

### Testing Strategy

1. **Unit Tests:**
   - Test `loadAgentDefinition()` method
   - Test `loadComplete()` method
   - Test `generateGreeting()` function
   - Test error handling

2. **Integration Tests:**
   - Test full greeting generation flow
   - Test with different session types
   - Test with different preferences
   - Test error scenarios

3. **Manual Testing:**
   - Activate each agent
   - Verify greeting output
   - Test fallback scenarios
   - Verify performance

---

## 🔗 Related Documents

- **Epic:** [Epic-6.1](../epics/epic-6.1.md)
- **Prerequisites:** 
  - Story 6.1.1 - Agent Persona Definitions ✅
  - Story 6.1.2.4 - Project Status Context ✅
  - Story 6.1.2.5 - Contextual Agent Load Integration ✅
  - Story 6.1.2.6 - Framework Configuration System ✅
  - Story 6.1.4 (Original) - Greeting Preferences ✅
- **Analysis Documents:**
  - `docs/qa/comprehensive-greeting-system-analysis.md`
  - `docs/architecture/scripts-consolidation-analysis.md`
  - `docs/architecture/technical-review-greeting-system-unification.md`

---

## 📋 Example Usage

### After Implementation

**User activates agent:**
```bash
/AIOS/agents/qa
```

**Agent STEP 3 executes:**
```bash
node .aios-core/scripts/generate-greeting.js qa
```

**Output:**
```
✅ Quinn (Guardian) ready. Let's ensure quality!

**Role:** Test Architect & Quality Advisor

📊 **Project Status:**
  - 🌿 **Branch:** main
  - 📝 **Modified:** 135 files
  - 📖 **Recent:** feat(story-6.1.6): complete QA review

**Available Commands:**
   - `*analyze-framework`: Comprehensive framework analysis
   - `*validate-story`: Validate story quality
   ...
```

**If execution fails:**
```
✅ qa Agent ready

Type *help to see available commands.
```

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-17 | 4.1 | Added CodeRabbit Integration section, clarified migration scripts deletion process, verified test directory structure | Pax (po) |
| 2025-01-17 | 4.0 | Expanded to unified system integration, integrated all analyses, added script consolidation, added session updates | Pax (po) + Aria (architect) |
| 2025-01-16 | 3.0 | Validation improvements, integration tests added | Pax (po) |
| 2025-01-15 | 2.0 | Major rewrite to integrate with Story 6.1.2.5 | Quinn (qa) |
| 2025-01-14 | 1.0 | Initial story creation | Unknown |

---

**Status:** 📋 Ready to Start  
**Next Steps:** Begin Phase 1 - Script Consolidation  
**Estimated Completion:** 2.5 days

---

## 🎯 Implementation Strategy: QA Pilot First

**Rationale:** Use QA agent as pilot to validate system before applying to all agents. This prevents wasting time and tokens on agents that may have issues.

**Approach:**
1. ✅ Implement all infrastructure (Phases 1-3)
2. ✅ Update only QA agent first (Phase 4.1)
3. ✅ Test QA agent thoroughly (Phase 4.2)
4. ✅ Fix any issues found
5. ✅ Apply to remaining 10 agents only after QA validated (Phase 4.3)

**Benefits:**
- 🎯 Catch issues early with single agent
- 🎯 Validate approach before scaling
- 🎯 Save time and tokens
- 🎯 Build confidence before full rollout

**QA Agent Selection:**
- ✅ Well-defined persona and commands
- ✅ Used frequently (good for testing)
- ✅ Representative of other agents
- ✅ Easy to validate output quality

