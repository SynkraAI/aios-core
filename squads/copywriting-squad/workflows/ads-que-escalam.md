# Workflow: Ads que Escalam

## Metadados
```yaml
id: ads-que-escalam
versao: 1.2.0
duracao: 2-3 dias
complexidade: media
output: Pack completo de criativos para tráfego pago
dependencies:
  optional_pre:
    - oferta-irresistivel.md (se oferta ja estruturada, hooks mais fortes)
    - maquina-de-leads.md (se lead magnet ja existir, ads direcionam para LP)
  feeds_into:
    - lancamento-completo.md (criativos integrados na campanha)
  checklists:
    - sugarman-31-triggers.md
```

---

## VISAO GERAL

Criar pack de anúncios (copy + estrutura) otimizados para escalar em Facebook, Instagram, Google e YouTube.

**Resultado esperado:** 20+ variações de anúncios prontos para testar.

---

## FRAMEWORK 9 PASSOS

### PASSO 1: INPUT
**O que entra:**
- Produto/oferta a promover
- Público-alvo
- Destino do clique (LP, VSL, WhatsApp)
- Orçamento estimado
- Plataformas (FB, IG, Google, YouTube)
- Histórico de ads (se houver)

### PASSO 2: INPUT VALUE
```yaml
produto:
  nome: ""
  preco: ""
  promessa_principal: ""
  diferenciais: []

publico:
  avatar: ""
  dores: []
  desejos: []
  objecoes: []

campanha:
  objetivo: "leads|vendas|trafego"
  plataformas: []
  destino: "lp|vsl|whatsapp|direto"
  orcamento_diario: ""
```

### PASSO 3: PRE-CHECKLIST
- [ ] Oferta está clara?
- [ ] Sabe quem é o público?
- [ ] Landing Page/VSL está pronta?
- [ ] Definiu plataformas?
- [ ] Tem referências visuais?

### PASSO 4: PERSONA/EXECUTOR

| Fase | Clone | Função |
|------|-------|--------|
| 1. Awareness | @eugene-schwartz | Classificar público |
| 2. Hooks | @john-carlton | Criar aberturas diretas |
| 3. Storytelling | @gary-halbert | Hooks narrativos |
| 4. Bullets | @gary-bencivenga | Fascinations para ads |
| 5. Video | @jon-benson | Scripts de video ads |
| 6. Emoção | @clayton-makepeace | Amplificar dor/desejo |

### PASSO 5: PROMPT DE EXECUÇÃO

---

#### FASE 1: Classificar Awareness do Tráfego (15 min)
**Clone:** @eugene-schwartz

**Por plataforma:**

| Plataforma | Awareness Típico | Abordagem |
|------------|------------------|-----------|
| Facebook/IG Feed | Unaware/Problem | Interromper + educar |
| Facebook/IG Reels | Unaware | Pattern interrupt forte |
| Google Search | Solution/Product | Direto ao benefício |
| YouTube Ads | Problem/Solution | Hook + história |
| Google Display | Unaware | Curiosidade extrema |

**Output:** Mapa de awareness por plataforma

---

#### FASE 2: Hooks Diretos (1h)
**Clone:** @john-carlton

**Criar 20 hooks diretos (estilo Carlton):**

**Fórmulas:**
1. **Resultado + Tempo**
   - "Como [resultado] em [tempo] sem [obstáculo]"

2. **Número + Benefício**
   - "[Número] maneiras de [benefício] que [prova]"

3. **Pergunta Dolorosa**
   - "Cansado de [dor]? Existe um jeito melhor."

4. **Curiosidade Específica**
   - "O erro de R$[X] que [%] das pessoas cometem"

5. **Contrarian**
   - "Por que [crença comum] está destruindo seu [objetivo]"

6. **FOMO**
   - "[Número] pessoas já [resultado]. Você é o próximo?"

7. **Problema → Solução**
   - "[Problema]? Descobri como resolver em [tempo]"

**Output:** Lista de 20 hooks com variações

---

#### FASE 3: Hooks Narrativos (1h)
**Clone:** @gary-halbert

**Criar 10 hooks de história:**

**Estruturas:**
1. **Confissão**
   - "Preciso te contar uma coisa que aconteceu..."

2. **Descoberta**
   - "Semana passada descobri algo que mudou tudo..."

3. **Bastidor**
   - "Vou te mostrar nos bastidores como..."

4. **Cliente**
   - "A Maria me mandou mensagem dizendo..."

5. **Fracasso → Sucesso**
   - "Perdi tudo. Até descobrir que..."

**Formato para cada:**
- Hook (primeira frase)
- Setup (2-3 frases)
- Ponte para CTA

**Output:** 10 hooks narrativos estruturados

---

#### FASE 4: Fascinations para Ads (45 min)
**Clone:** @gary-bencivenga

**Criar 30 bullets curtos para usar em:**
- Carrosséis
- Imagens com texto
- Descrições de anúncio

