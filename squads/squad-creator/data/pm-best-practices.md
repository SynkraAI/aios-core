# PM Best Practices for Squad Creation

> **Source:** Extracted from AIOS PM Agent (Morgan)
> **Purpose:** Guide PRD/Epic creation when squad scope >= 10 workflows
> **Version:** 1.0.0

---

## 1. Core Principles

```yaml
pm_principles:
  - principle: "Deeply understand WHY"
    application: "Uncover root causes - why does this squad need to exist?"

  - principle: "Champion the user"
    application: "Who will use this squad? What value do they get?"

  - principle: "Ruthless prioritization & MVP focus"
    application: "What's the minimum set of agents to deliver value?"

  - principle: "Quality-First Planning"
    application: "Embed quality gates in epic creation from day 1"

  - principle: "Strategic thinking & outcome-oriented"
    application: "What outcomes does the squad enable?"
```

---

## 2. PRD Structure for Squads

When scope triggers PRD requirement (>= 10 workflows), use this structure:

### 2.1 Squad PRD Sections

```yaml
squad_prd_sections:
  1_goals_context:
    goals:
      description: "Bullet list of desired outcomes"
      example:
        - "Enable 1 contador to manage 100+ clients/month"
        - "Automate 70%+ of repetitive workflows"
        - "Reduce error rate in tax calculations to < 1%"

    background:
      description: "1-2 paragraphs on problem being solved"
      questions:
        - "What pain exists today?"
        - "Why can't existing tools solve this?"
        - "What's the opportunity cost of NOT building this?"

    changelog:
      columns: ["Date", "Version", "Description", "Author"]

  2_domain_analysis:
    workflows_mapped:
      description: "Complete list of workflows the squad handles"
      format: "Table with: #, Workflow, Frequency, Complexity, Automatizável"

    workflow_categories:
      description: "Logical groupings of workflows"
      example:
        - "Ciclo de Vida do Cliente (9 workflows)"
        - "Obrigações Mensais MEI (5 workflows)"
        - "Trabalhista (10 workflows)"

  3_elite_minds:
    research_summary:
      description: "Elite minds identified for the domain"
      format: "Table with: Mind, Tier, Frameworks, Domain"

    tier_distribution:
      tier_0: "Diagnosis/Classification"
      tier_1: "Masters with proven results"
      tier_2: "Systematizers/Framework creators"
      tier_3: "Format/Channel specialists"

  4_agent_architecture:
    orchestrator:
      required: true
      purpose: "Coordinates all tiers, routes requests"

    agents_by_tier:
      description: "List of agents per tier with responsibilities"

    handoff_map:
      description: "Who hands off to whom, when, with what context"

  5_epic_list:
    description: "High-level list of epics for implementation"
    rules:
      - "Each epic = cohesive unit of functionality"
      - "Epic 1 = Infrastructure + Orchestrator"
      - "Subsequent epics build on previous"
      - "Cross-cutting concerns flow through, not at end"

  6_epic_details:
    per_epic:
      - epic_goal: "2-3 sentences describing objective"
      - stories: "List of stories with acceptance criteria"
      - agents_created: "Which agents this epic delivers"
      - workflows_covered: "Which workflows this epic enables"
      - quality_gates: "Validation checkpoints"

  7_success_criteria:
    description: "How to measure if squad is successful"
    metrics:
      - "Coverage: X% of workflows automated"
      - "Quality: Agent fidelity scores >= 7.0"
      - "Usability: User can complete Y in Z time"

  8_risks_mitigations:
    per_risk:
      - risk: "Description"
      - impact: "High/Medium/Low"
      - mitigation: "How to address"
      - rollback: "How to undo if needed"
```

---

## 3. Epic Sequencing Rules

### 3.1 Critical Rules

```yaml
epic_sequencing:
  rule_1:
    name: "Foundation First"
    description: "Epic 1 MUST establish infrastructure"
    includes:
      - "Directory structure"
      - "config.yaml"
      - "Orchestrator agent"
      - "Core data files (KB, frameworks)"

  rule_2:
    name: "Tier Progression"
    description: "Build tiers in order: 0 → 1 → 2 → 3"
    rationale: "Each tier depends on previous"

  rule_3:
    name: "Vertical Slices"
    description: "Each epic delivers complete, usable functionality"
    anti_pattern: "Epic that only creates agents without workflows"

  rule_4:
    name: "Cross-Cutting Integration"
    description: "Quality gates, validation flow THROUGH epics"
    anti_pattern: "Adding validation as last epic"
```

