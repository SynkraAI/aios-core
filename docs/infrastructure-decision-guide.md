---
name: Infrastructure Decision Guide
description: Guia completo para escolher hosting, DB, cache, auth, storage e AI para qualquer projeto. Inclui serviços ativos e matriz de decisão.
type: reference
---

# Guia de Decisão de Infraestrutura

> Última atualização: 2026-04-01
> Baseado em pesquisa real de pricing, features e gotchas de cada serviço.

---

## Serviços que Já Tenho Conta

| Serviço | Categoria | Status |
|---------|-----------|--------|
| Railway | Hosting (app + workers) | Ativo |
| Vercel | Hosting (frontend/serverless) | Ativo |
| Netlify | Hosting (sites estáticos) | Ativo |
| Hetzner | VPS | Ativo (toki-bot roda aqui) |
| Supabase | DB + Auth + Storage | Ativo (3+ projetos) |
| Firebase | DB (NoSQL) + Auth | Ativo (dne-digital-student-id) |
| Apify | Web scraping API | Ativo (Instagram-Scraper) |
| ngrok | Tunneling (dev/webhooks) | Ativo |
| OpenAI | LLM API | Ativo |
| Claude (Anthropic) | LLM API | Ativo |
| Gemini (Google) | LLM API | Ativo |
| Groq | LLM API (inferência rápida) | Ativo |
| OpenRouter | LLM gateway (multi-provider) | Ativo |

---

## 1. Hosting — Onde rodar o app

### Árvore de decisão

```
O projeto tem workers/background jobs (BullMQ, cron, Playwright)?
├── SIM → Railway (Docker + Procfile, roda Playwright)
│         Custo: $15-25/mês (Hobby/Pro)
│
└── NÃO → É só frontend / API serverless?
    ├── SIM → Vercel (DX excelente, preview deploys)
    │         Custo: Free tier generoso, $20/mês Pro
    │
    └── É site estático / landing page?
        └── SIM → Netlify ou Vercel
                  Custo: Free
```

### Comparativo rápido

| Cenário | Usar | Não usar |
|---------|------|----------|
| Next.js + API + workers + Playwright | **Railway** | Vercel (não roda workers) |
| Next.js puro (SSR/SSG) sem workers | **Vercel** | Railway (overkill) |
| Landing page / site estático | **Netlify** ou **Vercel** | Railway (desperdício) |
| Bot que precisa estar 24/7 | **Hetzner VPS** (PM2) ou **Railway** | Vercel (serverless dorme) |
| Precisa de controle total da máquina | **Hetzner VPS** | Qualquer managed |

### Detalhes por serviço

#### Railway
- **Preço:** Hobby $5/mês (inclui $5 crédito), Pro $20/mês (inclui $20 crédito)
- **Playwright:** Funciona via Docker (precisa 2GB+ RAM no worker)
- **DX:** Git push → deploy automático, Nixpacks ou Dockerfile
- **Gotcha:** Pricing opaco quando escala (CPU/RAM cobrados separado)
- **Melhor pra:** Apps com workers, filas, Playwright, processos background

#### Vercel
- **Preço:** Free (hobby), Pro $20/mês (por membro)
- **DX:** O melhor do mercado para Next.js. Preview deploys, analytics, edge functions
- **Gotcha:** Serverless functions têm timeout (10s free, 60s pro). Não roda processos longos
- **Melhor pra:** Frontend Next.js, APIs leves, ISR/SSG

#### Hetzner VPS
- **Preço:** EUR 3.49-17.99/mês (2-8GB RAM)
- **Controle:** Total. Instala o que quiser
- **Gotcha:** Você é o DevOps. Segurança, updates, backups = sua responsabilidade
- **Melhor pra:** Bots 24/7, apps que precisam de muita RAM barata, stacks Docker completas

#### Netlify
- **Preço:** Free (generoso), Pro $19/mês
- **DX:** Bom para sites estáticos, forms, redirects
- **Gotcha:** Functions limitadas, menos poderoso que Vercel para SSR
- **Melhor pra:** Sites estáticos, landing pages, docs

