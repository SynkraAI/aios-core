# AIOS Skills Index

Skills distribuidas com o framework AIOS (via `aios install` / `aios update`).

**Ultima atualizacao:** 2026-02-11

---

## Skills do AIOS Hub

```
.aios/skills/
├── superpowers/                    # Skills do repositorio obra/superpowers
│   ├── test-driven-development/
│   ├── verification-before-completion/
│   ├── requesting-code-review/
│   ├── receiving-code-review/
│   ├── brainstorming/
│   ├── writing-plans/
│   ├── executing-plans/
│   └── finishing-a-development-branch/
├── design-system-extractor/        # Extracao de design systems de sites
├── criar-app-completo/             # Workflow completo de criacao de app
├── prd-generator/                  # Geracao de PRDs
└── dashboard-generator/            # Dashboards interativos e sites de apresentacao
```

---

## Categorias

### Quality & Testing (Superpowers Collection)

| Skill | Descricao | Ativacao |
|-------|-----------|----------|
| test-driven-development | Ciclo RED-GREEN-REFACTOR | Automatica |
| verification-before-completion | Evidencia antes de claims | Automatica |
| requesting-code-review | Workflow de solicitar review | Manual |
| receiving-code-review | Processar feedback de review | Automatica |

### Planning & Workflow (Superpowers Collection)

| Skill | Descricao | Ativacao |
|-------|-----------|----------|
| brainstorming | Refinamento socratico de design | Automatica |
| writing-plans | Planos com micro-tasks de 2-5 min | Apos brainstorming |
| executing-plans | Execucao em batch com checkpoints | Referencia ao plano |
| finishing-a-development-branch | Merge/PR/cleanup | Pos-execucao |

### Design & Development

| Skill | Descricao | Ativacao |
|-------|-----------|----------|
| design-system-extractor | Extracao de design tokens de websites | `/AIOS:skills:design-system-extractor` |
| dashboard-generator | Dashboards e sites interativos com Chart.js | `/AIOS:skills:dashboard-generator` |
| criar-app-completo | Workflow completo de criacao de app | Manual |
| prd-generator | Geracao de PRDs profissionais | Manual |

---

## Skills movidas (2026-02-09)

As seguintes skills foram reorganizadas:

| Skill | De | Para | Motivo |
|-------|-----|------|--------|
| document-processing | `.aios/skills/` | `tools/document-processing/` | 249MB com .venv — virou tool standalone |
| obsidian-app-filler | `.aios/skills/` | `~/.claude/skills/` | Skill pessoal, funciona global |
| obsidian-tag-manager | `.aios/skills/` | `~/.claude/skills/` | Skill pessoal, funciona global |

---

## Repositorios Fonte

- **Superpowers:** https://github.com/obra/superpowers
- **Anthropic Skills:** https://github.com/anthropics/skills
