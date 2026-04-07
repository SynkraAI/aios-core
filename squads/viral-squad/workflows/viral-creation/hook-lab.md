# 🧪 Hook Testing Lab — Workflow de A/B Testing Científico

## Objetivo

Encontrar o hook perfeito via testing científico. Em vez de adivinhar qual hook funciona melhor, testar com dados reais e declarar um vencedor estatisticamente significativo.

## Quando Usar

- Antes de investir em produção completa de um vídeo
- Quando tem múltiplas ideias de hook e não sabe qual escolher
- Para construir database de hooks validados por dados
- Quando quer otimizar retenção @3s de forma sistemática

## Agentes

- 🎣 **@hook-master** (líder) — geração e curadoria de hooks
- 🧪 **@ab-test-master** — design experimental e significância estatística
- 💥 **@visual-impact** — execução visual de cada variante
- 📈 **@metrics-guru** — análise de resultados e declaração de vencedor
- 🏗️ **@remotion-architect** — implementação técnica das variantes

## Workflow com Debate

### FASE 1: GERAÇÃO DE VARIANTES (1 dia)

**1.1 Brainstorm de Hooks**

```
@hook-master: *create-hooks [10 variações]

Input:
  Tema: "5 erros comuns na dieta"
  Audiência: Homens 25-40, fitness intermediário
  Objetivo: Educate + Save

Output:
HOOK CANDIDATES (Ranked by Predicted Performance)

1. Pattern Interrupt (Score: 95)
   "Você está comendo proteína ERRADO"
   Visual: Comida sendo jogada fora (dramatic)

2. Curiosity Gap (Score: 92)
   "Nutricionistas odeiam quando eu falo isso..."
   Visual: Pessoa sussurrando (intimate)

3. Number Shock (Score: 90)
   "90% das pessoas fazem isso e NÃO emagrecem"
   Visual: Bold stat on screen

4. Bold Claim (Score: 88)
   "Proteína não faz diferença. Sério."
   Visual: Contradiction visual (shaker → trash)

5. Before/After (Score: 85)
   "30 dias sem [X]. O resultado me assustou."
   Visual: Split screen transformation

6-10. [Variantes adicionais...]
```

**1.2 Seleção para Teste**

```
DEBATE — Selecionar Top 3:

@hook-master: "Top 3 por score: #1, #2, #3"
@ab-test-master: "Preciso de variantes DIVERSAS para teste válido.
  #1 (Pattern Interrupt) vs #3 (Number Shock) vs #5 (Before/After)
  Isso testa 3 TIPOS diferentes, não 3 variações do mesmo tipo"
@viral: "Concordo. Se testarmos 3 curiosity gaps, só sabemos qual gap funciona"
@metrics-guru: "Com 3 variantes diversas, o vencedor indica direção estratégica"

CONSENSO: ✅ Testar hooks #1, #3, #5 (3 tipos distintos)
```

---

### FASE 2: DESIGN EXPERIMENTAL (2h)

```
@ab-test-master: *ab-test-design

EXPERIMENTAL DESIGN
━━━━━━━━━━━━━━━━━━

Variáveis:
  Independente: Hook (3 variantes)
  Dependente: Retention @3s, Watch-through, Saves, Shares
  Controladas: Mesmo conteúdo pós-hook, mesmo horário, mesmas hashtags

Variantes:
  A: Pattern Interrupt — "Você está comendo proteína ERRADO"
  B: Number Shock — "90% das pessoas fazem isso e NÃO emagrecem"
  C: Before/After — "30 dias sem [X]. O resultado me assustou."

Condições:
  - Mesmo script a partir do segundo 3
  - Mesma duração total (45-55s)
  - Mesmo áudio de fundo
  - Mesma thumbnail style (high contrast, same layout)
  - Post em dias diferentes, mesmo horário (±30min)
  - Mesmas hashtags (top 5 do nicho)

Sample Size:
  Mínimo: 1000 impressões por variante
  Ideal: 5000+ para significância estatística (p < 0.05)

Timeline:
  Post A: Segunda 18h
  Post B: Quarta 18h
  Post C: Sexta 18h
  Análise: Segunda seguinte
```

---

### FASE 3: IMPLEMENTAÇÃO (2 dias)

**3.1 Produção das Variantes**

```
@art-director: *fast-visual [3 variantes, mesmo template base]

Para cada variante:
  @visual-impact: Design do hook visual específico (primeiros 3s)
  @remotion-architect: Implementar composição
    - Primeiros 3s: DIFERENTES (hook específico)
    - 3s em diante: IDÊNTICO (mesmo conteúdo)
  @render-master: Render das 3 versões

QUALITY GATE (obrigatório):
  - [ ] Conteúdo pós-hook idêntico nas 3 versões
  - [ ] Duração total igual (±2s)
  - [ ] Áudio de fundo idêntico
  - [ ] DS compliance em todas
  - [ ] 60fps em todas
```

