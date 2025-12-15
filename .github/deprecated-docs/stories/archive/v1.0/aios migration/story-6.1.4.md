# Story 6.1.4: Greeting Preference Configuration System (v2)

**Story ID:** 6.1.4
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex)
**Created:** 2025-01-14
**Updated:** 2025-01-15 (v2 - Aligned with Story 6.1.2.5)
**Duration:** 1.5 days
**Investment:** $150

---

## 📋 Objective

Implement user-configurable greeting preferences that allow overriding the automatic session-aware greeting system from Story 6.1.2.5, giving users control over agent personification level.

---

## 🎯 Scope

**In Scope:**
- Extend `GreetingBuilder` with preference support (auto/minimal/named/archetypal)
- Add `greeting.preference` configuration to `core-config.yaml`
- Create CLI commands for preference management
- Maintain backward compatibility with Story 6.1.2.5 session detection

**Out of Scope:**
- ❌ Reimplementing greeting generation (already done in Story 6.1.2.5)
- ❌ Changing agent activation flow
- ❌ Locale/i18n implementation (future story)

---

## 📖 Story

**As a** AIOS framework user,
**I want** to configure my preferred agent greeting level,
**so that** I can override automatic session detection and always see greetings at my preferred personification level.

**Business Value:** Provides user control while maintaining the intelligent defaults from Story 6.1.2.5. Users who prefer consistent greetings can set a fixed preference, while users who want context-aware greetings use "auto" mode.

---

## 🔗 Context: Relationship with Story 6.1.2.5

**Story 6.1.2.5 (Already Implemented):**
- ✅ `GreetingBuilder` class with session-aware logic
- ✅ Detects session type: new/existing/workflow
- ✅ Uses `persona_profile.greeting_levels` from agents
- ✅ Dynamic greeting assembly based on context

**This Story (6.1.4) Adds:**
- User preference configuration
- Override mechanism for session detection
- CLI commands for preference management
- Extends (not replaces) Story 6.1.2.5

**Design Decision (User Approved):**
- **Preference Behavior:** Override complete (Decisão 1 - Opção A)
  - If preference = "minimal" → Always minimal, ignore session
  - If preference = "auto" → Use session detection from Story 6.1.2.5
- **Default Preference:** "auto" (Decisão 2 - Opção A)
  - Preserves intelligent session-aware behavior
  - Users opt-in to fixed levels if desired

---

## 📊 Tasks Breakdown

### Day 1: Configuration & Preference System (8 hours)

**Task 1.1: Extend core-config.yaml (1 hour)**

Update `.aios-core/core-config.yaml` with greeting preference field:

```yaml
agentIdentity:
  greeting:
    # Story 6.1.2.5 settings (preserve)
    contextDetection: true
    sessionDetection: hybrid
    workflowDetection: hardcoded
    performance:
      gitCheckCache: true
      gitCheckTTL: 300

    # Story 6.1.4 settings (NEW)
    preference: auto  # Options: auto, minimal, named, archetypal
    locale: en-US     # Reserved for future i18n (Story 7.x)
    showArchetype: true  # Toggle archetype in archetypal level

git:
  showConfigWarning: true
  cacheTimeSeconds: 300
```

**Validation:**
- Ensure YAML syntax valid
- Default values appropriate
- Comments explain each option

---

**Task 1.2: Create Configuration Manager (3 hours)**

Create `.aios-core/scripts/greeting-preference-manager.js`:

```javascript
/**
 * Greeting Preference Configuration Manager
 *
 * Manages user preferences for agent greeting personification levels.
 * Integrates with GreetingBuilder (Story 6.1.2.5).
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_PATH = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
const VALID_PREFERENCES = ['auto', 'minimal', 'named', 'archetypal'];

class GreetingPreferenceManager {
  /**
   * Get current greeting preference
   * @returns {string} Current preference (auto|minimal|named|archetypal)
   */
  getPreference() {
    try {
      const config = this._loadConfig();
      return config?.agentIdentity?.greeting?.preference || 'auto';
    } catch (error) {
      console.warn('[GreetingPreference] Failed to load, using default:', error.message);
      return 'auto';
    }
  }

  /**
   * Set greeting preference
   * @param {string} preference - New preference (auto|minimal|named|archetypal)
   * @throws {Error} If preference is invalid
   */
  setPreference(preference) {
    // Validate preference
    if (!VALID_PREFERENCES.includes(preference)) {
      throw new Error(`Invalid preference: ${preference}. Valid options: ${VALID_PREFERENCES.join(', ')}`);
    }

    try {
      const config = this._loadConfig();

      // Ensure structure exists
      if (!config.agentIdentity) config.agentIdentity = {};
      if (!config.agentIdentity.greeting) config.agentIdentity.greeting = {};

      // Set preference
      config.agentIdentity.greeting.preference = preference;

      // Write back
      this._saveConfig(config);

      return { success: true, preference };
    } catch (error) {
      throw new Error(`Failed to set preference: ${error.message}`);
    }
  }

  /**
   * Get all greeting configuration
   * @returns {Object} Complete greeting config
   */
  getConfig() {
    const config = this._loadConfig();
    return config?.agentIdentity?.greeting || {};
  }

  /**
   * Load config from YAML
   * @private
   */
  _loadConfig() {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return yaml.load(content);
  }

  /**
   * Save config to YAML
   * @private
   */
  _saveConfig(config) {
    const content = yaml.dump(config, { lineWidth: -1 });
    fs.writeFileSync(CONFIG_PATH, content, 'utf8');
  }
}

module.exports = GreetingPreferenceManager;
```

---

**Task 1.3: Extend GreetingBuilder with Preference Support (4 hours)**

Update `.aios-core/scripts/greeting-builder.js`:

```javascript
// Add to existing GreetingBuilder class

const GreetingPreferenceManager = require('./greeting-preference-manager');

class GreetingBuilder {
  constructor() {
    this.contextDetector = new ContextDetector();
    this.gitConfigDetector = new GitConfigDetector();
    this.workflowNavigator = new WorkflowNavigator();
    this.preferenceManager = new GreetingPreferenceManager(); // NEW
    this.config = this._loadConfig();
  }

  /**
   * Build greeting for agent (UPDATED)
   * @param {Object} agent - Agent definition
   * @param {Object} context - Session context
   * @returns {Promise<string>} Formatted greeting
   */
  async buildGreeting(agent, context = {}) {
    const fallbackGreeting = this.buildSimpleGreeting(agent);

    try {
      // NEW: Check user preference
      const preference = this.preferenceManager.getPreference();

      if (preference !== 'auto') {
        // Override with fixed level
        return this.buildFixedLevelGreeting(agent, preference);
      }

      // Use session-aware logic (Story 6.1.2.5)
      const greetingPromise = this._buildContextualGreeting(agent, context);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Greeting timeout')), GREETING_TIMEOUT)
      );

      return await Promise.race([greetingPromise, timeoutPromise]);
    } catch (error) {
      console.warn('[GreetingBuilder] Fallback to simple greeting:', error.message);
      return fallbackGreeting;
    }
  }

  /**
   * Build fixed-level greeting (NEW)
   * @param {Object} agent - Agent definition
   * @param {string} level - Preference level (minimal|named|archetypal)
   * @returns {string} Fixed-level greeting
   */
  buildFixedLevelGreeting(agent, level) {
    const profile = agent.persona_profile;

    if (!profile || !profile.greeting_levels) {
      return this.buildSimpleGreeting(agent);
    }

    // Select greeting based on preference
    let greetingText;
    switch (level) {
      case 'minimal':
        greetingText = profile.greeting_levels.minimal || `${agent.icon} ${agent.id} Agent ready`;
        break;
      case 'named':
        greetingText = profile.greeting_levels.named || `${agent.icon} ${agent.name} ready`;
        break;
      case 'archetypal':
        greetingText = profile.greeting_levels.archetypal || `${agent.icon} ${agent.name} the ${profile.archetype} ready`;
        break;
      default:
        greetingText = profile.greeting_levels.named || `${agent.icon} ${agent.name} ready`;
    }

    return `${greetingText}\n\nType \`*help\` to see available commands.`;
  }

  // ... existing methods remain unchanged ...
}
```

---

### Day 2: CLI Commands & Testing (4 hours)

**Task 2.1: Create CLI Commands (2 hours)**

Update `.aios-core/scripts/cli.js` with new commands:

```javascript
// Add to existing CLI command handlers

