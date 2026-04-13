# Ecosystem Audit — AIOS Squads
**Data:** 2026-03-25
**Auditor:** Claude Opus 4.6 (automated deep scan)
**Método:** Análise estrutural + grep de padrões de qualidade (voice_dna, thinking_dna, episodic_memories, veto_conditions, output_example, checkpoints, handoffs)

---

## Resumo Executivo

- **Total de squads:** 63 *(era 65; -pro merged, storytelling arquivado)*
- **GOLD (8.5+):** 5
- **SILVER (7.0–8.4):** 19 *(+2: conteudo e ai-reels subiram para SILVER)*
- **BRONZE (5.0–6.9):** 24 *(seo e marketing-board subiram dentro do BRONZE)*
- **DRAFT (3.0–4.9):** 15 *(ai-reels subiu para SILVER)*
- **SKELETON (0–2.9):** 0 *(storytelling arquivado em 2026-03-26)*
- **Média geral do ecossistema:** ~6.2/10 *(atualizada após DNA enrichment de 3 squads)*
- **Mind clones completos (DNA+Voice+Thinking):** 16 de 45 (35%)

### Top 5 Squads
1. **hormozi** — 9.2/10 (GOLD) — 16 agents com média de 1928 linhas, 9 workflows, 45 checklists, veto_conditions
2. **squad-creator** — 8.8/10 (GOLD) — Meta-squad maduro, 6 agents profundos, heurísticas, test-cases
3. **copywriting-squad** — 8.7/10 (GOLD) — 16 copywriters de elite, voice_dna + thinking_dna em todos, 17 workflows
4. **root-diagnosis** — 8.6/10 (GOLD) — 14 diagnosticians, média 1396 linhas, voice_dna + thinking_dna + output_examples
5. **branding** — 8.5/10 (GOLD) — 7 agents com média 1630 linhas, 10 tasks com veto_conditions

### Bottom 5 Squads *(corrigido 2026-03-26 — re-auditoria manual)*
1. **storytelling** — 0.5/10 (SKELETON) — Vazio, só pasta output/. Conteúdo real está em `storytelling-masters-fosc/`
2. **mind-content-updater** — 3.0/10 (DRAFT) — Utilitário. Agent raso (203 linhas). Sem config.yaml.
3. **relationship-therapy-squad** — 3.0/10 (DRAFT) — 11 terapeutas com voice_dna + thinking_dna. Agents rasos, poucas tasks.
4. **zona-genialidade** — 3.2/10 (DRAFT) — 8 agents sem workflows. Conceito interessante, execução rasa.
5. **file-research** — 3.3/10 (DRAFT) — Single-agent utilitário. Funcional mas mínimo.

---

## Ranking Completo

