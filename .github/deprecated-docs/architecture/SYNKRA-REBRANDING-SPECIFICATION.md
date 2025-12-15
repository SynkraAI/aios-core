# SYNKRA - Especificação de Rebranding e Arquitetura Conceitual

**Versão:** 1.0
**Data:** 2025-11-26
**Status:** ✅ Aprovado - Story 6.0.1 Criada
**Autores:** Roundtable (Pedro Valério, Marty Cagan, Sam Altman, Steve Jobs)

---

## 1. Executive Summary

Este documento detalha a decisão estratégica de rebrandear o framework **AIOS** para **SYNKRA**, incluindo toda a fundamentação conceitual, decisões de nomenclatura, e o plano de migração técnica.

### 1.1 Decisão Final

| Elemento | Nome Antigo | Nome Novo | Justificativa |
|----------|-------------|-----------|---------------|
| Framework | AIOS | **SYNKRA** | Sincronização + Fluxo (sync + ra) |
| Master Agent | @aios-master | **@synk** | Derivado de SYNKRA (SYN+K), identidade |
| Knowledge System | *gold | **\*source** | "Se não está no SOURCE, não aconteceu" |
| Core Folder | .aios-core | **.synkra-core** | Consistência |
| NPM Namespace | @aios-fullstack | **@synkra** | Simplificação |

---

## 2. Contexto e Motivação

### 2.1 Problema Original

O nome "AIOS" (AI-Orchestrated System) apresentava limitações:

1. **Genericidade**: "AI Operating System" é um termo comum no mercado
2. **Confusão**: Pode ser confundido com outros projetos como Apple's AIOS
3. **Falta de Identidade**: Não comunica a proposta de valor única do framework
4. **Metodologia Oculta**: Não reflete a filosofia task-first e os 4 tipos de executores

### 2.2 Requisitos para o Novo Nome

O roundtable definiu critérios essenciais:

- ✅ Representar sincronização entre os 4 tipos de executores
- ✅ Ser memorável e único
- ✅ Funcionar como identidade (substantivo), não como ação (verbo)
- ✅ Alinhar com a filosofia de Pedro Valério
- ✅ Passar no teste de 10 segundos de Steve Jobs

---

## 3. Processo de Decisão: Roundtable

### 3.1 Participantes Simulados

O processo de naming utilizou um roundtable simulado com 4 "minds" do sistema MMOS:

1. **Pedro Valério Lopez** - Fundador, filosofia task-first e centralização
2. **Marty Cagan** - Product thinking, foco no usuário
3. **Sam Altman** - Visão exponencial, long-term thinking
4. **Steve Jobs** - Design, simplicidade, teste de 10 segundos

### 3.2 Rounds de Decisão

#### Round 1-2: Pesquisa e Geração
- Pesquisa de naming conventions em frameworks de orquestração
- Análise de prefixos (Syn-, Flow-, Nexus-, Pulse-)
- Geração de 50+ candidatos

#### Round 3: Shortlist
Candidatos finalistas:
- SYNKRA (sync + ra/flow)
- FLOWRA (flow + orchestration)
- NEXORA (nexus + ora)
- PULSEFLOW

#### Round 4: Decisão Framework
**SYNKRA** foi escolhido por:
- **Pedro**: "Centraliza o conceito de sincronização que é core do sistema"
- **Marty**: "Comunica valor sem explicação - produtos que sincronizam"
- **Sam**: "Nome que escala - funciona para CLI, cloud, enterprise"
- **Steve**: "Passa no teste de 10 segundos. SYNKRA. Sincroniza. Óbvio."

#### Round 5: Master Agent Name
Evolução: @pulse → @sync → @sink → **@synk**

**Por que @synk (com Y)?**
- Derivado direto de SYNKRA (SYN + K)
- Mantém identidade visual do framework
- Evita confusão com "sink" (pia/afundar em inglês)
- Funciona como substantivo (identidade), não verbo (ação)
- Curto, memorável, único

