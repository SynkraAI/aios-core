# Workflow: VSL Matador

## Metadados
```yaml
id: vsl-matador
versao: 1.1.0
duracao: 2-3 dias
complexidade: alta
output: Script VSL completo + estrutura de slides
dependencies:
  optional_pre:
    - oferta-irresistivel.md (se Grand Slam Offer ja existir, Fase 3 usa artefato)
  feeds_into:
    - lancamento-completo.md (VSL integrado no Dia 4-5)
  checklists:
    - vsl-quality-checklist.md
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Criar um Video Sales Letter de alta conversão usando a orquestração dos clones especializados.

**Resultado esperado:** Script de VSL de 15-45 minutos pronto para gravar, com slides estruturados.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto/serviço a ser vendido
- Preço e estrutura de oferta (se já existir)
- Público-alvo (descrição básica)
- Concorrentes principais
- Resultados/cases (se houver)
- Objeções conhecidas

### PASSO 2: INPUT VALUE
**Formato específico:**
```yaml
produto:
  nome: ""
  tipo: "curso|mentoria|saas|fisico|servico"
  preco: ""
  entregaveis: []

publico:
  descricao: ""
  dor_principal: ""
  desejo_principal: ""

mercado:
  concorrentes: []
  diferenciais: []

provas:
  cases: []
  testimonials: []
  dados: []
