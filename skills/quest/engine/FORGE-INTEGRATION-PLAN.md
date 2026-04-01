# Plano de Integração Quest → Forge

> **Status:** Implementado (testes pendentes)
> **Data:** 2026-03-31
> **Autor:** Luiz Fosc x Claude

## Contexto

Hoje o Quest mostra missões e espera o usuário executar manualmente. O Forge tem pipeline completo com orquestração de agentes. A integração faz o Quest delegar a execução pro Forge automaticamente.

**Regra:** Quest DEVE usar Forge como motor de execução. OBRIGATÓRIO.

## Arquitetura

```
Quest (guide.md) → forge-bridge.md (novo) → /forge (skill existente)
                                          ↓
                                    Agentes AIOS (@dev, @qa, @devops...)
                                          ↓
                              Resultado → checklist.md (auto-check)
```

### Separação de responsabilidades

| | FORGE | QUEST |
|-|-------|-------|
| Papel | Executor — orquestra agentes, roda fases, entrega resultado | Gamificador — XP, levels, achievements, visual RPG |
| Analogia | Motor do carro | Painel do carro (velocímetro, nível de combustível) |
| Sabe | Como chamar @dev, @qa, @architect na ordem certa | Quantos itens foram feitos, qual o próximo, quanto XP |
| Não sabe | Nada de XP ou achievements | Nada de como executar o trabalho real |

---

## Checklist de Implementação

### 1. Criar `engine/forge-bridge.md` (NOVO ARQUIVO)

Módulo que traduz missões Quest → comandos Forge.

- [x] **1.1** Criar arquivo `skills/quest/engine/forge-bridge.md`
- [x] **1.2** Definir tabela de mapeamento `who` → modo Forge:

| `who` (pack item) | Ação |
|---|---|
| `@dev` | `/forge feature "{item.label}"` |
| `@devops` | `/forge feature "{item.label}"` (Forge roteia pra @devops internamente) |
| `@sm`, `@po`, `@pm` | `/forge feature "{item.label}"` (Forge roteia pro agente certo) |
| `user` | Mostrar instrução manual (sem Forge) — ex: "Instalar AIOS no projeto" |
| `skill` ou referência a `/skill-name` | Invocar a skill diretamente via `Skill` tool |
| `squad` | Invocar o squad referenciado |

- [x] **1.3** Definir função `should_use_forge(item)`:
  - Retorna `true` se `who` é um agente AIOS (`@dev`, `@sm`, `@po`, `@qa`, `@devops`, `@pm`, `@architect`, `@data-engineer`, `@analyst`)
  - Retorna `false` se `who` é `user`, `skill`, ou `squad`
  - Items com `command` que começa com `/` (slash command) → invocar skill diretamente, sem Forge

- [x] **1.4** Definir função `build_forge_command(item, pack, quest_log)`:
  - Extrai `item.label` + `item.command` como descrição pro Forge
  - Detecta modo: se é item de build → `feature`, se é fix → `fix`, se é setup → `feature`
  - Usa `forge_mode` do item se presente (override explícito)
  - Usa `forge_workflow` do pack se presente (workflow específico)
  - Retorna string do comando Forge

- [x] **1.5** Definir função `handle_forge_result(item, result)`:
  - Se Forge completou com sucesso → retorna `{ auto_check: true }`
  - Se Forge falhou → retorna `{ auto_check: false, error: "..." }`
  - Se Forge fez checkpoint (parou pra perguntar) → retorna `{ paused: true }`

### 2. Modificar `engine/guide.md` — Mission Card (§3)

- [x] **2.1** Adicionar campo `EXECUÇÃO` ao template do Mission Card:
  ```
  EXECUÇÃO:
  🔨 Forge: /forge feature "{item.label}"    ← quando should_use_forge = true
  👤 Manual: {item.command}                  ← quando should_use_forge = false
  ```

- [x] **2.2** Modificar §7 (Interaction Flow) — Após mostrar mission card:
  - Se `should_use_forge(item)` é `true`:
    ```
    "Executar via Forge? (s/n)"
    - s → ler forge-bridge.md, executar build_forge_command(), após resultado chamar handle_forge_result()
    - n → fluxo manual atual (usuário executa sozinho)
    ```
  - Se `should_use_forge(item)` é `false`:
    - Manter fluxo atual (instrução manual)

- [x] **2.3** Após Forge completar com sucesso, auto-check:
  - Chamar `checklist.md` → `check {item.id}` automaticamente
  - Mostrar celebração normalmente (XP, level up, etc.)
  - Mostrar próxima missão

- [x] **2.4** Se Forge falhar:
  - Mostrar erro do Forge
  - Perguntar: "Tentar novamente? (s/n)"
  - Se `s` → re-executar Forge
  - Se `n` → manter missão pendente, mostrar dica

### 3. Modificar `engine/guide.md` — Interaction Flow (§7)

- [x] **3.1** Atualizar fluxo principal do step 2-4:
  ```
  ANTES:
  2. Engine waits — hero goes to execute
  3. When hero returns, ask: "Completou?"

  DEPOIS:
  2. If should_use_forge(item):
     2a. Ask "Executar via Forge? (s/n)"
     2b. If s: read forge-bridge.md, execute, auto-check on success
     2c. If n: fall through to manual flow
  3. If manual flow: same as before ("Completou?")
  ```

