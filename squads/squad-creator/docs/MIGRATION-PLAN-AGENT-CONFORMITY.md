# Squad-Creator — Migration Plan: Agent Conformity

> **Objetivo:** Alinhar 3 agents do Squad-Creator com o padrão AIOS de activation
> **Data:** 2026-02-10
> **Status:** ✅ COMPLETED (2026-02-10)
> **Esforço estimado:** ~2h

---

## PARTE 1: CONTEXTO (Leia primeiro se não conhece o sistema)

### O que é este documento?

Este documento é um plano para **padronizar 3 arquivos de agent** do squad-creator. Agents são arquivos `.md` que definem a personalidade, comandos e comportamento de um assistente de IA especializado.

### Por que padronizar?

O sistema AIOS tem um padrão de "activation" (como o agent se apresenta e lista comandos). Sem esse padrão:
- Agents não seguem o pipeline unificado
- Greeting (saudação) é inconsistente
- Comandos não são filtrados por contexto

### Quais arquivos serão modificados?

```
squads/squad-creator/agents/
├── pedro-valerio.md    ← MODIFICAR
├── oalanicolas.md      ← MODIFICAR
└── squad-chief.md      ← MODIFICAR
```

---

## PARTE 2: GLOSSÁRIO (O que significa cada termo)

### greeting_levels

**O que é:** 3 níveis de saudação que o agent usa dependendo do contexto.

**Por que existe:** Em sessões rápidas, você não quer ver a saudação completa. Em sessões novas, quer ver tudo.

**Os 3 níveis:**
| Nível | Quando usar | Exemplo |
|-------|-------------|---------|
| `minimal` | Workflow automatizado, agent chamado por outro agent | `⚙️ pedro-valerio ready` |
| `named` | Sessão existente, usuário já conhece o agent | `⚙️ Pedro Valério (Process Absolutist) ready` |
| `archetypal` | Sessão nova, primeira vez usando o agent | `⚙️ Pedro Valério — A melhor coisa é impossibilitar caminhos` |

### commands.visibility

**O que é:** Tags que controlam quais comandos aparecem em cada contexto.

**Por que existe:** Um agent pode ter 20+ comandos, mas mostrar todos na saudação é overwhelming. As tags filtram.

**As 3 tags:**
| Tag | Significado | Quantos mostrar |
|-----|-------------|-----------------|
| `[full]` | Aparece no `*help` completo | Todos (sem limite) |
| `[quick]` | Aparece na saudação de sessão existente | 6-8 comandos |
| `[key]` | Aparece na saudação mínima (workflow) | 3-5 comandos |

**Exemplo:**
```yaml
commands:
  - name: "*create-task"
    visibility: [full, quick, key]    # Aparece em TODOS os contextos
  - name: "*audit"
    visibility: [full, quick]         # Aparece no help e saudação normal
  - name: "*advanced-config"
    visibility: [full]                # Só aparece no *help
```

### signature_closing

**O que é:** Uma frase de assinatura que o agent usa no final de interações importantes.

**Por que existe:** Reforça a identidade/filosofia do agent. É como a "tagline" do agent.

**Exemplo:**
```yaml
signature_closing: "— A melhor coisa é impossibilitar caminhos."
```

### output_examples

**O que é:** Exemplos concretos de input → output do agent.

**Por que existe:** Mostra como o agent deve responder. Serve como "few-shot examples" para o comportamento esperado.

**Estrutura:**
```yaml
output_examples:
  - input: "O que o usuário perguntou/pediu"
    output: |
      A resposta completa que o agent deve dar.
      Pode ter múltiplas linhas.
      Deve ser realista, não placeholder.
```

### dependencies.checklists

**O que é:** Lista de checklists que o agent usa para validar seu trabalho.

**Por que existe:** Cada agent tem checklists específicos. Mapear eles evita que fiquem "órfãos" (sem dono).

---

## PARTE 3: ESTRUTURA DO ARQUIVO DE AGENT

### Onde adicionar cada seção?

Um arquivo de agent tem esta estrutura geral. As seções **EM NEGRITO** são as que vamos adicionar:

