# Workflow: Lancamento Completo

## Metadados
```yaml
id: lancamento-completo
versao: 2.0.0
duracao: 5-7 dias
complexidade: alta
output: Campanha completa de lancamento (VSL + emails + ads + sales page)
execution_model: one-time
dependencies:
  optional_pre:
    - oferta-irresistivel.md (se oferta ja existir, pular Passo 2)
    - sales-page-killer.md (se sales page for necessaria, executar em paralelo no Dia 4-5)
  checklists:
    - sugarman-31-triggers.md
    - audit-copy-hopkins.md
    - awareness-checklist.md
    - sales-letter-checklist.md
  templates:
    - vsl-script-tmpl.md
    - email-sequence-tmpl.md
    - sales-page-completa-tmpl.md
    - ad-creative-tmpl.md
    - bullets-fascinations-tmpl.md
```

---

## VISAO GERAL

Orquestrar a criacao de TODA a copy necessaria para um lancamento completo — desde fundacao estrategica ate otimizacao pos-audit. Combina os frameworks dos 15 clones em 7 dias estruturados com checkpoints e veto conditions em cada fase.

**Principio:** Nenhum lancamento sai da squad sem passar por todas as fases. Cada fase depende da anterior — pular fases e proibido.

**Resultado:** Campanha completa com VSL, sales page, sequencias de email, ads — tudo coeso e auditado.

**Duracao Estimada:** 5-7 dias de trabalho focado

**Clones Utilizados:**
- **Estrategistas (Dia 1-2):** Schwartz, Kennedy, Todd Brown, Hormozi
- **Estruturacao (Dia 3):** Georgi (RMBC)
- **Executores (Dia 4-5):** Schwartz, Carlton, Halbert, Benson, Bencivenga, Makepeace
- **Comunicacao (Dia 6):** Chaperon, Settle, Sugarman (triggers)
- **Otimizadores (Dia 7):** Hopkins, Dan Koe (content angle)

## Veto Conditions

- **VETO-LC-1:** Iniciar execucao (Dia 4) sem fundacao estrategica completa (Dia 1-2) → PARAR, completar estrategia
- **VETO-LC-2:** Pular RMBC (Dia 3) e ir direto para escrita → PARAR, RMBC e obrigatorio
- **VETO-LC-3:** Entregar sem audit de Hopkins (Dia 7) → PARAR, audit e obrigatorio
- **VETO-LC-4:** Awareness nao diagnosticado → PARAR, voltar ao Passo 1
- **VETO-LC-5:** VSL sem mecanismo unico definido → PARAR, ativar @todd-brown
- **VETO-LC-6:** Emails sem open loops entre eles → PARAR, ativar @andre-chaperon
- **VETO-LC-7:** Menos de 15 bullets/fascinations no lancamento inteiro → PARAR, criar mais com @gary-bencivenga
- **VETO-LC-8:** Oferta sem Value Equation aplicada → PARAR, ativar @alex-hormozi
- **VETO-LC-9:** Publicar campanha sem sequencia de carrinho abandonado → PARAR, e receita deixada na mesa

---

## INPUT VALUE

```yaml
produto:
  nome: ""
  tipo: "curso | mentoria | SaaS | servico | produto_fisico"
  preco: ""
  entrega: "imediata | data_especifica | rolling"

publico:
  avatar_resumo: ""
  awareness_estimado: "unaware | problem | solution | product | most_aware"
  tamanho_lista: ""
  canais_trafego: ["email", "ads", "organico", "afiliados"]

lancamento:
  tipo: "seed | interno | jeff_walker | webinar | challenge | direto"
  data_abertura: ""
  data_fechamento: ""
  duracao_carrinho: "3-7 dias"

assets_existentes:
  tem_oferta: true | false     # Se true, pular Passo 2
  tem_vsl: true | false        # Se true, pular Dia 4 Passo 2
  tem_lista_email: true | false
  provas_disponiveis: ["testimonials", "numeros", "casos", "estudos"]

restricoes:
  budget_ads: ""
  deadline: ""
  tom_marca: "formal | conversacional | agressivo | educativo"
```

---

## PRE-CHECKLIST

- [ ] Produto/servico definido com clareza
- [ ] Publico-alvo identificado (ao menos rascunho de avatar)
- [ ] Tipo de lancamento decidido
- [ ] Data de abertura e fechamento definidas
- [ ] Provas disponiveis listadas (testimonials, numeros, casos)
- [ ] Stack de valor (ao menos rascunho)
- [ ] Budget de ads definido (se aplicavel)
- [ ] Canais de trafego decididos

---

