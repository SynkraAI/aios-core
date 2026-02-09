# Project Brief: Typus Platform

**Data:** 2026-02-07
**Analista:** Atlas (Analyst Agent)
**Versao:** 1.0
**Status:** Draft para aprovacao

---

## 1. Visao do Produto

### One-Liner
**Typus** e a primeira plataforma de tipologia psicologica com IA conversacional, unindo autoconhecimento pessoal e inteligencia de equipes em uma experiencia em portugues nativo.

### Visao Expandida
Uma plataforma SaaS B2C+B2B que transforma o conhecimento profundo do squad `mbti-expert` (16Personalities + Jung + Keirsey) em uma experiencia acessivel, interativa e monetizavel. Diferente dos concorrentes que oferecem quizzes estaticos, o Typus tem um "Dr. Typus" conversacional com IA que guia usuarios em jornadas personalizadas de autoconhecimento, relacionamentos, carreira e desenvolvimento.

### Proposta de Valor

| Para | Proposta |
|------|----------|
| **Individuos (B2C)** | Descubra seu tipo, entenda relacionamentos, encontre sua carreira ideal e desenvolva-se com IA personalizada |
| **Empresas (B2B)** | Monte equipes melhores, melhore comunicacao, otimize contratacao e desenvolva lideranca com insights de personalidade |

---

## 2. Publico-Alvo

### Segmento B2C

| Persona | Descricao | Motivacao | Willingness to Pay |
|---------|-----------|-----------|-------------------|
| **Curioso** | 18-35 anos, redes sociais | "Qual meu tipo?" | Baixa (free tier) |
| **Buscador** | 25-40 anos, autoconhecimento | Entender-se melhor, relacoes | Media (R$29-49/mes) |
| **Profissional** | 28-45 anos, carreira | Orientacao profissional, lideranca | Alta (R$49-99/mes) |
| **Pai/Mae** | 30-50 anos, parentalidade | Entender filhos, guia educacional | Media-Alta |
| **Casal** | 20-45 anos, relacionamento | Compatibilidade, comunicacao | Media |

### Segmento B2B

| Persona | Descricao | Motivacao | Willingness to Pay |
|---------|-----------|-----------|-------------------|
| **RH/People Ops** | Empresas 50-500 func. | Team building, contratacao | R$99-199/seat/mes |
| **Lider de Equipe** | Tech leads, managers | Entender dinamica do time | R$99-199/seat/mes |
| **Coach/Consultor** | Profissionais independentes | Ferramenta para clientes | R$149-299/mes |
| **Instituicao de Ensino** | Escolas, universidades | Orientacao vocacional | Custom |

### TAM / SAM / SOM (Brasil)

| Metrica | Valor | Calculo |
|---------|-------|---------|
| **TAM** | R$1.0B | Mercado BR de assessment psicometrico |
| **SAM** | R$200M | MBTI/tipologia online no Brasil |
| **SOM (Ano 1)** | R$2-5M | 10K-25K assinantes pagos |
| **SOM (Ano 3)** | R$15-30M | Expansao LATAM + B2B |

---

## 3. Features Mapeadas do Squad mbti-expert

### Core: Mapeamento Squad → Plataforma

| Squad Task | Feature na Plataforma | Tier |
|------------|----------------------|------|
| `identify-type` | Quiz interativo + IA | Free |
| `type-profile` | Perfil completo do tipo | Free (basico) / Premium (completo) |
| `type-summary` | Card compartilhavel | Free |
| `polarities-explainer` | Onboarding educacional | Free |
| `compare-types` | Comparacao lado a lado | Free (1) / Premium (ilimitado) |
| `compatibility-analysis` | Analise de compatibilidade (romantico/amizade/trabalho) | Premium |
| `relationship-dynamics` | Dinamica de relacionamentos | Premium |
| `career-guidance` | Orientacao profissional | Premium |
| `personal-growth` | Plano de desenvolvimento (5 Aspects) | Premium |
| `cognitive-functions` | Deep dive em funcoes Jung | Premium |
| `temperament-analysis` | Analise de temperamento Keirsey | Premium |
| `parenting-guide` | Guia de parentalidade por estagio | Premium |
| `academic-path` | Orientacao academica/aprendizado | Premium |
| `team-dynamics` | Analise de equipe | Business |
| `leadership-style` | Estilo de lideranca | Business |

