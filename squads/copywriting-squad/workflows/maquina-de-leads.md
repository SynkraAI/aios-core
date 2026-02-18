# Workflow: Máquina de Leads

## Metadados
```yaml
id: maquina-de-leads
versao: 1.1.0
duracao: 3-4 dias
complexidade: media
output: Lead Magnet + Landing Page + Sequência de Nutrição
dependencies:
  optional_pre:
    - oferta-irresistivel.md (oferta define o produto final do funil)
  feeds_into:
    - email-diario-lucrativo.md (leads capturados entram no sistema de email)
    - ads-que-escalam.md (landing page como destino dos ads)
  checklists:
    - sugarman-31-triggers.md
    - awareness-checklist.md
```

---

## VISAO GERAL

Criar um sistema completo de geração de leads: Lead Magnet irresistível + Landing Page de alta conversão + Sequência de emails que nutre e vende.

**Resultado esperado:** Sistema automatizado que captura leads e os prepara para compra.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto principal que será vendido no final
- Público-alvo
- Problema principal que resolve
- Conhecimento/expertise disponível
- Orçamento para tráfego (define escala)

### PASSO 2: INPUT VALUE
**Formato específico:**
```yaml
produto_final:
  nome: ""
  preco: ""
  promessa_principal: ""

lead_magnet:
  formato: "ebook|checklist|video|template|mini-curso|webinar"
  tema_relacionado: ""

publico:
  quem: ""
  dor_imediata: ""
  nivel_awareness: ""

trafego:
  origem: "facebook|google|organico|youtube|instagram"
  orcamento_mensal: ""
```

### PASSO 3: PRE-CHECKLIST
**Quality Gate de Entrada:**
- [ ] Produto final está definido?
- [ ] Sabe qual problema imediato resolver no lead magnet?
- [ ] Tem conhecimento para entregar valor real?
- [ ] Definiu formato do lead magnet?
- [ ] Sabe de onde virá o tráfego?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Estratégia | @eugene-schwartz | Definir awareness e abordagem |
| 2. Big Idea | @todd-brown | Criar ângulo único do lead magnet |
| 3. Oferta LM | @alex-hormozi | Estruturar valor do lead magnet |
| 4. Landing Page | @john-carlton | Copy direto para conversão |
| 5. Headlines | @gary-bencivenga | Criar fascinations |
| 6. Sequência | @andre-chaperon | Soap Opera Sequence |
| 7. Audit | @claude-hopkins | Validação final |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Estratégia de Awareness (30 min)
**Clone:** @eugene-schwartz

**Executar:**
1. Classificar awareness do tráfego:
   - Tráfego frio (Facebook/Instagram) = Unaware/Problem Aware
   - Tráfego morno (Google/YouTube) = Solution Aware
   - Tráfego quente (lista/retargeting) = Product Aware

2. Definir estratégia de Lead Magnet:
   - Unaware → LM educativo (guia completo, revelação)
   - Problem Aware → LM que agita dor (checklist de erros, diagnóstico)
   - Solution Aware → LM comparativo (método X vs Y, framework)

**Output:** Estratégia de awareness + tipo de LM recomendado

---

#### FASE 2: Big Idea do Lead Magnet (45 min)
**Clone:** @todd-brown

**Executar:**
1. Criar ângulo único:
   - Não é "mais um ebook de X"
   - É "O método [NOME] que [RESULTADO ESPECÍFICO]"

2. Desenvolver hook principal:
   - Contrarian (contra crença comum)
   - Discovery (algo novo descoberto)
   - Specific result (número + tempo)

3. Nomear o Lead Magnet:
   - Nome que transmite valor
   - Específico, não genérico

**Exemplos de transformação:**
- ❌ "Ebook de Marketing Digital"
- ✅ "O Framework 3x3: Como Triplicar Leads em 30 Dias Sem Aumentar Orçamento"

**Output:** Nome do LM + Big Idea + Hook principal

---

#### FASE 3: Estrutura de Valor do LM (30 min)
**Clone:** @alex-hormozi

