# 🏛️ Plano de Migração: Reestruturação .claude → AIOS Constitution

**Autor:** @architect (Aria)
**Data:** 2026-02-13
**Status:** DRAFT - Aguardando Aprovação
**Risco:** MÉDIO-ALTO (252 arquivos a migrar)

---

## 📊 Executive Summary

### Situação Descoberta

Após análise detalhada, descobri que **NÃO há duplicações reais** - existem **DOIS CONJUNTOS DISTINTOS** de arquivos:

| Localização | Conteúdo | Status |
|-------------|----------|--------|
| `.claude/agents/` | 24 agents (aios-*, chiefs, specialists) | ⚠️ DESLOCADOS |
| `.aios-core/development/agents/` | 13 agents (core AIOS agents) | ✅ CORRETOS |
| `.claude/templates/` | 18 templates (architecture, PRD, etc) | ⚠️ DESLOCADOS |
| `.aios-core/development/templates/` | 3 templates + 3 dirs | ✅ CORRETOS |
| `.claude/commands/AIOS/` | 252 arquivos (agents, skills, scripts) | 🔥 CRÍTICO |
| `.claude/commands/{13 squads}` | Squads parcialmente duplicados | ⚠️ MESCLAGEM NECESSÁRIA |

### Descobertas Críticas

1. **`.claude/agents/` e `.aios-core/development/agents/` são COMPLEMENTARES, não duplicados**
   - `.claude/agents/` → 24 agents especializados (chiefs, specialists)
   - `.aios-core/development/agents/` → 13 agents core do framework

2. **Templates também são complementares**
   - `.claude/templates/` → Templates de documentos (18 arquivos)
   - `.aios-core/development/templates/` → Templates de código (3 + dirs)

3. **`.claude/commands/AIOS/` é o maior problema** (252 arquivos)
   - Contém: agents (14), skills (50+), scripts (4), stories (1)
   - **Agents duplicam exatamente** os de `.aios-core/development/agents/`
   - Skills devem ir para `.aios/skills/`

4. **Squads em `.claude/commands/` têm conteúdo MÍNIMO**
   - Maioria tem apenas README.md ou 1-10 arquivos
   - `squads/` tem versões completas (96-284 arquivos)
   - **Ação:** Mesclar arquivos únicos, deletar resto

---

## 🗺️ Mapeamento Completo

### 1. Agents

#### 1.1 Agents em `.claude/agents/` (24 arquivos) - TODOS ÚNICOS

**Destino:** `.aios-core/development/agents/`

| Arquivo | Tamanho | Ação |
|---------|---------|------|
| aios-analyst.md | - | MOVER |
| aios-architect.md | - | MOVER |
| aios-data-engineer.md | - | MOVER |
| aios-dev.md | - | MOVER |
| aios-devops.md | - | MOVER |
| aios-pm.md | - | MOVER |
| aios-po.md | - | MOVER |
| aios-qa.md | - | MOVER |
| aios-sm.md | - | MOVER |
| aios-ux.md | - | MOVER |
| copy-chief.md | - | MOVER |
| cyber-chief.md | - | MOVER |
| data-chief.md | - | MOVER |
| db-sage.md | - | MOVER |
| design-chief.md | - | MOVER |
| design-system.md | - | MOVER |
| legal-chief.md | - | MOVER |
| oalanicolas.md | - | MOVER |
| pedro-valerio.md | - | MOVER |
| sop-extractor.md | - | MOVER |
| squad.md | - | MOVER |
| story-chief.md | - | MOVER |
| tools-orchestrator.md | - | MOVER |
| traffic-masters-chief.md | - | MOVER |

#### 1.2 Agents em `.claude/commands/AIOS/agents/` (14 arquivos) - DUPLICADOS

**Ação:** DELETAR (duplicam `.aios-core/development/agents/`)

