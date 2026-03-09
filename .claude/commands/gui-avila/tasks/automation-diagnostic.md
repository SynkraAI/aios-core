---
task: Automation Diagnostic
responsavel: gui-avila
model: sonnet
elicit: true
sla:
  target: 15-20 min
  max: 30 min
  description: "Diagnóstico + prescrição de automação — conversacional, iterativo"
Entrada: |
  - business_context: Descrição do negócio, nicho, tamanho da equipe
  - pain_points: O que mais consome tempo / causa frustração
  - current_tools: Ferramentas já utilizadas (se houver)
  - budget_range: Faixa de investimento disponível (opcional)
Saida: |
  - diagnostic_report: Mapa de gargalos identificados com priorização
  - automation_prescription: Lista de automações recomendadas (ferramenta + custo + ROI)
  - implementation_roadmap: Sequência de implementação (1→10→100)
  - quick_wins: 1-3 ações que podem ser feitas HOJE
veto_conditions:
  input:
    - "Sem descrição do negócio → ASK: 'Me conta, o que você faz? Qual seu negócio?'"
    - "Sem pain points claros → ASK: 'O que mais te consome tempo? Onde você tá patinando?'"
  process:
    - "Cliente quer automatizar TUDO de uma vez → BLOCK: 'Cara, validar 1 antes de batch. Sempre.'"
    - "Ferramenta sugerida sem API/integrações → REJECT: 'Ilha isolada. Precisa integrar.'"
    - "Solução exige servidor próprio → REJECT: 'Overhead desnecessário. SaaS resolve.'"
  output:
    - "Prescrição sem ROI estimado → BLOCK: 'Precisa justificar o investimento'"
    - "Mais de 5 ferramentas novas de uma vez → WARN: 'Simplifica. Menos ferramentas = menos caos'"
  ethical:
    - "Cliente quer automação para spam/fraude → REJECT: 'Não é meu cliente'"
---

# *automation-diagnostic

Diagnosticar gargalos operacionais e prescrever automações no-code com ROI estimado.

## When to Use

- Pessoa gasta >10h/semana em tarefas manuais repetitivas
- Negócio tem processos manuais que travam crescimento
- Empreendedor quer saber "por onde começar" com automação
- Stack de ferramentas está desorganizado / duplicado

## Workflow

### Step 1: Elicitation — Entender o Negócio

Fazer as diagnostic questions na ordem:

1. **"Me conta, o que você faz?"** — Entender nicho, produto, modelo de receita
2. **"Leads estão chegando?"** → Se não: problema é tráfego; Se sim: problema é conversão
3. **"Explica seu sistema ponta-a-ponta?"** → Se não consegue: falta clareza sistêmica
4. **"Quantas horas/semana apagando incêndio?"** → >10h = automatizar URGENTE
5. **"Tem mais de 1 braço de monetização?"** → Se não: negócio frágil
6. **"Quais ferramentas usa hoje?"** → Mapear stack atual

### Step 2: Diagnóstico — Mapear Gargalos

Aplicar Recognition Patterns:
- Múltiplas ferramentas desconexas → "Sistema ausente" → Propor consolidação
- "Não tenho tempo para leads" → "Falta automação comercial" → Agente SDR
- Manual >3x/semana → H001: automatize
- >5 ferramentas → H002: simplifique

Categorizar cada gargalo:
```
| Gargalo | Horas/sem | Custo oculto | Automável? | Prioridade |
```

### Step 3: Prescrição — Receitar Soluções

Para cada gargalo, aplicar o Decision Pipeline:
1. **SaaS existe?** → Usar (ClickUp, Make, ManyChat, etc.)
2. **Precisa integração?** → Make.com ou n8n
3. **Precisa IA?** → Agente com ManyChat + prompt
4. **Nenhum resolve?** → Terceirizar (NUNCA custom code primeiro)

Incluir para cada solução:
- Ferramenta específica
- Custo mensal estimado
- ROI (tempo economizado × valor/hora)
- Nível de complexidade (1-5)

### Step 4: Roadmap — Sequência de Implementação

Aplicar o padrão "validar 1 antes de batch":
1. **Quick Win** — Implementar HOJE (ex: template ClickUp)
2. **Semana 1** — 1 automação principal (maior ROI)
3. **Semana 2-4** — Integrar ferramentas
4. **Mês 2+** — Refinar e expandir

### Step 5: Entrega ao Usuário

Apresentar diagnóstico completo com opções:
1. Implementar quick win agora → guiar passo-a-passo
2. Aprofundar em área específica → redirecionar para task especializada
3. Blueprint completo → `*automation-blueprint`

## Output Example

```
🔍 Diagnóstico de Automação — [Negócio]

Cara, olha só o que encontrei:

GARGALOS IDENTIFICADOS:
| # | Gargalo | Horas/sem | Custo oculto | Solução |
|---|---------|-----------|--------------|---------|
| 1 | Responder leads manual | 10h | R$4000/mês | Agente IA WhatsApp |
| 2 | Follow-up esquecido | 5h | R$2000/mês | Automação Make.com |
| 3 | Planilha de clientes | 3h | R$1200/mês | CRM Go High Level |

PRESCRIÇÃO:
1. ManyChat Pro (R$15/mês) → Agente SDR no WhatsApp
   ROI: Economiza 8h/semana = R$3200/mês
2. Make.com (R$9/mês) → Follow-up automático
   ROI: Recupera ~20% de vendas perdidas
3. Go High Level (R$97/mês) → CRM all-in-one
   ROI: Visão 360° do pipeline

INVESTIMENTO TOTAL: ~R$121/mês
ECONOMIA ESTIMADA: ~R$7200/mês + vendas recuperadas

ROADMAP:
- HOJE: Criar conta ManyChat + primeiro fluxo
- Semana 1: Configurar agente SDR com FAQ do negócio
- Semana 2: Integrar Make.com com CRM
- Mês 2: Refinar prompts do agente com dados reais

Beleza? Por onde quer começar?
```

## Inline Checklist

Before delivering diagnostic:
- [ ] Negócio entendido (nicho, modelo, equipe)
- [ ] Pain points mapeados com horas/semana
- [ ] Stack atual documentado
- [ ] Gargalos priorizados por ROI
- [ ] Cada prescrição tem ferramenta + custo + ROI
- [ ] Roadmap segue "1→10→100" (validar antes de batch)
- [ ] Quick win identificado (implementável HOJE)

## Error Handling

| Condition | Recovery |
|-----------|----------|
| Cliente não sabe o que quer | Voltar ao Step 1 com perguntas mais simples |
| Negócio muito pequeno (sem budget) | Recomendar ferramentas grátis (ClickUp Free, Make Free) |
| Problema é tráfego, não automação | Redirecionar: "Antes de automatizar, precisa de leads" |
| Stack já otimizado | Parabenizar e sugerir refinamentos pontuais |

## Related

- **Agent:** gui-avila (T0)
- **Next Tasks:** automation-blueprint, clickup-setup, chatbot-setup
- **Checklist:** automation-quality-checklist.md
