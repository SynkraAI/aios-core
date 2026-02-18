# Task: Recomendar Squad Ideal

**Task ID:** zona-genialidade/recommend-squad
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Zona Genialidade Pipeline
**Total Lines:** 450

---

## Executive Summary

Esta task recebe o genius_profile completo (output da task `analyze-genius-profile`) e executa um algoritmo de matching multi-camada para recomendar qual(is) squad(s) o aluno deveria criar ou operar. O matching combina 3 fontes primarias: Wealth Dynamics (Roger Hamilton), Kolbe Action Modes (Kathy Kolbe) e CliftonStrengths Domains (Don Clifton), gerando um score composto para cada squad candidato. A task e completamente autonoma.

**Posicao no Workflow:** Task 3 na pipeline Zona Genialidade (depende de `analyze-genius-profile`)
**Definicao de Sucesso:** Top 3 squads recomendados com scores >= 0.7 e racional claro por recomendacao
**Quality Gate de Output:** Cada recomendacao deve ter score de 3 fontes + justificativa especifica do perfil

---

## Proposito

O aluno chega ao Cohort com um mapa de genialidade mas sem saber ONDE aplicar. "Sei que sou Creator-Star com Strategic Thinking dominante e Quick Start alto... e agora?" Esta task responde essa pergunta com precisao algoritmica, nao com intuicao generica.

O matching nao e aleatorio. Cada squad no ecossistema AIOS tem um perfil ideal de operador. Um Creator-Star com Quick Start alto prospera no Creator-OS mas morreria operando o ETL-Data-Collector. Um Mechanic com Follow Thru alto domina o AIOS/MethodologyOS mas se frustraria no Stories10x.

Esta task evita o erro fatal de squads: colocar a pessoa certa no squad errado, o que leva a abandono, frustracao e perda de investimento.

---

## Tipo de Executor

**Agent (100% autonomo)**

- **Papel do Agent:** Executa algoritmo de matching, calcula scores compostos, gera recomendacoes com racional
- **Papel do Humano:** Nenhum durante o matching (humano escolhe squad no Blueprint)
- **Runtime Estimado:** 5-15 minutos

---

## Inputs

### Inputs Obrigatorios

```yaml
genius_profile:
  field: "Perfil de genialidade completo com 7 analises + sintese"
  format: "YAML"
  required: true
  location: "squads/zona-genialidade/data/{aluno_slug}/genius-profile.yaml"
  validation: "Deve conter todas as 7 analises e sintese cruzada"
  notes: "Output direto da task analyze-genius-profile"

  campos_utilizados_no_matching:
    hamilton_analysis:
      perfil_primario: "string - 1 dos 8 perfis Wealth Dynamics"
      perfil_secundario: "string - perfil complementar"
      nivel_wealth_spectrum: "string - nivel atual"

    kolbe_analysis:
      fact_finder: "integer 1-10"
      follow_thru: "integer 1-10"
      quick_start: "integer 1-10"
      implementor: "integer 1-10"

    clifton_analysis:
      dominio_dominante: "string - Executing|Influencing|Relationship|Strategic"
      dominio_secundario: "string"
      top_5_provaveis: "list de temas"

    sullivan_analysis:
      unique_ability_atividades: "list de atividades UA"
      time_distribution: "distribuicao atual de tempo"

    hormozi_analysis:
      value_equation_score: "float"
      monetization_gaps: "list de gaps"

    synthesis:
      convergence_points: "list de convergencias"
      meta_insights: "list de meta-insights"
```

### Inputs Opcionais

```yaml
squads_existentes:
  field: "Lista atualizada de squads disponiveis no ecossistema"
  format: "YAML"
  required: false
  default: "Usar lista hardcoded atualizada na ultima revisao"
  notes: "Permite matching dinamico com novos squads"

preferencias_aluno:
  field: "Preferencias explicitas do aluno sobre area de atuacao"
  format: "text"
  required: false
  notes: "Se fornecido, adiciona peso ao matching (mas nao sobrepoe dados objetivos)"

restricoes:
  field: "Restricoes que eliminam certos squads"
  format: "list"
  required: false
  example: ["Nao pode investir mais que R$ 500/mes", "Nao tem equipe", "Nao fala ingles"]
  notes: "Filtro eliminatorio aplicado ANTES do scoring"
```

---

## Precondicoes

Antes de iniciar esta task:

