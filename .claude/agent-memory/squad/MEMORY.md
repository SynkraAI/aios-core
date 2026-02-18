# Squad Architect Memory

## Quick Stats
- Total squads criados: 1
- Ultimo squad: mind-content-updater (2026-02-10)
- Quality score medio: N/A
- Minds clonados: 0

---

## Squads Criados
<!-- Formato: [DATA] nome - dominio (X agents, score Y/10) -->
- [2026-02-10] mind-content-updater - source discovery & collection for MMOS (1 agent, 5 tasks, 15 files)

---

## Minds Já Clonados (Cache)
<!-- Evita re-clonar minds que já existem -->
<!-- Formato: mind-slug: caminho/do/arquivo.md -->

---

## Patterns que Funcionam
<!-- Descobertas validadas em produção -->

### Voice DNA
- Mínimo 15 patterns para fidelidade 85%+
- Patterns de abertura são os mais distintivos

### Fontes
- Tier 0 (usuário) > Tier 1 (livros) > Tier 2 (web)
- Mínimo 10 fontes para mind robusto

### Quality Gates
- SC_AGT_001: Structure (300+ lines)
- SC_AGT_002: Content (all levels present)
- SC_AGT_003: Depth (frameworks with theory)

---

## Decisões Arquiteturais
<!-- ADRs tomadas durante criação de squads -->

---

## Erros Comuns a Evitar
- ❌ Criar agent sem extract-thinking-dna primeiro
- ❌ Pular validação de fidelidade
- ❌ Usar < 5 fontes para um mind
- ❌ Não verificar squad duplicado antes de criar

---

## Workflows Executados
<!-- Log de workflows para debug -->
<!-- Formato: [DATA] workflow-name: status (duração) -->

---

## Notas Recentes
<!-- Ultimas descobertas e observacoes -->
- [2026-02-10] prompt-architect agent criado - single agent (NAO squad) para system prompt engineering
  - Agent: .aios-core/development/agents/prompt-architect.md (342 lines)
  - Persona: Silo (Craftsperson), tone: analytical, emoji: minimal
  - 4 modes: *convert (GPT->Claude), *create, *audit (10 dims + AP scan), *iterate
  - 4 tasks em tasks/prompt-architect/ (convert, create, audit, iterate)
  - 2 checklists em checklists/prompt-architect/ (quality 12-item, conversion 12-item)
  - Memory: .claude/agent-memory/prompt-architect/MEMORY.md
  - Referencia: docs/architecture/master-prompt-best-practices.md (663 lines, 9 sections)
  - Referencia: .claude/commands/AIOS/skills/system-prompt-architect/references/gpt-to-claude-patterns.md (9 patterns)
  - SKILL.md existente NAO foi modificado (continua como slash command)
  - Total: 7 files criados, 1325 lines
- [2026-02-10] mind-content-updater squad criado - companion do mmos-squad para automatizar coleta de fontes
  - Estrutura: agents/mind-content-updater.md, 5 tasks, 3 templates, 1 workflow, 2 configs
  - Integra com: Exa MCP, WebSearch, WebFetch, video-transcriber tool
  - Output vai para squads/mmos-squad/minds/{mind}/sources/
  - Formato MMOS-compativel (frontmatter, semantic slugs, tier classification)
- [2026-02-05] Agent Memory implementado - Epic AAA
