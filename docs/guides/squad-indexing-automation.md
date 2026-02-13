# Squad Indexing Automation Guide

**Sistema completo de automação para indexação de squads AIOS como slash commands.**

## 🎯 Visão Geral

Sistema automatizado que elimina trabalho manual de criar symlinks, atualizar MEMORY.md e validar estruturas de squads.

### Antes vs Depois

| Tarefa | Manual (Antes) | Automatizado (Agora) |
|--------|----------------|----------------------|
| **Indexar squad** | 10-15 min | 5 segundos |
| **Validar estrutura** | Manual, propenso a erros | Automático |
| **Atualizar MEMORY.md** | Edição manual de tabela | Automático |
| **Criar symlinks** | 20+ comandos por squad | 1 comando |
| **Lembrar de indexar** | Fácil esquecer | Pre-commit hook |

### Redução de Tempo
**95% de redução**: 15 minutos → 5 segundos

---

## 🚀 Quick Start

```bash
# Ver quais squads precisam ser indexados
npm run squad:scan

# Indexar todos automaticamente
npm run squad:index

# Validar squads indexados
npm run squad:validate

# Relatório completo
npm run squad:report
```

---

## 📋 Comandos Disponíveis

### `npm run squad:scan`
**Propósito:** Escanear e listar squads não indexados

**Output:**
```
📊 Squad Indexing Report

ℹ Total squads found: 10
ℹ Currently indexed: 3

🔍 Unindexed Squads

design
  Path: /Users/luizfosc/aios-core/squads/design
  ✓ Valid structure
  Components: 1 agents, 33 tasks, 3 workflows
  Version: 2.1.0

✅ Indexed Squads
✓ knowledge-base-builder (8 agents, 10 tasks, 4 workflows)
  27 symlinks created
```

**Quando usar:**
- Antes de indexar para ver o que será processado
- Para verificar status geral de indexação
- Para identificar squads com estrutura inválida

---

### `npm run squad:index`
**Propósito:** Indexar automaticamente todos squads válidos não indexados

**O que faz:**
1. ✅ Cria diretórios em `.claude/commands/{squad-name}/`
2. ✅ Cria symlinks para README.md
3. ✅ Cria symlinks para todos componentes (agents, tasks, workflows, etc)
4. ✅ Atualiza MEMORY.md com tabela de squads
5. ✅ Gera relatório de sucesso/falhas

**Output:**
```
🔧 Indexing Squads

Indexing: design
  Created directory: .claude/commands/design
    ✓ README.md → ../../../squads/design/README.md
    Symlinking agents/ (1 files)...
    Symlinking tasks/ (33 files)...
  ✓ Created 64 symlinks

✅ Indexing Complete
  Indexed: 7 squads
  Total indexed: 11 squads
```

**Quando usar:**
- Após criar novo squad
- Após clonar repositório
- Quando novos squads são adicionados
- Para re-indexar após modificações

---

### `npm run squad:validate`
**Propósito:** Validar squads já indexados

**O que valida:**
- ✅ Source squad ainda existe
- ✅ Estrutura do squad é válida
- ✅ Symlinks não estão quebrados
- ✅ Identificar índices órfãos

**Output:**
```
🔍 Validating Indexed Squads

knowledge-base-builder
  ✓ Valid structure
  ✓ All symlinks valid

mmos-squad
  ✓ Valid structure
  ⚠ 3 broken symlinks found

Ralph
  ✗ Source directory not found - orphaned index

📊 Validation Summary
  Valid: 9
  Invalid: 2
```

**Quando usar:**
- Após reorganização de squads
- Para troubleshooting de problemas
- Verificação periódica de integridade
- Antes de commit importante

---

### `npm run squad:report`
**Propósito:** Gerar relatório abrangente completo

**Inclui:**
- Lista todos squads (indexados e não)
- Validação detalhada de cada squad
- Contagem de componentes
- Estatísticas gerais

**Quando usar:**
- Para visão geral completa do sistema
- Antes de apresentação/documentação
- Para auditar estado de indexação

---

## 🏗️ Estrutura de Squad Válido

### Arquivos Essenciais (OBRIGATÓRIOS)

```
squads/my-squad/
└── README.md                # Documentação principal (REQUIRED)
```

**Se faltando:** Squad será ignorado na indexação

### Arquivos Recomendados

```
squads/my-squad/
├── README.md
└── config.yaml              # Metadata estruturada (RECOMMENDED)
```