| Arquivo | Status |
|---------|--------|
| _README.md | DELETE |
| aios-master.md | DELETE (existe em .aios-core) |
| analyst.md | DELETE (existe em .aios-core) |
| architect.md | DELETE (existe em .aios-core) |
| data-engineer.md | DELETE (existe em .aios-core) |
| dev.md | DELETE (existe em .aios-core) |
| devops.md | DELETE (existe em .aios-core) |
| pm.md | DELETE (existe em .aios-core) |
| po.md | DELETE (existe em .aios-core) |
| prompt-architect.md | DELETE (existe em .aios-core) |
| qa.md | DELETE (existe em .aios-core) |
| sm.md | DELETE (existe em .aios-core) |
| squad-creator.md | DELETE (existe em .aios-core) |
| ux-design-expert.md | DELETE (existe em .aios-core) |

### 2. Templates

#### 2.1 Templates em `.claude/templates/` (18 arquivos) - TODOS ÚNICOS

**Destino:** `.aios-core/development/templates/`

| Arquivo | Ação |
|---------|------|
| agent-template.yaml | MOVER |
| architecture-tmpl.yaml | MOVER |
| brainstorming-output-tmpl.yaml | MOVER |
| brownfield-architecture-tmpl.yaml | MOVER |
| brownfield-prd-tmpl.yaml | MOVER |
| competitor-analysis-tmpl.yaml | MOVER |
| database-schema-request-full.md | MOVER |
| database-schema-request-lite.md | MOVER |
| front-end-architecture-tmpl.yaml | MOVER |
| front-end-spec-tmpl.yaml | MOVER |
| fullstack-architecture-tmpl.yaml | MOVER |
| market-research-tmpl.yaml | MOVER |
| prd-tmpl.yaml | MOVER |
| project-brief-tmpl.yaml | MOVER |
| qa-gate-tmpl.yaml | MOVER |
| story-tmpl.yaml | MOVER |
| task-template.md | MOVER |
| workflow-template.yaml | MOVER |

### 3. Skills

#### 3.1 Skills em `.claude/skills/` (3 skills pequenas)

**Destino:** `.aios/skills/`

| Skill | Files | Ação |
|-------|-------|------|
| doc-rot/ | - | MOVER |
| enhance-workflow/ | - | MOVER |
| synapse/ | - | MOVER |

#### 3.2 Skills em `.claude/commands/AIOS/skills/` (50+ skills)

**Destino:** `.aios/skills/`

**Ação:** MOVER TODOS (exceto .deprecated/)

Lista parcial:
- agent-orchestration-improve-agent/
- angular/
- angular-state-management/
- app-builder/
- automate-whatsapp/
- blockchain-developer/
- browser-extension-builder/
- cloud-penetration-testing/
- code-refactoring-refactor-clean/
- concise-planning/
- decision-tree-generator/
- design-system-extractor/
- ethical-hacking-methodology/
- game-development/
- mcp-builder/
- nestjs-expert/
- nextjs-react-expert/
- obsidian-app-filler/
- progress-visualizer/
- python-pro/
- security-auditor/
- tech-search/
- typescript-pro/
- ... (e mais ~30 skills)

**Total estimado:** ~50 skills

### 4. Scripts

#### 4.1 Scripts em `.claude/commands/AIOS/scripts/` (4 arquivos)

**Destino:** `.aios-core/development/scripts/`

| Script | Ação |
|--------|------|
| agent-config-loader.js | MOVER |
| generate-greeting.js | MOVER |
| greeting-builder.js | MOVER |
| session-context-loader.js | MOVER |

### 5. Stories

#### 5.1 Story em `.claude/commands/AIOS/stories/` (1 arquivo)

**Destino:** `docs/stories/active/`

| Story | Ação |
|-------|------|
| story-6.1.4.md | MOVER |

### 6. Squads

#### 6.1 Squads com versões em ambos os lugares

| Squad | .claude/commands/ | squads/ | Estratégia |
|-------|-------------------|---------|------------|
| content-engine | 1 file | 96 files | MERGE → KEEP squads/, delete .claude/ |
| design | 0 files | 67 files | DELETE .claude/ |
| dopamine-learning | 0 files | 32 files | DELETE .claude/ |
| hormozi | 1 file | 242 files | MERGE → KEEP squads/, delete .claude/ |
| icp-cloning | 1 file | 147 files | MERGE → KEEP squads/, delete .claude/ |
| knowledge-base-builder | 0 files | 30 files | DELETE .claude/ |
| mind-cloning | 1 file | 27 files | MERGE → KEEP squads/, delete .claude/ |
| mind-content-updater | 1 file | 17 files | MERGE → KEEP squads/, delete .claude/ |
| mmos-squad | 10 files | 24 files | MERGE MANUAL (analisar conflitos) |
| squad-creator | 0 files | 284 files | DELETE .claude/ |
| tim-ferriss | 0 files | 22 files | DELETE .claude/ |