**Tipos:**
- Curiosity gap (10)
- Specific benefit (10)
- Fear-based (10)

**Formato:** Máximo 15 palavras cada

**Output:** Bank de 30 bullets para ads

---

#### FASE 5: Scripts de Video Ads (2h)
**Clone:** @jon-benson

**Criar 5 scripts de video ad:**

**FORMATO A: Hook Rápido (15-30 segundos)**
```
[0-3s] HOOK - Pattern interrupt
[3-10s] PROBLEMA - Agitar dor
[10-20s] SOLUÇÃO - Apresentar promessa
[20-30s] CTA - Ação clara
```

**FORMATO B: Story Ad (30-60 segundos)**
```
[0-5s] HOOK - "Preciso te contar..."
[5-20s] HISTÓRIA - Setup rápido
[20-40s] VIRADA - Descoberta/solução
[40-60s] CTA - "Clique para..."
```

**FORMATO C: Educativo (45-90 segundos)**
```
[0-5s] HOOK - "Você sabia que..."
[5-30s] CONTEÚDO - 3 dicas rápidas
[30-60s] PRODUTO - Conectar com oferta
[60-90s] CTA - Prova + ação
```

**FORMATO D: UGC Style (15-45 segundos)**
```
[0-3s] HOOK - "Isso mudou minha vida"
[3-20s] ANTES/DEPOIS - Transformação
[20-35s] PROVA - Resultado específico
[35-45s] CTA - "Testa você também"
```

**FORMATO E: Direct Response (15-30 segundos)**
```
[0-3s] HOOK - Pergunta ou afirmação forte
[3-15s] BENEFÍCIOS - 3 bullets rápidos
[15-25s] PROVA - Social proof rápido
[25-30s] CTA - Urgência
```

**Output:** 5 scripts de video com variações

---

#### FASE 6: Amplificar Emoção (30 min)
**Clone:** @clayton-makepeace

**Revisar todos os hooks e:**
1. Adicionar linguagem sensorial
2. Amplificar dor nos hooks de problema
3. Amplificar desejo nos hooks de resultado
4. Criar urgência emocional (não artificial)

**Exemplo de amplificação:**
- Antes: "Cansado de não ter resultados?"
- Depois: "Aquela sensação no estômago quando mais um mês passa e nada muda..."

**Output:** Hooks revisados com emoção

---

### PASSO 6: TOOLS/SCRIPTS
- 6 clones especializados
- Templates por plataforma
- Checklist de compliance (políticas de ads)

### PASSO 7: OUTPUT
```yaml
entregaveis:
  - hooks_diretos_20.md
  - hooks_narrativos_10.md
  - bullets_ads_30.md
  - scripts_video_5.md
  - matriz_plataforma_awareness.md

por_plataforma:
  facebook_feed:
    - 10 copies de texto
    - 5 hooks de carrossel
    - 3 scripts de video
  instagram_reels:
    - 5 scripts curtos (15s)
    - 5 hooks de abertura
  google_search:
    - 10 headlines
    - 5 descrições
  youtube:
    - 3 scripts (30-60s)
    - 5 hooks de abertura
```

### PASSO 8: POS-CHECKLIST
- [ ] Tem variações suficientes para testar?
- [ ] Hooks são diferentes entre si?
- [ ] Video scripts têm hook nos primeiros 3s?
- [ ] Compliance com políticas?
- [ ] CTAs são claros?

### PASSO 9: OUTPUT FINAL
**Pack completo:**
- 20 hooks de texto direto
- 10 hooks narrativos
- 30 bullets para ads
- 5 scripts de video
- Organizado por plataforma
- Instruções de teste A/B

---

## MATRIZ DE TESTE

| Semana | Testar | Variações |
|--------|--------|-----------|
| 1 | Hooks (abertura) | 5 variações |
| 2 | Ângulos (dor vs desejo) | 3 variações |
| 3 | Formatos (video vs imagem) | 2 variações |
| 4 | CTAs | 3 variações |

---

## REGRAS DE COMPLIANCE

**Facebook/Instagram:**
- Não usar "você" em claims de resultado
- Não prometer resultados específicos de dinheiro
- Evitar before/after extremos
- Cuidado com claims de saúde

**Google:**
- Headline max 30 caracteres
- Descrição max 90 caracteres
- Não usar superlativos sem prova
- Não usar pontuação excessiva

**YouTube:**
- Hook em 5 segundos (skipável)
- Não começar com pergunta direta ao viewer
- Incluir CTA verbal E visual

---

## CHECKPOINTS

