# 🔬 Executor Analysis: wf-squad-fusion

> Análise profunda de cada step usando Executor Matrix Framework
> Objetivo: Maximizar Worker (script), minimizar Agent (LLM)

---

## Resumo Executivo

| Executor | Steps | % | Custo | Velocidade |
|----------|-------|---|-------|------------|
| **Worker (Script)** | 34 | 68% | $ | Muito Rápido |
| **Agent (LLM)** | 8 | 16% | $$$$ | Rápido |
| **Hybrid** | 6 | 12% | $$ | Moderado |
| **Human** | 2 | 4% | $$$ | Lento |

**Conclusão:** 68% do workflow pode ser script puro. LLM só onde há julgamento real.

---

## PHASE 0: INITIALIZATION

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| validate_inputs | Agent | **Worker** | Regex validation, file exists check - 100% determinístico |
| validate_sources | Agent | **Worker** | `ls`, `test -d` - shell commands |
| create_workspace | Agent | **Worker** | `mkdir -p` - puro shell |
| init_audit_log | Agent | **Worker** | Template interpolation - jinja/envsubst |
| create_backup | Agent | **Worker** | `tar -czf` - puro shell |

**Phase 0: 100% Worker** ✅

```bash
# Script: phase_0_init.sh
#!/bin/bash
set -euo pipefail

validate_inputs() {
    [[ $# -lt 3 ]] && { echo "Usage: $0 <target_name> <domain> <squad1> [squad2...]"; exit 1; }
    [[ -d "squads/$1" ]] && { echo "ERROR: Target $1 already exists"; exit 1; }
    [[ ! "$1" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] && { echo "ERROR: Invalid name format"; exit 1; }
}

validate_sources() {
    for squad in "$@"; do
        [[ ! -d "squads/$squad" ]] && { echo "ERROR: Squad $squad not found"; exit 1; }
    done
}

create_workspace() {
    local workspace="/tmp/fusion-$1-$(date +%s)"
    mkdir -p "$workspace"/{agents,tasks,skills,data,templates,checklists,workflows,_audit,_conflicts}
    echo "$workspace"
}

create_backup() {
    local backup_dir="backups/squads/pre-fusion-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    for squad in "$@"; do
        tar -czf "$backup_dir/$squad.tar.gz" "squads/$squad"
    done
    echo "$backup_dir"
}
```

---

## PHASE 1: DISCOVERY

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| inventory_agents | Agent | **Worker** | `find | wc -l` - puro shell |
| inventory_tasks | Agent | **Worker** | `find | wc -l` - puro shell |
| inventory_skills | Agent | **Worker** | `find | wc -l` - puro shell |
| inventory_data | Agent | **Worker** | `find | wc -l` - puro shell |
| inventory_other | Agent | **Worker** | `find | wc -l` - puro shell |
| inventory_quality | Agent | **Worker** | `wc -l` - puro shell |
| build_inventory_table | Agent | **Worker** | Template + dados coletados |
| cross_reference_map | Agent | **Worker** | `grep -r` - puro shell |
| log_discovery | Agent | **Worker** | Append to YAML file |

**Phase 1: 100% Worker** ✅

```bash
# Script: phase_1_discovery.sh
#!/bin/bash

inventory_squad() {
    local squad=$1
    local result=$(mktemp)

    cat > "$result" << EOF
squad: $squad
agents:
  count: $(find "squads/$squad/agents" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
  list: $(find "squads/$squad/agents" -name '*.md' -exec basename {} .md \; 2>/dev/null | sort | tr '\n' ',' | sed 's/,$//')
tasks:
  count: $(find "squads/$squad" -path '*/tasks/*.md' 2>/dev/null | wc -l | tr -d ' ')
skills:
  count: $(find "squads/$squad" -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ')
data:
  count: $(find "squads/$squad/data" "squads/$squad/knowledge" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
templates:
  count: $(find "squads/$squad" -path '*/templates/*.md' 2>/dev/null | wc -l | tr -d ' ')
checklists:
  count: $(find "squads/$squad" -path '*/checklists/*.md' 2>/dev/null | wc -l | tr -d ' ')
workflows:
  count: $(find "squads/$squad" -path '*/workflows/*' \( -name '*.yaml' -o -name '*.md' \) 2>/dev/null | wc -l | tr -d ' ')
EOF

    cat "$result"
    rm "$result"
}

build_inventory_table() {
    echo "| Squad | Agents | Tasks | Skills | Data | Templates | Checklists | Workflows |"
    echo "|-------|--------|-------|--------|------|-----------|------------|-----------|"

    local total_agents=0 total_tasks=0 total_skills=0 total_data=0

    for squad in "$@"; do
        local inv=$(inventory_squad "$squad")
        local agents=$(echo "$inv" | grep -A1 "^agents:" | grep "count:" | awk '{print $2}')
        local tasks=$(echo "$inv" | grep -A1 "^tasks:" | grep "count:" | awk '{print $2}')
        # ... etc
        echo "| $squad | $agents | $tasks | ... |"
        ((total_agents += agents))
        ((total_tasks += tasks))
    done

    echo "| **TOTAL** | **$total_agents** | **$total_tasks** | ... |"
}
```