- [ ] genius-profile.yaml existe em `squads/zona-genialidade/data/{aluno_slug}/`
- [ ] Genius profile contem todas as 7 analises completas
- [ ] Genius profile passou no quality gate (checklist >= 11/14)
- [ ] Nao existe recomendacao anterior para este aluno (ou re-matching explicitamente solicitado)

---

## Steps

### Step 1: Carregar Genius Profile e Catalogo de Squads (2 min)

**Atividade do Agent:**
- Ler genius-profile.yaml COMPLETO
- Carregar catalogo de squads disponiveis
- Aplicar filtros eliminatorios se `restricoes` fornecidas

**Catalogo de Squads do Ecossistema AIOS:**

```yaml
squad_catalog:
  # --- Squads de Criacao de Conteudo ---
  creator_os:
    nome: "Creator-OS"
    descricao: "Criacao de cursos, mentorias e produtos digitais"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Creator", "Star"]
    kolbe_ideal:
      quick_start: "7+"
      fact_finder: "4-7"
    dominio_ideal_clifton: ["Strategic Thinking", "Influencing"]
    complexidade: "media"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Expertise em algum tema", "Capacidade de ensinar"]

  copywriter_os:
    nome: "CopywriterOS"
    descricao: "Copywriting persuasivo e redacao comercial"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Creator", "Star", "Deal Maker"]
    kolbe_ideal:
      quick_start: "6+"
      fact_finder: "5+"
    dominio_ideal_clifton: ["Influencing", "Strategic Thinking"]
    complexidade: "media"
    investimento_minimo: "R$ 0-200/mes"
    pre_requisitos: ["Habilidade escrita", "Entendimento de persuasao"]

  bestseller_writer:
    nome: "BestSeller Writer"
    descricao: "Escrever e publicar livros/ebooks"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Creator", "Accumulator"]
    kolbe_ideal:
      follow_thru: "6+"
      fact_finder: "6+"
    dominio_ideal_clifton: ["Strategic Thinking", "Executing"]
    complexidade: "alta"
    investimento_minimo: "R$ 200-1000/mes"
    pre_requisitos: ["Disciplina de escrita", "Conteudo substancial"]

  stories_10x:
    nome: "Stories10x"
    descricao: "Storytelling multiplicado em multiplas midias"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Star", "Creator"]
    kolbe_ideal:
      quick_start: "7+"
      implementor: "4+"
    dominio_ideal_clifton: ["Influencing", "Relationship Building"]
    complexidade: "media"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Presenca em redes", "Historias para contar"]

  video_prod:
    nome: "VideoProd"
    descricao: "Producao de video com narrativa e edicao avancada"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Creator", "Mechanic"]
    kolbe_ideal:
      implementor: "6+"
      follow_thru: "5+"
    dominio_ideal_clifton: ["Executing", "Strategic Thinking"]
    complexidade: "alta"
    investimento_minimo: "R$ 500-2000/mes"
    pre_requisitos: ["Equipamento basico", "Software de edicao"]

  content_distillery:
    nome: "Content Distillery"
    descricao: "Destilar conteudo bruto em conhecimento estruturado"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Mechanic", "Accumulator"]
    kolbe_ideal:
      fact_finder: "7+"
      follow_thru: "6+"
    dominio_ideal_clifton: ["Strategic Thinking", "Executing"]
    complexidade: "media"
    investimento_minimo: "R$ 0-300/mes"
    pre_requisitos: ["Pensamento analitico", "Curadoria de conteudo"]

  conteudo_desenhado:
    nome: "Conteudo Desenhado"
    descricao: "Conteudo visual com narrativa de dados"
    categoria: "Criacao"
    perfil_ideal_hamilton: ["Creator", "Mechanic"]
    kolbe_ideal:
      implementor: "6+"
      fact_finder: "5+"
    dominio_ideal_clifton: ["Executing", "Strategic Thinking"]
    complexidade: "media"
    investimento_minimo: "R$ 200-800/mes"
    pre_requisitos: ["Sensibilidade visual", "Capacidade analitica"]

  # --- Squads de Vendas e Marketing ---
  meddpicc_qualifier:
    nome: "MEDDPICC Qualifier"
    descricao: "Qualificacao de vendas complexas B2B"
    categoria: "Vendas"
    perfil_ideal_hamilton: ["Deal Maker", "Supporter"]
    kolbe_ideal:
      fact_finder: "7+"
      quick_start: "5+"
    dominio_ideal_clifton: ["Influencing", "Relationship Building"]
    complexidade: "alta"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Experiencia em vendas B2B", "CRM configurado"]

  marketing_ops:
    nome: "MarketingOps"
    descricao: "Operacoes de marketing digital e growth"
    categoria: "Marketing"
    perfil_ideal_hamilton: ["Trader", "Star"]
    kolbe_ideal:
      fact_finder: "6+"
      follow_thru: "6+"
    dominio_ideal_clifton: ["Executing", "Influencing"]
    complexidade: "alta"
    investimento_minimo: "R$ 500-2000/mes"
    pre_requisitos: ["Conhecimento de marketing digital", "Ferramentas de analytics"]

  # --- Squads de Tecnologia e Sistemas ---
  aios_methodology:
    nome: "AIOS/MethodologyOS"
    descricao: "Criacao de sistemas e metodologias operacionais"
    categoria: "Tecnologia"
    perfil_ideal_hamilton: ["Mechanic", "Accumulator"]
    kolbe_ideal:
      follow_thru: "8+"
      fact_finder: "7+"
    dominio_ideal_clifton: ["Executing", "Strategic Thinking"]
    complexidade: "muito_alta"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Pensamento sistemico", "Disciplina de documentacao"]

  etl_data_collector:
    nome: "ETL Data Collector"
    descricao: "Coleta, transformacao e carga de dados"
    categoria: "Tecnologia"
    perfil_ideal_hamilton: ["Accumulator", "Mechanic"]
    kolbe_ideal:
      follow_thru: "7+"
      fact_finder: "8+"
    dominio_ideal_clifton: ["Executing", "Strategic Thinking"]
    complexidade: "alta"
    investimento_minimo: "R$ 0-300/mes"
    pre_requisitos: ["Habilidades tecnicas basicas", "Pensamento analitico"]

  tool_discovery:
    nome: "Tool Discovery"
    descricao: "Descoberta e avaliacao de ferramentas e MCPs"
    categoria: "Tecnologia"
    perfil_ideal_hamilton: ["Mechanic", "Trader"]
    kolbe_ideal:
      fact_finder: "8+"
      quick_start: "5+"
    dominio_ideal_clifton: ["Strategic Thinking", "Executing"]
    complexidade: "media"
    investimento_minimo: "R$ 0-200/mes"
    pre_requisitos: ["Curiosidade tecnica", "Avaliacao critica"]

  gdrive_ingestor:
    nome: "GDrive Ingestor"
    descricao: "Ingestao e classificacao de conteudo do Google Drive"
    categoria: "Tecnologia"
    perfil_ideal_hamilton: ["Accumulator", "Mechanic"]
    kolbe_ideal:
      follow_thru: "7+"
      fact_finder: "6+"
    dominio_ideal_clifton: ["Executing"]
    complexidade: "media"
    investimento_minimo: "R$ 0"
    pre_requisitos: ["Google Drive organizado", "Conteudo para processar"]

  # --- Squads de Ensino e Mentoria ---
  dopamine_learning:
    nome: "Dopamine Learning"
    descricao: "Design de experiencias de aprendizagem gamificadas"
    categoria: "Ensino"
    perfil_ideal_hamilton: ["Creator", "Mechanic"]
    kolbe_ideal:
      quick_start: "6+"
      fact_finder: "6+"
    dominio_ideal_clifton: ["Strategic Thinking", "Relationship Building"]
    complexidade: "alta"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Conhecimento de design instrucional", "Interesse em gamificacao"]

  mentoria_engine:
    nome: "MentoriaEngine"
    descricao: "Motor de mentorias escalaveis"
    categoria: "Ensino"
    perfil_ideal_hamilton: ["Supporter", "Star"]
    kolbe_ideal:
      fact_finder: "5+"
      quick_start: "5+"
    dominio_ideal_clifton: ["Relationship Building", "Influencing"]
    complexidade: "media"
    investimento_minimo: "R$ 200-1000/mes"
    pre_requisitos: ["Experiencia em mentoria", "Base de conhecimento"]

  # --- Squads de Inteligencia e Pesquisa ---
  ai_studio_prompt_builder:
    nome: "AI Studio Prompt Builder"
    descricao: "Construcao de prompts e fluxos de AI"
    categoria: "Inteligencia"
    perfil_ideal_hamilton: ["Mechanic", "Creator"]
    kolbe_ideal:
      fact_finder: "7+"
      quick_start: "6+"
    dominio_ideal_clifton: ["Strategic Thinking"]
    complexidade: "media"
    investimento_minimo: "R$ 100-500/mes"
    pre_requisitos: ["Familiaridade com AI/LLMs", "Pensamento estruturado"]

  mmos_mind_mapper:
    nome: "MMOS Mind Mapper"
    descricao: "Criacao de clones cognitivos e bases de conhecimento"
    categoria: "Inteligencia"
    perfil_ideal_hamilton: ["Accumulator", "Mechanic"]
    kolbe_ideal:
      fact_finder: "8+"
      follow_thru: "7+"
    dominio_ideal_clifton: ["Strategic Thinking", "Executing"]
    complexidade: "muito_alta"
    investimento_minimo: "R$ 0-500/mes"
    pre_requisitos: ["Pensamento profundo", "Paciencia para processos longos"]

  video_data_storytelling:
    nome: "Video Data Storytelling"
    descricao: "Narrativas visuais baseadas em dados"
    categoria: "Inteligencia"
    perfil_ideal_hamilton: ["Creator", "Star"]
    kolbe_ideal:
      implementor: "6+"
      fact_finder: "6+"
    dominio_ideal_clifton: ["Strategic Thinking", "Influencing"]
    complexidade: "alta"
    investimento_minimo: "R$ 300-1000/mes"
    pre_requisitos: ["Habilidade com dados", "Sensibilidade narrativa"]
```

