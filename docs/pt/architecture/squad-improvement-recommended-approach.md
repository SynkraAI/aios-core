<!-- Tradução: PT-BR | Original: /docs/en/architecture/squad-improvement-recommended-approach.md | Sincronização: 2026-01-26 -->

# Abordagem Recomendada: Sistema de Melhoria de Squads

> 🌐 [EN](../../architecture/squad-improvement-recommended-approach.md) | **PT** | [ES](../../es/architecture/squad-improvement-recommended-approach.md)

---

**Gerado em:** 2025-12-26
**Gerado por:** @architect (Aria)
**Funcionalidade:** Tarefas de Análise de Squad e Melhoria Contínua
**Story Proposta:** SQS-11

---

## Requisitos da Funcionalidade

**Descrição:** Criar tarefas para analisar squads existentes e adicionar/modificar componentes incrementalmente, permitindo melhoria contínua de squads sem recriá-los.

**Integração com API Necessária:** Não
**Alterações no Banco de Dados Necessárias:** Não

---

## Novas Tarefas Propostas

### 1. `*analyze-squad` - Analisar Squad Existente

**Propósito:** Escanear e analisar um squad existente, mostrando sua estrutura, componentes e oportunidades de melhoria.

**Uso:**
```bash
@squad-creator

*analyze-squad my-squad
# → Análise completa de my-squad

*analyze-squad my-squad --verbose
# → Análise detalhada com conteúdo dos arquivos

*analyze-squad my-squad --suggestions
# → Incluir sugestões geradas por IA
```

**Saída:**
- Visão geral do squad (nome, versão, autor)
- Inventário de componentes (tarefas, agentes, etc.)
- Análise de dependências
- Métricas de cobertura (quais diretórios estão vazios)
- Sugestões de melhoria

### 2. `*extend-squad` - Adicionar/Modificar Componentes

**Propósito:** Adicionar interativamente novos componentes a um squad existente.

**Uso:**
```bash
@squad-creator

*extend-squad my-squad
# → Modo interativo, pergunta o que adicionar

*extend-squad my-squad --add agent
# → Adicionar novo agente

*extend-squad my-squad --add task --agent my-agent
# → Adicionar nova tarefa para agente específico

*extend-squad my-squad --add workflow
# → Adicionar novo workflow

*extend-squad my-squad --story SQS-XX
# → Vincular alterações à story
```

**Componentes Suportados:**
| Componente | Flag | Cria |
|-----------|------|---------|
| Agente | `--add agent` | `agents/{name}.md` |
| Tarefa | `--add task` | `tasks/{agent}-{task}.md` |
| Workflow | `--add workflow` | `workflows/{name}.md` |
| Checklist | `--add checklist` | `checklists/{name}.md` |
| Template | `--add template` | `templates/{name}.md` |
| Ferramenta | `--add tool` | `tools/{name}.js` |
| Script | `--add script` | `scripts/{name}.js` |
| Dados | `--add data` | `data/{name}.yaml` |

---

## Tipo de Serviço

**Recomendação:** Serviço Utilitário (Tarefas internas + scripts)

**Justificativa:**
- Não é necessária integração com API externa
- Apenas operações no sistema de arquivos
- Segue padrões existentes do squad-creator
- Integra com validador/carregador existente

---

## Estrutura Sugerida

### Novos Arquivos de Tarefa

```
.aios-core/development/tasks/
├── squad-creator-analyze.md     # NOVO: *analyze-squad
└── squad-creator-extend.md      # NOVO: *extend-squad
```

### Novos Arquivos de Script

```
.aios-core/development/scripts/squad/
├── squad-analyzer.js            # NOVO: Lógica de análise
└── squad-extender.js            # NOVO: Lógica de extensão
```

### Arquivos Atualizados

```
.aios-core/development/agents/squad-creator.md  # Adicionar novos comandos
.aios-core/schemas/squad-schema.json            # (sem alterações necessárias)
```

---

## Etapas de Implementação

### Fase 1: Tarefa de Análise (4-6h)

1. **Criar `squad-creator-analyze.md`**
   - Definir formato da tarefa (TASK-FORMAT-SPECIFICATION-V1)
   - Elicitação: nome do squad, formato de saída
   - Etapas: escanear, analisar, gerar relatório

2. **Criar `squad-analyzer.js`**
   - `analyzeSquad(squadPath)` → retorna objeto de análise
   - Inventário de componentes
   - Métricas de cobertura
   - Verificação de dependências

3. **Adicionar Testes**
   - `tests/unit/squad/squad-analyzer.test.js`
   - Meta: 80%+ de cobertura

### Fase 2: Tarefa de Extensão (6-8h)

4. **Criar `squad-creator-extend.md`**
   - Definir formato da tarefa
   - Elicitação: tipo de componente, nome, detalhes
   - Etapas: validar, criar, atualizar manifesto, validar novamente

5. **Criar `squad-extender.js`**
   - `addAgent(squadPath, agentDef)`
   - `addTask(squadPath, taskDef)`
   - `addTemplate(squadPath, templateDef)`
   - etc. para cada tipo de componente
   - Atualização automática do squad.yaml

6. **Adicionar Testes**
   - `tests/unit/squad/squad-extender.test.js`
   - Meta: 80%+ de cobertura

### Fase 3: Integração com Agente (2-3h)

7. **Atualizar `squad-creator.md`**
   - Adicionar comando `*analyze-squad`
   - Adicionar comando `*extend-squad`
   - Atualizar seção de dependências