---

## 4. Fundamentação Filosófica

### 4.1 Alinhamento com Pedro Valério

O SYNKRA foi projetado para incorporar os princípios fundamentais extraídos do Knowledge Base de Pedro Valério:

#### 4.1.1 Os 10 Mandamentos Operacionais

| Mandamento Original | Adaptação SYNKRA |
|---------------------|------------------|
| "Se não está no ClickUp, não aconteceu" | "Se não está no **SOURCE**, não aconteceu" |
| "O que não tem responsável será feito por ninguém" | Tasks sempre têm executor definido |
| "A culpa é sempre do comunicador" | Logs e rastreabilidade completos |
| "Automação antes de delegação" | Workers automatizados primeiro |

#### 4.1.2 Single Source of Truth → \*source

O comando `*source` substitui `*gold` baseado na filosofia de centralização:

> "Tudo converge para o ClickUp... a dor de não conseguir conectar uma coisa na outra é o maior problema da gestão moderna."
> — Pedro Valério, chunk-06-clickup-operating-system.md

**SOURCE** representa:
- Única fonte da verdade do projeto
- Knowledge base centralizado
- Rastreabilidade total de decisões

#### 4.1.3 Process Absolutism → SYNKRA Core

> "A melhor coisa é você impossibilitar caminhos."
> — Pedro Valério, chunk-07-process-absolutism.md

SYNKRA implementa isso através de:
- Workflows que bloqueiam caminhos inválidos
- Validação automática de tasks
- Sistema que se auto-educa

### 4.2 Os 4 Tipos de Executores

SYNKRA sincroniza 4 tipos distintos de executores:

```
┌─────────────────────────────────────────────────────────┐
│                      @synk                               │
│              (Master Orchestrator)                       │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   AGENTE    │   WORKER    │   HUMANO    │    CLONE      │
│  (AI Auto)  │ (AI Assist) │  (Person)   │ (Cognitive)   │
├─────────────┼─────────────┼─────────────┼───────────────┤
│ Execução    │ Execução    │ Execução    │ Execução com  │
│ autônoma    │ assistida   │ manual      │ persona       │
│ sem input   │ com input   │ completa    │ específica    │
└─────────────┴─────────────┴─────────────┴───────────────┘
```

**SYNKRA** = SYNchronization of executors in a KRA (flow/framework)

---

## 5. Arquitetura de Nomenclatura

### 5.1 Hierarquia de Naming

```
SYNKRA (Framework)
├── @synk (Master Agent)
│   ├── *source (Knowledge Command)
│   ├── *task (Task Command)
│   └── *flow (Workflow Command)
├── @synkra-dev (Developer Agent)
├── @synkra-orchestrator (Orchestrator Agent)
├── .synkra-core/ (Core Configuration)
│   ├── agents/
│   ├── tasks/
│   ├── workflows/
│   └── data/source.md (KB)
└── @synkra (NPM Namespace)
    ├── @synkra/core
    ├── @synkra/memory
    ├── @synkra/security
    └── @synkra/telemetry
```

### 5.2 Convenções de Naming

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Framework | PascalCase | SYNKRA |
| Master Agent | @lowercase | @synk |
| Other Agents | @synkra-role | @synkra-dev |
| Commands | *lowercase | *source, *task |
| Folders | .kebab-case | .synkra-core |
| NPM Packages | @namespace/package | @synkra/core |

### 5.3 Comandos do @synk

```markdown
@synk                    # Ativa o master agent
@synk *source           # Acessa o knowledge base
@synk *task create      # Cria nova task
@synk *flow start       # Inicia workflow
@synk *help             # Ajuda contextual
```

---

## 6. Análise de Impacto Técnico

### 6.1 Escopo de Mudanças