**Executar:**
1. Aplicar Value Equation ao LM:
   - Dream Outcome: Qual vitória rápida entrega?
   - Likelihood: Por que vai funcionar pra eles?
   - Time: Quão rápido terão resultado?
   - Effort: Quão fácil é consumir/aplicar?

2. Estruturar conteúdo:
   - Promessa específica
   - 3-5 módulos/seções
   - Quick win em cada seção
   - CTA para produto principal no final

**Output:** Estrutura do Lead Magnet com seções

---

#### FASE 4: Landing Page (1-2h)
**Clone:** @john-carlton

**Executar estrutura de LP de Lead Magnet:**

```
1. HEADLINE
   - Promessa específica + timeframe
   - Resultado desejado pelo público
   - Exemplo: "Como [RESULTADO] em [TEMPO] sem [OBSTÁCULO]"

2. SUBHEADLINE
   - Expande a promessa
   - Adiciona credibilidade
   - "O método usado por [PROVA] para [RESULTADO]"

3. HERO IMAGE
   - Mockup do lead magnet
   - Ou imagem do resultado

4. BULLETS (5-7)
   - O que vai descobrir dentro
   - Formato: "Como [benefício] (página X)"
   - Curiosidade + especificidade

5. PROVA SOCIAL (se tiver)
   - Número de downloads
   - Testimonials rápidos
   - Logos de empresas

6. FORM
   - Apenas email (mínima fricção)
   - Ou nome + email (se precisar personalizar)
   - Botão com ação ("QUERO MEU ACESSO GRÁTIS")

7. GARANTIA/PRIVACIDADE
   - "100% gratuito"
   - "Seus dados estão seguros"
```

**Output:** Copy completo da Landing Page

---

#### FASE 5: Fascinations/Bullets (45 min)
**Clone:** @gary-bencivenga

**Executar:**
1. Criar 20-30 bullets para:
   - Landing Page (o que vai descobrir)
   - Emails de nutrição (teasers)
   - Ads (hooks)

2. Tipos prioritários:
   - Curiosity gap: "A única coisa que separa quem [sucesso] de quem [fracasso]"
   - Specific benefit: "Como conseguir [resultado específico] em [tempo específico]"
   - Contrarian: "Por que [crença comum] está destruindo seu [objetivo]"

**Output:** Bank de 30 bullets categorizados

---

#### FASE 6: Sequência de Nutrição (2-3h)
**Clone:** @andre-chaperon

**Executar Soap Opera Sequence de 7 emails:**

```
EMAIL 1 - ENTREGA + SET THE STAGE (imediato)
- Entregar o lead magnet
- Agradecer pelo interesse
- Abrir loop: "Amanhã vou contar por que criei isso..."
- Criar expectativa

EMAIL 2 - HISTÓRIA DE ORIGEM (dia 1)
- Sua história ou história do método
- Problema que enfrentou
- Momento de virada
- Loop: "Mas tinha um problema que quase destruiu tudo..."

EMAIL 3 - O PROBLEMA REAL (dia 2)
- Revelar problema mais profundo
- Agitar a dor
- Conectar com dor do leitor
- Loop: "Foi aí que descobri algo que mudou tudo..."

EMAIL 4 - A DESCOBERTA (dia 3)
- Revelar o "insight" principal
- Ensinar conceito valioso
- Conectar com produto principal
- Loop: "Mas implementar sozinho é difícil porque..."

EMAIL 5 - PROVA SOCIAL (dia 4)
- Cases de sucesso
- Testimonials
- Resultados concretos
- Loop: "Se eles conseguiram, você também pode, mas..."

EMAIL 6 - OBJEÇÕES (dia 5)
- Antecipar principais objeções
- Quebrar cada uma
- Mostrar que é possível
- Loop: "Tenho uma proposta especial..."

EMAIL 7 - OFERTA (dia 6)
- Apresentar produto principal
- Stack de valor
- Garantia
- Urgência (se aplicável)
- CTA forte
```

**Output:** 7 emails escritos com subject lines

---

