# Task: Email Marketing

```yaml
task_id: email-marketing
task_name: "Criar Estrategia e Copy de Email Marketing"
version: 1.0.0
estimated_time: "3-5h"
status: pending
responsible_executor: "@copy-maestro (orquestra clones)"
execution_type: Agent
elicit: true
```

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Criar Estrategia e Copy de Email Marketing |
| **status** | `pending` |
| **responsible_executor** | @copy-maestro → delega para clones por fase |
| **execution_type** | `Agent` |
| **input** | Lista de email, produto, tipo de sequencia, objetivo, frequencia |
| **output** | Sequencias de email, templates recorrentes, subject line bank |
| **action_items** | 6 steps |
| **acceptance_criteria** | 7 criteria |

---

## Overview

Workflow completo para criar estrategia e copy de email marketing: sequencias de venda (Soap Opera Sequence), emails diarios de relacionamento (Infotainment), sequencias de carrinho abandonado, welcome sequences, e templates recorrentes. Cobre tanto automacoes quanto emails ongoing.

## Quando Usar

- Setup inicial de email marketing (welcome + nurturing)
- Lancamento via email (sequencia de venda)
- Email diario/semanal ongoing
- Sequencias de carrinho abandonado ou reativacao
- Qualquer campanha que depende de email como canal principal

---

## Input

- **Lista/Audiencia** (obrigatorio): Tamanho e tipo de lista (leads, clientes, mista)
- **Produto/Oferta** (obrigatorio): O que sera vendido/promovido
- **Tipo de Sequencia** (obrigatorio): Venda, welcome, nurturing, reativacao, carrinho
- **Objetivo** (obrigatorio): Conversao, engajamento, reativacao, educacao
- **Frequencia** (obrigatorio): Diaria, 3x/semana, semanal, sequencia unica
- **Tom** (opcional): Formal, casual, provocativo, educativo
- **Resultados Anteriores** (opcional): Open rates, CTR, dados de campanhas passadas

## Output

- **Sequencia Completa**: 5-12 emails (dependendo do tipo)
- **Subject Line Bank**: 20+ subject lines testadas
- **Templates Recorrentes**: 2-3 templates para emails ongoing
- **Segmentacao Map**: Criterios de segmentacao por comportamento
- **Metricas Target**: Benchmarks esperados por tipo de email

---

## Action Items

### Step 1: Estrategia de Email
**Clone:** @dan-kennedy (estrategia) + @eugene-schwartz (awareness)

1. Diagnosticar awareness predominante da lista
2. Definir objetivo primario e metricas de sucesso
3. Mapear jornada do leitor (de subscriber ate comprador)
4. Definir segmentacoes necessarias
5. Escolher tipo(s) de sequencia

**Output:** Estrategia de email documentada

---

### Step 2: Soap Opera Sequence (Venda)
**Clone:** @andre-chaperon

1. Email 1: "O que esta acontecendo" — backstory e hook
2. Email 2: "Alta dramatica" — problema amplificado
3. Email 3: "Momento de revelacao" — descoberta da solucao
4. Email 4: "Beneficios escondidos" — aprofundar transformacao
5. Email 5: "Urgencia + CTA" — deadline e acao
6. Criar open loops entre emails (cada email puxa o proximo)
7. Adicionar 1-2 emails extras para nao-abridores

**Output:** Soap Opera Sequence de 5-7 emails

---

### Step 3: Email Diario/Ongoing
**Clone:** @ben-settle

1. Definir formato infotainment (historia + licao + CTA)
2. Criar 5-7 templates de formato:
   - Story email (historia pessoal → licao → CTA)
   - Contrarian email (opiniao controversa → argumento → CTA)
   - Case study email (resultado de cliente → como → CTA)
   - Curated email (links/recursos + comentario pessoal)
   - Q&A email (responde pergunta de leitor)
