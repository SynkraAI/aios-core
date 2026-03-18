# capture-idea

## Metadata
```yaml
task_id: KOE_COL_001
agent: koe-coletor
type: creation
complexity: low
estimated_time: 5min
source: "Dan Koe — The Queue System + 2 Hour Writer"
dependencies:
  data:
    - squads/mind-cloning/minds/dan-koe/outputs/koe-voice-dna.yaml
    - squads/mind-cloning/minds/dan-koe/outputs/koe-thinking-dna.yaml
```

## Purpose
Capturar uma ideia bruta no Queue System com tagging adequado e avaliação de signal strength, garantindo que nenhuma ideia de alto valor se perca.

> "Your brain is for having ideas, not holding them. The moment you have an idea, capture it. Don't trust your memory — trust your system." — Dan Koe

## Context
O Queue System é o coração do processo criativo de Dan Koe. Toda ideia — de uma observação casual no banho até um insight profundo durante uma conversa — deve ser capturada IMEDIATAMENTE no sistema. A captura é agnóstica de qualidade: você não julga a ideia no momento da captura. O julgamento vem depois, no processamento (KOE_COL_002).

O princípio é simples: ideias são perecíveis. Uma ideia não capturada em 30 segundos tem 50% de chance de ser esquecida. Em 5 minutos, 80%. O Queue System elimina essa perda.

Cada ideia capturada recebe:
- **Raw text** — a ideia como veio, sem edição
- **Source context** — onde/quando surgiu
- **Domain tag** — em qual área se encaixa
- **Signal strength** — intuição inicial de potencial (1-10)
- **Timestamp** — quando foi capturada

A signal strength é crucial: ideias com signal >= 8 são candidatas a Big Ideas. Ideias com signal <= 3 podem ser noise e serão filtradas no processamento.

---

## Steps

### STEP 1: Capturar a Ideia Bruta
Registrar a ideia exatamente como veio, sem edição ou refinamento:

```yaml
capture_rules:
  - "Capture em 30 segundos ou menos"
  - "Use as palavras exatas que vieram à mente"
  - "Não tente estruturar ou polir"
  - "Inclua fragmentos, metáforas, conexões parciais"
  - "Se veio com emoção, registre a emoção"
  - "Se veio de algo que leu/ouviu, registre a fonte"
```

**Formato de captura:**
```
IDEIA: [texto bruto da ideia, exatamente como veio]
FONTE: [o que disparou — leitura, conversa, observação, chuveiro, exercício]
EMOÇÃO: [o que sentiu — excitação, curiosidade, indignação, eureka]
CONTEXTO: [o que estava fazendo quando surgiu]
```

### STEP 2: Avaliar Signal Strength
Atribuir um score de 1-10 baseado na intuição + critérios objetivos:

```yaml
signal_strength_criteria:
  body_response:
    description: "Seu corpo reagiu? Arrepio, aceleração cardíaca, vontade imediata de compartilhar?"
    weight: 0.30
    scoring:
      0: "Nenhuma reação física"
      5: "Interesse mental mas sem reação física"
      10: "Reação física forte — arrepio, energia, necessidade de falar sobre"

  cross_domain_potential:
    description: "Essa ideia conecta 2+ domínios diferentes?"
    weight: 0.25
    scoring:
      0: "Ideia single-domain, observação comum"
      5: "Possível conexão com outro domínio"
      10: "Conexão clara e surpreendente entre 2+ domínios"

  audience_relevance:
    description: "Sua audiência se importaria com isso?"
    weight: 0.20
    scoring:
      0: "Puramente pessoal, sem relevância para outros"
      5: "Relevante para um subgrupo"
      10: "Relevante para toda a audiência — resolve dor real"

  novelty:
    description: "Isso é um insight novo ou repetição do óbvio?"
    weight: 0.15
    scoring:
      0: "Clichê, todo mundo já disse"
      5: "Perspectiva levemente diferente"
      10: "Nunca vi ninguém dizer isso desta forma"

  development_potential:
    description: "Dá para desenvolver em conteúdo longo?"
    weight: 0.10
    scoring:
      0: "Frase solta, sem profundidade"
      5: "Dá para um post/tweet"
      10: "Dá para newsletter inteira + framework"

  calculation: "signal = (body*0.30 + cross*0.25 + audience*0.20 + novelty*0.15 + potential*0.10)"
```

### STEP 3: Aplicar Tags
Classificar a ideia nas taxonomias do Queue System:

```yaml
tagging_taxonomy:
  domain_tags:
    - psychology       # comportamento humano, cognição, motivação
    - philosophy       # existencialismo, propósito, consciência
    - business         # monetização, ofertas, mercado
    - technology       # ferramentas, AI, automação
    - creativity       # processo criativo, arte, escrita
    - health           # corpo, energia, performance física
    - relationships    # conexões humanas, comunidade
    - spirituality     # meditação, transcendência, flow
    - education        # aprendizado, ensino, transferência de conhecimento
    - economics        # dinheiro, mercados, valor

  content_type_tags:
    - observation      # algo que notou no mundo
    - connection       # link entre 2+ ideias/domínios
    - framework        # estrutura emergente
    - contrarian       # posição contra o consenso
    - story            # narrativa pessoal ou de terceiros
    - question         # pergunta que merece exploração
    - metaphor         # analogia poderosa
    - data_point       # estatística ou fato surpreendente

  urgency_tags:
    - timely           # relevante agora por evento/tendência
    - evergreen        # relevante sempre
    - seasonal         # relevante em certas épocas

  format_potential:
    - tweet            # ideia cabe em 280 caracteres
    - thread           # ideia precisa de 5-10 tweets
    - newsletter       # ideia merece 2000+ palavras
    - video            # ideia é melhor em formato visual/oral
    - framework        # ideia pode virar framework nomeado
```

### STEP 4: Registrar no Queue
Salvar a ideia no formato padronizado do Queue System:

```yaml
queue_entry_format:
  id: "Q-{{YYYY-MM-DD}}-{{sequential_number}}"
  captured_at: "{{ISO_TIMESTAMP}}"
  raw_idea: "{{texto bruto}}"
  source: "{{fonte/trigger}}"
  emotion: "{{emoção associada}}"
  context: "{{o que estava fazendo}}"
  signal_strength: "{{1-10}}"
  signal_breakdown:
    body_response: "{{0-10}}"
    cross_domain: "{{0-10}}"
    audience_relevance: "{{0-10}}"
    novelty: "{{0-10}}"
    development_potential: "{{0-10}}"
  tags:
    domains: ["{{tag1}}", "{{tag2}}"]
    content_type: "{{type}}"
    urgency: "{{timely|evergreen|seasonal}}"
    format_potential: ["{{format1}}", "{{format2}}"]
  status: "captured"  # captured → processing → developed → archived | discarded
  days_in_queue: 0
  connected_to: []  # IDs de outras ideias relacionadas
```

### STEP 5: Verificar Conexões Imediatas
Fazer um scan rápido da queue existente para ver se a nova ideia conecta com algo já capturado:

```yaml
connection_scan:
  check_for:
    - "Ideias no mesmo domínio capturadas nos últimos 7 dias"
    - "Ideias com tags complementares"
    - "Padrões emergentes (3+ ideias no mesmo tema)"

  if_connection_found:
    action: "Adicionar referência cruzada em ambas as ideias"
    flag: "Se 3+ ideias conectadas, sinalizar como candidata a Big Idea para koe-sintetizador"

  if_no_connection:
    action: "Registrar normalmente, conexões podem surgir depois"
```

---

## Input Required
```yaml
capture_input:
  raw_idea: ""              # the idea as it came (mandatory)
  source: ""                # what triggered it (mandatory)
  emotion: ""               # what you felt (optional but recommended)
  context: ""               # what you were doing (optional)
  initial_signal_guess: ""  # quick 1-10 gut feeling (optional — will be refined)
```

## Output Template
```yaml
capture_result:
  task_id: KOE_COL_001
  timestamp: "{{ISO_TIMESTAMP}}"

  queue_entry:
    id: "Q-{{date}}-{{N}}"
    raw_idea: "{{text}}"
    source: "{{source}}"
    emotion: "{{emotion}}"
    signal_strength: "{{1-10}}"
    tags:
      domains: ["{{tag1}}", "{{tag2}}"]
      content_type: "{{type}}"
      urgency: "{{urgency}}"
      format_potential: ["{{format1}}"]
    status: "captured"

  connections_found:
    count: "{{N}}"
    related_ids: ["Q-{{id1}}", "Q-{{id2}}"]
    pattern_alert: "{{true if 3+ connected ideas}}"

  next_action:
    if_signal_high: "Priorizar para síntese (KOE_SIN_004)"
    if_signal_low: "Manter na queue para processamento batch (KOE_COL_002)"
    if_pattern_found: "Sinalizar cluster para koe-sintetizador"
```

---

## Quality Gate
```yaml
quality_check:
  - [ ] Ideia capturada em texto bruto (sem edição/polimento)
  - [ ] Fonte da ideia registrada
  - [ ] Signal strength calculado com breakdown dos 5 critérios
  - [ ] Pelo menos 1 domain tag aplicado
  - [ ] Content type tag aplicado
  - [ ] Urgency tag aplicado
  - [ ] Formato padronizado do queue entry seguido
  - [ ] Scan de conexões executado (mesmo que zero encontradas)
  - [ ] Tempo de captura <= 5 minutos
```

## Handoff
After completion: → koe-coletor (KOE_COL_002 para processamento batch) ou → koe-sintetizador (se signal >= 8 e conexões encontradas)

---
*Task: KOE_COL_001 | Agent: koe-coletor | Version: 1.0*