8. **Sincronizar com Regras da IDE**
   - Executar script de sincronização para .claude, .cursor, etc.

### Fase 4: Documentação (2-3h)

9. **Atualizar Documentação**
   - Atualizar `docs/guides/squads-guide.md`
   - Adicionar exemplos em squad-examples/
   - Atualizar epic-sqs-squad-system.md

10. **Criar Story**
    - `docs/stories/v4.0.4/sprint-XX/story-sqs-11-squad-improvement.md`

---

## Especificações Detalhadas das Tarefas

### `squad-creator-analyze.md`

```yaml
task: analyzeSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Analysis
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true
  validation: Squad existe em ./squads/

- field: output_format
  type: string
  source: User Input
  required: false
  validation: console|markdown|json

outputs:
- field: analysis_report
  type: object
  destination: Console ou arquivo
  persisted: false
```

**Exemplo de Saída:**
```
=== Análise do Squad: my-domain-squad ===

📋 Visão Geral
  Nome: my-domain-squad
  Versão: 1.0.0
  Autor: John Doe
  Licença: MIT

📦 Componentes
  ├── Agentes (2)
  │   ├── lead-agent.md
  │   └── helper-agent.md
  ├── Tarefas (3)
  │   ├── lead-agent-task1.md
  │   ├── lead-agent-task2.md
  │   └── helper-agent-task1.md
  ├── Workflows (0) ← Vazio
  ├── Templates (1)
  │   └── report-template.md
  ├── Ferramentas (0) ← Vazio
  └── Checklists (0) ← Vazio

📊 Cobertura
  Tarefas: ████████░░ 80% (3/4 agentes têm tarefas)
  Docs: ██████████ 100% (README existe)
  Config: ████████░░ 80% (tech-stack ausente)

💡 Sugestões
  1. Adicionar checklist para validação de agente
  2. Criar workflow para sequências comuns de agentes
  3. Adicionar tech-stack.md em config/
```

### `squad-creator-extend.md`

```yaml
task: extendSquad()
responsible: squad-creator (Craft)
responsible_type: Agent
atomic_layer: Modification
elicit: true

inputs:
- field: squad_name
  type: string
  source: User Input
  required: true

- field: component_type
  type: string
  source: User Input
  required: true
  validation: agent|task|workflow|checklist|template|tool|script|data

- field: component_name
  type: string
  source: User Input
  required: true
  validation: kebab-case

- field: story_id
  type: string
  source: User Input
  required: false
  validation: formato SQS-XX

outputs:
- field: created_file
  type: string
  destination: Diretório do Squad
  persisted: true

- field: updated_manifest
  type: boolean
  destination: squad.yaml
  persisted: true
```

---

## Atribuição de Agentes

| Papel | Agente | Responsabilidades |
|------|-------|------------------|
| Principal | @dev (Dex) | Implementar scripts e tarefas |
| Suporte | @qa (Quinn) | Testar implementação |
| Revisão | @architect (Aria) | Revisão de arquitetura |

---

## Dependências

### Dependências de Runtime
- Node.js 18+
- Scripts existentes de squad (loader, validator, generator)

### Dependências de Desenvolvimento
- Jest (testes)
- js-yaml (parsing YAML)

---

## Estimativa de Esforço

| Fase | Esforço | Dependências |
|-------|--------|--------------|
| Fase 1: Tarefa de Análise | 4-6h | SQS-4 (concluído) |
| Fase 2: Tarefa de Extensão | 6-8h | Fase 1 |
| Fase 3: Integração com Agente | 2-3h | Fase 2 |
| Fase 4: Documentação | 2-3h | Fase 3 |
| **Total** | **14-20h** | |

---

## Integração com Story

### Story Proposta: SQS-11

**Título:** Tarefas de Análise e Extensão de Squad

**Epic:** SQS (Aprimoramento do Sistema de Squads)

**Sprint:** Sprint 14 (ou próximo disponível)

**Critérios de Aceitação:**
- [ ] `*analyze-squad` mostra inventário completo do squad
- [ ] `*extend-squad` pode adicionar todos os tipos de componentes
- [ ] Atualização automática do squad.yaml na extensão
- [ ] Validação executada após extensão
- [ ] Flag opcional --story para rastreabilidade
- [ ] 80%+ de cobertura de testes
- [ ] Documentação atualizada

---

## Próximos Passos

1. **Revisar e aprovar** esta abordagem
2. **Criar Story SQS-11** em `docs/stories/v4.0.4/sprint-XX/`
3. **Executar `*create-service squad-analyzer`** para criar estrutura (ou criação manual)
4. **Iniciar implementação** com @dev

---

## Abordagens Alternativas Consideradas

### Opção A: Tarefa Única `*improve-squad` (Não Recomendada)
- Combina análise + extensão em uma única tarefa
- Muito complexa, viola responsabilidade única
- Difícil de testar

### Opção B: Múltiplas Tarefas Granulares (Não Recomendada)
- `*add-agent`, `*add-task`, `*add-workflow`, etc.
- Muitos comandos para lembrar
- Experiência do usuário inconsistente

### Opção C: Duas Tarefas - Analisar + Estender (Recomendada ✅)
- Clara separação de responsabilidades
- Primeiro analisa, depois estende
- Consistente com padrões existentes

---

**Criado por:** @architect (Aria)
**Data:** 2025-12-26
**Status:** Aguardando Aprovação

---

*Próximo: Criar Story SQS-11 ou prosseguir com implementação*
