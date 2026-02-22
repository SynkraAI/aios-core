# Task: Analisar Perfil de Genialidade

**Task ID:** zona-genialidade/analyze-genius-profile
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Zona Genialidade Pipeline
**Total Lines:** 420

---

## Executive Summary

Esta task recebe os dados brutos do assessment comportamental (output da task `run-assessment`) e executa uma analise multi-framework completamente autonoma atraves dos 7 agentes especialistas do squad. Cada agente aplica sua metodologia proprietaria sobre os mesmos dados, gerando 7 analises independentes que sao cruzadas em uma sintese final para identificar convergencias, insights unicos e contradicoes.

**Posicao no Workflow:** Task 2 na pipeline Zona Genialidade (depende de `run-assessment`)
**Definicao de Sucesso:** Perfil de genialidade completo com 7 analises + sintese cruzada
**Quality Gate de Output:** Todas as 7 analises devem ter score de confianca >= 0.7 e a sintese deve identificar pelo menos 3 pontos de convergencia

---

## Proposito

O assessment isolado gera dados brutos sem interpretacao. O poder real esta no cruzamento de 7 frameworks complementares que, juntos, revelam padroes invisiveis para qualquer framework individual. Gay Hendricks identifica a zona atual, mas nao sabe qual squad recomendar. Roger Hamilton identifica o perfil de riqueza, mas nao sabe onde esta o Upper Limit Problem. Quando cruzamos todos os 7, emergem insights que nenhum coach individual conseguiria produzir.

Esta task evita o erro mais comum em assessments: entregar resultados superficiais de um unico framework e chamar de "diagnostico completo". Aqui, 7 mentes operam sobre os mesmos dados, cada uma trazendo uma lente diferente.

---

## Tipo de Executor

**Agent (100% autonomo)**

- **Papel do Agent:** Executa todas as 7 analises sequencialmente, aplica cada framework, sintetiza resultados cruzados
- **Papel do Humano:** Nenhum durante a analise (humano valida no Blueprint final)
- **Runtime Estimado:** 15-30 minutos dependendo da complexidade do perfil

---

## Inputs

### Inputs Obrigatorios

```yaml
assessment_result:
  field: "Resultado estruturado do assessment comportamental"
  format: "YAML"
  required: true
  location: "squads/zona-genialidade/data/{aluno_slug}/assessment-result.yaml"
  validation: "Deve conter todas as secoes: identidade, comportamento, motivacao, habilidades, contexto"
  notes: "Output direto da task run-assessment"

  expected_structure:
    identidade:
      nome: "string - Nome completo do aluno"
      slug: "string - snake_case do nome"
      contexto_profissional: "string - Area de atuacao atual"
      experiencia_anos: "integer - Anos de experiencia relevante"

    comportamento:
      disc_estimado:
        dominancia: "float 0-100"
        influencia: "float 0-100"
        estabilidade: "float 0-100"
        conformidade: "float 0-100"
      big_five_estimado:
        abertura: "float 0-100"
        conscienciosidade: "float 0-100"
        extroversao: "float 0-100"
        amabilidade: "float 0-100"
        neuroticismo: "float 0-100"
      eneagrama_provavel: "integer 1-9 com asa"

    motivacao:
      paixoes_declaradas: "list - O que energiza"
      frustracoeos_declaradas: "list - O que drena"
      visao_futuro: "string - Onde quer chegar"
      bloqueios_percebidos: "list - O que atrapalha"

    habilidades:
      top_habilidades: "list - 5-10 habilidades principais"
      atividades_flow: "list - Atividades onde perde nocao do tempo"
      atividades_drenam: "list - Atividades que evita ou procrastina"
      feedback_externo: "list - O que outros dizem que faz bem"

    contexto:
      renda_atual: "string - Faixa ou valor"
      modelo_negocio_atual: "string - Como ganha dinheiro hoje"
      tempo_disponivel: "string - Horas semanais para dedicar"
      recursos_disponiveis: "list - Ferramentas, equipe, capital"
```

### Inputs Opcionais

```yaml
assessment_historico:
  field: "Assessments anteriores do mesmo aluno"
  format: "YAML"
  required: false
  notes: "Permite comparacao temporal e deteccao de evolucao"

perfil_existente:
  field: "Perfis formais ja realizados (DISC oficial, CliftonStrengths, etc)"
  format: "text ou YAML"
  required: false
  notes: "Se o aluno ja tem resultados oficiais, usar como ancora de calibracao"

contexto_cohort:
  field: "Informacoes sobre o cohort e momento do aluno"
  format: "text"
  required: false
  notes: "Ajuda a contextualizar recomendacoes dentro do programa"
```

---

## Precondicoes

Antes de iniciar esta task:

