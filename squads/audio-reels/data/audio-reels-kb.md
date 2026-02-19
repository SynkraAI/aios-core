# Audio Reels — Knowledge Base

## Domain Overview

Audio Reels é um pipeline de automação que transforma áudio em vídeo cinematográfico. Combina técnicas de cinema (composição, edição, sound design) com IA generativa (imagens, SFX) e renderização programática (Remotion).

## Key Concepts

### Linguagem Cinematográfica

| Conceito | Definição |
|----------|-----------|
| **Shot type** | Enquadramento da câmera (close-up, wide, insert, etc.) |
| **Camera movement** | Movimento da câmera (zoom, pan, dolly, ken-burns) |
| **Transition** | Como uma cena muda para outra (cut, dissolve, fade) |
| **Beat** | Menor unidade de mudança narrativa (emoção, ação, cenário) |
| **Mood** | Tom emocional de uma cena (tensão, tristeza, humor, etc.) |
| **Insert shot** | Plano de detalhe de um objeto específico |
| **Ken Burns effect** | Zoom lento sobre imagem estática (simula movimento) |

### Pipeline Técnico

| Conceito | Definição |
|----------|-----------|
| **Video Spec** | JSON que define todas as cenas, assets e timing do vídeo |
| **Reference image** | Imagem fixa do personagem para manter consistência |
| **Style suffix** | Texto adicionado a todos os prompts de imagem |
| **Word-by-word subtitles** | Legendas onde cada palavra aparece sincronizada com o áudio |
| **Bottom-safe zone** | Área da tela acima dos controles de Reels/TikTok (~75-85% da altura) |
| **Quality gate** | Checkpoint que bloqueia progressão se critérios não forem atendidos |

## Best Practices (from Elite Minds)

### Walter Murch — Rule of Six
Prioridade para decisões de corte:
1. Emoção > 2. Story > 3. Ritmo > 4. Eye-trace > 5. Composição > 6. Continuidade

### Roger Deakins — Cinematografia
- Uma fonte de luz dominante cria drama
- Câmera só se move com razão narrativa
- Shot type comunica emoção (close-up = intimidade, wide = solidão)

### Robert McKee — Story Structure
- Segmentar por beats (mudanças emocionais), não por tempo
- Cada cena muda de valor (positivo → negativo ou vice-versa)

### Ben Burtt — Sound Design
- Sons orgânicos > sintéticos
- Descrições sensoriais específicas geram melhores SFX
- Layering: um som "real" é 3-5 camadas sobrepostas

### Paddy Galloway — Short-Form
- 3 segundos iniciais decidem retenção
- Mudança visual a cada 2-5 segundos
- Nunca mesmo enquadramento 2x seguidas
- Legendas word-by-word aumentam retenção

## Common Patterns

| Pattern | Uso |
|---------|-----|
| AR-001 | Hook visual forte na cena 1 (close-up + zoom-in + fade-from-black) |
| AR-002 | SFX featured em insert shots (volume 0.5-0.7) |
| AR-003 | Dissolve entre mudanças de mood |
| AR-004 | Ken-burns como fallback para cenas sem movimento definido |
| AR-005 | Compressão progressiva para WhatsApp (CRF 18→23→28→32) |

## Anti-Patterns

| Anti-Pattern | Por que evitar |
|-------------|---------------|
| Cenas > 6s | Perde retenção em short-form |
| Mesmo shot 2x seguidas | Monotonia visual |
| SFX mais alto que narração | Abafa o conteúdo principal |
| Wide-shot como primeiro frame | Hook fraco — espectador pula |
| Prompt genérico para imagem | Resultado inconsistente |
| Seed como única consistência | Seed não garante consistência entre ângulos |

## Arquitetura Gemini 100%

| Modelo | Função | Endpoint |
|--------|--------|----------|
| **Gemini 3 Flash** | Transcrição multimodal, validações rápidas, enriquecimento SFX | `generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash` |
| **Gemini 3 Pro** | Análise de cenas (decision tree), otimização pacing | `generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro` |
| **Gemini 2.5 Flash** | Geração de imagens (Nano Banana) | `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-image-generation` |

## APIs Reference

| API | Modelo/Endpoint | Custo |
|-----|----------------|-------|
| Gemini 3 Flash | `gemini-3.0-flash` (multimodal audio) | ~$0.001-0.002/min |
| Gemini 3 Pro | `gemini-3.0-pro` | ~$0.03-0.05/call |
| Gemini 2.5 Flash | `gemini-2.5-flash-preview-image-generation` | ~$0.04/img |
| ElevenLabs SFX | `api.elevenlabs.io/v1/sound-generation` | ~$0.01/sfx |
| UAZAPI | Webhook + media send | Assinatura |