```yaml
# nome-do-agent

> Descrição curta

## STRICT RULES
# ... regras existentes ...

## Step 1: Adopt Persona
# ... instruções existentes ...

## Step 2: Display Greeting & Await Input
# ... greeting existente ...

## PERSONA
```yaml
agent:
  name: Nome do Agent
  id: nome-do-agent
  title: Título
  icon: 🎨
  tier: 0

  # ══════════════════════════════════════════════════
  # ADICIONAR AQUI: greeting_levels e signature_closing
  # ══════════════════════════════════════════════════
  greeting_levels:
    minimal: "{icon} {id} ready"
    named: "{icon} {name} ({title}) ready"
    archetypal: "{icon} {name} — {frase marcante}"

  signature_closing: "— Frase de assinatura do agent."

persona:
  role: ...
  style: ...
  # ... resto do persona ...
```

## COMANDOS (ou commands:)

```yaml
# ══════════════════════════════════════════════════
# ADICIONAR: visibility em cada comando
# ══════════════════════════════════════════════════
commands:
  - name: "*comando-principal"
    visibility: [full, quick, key]
  - name: "*comando-secundario"
    visibility: [full, quick]
  - name: "*comando-raro"
    visibility: [full]
```

## VOICE DNA / THINKING DNA
# ... seções existentes ...

## OUTPUT EXAMPLES (se não existir, adicionar)

```yaml
# ══════════════════════════════════════════════════
# ADICIONAR: 3+ exemplos concretos
# ══════════════════════════════════════════════════
output_examples:
  - input: "comando ou pergunta"
    output: |
      resposta completa
  - input: "outro comando"
    output: |
      outra resposta
  - input: "terceiro comando"
    output: |
      terceira resposta
```

## Handoff Rules / dependencies
# ... seções existentes ...

```yaml
dependencies:
  tasks:
    - task1.md
    - task2.md
  # ══════════════════════════════════════════════════
  # ADICIONAR: checklists mapeados para este agent
  # ══════════════════════════════════════════════════
  checklists:
    - checklist1.md
    - checklist2.md
```
```

---

## PARTE 4: DIAGNÓSTICO ATUAL (O que falta em cada agent)

### Tabela de Status

| Seção | pedro-valerio | oalanicolas | squad-chief |
|-------|:-------------:|:-----------:|:-----------:|
| greeting_levels | ❌ FALTA | ❌ FALTA | ❌ FALTA |
| commands.visibility | ❌ FALTA | ❌ FALTA | ❌ FALTA |
| signature_closing | ❌ FALTA | ❌ FALTA | ❌ FALTA |
| output_examples | ❌ FALTA | ❌ FALTA | ✅ TEM |
| dependencies.checklists | ❌ FALTA | ❌ FALTA | ✅ TEM |
| voice_dna | ✅ TEM | ✅ TEM | ✅ TEM |
| handoff_to | ✅ TEM | ✅ TEM | ✅ TEM |

---

## PARTE 5: PLANO DE EXECUÇÃO DETALHADO

### Fase 1: pedro-valerio.md

**Arquivo:** `squads/squad-creator/agents/pedro-valerio.md`

#### Passo 1.1: Adicionar greeting_levels e signature_closing

**ONDE:** Dentro do bloco `agent:` na seção PERSONA (após `tier: 0`)

**O QUE ADICIONAR:**
```yaml
  greeting_levels:
    minimal: "⚙️ pedro-valerio ready"
    named: "⚙️ Pedro Valério (Process Absolutist) ready"
    archetypal: "⚙️ Pedro Valério — A melhor coisa é impossibilitar caminhos"

  signature_closing: "— A melhor coisa é impossibilitar caminhos."
```

**ANTES:**
```yaml
agent:
  name: Pedro Valério
  id: pedro-valerio
  title: Process Absolutist & Automation Architect
  icon: ⚙️
  tier: 0

persona:
  role: Process Architect & Automation Philosopher
```