#### FASE 7: Audit Final (30 min)
**Clone:** @claude-hopkins

**Checklist:**
- [ ] Lead Magnet tem valor real (não é isca vazia)?
- [ ] Landing Page tem promessa específica?
- [ ] Bullets criam curiosidade?
- [ ] Form tem mínima fricção?
- [ ] Sequência de emails tem open loops?
- [ ] Cada email leva ao próximo?
- [ ] Transição para oferta é natural?
- [ ] CTA final é claro?

**Output:** Relatório de audit

---

### PASSO 6: TOOLS/SCRIPTS
**Ferramentas:**
- 7 clones da squad
- Template de Landing Page
- Template de Email Sequence
- Checklist Sugarman (opcional para turbinar)

### PASSO 7: OUTPUT
**Entregáveis:**
```yaml
arquivos:
  - lead_magnet_estrutura.md
  - landing_page_copy.md
  - email_sequence_7.md
  - bank_bullets.md
  - audit_report.md

landing_page:
  - headline
  - subheadline
  - bullets (7)
  - cta
  - garantia

emails:
  - 7 emails completos
  - subject lines
  - preview text
  - timing de envio
```

### PASSO 8: POS-CHECKLIST
**Quality Gate de Saída:**
- [ ] Lead Magnet tem nome atraente?
- [ ] LP converte em 30%+ (estimativa)?
- [ ] Sequência tem 7 emails?
- [ ] Cada email tem open loop?
- [ ] Último email tem oferta clara?
- [ ] Bullets estão distribuídos?

### PASSO 9: OUTPUT FINAL
**Sistema completo:**
- Lead Magnet estruturado e nomeado
- Landing Page pronta para subir
- 7 emails da sequência
- Bank de bullets para ads
- Métricas alvo definidas

---

## METRICAS ALVO

| Métrica | Alvo |
|---------|------|
| Conversão LP | 30-50% |
| Open rate emails | 40%+ |
| Click rate emails | 5%+ |
| Conversão para produto | 2-5% |

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Fase 1 | Awareness classificado por fonte de tráfego + tipo de LM recomendado definido | Voltar para Fase 1 — reclassificar awareness |
| CP-2 | Fase 2 | Big Idea com ângulo único + nome do LM específico (não genérico) + hook principal | Voltar para Fase 2 — nome/ângulo é genérico |
| CP-3 | Fase 3 | Value Equation aplicada + estrutura com 3-5 seções com quick win cada | Voltar para Fase 3 — valor percebido insuficiente |
| CP-4 | Fase 4 | Copy da LP completo (headline + sub + bullets + form + CTA) | Voltar para Fase 4 — seções faltando ou CTA fraco |
| CP-5 | Fase 5 | 30 bullets categorizados (curiosity + benefit + contrarian) | Voltar para Fase 5 — bullets genéricos ou insuficientes |
| CP-6 | Fase 6 | 7 emails Soap Opera Sequence com open loops entre cada email | Voltar para Fase 6 — emails sem continuidade narrativa |
| CP-7 | Fase 7 | Audit final aprovado: LM com valor real, LP com promessa específica, sequência fluida | Voltar para fase com problema identificado no audit |
| CP-FINAL | Passo 8 | Pós-checklist 100% aprovado + todos os entregáveis gerados | Revisar fases com falhas |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Lead Magnet é isca vazia (sem valor real entregue) | BLOCKING | PARAR — reestruturar conteúdo do LM com valor aplicável |
| VT-2 | Landing Page sem promessa específica (headline genérica tipo "Baixe grátis") | BLOCKING | PARAR — refazer headline com resultado + tempo |
| VT-3 | Sequência de emails sem conexão com produto final (nurture sem venda) | BLOCKING | PARAR — reescrever emails 4-7 com ponte para oferta |
| VT-4 | Open loops ausentes entre emails (cada email é isolado) | HIGH | PAUSAR — adicionar ganchos de continuidade |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar à fase anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Audit final reprova | Chamar @claude-hopkins para segundo audit com feedback detalhado | 1 |

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
