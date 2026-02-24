# Task: Run Assessment - Questionario Unificado Zona de Genialidade

**Task ID:** zona-genialidade/run-assessment
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Assessment Pipeline
**Total Lines:** 650+

---

## Executive Summary

Este e o CORE TASK do squad Zona Genialidade. Um questionario unificado de ~30 minutos que coleta dados para TODOS os 7 frameworks em uma unica passada. O usuario responde as perguntas UMA VEZ e todos os agentes analisam os mesmos dados.

**Workflow Position:** Entry point do pipeline Zona Genialidade
**Success Definition:** Assessment completo com dados suficientes para alimentar os 7 frameworks
**Output Quality Gate:** Todas as 5 secoes preenchidas, nenhuma secao com mais de 50% de respostas em branco

---

## Purpose

Coletar dados comportamentais, cognitivos e profissionais do usuario com MINIMA FRICCAO COGNITIVA. O assessment e desenhado para que cada pergunta alimente MULTIPLOS frameworks simultaneamente, eliminando redundancia e reduzindo o tempo total de ~3h (se cada framework fosse aplicado individualmente) para ~30 minutos.

Os 7 frameworks alimentados:

| # | Mente | Framework Principal | Tier |
|---|-------|---------------------|------|
| 1 | Gay Hendricks | Zone of Genius (4 zonas) | 0 |
| 2 | Don Clifton / Gallup | CliftonStrengths (4 dominios) | 1 |
| 3 | Dan Sullivan | Unique Ability | 1 |
| 4 | Roger Hamilton | Wealth Dynamics (8 perfis) | 1 |
| 5 | Alex Hormozi | Value Equation + Monetizacao | 1 |
| 6 | Kathy Kolbe | Kolbe A Index (4 modos de acao) | 2 |
| 7 | Sally Hogshead | Fascination Advantage (7 vantagens) | 2 |

---

## Executor Type

**Hybrid (20% Agent, 80% Human)**

- **Agent Role:** Apresenta perguntas via AskUserQuestion, valida respostas, compila resultado YAML
- **Human Role:** Responde ao questionario completo (~43 perguntas)

---

## Inputs

### Required Inputs

```yaml
user_consent:
  field: "Confirmacao para iniciar o assessment"
  format: "boolean"
  required: true
  validation: "Usuario deve confirmar que tem ~30 minutos disponiveis"

user_language:
  field: "Idioma preferido"
  format: "string"
  required: false
  default: "pt-BR"
```

### Optional Inputs

```yaml
previous_assessments:
  field: "Resultados anteriores de testes (DISC, MBTI, CliftonStrengths, etc.)"
  format: "text/optional"
  example: "DISC: DI, MBTI: ENTP, CliftonStrengths Top 5: Strategic, Ideation, Command, Activator, Futuristic"

referral_source:
  field: "Como chegou ao cohort"
  format: "text/optional"
  example: "Indicacao do Alan Nicolas"
```

---

## Preconditions

Antes de iniciar esta task:

- [ ] Squad zona-genialidade esta configurado e ativo
- [ ] Usuario confirmou disponibilidade de ~30 minutos ininterruptos
- [ ] Agente zona-genialidade-chief esta disponivel
- [ ] Diretorio `squads/zona-genialidade/data/` existe para salvar resultados

---

## Steps

### Step 0: Preparacao e Consentimento (1 min)

**Agent Activity:**

Apresentar ao usuario:

```
========================================================
  ASSESSMENT ZONA DE GENIALIDADE
  Duracao estimada: 30 minutos
  Perguntas: ~43 (maioria multipla escolha)
  Objetivo: Descobrir sua zona de genialidade e
            criar seu plano de monetizacao
========================================================

Este assessment vai mapear seu perfil atraves de 7
frameworks complementares. Voce responde UMA VEZ e
recebe uma analise completa.

As 5 secoes:
1. Contexto Pessoal (5 min)
2. Atividades e Energia (8 min)
3. Talentos e Padroes (7 min)
4. Estilo de Negocios (5 min)
5. Visao e Ambicao (5 min)
```

**Elicitation:**

```yaml
AskUserQuestion:
  question: "Voce tem ~30 minutos disponiveis agora para completar o assessment sem interrupcoes?"
  options: ["Sim, vamos comecar", "Agora nao, salvar para depois"]
  required: true
```

**Gate:** Se "Agora nao" → salvar estado e encerrar com instrucoes de retomada.

---

### Step 1: Secao 1 - Contexto Pessoal (5 min, 8 perguntas)

**Objetivo:** Dados basicos que TODOS os 7 frameworks precisam como contexto.

---

#### Pergunta 1.1 - Nome

```yaml
# Feeds: ALL (identificacao)
AskUserQuestion:
  id: "ctx_nome"
  question: "Qual seu nome completo?"
  type: "open"
  required: true
  max_length: 100
```

---

#### Pergunta 1.2 - Area de Atuacao

```yaml
# Feeds: hamilton(wealth_profile), hormozi(market_positioning), sullivan(unique_ability_context)
AskUserQuestion:
  id: "ctx_area"
  question: "Qual sua area de atuacao principal?"
  type: "multiple_choice"
  options:
    - "Tecnologia / Desenvolvimento"
    - "Marketing / Vendas"
    - "Design / Criacao"
    - "Gestao / Lideranca"
    - "Educacao / Treinamento"
    - "Saude / Bem-estar"
    - "Financas / Investimentos"
    - "Consultoria / Servicos Profissionais"
    - "Outro (especificar)"
  required: true
```

---

#### Pergunta 1.3 - Tempo de Experiencia

```yaml
# Feeds: hormozi(monetization_readiness), hamilton(wealth_spectrum_level)
AskUserQuestion:
  id: "ctx_experiencia"
  question: "Ha quanto tempo voce trabalha na sua area principal?"
  type: "multiple_choice"
  options:
    - "Menos de 1 ano"
    - "1 a 3 anos"
    - "3 a 5 anos"
    - "5 a 10 anos"
    - "Mais de 10 anos"
  required: true
```

---

#### Pergunta 1.4 - O que voce faz hoje (OPEN)

```yaml
# Feeds: hendricks(zone_mapping), sullivan(unique_ability), clifton(strengths_context)
AskUserQuestion:
  id: "ctx_oque_faz"
  question: "Descreva em 2-3 frases: o que voce faz no seu dia a dia profissional?"
  type: "open"
  required: true
  hint: "Exemplo: 'Sou gestor de projetos em uma startup de tecnologia. Coordeno equipes de desenvolvimento e faco ponte entre produto e engenharia. Tambem cuido da documentacao tecnica.'"
  max_length: 500
```

---

#### Pergunta 1.5 - Se dinheiro nao fosse problema (OPEN)

```yaml
# Feeds: hendricks(zone_of_genius), sullivan(unique_ability_passion), hogshead(primary_advantage)
AskUserQuestion:
  id: "ctx_sem_dinheiro"
  question: "Se dinheiro NAO fosse problema, o que voce faria da vida?"
  type: "open"
  required: true
  hint: "Nao existe resposta errada. Pode ser algo totalmente diferente do que faz hoje."
  max_length: 500
```