#### 6.2 Squads APENAS em `.claude/commands/`

| Squad | Files | Estratégia |
|-------|-------|------------|
| Ralph | 1 file | MOVER para squads/Ralph/ |
| synapse | 10 files | MOVER para squads/synapse/ |

---

## 🎯 Plano de Migração por Fases

### **FASE 0: Preparação e Backup** ⏱️ 5min

**Objetivo:** Garantir rollback completo se algo der errado

```bash
#!/bin/bash
# Phase 0: Backup

BACKUP_DIR=".claude-migration-backup-$(date +%Y%m%d-%H%M%S)"

echo "🔒 Creating complete backup..."
mkdir -p "$BACKUP_DIR"

# Backup completo de .claude/
cp -R .claude/ "$BACKUP_DIR/.claude/"

# Backup de squads/ (caso precisemos reverter merges)
cp -R squads/ "$BACKUP_DIR/squads/"

# Backup de .aios-core/development/ (caso precisemos reverter merges)
cp -R .aios-core/development/ "$BACKUP_DIR/.aios-core-development/"

# Backup de .aios/skills/ (se existir)
if [ -d ".aios/skills" ]; then
  cp -R .aios/skills/ "$BACKUP_DIR/.aios-skills/"
fi

# Create backup manifest
cat > "$BACKUP_DIR/MANIFEST.txt" <<EOF
Backup criado em: $(date)
Backup de: .claude/, squads/, .aios-core/development/, .aios/skills/

Para restaurar:
  cp -R $BACKUP_DIR/.claude/ .claude/
  cp -R $BACKUP_DIR/squads/ squads/
  cp -R $BACKUP_DIR/.aios-core-development/ .aios-core/development/
  cp -R $BACKUP_DIR/.aios-skills/ .aios/skills/

Total de arquivos backupados: $(find "$BACKUP_DIR" -type f | wc -l)
EOF

echo "✅ Backup completo criado em: $BACKUP_DIR"
echo "📊 Total de arquivos backupados: $(find "$BACKUP_DIR" -type f | wc -l)"
```

**Validação:**
- [ ] Backup directory criado
- [ ] Todos os arquivos copiados
- [ ] MANIFEST.txt criado

---

### **FASE 1: Migração de Agents** ⏱️ 2min | 🎯 Risco: BAIXO

**Objetivo:** Consolidar todos os agents em `.aios-core/development/agents/`

```bash
#!/bin/bash
# Phase 1: Migrate Agents

echo "📦 FASE 1: Migrando Agents..."

# 1.1 Mover agents únicos de .claude/agents/ para .aios-core/development/agents/
echo "  → Movendo 24 agents de .claude/agents/..."
mv .claude/agents/*.md .aios-core/development/agents/

# 1.2 Deletar agents duplicados em .claude/commands/AIOS/agents/
echo "  → Deletando agents duplicados em .claude/commands/AIOS/agents/..."
rm -rf .claude/commands/AIOS/agents/

echo "✅ FASE 1 Completa"
echo "   • 24 agents movidos para .aios-core/development/agents/"
echo "   • 14 agents duplicados deletados"
```

**Validação:**
```bash
# Verificar que .aios-core/development/agents/ tem 37 agents (13 originais + 24 novos)
ls -1 .aios-core/development/agents/*.md | wc -l
# Expected: 37

# Verificar que .claude/agents/ está vazio
ls .claude/agents/ 2>/dev/null
# Expected: vazio ou apenas .DS_Store
```

**Rollback (se necessário):**
```bash
cp -R $BACKUP_DIR/.claude/agents/ .claude/agents/
rm .aios-core/development/agents/aios-*.md
rm .aios-core/development/agents/*-chief.md
rm .aios-core/development/agents/oalanicolas.md
rm .aios-core/development/agents/pedro-valerio.md
rm .aios-core/development/agents/sop-extractor.md
rm .aios-core/development/agents/squad.md
```