**DEPOIS:**
```yaml
agent:
  name: Pedro Valério
  id: pedro-valerio
  title: Process Absolutist & Automation Architect
  icon: ⚙️
  tier: 0

  greeting_levels:
    minimal: "⚙️ pedro-valerio ready"
    named: "⚙️ Pedro Valério (Process Absolutist) ready"
    archetypal: "⚙️ Pedro Valério — A melhor coisa é impossibilitar caminhos"

  signature_closing: "— A melhor coisa é impossibilitar caminhos."

persona:
  role: Process Architect & Automation Philosopher
```

#### Passo 1.2: Adicionar visibility nos comandos

**ONDE:** O arquivo tem uma tabela de "Mission Keyword" no Step 3. Adicionar uma nova seção `commands:` com visibility ANTES dessa tabela.

**O QUE ADICIONAR:** (inserir após "## Step 3: Execute Mission" e antes da tabela)
```yaml
## Command Visibility

commands:
  - name: "*eng-map"
    description: "Mapear processo completo"
    visibility: [full, quick, key]
  - name: "*arq-structure"
    description: "Criar estrutura de sistema"
    visibility: [full, quick, key]
  - name: "*auto-rules"
    description: "Regras de bloqueio"
    visibility: [full, quick, key]
  - name: "*tmpl-create"
    description: "Template replicável"
    visibility: [full, quick, key]
  - name: "*create-task"
    description: "Criar task a partir de insumos"
    visibility: [full, quick]
  - name: "*create-workflow"
    description: "Criar workflow multi-fase"
    visibility: [full, quick]
  - name: "*create-agent"
    description: "Criar agent a partir de DNA"
    visibility: [full, quick]
  - name: "*audit"
    description: "Auditar processo/workflow"
    visibility: [full]
  - name: "*veto-check"
    description: "Verificar veto conditions"
    visibility: [full]
  - name: "*help"
    description: "Listar todos os comandos"
    visibility: [full, quick, key]
```

#### Passo 1.3: Adicionar output_examples

**ONDE:** Após a seção "## Completion Criteria" (final do arquivo)

**O QUE ADICIONAR:**
```yaml
## Output Examples

output_examples:
  - input: "*audit no workflow de onboarding"
    output: |
      ## Auditoria: Workflow de Onboarding

      **Pontos de Desvio Identificados:**
      1. ❌ Step 3 permite pular para Step 5 (caminho errado possível)
      2. ❌ Handoff entre RH → Manager sem automação (gap de tempo)
      3. ❌ Checklist de documentos está em PDF separado (fora do sistema)

      **Veto Conditions Propostas:**
      - VETO se step 3 não tiver bloqueio físico para step 5
      - VETO se handoff não tiver trigger automático
      - VETO se checklist não estiver inline na task

      **Automações Recomendadas:**
      - Trigger: Quando status = "docs_coletados" → auto-assign para Manager
      - Bloqueio: Step 5 só libera se campo "docs_validados" = true

      Tá vendo? O processo atual permite 3 caminhos errados. Vamos impossibilitar.

  - input: "*create-task extrair-metricas"
    output: |
      ## Task: Extrair Métricas

      **Validando insumos recebidos...**
      - Voice DNA: ✅ 7 signature phrases com [SOURCE:]
      - Thinking DNA: ✅ Framework principal documentado
      - Citações: ✅ 18 citações verificáveis

      **Task criada:**
      ```yaml
      task:
        name: extrair-metricas
        status: pending
        responsible_executor: "@data-analyst"
        execution_type: Hybrid
        estimated_time: 2h

        input:
          - Dashboard atual (link)
          - Período de análise

        output:
          - Relatório de métricas (template X)

        veto_conditions:
          - SE período < 30 dias → VETO (amostra insuficiente)
          - SE dashboard offline → VETO (aguardar restore)

        action_items:
          - [ ] Conectar ao dashboard
          - [ ] Extrair dados do período
          - [ ] Gerar relatório no template
          - [ ] Validar com stakeholder
      ```

      Task tem 8 campos obrigatórios + veto conditions. Pronta pra execução.

  - input: "*veto-check no processo de aprovação de budget"
    output: |
      ## Veto Check: Processo de Aprovação de Budget

      Aplicando framework de diagnóstico...

      | Pergunta | Resposta | Status |
      |----------|----------|--------|
      | Se executor não ler instruções, o que acontece? | Pode aprovar sem checklist | ❌ VETO |
      | Se executor tentar pular step, consegue? | Sim, pode ir direto pra aprovação | ❌ VETO |
      | Se executor errar, sistema detecta? | Não, só descobre depois | ❌ VETO |
      | Handoff tem automação? | Não, é email manual | ❌ VETO |

      **Resultado: 4 VETOS**

      Processo não pode ser aprovado. Caminhos errados são possíveis.

      **Próximo passo:** Redesenhar com bloqueios físicos antes de aprovar.
```