## FASE 1: FUNDACAO ESTRATEGICA (Dia 1-2)

### Passo 1: Diagnostico de Awareness
**Clone:** @eugene-schwartz

**Acoes:**
1. Mapear os 5 niveis de consciencia no mercado-alvo
2. Identificar onde esta a maioria do publico POR CANAL:
   - Lista de email → provavelmente Product/Solution Aware
   - Ads frios → provavelmente Unaware/Problem Aware
   - Organico/afiliados → varia
3. Definir tom e extensao de copy necessarios por canal:
   - Unaware → Copy LONGO, educativo, storytelling
   - Problem Aware → Copy medio-longo, agitar dor
   - Solution Aware → Copy medio, diferenciar com mecanismo
   - Product Aware → Copy medio-curto, stack + objecoes
   - Most Aware → Copy curto, oferta direta

**Output:** Diagnostico de awareness por canal + estrategia de abordagem

**CHECKPOINT 1:** Awareness documentado por canal? Se NAO → VETO-LC-4

---

### Passo 2: Construcao de Oferta
**Clone:** @alex-hormozi

**Acoes:**
1. Aplicar Value Equation: Valor = (Dream Outcome x Perceived Likelihood) / (Time x Effort)
2. Identificar Dream Outcome especifico
3. Listar todos problemas/obstaculos entre estado atual e dream outcome
4. Criar solucao para cada problema (cada problema = componente do stack)
5. Estruturar stack de valor (minimo 3 componentes + 1 bonus)
6. Definir garantia(s) — reversa, condicional, ou dupla
7. Precificar com logica (preco = fracao do valor entregue)

**Output:** Grand Slam Offer completa com stack, garantia e pricing

**CHECKPOINT 2:** Oferta com Value Equation? Se NAO → VETO-LC-8

---

### Passo 3: Unique Mechanism
**Clone:** @todd-brown

**Acoes:**
1. Identificar por que solucoes anteriores falharam para o publico
2. Criar mecanismo do PROBLEMA:
   - Qual a causa raiz que ninguem aborda?
   - Por que as "solucoes obvias" nao funcionam?
3. Criar mecanismo da SOLUCAO:
   - Qual a "peca que faltava"?
   - Como seu produto resolve diferente?
4. Aplicar E5 Method (Envision → Engineer → Evaluate → Enhance → Expand)
5. Nomear o metodo/sistema (nome memoravel e proprietario)
6. Criar Big Marketing Idea:
   - Intelectualmente interessante
   - Emocionalmente compelling
   - Especifica e exclusiva

**Output:** Mecanismo unico documentado + Big Idea + nome do metodo

**CHECKPOINT 3:** Mecanismo definido e nomeado? Se NAO → VETO-LC-5

---

### Passo 4: Avatar Detalhado
**Clone:** @dan-kennedy

**Acoes:**
1. Construir avatar Kennedy-style (alem de demograficos):
   - O que mantem acordado a noite?
   - Quem culpa pelos problemas?
   - O que secretamente deseja?
   - Quais fracassos anteriores assombram?
   - Qual cenario de sucesso perfeito?
2. Aplicar framework 4Ms (Market, Message, Media, Moment)
3. Listar TODAS as objecoes (minimo 10)
4. Rankear objecoes por frequencia/impacto
5. Para cada objecao top 5, preparar neutralizacao

**Output:** Avatar completo com objecoes rankeadas + neutralizacoes

---

## FASE 2: ESTRUTURACAO RMBC (Dia 3)

### Passo Unico: RMBC Completo
**Clone:** @stefan-georgi

**R — RESEARCH (40% do tempo):**
1. Compilar linguagem exata do mercado (reviews, foruns, comentarios)
2. Listar dores especificas com CITACOES DIRETAS do publico
3. Mapear solucoes tentadas e por que falharam
4. Listar desejos secretos (o que querem mas nao admitem publicamente)
5. Documentar objecoes nas palavras deles

**M — MECHANISM (25% do tempo):**
1. Escrever mecanismo do problema em formato copy (nao bullet points)
2. Escrever mecanismo da solucao em formato copy
3. Integrar com Big Idea do Passo 3

**B — BRIEF (15% do tempo):**
1. Historia de origem do produto (quem criou, por que, como descobriu)
2. Componentes principais e beneficios de cada
3. Provas existentes compiladas
4. Oferta completa em formato narrativo
5. Bonus e garantia em formato copy

**C — COPY CHUNKS (20% do tempo):**
1. Escrever pedacos de copy ja prontos para uso nos dias seguintes
2. Headlines preliminares baseadas no Research
3. Bullets preliminares baseados nos desejos/dores