```

### PASSO 3: PRE-CHECKLIST
**Quality Gate de Entrada:**
- [ ] Produto está definido claramente?
- [ ] Tem pelo menos 1 diferencial vs concorrência?
- [ ] Sabe quem é o público (mesmo que básico)?
- [ ] Tem alguma prova de resultado?
- [ ] Preço está definido (mesmo que aproximado)?

**Se faltar algo:** Voltar e completar antes de continuar.

### PASSO 4: PERSONA/EXECUTOR
**Sequência de clones:**

| Fase | Clone | Função |
|------|-------|--------|
| 1. Diagnóstico | @eugene-schwartz | Definir awareness do público |
| 2. Diferenciação | @todd-brown | Criar Unique Mechanism |
| 3. Oferta | @alex-hormozi | Estruturar Grand Slam Offer |
| 4. Estrutura | @jon-benson | Aplicar 5-Step VSL Formula |
| 5. Emoção | @clayton-makepeace | Injetar linguagem visceral |
| 6. Bullets | @gary-bencivenga | Criar fascinations |
| 7. Otimização | @claude-hopkins | Audit final |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Diagnóstico de Awareness (30 min)
**Clone:** @eugene-schwartz

**Executar:**
1. Analisar o público e classificar em um dos 5 níveis:
   - Unaware → VSL longo (30-45 min), educativo
   - Problem Aware → VSL médio-longo (25-35 min), agitar dor
   - Solution Aware → VSL médio (20-30 min), diferenciar
   - Product Aware → VSL curto (15-20 min), quebrar objeções
   - Most Aware → VSL muito curto (10-15 min), oferta direta

2. Definir:
   - Tom do VSL (educativo/emocional/direto)
   - Duração alvo
   - Tipo de abertura

**Output:** Documento de Awareness com classificação e recomendações

---

#### FASE 2: Unique Mechanism (1h)
**Clone:** @todd-brown

**Executar:**
1. Criar Mecanismo do PROBLEMA:
   - Por que as soluções anteriores falharam?
   - Qual a "peça que faltava"?
   - Qual a causa raiz que ninguém fala?

2. Criar Mecanismo da SOLUÇÃO:
   - Como seu produto resolve diferente?
   - Qual o processo/método único?
   - Por que funciona quando outros não?

3. Nomear o mecanismo (nome memorável)

**Output:** Documento com Mecanismo Único nomeado e explicado

---

#### FASE 3: Grand Slam Offer (1h)
**Clone:** @alex-hormozi

**Executar:**
1. Aplicar Value Equation:
   - Dream Outcome: O que o cliente realmente quer?
   - Perceived Likelihood: Como aumentar chance de sucesso?
   - Time Delay: Como diminuir tempo até resultado?
   - Effort Required: Como diminuir esforço?

2. Criar Stack de Valor:
   - Componente principal
   - Componentes secundários
   - Bônus estratégicos
   - Garantia forte

3. Precificar com ancoragem

**Output:** Stack de valor completo com preços

---

#### FASE 4: Estrutura VSL (2-3h)
**Clone:** @jon-benson

**Executar a 5-Step VSL Formula:**

**STEP 1 - SNAP SUGGESTION (primeiros 15 segundos)**
- Pattern interrupt forte
- Promessa específica com timeframe
- Curiosidade intensa
- Formato: "Nos próximos X minutos, vou revelar..."

**STEP 2 - USP MENTION (30-60 segundos)**
- Por que este vídeo é diferente
- O que vai descobrir
- Por que prestar atenção agora

**STEP 3 - STORY (5-10 minutos)**
- História de origem (sua ou do método)
- Problema enfrentado
- Momento de descoberta
- Transição para ensinar

**STEP 4 - EDUCATION/CONTENT (10-20 minutos)**
- Ensinar conceito central (Unique Mechanism)
- Provar expertise
- Entregar valor real
- Preparar para o pitch

**STEP 5 - PITCH (5-10 minutos)**
- Transição suave
- Revelar oferta
- Stack de valor
- Garantia
- CTA urgente
- Quebra de objeções

**Output:** Script estruturado por seções

---

#### FASE 5: Injeção Emocional (1-2h)
**Clone:** @clayton-makepeace

**Executar:**
1. Revisar STEP 3 (Story):
   - Adicionar linguagem sensorial
   - Amplificar momentos de dor
   - Criar visualização vívida

2. Criar Future Pacing:
   - "Daqui a 90 dias..."
   - Pintar o "depois" em detalhes sensoriais

3. Amplificar Stakes:
   - O que está em jogo além do óbvio
   - Consequências de não agir

**Output:** Script com emoção visceral injetada

---

#### FASE 6: Fascinations/Bullets (1h)
**Clone:** @gary-bencivenga

**Executar:**
1. Criar 30-50 bullets para:
   - Seção de conteúdo (o que vai aprender)
   - Stack de valor (o que está incluso)
   - Objeções (por que funciona)

2. Tipos a usar:
   - Contrarian (contra crença comum)
   - Curiosity gap (informação incompleta)
   - Specific benefit (resultado + tempo)
   - Fear-based (consequência de não saber)
   - Proof-based (com autoridade)

3. Selecionar os 20 melhores

**Output:** Bank de bullets categorizados

---

#### FASE 7: Audit Final (30 min)
**Clone:** @claude-hopkins

**Executar checklist:**
- [ ] Hook dos primeiros 15 segundos é irresistível?
- [ ] Promessa é específica e crível?
- [ ] Unique Mechanism está claro?
- [ ] Story cria identificação?
- [ ] Conteúdo entrega valor real?
- [ ] Transição para pitch é suave?
- [ ] Stack de valor está bem apresentado?
- [ ] Garantia remove todo risco?
- [ ] CTA é claro e repetido?
- [ ] Objeções principais estão quebradas?

**Output:** Relatório de audit com ajustes necessários

---

### PASSO 6: TOOLS/SCRIPTS
**Ferramentas necessárias:**
- Clone @eugene-schwartz (diagnóstico)
- Clone @todd-brown (mecanismo)
- Clone @alex-hormozi (oferta)
- Clone @jon-benson (estrutura)
- Clone @clayton-makepeace (emoção)
- Clone @gary-bencivenga (bullets)
- Clone @claude-hopkins (audit)
- Checklist Sugarman (triggers opcionais)

### PASSO 7: OUTPUT
**O que sai:**
```yaml
entregaveis:
  - script_vsl_completo.md
  - estrutura_slides.md
  - bank_bullets.md
  - documento_awareness.md
  - unique_mechanism.md
  - stack_valor.md
  - audit_report.md

formato_script:
  secoes:
    - hook (primeiros 15s)
    - usp_mention (30-60s)
    - story (5-10 min)
    - content (10-20 min)
    - pitch (5-10 min)
    - close (2-3 min)

  cada_secao:
    - texto_narração
    - instrucoes_slide
    - timing_estimado
