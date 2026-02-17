<!-- Tradução: PT-BR | Original: /docs/en/architecture/squad-improvement-analysis.md | Sincronização: 2026-01-26 -->

# Análise do Projeto: Sistema de Melhoria de Squads

> 🌐 [EN](../../architecture/squad-improvement-analysis.md) | **PT** | [ES](../../es/architecture/squad-improvement-analysis.md)

---

**Gerado:** 2025-12-26
**Gerado Por:** @architect (Aria)
**Funcionalidade:** Tarefas de Análise e Melhoria Contínua de Squads
**Story:** TBD (Proposta: SQS-11)

---

## Estrutura do Projeto

| Aspecto | Valor |
|---------|-------|
| Framework | AIOS-FullStack |
| Linguagem Principal | TypeScript/JavaScript |
| Sistema de Squads | v4.2 (Arquitetura Task-First) |
| Tasks Existentes | 8 tasks do squad-creator |
| Framework de Testes | Jest |

---

## Inventário Atual do Squad Creator

### Definição do Agente

| Propriedade | Valor |
|-------------|-------|
| **ID do Agente** | squad-creator |
| **Nome** | Craft |
| **Título** | Squad Creator |
| **Ícone** | 🏗️ |
| **Arquivo** | `.aios-core/development/agents/squad-creator.md` |

### Tasks Existentes

| Task | Arquivo | Status | Propósito |
|------|---------|--------|-----------|
| `*design-squad` | squad-creator-design.md | ✅ Pronto | Projetar a partir de documentação |
| `*create-squad` | squad-creator-create.md | ✅ Pronto | Criar novo squad |
| `*validate-squad` | squad-creator-validate.md | ✅ Pronto | Validar estrutura |
| `*list-squads` | squad-creator-list.md | ✅ Pronto | Listar squads locais |
| `*migrate-squad` | squad-creator-migrate.md | ✅ Pronto | Migrar formato legado |
| `*download-squad` | squad-creator-download.md | ⏳ Placeholder | Baixar do registro |
| `*publish-squad` | squad-creator-publish.md | ⏳ Placeholder | Publicar no aios-squads |
| `*sync-squad-synkra` | squad-creator-sync-synkra.md | ⏳ Placeholder | Sincronizar com marketplace |

### Scripts Existentes

| Script | Arquivo | Propósito |
|--------|---------|-----------|
| SquadLoader | squad-loader.js | Resolver e carregar manifestos |
| SquadValidator | squad-validator.js | Validar contra schema |
| SquadGenerator | squad-generator.js | Gerar estrutura de squad |
| SquadDesigner | squad-designer.js | Projetar a partir de docs |
| SquadMigrator | squad-migrator.js | Migrar formato legado |
| SquadDownloader | squad-downloader.js | Baixar do registro |
| SquadPublisher | squad-publisher.js | Publicar no aios-squads |

---

## Análise de Lacunas

### Cobertura do Workflow Atual

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DO SQUAD                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PROJETAR     *design-squad            ✅ Coberto            │
│       ↓                                                         │
│  2. CRIAR        *create-squad            ✅ Coberto            │
│       ↓                                                         │
│  3. VALIDAR      *validate-squad          ✅ Coberto            │
│       ↓                                                         │
│  4. MELHORAR     ??? (FALTANDO)           ❌ LACUNA             │
│       ↓                                                         │
│  5. DISTRIBUIR   *publish-squad           ⏳ Placeholder        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Capacidades Ausentes

| Capacidade | Descrição | Impacto |
|------------|-----------|---------|
| **Analisar Squad** | Escanear squad existente, listar componentes, identificar oportunidades | Não consegue entender o que um squad contém |
| **Adicionar Componentes** | Adicionar novos agents/tasks/templates/tools incrementalmente | Deve recriar squad para adicionar componentes |
| **Modificar Componentes** | Editar componentes existentes | Sem workflow guiado |
| **Remover Componentes** | Remover componentes não utilizados | Limpeza manual necessária |
| **Integração com Story** | Vincular melhorias a stories oficiais | Sem rastreabilidade |