| # | Squad | Agents | Tasks | WFs | Score | Tier | Observação |
|---|-------|--------|-------|-----|-------|------|------------|
| 1 | hormozi | 16 | 55 | 9 | 9.2 | GOLD | Benchmark do ecossistema. Todos os agents com voice_dna, thinking_dna, output_examples. Veto conditions. |
| 2 | squad-creator | 6 | 47 | 13 | 9.0 | GOLD | Meta-squad v4.0 (merged com -pro). Heurísticas, test-cases, model-routing, scripts Python, minds formais. |
| 3 | copywriting-squad | 16 | 6 | 17 | 8.7 | GOLD | 16 copywriters de elite com DNA completo. 12 templates. Workflows com handoffs. |
| 4 | root-diagnosis | 14 | 16 | 1 | 8.6 | GOLD | 14 minds de diagnóstico com profundidade excepcional. Falta mais workflows. |
| 5 | branding | 7 | 10 | 2 | 8.5 | GOLD | Agents extremamente profundos (1630 avg). Veto conditions em todas as tasks. |
| ~~6~~ | ~~squad-creator-pro~~ | — | — | — | — | ARCHIVED | *(Merged into squad-creator v4.0 em 2026-03-26)* |
| 7 | curator | 12 | 9 | 5 | 8.2 | SILVER | Agents profundos (1186 avg). 7 checklists. Bom handoff entre agents. |
| 8 | design | 9 | 101 | 13 | 8.1 | SILVER | Volume impressionante de tasks. Agents com voice_dna. Protocolos de handoff formais. |
| 9 | kaizen-v2 | 8 | 16 | 6 | 8.0 | SILVER | Evolução sólida. Kill-switch protocol. Minds com heurísticas formais. |
| 10 | content-engine | 20 | 25 | 10 | 7.8 | SILVER | *(atualizado 2026-03-26)* 8 agents de copy de vendas movidos para copywriting-squad (fronteira definida). Foco: conteúdo orgânico + distribuição. |
| 11 | dan-koe | 9 | 59 | 10 | 7.7 | SILVER | 59 tasks é excepcional. 26 checklists. Workflows com checkpoints claros. |
| 12 | kaizen | 7 | 6 | 3 | 7.6 | SILVER | Agents muito profundos (1403 avg). Predecessor do kaizen-v2. |
| 13 | affiliates | 17 | 73 | 12 | 7.5 | SILVER | Volume massivo (73 tasks, 12 WFs). Agents com veto_conditions. Falta profundidade de DNA em alguns. |
| 14 | site-performance-audit | 8 | 9 | 2 | 7.4 | SILVER | 8 experts reais com voice_dna + thinking_dna. Tasks com output_example. |
| 15 | negotiation | 9 | 10 | 2 | 7.3 | SILVER | 9 negociadores de elite. Voice_dna em todos. Falta mais workflows. |
| 16 | icaro-de-carvalho | 6 | 7 | 3 | 7.2 | SILVER | 6 minds reais com episodic_memories. Validado por Oala Nicolas. |
| 17 | presenca-digital | 9 | 13 | 4 | 7.1 | SILVER | 9 experts reais (714 avg). Veto conditions em tasks. |
| 18 | claude-code-mastery | 8 | 26 | 3 | 7.1 | SILVER | Agents com voice_dna. 26 tasks. Falta checklists mais robustos. |
| 19 | business-rules-extraction | 8 | 0 | 3 | 7.0 | SILVER | 8 experts com voice_dna + thinking_dna + episodic. Zero tasks diretas — workflows compensam. |
| 20 | mind-cloning | 1 | 7 | 1 | 7.0 | SILVER | Squad de infraestrutura. 45 minds no repositório. Templates sólidos. 16/45 completos. |
| 21 | conteudo | 10 | 26 | 9 | 7.8 | SILVER | *(atualizado 2026-03-26)* thinking_dna em 10 agents, veto_conditions em 6 tasks, pt-BR corrigido (~850 fixes). 9 workflows com checkpoints. |
| 22 | storytelling-masters-fosc | 12 | 9 | 2 | 6.7 | BRONZE | 12 agents com veto_conditions. Profundidade média (445 avg). |
| 23 | money-makers-vtd | 6 | 7 | 9 | 6.6 | BRONZE | 9 workflows é bom. 11 checklists. Agents rasos (329 avg). |
| 24 | conversao-extrema | 6 | 12 | 2 | 6.5 | BRONZE | Tasks com veto_conditions. Agents com profundidade razoável (580 avg). |
| 25 | insight | 5 | 5 | 2 | 6.4 | BRONZE | Agents com voice_dna + thinking_dna. Poucos tasks e workflows. |
| 26 | playwright-architect | 6 | 1 | 1 | 6.3 | BRONZE | 6 agents com voice_dna + thinking_dna. Apenas 1 task e 1 workflow. |
| 27 | luiz-fosc | 1 | 20 | 2 | 6.3 | BRONZE | Agent profundo (1261 linhas). 20 tasks. Mas é single-agent. |
| 28 | brandcraft | 9 | 43 | 6 | 6.2 | BRONZE | 43 tasks, 6 WFs. Agents rasos (154 avg) — é funcional, não mind-clone. |
| 29 | sop-factory | 6 | 10 | 3 | 6.1 | BRONZE | Workflows com veto_conditions. Agents com profundidade média (278 avg). |
| 30 | dopamine-learning | 10 | 12 | 3 | 6.0 | BRONZE | 10 agents, declarado "Production Ready". Voice_dna em poucos. |
| 31 | icp-cloning | 6 | 50 | 3 | 6.0 | BRONZE | 50 tasks impressionante. Agents com profundidade média (399 avg). Sem voice_dna. |
| 32 | repertoire-mapper | 10 | 12 | 5 | 6.0 | BRONZE | 10 agents (660 avg). Handoffs claros. Falta voice_dna na maioria. |
| 33 | whatsapp-prospector | 5 | 10 | 1 | 5.9 | BRONZE | Agents com voice_dna. Apenas 1 workflow. |
| 34 | etl-universal-converter | 1 | 14 | 4 | 5.8 | BRONZE | Single-agent (1007 linhas). 14 tasks com veto_conditions. Workflow sólido. |
| 35 | legacy-rule-extractor | 4 | 16 | 4 | 5.7 | BRONZE | 16 tasks e 4 WFs. Agents rasos (244 avg). |
| 36 | knowledge-base-builder | 8 | 10 | 4 | 5.6 | BRONZE | Boa estrutura. Agents rasos (278 avg). Sem voice_dna. |
| 37 | high-ticket-sales | 1 | 4 | 0 | 5.5 | BRONZE | Single-agent muito profundo (1160 linhas). Zero workflows. |
| 38 | marketing-board | 12 | 14 | 4 | 6.5 | BRONZE | *(atualizado 2026-03-26)* thinking_dna em 2 agents, veto_conditions em 5 tasks, pt-BR corrigido, 2 agents deprecados, checkpoint adicionado. |
| 39 | advisor-board | 14 | 3 | 1 | 5.3 | BRONZE | 14 advisors mas profundidade média (447 avg). Voice_dna + thinking_dna. Poucas tasks. |
| 40 | navigator | 1 | 12 | 3 | 5.2 | BRONZE | Single-agent. 12 tasks e 3 WFs. Checkpoints. Sem config.yaml. |
| 41 | seo | 8 | 16 | 1 | 6.8 | BRONZE | *(atualizado 2026-03-26)* 13 tasks criadas, 3 agents enriquecidos (+thinking_dna), templates e data adicionados. |
| 42 | gui-avila | 1 | 5 | 1 | 4.8 | DRAFT | Single mind-clone profundo (828 linhas). Mind completo no mind-cloning. Poucas tasks. |
| 43 | magic-bob | 3 | 7 | 4 | 4.7 | DRAFT | 4 workflows com checkpoints. Agents com profundidade média. Sem config.yaml. |
| 44 | tathi-deandhela | 5 | 4 | 2 | 4.6 | DRAFT | Veto conditions nos workflows. Agents muito rasos (76 avg). Mind clone completo. |
| 45 | ai-reels | 7 | 7 | 3 | 7.2 | SILVER | *(atualizado 2026-03-26)* 3 workflows (production, batch, hook-sprint), 7 tasks com veto_conditions, checklist QA 14 itens, config.yaml. |
| 46 | audio-reels | 7 | 6 | 1 | 4.4 | DRAFT | Agents rasos (160 avg). Pipeline documentado no README. |
| 47 | italo-marsili | 1 | 5 | 1 | 4.4 | DRAFT | Single mind-clone (691 linhas). Mind completo. Poucas tasks. |
| 48 | paulo-vieira | 1 | 5 | 1 | 4.3 | DRAFT | Single mind-clone (652 linhas). Voice_dna + thinking_dna. Mind incompleto no repositório. |
| 49 | jose-amorim | 1 | 5 | 1 | 4.2 | DRAFT | Single mind-clone (318 linhas). Profundidade baixa. |
| 50 | leandro-ladeira | 2 | 8 | 2 | 4.2 | DRAFT | 2 agents (845 avg). Voice_dna. Mind sources existem mas DNA incompleto. |
| 51 | media-processor | 1 | 12 | 4 | 4.1 | DRAFT | Single-agent. 12 tasks. Funcional mas sem profundidade de mind-clone. |
| 52 | content-creator | 5 | 3 | 0 | 4.0 | DRAFT | 5 agents rasos (293 avg). Sem workflows. Sem config.yaml. |
| 53 | renner-silva | 1 | 4 | 1 | 3.8 | DRAFT | Single mind-clone (378 linhas). Profundidade baixa. Mind sem DNA no repositório. |
| 54 | high-ticket-mastery | 1 | 2 | 5 | 3.7 | DRAFT | Fusion/orchestrator. Agent raso (358 linhas). Depende de outros squads. |
| 55 | ensinio-mind | 1 | 4 | 0 | 3.5 | DRAFT | Single-agent raso (237 linhas). 20 data files. Zero workflows. |
| 56 | agent-autonomy | 6 | 7 | 2 | 3.5 | DRAFT | 6 agents genéricos (394 avg). Sem voice_dna (exceto poucos). Sem config.yaml. |
| 57 | file-research | 1 | 3 | 1 | 3.3 | DRAFT | Single-agent utilitário. Funcional mas mínimo. |
| 58 | zona-genialidade | 8 | 5 | 0 | 3.2 | DRAFT | 8 agents mas sem workflows. Conceito interessante, execução rasa. |
| 59 | mind-content-updater | 1 | 5 | 1 | 3.0 | DRAFT | Utilitário. Agent raso (203 linhas). Sem config.yaml. |
| 60 | relationship-therapy-squad | 11 | 4 | 3 | 6.8 | BRONZE | *(atualizado 2026-03-26)* config.yaml criado, +2 workflows (quick-consult, crisis-intervention), veto_conditions em 4 tasks, checklist QA, 3 agents enriquecidos, pt-BR corrigido. |
| ~~61~~ | ~~storytelling~~ | — | — | — | — | ARCHIVED | *(Arquivado em 2026-03-26. Estava vazio — conteúdo real está em storytelling-masters-fosc.)* |

