# Decision Tree: Onde Colocar Epics e Stories?

## Pergunta 1: É trabalho no CORE do AIOX (framework)?

**SIM** → `docs/stories/epics/` (GLOBAL)
- Exemplos: refactoring de agentes, memory system, core architecture

**NÃO** → Próxima pergunta

---

## Pergunta 2: Afeta MÚLTIPLOS projetos/squads?

**SIM** → `docs/stories/epics/` (GLOBAL)
- Exemplos: Epic de migração que afeta 5 squads, Epic de CI/CD global

**NÃO** → Próxima pergunta

---

## Pergunta 3: Projeto tem 5+ Epics próprios OU vai virar produto?

**SIM** → `docs/projects/{nome}/stories/epics/` (POR PROJETO)
- Exemplos: Ensinio (vai virar produto), AllFluence (app externo)

**NÃO** → `docs/stories/epics/` (GLOBAL)
- Exemplos: Squad novo com 1-2 epics, feature isolada

---

## Resumo Rápido

| Cenário | Onde Colocar |
|---------|--------------|
| Core AIOX (framework, agentes, memory) | `docs/stories/epics/` |
| Squad pequeno (1-3 epics) | `docs/stories/epics/` |
| Feature cross-squad | `docs/stories/epics/` |
| Projeto grande (5+ epics) | `docs/projects/{nome}/stories/epics/` |
| Projeto que vira produto | `docs/projects/{nome}/stories/epics/` |
| App externo (~/CODE/Projects/) | `{app-path}/docs/stories/epics/` |

---

## Exemplo: Ensinio

**Situação:** Projeto Ensinio tem 6 epics, vai virar produto SaaS.

**Decisão:** Criar `docs/projects/ensinio/stories/`

```
aios-core/
└── docs/
    ├── stories/                     # ← Framework-level
    │   └── epics/
    │       └── EPIC-01-core/
    └── projects/
        └── ensinio/
            ├── INDEX.md
            └── stories/             # ← Ensinio-specific
                ├── active/
                ├── done/
                └── epics/
                    ├── EPIC-03-whatsapp-atendimento/
                    ├── EPIC-04-dashboard-multi-projeto/
                    ├── EPIC-05-debito-comercial/
                    └── EPIC-15-prospector-v5/
```

**Por quê:**
- 6 epics (threshold = 5)
- Vai virar produto (precisa rastrear ciclo de vida próprio)
- Métricas isoladas (quantos epics do Ensinio completos?)

---

## Como Implementar

### Se projeto JÁ existe em `docs/projects/{nome}/`:

```bash
cd ~/aios-core
epic-init docs/projects/{nome}
```

Isso cria:
- `docs/projects/{nome}/stories/active/`
- `docs/projects/{nome}/stories/done/`
- `docs/projects/{nome}/stories/epics/`
- etc.

### Se projeto ainda NÃO existe:

```bash
# Usar /new-project (já cria tudo automaticamente)
/new-project
```

---

## Migração (Se Precisar)

Se você tem epics em `docs/stories/epics/EPIC-XX-ensinio-*` e quer mover para estrutura isolada:

```bash
# 1. Criar estrutura
epic-init docs/projects/ensinio

# 2. Mover epics
mv docs/stories/epics/EPIC-03-whatsapp-atendimento docs/projects/ensinio/stories/epics/
mv docs/stories/epics/EPIC-04-dashboard docs/projects/ensinio/stories/epics/
# ... etc

# 3. Atualizar links (se houver)
```

---

**Criado:** 2026-03-14
**Baseado em:** Pergunta sobre organização monorepo vs projeto único