- [ ] Assessment result existe em `squads/zona-genialidade/data/{aluno_slug}/assessment-result.yaml`
- [ ] Assessment result foi validado (todas as secoes preenchidas, nenhum campo vazio critico)
- [ ] Aluno completou o assessment por inteiro (nenhuma secao pulada)
- [ ] Nao existe genius-profile.yaml anterior para este aluno (ou re-analise foi explicitamente solicitada)
- [ ] Agentes do squad estao disponiveis e configurados no config.yaml

---

## Steps

### Step 1: Carregar e Validar Dados do Assessment (2 min)

**Atividade do Agent:**
- Ler assessment-result.yaml COMPLETO (NUNCA leitura parcial)
- Validar integridade dos dados:
  - Todas as 5 secoes presentes (identidade, comportamento, motivacao, habilidades, contexto)
  - Nenhum campo critico vazio ou com valor placeholder
  - Scores numericos dentro dos ranges esperados (0-100 para DISC e Big Five)
  - Listas tem pelo menos 3 itens onde esperado
- Se dados incompletos: PARAR e reportar quais campos faltam
- Se dados validos: preparar contexto unificado para os 7 agentes

**Preparacao de Contexto:**
```yaml
analysis_context:
  aluno_nome: "{nome}"
  aluno_slug: "{slug}"
  data_analise: "{timestamp}"
  dados_completos: true
  campos_ausentes: []
  notas_qualidade: "Descricao de qualquer limitacao nos dados"
```

**Checkpoint:** Dados validados, contexto preparado, pronto para analise sequencial

---

### Step 2: Analise Gay Hendricks - Zona Atual e Upper Limit Problem (3-5 min)

**Agente Responsavel:** gay-hendricks (Tier 0 - Executa primeiro por ser o framework fundacional)

**Atividade do Agent:**

1. **Classificar Zona Atual:**
   Baseado nas atividades diarias, nivel de satisfacao e energia reportados:

   ```yaml
   zonas:
     incompetencia:
       indicadores:
         - "Atividades que faz mal E nao gosta"
         - "Tarefas delegaveis que consome energia"
         - "Frustracoes cronicas sem melhora"
       score_criterio: "% do tempo gasto em atividades que drenam E nao domina"

     competencia:
       indicadores:
         - "Atividades que faz bem mas outros tambem fazem"
         - "Tarefas que executa sem entusiasmo"
         - "Coisas que faz por obrigacao/necessidade financeira"
       score_criterio: "% do tempo em atividades competentes mas nao excepcionais"

     excelencia:
       indicadores:
         - "Atividades que faz muito bem e recebe reconhecimento"
         - "Armadilha: confunde excelencia com genialidade"
         - "Zona onde maioria dos profissionais bem-sucedidos fica presa"
       score_criterio: "% do tempo em atividades excelentes mas nao unicas"

     genialidade:
       indicadores:
         - "Atividades onde perde nocao do tempo (flow)"
         - "Talentos unicos que outros reconhecem"
         - "Atividades que energizam ao inves de drenar"
         - "Coisas que faria de graca por paixao"
       score_criterio: "% do tempo em atividades que combinam talento unico + paixao"
   ```

2. **Calcular Distribuicao de Zona:**
   ```yaml
   zone_distribution:
     incompetencia: "X%"
     competencia: "Y%"
     excelencia: "Z%"
     genialidade: "W%"
     total: "100%"
     evidencias:
       - zona: "excelencia"
         atividade: "Gerenciar projetos complexos"
         justificativa: "Faz bem, recebe reconhecimento, mas nao e sua paixao"
   ```

3. **Identificar Upper Limit Problem:**
   Classificar qual tipo de ULP esta bloqueando a transicao para Zona de Genialidade:

   ```yaml
   upper_limit_problems:
     tipo_1_sentir_se_falho:
       descricao: "Crenca de que nao merece sucesso/felicidade plena"
       sinais: ["Auto-sabotagem apos conquistas", "Sindrome do impostor", "Comparacao constante"]
       evidencia_no_assessment: "Texto especifico que indica esse padrao"

     tipo_2_deslealdade:
       descricao: "Medo de superar pessoas queridas (pais, amigos, mentores)"
       sinais: ["Diminui conquistas", "Se segura para nao parecer arrogante", "Culpa pelo sucesso"]
       evidencia_no_assessment: "Texto especifico"

     tipo_3_carga_ao_outro:
       descricao: "Crenca de que sucesso incomoda os outros"
       sinais: ["Esconde resultados", "Pede desculpa por ter sucesso", "Medo de inveja"]
       evidencia_no_assessment: "Texto especifico"

     tipo_4_crime_do_brilho:
       descricao: "Medo de brilhar demais e se tornar alvo"
       sinais: ["Se esconde de visibilidade", "Prefere bastidores", "Medo de exposicao"]
       evidencia_no_assessment: "Texto especifico"

     classificacao_primaria: "tipo_X"
     classificacao_secundaria: "tipo_Y (se aplicavel)"
     confianca: 0.8
   ```

