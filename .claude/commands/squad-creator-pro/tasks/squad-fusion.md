# Task: Squad Fusion (Dragon Ball Style)

**Task ID:** squad-fusion
**Version:** 2.0.0
**Execution Type:** Agent
**Model:** Opus
**Haiku Eligible:** NO
**Purpose:** Fundir múltiplos squads similares em um único squad otimizado
**Orchestrator:** @squad-chief
**Mode:** Interactive
**Workflow:** `workflows/wf-squad-fusion.yaml`

---

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Squad Fusion |
| **status** | `active` |
| **responsible_executor** | Hybrid (Worker + Agent + Human) |
| **execution_type** | Multi-phase workflow |
| **input** | Lista de squads fonte + nome do target |
| **output** | Squad fusionado em `squads/{target_name}/` |
| **acceptance_criteria** | Zero perda de componentes, zero duplicatas, quality score >= 8.0 |
| **quality_gate** | SC_FUS_001 |
| **estimated_duration** | YOLO: 15-30 min, QUALITY: 45-90 min |

---

## Overview

A Fusão de Squads combina múltiplos squads com domínios similares em um único squad coeso e otimizado. Como a fusão no Dragon Ball, o resultado é mais poderoso que a soma das partes.

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           SQUAD FUSION FLOW                                    ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   Squad A ─┐                                                                  ║
║            │                                                                  ║
║   Squad B ─┼───► [ANALYSIS] ──► [DEDUP] ──► [MERGE] ──► [VALIDATE] ──► Target║
║            │                                                                  ║
║   Squad C ─┘                                                                  ║
║                                                                               ║
║   PHASES:                                                                     ║
║   1. Discovery   - Scan source squads, inventory components                   ║
║   2. Analysis    - Detect duplicates, conflicts, gaps                         ║
║   3. Resolution  - Decide merge strategy for each conflict                    ║
║   4. Execution   - Merge components into target                               ║
║   5. Validation  - Quality gates, smoke tests                                 ║
║   6. Cleanup     - Archive/delete source squads (optional)                    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Veto Conditions

| ID | Condition | Check | Result |
|----|-----------|-------|--------|
| VETO-SFU-001 | Fusion requires at least two valid source squads | Verify `sources.length >= 2` and all source directories exist/readable before Phase 1 | VETO - BLOCK. Provide at least two valid source squads before starting fusion. |
| VETO-SFU-002 | Dry-run inventory and conflict analysis must be generated before destructive merge | Verify discovery inventory + duplicates/conflicts reports exist and were reviewed | VETO - BLOCK. Execute dry-run analysis first; do not merge without inventory evidence. |
| VETO-SFU-003 | Rollback path must be ready before modifying source/target squads | Verify target snapshot and rollback procedure are prepared prior to Phase 4 execution | VETO - BLOCK. Prepare rollback artifacts before applying fusion writes/deletes. |
| VETO-SFU-004 | Cleanup operations require quality gates pass | Verify `quality_score >= 7.0` and `blocking_gates_failed == 0` before archive/delete actions | VETO - BLOCK. Abort cleanup when quality gates fail; resolve issues first. |

---

## Usage

### Basic Usage

```bash
*squad-fusion
```

### With Arguments

```bash
# Fundir squads específicos
*squad-fusion --sources media-buy,media-squad,meta-ads --target traffic-masters

# Modos de execução
*squad-fusion --mode yolo    # Automático, decisões padrão
*squad-fusion --mode quality # Checkpoints humanos em cada fase

# Opções adicionais
*squad-fusion --dry-run      # Simular sem executar
*squad-fusion --keep-sources # Não arquivar squads fonte após fusão
*squad-fusion --verbose      # Output detalhado
```

---

## Elicitation Flow (Interactive Mode)

### Step 1: Identificar Squads Fonte

```yaml
elicit:
  id: step_1_sources
  question: "Quais squads deseja fundir?"
  type: multi_select
  options:
    source: "Listar squads disponíveis em squads/"
    display: "nome (agents: N, tasks: N)"
  validation:
    min: 2
    max: 10
    error_if_less: "Fusão requer pelo menos 2 squads"
  hints:
    - "Selecione squads com domínios similares para melhor resultado"
    - "Squads muito diferentes podem resultar em fusão inconsistente"
```

### Step 2: Definir Target

