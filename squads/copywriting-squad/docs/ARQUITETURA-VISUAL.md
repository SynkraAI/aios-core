# Arquitetura Visual - Copywriting Squad

## Documentação de como cada agente trabalha dentro dos workflows

---

## 1. HIERARQUIA DOS TIERS

```
                         ┌─────────────────────────────────────┐
                         │          COPY MAESTRO               │
                         │      (Orquestrador Geral)           │
                         │   Decide quem entra em campo        │
                         └──────────────┬──────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│      TIER 1         │    │       TIER 2        │    │       TIER 3        │
│   ESTRATEGISTAS     │    │     EXECUTORES      │    │    OTIMIZADORES     │
│                     │    │                     │    │                     │
│  Usar ANTES de      │───►│  Usar PARA          │───►│  Usar DEPOIS de     │
│  escrever           │    │  escrever           │    │  escrever           │
│                     │    │                     │    │                     │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ Schwartz      │  │    │  │ Halbert       │  │    │  │ Hopkins       │  │
│  │ Kennedy       │  │    │  │ Carlton       │  │    │  └───────────────┘  │
│  │ Todd Brown    │  │    │  │ Makepeace     │  │    │                     │
│  │ Hormozi       │  │    │  │ Bencivenga    │  │    │  ┌───────────────┐  │
│  │ Georgi        │  │    │  │ Benson        │  │    │  │ Sugarman      │  │
│  └───────────────┘  │    │  │ Ogilvy        │  │    │  │ (Checklist)   │  │
│                     │    │  │ Settle        │  │    │  └───────────────┘  │
│  5 agentes          │    │  │ Chaperon      │  │    │                     │
│                     │    │  │ Dan Koe       │  │    │  1 agente +         │
│                     │    │  └───────────────┘  │    │  1 ferramenta       │
│                     │    │                     │    │                     │
│                     │    │  9 agentes          │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

---

## 2. O QUE CADA AGENTE FAZ

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TIER 1 - ESTRATEGISTAS                             │
│                        "Os Arquitetos da Fundação"                           │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ EUGENE SCHWARTZ │  ◄── SEMPRE PRIMEIRO
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Diagnosticar o nível de consciência do mercado                    │
│                                                                             │
│  INPUT:  Descrição do público + produto                                    │
│  OUTPUT: Classificação de awareness (1-5) + recomendações                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NÍVEIS DE CONSCIÊNCIA                                              │   │
│  │                                                                      │   │
│  │  1. UNAWARE ──────► Não sabe do problema    ──► Copy LONGO          │   │
│  │  2. PROBLEM AWARE ► Sabe do problema        ──► Copy MÉDIO-LONGO    │   │
│  │  3. SOLUTION AWARE► Conhece soluções        ──► Copy MÉDIO          │   │
│  │  4. PRODUCT AWARE ► Conhece seu produto     ──► Copy CURTO          │   │
│  │  5. MOST AWARE ───► Pronto pra comprar      ──► Copy MUITO CURTO    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *diagnostico, *awareness, *headline, *extensao                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  DAN KENNEDY    │
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Construir avatar profundo + estratégia high-ticket                │
│                                                                             │
│  INPUT:  Público-alvo básico                                               │
│  OUTPUT: Avatar detalhado + Framework 4Ms + objeções mapeadas              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  FRAMEWORK 4Ms                                                       │   │
│  │                                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ MARKET   │  │ MESSAGE  │  │  MEDIA   │  │   MATH   │            │   │
│  │  │          │  │          │  │          │  │          │            │   │
│  │  │ Quem é?  │  │ O que    │  │ Onde     │  │ Números  │            │   │
│  │  │ Onde?    │─►│ falar?   │─►│ falar?   │─►│ fecham?  │            │   │
│  │  │ Dor?     │  │ USP?     │  │ ROI?     │  │ Escala?  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *4ms, *avatar, *high-ticket, *usp, *close-script                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   TODD BROWN    │
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Criar diferenciação em mercado saturado                           │
│                                                                             │
│  INPUT:  Produto + concorrentes                                            │
│  OUTPUT: Unique Mechanism + Big Idea nomeados                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  UNIQUE MECHANISM                                                    │   │
│  │                                                                      │   │
│  │  ┌─────────────────────┐      ┌─────────────────────┐              │   │
│  │  │ MECANISMO DO        │      │ MECANISMO DA        │              │   │
│  │  │ PROBLEMA            │      │ SOLUÇÃO             │              │   │
│  │  │                     │      │                     │              │   │
│  │  │ Por que FALHARAM    │ ───► │ Por que FUNCIONA    │              │   │
│  │  │ antes?              │      │ agora?              │              │   │
│  │  │                     │      │                     │              │   │
│  │  │ "A peça que         │      │ "O método que       │              │   │
│  │  │  faltava era..."    │      │  ataca a raiz..."   │              │   │
│  │  └─────────────────────┘      └─────────────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *mechanism, *big-idea, *e5, *diferenciacao                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  ALEX HORMOZI   │
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Construir ofertas irresistíveis                                   │
│                                                                             │
│  INPUT:  Produto/serviço básico                                            │
│  OUTPUT: Grand Slam Offer + Stack de valor + Garantias                     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  VALUE EQUATION                                                      │   │
│  │                                                                      │   │
│  │         Dream Outcome  ×  Likelihood of Success                     │   │
│  │  VALUE = ─────────────────────────────────────                      │   │
│  │              Time Delay  ×  Effort Required                         │   │
│  │                                                                      │   │
│  │  ┌──────────────┐    ┌──────────────┐                               │   │
│  │  │  AUMENTAR ▲  │    │  DIMINUIR ▼  │                               │   │
│  │  │              │    │              │                               │   │
│  │  │ • Resultado  │    │ • Tempo      │                               │   │
│  │  │ • Confiança  │    │ • Esforço    │                               │   │
│  │  └──────────────┘    └──────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *value-equation, *grand-slam, *stack, *garantia, *pricing       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ STEFAN GEORGI   │
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Estruturar processo sistemático de copy (RMBC)                    │
│                                                                             │
│  INPUT:  Projeto de copy                                                   │
│  OUTPUT: Documento RMBC completo + pedaços de copy prontos                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  RMBC METHOD                                                         │   │
│  │                                                                      │   │
│  │  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐     │   │
│  │  │     R     │   │     M     │   │     B     │   │     C     │     │   │
│  │  │ RESEARCH  │──►│ MECHANISM │──►│   BRIEF   │──►│   COPY    │     │   │
│  │  │           │   │           │   │           │   │           │     │   │
│  │  │ Pesquisa  │   │ Por que   │   │ Pedaços   │   │ Escrita   │     │   │
│  │  │ de        │   │ funciona  │   │ de copy   │   │ final     │     │   │
│  │  │ mercado   │   │ diferente │   │ prontos   │   │           │     │   │
│  │  └───────────┘   └───────────┘   └───────────┘   └───────────┘     │   │
│  │                                                                      │   │
│  │  80% do trabalho é feito ANTES de escrever                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COMANDOS: *rmbc, *research, *mechanism, *brief, *copy                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TIER 2 - EXECUTORES                                │
│                         "Os Escritores Especialistas"                        │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  GARY HALBERT   │  ◄── MESTRE DO STORYTELLING
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Sales letters com storytelling pessoal                            │
│                                                                             │
│  INPUT:  Estratégia definida + história de origem                          │
│  OUTPUT: Sales letter longa com narrativa envolvente                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TÉCNICA: SLIPPERY SLIDE                                             │   │
│  │                                                                      │   │
│  │     Cada frase ──► faz ler ──► a próxima ──► sem parar              │   │
│  │                                                                      │   │
│  │  ESTILO:                                                             │   │
│  │  • Escrever como carta pra amigo                                    │   │
│  │  • Parágrafos curtos (2-3 linhas)                                   │   │
│  │  • Vulnerabilidade + conexão                                         │   │
│  │  • PS. poderoso no final                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Mercado emocional, produto com história, awareness baixo     │
│  COMANDOS: *sales-letter, *storytelling, *headline, *ps, *abertura         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  JOHN CARLTON   │  ◄── MESTRE DO COPY DIRETO
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Copy agressivo sem floreios                                       │
│                                                                             │
│  INPUT:  Estratégia definida                                               │
│  OUTPUT: Copy direto que vende sem pedir desculpas                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ESTILO CARLTON                                                      │   │
│  │                                                                      │   │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │   │
│  │  ║  "Amazing Secret Discovered by One-Legged Golfer              ║  │   │
│  │  ║   Adds 50 Yards to Your Drives..."                            ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │   │
│  │                                                                      │   │
│  │  • Direto ao ponto (zero enrolação)                                 │   │
│  │  • Promessas ousadas (mas cumpríveis)                               │   │
│  │  • Fala com o LIZARD BRAIN (instintos)                              │   │
│  │  • Uma ideia por frase                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Mercado competitivo, público masculino, awareness alto       │
│  COMANDOS: *headline, *copy-direto, *hook, *simple-writing, *ad            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│CLAYTON MAKEPEACE │  ◄── MESTRE DA EMOÇÃO VISCERAL
├──────────────────┴─────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Injetar emoção profunda que causa reação FÍSICA                   │
│                                                                             │
│  INPUT:  Copy existente OU briefing emocional                              │
│  OUTPUT: Copy com linguagem sensorial que faz SENTIR                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TÉCNICAS EMOCIONAIS                                                 │   │
│  │                                                                      │   │
│  │  ANTES (fraco):        DEPOIS (Makepeace):                          │   │
│  │  "Você vai ter         "Imagine acordar às 6h sentindo              │   │
│  │   mais energia"        aquela onda de vitalidade percorrer          │   │
│  │                        seu corpo, como se tivesse 20 anos"          │   │
│  │                                                                      │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │   │
│  │  │ AGITAR DOR     │  │ FUTURE PACING  │  │ RAISE STAKES   │        │   │
│  │  │ Amplificar     │  │ Pintar o       │  │ O que está     │        │   │
│  │  │ sofrimento     │  │ "depois"       │  │ em jogo        │        │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Saúde, finanças, relacionamentos, transformação profunda     │
│  COMANDOS: *agitar-dor, *future-pacing, *sensorial, *stakes                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│ GARY BENCIVENGA  │  ◄── MESTRE DOS BULLETS
├──────────────────┴─────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Criar fascinations/bullets + quebrar objeções                     │
│                                                                             │
│  INPUT:  Benefícios do produto + objeções conhecidas                       │
│  OUTPUT: Bank de bullets + objeções neutralizadas                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TIPOS DE FASCINATIONS                                               │   │
│  │                                                                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ CONTRARIAN  │ │ CURIOSITY   │ │ SPECIFIC    │ │ FEAR-BASED  │   │   │
│  │  │             │ │ GAP         │ │ BENEFIT     │ │             │   │   │
│  │  │ "Por que X  │ │ "O segredo  │ │ "Como fazer │ │ "O erro de  │   │   │
│  │  │  está       │ │  de 3       │ │  X em Y     │ │  R$47k que  │   │   │
│  │  │  errado"    │ │  palavras"  │ │  dias"      │ │  93% cometem│   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │                                                                      │   │
│  │  FÓRMULA: [Benefício] + [Curiosidade] + [Especificidade]            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Sales pages, VSLs, emails, qualquer copy que precisa bullets │
│  COMANDOS: *fascinations, *objecoes, *bullets, *contrarian                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   JON BENSON    │  ◄── INVENTOR DO VSL
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Scripts de Video Sales Letter                                     │
│                                                                             │
│  INPUT:  Estratégia + oferta definida                                      │
│  OUTPUT: Script VSL completo com timing                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  5-STEP VSL FORMULA                                                  │   │
│  │                                                                      │   │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐                         │   │
│  │  │ STEP 1   │   │ STEP 2   │   │ STEP 3   │                         │   │
│  │  │ SNAP     │──►│ USP      │──►│ STORY    │                         │   │
│  │  │ (15 seg) │   │ (30 seg) │   │(5-10 min)│                         │   │
│  │  └──────────┘   └──────────┘   └──────────┘                         │   │
│  │       │                                                              │   │
│  │       └──────────────────────────────────────┐                       │   │
│  │                                              ▼                       │   │
│  │  ┌──────────┐   ┌──────────┐                                        │   │
│  │  │ STEP 5   │◄──│ STEP 4   │                                        │   │
│  │  │ PITCH    │   │ EDUCATE  │                                        │   │
│  │  │(5-10 min)│   │(10-20min)│                                        │   │
│  │  └──────────┘   └──────────┘                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Tráfego pago em escala, lançamentos, produtos digitais       │
│  COMANDOS: *vsl, *3x-vsl, *hook-video, *video-ad, *youtube-ad              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  DAVID OGILVY   │  ◄── COPY PREMIUM
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Copy sofisticado, factual, para público educado                   │
│                                                                             │
│  INPUT:  Produto premium + dados/fatos                                     │
│  OUTPUT: Copy elegante baseado em FATOS, não hype                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ESTILO OGILVY                                                       │   │
│  │                                                                      │   │
│  │  ╔═══════════════════════════════════════════════════════════════╗  │   │
│  │  ║  "At 60 miles an hour, the loudest noise in the new           ║  │   │
│  │  ║   Rolls-Royce comes from the electric clock."                 ║  │   │
│  │  ╚═══════════════════════════════════════════════════════════════╝  │   │
│  │                                                                      │   │
│  │  • FATOS, não adjetivos                                             │   │
│  │  • Copy LONGO vende mais                                            │   │
│  │  • Pesquisa extensa antes de escrever                               │   │
│  │  • Elegante, sem desespero                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: B2B, luxo, público educado, marcas estabelecidas             │
│  COMANDOS: *premium-copy, *headline-factual, *b2b-copy, *luxury-copy       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   BEN SETTLE    │  ◄── EMAIL DIÁRIO
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Emails diários com personalidade que vendem                       │
│                                                                             │
│  INPUT:  Produto + personalidade                                           │
│  OUTPUT: Sistema de email diário + templates                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  INFOTAINMENT = INFORMAÇÃO + ENTRETENIMENTO                         │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  SUBJECT: Curiosa/Controversa                                │    │   │
│  │  │  ABERTURA: Hook com história                                 │    │   │
│  │  │  CORPO: Entretenimento + lição                               │    │   │
│  │  │  PITCH: 3-5 linhas                                           │    │   │
│  │  │  CTA: Simples                                                │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  │  REGRAS:                                                             │   │
│  │  • Email TODO dia                                                    │   │
│  │  • Personalidade 3X (amplificada)                                   │   │
│  │  • Zero medo de polarizar                                           │   │
│  │  • Sempre tem pitch                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Monetizar lista, personal brand, relacionamento              │
│  COMANDOS: *email-diario, *subject-line, *infotainment, *rant              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ ANDRE CHAPERON  │  ◄── AUTOMAÇÃO DE EMAIL
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Sequências automatizadas que convertem                            │
│                                                                             │
│  INPUT:  Oferta + jornada do cliente                                       │
│  OUTPUT: Soap Opera Sequence (SOS) com open loops                          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SOAP OPERA SEQUENCE                                                 │   │
│  │                                                                      │   │
│  │  Email 1 ──► Email 2 ──► Email 3 ──► Email 4 ──► Email 5            │   │
│  │     │          │          │          │          │                    │   │
│  │  [LOOP 1]   [fecha 1]  [fecha 2]  [fecha 3]  [fecha todos]          │   │
│  │  [abre]     [abre 2]   [abre 3]   [abre 4]   [OFERTA]               │   │
│  │                                                                      │   │
│  │  EFEITO ZEIGARNIK: Mente não esquece tarefas incompletas            │   │
│  │  Loop aberto = "coceira mental" = precisa abrir próximo email       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Tráfego frio, onboarding, lançamentos, evergreen             │
│  COMANDOS: *sos, *open-loop, *segmentacao, *onboarding, *carrinho          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    DAN KOE      │  ◄── CONTEÚDO ORGÂNICO
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Posts e threads que viralizam                                     │
│                                                                             │
│  INPUT:  Tema + expertise                                                  │
│  OUTPUT: Posts, threads, newsletters que engajam                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ESTRUTURA DE POST VIRAL                                             │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  HOOK ─────► SETUP ─────► VALOR ─────► TAKEAWAY             │    │   │
│  │  │  (10 words)  (2-3 lines)  (listicle)   (CTA)                │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                      │   │
│  │  HOOKS QUE FUNCIONAM:                                                │   │
│  │  • Contrarian: "Tudo sobre X está errado"                           │   │
│  │  • Curiosity: "Fiz Y usando técnica de 1952"                        │   │
│  │  • Specific: "3 frameworks de X que uso"                            │   │
│  │  • Story: "Em 2019, estava quebrado. Hoje..."                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Construir audiência, organic traffic, personal brand         │
│  COMANDOS: *post, *thread, *newsletter, *hook, *carrossel                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TIER 3 - OTIMIZADORES                              │
│                         "Os Cientistas da Conversão"                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ CLAUDE HOPKINS  │  ◄── AUDIT E TESTES
├─────────────────┴──────────────────────────────────────────────────────────┐
│                                                                             │
│  FUNÇÃO: Auditar copy existente e estruturar testes A/B                    │
│                                                                             │
│  INPUT:  Copy finalizada                                                   │
│  OUTPUT: Relatório de audit + plano de testes                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CHECKLIST DE AUDIT                                                  │   │
│  │                                                                      │   │
│  │  ┌────────────────┐                                                 │   │
│  │  │ HEADLINE       │ □ Benefício específico?                         │   │
│  │  │                │ □ Seleciona público certo?                      │   │
│  │  │                │ □ Cria curiosidade?                             │   │
│  │  ├────────────────┤                                                 │   │
│  │  │ BODY COPY      │ □ Específico vs genérico?                       │   │
│  │  │                │ □ Tem prova de cada claim?                      │   │
│  │  │                │ □ Flui logicamente?                             │   │
│  │  ├────────────────┤                                                 │   │
│  │  │ OFERTA         │ □ Clara e simples?                              │   │
│  │  │                │ □ Valor > Preço óbvio?                          │   │
│  │  │                │ □ Garantia remove risco?                        │   │
│  │  ├────────────────┤                                                 │   │
│  │  │ CTA            │ □ Uma ação clara?                               │   │
│  │  │                │ □ Repetido adequadamente?                       │   │
│  │  └────────────────┘                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  USAR QUANDO: Antes de publicar, quando resultados estão baixos            │
│  COMANDOS: *audit, *headline-audit, *ab-test, *checklist, *otimizar        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  SUGARMAN TRIGGERS (Ferramenta - não é agente)                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FUNÇÃO: Checklist de 31 gatilhos psicológicos para TURBINAR copy          │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  TOP 10 TRIGGERS MAIS USADOS                                       │     │
│  │                                                                     │     │
│  │  #05 VALUE ────────► Mostrar que valor > preço                     │     │
│  │  #09 SATISFACTION ─► Garantia forte                                │     │
│  │  #13 TIMING ───────► Urgência real                                 │     │
│  │  #19 CURIOSITY ────► Gaps de conhecimento                          │     │
│  │  #20 URGENCY ──────► Escassez real                                 │     │
│  │  #22 EXCLUSIVITY ──► Não disponível pra todos                      │     │
│  │  #24 HUMAN ────────► Conexão pessoal                               │     │
│  │  #25 STORYTELLING ─► Narrativa envolvente                          │     │
│  │  #28 SPECIFICITY ──► Números exatos                                │     │
│  │  #31 FEAR ─────────► FOMO                                          │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│  REGRA: Não usar todos! Selecionar 5-10 relevantes.                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUXO DENTRO DOS WORKFLOWS

### VSL MATADOR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW: VSL MATADOR                               │
│                         Duração: 2-3 dias                                   │
└─────────────────────────────────────────────────────────────────────────────┘

     INPUT                                                            OUTPUT
       │                                                                │
       ▼                                                                ▼
┌─────────────┐                                                  ┌─────────────┐
│ • Produto   │                                                  │ • Script    │
│ • Público   │                                                  │ • Slides    │
│ • Preço     │                                                  │ • Bullets   │
│ • Provas    │                                                  │ • Audit     │
└─────────────┘                                                  └─────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  FASE 1                FASE 2               FASE 3              FASE 4      │
│  ┌──────────┐         ┌──────────┐         ┌──────────┐        ┌──────────┐ │
│  │ SCHWARTZ │────────►│  TODD    │────────►│ HORMOZI  │───────►│ BENSON   │ │
│  │          │         │  BROWN   │         │          │        │          │ │
│  │ Awareness│         │ Mechanism│         │  Oferta  │        │ 5-Step   │ │
│  │ (30 min) │         │  (1h)    │         │  (1h)    │        │ (2-3h)   │ │
│  └──────────┘         └──────────┘         └──────────┘        └──────────┘ │
│       │                                                              │      │
│       │    ┌─────────────────────────────────────────────────────────┘      │
│       │    │                                                                │
│       │    ▼                                                                │
│       │   FASE 5               FASE 6               FASE 7                  │
│       │   ┌──────────┐        ┌──────────┐         ┌──────────┐            │
│       │   │MAKEPEACE │───────►│BENCIVENGA│────────►│ HOPKINS  │            │
│       │   │          │        │          │         │          │            │
│       │   │ Emoção   │        │ Bullets  │         │  Audit   │            │
│       │   │ (1-2h)   │        │  (1h)    │         │ (30 min) │            │
│       │   └──────────┘        └──────────┘         └──────────┘            │
│       │                                                  │                  │
│       └──────────────────────────────────────────────────┼──────────────────┤
│                                                          │                  │
│                                                          ▼                  │
│                                                    ┌──────────┐             │
│                                                    │ SUGARMAN │             │
│                                                    │ Triggers │             │
│                                                    │(opcional)│             │
│                                                    └──────────┘             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### MÁQUINA DE LEADS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WORKFLOW: MÁQUINA DE LEADS                            │
│                         Duração: 3-4 dias                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      FASE DE ESTRATÉGIA                             │    │
│  │                                                                      │    │
│  │   ┌──────────┐      ┌──────────┐      ┌──────────┐                 │    │
│  │   │ SCHWARTZ │─────►│  TODD    │─────►│ HORMOZI  │                 │    │
│  │   │ Awareness│      │  BROWN   │      │  Valor   │                 │    │
│  │   │          │      │ Big Idea │      │   LM     │                 │    │
│  │   └──────────┘      └──────────┘      └──────────┘                 │    │
│  │        │                 │                 │                        │    │
│  │        └────────────────┬┴─────────────────┘                        │    │
│  │                         │                                           │    │
│  │                         ▼                                           │    │
│  │              ┌───────────────────────┐                              │    │
│  │              │  ESTRATÉGIA DEFINIDA  │                              │    │
│  │              │  • Nome do Lead Magnet│                              │    │
│  │              │  • Big Idea           │                              │    │
│  │              │  • Awareness alvo     │                              │    │
│  │              └───────────────────────┘                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                │                                             │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      FASE DE EXECUÇÃO                               │    │
│  │                                                                      │    │
│  │   ┌──────────┐      ┌──────────┐      ┌──────────┐                 │    │
│  │   │ CARLTON  │      │BENCIVENGA│      │ CHAPERON │                 │    │
│  │   │ Landing  │      │ Bullets  │      │ Sequência│                 │    │
│  │   │  Page    │      │  (30)    │      │ SOS (7)  │                 │    │
│  │   └──────────┘      └──────────┘      └──────────┘                 │    │
│  │        │                 │                 │                        │    │
│  │        └────────────────┬┴─────────────────┘                        │    │
│  │                         │                                           │    │
│  │                         ▼                                           │    │
│  │              ┌───────────────────────┐                              │    │
│  │              │     EXECUÇÃO PRONTA   │                              │    │
│  │              │  • LP Copy            │                              │    │
│  │              │  • 30 Bullets         │                              │    │
│  │              │  • 7 Emails           │                              │    │
│  │              └───────────────────────┘                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                │                                             │
│                                ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     FASE DE OTIMIZAÇÃO                              │    │
│  │                                                                      │    │
│  │                      ┌──────────┐                                   │    │
│  │                      │ HOPKINS  │                                   │    │
│  │                      │  Audit   │                                   │    │
│  │                      └──────────┘                                   │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

OUTPUT FINAL:
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │ LEAD MAGNET   │  │ LANDING PAGE  │  │ EMAIL SEQ.    │                   │
│  │               │  │               │  │               │                   │
│  │ • Nome sexy   │  │ • Headline    │  │ • 7 emails    │                   │
│  │ • Estrutura   │  │ • Bullets     │  │ • Open loops  │                   │
│  │ • Conteúdo    │  │ • CTA         │  │ • Pitch final │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### OFERTA IRRESISTÍVEL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WORKFLOW: OFERTA IRRESISTÍVEL                           │
│                         Duração: 4-6 horas                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│     ┌────────────────────────────────────────────────────────────────┐      │
│     │                      HORMOZI (Principal)                        │      │
│     └────────────────────────────────────────────────────────────────┘      │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          │                         │                         │              │
│          ▼                         ▼                         ▼              │
│    ┌───────────┐            ┌───────────┐            ┌───────────┐          │
│    │   DREAM   │            │  STACK    │            │ GARANTIA  │          │
│    │  OUTCOME  │            │ DE VALOR  │            │           │          │
│    │           │            │           │            │           │          │
│    │ O que o   │            │ Cada      │            │ Remover   │          │
│    │ cliente   │            │ obstáculo │            │ todo      │          │
│    │ QUER      │            │ vira      │            │ risco     │          │
│    │           │            │ componente│            │           │          │
│    └───────────┘            └───────────┘            └───────────┘          │
│          │                         │                         │              │
│          │                         │                         │              │
│          │    ┌────────────────────┘                         │              │
│          │    │                                              │              │
│          ▼    ▼                                              │              │
│    ┌──────────────┐                                          │              │
│    │   KENNEDY    │◄─────────────────────────────────────────┘              │
│    │              │                                                          │
│    │  Mapear      │                                                          │
│    │  TODAS as    │                                                          │
│    │  objeções    │                                                          │
│    └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│    ┌──────────────┐                                                          │
│    │  TODD BROWN  │                                                          │
│    │              │                                                          │
│    │  Naming de   │                                                          │
│    │  TUDO        │                                                          │
│    │  (sexy, não  │                                                          │
│    │   genérico)  │                                                          │
│    └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                        OUTPUT FINAL                              │      │
│    │                                                                  │      │
│    │  Componente 1: [Nome sexy] .............. Valor: R$X            │      │
│    │  Componente 2: [Nome sexy] .............. Valor: R$Y            │      │
│    │  Componente 3: [Nome sexy] .............. Valor: R$Z            │      │
│    │  Bônus 1: [Nome sexy] ................... Valor: R$W            │      │
│    │  Bônus 2: [Nome sexy] ................... Valor: R$V            │      │
│    │  Garantia: [Nome] ....................... Valor: Inestimável    │      │
│    │  ────────────────────────────────────────────────────────────   │      │
│    │  VALOR TOTAL: R$ [soma alta]                                    │      │
│    │  HOJE APENAS: R$ [fração]                                       │      │
│    │                                                                  │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### EMAIL DIÁRIO LUCRATIVO

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: EMAIL DIÁRIO LUCRATIVO                         │
│                      Duração: 1 dia + ongoing                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│    SETUP (1 DIA)                                                            │
│    ═══════════════════════════════════════════════════════════════════      │
│                                                                              │
│    ┌──────────────────┐                                                      │
│    │    BEN SETTLE    │◄── Principal                                         │
│    │    (3X Method)   │                                                      │
│    └────────┬─────────┘                                                      │
│             │                                                                │
│             ├───────────────────┬───────────────────┐                        │
│             │                   │                   │                        │
│             ▼                   ▼                   ▼                        │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│    │  PERSONALIDADE│    │   TEMPLATE   │    │    TEMAS     │                 │
│    │      3X       │    │   DE EMAIL   │    │   (50+)      │                 │
│    │              │    │              │    │              │                 │
│    │ Amplificar   │    │ • Subject    │    │ Gerados por  │                 │
│    │ traços       │    │ • Abertura   │    │ DAN KOE      │                 │
│    │ marcantes    │    │ • Corpo      │    │              │                 │
│    │              │    │ • Pitch      │    │ Categorias:  │                 │
│    │              │    │ • CTA        │    │ • Histórias  │                 │
│    │              │    │              │    │ • Opiniões   │                 │
│    │              │    │              │    │ • Lições     │                 │
│    └──────────────┘    └──────────────┘    │ • Bastidores │                 │
│                                            │ • Rants      │                 │
│                                            └──────────────┘                 │
│             │                                      │                         │
│             └──────────────────┬───────────────────┘                         │
│                                │                                             │
│                                ▼                                             │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │                    GARY HALBERT                                   │     │
│    │                                                                   │     │
│    │              5 Estruturas de Storytelling                        │     │
│    │                                                                   │     │
│    │  1. PROBLEMA → DESCOBERTA → LIÇÃO                                │     │
│    │  2. CONFISSÃO                                                    │     │
│    │  3. BASTIDOR                                                     │     │
│    │  4. CONTRARIAN                                                   │     │
│    │  5. CLIENTE/CASE                                                 │     │
│    └──────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│    ONGOING (DIÁRIO)                                                         │
│    ═══════════════════════════════════════════════════════════════════      │
│                                                                              │
│    ┌─────────────────────────────────────────────────────────────────┐      │
│    │                                                                  │      │
│    │    1. Escolher tema do banco ────► 2. Aplicar estrutura         │      │
│    │                                          │                       │      │
│    │                                          ▼                       │      │
│    │    4. Enviar ◄──────────────────── 3. Adicionar pitch           │      │
│    │                                                                  │      │
│    │    Tempo: 30-45 minutos por email                               │      │
│    │                                                                  │      │
│    └─────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### WEBINAR QUE VENDE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WORKFLOW: WEBINAR QUE VENDE                           │
│                          Duração: 2-3 dias                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ESTRUTURA DO WEBINAR (90 min)                                             │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ MIN 0-10        │ MIN 10-25      │ MIN 25-55      │ MIN 55-90      │   │
│   │ ┌─────────────┐ │ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │   │
│   │ │  ABERTURA   │ │ │  HISTÓRIA  │ │ │  CONTEÚDO  │ │ │   PITCH    │ │   │
│   │ │             │ │ │            │ │ │            │ │ │            │ │   │
│   │ │   BENSON    │ │ │  HALBERT   │ │ │TODD BROWN  │ │ │  HORMOZI   │ │   │
│   │ │  Estrutura  │ │ │ Storytelling│ │ │ Mecanismo  │ │ │   Oferta   │ │   │
│   │ │             │ │ │            │ │ │            │ │ │            │ │   │
│   │ │ • Hook      │ │ │ • Origem   │ │ │ • Segredo 1│ │ │ • Stack    │ │   │
│   │ │ • Promessa  │ │ │ • Problema │ │ │ • Segredo 2│ │ │ • Garantia │ │   │
│   │ │ • Credencial│ │ │ • Virada   │ │ │ • Segredo 3│ │ │ • Preço    │ │   │
│   │ │ • Regras    │ │ │            │ │ │            │ │ │ • CTA      │ │   │
│   │ └─────────────┘ │ └────────────┘ │ └────────────┘ │ └────────────┘ │   │
│   │       │         │       │        │       │        │       │        │   │
│   │       │         │       │        │       │        │       │        │   │
│   │       ▼         │       ▼        │       ▼        │       ▼        │   │
│   │   MAKEPEACE     │   MAKEPEACE    │   MAKEPEACE    │  BENCIVENGA    │   │
│   │   (emoção)      │   (emoção)     │   (emoção)     │  (objeções)    │   │
│   │                 │                │                │       │        │   │
│   │                 │                │                │       ▼        │   │
│   │                 │                │                │   KENNEDY      │   │
│   │                 │                │                │   (close)      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   AGENTES POR BLOCO:                                                        │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                                                                     │    │
│   │   ABERTURA ────► JON BENSON (estrutura 5-step adaptada)            │    │
│   │                                                                     │    │
│   │   HISTÓRIA ────► GARY HALBERT (storytelling pessoal)               │    │
│   │                  + CLAYTON MAKEPEACE (emoção visceral)             │    │
│   │                                                                     │    │
│   │   CONTEÚDO ────► TODD BROWN (Unique Mechanism como ensino)         │    │
│   │                  + CLAYTON MAKEPEACE (amplificar)                  │    │
│   │                                                                     │    │
│   │   PITCH ───────► ALEX HORMOZI (estrutura de oferta)                │    │
│   │                  + GARY BENCIVENGA (quebrar objeções)              │    │
│   │                  + DAN KENNEDY (fechamento high-ticket)            │    │
│   │                                                                     │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   OUTPUT: Script 90 min + 60-80 slides + 10 emails (5 pré + 5 pós)         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. REGRA DE OURO

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          NUNCA PULAR ESTRATÉGIA                             │
│                                                                              │
│   ╔════════════════════════════════════════════════════════════════════╗    │
│   ║                                                                     ║    │
│   ║   ERRADO:  Input ──────────────────────────────► Executor          ║    │
│   ║                         (pula estratégia)                           ║    │
│   ║                                                                     ║    │
│   ║   CERTO:   Input ──► TIER 1 ──► TIER 2 ──► TIER 3 ──► Output      ║    │
│   ║                      Estratégia  Execução   Otimização              ║    │
│   ║                                                                     ║    │
│   ╚════════════════════════════════════════════════════════════════════╝    │
│                                                                              │
│   MÍNIMO OBRIGATÓRIO: Sempre passar por @eugene-schwartz primeiro          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

**Versão:** 1.0.0
**Criado por:** @pedro-valerio
**Framework:** 9 Passos aplicado em documentação visual