4. **Gerar Caminho para Zona de Genialidade:**
   - 3-5 passos concretos baseados na zona atual e ULP identificado
   - Prazo estimado para transicao
   - Principais obstaculos esperados

**Output:** `hendricks_analysis` YAML com zona atual, distribuicao, ULP e caminho

**Checkpoint:** Analise Hendricks completa com evidencias de cada classificacao

---

### Step 3: Analise Don Clifton - Mapa de Talentos Naturais (3-5 min)

**Agente Responsavel:** don-clifton (Tier 1)

**Atividade do Agent:**

1. **Mapear Top 5 CliftonStrengths Provaveis:**
   Baseado nas habilidades reportadas, atividades de flow e feedback externo, inferir os 5 talentos mais provaveis entre os 34 temas:

   ```yaml
   clifton_mapping:
     top_5_provaveis:
       - rank: 1
         tema: "Strategic"
         dominio: "Strategic Thinking"
         evidencia: "Capacidade de ver padroes e antecipar cenarios descrita em..."
         confianca: 0.85
       - rank: 2
         tema: "Ideation"
         dominio: "Strategic Thinking"
         evidencia: "Gera ideias constantemente, energiza-se com brainstorming..."
         confianca: 0.80
       # ... ranks 3-5
   ```

2. **Identificar Dominio Dominante:**
   ```yaml
   dominios:
     executing:
       temas_provaveis: ["Achiever", "Focus"]
       peso: 0.2
     influencing:
       temas_provaveis: ["Communication"]
       peso: 0.15
     relationship_building:
       temas_provaveis: ["Empathy"]
       peso: 0.25
     strategic_thinking:
       temas_provaveis: ["Strategic", "Ideation", "Learner"]
       peso: 0.4
     dominio_dominante: "strategic_thinking"
     dominio_secundario: "relationship_building"
   ```

3. **Identificar Talentos na Sombra:**
   Talentos que existem mas nao estao sendo usados ou reconhecidos:
   ```yaml
   talentos_sombra:
     - tema: "Command"
       evidencia: "Feedback externo indica lideranca natural que o aluno nao reconhece"
       motivo_sombra: "ULP tipo 4 (medo de brilhar) pode estar suprimindo"
       potencial_se_ativado: "Alto impacto em posicoes de lideranca/vendas"
   ```

4. **Gerar Recomendacoes de Ativacao:**
   - Como usar cada talento do Top 5 no dia a dia
   - Como resgatar talentos na sombra
   - Combinacoes de talentos que criam vantagem unica

**Output:** `clifton_analysis` YAML com top 5, dominios, sombras e recomendacoes

**Checkpoint:** Mapeamento CliftonStrengths completo com evidencias do assessment

---

### Step 4: Analise Dan Sullivan - Habilidade Unica e Delegacao (3-5 min)

**Agente Responsavel:** dan-sullivan (Tier 1)

**Atividade do Agent:**

1. **Identificar Atividades por Zona Sullivan:**
   ```yaml
   sullivan_zones:
     unique_ability:
       descricao: "Atividades que combinam talento superior + paixao + valor para outros"
       atividades:
         - atividade: "Ensinar conceitos complexos de forma simples"
           evidencia: "Reportou flow ao explicar, feedback externo confirma"
           score_paixao: 9
           score_talento: 8
           score_valor_mercado: 7

     excellent:
       descricao: "Faz muito bem mas nao sente paixao"
       atividades:
         - atividade: "Gerenciar projetos"
           evidencia: "Alta competencia mas reportou drenagem de energia"
           recomendacao: "Delegar quando possivel"

     competent:
       descricao: "Faz bem o suficiente mas outros fazem melhor"
       atividades:
         - atividade: "Controle financeiro"
           recomendacao: "Delegar imediatamente"

     incompetent:
       descricao: "Nao faz bem e nao deveria fazer"
       atividades:
         - atividade: "Design grafico"
           recomendacao: "Eliminar ou terceirizar"
   ```

2. **Criar Declaracao de Unique Ability:**
   ```yaml
   unique_ability_statement:
     declaracao: |
       Minha habilidade unica e [VERBO] para [QUEM],
       transformando [INPUT] em [OUTPUT] de uma forma que
       [DIFERENCIAL UNICO], gerando [RESULTADO PARA OUTROS].
     versao_curta: "Frase de uma linha"
     confianca: 0.75
   ```