3. Escrever 5 emails modelo completos
4. Definir cadencia e temas recorrentes

**Output:** 5 templates + 5 emails modelo

---

### Step 4: Subject Lines e Preview Text
**Clone:** @gary-bencivenga (curiosidade) + @john-carlton (direto)

1. Criar 20+ subject lines por categoria:
   - Curiosidade: "A coisa estranha que descobri sobre..."
   - Urgencia: "Ultimo dia para..."
   - Pessoal: "Preciso te contar algo"
   - Controverso: "Por que [crenca popular] esta errado"
   - Beneficio: "Como [resultado] em [tempo]"
2. Criar preview texts complementares
3. Marcar para teste A/B (2-3 subject lines por email)

**Output:** Subject line bank com 20+ opcoes

---

### Step 5: Sequencias Especiais
**Clone:** @andre-chaperon + Sugarman Triggers

**Welcome Sequence (3-5 emails):**
1. Email 1: Boas-vindas + entrega do lead magnet + expectativa
2. Email 2: Historia de origem (quem sou, por que faco isso)
3. Email 3: Quick win (resultado rapido para gerar confianca)
4. Email 4: Caso de sucesso + bridge para oferta
5. Email 5: Oferta suave (se aplicavel)

**Carrinho Abandonado (3-4 emails):**
1. Email 1 (1h): "Esqueceu algo?" + link direto
2. Email 2 (24h): Objecao handling + garantia (trigger 13, 27)
3. Email 3 (48h): Escassez real + urgencia (trigger 20, 31)
4. Email 4 (72h): Ultima chance + bonus surpresa

**Output:** Welcome sequence + carrinho abandonado

---

### Step 6: Audit e Otimizacao
**Clone:** @claude-hopkins

1. Revisar todas as sequencias contra checklist
2. Verificar progressao logica (cada email prepara o proximo)
3. Checar que subject lines correspondem ao conteudo
4. Validar CTAs (claros, unicos, acionaveis)
5. Verificar que segmentacao esta consistente

**Output:** Sequencias revisadas e aprovadas

---

## Acceptance Criteria

- [ ] **AC1:** Estrategia de email documentada com jornada do leitor
- [ ] **AC2:** Soap Opera Sequence de 5+ emails com open loops
- [ ] **AC3:** 5+ templates de email ongoing com formato definido
- [ ] **AC4:** 20+ subject lines categorizadas e prontas para teste A/B
- [ ] **AC5:** Welcome sequence de 3-5 emails
- [ ] **AC6:** Sequencia de carrinho abandonado de 3-4 emails (se aplicavel)
- [ ] **AC7:** Todas as sequencias auditadas por Hopkins

## Veto Conditions

- **VETO-EM-1:** Emails sem subject line testavel (A/B) → ADICIONAR variacoes
- **VETO-EM-2:** Sequencia de venda sem open loops → REESCREVER com Chaperon
- **VETO-EM-3:** Email diario sem personalidade/historia → REESCREVER com Settle
- **VETO-EM-4:** CTA ambiguo ou multiplos CTAs no mesmo email → SIMPLIFICAR para 1 CTA
- **VETO-EM-5:** Welcome sequence que ja vende no email 1 → REESTRUTURAR (valor primeiro)

## Anti-Patterns

- Enviar emails so de venda sem nutrir a lista — queima a lista rapidamente
- Subject lines clickbait que nao entregam o prometido — destroi confianca
- Emails longos demais sem formatacao — ninguem le blocos de texto no email
- Mesmo template para todos os emails — parece robotico, perde personalidade
- Ignorar segmentacao — enviar mesma mensagem para leads frios e clientes
- Nao ter unsubscribe claro — alem de ilegal, prejudica deliverability

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | Setup de automacao na plataforma de email |
| **Trigger** | Todas as sequencias aprovadas |
| **Executor** | Usuario (implementacao na ferramenta de email) |

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Squad: copywriting-squad_