---

#### Pergunta 1.6 - Espectro Introversao/Extroversao

```yaml
# Feeds: hogshead(advantage_mapping), hamilton(wealth_profile), kolbe(conative_context)
AskUserQuestion:
  id: "ctx_intro_extro"
  question: "Voce se considera mais..."
  type: "multiple_choice"
  options:
    - "Introvertido - prefiro trabalhar sozinho, recarrego energia em silencio"
    - "Mais introvertido que extrovertido - gosto de pessoas mas preciso de tempo sozinho"
    - "Equilibrado - depende da situacao"
    - "Mais extrovertido que introvertido - gosto de tempo sozinho mas prefiro estar com pessoas"
    - "Extrovertido - recarrego energia com pessoas, penso em voz alta"
  required: true
```

---

#### Pergunta 1.7 - Espectro Analitico/Intuitivo

```yaml
# Feeds: kolbe(fact_finder_vs_quick_start), clifton(strategic_vs_executing), hamilton(profile_axis)
AskUserQuestion:
  id: "ctx_analitico_intuitivo"
  question: "Na hora de tomar decisoes, voce e mais..."
  type: "multiple_choice"
  options:
    - "Analitico - preciso de dados, planilhas, pesquisa antes de decidir"
    - "Mais analitico que intuitivo - prefiro dados mas confio no instinto quando preciso"
    - "Equilibrado - uso dados E intuicao igualmente"
    - "Mais intuitivo que analitico - confio no feeling mas valido com dados"
    - "Intuitivo - decido rapido pelo instinto, dados sao secundarios"
  required: true
```

---

#### Pergunta 1.8 - Estrutura vs Flexibilidade

```yaml
# Feeds: kolbe(follow_thru_mode), hamilton(profile_tempo), sullivan(procrastination_priority)
AskUserQuestion:
  id: "ctx_estrutura_flex"
  question: "Voce prefere..."
  type: "multiple_choice"
  options:
    - "Estrutura total - cronogramas, checklists, processos definidos"
    - "Mais estrutura - gosto de flexibilidade dentro de um framework"
    - "Depende do projeto"
    - "Mais flexibilidade - estrutura demais me sufoca"
    - "Flexibilidade total - improviso, adapto, mudo conforme necessario"
  required: true
```

---

### Step 2: Secao 2 - Atividades e Energia (8 min, 12 perguntas)

**Objetivo:** Alimentar Gay Hendricks (4 zonas), Dan Sullivan (Unique Ability), Kathy Kolbe (modos de acao).

---

#### Pergunta 2.1 - Atividades que drenam energia

```yaml
# Feeds: hendricks(zone_of_incompetence + zone_of_competence), sullivan(unique_ability_inverse)
AskUserQuestion:
  id: "energy_drena"
  question: "Quais atividades DRENAM sua energia, mesmo que voce saiba faze-las?"
  type: "multiple_choice_multi"  # pode selecionar varias
  options:
    - "Tarefas administrativas e burocraticas"
    - "Reunioes longas sem pauta definida"
    - "Trabalho repetitivo e operacional"
    - "Negociacao e confronto direto"
    - "Analise detalhada de numeros e planilhas"
    - "Atendimento ao cliente / suporte"
    - "Vender e prospectar clientes"
    - "Gerenciar pessoas e dar feedback"
    - "Escrever textos longos e documentacao"
    - "Programar / trabalho tecnico detalhado"
  required: true
```

---

#### Pergunta 2.2 - Atividades que energizam

```yaml
# Feeds: hendricks(zone_of_genius + zone_of_excellence), sullivan(unique_ability), clifton(strengths_signals)
AskUserQuestion:
  id: "energy_carrega"
  question: "Quais atividades te ENERGIZAM - voce termina com mais energia do que comecou?"
  type: "multiple_choice_multi"  # pode selecionar varias
  options:
    - "Resolver problemas complexos"
    - "Ensinar e mentorar pessoas"
    - "Criar coisas novas (produtos, conteudo, arte)"
    - "Liderar e inspirar equipes"
    - "Analisar dados e encontrar padroes"
    - "Conectar pessoas e fazer networking"
    - "Planejar estrategias e visao de longo prazo"
    - "Executar e entregar resultados concretos"
    - "Negociar e fechar acordos"
    - "Automatizar e otimizar processos"
  required: true
```

---

#### Pergunta 2.3 - O que outros agradecem

```yaml
# Feeds: sullivan(unique_ability), hogshead(primary_advantage), clifton(top_strengths)
AskUserQuestion:
  id: "energy_agradecem"
  question: "Quando outras pessoas te agradecem ou elogiam, geralmente e por..."
  type: "multiple_choice"
  options:
    - "Resolver um problema que ninguem mais conseguia"
    - "Explicar algo complexo de forma simples"
    - "Conectar as pessoas certas entre si"
    - "Trazer energia e motivacao para o grupo"
    - "Organizar o caos e criar ordem"
    - "Ter ideias criativas e inovadoras"
    - "Entregar resultados rapidos e confiaveis"
    - "Ouvir com atencao e dar conselhos certeiros"
  required: true
```

---

#### Pergunta 2.4 - Perde nocao do tempo

```yaml
# Feeds: hendricks(zone_of_genius), sullivan(unique_ability_flow), kolbe(natural_mode)
AskUserQuestion:
  id: "energy_flow"
  question: "Em qual tipo de atividade voce PERDE A NOCAO DO TEMPO (estado de flow)?"
  type: "multiple_choice"
  options:
    - "Escrevendo, criando conteudo ou arte"
    - "Programando, construindo sistemas ou produtos"
    - "Conversando, ensinando ou fazendo mentoria"
    - "Planejando, desenhando estrategias"
    - "Pesquisando, aprendendo coisas novas"
    - "Liderando reunioes, facilitando discussoes"
    - "Negociando, vendendo, convencendo"
    - "Organizando, sistematizando, criando processos"
  required: true
```

---

#### Pergunta 2.5 - Como comeca projetos novos

```yaml
# Feeds: kolbe(quick_start), hamilton(dynamo_vs_tempo), clifton(executing_vs_strategic)
AskUserQuestion:
  id: "energy_inicio"
  question: "Quando comeca um projeto novo, sua primeira reacao natural e..."
  type: "multiple_choice"
  options:
    - "Pesquisar bastante antes de dar o primeiro passo"
    - "Fazer um plano detalhado com etapas claras"
    - "Comecar a executar logo e ajustar no caminho"
    - "Conversar com outras pessoas para pegar opinioes"
  required: true
```

---

#### Pergunta 2.6 - Como lida com problemas

```yaml
# Feeds: kolbe(action_mode), hendricks(upper_limit_pattern), clifton(domain_signal)
AskUserQuestion:
  id: "energy_problemas"
  question: "Quando surge um problema inesperado no trabalho, voce tende a..."
  type: "multiple_choice"
  options:
    - "Parar e analisar todas as opcoes antes de agir"
    - "Agir rapido com a melhor opcao disponivel no momento"
    - "Consultar alguem de confianca antes de decidir"
    - "Criar um sistema ou processo para que o problema nao se repita"
  required: true
```