3. **Lista de Candidatos para Delegacao:**
   ```yaml
   delegation_candidates:
     prioridade_alta:
       - atividade: "..."
         horas_semanais_gastas: 10
         horas_liberadas_se_delegar: 8
         dificuldade_delegacao: "baixa"
         tipo_profissional_ideal: "VA administrativo"
     prioridade_media:
       - atividade: "..."
     total_horas_recuperaveis: 15
   ```

4. **Calcular Distribuicao de Tempo Atual vs Ideal:**
   ```yaml
   time_distribution:
     atual:
       unique_ability: "15%"
       excellent: "35%"
       competent: "30%"
       incompetent: "20%"
     ideal:
       unique_ability: "60%+"
       excellent: "20%"
       competent: "10%"
       incompetent: "0%"
     gap_analysis: "Precisa mover 45% do tempo para Unique Ability"
   ```

**Output:** `sullivan_analysis` YAML com zonas, UA statement, delegacao e distribuicao

**Checkpoint:** Analise Sullivan completa com atividades classificadas e plano de delegacao

---

### Step 5: Analise Roger Hamilton - Perfil de Riqueza (3-5 min)

**Agente Responsavel:** roger-hamilton (Tier 1)

**Atividade do Agent:**

1. **Classificar Perfil Wealth Dynamics:**
   Analisar comportamento, motivacao e estilo de trabalho para identificar perfil primario e secundario entre os 8 perfis:

   ```yaml
   wealth_dynamics:
     perfis:
       creator:
         score: 0.0-1.0
         indicadores: ["Gera ideias constantemente", "Inicia projetos com entusiasmo", "Se entedia com operacao"]
       mechanic:
         score: 0.0-1.0
         indicadores: ["Otimiza sistemas", "Melhora processos existentes", "Prefere refinar a criar"]
       star:
         score: 0.0-1.0
         indicadores: ["Brilha na frente do publico", "Marca pessoal forte", "Energiza com atencao"]
       supporter:
         score: 0.0-1.0
         indicadores: ["Lidera times naturalmente", "Conecta pessoas", "Valor esta no network"]
       deal_maker:
         score: 0.0-1.0
         indicadores: ["Negocia naturalmente", "Ve oportunidades de troca", "Timing impecavel"]
       trader:
         score: 0.0-1.0
         indicadores: ["Compra barato, vende caro", "Analisa dados/metricas", "Timing de mercado"]
       accumulator:
         score: 0.0-1.0
         indicadores: ["Coleciona ativos", "Paciencia longa", "Valor no longo prazo"]
       lord:
         score: 0.0-1.0
         indicadores: ["Controla sistemas", "Cash flow sobre tudo", "Gere portifolio"]

     perfil_primario: "creator"
     perfil_secundario: "star"
     confianca_primario: 0.85
     confianca_secundario: 0.70
     evidencias:
       - perfil: "creator"
         citacao: "Referencia especifica do assessment"
       - perfil: "star"
         citacao: "Referencia especifica do assessment"
   ```

2. **Determinar Nivel no Wealth Spectrum:**
   ```yaml
   wealth_spectrum:
     niveis:
       - nivel: "Infrared (Vitima)"
         indicadores: ["Dividas, sem controle financeiro"]
       - nivel: "Red (Sobrevivente)"
         indicadores: ["Paga contas mas sem margem"]
       - nivel: "Orange (Trabalhador)"
         indicadores: ["Renda estavel, troca tempo por dinheiro"]
       - nivel: "Yellow (Jogador)"
         indicadores: ["Tem negocio proprio, renda variavel"]
       - nivel: "Green (Empreendedor)"
         indicadores: ["Negocio funciona sem ele por periodos"]
       - nivel: "Blue (Magnata)"
         indicadores: ["Multiplos negocios, renda passiva significativa"]
       - nivel: "Indigo (Investidor)"
         indicadores: ["Dinheiro trabalha para ele"]
       - nivel: "Violet (Lenda)"
         indicadores: ["Legado, impacto em escala global"]
     nivel_atual: "Orange"
     nivel_alvo: "Yellow → Green"
     evidencia: "Trabalha CLT/freelancer, busca primeiro negocio escalavel"
   ```

3. **Gerar Path of Least Resistance:**
   - Caminho natural de monetizacao baseado no perfil
   - Erros comuns de pessoas com esse perfil
   - Exemplos de sucesso com o mesmo perfil

**Output:** `hamilton_analysis` YAML com perfis, spectrum e path

**Checkpoint:** Perfil Wealth Dynamics classificado com evidencias e caminho

---

### Step 6: Analise Alex Hormozi - Equacao de Valor e Monetizacao (3-5 min)

**Agente Responsavel:** alex-hormozi (Tier 1)

**Atividade do Agent:**

