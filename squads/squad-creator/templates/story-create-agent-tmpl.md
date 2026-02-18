# Story Template: Create Agent (Workflow-First)

> **Template ID:** story-create-agent-tmpl
> **Version:** 1.0.0
> **Purpose:** Story de criação de agent que EXECUTA workflows ao invés de especificar inline
> **Problem Solved:** Stories que especificam agents inline geram agents genéricos/fracos

---

## IMPORTANTE: O Que Este Template Resolve

**Problema Anterior:**
```
Story continha:
├── 200+ linhas de YAML do agent (especificação completa)
└── Executor apenas copiava o YAML

Resultado: Agents genéricos, sem profundidade, sem DNA real
```

**Solução Deste Template:**
```
Story contém:
├── REFERÊNCIA aos workflows de criação
├── INPUTS necessários
└── CRITÉRIOS de aceite

Executor: EXECUTA os workflows → Agent com profundidade real
```

---

# Story {{EPIC}}.{{STORY}}: Criar Agent {{AGENT_NAME}}

**Epic:** {{EPIC_NUMBER}} - {{EPIC_NAME}}
**Status:** Not Started
**Prioridade:** {{PRIORITY}}
**Dependência:** {{DEPENDENCY}} (pesquisa/KB)

---

## 1. Descrição

Criar o agent `{{agent_id}}` executando o workflow de criação apropriado.

## 2. Tipo de Agent

```yaml
agent_type: "{{TYPE}}"  # mind_clone | functional | hybrid

# SE mind_clone (baseado em expert real):
#   → OBRIGATÓRIO executar wf-clone-mind.yaml
#   → OBRIGATÓRIO ter fontes (livros, podcasts, artigos)
#
# SE functional (orchestrator, validator, executor):
#   → Pode usar create-agent.md direto
#   → Fontes não obrigatórias, mas recomendadas
#
# SE hybrid (funcional com elementos de expert):
#   → Executar extract-thinking-dna.md
#   → Pode pular extract-voice-dna.md
```

## 3. Workflow de Execução

### Para Agents mind_clone (baseados em experts reais)

```yaml
workflow: "wf-clone-mind.yaml"

phases_to_execute:
  - phase: 0b
    name: "Source Collection"
    task: "collect-sources.md"
    inputs:
      mind_name: "{{MIND_NAME}}"
      domain: "{{DOMAIN}}"
      sources_path: "{{SOURCES_PATH}}"  # KB criada na story anterior
    checkpoint: "SOURCE_QUALITY (blocking)"

  - phase: 1
    name: "Voice DNA Extraction"
    task: "extract-voice-dna.md"
    checkpoint: "VOICE_QUALITY (score >= 6/7)"

  - phase: 2
    name: "Thinking DNA Extraction"
    task: "extract-thinking-dna.md"
    checkpoint: "THINKING_QUALITY (score >= 5/6)"

  - phase: 3
    name: "Synthesis"
    output: "mind_dna_complete.yaml"

  - phase: 4
    name: "Smoke Tests"
    checkpoint: "SMOKE_TEST (3/3 must pass)"

final_step:
  task: "create-agent.md"
  template: "agent-tmpl.md"
  input: "mind_dna_complete.yaml"
  output: "squads/{{PACK}}/agents/{{agent_id}}.md"
```

### Para Agents functional (orchestrators, validators, executors)

```yaml
workflow: "create-agent.md (direct)"

phases_to_execute:
  - phase: 1
    name: "Research Domain"
    action: "Pesquisar best practices do domínio"
    min_sources: 3

  - phase: 2
    name: "Extract Thinking DNA"
    task: "extract-thinking-dna.md"
    focus: "frameworks operacionais, heurísticas, decision trees"

  - phase: 3
    name: "Create Agent"
    task: "create-agent.md"
    template: "agent-tmpl.md"

final_step:
  output: "squads/{{PACK}}/agents/{{agent_id}}.md"
```

## 4. Inputs Necessários

```yaml
inputs:
  # Obrigatórios
  agent_id: "{{agent_id}}"
  agent_name: "{{AGENT_NAME}}"
  pack_name: "{{PACK}}"
  tier: {{TIER}}
  domain: "{{DOMAIN}}"

  # Para mind_clone
  mind_name: "{{MIND_NAME}}"  # Nome do expert
  sources_path: "{{KB_PATH}}"  # KB da story anterior

  # Para functional
  purpose: "{{PURPOSE}}"
  workflows_covered: [{{WORKFLOW_IDS}}]

  # Opcional
  base_knowledge: "data/{{KB_FILE}}.md"
```