**NOTA (2026-03-26 — Re-auditoria manual):** Os squads abaixo foram originalmente classificados como SKELETON mas foram re-auditados com análise profunda dos arquivos reais. Scores corrigidos e reposicionados:

| Squad | Score Original | Score Corrigido | Tier Corrigido | Justificativa |
|-------|---------------|----------------|---------------|---------------|
| viral-squad | 2.8 | **7.8** | SILVER | 30+ agents reais com voice_dna (maioria 600-1173 linhas), 25+ workflows com supervision gates, design system com enforcement, sistema de debate funcional. Remotion-architect tem 1007 linhas com veto conditions. |
| openclaw-manager | 2.5 | **7.5** | SILVER | 3825 linhas totais. 7 tasks detalhadas com comandos SSH reais. 3 workflows com rollback por fase e circuit breaker. Memory extraction inovador. Veto conditions em todos os níveis. Sem README é o único gap sério. |
| palestras-master | 2.8 | **7.2** | SILVER | Router com 17 intents mapeados. Workflow com 4 veto conditions e checkpoints blocking. PLAYBOOK-EXPANSAO.md de nível profissional. Arquitetura federada coerente. Agents rasos por design (federador, não mind-clone). |
| synapse | 1.5 | **6.5** | BRONZE | ~890 linhas de tasks CRUD bem especificadas. Cada task com validações, checklists, tabela de erros. Suggest-domain tem scoring matrix real. Agent único por design (manager.md como router). Templates referenciados não existem. |
| mmos-squad | 2.0 | **6.2** | BRONZE | 10 agents de infraestrutura funcionais. tim-ferriss/ é sub-squad completo (chief com voice_dna+thinking_dna+veto, 4 tasks detalhadas, 2 workflows). hormozi/ tem 2617 linhas de DNA rico. tasks/ e checklists/ da raiz vazios impedem score maior. |

