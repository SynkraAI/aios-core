# Story 7.3: Extract English Strings to en-US.yaml

**Story ID:** 7.3
**Epic:** Epic-7 - Core i18n Infrastructure
**Wave:** Wave 2 (Localization)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** Dev (Dex) + Docs (Ajax)
**Created:** 2025-01-14
**Duration:** 3 days
**Investment:** $4,500

---

## 📋 Objective

Create baseline English locale file by extracting all UI strings from AIOS codebase into structured en-US.yaml with 6 categories: agents, commands, errors, success messages, prompts, and CLI output.

---

## 🎯 Scope

Extract and organize all English strings from aios-core/ into en-US.yaml: 13 agent greetings (3 personification levels each = 39 strings), command descriptions (~20), error messages (~50), success messages (~30), interactive prompts (~40), and CLI output (~50). Total: 200+ strings.

---

## 📊 Tasks Breakdown

**Day 1: Agent Greetings & Commands (8 hours)** (8 hours)
Extract agent greetings and command descriptions
- Create aios-core/i18n/en-US.yaml
- Extract agent greetings for all 13 agents (Dex, Quinn, Pax, Morgan, Blair, River, Sage, Aria, Casey, Finley, Rowan, Reese, Ajax)
- 3 personification levels per agent:
- - Level 1: Icon + Role (e.g., 'Dev Agent ready')
- - Level 2: Icon + Name + Role (e.g., 'Dex (Builder) ready. Let's build!')
- - Level 3: Icon + Name + Archetype (e.g., 'Dex the Builder (♒ Aquarius)')
- Total: 13 agents × 3 levels = 39 greeting strings
- Extract command descriptions from CLI:
- *help, *create, *task, *workflow, *exit, etc. (~20 commands)

**Day 2: Errors & Success Messages (8 hours)** (8 hours)
Extract error and success messages from codebase
- Extract error messages from all modules (~50 errors):
- - file_not_found: 'File not found: {path}'
- - invalid_input: 'Invalid input: {details}'
- - task_failed: 'Task failed: {reason}'
- - agent_not_found: 'Agent not found: {agentId}'
- - config_error: 'Configuration error: {details}'
- Extract success messages (~30 messages):
- - task_completed: 'Task completed successfully'
- - file_created: 'File created: {path}'
- - agent_activated: 'Agent {name} activated'
- Add placeholder support for dynamic values: {path}, {name}, {details}, etc.

**Day 3: Interactive Prompts & CLI Output (8 hours)** (8 hours)
Extract prompts and CLI output strings
- Extract interactive prompts from task workflows (~40 prompts):
- - Elicitation questions from brownfield/greenfield tasks
- - Agent command workflows
- - Installation wizard prompts
- Extract CLI output strings (~50 strings):
- - Table headers
- - List formatting
- - Status messages
- - Help text
- Organize en-US.yaml into 6 sections: agents, commands, errors, success, prompts, cli
- Validate YAML syntax and structure
- Total count: 200+ strings extracted and organized

---

## ✅ Acceptance Criteria

### Must Have
- [ ] en-US.yaml created with all 200+ English strings
- [ ] 6 categories organized: agents, commands, errors, success, prompts, cli
- [ ] All 39 agent greetings extracted (13 agents × 3 levels)
- [ ] All ~20 command descriptions extracted
- [ ] All ~50 error messages extracted with placeholders
- [ ] All ~30 success messages extracted
- [ ] All ~40 interactive prompts extracted
- [ ] All ~50 CLI output strings extracted
- [ ] YAML syntax valid and tested

### Should Have
- [ ] Placeholder usage documented ({path}, {name}, etc.)
- [ ] Consistent naming conventions across categories
- [ ] Comments explaining string context


### Nice to Have
- [ ] String extraction automation tool
- [ ] Missing string detection script


---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 7.2: Language Detection Engine

### Dependent Stories (This Blocks)
- **Story 7.4: Rendering Engine Implementation

---

## 📁 Files Modified

### New Files Created
- `aios-core/i18n/en-US.yaml`

### Files Modified
- None


### Files Referenced (No Changes)
- `aios-core/agents/*.yaml`
- `aios-core/scripts/cli.js`
- `aios-core/scripts/agent-activator.js`


---

## 🎨 Deliverables

### English Baseline Locale
**Location:** `aios-core/i18n/en-US.yaml`

Complete English locale file with 200+ strings organized into 6 categories.

---

## 💰 Investment Breakdown

- Day 1 (Agents & Commands): $1,500
- Day 2 (Errors & Success): $1,500
- Day 3 (Prompts & CLI): $1,500
- Total: $4,500

---

## 🎯 Success Metrics

- **String Coverage:** 200+ strings extracted from codebase
- **Agent Greetings:** 39 greetings (13 agents × 3 levels)
- **YAML Validity:** No syntax errors, loads correctly

---

## ⚠️ Risks & Mitigation

### Risk 1: Missing English strings (hardcoded in code)
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Incremental extraction, grep for hardcoded strings, add missing strings in Story 7.5

---

## 📝 Notes

Baseline for Epic 8 PT-BR translation. 200+ strings represents comprehensive UI coverage. Placeholder support enables dynamic content.

---

## 🔗 Related Documents

- **Epic:** [Epic-7](../epics/epic-7.md)

---

**Last Updated:** 2025-01-14
**Previous Story:** N/A
**Next Story:** N/A
**Next Review:** After completion
