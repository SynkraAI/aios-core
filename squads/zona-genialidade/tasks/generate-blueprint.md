# Task: Gerar Blueprint da Zona de Genialidade

**Task ID:** zona-genialidade/generate-blueprint
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Zona Genialidade Pipeline
**Total Lines:** 480

---

## Executive Summary

Esta task recebe o genius_profile completo e o squad_recommendation para gerar o documento final entregue ao aluno: o Genius Zone Blueprint. Este documento sintetiza TODAS as analises em um formato acessivel, motivador e actionable. O Blueprint e a entrega final da pipeline Zona Genialidade - o artefato que o aluno leva consigo e usa como guia para os proximos 90 dias. A task e completamente autonoma.

**Posicao no Workflow:** Task 4 (final) na pipeline Zona Genialidade
**Definicao de Sucesso:** Blueprint com 10 secoes completas, tom empoderador, e proximos passos executaveis
**Quality Gate de Output:** Todas as 10 secoes preenchidas sem contradicoes e com checklist de proximos passos

---

## Proposito

O aluno passou por um assessment de 30 minutos e uma analise multi-framework autonoma. Agora, TODA essa inteligencia precisa ser traduzida em um documento que:

1. **Empodera** - O aluno deve terminar de ler sentindo que tem clareza sobre quem e e onde deve investir energia
2. **Orienta** - Cada secao guia uma decisao especifica (qual squad, como monetizar, como se posicionar)
3. **Motiva** - O tom nao e clinico/academico; e de um mentor que acredita no potencial do aluno
4. **Aciona** - Os proximos passos sao tao concretos que o aluno pode comecar HOJE

O Blueprint NAO e um relatorio tecnico. E um documento de transformacao pessoal.

Sem esta task, o aluno receberia dados brutos de 7 frameworks sem saber o que fazer com eles. O Blueprint transforma dados em direcao.

---

## Tipo de Executor

**Agent (100% autonomo)**

- **Papel do Agent:** Compilar dados, gerar narrativa, aplicar tom de voz, validar qualidade
- **Papel do Humano:** Nenhum durante a geracao (humano recebe o Blueprint pronto)
- **Runtime Estimado:** 10-20 minutos

---

## Inputs

### Inputs Obrigatorios

```yaml
genius_profile:
  field: "Perfil de genialidade completo com 7 analises + sintese"
  format: "YAML"
  required: true
  location: "squads/zona-genialidade/data/{aluno_slug}/genius-profile.yaml"
  validation: "Deve conter todas as 7 analises, sintese e summary"
  notes: "Output da task analyze-genius-profile"

squad_recommendation:
  field: "Recomendacao de squads com scores e racionais"
  format: "YAML"
  required: true
  location: "squads/zona-genialidade/data/{aluno_slug}/squad-recommendation.yaml"
  validation: "Deve conter top 3, dream squad e next step"
  notes: "Output da task recommend-squad"
```

### Inputs Opcionais

```yaml
template_customizado:
  field: "Template visual customizado para o Blueprint"
  format: "Markdown ou HTML"
  required: false
  notes: "Se fornecido, usar ao inves do template padrao"

tom_de_voz:
  field: "Tom de voz especifico para o aluno"
  format: "text"
  required: false
  default: "Mentor empoderador: direto, confiante, sem jargao academico"
  notes: "Pode ser ajustado baseado no perfil comportamental do aluno"

formato_saida:
  field: "Formato de saida desejado"
  format: "string"
  required: false
  default: "markdown"
  options: ["markdown", "html"]
  notes: "HTML inclui estilizacao visual para exibicao web"
```

---

## Precondicoes

Antes de iniciar esta task:

- [ ] genius-profile.yaml existe e foi validado (checklist >= 11/14)
- [ ] squad-recommendation.yaml existe e foi validado (checklist >= 11/14)
- [ ] Nao existe blueprint anterior para este aluno (ou re-geracao explicitamente solicitada)
- [ ] Template de Blueprint disponivel (padrao ou customizado)

---

## Steps

### Step 1: Carregar Todos os Dados de Entrada (2 min)

**Atividade do Agent:**
- Ler genius-profile.yaml COMPLETO
- Ler squad-recommendation.yaml COMPLETO
- Extrair campos-chave para populacao do template:

```yaml
blueprint_data:
  # Dados de identidade
  nome: "{genius_profile.metadata.aluno_nome}"
  data: "{timestamp}"

  # Dados do summary (genius profile)
  zona_atual: "{genius_profile.summary.zona_atual}"
  perfil_dominante: "{genius_profile.summary.perfil_dominante}"
  top_3_talentos: "{genius_profile.summary.top_3_talentos}"
  unique_ability: "{genius_profile.summary.unique_ability}"
  estilo_execucao: "{genius_profile.summary.estilo_execucao}"
  arquetipo_marca: "{genius_profile.summary.arquetipo_marca}"
  upper_limit_problem: "{genius_profile.summary.upper_limit_problem}"
  value_equation_score: "{genius_profile.summary.value_equation_score}"

  # Dados das analises individuais
  hendricks: "{genius_profile.analyses.hendricks}"
  clifton: "{genius_profile.analyses.clifton}"
  sullivan: "{genius_profile.analyses.sullivan}"
  hamilton: "{genius_profile.analyses.hamilton}"
  hormozi: "{genius_profile.analyses.hormozi}"
  kolbe: "{genius_profile.analyses.kolbe}"
  hogshead: "{genius_profile.analyses.hogshead}"

  # Dados da sintese
  convergencias: "{genius_profile.synthesis.convergence_points}"
  insights_unicos: "{genius_profile.synthesis.unique_insights}"

  # Dados da recomendacao
  top_3_squads: "{squad_recommendation.top_3}"
  dream_squad: "{squad_recommendation.dream_squad}"
  next_step: "{squad_recommendation.immediate_next_step}"
```

**Checkpoint:** Todos os dados carregados e mapeados para o template

---

### Step 2: Gerar Secao 1 - Perfil em 30 Segundos (2 min)

**Atividade do Agent:**
Criar o resumo executivo do aluno - a secao que ele pode ler em 30 segundos e ter clareza sobre quem e:

```yaml
secao_1:
  titulo: "Seu Perfil em 30 Segundos"
  conteudo:
    zona_atual:
      label: "Zona atual"
      valor: "{zona do Hendricks com % de distribuicao}"
      interpretacao: "Uma frase que explica o que isso significa na pratica"

    perfil_dominante:
      label: "Perfil dominante"
      valor: "{perfil Wealth Dynamics primario + secundario}"
      interpretacao: "Como isso se manifesta no dia a dia"

    top_talentos:
      label: "Top 3 talentos"
      valor: "{3 CliftonStrengths mais fortes}"
      interpretacao: "Sua combinacao unica de talentos"

    estilo_execucao:
      label: "Estilo de execucao"
      valor: "{resumo Kolbe em uma frase}"
      interpretacao: "Como voce naturalmente aborda problemas"

    marca_pessoal:
      label: "Marca pessoal"
      valor: "{arquetipo Hogshead}"
      interpretacao: "Como o mundo te ve quando voce esta no seu melhor"

  regras_de_escrita:
    - "Cada item em no maximo 2 linhas"
    - "Linguagem acessivel, sem jargao de frameworks"
    - "Tom confiante: 'Voce E isso' nao 'Voce pode ser isso'"
    - "Dados concretos, nao genericos"
```

**Checkpoint:** Secao 1 escrita com 5 itens claros e concisos

---

### Step 3: Gerar Secao 2 - Diagnostico de Zona (3 min)

**Atividade do Agent:**
Traduzir analise Gay Hendricks em linguagem acessivel:

```yaml
secao_2:
  titulo: "Diagnostico de Zona (Gay Hendricks)"
  subsecoes:
    zona_atual_detalhada:
      conteudo: |
        Explicacao da zona atual com exemplos concretos do dia a dia do aluno.
        Incluir distribuicao de tempo: "Voce passa X% do tempo em atividades de {zona}."
        NAO usar linguagem de framework, traduzir para cotidiano.
      evidencia: "Citar atividades especificas do assessment"

    upper_limit_problem:
      conteudo: |
        Explicar o ULP de forma que o aluno se identifique.
        Usar linguagem de "voce provavelmente ja percebeu que..."
        NAO patologizar - normalizar e mostrar como superar.
      tipo: "{tipo de ULP identificado}"
      manifestacoes: "Como isso aparece no dia a dia"
      frase_chave: "A frase que o aluno pensa (inconscientemente) que o trava"

    caminho_para_genialidade:
      passos:
        - passo: "Passo 1 concreto com prazo"
          prazo: "Semana 1-2"
          indicador: "Como saber que conseguiu"
        - passo: "Passo 2"
          prazo: "Semana 3-4"
          indicador: "..."
        - passo: "Passo 3"
          prazo: "Mes 2-3"
          indicador: "..."

  regras_de_escrita:
    - "Tom de mentor, nao de terapeuta"
    - "Normalizar o ULP: 'Isso e comum e tem solucao'"
    - "Passos concretos, nao conselhos vagos"
    - "Evitar 'voce deveria' - usar 'o caminho e'"
```

