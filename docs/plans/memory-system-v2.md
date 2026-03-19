# Memory System v2.0 — Plano de Implementação

**Criado:** 2026-03-18
**Objetivo:** Fazer o AIOS "lembrar" — projetos têm memória, agentes são stateless workers que leem antes de agir.
**Análise base:** `docs/analysis/memory-system-deep-dive-2026-03-18.md`

---

## Princípio Central

Memória vive no **PROJETO**, não nos agentes. Agentes são como consultores freelancers: não lembram de clientes anteriores, mas cada cliente (projeto) tem suas próprias anotações que o consultor lê antes de começar.

---

## Phase 1: Foundation ✅ DONE (2026-03-18)

Estrutura de arquivos + tooling de auditoria.

- [x] Templates: `project-context.md`, `agents-used.md`, `squads-config.md`, `feedback/{topic}.md`
- [x] `tools/audit-project-memory.js` — audita score 0-10 de todos os projetos
- [x] `tools/bootstrap-project-memory.js` — gera `memory/` automático a partir de INDEX.md
- [x] Piloto whatsapp-prospector (10/10 com contexto real + feedback)
- [x] Batch em 18 projetos (score 4.3 → 9.4)
- [x] Fix ACTIVE.md — rows 19-20 movidas para tabela principal
- [x] Criar `.aios-core/data/memory/user/luiz-fosc-profile.md` (perfil global)
- [x] Atualizar `/new-project` para criar `memory/` automaticamente (Passo 2.6 + árvores atualizadas)

**Entregáveis:** Estrutura existe em todos os projetos. Próximo passo é fazer alguém LER.

---

## Phase 2: Read Protocol ✅ DONE (2026-03-18)

Agentes leem memória antes de agir. É a diferença entre "memória existe" e "memória funciona".

- [x] Criar `.claude/rules/memory-protocol.md` (rule global para todos os agentes)
- [x] Adicionar "Project Memory" como item #2 no Context Loading de TODOS os 10 agentes AIOS:
  - `@dev`, `@sm`, `@po`, `@architect`, `@qa`, `@pm`, `@devops`, `@analyst`, `@data-engineer`, `@ux`
- [x] Protocol: ler `memory/project-context.md` + `memory/feedback/` + `user-profile.md`
- [ ] Testar com @dev: ele deve saber a stack, decisões, e regras do projeto sem perguntar
- [ ] Validar que leitura acontece ANTES de criar plano de implementação

**Critério de sucesso:** Abrir um projeto com @dev e ele já saber as regras de ouro sem eu explicar.

---

## Phase 3: Write Protocol ✅ DONE (2026-03-18)

Auto-save de feedback durante conversas. Quando o usuário corrige, o sistema grava.

- [x] Write Protocol adicionado em `.claude/rules/memory-protocol.md` (seção completa com sinais, formato, regras)
- [x] Feedback Write Protocol como seção #6 no spawn file do `@dev`
- [x] Formato: frontmatter YAML + O Que Disse + Correção + Regra
- [x] Regra: gravar DURANTE conversa, não no final. Avisar usuário silenciosamente.
- [x] Decisões permanentes → atualizar `project-context.md` além do feedback
- [ ] Testar: corrigir algo → verificar que feedback foi gravado → próxima sessão respeita

**Critério de sucesso:** Corrigir um agente 1x → nunca mais repetir o mesmo erro nesse projeto.

---

## Phase 4: Checkpoints em Workflows

"Pause and listen" entre steps do Story Development Cycle.

- [ ] Após @sm criar story draft → pausar e mostrar ao usuário antes de @po validar
- [ ] Após @dev completar AC → pausar para review antes de marcar done
- [ ] Checkpoints não bloqueiam (timeout → continua), mas dão chance de corrigir rumo

**Critério de sucesso:** Num epic com 5 stories, eu consigo corrigir rumo no meio sem esperar o fim.

---

## Phase 5: Cross-Session Auto-Load

Memórias carregam automaticamente ao abrir projeto, sem precisar de `/resume`.

- [ ] Hook SessionStart: detectar cwd → identificar projeto → carregar memórias relevantes
- [ ] Carregar: `project-context.md` (sempre) + `feedback/` recentes (últimos 7 dias) + `user-profile.md` (global)
- [ ] Validar que `/resume` continua funcionando (não conflitar)
- [ ] Testar: abrir projeto direto (`cd ~/CODE/Projects/zeroaudio && claude`) → contexto já carregado

**Critério de sucesso:** Abrir qualquer projeto e o Claude já saber quem eu sou, o que é o projeto, e o que evitar.

---

## Ordem de Prioridade

| Phase | Impacto | Esforço | Prioridade |
|-------|---------|---------|------------|
| 1 Foundation | Médio (estrutura) | ✅ Done | — |
| 2 Read Protocol | **Alto** (agentes param de ser amnésicos) | Baixo (~2h) | **PRÓXIMO** |
| 3 Write Protocol | Alto (auto-aprendizado) | Médio (~4h) | Depois |
| 4 Checkpoints | Médio (controle mid-flow) | Médio (~4h) | Depois |
| 5 Auto-Load | Alto (zero fricção) | Baixo (~2h) | Depois |

**Phase 2 é o ponto de inflexão.** Sem ela, memória é só arquivo no disco. Com ela, agentes começam a parecer inteligentes.

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Conflito com gotchas-memory.js | Sistemas separados: gotchas = erros técnicos, feedback = preferências |
| Memory bloat (arquivos demais) | Cleanup de feedback >30 dias, limitar gotchas resolved |
| Agents ignoram Memory Protocol | Constitution Artigo VII + quality gate |
| Breaking `/new-project` | Apenas adicionar, nunca modificar existente |
| Context window overflow | Carregar só últimos 7 dias de feedback, resumir project-context |