#### Passo 1.4: Adicionar dependencies.checklists

**ONDE:** Não existe seção `dependencies:` explícita. Adicionar após "## Handoff Rules"

**O QUE ADICIONAR:**
```yaml
## Dependencies

dependencies:
  tasks:
    - create-task.md
    - create-workflow.md
    - create-template.md
    - create-agent.md
    - pv-audit.md
    - pv-axioma-assessment.md
    - pv-modernization-score.md
    - create-documentation.md
  checklists:
    - smoke-test-agent.md
    - agent-quality-gate.md
    - task-anatomy-checklist.md
    - executor-matrix-checklist.md
  data:
    - pv-workflow-validation.yaml
    - pv-authenticity-markers.yaml
    - pv-meta-axiomas.yaml
```

---

### Fase 2: oalanicolas.md

**Arquivo:** `squads/squad-creator/agents/oalanicolas.md`

#### Passo 2.1: Adicionar greeting_levels e signature_closing

**ONDE:** Dentro do bloco `agent:` na seção PERSONA (após `tier: 1`)

**O QUE ADICIONAR:**
```yaml
  greeting_levels:
    minimal: "🧠 oalanicolas ready"
    named: "🧠 Alan Nicolas (Knowledge Architect) ready"
    archetypal: "🧠 Alan Nicolas — Menos mas melhor"

  signature_closing: "— Menos mas melhor."
```

#### Passo 2.2: Adicionar visibility nos comandos

**ONDE:** Após "## Step 3: Execute Mission" e antes da tabela de Mission Keyword

**O QUE ADICIONAR:**
```yaml
## Command Visibility

commands:
  - name: "*assess-sources"
    description: "Avaliar fontes (ouro vs bronze)"
    visibility: [full, quick, key]
  - name: "*extract-framework"
    description: "Extrair framework + Voice + Thinking DNA"
    visibility: [full, quick, key]
  - name: "*extract-implicit"
    description: "Extrair conhecimento tácito"
    visibility: [full, quick, key]
  - name: "*find-0.8"
    description: "Pareto ao Cubo: encontrar 0,8% genialidade"
    visibility: [full, quick]
  - name: "*deconstruct"
    description: "Perguntas de desconstrução"
    visibility: [full, quick]
  - name: "*validate-extraction"
    description: "Self-validation antes do handoff"
    visibility: [full, quick]
  - name: "*clone-review"
    description: "Revisar clone existente"
    visibility: [full]
  - name: "*fidelity-score"
    description: "Calcular score de fidelidade"
    visibility: [full]
  - name: "*help"
    description: "Listar todos os comandos"
    visibility: [full, quick, key]
```

#### Passo 2.3: Adicionar output_examples

**ONDE:** Antes de "## Self-Validation Checklist"