---

## Análise por Squad

### GOLD (8.5+) — 6 squads

#### 1. hormozi — 9.2/10
**O benchmark do ecossistema.** 16 agents especializados com profundidade média de 1928 linhas — o maior do sistema. Cada agent tem voice_dna, thinking_dna, output_examples e signature_phrases extraídas dos livros e conteúdos do Hormozi. 9 workflows com checkpoints e handoffs. 45 checklists. Veto conditions formais.
- **Forças:** Profundidade de DNA incomparável. Cobertura completa (offers, ads, copy, scale, retention, etc.). Validado e documentado.
- **Gaps:** Poderia ter episodic_memories mais ricos. Mind clone no repositório central está fragmentado (15 specialist DNAs sem unified mind_dna_complete).
- **Recomendação:** Consolidar um mind_dna_complete.yaml unificado no repositório central.

#### 2. squad-creator — 9.0/10 *(atualizado 2026-03-26 após merge com -pro)*
**O meta-squad que cria outros squads.** v4.0 após merge com squad-creator-pro. 6 agents com profundidade de 1039 linhas média. Heurísticas formais (AN_KE_001-009, PV_BS/PA/PM_001). Test-cases com baselines de opus vs haiku. Model-routing. Scripts Python de validação. Minds formais com artefatos.
- **Forças:** Pipeline de criação maduro. Quality gates formais. Documentação exemplar. Agora com scripts de validação automatizada e minds/heurísticas formais do ex-pro.
- **Gaps:** Nenhum gap crítico após merge.
- **Recomendação:** Considerar remoção do snapshot em `_archived/` após validação completa.

