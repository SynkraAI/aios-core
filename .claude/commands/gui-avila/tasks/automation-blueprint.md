---
task: Automation Blueprint
responsavel: gui-avila
model: sonnet
elicit: true
sla:
  target: 25-35 min
  max: 45 min
  description: "Design completo de sistema de automação — requer mapeamento detalhado"
Entrada: |
  - business_model: Modelo de negócio (infoproduto, SaaS, serviço, e-commerce)
  - revenue_streams: Fontes de receita atuais e desejadas
  - current_stack: Ferramentas em uso atualmente
  - team_size: Tamanho da equipe
  - pain_points: Gargalos específicos (do *automation-diagnostic ou descrição livre)
  - budget: Faixa de investimento mensal em ferramentas
Saida: |
  - system_map: Diagrama completo do sistema (tipo Whimsical)
  - tool_stack: Stack de ferramentas recomendado com custo por ferramenta
  - integration_map: Mapa de integrações (ferramenta A ↔ ferramenta B via Make/n8n)
  - implementation_phases: Fases de implementação (1→10→100)
  - cost_analysis: Custo total vs ROI estimado
veto_conditions:
  input:
    - "Sem modelo de negócio definido → ASK: 'O que você vende e para quem?'"
    - "Sem pain points → REDIRECT: 'Vamos fazer *automation-diagnostic primeiro'"
  process:
    - "Começar pela ferramenta antes do sistema → BLOCK: 'Efeito antes do método. O que quer que aconteça?'"
    - "Stack com >8 ferramentas → WARN: H002 'Simplifica. Cada ferramenta é um ponto de falha'"
    - "Ferramenta sem API → REJECT: 'Ilha isolada. Não integra. Descarta.'"
    - "Propor código custom como primeira opção → REJECT: H005 'SaaS existe, quase sempre'"
  output:
    - "Blueprint sem fases de implementação → BLOCK: 'Sem roadmap = vai virar bagunça'"
    - "Sem custo estimado → BLOCK: 'Decisão sem número é achismo'"
    - "Implementação simultânea de tudo → BLOCK: 'Validar 1 antes de batch. SEMPRE.'"
---

# *automation-blueprint

Desenhar sistema completo de automação de negócio — do mapa mental à implementação.

## When to Use

- Após *automation-diagnostic, quando gargalos estão claros
- Empreendedor quer redesenhar stack inteiro de ferramentas
- Negócio crescendo e processos manuais não escalam
- Migração de stack legado para stack moderno integrado

## Workflow

### Step 1: Definir Efeito Final (Sistemas Reversos)

Aplicar framework core — "Mágicos pensam no EFEITO FINAL antes do MÉTODO":

1. **"O que quer que aconteça?"** — Descrever o cenário ideal
2. **"O que precisa funcionar sem você?"** — Processos autônomos
3. **"O que VOCÊ faz que ninguém mais pode?"** — Zona de genialidade
4. **"O resto?"** — Automatizar ou delegar

### Step 2: Mapear Sistema Completo

Desenhar o sistema em texto (equivalente Whimsical):

```
SISTEMA: [Nome do Negócio]

TRÁFEGO → CAPTURA → NUTRIÇÃO → VENDA → ENTREGA → RETENÇÃO
  │          │         │          │        │          │
  ▼          ▼         ▼          ▼        ▼          ▼
YouTube   Landing   Email seq   VSL/    Ensinio/   Comunidade
Instagram  Page    + WhatsApp   Call    Serviço    + Follow-up
Ads       Tally     ManyChat   CRM       IA       Automação
```

Para cada etapa:
- Input: O que entra?
- Process: O que acontece?
- Output: O que sai?
- Tool: Qual ferramenta resolve?
- Manual vs Auto: Quanto é manual?

### Step 3: Identificar Gargalos

Para cada etapa do sistema:
- [ ] Funciona automaticamente?
- [ ] Tem métricas visíveis?
- [ ] Tem fallback se falhar?
- [ ] Integra com etapa anterior e posterior?

Marcar gargalos com prioridade: URGENTE / IMPORTANTE / NICE-TO-HAVE

### Step 4: Selecionar Ferramentas

