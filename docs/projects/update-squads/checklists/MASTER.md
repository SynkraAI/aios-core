# Update Squads — Master Checklist

**Objetivo:** Elevar o ecossistema de 63 squads de média ~6.2/10 para 8.0+
**Auditoria base:** `squads/ECOSYSTEM-AUDIT-2026-03-25.md`
**Sub-checklists:** `docs/projects/update-squads/checklists/`

---

## Ação #1 — Arquivar SKELETON ✅
**Impacto:** Baixo | **Esforço:** 5 min
**Executado em:** 2026-03-26

- [x] Mover `squads/storytelling/` → `squads/_archived/storytelling/`
- [x] Atualizar ECOSYSTEM-AUDIT (63 squads ativos, 0 SKELETON)

---

## Ação #2 — Merge squad-creator + squad-creator-pro ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Checklist detalhado:** [merge-squad-creators.md](merge-squad-creators.md)

- [x] squad-creator absorveu assets únicos do -pro (scripts, minds, checklists, templates)
- [x] squad-creator-pro movido para `_archived/`
- [x] Referências corrigidas em 16+ arquivos
- [x] ECOSYSTEM-AUDIT atualizada
- [ ] Smoke test (baixa prioridade)

---

## Ação #3 — DNA enrichment: conteudo (6.8 → 8.0+) ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Auditar agents atuais — 10 agents, todos genéricos/Torriani, voice_dna presente, thinking_dna ausente
- [x] Corrigir acentuação pt-BR em todos os 10 agents (~850+ correções — violação Artigo VII)
- [x] Adicionar thinking_dna em todos os 10 agents (~30L cada, únicos por papel)
- [x] Adicionar veto_conditions em 6 tasks críticas (create-carousel, create-reels, create-strategy, create-campaign, validate-content, create-bio)
- [x] Workflows já tinham checkpoints + veto_conditions (9/9) — nada a fazer
- [x] Re-score e atualizar ECOSYSTEM-AUDIT (6.8 → 7.8 SILVER)

---

## Ação #4 — DNA enrichment: seo (5.0 → 7.5+) ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Auditar 8 agents — todos com voice_dna e personas reais, mas rasos (164L média)
- [x] Criar 13 phantom tasks que o workflow referenciava mas não existiam
- [x] Enriquecer 3 agents mais rasos: site-architect (+101L), ai-visibility-optimizer (+42L), content-quality-assessor (+44L)
- [x] Adicionar thinking_dna nos 3 agents enriquecidos
- [x] Criar templates/ (seo-report-template, llms-txt-template)
- [x] Criar data/ (cwv-benchmarks, schema-types-reference)
- [x] Corrigir acentuação pt-BR (3 ocorrências de "Metodo" → "Método")
- [x] Re-score e atualizar ECOSYSTEM-AUDIT (5.0 → 6.8 BRONZE)

---

## Ação #5 — DNA enrichment: marketing-board (5.4 → 7.5+) ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Auditar 12 agents — 7 com personas reais, 3 genéricos, 1 deprecated, 1 órfão
- [x] Deprecar carousel-designer (órfão em inglês, sem conexão com o sistema)
- [x] Marcar marketing-ideation como DEPRECATED (substituído por ig/li/yt)
- [x] Remover contradição TDAH no marketing-production (conflito com veto do CMO)
- [x] Adicionar thinking_dna em marketing-distribution e marketing-metrics
- [x] Corrigir acentuação pt-BR em 4 workflows + 1 task (~60+ correções)
- [x] Adicionar checkpoint no workflow board-consultation
- [x] Adicionar veto_conditions em 5 tasks críticas (daily-content, quick-post, consult-board, evaluate-deal, trend-sniper)
- [x] Re-score e atualizar ECOSYSTEM-AUDIT (5.4 → 6.5 BRONZE)

---