---

### **FASE 2: Migração de Templates** ⏱️ 1min | 🎯 Risco: BAIXO

**Objetivo:** Consolidar templates em `.aios-core/development/templates/`

```bash
#!/bin/bash
# Phase 2: Migrate Templates

echo "📦 FASE 2: Migrando Templates..."

# 2.1 Mover todos os templates de .claude/templates/
echo "  → Movendo 18 templates de .claude/templates/..."
mv .claude/templates/*.yaml .aios-core/development/templates/ 2>/dev/null
mv .claude/templates/*.md .aios-core/development/templates/ 2>/dev/null

echo "✅ FASE 2 Completa"
echo "   • 18 templates movidos para .aios-core/development/templates/"
```

**Validação:**
```bash
# Verificar que templates foram movidos
ls -1 .aios-core/development/templates/*.yaml .aios-core/development/templates/*.md 2>/dev/null | wc -l
# Expected: 21 (3 originais + 18 novos)

# Verificar que .claude/templates/ só tem diretórios (se houver)
find .claude/templates/ -maxdepth 1 -type f 2>/dev/null
# Expected: vazio
```

**Rollback (se necessário):**
```bash
cp -R $BACKUP_DIR/.claude/templates/* .claude/templates/
rm .aios-core/development/templates/agent-template.yaml
rm .aios-core/development/templates/architecture-tmpl.yaml
# ... (deletar todos os 18 templates adicionados)
```

---

### **FASE 3: Migração de Skills** ⏱️ 3min | 🎯 Risco: MÉDIO

**Objetivo:** Consolidar todas as skills em `.aios/skills/`

```bash
#!/bin/bash
# Phase 3: Migrate Skills

echo "📦 FASE 3: Migrando Skills..."

# 3.1 Criar .aios/skills/ se não existir
mkdir -p .aios/skills/

# 3.2 Mover skills de .claude/skills/
echo "  → Movendo 3 skills de .claude/skills/..."
if [ -d ".claude/skills/doc-rot" ]; then mv .claude/skills/doc-rot .aios/skills/; fi
if [ -d ".claude/skills/enhance-workflow" ]; then mv .claude/skills/enhance-workflow .aios/skills/; fi
if [ -d ".claude/skills/synapse" ]; then mv .claude/skills/synapse .aios/skills/; fi

# 3.3 Mover skills de .claude/commands/AIOS/skills/ (exceto .deprecated)
echo "  → Movendo ~50 skills de .claude/commands/AIOS/skills/..."
cd .claude/commands/AIOS/skills/
for skill_dir in */; do
  if [ "$skill_dir" != ".deprecated/" ]; then
    mv "$skill_dir" ../../../../.aios/skills/
  fi
done
cd ../../../..

# 3.4 Mover SKILLS-INDEX.md para .aios/skills/
if [ -f ".claude/commands/AIOS/SKILLS-INDEX.md" ]; then
  mv .claude/commands/AIOS/SKILLS-INDEX.md .aios/skills/
fi

echo "✅ FASE 3 Completa"
echo "   • ~53 skills consolidadas em .aios/skills/"
```

**Validação:**
```bash
# Contar skills migradas
ls -1d .aios/skills/*/ | wc -l
# Expected: ~53

# Verificar que apenas .deprecated ficou
ls -1d .claude/commands/AIOS/skills/*/ 2>/dev/null
# Expected: apenas .deprecated/
```

**Rollback (se necessário):**
```bash
cp -R $BACKUP_DIR/.claude/skills/* .claude/skills/ 2>/dev/null
cp -R $BACKUP_DIR/.claude/commands/AIOS/skills/* .claude/commands/AIOS/skills/
rm -rf .aios/skills/doc-rot .aios/skills/enhance-workflow .aios/skills/synapse
# ... (deletar todas as skills adicionadas)
```

---

### **FASE 4: Migração de Scripts** ⏱️ 1min | 🎯 Risco: BAIXO

**Objetivo:** Mover scripts de ativação para `.aios-core/development/scripts/`