1. **Calcular Value Equation Atual:**
   ```yaml
   value_equation:
     formula: "Valor = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)"

     dream_outcome:
       score: 1-10
       descricao: "Quao desejavel e o resultado que voce oferece?"
       evidencia: "Baseado no contexto profissional e habilidades"
       melhoria: "Como aumentar o dream outcome"

     perceived_likelihood:
       score: 1-10
       descricao: "Quao provavel o cliente acredita que vai funcionar?"
       evidencia: "Baseado em portfolio, testimonials, credenciais"
       melhoria: "Como aumentar a likelihood"

     time_delay:
       score: 1-10
       descricao: "Quanto tempo ate o resultado? (menor = melhor)"
       evidencia: "Baseado no modelo de entrega atual"
       melhoria: "Como reduzir time delay"

     effort_sacrifice:
       score: 1-10
       descricao: "Quanto esforco o cliente precisa fazer? (menor = melhor)"
       evidencia: "Baseado na experiencia do cliente"
       melhoria: "Como reduzir effort"

     score_atual: "Calculo: (DO x PL) / (TD x ES)"
     score_ideal: "Target score"
     gap: "Onde focar para maior impacto"
   ```

2. **Identificar Gaps de Monetizacao:**
   ```yaml
   monetization_gaps:
     gap_1:
       area: "Pricing"
       situacao_atual: "Cobra por hora/projeto"
       oportunidade: "Mudar para value-based pricing"
       impacto_estimado: "2-5x na receita"
       dificuldade: "media"
     gap_2:
       area: "Oferta"
       situacao_atual: "Servicos genericos"
       oportunidade: "Grand Slam Offer com garantia"
       impacto_estimado: "3-10x na conversao"
       dificuldade: "alta"
     gap_3:
       area: "Distribuicao"
       situacao_atual: "Depende de indicacao"
       oportunidade: "Criar sistema de aquisicao previsivel"
       impacto_estimado: "Pipeline consistente"
       dificuldade: "media"
   ```

3. **Draft de Grand Slam Offer:**
   ```yaml
   grand_slam_offer_draft:
     headline: "Proposta de oferta irresistivel em uma frase"
     dream_outcome: "O que o cliente conquista"
     garantia: "Risk reversal proposto"
     bonus_stack:
       - bonus: "Bonus 1"
         valor_percebido: "R$ X"
       - bonus: "Bonus 2"
         valor_percebido: "R$ Y"
     urgencia: "Motivo para agir agora"
     preco_sugerido: "Range baseado no valor"
     confianca: 0.6
     nota: "Este e um draft inicial que precisa ser refinado com dados reais de mercado"
   ```

**Output:** `hormozi_analysis` YAML com value equation, gaps e GSO draft

**Checkpoint:** Analise Hormozi completa com score calculado e oferta rascunhada

---

### Step 7: Analise Kathy Kolbe - Estilo de Execucao Conativa (2-4 min)

**Agente Responsavel:** kathy-kolbe (Tier 2)

**Atividade do Agent:**

1. **Estimar 4 Action Modes:**
   Baseado no estilo de trabalho, tomada de decisao e abordagem a problemas:

   ```yaml
   kolbe_estimate:
     fact_finder:
       score_estimado: 1-10
       descricao: "Necessidade de pesquisar, coletar dados, detalhar"
       evidencia: "Comportamento descrito no assessment"
       range: "1-3: Simplifica | 4-6: Equilibrado | 7-10: Detalha"

     follow_thru:
       score_estimado: 1-10
       descricao: "Necessidade de organizar, sistematizar, criar processos"
       evidencia: "Como o aluno estrutura seu trabalho"
       range: "1-3: Flexivel | 4-6: Equilibrado | 7-10: Sistematico"

     quick_start:
       score_estimado: 1-10
       descricao: "Necessidade de inovar, experimentar, agir rapido"
       evidencia: "Como lida com mudanca e incerteza"
       range: "1-3: Cauteloso | 4-6: Equilibrado | 7-10: Inovador"

     implementor:
       score_estimado: 1-10
       descricao: "Necessidade de construir, manipular fisicamente, demonstrar"
       evidencia: "Se prefere abstrato ou concreto"
       range: "1-3: Abstrato | 4-6: Equilibrado | 7-10: Hands-on"

     confianca_geral: 0.65
     nota: "Estimativa baseada em comportamento reportado - Kolbe A Index oficial recomendado para precisao"
   ```

2. **Determinar Estilo de Execucao:**
   ```yaml
   execution_style:
     tipo_primario: "Initiating Quick Start"
     descricao: "Lidera com experimentacao e inovacao, tende a comecar multiplos projetos"
     forca: "Velocidade de inicio, adaptacao rapida, criatividade sob pressao"
     fraqueza: "Pode abandonar projetos antes de completar, falta de follow-through"
     ambiente_ideal: "Startups, projetos novos, brainstorming, prototipagem"
     ambiente_toxico: "Burocracia, processos rigidos, tarefas repetitivas"
   ```

