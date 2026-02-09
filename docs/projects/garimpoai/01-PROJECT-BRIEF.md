# Project Brief: GarimpoAI

**Data:** 2026-02-07
**Analista:** Atlas (Analyst Agent)
**Versao:** 1.0
**Status:** Draft para aprovacao

---

## 1. Visao do Produto

### One-Liner
**GarimpoAI** e um assistente pessoal de licitacoes publicas com IA conversacional — voce pergunta em linguagem natural, ele encontra, analisa e te guia do zero ate a participacao.

### Visao Expandida
Uma ferramenta pessoal/empresa propria com interface conversacional. O usuario interage em linguagem natural: *"me mostra licitacoes de software em SP"*, *"analisa essa pra mim"*, *"me avisa quando tiver de TI no RJ"*. A IA interpreta, busca no banco de dados local (alimentado pela API PNCP), analisa editais e responde como um consultor pessoal. O diferencial e a abordagem "conversa + aprenda licitando" — o sistema nao apenas encontra oportunidades, mas explica em linguagem simples, guia o usuario novo e aprende seus interesses.

### Proposta de Valor

| Para | Proposta |
|------|----------|
| **Iniciante em licitacoes** | Encontre oportunidades reais, entenda o que precisa, e participe com confianca |
| **Empresa pequena (MEI/ME)** | Monitore editais relevantes 24/7 sem custo de plataforma (R$ 200-600/mes) |
| **Uso proprio** | Ferramenta personalizada que aprende seus interesses e melhora com o tempo |

---

## 2. Contexto de Mercado

### Dados do Mercado

| Metrica | Valor |
|---------|-------|
| Mercado total de compras publicas | R$ 1,18 trilhao/ano (~12% PIB) |
| Plataformas existentes | 8+ (Effecti, Wavecode, Siga Pregao, etc.) |
| Faixa de preco das plataformas | R$ 30 a R$ 600/mes |
| Cobertura PNCP | Federal + Estadual (boa), Municipal pequeno (fraca ate 2027) |

### Concorrentes Mapeados

| Plataforma | Preco | Foco |
|------------|-------|------|
| Alerta Licitacao | R$ 30-40/mes | Monitoramento basico |
| ConLicitacao | R$ 149/mes | Gestao + IA |
| Effecti | ~R$ 200-600/mes | Suite completa + IA |
| Wavecode | Consultivo | Suite completa + disputa |
| Siga Pregao | Consultivo | Disputa + juridico |
| Lance Facil | Consultivo | Automacao de lances |
| R-Licitacoes | Consultivo | Software desktop |
| eLicitacao | Consultivo | Multiportal |

### Gap Identificado
Nenhuma plataforma atende bem o perfil "novo no mercado + quer comecar + preco acessivel + orientacao com IA". O mercado foca em empresas ja estabelecidas que ja sabem licitar.

---

## 3. Fontes de Dados (APIs Publicas Verificadas)

### API PNCP (Principal)

| Item | Detalhe |
|------|---------|
| Base URL | `https://pncp.gov.br/api/consulta` |
| Autenticacao | Nenhuma (leitura publica) |
| Formato | JSON |
| Paginacao | 10-500 por pagina |
| Rate Limit | Nao documentado |
| CORS | `access-control-allow-origin: *` |

**Endpoints principais:**
- `GET /v1/contratacoes/publicacao` — Buscar por data de publicacao
- `GET /v1/contratacoes/atualizacao` — Buscar por data de atualizacao (incremental)
- `GET /v1/contratacoes/proposta` — Licitacoes com propostas abertas
- `GET /v1/contratos` — Contratos por periodo
- `GET /v1/atas` — Atas de registro de preco
- `GET /v1/pca/` — Plano de Contratacao Anual

**Filtros disponiveis:** Data, modalidade (obrigatorio), UF, municipio (IBGE), CNPJ, unidade administrativa.

**Limitacoes criticas:**
1. Sem busca textual na API — filtrar client-side
2. Modalidade obrigatoria — iterar 11 modalidades
3. Cobertura incompleta para municipios < 20k hab (obrigatorio so em 2027)

**Modalidades (codigos):**
| Codigo | Nome |
|--------|------|
| 2 | Dialogo Competitivo |
| 4 | Concorrencia Eletronica |
| 5 | Concorrencia Presencial |
| 6 | Pregao Eletronico |
| 7 | Pregao Presencial |
| 8 | Dispensa de Licitacao |
| 9 | Inexigibilidade |
| 10 | Manifestacao de Interesse |
| 11 | Pre-qualificacao |
| 12 | Credenciamento |