```

### PASSO 8: POS-CHECKLIST
**Quality Gate de Saída:**
- [ ] Script tem duração dentro do alvo?
- [ ] Todas as 5 etapas da formula estão presentes?
- [ ] Unique Mechanism aparece no conteúdo?
- [ ] Stack de valor está completo?
- [ ] Garantia está clara?
- [ ] CTA aparece pelo menos 3x?
- [ ] Emoção está presente (não só lógica)?
- [ ] Bullets estão distribuídos?
- [ ] Audit foi feito e ajustes aplicados?

### PASSO 9: OUTPUT FINAL
**Resultado "bem fudido":**
- Script VSL pronto para gravar
- Estrutura de slides definida
- Timing por seção
- Instruções de gravação
- Versão para teste A/B (headline alternativa)

**Metadados:**
- Data de criação
- Versão
- Clones utilizados
- Awareness do público

---

## COMANDOS RÁPIDOS

```
*vsl-diagnostico    → Executar só Fase 1
*vsl-mecanismo      → Executar só Fase 2
*vsl-oferta         → Executar só Fase 3
*vsl-estrutura      → Executar só Fase 4
*vsl-emocao         → Executar só Fase 5
*vsl-bullets        → Executar só Fase 6
*vsl-audit          → Executar só Fase 7
*vsl-completo       → Executar workflow inteiro
```

---

## EXEMPLO DE USO

```
Usuário: Quero criar um VSL para meu curso de tráfego pago

Sistema:
1. Ativa @eugene-schwartz para diagnóstico
2. Coleta inputs estruturados
3. Executa cada fase em sequência
4. Entrega script completo

Output: Script de 25 minutos com slides, bullets e audit
```

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Fase 1 | Awareness classificado + duração alvo + tom do VSL definidos | Voltar para Fase 1 — reclassificar público |
| CP-2 | Fase 2 | Unique Mechanism nomeado com mecanismo do problema + mecanismo da solução | Voltar para Fase 2 — mecanismo genérico ou sem nome |
| CP-3 | Fase 3 | Grand Slam Offer com stack de valor + garantia + ancoragem de preço | Voltar para Fase 3 — stack incompleto ou sem garantia |
| CP-4 | Fase 4 | Script 5-Step completo (snap + USP + story + education + pitch) com timing por seção | Voltar para Fase 4 — etapas faltando ou timing desbalanceado |
| CP-5 | Fase 5 | Script revisado com linguagem sensorial, future pacing e stakes amplificados | Voltar para Fase 5 — emoção insuficiente |
| CP-6 | Fase 6 | 20+ bullets selecionados dos 30-50 criados, distribuídos entre conteúdo/stack/objeções | Voltar para Fase 6 — bullets fracos ou mal distribuídos |
| CP-7 | Fase 7 | Audit aprovado: hook irresistível, promessa crível, CTA claro e repetido 3x+ | Voltar para fase com problema identificado no audit |
| CP-FINAL | Passo 8 | Pós-checklist 100% + duração dentro do alvo de awareness | Revisar fases com falhas |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Hook dos primeiros 15 segundos não cria curiosidade ou é genérico | BLOCKING | PARAR — refazer STEP 1 com @jon-benson |
| VT-2 | VSL não tem Unique Mechanism (vende commodity sem diferenciação) | BLOCKING | PARAR — voltar Fase 2 com @todd-brown |
| VT-3 | Transição para pitch é abrupta (corte entre conteúdo e venda) | HIGH | PAUSAR — reescrever bridge com @jon-benson |
| VT-4 | Script tem apenas lógica sem emoção (future pacing ausente, sem linguagem sensorial) | HIGH | PAUSAR — reinjetar emoção com @clayton-makepeace |
| VT-5 | CTA aparece menos de 3 vezes no script | HIGH | PAUSAR — adicionar CTAs no pitch e close |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar à fase anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Audit reprova em mais de 3 itens | Chamar @claude-hopkins para audit detalhado + refazer fases problemáticas | 1 |

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
**Clones utilizados:** 7 de 15