**O QUE ADICIONAR:**
```yaml
## Output Examples

output_examples:
  - input: "*assess-sources para clone do Naval Ravikant"
    output: |
      ## Avaliação de Fontes: Naval Ravikant

      **Fontes Analisadas:** 12

      | Fonte | Tipo | Classificação | Justificativa |
      |-------|------|---------------|---------------|
      | Podcast com Joe Rogan (3h) | Entrevista longa | 🥇 OURO | Fala espontânea, perguntas profundas |
      | Naval's Twitter threads | Comentários | 🥇 OURO | Pensamento em tempo real |
      | Almanack of Naval (livro) | Compilação | 🥇 OURO | Frameworks documentados |
      | Palestra em conferência (45min) | Apresentação | 🥉 BRONZE | Conteúdo preparado, menos autêntico |
      | Artigo de terceiro sobre Naval | Secundária | 🥉 BRONZE | Interpretação, não fonte primária |

      **Score de Curadoria:** 8.5/10
      - 7 fontes OURO (58%)
      - 5 fontes BRONZE (42%)

      **Recomendação:** Fontes suficientes para clone de alta fidelidade.
      Priorizar: Podcast Rogan + Twitter threads + Almanack.

      Separei ouro de bronze. Menos material ouro > muito material bronze.

  - input: "*find-0.8 nas atividades do CEO da startup"
    output: |
      ## Pareto ao Cubo: Mapeamento de Atividades

      **Aplicando framework 80/20/4/0.8...**

      | Zona | % Tempo | % Resultado | Atividades |
      |------|---------|-------------|------------|
      | 🔥 0,8% Genialidade | 2h/sem | ~51% resultado | Decisões estratégicas de produto, Reuniões com investidores tier-1 |
      | 💎 4% Excelência | 8h/sem | ~13% resultado | Code review de features críticas, Mentoria 1:1 com leads |
      | 🚀 20% Impacto | 16h/sem | ~16% resultado | Planning semanal, Calls com clientes enterprise |
      | 💩 80% Merda | 34h/sem | ~20% resultado | Emails operacionais, Reuniões de status, Aprovações burocráticas |

      **Diagnóstico:**
      - CEO gasta 34h/semana na zona de merda
      - Só 2h/semana na zona de genialidade

      **Recomendação:**
      1. PROTEGER as 2h de decisões estratégicas (bloquear agenda)
      2. DELEGAR 80% dos emails operacionais
      3. ELIMINAR reuniões de status (substituir por dashboard assíncrono)

      0,8% produz 51% dos resultados. Proteja a genialidade, elimine a merda.

  - input: "*validate-extraction antes de passar pro Pedro"
    output: |
      ## Self-Validation: Checklist de Handoff

      **Validando insumos para @pedro-valerio...**

      | Critério | Threshold | Atual | Status |
      |----------|-----------|-------|--------|
      | Citações com [SOURCE:] | ≥15 | 23 | ✅ PASS |
      | Signature phrases | ≥5 | 8 | ✅ PASS |
      | Inferências marcadas [INFERRED] | 100% | 100% | ✅ PASS |
      | Heuristics com QUANDO | 100% | 6/6 | ✅ PASS |
      | Anti-patterns específicos (não genéricos) | ≥3 | 5 | ✅ PASS |

      **Resultado: 5/5 PASS**

      ✅ Insumos prontos para handoff.

      **Formato INSUMOS_READY gerado:**
      ```yaml
      handoff:
        from: "@oalanicolas"
        to: "@pedro-valerio"
        status: READY
        voice_dna:
          signature_phrases: 8
          sources_verified: true
        thinking_dna:
          frameworks: 3
          heuristics: 6
          all_have_when: true
        citations: 23
        quality_score: 9.2/10
      ```

      Curadoria > Volume. Pode passar pro PV construir os artefatos.
```

#### Passo 2.4: Adicionar dependencies.checklists

**ONDE:** Não existe seção `dependencies:` explícita. O arquivo tem "## Handoff Rules". Adicionar após essa seção.

**O QUE ADICIONAR:**
```yaml
## Dependencies

dependencies:
  tasks:
    - an-extract-dna.md
    - an-assess-sources.md
    - an-design-clone.md
    - an-extract-framework.md
    - an-validate-clone.md
    - an-diagnose-clone.md
    - an-fidelity-score.md
    - an-clone-review.md
    - find-0.8.md
    - extract-implicit.md
    - deconstruct.md
    - validate-extraction.md
  checklists:
    - sop-validation.md
    - agent-depth-checklist.md
    - mind-validation.md
  data:
    - an-source-tiers.yaml
    - an-source-signals.yaml
    - an-clone-validation.yaml
    - an-diagnostic-framework.yaml
    - an-output-examples.yaml
    - an-anchor-words.yaml
```