- [x] **3.2** Manter compatibilidade: se o usuário rodar `/quest check {id}` manualmente (sem Forge), continua funcionando normalmente

### 4. Atualizar packs — Adicionar campos `forge_mode` e `forge_workflow` (OPCIONAL)

- [x] **4.1** Adicionar campo opcional `forge_mode` nos items dos packs para override:
  ```yaml
  - id: "4.2"
    label: "Implementar stories"
    forge_mode: "feature"  # override explícito (opcional)
  ```

- [x] **4.2** Adicionar campo `forge_workflow` no pack metadata para workflow-specific packs:
  ```yaml
  pack:
    id: design-system-forge
    forge_workflow: "design-system"  # mapeia pro workflow do Forge
  ```

- [ ] **4.3** ← PENDENTE (app-development.yaml não precisa de forge_workflow — usa inferência por item) Atualizar `app-development.yaml` — adicionar `forge_mode` nos items onde faz sentido
- [x] **4.4** Atualizar `squad-upgrade.yaml` — mesma lógica
- [x] **4.5** Atualizar `design-system-forge.yaml` — adicionar `forge_workflow: "design-system"`

### 5. Criar novos workflows no Forge

- [x] **5.1** Criar `skills/forge/workflows/design-system.md` — baseado no pack design-system-forge.yaml
  - Fases: extração de DNA → scraping referências → tokens → componentes → páginas → deploy
  - Agentes: @ux-design-expert, @dev, @architect, @qa, @devops
- [x] **5.2** Criar `skills/forge/workflows/squad-upgrade.md` — baseado no pack squad-upgrade.yaml
  - Fases: audit → reestruturar → validar → documentar
  - Agentes: @architect, @dev, @qa
- [x] **5.3** Atualizar `skills/forge/SKILL.md` — adicionar novos modos na classificação de intent:
  ```
  /forge design-system {url}    -> DESIGN_SYSTEM
  /forge squad-upgrade {name}   -> SQUAD_UPGRADE
  ```

### 6. Modificar `engine/checklist.md` — Auto-check via Forge

- [x] **6.1** Adicionar campo `checked_by` no item status:
  ```yaml
  "4.2": { status: done, completed_at: "...", checked_by: "forge" }
  ```
  - `checked_by: "forge"` → auto-checked após Forge completar
  - `checked_by: "user"` → checked manualmente
  - `checked_by: "scan"` → detectado por scan
  - Campo opcional, backward-compatible (ausência = "user")

- [x] **6.2** Documentar no §4 (Check) que `check` pode ser chamado com source:
  ```
  check {id} [source=user|forge|scan]
  ```

### 7. Atualizar SKILL.md (entry point)

- [x] **7.1** Adicionar `engine/forge-bridge.md` na lista de módulos lazy-loaded
- [x] **7.2** Adicionar regra: "Quando guide.md precisa executar uma missão via Forge, ler `engine/forge-bridge.md` para obter o mapeamento"
- [x] **7.3** Atualizar Critical Rules com: "Forge é o motor de execução padrão para missões com agentes AIOS"

### 8. Testes / Validação

- [ ] **8.1** Testar fluxo completo: `/quest` → missão com `who: "@dev"` → Forge executa → auto-check → próxima missão
- [ ] **8.2** Testar fallback: missão com `who: "user"` → fluxo manual (sem Forge)
- [ ] **8.3** Testar missão com `command` que é slash command (`/audit-project-config`) → invoca skill diretamente
- [ ] **8.4** Testar Forge falha → erro mostrado → retry funciona
- [ ] **8.5** Testar `/quest check {id}` manual → continua funcionando (backward-compatible)
- [ ] **8.6** Testar `checked_by` é gravado corretamente no quest-log
- [ ] **8.7** Testar pack com `forge_workflow` → Forge usa workflow correto

---

## Arquivos tocados (resumo)

| Arquivo | Ação |
|---------|------|
| `skills/quest/engine/forge-bridge.md` | **CRIAR** — módulo novo |
| `skills/quest/engine/guide.md` | **EDITAR** — §3 (card), §7 (flow) |
| `skills/quest/engine/checklist.md` | **EDITAR** — §4 (check source) |
| `skills/quest/SKILL.md` | **EDITAR** — lazy-load + critical rules |
| `skills/quest/packs/app-development.yaml` | **EDITAR** — `forge_mode` opcional |
| `skills/quest/packs/squad-upgrade.yaml` | **EDITAR** — `forge_mode` opcional |
| `skills/quest/packs/design-system-forge.yaml` | **EDITAR** — `forge_workflow` |
| `skills/forge/workflows/design-system.md` | **CRIAR** — novo workflow |
| `skills/forge/workflows/squad-upgrade.md` | **CRIAR** — novo workflow |
| `skills/forge/SKILL.md` | **EDITAR** — novos modos |

## O que NÃO muda

- O sistema de XP, cerimônias e achievements continuam iguais
- O scanner e migration continuam iguais
- `/quest check`, `/quest skip`, `/quest unused` continuam funcionando manualmente
- Workflows existentes do Forge (full-app, single-feature, bug-fix, brownfield) intocados
