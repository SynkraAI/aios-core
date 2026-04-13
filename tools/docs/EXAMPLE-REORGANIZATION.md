# Exemplo: Como Reorganizar Epics Atuais

Baseado nos epics existentes em `docs/stories/epics/`:

```
epic-bob-validation
epic-cli-dx
epic-design-systems
epic-ensinio-prospector-app
epic-mind-cloning
epic-synapse-context-engine
epic-video-transcriber
```

## Aplicando a Decision Tree

### **PERMANECEM EM `docs/stories/epics/`** (GLOBAL)

| Epic | Por quê? |
|------|----------|
| `epic-bob-validation` | Core AIOX (framework-level validation) |
| `epic-cli-dx` | Core AIOX (affects all projects) |
| `epic-synapse-context-engine` | Core AIOX (framework component) |

### **PODEM MOVER PARA PROJETO ESPECÍFICO** (se crescerem)

| Epic | Destino | Condição |
|------|---------|----------|
| `epic-ensinio-prospector-app` | `docs/projects/ensinio/stories/epics/` | Se Ensinio tiver 5+ epics |
| `epic-design-systems` | `docs/projects/design-system/stories/epics/` | Se virar produto/serviço |
| `epic-mind-cloning` | `docs/projects/mind-cloning/stories/epics/` | Se tiver 5+ epics de cloning |
| `epic-video-transcriber` | `docs/projects/media-studio/stories/epics/` | Se for parte de projeto maior |

---

## Cenário Real: Ensinio

Vamos supor que **Ensinio vai virar produto** e você quer isolá-lo:

### Passo 1: Verificar quantos epics Ensinio tem

```bash
ls -1 docs/stories/epics/ | grep -i ensinio
```

**Resultado (hipotético):**
```
epic-ensinio-prospector-app
epic-ensinio-dashboard
epic-ensinio-ghl-sync
epic-ensinio-mind-v3
epic-ensinio-sheets-integration
```

**Total:** 5 epics → **THRESHOLD atingido!**

### Passo 2: Criar estrutura isolada

```bash
# Se projeto já existe em docs/projects/ensinio/
epic-init docs/projects/ensinio

# Se não existe, criar projeto primeiro
/new-project
# → Nome: ensinio
# → Tipo: app
```

### Passo 3: Mover epics

```bash
# Mover todos os epics relacionados
mv docs/stories/epics/epic-ensinio-* docs/projects/ensinio/stories/epics/

# Resultado:
# docs/projects/ensinio/stories/epics/
#   ├── epic-ensinio-prospector-app/
#   ├── epic-ensinio-dashboard/
#   ├── epic-ensinio-ghl-sync/
#   ├── epic-ensinio-mind-v3/
#   └── epic-ensinio-sheets-integration/
```

### Passo 4: Atualizar INDEX.md

Editar `docs/projects/ensinio/INDEX.md`:

```markdown
## Epics

| Epic | Status | Stories | Completion |
|------|--------|---------|------------|
| [EPIC-03: Prospector App](stories/epics/epic-ensinio-prospector-app/) | In Progress | 8 / 12 | 67% |
| [EPIC-04: Dashboard Multi-Projeto](stories/epics/epic-ensinio-dashboard/) | Planning | 0 / 5 | 0% |
| [EPIC-05: GHL Sync v2](stories/epics/epic-ensinio-ghl-sync/) | Complete | 6 / 6 | 100% |
| [EPIC-06: Mind v3.0](stories/epics/epic-ensinio-mind-v3/) | In Progress | 3 / 8 | 38% |
| [EPIC-07: Sheets Integration](stories/epics/epic-ensinio-sheets-integration/) | Planning | 0 / 4 | 0% |

**Total:** 5 epics, 17 / 35 stories complete (49%)
```

### Passo 5: Criar comando de conveniência

Adicionar em `docs/projects/ensinio/INDEX.md`:

```markdown
## Quick Commands

```bash
# Ver epics do Ensinio
ls -lh docs/projects/ensinio/stories/epics/

# Criar novo epic Ensinio
epic 8 nova-feature
# → Cria em docs/projects/ensinio/stories/epics/ (se estiver no projeto)

# Criar story Ensinio
story 8.1 implementar-feature
```
```

---

## Como Decidir HOJE

### Para projetos pequenos/novos:
**USE `docs/stories/epics/` (GLOBAL)**

```bash
# De qualquer lugar
epic 20 meu-novo-epic
```

### Para projetos grandes (5+ epics):
**USE `docs/projects/{nome}/stories/epics/`**

```bash
# 1. Criar estrutura
epic-init docs/projects/{nome}

# 2. cd para o projeto
cd docs/projects/{nome}

# 3. Criar epics
epic 1 primeiro-epic-do-projeto
```

---

## Benefícios de Separar Projetos Grandes

1. **Métricas isoladas** — Quantos epics do Ensinio completos?
2. **Roadmap claro** — Ver evolução de UM produto
3. **Documentação focada** — README só do projeto
4. **Handoffs específicos** — Sessions só do projeto
5. **Facilita venda** — "Este projeto tem X epics, Y% completo"

---

## Quando NÃO Separar

- Projeto tem < 5 epics
- Epic cross-squad (afeta múltiplos squads)
- Trabalho no core do framework
- Feature pequena e isolada

**Nestes casos:** continue usando `docs/stories/epics/` global.

---

**Criado:** 2026-03-14
**Baseado em:** Estrutura atual do aios-core