**Checkpoint:** Profile carregado, catalogo pronto, filtros aplicados

---

### Step 2: Calcular Match Primario - Wealth Dynamics (3-5 min)

**Atividade do Agent:**
Aplicar matching baseado no perfil Roger Hamilton:

```yaml
matching_primario:
  regras:
    Creator:
      squads_naturais: ["creator_os", "video_prod", "copywriter_os", "bestseller_writer", "stories_10x", "conteudo_desenhado"]
      peso_match: 0.40
      logica: "Creators geram ideias e iniciam projetos. Squads de criacao sao seu habitat natural."

    Mechanic:
      squads_naturais: ["aios_methodology", "etl_data_collector", "content_distillery", "tool_discovery", "gdrive_ingestor", "ai_studio_prompt_builder"]
      peso_match: 0.40
      logica: "Mechanics otimizam sistemas. Squads de tecnologia e processos sao seu terreno."

    Star:
      squads_naturais: ["stories_10x", "video_data_storytelling", "marketing_ops", "mentoria_engine"]
      peso_match: 0.40
      logica: "Stars brilham na frente do publico. Squads de visibilidade e marca pessoal."

    Supporter:
      squads_naturais: ["mentoria_engine", "dopamine_learning"]
      peso_match: 0.40
      logica: "Supporters lideram e conectam. Squads de ensino e mentoria."

    Deal_Maker:
      squads_naturais: ["meddpicc_qualifier", "marketing_ops"]
      peso_match: 0.40
      logica: "Deal Makers negociam. Squads de vendas e parcerias."

    Trader:
      squads_naturais: ["marketing_ops", "etl_data_collector", "tool_discovery"]
      peso_match: 0.40
      logica: "Traders analisam metricas. Squads de analytics e otimizacao."

    Accumulator:
      squads_naturais: ["etl_data_collector", "mmos_mind_mapper", "content_distillery", "gdrive_ingestor"]
      peso_match: 0.40
      logica: "Accumulators colecionam ativos. Squads de coleta e acumulo de dados/conteudo."

    Lord:
      squads_naturais: ["aios_methodology", "etl_data_collector"]
      peso_match: 0.40
      logica: "Lords controlam sistemas. Squads de gestao e compliance."

  calculo:
    perfil_primario_match: "1.0 se squad esta nos squads_naturais do perfil primario"
    perfil_secundario_match: "0.5 se squad esta nos squads_naturais do perfil secundario"
    score_hamilton: "(primario * 1.0 + secundario * 0.5) * peso_match"
```

