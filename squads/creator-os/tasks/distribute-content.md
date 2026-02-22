# Task: Distribute Content

**Task ID:** distribute-content
**Type:** Autonomous
**Agent:** Sahil Bloom
**Squad:** Creator OS

---

## Purpose

Criar plano de distribuicao completo para conteudo criado: repurposing em multiplos formatos, calendario de publicacao, growth actions e metricas.

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Content pieces | Nicolas Cole (from pipeline) | Yes |
| Canal target | User or pipeline config | No (default: all) |
| Audience data | Previous metrics | No |
| Creator profile | Genius Zone Blueprint | No |

## Process

### Step 1: Analyze Content
Analisar o conteudo recebido:
- Tipo de conteudo (newsletter, post, thread, etc.)
- Canal principal de origem
- Topico e angulo
- Tamanho e formato

### Step 2: Repurpose (Matrix)
Quebrar em multiplos formatos usando o Repurposing Matrix:
```
1 Peca Longa (ex: Newsletter 1000 palavras)
├── 3 Posts LinkedIn (insights isolados)
├── 1 Thread Twitter (versao sequencial)
├── 1 Carrossel Instagram (versao visual)
├── 5 Stories (micro-insights)
└── 1 Short-form video script (1 min highlight)
```

### Step 3: Schedule (Distribution Calendar)
Criar calendario de publicacao otimizado:
```yaml
segunda: "Short insight post (LinkedIn + Twitter)"
terca: "Carrossel ou visual (Instagram + LinkedIn)"
quarta: "Newsletter deep dive (Email) + excerpt post"
quinta: "Thread (Twitter) + storytelling post (LinkedIn)"
sexta: "Friday Five curadoria (Newsletter + post)"
sabado: "Week-in-review (Newsletter)"
domingo: "Batch create conteudo da proxima semana"
```

Horarios otimos:
- LinkedIn: 7-9h e 17-19h
- Twitter: 12-14h
- Newsletter: Terca ou Quarta 8h
- Instagram: 18-20h

### Step 4: Amplify (Growth Actions)
Estrategias de crescimento ativas:
1. Cross-promotion com newsletters similares
2. Engajamento estrategico (comentar em 10 posts relevantes/dia)
3. Referral program (subscribers trazem subscribers)
4. Guest appearances (podcasts, lives, collabs)
5. SEO evergreen (artigos que trazem traffic organico)

### Step 5: Define Metrics
Metricas a acompanhar por canal:
- Newsletter: Open rate, click rate, growth rate
- LinkedIn: Impressoes, engagement rate, followers growth
- Twitter: Impressoes, retweets, followers
- Instagram: Reach, saves, shares

## Output

```yaml
distribution_plan:
  conteudo_original: "{descricao do conteudo}"
  repurposed:
    - formato: "{formato}"
      conteudo: "{resumo ou conteudo adaptado}"
      canal: "{canal}"
      horario: "{dia + hora}"
    # ... repeat for each piece
  calendar:
    semana_1: "{schedule dia a dia}"
    semana_2: "{schedule dia a dia}"
  growth_actions:
    - action: "{acao}"
      frequencia: "{diaria/semanal}"
      meta: "{resultado esperado}"
  metricas:
    - metrica: "{nome}"
      canal: "{canal}"
      target: "{meta numerica}"
      frequencia_medicao: "{diaria/semanal}"
  content_loops:
    - "{conteudo A → feedback → conteudo B → engagement → conteudo C}"
```

## Quality Gate

- Minimo 3 formatos repurposed por peca original
- Calendario cobre 7 dias com pelo menos 5 publicacoes
- Growth actions sao concretas (nao vagas)
- Metricas tem targets numericos
- Content loops identificados para manter momentum

## Dependencies

- Content pieces (from Nicolas Cole or direct input)
- Creator profile (for voice and channel calibration)
- Previous performance data (optional, for optimization)
