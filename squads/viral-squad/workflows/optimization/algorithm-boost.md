# 🤖 Algorithm Boost — Otimização de Entrega pelo Algoritmo

## Objetivo

Diagnosticar e corrigir vídeo que não está sendo distribuído pelo algoritmo do Instagram. O vídeo pode ser bom, mas sinais fracos = entrega limitada.

## Quando Usar

- Vídeo tem qualidade boa mas reach baixo (< 2x followers)
- Engagement rate caiu sem mudança de conteúdo
- Novos posts não estão aparecendo no Explore
- Impressões de "Home" muito maiores que "Explore" (distribuição limitada)

## Agentes

- 🤖 **@algorithm-hacker** (líder) — diagnóstico de sinais e otimização
- 💬 **@engagement-engineer** — triggers de engajamento pós-publicação
- 📈 **@metrics-guru** — análise de métricas e benchmarks
- 🎣 **@hook-master** — otimização de hook se necessário
- ✍️ **@copy-wizard** — otimização de caption/hashtags

## Como o Algoritmo Decide

```
RANKING SIGNALS (ordem de importância):

1. WATCH TIME (peso: 35%)
   - Retention @3s: Threshold > 75%
   - Watch-through rate: Threshold > 40%
   - Replays: Quanto mais, melhor

2. SAVES (peso: 25%)
   - Save rate: Threshold > 8%
   - O sinal MAIS forte para o algoritmo (2024-2026)
   - Save = "Quero ver de novo" = conteúdo de valor

3. SHARES (peso: 20%)
   - Share rate: Threshold > 3%
   - DM shares contam mais que Story shares
   - Share = distribuição orgânica do algoritmo

4. COMMENTS (peso: 15%)
   - Comment rate: Threshold > 2%
   - Replies do creator aumentam o peso
   - Comments longos > emoji reactions

5. LIKES (peso: 5%)
   - Like é o sinal MAIS FRACO
   - Muitos likes + poucos saves = conteúdo "legal" mas descartável
```

## Workflow com Debate

### FASE 1: DIAGNÓSTICO (2h)

**1.1 Auditoria de Sinais**

```
@algorithm-hacker: *ranking-signals [vídeo]

ALGORITHM AUDIT
━━━━━━━━━━━━━━

Signal          | Atual  | Benchmark | Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Watch @3s       | 62%    | > 75%     | 🔴 CRÍTICO
Watch-through   | 35%    | > 40%     | 🟡 ABAIXO
Saves           | 4.2%   | > 8%     | 🔴 CRÍTICO
Shares          | 2.8%   | > 3%     | 🟡 ABAIXO
Comments        | 3.1%   | > 2%     | 🟢 OK
Likes           | 8.5%   | > 5%     | 🟢 OK

DIAGNÓSTICO:
  Root Cause: Watch @3s baixo → algoritmo não distribui
  Secondary: Save rate baixo → sem sinal de "valor"
  Pattern: Muitos likes mas poucos saves = conteúdo "legal" sem valor prático
```

**1.2 Comparação com Benchmarks**

```
@metrics-guru: *benchmark-compare [últimos 10 posts]

TREND ANALYSIS:
  - Retention @3s: Caindo ↓ (média 68% → 62% em 2 semanas)
  - Save rate: Estável → (4.0-4.5%)
  - Reach: Caindo ↓ (15K → 8K por post)

INSIGHT: Queda começou quando mudou estilo de hook
  Posts antigos (hook forte): Ret @3s = 78%
  Posts recentes (hook fraco): Ret @3s = 62%

DEBATE:
@metrics-guru: "Dados claros: problema é o hook. Retention @3s caiu 16 pontos"
@algorithm-hacker: "Concordo. Hook fraco → watch time baixo → algoritmo não distribui"
@hook-master: "Preciso ver os hooks recentes vs antigos para diagnosticar"

CONSENSO: ✅ Problema principal: Hook. Problema secundário: Save triggers ausentes
```

---

### FASE 2: PRESCRIÇÃO (4h)

**2.1 Fix do Hook**

```
@hook-master: *hook-audit [vídeo atual vs top performers]

HOOK COMPARISON:
  Top performer: "Você está fazendo [X] ERRADO" (Ret @3s: 85%)
    - Pattern Interrupt visual forte
    - Curiosity gap imediato
    - Movimento nos primeiros 0.5s

  Vídeo atual: "Hoje vou falar sobre [X]" (Ret @3s: 62%)
    - Sem pattern interrupt
    - Sem curiosity gap
    - Talking head estático

PRESCRIÇÃO:
  1. Trocar hook para Pattern Interrupt
  2. Adicionar movimento visual nos primeiros 0.5s
  3. Copy com contradiction ou shocking statement
  4. Visual com high contrast (DS compliance)
```