```yaml
elicit:
  id: step_2_target
  question: "Nome do squad resultante?"
  type: text
  default: "Sugerir baseado nos fontes (ex: traffic-masters)"
  validation:
    pattern: "^[a-z][a-z0-9-]*$"
    error: "Nome deve ser kebab-case"
  auto_suggest:
    - Analisar nomes dos fontes
    - Identificar domínio comum
    - Propor nome que representa união
```

### Step 3: Definir Escopo

```yaml
elicit:
  id: step_3_scope
  question: "Qual o escopo/domínio do squad fusionado?"
  type: select
  options:
    - label: "Full Merge - Manter todos os componentes"
      value: full
      description: "Combina tudo, ideal para squads complementares"
    - label: "Domain Filter - Filtrar por keywords"
      value: filtered
      description: "Apenas componentes que matcham keywords"
    - label: "Cherry Pick - Selecionar manualmente"
      value: manual
      description: "Você escolhe cada componente"
  follow_up:
    if: filtered
    then:
      question: "Quais keywords definir o escopo?"
      type: text_array
      example: ["paid traffic", "meta ads", "google ads"]
```

### Step 4: Definir Modo de Execução

```yaml
elicit:
  id: step_4_mode
  question: "Modo de execução?"
  type: select
  options:
    - label: "🚀 YOLO (automático, ~15-30 min)"
      value: yolo
      description: |
        - Decisões automáticas para conflitos
        - Prefer newer version em duplicatas
        - Merge automático de configs
        - Checkpoint apenas no final
    - label: "💎 QUALITY (checkpoints, ~45-90 min)"
      value: quality
      description: |
        - Checkpoint em cada fase
        - Revisão humana de conflitos
        - Validação manual de deduplicação
        - Quality gate rigoroso
```

### Step 5: Confirmar Configuração

```yaml
elicit:
  id: step_5_confirm
  question: "Confirmar configuração?"
  type: confirm
  display: |
    ═══════════════════════════════════════════════════
    📋 RESUMO DA FUSÃO
    ═══════════════════════════════════════════════════

    Squads Fonte: {sources.join(', ')}
    Target: {target_name}
    Escopo: {scope}
    Modo: {mode}

    Componentes a fundir:
    - Agents: {total_agents} → ~{estimated_agents}
    - Tasks: {total_tasks} → ~{estimated_tasks}
    - Workflows: {total_workflows} → ~{estimated_workflows}

    ═══════════════════════════════════════════════════
  options:
    - "✅ Confirmar e executar"
    - "✏️ Modificar configuração"
    - "❌ Cancelar"
```

---

## Execution Phases

### Phase 1: Discovery

**Executor:** Worker
**Duration:** ~2-5 min

```yaml
phase_1_discovery:
  name: "Discovery"
  executor: Worker
  actions:
    - scan_source_squads:
        for_each: "{sources}"
        collect:
          - agents: "agents/*.md"
          - tasks: "tasks/*.md"
          - workflows: "workflows/*.{md,yaml}"
          - templates: "templates/*.{md,yaml}"
          - checklists: "checklists/*.md"
          - data: "data/*.{md,yaml}"
          - scripts: "scripts/*"
          - config: "config.yaml"
          - readme: "README.md"

    - generate_inventory:
        output: "inventory.yaml"
        contents:
          - total_components_by_type
          - total_lines_by_type
          - component_list_with_metadata

  checkpoint:
    type: automatic
    validate:
      - "All source squads exist"
      - "All source squads readable"
      - "Inventory generated successfully"
    on_fail: "ABORT with clear error message"
```

### Phase 2: Analysis

**Executor:** Worker + Agent
**Duration:** ~5-10 min

```yaml
phase_2_analysis:
  name: "Analysis"
  executor: Hybrid
  actions:
    - detect_duplicates:
        method: "multi-criteria"
        criteria:
          - name_similarity: 0.8  # Threshold
          - content_similarity: 0.7
          - purpose_match: true
        output: "duplicates.yaml"

    - detect_conflicts:
        types:
          - name_collision: "Same filename in different squads"
          - config_conflict: "Different values for same key"
          - dependency_conflict: "Incompatible dependencies"
        output: "conflicts.yaml"

    - identify_gaps:
        check:
          - "Missing orchestrator agent"
          - "Missing config.yaml"
          - "Missing README.md"
          - "Orphan dependencies"
        output: "gaps.yaml"

    - generate_merge_plan:
        output: "merge-plan.yaml"
        contents:
          - components_to_keep
          - components_to_merge
          - components_to_discard
          - conflicts_requiring_decision

  checkpoint:
    type: "{mode == 'quality' ? 'human' : 'automatic'}"
    display: |
      ═══════════════════════════════════════════════════
      📊 ANALYSIS REPORT
      ═══════════════════════════════════════════════════

      Duplicates Found: {duplicates.count}
      Conflicts Found: {conflicts.count}
      Gaps Identified: {gaps.count}

      DUPLICATES:
      {for dup in duplicates}
        - {dup.name}: {dup.sources.join(' vs ')}
          Similarity: {dup.similarity}%
          Recommendation: {dup.recommendation}
      {/for}

      CONFLICTS:
      {for conflict in conflicts}
        - {conflict.type}: {conflict.description}
          Resolution options: {conflict.options.join(', ')}
      {/for}

      ═══════════════════════════════════════════════════
    validate:
      - "Merge plan generated"
      - "All duplicates categorized"
      - "All conflicts have resolution options"
```