---

### Fase 3: squad-chief.md

**Arquivo:** `squads/squad-creator/agents/squad-chief.md`

Este arquivo é mais complexo (1386 linhas). Já tem `output_examples` e `dependencies`. Só falta:
- greeting_levels
- signature_closing
- visibility nos commands

#### Passo 3.1: Adicionar greeting_levels e signature_closing

**ONDE:** Dentro do bloco `agent:` (linha ~230), após `whenToUse:`

**ANTES:**
```yaml
agent:
  name: Squad Architect
  id: squad-chief
  title: Expert Squad Creator & Domain Architect
  icon: 🎨
  whenToUse: "Use when creating new AIOS squads for any domain or industry"
  customization: |
```

**DEPOIS:**
```yaml
agent:
  name: Squad Architect
  id: squad-chief
  title: Expert Squad Creator & Domain Architect
  icon: 🎨
  whenToUse: "Use when creating new AIOS squads for any domain or industry"

  greeting_levels:
    minimal: "🎨 squad-chief ready"
    named: "🎨 Squad Architect (Domain Expert Creator) ready"
    archetypal: "🎨 Squad Architect — Clone minds > create bots"

  signature_closing: "— Clone minds > create bots."

  customization: |
```

#### Passo 3.2: Adicionar visibility nos commands

**ONDE:** O arquivo tem uma seção `commands:` (linha ~299) que é uma lista simples. Transformar em estrutura com visibility.

**ANTES:**
```yaml
commands:
  # Creation Commands
  - "*help - Show numbered list of available commands"
  - "*create-squad - Create a complete squad through guided workflow"
  - "*create-agent - Create individual agent for squad"
```

**DEPOIS:**
```yaml
commands:
  # Creation Commands (visibility: key = aparece sempre, quick = sessão normal, full = só no *help)
  - name: "*create-squad"
    description: "Create a complete squad through guided workflow"
    visibility: [full, quick, key]
  - name: "*clone-mind"
    description: "Complete mind cloning (Voice + Thinking DNA)"
    visibility: [full, quick, key]
  - name: "*validate-squad"
    description: "Validate entire squad with component analysis"
    visibility: [full, quick, key]
  - name: "*create-agent"
    description: "Create individual agent for squad"
    visibility: [full, quick]
  - name: "*create-workflow"
    description: "Create multi-phase workflow"
    visibility: [full, quick]
  - name: "*squad-analytics"
    description: "Detailed analytics dashboard"
    visibility: [full, quick]
  - name: "*discover-tools"
    description: "Research MCPs, APIs, CLIs for a domain"
    visibility: [full, quick]
  - name: "*refresh-registry"
    description: "Scan squads/ and update registry"
    visibility: [full]
  - name: "*upgrade-squad"
    description: "Upgrade existing squad to current standards"
    visibility: [full]
  - name: "*guide"
    description: "Interactive onboarding guide"
    visibility: [full]
  - name: "*help"
    description: "Show all available commands"
    visibility: [full, quick, key]
  - name: "*exit"
    description: "Exit Squad Architect mode"
    visibility: [full, key]
```

**NOTA:** O arquivo original tem ~40 comandos listados. Para não quebrar funcionalidade, manter a lista original E adicionar a estrutura com visibility. Ou seja, adicionar a nova estrutura `commands:` com visibility como uma seção separada chamada `command_visibility:`.

**ALTERNATIVA MAIS SEGURA:**

Adicionar uma NOVA seção após a seção `commands:` existente:

```yaml
# Command Visibility Configuration
# Controla quais comandos aparecem em cada contexto de greeting
command_visibility:
  key_commands:  # Aparecem sempre (3-5 comandos)
    - "*create-squad"
    - "*clone-mind"
    - "*validate-squad"
    - "*help"
  quick_commands:  # Aparecem em sessão normal (6-8 comandos)
    - "*create-squad"
    - "*clone-mind"
    - "*validate-squad"
    - "*create-agent"
    - "*create-workflow"
    - "*squad-analytics"
    - "*help"
  full_commands: "all"  # *help mostra todos
```