Aplicar Decision Pipeline:
1. SaaS nativo resolve? → Usar
2. Precisa integrar? → Make.com ou n8n
3. Precisa IA? → ManyChat + prompt / Ensinio IA
4. Nada resolve? → Terceirizar (NUNCA custom code primeiro)

Stack recomendado por tipo de negócio:

| Tipo | Core | Automação | CRM | Entrega |
|------|------|-----------|-----|---------|
| Infoproduto | Ensinio | Make.com | GHL | Ensinio |
| Serviço | ClickUp | Make.com | GHL | ClickUp |
| SaaS | Custom | n8n | HubSpot | Custom |
| E-commerce | Shopify | Make.com | GHL | Shopify |

### Step 5: Mapa de Integrações

Desenhar conexões entre ferramentas:

```
ManyChat ←→ Make.com ←→ Go High Level
    ↓              ↓           ↓
Instagram     Ensinio      Email/SMS
WhatsApp     ClickUp      Pipeline
```

Para cada integração:
- Trigger: O que dispara?
- Action: O que acontece?
- Tool: Make.com ou nativo?
- Custo: Incluído ou extra?

### Step 6: Fases de Implementação (1→10→100)

```
FASE 1 — QUICK WIN (Semana 1):
Implementar 1 automação de maior impacto.
Validar com dados reais. Medir resultado.

FASE 2 — FUNDAÇÃO (Semanas 2-4):
Conectar ferramentas core (CRM + Automação + Entrega).
Testar fluxo completo com 10 leads reais.

FASE 3 — ESCALA (Mês 2-3):
Ativar todas as automações planejadas.
Refinar com base em dados reais.
Documentar processos para equipe.

FASE 4 — OTIMIZAÇÃO (Ongoing):
Monitorar métricas semanalmente.
Eliminar pontos de fricção.
Adicionar automações secundárias.
```

## Output Example

```
🗺️ Blueprint de Automação — [Negócio]

Cara, olha só o sistema completo:

EFEITO FINAL:
"Leads chegam, são qualificados automaticamente, compram curso,
recebem conteúdo, e você só entra para mentorias e conteúdo novo."

SISTEMA COMPLETO:
YouTube → Landing (Tally) → Email (ActiveCampaign) → Vendas (GHL)
    ↓                               ↓                      ↓
ManyChat (WhatsApp)         Make.com (integra tudo)    Ensinio (entrega)

STACK RECOMENDADO:
| Ferramenta | Função | Custo/mês |
|------------|--------|-----------|
| ClickUp | Gestão de projetos | Grátis |
| ManyChat Pro | Bot WhatsApp/IG | R$15 |
| Make.com | Automações | R$9 |
| Go High Level | CRM + pipeline | R$97 |
| Ensinio | Escola online | R$149 |
| ActiveCampaign | Email marketing | R$60 |
TOTAL: ~R$330/mês

ROI ESTIMADO:
- Tempo economizado: 15h/semana = R$6.000/mês
- Vendas automatizadas: +30% conversão
- Payback: <2 semanas

IMPLEMENTAÇÃO:
Fase 1 (Semana 1): ManyChat + 1 fluxo WhatsApp
Fase 2 (Semanas 2-4): Make.com + GHL + pipeline completo
Fase 3 (Mês 2): Ensinio + funil de curso
Fase 4 (Mês 3+): Otimizar + escalar

Bora lá? Por qual fase quer começar? 😊
```

## Inline Checklist

- [ ] Efeito final definido (cenário ideal descrito)
- [ ] Sistema mapeado ponta-a-ponta (tráfego → retenção)
- [ ] Gargalos identificados e priorizados
- [ ] Stack de ferramentas com custo individual
- [ ] Integrações mapeadas (ferramenta ↔ ferramenta)
- [ ] Fases de implementação definidas (1→10→100)
- [ ] Custo total vs ROI calculado
- [ ] Fase 1 é implementável em 1 semana
- [ ] Nenhuma ferramenta é "ilha isolada" (todas integram)

## Related

- **Agent:** gui-avila (T0)
- **Prerequisite:** automation-diagnostic (recomendado antes)
- **Next Tasks:** clickup-setup, chatbot-setup, ensinio-setup
- **Checklist:** automation-quality-checklist.md