---

## 2. Database — Onde guardar dados

### Árvore de decisão

```
O projeto precisa de Auth + Storage + Realtime embutidos?
├── SIM → Supabase ($25/mês Pro)
│         Postgres + Auth + Storage + Realtime + Edge Functions
│
└── NÃO → Só precisa de Postgres?
    ├── SIM → O projeto já tem Auth próprio (NextAuth, Clerk, etc.)?
    │   ├── SIM → Neon ($19/mês Launch)
    │   │         Postgres puro, branching, serverless, sem lock-in
    │   │
    │   └── NÃO → Supabase (Auth grátis no pacote)
    │
    └── NÃO → Dados não-relacionais (documentos, mobile offline)?
        └── SIM → Firebase (NoSQL + Auth + offline sync)
                  Bom pra mobile. Lock-in pesado.
```

### Comparativo rápido

| | Supabase | Neon | Firebase | Railway PG |
|---|---|---|---|---|
| **Tipo** | Postgres + ecossistema | Postgres serverless | NoSQL (Firestore) | Postgres básico |
| **Free tier** | 500 MB (pausa 7 dias!) | 0.5 GB (não pausa) | Generoso | ~$5 crédito |
| **Pago** | $25/mês | $19/mês | Pay-per-operation | Pay-per-use |
| **Auth** | Incluso (GoTrue) | Não tem | Incluso (o melhor) | Não tem |
| **Storage** | Incluso + CDN | Não tem | Incluso | Não tem |
| **Realtime** | Incluso (WebSocket) | Não tem | Incluso (excelente) | Não tem |
| **Branching** | Não | Sim | Não | Não |
| **Cold start** | Nenhum | 300-500ms | Nenhum | Nenhum |
| **Lock-in** | Médio | Baixo | **Extremo** | Baixo |
| **ORM** | Drizzle/Prisma OK | Drizzle/Prisma OK | Não (SDK próprio) | Drizzle/Prisma OK |
| **SQL** | Completo | Completo | Não existe | Completo |

### Quando usar cada um

| Cenário | Escolha | Por quê |
|---------|---------|---------|
| App full-stack que precisa de Auth + Storage | **Supabase** | Tudo junto, menos serviços pra gerenciar |
| App que já tem NextAuth/Clerk/Auth.js | **Neon** | Auth resolvido, paga só pelo Postgres |
| Side project que precisa estar sempre online | **Neon** | Supabase free pausa, Neon não |
| App mobile com sync offline | **Firebase** | Firestore offline é imbatível |
| App já no Railway e quer simplicidade | **Railway PG** | Tudo no mesmo painel |
| Dados relacionais complexos (JOINs, RLS) | **Supabase** ou **Neon** | Nunca Firebase |
| Budget zero, dados simples | **Neon Free** | 0.5 GB, não pausa, Postgres real |

### Gotchas importantes

- **Supabase Free pausa após 7 dias de inatividade** — péssimo para projetos que precisam estar always-on
- **Neon tem cold start de 300-500ms** — ruim para APIs que precisam de latência consistente (pode desligar scale-to-zero por um custo)
- **Firebase cobra por operação** — um loop mal feito pode gerar conta inesperada
- **Firebase é NoSQL** — não funciona com Drizzle, Prisma, SQL. Mundo completamente diferente
- **Migrar do Firebase é reescrever tudo.** Do Supabase/Neon, é trocar connection string

---

## 3. Cache / Filas — Redis e alternativas

### Árvore de decisão

```
O projeto usa BullMQ / filas de background jobs?
├── SIM → Já usa Railway para hosting?
│   ├── SIM → Railway Redis (nativo, sem config extra)
│   └── NÃO → Upstash via TCP (serverless, mas atenção aos limits)
│
└── NÃO → Precisa de cache simples (session, rate limit)?
    ├── SIM → Upstash (REST API, funciona no edge)
    └── NÃO → Não precisa de Redis
```