## 5. Workflows Cobertos por Este Agent

| ID | Workflow | Descrição |
|----|----------|-----------|
| {{WF_ID_1}} | {{WF_NAME_1}} | {{WF_DESC_1}} |
| {{WF_ID_2}} | {{WF_NAME_2}} | {{WF_DESC_2}} |
| ... | ... | ... |

## 6. Critérios de Aceite

### Quality Gates (Todos Devem Passar)

```yaml
quality_gates:
  SC_AGT_001:  # Structure Gate
    - "[ ] Agent file exists at squads/{{PACK}}/agents/{{agent_id}}.md"
    - "[ ] Agent file >= 300 lines"
    - "[ ] YAML structure válido"

  SC_AGT_002:  # Content Gate
    - "[ ] Level 1 (Identity) completo"
    - "[ ] Level 2 (Operational) com 1+ framework"
    - "[ ] Level 3 (Voice DNA) com vocabulary.always_use (5+)"
    - "[ ] Level 4 (QA) com 3+ output_examples"
    - "[ ] Level 6 (Integration) com handoffs"

  SC_AGT_003:  # Depth Gate (NEW)
    - "[ ] Frameworks têm TEORIA (o porquê), não só passos"
    - "[ ] Heurísticas têm EXEMPLOS de aplicação"
    - "[ ] Voice DNA é distinguível (não genérico)"
    - "[ ] Anti-patterns têm RAZÃO explicada"

  SMOKE_TEST:  # Behavioral Gate
    - "[ ] Test 1: Conhecimento do domínio - PASS"
    - "[ ] Test 2: Tomada de decisão - PASS"
    - "[ ] Test 3: Resposta a objeção - PASS"
```

### Checklist Final

- [ ] Agent criado via workflow (não copiado de especificação inline)
- [ ] DNA extraído de fontes reais
- [ ] Smoke tests executados e passando
- [ ] Handoffs configurados para outros agents do squad
- [ ] Commands mapeados para tasks existentes

## 7. Arquivo de Saída

```
squads/{{PACK}}/agents/{{agent_id}}.md
```

---

## ANTI-PATTERN: O Que NÃO Fazer

```yaml
# ❌ ERRADO: Story com especificação inline
story_antiga:
  descricao: "Criar agent X"
  conteudo: |
    agent:
      name: "X"
      # ... 200 linhas de YAML
    # O executor só copia isso

# ✅ CORRETO: Story que referencia workflow
story_nova:
  descricao: "Criar agent X via wf-clone-mind.yaml"
  workflow: "wf-clone-mind.yaml"
  inputs: [...]
  # O executor EXECUTA o workflow completo
```

---

## Exemplo de Uso

### Story 2.4: Criar Agent mei-specialist (Versão Correta)

```markdown
# Story 2.4: Criar Agent mei-specialist

**Epic:** 2 - Tier 0 Agents
**Status:** Not Started
**Dependência:** Story 2.3 (KB MEI)

## Tipo de Agent
agent_type: "functional"  # Não é clone de expert específico

## Workflow de Execução
workflow: "create-agent.md"

phases:
  - phase: 1
    name: "Research Domain"
    action: "Usar KB criada em story 2.3"
    source: "data/mei-kb.md"

  - phase: 2
    name: "Extract Thinking DNA"
    task: "extract-thinking-dna.md"
    focus: "Heurísticas de MEI, decision trees de limite"

  - phase: 3
    name: "Create Agent"
    template: "agent-tmpl.md"

## Inputs
inputs:
  agent_id: "mei-specialist"
  pack_name: "contabilidade"
  tier: 0
  domain: "MEI"
  base_knowledge: "data/mei-kb.md"
  workflows_covered: [MEI-01, MEI-02, MEI-03, MEI-04, MEI-05]

## Critérios de Aceite
- [ ] Passa SC_AGT_001, SC_AGT_002, SC_AGT_003
- [ ] Smoke tests 3/3
- [ ] Heurísticas de limite com TEORIA (por que 60/80/95%)
- [ ] Voice DNA distinguível (não genérico)

## Arquivo de Saída
squads/contabilidade/agents/mei-specialist.md
```

---

**Squad Creator | Story Template v1.0**
*"Stories reference workflows, don't replace them"*
