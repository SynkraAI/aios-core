# Plano de Padronização de Frontmatter

> **Status:** Draft
> **Data:** 2026-04-08
> **Tool:** `node tools/frontmatter-lint.js`

---

## Diagnóstico Atual

| Categoria | Arquivos | Health | Pior Problema |
|-----------|----------|--------|---------------|
| **Skills** | 72 | 🟢 Bom | 5 sem frontmatter, 4 sem `name`/`description` |
| **Squads** | 67 | 🔴 Crítico | 57 sem frontmatter nenhum (85%) |
| **Agents** | 473 | 🔴 Crítico | 342 com YAML em code fence (não parseável), 32 sem nada |
| **Memory** | 47 | 🟢 Excelente | 44 nota A+, padrão ouro |

**Score geral: 18/100**

---

## Schema Padrão por Tipo

### Skills (`skills/{name}/SKILL.md`)

```yaml
---
name: skill-name
description: |
  1-3 frases: o que faz, quando usar, quando NÃO usar.
  Palavras-chave naturais para busca.
version: 1.0.0
category: orchestration | content | development | research | tooling | integration
tags: [tag1, tag2, tag3]
---
```

**Campos obrigatórios:** `name`, `description`
**Campos recomendados:** `version`, `category`, `tags`
**Token budget:** 50-90 tokens

### Squads (`squads/{name}/README.md`)

```yaml
---
name: squad-name
description: |
  1-2 frases: propósito do squad e quando ativar.
version: 1.0.0
category: content | development | research | business | design
---
```

**Campos obrigatórios:** `name`, `description`
**Campos recomendados:** `version`, `category`
**Token budget:** 40-80 tokens

### Agents — AIOS Core (`.aiox-core/development/agents/{name}.md`)

```yaml
---
name: agent-name
description: O que este agente faz em 1 frase.
role: developer | qa | architect | devops | pm | po | sm | analyst | data-engineer | ux
---
```

**Campos obrigatórios:** `name`, `description`
**Campos recomendados:** `role`
**Token budget:** 30-50 tokens

> **NOTA:** O bloco YAML de ativação (`ACTIVATION-NOTICE`, `IDE-FILE-RESOLUTION`, etc.) continua NO CORPO do arquivo. O frontmatter é APENAS metadata para indexação — não substitui a lógica de ativação.

### Agents — Squad (`squads/{squad}/agents/{name}.md`)

```yaml
---
name: agent-name
description: O que este agente faz em 1 frase.
role: chief | specialist | analyst | creator | reviewer
squad: squad-name
---
```

**Campos obrigatórios:** `name`, `description`
**Campos recomendados:** `role`, `squad`
**Token budget:** 30-60 tokens

### Memory Files (padrão ouro — NÃO MEXER)

```yaml
---
name: memory-name
description: Uma linha descrevendo o conteúdo.
type: user | feedback | project | reference
---
```

**Já está excelente.** 94% nota A+. Manter como está.

---

## Plano de Execução

### Wave 1 — Quick Wins (Impacto alto, esforço baixo)

**Skills sem frontmatter (5 arquivos):**
- `content-forge/SKILL.md`
- `context-surgeon/SKILL.md`
- `ecosystem-audit/SKILL.md`
- `memory-audit/SKILL.md`
- `superpowers/SKILL.md`

**Ação:** Adicionar frontmatter YAML padrão no topo de cada arquivo.

### Wave 2 — Squads READMEs (57 arquivos)

O maior grupo problemático. Squads não têm frontmatter nenhum.

**Ação:** Adicionar bloco `---` no topo de cada `README.md` com `name` + `description` + `version` + `category`.

**Prioridade dentro da wave:**
1. Squads mais usados (curator, content-creator, copywriting, branding, hormozi)
2. Squads com agents (têm sub-arquivos que também precisam)
3. Restante

### Wave 3 — Agents AIOS Core (12 arquivos)

Agents core usam `ACTIVATION-NOTICE` + YAML em code fence.

**Ação:** Adicionar frontmatter YAML real ANTES do `# agent-name`, mantendo o resto intacto.

**Antes:**
```markdown
# dev

ACTIVATION-NOTICE: This file contains...
```

**Depois:**
```markdown
---
name: dev
description: Implementação de código, git local, story file updates.
role: developer
---

# dev

ACTIVATION-NOTICE: This file contains...
```

### Wave 4 — Squad Agents (342+ arquivos)

O maior volume. Mesmo padrão da Wave 3.

**Ação:** Script automatizado (`--fix` mode no frontmatter-lint) para injetar frontmatter baseado no nome do arquivo e squad pai.

### Wave 5 — Refinamento

- Skills com `description` curta demais (< 20 chars) — enriquecer
- Skills sem `version`/`category`/`tags` — completar
- Rodar `frontmatter-lint` semanalmente via Kaizen

---

## Integração com Kaizen

Adicionar ao Kaizen v2 daily sensing:

```yaml
# Em squads/kaizen-v2/config/config.yaml
frontmatter_audit:
  enabled: true
  schedule: weekly
  command: "node tools/frontmatter-lint.js --json"
  threshold: 50  # health score mínimo
  alert_on: HIGH  # alertar quando issue HIGH aparecer
```

O Kaizen pode rodar o lint como parte do daily capture e incluir o health score no briefing de sessão.

---

## Métricas de Sucesso

| Métrica | Atual | Meta Wave 1-2 | Meta Final |
|---------|-------|---------------|------------|
| Health score | 18/100 | 50/100 | 80/100 |
| Arquivos nota F | 95 | < 10 | 0 |
| Squads com frontmatter | 15% | 100% | 100% |
| Agents com frontmatter parseável | 21% | 21% | 90%+ |

---

## Regra para Novos Arquivos

A partir de agora, todo novo arquivo de skill, squad ou agent **DEVE** ter frontmatter YAML padrão. O `frontmatter-lint` pode ser integrado como pre-commit hook ou quality gate.

```bash
# Verificar antes de commitar
node tools/frontmatter-lint.js --scope=skills
```