**Output:** Score Hamilton para cada squad (0.0 - 0.40)

**Checkpoint:** Scores primarios calculados para todos os squads

---

### Step 3: Calcular Match Secundario - Kolbe Action Modes (2-4 min)

**Atividade do Agent:**
Aplicar matching baseado nos Action Modes estimados:

```yaml
matching_secundario:
  peso_total: 0.30

  calculo_por_squad:
    para_cada_squad:
      - comparar: "kolbe_estimado do aluno vs kolbe_ideal do squad"
      - formula: |
          Para cada action mode (fact_finder, follow_thru, quick_start, implementor):
            Se kolbe_ideal define "X+":
              match = 1.0 se aluno >= X
              match = 0.5 se aluno >= X-2
              match = 0.0 se aluno < X-2
            Se kolbe_ideal define range "X-Y":
              match = 1.0 se aluno entre X e Y
              match = 0.5 se aluno proximo (+/- 2)
              match = 0.0 se fora do range
          score_mode = media(matches dos modes definidos)
          score_kolbe = score_mode * peso_total

  interpretacao_complementar:
    quick_start_alto_7plus:
      fortalece: ["Squads de inovacao, prototipagem, lancamento rapido"]
      enfraquece: ["Squads de manutencao, compliance, processos longos"]
      squads_bonus: ["creator_os", "stories_10x", "ai_studio_prompt_builder"]

    fact_finder_alto_7plus:
      fortalece: ["Squads de pesquisa, analise, documentacao"]
      enfraquece: ["Squads que exigem acao rapida sem dados"]
      squads_bonus: ["content_distillery", "meddpicc_qualifier", "mmos_mind_mapper"]

    follow_thru_alto_7plus:
      fortalece: ["Squads de sistema, processo, operacao"]
      enfraquece: ["Squads caoticos ou muito criativos sem estrutura"]
      squads_bonus: ["aios_methodology", "etl_data_collector", "gdrive_ingestor"]

    implementor_alto_7plus:
      fortalece: ["Squads de producao concreta, construcao, hands-on"]
      enfraquece: ["Squads puramente estrategicos ou abstratos"]
      squads_bonus: ["video_prod", "conteudo_desenhado", "video_data_storytelling"]
```