### Dados do Squad como Base

| Arquivo de Dados | Uso na Plataforma |
|------------------|-------------------|
| `type-profiles-overview.md` | Base dos 16 perfis de tipo |
| `cognitive-functions-reference.md` | Modulo de funcoes cognitivas |
| `compatibility-matrix.md` | Engine de compatibilidade (120 pairings) |
| `career-map.md` | Modulo de orientacao profissional |
| `personal-growth-framework.md` | Modulo de desenvolvimento pessoal |
| `parenting-stages.md` | Modulo de parentalidade |
| `temperaments-and-strategies.md` | Modulo Keirsey + estrategias |
| `brazilian-statistics.md` | Dados locais BR (Fellipelli, 145K prof.) |
| `polarities-summary.md` | Conteudo educacional |

### Templates como Geradores de Relatorios

| Template | Output na Plataforma |
|----------|---------------------|
| `type-report-tmpl.md` | PDF/relatorio de perfil de tipo |
| `compatibility-report-tmpl.md` | PDF de analise de compatibilidade |
| `team-analysis-tmpl.md` | Dashboard/relatorio de equipe (B2B) |
| `career-report-tmpl.md` | PDF de orientacao profissional |

### Workflows como Jornadas de Usuario

| Workflow | Jornada na Plataforma |
|----------|----------------------|
| `full-type-analysis` | Onboarding: Quiz → Perfil → Growth → Carreira → Summary |
| `team-composition` | B2B: Coleta tipos → Analise roles → Sinergia → Conflitos → Recomendacoes |

---

## 4. Modelo de Monetizacao

### Tiers e Pricing

```
┌─────────────────────────────────────────────────────────────────┐
│                        TYPUS PRICING                            │
├──────────┬──────────────┬───────────────┬──────────────────────┤
│  FREE    │  EXPLORER    │  PREMIUM      │  BUSINESS            │
│  R$0     │  R$29/mes    │  R$79/mes     │  R$149/seat/mes      │
├──────────┼──────────────┼───────────────┼──────────────────────┤
│ Quiz     │ + Perfil     │ + Dr. Typus   │ + Team Dynamics      │
│ Tipo     │   completo   │   IA chat     │ + Leadership         │
│ Card     │ + 3 compare  │ + Compat.     │ + Hiring Insights    │
│ basico   │ + Carreira   │   ilimitada   │ + Dashboards         │
│          │   basica     │ + Growth plan │ + API access         │
│          │              │ + Parenting   │ + Custom reports     │
│          │              │ + Academic    │ + SSO/Admin          │
│          │              │ + Cognitivo   │                      │
│          │              │ + PDFs        │                      │
└──────────┴──────────────┴───────────────┴──────────────────────┘
```

### Unit Economics Estimados

| Metrica | Valor |
|---------|-------|
| **CAC (B2C)** | R$15-30 (organico/SEO) a R$50-80 (paid) |
| **LTV (Explorer)** | R$29 x 8 meses = R$232 |
| **LTV (Premium)** | R$79 x 12 meses = R$948 |
| **LTV (Business)** | R$149 x 5 seats x 18 meses = R$13.410 |
| **LTV:CAC ratio alvo** | >3:1 |
| **Custo IA por conversa** | ~R$0.50-2.00 (Claude API) |
| **Margem bruta alvo** | 75-85% |

### Fontes de Receita