| Categoria | Quantidade | Prioridade |
|-----------|------------|------------|
| Pastas a renomear | 6 | CRÍTICO |
| Arquivos executáveis | 7 | CRÍTICO |
| Arquivos de agentes | 9+ | CRÍTICO |
| Package.json files | 8 | ALTO |
| Regras de IDE | 9 | ALTO |
| Configs YAML | 10+ | MÉDIO |
| Documentação | ~300 | BAIXO |
| **Total estimado** | **~400 arquivos** | - |

### 6.2 Breaking Changes

#### 6.2.1 CLI
```bash
# Antes
npx aios init
npx aios-fullstack

# Depois
npx synkra init
npx @synkra/cli
```

#### 6.2.2 Agent Activation
```markdown
# Antes
@aios-master
@aios-developer

# Depois
@synk
@synkra-dev
```

#### 6.2.3 NPM Imports
```javascript
// Antes
import { core } from '@aios-fullstack/core';

// Depois
import { core } from '@synkra/core';
```

### 6.3 Backward Compatibility

Recomendação: Manter aliases temporários por 2 versões:
- `@aios-master` → `@synk` (deprecated warning)
- `@aios-fullstack/*` → `@synkra/*` (npm alias)

---

## 7. Mapeamento Completo de Renaming

### 7.1 Estrutura de Pastas

```
ANTES                                    DEPOIS
─────────────────────────────────────────────────────────
.aios-core/                         →   .synkra-core/
.aios-core/agents/aios-master.md    →   .synkra-core/agents/synk.md
.aios-core/agents/aios-developer.md →   .synkra-core/agents/synkra-dev.md
.aios-core/agents/aios-orchestrator.md → .synkra-core/agents/synkra-orchestrator.md
.aios-core/data/aios-kb.md          →   .synkra-core/data/source.md
```

### 7.2 Arquivos Executáveis

```
ANTES                                    DEPOIS
─────────────────────────────────────────────────────────
bin/aios.js                         →   bin/synkra.js
bin/aios-init.js                    →   bin/synkra-init.js
bin/aios-init-v4.js                 →   bin/synkra-init-v4.js
bin/aios-minimal.js                 →   bin/synkra-minimal.js
tools/installer/bin/aios.js         →   tools/installer/bin/synkra.js
```

### 7.3 Regras de IDE

```
ANTES                                    DEPOIS
─────────────────────────────────────────────────────────
.cursor/rules/aios-master.mdc       →   .cursor/rules/synk.mdc
.cursor/rules/aios-developer.mdc    →   .cursor/rules/synkra-dev.mdc
.cursor/rules/aios-orchestrator.mdc →   .cursor/rules/synkra-orchestrator.mdc
.trae/rules/aios-*.md               →   .trae/rules/synkra-*.md
.claude/commands/AIOS/              →   .claude/commands/synkra/
```

### 7.4 Packages NPM

```json
// package.json (root)
{
  "name": "@synkra/fullstack",  // era @aios-fullstack
  "bin": {
    "synkra": "./bin/synkra.js"  // era aios
  }
}

// Subpackages
@synkra/core      // era @aios-fullstack/core
@synkra/memory    // era @aios-fullstack/memory
@synkra/security  // era @aios-fullstack/security
@synkra/telemetry // era @aios-fullstack/telemetry
```

---

## 8. Plano de Migração Proposto

### 8.1 Fases

```
Fase 1: Estrutura (CRÍTICO)
├── Renomear .aios-core → .synkra-core
├── Renomear arquivos de agentes
├── Renomear executáveis CLI
└── Duração estimada: 2-3 horas

Fase 2: Packages (ALTO)
├── Atualizar todos package.json
├── Atualizar imports internos
├── Configurar npm aliases
└── Duração estimada: 2-3 horas

Fase 3: IDE Rules (ALTO)
├── Renomear arquivos .mdc/.md
├── Atualizar conteúdo das regras
├── Testar em Cursor, Claude, Trae
└── Duração estimada: 1-2 horas

Fase 4: Documentação (BAIXO)
├── Atualizar READMEs
├── Atualizar guides
├── Atualizar CHANGELOG
└── Duração estimada: 3-4 horas

Fase 5: Cleanup (OPCIONAL)
├── Remover pastas de backup antigas
├── Atualizar .gitignore
├── Verificação final
└── Duração estimada: 1 hora
```

