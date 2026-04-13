# Forge Advisor — Smart Tech Decisions

> Decisões técnicas baseadas em evidências, não em achismo.

---

## 1. Gather Evidence

Before Phase 0 presents tech decision questions, gather all available evidence.

### Step 1: Load learnings

Read `.aiox/memory/forge/learnings.yaml` (if exists):
- Filter entries where `category == "tech_decision"`
- Filter by current project path (prioritize same-project learnings)
- Also include cross-project learnings if technology is the same

Build a tech evidence map:

```yaml
evidence:
  nextjs:
    runs_used: 5
    success_rate: "90%"
    notes: "Works well for SaaS. App Router caused issues with dynamic routes in 1 run."
    last_used: "2026-03-20"
    
  prisma:
    runs_used: 3
    success_rate: "67%"
    notes: "Migration failures with circular refs. User overrode to Drizzle in last run."
    user_preference: "drizzle"
    
  supabase:
    runs_used: 4
    success_rate: "100%"
    notes: "Auth and DB work well together. RLS setup smooth."
```

### Step 2: Read project context

Check for existing tech decisions in project memory:
- HYBRID: `{cwd}/.aiox/memory/project-context.md` → "Stack Técnica" section
- CENTRALIZED: `docs/projects/{name}/memory/project-context.md`

If found: these are **established decisions** that should be respected unless the user explicitly wants to change them.

### Step 3: Build advisor briefing

Combine learnings + project context into a concise briefing that will be injected into Phase 0 Step 4:

```
━━━ Forge Advisor — Recomendações Baseadas em Evidência ━━━

📊 Baseado em {N} runs anteriores neste projeto:

  Framework: Next.js (App Router)
    ✅ Usado em 5 runs, 90% sucesso
    ⚠️ Dynamic routes causaram issues em 1 run

  Database: Supabase
    ✅ Usado em 4 runs, 100% sucesso
    ✅ Auth integrado funciona bem

  ORM: Drizzle (mudança recomendada)
    ⚠️ Prisma teve 33% falha rate (migrations)
    ✅ Usuário já preferiu Drizzle no último run

  📝 Nota: Essas recomendações são baseadas em experiência real,
  não em defaults genéricos. Você pode mudar qualquer uma.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Inject into Phase 0

The briefing is available when Phase 0 Step 4 (tech decisions) runs.
The `tech-decisions-guide.md` defaults still apply, but advisor recommendations **take precedence** when backed by data.

Priority order:
1. User's explicit choice (always wins)
2. Advisor recommendation (backed by learnings data)
3. Project context (established decisions)
4. tech-decisions-guide.md defaults (static fallback)

---

## 2. Validate Recommendations

When the user wants to understand a tech decision deeper.

### Trigger

This fires at the Phase 0 checkpoint when the user selects an option to learn more about a technology choice, or asks "por que {tech}?".

### Step 1: WebSearch for current data

Use WebSearch (max 3 queries) to find:
- Current stability status of the technology
- Performance benchmarks vs alternatives
- Community size and recent activity
- Known issues or breaking changes in latest version

Example queries:
- "Next.js 15 App Router stability 2026"
- "Drizzle vs Prisma performance comparison 2026"
- "Supabase Auth reliability issues"

### Step 2: Cross-reference with learnings

Compare WebSearch findings with learnings data:
- If web data confirms learnings: "Dados de mercado confirmam nossa experiência"
- If web data contradicts learnings: "⚠️ Dados recentes mostram {change} — vale reconsiderar"
- If no learnings exist: use only web data + defaults

### Step 3: Present evidence

```
━━━ Advisor — Análise Detalhada: {technology} ━━━

  📊 Nossa experiência:
    Usado em {N} runs | Sucesso: {rate}% | Último uso: {date}
    {notes from learnings}

  🌐 Dados de mercado (abril 2026):
    {web search findings — 2-3 bullet points}

  💡 Recomendação:
    {recommendation with reasoning}

  Quer manter {current} ou mudar para {alternative}?
  > 1. Manter {current}
  > 2. Mudar para {alternative}
  > 3. Ver outra opção
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### What NOT to do

- Do NOT run WebSearch on every tech decision — only when the user asks
- Do NOT override user's explicit choice with advisor recommendation
- Do NOT present more than 3 alternatives for any single technology
- Do NOT use WebSearch if `config.use_web_search` is false