```bash
#!/bin/bash
# Phase 4: Migrate Scripts

echo "📦 FASE 4: Migrando Scripts..."

# 4.1 Mover scripts de .claude/commands/AIOS/scripts/
echo "  → Movendo 4 scripts de .claude/commands/AIOS/scripts/..."
mv .claude/commands/AIOS/scripts/*.js .aios-core/development/scripts/

echo "✅ FASE 4 Completa"
echo "   • 4 scripts movidos para .aios-core/development/scripts/"
```

**Validação:**
```bash
# Verificar scripts movidos
ls .aios-core/development/scripts/*.js | grep -E "(agent-config-loader|generate-greeting|greeting-builder|session-context-loader)"
# Expected: 4 resultados

# Verificar que pasta scripts está vazia
ls .claude/commands/AIOS/scripts/ 2>/dev/null
# Expected: vazio
```

**Rollback (se necessário):**
```bash
cp $BACKUP_DIR/.claude/commands/AIOS/scripts/*.js .claude/commands/AIOS/scripts/
rm .aios-core/development/scripts/agent-config-loader.js
rm .aios-core/development/scripts/generate-greeting.js
rm .aios-core/development/scripts/greeting-builder.js
rm .aios-core/development/scripts/session-context-loader.js
```

---

### **FASE 5: Migração de Stories** ⏱️ 1min | 🎯 Risco: BAIXO

**Objetivo:** Mover story para `docs/stories/active/`

```bash
#!/bin/bash
# Phase 5: Migrate Stories

echo "📦 FASE 5: Migrando Stories..."

# 5.1 Criar docs/stories/active/ se não existir
mkdir -p docs/stories/active/

# 5.2 Mover story
echo "  → Movendo story-6.1.4.md..."
mv .claude/commands/AIOS/stories/story-6.1.4.md docs/stories/active/

echo "✅ FASE 5 Completa"
echo "   • 1 story movida para docs/stories/active/"
```

**Validação:**
```bash
# Verificar story movida
ls docs/stories/active/story-6.1.4.md
# Expected: arquivo existe

# Verificar que pasta stories está vazia
ls .claude/commands/AIOS/stories/ 2>/dev/null
# Expected: vazio
```

**Rollback (se necessário):**
```bash
cp $BACKUP_DIR/.claude/commands/AIOS/stories/story-6.1.4.md .claude/commands/AIOS/stories/
rm docs/stories/active/story-6.1.4.md
```

---

### **FASE 6: Migração de Squads** ⏱️ 10min | 🎯 Risco: ALTO

**Objetivo:** Consolidar squads em `squads/` e deletar duplicatas

#### 6.1 Squads com Merge Simples (maioria vazia em .claude/)

```bash
#!/bin/bash
# Phase 6.1: Delete Empty Squad Directories

echo "📦 FASE 6.1: Deletando squads vazios em .claude/commands/..."

# Squads com 0 files em .claude/ - apenas deletar
EMPTY_SQUADS=(
  "design"
  "dopamine-learning"
  "knowledge-base-builder"
  "squad-creator"
  "tim-ferriss"
)

for squad in "${EMPTY_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Deletando .claude/commands/$squad/ (vazio)"
    rm -rf ".claude/commands/$squad"
  fi
done

echo "✅ FASE 6.1 Completa - 5 squads vazios deletados"
```

#### 6.2 Squads com 1 arquivo - Merge e Delete

```bash
#!/bin/bash
# Phase 6.2: Merge Single-File Squads

echo "📦 FASE 6.2: Mesclando squads com arquivo único..."

SINGLE_FILE_SQUADS=(
  "content-engine"
  "hormozi"
  "icp-cloning"
  "mind-cloning"
  "mind-content-updater"
)

for squad in "${SINGLE_FILE_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Analisando .claude/commands/$squad/..."

    # Verificar se há arquivo único que não existe em squads/
    claude_file=$(find ".claude/commands/$squad" -type f ! -name ".DS_Store" | head -1)

    if [ -n "$claude_file" ]; then
      filename=$(basename "$claude_file")
      target="squads/$squad/$filename"

      if [ ! -f "$target" ]; then
        echo "    • Movendo arquivo único: $filename"
        cp "$claude_file" "squads/$squad/"
      else
        echo "    • Arquivo já existe em squads/, ignorando"
      fi
    fi

    # Deletar pasta de .claude/
    rm -rf ".claude/commands/$squad"
    echo "    ✓ .claude/commands/$squad/ deletado"
  fi
done

echo "✅ FASE 6.2 Completa - 5 squads mesclados e deletados"
```