---

#### Pergunta 2.7 - Trabalho manual vs conceitual

```yaml
# Feeds: kolbe(implementor_mode), hamilton(mechanic_vs_creator), clifton(executing_domain)
AskUserQuestion:
  id: "energy_manual_conceitual"
  question: "Voce prefere trabalhar com..."
  type: "multiple_choice"
  options:
    - "Coisas tangiveis - prototipos, ferramentas, construir fisicamente"
    - "Mais tangivel - gosto de ver resultados concretos"
    - "Tanto faz - depende do projeto"
    - "Mais abstrato - prefiro conceitos, estrategias, ideias"
    - "Coisas abstratas - modelos mentais, frameworks, teorias"
  required: true
```

---

#### Pergunta 2.8 - Nivel de detalhe

```yaml
# Feeds: kolbe(fact_finder_mode), clifton(analytical_vs_activator), hamilton(steel_vs_blaze)
AskUserQuestion:
  id: "energy_detalhe"
  question: "Quando precisa entregar um trabalho, voce..."
  type: "multiple_choice"
  options:
    - "E extremamente detalhista - revisa varias vezes, precisa estar perfeito"
    - "Cuida dos detalhes importantes mas nao se perde nos pequenos"
    - "Foca no resultado geral - detalhes podem ser ajustados depois"
    - "Entrega rapido e itera - perfeicao e inimiga do progresso"
  required: true
```

---

#### Pergunta 2.9 - Delegacao

```yaml
# Feeds: sullivan(who_not_how), hendricks(zone_mapping), hamilton(team_role)
AskUserQuestion:
  id: "energy_delegacao"
  question: "Sobre delegar tarefas, voce..."
  type: "multiple_choice"
  options:
    - "Tenho muita dificuldade - prefiro fazer eu mesmo"
    - "Delego mas fico monitorando de perto"
    - "Delego com instrucoes claras e confio no resultado"
    - "Adoro delegar - prefiro focar no que so eu sei fazer"
  required: true
```

---

#### Pergunta 2.10 - Ritmo de trabalho

```yaml
# Feeds: kolbe(conative_rhythm), hamilton(frequency_profile), hendricks(upper_limit_indicator)
AskUserQuestion:
  id: "energy_ritmo"
  question: "Seu ritmo natural de trabalho e..."
  type: "multiple_choice"
  options:
    - "Explosoes intensas seguidas de descanso (sprint/recovery)"
    - "Ritmo constante e previsivel ao longo do dia"
    - "Comeco devagar e vou acelerando ate o deadline"
    - "Alta energia de manha, desacelero a tarde"
  required: true
```

---

#### Pergunta 2.11 - Inovacao vs Otimizacao

```yaml
# Feeds: hamilton(creator_vs_mechanic), sullivan(unique_ability_type), kolbe(quick_start_vs_follow_thru)
AskUserQuestion:
  id: "energy_inovacao_otimizacao"
  question: "O que te da mais satisfacao?"
  type: "multiple_choice"
  options:
    - "Criar algo do ZERO que nunca existiu"
    - "Melhorar algo existente e tornar excelente"
    - "Escalar algo que ja funciona para mais pessoas"
    - "Conectar coisas existentes de formas novas"
  required: true
```

---

#### Pergunta 2.12 - Multiplas tarefas vs foco profundo

```yaml
# Feeds: kolbe(action_mode_balance), clifton(focus_vs_adaptability), hendricks(genius_pattern)
AskUserQuestion:
  id: "energy_multitask"
  question: "Voce funciona melhor..."
  type: "multiple_choice"
  options:
    - "Fazendo uma coisa so com foco total por longos periodos"
    - "Alternando entre 2-3 projetos no mesmo dia"
    - "Gerenciando muitas coisas ao mesmo tempo"
    - "Depende - foco profundo para criar, multitask para executar"
  required: true
```

---

### Step 3: Secao 3 - Talentos e Padroes (7 min, 10 perguntas)

**Objetivo:** Alimentar Clifton (strengths), Hogshead (fascination), complementar Hendricks e Sullivan.

---

#### Pergunta 3.1 - Padrao recorrente de sucesso

```yaml
# Feeds: clifton(top_strength_signal), sullivan(unique_ability_evidence), hendricks(genius_evidence)
AskUserQuestion:
  id: "talent_padrao"
  question: "Pense nos seus 3 maiores sucessos profissionais. O que eles tem em COMUM?"
  type: "multiple_choice"
  options:
    - "Em todos eu estava liderando e influenciando pessoas"
    - "Em todos eu estava criando algo novo e inovador"
    - "Em todos eu estava organizando e executando com disciplina"
    - "Em todos eu estava analisando e resolvendo problemas complexos"
    - "Em todos eu estava ensinando e desenvolvendo outros"
    - "Em todos eu estava conectando pessoas e construindo relacionamentos"
    - "Em todos eu estava vendendo e convencendo stakeholders"
    - "Em todos eu estava planejando estrategia de longo prazo"
  required: true
```

---

#### Pergunta 3.2 - Como os outros te descrevem

```yaml
# Feeds: hogshead(primary_advantage), clifton(external_perception), sullivan(reputation)
AskUserQuestion:
  id: "talent_descricao"
  question: "Se eu perguntasse a 5 pessoas proximas 'qual a principal qualidade dessa pessoa?', a maioria diria..."
  type: "multiple_choice"
  options:
    - "Confiavel e consistente - sempre entrega o que promete"
    - "Criativo e visionario - sempre tem ideias incriveis"
    - "Carismatico e inspirador - todo mundo quer estar perto"
    - "Analitico e profundo - enxerga o que ninguem ve"
    - "Pratico e resolutivo - resolve qualquer pepino"
    - "Cuidadoso e atencioso - se preocupa genuinamente com as pessoas"
    - "Corajoso e ousado - nao tem medo de arriscar"
  required: true
```

---

#### Pergunta 3.3 - O que vem naturalmente

```yaml
# Feeds: hendricks(zone_of_genius), clifton(natural_talent), kolbe(instinctive_mode)
AskUserQuestion:
  id: "talent_natural"
  question: "O que voce faz com FACILIDADE que outras pessoas acham dificil?"
  type: "multiple_choice"
  options:
    - "Falar em publico e apresentar ideias"
    - "Escrever textos claros e persuasivos"
    - "Organizar informacoes complexas em estruturas simples"
    - "Aprender coisas novas rapidamente"
    - "Ler pessoas e entender motivacoes"
    - "Enxergar tendencias e oportunidades antes dos outros"
    - "Manter a calma sob pressao"
    - "Transformar ideias abstratas em planos concretos"
  required: true
```

---

#### Pergunta 3.4 - Dominio de Strengths