---

## PHASE 2: DEDUPLICATION

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| exact_match_detection | Agent | **Worker** | `sort | uniq -d` - puro shell |
| semantic_match_detection | Agent | **Hybrid** | ⚠️ Precisa entender função similar |
| quality_comparison | Agent | **Worker** | `wc -l`, `grep -c` - puro shell |
| create_golden_records | Agent | **Worker (YOLO) / Hybrid (QUALITY)** | Regra: maior ganha = determinístico |
| build_dedup_table | Agent | **Worker** | Template + dados |
| log_deduplication | Agent | **Worker** | Append YAML |

**Phase 2: 83% Worker, 17% Hybrid**

### Onde LLM é necessário:

**semantic_match_detection** - Precisa julgamento para:
- "ads-analyst" e "performance-analyst" são a mesma função?
- "fiscal" e "compliance-auditor" são duplicatas?

**Solução:** Manter mapping estático + LLM só para casos não mapeados.

```yaml
# semantic_duplicates_map.yaml (estático)
analyst:
  - ads-analyst
  - performance-analyst
  - metrics-analyst
scaler:
  - scale-optimizer
  - scaling-specialist
auditor:
  - fiscal
  - compliance-auditor
creative:
  - creative-analyst
  - creative-strategist
traffic:
  - traffic-manager
  - traffic-head
  - media-buyer
```

```bash
# Script: phase_2_dedup.sh

detect_exact_duplicates() {
    local workspace=$1
    shift

    # Listar todos agents de todos squads
    for squad in "$@"; do
        find "squads/$squad/agents" -name '*.md' -exec basename {} .md \; 2>/dev/null
    done | sort | uniq -d
}

detect_semantic_duplicates() {
    local map_file="data/semantic_duplicates_map.yaml"
    # Parse YAML e identificar matches
    # Se não encontrado no mapa → flag para LLM review
}

resolve_duplicate_by_quality() {
    local agent=$1
    local squad_a=$2
    local squad_b=$3

    local lines_a=$(wc -l < "squads/$squad_a/agents/$agent.md" 2>/dev/null || echo 0)
    local lines_b=$(wc -l < "squads/$squad_b/agents/$agent.md" 2>/dev/null || echo 0)

    if [[ $lines_a -gt $lines_b ]]; then
        echo "$squad_a"
    else
        echo "$squad_b"
    fi
}
```

---

## PHASE 3: SCOPE FILTERING

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| define_domain_keywords | Agent | **Worker** | Config file estático |
| classify_agents | Agent | **Worker** | Keyword matching - grep |
| classify_tasks | Agent | **Worker** | Keyword matching - grep |
| build_scope_table | Agent | **Worker** | Template + dados |
| log_scope | Agent | **Worker** | Append YAML |

**Phase 3: 100% Worker** ✅

```yaml
# domain_keywords.yaml (estático por domínio)
paid_traffic:
  include:
    primary: [ads, traffic, campaign, pixel, tracking, attribution]
    secondary: [creative, copy, scaling, optimization, roas, cpa, ctr]
    platforms: [meta, google, youtube, tiktok, linkedin]
  exclude:
    explicit: [brand, pr, organic, seo, content-marketing]
    ambiguous: [social, web-design, email]

copywriting:
  include:
    primary: [copy, headline, email, sales, conversion]
    # ...
```

```bash
# Script: phase_3_scope.sh

calculate_relevance_score() {
    local file=$1
    local domain=$2

    # Load keywords from config
    local include_primary=$(yq '.include.primary[]' "config/domains/$domain.yaml")
    local exclude=$(yq '.exclude.explicit[]' "config/domains/$domain.yaml")

    local score=0
    local content=$(head -100 "$file" | tr '[:upper:]' '[:lower:]')

    # +2 for primary keywords
    for keyword in $include_primary; do
        if echo "$content" | grep -qi "$keyword"; then
            ((score += 2))
        fi
    done

    # -2 for exclude keywords
    for keyword in $exclude; do
        if echo "$content" | grep -qi "$keyword"; then
            ((score -= 2))
        fi
    done

    echo $score
}

classify_component() {
    local score=$1
    if [[ $score -ge 2 ]]; then
        echo "IN_SCOPE"
    elif [[ $score -lt 0 ]]; then
        echo "OUT_OF_SCOPE"
    else
        echo "NEEDS_REVIEW"
    fi
}
```