3. **Identificar Conflitos Conativos com Objetivos:**
   ```yaml
   conative_conflicts:
     - conflito: "Quick Start alto + meta de criar processos sistematicos"
       descricao: "O aluno quer criar um sistema, mas sua natureza e experimentar"
       solucao: "Delegar a sistematizacao, focar em prototipagem rapida"
       impacto_se_ignorado: "Frustacao cronica, projetos inacabados"
     - conflito: "..."
   ```

**Output:** `kolbe_analysis` YAML com scores, estilo e conflitos

**Checkpoint:** Estimativa Kolbe completa com estilo e conflitos mapeados

---

### Step 8: Analise Sally Hogshead - Marca Pessoal e Posicionamento (2-4 min)

**Agente Responsavel:** sally-hogshead (Tier 2)

**Atividade do Agent:**

1. **Identificar Fascination Advantages:**
   Baseado em como o aluno naturalmente se comunica, influencia e se diferencia:

   ```yaml
   fascination_advantages:
     vantagens:
       innovation:
         score: 0.0-1.0
         indicadores: ["Criativo", "Visionario", "Muda de abordagem frequentemente"]
       passion:
         score: 0.0-1.0
         indicadores: ["Conecta emocionalmente", "Expressivo", "Contagia outros"]
       power:
         score: 0.0-1.0
         indicadores: ["Autoritativo", "Decisivo", "Lidera com confianca"]
       prestige:
         score: 0.0-1.0
         indicadores: ["Busca excelencia", "Padroes altos", "Respeitado"]
       trust:
         score: 0.0-1.0
         indicadores: ["Confiavel", "Consistente", "Leal"]
       mystique:
         score: 0.0-1.0
         indicadores: ["Reservado", "Observador", "Edita antes de falar"]
       alert:
         score: 0.0-1.0
         indicadores: ["Detalhista", "Cuidadoso", "Previne problemas"]

     vantagem_primaria: "Innovation"
     vantagem_secundaria: "Passion"
     confianca: 0.70
   ```

2. **Determinar Arquetipo (1 dos 42):**
   ```yaml
   archetype:
     nome: "The Rockstar"
     combinacao: "Innovation + Passion"
     descricao: "Lidera com criatividade e energia, inspira outros com visao e entusiasmo"
     valor_diferencial: "Capacidade unica de transformar ideias em movimentos"
     como_outros_veem: "Inspirador, energetico, visionario, as vezes intenso demais"
     como_se_posicionar: "Como a pessoa que transforma ideias em realidade com paixao"
     confianca: 0.70
   ```

3. **Draft de Posicionamento de Marca:**
   ```yaml
   brand_positioning:
     anthem: "Frase de posicionamento em formato Hogshead"
     formato: "[ADJETIVO] [SUBSTANTIVO] que [VERBO] [RESULTADO]"
     exemplo: "O estrategista criativo que transforma caos em clareza"
     tom_de_comunicacao: "Como deve se comunicar para maximizar fascination"
     plataformas_ideais: ["Onde deve estar presente"]
     conteudo_ideal: ["Tipos de conteudo que alavancam o arquetipo"]
     confianca: 0.65
   ```

**Output:** `hogshead_analysis` YAML com advantages, arquetipo e posicionamento

**Checkpoint:** Analise Hogshead completa com arquetipo e positioning

---

### Step 9: Sintese Multi-Framework Cruzada (5-8 min)

**Agente Responsavel:** zona-genialidade-chief (Orchestrator)

**Atividade do Agent:**
Cruzar TODAS as 7 analises anteriores para identificar padroes emergentes.

1. **Pontos de Convergencia:**
   Onde 2+ frameworks apontam na mesma direcao:

   ```yaml
   convergence_points:
     - insight: "Descricao do ponto convergente"
       frameworks_concordantes:
         - framework: "Gay Hendricks"
           evidencia: "Zona de genialidade em ensinar"
         - framework: "Dan Sullivan"
           evidencia: "Unique Ability em simplificar o complexo"
         - framework: "Sally Hogshead"
           evidencia: "Innovation + Passion = Rockstar (inspira ensinando)"
       forca_convergencia: "forte"
       implicacao: "O que isso significa para o aluno"
       confianca: 0.90

     total_convergencias: "N pontos identificados"
     convergencia_mais_forte: "Referencia ao ponto mais claro"
   ```