#### 6.3 Squads com Múltiplos Arquivos - Merge Manual

```bash
#!/bin/bash
# Phase 6.3: Manual Merge Required for mmos-squad

echo "📦 FASE 6.3: Merge manual necessário para mmos-squad..."

echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo ""
echo "Squad: mmos-squad"
echo "  .claude/commands/mmos-squad/  → 10 files"
echo "  squads/mmos-squad/            → 24 files"
echo ""
echo "Passos:"
echo "  1. Comparar arquivos:"
echo "     diff -r .claude/commands/mmos-squad/ squads/mmos-squad/"
echo ""
echo "  2. Identificar arquivos únicos em .claude/"
echo "  3. Mover arquivos únicos para squads/mmos-squad/"
echo "  4. Após validação, executar:"
echo "     rm -rf .claude/commands/mmos-squad/"
echo ""
echo "Executar merge manual agora? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
  echo "Executando diff..."
  diff -qr .claude/commands/mmos-squad/ squads/mmos-squad/ || true
  echo ""
  echo "Revise os arquivos únicos acima."
  echo "Execute manualmente os comandos de merge necessários."
else
  echo "⏭️  Pulando merge manual - será necessário fazer depois"
fi
```

#### 6.4 Mover Squads Únicos

```bash
#!/bin/bash
# Phase 6.4: Move Unique Squads

echo "📦 FASE 6.4: Movendo squads únicos para squads/..."

UNIQUE_SQUADS=(
  "Ralph"
  "synapse"
)

for squad in "${UNIQUE_SQUADS[@]}"; do
  if [ -d ".claude/commands/$squad" ]; then
    echo "  → Movendo $squad..."
    mv ".claude/commands/$squad" "squads/"
    echo "    ✓ squads/$squad/ criado"
  fi
done

echo "✅ FASE 6.4 Completa - 2 squads únicos movidos"
```

**Validação FASE 6:**
```bash
# Verificar que .claude/commands/ só tem AIOS
ls -1d .claude/commands/*/ 2>/dev/null
# Expected: apenas .claude/commands/AIOS/

# Verificar que squads/ tem todos os squads
ls -1d squads/*/ | wc -l
# Expected: ~15 squads
```

**Rollback FASE 6 (se necessário):**
```bash
# Restaurar squads/ completo
cp -R $BACKUP_DIR/squads/* squads/

# Restaurar .claude/commands/
for squad in content-engine design dopamine-learning hormozi icp-cloning \
             knowledge-base-builder mind-cloning mind-content-updater \
             mmos-squad squad-creator tim-ferriss Ralph synapse; do
  if [ -d "$BACKUP_DIR/.claude/commands/$squad" ]; then
    cp -R "$BACKUP_DIR/.claude/commands/$squad" .claude/commands/
  fi
done
```

---

### **FASE 7: Cleanup Final** ⏱️ 2min | 🎯 Risco: BAIXO

**Objetivo:** Deletar estrutura antiga `.claude/commands/AIOS/` e pastas vazias

