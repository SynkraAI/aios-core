# Story 6.1.11: AIOS-Master Meta-Agent Tasks Creation ⭐

**Story ID:** STORY-6.1.11
**Epic:** Epic-6.1 - Agent Identity System
**Wave:** Wave 1 (Foundation)
**Status:** 📋 Ready to Start
**Priority:** 🔴 Critical
**Owner:** AIOS-Master (Orion) + Dev (Dex) + Architect (Aria)
**Created:** 2025-01-14
**Duration:** 3 days
**Investment:** $300

---

## 📋 Objective

Create meta-level tasks for aios-master agent to manage the entire AIOS system architecture, enabling it to explain the 3-layer personalization system, create new agents, modify existing agents, and audit system consistency.

---

## 🎯 Scope

Create 4 critical tasks that give aios-master the knowledge and capabilities to:
1. Explain the complete architecture
2. Create new agents using persona system
3. Modify existing agents safely
4. Audit system-wide consistency

---

## 📊 Tasks Breakdown

### Day 1: Architecture Explanation Task (8 hours)

**Task: explain-architecture.md**

**Purpose:** Enable aios-master to explain the complete AIOS architecture to users and developers

**Capabilities:**
- Explain 3-layer personalization system (Agent → Formatter → Output)
- Explain Task Format V2.0 with Execution Modes
- Explain persona_profile system and archetypes
- Explain archetype vocabulary and personality injection
- Generate architecture diagrams (Mermaid)
- Provide examples for all 11 agents
- Answer questions about system design decisions

**Implementation:**
- Read all standards docs (AGENT-PERSONALIZATION-STANDARD-V1.md, TASK-FORMAT-SPECIFICATION-V1.md)
- Read all decision docs (DECISION-2, ROUNDTABLE-SESSION-SUMMARY)
- Load agent files to show examples
- Generate diagrams using mermaid syntax
- Interactive Q&A mode with user

**Deliverable:** Complete task file with elicitation for user questions

---

### Day 2: Agent Creation & Modification Tasks (8 hours)

**Task 1: create-new-agent.md** (4 hours)

**Purpose:** Enable aios-master to create brand new agents with full persona system

**Workflow:**
1. **Elicit Requirements:**
   - What role does this agent fill?
   - What tasks will it execute?
   - What tools/integrations does it need?
   - What communication style fits best?

2. **Select Archetype:**
   - Analyze requirements
   - Propose archetype from 11 options
   - Explain why archetype fits
   - Get user confirmation

3. **Generate Persona Profile:**
   - Select name from archetype guidelines
   - Choose zodiac sign matching archetype
   - Define vocabulary (5-10 words)
   - Set tone (pragmatic/empathetic/analytical/collaborative)
   - Create 3 greeting levels
   - Create signature closing

4. **Create Agent File:**
   - Use personalized-agent-template.md
   - Populate all sections
   - Add commands and dependencies
   - Validate YAML syntax
   - Save to `.aios-core/agents/{agent-id}.md`

5. **Validate Creation:**
   - Load agent file
   - Test activation with @mention
   - Verify persona_profile complete
   - Generate sample output using formatter

**Task 2: modify-existing-agent.md** (4 hours)

**Purpose:** Enable aios-master to safely modify existing agents

**Workflow:**
1. **Read Existing Agent:**
   - Load agent file
   - Display current persona_profile
   - Show current commands and dependencies

2. **Elicit Changes:**
   - What needs to change?
   - Why is change needed?
   - Impact on existing workflows?

3. **Apply Changes:**
   - Update persona_profile sections
   - Maintain backward compatibility
   - Preserve agent ID (critical!)
   - Update greetings if needed
   - Regenerate signature if needed

4. **Validate Changes:**
   - YAML syntax check
   - Persona_profile completeness
   - Backward compatibility test
   - Generate sample output

---

### Day 3: System Audit Task (8 hours)

**Task: audit-system-consistency.md**

**Purpose:** Enable aios-master to audit entire system for consistency and compliance