### Phase 3: Resolution

**Executor:** Hybrid (Agent + Human in QUALITY mode)
**Duration:** YOLO: ~2 min, QUALITY: ~15-30 min

```yaml
phase_3_resolution:
  name: "Conflict Resolution"
  executor: "{mode == 'quality' ? 'Human' : 'Agent'}"

  actions:
    - resolve_duplicates:
        strategy:
          yolo:
            - prefer_newer: true
            - prefer_longer: true  # More content = more complete
            - merge_if_complementary: true
          quality:
            - present_options_to_human
            - await_decision
            - document_rationale

    - resolve_conflicts:
        for_each: "{conflicts}"
        strategies:
          name_collision:
            - rename_with_prefix: "{source_squad}-{original_name}"
            - keep_one_discard_other
            - merge_into_new
          config_conflict:
            - deep_merge: "Combine both configs"
            - prefer_source: "Use specific source's config"
            - manual_edit: "Human edits merged config"
          dependency_conflict:
            - update_to_latest
            - keep_both_with_alias
            - remove_conflicting

    - fill_gaps:
        actions:
          missing_orchestrator:
            - create_from_template
            - promote_existing_agent
          missing_config:
            - generate_from_sources
          missing_readme:
            - generate_from_template

  checkpoint:
    type: "{mode == 'quality' ? 'human' : 'automatic'}"
    validate:
      - "All duplicates resolved"
      - "All conflicts resolved"
      - "All gaps filled"
      - "Resolution log complete"
```

### Phase 4: Execution

**Executor:** Worker
**Duration:** ~5-10 min

```yaml
phase_4_execution:
  name: "Merge Execution"
  executor: Worker

  actions:
    - create_target_structure:
        path: "squads/{target_name}/"
        structure:
          - agents/
          - tasks/
          - workflows/
          - templates/
          - checklists/
          - data/
          - scripts/
          - config/
          - docs/

    - copy_components:
        for_each: "{merge_plan.components_to_keep}"
        action: "Copy to target with resolved names"
        log: "copy_log.yaml"

    - merge_components:
        for_each: "{merge_plan.components_to_merge}"
        action: "Merge content intelligently"
        preserve:
          - "All output_examples"
          - "All objection_algorithms"
          - "Unique vocabulary items"
        log: "merge_log.yaml"

    - generate_config:
        template: "config-tmpl.yaml"
        values:
          name: "{target_name}"
          version: "1.0.0"
          description: "Fusão de {sources.join(', ')}"
          components: "{merged_components_summary}"

    - generate_readme:
        template: "readme-tmpl.md"
        sections:
          - "Overview (generated)"
          - "Merged from (sources)"
          - "Component inventory"
          - "Usage"
          - "Changelog"

  checkpoint:
    type: automatic
    validate:
      - "Target directory created"
      - "All components copied/merged"
      - "config.yaml valid"
      - "README.md generated"
    on_fail: "ROLLBACK and report"
```

### Phase 5: Validation

**Executor:** Worker + Agent
**Duration:** ~5-15 min