**Output:** Documento RMBC completo — pedacos de copy ja prontos para Dia 4-5

**CHECKPOINT 4:** RMBC completo com copy chunks? Se NAO → VETO-LC-2

---

## FASE 3: EXECUCAO DE COPY (Dia 4-5)

### Passo 1: Headlines (25-50 variantes)
**Clones:** @eugene-schwartz + @john-carlton

**Acoes:**
1. @eugene-schwartz: Gerar 15 headlines calibradas ao awareness
2. @john-carlton: Gerar 15 headlines agressivas/diretas
3. Combinar e gerar 10-20 hibridas
4. Selecionar 5 finalistas para teste
5. Escolher headline principal + 2 alternativas

**Formulas de Referencia:**
```
- Agora: "[Revelacao chocante] que [% da populacao] ignora"
- Ramit: "Como [resultado especifico] em [tempo] (mesmo se [obstaculo])"
- ClickFunnels: "[Numero] simples [passos] para [resultado] sem [dor]"
```

**Output:** Bank de 25-50 headlines + 5 finalistas

---

### Passo 2: VSL Principal
**Clone:** @jon-benson

**Acoes:**
1. Aplicar 5-Step VSL Formula:
   - Step 1: Problem/Pain (agitar)
   - Step 2: Agitate (consequencias)
   - Step 3: Solution (mecanismo)
   - Step 4: Proof (validacao)
   - Step 5: Offer (stack + CTA)
2. Criar script completo (15-45 min dependendo do awareness)
3. Estruturar slides visuais
4. Integrar copy chunks do RMBC
5. Incluir CTA em minimo 2 pontos do VSL

**Output:** Script de VSL completo + estrutura de slides

---

### Passo 3: Bullets e Fascinations
**Clone:** @gary-bencivenga

**Acoes:**
1. Criar 30-50 bullets usando formulas:
   - CONTRARIAN: "Por que [crenca comum] esta errado"
   - SPECIFIC BENEFIT: "Como [resultado] em [tempo] sem [X]"
   - CURIOSITY GAP: "A tecnica de [personagem] para [beneficio]"
   - FEAR-BASED: "O sinal de alerta que [%] ignoram"
   - PROOF-BASED: "Estudo de [instituicao] revela [descoberta]"
2. Selecionar 15-20 melhores
3. Distribuir em: VSL, sales page, emails, ads

**Output:** Bank de 30-50 bullets + 15-20 selecionados e distribuidos

**CHECKPOINT 5:** Minimo 15 bullets? Se NAO → VETO-LC-7

---

### Passo 4: Injetar Emocao em Toda Copy
**Clone:** @clayton-makepeace

**Acoes:**
1. Revisar VSL, sales page lead e body:
   - Adicionar linguagem sensorial — leitor SENTE no corpo
   - Amplificar dor com consequencias reais
   - Vivid sensory language (nao descrever, fazer VIVER)
2. Criar future pacing poderoso:
   - Transportar leitor para o "depois"
   - Detalhes sensoriais do resultado alcancado
   - "Daqui a [tempo], voce vai [cenario vivido]..."
3. Verificar que cada peca tem arco emocional (dor → esperanca → acao)

**Output:** Copy com emocao visceral integrada em todas as pecas

---

## FASE 4: SEQUENCIAS DE EMAIL (Dia 6)

### Passo 1: Sequencia Principal (Pre-Lancamento + Lancamento)
**Clone:** @andre-chaperon

**Acoes:**
1. Criar Soap Opera Sequence de 5-7 emails pre-lancamento:
   - Email 1: Setting the stage (historia pessoal)
   - Email 2: Backstory + high drama
   - Email 3: Epiphany (descoberta do mecanismo)
   - Email 4: Hidden benefits
   - Email 5: Urgency + transition para oferta
2. Criar 3-5 emails de carrinho aberto:
   - Email 1: Abertura + oferta completa
   - Email 2: Objecao principal neutralizada
   - Email 3: Prova social / case study
   - Email 4: FAQ + ultimas objecoes
   - Email 5: Ultimo dia / urgencia real
3. Estruturar open loops entre TODOS os emails (cada email cria gancho para o proximo)
4. Mapear segmentacoes (quem abriu, quem clicou, quem nao abriu)

**Output:** 10-12 emails com open loops e segmentacao

**CHECKPOINT 6:** Emails com open loops? Se NAO → VETO-LC-6

---

### Passo 2: Sequencia de Carrinho Abandonado
**Ferramenta:** Sugarman 31 Triggers