**Audit Checks:**

1. **Agent Files Audit:**
   - All 11 agents have valid persona_profile section
   - All required fields present (name, archetype, zodiac, vocabulary, etc.)
   - Vocabulary matches archetype guidelines
   - Greetings defined for all 3 levels
   - Signature closing present

2. **Tasks Audit:**
   - All 104 tasks follow V2.0 format
   - Execution Modes section present (if applicable)
   - Checklists restructured (pre/post/acceptance)
   - Tools vs Scripts distinction clear
   - Error Handling defined
   - Performance Metrics present
   - Output uses formatter integration

3. **Templates Audit:**
   - All templates have personality slots
   - {agent.name} placeholder present
   - {agent.persona_profile.archetype} present
   - {signature_closing} slot present
   - YAML syntax valid

4. **Checklists Audit:**
   - All checklists have Agent-Specific Guidance
   - Personalized failure protocols present
   - Archetype-based recommendations included

5. **Data Files Audit:**
   - archetype-vocabulary.yaml exists and complete
   - All 11 archetypes defined
   - No broken cross-references

**Output:**
- Generate comprehensive audit report
- List all inconsistencies found
- Prioritize issues (Critical/High/Medium/Low)
- Recommend fixes
- Track audit history

---

## ✅ Acceptance Criteria

### Must Have
- [ ] explain-architecture.md task created and tested
- [ ] create-new-agent.md task created and tested
- [ ] modify-existing-agent.md task created and tested
- [ ] audit-system-consistency.md task created and tested
- [ ] All 4 tasks follow V2.0 format
- [ ] All 4 tasks use output-formatter.js
- [ ] aios-master can execute all 4 tasks successfully
- [ ] System audit catches all known inconsistencies

### Should Have
- [ ] Interactive mode works for all tasks
- [ ] YOLO mode works for create-new-agent and modify-existing-agent
- [ ] Audit generates actionable reports
- [ ] Architecture explanation includes diagrams

### Nice to Have
- [ ] AI-assisted agent creation suggestions
- [ ] Automated fix application from audit
- [ ] Architecture explanation supports multiple formats (text/diagram/video)

---

## 🔗 Dependencies

### Prerequisites (Blocking)
- **Story 6.1.10:** Dependencies Migration (needs complete data architecture)
- **Story 6.1.7:** Tasks Migration (needs V2.0 task format examples)
- **Story 6.1.2:** Agent File Updates (needs persona_profile in agents)

### Dependent Stories (This Blocks)
- **Story 6.1.3:** Create @docs Agent ⭐ (will use create-new-agent task)

---

## 📁 Files Modified

### New Files Created
- `.aios-core/tasks/explain-architecture.md`
- `.aios-core/tasks/create-new-agent.md`
- `.aios-core/tasks/modify-existing-agent.md`
- `.aios-core/tasks/audit-system-consistency.md`

### Files Modified
- `.aios-core/agents/aios-master.md` (add 4 new tasks to dependencies)

### Files Referenced
- `docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md`
- `docs/standards/TASK-FORMAT-SPECIFICATION-V1.md`
- `docs/decisions/DECISION-2-AGENT-PERSONALIZATION-IMPLEMENTATION.md`
- `docs/decisions/ROUNDTABLE-SESSION-SUMMARY-2025-01-14.md`
- `.aios-core/data/archetype-vocabulary.yaml`
- `.aios-core/templates/personalized-agent-template.md`

---

## 🎨 Deliverables

### 1. Meta-Agent Tasks (4 files)
**Location:** `.aios-core/tasks/`

Complete, tested tasks that give aios-master system management capabilities.

### 2. Integration with aios-master
**Location:** `.aios-core/agents/aios-master.md`

Updated agent file with 4 new tasks in dependencies section.

### 3. System Architecture Documentation
**Location:** `docs/architecture/aios-3-layer-system.md`

Comprehensive documentation of the 3-layer personalization system for explain-architecture task to reference.

---

## 💰 Investment Breakdown