1. **Subscriptions (80%)** - Assinaturas mensais/anuais B2C e B2B
2. **Relatorios avulsos (10%)** - PDFs premium para nao-assinantes
3. **API/Data (5%)** - Integracao enterprise pay-per-call
4. **Workshops/Certificacao (5%)** - Conteudo educacional B2B

---

## 5. Diferenciacao Competitiva

### Moat (Vantagem Defensavel)

```
┌──────────────────────────────────────────────────────────┐
│                   COMPETITIVE MOAT                        │
│                                                          │
│  1. IA CONVERSACIONAL (Dr. Typus)                        │
│     Ninguem oferece. Experiencia unica.                  │
│                                                          │
│  2. MULTI-FRAMEWORK (3 modelos integrados)               │
│     16P + Jung + Keirsey = visao 360 graus               │
│                                                          │
│  3. DADOS BRASILEIROS EXCLUSIVOS                         │
│     Fellipelli (145K) + estatisticas locais              │
│                                                          │
│  4. PORTUGUES NATIVO                                     │
│     Nao e traducao. E conteudo criado em PT-BR.          │
│                                                          │
│  5. VERTICAL UNICA (Parentalidade/Educacao)              │
│     Zero concorrentes nesse espaco                       │
│                                                          │
│  6. FRAMEWORK 5 SELF-ASPECTS                             │
│     Desenvolvimento pessoal estruturado exclusivo        │
│                                                          │
│  7. COMMUNITY/SOCIAL                                     │
│     Network effect + user-generated insights             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Posicionamento vs Concorrentes

| Dimensao | 16P | Truity | Crystal | **Typus** |
|----------|-----|--------|---------|-----------|
| Experiencia | Quiz estatico | Quiz estatico | AI prediction | **AI conversacional** |
| Framework | Big Five (5 letras) | Multi (separados) | DISC | **3 integrados** |
| Idioma BR | Traducao | Ingles | Ingles | **Nativo PT-BR** |
| Foco | B2C global | B2C global | B2B sales | **B2C + B2B hibrido** |
| Profundidade | Medio | Variavel | Raso (DISC) | **Profundo (3 modelos)** |
| Parentalidade | Nao | Nao | Nao | **Sim** |
| Comunidade | Nao | Nao | Nao | **Sim** |
| Dados BR | Nao | Nao | Nao | **Sim (Fellipelli)** |

---

## 6. Arquitetura Tecnica Sugerida

### Stack Recomendada

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | Next.js 16+ (App Router) | SSR/SSG para SEO, React Server Components |
| **UI** | Tailwind CSS + Radix UI | Ja usado no dashboard AIOS |
| **Backend** | Node.js + TypeScript | Alinhado com stack do monorepo |
| **Database** | PostgreSQL + Prisma | Relacional para perfis/relacionamentos |
| **Cache** | Redis | Sessions, quiz state, rate limiting |
| **IA** | Claude API (Anthropic) | Dr. Typus conversacional |
| **Auth** | NextAuth.js / Clerk | Social login + email |
| **Payments** | Stripe | Subscriptions internacionais |
| **Email** | Resend | Transactional emails |
| **Analytics** | PostHog / Plausible | Privacy-first analytics |
| **Hosting** | Vercel + PlanetScale | Serverless-friendly |
| **CDN/Assets** | Cloudflare | Performance global |

### Arquitetura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js App Router + Tailwind + Radix UI                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐       │
│  │ Landing  │ │ Quiz     │ │ Dashboard│ │ Dr. Typus │       │
│  │ Page     │ │ Engine   │ │ Profiles │ │ Chat UI   │       │
│  └─────────┘ └──────────┘ └──────────┘ └───────────┘       │
├─────────────────────────────────────────────────────────────┤
│                         API LAYER                            │
│  Next.js API Routes / tRPC                                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐       │
│  │ Auth    │ │ Quiz     │ │ Profile  │ │ AI Chat   │       │
│  │ Service │ │ Service  │ │ Service  │ │ Service   │       │
│  └─────────┘ └──────────┘ └──────────┘ └───────────┘       │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  ┌────────────┐ ┌───────┐ ┌──────────────┐                  │
│  │ PostgreSQL │ │ Redis │ │ Claude API   │                  │
│  │ (Prisma)   │ │       │ │ (Dr. Typus)  │                  │
│  └────────────┘ └───────┘ └──────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                  KNOWLEDGE BASE                              │
│  Squad mbti-expert data files (loaded as structured data)    │
│  type-profiles | compatibility-matrix | career-map | etc.    │
└─────────────────────────────────────────────────────────────┘
```

