# Claude Remote Manager — Fixes de Estabilidade + Watchdog

> **Objetivo:** Resolver instabilidade do bot Telegram (hard-restarts a cada 30 min) e adicionar watchdog externo
> **Modo:** HYBRID (repo externo em ~/CODE/tools/claude-remote-manager, governança local)
> **Criado em:** 2026-04-11

---

## Status do Projeto

| Campo | Valor |
|-------|-------|
| Status | 🟢 PR #38 aberto no upstream, aguardando review do grandamenium |
| Sessão mais recente | 2026-04-12 — 6 fixes + 2 ping-pongs Claude×Codex (10/10 PERFECT ambos) + PR upstream + health-check.sh |
| Próximo passo | Aguardar review do grandamenium no PR #38. Se pedir split, separar em 2 PRs. Wire launchd pro health-check. |
| Squad/Agente | Claude Code (fixer) + Codex (reviewer) via code-review-ping-pong |

---

## Decisões Tomadas

### Arquitetura
- **`read_int_config` helper** duplicada em `fast-checker.sh` e `agent-wrapper.sh` (shell scripts são executáveis independentes, não bibliotecas — duplicação é deliberada)
- **Pipeline jq 5-stage:** default → tonumber? → null→0 → int32 clamp → floor
- **Regex guard bash** `^-?[0-9]+$` como belt-and-suspenders no helper
- **int32 clamp** (não int64) porque jq renderiza números > 2^53 em notação científica

### Zombie Detection
- **Positive markers** (Claude UI chrome) em vez de negative prompt regexes
- **Double-sampling** (2s gap entre capturas tmux) para evitar false positive em pane redraw
- Markers: `permissions`, `Worked for`, `Cooked for`, `Baked for`, `context`, `❯`, `│`, `(esc to interrupt)`

### Telegram setMyCommands
- Limite REAL é **~7KB de payload** (não 100 comandos como documentado)
- Binary search por byte budget (`MAX_PAYLOAD_BYTES=6500`)
- `LC_ALL=C wc -c` (não `${#var}` que conta chars sob UTF-8)
- `LC_ALL=C cut -b1-253` pra descriptions (não `cut -c` que é locale-dependent)

### PR Strategy
- Fork `luizfosc/claude-remote-manager` NÃO é fork do GitHub (standalone) → criado `luizfosc/claude-remote-manager-upstream-fork` (fork real) pra abrir PR
- Branch: `fix/bash3-compat-and-payload-budget`
- PR: `grandamenium/claude-remote-manager#38`

---

## Repositórios

| Repo | Papel |
|------|-------|
| `grandamenium/claude-remote-manager` | Upstream original |
| `luizfosc/claude-remote-manager` | Repo standalone (não-fork), bot roda daqui |
| `luizfosc/claude-remote-manager-upstream-fork` | Fork real, PR #38 aberto daqui |

---

## Ping-Pong History

| Scope | Rounds | Score Final | CRITICA |
|-------|--------|------------|---------|
| `codex-review-pr38` | 4 (9→8→9→10) | 10/10 PERFECT | APPROVED |
| `codex-review-health-check` | 4 (7→8→8→10) | 10/10 PERFECT | APPROVED |

---

## Histórico

| Data | Resumo |
|------|--------|
| 2026-04-11 | Diagnóstico: bot Telegram caindo a cada 30 min. 3 causas raiz: bash 3.2 `${TYPE^^}`, watchdog 600s hardcoded, setMyCommands ~7KB limit. 6 fixes aplicados. PR #38 aberto. |
| 2026-04-11 | Ping-pong #1 (Codex×Claude): 4 rounds, hardening do `read_int_config` (float leak → int32 clamp → regex guard). Push'd ao PR #38. |
| 2026-04-12 | Ping-pong #2 (Codex×Claude): health-check.sh revisado 4 rounds (restart status, positive zombie, JSON schema, singleton lock). Commit'd e push'd ao PR #38. |