**2.2 Adição de Save Triggers**

```
@engagement-engineer: *save-moments [vídeo atual]

SAVE TRIGGER ANALYSIS:
  Current save moments: 0 (nenhum momento "salva isso")
  
PRESCRIÇÃO — Adicionar 2-3 save triggers:
  1. Checklist visual (0:25): "Anota esses 3 passos"
     → Pessoas salvam checklists para consultar depois
  2. Data point único (0:35): Estatística surpreendente com fonte
     → Pessoas salvam dados para usar em conversas
  3. CTA de save (0:48): "Salva pra não esquecer 📌"
     → CTA direto funciona — as pessoas precisam ser lembradas
```

**2.3 Otimização de Caption**

```
@copy-wizard: *caption-optimize [caption atual]

CAPTION AUDIT:
  Atual: "5 dicas de dieta que mudaram minha vida! #fitness #dieta #saude"
  Problemas:
    - Hook textual fraco (genérico)
    - Muitas hashtags genéricas (competição alta)
    - Sem CTA de engajamento

OTIMIZADO:
  "Você tá fazendo dieta ERRADO. (e eu também fazia)
  
  Dica 3 mudou tudo pra mim. Salva pra não esquecer. 📌
  
  Qual dica te surpreendeu mais? Comenta 👇"
  
  #dietaflexivel #emagrecimentoreal #nutricaoesportiva

Mudanças:
  ✅ Hook textual forte (contradiction)
  ✅ Open loop ("Dica 3" — força assistir)
  ✅ CTA de save explícito
  ✅ CTA de comment (pergunta específica)
  ✅ Hashtags de nicho (menos competição)
```

---

### FASE 3: IMPLEMENTAÇÃO (2-4h)

```
OPÇÃO A: Re-edit do vídeo atual
  @remotion-architect: Re-render com novo hook
  @render-master: Fast render
  Deletar post original → re-publicar (reset de métricas)

OPÇÃO B: Otimização sem re-render
  @copy-wizard: Editar caption (se Instagram permitir)
  @engagement-engineer: Implementar estratégia de engagement
  Manter post original, otimizar distribuição

DEBATE:
@algorithm-hacker: "Se retention @3s é o problema, PRECISA re-render (Opção A)"
@metrics-guru: "Dados confirmam: hook é root cause. Caption alone não resolve"
@viral: "Opção A. Não adianta otimizar caption se ninguém assiste os 3 primeiros segundos"

CONSENSO: ✅ Opção A (re-render com novo hook)
```

---

### FASE 4: LANÇAMENTO OTIMIZADO (2h)

```
@algorithm-hacker: *optimal-launch

LAUNCH PROTOCOL:
  1. Publicar no horário de pico da audiência (Insights → Most Active)
  2. Nos primeiros 30 minutos:
     - @engagement-engineer: Reply ALL comments em < 5 min
     - Share to Story com poll relevante
     - DM 20 seguidores mais engajados com link direto
  3. Primeiras 2 horas:
     - Monitorar engagement velocity
     - Se comments desacelerarem: postar comment próprio com pergunta
     - Cross-post em Story com sticker de pergunta
  4. 24 horas:
     - @metrics-guru: Comparar métricas vs versão anterior
     - Documentar resultado no knowledge base
```

---

### FASE 5: VALIDAÇÃO (24h depois)

```
@metrics-guru: *post-optimization-report

BEFORE vs AFTER
━━━━━━━━━━━━━━━

Signal          | Antes  | Depois | Delta
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Watch @3s       | 62%    | 81%    | +19% ✅
Watch-through   | 35%    | 47%    | +12% ✅
Saves           | 4.2%   | 9.1%   | +4.9% ✅
Shares          | 2.8%   | 4.5%   | +1.7% ✅
Reach           | 8K     | 22K    | +175% ✅

VERDICT: Algorithm Boost SUCCESSFUL
  Root cause (hook) corrigido → distribuição restaurada
```

## Checklist

- [ ] Ranking signals auditados (5 sinais)
- [ ] Root cause identificado com dados
- [ ] Comparação com benchmarks (últimos 10 posts)
- [ ] Prescrição específica por sinal fraco
- [ ] Save triggers adicionados (mín. 2)
- [ ] Caption otimizado (hook + CTA + hashtags nicho)
- [ ] Launch protocol seguido (30min/2h/24h)
- [ ] Métricas before/after documentadas

**Tempo Total: 1 dia**
**Output:** Vídeo otimizado para algoritmo com métricas comprovadas