### Integracao com AIOS Core

A plataforma pode ser desenvolvida como um novo app no monorepo:
```
aios-core/
├── apps/
│   ├── dashboard/          # Dashboard existente
│   └── typus/              # Nova plataforma Typus
│       ├── src/
│       │   ├── app/        # Next.js App Router
│       │   ├── lib/        # Business logic
│       │   │   ├── quiz/   # Quiz engine
│       │   │   ├── ai/     # Dr. Typus integration
│       │   │   ├── types/  # Type profiles & data
│       │   │   └── team/   # B2B team features
│       │   └── components/ # UI components
│       └── prisma/         # Database schema
├── packages/
│   ├── typus-data/         # Dados do squad como package
│   │   ├── profiles/       # 16 type profiles (JSON)
│   │   ├── compatibility/  # Compatibility matrix
│   │   ├── careers/        # Career mappings
│   │   └── brazilian/      # BR-specific data
│   └── typus-ai/           # Dr. Typus AI engine
│       ├── prompts/        # System prompts
│       ├── templates/      # Report generation
│       └── engine/         # Chat + analysis engine
```

---

## 7. Roadmap Proposto

### Fase 1: MVP (8-12 semanas)
**Objetivo:** Validar demanda com quiz + perfil + IA basica

- [ ] Landing page com proposta de valor
- [ ] Quiz interativo de identificacao de tipo (baseado em `identify-type`)
- [ ] Perfil de tipo completo (baseado em `type-profile` + `type-profiles-overview`)
- [ ] Card compartilhavel nas redes sociais
- [ ] Dr. Typus basico: 3 interacoes gratuitas por dia
- [ ] Auth (Google/email login)
- [ ] Paywall para features premium
- [ ] Stripe integration para subscriptions
- [ ] SEO otimizado (pagina por tipo, por comparacao)

**Metricas de Sucesso:**
- 10K quizzes no primeiro mes
- 2% conversao free → paid
- NPS > 40

### Fase 2: Premium Features (6-8 semanas)
**Objetivo:** Monetizacao B2C completa

- [ ] Compatibilidade de relacionamentos (baseado em `compatibility-matrix`)
- [ ] Orientacao de carreira (baseado em `career-map`)
- [ ] Plano de desenvolvimento pessoal (baseado em `personal-growth-framework`)
- [ ] Funcoes cognitivas detalhadas (baseado em `cognitive-functions-reference`)
- [ ] Analise de temperamento Keirsey (baseado em `temperaments-and-strategies`)
- [ ] Geracao de PDFs de relatorio
- [ ] Dr. Typus Premium: conversas ilimitadas com contexto persistente

### Fase 3: Verticais Unicas (6-8 semanas)
**Objetivo:** Diferenciacao competitiva

- [ ] Modulo de parentalidade (baseado em `parenting-stages`)
- [ ] Modulo academico/aprendizado (baseado em `academic-path`)
- [ ] Community features: forum por tipo, discussoes
- [ ] Dados brasileiros Fellipelli na experiencia
- [ ] Gamificacao: badges, progresso, streaks

### Fase 4: B2B Launch (8-10 semanas)
**Objetivo:** Revenue B2B

