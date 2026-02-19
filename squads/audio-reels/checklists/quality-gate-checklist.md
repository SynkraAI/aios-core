# Quality Gates Checklist — Audio Reels Pipeline

## QG-001: Transcrição Válida

**Transition:** Webhook → Scene Director
**Type:** Blocking
**Model:** Gemini 3 Flash (transcrição multimodal)

- [ ] Áudio convertido para MP3 com sucesso
- [ ] Duração > 5s e < 300s
- [ ] Transcrição via Gemini 3 Flash não vazia
- [ ] Timestamps presentes por segmento e por palavra
- [ ] Idioma detectado corretamente (pt-BR)

**On fail:** Abortar pipeline. Enviar mensagem de erro ao WhatsApp.

---

## QG-002: Cenas Válidas

**Transition:** Scene Director → Image Prompter + SFX Designer
**Type:** Blocking

- [ ] 3-20 cenas geradas
- [ ] Todas as cenas têm start < end
- [ ] Cenas são contíguas (sem gaps)
- [ ] Cada cena tem shot_type válido
- [ ] Cada cena tem mood válido
- [ ] Cada cena tem audio_layer válido
- [ ] subtitle_words cobrem intervalo de cada cena
- [ ] image_prompt em inglês e < 100 palavras

**On fail:** Retry analyze-scenes (max 2x). Se ainda falhar: escalar para humano.

---

## QG-003: Assets Completos

**Transition:** Image Prompter + SFX Designer → Remotion Assembler
**Type:** Blocking

- [ ] Todas as image_path existem como arquivos
- [ ] Cada imagem > 10KB
- [ ] Todos os sfx.file_path existem (onde sfx != null)
- [ ] Cada SFX > 1KB
- [ ] Menos de 20% das cenas com falha de geração

**On fail:** Retry cenas faltantes (max 2x). Se > 50% falhou: abortar.

---

## QG-004: JSON Spec Válido

**Transition:** Montagem → Render
**Type:** Blocking

- [ ] JSON passa validação de schema
- [ ] total_scenes == scenes.length
- [ ] Última cena.end ≈ metadata.duration_seconds (±0.5s)
- [ ] Todos os paths de assets existem
- [ ] Nenhum campo obrigatório nulo

**On fail:** Corrigir JSON e revalidar. Se não corrigível: escalar para humano.

---

## QG-005: Vídeo Entregável

**Transition:** Render → WhatsApp
**Type:** Blocking

- [ ] Vídeo MP4 existe
- [ ] Duração do vídeo ≈ duração do áudio (±1s)
- [ ] Tamanho < 16MB (ou versão comprimida < 16MB)
- [ ] Codec H.264
- [ ] Resolução 1080x1920

**On fail:** Comprimir com CRF progressivo (23→28→32). Se ainda > 16MB: enviar como document.