### 8.2 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Breaking changes em produção | Alto | Alto | Feature flag + aliases |
| Links externos quebrados | Médio | Médio | Redirects no npm |
| Confusão de usuários | Médio | Baixo | Documentação clara |
| Incompatibilidade de IDE | Baixo | Alto | Testes em todas IDEs |

---

## 9. Questões para @architect

### 9.1 Validação Arquitetural

1. **Estrutura de Pastas**: A proposta de `.synkra-core/` mantém a mesma estrutura interna. Há otimizações recomendadas?

2. **NPM Namespace**: `@synkra/*` é suficientemente curto? Ou devemos considerar `@snk/*`?

3. **Agent Hierarchy**: A nomenclatura `@synk` → `@synkra-dev` → `@synkra-*` é consistente?

4. **Backward Compatibility**: Qual a melhor estratégia para manter compatibilidade?
   - Opção A: Aliases via npm
   - Opção B: Wrapper scripts
   - Opção C: Deprecation warnings por 2 versões

5. **Source Command**: O nome `*source` para o knowledge base é intuitivo? Alternativas consideradas:
   - `*source` (escolhido - single source of truth)
   - `*kb` (knowledge base - mais técnico)
   - `*truth` (mais filosófico)
   - `*core` (pode confundir com .synkra-core)

### 9.2 Decisões Pendentes

- [ ] Confirmar namespace NPM final (@synkra vs @synkra-framework)
- [ ] Definir estratégia de versionamento pós-rebrand
- [ ] Avaliar impacto em pipelines CI/CD existentes
- [ ] Definir migration path para projetos existentes

---

## 10. Anexos

### 10.1 Referências do Knowledge Base de Pedro Valério

Chunks consultados durante o processo de decisão:
- `chunk-01-identity-core.md` - Identidade e valores
- `chunk-02-values-principles.md` - 10 Mandamentos
- `chunk-06-clickup-operating-system.md` - Centralização
- `chunk-07-process-absolutism.md` - Impossibilitar caminhos
- `chunk-09-automation-philosophy.md` - Automação
- `chunk-10-task-architecture.md` - Arquitetura de tasks
- `chunk-26-allfluence-creator-os.md` - Visão de negócio

### 10.2 System Prompts Consultados

- `steve_jobs/system_prompts/System_Prompt_Steve_Jobs.md`
- `sam_altman/system_prompts/system-prompt-generalista.md`

### 10.3 Arquivos de Referência para Migração

Lista completa de arquivos afetados disponível em:
- Grep search: `aios-master|aios-developer|aios-orchestrator` → 336 arquivos
- Glob search: `**/*aios*.md` → 65 arquivos
- NPM references: `@aios-fullstack` → 74 arquivos

---

## 11. Aprovações

| Role | Nome | Status | Data |
|------|------|--------|------|
| Product Owner | Pedro Valério | ✅ Aprovado | 2025-11-26 |
| Roundtable | 4 Minds | ✅ Consenso | 2025-11-26 |
| Product Owner | @po (Pax) | ✅ Story 6.0.1 Criada | 2025-11-26 |
| Architect | @architect (Aria) | ✅ Opção A Aprovada | 2025-11-26 |
| Tech Lead | - | ⏳ Pendente | - |

---

**Próximo Passo**: Executar Story 6.0.1 (SYNKRA Framework Rebranding) - Posicionada entre Sprint 4 e Sprint 5.

**Story Link**: [docs/stories/6.0.1-synkra-framework-rebranding.md](../stories/6.0.1-synkra-framework-rebranding.md)
