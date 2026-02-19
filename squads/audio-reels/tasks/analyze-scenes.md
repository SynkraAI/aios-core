---
task-id: analyze-scenes
name: "Analisar e Quebrar em Cenas"
agent: scene-director
version: 1.0.0
purpose: "Recebe transcrição com timestamps, aplica decision tree cinematográfica, gera JSON parcial de cenas"
executor: Agent
workflow-mode: automatic
elicit: false

inputs:
  - name: transcription_json
    type: file
    required: true
    description: "Transcrição com timestamps por palavra/segmento (Gemini 3 Flash output)"
  - name: style_config
    type: object
    required: true
    description: "Configuração de estilo visual (name, prompt_suffix, reference_image, seed)"

outputs:
  - path: "{output_dir}/spec-partial.json"
    description: "JSON parcial com cenas definidas (sem image_path e sfx.file_path)"

validation:
  success-criteria:
    - "Todas as cenas têm start < end"
    - "Cenas são contíguas"
    - "Cada cena tem shot_type, mood, audio_layer"
    - "subtitle_words cobrem intervalo da cena"
    - "3-20 cenas geradas"
---

# Analisar e Quebrar em Cenas

## Overview

Esta é a task mais crítica do pipeline — é o "cérebro" que decide a linguagem visual do vídeo. Executada pelo @scene-director usando a decision tree documentada em `data/scene-decision-tree.md`.

## Steps

### Step 1: Carregar Transcrição

```yaml
actions:
  - Ler transcription_json
  - Extrair:
    - duration_total (duração total do áudio)
    - segments[] (segmentos com timestamps)
    - words[] (palavras com timestamps, se disponível)
```

### Step 2: Identificar Beats Narrativos

```yaml
actions:
  - Aplicar Robert McKee Beat Theory:
    - Ler texto completo da transcrição
    - Identificar mudanças de emoção, cenário, ou ação
    - Cada mudança = potencial quebra de cena
  - Aplicar Walter Murch Blink Theory:
    - Identificar pausas naturais na fala (gaps > 0.5s)
    - Essas pausas são candidatas naturais para cortes
  - Combinar: beats narrativos + pausas naturais = breakpoints
```

### Step 3: Definir Cenas

```yaml
actions:
  - Para cada segmento entre breakpoints:
    1. Classificar audio_layer (Passo 1 da decision tree)
    2. Classificar mood (análise emocional do texto)
    3. Agrupar palavras que pertencem a esta cena
    4. Definir start/end baseado nos timestamps das palavras
  - Validar que nenhuma cena tem < 1s ou > 8s
    - Se < 1s: merge com cena anterior
    - Se > 8s: split no ponto mais natural
```

### Step 4: Aplicar Decision Tree Completa

```yaml
actions:
  - Para cada cena:
    1. shot_type ← audio_layer (Passo 2)
    2. camera_movement ← mood (Passo 3)
    3. transition_in ← relação com cena anterior (Passo 4)
    4. sfx ← keywords no texto (Passo 5)
    5. image_prompt ← composição descritiva em inglês
```

### Step 5: Montar JSON Parcial

```yaml
actions:
  - Criar JSON seguindo schema data/video-spec-schema.json
  - Preencher todos os campos de responsabilidade do scene-director
  - Deixar vazios: image_path, sfx.file_path
  - Incluir metadata (duration, fps, width, height)
  - Incluir style config
  - Incluir subtitles config
  - Salvar em output_dir
```

### Step 6: Validar

```yaml
actions:
  - Executar checklist de validação:
    - [ ] Cenas contíguas
    - [ ] Nenhum gap no áudio (todo segundo coberto)
    - [ ] shot_type é enum válido
    - [ ] camera_movement é enum válido
    - [ ] transition_in é enum válido
    - [ ] mood é enum válido
    - [ ] subtitle_words timestamps dentro do range da cena
    - [ ] image_prompt em inglês e < 100 palavras
```

## System Prompt para LLM (executado via Gemini 3 Pro)

```
You are a cinema director analyzing an audio transcription to create a scene breakdown.

Given the transcription with timestamps, produce a JSON following the VideoSpec schema.

Rules:
1. Segment by narrative beats (emotion/scene changes), NOT by fixed time intervals
2. Each scene gets: shot_type, camera_movement, transition_in, mood, audio_layer, image_prompt, sfx
3. Apply the 5-step decision tree strictly
4. image_prompt must be in English, max 100 words, describe VISUAL content only
5. Do NOT include the style suffix in image_prompt
6. SFX only when text explicitly mentions a sound (doorbell, rain, door, etc.)
7. Scenes must be contiguous: scene[n].end == scene[n+1].start
8. No scene shorter than 1s or longer than 8s
```