---

## PHASE 4: COLLECTION

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| collect_agents | Agent | **Worker** | `cp` com lógica de dedup |
| collect_tasks | Agent | **Worker** | `cp -n` |
| collect_skills | Agent | **Worker** | `cp -rn` |
| collect_data | Agent | **Worker** | `cp -n` |
| collect_templates | Agent | **Worker** | `cp -n` |
| collect_checklists | Agent | **Worker** | `cp -n` |
| collect_workflows | Agent | **Worker** | `cp -n` |
| handle_conflicts | Agent | **Hybrid** | ⚠️ Conflitos podem precisar julgamento |
| verify_collection | Agent | **Worker** | `find | wc -l` |
| reconciliation | Agent | **Worker** | Comparação numérica |
| log_collection | Agent | **Worker** | Append YAML |

**Phase 4: 91% Worker, 9% Hybrid**

```bash
# Script: phase_4_collection.sh

collect_with_idempotency() {
    local source=$1
    local dest=$2
    local conflicts_dir=$3

    if [[ -f "$dest" ]]; then
        if diff -q "$source" "$dest" > /dev/null 2>&1; then
            echo "SKIP: $(basename "$dest") (identical)"
            return 0
        else
            # Conflict - move existing to conflicts
            local basename=$(basename "$dest" .md)
            local conflict_name="${basename}-$(dirname "$source" | xargs basename).md"
            mv "$dest" "$conflicts_dir/$conflict_name"
            echo "CONFLICT: $(basename "$dest")"
        fi
    fi

    cp "$source" "$dest"
    echo "COPIED: $(basename "$dest")"
}

verify_collection() {
    local workspace=$1
    local expected_agents=$2
    local expected_tasks=$3

    local actual_agents=$(find "$workspace/agents" -name '*.md' | wc -l)
    local actual_tasks=$(find "$workspace/tasks" -name '*.md' | wc -l)

    if [[ $actual_agents -ne $expected_agents ]]; then
        echo "ERROR: Agent count mismatch. Expected: $expected_agents, Got: $actual_agents"
        return 1
    fi

    echo "OK: Counts match"
}
```

---

## PHASE 5: VALIDATION

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| structural_validation | Agent | **Worker** | File exists, not empty, YAML syntax |
| reference_validation | Agent | **Worker** | grep + file exists check |
| quality_validation | Agent | **Worker** | wc -l + grep |
| build_validation_report | Agent | **Worker** | Template + dados |
| log_validation | Agent | **Worker** | Append YAML |

**Phase 5: 100% Worker** ✅

```bash
# Script: phase_5_validation.sh

validate_agent_structure() {
    local file=$1
    local errors=""

    # Not empty
    [[ ! -s "$file" ]] && errors+="Empty file\n"

    # Has required sections
    grep -q "voice_dna" "$file" || errors+="Missing voice_dna\n"
    grep -q "output_examples" "$file" || errors+="Missing output_examples\n"

    # Line count
    local lines=$(wc -l < "$file")
    [[ $lines -lt 300 ]] && errors+="Only $lines lines (min: 300)\n"

    if [[ -n "$errors" ]]; then
        echo "FAIL: $(basename "$file")"
        echo -e "$errors"
        return 1
    fi

    echo "PASS: $(basename "$file")"
}

validate_references() {
    local workspace=$1
    local errors=0

    # Find all handoff_to references
    grep -rh "handoff_to:" "$workspace" --include="*.md" | while read line; do
        local target=$(echo "$line" | sed 's/.*handoff_to:\s*//' | tr -d '"' | tr -d "'")
        if [[ ! -f "$workspace/agents/$target.md" ]]; then
            echo "BROKEN: handoff_to $target"
            ((errors++))
        fi
    done

    return $errors
}
```

---

## PHASE 6: STRUCTURE CREATION

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| create_target_directory | Agent | **Worker** | `mkdir -p` |
| move_components | Agent | **Worker** | `mv` |
| generate_config | Agent | **Agent** | ⚠️ Precisa gerar tiers, routing |
| generate_readme | Agent | **Worker** | Template com variáveis |
| create_orchestrator_if_needed | Agent | **Agent** | ⚠️ Precisa gerar agent completo |
| preserve_audit_log | Agent | **Worker** | `mv` |
| final_count_verification | Agent | **Worker** | `find | wc -l` |
| log_structure_creation | Agent | **Worker** | Append YAML |