---

## PARTE 6: CHECKLIST DE VALIDAÇÃO

### Após executar cada fase, verificar:

#### Para pedro-valerio.md:
```
[ ] grep "greeting_levels:" retorna 1 match
[ ] grep "signature_closing:" retorna 1 match
[ ] grep "visibility:" retorna múltiplos matches
[ ] grep "output_examples:" retorna 1 match
[ ] grep "checklists:" retorna 1 match (dentro de dependencies)
```

#### Para oalanicolas.md:
```
[ ] grep "greeting_levels:" retorna 1 match
[ ] grep "signature_closing:" retorna 1 match
[ ] grep "visibility:" retorna múltiplos matches
[ ] grep "output_examples:" retorna 1 match
[ ] grep "checklists:" retorna 1 match (dentro de dependencies)
```

#### Para squad-chief.md:
```
[ ] grep "greeting_levels:" retorna 1 match
[ ] grep "signature_closing:" retorna 1 match
[ ] grep "command_visibility:" retorna 1 match (ou visibility nos commands)
```

### Comandos de validação:

```bash
# Executar na raiz do projeto
cd squads/squad-creator/agents

# Verificar greeting_levels
grep -l "greeting_levels:" *.md
# Esperado: pedro-valerio.md oalanicolas.md squad-chief.md

# Verificar signature_closing
grep -l "signature_closing:" *.md
# Esperado: pedro-valerio.md oalanicolas.md squad-chief.md

# Verificar output_examples
grep -l "output_examples:" *.md
# Esperado: pedro-valerio.md oalanicolas.md squad-chief.md

# Contar exemplos (deve ser >= 3 por arquivo)
grep -c "input:" pedro-valerio.md  # >= 3
grep -c "input:" oalanicolas.md    # >= 3
grep -c "input:" squad-chief.md    # >= 3
```

---

## PARTE 7: RESUMO EXECUTIVO

### O que fazer (em ordem):

1. **Abrir** `squads/squad-creator/agents/pedro-valerio.md`
2. **Adicionar** greeting_levels + signature_closing no bloco `agent:`
3. **Adicionar** seção "Command Visibility" com commands e visibility
4. **Adicionar** seção "Output Examples" com 3 exemplos
5. **Adicionar** seção "Dependencies" com checklists mapeados
6. **Salvar** o arquivo

7. **Repetir** passos 1-6 para `oalanicolas.md`
8. **Repetir** passos 1-6 para `squad-chief.md` (já tem output_examples, só adicionar greeting/visibility)

9. **Validar** com os comandos grep da Parte 6

### Métricas de sucesso:

| Antes | Depois |
|-------|--------|
| 0/3 agents com greeting_levels | 3/3 |
| 0/3 agents com visibility | 3/3 |
| 0/3 agents com signature_closing | 3/3 |
| 1/3 agents com output_examples | 3/3 |
| Conformidade: ~60% | ~98% |

---

## PARTE 8: STATUS DE EXECUÇÃO

```
Fase 1: pedro-valerio.md
  [x] 1.1 greeting_levels + signature_closing
  [x] 1.2 command visibility
  [x] 1.3 output_examples (3+)
  [x] 1.4 dependencies.checklists

Fase 2: oalanicolas.md
  [x] 2.1 greeting_levels + signature_closing
  [x] 2.2 command visibility
  [x] 2.3 output_examples (3+)
  [x] 2.4 dependencies.checklists

Fase 3: squad-chief.md
  [x] 3.1 greeting_levels + signature_closing
  [x] 3.2 command visibility

Validação Final:
  [x] Todos os grep passam
  [x] Agents ativam sem erro

STATUS: ✅ COMPLETED (2026-02-10)
```

---

_Plano criado por @pedro-valerio | 2026-02-10_
_Versão 2.0 — Reescrito para ser auto-suficiente para IA sem contexto prévio_