```yaml
# Feeds: clifton(primary_domain), hamilton(profile_quadrant), sullivan(unique_ability_domain)
AskUserQuestion:
  id: "talent_dominio"
  question: "Em um time, voce naturalmente assume o papel de..."
  type: "multiple_choice"
  options:
    - "EXECUTOR - garanto que as coisas acontecam e sejam entregues"
    - "INFLUENCIADOR - convenco, vendo, inspiro os outros a agir"
    - "CONSTRUTOR DE RELACIONAMENTOS - crio harmonia e conecto pessoas"
    - "PENSADOR ESTRATEGICO - trago visao de futuro e analise profunda"
  required: true
```

---

#### Pergunta 3.5 - Frustracao recorrente

```yaml
# Feeds: hendricks(upper_limit_problem), sullivan(procrastination_indicator), hogshead(secondary_advantage)
AskUserQuestion:
  id: "talent_frustracao"
  question: "O que te FRUSTRA repetidamente no trabalho?"
  type: "multiple_choice"
  options:
    - "Pessoas que nao cumprem prazos e compromissos"
    - "Falta de visao estrategica nas decisoes"
    - "Processos lentos e burocraticos"
    - "Falta de criatividade e inovacao no time"
    - "Pessoas que nao se desenvolvem e ficam estagnadas"
    - "Conflitos interpessoais mal resolvidos"
    - "Falta de dados e metricas para decisoes"
    - "Microgerenciamento e falta de autonomia"
  required: true
```

---

#### Pergunta 3.6 - Modo de comunicacao

```yaml
# Feeds: hogshead(communication_advantage), clifton(influencing_domain), hamilton(interaction_style)
AskUserQuestion:
  id: "talent_comunicacao"
  question: "Seu estilo natural de comunicacao e..."
  type: "multiple_choice"
  options:
    - "Direto e objetivo - vou ao ponto sem rodeios"
    - "Detalhado e preciso - apresento todos os dados e evidencias"
    - "Inspirador e entusiasmado - uso historias e emocao"
    - "Diplomatico e cuidadoso - considero todos os lados"
  required: true
```

---

#### Pergunta 3.7 - Aprendizado preferido

```yaml
# Feeds: kolbe(fact_finder_depth), clifton(learner_input_signals), hogshead(mystique_indicator)
AskUserQuestion:
  id: "talent_aprendizado"
  question: "Quando quer aprender algo novo, voce..."
  type: "multiple_choice"
  options:
    - "Le tudo sobre o assunto antes de comecar (livros, artigos, cursos)"
    - "Procura um mentor ou especialista para aprender direto com a pessoa"
    - "Comeca a praticar e aprende fazendo, errando e ajustando"
    - "Assiste videos e tutoriais, depois tenta replicar"
  required: true
```

---

#### Pergunta 3.8 - Reacao a feedback critico

```yaml
# Feeds: hendricks(upper_limit_response), hogshead(alert_advantage), clifton(restorative_signal)
AskUserQuestion:
  id: "talent_feedback"
  question: "Quando recebe um feedback critico (negativo), voce..."
  type: "multiple_choice"
  options:
    - "Analisa friamente e extrai o que e util"
    - "Fica incomodado mas usa como combustivel para melhorar"
    - "Precisa de um tempo para processar antes de reagir"
    - "Questiona e desafia se o feedback faz sentido"
  required: true
```

---

#### Pergunta 3.9 - Contribuicao mais valiosa

```yaml
# Feeds: sullivan(unique_ability_core), hendricks(genius_zone_evidence), clifton(signature_theme)
AskUserQuestion:
  id: "talent_contribuicao"
  question: "Se voce pudesse contribuir com UMA COISA para o mundo, seria..."
  type: "multiple_choice"
  options:
    - "Ensinar e capacitar pessoas a se desenvolverem"
    - "Criar produtos ou solucoes que resolvam problemas reais"
    - "Inspirar e liderar movimentos de transformacao"
    - "Organizar sistemas que funcionem de forma eficiente"
    - "Conectar pessoas e criar comunidades fortes"
    - "Descobrir verdades e compartilhar conhecimento profundo"
    - "Gerar riqueza e oportunidades economicas para outros"
  required: true
```

---

#### Pergunta 3.10 - Competencia vs Genialidade

```yaml
# Feeds: hendricks(competence_vs_genius_separator), sullivan(unique_ability_vs_competence)
AskUserQuestion:
  id: "talent_competencia_genialidade"
  question: "Tem algo que voce faz BEM (outros ate elogiam) mas que na verdade voce NAO gosta de fazer?"
  type: "sim_nao_detalhe"
  options:
    - "Sim"
    - "Nao"
  followup_if_sim: "O que e?"
  required: true
  hint: "Isso e CRITICO - separa sua Zona de Excelencia da Zona de Genialidade. Exemplo: 'Sou bom em gestao de projetos mas na verdade detesto. Preferia estar criando.'"
```

---

### Step 4: Secao 4 - Estilo de Negocios (5 min, 8 perguntas)

**Objetivo:** Alimentar Hamilton (Wealth Dynamics), Hormozi (monetizacao), complementar Sullivan.

---

#### Pergunta 4.1 - Como prefere ganhar dinheiro

```yaml
# Feeds: hamilton(wealth_profile_primary), hormozi(business_model), sullivan(freedom_of_money)
AskUserQuestion:
  id: "biz_como_ganha"
  question: "Qual modelo de trabalho/negocio te atrai MAIS?"
  type: "multiple_choice"
  options:
    - "Criar produtos digitais (cursos, apps, ferramentas) e vender em escala"
    - "Prestar servicos de alto valor (consultoria, mentoria, done-for-you)"
    - "Construir e gerenciar equipes que entregam resultados"
    - "Fazer parcerias e conectar oportunidades (deals, joint ventures)"
    - "Investir e multiplicar recursos existentes"
    - "Automatizar sistemas que geram receita recorrente"
  required: true
```

---

#### Pergunta 4.2 - Tolerancia a risco

```yaml
# Feeds: hamilton(spectrum_level), hormozi(risk_profile), hendricks(upper_limit_financial)
AskUserQuestion:
  id: "biz_risco"
  question: "Sobre risco financeiro, voce..."
  type: "multiple_choice"
  options:
    - "Evito ao maximo - preciso de previsibilidade e seguranca"
    - "Aceito riscos calculados com rede de protecao"
    - "Tomo riscos moderados se o potencial de retorno justifica"
    - "Amo risco - alto risco, alto retorno e meu mantra"
  required: true
```

---

#### Pergunta 4.3 - Trabalhar sozinho vs com time

```yaml
# Feeds: hamilton(profile_collaboration), sullivan(who_not_how_readiness), kolbe(team_synergy)
AskUserQuestion:
  id: "biz_solo_time"
  question: "Voce funciona melhor..."
  type: "multiple_choice"
  options:
    - "Totalmente sozinho - sou mais produtivo sem ninguem por perto"
    - "Sozinho com suporte - um assistente ou VA para operacional"
    - "Em dupla - eu e um socio complementar"
    - "Liderando um time pequeno (3-5 pessoas)"
    - "Liderando uma organizacao maior (10+ pessoas)"
  required: true
```