**Checkpoint:** Secao 2 escrita com diagnostico acessivel e caminho claro

---

### Step 4: Gerar Secao 3 - Mapa de Talentos (2-3 min)

**Atividade do Agent:**
Traduzir analise CliftonStrengths:

```yaml
secao_3:
  titulo: "Mapa de Talentos (CliftonStrengths)"
  subsecoes:
    top_5:
      formato: "Lista rankeada com descricao pratica de cada talento"
      regra: "Para cada talento: nome + 'Isso significa que voce...' + exemplo concreto"
      nota: "Se baseado em estimativa, mencionar: 'Baseado no seu perfil, seus talentos provaveis sao...'"

    dominio_dominante:
      conteudo: "Explicacao do dominio + o que significa para escolha de carreira/squad"
      pratica: "Exemplo de como esse dominio se manifesta no trabalho"

    talentos_sombra:
      conteudo: "Talentos que existem mas estao adormecidos"
      ativacao: "Como despertar cada talento na sombra"
      tom: "Empoderante: 'Voce TEM esse talento, so ainda nao esta usando'"

  regras_de_escrita:
    - "Focar no que o talento PERMITE fazer, nao na definicao academica"
    - "Dar exemplos de pessoas famosas com talentos similares"
    - "Talentos na sombra devem motivar, nao frustrar"
```

**Checkpoint:** Secao 3 com top 5, dominio e sombras escritos de forma motivadora

---

### Step 5: Gerar Secao 4 - Habilidade Unica (2-3 min)

**Atividade do Agent:**
Traduzir analise Dan Sullivan:

```yaml
secao_4:
  titulo: "Habilidade Unica (Dan Sullivan)"
  subsecoes:
    declaracao_ua:
      formato: "Frase em destaque, estilo manifesto pessoal"
      tom: "Poderoso e afirmativo"
      exemplo: "'Minha habilidade unica e transformar complexidade em clareza para empreendedores, de uma forma que desbloqueia acao imediata.'"

    atividades_maximizar:
      titulo: "Atividades para MAXIMIZAR (mais tempo aqui)"
      formato: "Lista de 3-5 atividades com justificativa"
      criterio: "Atividades da zona de Unique Ability"

    atividades_delegar:
      titulo: "Atividades para DELEGAR (menos tempo aqui)"
      formato: "Lista de 3-5 atividades com sugestao de quem delegar"
      criterio: "Atividades das zonas de competencia e incompetencia"
      pratico: "Tipo de profissional para delegar cada uma"

    distribuicao_visual:
      formato: "Representacao visual da distribuicao atual vs ideal"
      atual: "X% UA | Y% Excelencia | Z% Competencia | W% Incompetencia"
      ideal: "60%+ UA | 20% Excelencia | 10% Competencia | 0% Incompetencia"
      gap: "O que precisa mudar"

  regras_de_escrita:
    - "UA statement deve ser memoravel e compartilhavel"
    - "Delegacao deve ser pratica (VA, freelancer, ferramenta)"
    - "Distribuicao deve mostrar o GAP de forma visual"
```

**Checkpoint:** Secao 4 com UA statement, maximizacao e delegacao claros

---

### Step 6: Gerar Secao 5 - Perfil de Riqueza (2-3 min)

**Atividade do Agent:**
Traduzir analise Roger Hamilton:

```yaml
secao_5:
  titulo: "Perfil de Riqueza (Wealth Dynamics)"
  subsecoes:
    perfil_explicado:
      conteudo: |
        Explicacao do perfil primario + secundario em linguagem acessivel.
        Como este perfil se manifesta na vida profissional do aluno.
        Exemplos de empreendedores famosos com o mesmo perfil.
      exemplos_sucesso:
        - nome: "Empreendedor conhecido"
          perfil: "Mesmo perfil"
          como_usou: "Como alavancou o perfil para sucesso"

    path_of_least_resistance:
      conteudo: |
        O caminho natural de monetizacao para este perfil.
        NAO forcar caminhos que vao contra a natureza.
        Incluir o que EVITAR (tao importante quanto o que fazer).
      fazer: "Lista do que funciona para este perfil"
      evitar: "Lista do que vai contra a natureza deste perfil"

    wealth_spectrum_atual:
      nivel: "{nivel atual}"
      proximo_nivel: "{nivel alvo}"
      transicao: "O que precisa acontecer para subir de nivel"
      prazo_estimado: "Timeline realista"

  regras_de_escrita:
    - "Exemplos de sucesso inspiram mas devem ser realistas"
    - "Path of least resistance: honesto sobre limites"
    - "Wealth spectrum: sem julgamento sobre nivel atual"
```

