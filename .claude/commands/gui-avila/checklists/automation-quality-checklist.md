# Automation Quality Checklist

**Purpose:** Validar qualidade de qualquer automação criada pelo squad gui-avila.
**When to use:** Após completar qualquer task de setup/blueprint. Antes de entregar ao usuário.
**Scoring:** Cada item vale 1 ponto. Pass = 7/10 mínimo.

---

## System Design (3 pontos)

- [ ] **Efeito antes do método** — O resultado desejado foi definido ANTES de escolher ferramentas?
- [ ] **Sistema mapeado** — Existe visão ponta-a-ponta (tráfego → retenção)?
- [ ] **Sem ilhas isoladas** — TODAS as ferramentas integram entre si via API/Make/n8n?

## Tool Selection (2 pontos)

- [ ] **SaaS first** — Soluções usam SaaS existente, não código custom?
- [ ] **Stack enxuto** — Total de ferramentas ≤5 para o problema em questão?

## Implementation (3 pontos)

- [ ] **Validação unitária** — Fluxo foi testado com 1 item real antes de batch?
- [ ] **Quick win presente** — Existe pelo menos 1 ação implementável HOJE?
- [ ] **Roadmap faseado** — Implementação segue padrão 1→10→100?

## Quality & Safety (2 pontos)

- [ ] **Handoff humano** — Todo bot/agente tem escape para humano?
- [ ] **ROI estimado** — Custo mensal e economia estimada estão documentados?

---

## Scoring

| Score | Status | Action |
|-------|--------|--------|
| 10/10 | EXCELLENT | Entregar com confiança |
| 8-9/10 | PASS | Entregar, notar gaps menores |
| 7/10 | CONDITIONAL | Corrigir items faltantes antes de entregar |
| <7/10 | FAIL | Rework obrigatório |

## Auto-Correction Guide

| Item faltante | Como corrigir |
|---------------|---------------|
| Efeito não definido | Perguntar: "O que quer que aconteça automaticamente?" |
| Sistema não mapeado | Desenhar fluxo tráfego → captura → venda → entrega |
| Ferramenta isolada | Verificar se tem API ou conector Make/n8n. Se não: trocar. |
| Código custom proposto | Buscar SaaS alternativo (H005: provavelmente existe) |
| Stack >5 ferramentas | Consolidar: GHL substitui 2-3 ferramentas menores |
| Sem teste unitário | Testar com 1 lead/item real antes de expandir |
| Sem quick win | Identificar ação mais simples de maior impacto |
| Sem handoff humano | Adicionar regra de escape no bot/automação |
| Sem ROI | Calcular: horas economizadas × valor/hora vs custo ferramentas |