---

#### Pergunta 4.4 - Timing de mercado

```yaml
# Feeds: hamilton(dynamo_tempo_steel_blaze), hormozi(market_timing)
AskUserQuestion:
  id: "biz_timing"
  question: "Voce prefere..."
  type: "multiple_choice"
  options:
    - "Ser o PRIMEIRO em algo novo (inovar, criar mercado)"
    - "Entrar cedo mas com algo ja validado (fast follower)"
    - "Entrar quando o mercado ja e grande e otimizar (melhoria)"
    - "Entrar no final e consolidar (comprar, fusionar, escalar o que existe)"
  required: true
```

---

#### Pergunta 4.5 - Fonte de receita ideal

```yaml
# Feeds: hormozi(core_4_channel), hamilton(wealth_creation_style), sullivan(business_model_fit)
AskUserQuestion:
  id: "biz_receita"
  question: "Se pudesse escolher UMA fonte principal de receita, seria..."
  type: "multiple_choice"
  options:
    - "Vender conhecimento (cursos, livros, palestras, mentoria)"
    - "Vender servicos especializados (consultoria, agencia, freelance)"
    - "Vender produtos (SaaS, apps, e-commerce, produtos fisicos)"
    - "Vender oportunidades (intermediacao, afiliados, parcerias, investimentos)"
  required: true
```

---

#### Pergunta 4.6 - Experiencia com precificacao

```yaml
# Feeds: hormozi(value_equation_readiness), hamilton(deal_maker_indicator)
AskUserQuestion:
  id: "biz_preco"
  question: "Qual sua relacao com cobrar caro pelo seu trabalho?"
  type: "multiple_choice"
  options:
    - "Tenho dificuldade - sempre acho que deveria cobrar menos"
    - "Cobro um preco justo mas sei que poderia cobrar mais"
    - "Cobro bem e me sinto confortavel com meu preco"
    - "Cobro premium - meu trabalho vale caro e eu sei disso"
  required: true
```

---

#### Pergunta 4.7 - Escala vs profundidade

```yaml
# Feeds: hormozi(scale_readiness), hamilton(creator_vs_star_vs_mechanic), sullivan(10x_vs_2x)
AskUserQuestion:
  id: "biz_escala"
  question: "O que te atrai mais?"
  type: "multiple_choice"
  options:
    - "Atender POUCOS clientes com MUITA profundidade (high-touch)"
    - "Atender um NUMERO MEDIO com boa qualidade (group coaching, turmas)"
    - "Atender MUITAS pessoas com um produto escalavel (cursos, SaaS)"
    - "Nao atender ninguem diretamente - criar sistemas que funcionam sem mim"
  required: true
```

---

#### Pergunta 4.8 - Perfil Wealth Dynamics (direto)

```yaml
# Feeds: hamilton(primary_profile_validation)
AskUserQuestion:
  id: "biz_wealth_dynamics"
  question: "Qual descricao abaixo mais se parece com voce?"
  type: "multiple_choice"
  options:
    - "CRIADOR - Tenho muitas ideias, comeco coisas novas, sou visionario"
    - "ESTRELA - Brilho no palco, inspiro pessoas, sou a marca"
    - "APOIADOR - Sou o braço direito perfeito, executo a visao de outros com excelencia"
    - "NEGOCIADOR - Conecto pessoas e oportunidades, faco as coisas acontecerem atraves de outros"
    - "COMERCIANTE - Tenho timing de mercado, compro barato e vendo caro"
    - "ACUMULADOR - Sou paciente, consistente, construo riqueza devagar e com seguranca"
    - "SENHOR DOS SISTEMAS - Amo processos, automacao, construir maquinas que funcionam sozinhas"
    - "MECANICO - Pego coisas que ja existem e torno muito melhores"
  required: true
```

---

### Step 5: Secao 5 - Visao e Ambicao (5 min, 5 perguntas)

**Objetivo:** Alimentar estrategia de monetizacao e recomendacao de squad.

---

#### Pergunta 5.1 - Resultado desejado em 90 dias (OPEN)

```yaml
# Feeds: hormozi(goal_setting), sullivan(gap_vs_gain), ALL(north_star)
AskUserQuestion:
  id: "vision_90dias"
  question: "Qual RESULTADO CONCRETO voce quer ter alcancado daqui a 90 dias?"
  type: "open"
  required: true
  hint: "Seja especifico. Nao 'ganhar mais dinheiro' mas 'ter 5 clientes pagando R$2k/mes por consultoria'. Nao 'crescer no Instagram' mas 'ter 10k seguidores engajados e um funil de vendas funcionando'."
  max_length: 500
```

---

#### Pergunta 5.2 - Meta de receita

```yaml
# Feeds: hormozi(revenue_target), hamilton(wealth_spectrum), sullivan(freedom_of_money)
AskUserQuestion:
  id: "vision_receita"
  question: "Qual sua meta de receita MENSAL nos proximos 6 meses?"
  type: "multiple_choice"
  options:
    - "Ate R$5.000/mes (estou comecando)"
    - "R$5.000 a R$15.000/mes (quero uma renda solida)"
    - "R$15.000 a R$50.000/mes (quero escalar)"
    - "R$50.000 a R$100.000/mes (crescimento agressivo)"
    - "Mais de R$100.000/mes (estou pensando grande)"
  required: true
```

---

#### Pergunta 5.3 - Maior bloqueio (OPEN)

```yaml
# Feeds: hendricks(upper_limit_problem), sullivan(gap_thinking), hormozi(bottleneck)
AskUserQuestion:
  id: "vision_bloqueio"
  question: "O que esta te TRAVANDO agora? Qual o maior obstaculo entre onde voce esta e onde quer chegar?"
  type: "open"
  required: true
  hint: "Pode ser algo interno (medo, inseguranca, falta de clareza) ou externo (falta de dinheiro, de conhecimento tecnico, de tempo)."
  max_length: 500
```

---

#### Pergunta 5.4 - Tempo disponivel

```yaml
# Feeds: hormozi(execution_capacity), sullivan(time_freedom), ALL(constraint_mapping)
AskUserQuestion:
  id: "vision_tempo"
  question: "Quanto tempo por SEMANA voce pode dedicar ao seu projeto/negocio (fora do emprego, se aplicavel)?"
  type: "multiple_choice"
  options:
    - "Menos de 5 horas/semana (tenho pouco tempo livre)"
    - "5 a 10 horas/semana (algumas noites e fins de semana)"
    - "10 a 20 horas/semana (dedicacao parcial consistente)"
    - "20 a 40 horas/semana (dedicacao quase integral)"
    - "40+ horas/semana (dedicacao total, full-time)"
  required: true
```

---

#### Pergunta 5.5 - Experiencia com AI/Automacao

