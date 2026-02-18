# Task: Trafego Pago Rapido

```yaml
task_id: trafego-pago-rapido
task_name: "Criar Copy para Trafego Pago"
version: 1.0.0
estimated_time: "2-3h"
status: pending
responsible_executor: "@copy-maestro (orquestra clones)"
execution_type: Agent
elicit: true
```

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar Copy para Trafego Pago |
| **status** | `pending` |
| **responsible_executor** | @copy-maestro → delega para clones por fase |
| **execution_type** | `Agent` |
| **input** | Produto/servico, publico-alvo, plataforma de ads, orcamento, pagina de destino |
| **output** | Ads copy (3-5 variacoes), landing page copy, headline bank |
| **action_items** | 6 steps |
| **acceptance_criteria** | 7 criteria |

---

## Overview

Workflow rapido para criar toda a copy de uma campanha de trafego pago: anuncios (Facebook, Google, Instagram) + landing page de conversao. Foco em velocidade sem sacrificar fundacao estrategica.

## Quando Usar

- Campanha de ads nova (cold traffic)
- Relancamento com trafego pago
- Teste de oferta via ads antes de lancamento completo
- Escala de campanha existente com novos angulos

---

## Input

- **Produto/Servico** (obrigatorio): Descricao do que sera vendido
- **Publico-Alvo** (obrigatorio): Quem e o comprador ideal
- **Plataforma** (obrigatorio): Facebook, Google, Instagram, YouTube, TikTok
- **Orcamento Diario** (opcional): Para calibrar agressividade do copy
- **Landing Page Existente** (opcional): URL se ja existe pagina
- **Concorrentes** (opcional): Links de ads/landing pages de concorrentes

## Output

- **Ad Copy Bank**: 3-5 variacoes de anuncio por plataforma
- **Landing Page Copy**: Headline + subheadline + body + CTA
- **Headline Bank**: 10-15 headlines testadas por awareness level
- **Swipe File**: Documento com todos os assets organizados

---

## Action Items

### Step 1: Diagnostico de Awareness
**Clone:** @eugene-schwartz

1. Identificar nivel de consciencia predominante do publico
2. Definir tom e extensao adequados para ads
3. Mapear transicao de awareness: ad → landing page

**Output:** Nivel de awareness definido + recomendacao de abordagem

---

### Step 2: Construcao de Oferta Rapida
**Clone:** @alex-hormozi

1. Aplicar Value Equation ao produto
2. Definir headline offer (oferta em 1 frase)
3. Criar stack de valor simplificado (3-5 itens)
4. Definir garantia e urgencia

**Output:** Oferta estruturada para ads

---

### Step 3: Headline Bank
**Clone:** @eugene-schwartz + @gary-bencivenga

1. Gerar 15-20 headlines por awareness level
2. Criar variacoes: curiosidade, dor, beneficio, prova
3. Selecionar top 5 para teste

**Output:** Headline bank com 15+ opcoes categorizadas

---

### Step 4: Ad Copy (por plataforma)
**Clone:** @john-carlton (direto) + @jon-benson (video)

1. Criar 3-5 variacoes de ad copy (texto)
2. Para video ads: criar script de 30s, 60s, 90s
3. Adaptar formato por plataforma (carrossel, stories, feed)
4. Incluir hooks de abertura variados

**Output:** 3-5 ads por plataforma + scripts de video

---

### Step 5: Landing Page Copy
**Clone:** @gary-halbert (narrativa) ou @clayton-makepeace (emocional)

1. Escrever headline principal + subheadline
2. Criar body copy com prova social e beneficios
3. Bullets de valor (usando output do Step 3)
4. CTA forte + urgencia
5. Garantia visivel

**Output:** Landing page completa

---

### Step 6: Audit e Triggers
**Clone:** @claude-hopkins + Sugarman Triggers

1. Passar checklist Hopkins em todos os assets
2. Injetar 3-5 triggers de Sugarman relevantes
3. Verificar consistencia de mensagem ad → landing page
4. Marcar elementos para teste A/B

**Output:** Relatorio de audit + copy final otimizada

---

## Acceptance Criteria

- [ ] **AC1:** Nivel de awareness diagnosticado e documentado
- [ ] **AC2:** Oferta estruturada com Value Equation aplicada
- [ ] **AC3:** Minimo 10 headlines criadas e categorizadas
- [ ] **AC4:** 3+ variacoes de ad copy por plataforma
- [ ] **AC5:** Landing page copy completa (headline, body, CTA, garantia)
- [ ] **AC6:** Audit Hopkins executado em todos os assets
- [ ] **AC7:** Consistencia de mensagem entre ad e landing page verificada

## Veto Conditions

- **VETO-TPR-1:** Ads criados sem diagnostico de awareness → PARAR, voltar ao Step 1
- **VETO-TPR-2:** Landing page sem oferta estruturada → PARAR, voltar ao Step 2
- **VETO-TPR-3:** Copy generico sem angulo especifico → REESCREVER com clone adequado
- **VETO-TPR-4:** Mensagem do ad inconsistente com landing page → ALINHAR antes de entregar

## Anti-Patterns

- Pular diagnostico de awareness e ir direto para escrever ads
- Usar mesmo copy para todas as plataformas sem adaptar formato
- Criar landing page longa para publico Most Aware (precisa ser curta e direta)
- Ignorar teste A/B — sempre entregar variacoes, nunca versao unica
- Usar jargao tecnico em ads para cold traffic

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Monitoramento de metricas (manual) |
| **Trigger** | Todos os assets aprovados |
| **Executor** | Usuario (upload para plataforma) |

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Squad: copywriting-squad_
