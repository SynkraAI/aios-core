# Relatório Estratégico LinkedIn — Lucas Lorenzo Savino

**Agente:** @analyst (Alex)
**Data:** 2026-03-01
**Base:** Análise de 10 arquivos internos + pesquisa de mercado março/2026

---

## 1. O QUE A API DO LINKEDIN REALMENTE PODE FAZER (E O QUE NÃO PODE)

Antes de qualquer estratégia, precisamos ser honestos sobre os limites. O MCP LinkedIn que temos acesso via OAuth oferece um subconjunto específico da API:

### O que FUNCIONA

| Capacidade | Ferramenta MCP | Uso Estratégico |
|-----------|----------------|-----------------|
| Publicar post de texto | `linkedin_create_post` | Publicar conteúdo diretamente do terminal |
| Publicar post com imagem | `linkedin_create_image_post` | Posts com diagramas de arquitetura, screenshots |
| Editar post existente | `linkedin_update_post` | Corrigir typos, adicionar links depois |
| Deletar post | `linkedin_delete_post` | Remover conteúdo que não performou |
| Criar comentário | `linkedin_create_comment` | Engajamento ativo em posts alheios |
| Ler comentários de post | `linkedin_get_post_comments` | Monitorar respostas nos nossos posts |
| Buscar pessoas | `linkedin_search_people` | Encontrar decisores, CTOs, founders |
| Buscar empresas | `linkedin_search_companies` | Mapear empresas-alvo para freelance |
| Buscar vagas | `linkedin_search_jobs` | Monitorar demanda de mercado |
| Ver perfil próprio | `linkedin_get_my_profile` | Validar dados do perfil |
| Ver perfil de membro | `linkedin_get_member_profile` | Pesquisar leads antes de engajar |

### O que NÃO funciona (restrições da API)

| Capacidade | Status | Impacto |
|-----------|--------|---------|
| Ler feed/timeline | BLOQUEADO | Não conseguimos ver posts de outros para analisar |
| Ler posts próprios | BLOQUEADO (`r_member_social`) | Não temos analytics de engajamento |
| Ler mensagens/DMs | BLOQUEADO | Sem automação de inbox |
| Analytics/métricas | BLOQUEADO | Sem dados de views, likes, shares |
| Lista de conexões | BLOQUEADO | Não sabemos quem conectou |

### Implicação prática

O nosso setup é uma **máquina de publicação e engajamento ativo**, não uma máquina de analytics. Podemos publicar, comentar e pesquisar — mas não podemos medir resultados automaticamente. O Lucas vai precisar checar analytics manualmente no app do LinkedIn (ou browser) e trazer esses dados de volta pro AIOS para informar ajustes.

---

## 2. ESTRATÉGIA DE CONTEÚDO COM AS FERRAMENTAS QUE TEMOS

### 2.1 Pilares de Conteúdo (baseados no material existente)

O Lucas já tem 5 pilares narrativos claros, extraídos de `storytelling_context.md` e `.claude/skills/linkedin/SKILL.md`. Organizei por potencial de engajamento no contexto do algoritmo de março/2026:

| Pilar | Descrição | Formato Ideal | Frequência |
|-------|-----------|---------------|------------|
| **A Jornada do Builder** | Stories reais do AIOS, OpenClaw, Forjai | Storytelling longo (1500-2000 chars) | 1x/semana |
| **Context Engineering** | Técnicas de compressão, memory, handoff | Tutorial/insight técnico | 1x/semana |
| **O Novo Paradigma** | Orquestrador > Coder, futuro do trabalho | Opinião provocativa | 1x a cada 2 semanas |
| **Produção vs Demo** | O que quebra em escala, lições de produção | Case study + números | 1x a cada 2 semanas |
| **22 Anos Construindo** | Jovem engenheiro, Petrobras, trajetória | Narrativa pessoal | 1x/mês |

### 2.2 O que o algoritmo de 2026 recompensa

Dados da pesquisa de mercado revelam mudanças significativas no algoritmo:

- **Dwell Time é a moeda principal.** Posts que mantêm o leitor por 2+ minutos valem mais que 5 posts curtos. Os posts longos do Lucas (trilogia) estão perfeitamente alinhados com isso.
- **Document posts (PDF carousel) têm 6.60% de engagement** — o mais alto de qualquer formato no LinkedIn em 2026. Oportunidade enorme para diagramas de arquitetura do AIOS.
- **Expert interactions têm 7-9x mais peso algorítmico** que reações genéricas. Comentar substantivamente em posts de outros é MAIS valioso que publicar.
- **Engagement bait está morto.** O update de "autenticidade" enterra posts com "comente SIM se concorda". O tom do Lucas (genuíno, sem guru) é exatamente o que funciona.
- **Vídeos abaixo de 90 segundos** performam muito bem. Terminal recordings mostrando agentes em ação seriam perfeitos.

### 2.3 Estrutura de post otimizada para o perfil do Lucas

Baseada na Voice DNA definida em `.claude/skills/linkedin/SKILL.md` combinada com dados de pesquisa:

```
LINHA 1: Hook (padrão interrupt — contrarian, número específico, ou vulnerabilidade)
LINHA 2-3: Contexto (por que isso importa)
LINHAS 4-15: Meat (a substância — técnica, história, insight)
LINHA 16-17: Proof (números reais: "90% redução", "379 tokens", "33% economia")
LINHA 18-19: Takeaway (uma lição clara)
LINHA 20: CTA (pergunta genuína, nunca pushy)

---

3-5 hashtags no final
```

**Hooks que já provaram funcionar para o perfil do Lucas (extraídos dos drafts existentes):**
- Contrarian: "Opinião impopular: saber codar está virando commodity."
- Número específico: "Gastei mais tokens debugando compressão de contexto do que a maioria gasta em projetos inteiros."
- Vulnerabilidade: "Há 3 semanas eu não sabia o que era o OpenClaw."
- Self-aware: "Não sou o melhor programador. Mas construí um AI Operating System."

---

## 3. USO ESTRATÉGICO DAS CAPACIDADES DE BUSCA

As ferramentas `search_people`, `search_companies` e `search_jobs` são poderosas para posicionamento freelance. Aqui está como usar cada uma:

### 3.1 Busca de Pessoas (`linkedin_search_people`)

**Objetivo:** Encontrar decisores que precisam de AI Agent Engineering.

| Busca | Query Sugerida | Para quê |
|-------|---------------|---------|
| CTOs de startups AI | "CTO" + filtro "AI" ou "machine learning" | Prospects para freelance |
| Founders que postam sobre agentes | "founder" + "AI agents" | Engajar nos posts deles |
| Devs que usam Claude/MCP | "MCP" ou "Claude Code" | Networking técnico |
| Recrutadores de AI | "recruiter" + "AI engineer" | Pipeline de oportunidades |

**Tática:** Depois de encontrar alguém via search, NÃO mande DM fria. Use o `linkedin_create_comment` para comentar substantivamente nos posts dessa pessoa primeiro. Depois de 2-3 interações genuínas, aí sim conecte.

### 3.2 Busca de Empresas (`linkedin_search_companies`)

**Objetivo:** Mapear empresas que estão investindo em AI agêntico.

| Query | Insight |
|-------|---------|
| "AI agents" ou "agentic AI" | Empresas no espaço diretamente |
| "MCP" ou "model context protocol" | Early adopters de MCP |
| "RAG" ou "retrieval augmented generation" | Empresas com pipelines RAG (cliente ideal do Lucas) |
| "AI automation" + Brasil | Mercado local |

### 3.3 Busca de Vagas (`linkedin_search_jobs`)

**Objetivo:** Não necessariamente aplicar, mas sim entender o que o mercado paga e pede.

| Query | Insight Estratégico |
|-------|---------------------|
| "AI agent engineer" | Quais skills estão em demanda |
| "multi-agent systems" | Quais empresas estão contratando para isso |
| "MCP protocol" | Quão mainstream MCP já está |
| "context engineering" | Se já virou título de vaga |
| "RAG engineer" remote | Benchmark de salários freelance |

**Uso no conteúdo:** Dados de job search viram conteúdo. Exemplo: "Pesquisei vagas de AI Agent Engineer no LinkedIn esta semana. 73% pedem experiência com orquestração multi-agente. Há 6 meses, essa keyword nem existia nas job descriptions." — Esse tipo de dado vira post.

---

## 4. WORKFLOW DIÁRIO RECOMENDADO COM `/linkedin`

### Rotina Matinal (15 min, 3x por semana — Ter/Qua/Qui)