```yaml
# Feeds: ALL(tech_readiness), hormozi(leverage_potential), sullivan(who_not_how_ai)
AskUserQuestion:
  id: "vision_ai"
  question: "Qual seu nivel de experiencia com Inteligencia Artificial e automacao?"
  type: "multiple_choice"
  options:
    - "Zero - nunca usei ChatGPT ou ferramentas similares"
    - "Basico - uso ChatGPT para perguntas e textos simples"
    - "Intermediario - uso AI no dia a dia para varios fluxos de trabalho"
    - "Avancado - crio automacoes, uso APIs, construo com AI"
    - "Expert - desenvolvo solucoes de AI para mim e/ou para clientes"
  required: true
```

---

### Step 6: Compilacao e Validacao (2 min)

**Agent Activity:**

1. Compilar todas as respostas em formato YAML estruturado
2. Validar que nenhuma secao tem mais de 50% de respostas em branco
3. Calcular tempo total do assessment
4. Gerar `assessment_result` no formato padrao

**Validation Checks:**
- [ ] Secao 1: Minimo 6 de 8 perguntas respondidas
- [ ] Secao 2: Minimo 10 de 12 perguntas respondidas
- [ ] Secao 3: Minimo 8 de 10 perguntas respondidas
- [ ] Secao 4: Minimo 6 de 8 perguntas respondidas
- [ ] Secao 5: Todas 5 perguntas respondidas (criticas para output)
- [ ] Perguntas abertas (1.4, 1.5, 3.10, 5.1, 5.3): Minimo 3 de 5 com resposta substantiva (>20 caracteres)

**Gate:** Se validacao falhar → identificar lacunas, fazer perguntas complementares direcionadas.

---

### Step 7: Geracao do assessment_result (1 min)

**Agent Activity:**

Gerar o output YAML estruturado conforme template na secao Outputs.

---

## Outputs

### Primary Output

**Assessment Result Document**

Format: YAML
Location: `squads/zona-genialidade/data/assessments/{user_slug}-assessment.yaml`

```yaml
assessment_result:
  metadata:
    id: "assessment_{{ user_slug }}_{{ timestamp }}"
    name: "{{ ctx_nome }}"
    date: "{{ ISO 8601 timestamp }}"
    duration_minutes: "{{ tempo total em minutos }}"
    version: "1.0.0"
    completeness_score: "{{ porcentagem de perguntas respondidas }}"

  section_1_context:
    nome: "{{ ctx_nome }}"
    area_atuacao: "{{ ctx_area }}"
    tempo_experiencia: "{{ ctx_experiencia }}"
    descricao_dia_a_dia: "{{ ctx_oque_faz }}"
    se_dinheiro_nao_importasse: "{{ ctx_sem_dinheiro }}"
    espectro_introextro: "{{ ctx_intro_extro }}"
    espectro_analitico_intuitivo: "{{ ctx_analitico_intuitivo }}"
    espectro_estrutura_flex: "{{ ctx_estrutura_flex }}"
    # Framework signals:
    frameworks_fed:
      - "ALL: identificacao basica"
      - "hamilton: introextro + analitico = profile axis"
      - "kolbe: estrutura_flex = follow_thru indicator"
      - "hogshead: introextro = mystique/power indicator"

  section_2_activities:
    atividades_drenam: "{{ energy_drena }}"       # lista
    atividades_energizam: "{{ energy_carrega }}"  # lista
    outros_agradecem_por: "{{ energy_agradecem }}"
    perde_tempo_em: "{{ energy_flow }}"
    como_inicia_projetos: "{{ energy_inicio }}"
    como_resolve_problemas: "{{ energy_problemas }}"
    manual_vs_conceitual: "{{ energy_manual_conceitual }}"
    nivel_detalhe: "{{ energy_detalhe }}"
    estilo_delegacao: "{{ energy_delegacao }}"
    ritmo_trabalho: "{{ energy_ritmo }}"
    inovacao_vs_otimizacao: "{{ energy_inovacao_otimizacao }}"
    foco_vs_multitask: "{{ energy_multitask }}"
    # Framework signals:
    frameworks_fed:
      - "hendricks: drena vs energiza = zone mapping"
      - "sullivan: agradecem + flow + inovacao = unique ability"
      - "kolbe: inicio + problemas + detalhe + delegacao = 4 action modes"
      - "clifton: energizam + padrao + dominio = strengths signals"

  section_3_talents:
    padrao_sucesso: "{{ talent_padrao }}"
    como_outros_descrevem: "{{ talent_descricao }}"
    facilidade_natural: "{{ talent_natural }}"
    dominio_strengths: "{{ talent_dominio }}"
    frustracao_recorrente: "{{ talent_frustracao }}"
    estilo_comunicacao: "{{ talent_comunicacao }}"
    estilo_aprendizado: "{{ talent_aprendizado }}"
    reacao_feedback: "{{ talent_feedback }}"
    contribuicao_mundo: "{{ talent_contribuicao }}"
    competencia_vs_genialidade: "{{ talent_competencia_genialidade }}"
    competencia_vs_genialidade_detalhe: "{{ followup se sim }}"
    # Framework signals:
    frameworks_fed:
      - "clifton: padrao + descricao + dominio = top strengths"
      - "hogshead: descricao + comunicacao = primary advantage"
      - "hendricks: natural + competencia_vs_genialidade = genius vs excellence"
      - "sullivan: contribuicao + padrao = unique ability confirmation"

  section_4_business:
    modelo_preferido: "{{ biz_como_ganha }}"
    tolerancia_risco: "{{ biz_risco }}"
    solo_vs_time: "{{ biz_solo_time }}"
    timing_mercado: "{{ biz_timing }}"
    fonte_receita_ideal: "{{ biz_receita }}"
    relacao_preco: "{{ biz_preco }}"
    escala_vs_profundidade: "{{ biz_escala }}"
    perfil_wealth_dynamics: "{{ biz_wealth_dynamics }}"
    # Framework signals:
    frameworks_fed:
      - "hamilton: todos os campos mapeiam para 8 profiles"
      - "hormozi: receita + preco + escala = value equation input"
      - "sullivan: solo_vs_time + modelo = who not how readiness"

  section_5_vision:
    resultado_90_dias: "{{ vision_90dias }}"
    meta_receita_mensal: "{{ vision_receita }}"
    maior_bloqueio: "{{ vision_bloqueio }}"
    tempo_disponivel: "{{ vision_tempo }}"
    nivel_ai: "{{ vision_ai }}"
    # Framework signals:
    frameworks_fed:
      - "hormozi: meta + bloqueio + tempo = execution roadmap"
      - "hendricks: bloqueio = upper limit problem indicator"
      - "sullivan: resultado_90d = gap vs gain analysis input"
      - "ALL: constraint mapping para recomendacao de squad"
```

### Secondary Outputs

1. **Assessment Completion Log**
   - Format: Markdown
   - Location: `squads/zona-genialidade/data/assessments/{user_slug}-log.md`
   - Content: Timestamp de inicio, fim, perguntas puladas, observacoes

2. **Framework Feed Map**
   - Format: YAML (embedded in assessment_result)
   - Content: Mapeamento de qual pergunta alimenta qual framework
   - Use: Referencia para o task analyze-genius-profile

---

## Validation

### Checklist