```yaml
phase_5_validation:
  name: "Quality Validation"
  executor: Hybrid

  actions:
    - run_quality_gates:
        gates:
          - id: SC_FUS_001
            name: "Fusion Completeness"
            checks:
              - "No components lost (source_count == target_count + discarded)"
              - "No duplicate files in target"
              - "All dependencies resolvable"
            type: blocking

          - id: SC_FUS_002
            name: "Config Validity"
            checks:
              - "config.yaml is valid YAML"
              - "All required fields present"
              - "Version is semantic"
            type: blocking

          - id: SC_FUS_003
            name: "Documentation"
            checks:
              - "README.md exists and > 100 lines"
              - "All components documented"
            type: recommended

    - validate_agents:
        for_each: "agents/*.md"
        gate: "SC_AGT_001"
        min_score: 7.0

    - run_smoke_tests:
        tests:
          - name: "Agent Activation"
            action: "Simulate activating each agent"
            expect: "Greeting displayed without errors"

          - name: "Command Recognition"
            action: "Test *help command on orchestrator"
            expect: "Commands listed"

          - name: "Dependency Resolution"
            action: "Verify all task references resolve"
            expect: "No broken links"

    - calculate_quality_score:
        weights:
          completeness: 0.25
          agents_quality: 0.25
          documentation: 0.20
          no_duplicates: 0.15
          dependencies: 0.15
        threshold: 8.0

  checkpoint:
    type: human
    display: |
      ═══════════════════════════════════════════════════
      ✅ VALIDATION REPORT
      ═══════════════════════════════════════════════════

      Quality Gates:
      {for gate in gates}
        {gate.passed ? '✅' : '❌'} {gate.id}: {gate.name}
           {gate.details}
      {/for}

      Agent Validation:
      {for agent in agents}
        {agent.passed ? '✅' : '⚠️'} {agent.name}: {agent.score}/10
      {/for}

      Smoke Tests:
      {for test in smoke_tests}
        {test.passed ? '✅' : '❌'} {test.name}
      {/for}

      OVERALL QUALITY SCORE: {quality_score}/10

      {quality_score >= 8.0 ? '✅ FUSION SUCCESSFUL' : '⚠️ REVIEW NEEDED'}

      ═══════════════════════════════════════════════════

    veto_conditions:
      - condition: "quality_score < 7.0"
        action: "FAIL - Fusion quality too low"
      - condition: "blocking_gates_failed > 0"
        action: "FAIL - Blocking gate failed"
```

### Phase 6: Cleanup (Optional)

**Executor:** Human
**Duration:** ~2 min

```yaml
phase_6_cleanup:
  name: "Cleanup"
  executor: Human
  skip_if: "--keep-sources"

  elicit:
    question: "O que fazer com os squads fonte?"
    type: select
    options:
      - label: "📦 Arquivar (mover para squads/_archived/)"
        value: archive
      - label: "🗑️ Deletar permanentemente"
        value: delete
        warning: "IRREVERSÍVEL!"
      - label: "📁 Manter (não fazer nada)"
        value: keep

  actions:
    archive:
      - create_dir: "squads/_archived/"
      - move: "{source} → squads/_archived/{source}_{timestamp}/"
      - log: "Archived {source}"

    delete:
      - confirm: "Tem certeza? Esta ação é IRREVERSÍVEL!"
      - rm_rf: "squads/{source}/"
      - log: "Deleted {source}"

    keep:
      - log: "Kept {source} unchanged"
```

---

## Output Structure

```
squads/{target_name}/
├── config.yaml                 # Merged configuration
├── README.md                   # Generated documentation
├── FUSION-LOG.md               # Complete fusion history
├── agents/
│   ├── orchestrator.md         # New or promoted orchestrator
│   ├── {merged-agent-1}.md
│   └── {merged-agent-2}.md
├── tasks/
│   ├── {merged-task-1}.md
│   └── {merged-task-2}.md
├── workflows/
│   ├── {merged-workflow-1}.yaml
│   └── {merged-workflow-2}.yaml
├── templates/
├── checklists/
├── data/
│   └── fusion-metadata.yaml    # Fusion details for traceability
├── scripts/
└── docs/
    └── fusion-report.md        # Detailed fusion report
```

---

## Conflict Resolution Strategies

### Duplicate Agents

| Scenario | YOLO Strategy | QUALITY Strategy |
|----------|---------------|------------------|
| Same name, different content | Keep longer one | Human chooses |
| Same purpose, different approach | Merge best parts | Human reviews merge |
| Complementary specialties | Keep both, rename | Human confirms |

### Config Conflicts

| Conflict Type | Resolution |
|---------------|------------|
| Different versions | Use higher version |
| Different descriptions | Concatenate |
| Different settings | Deep merge, prefer source A for conflicts |

### Dependency Conflicts

| Conflict Type | Resolution |
|---------------|------------|
| Same dependency, different versions | Use latest |
| Circular dependencies | Break cycle, warn user |
| Missing dependencies | Add to target, warn user |

---

## Quality Gates

### SC_FUS_001: Fusion Completeness

