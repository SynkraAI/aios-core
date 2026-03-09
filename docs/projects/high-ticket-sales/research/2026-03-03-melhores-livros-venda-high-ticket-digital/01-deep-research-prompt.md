# Deep Research Prompt

## Sub-Queries Geradas (Phase 2: Decompose)

### Wave 1 (5 workers paralelos)

| # | Sub-Query | Angulo |
|---|-----------|--------|
| 1 | "best books high ticket selling digital products coaching consulting 2025 2026" | Livros gerais de vendas high-ticket |
| 2 | "best books premium pricing strategy online courses info products high ticket offers" | Pricing e estrategia de precificacao premium |
| 3 | "Alex Hormozi $100M Offers OR Russell Brunson Expert Secrets OR Dan Kennedy high ticket selling" | Autores iconicos (Hormozi, Brunson, Kennedy) |
| 4 | "best books selling online courses coaching programs six figures digital entrepreneur funnel strategy" | Funis e lancamento de cursos/coaching |
| 5 | "high ticket closing sales books Dan Lok Zig Ziglar Grant Cardone Jordan Belfort" | Tecnicas de closing e persuasao |

### Wave 2 (gap-filling)

| # | Sub-Query | Angulo |
|---|-----------|--------|
| 6 | "Amy Porterfield Two Weeks Notice OR Stu McLaren OR Brendon Burchard Millionaire Messenger OR Todd Herman" | Autores de produtos digitais e memberships |

## Estrategia de Busca

- **Workers:** 6 Haiku agents (general-purpose)
- **Tools:** WebSearch + WebFetch (deep read)
- **Max deep reads por worker:** 3
- **Waves:** 2 (initial + gap-filling)
- **Dominio:** products (comparison/ranking)