**Phase 6: 75% Worker, 25% Agent**

### Onde LLM é necessário:

**generate_config** - Precisa:
- Organizar agents em tiers (requer entender função de cada)
- Definir routing rules (requer entender quando usar cada agent)

**create_orchestrator** - Precisa:
- Gerar agent completo com voice_dna, output_examples
- Definir comandos disponíveis
- Criar handoffs

**Solução:** Template + LLM para preencher partes dinâmicas.

```yaml
# Template: config_template.yaml
pack:
  name: "{target_name}"
  title: "{target_title}"
  # ... static parts

# LLM preenche apenas:
tiers:
  # LLM: Analyze agents and organize into tiers

routing:
  # LLM: Define when to use each agent
```

---

## PHASE 7: INTEGRATION TEST

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| smoke_test_activation | Agent | **Worker** | Verificar arquivo existe e é válido |
| smoke_test_routing | Agent | **Worker** | Verificar referências existem |
| smoke_test_tasks | Agent | **Worker** | Verificar sintaxe YAML/MD |
| generate_test_report | Agent | **Worker** | Template + resultados |
| log_integration | Agent | **Worker** | Append YAML |

**Phase 7: 100% Worker** ✅

```bash
# Script: phase_7_integration.sh

smoke_test_activation() {
    local squad=$1
    local orchestrator="squads/$squad/agents/${squad}-chief.md"

    [[ ! -f "$orchestrator" ]] && { echo "FAIL: Orchestrator not found"; return 1; }
    [[ ! -s "$orchestrator" ]] && { echo "FAIL: Orchestrator is empty"; return 1; }

    # Check basic structure
    grep -q "^agent:" "$orchestrator" || { echo "FAIL: No agent section"; return 1; }

    echo "PASS: Orchestrator exists and has basic structure"
}

smoke_test_routing() {
    local squad=$1
    local config="squads/$squad/config.yaml"

    # Extract agents from tiers
    local agents=$(yq '.tiers[].agents[]' "$config" 2>/dev/null)

    for agent in $agents; do
        [[ ! -f "squads/$squad/agents/$agent.md" ]] && {
            echo "FAIL: Agent $agent in routing but file not found"
            return 1
        }
    done

    echo "PASS: All routed agents exist"
}
```

---

## PHASE 8: CLEANUP

| Step | Atual | Otimizado | Rationale |
|------|-------|-----------|-----------|
| confirm_cleanup | Agent | **Human** | ⚠️ Decisão destrutiva irreversível |
| remove_sources | Agent | **Worker** | `rm -rf` (após confirmação) |
| update_registry | Agent | **Worker** | Executar script |
| cleanup_workspace | Agent | **Worker** | `rm -rf` |
| log_cleanup | Agent | **Worker** | Append YAML |

**Phase 8: 80% Worker, 20% Human**

---

## 📊 ANÁLISE CONSOLIDADA

### Por Fase

| Phase | Worker | Agent | Hybrid | Human | Total Steps |
|-------|--------|-------|--------|-------|-------------|
| 0: Init | 5 | 0 | 0 | 0 | 5 |
| 1: Discovery | 9 | 0 | 0 | 0 | 9 |
| 2: Deduplication | 5 | 0 | 1 | 0 | 6 |
| 3: Scope | 5 | 0 | 0 | 0 | 5 |
| 4: Collection | 10 | 0 | 1 | 0 | 11 |
| 5: Validation | 5 | 0 | 0 | 0 | 5 |
| 6: Structure | 6 | 2 | 0 | 0 | 8 |
| 7: Integration | 5 | 0 | 0 | 0 | 5 |
| 8: Cleanup | 4 | 0 | 0 | 1 | 5 |
| **TOTAL** | **54** | **2** | **2** | **1** | **59** |
| **%** | **91.5%** | **3.4%** | **3.4%** | **1.7%** | **100%** |

### Por Executor

```
┌─────────────────────────────────────────────────────────────────┐
│ EXECUTOR DISTRIBUTION                                           │
├─────────────────────────────────────────────────────────────────┤
│ Worker (Script)  ████████████████████████████████████████ 91.5% │
│ Agent (LLM)      ██                                        3.4% │
│ Hybrid           ██                                        3.4% │
│ Human            █                                         1.7% │
└─────────────────────────────────────────────────────────────────┘
```

