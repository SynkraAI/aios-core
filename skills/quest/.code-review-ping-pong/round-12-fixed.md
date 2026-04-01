---
protocol: code-review-ping-pong
type: fix
round: 12
date: "2026-04-01"
fixer: "Claude Opus 4.6"
review_file: round-12.md
commit_sha_before: "de5f51619e9b8d803bc61ce686f64b848e516b6d"
commit_sha_after: "6d61d46268e132c9d9ef3748a353a0bcb26386d9"
branch: chore/devops-10-improvements
issues_fixed: 4
issues_skipped: 0
issues_total: 4
git_diff_stat: "2 files changed, 11 insertions(+), 1 deletion(-)"
quality_checks:
  lint: skipped
  typecheck: skipped
  tests: skipped
fixes:
  - id: "12.1"
    status: FIXED
    file: "engine/guide.md"
    description: "Adicionado bloco de cross-reference ao contrato unificado da progress bar no header da seção §5 (Quest Log View). O bloco lista explicitamente os 4 locais que compartilham o contrato (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) e exige update simultâneo. Propagação semântica: os 4 locais do contrato já tinham referências internas — guide.md §5 era o único que não mencionava o contrato no header da seção (apenas dentro da função progress_bar). Nenhum arquivo adicional precisou de correção."
    deviation: "none"
  - id: "12.2"
    status: FIXED
    file: "SKILL.md"
    description: "Expandido o aviso de deprecation na Critical Rule 5 do SKILL.md para incluir cross-reference a checklist.md §1 (bloco de comentário em achievements) e xp-system.md §7. Agora explica que total_xp >= N é alias de item_xp >= N, que avalia total_base_xp (não o total_xp do usuário), e que será removido em versão futura. Propagação semântica: os 3 locais que mencionam deprecation (xp-system.md §7, checklist.md §1, SKILL.md) agora se cross-referenciam mutuamente. Nenhum outro módulo referencia achievement conditions diretamente."
    deviation: "none"
  - id: "12.3"
    status: FIXED
    file: "engine/guide.md"
    description: "Adicionado bloco explícito no algoritmo de Next Mission Selection (§2, passo 3) explicando que itens unused são implicitamente excluídos da iteração (não são pending), com cross-reference a checklist.md §1 (lifecycle do unused) e xp-system.md §5 (exclusão de counters). Propagação semântica: os módulos que iteram itens ou calculam stats são — guide.md §2 (seleção), guide.md §2 is_phase_unlocked (já tinha cross-ref linhas 91-98), xp-system.md §4 (streak, já exclui unused), xp-system.md §5 (counters, já exclui), xp-system.md §7 (achievements, já exclui com continue). Todos já tratam unused corretamente; guide.md §2 algoritmo era o único sem menção explícita."
    deviation: "none"
  - id: "12.4"
    status: FIXED
    file: "engine/guide.md"
    description: "Expandido o fallback para condition fields missing/malformed em guide.md §2 para mencionar enforcement bidirecional: tanto guide.md §2 quanto checklist.md §1 tratam conditions ausentes/malformadas como unconditional/pending para forward compatibility. Propagação semântica: os 2 módulos que lidam com condition fields são guide.md §2 (seleção de missão) e checklist.md §1 (definição e persistência). Ambos agora documentam a mesma regra de fallback com cross-reference mútuo. Nenhum outro módulo avalia condition fields."
    deviation: "none"
preserved:
  - "engine/ceremony.md — sem alterações necessárias, já possui contratos de progress bar e hero_name/hero_title completos"
  - "engine/xp-system.md — sem alterações necessárias, já documenta deprecation e unused exclusion em todas as seções relevantes"
  - "engine/checklist.md — sem alterações necessárias, já possui deprecation warning e fallback documentation completos"
  - "engine/scanner.md — fora do escopo das 4 issues deste round"
---

# Code Ping-Pong — Round 12 Fix Report

## Summary

4 issues corrigidas (2 HIGH, 2 MEDIUM). Todas as correções são adições de cross-references e documentação de contratos entre módulos — nenhuma lógica de runtime foi alterada. O padrão comum: módulos que participam de contratos compartilhados (progress bar, unused lifecycle, deprecation, condition fallback) já implementavam a lógica corretamente, mas faltavam referências explícitas em pontos específicos.

