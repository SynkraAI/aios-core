# Task: Trend Sniper — Monitoramento de Trending Topics

**Task ID**: trend-sniper
**Version**: 1.0.0
**Trigger**: Manual (`/trend-sniper`) ou Cron (a cada 30min, 8h-22h BRT)
**Script**: `scripts/trend_sniper.py`
**Owner**: @ideation (consumidor) + @cmo (aprovador)

---

## Objetivo

Detectar trending topics no Twitter/X Brasil que sejam relevantes para o SVA do Jose,
filtrar automaticamente por 3 camadas de keywords, e entregar um brief pronto para
producao rapida (< 2h do alerta ao post publicado).

---

## Uso

### Via Claude Code (manual)
```
/trend-sniper          # Scan agora
/trend-sniper --dry    # Preview sem enviar alertas
/trend-sniper --hist   # Ultimos 10 alertas
```

### Via Script (cron)
```bash
python3 .aiox-core/expansion-packs/marketing-opes/scripts/trend_sniper.py
python3 .aiox-core/expansion-packs/marketing-opes/scripts/trend_sniper.py --dry-run
python3 .aiox-core/expansion-packs/marketing-opes/scripts/trend_sniper.py --history
python3 .aiox-core/expansion-packs/marketing-opes/scripts/trend_sniper.py --force
```

### Via Cron (automatico)
```
*/30 8-21 * * * cd /Users/josecarlosamorim/mmos && python3 .aiox-core/expansion-packs/marketing-opes/scripts/trend_sniper.py >> outputs/hubs/marketing/trends/cron.log 2>&1
```

---

## Pipeline

```
1. COLETA
   → Apify actor (early_kiosk/google-trends-scraper)
   → Google Trends "Trending Now" Brasil (50 trends por scan)
   → Inclui related queries para matching mais rico

2. FILTRO AUTOMATICO (3 layers)
   → Layer 1 (Direto): IA, ChatGPT, automacao, agentes...
   → Layer 2 (Negocio): empreendedor, escalar, demiti, sozinho...
   → Layer 3 (Contraste): curso de IA, agencia, equipe tech...
   → Score = quantas layers matcharam (0-3)

3. CLASSIFICACAO
   → Score 3 (L1+L2+L3): ALERTA MAXIMO → WhatsApp imediato
   → Score 2 (L1+L2): TREND ALERT → WhatsApp + brief
   → Score 2 (L1+L3): CONTRAST ALERT → brief anti-padrao
   → Score 1: LOG (salva para revisao semanal)
   → Score 0: IGNORAR

4. OUTPUT
   → Alert .md salvo em outputs/hubs/marketing/trends/
   → WhatsApp enviado via UazAPI (score >= 2)
   → Big Brother event emitido
   → JSONL log para historico

5. HANDOFF (quando Jose responde GO)
   → @ideation consome brief → gera Big Idea com 3 angulos
   → @cmo valida (Gate 2.5 — Purple Cow >= 4/5)
   → @production executa (post texto simples, NAO carousel)
   → @distribution publica (publish.py → IG + LI)
```

---

## Filtro CMO (3 perguntas obrigatorias)

Antes de qualquer trend virar conteudo, as 3 precisam ser SIM:

| # | Pergunta | Se NAO |
|---|----------|--------|
| 1 | Nosso SVA esta falando sobre isso? | Ignorar |
| 2 | Temos angulo que so o Jose pode dar? | Ignorar |
| 3 | Da pra conectar com "instalar > ensinar"? | Ignorar |

O scoring automatico (layers) e um proxy para essas perguntas.
O filtro humano (Jose via WhatsApp) e a validacao final.

---

## Output Esperado (Alert Brief)

```markdown
## 🟡 TREND ALERT

**Trend:** [titulo do trending]
**Score:** 2/3 — TREND ALERT
**Volume:** 50K tweets
**Detectado:** 2026-02-01 14:30 BRT
**Janela estimada:** ~4-8h

### Keywords Matchadas
- Layer 1 (Direto): chatgpt, ia
- Layer 2 (Negocio): empreendedor

### Angulo Tribal Sugerido
Como Jose RESOLVEU "ChatGPT para empreendedores" com OPES.
Bastidor real, nao teoria. Mostrar organograma de agentes em acao.

### Acao Recomendada
- [ ] Aprovar para producao rapida (< 2h) → post texto simples
- [ ] Salvar para proximo post agendado
- [ ] Ignorar
```

---

## Dependencias

| Componente | Status | Observacao |
|-----------|--------|-----------|
| Apify token | Requerido | Em ~/.config/aios/credentials.yaml |
| UazAPI (WhatsApp) | Requerido | Ja configurado no publish.py |
| Big Brother | Opcional | emit_event.py ja existe |
| Content Map | Referencia | Para angulos tribais e research bank |

---

## Metricas

Rastreado no @metrics semanal:

- **Scans/dia:** Quantas varreduras rodaram
- **Alerts/semana:** Quantos trends passaram score >= 2
- **Hit rate:** % de alerts que viraram post publicado
- **Response time:** Tempo entre alerta e post publicado (meta: < 2h)

---

## Custos

| Item | Custo estimado |
|------|---------------|
| Apify actor (Google Trends BR) | ~$0.04/scan ($0.0008 × 50 trends) |
| 28 scans/dia × 30 dias | ~$35/mes |
| WhatsApp (UazAPI) | Ja incluso no plano |

---

*Trend Sniper Task v1.0.0 — OPES Marketing Arm*
*Estratégia: Sniper, não Surfer*

---

## Veto Conditions

| ID | Condição | Ação |
|----|----------|------|
| VC-trend-01 | Tendência encaminhada para produção com score < 2/3 no filtro automático de layers | HALT — Score 0 ou 1 vai apenas para log semanal; nunca acionar @ideation abaixo de score 2 |
| VC-trend-02 | Handoff para @ideation disparado sem resposta "GO" explícita do José via WhatsApp | HALT — José é o filtro humano final; nenhuma tendência vira conteúdo sem sua aprovação direta |
| VC-trend-03 | Produção iniciada com formato carrossel em vez de post texto simples para conteúdo de tendência | HALT — Regra do pipeline: trends viram post texto simples (resposta rápida); carrossel só para conteúdo planejado |
| VC-trend-04 | Alerta enviado ao José sem Brief completo (trend, score, janela estimada, ângulo tribal sugerido) | HALT — Reprocessar alerta com o template completo antes de enviar via WhatsApp |
| VC-trend-05 | As 3 perguntas obrigatórias do Filtro CMO não foram verificadas antes de acionar produção | HALT — Checar: (1) SVA cobre o tema? (2) José tem ângulo único? (3) Conecta com "instalar > ensinar"? Se qualquer resposta for NÃO, ignorar a tendência |