**3.2 Preparação de Captions**

```
@copy-wizard: Caption para cada variante

Regra: Captions devem ter o MESMO formato
  - Mesmo comprimento (±10 palavras)
  - Mesmo CTA
  - Mesmas hashtags
  - Única diferença: hook textual alinhado com o visual

Variante A: "Você tá comendo proteína errado. Sério. [restante idêntico]"
Variante B: "90% das pessoas fazem isso na dieta. E não emagrecem. [restante idêntico]"
Variante C: "30 dias sem [X]. O que aconteceu me assustou. [restante idêntico]"
```

---

### FASE 4: TESTE EM CAMPO (3-5 dias)

```
@ab-test-master: *ab-test-execute

PROTOCOLO DE PUBLICAÇÃO:

Dia 1 (Segunda 18h): Publicar Variante A
  - @engagement-engineer: Engagement normal (reply comments, story share)
  - NÃO fazer boost pago
  - Documentar: impressões, reach, engagement nas primeiras 2h

Dia 3 (Quarta 18h): Publicar Variante B
  - Mesmo protocolo de engagement
  - Mesmo nível de esforço pós-publicação

Dia 5 (Sexta 18h): Publicar Variante C
  - Mesmo protocolo

REGRAS DO TESTE:
  ❌ NÃO impulsionar nenhum post (paid = variável não controlada)
  ❌ NÃO mudar hashtags entre variantes
  ❌ NÃO postar outros conteúdos entre as variantes (contamina)
  ✅ Manter mesmo nível de engagement pós-publicação
  ✅ Documentar qualquer anomalia (algoritmo instável, evento externo)
```

---

### FASE 5: ANÁLISE DE RESULTADOS (1 dia)

```
@metrics-guru: *ab-test-analysis

RESULTS REPORT
━━━━━━━━━━━━━━

            | Variante A     | Variante B     | Variante C
            | Pat. Interrupt | Number Shock   | Before/After
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Impressões  | 8,200          | 7,800          | 9,100
Ret. @3s    | 82%            | 71%            | 78%
Watch-thru  | 45%            | 38%            | 52%
Saves       | 9.2%           | 6.1%           | 11.3%
Shares      | 4.1%           | 3.2%           | 5.8%
Comments    | 180            | 95             | 210

STATISTICAL ANALYSIS:
  A vs B: p = 0.003 (significativo) → A > B
  A vs C: p = 0.041 (significativo) → C > A em saves/shares
  B vs C: p = 0.001 (significativo) → C > B

WINNER: Variante C (Before/After)
  - Maior watch-through (52%)
  - Maior save rate (11.3%)
  - Maior share rate (5.8%)
  - Mais comments (210)

INSIGHT: Before/After gera mais saves e shares porque tem
  prova social visual. Pattern Interrupt é melhor para
  retenção @3s mas perde no final. Number Shock é o mais
  fraco neste nicho.

DEBATE:
@metrics-guru: "C venceu em métricas que importam: saves e shares"
@hook-master: "A teve melhor retenção @3s (82%). Combine A hook + C structure?"
@viral: "Insight valioso: Before/After > Pattern Interrupt para fitness"
@ab-test-master: "Resultado estatisticamente significativo. Confiança alta."

CONSENSO: ✅ Hook vencedor: Before/After
  Action: Usar Before/After como hook padrão para conteúdo fitness
  Follow-up: Testar variações de Before/After (split screen vs timeline)
```

---

## Database de Resultados

Cada teste alimenta o knowledge base:

```yaml
# Adicionar a data/hook-test-results.yaml
test_001:
  date: 2026-04-07
  niche: fitness
  audience: homens_25_40
  winner: before_after
  loser: number_shock
  insight: "Before/After > Pattern Interrupt para saves em fitness"
  confidence: p_0.041
```

## Checklist Pré-Teste

- [ ] 3+ variantes com tipos DIFERENTES de hook
- [ ] Design experimental documentado (variáveis controladas)
- [ ] Conteúdo pós-hook IDÊNTICO em todas as variantes
- [ ] Captions com mesmo formato
- [ ] Protocolo de publicação definido (horários, espaçamento)
- [ ] Sample size mínimo definido
- [ ] Critério de vitória definido antes do teste

**Tempo Total: 1 semana**
**Output:** Hook validado por dados + insight para database