#### 3. copywriting-squad — 8.7/10
**Todos os 16 agents são clones de copywriters reais** — Gary Halbert, Eugene Schwartz, Dan Kennedy, Stefan Georgi, etc. Cada um com voice_dna, thinking_dna e output_examples. 17 workflows cobrindo todo tipo de copy (VSL, email sequence, landing page, etc.). 12 templates.
- **Forças:** Diversidade de vozes. Templates acionáveis. Validation report documentado.
- **Gaps:** Tasks poderiam ter veto_conditions mais explícitas.
- **Recomendação:** Adicionar veto_conditions nas 6 tasks. Criar workflow de A/B testing entre copywriters.

#### 4. root-diagnosis — 8.6/10
**14 diagnosticians de sistemas complexos** — Eli Goldratt, Peter Senge, Dave Snowden, Stafford Beer, etc. Média de 1396 linhas por agent. Todos com voice_dna, thinking_dna e output_examples. O root-diagnosis-chief tem 1938 linhas.
- **Forças:** Profundidade intelectual excepcional. Diversidade metodológica (TOC, Cynefin, VSM, Kepner-Tregoe).
- **Gaps:** Apenas 1 workflow. Poderia ter mais tasks estruturadas e checkpoints.
- **Recomendação:** Criar pelo menos 3 workflows (quick-diagnosis, deep-analysis, cross-expert-review).

#### 5. branding — 8.5/10
**7 agents com a maior profundidade média** para o tamanho — 1630 linhas. April Dunford (positioning), Marty Neumeier (brand strategy), Sagi Haviv (visual identity). 10 tasks todas com veto_conditions e output_examples. 7 checklists. 5 templates.
- **Forças:** Qualidade sobre quantidade. Cada agent é cirurgicamente profundo.
- **Gaps:** Apenas 2 workflows. Poderia ter mais integração entre agents.
- **Recomendação:** Criar workflow de "brand audit completo" que orquestre todos os agents.

#### ~~6. squad-creator-pro~~ — ARCHIVED
*(Merged into squad-creator v4.0 em 2026-03-26. Assets únicos absorvidos: scripts Python, minds/heurísticas, checklists, templates, wf-etl-to-mind-clone. Backup em `squads/_archived/squad-creator-pro/`.)*

---

### SILVER (7.0–8.4) — 14 squads

#### 7. curator — 8.2/10
12 agents de curadoria de conteúdo (MrBeast, Ken Burns, Walter Murch, Robert McKee). Média de 1186 linhas. Voice_dna + thinking_dna em todos. 5 workflows com checkpoints. CHANGELOG documentado.
- **Gaps:** Falta config.yaml formal (existe mas sem veto_conditions).

#### 8. design — 8.1/10
Impressionante volume: 101 tasks, 13 workflows, 19 checklists. 9 agents incluindo Brad Frost, Dave Malouf, Dan Mall. Protocolos formais de handoff e governance. Design system completo.
- **Gaps:** Alguns agents mais rasos que outros. Storybook-expert é funcional, não mind-clone.

#### 9. kaizen-v2 — 8.0/10
Squad de melhoria contínua com kill-switch protocol, minds com heurísticas formais (Chris Argyris, Lance Martin, Hermann Ebbinghaus). 16 tasks incluindo auto-healing-gate. Daily intelligence reports.
- **Gaps:** Sem config.yaml na raiz (tem em config/). Memory-keeper agent poderia ser mais profundo.

#### 10. content-engine — 7.8/10
20 agents focados em conteúdo orgânico e distribuição (era 28 — 8 agents de copy de vendas movidos para copywriting-squad em 2026-03-26). 25 tasks, 10 workflows.
- **Gaps:** ~~Sobreposição significativa com copywriting-squad~~ *(resolvido 2026-03-26)*. Nem todos os agents têm voice_dna.

