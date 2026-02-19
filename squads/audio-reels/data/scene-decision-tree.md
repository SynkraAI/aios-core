# Scene Decision Tree

## Passo 1: Classificar audio_layer

| Condição | Classificação |
|----------|--------------|
| Silêncio + efeito sonoro descrito no texto | `sfx-dominant` |
| Fala sobre sentimentos, reflexão, introspecção | `voice-introspective` |
| Fala descrevendo cenário, lugar, ação física | `voice-descriptive` |
| Fala + efeito sonoro simultâneo | `mixed` |
| Pausa sem fala nem SFX | `ambient` |

## Passo 2: shot_type (baseado em audio_layer)

| audio_layer | shot_type options |
|------------|-------------------|
| `voice-introspective` | `close-up`, `extreme-close-up` |
| `voice-descriptive` | `wide-shot`, `establishing-shot`, `low-angle` |
| `sfx-dominant` | `insert-shot` |
| `mixed` | `over-the-shoulder`, `medium-shot` |
| `ambient` | `wide-shot`, `establishing-shot` |

## Passo 3: camera_movement (baseado em mood)

| mood | camera_movement options |
|------|----------------------|
| `tension` | `slow-zoom-in`, `handheld-shake` |
| `triumph` | `slow-zoom-out`, `ken-burns` |
| `sadness` | `static`, `slow-zoom-in` |
| `humor` | `ken-burns` |
| `reflection` | `slow-zoom-in` |
| `urgency` | `handheld-shake`, `pan-left`, `pan-right` |
| `revelation` | `dolly-in` |
| `neutral` | `ken-burns` |

## Passo 4: transition_in (baseado em contexto entre cenas)

| Condição | transition_in |
|----------|--------------|
| Primeira cena do vídeo | `fade-from-black` |
| Mesmo mood que cena anterior | `cut` |
| Mudança de mood | `dissolve` |
| Mudança brusca (SFX forte) | `cut` |
| Mudança de cenário/local | `wipe-left`, `wipe-right` |

## Passo 5: SFX (baseado em keywords no texto)

| Condição | Ação |
|----------|------|
| Texto menciona som específico | Criar `sfx` object com description, start, duration, volume |
| Texto não menciona som | `sfx = null` |

### Parâmetros SFX

| Parâmetro | Regra |
|-----------|-------|
| `description` | Descrição detalhada em inglês (organic sound design) |
| `start` | Timestamp do momento no áudio onde o som é mencionado |
| `duration` | 1-5s baseado no contexto |
| `volume` | Background (0.2-0.4) ou Featured (0.5-0.7) |

## Enums Válidos

### shot_type
`extreme-close-up`, `close-up`, `medium-shot`, `wide-shot`, `insert-shot`, `over-the-shoulder`, `pov`, `low-angle`, `high-angle`, `establishing-shot`

### camera_movement
`static`, `slow-zoom-in`, `slow-zoom-out`, `pan-left`, `pan-right`, `ken-burns`, `handheld-shake`, `dolly-in`

### transition_in
`cut`, `dissolve`, `fade-from-black`, `wipe-left`, `wipe-right`, `zoom-in`

### mood
`neutral`, `tension`, `triumph`, `sadness`, `humor`, `reflection`, `urgency`, `revelation`

### audio_layer
`voice-introspective`, `voice-descriptive`, `sfx-dominant`, `ambient`, `mixed`