```
1. /linkedin ideas --count 3
   → Gerar ideias baseadas nos pilares da semana

2. /linkedin draft --topic "[tema do dia]" --style [insight|storytelling|provocative]
   → Criar rascunho bilíngue

3. Revisar, ajustar tom, aprovar
   → NUNCA publicar sem revisão humana

4. /linkedin post "[conteúdo aprovado]"
   → Publicar via MCP
```

### Rotina de Engajamento (10 min, diariamente)

```
1. Abrir LinkedIn no browser/app
   → Ver quem comentou nos seus posts

2. /linkedin reply --post-id "[id]" --tone insightful
   → Rascunhar respostas substantivas

3. Comentar em 3-5 posts de pessoas do nicho
   → Usar linkedin_create_comment para comentários de alto valor
   → NUNCA comentários genéricos ("great post!")
   → SEMPRE adicionar insight técnico ou experiência própria
```

### Rotina Semanal de Pesquisa (20 min, sexta-feira)

```
1. linkedin_search_people → buscar novos CTOs/founders no espaço AI
2. linkedin_search_companies → mapear empresas emergentes
3. linkedin_search_jobs → monitorar demanda de mercado
4. Anotar insights para usar como conteúdo na semana seguinte
```

---

## 5. CALENDÁRIO DE CONTEÚDO — PRÓXIMAS 3 SEMANAS

### Semana 1: Trilogia (03-07 de março 2026) — JÁ PRONTOS

| Dia | Horário (BRT) | Post | Pilar |
|-----|--------------|------|-------|
| **Seg 03/03** | 08:00 | Post 1: OpenClaw/Forjai/MCP — "Três semanas atrás eu abri o OpenClaw..." | Builder's Journey |
| **Qua 05/03** | 08:00 | Post 2: AIOS/Context Compression — "47 scripts em 47 terminais..." | Context Engineering |
| **Sex 07/03** | 08:00 | Post 3: O Arquiteto/Orquestrador — "A maior parte do código que eu escrevi..." | Novo Paradigma |

**Arquivo:** `freelance-results/linkedin-trilogia-pesquisada.md`

### Semana 2 (10-14 de março 2026) — A GERAR

| Dia | Horário (BRT) | Tema | Hook PT-BR | Hook EN |
|-----|--------------|------|-----------|---------|
| **Ter 11/03** | 08:00 | O Dia Que Meu Agente Me Mandou Mensagem às 3AM | "Meu servidor me mandou mensagem no WhatsApp às 3 da manhã. E eu agradeci." | "My server texted me on WhatsApp at 3 AM. And I was grateful." |
| **Qua 12/03** | 11:00 | Circuit Breaker: Quando o Agente Sabe Parar | "O melhor sistema de IA não é o mais inteligente. É o que sabe quando parar." | "The best AI system isn't the smartest. It's the one that knows when to stop." |
| **Sex 14/03** | 08:00 | De 47 Terminais a Uma Mensagem no WhatsApp | "Eu tinha 47 scripts rodando em 47 terminais. Hoje mando uma mensagem e meu ecossistema se organiza." | "I had 47 scripts running in 47 terminals. Today I send one message and my ecosystem self-organizes." |

### Semana 3 (17-21 de março 2026) — A GERAR

| Dia | Horário (BRT) | Tema | Hook PT-BR | Hook EN |
|-----|--------------|------|-----------|---------|
| **Ter 18/03** | 08:00 | 3 Agentes Discutem Sua Redação | "Eu construí um sistema onde 3 agentes de IA discutem sobre sua redação. E o juiz não é nenhum deles." | "I built a system where 3 AI agents argue about your essay. And the judge is none of them." |
| **Qua 19/03** | 11:00 | Gotchas Memory: Quando o Sistema Aprende Sozinho | "Meu sistema de IA aprendeu a não repetir o mesmo erro 3 vezes. Eu ainda não consegui." | "My AI system learned not to repeat the same mistake 3 times. I still haven't." |
| **Sex 21/03** | 08:00 | Open Source > Tutoriais | "Contribuir com um projeto open source me ensinou mais em 7 dias do que 7 meses de tutoriais." | "Contributing to an open source project taught me more in 7 days than 7 months of tutorials." |

---

## 6. TÁTICAS DE ENGAJAMENTO DENTRO DOS LIMITES DA API

### 6.1 Comentários estratégicos (alto impacto, via `linkedin_create_comment`)

O algoritmo de 2026 dá 7-9x mais peso para "expert interactions". Isso significa que **comentar nos posts certos é mais valioso que publicar**.