#### 11. dan-koe — 7.7/10
59 tasks é o segundo maior volume. 26 checklists. 9 agents especializados em diferentes aspectos do método Koe (mindset, brand, offers, distribution). Mind clone documentado.
- **Gaps:** Agents com profundidade média (516 avg). Poderia ter DNA mais profundo.

#### 12–20. (Demais SILVER)
Kaizen (7.6), affiliates (7.5), site-performance-audit (7.4), negotiation (7.3), icaro-de-carvalho (7.2), presenca-digital (7.1), claude-code-mastery (7.1), business-rules-extraction (7.0), mind-cloning (7.0) — todos funcionais com qualidade acima da média mas com gaps específicos documentados na tabela.

---

### BRONZE (5.0–6.9) — 22 squads

Squads funcionais mas com trabalho significativo necessário. Padrões comuns:
- Agents com profundidade entre 200–600 linhas (insuficiente para fidelidade alta)
- Tasks sem veto_conditions
- Workflows sem checkpoints formais
- Falta de voice_dna ou thinking_dna em vários agents

Destaques positivos no BRONZE:
- ~~**conteudo (6.8):**~~ *(Promovido para SILVER 7.8 após DNA enrichment em 2026-03-26)*
- **luiz-fosc (6.3):** Agent muito profundo mas é single-agent
- **etl-universal-converter (5.8):** 14 tasks com veto_conditions, funcional como utilitário

---

### DRAFT (3.0–4.9) — 16 squads

Squads com estrutura básica mas que precisam de investimento para serem usáveis. Padrões comuns:
- Single-agent squads sem orquestração
- Mind clones sem DNA completo no repositório central
- Poucos workflows (0-2)
- Sem config.yaml em vários

~~Destaque: **relationship-therapy-squad (3.0)**~~ *(atualizado para 6.8 BRONZE em 2026-03-26 — config.yaml + 2 workflows + veto_conditions + checklist + agents enriquecidos)*

---

### SKELETON (0–2.9) — 0 squads *(corrigido 2026-03-26)*

- ~~**storytelling:**~~ Arquivado em 2026-03-26. Estava vazio (só pasta output/). Conteúdo real está em `storytelling-masters-fosc/` (BRONZE 6.7).

**Re-classificados após re-auditoria:**
- **viral-squad:** 2.8 → **7.8 SILVER** (30+ agents reais, 25+ workflows)
- **openclaw-manager:** 2.5 → **7.5 SILVER** (3825 linhas, workflows com rollback)
- **palestras-master:** 2.8 → **7.2 SILVER** (federador maduro, 17 intents)
- **synapse:** 1.5 → **6.5 BRONZE** (CRUD completo, tasks bem especificadas)
- **mmos-squad:** 2.0 → **6.2 BRONZE** (tim-ferriss completo, hormozi DNA rico)

---

## Oportunidades de Melhoria (Top 10)

### 1. ~~Consolidar squad-creator e squad-creator-pro~~ ✅ FEITO (2026-03-26)
**Status:** Concluído. squad-creator absorveu assets únicos do -pro (scripts, minds, checklists, templates). -pro movido para `_archived/`. Squad unificado como v4.0.

### 2. Upgrade de DNA nos 22 squads BRONZE
**Impacto: ALTO** — A maioria dos squads BRONZE tem a estrutura certa mas agents rasos. Um passe de "DNA enrichment" usando o pipeline do mind-cloning elevaria vários para SILVER.

### 3. Completar os 29 mind clones incompletos
**Impacto: ALTO** — 29 de 45 minds no repositório não têm mind_dna_complete.yaml. Muitos têm sources mas falta a extração. Pipeline do mind-cloning já existe — só precisa executar.

### 4. Adicionar veto_conditions em tasks dos squads SILVER
**Impacto: MÉDIO** — Muitos squads SILVER têm tasks sem veto_conditions. Adicionar isso melhora a previsibilidade e qualidade dos outputs.

### 5. Criar workflows para squads com zero
**Impacto: MÉDIO** — ai-reels (0 WFs), zona-genialidade (0), high-ticket-sales (0), seo (1), root-diagnosis (1). Esses squads têm agents bons mas sem pipeline de execução.