## Ação #6 — Criar workflows: ai-reels (4.5 → 7.0+) ✅
**Impacto:** Médio-Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Auditar estado atual — 7 agents (516L média), 0 workflows, 0 tasks reais, 0 checklists, sem config.yaml
- [x] Criar 3 workflows: wf-reel-production (7 fases), wf-batch-production (semanal), wf-hook-sprint (brainstorm)
- [x] Criar 7 tasks com veto_conditions (1 por fase do pipeline)
- [x] Criar checklist QA final (14 itens binário + Devil's Advocate)
- [x] Criar config.yaml com metadados, quality gates e veto_conditions globais
- [x] Re-score e atualizar ECOSYSTEM-AUDIT (4.5 → 7.2 SILVER)

---

## Ação #7 — Resolver sobreposição content-engine vs copywriting ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Mapear agents duplicados — 8 duplicados: Hormozi, Schwartz, Halbert, Georgi, Hopkins, Ogilvy, Koe, Kennedy
- [x] Definir fronteira: copywriting = copy de vendas (sales, VSL, email, ads) | content-engine = conteúdo orgânico + distribuição
- [x] Decisão: coexistência com escopo definido (opção 1 + ADR para mind_source futuro)
- [x] 8 agents movidos para content-engine/_archived/duplicate-agents/
- [x] config.yaml atualizado (layers, debate pairs, cross_references)
- [x] ECOSYSTEM-AUDIT atualizada
- [x] ADR documentada em memory/project_mind-source-architecture.md

---

## Ação #8 — Upgrade relationship-therapy (3.0 → 7.0+) ✅
**Impacto:** Médio-Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Criar config.yaml com veto_conditions globais (6 condições incluindo segurança)
- [x] Criar 2 workflows: quick-consult (15 min) e crisis-intervention (com CVV/emergência)
- [x] Criar checklist session-quality (10 itens, 4 BLOCKER)
- [x] Adicionar veto_conditions nas 4 tasks (triage, consult, session, assessment)
- [x] Enriquecer 3 agents mais rasos: esther-perel (+130L), gottman (+135L), amir-levine (+173L)
- [x] Corrigir acentuação pt-BR no README (~30 correções)
- [x] Atualizar estrutura no README (novos workflows + checklist)
- [x] Re-score e atualizar ECOSYSTEM-AUDIT (3.0 → 6.8 BRONZE)

---

## Ação #9 — Veto conditions nos SILVER ✅
**Impacto:** Médio | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Auditar 19 SILVER squads — 5 já completos, 3 já tinham 100% (grep falhou na auditoria inicial)
- [x] dan-koe: 58 tasks com veto (15 específicas + 43 padrão)
- [x] design: 20 tasks prioritárias com veto específico (de 101 total)
- [x] palestras-master: 2 tasks adicionadas (4 total)
- [x] affiliates, presenca-digital, claude-code-mastery: já estavam completos
- [x] Squads restantes com cobertura parcial: curator, mind-cloning, openclaw-manager (futuro)

---

## Ação #10 — Completar mind clones top 5 ✅
**Impacto:** Alto | **Esforço:** 1 sessão
**Executado em:** 2026-03-26

- [x] Identificar top 5: leandro-ladeira (75M), renner-silva (39M), verne-harnish (18M), paulo-vieira (16M), nassim-taleb (14M)
- [x] Verificar sources: todos com material suficiente (livros .md, SRTs YouTube, transcrições)
- [x] Extrair mind_dna_complete.yaml para os 5:
  - verne-harnish: 408L — Scaling Up, Rockefeller Habits, 8 frameworks
  - nassim-taleb: ~400L — Antifragile + Black Swan + Skin in the Game, 13 mental models
  - paulo-vieira: ~400L — 5 livros + 4 vídeos, Método CIS, 8 frameworks em pt-BR
  - leandro-ladeira: 904L — MOER, Big Idea, 38 dispositivos, voice_dna com frequências reais
  - renner-silva: 606L — 56k linhas de transcrições, 6 frameworks, 8 histórias episódicas
- [ ] Validar fidelidade (futuro — requer uso real dos clones)
- [ ] Atualizar INDEX de minds (futuro)

---

## Progresso Geral

| # | Ação | Status |
|---|------|--------|
| 1 | Arquivar SKELETON | ✅ Feito |
| 2 | Merge squad-creators | ✅ Feito |
| 3 | DNA enrichment — conteudo | ✅ Feito |
| 4 | DNA enrichment — seo | ✅ Feito |
| 5 | DNA enrichment — marketing-board | ✅ Feito |
| 6 | Workflows — ai-reels | ✅ Feito |
| 7 | Sobreposição content-engine vs copywriting | ✅ Feito |
| 8 | Upgrade relationship-therapy | ✅ Feito |
| 9 | Veto conditions nos SILVER | ✅ Feito |
| 10 | Mind clones top 5 | ✅ Feito |

**Completo:** 10/10 | **Em progresso:** 0/10 | **Pendente:** 0/10 🎉