### Custo Estimado

| Executor | Steps | Custo/Step | Total |
|----------|-------|------------|-------|
| Worker | 54 | $0.00 | $0.00 |
| Agent | 2 | $0.50 | $1.00 |
| Hybrid | 2 | $0.25 | $0.50 |
| Human | 1 | $5.00 | $5.00 |
| **TOTAL** | **59** | - | **$6.50** |

vs. Tudo com LLM: 59 × $0.50 = **$29.50** (4.5x mais caro)

### Tempo Estimado

| Executor | Steps | Tempo/Step | Total |
|----------|-------|------------|-------|
| Worker | 54 | 1s | 54s |
| Agent | 2 | 30s | 60s |
| Hybrid | 2 | 60s | 120s |
| Human | 1 | 300s | 300s |
| **TOTAL** | **59** | - | **~9 min** |

vs. Tudo com LLM: 59 × 30s = **~30 min** (3.3x mais lento)

---

## 🎯 ONDE LLM É REALMENTE NECESSÁRIO

### 1. semantic_match_detection (Phase 2)
**Por quê?** Precisa entender se dois agents fazem a mesma coisa com nomes diferentes.

**Mitigação:** Manter mapa estático de sinônimos conhecidos. LLM só para casos novos.

### 2. handle_conflicts (Phase 4)
**Por quê?** Quando dois arquivos têm mesmo nome mas conteúdo diferente, precisa decidir qual manter ou como mergear.

**Mitigação:** Em YOLO mode, sempre escolher o maior. LLM só em QUALITY mode.

### 3. generate_config - tiers/routing (Phase 6)
**Por quê?** Organizar agents em tiers requer entender a função de cada um.

**Mitigação:** Se squads fonte já têm tiers, herdar. LLM só para reconciliar.

### 4. create_orchestrator (Phase 6)
**Por quê?** Gerar agent completo com voice_dna, comandos, etc.

**Mitigação:** Template pesado + LLM só para partes criativas.

---

## 🔧 ARQUITETURA OTIMIZADA

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUSION WORKFLOW v3.0                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                                │
│  │   CLI/UI    │  ← Human input (sources, target, domain)      │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  Phase 0-1  │────▶│  Phase 2-5  │────▶│  Phase 6-7  │       │
│  │   WORKER    │     │   WORKER    │     │ WORKER+LLM  │       │
│  │  (100%)     │     │  (~95%)     │     │  (75/25)    │       │
│  └─────────────┘     └──────┬──────┘     └──────┬──────┘       │
│                             │                    │               │
│                             ▼                    ▼               │
│                      ┌─────────────┐      ┌─────────────┐       │
│                      │   LLM Call  │      │   LLM Call  │       │
│                      │ (semantic   │      │ (tiers +    │       │
│                      │  dedup)     │      │  orchestr.) │       │
│                      └─────────────┘      └─────────────┘       │
│                                                                 │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │  Phase 8    │  ← Human confirmation (cleanup)               │
│  │   WORKER    │                                                │
│  └─────────────┘                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE SCRIPTS

```
squads/squad-creator/scripts/fusion/
├── fusion.sh                    # Orchestrator principal
├── lib/
│   ├── common.sh               # Funções compartilhadas
│   ├── inventory.sh            # Phase 1
│   ├── dedup.sh                # Phase 2 (parte determinística)
│   ├── scope.sh                # Phase 3
│   ├── collection.sh           # Phase 4
│   ├── validation.sh           # Phase 5
│   ├── structure.sh            # Phase 6 (parte determinística)
│   └── integration.sh          # Phase 7
├── config/
│   ├── semantic_duplicates_map.yaml
│   └── domain_keywords/
│       ├── paid_traffic.yaml
│       ├── copywriting.yaml
│       └── ...
├── templates/
│   ├── config.yaml.tmpl
│   ├── readme.md.tmpl
│   └── audit_log.yaml.tmpl
└── llm/
    ├── semantic_dedup_prompt.md    # Prompt para dedup semântico
    ├── tier_organization_prompt.md  # Prompt para organizar tiers
    └── orchestrator_prompt.md       # Prompt para criar orchestrator
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar scripts shell** para as partes Worker (91.5%)
2. **Criar prompts específicos** para as 4 chamadas LLM necessárias
3. **Criar CLI** para orquestrar tudo
4. **Testar em YOLO mode** (sem humano, LLM mínimo)
5. **Testar em QUALITY mode** (com checkpoints)

---

*Análise gerada pelo Executor Matrix Framework v1.0*
*Data: 2026-02-03*
