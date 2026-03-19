# Story: Hardening do skill /audit-project-config

**Status:** Done
**Priority:** P0 (Critical)
**Effort:** 6.5h (3 sprints)
**Source:** Analise Tripartida 2026-03-18 (Kaizen 7.5 | Knowledge 8.0 | Process 4.2 VETO)
**Report:** `docs/reports/audit-project-config-analysis.md`

---

## Context

O skill `/audit-project-config` tem arquitetura solida mas foi vetado pelo @pedro-valerio (4.2/10) por ter 8 wrong paths criticos e zero enforcement em checkpoints. @oalanicolas identificou 3 gaps P0 de documentacao (template path, project types, placeholders). Kaizen identificou validacao superficial do settings.json e ausencia de dry-run.

Sem hardening, o skill pode: computar paths errados silenciosamente, fazer bulk corruption via auto-fix sem preview, e falhar silenciosamente no subprocess.

---

## Acceptance Criteria

### Sprint 1: Blockers (~3h)

- [x] **AC-1: Input Validation (Vetos 1-3)** — Skill DEVE validar ACTIVE.md antes de processar
  - VETO_1: Se `docs/projects/ACTIVE.md` nao existe -> HALT com mensagem clara
  - VETO_2: Se table nao tem colunas "Projeto" e "INDEX" -> HALT com schema esperado
  - VETO_3: Se 0 projetos parseados -> HALT com mensagem
  - Arquivos: `tools/audit-project-configs.js`

- [x] **AC-2: Path Safety (Vetos 4-6)** — Paths DEVEM ser validados antes de qualquer operacao
  - VETO_4: Link INDEX sem `.aios/` nem `docs/projects/` -> SKIP projeto + WARN
  - VETO_5: Path computado fora de project root esperado -> HALT
  - VETO_6: Path relativo nao resolve para absoluto -> HALT
  - Regra: Converter TUDO para path absoluto antes de operar
  - Arquivos: `tools/audit-project-configs.js`

- [x] **AC-3: Dry-Run Obrigatorio (Veto 7)** — Auto-fix DEVE mostrar preview antes de executar
  - Mostrar lista: projeto -> destination path -> tipo
  - Opcao "corrigir 1 primeiro (validacao)" antes de batch (--first-only)
  - Se primeiro fix falha -> HALT batch inteiro (Veto 8)
  - Destination not writeable -> SKIP + WARN (Veto 9)
  - Arquivos: `tools/fix-project-configs.js`

- [x] **AC-4: Validacao Profunda settings.json** — Detectar erros conhecidos
  - Check `hooks` como array (erro fatal, ref: `.claude/rules/settings-format.md`)
  - Check matchers incorretos (objeto em vez de string)
  - Check `permissions.allow` e `permissions.deny` existem
  - Severidade por check: CRITICAL / HIGH / MEDIUM
  - Arquivos: `tools/audit-project-configs.js`

### Sprint 2: Critical (~2h)

- [x] **AC-5: Subprocess Error Handling (Vetos 10-12)** — Implementado em fix-project-configs.js
  - VETO_10: Exit code != 0 -> HALT batch com stderr
  - VETO_11: Arquivo esperado nao criado apos sucesso -> HALT
  - VETO_12: Arquivo criado mas JSON invalido -> HALT

- [x] **AC-6: Validation Layer Separation** — L1 + L2 implementados, L3 (temporal) futuro
  - L1 Structural: Arquivos existem? (implementado)
  - L2 Semantic: Conteudo valido? (implementado)
  - L3 Temporal: Futuro (template version hash)

- [x] **AC-7: Template Structure Docs** — Implementado no SKILL.md v2.0
  - Secao "Project Types" com enum
  - Tabela de placeholders com exemplos
  - Mode Selection Guide (CENTRALIZED vs HYBRID)
  - Secao "Dependencies" com paths

### Sprint 3: Enhancements (~1.5h)

- [x] **AC-8: Relatorio Exportavel** — Salva em docs/reports/project-config-audit.md

- [x] **AC-9: Health Score Summary** — Mostra "Project Health: X/Y OK (Z%)"

- [x] **AC-10: Placeholder Detection Context-Aware** — Ignora code blocks e HTML comments

---

## Definition of Done

- [x] Todos os ACs implementados (10/10)
- [x] Skill atualizado com vetos, dry-run, e validacoes
- [x] Report de analise referenciado na story
- [x] Audit real: 16/16 OK (100%)
- [x] 12 vetos implementados, dry-run obrigatorio, validation layers L1+L2

---

## File List

| Arquivo | Status | Descricao |
|---------|--------|-----------|
| `tools/audit-project-configs.js` | Modificado (v2.0) | Script de audit com vetos + validation layers |
| `tools/fix-project-configs.js` | Modificado (v2.0) | Script de fix com dry-run + first-fix |
| `.aios/skills/audit-project-config/SKILL.md` | Modificado (v2.0) | Skill com docs completos |
| `docs/reports/audit-project-config-analysis.md` | Criado | Relatorio tripartido |
| `docs/reports/project-config-audit.md` | Gerado | Ultimo audit report |

---

## References

- Analise Tripartida: `docs/reports/audit-project-config-analysis.md`
- Settings Format Rules: `.claude/rules/settings-format.md`
- Story similar (vetos): `docs/stories/active/TRANS-2-add-veto-conditions.md`

---

## Axiomas Aplicaveis

### Process (@pedro-valerio)
- PV_PATH_INFERENCE: Path por heuristica sem validar
- PV_BULK_ACTION: Batch sem validacao individual
- PV_USER_CHOICE_BYPASS: Escolha sem validation
- PV_RELATIVE_PATH_HELL: `../` em path computation
- PV_TABLE_PARSE_BLIND: Parse Markdown sem schema

### Knowledge (@oalanicolas)
- AN_KE_001: Domain Boundary via User Consent
- AN_KE_002: External Dependency Documentation
- AN_KE_003: Implicit Knowledge Triage
- AN_KE_004: Validation Layer Separation
- AN_KE_005: Progressive Disclosure for Skills
- AN_KE_006: External Dependency Graph