- [ ] Team Dynamics dashboard (baseado em `team-dynamics`)
- [ ] Leadership Style analysis (baseado em `leadership-style`)
- [ ] Admin panel: gerenciamento de equipes
- [ ] Convite em massa + onboarding de equipe
- [ ] Relatorios de equipe (baseado em `team-analysis-tmpl`)
- [ ] SSO (SAML/OIDC)
- [ ] Billing por seat

### Fase 5: Scale (ongoing)
**Objetivo:** Crescimento e expansao

- [ ] API publica para integracoes
- [ ] Expansao LATAM (espanhol)
- [ ] Mobile app (React Native / Expo)
- [ ] Workshops e certificacao online
- [ ] Integracao com plataformas HR (Gupy, Kenoby)
- [ ] White-label para coaches/consultores

---

## 8. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Custo de IA alto no free tier | Alta | Alto | Rate limit (3/dia free), caching de respostas comuns, modelo menor para free |
| Baixa conversao | Media | Alto | A/B testing agressivo, value hooks claros, trial de 7 dias do premium |
| Concorrente copia IA | Media | Medio | First-mover LATAM, dados BR exclusivos, community lock-in |
| LGPD compliance | Media | Alto | Privacy-by-design, DPO, termos claros, dados anonimizados |
| Criticas de validade cientifica | Media | Medio | Disclaimers claros, multi-framework, referencias academicas |
| Churn alto | Media | Alto | Engagement loops (community, weekly insights, development tracking) |

---

## 9. Metricas de Sucesso (KPIs)

### North Star Metric
**Usuarios que completam ao menos 2 analises por mes** (indica valor percebido)

### KPIs por Fase

| KPI | MVP (M3) | Fase 2 (M6) | Fase 3 (M9) | Fase 4 (M12) |
|-----|----------|-------------|-------------|--------------|
| Quizzes/mes | 10K | 50K | 150K | 300K |
| Usuarios registrados | 5K | 25K | 80K | 200K |
| Assinantes pagos | 200 | 1.5K | 5K | 10K |
| MRR | R$8K | R$75K | R$250K | R$800K |
| Conversao Free→Paid | 2% | 3% | 4% | 5% |
| NPS | >40 | >50 | >55 | >60 |
| Churn mensal | <10% | <8% | <6% | <5% |
| DAU/MAU | 15% | 20% | 25% | 30% |

---

## 10. Investimento Estimado

### Custos de Desenvolvimento (MVP)

| Item | Custo Estimado |
|------|---------------|
| Design UI/UX | R$15-25K |
| Frontend development | R$30-50K |
| Backend + API | R$20-35K |
| IA integration | R$10-20K |
| Infrastructure (3 meses) | R$3-5K |
| Total MVP | **R$78-135K** |

### Custos Operacionais Mensais (pos-MVP)

| Item | Custo/mes |
|------|-----------|
| Hosting (Vercel + DB) | R$500-2K |
| Claude API (IA) | R$2-10K (escala com uso) |
| Stripe fees | 2.9% + R$0.30/transacao |
| Email/transactional | R$200-500 |
| Analytics | R$500-1K |
| Total operacional | **R$3-15K/mes** |

### Break-even Estimado
Com MRR de R$15-20K (200-300 assinantes premium), o projeto atinge break-even operacional.

---

## 11. Proximos Passos

1. **Aprovacao deste brief** - Alinhar visao e escopo
2. **Validacao de demanda** - Landing page + waitlist (1-2 semanas)
3. **Design do MVP** - Wireframes e prototipos (@ux-design-expert)
4. **Arquitetura tecnica** - Tech spec detalhado (@architect)
5. **Setup do projeto** - Scaffold app no monorepo (@dev)
6. **Sprint 1** - Quiz engine + tipo profile + landing
7. **Sprint 2** - Dr. Typus IA + auth + paywall
8. **Sprint 3** - Polish + SEO + launch beta

---

*Project Brief v1.0 | Atlas (Analyst Agent) | 2026-02-07*
*Baseado no squad mbti-expert v1.0.0 + pesquisa de mercado*