### 3.2 Epic Template for Squads

```yaml
epic_template:
  epic_N:
    title: "{Tier/Function} - {Description}"
    goal: "2-3 sentences on what this epic achieves"

    stories:
      - story_N_1:
          title: "Create {agent_name} agent"
          as_a: "Squad user"
          i_want: "{capability}"
          so_that: "{benefit}"
          acceptance_criteria:
            - "Agent file created with >= 300 lines"
            - "voice_dna section complete"
            - "output_examples >= 3"
            - "All dependencies exist"
          predicted_agents: ["@oalanicolas", "@squad-chief"]
          quality_gates:
            - pre_commit: "Agent passes SC_AGT_001"
            - pre_pr: "Integration test passes"

      - story_N_2:
          title: "Implement {workflow_name} workflow"
          # ... similar structure

    agents_created: ["agent-1", "agent-2"]
    workflows_enabled: ["workflow-1", "workflow-2", "workflow-3"]
    definition_of_done:
      - "All stories completed"
      - "Agents pass quality gate"
      - "Workflows functional end-to-end"
      - "Documentation updated"
```

---

## 4. Story Sizing for Squad Creation

```yaml
story_sizing:
  principle: "Size for single AI session execution"

  guidelines:
    agent_creation:
      max_complexity: "1 agent per story"
      exception: "Simple orchestrator can include 1-2 utility agents"

    workflow_creation:
      max_complexity: "1 workflow per story"
      exception: "Related micro-workflows can be grouped"

    task_creation:
      max_complexity: "2-3 related tasks per story"

    data_files:
      max_complexity: "1 major data file per story"
      grouping: "Related KB chunks can be grouped"

  mental_model: |
    "Can a single Claude Code session complete this story
    without context overflow? If not, break it down."
```

---

## 5. Quality Gates in Squad PRD

```yaml
quality_gates_planning:
  per_epic:
    entry_gate:
      description: "What must be true before starting epic"
      example: "Previous epic completed, dependencies exist"

    exit_gate:
      description: "What must be true before epic is done"
      example: "All agents pass quality, workflows functional"

  per_story:
    pre_commit:
      description: "Validation before marking story complete"
      checks:
        - "File syntax valid (YAML/MD)"
        - "Required sections present"
        - "Dependencies exist"
        - "Quality score >= 7.0"

    pre_pr:
      description: "Validation before merging"
      checks:
        - "All stories in epic complete"
        - "Integration test passes"
        - "No orphan references"

  specialist_assignment:
    mind_cloning: "@oalanicolas"
    process_validation: "@pedro-valerio"
    general_orchestration: "@squad-chief"
```

---

## 6. Common Pitfalls in Squad PRDs

```yaml
anti_patterns:
  - name: "Infrastructure Last"
    description: "Creating agents before orchestrator/structure"
    fix: "Epic 1 = Foundation always"

  - name: "Monolithic Epic"
    description: "Single epic with 10+ agents"
    fix: "Break by tier or functional area"

  - name: "No Handoff Map"
    description: "Agents without clear handoff_to definitions"
    fix: "Define handoffs in architecture section"

  - name: "Missing Success Criteria"
    description: "No way to know if squad is complete"
    fix: "Define measurable outcomes upfront"

  - name: "Workflow Coverage Gaps"
    description: "Some mapped workflows not assigned to any agent"
    fix: "Cross-reference workflows → agents matrix"

  - name: "Quality Gates Retrofit"
    description: "Adding validation at the end"
    fix: "Quality gates in every epic from start"
```

---

## 7. PRD Checklist for Squads

Use this checklist before approving squad PRD:

### 7.1 Problem Definition
- [ ] Clear articulation of problem being solved
- [ ] Target user identified
- [ ] Success metrics defined
- [ ] Why existing solutions don't work