| Checkpoint | Após | Critério de Aprovação | Ação se Falhar |
|------------|------|----------------------|----------------|
| CP-1 | Fase 1 | Mapa de awareness por plataforma completo com abordagem definida para cada canal | Voltar para Fase 1 — reclassificar awareness |
| CP-2 | Fase 2 | Mínimo 20 hooks diretos usando pelo menos 4 fórmulas distintas | Voltar para Fase 2 — completar variações |
| CP-3 | Fase 3 | 10 hooks narrativos com estrutura (hook + setup + ponte CTA) | Voltar para Fase 3 — reescrever hooks fracos |
| CP-4 | Fase 4 | 30 bullets (10 curiosity + 10 benefit + 10 fear), cada um com max 15 palavras | Voltar para Fase 4 — rebalancear tipos |
| CP-5 | Fase 5 | 5 scripts de video nos 5 formatos (A-E) com timing definido | Voltar para Fase 5 — completar formatos faltantes |
| CP-6 | Fase 6 | Hooks revisados com linguagem sensorial e emoção amplificada vs versão original | Voltar para Fase 6 — amplificação insuficiente |
| CP-FINAL | Passo 8 | Pós-checklist 100% aprovado + compliance por plataforma verificado | Revisar fases com falhas |

---

## VETO CONDITIONS

Condições que PARAM o workflow imediatamente:

| ID | Condição | Severidade | Ação |
|----|----------|-----------|------|
| VT-1 | Hooks violam políticas de ads da plataforma (claims de renda, saúde sem prova) | BLOCKING | PARAR — revisar compliance antes de continuar |
| VT-2 | Destino do clique (LP/VSL) não existe ou não está pronto | BLOCKING | PARAR — resolver destino antes de criar ads |
| VT-3 | Todos os hooks usam a mesma fórmula/ângulo (sem diversidade de teste) | HIGH | PAUSAR — reescrever com variação de ângulos |
| VT-4 | Video scripts não têm hook nos primeiros 3 segundos | HIGH | PAUSAR — refazer abertura de cada script |

---

## FAILURE/REWORK

| Cenário | Ação | Max Iterações |
|---------|------|---------------|
| Checkpoint falhou | Retornar à fase anterior, refazer com feedback | 2 |
| Veto triggered | STOP completo, resolver condição antes de continuar | 1 |
| Output abaixo do mínimo de variações | Chamar @gary-halbert ou @john-carlton para review cruzado | 1 |

---

## DIA 3: LANDING PAGE + VARIANTES PARA TESTE (Expansão Framework)

> Esta fase completa o workflow original do Framework Estrategico (WF2 Trafego Pago Rapido - Dia 3).
> Ads sem destino otimizado desperdicam orcamento.

### FASE 7: Landing Page Copy
**Clones:** @jon-benson (se video) ou @gary-halbert (se texto)

**Decisao:** Video ou texto performa melhor para este publico?
- **Video:** Criar VSL curta (5-10 min) com @jon-benson — 5-Step Formula simplificada
- **Texto:** Criar sales page curta com @gary-halbert — AIDA com storytelling pessoal

**Acoes:**
1. Headline principal (usar melhor hook das Fases 2-3)
2. Subheadline que expande promessa
3. Lead que conecta com dor do avatar
4. Body copy com mecanismo + beneficios
5. Proof section (testimonials, numeros, logos)
6. Oferta clara com stack simplificado
7. CTA repetido 2-3 vezes
8. PS. com urgencia

**Output:** Copy de landing page completa (texto ou script de VSL curta)

---

### FASE 8: Bullets para Landing Page
**Clone:** @gary-bencivenga

**Acoes:**
1. Selecionar 10-15 melhores bullets do banco da Fase 4
2. Adaptar para formato de pagina (mais espaco que ad)
3. Criar 5 bullets adicionais com provas especificas
4. Distribuir em secoes estrategicas da LP

**Output:** 15-20 bullets integrados na landing page

---

### FASE 9: Variantes para Teste A/B
**Clone:** @claude-hopkins

**Acoes:**
1. Criar 3 variantes de headline (usando diferentes angulos das Fases 2-3)
2. Criar 2 variantes de oferta (stack diferente, mesma essencia)
3. Criar 2 variantes de CTA (urgencia vs beneficio)
4. Definir plano de teste:
   - Semana 1: Testar headlines (3 variantes)
   - Semana 2: Testar oferta (2 variantes)
   - Semana 3: Testar CTA (2 variantes)
5. Definir metrica de sucesso (conversao de LP, nao apenas CTR do ad)
6. Calcular trafego minimo para significancia

**Output:** 3 variantes de LP + plano de testes

---

### POS-CHECKLIST DIA 3
- [ ] LP copy completa (texto ou VSL curta)
- [ ] 15-20 bullets integrados na LP
- [ ] 3 variantes de headline criadas
- [ ] 2 variantes de oferta criadas
- [ ] 2 variantes de CTA criadas
- [ ] Plano de teste A/B documentado
- [ ] Ads conectam corretamente com LP
- [ ] Fluxo completo testado (ad → LP → conversao)

---

**Versão:** 1.2.0
**Criado por:** @pedro-valerio (Framework 9 Passos)
**Expandido em:** 2026-02-16 (Dia 3 adicionado conforme Framework Estrategico WF2)
