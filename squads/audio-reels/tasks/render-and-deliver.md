---
task-id: render-and-deliver
name: "Renderizar e Entregar"
agent: remotion-assembler
version: 1.0.0
purpose: "Renderizar vídeo via Remotion, comprimir se necessário, enviar via WhatsApp"
executor: Worker
workflow-mode: automatic
elicit: false

inputs:
  - name: video_spec_json
    type: file
    required: true
    description: "JSON spec final otimizado"
  - name: whatsapp_chat_id
    type: string
    required: false
    description: "Chat ID para entrega via UAZAPI"

outputs:
  - path: "{output_dir}/reels.mp4"
    description: "Vídeo final renderizado"

validation:
  success-criteria:
    - "Vídeo MP4 existe"
    - "Duração ≈ áudio original (±1s)"
    - "Tamanho < 16MB"
---

# Renderizar e Entregar

## Steps

### Step 1: Validar JSON Spec

```yaml
gate: QG-004
actions:
  - Validar contra schema data/video-spec-schema.json
  - Verificar todos os image_path existem
  - Verificar todos os sfx.file_path existem
  - Verificar total_scenes == scenes.length
  - Verificar última cena.end ≈ duration_seconds
```

### Step 2: Preparar Projeto Remotion

```yaml
actions:
  - Copiar spec JSON para: templates/remotion-reels/src/slides-data.json
  - Copiar imagens para: templates/remotion-reels/public/slides/
  - Copiar áudio original para: templates/remotion-reels/public/audio/
  - Copiar SFX para: templates/remotion-reels/public/audio/sfx/
```

### Step 3: Render

```bash
cd templates/remotion-reels
npx remotion render src/index.ts MainVideo \
  --output out/reels.mp4 \
  --width 1080 \
  --height 1920 \
  --fps 30 \
  --codec h264 \
  --crf 18
```

### Step 4: Validar Output

```yaml
gate: QG-005
actions:
  - Verificar arquivo existe: ls -la out/reels.mp4
  - Verificar duração: ffprobe -show_entries format=duration out/reels.mp4
  - Verificar tamanho: du -h out/reels.mp4
  - Se > 16MB: comprimir
```

### Step 5: Comprimir (se necessário)

```bash
ffmpeg -i out/reels.mp4 \
  -c:v libx264 -crf 28 -preset fast \
  -c:a aac -b:a 128k \
  out/reels-compressed.mp4
```

### Step 6: Entregar

```yaml
actions:
  - Copiar vídeo final para: outputs/audio-reels/{date}_{slug}_reels.mp4
  - SE whatsapp_chat_id:
      - Enviar via UAZAPI media endpoint
      - Confirmar entrega
  - Log de custos e métricas
```