**Exemplo de config.yaml:**
```yaml
name: "my-squad"
version: "1.0.0"
title: "My Squad Title"
description: "Squad description"
entry_agent: "my-chief"
tags:
  - "tag1"
  - "tag2"
```

### Componentes Opcionais

```
squads/my-squad/
├── README.md
├── config.yaml
├── agents/                  # Agent definitions (.md)
│   ├── chief.md
│   └── specialist.md
├── tasks/                   # Executable tasks (.md)
│   ├── task-1.md
│   └── task-2.md
├── workflows/               # Multi-step workflows (.yaml/.md)
│   └── workflow-1.md
├── checklists/              # Validation checklists (.md)
│   └── checklist-1.md
├── templates/               # Reusable templates (.md)
│   └── template-1.md
└── data/                    # Squad knowledge (.md/.yaml)
    └── knowledge.md
```

Todos componentes são **opcionais** - apenas README.md é obrigatório.

---

## 🤖 Automação com Pre-Commit Hook

### Como Funciona

1. **Detecta mudanças** em `squads/` nos staged files
2. **Roda automaticamente** `npm run squad:index`
3. **Auto-stages** `.claude/commands/` atualizado
4. **Auto-stages** `MEMORY.md` atualizado
5. **Procede** com commit normalmente

### Exemplo de Workflow

```bash
# 1. Modificar squad
vim squads/my-squad/agents/new-agent.md

# 2. Stage changes
git add squads/my-squad/

# 3. Commit
git commit -m "feat: add new agent to my-squad"

# OUTPUT do hook:
# 🔍 Detected changes in squads/ directory
# 🔧 Running squad auto-indexer...
# ✅ Squad indexing complete
# 📝 Auto-staging updated slash commands...
# 📝 Auto-staging updated MEMORY.md...
```

### Benefícios

- ✅ **Zero esquecimento** - impossível esquecer de indexar
- ✅ **Consistência** - commits sempre com índices atualizados
- ✅ **Rastreabilidade** - mudanças de squad e índice no mesmo commit
- ✅ **Zero esforço** - completamente transparente

---

## 📊 Output Gerado

### Estrutura de Diretórios

Quando squad é indexado, cria:

```
.claude/commands/my-squad/
├── README.md              → symlink to squads/my-squad/README.md
├── agents/
│   ├── agent-1.md        → symlink to squads/my-squad/agents/agent-1.md
│   └── agent-2.md        → symlink to squads/my-squad/agents/agent-2.md
├── tasks/
│   └── task-1.md         → symlink to squads/my-squad/tasks/task-1.md
└── workflows/
    └── workflow-1.md     → symlink to squads/my-squad/workflows/workflow-1.md
```

### MEMORY.md Atualização

Adiciona/atualiza seção:

```markdown
## Squads Indexados (2026-02-13)

| Squad | Agents | Tasks | Workflows | Local | Ativacao |
|-------|--------|-------|-----------|-------|----------|
| **my-squad** | 2 | 5 | 1 | `.claude/commands/my-squad/` | `/my-squad:*` |
```

---

## 🎯 Casos de Uso

### 1. Criar Novo Squad

```bash
# Criar estrutura
mkdir -p squads/my-new-squad/{agents,tasks,workflows}

# Criar arquivos essenciais
cat > squads/my-new-squad/README.md <<EOF
# My New Squad
Description here
EOF

cat > squads/my-new-squad/config.yaml <<EOF
name: "my-new-squad"
version: "1.0.0"
EOF

# Criar agente
cat > squads/my-new-squad/agents/chief.md <<EOF
# Chief Agent
Agent definition here
EOF

# Validar estrutura
npm run squad:scan

# Indexar
npm run squad:index

# Usar no Claude Code
# Digitar: /my-new-squad:agents:chief
```

### 2. Atualizar Squad Existente

```bash
# Adicionar novo agente
vim squads/existing-squad/agents/new-agent.md

# Stage e commit (hook auto-indexa)
git add squads/existing-squad/
git commit -m "feat: add new agent"

# Novo agente automaticamente disponível
# Digitar: /existing-squad:agents:new-agent
```

### 3. Verificar Integridade

```bash
# Após reorganização ou troubleshooting
npm run squad:validate

# Ver relatório completo
npm run squad:report
```

### 4. Limpar Índices Órfãos

```bash
# Identificar órfãos
npm run squad:validate

# Remover manualmente
rm -rf .claude/commands/orphaned-squad

# Re-validar
npm run squad:validate
```

---

## 🛠️ Troubleshooting