**Checkpoint:** Secao 5 com perfil, path e spectrum escritos

---

### Step 7: Gerar Secao 6 - Squad Recomendado (3-5 min)

**Atividade do Agent:**
Traduzir squad_recommendation em formato acessivel:

```yaml
secao_6:
  titulo: "Squad Recomendado"
  subsecoes:
    top_3_squads:
      formato: "Cards com ranking, score e racional"
      para_cada_squad:
        - rank: "#1 - {nome do squad}"
          score: "{score formatado como porcentagem}"
          porque: "Paragrafo curto explicando POR QUE este squad para VOCE"
          como_comecar: "3 passos para comecar esta semana"
          potencial: "O que pode conquistar em 90 dias"

    dream_squad:
      formato: "Secao inspiracional"
      conteudo: |
        Se voce pudesse criar o squad perfeito, seria...
        Explicacao do dream squad com tom visionario.
        Caminho de 3 fases para chegar la.
      tom: "Aspiracional mas ancorado na realidade"

    decisao:
      conteudo: |
        "Voce nao precisa escolher agora. Mas se pudesse
        comecar com um unico squad esta semana, comece por {#1}."
      acao_imediata: "A primeira coisa a fazer HOJE"

  regras_de_escrita:
    - "Scores devem ser contextualizados, nao so numeros"
    - "Racionais devem mencionar dados do perfil, nao genericos"
    - "Dream squad deve motivar sem frustrar"
    - "Decisao deve facilitar, nao pressionar"
```

**Checkpoint:** Secao 6 com top 3 + dream squad + decisao clara

---

### Step 8: Gerar Secao 7 - Plano de Monetizacao (3-5 min)

**Atividade do Agent:**
Traduzir analise Hormozi em plano actionable:

```yaml
secao_7:
  titulo: "Plano de Monetizacao (Hormozi)"
  subsecoes:
    grand_slam_offer:
      titulo: "Sua Oferta Irresistivel (Draft)"
      conteudo: |
        Baseado no seu perfil, aqui esta um rascunho de oferta:
        HEADLINE: {headline da GSO}
        O QUE VOCE ENTREGA: {dream outcome}
        POR QUE FUNCIONA: {perceived likelihood}
        EM QUANTO TEMPO: {time delay}
        COM QUANTO ESFORCO DO CLIENTE: {effort}
      nota: "Este e um ponto de partida - refine com dados reais de mercado"

    value_equation:
      titulo: "Sua Equacao de Valor Atual"
      score_atual: "{score formatado}"
      interpretacao: "O que este score significa"
      onde_melhorar: "Os 2 fatores com maior impacto imediato"
      meta: "Score alvo em 90 dias"

    estrategia_core_4:
      titulo: "Estrategia de Crescimento Recomendada"
      conteudo: |
        Baseado no seu nivel no Wealth Spectrum ({nivel}),
        a estrategia recomendada e:
        1. {estrategia de aquisicao}
        2. {estrategia de retencao}
        3. {estrategia de oferta}
        4. {estrategia de escala}

    metas_30_60_90:
      titulo: "Metas 30-60-90 Dias"
      dias_30:
        meta: "Meta especifica e mensuravel"
        acoes: ["Acao 1", "Acao 2", "Acao 3"]
        indicador: "Como medir sucesso"
      dias_60:
        meta: "Meta especifica e mensuravel"
        acoes: ["Acao 1", "Acao 2", "Acao 3"]
        indicador: "Como medir sucesso"
      dias_90:
        meta: "Meta especifica e mensuravel"
        acoes: ["Acao 1", "Acao 2", "Acao 3"]
        indicador: "Como medir sucesso"

  regras_de_escrita:
    - "GSO e um DRAFT, deixar claro que precisa refinamento"
    - "Metas devem ser SMART (especificas, mensuraveis, atingiveis)"
    - "Estrategia deve respeitar nivel atual no spectrum"
    - "Tom pratico: 'faca isso' nao 'considere isso'"
```

**Checkpoint:** Secao 7 com oferta, value equation e metas 30-60-90

---

### Step 9: Gerar Secao 8 - Estilo de Execucao (2-3 min)

**Atividade do Agent:**
Traduzir analise Kolbe:

```yaml
secao_8:
  titulo: "Estilo de Execucao (Kolbe)"
  subsecoes:
    como_voce_opera:
      conteudo: |
        Explicacao pratica de como o aluno naturalmente ataca problemas.
        Sem jargao de "Action Modes" - traduzir em comportamento.
        Exemplo: "Voce e o tipo que prefere comecar rapido e ajustar no caminho,
        ao inves de planejar tudo antes de dar o primeiro passo."
      forca_natural: "O que acontece quando opera alinhado"
      dreno_natural: "O que acontece quando forcam outro estilo"

    adaptar_squad_ao_estilo:
      conteudo: |
        Como configurar o squad recomendado para funcionar COM seu estilo:
        - Se Quick Start alto: estruturar sprints curtos, validacao rapida
        - Se Fact Finder alto: reservar tempo de pesquisa antes de acao
        - Se Follow Thru alto: criar processos e checklists desde o dia 1
        - Se Implementor alto: prototipagem pratica antes de planejamento
      adaptacoes_especificas: "Lista de 3-5 adaptacoes para o squad #1"

    team_composition:
      titulo: "Composicao Ideal de Time"
      conteudo: |
        Quem voce precisa ao seu lado para compensar areas fora do seu estilo:
        - Se Quick Start alto: precisa de alguem com Follow Thru alto (sistematizar)
        - Se Fact Finder baixo: precisa de alguem detalhista (pesquisa/QA)
      perfil_complementar: "Descricao do co-piloto ideal"
      onde_encontrar: "Como recrutar este perfil"

  regras_de_escrita:
    - "Zero jargao Kolbe - tudo em linguagem do dia a dia"
    - "Foco em ADAPTAR o ambiente ao aluno (nao o aluno ao ambiente)"
    - "Team composition pratico: onde encontrar, quanto custa"
```

**Checkpoint:** Secao 8 com estilo, adaptacao e team composition

---

### Step 10: Gerar Secao 9 - Posicionamento (2-3 min)

**Atividade do Agent:**
Traduzir analise Hogshead:

```yaml
secao_9:
  titulo: "Posicionamento de Marca Pessoal (Hogshead)"
  subsecoes:
    arquetipo:
      conteudo: |
        Explicar o arquetipo de forma aspiracional.
        "Voce e {arquetipo}: alguem que naturalmente {descricao}."
        Exemplos de figuras publicas com mesmo arquetipo.
      diferencial: "O que te torna diferente de outros no mesmo campo"

    anthem:
      titulo: "Sua Frase de Marca"
      formato: "[ADJETIVO] [SUBSTANTIVO] que [VERBO] [RESULTADO]"
      frase: "{anthem gerado}"
      como_usar: "Onde usar esta frase (bio, LinkedIn, pitch)"

    posicionamento_mercado:
      conteudo: |
        Como se posicionar baseado no arquetipo:
        - Tom de comunicacao ideal
        - Tipo de conteudo que alavanca seu arquetipo
        - Plataformas onde brilha naturalmente
        - O que evitar na comunicacao
      plataformas_recomendadas: "Lista priorizada"
      tipo_conteudo: "Formatos que maximizam seu fascination"
      tom_comunicacao: "Exemplo de como escrever/falar"

  regras_de_escrita:
    - "Anthem deve ser memoravel e usavel imediatamente"
    - "Posicionamento pratico: aplicavel esta semana"
    - "Tom empoderador: 'Voce JA tem isso, agora use'"
```

**Checkpoint:** Secao 9 com arquetipo, anthem e posicionamento pratico

---

### Step 11: Gerar Secao 10 - Proximos Passos (2-3 min)

**Atividade do Agent:**
Compilar checklist final de acoes:

```yaml
secao_10:
  titulo: "Proximos Passos"
  formato: "Checklist actionable com prazos"

  passos:
    imediato_hoje:
      - titulo: "Passo 1: {acao mais imediata}"
        detalhamento: "Exatamente como fazer"
        tempo_estimado: "15-30 minutos"
        checkbox: "[ ]"

    semana_1:
      - titulo: "Passo 2: {acao da semana 1}"
        detalhamento: "..."
        tempo_estimado: "1-2 horas"
        checkbox: "[ ]"
      - titulo: "Passo 3: {acao da semana 1}"
        detalhamento: "..."
        tempo_estimado: "30-60 minutos"
        checkbox: "[ ]"

    semana_2_4:
      - titulo: "Passo 4: {acao do mes 1}"
        detalhamento: "..."
        checkbox: "[ ]"
      - titulo: "Passo 5: {acao do mes 1}"
        detalhamento: "..."
        checkbox: "[ ]"

    mes_2_3:
      - titulo: "Passo 6: {acao de medio prazo}"
        detalhamento: "..."
        checkbox: "[ ]"

  nota_final:
    conteudo: |
      Mensagem de encerramento motivacional e personalizada.
      Baseada no arquetipo, UA, e zona de genialidade.
      Tom: "Voce tem tudo que precisa. O proximo passo e seu."
    formato: "Paragrafo curto, impactante, pessoal"

  regras_de_escrita:
    - "Cada passo deve ser executavel sem ambiguidade"
    - "Checkboxes para sensacao de progresso"
    - "Nota final deve ser a frase mais poderosa do documento"
    - "Tempo estimado para cada passo (realista)"
```