/**
 * Get greeting preference
 * Usage: aios config get greeting
 */
async function getGreetingConfig() {
  const manager = new GreetingPreferenceManager();
  const config = manager.getConfig();

  console.log('📊 Agent Greeting Configuration\n');
  console.log(`Preference: ${config.preference || 'auto'} (auto|minimal|named|archetypal)`);
  console.log(`Context Detection: ${config.contextDetection !== false ? 'enabled' : 'disabled'}`);
  console.log(`Session Detection: ${config.sessionDetection || 'hybrid'}`);
  console.log(`Workflow Detection: ${config.workflowDetection || 'hardcoded'}`);
  console.log(`Show Archetype: ${config.showArchetype !== false ? 'yes' : 'no'}`);
  console.log(`Locale: ${config.locale || 'en-US'}`);

  return config;
}

/**
 * Set greeting preference
 * Usage: aios config set greeting.preference <auto|minimal|named|archetypal>
 */
async function setGreetingPreference(preference) {
  const manager = new GreetingPreferenceManager();

  try {
    const result = manager.setPreference(preference);
    console.log(`✅ Greeting preference set to: ${result.preference}`);

    if (preference === 'auto') {
      console.log('\n📌 Using automatic session-aware greetings:');
      console.log('  - New session → Full greeting (archetypal level)');
      console.log('  - Existing session → Quick greeting (named level)');
      console.log('  - Workflow session → Minimal greeting + suggestions');
    } else {
      console.log(`\n📌 Using fixed level: ${preference} for all sessions`);
    }

    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

// Register commands
cli.command('config get greeting')
  .description('Show current greeting configuration')
  .action(getGreetingConfig);

cli.command('config set greeting.preference <value>')
  .description('Set greeting preference (auto|minimal|named|archetypal)')
  .action(setGreetingPreference);
```

---

**Task 2.2: Create Unit Tests (2 hours)**

Create `tests/unit/greeting-preference.test.js`:

```javascript
/**
 * Unit Tests for Greeting Preference System
 */

const GreetingPreferenceManager = require('../../.aios-core/scripts/greeting-preference-manager');
const GreetingBuilder = require('../../.aios-core/scripts/greeting-builder');

describe('GreetingPreferenceManager', () => {
  let manager;

  beforeEach(() => {
    manager = new GreetingPreferenceManager();
  });

  describe('getPreference', () => {
    test('returns default "auto" if not configured', () => {
      const preference = manager.getPreference();
      expect(['auto', 'minimal', 'named', 'archetypal']).toContain(preference);
    });
  });

  describe('setPreference', () => {
    test('sets valid preference successfully', () => {
      const result = manager.setPreference('minimal');
      expect(result.success).toBe(true);
      expect(result.preference).toBe('minimal');
    });

    test('throws error for invalid preference', () => {
      expect(() => manager.setPreference('invalid')).toThrow('Invalid preference');
    });

    test('accepts all valid preferences', () => {
      expect(() => manager.setPreference('auto')).not.toThrow();
      expect(() => manager.setPreference('minimal')).not.toThrow();
      expect(() => manager.setPreference('named')).not.toThrow();
      expect(() => manager.setPreference('archetypal')).not.toThrow();
    });
  });
});

describe('GreetingBuilder with Preferences', () => {
  let builder;
  let mockAgent;

  beforeEach(() => {
    builder = new GreetingBuilder();
    mockAgent = {
      name: 'Dex',
      id: 'dev',
      icon: '💻',
      persona_profile: {
        archetype: 'Builder',
        greeting_levels: {
          minimal: '💻 dev Agent ready',
          named: '💻 Dex (Builder) ready',
          archetypal: '💻 Dex the Builder ready to innovate!'
        }
      }
    };
  });

  describe('buildFixedLevelGreeting', () => {
    test('builds minimal greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'minimal');
      expect(greeting).toContain('💻 dev Agent ready');
    });

    test('builds named greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'named');
      expect(greeting).toContain('💻 Dex (Builder) ready');
    });

    test('builds archetypal greeting', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'archetypal');
      expect(greeting).toContain('💻 Dex the Builder ready to innovate!');
    });

    test('includes help command hint', () => {
      const greeting = builder.buildFixedLevelGreeting(mockAgent, 'named');
      expect(greeting).toContain('*help');
    });
  });

  describe('buildGreeting with preference override', () => {
    test('uses fixed level when preference set', async () => {
      // Mock preferenceManager to return 'minimal'
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('minimal');

      const greeting = await builder.buildGreeting(mockAgent, {});
      expect(greeting).toContain('dev Agent ready');
    });

    test('uses session detection when preference is "auto"', async () => {
      builder.preferenceManager.getPreference = jest.fn().mockReturnValue('auto');

      const greeting = await builder.buildGreeting(mockAgent, { conversationHistory: [] });
      expect(greeting).toBeTruthy(); // Should use contextual logic
    });
  });
});
```

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Configuration field `agentIdentity.greeting.preference` exists in core-config.yaml
- [ ] GreetingPreferenceManager validates preference values (auto|minimal|named|archetypal)
- [ ] GreetingBuilder.buildGreeting() respects preference when not "auto"
- [ ] GreetingBuilder uses session detection when preference = "auto" (default)
- [ ] CLI command `aios config get greeting` shows current configuration
- [ ] CLI command `aios config set greeting.preference <value>` updates configuration
- [ ] User can change preference without restarting AIOS
- [ ] Default preference is "auto" (preserves Story 6.1.2.5 behavior)
- [ ] Unit tests pass: 15+ test cases covering all preferences

### Should Have
- [ ] Config validation prevents typos (helpful error messages)
- [ ] CLI shows helpful examples when setting preference
- [ ] Backwards compatible: agents without greeting_levels fall back gracefully

### Nice to Have
- [ ] Preview greeting with: `aios config preview greeting <preference>`
- [ ] Preference history tracking

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.2.5:** Contextual Agent Load System (GreetingBuilder must exist) ✅ DONE

### Dependent Stories (This Blocks)
- **Story 6.1.5:** Testing & Validation

---

## 📁 Files Modified

### New Files Created
- `.aios-core/scripts/greeting-preference-manager.js` (Preference configuration logic)
- `tests/unit/greeting-preference.test.js` (Unit tests)

### Files Modified
- `.aios-core/core-config.yaml` (Add greeting.preference field)
- `.aios-core/scripts/greeting-builder.js` (Add preference support)
- `.aios-core/scripts/cli.js` (Add CLI commands)

### Files Referenced (No Changes)
- `.aios-core/agents/*.md` (Read persona_profile.greeting_levels)

---

## 🎨 Deliverables

### 1. Greeting Preference Manager
**Location:** `.aios-core/scripts/greeting-preference-manager.js`

**Key Functions:**
- `getPreference()` - Get current preference
- `setPreference(value)` - Set new preference with validation
- `getConfig()` - Get complete greeting config

### 2. Extended Greeting Builder
**Location:** `.aios-core/scripts/greeting-builder.js`

**New Method:**
- `buildFixedLevelGreeting(agent, level)` - Generate greeting at specific level

**Updated Method:**
- `buildGreeting(agent, context)` - Check preference before using session detection

### 3. CLI Commands
**Location:** `.aios-core/scripts/cli.js`

**Commands:**
```bash
aios config get greeting                        # Show current config
aios config set greeting.preference auto        # Use session detection
aios config set greeting.preference minimal     # Always minimal
aios config set greeting.preference named       # Always named
aios config set greeting.preference archetypal  # Always archetypal
```

---

## 💰 Investment Breakdown

- Configuration & Manager: 4 hours @ $12.50/hr = $50
- GreetingBuilder extension: 4 hours @ $12.50/hr = $50
- CLI commands & tests: 4 hours @ $12.50/hr = $50
- **Total:** 12 hours = $150

**Savings vs Original Plan:**
- Original estimate: 16 hours / $200
- New estimate: 12 hours / $150
- **Savings:** 4 hours / $50 (25% reduction due to reuse of Story 6.1.2.5)

---

## 🎯 Success Metrics

- **Configuration Coverage:** All preference values work correctly (4 options)
- **Backwards Compatibility:** 100% compatible with Story 6.1.2.5
- **CLI Usability:** Commands work without errors, helpful messages
- **Test Coverage:** ≥80% for new code

---

## ⚠️ Risks & Mitigation

### Risk 1: Preference conflicts with session detection
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Clear separation - preference "auto" delegates to session detection, other values override completely

### Risk 2: Config file corruption
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** YAML validation before write, graceful fallback to "auto" on read error

---

## 📝 Notes

### Design Decisions

**Approved by User (2025-01-15):**
1. **Preference Behavior:** Override complete (Opção A)
   - Fixed preference ignores session detection entirely
   - Clear, predictable behavior for users

2. **Default Preference:** "auto" (Opção A)
   - Preserves intelligent session-aware behavior from Story 6.1.2.5
   - Users who want fixed levels opt-in explicitly

### Why This Approach?

**Benefits:**
- ✅ Reuses proven GreetingBuilder from Story 6.1.2.5
- ✅ Simpler implementation (extend vs rebuild)
- ✅ Maintains session-aware benefits by default
- ✅ Gives users control when they want it
- ✅ 25% cost reduction ($200 → $150)
- ✅ 25% time reduction (2 days → 1.5 days)

**Comparison with Original Plan:**

| Aspect | Original Story 6.1.4 | Updated Story 6.1.4 v2 |
|--------|---------------------|------------------------|
| Approach | Rebuild greeting system | Extend existing system |
| Default | Level 2 (named) | auto (session-aware) |
| Compatibility | Conflicts with 6.1.2.5 | Integrates with 6.1.2.5 |
| Duration | 2 days | 1.5 days ✅ |
| Cost | $200 | $150 ✅ |
| Risk | High (duplicate code) | Low (reuse proven code) ✅ |

---

## 🔗 Related Documents

- **Epic:** [Epic-6.1](../epics/epic-6.1.md)
- **Prerequisite:** [Story 6.1.2.5 - Contextual Agent Load System](story-6.1.2.5-contextual-agent-load-system.md)
- **Analysis:** [Story Dependency Analysis](../../analysis/story-dependency-analysis-6.1.4-and-6.1.6.md)

---

## 📋 Example Usage

### User Wants Consistent Minimal Greetings

```bash
# Set preference to minimal
$ aios config set greeting.preference minimal
✅ Greeting preference set to: minimal

📌 Using fixed level: minimal for all sessions

# Now all agent activations show minimal greeting
$ @dev
💻 dev Agent ready

Type `*help` to see available commands.
```

### User Wants Automatic Session-Aware Greetings (Default)

```bash
# Check current preference
$ aios config get greeting
📊 Agent Greeting Configuration

Preference: auto (auto|minimal|named|archetypal)
Context Detection: enabled
Session Detection: hybrid
Workflow Detection: hardcoded
Show Archetype: yes
Locale: en-US

# auto = uses Story 6.1.2.5 session detection
# New session → archetypal
# Existing session → named
# Workflow session → minimal + suggestions
```

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-15 | 2.0 | Major rewrite to integrate with Story 6.1.2.5, user decisions approved (Decisões 1-2: Opção A) | Quinn (qa) |
| 2025-01-14 | 1.0 | Initial story creation (before Story 6.1.2.5 was implemented) | Unknown |

---

**Last Updated:** 2025-01-15 (v2)
**Previous Story:** [Story 6.1.2.5 - Contextual Agent Load System](story-6.1.2.5-contextual-agent-load-system.md)
**Next Story:** Story 6.1.5 - Testing & Validation
**Next Review:** After completion