### 7.2 Domain Analysis
- [ ] ALL workflows mapped (table format)
- [ ] Workflow categories defined
- [ ] Automation potential assessed per workflow
- [ ] No workflows missing

### 7.3 Elite Minds
- [ ] >= 3 elite minds identified
- [ ] Each mind has documented frameworks
- [ ] Tier distribution covers all needs
- [ ] Sources for each mind noted

### 7.4 Agent Architecture
- [ ] Orchestrator defined
- [ ] Agents assigned to tiers
- [ ] Handoff map complete
- [ ] No orphan agents (all have purpose)

### 7.5 Epic Structure
- [ ] Epic 1 = Foundation + Orchestrator
- [ ] Epics are sequential (no backwards deps)
- [ ] Each epic delivers usable functionality
- [ ] Cross-cutting concerns flow through

### 7.6 Stories
- [ ] Stories sized for single AI session
- [ ] Acceptance criteria testable
- [ ] Quality gates defined per story
- [ ] Specialist assignments predicted

### 7.7 Success Criteria
- [ ] Measurable outcomes defined
- [ ] Coverage metrics clear
- [ ] Quality thresholds set

### 7.8 Risks
- [ ] Risks identified
- [ ] Mitigations planned
- [ ] Rollback approach defined

**Score:** X/8 categories passing
**Threshold:** >= 7/8 to proceed

---

## 8. Integration with Squad Creator

### 8.1 When PRD is Required

```yaml
prd_trigger:
  condition: "workflows_mapped >= 10 OR agents_needed >= 8"
  action: "VETO direct creation, require PRD"

  workflow:
    1: "Map all workflows (SC_SCP_001)"
    2: "If >= 10, trigger PRD creation"
    3: "Use this file for PRD structure"
    4: "Create PRD in docs/projects/{domain}/prd.md"
    5: "Break into epics"
    6: "Implement epic by epic"
```

### 8.2 PRD Location

```
docs/projects/{domain}/
├── prd.md                 # Main PRD document
├── epics/
│   ├── epic-1-foundation/ # Epic 1 directory
│   │   ├── README.md      # Epic overview
│   │   ├── story-1.md     # Stories
│   │   └── story-2.md
│   ├── epic-2-tier-0/
│   └── epic-3-tier-1/
└── research/              # Supporting research
    └── elite-minds.md
```

### 8.3 Handoff from PRD to Implementation

```yaml
handoff:
  after_prd_approved:
    action: "Start Epic 1 implementation"
    command: "*create-squad {domain} --epic=1"
    context_passed:
      - "PRD location"
      - "Epic 1 stories"
      - "Agent list for Epic 1"
      - "Quality gates"

  after_each_epic:
    action: "Validate epic completion"
    command: "*validate-squad {domain} --epic=N"
    then: "Proceed to Epic N+1"
```

---

## 9. Example: Contabilidade Squad PRD Structure

```yaml
example_prd:
  goals:
    - "1 contador gerencia 100+ clientes MEI/Simples"
    - "70% workflows automatizados"
    - "Zero multas por atraso"

  workflows_mapped: 54
  workflow_categories:
    - "Ciclo de Vida (9)"
    - "MEI Mensal (5)"
    - "Simples Mensal (7)"
    - "Trabalhista (10)"
    - "Anual (5)"
    - "IRPF (5)"
    - "Regularização (6)"
    - "Comunicação (6)"
    - "Gestão (5)"

  elite_minds:
    tier_0: ["Roberto Dias Duarte", "Nibo Methodology"]
    tier_1: ["Fellipe Guerra", "Anderson Hernandes"]
    tier_2: ["Pedro Nery", "CFC Guidelines"]

  epics:
    epic_1: "Foundation + Orchestrator"
    epic_2: "Tier 0 - Onboarding + MEI/Simples Básico"
    epic_3: "Tier 1 - Execução Fiscal"
    epic_4: "Tier 1 - Execução Trabalhista"
    epic_5: "Tier 2 - Comunicação + Consultoria"
    epic_6: "Tier 3 - Especialistas sob Demanda"
```

---

*PM Best Practices for Squad Creator v1.0*
*Source: AIOS PM Agent (Morgan)*
*Integrated: 2026-02-03*