**Checkpoint:** Secao 10 com checklist de 6+ passos concretos e nota motivacional

---

### Step 12: Aplicar Quality Gate Final (3-5 min)

**Atividade do Agent:**
Revisar o Blueprint completo antes de entregar:

```yaml
quality_gate:
  verificacoes:
    completude:
      - check: "Todas as 10 secoes presentes e preenchidas?"
        obrigatorio: true
      - check: "Nenhuma secao tem placeholder ou texto generico?"
        obrigatorio: true
      - check: "Nome do aluno aparece corretamente em todo o documento?"
        obrigatorio: true

    consistencia:
      - check: "Zona Hendricks consistente entre secao 1 e secao 2?"
        obrigatorio: true
      - check: "Perfil Hamilton consistente entre secao 1, 5 e 6?"
        obrigatorio: true
      - check: "Estilo Kolbe consistente entre secao 1, 8 e 6?"
        obrigatorio: true
      - check: "Squad recomendado e o mesmo em secao 6 e secao 10?"
        obrigatorio: true
      - check: "Nenhuma contradicao entre secoes?"
        obrigatorio: true

    tom:
      - check: "Tom empoderador mantido em todo o documento?"
        obrigatorio: true
      - check: "Nenhuma linguagem excessivamente academica ou clinica?"
        obrigatorio: true
      - check: "Nenhuma linguagem negativa ou patologizante?"
        obrigatorio: true

    actionability:
      - check: "Proximos passos sao concretos e executaveis?"
        obrigatorio: true
      - check: "Metas 30-60-90 sao mensuraveis?"
        obrigatorio: true
      - check: "O aluno sabe EXATAMENTE o que fazer amanha?"
        obrigatorio: true

    formatacao:
      - check: "Headers corretos e hierarquia clara?"
        obrigatorio: true
      - check: "Leitura fluida sem pulos logicos?"
        obrigatorio: true
      - check: "Tamanho adequado (2500-4000 palavras)?"
        obrigatorio: false

  resultado:
    total_checks: 15
    checks_obrigatorios: 14
    threshold: "14/14 obrigatorios + 1/1 opcional desejavel"

  se_falhar:
    - "Identificar secao com problema"
    - "Corrigir inconsistencia/lacuna"
    - "Re-validar secao corrigida"
    - "Re-rodar quality gate"
```

**Checkpoint:** Quality gate aprovado, Blueprint pronto para entrega

---

### Step 13: Gerar Output Final (2 min)

**Atividade do Agent:**
Compilar o Blueprint no formato escolhido:

**Formato Markdown (padrao):**
```markdown
# Genius Zone Blueprint
## {Nome do Aluno}
### Data: {date}

---

## 1. Seu Perfil em 30 Segundos
{conteudo secao 1}

## 2. Diagnostico de Zona
{conteudo secao 2}

## 3. Mapa de Talentos
{conteudo secao 3}

## 4. Habilidade Unica
{conteudo secao 4}

## 5. Perfil de Riqueza
{conteudo secao 5}

## 6. Squad Recomendado
{conteudo secao 6}

## 7. Plano de Monetizacao
{conteudo secao 7}

## 8. Estilo de Execucao
{conteudo secao 8}

## 9. Posicionamento
{conteudo secao 9}

## 10. Proximos Passos
{conteudo secao 10}

---
*Blueprint gerado pela pipeline Zona Genialidade v1.0*
*Squad: zona-genialidade | Frameworks: Hendricks, Clifton, Sullivan, Hamilton, Hormozi, Kolbe, Hogshead*
```

**Formato HTML (se solicitado):**
Gerar HTML com:
- CSS inline para portabilidade
- Cores baseadas no arquetipo Hogshead
- Cards visuais para top 3 squads
- Progress bar visual para distribuicao de zonas
- Checklist interativo para proximos passos
- Design responsivo para mobile

**Checkpoint:** Arquivo final gerado e salvo

---

## Outputs

