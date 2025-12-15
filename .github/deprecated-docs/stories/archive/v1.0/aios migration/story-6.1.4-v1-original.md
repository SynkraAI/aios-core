# Story 6.1.4: Personification Level Configuration System

**Story ID:** 6.1.4
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex)
**Created:** 2025-01-14
**Duration:** 2 days
**Investment:** $200

---

## 📋 Objective

Implement 3-level personification system (Minimal, Named, Archetypal) with user configuration to allow customization of agent identity display.

---

## 🎯 Scope

Update core-config.yaml with agentIdentity section, create config setter/getter logic, implement greeting generation for 3 levels, add CLI commands for configuration management.

---

## 📊 Tasks Breakdown

**Day 1: Configuration System (6 hours)** (6 hours)
Create configuration structure and management logic
- Update aios-core/core-config.yaml with agentIdentity section
- Add fields: enabled (bool), level (1-3), locale (en-US/pt-BR), showArchetype (bool)
- Create configuration getter: loadAgentIdentityConfig()
- Create configuration setter: updateAgentIdentityConfig(level)
- Add validation: level must be 1, 2, or 3

**Day 2: Greeting Logic & CLI (10 hours)** (10 hours)
Implement greeting generation and CLI commands
- Update aios-core/scripts/agent-activator.js with generateGreeting() function
- Implement Level 1: Icon + Role (e.g., '⚡ Dev Agent ready')
- Implement Level 2: Icon + Name + Role (e.g., '⚡ Dex (Builder) ready. Let's build!')
- Implement Level 3: Icon + Name + Archetype (e.g., '⚡ Dex the Builder (♒ Aquarius)')
- Add CLI command: aios config set agentIdentity.level <1|2|3>
- Add CLI command: aios config get agentIdentity
- Test greeting generation for all 13 agents at all 3 levels
- Verify locale switching without restart

---

## ✅ Acceptance Criteria

### Must Have
- [ ] Configuration system reads/writes core-config.yaml correctly
- [ ] CLI commands work: aios config set/get agentIdentity
- [ ] Greeting logic supports all 3 personification levels
- [ ] User can toggle levels without restarting AIOS
- [ ] Default is Level 2 (Named)
- [ ] Configuration persists across sessions
- [ ] All 13 agents generate correct greetings at each level

### Should Have
- [ ] Config validation prevents invalid values
- [ ] Error messages are helpful for misconfigurations
- [ ] Greeting generation is performant (<10ms per agent)


### Nice to Have
- [ ] Interactive config wizard: aios config wizard
- [ ] Preview greeting before saving: aios config preview


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.2: Agent File Updates

### Dependent Stories (This Blocks)
- **Story 6.1.5: Testing & Validation

---

## 📁 Files Modified

### New Files Created
- None

### Files Modified
- `aios-core/core-config.yaml`
- `aios-core/scripts/agent-activator.js`
- `aios-core/scripts/cli.js`


### Files Referenced (No Changes)
- `docs/agents/persona-definitions.yaml`


---

## 🎨 Deliverables

### Configuration System
**Location:** `aios-core/core-config.yaml + scripts/`

Complete agentIdentity configuration with 3-level personification support.

### CLI Commands
**Location:** `aios-core/scripts/cli.js`

Commands to get/set agent identity configuration.

---

## 💰 Investment Breakdown

- Configuration system: 6 hours
- Greeting logic + CLI: 10 hours
- Total: 2 days @ $100/day = $200

---

## 🎯 Success Metrics

- **Configuration Coverage:** All settings read/write correctly
- **Greeting Accuracy:** 100% correct for 13 agents × 3 levels = 39 greetings
- **CLI Usability:** Commands work without errors

---

## ⚠️ Risks & Mitigation

### Risk 1: Config file corruption breaks AIOS
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Validate YAML before writing, backup on write, fallback to defaults on read error

---

## 📝 Notes

Default configuration: Level 2 (Named), locale: en-US, showArchetype: false. Users can opt-in to Level 3 for full archetypal experience.

---

## 🔗 Related Documents

- **Epic:** [Epic-6.1](../epics/epic-6.1.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