**Acoes:**
1. Criar 3-4 emails especificos para quem abandonou checkout:
   - Email 1 (1h depois): Lembrete suave + trigger Involvement (01)
   - Email 2 (24h depois): Objecao + trigger Honesty (02) + Reciprocity (27)
   - Email 3 (48h depois): Prova social + trigger Desire to Belong (12)
   - Email 4 (72h depois): Urgencia real + trigger Fear (31) + Instant Gratification (21)
2. Cada email usa triggers especificos de Sugarman

**Output:** Sequencia de 3-4 emails de carrinho abandonado

---

### Passo 3: Sequencia de Nurturing (pos-lancamento)
**Clone:** @ben-settle

**Acoes:**
1. Criar 5 templates de email diario estilo Settle:
   - Entertainment + educacao + pitch suave
   - Cada email pode funcionar standalone
2. Definir temas recorrentes (contrarian, historia, rant, lesson, CTA)
3. Setup de reengajamento para quem nao comprou

**Output:** 5 templates de email ongoing + estrategia pos-lancamento

---

## FASE 5: ADS E CONTEUDO DE TRAFEGO (Dia 6 — tarde)

### Passo 1: Criativos de Ads
**Clones:** @john-carlton (headlines) + @alex-hormozi (offer angle)

**Acoes:**
1. Criar 5 variantes de ad copy para cada canal:
   - Facebook/Instagram: 3 formatos (imagem, carousel, video hook)
   - Google: 3 headlines + 2 descricoes
   - YouTube: Hook de 5 segundos + script de 30-60s
2. Cada variante calibrada ao awareness do canal (ads frios = Problem Aware)
3. Integrar bullets top do bank criado no Dia 4

**Output:** 15+ criativos de ads por canal

---

### Passo 2: Conteudo Organico de Suporte (opcional)
**Clone:** @dan-koe

**Acoes:**
1. Criar 3 posts pre-lancamento (educativos, sem vender):
   - Post 1: Revelar o problema (awareness building)
   - Post 2: Revelar parte do mecanismo (curiosidade)
   - Post 3: Case/resultado (prova social)
2. Formatar para redes principais (Twitter/X, Instagram, LinkedIn)

**Output:** 3 posts organicos formatados por rede

---

## FASE 6: OTIMIZACAO E AUDIT (Dia 7)

### Passo 1: Audit Cientifico Completo
**Clone:** @claude-hopkins

**Acoes:**
1. Audit de HEADLINE (VSL + Sales Page + Emails):
   - [ ] Promete beneficio especifico?
   - [ ] Seleciona publico certo?
   - [ ] Cria curiosidade para continuar?
   - [ ] Testavel como A/B?

2. Audit de BODY/SCRIPT:
   - [ ] Usa especificidade vs generalidades?
   - [ ] Tem prova de cada claim?
   - [ ] Flui logicamente sem saltos?
   - [ ] Responde objecoes principais?

3. Audit de OFERTA:
   - [ ] Clara e simples de entender?
   - [ ] Valor percebido alto?
   - [ ] Urgencia real (nao falsa)?
   - [ ] Garantia que remove risco?

4. Audit de CTA (em todas as pecas):
   - [ ] Acao clara?
   - [ ] Facil de executar?
   - [ ] Repetido adequadamente (minimo 3 no VSL/sales page)?

5. Audit de EMAILS:
   - [ ] Subject lines com curiosidade?
   - [ ] Open loops funcionam?
   - [ ] Cada email tem CTA claro?
   - [ ] Sequencia conta historia coerente?

**Output:** Relatorio de audit com score por peca + itens para corrigir

**CHECKPOINT 7:** Audit Hopkins aprovado? Se NAO → VETO-LC-3

---

### Passo 2: Injecao Final de Sugarman Triggers
**Ferramenta:** Sugarman 31 Triggers

**Acoes:**
1. Passar checklist de 31 triggers por TODA a campanha (VSL + page + emails + ads)
2. Identificar 5-10 triggers ausentes que fazem sentido
3. Injetar em pontos estrategicos sem forcar
4. Verificar que nao exagerou (equilibrio entre persuasao e autenticidade)

**Output:** Campanha com 5-10 triggers adicionais integrados

---

### Passo 3: Revisao Final e Entrega
**Clone:** @copy-maestro (orquestrador)

**Acoes:**
1. Ler TODAS as pecas em sequencia (simular jornada do cliente)
2. Verificar coerencia de tom entre pecas (VSL → emails → ads → page)
3. Verificar que CTAs e links estao corretos
4. Verificar que urgencia/escassez e consistente em todas pecas
5. Gerar versao final de cada peca

**Output:** Campanha completa aprovada para publicacao

---

