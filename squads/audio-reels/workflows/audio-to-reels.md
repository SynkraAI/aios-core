---
workflow-id: audio-to-reels
name: "Áudio para Reels (Pipeline Completo)"
version: 1.0.0
purpose: "End-to-end: áudio WhatsApp → vídeo entregue"
orchestrator: audio-reels-chief
mode: automatic
---

# Workflow: Áudio para Reels

## Overview

Pipeline completo que transforma um áudio de WhatsApp em vídeo estilo cinema (9:16) pronto para Reels/TikTok/Shorts.

```
PHASE 1: Ingestão    → download + conversão + transcrição
PHASE 2: Análise     → quebra em cenas + decision tree
PHASE 3: Geração     → imagens (paralelo) + SFX (paralelo)
PHASE 4: Montagem    → otimização + JSON final
PHASE 5: Entrega     → render + compressão + envio WhatsApp
```

## Phase 1: Ingestão

**Duration:** ~30-60s
**Agent:** audio-reels-chief
**Model:** Gemini 3 Flash (transcrição multimodal)

### Steps

1. Receber áudio (webhook UAZAPI ou path local)
2. Validar formato (OGG/MP3/WAV)
3. Converter para MP3 mono 16kHz
4. Transcrever via Gemini 3 Flash (multimodal audio → JSON com timestamps por palavra)

### Gate: QG-001 — Transcrição Válida

```yaml
criteria:
  - audio_converted: true
  - transcription_not_empty: true
  - timestamps_present: true
  - duration_seconds: "> 5 AND < 300"
blocking: true
on_fail: "Abortar com mensagem de erro ao usuário"
```

---

## Phase 2: Análise

**Duration:** ~15-30s
**Agent:** scene-director
**Model:** Gemini 3 Pro

### Steps

1. Carregar transcrição com timestamps
2. Identificar beats narrativos (McKee)
3. Identificar pontos de corte naturais (Murch)
4. Definir cenas com decision tree (5 passos)
5. Gerar JSON parcial

### Gate: QG-002 — Cenas Válidas

```yaml
criteria:
  - scenes_contiguous: true
  - each_scene_has_shot_type: true
  - each_scene_has_mood: true
  - subtitle_words_in_range: true
  - scene_count: ">= 3 AND <= 20"
blocking: true
on_fail: "Retry analyze-scenes (max 2x)"
```

---

## Phase 3: Geração de Assets

**Duration:** ~60-180s (depende do número de cenas)
**Agents:** image-prompter + sfx-designer (PARALELO)

### Steps (paralelo)

**Branch A — Imagens:**
1. Para cada cena: montar prompt final (image_prompt + style_suffix)
2. Chamar Nano Banana 2.5 Flash API
3. Salvar imagem 9:16
4. Atualizar JSON com image_path

**Branch B — SFX:**
1. Filtrar cenas com sfx != null
2. Enriquecer descrição (sfx-lookup + Ben Burtt principles)
3. Chamar ElevenLabs Sound Effects API
4. Salvar arquivo MP3
5. Atualizar JSON com sfx.file_path

### Gate: QG-003 — Assets Completos

```yaml
criteria:
  - all_images_exist: true
  - all_sfx_exist: true  # (para cenas com sfx != null)
  - images_size: "> 10KB each"
blocking: true
on_fail: "Retry cenas faltantes (max 2x). Se > 50% falhou: abortar"
```

---

## Phase 4: Montagem

**Duration:** ~10-20s
**Agents:** reels-optimizer + remotion-assembler

### Steps

1. Reels Optimizer recebe JSON completo
2. Aplica regras de pacing (hook, variação, ritmo)
3. Documenta mudanças em _optimization_log
4. Remotion Assembler valida JSON final

### Gate: QG-004 — JSON Spec Válido

```yaml
criteria:
  - schema_valid: true
  - last_scene_end_matches_duration: true  # ±0.5s
  - total_scenes_matches_array: true
  - all_paths_exist: true
blocking: true
on_fail: "Corrigir JSON e revalidar"
```

---

## Phase 5: Entrega

**Duration:** ~60-120s
**Agent:** remotion-assembler + audio-reels-chief

### Steps

1. Copiar assets para projeto Remotion
2. Render via Remotion CLI (1080x1920, 30fps, H.264)
3. Validar vídeo output
4. Comprimir se > 16MB
5. Enviar via WhatsApp (UAZAPI media)
6. Log de custos e métricas

### Gate: QG-005 — Vídeo Entregável

```yaml
criteria:
  - video_exists: true
  - video_duration_matches_audio: true  # ±1s
  - video_size: "< 16MB (or compressed)"
blocking: true
on_fail: "Comprimir com CRF progressivo. Se ainda falhar: enviar como document"
```

---

## Estimated Costs

| Componente | Modelo | Custo | Variável |
|-----------|--------|-------|----------|
| Transcrição | Gemini 3 Flash | ~$0.001-0.002/min | Duração do áudio |
| Análise de cenas | Gemini 3 Pro | ~$0.03-0.05 | Tokens |
| Imagens | Gemini 2.5 Flash | ~$0.04/img × ~8 | Num cenas |
| SFX | ElevenLabs | ~$0.01/sfx × ~3 | Num SFX |
| Render | CPU local | — | — |
| **Total** | | **~$0.35-0.70** | |

## Estimated Time

| Phase | Tempo |
|-------|-------|
| Ingestão | 30-60s |
| Análise | 15-30s |
| Geração | 60-180s |
| Montagem | 10-20s |
| Entrega | 60-120s |
| **Total** | **~3-7 min** |
