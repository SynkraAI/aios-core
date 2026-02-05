---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: validateNextStory()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must exist

- campo: criteria
  tipo: array
  origem: config
  obrigatório: true
  validação: Non-empty validation criteria

- campo: strict
  tipo: boolean
  origem: User Input
  obrigatório: false
  validação: Default: true

**Saída:**
- campo: validation_result
  tipo: boolean
  destino: Return value
  persistido: false

- campo: errors
  tipo: array
  destino: Memory
  persistido: false

- campo: report
  tipo: object
  destino: File (.ai/*.json)
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Validation rules loaded; target available for validation
    tipo: pre-condition
    blocker: true
    validação: |
      Check validation rules loaded; target available for validation
    error_message: "Pre-condition failed: Validation rules loaded; target available for validation"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Validation executed; results accurate; report generated
    tipo: post-condition
    blocker: true
    validação: |
      Verify validation executed; results accurate; report generated
    error_message: "Post-condition failed: Validation executed; results accurate; report generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Validation rules applied; pass/fail accurate; actionable feedback
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert validation rules applied; pass/fail accurate; actionable feedback
    error_message: "Acceptance criterion not met: Validation rules applied; pass/fail accurate; actionable feedback"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** validation-engine
  - **Purpose:** Rule-based validation and reporting
  - **Source:** .aios-core/utils/validation-engine.js

- **Tool:** schema-validator
  - **Purpose:** JSON/YAML schema validation
  - **Source:** ajv or similar

---

## Scripts

**Agent-specific code for this task:**

- **Script:** run-validation.js
  - **Purpose:** Execute validation rules and generate report
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/run-validation.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Validation Criteria Missing
   - **Cause:** Required validation rules not defined
   - **Resolution:** Ensure validation criteria loaded from config
   - **Recovery:** Use default validation rules, log warning

2. **Error:** Invalid Schema
   - **Cause:** Target does not match expected schema
   - **Resolution:** Update schema or fix target structure
   - **Recovery:** Detailed validation error report

3. **Error:** Dependency Missing
   - **Cause:** Required dependency for validation not found
   - **Resolution:** Install missing dependencies
   - **Recovery:** Abort with clear dependency list

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---

tools:
  - github-cli        # Validate repository structure and file paths
  - context7          # Verify technical specifications and patterns
checklists:
  - po-master-checklist.md
---

# Validate Next Story Task

## Purpose

To comprehensively validate a story draft before implementation begins, ensuring it is complete, accurate, and provides sufficient context for successful development. This task identifies issues and gaps that need to be addressed, preventing hallucinations and ensuring implementation readiness.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 0. Load Core Configuration and Inputs

- Load `.aios-core/core-config.yaml`
- If the file does not exist, HALT and inform the user: "core-config.yaml not found. This file is required for story validation."
- Extract key configurations: `devStoryLocation`, `prd.*`, `architecture.*`
- Identify and load the following inputs:
  - **Story file**: The drafted story to validate (provided by user or discovered in `devStoryLocation`)
  - **Parent epic**: The epic containing this story's requirements
  - **Architecture documents**: Based on configuration (sharded or monolithic)
  - **Story template**: `aios-core/templates/story-tmpl.yaml` for completeness validation

### 1. Template Completeness Validation

- Load `aios-core/templates/story-tmpl.yaml` and extract all section headings from the template
- **Missing sections check**: Compare story sections against template sections to verify all required sections are present
- **Placeholder validation**: Ensure no template placeholders remain unfilled (e.g., `{{EpicNum}}`, `{{role}}`, `_TBD_`)
- **Agent section verification**: Confirm all sections from template exist for future agent use
- **Structure compliance**: Verify story follows template structure and formatting

### 2. File Structure and Source Tree Validation

- **Refer to tools/cli/github-cli.yaml** for repository structure validation commands and file path verification operations
- Consult the examples section for file listing and directory structure inspection patterns
- **File paths clarity**: Are new/existing files to be created/modified clearly specified?
- **Source tree relevance**: Is relevant project structure included in Dev Notes?
- **Directory structure**: Are new directories/components properly located according to project structure?
- **File creation sequence**: Do tasks specify where files should be created in logical order?
- **Path accuracy**: Are file paths consistent with project structure from architecture docs?

### 3. UI/Frontend Completeness Validation (if applicable)

- **Component specifications**: Are UI components sufficiently detailed for implementation?
- **Styling/design guidance**: Is visual implementation guidance clear?
- **User interaction flows**: Are UX patterns and behaviors specified?
- **Responsive/accessibility**: Are these considerations addressed if required?
- **Integration points**: Are frontend-backend integration points clear?

### 4. Acceptance Criteria Satisfaction Assessment

- **AC coverage**: Will all acceptance criteria be satisfied by the listed tasks?
- **AC testability**: Are acceptance criteria measurable and verifiable?
- **Missing scenarios**: Are edge cases or error conditions covered?
- **Success definition**: Is "done" clearly defined for each AC?
- **Task-AC mapping**: Are tasks properly linked to specific acceptance criteria?

### 5. Validation and Testing Instructions Review

- **Test approach clarity**: Are testing methods clearly specified?
- **Test scenarios**: Are key test cases identified?
- **Validation steps**: Are acceptance criteria validation steps clear?
- **Testing tools/frameworks**: Are required testing tools specified?
- **Test data requirements**: Are test data needs identified?

### 6. Security Considerations Assessment (if applicable)

- **Security requirements**: Are security needs identified and addressed?
- **Authentication/authorization**: Are access controls specified?
- **Data protection**: Are sensitive data handling requirements clear?
- **Vulnerability prevention**: Are common security issues addressed?
- **Compliance requirements**: Are regulatory/compliance needs addressed?

### 7. Tasks/Subtasks Sequence Validation

- **Logical order**: Do tasks follow proper implementation sequence?
- **Dependencies**: Are task dependencies clear and correct?
- **Granularity**: Are tasks appropriately sized and actionable?
- **Completeness**: Do tasks cover all requirements and acceptance criteria?
- **Blocking issues**: Are there any tasks that would block others?

### 8. Epic Context Awareness Validation (NEW in v2.0)

**Purpose:** Validate story coherence within the epic's accumulated context. Prevent conflicts, redundancy, and ensure logical progression based on what has already been implemented.

#### 8.1 Load Epic Context

- **Load epic file**: `docs/stories/epic-{n}.md` (extract epic number from story filename)
- **Load completed stories**: All stories with `status: DONE` in the same epic
- **Load in-progress stories**: All stories with `status: IN_PROGRESS` in the same epic
- **Build accumulated file list**: Aggregate all `## File List` sections from completed stories

```yaml
# Example context structure to build
context_loaded:
  epic_id: "{n}"
  completed_stories:
    - id: "1.1"
      title: "Story title"
      executor: "@data-engineer"
      files_modified: ["path/to/file.ts"]
  in_progress_stories: []
  accumulated_files_modified:
    - path: "app/services/api/metrics.ts"
      modified_by: "story-1.1"
      executor: "@dev"
      change_type: "created"
```

#### 8.2 Story Sequence Logic Validation

- **Prerequisite check**: Does this story depend on work from previous stories?
- **Dependency satisfaction**: Are all dependencies already DONE?
- **Logical progression**: Does this story make sense as the next step in the epic?
- **No orphan references**: Does the story reference files/functions that exist (or were created by prior stories)?

**Validation Questions:**
- Does the story reference tables/APIs/components created in earlier stories?
- If yes, are those stories marked as DONE?
- Would implementing this story out of sequence cause issues?

#### 8.3 File Overlap Analysis

- **Overlap detection**: Identify files this story will modify that were already modified by previous stories
- **Conflict risk assessment**:
  - LOW: Same executor, same competency
  - MEDIUM: Different executor, same competency
  - HIGH: Different executor, different competency
- **Justification required**: If overlap exists with HIGH risk, story must explain WHY

**Check for each file in the new story's task list:**
- Was this file created/modified by a previous story?
- Who was the executor? What competency?
- Is the current story's executor the same or different?

#### 8.4 Schema/Architecture Continuity Check

- **Database schema**: If story touches DB, verify compatibility with previous migrations
- **API contracts**: If story changes APIs used by previous stories, verify no breaking changes
- **Component hierarchy**: If story modifies shared components, verify hierarchy consistency
- **Type definitions**: Verify type changes don't break previous implementations

**Red flags to catch:**
- Modifying a migration file that was already applied
- Changing API response shape that previous stories depend on
- Renaming exports that are imported elsewhere

#### 8.5 Executor Assignment Coherence

- **Competency continuity**: If a file was created by @data-engineer, should @dev modify it?
- **Handoff clarity**: If executor changes for a file, is there explicit justification?
- **Knowledge transfer**: Does the new executor have sufficient context from previous stories?

**Executor Coherence Matrix:**
| File Created By | Modified By | Risk Level | Action |
|-----------------|-------------|------------|--------|
| @dev | @dev | LOW | OK |
| @dev | @data-engineer | MEDIUM | Justify |
| @data-engineer | @dev | HIGH | Review |
| @devops | @dev | HIGH | Review |

#### 8.6 Generate Context Awareness Report

Add this section to the validation report:

```markdown
## Epic Context Validation (Step 8)

### Accumulated Context
- **Epic**: {epic_id} - {epic_title}
- **Stories Completed**: {count} ({list})
- **Stories In Progress**: {count}
- **Total Files Modified**: {count}

### Previous Stories Summary
| Story | Title | Executor | Key Changes |
|-------|-------|----------|-------------|
| 1.1 | ... | @data-engineer | Created metrics table |
| 1.2 | ... | @dev | API endpoints |

### File Overlap Analysis
| File | Previously Modified By | This Story Modifies | Risk |
|------|------------------------|---------------------|------|
| Dashboard.tsx | story-1.3 (@dev) | Yes | LOW ✅ |

### Dependency Chain
- [x] Story 1.1 (DONE) - Required for DB schema
- [x] Story 1.2 (DONE) - Required for API
- [ ] Story 1.3 (IN_PROGRESS) - Not blocking

### Executor Coherence
- ✅ All file modifications match competency
- OR
- ⚠️ WARNING: {file} created by {executor} being modified by {different_executor}

### Context Validation Result
- [ ] PASS: Story is coherent with epic context
- [ ] WARN: Minor context issues (document and proceed)
- [ ] FAIL: Critical context conflicts (must resolve before approval)
```

### 9. CodeRabbit Integration Validation (CONDITIONAL)

**CONDITIONAL STEP** - Check `coderabbit_integration.enabled` in core-config.yaml

**IF `coderabbit_integration.enabled: false`:**
- SKIP this entire step
- Verify the story contains the skip notice in the CodeRabbit Integration section:
  > **CodeRabbit Integration**: Disabled
- Log: "ℹ️ CodeRabbit validation skipped - disabled in core-config.yaml"
- Proceed to Step 9

**IF `coderabbit_integration.enabled: true`:**
- Validate ALL of the following:

**Section Presence:**
- Is the `🤖 CodeRabbit Integration` section present?
- Are all subsections populated (Story Type Analysis, Specialized Agents, Quality Gates, Self-Healing, Focus Areas)?

**Story Type Analysis:**
- Is the primary story type correctly identified?
- Does the complexity level match the story scope?
- Are secondary types listed if applicable?

**Specialized Agent Assignment:**
- Is @dev listed as primary agent (required for all stories)?
- Are type-specific agents assigned appropriately?
  - Database stories → @db-sage
  - Frontend stories → @ux-expert
  - Deployment stories → @github-devops
  - Security stories → @architect

**Quality Gate Tasks:**
- Are all applicable quality gates defined as checkboxes?
- Pre-Commit (@dev) - REQUIRED for all stories
- Pre-PR (@github-devops) - Required if PR will be created
- Pre-Deployment (@github-devops) - Required for production stories

**Self-Healing Configuration (Story 6.3.3):**
- Is the self-healing configuration present?
- Does the mode match the primary agent?
  - @dev: light mode (2 iterations, 15 min, CRITICAL only)
  - @qa: full mode (3 iterations, 30 min, CRITICAL+HIGH)
  - @github-devops: check mode (report only)
- Is the severity behavior documented?

**Focus Areas:**
- Do focus areas match the story type?
- Are type-specific validations listed?
  - Database: service filters, schema compliance, RLS
  - API: error handling, security, validation
  - Frontend: accessibility, performance, responsive

**Validation Result:**
- [ ] PASS: CodeRabbit section complete and accurate
- [ ] PARTIAL: Section present but incomplete
- [ ] FAIL: Section missing or critically incomplete
- [ ] N/A: CodeRabbit disabled in core-config.yaml

### 10. Anti-Hallucination Verification

- **Refer to tools/mcp/context7.yaml** for library documentation lookup to verify technical claims against official sources
- Consult the examples section for documentation verification patterns and library-specific queries
- **Source verification**: Every technical claim must be traceable to source documents
- **Architecture alignment**: Dev Notes content matches architecture specifications
- **No invented details**: Flag any technical decisions not supported by source documents
- **Reference accuracy**: Verify all source references are correct and accessible
- **Fact checking**: Cross-reference claims against epic and architecture documents

### 11. Dev Agent Implementation Readiness

- **Self-contained context**: Can the story be implemented without reading external docs?
- **Clear instructions**: Are implementation steps unambiguous?
- **Complete technical context**: Are all required technical details present in Dev Notes?
- **Missing information**: Identify any critical information gaps
- **Actionability**: Are all tasks actionable by a development agent?

### 12. Generate Validation Report

Provide a structured validation report including:

#### Template Compliance Issues

- Missing sections from story template
- Unfilled placeholders or template variables
- Structural formatting issues

#### Critical Issues (Must Fix - Story Blocked)

- Missing essential information for implementation
- Inaccurate or unverifiable technical claims
- Incomplete acceptance criteria coverage
- Missing required sections

#### Should-Fix Issues (Important Quality Improvements)

- Unclear implementation guidance
- Missing security considerations
- Task sequencing problems
- Incomplete testing instructions

#### Nice-to-Have Improvements (Optional Enhancements)

- Additional context that would help implementation
- Clarifications that would improve efficiency
- Documentation improvements

#### Anti-Hallucination Findings

- Unverifiable technical claims
- Missing source references
- Inconsistencies with architecture documents
- Invented libraries, patterns, or standards

#### CodeRabbit Integration Findings (CONDITIONAL)

**IF `coderabbit_integration.enabled: true`:**

- **Story Type Accuracy**: Is the story type correctly classified?
- **Agent Assignment Completeness**: Are all required agents assigned?
- **Quality Gate Coverage**: Are all applicable gates defined?
- **Self-Healing Configuration**: Is Story 6.3.3 configuration present?
- **Focus Areas Relevance**: Do focus areas match story type?

**IF `coderabbit_integration.enabled: false`:**

- **Skip Notice Present**: Verify skip notice is rendered in story
- **No Quality Gate Tasks**: Confirm no CodeRabbit checkboxes exist
- **Manual Review Fallback**: Note that manual review process applies

#### Final Assessment

- **GO**: Story is ready for implementation
- **NO-GO**: Story requires fixes before implementation
- **Implementation Readiness Score**: 1-10 scale
- **Confidence Level**: High/Medium/Low for successful implementation
 