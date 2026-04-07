# ⚕️ Retention Surgery — Fix de Baixa Retenção

## Objetivo

Diagnosticar e corrigir vídeo com retenção abaixo do aceitável (< 40% watch-through). Retenção é como um paciente com hemorragia — cada ponto de queda é um "sangramento" de audiência que precisa ser estancado.

## Quando Usar

- Watch-through rate < 40%
- Retention @3s < 75%
- Gráfico de retenção tem "penhascos" (quedas abruptas > 15% em 2s)
- Audiência abandona antes do CTA

## Agentes

- 🧱 **@retention-architect** (líder) — diagnóstico de drop-offs e estrutura de retenção
- 🎣 **@hook-master** — cirurgia nos primeiros 3 segundos
- 📝 **@script-architect** — reestruturação narrativa
- 🎞️ **@motion-master** — correção de pacing visual
- 📈 **@metrics-guru** — análise de gráfico de retenção
- 🔊 **@sound-designer** — correções de áudio/silêncio

## Anatomia da Retenção

```
RETENTION CURVE TÍPICA (vídeo saudável vs doente):

100%|█
    |█▓
 80%|█▓▓         ← Saudável: queda gradual
    |█▓▓▓▓
 60%|█▓▓▓▓▓▓▓
    |█▓▓▓▓▓▓▓▓▓
 40%|█▓▓▓▓▓▓▓▓▓▓▓▓
    |█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 20%|█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    └───────────────────────
     0s   15s   30s   45s  60s

100%|█
    |█
 80%|█
    |█
 60%|█░░░         ← Doente: penhasco nos 3s + platô baixo
    |   ░░
 40%|     ░░░░░
    |         ░░░
 20%|            ░░░░
    └───────────────────────
     0s   15s   30s   45s  60s
```

## Workflow com Debate

### FASE 1: DIAGNÓSTICO (2h)

**1.1 Análise do Gráfico de Retenção**

```
@retention-architect: *retention-deep-dive [vídeo]

RETENTION ANALYSIS
━━━━━━━━━━━━━━━━━━

Overall:
  Retention @3s: 58% (🔴 < 75%)
  Watch-through: 28% (🔴 < 40%)
  Average view duration: 18s de 52s

Drop-off Points (penhascos):
  📍 0-3s: -42% (penhasco CRÍTICO)
     Causa provável: Hook fraco, sem pattern interrupt
  
  📍 12-15s: -18% (penhasco ALTO)
     Causa provável: Setup muito longo, sem open loop
  
  📍 35-38s: -12% (penhasco MÉDIO)
     Causa provável: Transição sem tensão, "vale" narrativo

Retention Peaks (momentos que prendem):
  📈 8-10s: +3% (momento de curiosidade)
  📈 25-28s: +2% (reveal parcial)
```

**1.2 Diagnóstico por Agente Especialista**

```
@hook-master: *hook-diagnosis [primeiros 3s]
  Problema: Talking head sem movimento. Copy genérica.
  Severidade: CRÍTICA (42% perdidos aqui)

@script-architect: *structure-diagnosis [roteiro]
  Problema: Setup de 12s sem open loop. Payoff tardio.
  Severidade: ALTA (18% perdidos entre 12-15s)

@motion-master: *pacing-diagnosis [animações]
  Problema: Transição morta entre seções. 3s de "nada" visual.
  Severidade: MÉDIA (12% perdidos entre 35-38s)

@sound-designer: *audio-diagnosis [áudio]
  Problema: Volume constante, sem variação. Sem audio cues.
  Severidade: MÉDIA (contribui para todos os drop-offs)

DEBATE:
@retention-architect: "3 penhascos identificados. Prioridade: Hook > Setup > Transição"
@hook-master: "42% perdidos nos 3s. Se não consertarmos isso, resto é irrelevante"
@script-architect: "Setup precisa de open loop antes do segundo 10"
@motion-master: "Transição morta é fácil de corrigir: adicionar movimento"
@sound-designer: "Audio cues nos pontos de drop previnem saída instintiva"

CONSENSO: ✅ Cirurgia em 3 pontos, priorizando hook
```

---

### FASE 2: PRESCRIÇÃO (4h)

**2.1 Cirurgia do Hook (Penhasco 1: 0-3s)**

```
@hook-master: *create-hooks [replacement, 5 opções]

Hook Atual: "Hoje eu vou mostrar 5 erros que todo mundo comete..."
  Retention: 58% @3s (perdendo 42% do público)

Hooks Substitutos:
  1. "Você faz ISSO todo dia e está DESTRUINDO seu progresso" (Score: 94)
  2. "Para tudo. Se você faz [X], precisa ouvir isso." (Score: 91)
  3. "90% das pessoas erram isso. E não é o que você pensa." (Score: 89)

PRESCRIÇÃO:
  - Substituir hook por opção #1
  - Adicionar movimento visual nos primeiros 0.5s (zoom rápido)
  - Audio: scratch sound no segundo 0 (pattern interrupt auditivo)
  Target: Retention @3s > 80%
```

**2.2 Cirurgia do Setup (Penhasco 2: 12-15s)**