- [ ] Todas as 5 secoes tem perguntas respondidas
- [ ] Nenhuma secao tem mais de 50% de respostas em branco
- [ ] As 5 perguntas abertas (1.4, 1.5, 3.10 followup, 5.1, 5.3) tem respostas substantivas
- [ ] Tempo total do assessment esta entre 15-45 minutos (fora do range = red flag)
- [ ] Respostas nao sao contraditorias (ex: diz que e introvertido mas escolhe "liderar no palco")
- [ ] assessment_result YAML e valido e parseavel
- [ ] Metadata inclui id unico, nome, data e duracao
- [ ] Cada secao inclui mapeamento `frameworks_fed`
- [ ] Arquivo salvo no path correto: `squads/zona-genialidade/data/assessments/`

### Success Criteria

**Threshold: 8/10 no rubric abaixo**

| Criterio | Excelente (3) | Aceitavel (2) | Fraco (1) |
|----------|--------------|----------------|-----------|
| **Completude** | 100% perguntas respondidas | 85%+ respondidas | Menos de 85% |
| **Qualidade das abertas** | Respostas com 50+ palavras, especificas e pessoais | Respostas com 20+ palavras, razoavelmente especificas | Respostas genericas, vagas ou com menos de 20 palavras |
| **Consistencia** | Zero contradicoes entre respostas | 1 contradicao menor | 2+ contradicoes ou 1 grave |
| **Tempo** | 20-35 minutos | 15-45 minutos | Menos de 15 ou mais de 45 |
| **Parsability** | YAML valido, todos os campos preenchidos | YAML valido, 1-2 campos vazios | YAML invalido ou 3+ campos vazios |

---

## Estimated Effort

| Role | Effort | Notes |
|------|--------|-------|
| **Agent** | 5 min | Apresentar perguntas, validar, compilar YAML |
| **Human** | 25-30 min | Responder as 43 perguntas |
| **Total Duration** | 30-35 min | Single session, sem interrupcoes |

---

## Integration

### Feeds To

**Workflow:** Zona Genialidade Pipeline

**Next Task in Sequence:** analyze-genius-profile
- Uses: `assessment_result` completo (todas as 5 secoes)
- Produces: Perfil de genialidade com scores por framework

### Agent Routing

O `assessment_result` e distribuido para os agentes por secao:

| Agente | Consome Secoes | Analisa |
|--------|---------------|---------|
| gay-hendricks | 1, 2, 3 | Zone mapping (4 zonas) + Upper Limit |
| don-clifton | 1, 2, 3 | CliftonStrengths domain + top themes |
| dan-sullivan | 1, 2, 3, 5 | Unique Ability + Who Not How readiness |
| roger-hamilton | 1, 2, 4 | Wealth Dynamics profile (8 perfis) |
| alex-hormozi | 4, 5 | Value Equation + monetization strategy |
| kathy-kolbe | 1, 2 | Kolbe A Index (4 action modes) |
| sally-hogshead | 1, 3 | Fascination Advantage (primary + secondary) |

### Depends On

- None (este e o entry point do pipeline)

---

## Error Handling

```yaml
user_abandons_mid_assessment:
  action: "Salvar respostas parciais em data/assessments/{slug}-partial.yaml"
  recovery: "Ao retomar, carregar respostas parciais e continuar da ultima secao"
  message: "Sem problema! Suas respostas foram salvas. Quando quiser continuar, e so chamar o assessment de novo."

contradictory_answers_detected:
  action: "NAO interromper o flow. Flaggear contradicao no log."
  recovery: "O task analyze-genius-profile vai lidar com contradicoes na analise"
  rationale: "Interromper para questionar contradicoes aumenta friccao cognitiva"

all_answers_same_pattern:
  action: "Se >70% das respostas sao a primeira opcao (ou qualquer padrao uniforme), flaggear"
  recovery: "Apresentar 2-3 perguntas de validacao extras para confirmar autenticidade"
  message: "Notei um padrao nas suas respostas. Vou fazer 2 perguntas extras para garantir que o resultado final seja o mais preciso possivel."

open_question_too_short:
  action: "Se resposta aberta tem <20 caracteres, pedir elaboracao"
  recovery: "Reformular a pergunta de forma mais especifica"
  message: "Pode elaborar um pouco mais? Quanto mais detalhes voce der, mais preciso sera o seu perfil de genialidade."

yaml_generation_fails:
  action: "Gerar em formato JSON como fallback"
  recovery: "Converter para YAML na proxima etapa"
```

---

## Design Principles

### Por que este formato?

1. **Multipla escolha prevalece (~38 de 43 perguntas):** Reduz friccao cognitiva. O usuario so precisa reconhecer a opcao que mais se parece com ele, nao precisa articular do zero.

2. **Apenas 5 perguntas abertas:** Posicionadas estrategicamente onde a especificidade do usuario e insubstituivel:
   - 1.4: O que faz hoje (contexto unico)
   - 1.5: Se dinheiro nao importasse (desejo autentico)
   - 3.10: Competencia vs genialidade (separador critico)
   - 5.1: Resultado em 90 dias (north star)
   - 5.3: Maior bloqueio (upper limit problem)

3. **Cada pergunta alimenta 2-4 frameworks:** Nenhuma pergunta e "desperdicada". O mapeamento `# Feeds:` no YAML de cada pergunta documenta exatamente quais frameworks consomem cada dado.

4. **Secoes em ordem de dificuldade crescente:** Comeca com dados basicos (facil, sem reflexao profunda), progride para atividades (requer auto-observacao), talentos (requer meta-cognicao), negocios (requer visao estrategica), e termina com visao (requer vulnerabilidade).

5. **30 minutos maximo:** Respeitando que o usuario do cohort tem multiplas demandas. Um assessment mais longo teria dados melhores mas taxa de abandono proibitiva.

---

## Framework Coverage Matrix

Mapeamento completo de quais perguntas alimentam cada framework:

### Gay Hendricks - Zone of Genius Model

| Pergunta | Dado Extraido | Uso no Framework |
|----------|--------------|-----------------|
| 1.4 (oque_faz) | Atividade atual | Mapear zona atual (incompetencia/competencia/excelencia/genialidade) |
| 1.5 (sem_dinheiro) | Desejo autentico | Sinal da Zona de Genialidade |
| 2.1 (drena) | Atividades energeticamente negativas | Zona de Incompetencia e Competencia |
| 2.2 (energiza) | Atividades energeticamente positivas | Zona de Excelencia e Genialidade |
| 2.4 (flow) | Estado de flow | Zona de Genialidade (confirmacao) |
| 2.9 (delegacao) | O que delega vs segura | O que delegar (competencia) vs manter (genialidade) |
| 3.3 (natural) | Facilidade natural | Zona de Genialidade (talento inato) |
| 3.10 (comp_vs_gen) | Bom mas nao gosta | CRITICO: separa Excelencia de Genialidade |
| 5.3 (bloqueio) | Barreira principal | Upper Limit Problem detection |

### Don Clifton / Gallup - CliftonStrengths