### API ComprasNet (Complementar)

| Item | Detalhe |
|------|---------|
| Base URL | `https://compras.dados.gov.br` |
| Autenticacao | Publica |
| Formato | JSON, XML, CSV |
| Modulos | CATMAT, CATSER, SIDEC, IRP, SICAF, SISPP, SISRP, SISME, SICON |

### API Querido Diario (Complementar)

| Item | Detalhe |
|------|---------|
| URL | `https://queridodiario.ok.org.br/api/docs` |
| Cobertura | +350 municipios |
| Tipo | FastAPI (Python) |
| Dados | Diarios oficiais municipais |

---

## 4. Roadmap de Fases

### Fase 1: Radar de Oportunidades (MVP) — ~3 semanas
- Interface conversacional com IA (linguagem natural)
- Coleta automatica via PNCP API
- Filtro inteligente (IA interpreta o que voce quer)
- Analise de editais com IA (Claude API + tool use)
- Alertas via Telegram (tambem conversacional) e Email
- CLI-first conversacional (alinhado com Constitution AIOS)
- **Custo:** ~R$ 20/mes (IA)

### Fase 2: Gestao de Documentos + Compliance — 2-3 semanas
- Cadastro de documentos da empresa
- Alertas de vencimento de certidoes
- Checklist automatico por edital
- Match documentos vs requisitos

### Fase 3: Inteligencia Competitiva — 3-4 semanas
- Historico de contratos e vencedores
- Preco medio por item/regiao
- Analise de concorrencia
- Score de viabilidade

### Fase 4: UI Dashboard (Observability) — 4-6 semanas
- Dashboard web para visualizacao
- Kanban de oportunidades
- Graficos e analytics
- Mobile-friendly

---

## 5. Stack Tecnica (Fase 1)

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Linguagem | TypeScript (Node.js) | Stack principal do AIOS |
| Interface | Claude API + Tool Use + readline REPL | Conversacional + CLI |
| Coleta | node-cron + fetch | Scheduler + HTTP client |
| Banco de dados | SQLite (dev) → PostgreSQL (prod) | Simplicidade para MVP |
| ORM | Drizzle ORM | Leve, type-safe, SQL-first |
| IA (chat) | Claude Haiku 4.5 | Conversas rapidas, baixo custo |
| IA (analise) | Claude Sonnet 4.5 | Analise profunda de editais |
| Notificacoes | Telegram Bot API + Nodemailer | Alertas (Telegram tambem conversacional) |
| CLI | Commander.js + readline | Comandos diretos + modo REPL |
| Testes | Jest | Padrao do projeto |

---

## 6. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| API PNCP instavel/fora do ar | Media | Alto | Retry com backoff + cache local |
| Volume de dados alto (12k+/semana) | Alta | Medio | Paginacao eficiente + sync incremental |
| Custo IA escalar | Baixa | Medio | Analisar apenas editais filtrados |
| Editais em PDF escaneado | Media | Medio | OCR como Fase 2 (focar em dados da API primeiro) |
| Mudanca na API PNCP | Baixa | Alto | Abstraction layer + monitoramento de schema |

---

## 7. Metricas de Sucesso (Fase 1)

| Metrica | Target |
|---------|--------|
| Licitacoes coletadas/dia | > 500 |
| Tempo de coleta (ciclo completo) | < 10 minutos |
| Precisao do filtro por keywords | > 90% |
| Tempo de analise IA por edital | < 30 segundos |
| Alertas enviados em < 5 min da publicacao | > 95% |
| Uptime do coletor | > 99% |

---

## 8. Referencias

- [PNCP API Swagger](https://pncp.gov.br/api/consulta/swagger-ui/index.html)
- [ComprasNet Dados Abertos](https://compras.dados.gov.br/docs/home.html)
- [Querido Diario API](https://queridodiario.ok.org.br/api/docs)
- [Lei 14.133/2021](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)
- [GitHub Topic: licitacao](https://github.com/topics/licitacao)
- [thiagosy/PNCP](https://github.com/thiagosy/PNCP) — Referencia Python
- [powerandcontrol/PNCP](https://github.com/powerandcontrol/PNCP) — Referencia coleta

---

*GarimpoAI Project Brief v1.0 — 2026-02-07*
