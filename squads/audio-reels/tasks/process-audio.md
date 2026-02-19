---
task-id: process-audio
name: "Processar Áudio Completo"
agent: audio-reels-chief
version: 1.0.0
purpose: "Task principal — recebe áudio WhatsApp, coordena pipeline ponta-a-ponta, entrega vídeo"
executor: Agent
workflow-mode: automatic
elicit: false

inputs:
  - name: audio_path
    type: string
    required: true
    description: "Path para o arquivo de áudio (OGG/MP3/WAV)"
  - name: whatsapp_chat_id
    type: string
    required: false
    description: "Chat ID do WhatsApp para entrega (se via webhook)"
  - name: style_override
    type: string
    required: false
    description: "Override do estilo visual (usa default se não informado)"

outputs:
  - path: "outputs/audio-reels/{date}_{slug}_reels.mp4"
    description: "Vídeo final renderizado em 9:16"
  - path: "outputs/audio-reels/specs/{date}_{slug}_spec.json"
    description: "JSON spec completa usada para render"

prerequisites:
  - Google API key (Gemini 3 Flash + Pro + 2.5 Flash)
  - ElevenLabs API key (Sound Effects)
  - ffmpeg instalado
  - Node.js 18+ (Remotion)
  - Reference image do personagem configurada
  - Template Remotion inicializado

validation:
  success-criteria:
    - "Vídeo MP4 existe e tem duração ≈ áudio original"
    - "Vídeo < 16MB (ou compressed version)"
    - "Todas as cenas renderizadas"
    - "Legendas visíveis e sincronizadas"
  failure-conditions:
    - "Áudio inválido ou corrompido"
    - "Transcrição falha após retries"
    - "Mais de 50% das imagens falharam"
---

# Processar Áudio Completo

## Overview

Task principal do squad Audio Reels. Recebe um áudio e entrega um vídeo.
Coordenada pelo @audio-reels-chief que delega para cada agente em sequência.

## Steps

### Step 1: Ingestão e Validação

```yaml
actions:
  - Verificar arquivo existe: ls -la "{audio_path}"
  - Verificar formato (OGG/MP3/WAV): ffprobe -hide_banner -i "{audio_path}"
  - Converter para MP3 mono 16kHz se necessário:
      ffmpeg -i "{audio_path}" -vn -ac 1 -ar 16000 -b:a 64k "{output_dir}/original.mp3"
  - Calcular duração
  - Criar diretório de trabalho: outputs/audio-reels/{date}_{slug}/

gate: QG-001
criteria:
  - Arquivo existe
  - Duração > 5s e < 300s (5min max para MVP)
  - Formato convertido com sucesso
```

### Step 2: Transcrição (Gemini 3 Flash)

```yaml
actions:
  - Chamar Gemini 3 Flash com áudio multimodal:
      model: "gemini-3.0-flash"
      contents:
        - inline_data:
            mime_type: "audio/mp3"
            data: "{base64 do audio}"
        - text: |
            Transcreva este áudio em português brasileiro.
            Retorne JSON com:
            - text: texto completo
            - segments[]: {text, start, end}
            - words[]: {word, start, end}
            Timestamps em segundos com precisão de centésimos.
  - Salvar em: {output_dir}/transcription.json

gate: QG-001 (continuação)
criteria:
  - Transcrição não vazia
  - Timestamps presentes por segmento e por palavra
```

### Step 3: Análise de Cenas

```yaml
agent: scene-director
task: analyze-scenes
actions:
  - Ler transcrição com timestamps
  - Aplicar decision tree (5 passos)
  - Gerar JSON parcial com cenas
  - Salvar em: {output_dir}/spec-partial.json

gate: QG-002
criteria:
  - Cenas contíguas (scene[n].end == scene[n+1].start)
  - Cada cena tem shot_type, mood, audio_layer
  - subtitle_words cobrem intervalo
  - 3-20 cenas (sanity check)
```

### Step 4: Geração de Assets (PARALELO)

```yaml
parallel:
  - agent: image-prompter
    task: generate-scene-images
    actions:
      - Para cada cena: gerar imagem 9:16
      - Salvar em: {output_dir}/assets/scenes/
      - Atualizar JSON com image_path

  - agent: sfx-designer
    task: generate-sfx
    actions:
      - Para cada cena com sfx != null: gerar SFX
      - Salvar em: {output_dir}/assets/sfx/
      - Atualizar JSON com sfx.file_path

gate: QG-003
criteria:
  - Todas as image_path existem
  - Todos os sfx.file_path existem (quando sfx != null)
  - Imagens são renderizáveis (> 10KB)
```

### Step 5: Otimização de Pacing

```yaml
agent: reels-optimizer
task: optimize-pacing
actions:
  - Receber JSON completo
  - Aplicar regras de pacing (hook, variação, ritmo)
  - Retornar JSON otimizado
  - Salvar log de otimizações
```

### Step 6: Render

```yaml
agent: remotion-assembler
task: render-and-deliver
actions:
  - Validar JSON final (QG-004)
  - Copiar assets para projeto Remotion
  - Render via Remotion CLI
  - Validar vídeo (QG-005)
  - Comprimir se > 16MB
  - Salvar em: outputs/audio-reels/{date}_{slug}_reels.mp4
```

### Step 7: Entrega

```yaml
actions:
  - SE whatsapp_chat_id:
      Enviar vídeo via UAZAPI media endpoint
  - Salvar JSON spec final em: outputs/audio-reels/specs/
  - Log de execução com custos
  - Cleanup de arquivos temporários (opcional)
```

## Cost Tracking

```yaml
cost_log:
  gemini_3_flash_transcription: "$X.XX"
  gemini_3_pro_analysis: "$X.XX"
  gemini_2_5_flash_images: "$X.XX (N images × $0.04)"
  elevenlabs_sfx: "$X.XX (N effects × $0.01)"
  total: "$X.XX"
```