2. **Insights Unicos:**
   Coisas que APENAS um framework revelou:

   ```yaml
   unique_insights:
     - insight: "Descricao do insight unico"
       framework_origem: "Kathy Kolbe"
       por_que_outros_nao_viram: "Kolbe mede conacao, outros medem cognicao/afeto"
       valor_do_insight: "Explica por que projetos morrem no meio"
       confianca: 0.75
   ```

3. **Contradicoes para Revisao:**
   Onde frameworks discordam - NAO ignorar, DOCUMENTAR:

   ```yaml
   contradictions:
     - contradicao: "Descricao da discordancia"
       framework_a:
         nome: "Roger Hamilton"
         posicao: "Perfil Creator - deveria iniciar projetos"
       framework_b:
         nome: "Kathy Kolbe"
         posicao: "Follow Thru alto - deveria sistematizar"
       resolucao_provavel: "Pode ser Creator que sistematiza (raro mas possivel)"
       acao_recomendada: "Investigar mais profundamente com perguntas adicionais"
       impacto_se_ignorada: "Recomendacao de squad pode ser imprecisa"
   ```

4. **Meta-Insights:**
   Padroes que so emergem quando cruzamos multiplos frameworks:

   ```yaml
   meta_insights:
     - insight: "Insight que nenhum framework individual produziria"
       frameworks_envolvidos: ["Lista de frameworks"]
       explicacao: "Como os frameworks se complementam para revelar isso"
       implicacao_pratica: "O que fazer com essa informacao"
   ```

**Output:** `synthesis` YAML com convergencias, insights unicos, contradicoes e meta-insights

**Checkpoint:** Sintese completa com pelo menos 3 convergencias, 2 insights unicos e contradicoes documentadas

---

## Outputs

### Output Primario

**Genius Profile Document**

Formato: YAML
Localizacao: `squads/zona-genialidade/data/{aluno_slug}/genius-profile.yaml`

```yaml
genius_profile:
  metadata:
    aluno_nome: "{nome}"
    aluno_slug: "{slug}"
    data_analise: "2026-02-13T10:00:00Z"
    versao: "1.0.0"
    assessment_source: "run-assessment task"
    frameworks_aplicados: 7
    confianca_geral: 0.78

  analyses:
    hendricks: "{hendricks_analysis completa}"
    clifton: "{clifton_analysis completa}"
    sullivan: "{sullivan_analysis completa}"
    hamilton: "{hamilton_analysis completa}"
    hormozi: "{hormozi_analysis completa}"
    kolbe: "{kolbe_analysis completa}"
    hogshead: "{hogshead_analysis completa}"

  synthesis:
    convergence_points: "{lista de convergencias}"
    unique_insights: "{lista de insights unicos}"
    contradictions: "{lista de contradicoes}"
    meta_insights: "{lista de meta-insights}"

  summary:
    zona_atual: "Excelencia (armadilha classica)"
    perfil_dominante: "Creator-Star"
    top_3_talentos: ["Strategic", "Ideation", "Communication"]
    unique_ability: "Frase resumida"
    estilo_execucao: "Initiating Quick Start"
    arquetipo_marca: "The Rockstar"
    upper_limit_problem: "Tipo 4 - Crime do Brilho"
    value_equation_score: 6.5
```

### Outputs Secundarios

1. **Analise Individual por Framework**
   - Formato: 7 arquivos YAML separados
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/analyses/`
   - Conteudo: Cada analise completa para referencia individual

2. **Log de Analise**
   - Formato: YAML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/analysis-log.yaml`
   - Conteudo: Decisoes tomadas, confianca de cada step, tempo gasto

---

## Validacao

### Checklist

- [ ] Assessment result lido completamente (NUNCA leitura parcial)
- [ ] Dados de entrada validados (todas as 5 secoes presentes e completas)
- [ ] Analise Gay Hendricks completa com zona, distribuicao, ULP e caminho
- [ ] Analise Don Clifton completa com top 5, dominios e talentos na sombra
- [ ] Analise Dan Sullivan completa com zonas, UA statement e delegacao
- [ ] Analise Roger Hamilton completa com perfil, spectrum e path
- [ ] Analise Alex Hormozi completa com value equation, gaps e GSO draft
- [ ] Analise Kathy Kolbe completa com scores, estilo e conflitos conativos
- [ ] Analise Sally Hogshead completa com advantages, arquetipo e positioning
- [ ] Sintese cruzada com pelo menos 3 convergencias identificadas
- [ ] Contradicoes entre frameworks documentadas (nao ignoradas)
- [ ] Todas as analises tem confianca >= 0.6
- [ ] Output YAML e valido e parseavel
- [ ] Summary preenchido com todos os campos

### Criterios de Sucesso

**Threshold: 11/14 no checklist acima**