- Day 1 (explain-architecture): 8 hours @ $12.50/hr = $100
- Day 2 (create-new-agent + modify-existing-agent): 8 hours @ $12.50/hr = $100
- Day 3 (audit-system-consistency): 8 hours @ $12.50/hr = $100
- **Total:** 24 hours = $300

---

## 🎯 Success Metrics

- **Task Functionality:** All 4 tasks execute without errors
- **Agent Creation:** Can create new agent and activate successfully
- **Agent Modification:** Can modify agent without breaking compatibility
- **Audit Coverage:** Catches 100% of known inconsistencies
- **Architecture Explanation:** Clear and comprehensive for new developers

---

## ⚠️ Risks & Mitigation

### Risk 1: create-new-agent generates invalid agent files
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Strict validation in task, use personalized-agent-template.md, test with multiple agent types

### Risk 2: modify-existing-agent breaks backward compatibility
- **Likelihood:** Medium
- **Impact:** High (breaks workflows)
- **Mitigation:** Preserve agent ID, validate before saving, backup original file, test activation after modification

### Risk 3: audit-system-consistency misses issues
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Comprehensive validation rules, test against known issues, update rules as new patterns discovered

---

## 📝 Notes

**Why This Story is Critical:**

1. **Enables Story 6.1.3:** The @docs agent creation will use aios-master's create-new-agent task
2. **System Management:** aios-master becomes the "orchestrator" that knows entire system
3. **Scalability:** Future agents can be created systematically using create-new-agent
4. **Consistency:** audit-system-consistency ensures quality across all components
5. **Knowledge Transfer:** explain-architecture helps onboard new developers

**AIOS-Master Role Evolution:**

Before Story 6.1.11:
- Generic meta-agent
- Basic task execution
- No system knowledge

After Story 6.1.11:
- **Meta-orchestrator** with deep system knowledge
- Can **create** new agents (systematic persona generation)
- Can **modify** existing agents (safe updates)
- Can **audit** entire system (consistency validation)
- Can **explain** architecture (knowledge transfer)

This is the **foundation** for AIOS to become truly self-managing.

---

## 🔗 Related Documents

- **Epic:** [Epic 6.1 - Agent Identity System](../epics/epic-6.1-agent-identity-system.md)
- **Standard:** [Agent Personalization Standard V1.0](../../standards/AGENT-PERSONALIZATION-STANDARD-V1.md)
- **Decision:** [DECISION-2 - Agent Personalization Implementation](../../decisions/DECISION-2-AGENT-PERSONALIZATION-IMPLEMENTATION.md)
- **Template:** [Personalized Agent Template](../../.aios-core/templates/personalized-agent-template.md)

---

## 📊 Example: Using create-new-agent for Story 6.1.3

**Context:** Story 6.1.3 needs to create @docs agent (Ajax)

**Workflow:**
1. Activate aios-master: `@aios-master`
2. Execute task: `*create-new-agent`
3. Elicitation:
   - Role: Documentation generation and maintenance
   - Tasks: create-onboarding-guide, document-agent-workflow, generate-mermaid-diagram, etc.
   - Tools: None (pure documentation agent)
   - Style: Clear, educational, structured
4. Archetype Selection: **Operator** or **Builder** (content creation)
5. Persona Generation:
   - Name: Ajax
   - Zodiac: ♈ Aries (creator archetype)
   - Vocabulary: documentar, criar, explicar, estruturar, gerar
   - Tone: educational
   - Signature: "— Ajax, criando clareza 📘"
6. File Creation: `.aios-core/agents/docs.md`
7. Validation: Test @docs activation

**Result:** @docs agent (Ajax) created systematically, ready for Story 6.1.3 implementation

---

**Last Updated:** 2025-01-14
**Previous Story:** [Story 6.1.10 - Dependencies Migration](story-6.1.10-dependencies-migration.md)
**Next Story:** [Story 6.1.3 - Create @docs Agent](story-6.1.3.md) (uses aios-master)