**Output:** Score Kolbe para cada squad (0.0 - 0.30)

**Checkpoint:** Scores secundarios calculados

---

### Step 4: Calcular Match Terciario - CliftonStrengths Domain (2-3 min)

**Atividade do Agent:**
Aplicar matching baseado no dominio dominante:

```yaml
matching_terciario:
  peso_total: 0.20

  calculo:
    Executing:
      squads_forte_match: ["aios_methodology", "etl_data_collector", "video_prod", "gdrive_ingestor", "content_distillery"]
      descricao: "Dominio de entrega e producao - squads que exigem execucao consistente"
      score_match: 1.0

    Influencing:
      squads_forte_match: ["meddpicc_qualifier", "marketing_ops", "stories_10x", "copywriter_os"]
      descricao: "Dominio de influencia e vendas - squads que exigem persuasao"
      score_match: 1.0

    Relationship_Building:
      squads_forte_match: ["mentoria_engine", "dopamine_learning"]
      descricao: "Dominio de relacionamento - squads que exigem conexao humana"
      score_match: 1.0

    Strategic_Thinking:
      squads_forte_match: ["ai_studio_prompt_builder", "mmos_mind_mapper", "content_distillery", "tool_discovery"]
      descricao: "Dominio estrategico - squads que exigem pensamento profundo"
      score_match: 1.0

  bonus_top_5:
    descricao: "Temas especificos do top 5 podem dar bonus a squads especificos"
    exemplos:
      - tema: "Communication"
        bonus: "+0.05 para squads de conteudo/vendas"
      - tema: "Learner"
        bonus: "+0.05 para squads de pesquisa/ensino"
      - tema: "Achiever"
        bonus: "+0.05 para squads de alta producao"
      - tema: "Strategic"
        bonus: "+0.05 para squads de planejamento"
```

**Output:** Score Clifton para cada squad (0.0 - 0.20)

**Checkpoint:** Scores terciarios calculados

---

### Step 5: Calcular Bonus de Contexto (2-3 min)

**Atividade do Agent:**
Aplicar ajustes baseados em fatores contextuais:

```yaml
context_bonus:
  peso_total: 0.10

  fatores:
    value_equation_score:
      descricao: "Score Hormozi indica maturidade de monetizacao"
      regra: |
        Se value_equation >= 7: bonus para squads avanados (meddpicc, marketing_ops)
        Se value_equation <= 4: bonus para squads fundamentais (creator_os, ai_studio)
      impacto: "+/- 0.03"

    unique_ability_alignment:
      descricao: "Se UA do Sullivan alinha diretamente com atividades do squad"
      regra: "Comparar atividades UA com descricao do squad"
      impacto: "+0.05 se alinhamento forte"

    convergence_points:
      descricao: "Se sintese identificou convergencia que aponta para squad especifico"
      regra: "Convergencias de 3+ frameworks adicionam bonus"
      impacto: "+0.03 por convergencia relevante"

    wealth_spectrum_level:
      descricao: "Nivel atual no Wealth Spectrum determina viabilidade"
      regra: |
        Infrared/Red: filtrar squads com investimento > R$ 200/mes
        Orange: preferir squads de baixo investimento
        Yellow+: todos os squads viaveis
      impacto: "Filtro eliminatorio + bonus de viabilidade"

    upper_limit_problem:
      descricao: "ULP tipo pode influenciar escolha de squad"
      regra: |
        Tipo 4 (medo de brilhar): reduzir score de squads de visibilidade (Star squads)
        Tipo 1 (sentir-se falho): reduzir score de squads muito ambiciosos
      impacto: "-0.03 para squads contra-indicados pelo ULP"
      nota: "NAO eliminar, apenas ajustar. ULP e algo a superar, nao a obedecer."
```

**Output:** Bonus de contexto para cada squad (0.0 - 0.10)

**Checkpoint:** Todos os 4 layers de scoring calculados

---

### Step 6: Compilar Score Composto e Rankear (2 min)

**Atividade do Agent:**

```yaml
composite_scoring:
  formula: |
    score_total = score_hamilton (0-0.40)
               + score_kolbe (0-0.30)
               + score_clifton (0-0.20)
               + context_bonus (0-0.10)

    Maximum possible: 1.00
    Minimum recommended: 0.50

  ranking:
    para_cada_squad:
      - calcular: score_total
      - rankear: por score_total decrescente
      - filtrar: remover squads com score < 0.30

  output_format:
    - squad: "creator_os"
      score_total: 0.87
      breakdown:
        hamilton: 0.40
        kolbe: 0.25
        clifton: 0.15
        context: 0.07
      rank: 1
```

**Checkpoint:** Ranking final com scores compostos para todos os squads elegíveis

---

### Step 7: Gerar Top 3 Recomendacoes com Racional (3-5 min)

**Atividade do Agent:**
Para cada um dos 3 squads mais bem ranqueados, gerar recomendacao detalhada:

```yaml
top_3_recommendations:
  recomendacao_1:
    squad: "creator_os"
    score: 0.87
    titulo: "Seu Squad Natural - Creator-OS"
    racional: |
      Explicacao detalhada de POR QUE este squad e ideal para este aluno especifico.
      Cruzando:
      - Wealth Dynamics: {perfil} indica que voce prospera quando {atividade}
      - Kolbe: Seu Quick Start de {X} significa que {implicacao}
      - CliftonStrengths: Seu dominio {dominio} alinha com {aspecto do squad}
      - Sullivan: Sua Unique Ability em {UA} e exatamente o que este squad exige
    como_comecar:
      - passo: "Primeiro passo concreto"
        prazo: "Semana 1"
      - passo: "Segundo passo concreto"
        prazo: "Semana 2"
      - passo: "Terceiro passo concreto"
        prazo: "Semana 3-4"
    riscos:
      - risco: "Risco especifico baseado no perfil"
        mitigacao: "Como evitar"
    potencial_receita:
      curto_prazo: "R$ X-Y/mes em 90 dias"
      medio_prazo: "R$ X-Y/mes em 6 meses"
      nota: "Estimativa conservadora baseada em media do mercado"

  recomendacao_2:
    squad: "{segundo squad}"
    score: 0.74
    titulo: "Sua Alternativa Forte - {Nome}"
    racional: "..."
    como_comecar: "..."
    riscos: "..."
    potencial_receita: "..."

  recomendacao_3:
    squad: "{terceiro squad}"
    score: 0.68
    titulo: "Seu Curinga Estrategico - {Nome}"
    racional: "..."
    como_comecar: "..."
    riscos: "..."
    potencial_receita: "..."
```

**Checkpoint:** Top 3 com racional completo e actionable

---

### Step 8: Projetar "Dream Squad" Personalizado (2-3 min)

**Atividade do Agent:**
Se nenhum squad existente fosse restricao, que squad IDEAL este aluno criaria?