| Criterio | Excelente (3) | Aceitavel (2) | Fraco (1) |
|----------|--------------|----------------|---------|
| **Cobertura de frameworks** | Todos os 7 frameworks aplicados com profundidade | 6 frameworks completos, 1 superficial | 5 ou menos frameworks |
| **Qualidade de evidencia** | Cada classificacao tem citacao direta do assessment | 80% tem evidencia direta | Classificacoes sem evidencia |
| **Sintese cruzada** | 5+ convergencias, insights unicos E contradicoes | 3 convergencias, alguns insights | Sintese superficial ou ausente |
| **Actionability** | Cada analise gera recomendacoes concretas | Maioria gera recomendacoes | Analise descritiva sem acao |
| **Confianca calibrada** | Scores de confianca refletem evidencia real | Scores razoaveis | Confianca inflada ou deflacionada |

---

## Esforco Estimado

| Componente | Esforco | Notas |
|-----------|--------|-------|
| **Carregar e validar** | 2 min | Leitura completa + checagem |
| **Gay Hendricks** | 3-5 min | Framework fundacional, executa primeiro |
| **Don Clifton** | 3-5 min | Mapeamento de talentos |
| **Dan Sullivan** | 3-5 min | Unique Ability e delegacao |
| **Roger Hamilton** | 3-5 min | Wealth Dynamics |
| **Alex Hormozi** | 3-5 min | Value Equation e monetizacao |
| **Kathy Kolbe** | 2-4 min | Estilo conativo |
| **Sally Hogshead** | 2-4 min | Marca pessoal |
| **Sintese cruzada** | 5-8 min | Cruzamento e meta-insights |
| **Total** | 15-30 min | Completamente autonomo |

---

## Integracao

### Alimenta

**Workflow:** Pipeline Zona Genialidade (zona-genialidade/full-pipeline)

**Proximas Tasks na Sequencia:**
- **Task 3:** recommend-squad - Usa: genius_profile (synthesis + analyses)
- **Task 4:** generate-blueprint - Usa: genius_profile completo

### Depende De

- **Task 1:** run-assessment - Fornece: assessment-result.yaml

### Roteamento de Agentes

**Orchestrador:** zona-genialidade-chief (coordena a sequencia dos 7 agentes)
**Tier 0:** gay-hendricks (executa primeiro - framework fundacional)
**Tier 1:** don-clifton, dan-sullivan, roger-hamilton, alex-hormozi (podem executar em paralelo)
**Tier 2:** kathy-kolbe, sally-hogshead (executam apos Tier 1 para poder referenciar)

---

## Quality Threshold

**Pass/Fail Gate:** Checklist score >= 11/14

Se < 11/14:
1. Identificar quais criterios falharam
2. Se framework incompleto: re-analisar com foco nas lacunas
3. Se sintese fraca: re-cruzar com atencao especifica a convergencias
4. Se confianca baixa: revisar evidencias e recalibrar
5. Re-validar

**Razoes Comuns de Falha:**
- Assessment com respostas vagas (dados insuficientes para classificacao)
- Aluno com perfil muito equilibrado (dificulta identificacao de dominancias)
- Contradicoes entre auto-percepcao e feedback externo (requer investigacao)
- Dados de contexto profissional insuficientes para Hormozi/Hamilton

---

## Notas para o Executor

### Quando o Aluno Tem Perfil Muito Equilibrado

Alguns alunos nao tem dominancias claras. Neste caso:
- NAO forcar uma classificacao
- Reportar scores proximos com nota de equilibrio
- Recomendar assessment formal (Kolbe A Index, CliftonStrengths oficial)
- Focar na sintese cruzada que pode revelar padroes sutis

### Quando Existe Assessment Formal Previo

Se o aluno tem CliftonStrengths oficial, DISC formal, ou Kolbe A Index:
- Usar como ancora de calibracao (prioridade sobre estimativa)
- Ajustar as demais estimativas baseado nos dados confirmados
- Notar discrepancias entre auto-report e resultado formal

### Quando Ha Contradicao Forte Entre Frameworks

Contradicoes NAO sao erros. Elas frequentemente revelam:
- Contexto-dependencia (se comporta diferente em situacoes diferentes)
- Transicao de identidade (quem era vs quem esta se tornando)
- Conflito interno real (desejo vs comportamento)
Documentar AMBOS os lados com suas evidencias.

### Quando os Dados Sao Insuficientes

Se algum campo do assessment esta vazio ou vago:
- Classificar com confianca < 0.5
- Marcar como "requer dados adicionais"
- NAO inventar dados ou assumir
- Seguir com as demais analises que tem dados suficientes

---

## Historico de Revisoes

| Versao | Data | Mudanca |
|---------|------|--------|
| 1.0.0 | 2026-02-13 | Release inicial de producao |