### Squad não aparece após indexação

**Sintoma:** Rodou `npm run squad:index` mas squad não aparece

**Solução:**
```bash
# 1. Verificar se foi indexado
npm run squad:validate

# 2. Verificar symlinks criados
ls -la .claude/commands/{squad-name}/

# 3. Re-indexar se necessário
rm -rf .claude/commands/{squad-name}
npm run squad:index
```

---

### Symlinks quebrados

**Sintoma:** `npm run squad:validate` mostra "broken symlinks"

**Causa:** Squad foi movido/renomeado sem re-indexar

**Solução:**
```bash
# Re-indexar automaticamente corrige
npm run squad:index
```

---

### Squad marcado como inválido

**Sintoma:** `npm run squad:scan` mostra "Invalid structure"

**Causa:** Faltando README.md

**Solução:**
```bash
# Criar README.md
cat > squads/{squad-name}/README.md <<EOF
# Squad Name
Description
EOF

# Re-escanear
npm run squad:scan
```

---

### Pre-commit hook não executando

**Sintoma:** Mudanças em squads/ não triggam hook

**Solução:**
```bash
# Verificar hook executável
ls -l .husky/pre-commit
chmod +x .husky/pre-commit

# Testar manualmente
.husky/pre-commit-squad-indexer

# Re-instalar husky se necessário
npm install
```

---

### MEMORY.md não atualizado

**Sintoma:** Squad indexado mas MEMORY.md não mudou

**Causa:** Caminho do MEMORY.md incorreto

**Solução:**
```bash
# Verificar caminho em scripts/squad-indexer.js
grep memoryFile scripts/squad-indexer.js

# Deve apontar para:
# ~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md
```

---

## 📈 Estatísticas do Sistema

### Performance Atual

| Operação | Tempo | Squads Processados |
|----------|-------|-------------------|
| Scan | ~100ms | 10 squads |
| Index | ~500ms | 8 squads (50+ files cada) |
| Validate | ~200ms | 10 squads |

### Cobertura

| Métrica | Valor |
|---------|-------|
| Total de squads | 10 |
| Indexados | 11 (inclui orphans) |
| Symlinks criados | 434 |
| Squads válidos não indexados | 1 (mbti-expert sem README) |
| Taxa de sucesso | 90% |

---

## 🔮 Roadmap Futuro

### Em Consideração

- [ ] **Watch mode** - Re-indexação contínua durante desenvolvimento
- [ ] **CLI interativo** - Wizard para criar squads
- [ ] **Schema validation** - Validar config.yaml contra schema
- [ ] **Auto-generate templates** - Criar README.md/config.yaml automaticamente
- [ ] **Integração squad-creator** - Criar + indexar em workflow único
- [ ] **Notificações** - Slack/Discord quando squad indexado
- [ ] **GitHub Action** - CI/CD validation de indexação

---

## 📚 Referências

### Documentação
- **Guia completo:** `scripts/README-squad-indexer.md`
- **Task DevOps:** `.aios-core/development/tasks/squad-indexer-automation.md`

### Exemplos
- **Squad completo:** `squads/knowledge-base-builder/`
- **Config exemplo:** `squads/knowledge-base-builder/config.yaml`
- **Memory format:** `~/.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md`

### Scripts
- **Main script:** `scripts/squad-indexer.js`
- **Pre-commit hook:** `.husky/pre-commit-squad-indexer`
- **Husky entry:** `.husky/pre-commit`

---

## ✅ Checklist de Melhores Práticas

### Ao Criar Squad

- [ ] Criar README.md (obrigatório)
- [ ] Criar config.yaml (recomendado)
- [ ] Usar kebab-case para nome do squad
- [ ] Organizar componentes em diretórios apropriados
- [ ] Rodar `npm run squad:scan` para validar
- [ ] Rodar `npm run squad:index` para indexar

### Ao Modificar Squad

- [ ] Stage mudanças com `git add squads/{squad-name}/`
- [ ] Commit (hook auto-indexa)
- [ ] Verificar que symlinks foram atualizados
- [ ] Testar slash commands no Claude Code

### Manutenção

- [ ] Rodar `npm run squad:validate` periodicamente
- [ ] Limpar índices órfãos quando identificados
- [ ] Manter config.yaml atualizado
- [ ] Documentar novos componentes no README

---

**Criado por:** @devops (Gage)
**Data:** 2026-02-13
**Versão:** 1.0.0
**Status:** ✅ Deployed and Operational