```
@script-architect: *restructure [seção 3-15s]

Setup Atual (12s sem open loop):
  "Então, quando a gente fala de dieta, existem muitos mitos.
   E hoje eu separei os 5 principais erros que..."
  → 12 segundos de enrolação antes do primeiro valor

Setup Cirúrgico (7s com open loop):
  "Erro número 1 é tão comum que 90% das pessoas aqui fazem.
   Mas o erro 3... esse vai te chocar."
  → Entrega valor imediato + open loop para o erro 3
  → Reduz setup de 12s para 7s
  → Cria expectativa que mantém retenção

PRESCRIÇÃO:
  - Cortar 5s de setup (enrolação)
  - Inserir open loop antes do segundo 10
  - Primeiro valor entregue antes do segundo 8
  Target: Drop-off @12-15s < 8%
```

**2.3 Cirurgia da Transição (Penhasco 3: 35-38s)**

```
@motion-master: *transition-fix [seção 35-38s]

Transição Atual:
  - 3 segundos de "vale" visual (talking head parado)
  - Sem mudança de energia
  - Audiência interpreta como "acabou" e sai

Transição Cirúrgica:
  - Inserir motion graphic de transição (0.5s)
  - Mudança de enquadramento (close-up → medium shot)
  - Audio cue: swoosh + mudança de energia musical
  - Text overlay: "Mas o pior erro é esse 👇"

@sound-designer: *audio-cue [transição]
  - Swoosh transition sound
  - Mudança de BPM no background (+10%)
  - Volume bump sutil (+2dB por 1s)

PRESCRIÇÃO:
  - Substituir 3s mortos por transição dinâmica de 1s
  - Adicionar open loop textual ("o pior erro")
  - Audio cue para reset de atenção
  Target: Drop-off @35-38s < 5%
```

---

### FASE 3: CIRURGIA — IMPLEMENTAÇÃO (1-2 dias)

```
@art-director: *visual-pipeline [retention surgery]

SURGERY PLAN:
  Track A: @hook-master + @visual-impact → Novo hook (3h)
  Track B: @script-architect → Reestruturar seção 3-15s (2h)
  Track C: @motion-master → Nova transição 35-38s (2h)
  Track D: @sound-designer → Audio cues em todos os fix points (2h)

  MERGE: @remotion-architect → Re-implementar composição (3h)
  RENDER: @render-master → Render final (1h)

QUALITY GATE PRÉ-RENDER:
  - [ ] Hook novo tem pattern interrupt visual + auditivo
  - [ ] Setup < 8s com open loop
  - [ ] Transição dinâmica (sem "vale" visual)
  - [ ] Audio cues nos 3 pontos de fix
  - [ ] DS compliance mantido
  - [ ] 60fps mantido
  - [ ] Duração total ±5s do original
```

---

### FASE 4: VALIDAÇÃO (24h depois)

```
@metrics-guru: *retention-comparison [antes vs depois]

RETENTION SURGERY REPORT
━━━━━━━━━━━━━━━━━━━━━━━━

                    | Antes  | Depois | Delta    | Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Retention @3s       | 58%    | 83%    | +25% ✅  | > 80%
Drop @12-15s        | -18%   | -6%    | +12% ✅  | < 8%
Drop @35-38s        | -12%   | -4%    | +8% ✅   | < 5%
Watch-through       | 28%    | 48%    | +20% ✅  | > 40%
Avg view duration   | 18s    | 32s    | +14s ✅  |

VERDICT: Surgery SUCCESSFUL ✅
  Todos os 3 penhascos corrigidos
  Watch-through recuperado para acima do benchmark

LEARNINGS (salvar no knowledge base):
  - Hook: Talking head estático é morte (sempre usar pattern interrupt)
  - Setup: Máximo 8s antes do primeiro valor
  - Transições: NUNCA ter "vale" visual > 1.5s
  - Audio: Cues de transição previnem drop-offs instintivos
```

## Tipos de Penhasco e Tratamento

| Tipo | Causa | Tratamento | Agente |
|------|-------|------------|--------|
| Hook cliff (0-3s) | Hook fraco, sem movement | Pattern interrupt + audio cue | @hook-master |
| Setup cliff (5-15s) | Enrolação, sem open loop | Cortar + open loop | @script-architect |
| Value cliff (15-30s) | Promessa não cumprida | Entregar valor mais cedo | @script-architect |
| Transition cliff | "Vale" visual/narrativo | Motion + audio cue | @motion-master |
| CTA cliff (final) | CTA abrupto | Transição suave para CTA | @engagement-engineer |
| Audio cliff | Silêncio ou monotonia | Variação de energia | @sound-designer |

## Checklist

- [ ] Gráfico de retenção analisado (drop-off points marcados)
- [ ] Diagnóstico por especialista de cada penhasco
- [ ] Prescrição específica por penhasco (com target numérico)
- [ ] Cirurgia implementada (hook, setup, transições)
- [ ] Audio cues adicionados nos pontos de fix
- [ ] Quality gate pré-render aprovado
- [ ] Comparação before/after com métricas reais
- [ ] Learnings documentados no knowledge base

**Tempo Total: 2-3 dias**
**Output:** Vídeo com +20-30% de retenção, penhascos eliminados