```yaml
dream_squad:
  nome_sugerido: "Nome criativo baseado no perfil"
  descricao: "O que este squad faria"
  baseado_em:
    unique_ability: "Atividade central derivada do Sullivan"
    zona_genialidade: "Zona identificada pelo Hendricks"
    perfil_riqueza: "Path natural do Hamilton"
    arquetipo_marca: "Posicionamento do Hogshead"
  diferencial: "O que torna este squad unico no ecossistema"
  viabilidade:
    score: 0.0-1.0
    nota: "Avaliacao honesta de viabilidade atual"
    pre_requisitos_faltantes: ["O que precisaria desenvolver primeiro"]
  caminho_ate_dream_squad:
    - fase: "Fase 1 - Comecar com squad recomendado #1"
      duracao: "3-6 meses"
      objetivo: "Desenvolver X"
    - fase: "Fase 2 - Transicionar ou acumular"
      duracao: "6-12 meses"
      objetivo: "Desenvolver Y"
    - fase: "Fase 3 - Lancar Dream Squad"
      duracao: "12-18 meses"
      objetivo: "Operar squad ideal"
```

**Checkpoint:** Dream Squad projetado com caminho realista

---

### Step 9: Definir Next Step Imediato (1-2 min)

**Atividade do Agent:**
Decidir qual e o UNICO proximo passo que o aluno deve dar:

```yaml
immediate_next_step:
  squad_para_comecar: "{squad #1 do ranking}"
  motivo: "Por que comecar por este e nao pelo dream squad"
  acao_concreta: "Acao que pode fazer HOJE"
  prazo: "Quando fazer"
  recurso_necessario: "O que precisa ter"
  criterio_sucesso: "Como saber que deu certo"
  nota_motivacional: "Frase de encorajamento baseada no perfil e arquetipo"
```

**Checkpoint:** Next step claro, unico e executavel

---

## Outputs

### Output Primario

**Squad Recommendation Document**

Formato: YAML
Localizacao: `squads/zona-genialidade/data/{aluno_slug}/squad-recommendation.yaml`

```yaml
squad_recommendation:
  metadata:
    aluno_nome: "{nome}"
    aluno_slug: "{slug}"
    data_recomendacao: "2026-02-13T10:30:00Z"
    genius_profile_version: "1.0.0"
    total_squads_avaliados: 18
    total_squads_elegíveis: 15
    squads_filtrados: 3

  ranking_completo:
    - squad: "creator_os"
      score: 0.87
      rank: 1
    - squad: "stories_10x"
      score: 0.74
      rank: 2
    # ... todos os squads rankeados

  top_3:
    recomendacao_1: "{objeto completo}"
    recomendacao_2: "{objeto completo}"
    recomendacao_3: "{objeto completo}"

  dream_squad: "{objeto completo}"

  immediate_next_step: "{objeto completo}"

  scoring_breakdown:
    methodology: "Hamilton(40%) + Kolbe(30%) + Clifton(20%) + Context(10%)"
    nota: "Scores sao estimativas baseadas em assessment comportamental, nao em testes formais"
```

### Outputs Secundarios

1. **Scoring Matrix**
   - Formato: YAML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/scoring-matrix.yaml`
   - Conteudo: Matrix completa com breakdown de cada squad por cada dimensao

2. **Anti-Recommendations**
   - Formato: YAML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/anti-recommendations.yaml`
   - Conteudo: Squads que o aluno deve EVITAR e por que (tao valioso quanto saber o que fazer)

---

## Validacao

### Checklist

- [ ] Genius profile lido completamente (NUNCA leitura parcial)
- [ ] Catalogo de squads carregado e atualizado
- [ ] Filtros eliminatorios aplicados (restricoes do aluno)
- [ ] Score Hamilton calculado para todos os squads elegiveis
- [ ] Score Kolbe calculado para todos os squads elegiveis
- [ ] Score Clifton calculado para todos os squads elegiveis
- [ ] Bonus de contexto aplicados (Hormozi, Sullivan, Synthesis)
- [ ] Score composto calculado e ranking gerado
- [ ] Top 3 tem racional detalhado com citacoes do genius profile
- [ ] Dream Squad projetado com caminho realista
- [ ] Next step imediato definido com acao concreta
- [ ] Nenhum squad recomendado com score < 0.50
- [ ] Anti-recommendations geradas para squads com score < 0.30
- [ ] Output YAML valido e parseavel

### Criterios de Sucesso

**Threshold: 11/14 no checklist acima**

