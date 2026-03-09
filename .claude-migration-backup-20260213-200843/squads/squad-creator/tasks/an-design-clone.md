# Task: Design Clone Architecture

**Command:** `*design-clone`
**Execution Type:** Hybrid
**Load:** — (uses core knowledge)

## Purpose

Arquitetar um clone completo: contextos de uso, estagios, memoria, trindade por estagio.

## Workflow

### Step 1: Define Contexts

Perguntar ao usuario:
- "Em que situacoes esse clone vai ser usado?"
- "Ele precisa se comportar diferente dependendo do contexto?"

Mapear contextos:
- Vendas, suporte, educacao, consultoria, etc.
- Tipos de interlocutor (iniciante, avancado, hater, fa)

#### >>> CHECKPOINT: Impacto transformador <<<

```yaml
checkpoint_impacto:
  consult: "VALUES.impacto_transformador"
  question: "Contextos de uso geram TRANSFORMAÇÃO profunda ou resposta superficial?"
  if_transformador: "Prosseguir com design"
  if_superficial: "Redesenhar contextos para maximizar impacto"
  rationale: "Clone que responde perguntas = chatbot. Clone que transforma = valor."
```

### Step 2: Decide Stages

**Regra AN004**: SE comportamento muda por contexto → criar estagios.

Avaliar necessidade:
- Single-mode: Comportamento uniforme → prompt unico
- Multi-stage: Comportamento varia → estagios separados

#### >>> CHECKPOINTS: Estrutura + Autonomia <<<

```yaml
checkpoint_freedom_structure:
  consult: "PARADOXES.freedom_through_structure"
  question: "Estrutura proposta RESTRINGE agora para LIBERAR depois?"
  if_libera: "Design válido — investimento presente para ganho futuro"
  if_controla: "Redesenhar: estrutura deve servir à liberdade, não à burocracia"
  rationale: "Template é investimento: 2h documentando → 20h economizadas depois."

checkpoint_autonomia:
  consult: "OBSESSIONS.liberdade_autonomia_estrutural"
  question: "Design do clone HABILITA autonomia do usuário ou cria dependência?"
  if_autonomia: "Arquitetura que libera"
  if_dependencia: "Redesenhar para auto-suficiência"
  rationale: "Clone que cria dependência viola obsessão de autonomia."
```

Exemplos de estagios:
- Funil: boas-vindas → qualificacao → oferta
- Atendimento: triagem → suporte → escalacao
- Educacional: avaliacao → ensino → pratica
- Anti-hater: normal → modo pistola (ex: Hormozi)

### Step 3: Map Trinity per Stage

Para cada estagio, definir:

| Estagio | Playbook | Framework | Swipe File |
|---------|----------|-----------|------------|
| {nome} | Passo a passo | Regras SE/ENTAO | Exemplos reais |

#### >>> CHECKPOINT: Framework liberta ou aprisiona? <<<

```yaml
checkpoint_liberation:
  consult: "MODELS.frameworks_as_liberation"
  question: "Template/estrutura é rígida pra LIBERAR ou pra PRENDER?"
  if_libera: "Estrutura que habilita criatividade"
  if_prende: "Redesenhar: menos campos obrigatórios, mais guidance"
  rationale: "Framework-prisão = executor odeia. Framework-ferramenta = executor adota."
```

### Step 4: Define Memory & Context

- Que informacoes o clone precisa lembrar entre interacoes?
- Que contexto precisa receber a cada conversa?
- Limites de memoria (curta vs longa)

### Step 5: Generate Blueprint

#### >>> CHECKPOINT: Blueprint claro + rigidez libertadora <<<

```yaml
checkpoint_clarity_blueprint:
  consult: "MODELS.clarity_first"
  question: "Blueprint é CLARO o suficiente para implementar sem perguntas?"
  if_claro: "Blueprint válido"
  if_confuso: "Simplificar até ficar auto-explicativo"

checkpoint_rigidez_verificacao:
  consult: "PARADOXES.freedom_through_structure"
  question: "Blueprint é RÍGIDO para LIBERAR ou RÍGIDO para CONTROLAR?"
  if_liberar: "Rigidez libertadora confirmada"
  if_controlar: "Investigar onde rigidez controla em vez de liberando"
  rationale: "Paradoxo é feature. Clone que resolve perde nuance."
```

```yaml
clone_blueprint:
  mind: "{nome}"
  mode: "single|multi-stage"
  stages:
    - name: "{estagio}"
      trigger: "Quando ativa este estagio"
      playbook: "{resumo}"
      framework: "{regras SE/ENTAO}"
      swipe_file: "{exemplos}"
      tone: "{tom especifico}"
  memory:
    short_term: "{o que lembra na conversa}"
    long_term: "{o que persiste entre conversas}"
    context_required: "{info necessaria}"
  integration:
    platform: "{WhatsApp, web, etc}"
    handoff: "{quando escala para humano}"
  estimated_fidelity: "{%}"
```

## Completion Criteria

- [ ] Contextos de uso mapeados
- [ ] Decisao single vs multi-stage tomada
- [ ] Trindade mapeada por estagio
- [ ] Memoria/contexto definido
- [ ] Blueprint YAML gerado