### Output Primario

**Genius Zone Blueprint**

Formato: Markdown (default) ou HTML
Localizacao: `squads/zona-genialidade/data/{aluno_slug}/genius-zone-blueprint.md`

Estrutura: 10 secoes conforme definido nos Steps 2-11

### Outputs Secundarios

1. **Blueprint Metadata**
   - Formato: YAML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/blueprint-metadata.yaml`
   - Conteudo:
     ```yaml
     blueprint_metadata:
       aluno_slug: "{slug}"
       data_geracao: "{timestamp}"
       versao_genius_profile: "1.0.0"
       versao_squad_recommendation: "1.0.0"
       formato_output: "markdown"
       total_palavras: N
       quality_gate_score: "14/14"
       tempo_geracao: "X minutos"
       secoes_completas: 10
       secoes_com_notas: ["lista de secoes com ressalvas"]
     ```

2. **Quality Gate Report**
   - Formato: YAML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/quality-gate-report.yaml`
   - Conteudo: Resultado de cada check do quality gate com detalhes

3. **Blueprint HTML** (se formato = html)
   - Formato: HTML
   - Localizacao: `squads/zona-genialidade/data/{aluno_slug}/genius-zone-blueprint.html`
   - Conteudo: Versao visual para web

---

## Validacao

### Checklist

- [ ] genius-profile.yaml lido completamente (NUNCA leitura parcial)
- [ ] squad-recommendation.yaml lido completamente
- [ ] Secao 1 (Perfil 30s) preenchida com dados reais do aluno
- [ ] Secao 2 (Diagnostico Zona) com ULP identificado e caminho
- [ ] Secao 3 (Mapa Talentos) com top 5 e sombras
- [ ] Secao 4 (Habilidade Unica) com UA statement e delegacao
- [ ] Secao 5 (Perfil Riqueza) com perfil e path
- [ ] Secao 6 (Squad) com top 3 e dream squad
- [ ] Secao 7 (Monetizacao) com GSO draft e metas 30-60-90
- [ ] Secao 8 (Estilo Execucao) com adaptacao e team composition
- [ ] Secao 9 (Posicionamento) com anthem e estrategia
- [ ] Secao 10 (Proximos Passos) com checklist de 6+ items
- [ ] Nenhuma contradicao entre secoes
- [ ] Tom empoderador mantido em todo o documento
- [ ] Nome do aluno correto em todas as mencoes
- [ ] Quality Gate Final aprovado (14/14 checks obrigatorios)

### Criterios de Sucesso

**Threshold: 13/16 no checklist acima**

| Criterio | Excelente (3) | Aceitavel (2) | Fraco (1) |
|----------|--------------|----------------|---------|
| **Completude** | 10/10 secoes preenchidas com profundidade | 9/10 secoes, 1 superficial | 8 ou menos secoes |
| **Personalizacao** | Cada secao cita dados especificos do ALUNO, nao genericos | Maioria personalizada com 1-2 genericas | Parece template preenchido |
| **Tom** | Empoderador, motivador, direto sem ser agressivo | Tom adequado com variacoes | Clinico, academico ou generico |
| **Actionability** | Aluno sabe exatamente o que fazer amanha | Passos claros mas sem prazos | Conselhos vagos sem passos concretos |
| **Consistencia** | Zero contradicoes entre secoes | 1 inconsistencia menor | Contradicoes visiveis |
| **Impacto** | Aluno termina leitura MOTIVADO a agir | Aluno termina informado | Aluno termina confuso ou sobrecarregado |

---

## Esforco Estimado

| Componente | Esforco | Notas |
|-----------|--------|-------|
| **Carregar dados** | 2 min | Profile + recommendation |
| **Secao 1 - Perfil 30s** | 2 min | Resumo executivo |
| **Secao 2 - Diagnostico** | 3 min | Hendricks traduzido |
| **Secao 3 - Talentos** | 2-3 min | Clifton traduzido |
| **Secao 4 - Habilidade Unica** | 2-3 min | Sullivan traduzido |
| **Secao 5 - Riqueza** | 2-3 min | Hamilton traduzido |
| **Secao 6 - Squad** | 3-5 min | Recommendation formatada |
| **Secao 7 - Monetizacao** | 3-5 min | Hormozi actionable |
| **Secao 8 - Execucao** | 2-3 min | Kolbe pratico |
| **Secao 9 - Posicionamento** | 2-3 min | Hogshead aplicado |
| **Secao 10 - Proximos Passos** | 2-3 min | Checklist final |
| **Quality Gate** | 3-5 min | Revisao completa |
| **Output Final** | 2 min | Compilacao |
| **Total** | 25-40 min | Completamente autonomo |