| Criterio | Excelente (3) | Aceitavel (2) | Fraco (1) |
|----------|--------------|----------------|---------|
| **Precision do matching** | Top 3 alinha claramente com perfil do aluno | 2 de 3 sao bons matches | Recomendacoes parecem genericas |
| **Qualidade do racional** | Cada recomendacao cita dados especificos do genius profile | Racionaliza mas com evidencia generica | Racional vago sem evidencia |
| **Actionability** | Next step pode ser executado hoje, passos claros | Passos claros mas precisa preparacao | Vagos ou dependem de muitos pre-requisitos |
| **Dream Squad realista** | Caminho de 3 fases com marcos claros | Caminho definido mas vago em prazos | Idealista sem plano concreto |
| **Cobertura de riscos** | Riscos especificos por recomendacao com mitigacao | Riscos genericos mencionados | Sem mencao de riscos |

---

## Esforco Estimado

| Componente | Esforco | Notas |
|-----------|--------|-------|
| **Carregar dados** | 2 min | Profile + catalogo |
| **Match Hamilton** | 3-5 min | Scoring primario |
| **Match Kolbe** | 2-4 min | Scoring secundario |
| **Match Clifton** | 2-3 min | Scoring terciario |
| **Bonus contexto** | 2-3 min | Ajustes finos |
| **Compilar ranking** | 2 min | Score composto |
| **Top 3 racional** | 3-5 min | Parte mais densa |
| **Dream Squad** | 2-3 min | Projecao |
| **Next step** | 1-2 min | Definicao final |
| **Total** | 15-25 min | Completamente autonomo |

---

## Integracao

### Alimenta

**Workflow:** Pipeline Zona Genialidade (zona-genialidade/full-pipeline)

**Proxima Task na Sequencia:**
- **Task 4:** generate-blueprint - Usa: squad_recommendation + genius_profile

### Depende De

- **Task 2:** analyze-genius-profile - Fornece: genius-profile.yaml

### Roteamento de Agentes

**Agente Principal:** zona-genialidade-chief (executa o algoritmo de matching)
**Agentes Consultados:** Nenhum adicional necessario - toda a informacao ja esta no genius-profile

---

## Quality Threshold

**Pass/Fail Gate:** Checklist score >= 11/14

Se < 11/14:
1. Identificar quais criterios falharam
2. Se scoring impreciso: revisar pesos e regras de matching
3. Se racional fraco: re-analisar genius profile para evidencias especificas
4. Se dream squad irrealista: ajustar expectativas ao wealth spectrum level
5. Re-validar

**Razoes Comuns de Falha:**
- Genius profile com confianca baixa (estimativas imprecisas propagam erro)
- Aluno com perfil muito equilibrado (nenhum squad se destaca claramente)
- Restricoes eliminam muitos squads (poucas opcoes viaveis)
- Catalogo de squads desatualizado (novos squads nao incluidos)

---

## Notas para o Executor

### Quando Nenhum Squad Tem Score > 0.60

Isso indica perfil atipico ou catalogo insuficiente. Neste caso:
- Priorizar o Dream Squad como recomendacao principal
- Sugerir que o aluno crie um squad customizado
- Recomendar squad mais proximo como "trampolim"
- Notar que o ecossistema pode precisar de expansao

### Quando Multiplos Squads Empatam

Se 2+ squads tem scores dentro de 0.05 de diferenca:
- Usar preferencias do aluno como desempate
- Considerar wealth spectrum level (squads mais acessiveis primeiro)
- Considerar ULP (evitar squads que reforcem o bloqueio)
- Apresentar ambos como opcoes equivalentes

### Quando o Aluno Ja Opera um Squad

Se o aluno ja tem experiencia com algum squad:
- Verificar se squad atual esta no top 3 (validacao)
- Se NAO esta: explicar por que pode estar subotimizado
- Se ESTA: reforcar e sugerir otimizacoes
- Considerar squad complementar ao invés de substituto

### Quando Restricoes Sao Muito Limitantes

Se restricoes financeiras, de tempo ou habilidade eliminam muitos squads:
- Ser honesto sobre limitacoes
- Recomendar squads de investimento zero primeiro
- Criar plano de "destravar" squads conforme restricoes diminuem
- NAO recomendar squad que o aluno nao pode operar

### Peso dos ULPs nas Recomendacoes

IMPORTANTE: ULPs ajustam scores mas NAO eliminam squads. A logica e:
- ULP e algo a SUPERAR, nao algo a OBEDECER
- Reduzir score em -0.03 (ajuste suave, nao penalidade pesada)
- Na recomendacao, MENCIONAR o ULP como desafio a ser superado
- O squad certo PODE ser exatamente aquele que desafia o ULP

---

## Historico de Revisoes

| Versao | Data | Mudanca |
|---------|------|--------|
| 1.0.0 | 2026-02-13 | Release inicial de producao |
