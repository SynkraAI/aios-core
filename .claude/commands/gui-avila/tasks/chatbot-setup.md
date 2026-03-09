---
task: Chatbot Setup
responsavel: gui-avila
model: sonnet
elicit: true
sla:
  target: 20-30 min
  max: 40 min
  description: "Setup de agente IA no WhatsApp/Instagram — requer clareza de FAQ e pitch"
Entrada: |
  - product_service: O que vende (curso, serviço, produto)
  - target_audience: Quem é o cliente ideal
  - faq_list: Perguntas mais frequentes dos leads (mínimo 5)
  - sales_pitch: Pitch de vendas resumido
  - channel: WhatsApp, Instagram ou ambos
Saida: |
  - bot_architecture: Fluxo do agente (trigger → qualificação → FAQ → oferta → handoff)
  - prompt_template: Prompt do agente com persona, FAQ e regras
  - tool_setup_guide: Passo-a-passo de configuração (ManyChat + Go High Level + Make)
  - cost_estimate: Custo mensal das ferramentas + ROI estimado
veto_conditions:
  input:
    - "Sem FAQ definida → ASK: 'Quais são as 5 perguntas que mais recebe dos clientes?'"
    - "Sem pitch de vendas → ASK: 'Se tivesse 30 segundos, como explicaria seu produto?'"
    - "Sem leads chegando → REDIRECT: 'Antes de bot, precisa de tráfego. Resolve isso primeiro.'"
  process:
    - "ManyChat como CRM → CORRECT: 'ManyChat é automação de conversa, não CRM. Use Go High Level pro CRM.'"
    - "Agente fazendo TUDO sem human handoff → WARN: 'Agente qualifica e agenda. Fechamento é seu.'"
    - "Agente IA com taxa de falha >20% → H006: 'Prompt errado. Precisa refinar.'"
  output:
    - "Fluxo sem handoff para humano → BLOCK: 'Todo bot precisa de escape para humano'"
    - "Prompt sem persona definida → BLOCK: 'Agente sem persona = chatbot genérico = lixo'"
    - "Sem métricas de acompanhamento → WARN: 'Como saber se tá funcionando?'"
---

# *chatbot-setup

Criar agente de IA para WhatsApp/Instagram que qualifica leads e automatiza atendimento.

## When to Use

- Empreendedor perde >5h/semana respondendo leads manualmente
- Perguntas repetitivas dominam o atendimento
- Quer escalar atendimento sem contratar equipe
- Já tem tráfego mas não converte por lentidão de resposta

## Workflow

### Step 1: Elicitation — Pré-requisitos

Verificar 3 condições obrigatórias:
1. **"Leads estão chegando?"** → Se não: parar aqui, resolver tráfego primeiro
2. **"Sabe o que perguntam sempre?"** → Se não: coletar FAQ antes
3. **"Tem pitch claro?"** → Se não: construir pitch primeiro

Se 3/3 SIM → continuar. Se não → resolver gaps primeiro.

### Step 2: Mapear FAQ e Objeções

1. Listar top 10 perguntas frequentes com respostas ideais
2. Listar top 5 objeções com rebuttals
3. Definir critérios de qualificação (budget, timing, fit)
4. Definir gatilho de handoff para humano

### Step 3: Desenhar Fluxo do Agente

```
TRIGGER: Lead manda mensagem
    ↓
GREETING: Saudação + pergunta aberta
    ↓
QUALIFICATION: 2-3 perguntas de qualificação
    ├── Qualificado → OFERTA
    └── Não qualificado → EDUCAÇÃO → NURTURE
    ↓
FAQ: Responde perguntas automáticas (80% das interações)
    ↓
OFERTA: Apresenta produto + link/agendamento
    ├── Interessado → HANDOFF para humano / link de compra
    └── Não agora → FOLLOW-UP automático (3 dias)
    ↓
HANDOFF: Notifica humano via Go High Level
```

### Step 4: Construir Prompt do Agente

Template base:
```
Você é [NOME DO AGENTE], assistente virtual de [EMPRESA].

PERSONA: [Tom, estilo, vocabulário]
OBJETIVO: Qualificar leads e responder FAQ.
PRODUTO: [Descrição do produto/serviço]
PREÇO: [Faixa de preço]

FAQ:
1. [Pergunta] → [Resposta]
2. [Pergunta] → [Resposta]
...

REGRAS:
- Seja conversacional e amigável
- NUNCA invente informação
- Se não sabe a resposta → "Vou passar para nossa equipe"
- Handoff para humano quando: [critérios]
```

### Step 5: Setup de Ferramentas

1. **ManyChat Pro** (R$15/mês) → Automação WhatsApp/Instagram
2. **Go High Level** (R$97/mês) → CRM + pipeline de leads
3. **Make.com** (R$9/mês) → Integração entre ManyChat ↔ GHL

Setup passo-a-passo:
1. Criar conta ManyChat → Conectar WhatsApp Business
2. Criar primeiro fluxo com greeting + 1 FAQ
3. Testar com 1 lead real (validar antes de batch!)
4. Integrar com Go High Level via Make.com
5. Refinar prompt com base em conversas reais

### Step 6: Métricas de Acompanhamento

Definir KPIs:
- Taxa de resposta do agente (>90%)
- Taxa de qualificação (>30%)
- Taxa de handoff para humano (<20%)
- Tempo médio de resposta (<30 segundos)

## Output Example

```
🤖 Agente IA — Setup Completo

Cara, bora criar sua Juliana (ou João)!

FLUXO:
Lead → WhatsApp → ManyChat responde FAQ → Qualifica →
Se qualificado → Agenda call via GHL → Você fecha

FERRAMENTAS:
- ManyChat Pro: R$15/mês
- Go High Level: R$97/mês
- Make.com: R$9/mês
TOTAL: R$121/mês

ROI ESTIMADO:
- Economia: 8h/semana × R$100/h = R$3.200/mês
- Conversão: +30-40% dos leads qualificados
- Payback: <1 semana

PRÓXIMOS PASSOS:
1. HOJE: Criar conta ManyChat + conectar WhatsApp
2. AMANHÃ: Criar fluxo greeting + FAQ (5 perguntas)
3. SEMANA 1: Testar com 10 leads reais + refinar
4. SEMANA 2: Integrar Make.com + Go High Level

Tá dentro? 😊
```

## Inline Checklist

- [ ] 3 pré-requisitos verificados (tráfego, FAQ, pitch)
- [ ] FAQ mapeada (mínimo 5 perguntas com respostas)
- [ ] Objeções mapeadas (mínimo 3 com rebuttals)
- [ ] Fluxo do agente desenhado (trigger → handoff)
- [ ] Prompt com persona definida
- [ ] Ferramentas com custo e ROI estimado
- [ ] Handoff para humano definido
- [ ] Quick start com primeiros 3 passos

## Related

- **Agent:** gui-avila (T0)
- **Next Tasks:** automation-diagnostic, automation-blueprint
- **Reference:** ManyChat docs, Go High Level docs, história da "Juliana IA"
