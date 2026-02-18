# Squad Indexer - Automação de Indexação de Squads

Sistema automatizado para indexar squads do AIOS como slash commands no Claude Code.

## 🎯 Propósito

Automatiza completamente o processo de:
1. Detectar novos squads em `squads/`
2. Validar estrutura (README, config.yaml, agents, tasks, workflows)
3. Criar symlinks em `.claude/commands/`
4. Atualizar `MEMORY.md` com informações dos squads
5. Gerar relatórios de indexação

## 🚀 Uso Rápido

```bash
# Escanear squads não indexados
npm run squad:scan

# Indexar todos os squads não indexados automaticamente
npm run squad:index

# Validar squads já indexados
npm run squad:validate

# Gerar relatório completo
npm run squad:report
```

## 📋 Comandos Disponíveis

### `npm run squad:scan`
Escaneia o diretório `squads/` e lista:
- ✅ Squads válidos não indexados
- ⚠️ Squads com warnings (faltando config.yaml)
- ❌ Squads inválidos (faltando README.md)
- 📊 Contagem de componentes (agents, tasks, workflows, etc)

**Quando usar:** Antes de indexar para ver o que será processado.

### `npm run squad:index`
Indexa automaticamente todos os squads válidos não indexados:
- Cria diretório em `.claude/commands/{squad-name}/`
- Symlinks para README.md
- Symlinks para agents/, tasks/, workflows/, checklists/, templates/
- Atualiza `MEMORY.md` com tabela de squads indexados
- Mostra relatório de sucesso/falhas

**Quando usar:** Após adicionar novos squads ou clonar repositório.

### `npm run squad:validate`
Valida squads já indexados:
- Verifica se source squad ainda existe
- Valida estrutura do squad
- Detecta symlinks quebrados
- Identifica índices órfãos (squad removido mas índice permanece)

**Quando usar:** Após reorganização de squads ou troubleshooting.

### `npm run squad:report`
Gera relatório abrangente:
- Lista todos os squads (indexados e não indexados)
- Mostra validação detalhada
- Conta componentes de cada squad
- Exibe estatísticas gerais

**Quando usar:** Para visão geral completa do estado de indexação.

## 🏗️ Estrutura de Squad Válido

### Essencial (Requerido)
- ✅ `README.md` - Documentação principal do squad

### Recomendado
- 📋 `config.yaml` - Configuração estruturada (name, version, agents, etc)

### Componentes (Opcionais)
- 👤 `agents/` - Definições de agentes (.md)
- 📝 `tasks/` - Tarefas executáveis (.md)
- 🔄 `workflows/` - Fluxos de trabalho (.yaml ou .md)
- ✅ `checklists/` - Checklists de validação (.md)
- 📄 `templates/` - Templates reutilizáveis (.md)
- 💾 `data/` - Dados ou conhecimento do squad (.md, .yaml)

## 📊 Exemplo de Output

```
📊 Squad Indexing Report

ℹ Total squads found: 10
ℹ Currently indexed: 3

🔍 Unindexed Squads

design
  Path: /Users/luizfosc/aios-core/squads/design
  ✓ Valid structure
  Components: 1 agents, 33 tasks, 3 workflows, 7 checklists, 10 templates
  Version: 2.1.0

dopamine-learning
  Path: /Users/luizfosc/aios-core/squads/dopamine-learning
  ✓ Valid structure
  Components: 10 agents, 12 tasks, 3 workflows, 1 checklists
  Version: 1.0.0
  Entry Agent: @dopamine-learning-chief

✅ Indexed Squads

✓ knowledge-base-builder (8 agents, 10 tasks, 4 workflows)
  27 symlinks created

📈 Summary
  Total Squads: 10
  Indexed: 3
  Unindexed: 7

  Run with --index to index unindexed squads
```

## 🔧 Workflow Típico

### 1️⃣ Criar Novo Squad
```bash
# Criar estrutura do squad
mkdir squads/meu-squad
cd squads/meu-squad

# Criar arquivos essenciais
touch README.md
touch config.yaml

# Criar componentes
mkdir agents tasks workflows
```

### 2️⃣ Validar Estrutura
```bash
# Escanear para ver se squad é válido
npm run squad:scan
```

### 3️⃣ Indexar Squad
```bash
# Indexar automaticamente
npm run squad:index
```

### 4️⃣ Verificar Indexação
```bash
# Validar que tudo foi criado corretamente
npm run squad:validate

# Ver squad disponível
ls .claude/commands/meu-squad/
```

### 5️⃣ Usar Squad
```bash
# No Claude Code, digitar barra e selecionar:
/meu-squad:agents:chief
/meu-squad:tasks:task-1
/meu-squad:workflows:workflow-1
```

## 🛠️ Troubleshooting

### Squad não aparece após indexação
```bash
# 1. Verificar se foi indexado
npm run squad:validate

# 2. Verificar symlinks
ls -la .claude/commands/{squad-name}/

# 3. Re-indexar
rm -rf .claude/commands/{squad-name}
npm run squad:index
```

### Symlinks quebrados
```bash
# Validar e identificar problemas
npm run squad:validate

# Re-criar symlinks
npm run squad:index
```

### Squad marcado como inválido
```bash
# Ver detalhes do erro
npm run squad:scan

# Verificar arquivos essenciais
ls squads/{squad-name}/README.md
ls squads/{squad-name}/config.yaml
```

## 🔍 Squads Excluídos

O indexer automaticamente exclui:
- Diretórios backup (`*.backup-*`)
- `.DS_Store`
- Arquivos soltos (não-diretórios)

## 📝 Atualização de MEMORY.md

O indexer atualiza automaticamente a seção "Squads Indexados" em:
```
.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md
```

Formato da tabela:
```markdown
## Squads Indexados (2026-02-13)

| Squad | Agents | Tasks | Workflows | Local | Ativacao |
|-------|--------|-------|-----------|-------|----------|
| **squad-name** | 8 | 10 | 4 | `.claude/commands/squad-name/` | `/squad-name:*` |
```

## 🎯 Melhores Práticas

### ✅ DO
- Sempre rodar `npm run squad:scan` antes de indexar
- Manter `config.yaml` atualizado com metadata do squad
- Usar nomes descritivos para squads (kebab-case)
- Validar estrutura antes de commitar
- Re-indexar após mover/renomear squads

### ❌ DON'T
- Não editar `.claude/commands/` manualmente (use o indexer)
- Não remover squad sem rodar `squad:validate` depois
- Não criar squads sem README.md
- Não usar espaços ou caracteres especiais em nomes

## 🚀 Automação Future

Possíveis melhorias:
- [ ] Pre-commit hook para auto-indexar squads modificados
- [ ] Watch mode para re-indexar automaticamente
- [ ] CLI interativo para criar squads
- [ ] Validação de config.yaml schema
- [ ] Geração automática de README.md template
- [ ] Integração com squad-creator para criar + indexar em um comando

## 📚 Referências

- **Squad Structure:** `squads/knowledge-base-builder/` (exemplo completo)
- **Config Schema:** `squads/knowledge-base-builder/config.yaml`
- **Memory Format:** `.claude/projects/-Users-luizfosc-aios-core/memory/MEMORY.md`

---

**Criado por:** @devops (Gage)
**Data:** 2026-02-13
**Versão:** 1.0.0