### Comparativo

| | Upstash | Railway Redis | Redis Cloud |
|---|---|---|---|
| **Free** | 10K cmds/dia | Dentro dos $5/mês | 30 MB |
| **BullMQ** | Via TCP (connection limits) | Nativo, sem problemas | Nativo |
| **Edge/Serverless** | Sim (REST API) | Não | Não |
| **Melhor pra** | Cache edge, rate limit | BullMQ, filas | Redis modules |

### Regra de ouro

> **Se usa BullMQ → Railway Redis.** BullMQ abre múltiplas conexões TCP e precisa de Redis nativo. Upstash funciona, mas os limites de conexão apertam rápido.

---

## 4. Auth — Autenticação

### Árvore de decisão

```
Já escolheu Supabase como DB?
├── SIM → Supabase Auth (já vem incluso, zero config extra)
│
└── NÃO → Precisa de OAuth social (Google, GitHub, etc.)?
    ├── SIM → NextAuth.js / Auth.js (open source, flexível)
    │         Ou Clerk ($25/mês, DX premium, mais caro)
    │
    └── NÃO → Auth simples (email/senha)?
        └── NextAuth.js (grátis, funciona com qualquer DB)
```

### Regra de ouro

> **Supabase Auth se já usa Supabase. NextAuth.js se usa Neon/Railway PG.** Nunca montar auth do zero.

---

## 5. Storage — Arquivos e mídia

### Árvore de decisão

```
Já escolheu Supabase como DB?
├── SIM → Supabase Storage (incluso, CDN, image transforms)
│
└── NÃO → Volume de arquivos?
    ├── PEQUENO (< 5 GB) → Cloudflare R2 (free tier 10 GB, sem egress)
    ├── MÉDIO → Cloudflare R2 ou S3
    └── GRANDE (vídeos, backups) → AWS S3 ou Cloudflare R2
```

---

## 6. AI / LLM — Quando usar cada provider

### Árvore de decisão

```
Qual é o tipo de task?
├── Buscar/formatar/classificar (simples) → Groq (rápido + barato)
├── Gerar conteúdo/copy/análise → Gemini Flash ou GPT-4o-mini
├── Código com lógica complexa → Claude Sonnet ou GPT-4o
├── Arquitetura/decisão de alto impacto → Claude Opus
└── Precisa de múltiplos providers? → OpenRouter (gateway)
```

### Comparativo

| Provider | Melhor pra | Preço relativo | Latência |
|----------|-----------|----------------|----------|
| **Groq** | Inferência rápida, classificação | Muito barato | Ultra-baixa |
| **Gemini Flash** | Tarefas gerais, contexto grande | Barato | Baixa |
| **GPT-4o-mini** | Tarefas gerais, bom equilíbrio | Barato | Média |
| **GPT-4o** | Código, análise complexa | Médio | Média |
| **Claude Sonnet** | Código, análise, criatividade | Médio | Média |
| **Claude Opus** | Decisões críticas, arquitetura | Caro | Alta |
| **OpenRouter** | Gateway multi-provider, fallback | Varia | Varia (+overhead) |

### Regra de ouro

> **Use o mais barato que resolve.** Escale pra cima só quando a qualidade não for suficiente.
> Nunca use Opus/GPT-4o pra tarefas que Groq ou Gemini Flash resolvem.

---

## 7. Templates de Stack Prontos

### Template A: "Full-Stack com Workers" (LeadHunter, toki-bot)

```
Hosting:  Railway (app + workers via Procfile)
DB:       Neon (Postgres puro, projeto já tem NextAuth)
Redis:    Railway Redis (BullMQ nativo)
Auth:     NextAuth.js (no app)
Storage:  Cloudflare R2 (se precisar)
DNS:      Cloudflare
CI/CD:    GitHub Actions
Monitor:  Sentry
Custo:    ~$25-40/mês
```