| Pergunta | Dado Extraido | Uso no Framework |
|----------|--------------|-----------------|
| 2.2 (energiza) | Atividades que energizam | Sinais dos top themes |
| 2.3 (agradecem) | Feedback positivo recorrente | Confirmacao de strengths |
| 3.1 (padrao) | Padrao de sucesso | Domain mapping (Executing/Influencing/Relationship/Strategic) |
| 3.2 (descricao) | Percepcao externa | Strength confirmation |
| 3.3 (natural) | Talento natural | Top 5 themes signal |
| 3.4 (dominio) | Papel natural no time | Primary domain identification |

### Dan Sullivan - Unique Ability

| Pergunta | Dado Extraido | Uso no Framework |
|----------|--------------|-----------------|
| 1.4 (oque_faz) | Atividade atual | Context para Unique Ability assessment |
| 1.5 (sem_dinheiro) | Paixao autentica | Unique Ability passion component |
| 2.2 (energiza) | O que energiza | Unique Ability energy signal |
| 2.3 (agradecem) | Feedback de outros | Unique Ability talent confirmation (others see it) |
| 2.4 (flow) | Estado de flow | Unique Ability flow state |
| 2.9 (delegacao) | Estilo de delegacao | Who Not How readiness |
| 2.11 (inovacao) | Criar vs otimizar | Unique Ability type (creation vs optimization) |
| 3.9 (contribuicao) | Contribuicao ao mundo | Unique Ability purpose |
| 5.1 (90dias) | Meta de curto prazo | Gap vs Gain analysis |

### Roger Hamilton - Wealth Dynamics

| Pergunta | Dado Extraido | Uso no Framework |
|----------|--------------|-----------------|
| 1.6 (intro_extro) | Espectro social | Profile axis (introvert→extrovert maps to accumulator→creator) |
| 1.7 (analitico) | Estilo decisorio | Profile axis (sensory→intuitive) |
| 2.5 (inicio) | Como comeca projetos | Dynamo vs Tempo vs Steel vs Blaze |
| 2.7 (manual_conceitual) | Tangivel vs abstrato | Profile refinement |
| 2.11 (inovacao) | Criar vs otimizar | Creator vs Mechanic indicator |
| 4.1 (como_ganha) | Modelo preferido | Profile validation |
| 4.3 (solo_time) | Colaboracao | Profile collaboration style |
| 4.4 (timing) | Timing de mercado | Dynamo (primeiro) vs Steel (ultimo) |
| 4.8 (wealth_dynamics) | Auto-identificacao | Primary profile (direct mapping) |

### Alex Hormozi - Value Equation + Monetizacao

| Pergunta | Dado Extraido | Uso no Framework |
|----------|--------------|-----------------|
| 4.1 (como_ganha) | Modelo de negocio | Core 4 channel selection |
| 4.5 (receita) | Fonte de receita | Grand Slam Offer structure |
| 4.6 (preco) | Relacao com preco | Value Equation - perceived value gap |
| 4.7 (escala) | Escala vs profundidade | Delivery vehicle selection |
| 5.1 (90dias) | Meta concreta | Offer design target |
| 5.2 (meta_receita) | Meta de receita | Pricing strategy input |
| 5.3 (bloqueio) | Obstaculo principal | Bottleneck identification |
| 5.4 (tempo) | Tempo disponivel | Execution capacity |

### Kathy Kolbe - Kolbe A Index (4 Action Modes)

| Pergunta | Dado Extraido | Modo de Acao |
|----------|--------------|-------------|
| 1.7 (analitico) | Estilo decisorio | Fact Finder (alto = pesquisador) |
| 1.8 (estrutura_flex) | Preferencia de estrutura | Follow Thru (alto = estruturado) |
| 2.5 (inicio) | Como comeca projetos | Quick Start (alto = age rapido) |
| 2.6 (problemas) | Como resolve problemas | Combinacao dos 4 modos |
| 2.7 (manual_conceitual) | Tangivel vs abstrato | Implementor (alto = tangivel) |
| 2.8 (detalhe) | Nivel de detalhe | Fact Finder depth |
| 2.10 (ritmo) | Ritmo de trabalho | Conative rhythm |
| 2.12 (multitask) | Foco vs multitask | Quick Start vs Follow Thru balance |

### Sally Hogshead - Fascination Advantage

| Pergunta | Dado Extraido | Vantagem |
|----------|--------------|----------|
| 1.6 (intro_extro) | Espectro social | Mystique (introvertido) vs Power (extrovertido) |
| 3.2 (descricao) | Como outros te veem | Primary Advantage signal |
| 3.5 (frustracao) | O que frustra | Secondary Advantage (what you defend) |
| 3.6 (comunicacao) | Estilo de comunicacao | Communication Advantage mapping |
| 3.8 (feedback) | Reacao a critica | Alert Advantage indicator |
| 3.9 (contribuicao) | Contribuicao desejada | Passion Advantage signal |

---

## Related Tasks

- **analyze-genius-profile:** Consome o `assessment_result` e produz o perfil multi-framework
- **recommend-squad:** Usa o perfil para recomendar o squad ideal
- **generate-blueprint:** Gera o Blueprint final com plano de monetizacao

---

## Notes for Executor

### Dicas para Maximizar Qualidade das Respostas

1. **Nas perguntas abertas:** Sempre dar um EXEMPLO concreto no hint. Pessoas respondem melhor quando veem um modelo.

2. **Se o usuario pedir para pular:** Permitir pular perguntas de multipla escolha, mas insistir gentilmente nas 5 abertas (sao criticas).

3. **Se o usuario der resposta monossilabica na aberta:** Reformular com "Pode dar um exemplo especifico?" ou "O que exatamente voce quer dizer com isso?"

4. **Tom do assessment:** Conversacional, nao clinico. Usar "voce" nao "o participante". Evitar jargoes dos frameworks (o usuario nao precisa saber que estamos mapeando Kolbe ou Hendricks).

5. **Ordem e sagrada:** NAO reorganizar as secoes. A progressao de dificuldade (contexto → atividade → talento → negocio → visao) e intencional para aquecer o usuario antes das perguntas mais profundas.

### Se Assessment Parcial (abandono ou timeout)

1. Salvar tudo que foi respondido em `{slug}-partial.yaml`
2. Na retomada, mostrar resumo: "Da ultima vez voce respondeu as secoes 1, 2 e 3. Vamos continuar da secao 4?"
3. NAO refazer perguntas ja respondidas
4. Se >60% respondido, pode prosseguir para analyze-genius-profile com flag `partial: true`

### Se Usuario ja Tem Assessments Anteriores

Se o usuario informou resultados de DISC, MBTI, CliftonStrengths ou outros na input `previous_assessments`:
1. Registrar no metadata do assessment_result
2. O task analyze-genius-profile vai triangular esses dados com as respostas deste assessment
3. NAO pular perguntas por causa dos resultados anteriores (precisamos dos dados no nosso formato)

---

## Revision History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-02-13 | Initial production release - 43 perguntas, 5 secoes, 7 frameworks |