**Tática: "5 para 1"**
Para cada post que o Lucas publica, ele deve deixar 5 comentários substantivos em posts de outros. Cada comentário deve:
- Adicionar um insight técnico não-óbvio
- Referenciar experiência própria ("Quando implementei circuit breaker no meu MCP bridge, descobri que...")
- Ter 3-5 linhas (nem curto demais, nem um post dentro do comentário)
- NUNCA ser genérico ("great post!", "totally agree!")

**Alvos prioritários para comentar:**
1. Posts de CTOs/founders de startups AI (prospects freelance)
2. Posts sobre MCP, multi-agent, context engineering (nicho do Lucas)
3. Posts de influencers tech grandes (Addy Osmani, etc.) — comentários bons nesses posts geram visibilidade massiva
4. Posts de brasileiros na área de AI (comunidade local)

### 6.2 Responder TODOS os comentários nos próprios posts

Usar `linkedin_get_post_comments` para monitorar comentários e `linkedin_create_comment` para responder. Cada resposta deve:
- Agradecer genuinamente
- Adicionar um layer extra de insight
- Fazer uma pergunta de follow-up para manter o thread vivo
- Responder em até 4 horas (período crítico para o algoritmo)

### 6.3 Pesquisa-para-conteúdo pipeline

```
Sexta: linkedin_search_jobs("AI agent engineer")
     → Analisar resultados
     → Transformar em insight de mercado
Terça: Publicar post com dados reais
     → "Pesquisei vagas de AI Agent Engineer no LinkedIn esta semana..."
```

Esse ciclo transforma pesquisa de mercado em conteúdo original com dados concretos — exatamente o tipo de post que o algoritmo de 2026 recompensa.

---

## 7. O QUE AUTOMATIZAR VS O QUE FAZER MANUALMENTE

### Automatizável via MCP (fazer)

| Ação | Como | Frequência |
|------|------|------------|
| Publicar posts | `/linkedin post` | 3x/semana |
| Rascunhar conteúdo bilíngue | `/linkedin draft` | 3x/semana |
| Gerar ideias | `/linkedin ideas` | 1x/semana |
| Comentar em posts | `linkedin_create_comment` | 5x/dia |
| Responder comentários | `linkedin_create_comment` | Conforme chegam |
| Pesquisar leads | `linkedin_search_people` | 1x/semana |
| Monitorar mercado | `linkedin_search_jobs` | 1x/semana |
| Mapear empresas | `linkedin_search_companies` | 1x/semana |

### NÃO automatizável (aceitar e fazer manual)

| Ação | Por quê | Alternativa |
|------|---------|-------------|
| Ver analytics de posts | API bloqueada | Checar no app e reportar pro AIOS |
| Ler feed/timeline | API bloqueada | Navegar manualmente e anotar posts para comentar |
| Enviar connection requests | API bloqueada | Fazer manualmente após engajar via comentários |
| Ver DMs | API bloqueada | Checar inbox manualmente |

---

## 8. PRÓXIMOS PASSOS — PRIORIDADE ORDENADA

### PRIORIDADE 1: Publicar a Trilogia (esta semana)

O Lucas já tem 3 versões da trilogia prontas. A versão pesquisada em `freelance-results/linkedin-trilogia-pesquisada.md` é superior — tem dados de mercado verificados (Gartner, Deloitte, Linux Foundation), números do codebase (SYNAPSE, handoff de 379 tokens, circuit breaker), e fontes citáveis.

**Ação:** Agendar os 3 posts no LinkedIn nativo: Seg 03/03 08:00, Qua 05/03 08:00, Sex 07/03 08:00.

### PRIORIDADE 2: Ativar rotina de engajamento (esta semana)

Antes mesmo de publicar, começar a comentar em 3-5 posts/dia de pessoas do nicho. Usar `linkedin_search_people` para encontrar CTOs e founders no espaço AI agêntico. Comentar substantivamente nos posts deles durante 3-5 dias antes de publicar o primeiro post da trilogia.

**Racional:** Construir visibilidade e reconhecimento de nome ANTES de publicar. Quando o primeiro post sair, essas pessoas já vão reconhecer o Lucas.

### PRIORIDADE 3: Otimizar perfil (antes de publicar)

O headline atual do LinkedIn precisa refletir o posicionamento:
- **Sugestão:** "AI Agent Engineer | Multi-Agent Orchestration, RAG & Context Engineering | Building production AI at Petrobras"