### 6. Arquivar o 1 SKELETON squad restante *(corrigido 2026-03-26)*
**Impacto: BAIXO** — Apenas `storytelling/` é realmente vazio (conteúdo real está em `storytelling-masters-fosc/`). Os outros 5 ex-SKELETONs foram re-auditados e reclassificados como SILVER (3) e BRONZE (2).

### ~~7. Resolver sobreposição content-engine vs copywriting-squad~~ ✅ FEITO (2026-03-26)
**Status:** Concluído. 8 agents de copy de vendas movidos do content-engine para `_archived/duplicate-agents/`. Fronteira definida: copywriting-squad = copy de vendas (sales, VSL, email, ads), content-engine = conteúdo orgânico + distribuição. Cross-reference adicionado no config.yaml.

### 8. Upgrade do relationship-therapy-squad
**Impacto: MÉDIO** — 11 terapeutas reais é raro e valioso. Precisa de: agents mais profundos (de 309 para 800+ linhas), config.yaml, 3+ workflows, tasks estruturadas.

### 9. Padronizar config.yaml em todos os squads
**Impacto: BAIXO-MÉDIO** — 12 squads não têm config.yaml. Criar um template mínimo e aplicar em batch.

### 10. Criar dashboard de qualidade automatizado
**Impacto: BAIXO-MÉDIO** — Automatizar esta auditoria com um script que roda semanalmente. Métricas: avg agent lines, % com voice_dna, % tasks com veto_conditions, contagem de workflows.

---

## Padrões Observados

### O que funciona bem
1. **Mind clones de pessoas reais > agents genéricos.** Os squads GOLD (hormozi, copywriting, root-diagnosis, branding) têm agents baseados em pessoas reais com frameworks documentados. Os SKELETON têm agents genéricos ("quality-validator", "data-importer").

2. **Profundidade > Quantidade.** Branding com 7 agents de 1630 linhas (GOLD) supera marketing-board com 12 agents de 211 linhas (BRONZE).

3. **Veto conditions transformam qualidade.** Squads com veto_conditions nas tasks produzem outputs mais consistentes e evitam erros comuns.

4. **Voice_dna + thinking_dna é o mínimo para fidelidade.** Agents sem esses dois componentes soam genéricos independente do nome.

### Anti-patterns recorrentes
1. **Squad sem workflow = coleção de agents solta.** 8 squads têm zero ou um workflow. Sem pipeline de execução, os agents não se conectam.

2. **Duplicação entre squads.** ~~content-engine e copywriting-squad compartilham agents~~ *(resolvido 2026-03-26: fronteira definida, duplicados arquivados)*. content-creator ainda tem sobreposição menor. ~~squad-creator e squad-creator-pro são quase idênticos~~ *(resolvido 2026-03-26)*.

3. **"Production Ready" autodeclarado sem evidência.** Alguns squads se declaram prontos mas têm agents de 200 linhas sem voice_dna.

4. **Single-agent squads.** 12 squads têm apenas 1 agent. Isso é um mind-clone, não um squad. Considerar reclassificar como minds no repositório central.

5. **Federadores sem profundidade.** high-ticket-mastery depende de outros squads mas não adiciona valor orquestratório real. *(Nota: palestras-master foi re-auditado em 2026-03-26 e reclassificado como SILVER 7.2 — tem router com 17 intents e workflow com veto conditions.)*

6. **README sem acentuação.** Vários READMEs violam o Artigo VII (pt-BR quality). content-creator, audio-reels, zona-genialidade precisam de correção ortográfica.

---

## Distribuição por Categoria

```
GOLD     ██████ 6 (9%)
SILVER   █████████████████ 17 (26%)  ← corrigido (+3)
BRONZE   ████████████████████████ 24 (37%)  ← corrigido (+2)
DRAFT    ████████████████ 16 (25%)
SKELETON █ 1 (2%)  ← corrigido (-6)
```

**Conclusão:** O ecossistema tem um núcleo sólido (23 squads GOLD+SILVER = 35%) e uma cauda longa de squads incompletos. Após re-auditoria (2026-03-26), apenas 1 squad é realmente SKELETON. O caminho de maior ROI é: (1) consolidar duplicatas (squad-creator × squad-creator-pro, content-engine × copywriting-squad), (2) fazer upgrade de DNA nos BRONZE com maior potencial, (3) completar mind clones pendentes.

---

*Auditoria gerada automaticamente por Claude Opus 4.6 em 2026-03-25.*