```yaml
gate:
  id: SC_FUS_001
  name: "Fusion Completeness"
  type: blocking
  checks:
    - name: "No Component Loss"
      formula: "target_components >= source_components - intentional_discards"
    - name: "No Duplicates in Target"
      formula: "unique(target_files) == count(target_files)"
    - name: "Dependencies Resolvable"
      formula: "broken_dependencies == 0"
```

### SC_FUS_002: Config Validity

```yaml
gate:
  id: SC_FUS_002
  name: "Config Validity"
  type: blocking
  checks:
    - name: "Valid YAML"
      validation: "yamllint passes"
    - name: "Required Fields"
      required: ["name", "version", "description"]
    - name: "Semantic Version"
      pattern: "^\\d+\\.\\d+\\.\\d+$"
```

### SC_FUS_003: Documentation Quality

```yaml
gate:
  id: SC_FUS_003
  name: "Documentation Quality"
  type: recommended
  checks:
    - name: "README Exists"
      validation: "README.md exists"
    - name: "README Adequate"
      validation: "README.md > 100 lines"
    - name: "Components Documented"
      validation: "All agents have descriptions"
```

---

## Rollback Procedure

If fusion fails at any phase:

```yaml
rollback:
  trigger: "Any blocking gate fails OR user cancels"
  actions:
    - step: 1
      action: "Delete target directory if created"
      command: "rm -rf squads/{target_name}/"

    - step: 2
      action: "Restore source squads if modified"
      command: "git checkout -- squads/{sources}/"

    - step: 3
      action: "Log rollback reason"
      output: "fusion-rollback-{timestamp}.log"

    - step: 4
      action: "Notify user"
      message: |
        ❌ Fusion rolled back.
        Reason: {rollback_reason}
        Source squads unchanged.
        See fusion-rollback-{timestamp}.log for details.
```

---

## Examples

### Example 1: Media Buying Fusion

```bash
*squad-fusion

> Squads fonte: media-buy, media-buyer-squad-pack-v2.1.0, media-squad, meta-ads
> Target: traffic-masters
> Escopo: Full merge
> Modo: quality

# Result:
# - 15 agents merged from 4 squads
# - 3 duplicates resolved (kept best versions)
# - 2 config conflicts resolved (deep merge)
# - Quality score: 9.1/10
# - Source squads archived
```

### Example 2: Copy Fusion (Dry Run)

```bash
*squad-fusion --sources copy,storytelling --target content-masters --dry-run

# Output:
# DRY RUN - No changes will be made
#
# Would merge:
# - 25 agents from copy + 8 from storytelling = ~30 (3 duplicates)
# - 58 tasks from copy + 22 from storytelling = ~75 (5 duplicates)
#
# Estimated quality score: 9.3/10
# Run without --dry-run to execute
```

---

## Completion Criteria

- [ ] All source squads scanned successfully
- [ ] All duplicates identified and resolved
- [ ] All conflicts resolved with documented rationale
- [ ] Target squad created with all components
- [ ] config.yaml valid and complete
- [ ] README.md generated with fusion history
- [ ] Quality score >= 8.0
- [ ] All blocking gates passed
- [ ] Smoke tests passed
- [ ] FUSION-LOG.md complete
- [ ] Source squads handled per user choice

---

## Handoff

```yaml
handoff_to:
  - agent: "@qa"
    when: "Fusion complete, needs deep validation"
    context: "Run *validate-squad {target_name}"

  - agent: "@dev"
    when: "Fusion needs custom scripts merged"
    context: "Review scripts/ directory conflicts"

  - agent: "@squad-chief"
    when: "Fused squad needs enhancement"
    context: "Run *analyze-squad {target_name}"
```

---

## Related Files

- `workflows/wf-squad-fusion.yaml` - Workflow completo (1,684 linhas)
- `data/fusion-decision-points-analysis.md` - Análise de executores
- `checklists/executor-matrix-checklist.md` - Validação de executores
- `templates/config-tmpl.yaml` - Template de config
- `templates/readme-tmpl.md` - Template de README

---

## Changelog

### v2.0.0 (2026-02-05)
- Added 6-phase execution flow with checkpoints
- Added quality gates (SC_FUS_001, SC_FUS_002, SC_FUS_003)
- Added rollback procedure
- Added conflict resolution strategies
- Added smoke tests
- Added dry-run mode
- Added detailed elicitation flow
- Expanded documentation

### v1.0.0 (2026-02-01)
- Initial release with basic fusion capability

---

_Task Version: 2.0.0_
_Created: 2026-02-01_
_Updated: 2026-02-05_
_Author: squad-chief_