### PRIORIDADE 4: Iniciar pipeline de pesquisa semanal (a partir da semana 2)

Toda sexta-feira:
- `linkedin_search_jobs("AI agent engineer", "multi-agent", "MCP")`
- `linkedin_search_companies("agentic AI")`
- `linkedin_search_people("CTO", filtro AI)`
- Anotar insights e transformar em conteúdo para a semana seguinte.

### PRIORIDADE 5: Experimentar document posts/carousels (semana 3)

Document posts (PDF carousel) têm 6.60% de engagement — o mais alto de qualquer formato em 2026. O Lucas tem diagramas de arquitetura do AIOS, do MCP bridge, do agent handoff que seriam perfeitos como carousel de 8-10 slides.

**Ação:** Criar um PDF carousel mostrando "Como meu AI Operating System funciona" com diagramas visuais. Publicar via `linkedin_create_image_post`.

### PRIORIDADE 6: Versão em inglês semanal (semana 3+)

Publicar 1 post/semana em inglês puro (não bilíngue, post separado) para alcance global. O mercado freelance internacional é onde está o dinheiro ($60-80/hr). Posts em inglês sobre MCP, context engineering e multi-agent systems atingem um público global de tomadores de decisão.

---

## 9. MÉTRICAS PARA ACOMPANHAR (manualmente, por enquanto)

Como não temos acesso a analytics via API, o Lucas deve registrar semanalmente:

| Métrica | Onde ver | Meta semanal |
|---------|---------|--------------|
| Views por post | LinkedIn app | >500 (crescendo 20%/semana) |
| Engajamento (likes + comments) | LinkedIn app | >20 por post |
| Novos seguidores | LinkedIn app | +15/semana |
| Connection requests recebidos | LinkedIn app | +5/semana |
| DMs de leads/oportunidades | LinkedIn inbox | +1/semana |
| Profile views | LinkedIn dashboard | >100/semana |

Esses dados podem ser reportados pro AIOS via um arquivo `linkedin-metrics.md` atualizado semanalmente, permitindo ajustar a estratégia com dados reais.

---

## 10. RESUMO EXECUTIVO

O Lucas tem um posicionamento raro no mercado: é um builder genuíno com projetos reais e em produção (AIOS, Forjai, OpenClaw, AI Grading System, WhatsApp Agentic Daemon) em um mercado que está cansado de gurus vendendo curso. O tom de voz dele — modesto, técnico, bem-humorado, zero curso pra vender — é exatamente o que o algoritmo de autenticidade do LinkedIn em 2026 recompensa.

As ferramentas MCP que temos são suficientes para uma operação robusta de publicação e engajamento. A limitação principal (sem analytics via API) é contornável com monitoramento manual semanal.

A estratégia se resume em 4 ações:

1. **Publicar 3x/semana** com conteúdo substancial e bilíngue, usando os 5 pilares narrativos que o Lucas já tem definidos
2. **Comentar 5x/dia** em posts de pessoas do nicho (dado do algoritmo: mais impactante que publicar)
3. **Pesquisar semanalmente** via search_people/companies/jobs para alimentar o pipeline de conteúdo e leads
4. **Medir manualmente** e ajustar com base em dados reais

O diferencial não é a automação. É a autenticidade combinada com consistência. A automação via MCP apenas remove a fricção de publicar — o valor real está no conteúdo genuíno que o Lucas tem para compartilhar, construído sobre projetos reais que ele operou e debugou às 3 da manhã.

---

**Sources:**
- [LinkedIn Algorithm 2026 — Sprout Social](https://sproutsocial.com/insights/linkedin-algorithm/)
- [LinkedIn Posting Frequency 2026 — Buffer](https://buffer.com/resources/how-often-to-post-on-linkedin/)
- [LinkedIn Posting Frequency Best Practices — Linkboost](https://blog.linkboost.co/linkedin-posting-frequency-best-practices-2026/)
- [Document Posts 3x Higher Engagement — Dataslayer](https://www.dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now)
- [LinkedIn Content Trends 2026 — LinkedFusion](https://www.linkedfusion.io/blogs/linkedin-content-trends/)
- [LinkedIn Engagement Benchmarks — ContentIn](https://contentin.io/blog/linkedin-engagement-benchmarks/)
- [Best Times to Post — Sprinklr](https://www.sprinklr.com/blog/best-times-to-post-on-linkedin/)