## FAILURE / REWORK MATRIX

| Checkpoint | Falha | Acao | Max Iteracoes |
|------------|-------|------|---------------|
| CP-1: Awareness | Awareness nao documentado | Voltar ao Passo 1.1 | 2 |
| CP-2: Oferta | Value Equation incompleta | Voltar ao Passo 1.2 | 2 |
| CP-3: Mecanismo | Mecanismo generico | Voltar ao Passo 1.3 | 2 |
| CP-4: RMBC | Copy chunks insuficientes | Expandir RMBC | 2 |
| CP-5: Bullets | Menos de 15 bullets | Gerar mais bullets | 3 |
| CP-6: Emails | Sem open loops | Reescrever sequencia | 2 |
| CP-7: Audit | Hopkins reprova | Corrigir itens + re-audit | 3 |

**Apos max iteracoes sem resolver:** ESCALAR para @copy-maestro para decisao manual.

---

## POS-CHECKLIST COMPLETA

### Fundacao (Dia 1-2):
- [ ] Awareness diagnosticado POR CANAL
- [ ] Grand Slam Offer com stack, garantia e pricing
- [ ] Mecanismo unico definido + Big Idea nomeada
- [ ] Avatar Kennedy completo com 10+ objecoes rankeadas

### Estrutura (Dia 3):
- [ ] RMBC completo (Research, Mechanism, Brief, Copy chunks)
- [ ] Copy chunks prontos para uso nos dias seguintes

### Copy Principal (Dia 4-5):
- [ ] 25+ headlines geradas, 5 finalistas selecionadas
- [ ] VSL script completo (15-45 min)
- [ ] Slides estruturados para VSL
- [ ] 30+ bullets criados, 15+ integrados
- [ ] Emocao visceral injetada em todas as pecas
- [ ] Future pacing poderoso

### Emails (Dia 6):
- [ ] 5-7 emails pre-lancamento (Soap Opera Sequence)
- [ ] 3-5 emails de carrinho aberto
- [ ] 3-4 emails de carrinho abandonado
- [ ] Open loops entre todos os emails
- [ ] Segmentacoes mapeadas
- [ ] 5 templates de email ongoing (Settle-style)

### Ads e Trafego (Dia 6):
- [ ] 15+ criativos de ads por canal
- [ ] Hooks calibrados ao awareness do canal
- [ ] 3 posts organicos de suporte (opcional)

### Otimizacao (Dia 7):
- [ ] Audit Hopkins completo em TODAS as pecas
- [ ] 5-10 Sugarman triggers integrados
- [ ] Coerencia de tom entre todas as pecas
- [ ] CTAs e links verificados
- [ ] Jornada do cliente simulada (leitura sequencial)

### Entrega Final:
- [ ] VSL script + slides
- [ ] Sales page completa (ou link para sales-page-killer.md se executado)
- [ ] 10-12 emails de lancamento
- [ ] 3-4 emails de carrinho abandonado
- [ ] 15+ criativos de ads
- [ ] Relatorio de audit Hopkins
- [ ] Plano de testes A/B

---

## EXEMPLO DE USO

```
Entrada: "Lancamento de curso de marketing digital, R$997,
         lista de 5000 emails, ads no Facebook/Instagram"

Dia 1: @schwartz diagnostica awareness (lista = Product Aware, ads = Problem Aware)
Dia 1: @hormozi cria Grand Slam Offer com 4 modulos + 3 bonus
Dia 2: @todd-brown cria mecanismo "Metodo [Nome]" + Big Idea
Dia 2: @kennedy completa avatar com 12 objecoes rankeadas
Dia 3: @georgi executa RMBC completo com copy chunks
Dia 4: @schwartz/@carlton geram 40 headlines, 5 finalistas
Dia 4: @benson cria VSL de 25 min
Dia 4: @bencivenga cria 35 bullets, 18 selecionados
Dia 5: @makepeace injeta emocao visceral em VSL + page
Dia 6: @chaperon cria SOS de 6 emails + 4 emails carrinho aberto
Dia 6: @settle cria 5 templates ongoing
Dia 6: @carlton/@hormozi criam 18 criativos de ads
Dia 7: @hopkins audita TODA a campanha
Dia 7: Sugarman triggers injetados (8 triggers)
Dia 7: @copy-maestro revisao final — APROVADO

Entrega: VSL (25min) + 12 emails + 18 ads + sales page + audit report
```

---

_Workflow Version: 2.0.0_
_Upgraded: 2026-02-16 — Added checkpoints, INPUT VALUE, failure matrix, pos-checklist, example_
_Squad: copywriting-squad_