### Template B: "App Completo sem Workers" (SaaS, dashboards)

```
Hosting:  Vercel (Next.js)
DB:       Supabase (Postgres + Auth + Storage + Realtime)
Redis:    Upstash (cache/rate limit, se precisar)
Auth:     Supabase Auth (incluso)
Storage:  Supabase Storage (incluso)
DNS:      Cloudflare
CI/CD:    Vercel (automático)
Monitor:  Sentry
Custo:    ~$25-45/mês
```

### Template C: "MVP / Side Project" (budget zero)

```
Hosting:  Vercel Free
DB:       Neon Free (0.5 GB, não pausa)
Redis:    Não usa (ou Upstash free)
Auth:     NextAuth.js (grátis)
Storage:  Cloudflare R2 Free (10 GB)
DNS:      Cloudflare Free
CI/CD:    GitHub Actions Free
Monitor:  Sentry Free
Custo:    $0/mês
```

### Template D: "Bot / Serviço 24/7" (telegram, whatsapp)

```
Hosting:  Hetzner VPS (EUR 3.49-7.99/mês) + PM2
DB:       PostgreSQL no VPS (ou Neon se quiser managed)
Redis:    Redis no VPS
Auth:     N/A (bot não tem UI)
Storage:  VPS local
DNS:      Cloudflare
CI/CD:    GitHub Actions + rsync
Monitor:  PM2 + Sentry
Custo:    EUR 4-8/mês
```

### Template E: "Site / Landing Page"

```
Hosting:  Vercel ou Netlify (Free)
DB:       Não precisa
Redis:    Não precisa
Auth:     Não precisa
Storage:  Não precisa
DNS:      Cloudflare
Custo:    $0/mês
```

---

## 8. Checklist — Antes de Escolher

Antes de definir a stack de um projeto novo, responda:

- [ ] O projeto tem background workers / jobs / cron? → Railway
- [ ] O projeto precisa de Auth + Storage embutidos? → Supabase
- [ ] O projeto já tem Auth próprio (NextAuth, Clerk)? → Neon
- [ ] O projeto usa BullMQ? → Railway Redis (não Upstash)
- [ ] O projeto precisa estar always-on (bot, cron)? → Hetzner VPS ou Railway
- [ ] O projeto é frontend puro / SSR? → Vercel
- [ ] O projeto tem budget zero? → Template C
- [ ] O projeto precisa de Playwright em produção? → Railway (Docker)
- [ ] O projeto é mobile com offline sync? → Firebase (exceção)

---

## 9. Serviços Auxiliares

| Serviço | Pra quê | Quando usar |
|---------|---------|-------------|
| **ngrok** | Tunnel para dev local | Testar webhooks, compartilhar dev server |
| **Apify** | Web scraping managed | Quando Playwright local não basta (anti-bot pesado) |
| **Cloudflare** | DNS + CDN + R2 Storage | Sempre (free, rápido, protege) |
| **Sentry** | Error tracking | Sempre em produção (free tier: 5K events/mês) |
| **GitHub Actions** | CI/CD | Sempre (free pra repos públicos, 2K min/mês private) |

---

## 10. Serviços que Ainda Não Tenho (mas vale considerar)

Lacunas na stack atual e o que preencheria cada uma:

### Auth standalone (quando não usar Supabase Auth)
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Clerk** | Free até 10K MAU, $25/mês Pro | DX premium, componentes prontos, RBAC, multi-tenant. Melhor Auth-as-a-Service do mercado. Se Auth é core do produto, Clerk > NextAuth |
| **Auth0** | Free até 7.5K MAU, $23/mês | Enterprise-grade, compliance (SOC2, HIPAA). Bom se precisar de SAML/SSO pra clientes enterprise |
| **Lucia** | Grátis (open source) | Lightweight, session-based, zero vendor lock-in. Alternativa ao NextAuth pra quem quer mais controle |