## Fixes Applied

### Fix for Issue 12.1

**Progress bar contract reference not fully propagated in guide.md §5**

- **Severidade:** HIGH
- **Arquivo:** `engine/guide.md` (seção §5 header)
- **O que foi feito:** Adicionado bloco `**Contract — progress bar in this view:**` logo após o parágrafo introdutório da seção §5 (Quest Log View). O bloco lista os 4 locais que compartilham o contrato unificado da progress bar e exige atualização simultânea.
- **Anti-whack-a-mole:** Grep por `progress_bar` e `█.*░` em todos os arquivos do escopo. Os 4 locais do contrato (ceremony.md §2, ceremony.md §7, guide.md §5, guide.md §6) já tinham referências internas — guide.md §5 era o único sem menção no header da seção.
- **Propagação semântica:** O contrato visual da progress bar é compartilhado por exatamente 4 locais. Cada um agora referencia os outros 3 explicitamente.

### Fix for Issue 12.2

**Achievement condition deprecation warning not cross-referenced in SKILL.md**

- **Severidade:** HIGH
- **Arquivo:** `SKILL.md` (Critical Rule 5)
- **O que foi feito:** Expandido o aviso de deprecation para incluir: (a) que `total_xp >= N` é alias de `item_xp >= N`, (b) que avalia `total_base_xp` e não o `total_xp` do usuário, (c) cross-reference a xp-system.md §7 e checklist.md §1, (d) que será removido em versão futura.
- **Anti-whack-a-mole:** Grep por `total_xp >= N` e `item_xp >= N` em todos os arquivos. Encontrados em 3 locais: xp-system.md §7 (já completo), checklist.md §1 (já completo), SKILL.md (precisava expansão).
- **Propagação semântica:** Os 3 locais que documentam achievement conditions agora se cross-referenciam mutuamente. Nenhum outro módulo define ou avalia conditions.

### Fix for Issue 12.3

**Edge case for unused items in phase unlock not cross-referenced in guide.md §2**

- **Severidade:** MEDIUM
- **Arquivo:** `engine/guide.md` (§2, passo 3 do algoritmo)
- **O que foi feito:** Adicionado bloco explicativo antes de "Find the first item with status pending" dizendo que itens unused são implicitamente excluídos (não são pending), com cross-references a checklist.md §1 e xp-system.md §5.
- **Anti-whack-a-mole:** Verificados TODOS os módulos que iteram itens ou calculam stats:
  - `guide.md §2 is_phase_unlocked()` — já tinha cross-ref (linhas 91-98)
  - `xp-system.md §4` (streak) — já exclui unused com filtro explícito
  - `xp-system.md §5` (counters) — já exclui unused de items_total
  - `xp-system.md §7` (achievements) — já usa `if status == "unused": continue`
  - `guide.md §2` (algoritmo principal) — era o único sem menção explícita
- **Propagação semântica:** O contrato "unused = invisível" é compartilhado por 5 pontos de iteração. Todos agora documentam a exclusão explicitamente.

### Fix for Issue 12.4

**Fallback for missing or malformed 'condition' field not referenced in guide.md**

- **Severidade:** MEDIUM
- **Arquivo:** `engine/guide.md` (§2, fallback block)
- **O que foi feito:** Expandido o bloco de fallback para mencionar que a regra é enforced em AMBOS os módulos (guide.md §2 e checklist.md §1) para forward compatibility — se qualquer módulo encontrar condition ausente/malformada, trata como unconditional/pending.
- **Anti-whack-a-mole:** Grep por `condition` e `malformed` nos arquivos do escopo. Os 2 módulos que lidam com condition fields são guide.md §2 e checklist.md §1 — ambos já implementavam o fallback, mas guide.md não mencionava o enforcement bidirecional.
- **Propagação semântica:** O contrato de fallback para conditions envolve exatamente 2 módulos. Ambos agora documentam que o fallback é mútuo.

## Skipped Issues

Nenhuma issue foi pulada.

## Quality Checks

- **lint:** skipped (projeto é documentação Markdown, sem linter configurado)
- **typecheck:** skipped (sem código TypeScript)
- **tests:** skipped (sem testes automatizados para documentação)