```bash
#!/bin/bash
# Phase 7: Final Cleanup

echo "📦 FASE 7: Cleanup final..."

# 7.1 Deletar .claude/commands/AIOS/ (agora vazio após todas as migrações)
if [ -d ".claude/commands/AIOS" ]; then
  echo "  → Deletando .claude/commands/AIOS/..."
  rm -rf .claude/commands/AIOS/
fi

# 7.2 Deletar .claude/commands/ se estiver vazio
if [ -d ".claude/commands" ] && [ -z "$(ls -A .claude/commands 2>/dev/null)" ]; then
  echo "  → Deletando .claude/commands/ (vazio)..."
  rm -rf .claude/commands/
fi

# 7.3 Deletar .claude/agents/ se estiver vazio
if [ -d ".claude/agents" ] && [ -z "$(ls -A .claude/agents 2>/dev/null)" ]; then
  echo "  → Deletando .claude/agents/ (vazio)..."
  rm -rf .claude/agents/
fi

# 7.4 Deletar .claude/templates/ se estiver vazio
if [ -d ".claude/templates" ] && [ -z "$(ls -A .claude/templates 2>/dev/null)" ]; then
  echo "  → Deletando .claude/templates/ (vazio)..."
  rm -rf .claude/templates/
fi

# 7.5 Deletar .claude/skills/ se estiver vazio
if [ -d ".claude/skills" ] && [ -z "$(ls -A .claude/skills 2>/dev/null)" ]; then
  echo "  → Deletando .claude/skills/ (vazio)..."
  rm -rf .claude/skills/
fi

echo "✅ FASE 7 Completa - Cleanup finalizado"
```

**Validação:**
```bash
# Verificar que .claude/ só tem arquivos corretos
ls -la .claude/
# Expected: hooks/, rules/, agent-memory/, setup/, settings.json, CLAUDE.md

# Verificar que NÃO existem mais:
ls .claude/commands/ 2>/dev/null      # Should: não existir
ls .claude/agents/ 2>/dev/null        # Should: não existir
ls .claude/templates/ 2>/dev/null     # Should: não existir
ls .claude/skills/ 2>/dev/null        # Should: não existir
```

---

### **FASE 8: Validação Completa** ⏱️ 5min | 🎯 Crítico

**Objetivo:** Garantir que a migração foi bem-sucedida

```bash
#!/bin/bash
# Phase 8: Complete Validation

echo "📦 FASE 8: Validação completa do sistema..."

# 8.1 Validar agents
echo "  → Validando agents..."
npm run validate:agents
if [ $? -ne 0 ]; then
  echo "❌ ERRO: Validação de agents falhou!"
  exit 1
fi

# 8.2 Validar estrutura
echo "  → Validando estrutura do projeto..."
npm run validate:structure
if [ $? -ne 0 ]; then
  echo "❌ ERRO: Validação de estrutura falhou!"
  exit 1
fi

# 8.3 Health check completo
echo "  → Executando health check..."
npx aios-core doctor
if [ $? -ne 0 ]; then
  echo "⚠️  WARNING: Health check encontrou problemas"
fi

# 8.4 Verificar counts
echo ""
echo "📊 Contagem Final:"
echo "  • Agents em .aios-core/development/agents/: $(ls -1 .aios-core/development/agents/*.md | wc -l)"
echo "  • Templates em .aios-core/development/templates/: $(find .aios-core/development/templates/ -maxdepth 1 -type f | wc -l)"
echo "  • Skills em .aios/skills/: $(ls -1d .aios/skills/*/ 2>/dev/null | wc -l)"
echo "  • Scripts em .aios-core/development/scripts/: $(ls -1 .aios-core/development/scripts/*.js | wc -l)"
echo "  • Squads em squads/: $(ls -1d squads/*/ 2>/dev/null | wc -l)"

# 8.5 Verificar que .claude/ está clean
echo ""
echo "📁 Estrutura .claude/ final:"
ls -la .claude/

echo ""
echo "✅ FASE 8 Completa - Validação bem-sucedida"
```

**Checklist de Validação:**

- [ ] `npm run validate:agents` passou
- [ ] `npm run validate:structure` passou
- [ ] `npx aios-core doctor` executou sem erros críticos
- [ ] Contagem de agents: 37 (13 originais + 24 migrados)
- [ ] Contagem de templates: ~21
- [ ] Contagem de skills: ~53
- [ ] Contagem de squads: ~15
- [ ] `.claude/` contém APENAS: hooks/, rules/, agent-memory/, setup/, settings.json, CLAUDE.md
- [ ] Não existem: .claude/commands/, .claude/agents/, .claude/templates/, .claude/skills/

---

## 🔄 Rollback Completo

Se qualquer problema crítico ocorrer, execute:

```bash
#!/bin/bash
# Complete Rollback

BACKUP_DIR="[nome-do-backup-dir]"  # Substituir pelo nome real

echo "🔄 Executando rollback completo..."

# Remover todas as mudanças
rm -rf .claude/
rm -rf squads/
rm -rf .aios-core/development/
rm -rf .aios/skills/

# Restaurar backup
cp -R "$BACKUP_DIR/.claude/" .claude/
cp -R "$BACKUP_DIR/squads/" squads/
cp -R "$BACKUP_DIR/.aios-core-development/" .aios-core/development/
cp -R "$BACKUP_DIR/.aios-skills/" .aios/skills/ 2>/dev/null

echo "✅ Rollback completo - sistema restaurado ao estado anterior"
```

---

## 📋 Resumo de Riscos

| Fase | Risco | Mitigação |
|------|-------|-----------|
| 0 - Backup | ZERO | Apenas backup |
| 1 - Agents | BAIXO | Arquivos não duplicados, apenas mover |
| 2 - Templates | BAIXO | Arquivos não duplicados, apenas mover |
| 3 - Skills | MÉDIO | Muitos arquivos (~53), validar cada um |
| 4 - Scripts | BAIXO | Poucos arquivos (4), críticos para sistema |
| 5 - Stories | BAIXO | Apenas 1 arquivo |
| 6 - Squads | ALTO | Merge manual necessário para mmos-squad |
| 7 - Cleanup | BAIXO | Apenas deletar pastas vazias |
| 8 - Validação | CRÍTICO | Se falhar, rollback imediato |

---

## ⏱️ Tempo Total Estimado

| Fase | Tempo | Tipo |
|------|-------|------|
| Backup | 5 min | Automático |
| Agents | 2 min | Automático |
| Templates | 1 min | Automático |
| Skills | 3 min | Automático |
| Scripts | 1 min | Automático |
| Stories | 1 min | Automático |
| Squads | 10 min | Semi-automático (1 merge manual) |
| Cleanup | 2 min | Automático |
| Validação | 5 min | Automático |
| **TOTAL** | **~30 min** | 90% automático |

---

## 🚀 Execução Recomendada

### Opção 1: Automática com Paradas (RECOMENDADA)

Execute fase por fase, validando entre cada uma:

```bash
# Execute cada fase separadamente
./migration-scripts/phase-0-backup.sh
./migration-scripts/phase-1-agents.sh
# Validar antes de continuar
./migration-scripts/phase-2-templates.sh
# Validar antes de continuar
# ... etc
```

### Opção 2: Automática Completa (Avançado)

Execute script mestre que roda todas as fases:

```bash
./migration-scripts/run-all-phases.sh
```

**⚠️ ATENÇÃO:** Fase 6 (Squads) requer intervenção manual para mmos-squad.

---

## 📝 Checklist Pré-Execução

Antes de iniciar a migração, confirme:

- [ ] Backup completo criado (Fase 0)
- [ ] Git working tree limpo (commit ou stash mudanças)
- [ ] Ninguém mais trabalhando no projeto
- [ ] Tempo disponível (~30-45 min ininterruptos)
- [ ] Permissão de escrita em todas as pastas
- [ ] Espaço em disco suficiente para backup (~500MB)

---

## 📝 Checklist Pós-Execução

Após migração completa:

- [ ] Todas as 8 fases executadas
- [ ] Validação (Fase 8) passou
- [ ] `npm run validate:agents` OK
- [ ] `npm run validate:structure` OK
- [ ] `.claude/` contém apenas arquivos corretos
- [ ] Backup mantido por 7 dias antes de deletar
- [ ] Commit das mudanças com mensagem clara
- [ ] Documentar quaisquer problemas encontrados

---

## 📞 Próximos Passos

Após aprovação deste plano:

1. **Revisar** este documento com time
2. **Aprovar** estratégia de migração
3. **Agendar** janela de manutenção (~1h)
4. **Executar** Fase 0 (Backup)
5. **Executar** Fases 1-8 sequencialmente
6. **Validar** resultado final
7. **Commit** mudanças
8. **Deletar** backup após 7 dias

---

**Plano criado por:** @architect (Aria the Visionary)
**Aguardando aprovação de:** @aios-master / User

— Aria, arquitetando o futuro 🏗️