---

## Integracao

### Alimenta

**Workflow:** Este e o output FINAL da pipeline Zona Genialidade.

**Consumidores do Blueprint:**
- **Aluno:** Documento principal de orientacao
- **Mentor:** Referencia para sessoes de mentoria
- **Squad Creator:** Base para configurar squad personalizado
- **Cohort Fundamentals:** Registro do progresso do aluno

### Depende De

- **Task 2:** analyze-genius-profile - Fornece: genius-profile.yaml
- **Task 3:** recommend-squad - Fornece: squad-recommendation.yaml

### Roteamento de Agentes

**Agente Principal:** zona-genialidade-chief (compila e gera o Blueprint)
**Agentes Consultados:** Nenhum adicional - toda informacao ja esta nos inputs

---

## Quality Threshold

**Pass/Fail Gate:** Checklist score >= 13/16 E Quality Gate Final 14/14

Se falhar:
1. Identificar qual secao/check falhou
2. Revisar dados de entrada para lacunas
3. Re-gerar secao especifica (nao precisa re-gerar tudo)
4. Re-rodar Quality Gate
5. Entregar

**Razoes Comuns de Falha:**
- Genius profile com dados incompletos (garbage in = garbage out)
- Contradicao entre analises que nao foi resolvida na sintese
- Tom muito tecnico (nao adaptou linguagem dos frameworks)
- Proximos passos vagos (nao especificou o que fazer AMANHA)
- Template generico nao personalizado (esqueceu de trocar placeholders)

---

## Notas para o Executor

### Tom de Voz - Regra de Ouro

O Blueprint NAO e um relatorio. E uma CARTA DE UM MENTOR.

Exemplo de tom CORRETO:
> "Voce e um Creator-Star. Isso significa que sua energia natural esta em criar coisas novas e inspirar pessoas. Quando voce esta fazendo isso, o tempo para de existir. Quando estao te forcando a fazer planilhas e processos repetitivos, voce se sente preso. Isso nao e fraqueza - e a sua natureza pedindo para ser respeitada."

Exemplo de tom ERRADO:
> "De acordo com o framework Wealth Dynamics de Roger Hamilton, o perfil Creator apresenta scores elevados nos indicadores de ideacao e baixos nos indicadores de sistematizacao, sugerindo uma tendencia a..."

### Quando o Perfil Tem Baixa Confianca

Se confianca geral do genius profile < 0.65:
- Adicionar nota no inicio: "Este Blueprint foi gerado com base em estimativas comportamentais. Para maior precisao, recomendamos assessments formais (CliftonStrengths, Kolbe A Index, DISC oficial)."
- Usar linguagem mais tentativa: "Seus talentos provaveis sao..." vs "Seus talentos sao..."
- Manter tom empoderador apesar da ressalva

### Quando Ha Contradicoes Nao Resolvidas

Se a sintese flagou contradicoes:
- NAO esconder no Blueprint
- Apresentar como nuance: "Seu perfil revela uma tensao interessante entre X e Y. Isso pode significar que..."
- Transformar contradicao em ponto de exploracao
- Sugerir investigacao adicional nos proximos passos

### Quando o Aluno Esta em Nivel Baixo do Wealth Spectrum

Se nivel Infrared/Red:
- Ajustar tom: nao falar de "escalar negocios" para quem luta com contas
- Focar nos passos imediatos de estabilizacao financeira
- Metas 30-60-90 focadas em gerar renda, nao em crescer
- Tom de esperanca realista, nao de guru motivacional

### Formato HTML - Diretrizes de Design

Se formato = html:
- Paleta de cores baseada no arquetipo Hogshead do aluno
- Cards para top 3 squads com score visual (barras de progresso)
- Secao 1 em destaque (hero section)
- Secao 10 como CTA final
- Mobile-first: muitos alunos leem no celular
- CSS inline para portabilidade (pode ser compartilhado por email)
- Peso total < 100KB

### Metricas de Qualidade Interna

Antes de entregar, verificar:
- Legibilidade: Flesch-Kincaid equivalente para portugues <= 8a serie
- Tamanho: 2500-4000 palavras (10-15 min de leitura)
- Densidade de acoes: pelo menos 15 itens actionaveis no documento inteiro
- Ratio dados/narrativa: 40% dados, 60% narrativa/interpretacao

---

## Historico de Revisoes

| Versao | Data | Mudanca |
|---------|------|--------|
| 1.0.0 | 2026-02-13 | Release inicial de producao |