### Storage de arquivos (quando não usar Supabase Storage)
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Cloudflare R2** | Free 10 GB + 10M reads/mês, sem egress | **Zero egress fees** — isso é game-changer. S3-compatible. Melhor custo-benefício pra storage |
| **AWS S3** | Pay-per-use (~$0.023/GB) | O padrão da indústria. Ecossistema enorme. Mas cobra egress |
| **Uploadthing** | Free 2 GB, $10/mês | SDK pra Next.js, upload direto do client. DX excelente pra upload de arquivos em apps |

### Email transacional (quando o app precisa enviar emails)
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Resend** | Free 100 emails/dia, $20/mês | DX moderna, SDK React Email, feito pelo criador do Next.js. O melhor pra devs |
| **Postmark** | Free 100/mês, $15/mês | Melhor deliverability do mercado. Se email é crítico (transações, faturas) |
| **SendGrid** | Free 100/dia | Mais popular, mas DX pior. Bom pra volume alto |

### Cron / Scheduling (quando não tem Railway workers)
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Trigger.dev** | Free 500 runs/mês, $29/mês | Background jobs serverless com DX TypeScript. Alternativa ao BullMQ sem precisar de Redis |
| **Inngest** | Free 25K events/mês | Event-driven functions. Bom pra workflows complexos (retry, fan-out, scheduling) |
| **QStash (Upstash)** | Incluso no Upstash | Message queue HTTP. Bom pra cron serverless simples |

### Monitoring / Observability
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Sentry** | Free 5K events/mês | Já mencionado. Error tracking essencial |
| **BetterStack (Logtail)** | Free 1 GB/mês | Logs bonitos, alertas, uptime monitoring. Substitui ELK stack |
| **Axiom** | Free 500 MB/mês | Logs + traces + dashboards. Integração nativa com Vercel e Next.js |

### Feature Flags / A-B Testing
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **PostHog** | Free 1M events/mês | Analytics + feature flags + session replay + A/B testing. Tudo-em-um, open source |
| **LaunchDarkly** | Free até 1K MAU | Feature flags enterprise. Bom se precisar de releases graduais |

### Busca / Full-text Search
| Serviço | Preço | Por quê considerar |
|---------|-------|-------------------|
| **Meilisearch Cloud** | Free 100K docs | Rápido, typo-tolerant, facets. Alternativa ao Algolia mais barata |
| **Typesense Cloud** | $0.01/hr | Open source, rápido. Bom pra e-commerce e catálogos |
| **pg_trgm + tsvector** | Grátis (Postgres nativo) | Se a busca não é o core, Postgres full-text search resolve 80% dos casos |

### Neon (Postgres serverless)
- **Ainda não tem conta.** Vale criar pra projetos que só precisam de Postgres puro
- Free tier: 0.5 GB, 191h compute/mês, não pausa
- $19/mês Launch: 10 GB, branching, autoscaling

### Cloudflare R2 (Storage)
- **Ainda não tem conta.** Vale criar pra qualquer projeto que precise de storage
- Free: 10 GB + 10M reads + **zero egress**
- API S3-compatible — migração fácil

---

## 11. Anti-padrões — O que NÃO fazer

| Anti-padrão | Por quê |
|---|---|
| Usar Firebase pra dados relacionais | Firestore não tem SQL, JOINs, migrations |
| Usar Vercel pra workers/Playwright | Serverless tem timeout, não roda binários |
| Usar Upstash REST pra BullMQ | BullMQ precisa de TCP Redis nativo |
| Usar Supabase Free pra projeto always-on | Pausa após 7 dias de inatividade |
| Usar Hetzner sem experiência DevOps | Segurança e manutenção são por sua conta |
| Usar Railway PG como DB principal | Básico demais, sem branching/PITR/pooler decente |
| Misturar Neon + Supabase no mesmo projeto | Dois provedores de Postgres = confusão |
| Usar Opus/GPT-4o pra tarefas simples | Dinheiro jogado fora |