### Componentes de Squad (do schema)

| Componente | Diretório | Propósito | Pode Ser Adicionado? |
|------------|-----------|-----------|----------------------|
| tasks | tasks/ | Definições de task (task-first!) | ❌ Sem task |
| agents | agents/ | Personas de agentes | ❌ Sem task |
| workflows | workflows/ | Workflows multi-etapa | ❌ Sem task |
| checklists | checklists/ | Checklists de validação | ❌ Sem task |
| templates | templates/ | Templates de documento | ❌ Sem task |
| tools | tools/ | Ferramentas customizadas (.js) | ❌ Sem task |
| scripts | scripts/ | Scripts de automação | ❌ Sem task |
| data | data/ | Arquivos de dados estáticos | ❌ Sem task |

---

## Análise de Jornada do Usuário

### Atual (Problemático)

```
Usuário: "Quero adicionar um novo agente ao meu squad existente"

1. Usuário cria manualmente arquivo de agente em agents/
2. Usuário atualiza manualmente squad.yaml components.agents[]
3. Usuário executa *validate-squad (pode falhar)
4. Usuário corrige problemas manualmente
5. Nenhuma documentação do que foi adicionado
6. Nenhum vínculo com qualquer story
```

### Desejado (Com Novas Tasks)

```
Usuário: "Quero adicionar um novo agente ao meu squad existente"

1. Usuário executa *analyze-squad my-squad
   → Mostra estrutura atual, componentes, sugestões

2. Usuário executa *extend-squad my-squad
   → Interativo: "O que você gostaria de adicionar?"
   → Opções: agent, task, template, tool, workflow, checklist, script, data
   → Criação guiada com templates
   → Atualização automática do squad.yaml
   → Validação automática

3. Opcionalmente vincula a story via flag --story SQS-XX
```

---

## Stories Relacionadas

| Story | Status | Relevância |
|-------|--------|------------|
| SQS-4 | ✅ Pronto | Squad Creator Agent (base) |
| SQS-9 | ✅ Pronto | Squad Designer (design-squad) |
| SQS-10 | ✅ Pronto | Referência de Config do Projeto |
| **SQS-11** | 📋 Proposta | Tasks de Análise e Extensão de Squad |

---

## Referência de Padrão: analyze-project-structure.md

A task existente `analyze-project-structure.md` fornece um bom padrão:

1. **Elicitação** - Perguntar qual funcionalidade adicionar
2. **Escaneamento** - Escanear estrutura do projeto
3. **Análise de Padrões** - Identificar padrões existentes
4. **Recomendações** - Gerar sugestões
5. **Documentos de Saída** - Criar docs de análise

Este padrão pode ser adaptado para análise de squad.

---

## Padrões Técnicos Detectados

### Distribuição de Linguagens
- **TypeScript:** Principal para scripts
- **JavaScript:** Ferramentas e scripts de squad
- **Markdown:** Definições de agent/task

### Testes
- **Framework:** Jest
- **Cobertura:** >80% em scripts core
- **Localização:** `tests/unit/squad/`

### Configuração
- **Schema:** Validação JSON Schema
- **Manifesto:** squad.yaml (YAML)
- **Herança:** extend/override/none

---

## Resumo de Recomendações

1. **Criar task `*analyze-squad`** - Analisar estrutura de squad existente
2. **Criar task `*extend-squad`** - Adicionar componentes incrementalmente
3. **Criar script `squad-analyzer.js`** - Lógica core de análise
4. **Criar script `squad-extender.js`** - Lógica de extensão
5. **Atualizar agente squad-creator.md** - Adicionar novos comandos
6. **Vincular ao sistema de stories** - Flag opcional --story

---

**Próximo Documento:** [recommended-approach.md](./squad-improvement-recommended-approach.md)
