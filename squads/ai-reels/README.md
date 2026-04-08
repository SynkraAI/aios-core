---
name: ai-reels
description: |
  Squad para criar Instagram Reels (15-90s) com clone de voz e avatar IA. Stack: ElevenLabs Creator (voz PT-BR PVC) + HeyGen Creator (lip sync avatar) + Remotion (pos-producao).
version: 1.0.0
category: content
---

# AI Reels Squad v3.0

Squad para criar Instagram Reels (15-90s) com clone de voz e avatar IA.
Stack: ElevenLabs Creator (voz PT-BR PVC) + HeyGen Creator (lip sync avatar) + Remotion (pos-producao).

**Status**: DEVELOPING | **Target**: 4-5 reels/semana | **Custo**: $51/mes

---

## Fluxograma do Pipeline

```mermaid
flowchart TD
    START([Tema do Reel]) --> HOOK

    subgraph FASE1["Fase 1 — Hook"]
        HOOK[hook-architect<br/>3 primeiros segundos]
        HOOK --> QG1{QG-AR-1<br/>Score >= 8/10?}
        QG1 -->|FAIL| HOOK
    end

    QG1 -->|PASS| SCRIPT

    subgraph FASE2["Fase 2 — Script"]
        SCRIPT[script-director<br/>7 beats + direcao 10D]
        SCRIPT --> QG2{QG-AR-2<br/>7 beats + timing OK?}
        QG2 -->|FAIL| SCRIPT
    end

    QG2 -->|PASS| VOICE

    subgraph FASE3["Fase 3 — Voz"]
        VOICE[voice-engineer<br/>ElevenLabs TTS]
        VOICE --> QG3{QG-AR-3<br/>Fidelidade >= 80%?}
        QG3 -->|FAIL| VOICE
    end

    QG3 -->|PASS| VIDEO

    subgraph FASE4["Fase 4 — Avatar"]
        VIDEO[avatar-director<br/>HeyGen lip sync]
        VIDEO --> QG4{QG-AR-4<br/>Sync OK + identidade?}
        QG4 -->|FAIL| VIDEO
    end

    QG4 -->|PASS| EDIT

    subgraph FASE5["Fase 5 — Edicao"]
        EDIT[video-composer<br/>Remotion render]
        EDIT --> QG5{QG-AR-5<br/>1080x1920 + legendas?}
        QG5 -->|FAIL| EDIT
    end

    QG5 -->|PASS| CAPTION

    subgraph FASE6["Fase 6 — Caption"]
        CAPTION[script-director<br/>Copy Instagram]
        CAPTION --> QG6{QG-AR-6<br/>Voice DNA + CTA?}
        QG6 -->|FAIL| CAPTION
    end

    QG6 -->|PASS| QA

    subgraph FASE7["Fase 7 — QA"]
        QA[qa-sentinel<br/>Checklist 14 itens]
        QA --> QG7{QG-AR-7<br/>14/14 + Tiago aprova?}
        QG7 -->|FAIL| QA
    end

    QG7 -->|PASS| OUTPUT([Reel Publicado])

    style START fill:#1a1a2e,color:#fff
    style OUTPUT fill:#16a34a,color:#fff
    style QG1 fill:#f59e0b,color:#000
    style QG2 fill:#f59e0b,color:#000
    style QG3 fill:#f59e0b,color:#000
    style QG4 fill:#f59e0b,color:#000
    style QG5 fill:#f59e0b,color:#000
    style QG6 fill:#f59e0b,color:#000
    style QG7 fill:#f59e0b,color:#000
```

## Fluxograma Tecnico (ferramentas)

```mermaid
flowchart LR
    subgraph CRIATIVO["Fase Criativa (LLM)"]
        A[Claude/GPT<br/>Hook + Script + Caption]
    end

    subgraph PRODUCAO["Fase Producao (APIs)"]
        B[ElevenLabs<br/>voice.mp3]
        C[HeyGen Web UI<br/>avatar.mp4]
        D[Whisper<br/>captions.json]
    end

    subgraph EDICAO["Fase Edicao (Codigo)"]
        E[generate-reel-config.ts<br/>reel-config.json]
        F[Remotion Render<br/>reel-edit.mp4]
        G[FFmpeg<br/>reel-final.mp4]
    end

    A --> B --> C --> D --> E --> F --> G

    style CRIATIVO fill:#3b82f6,color:#fff
    style PRODUCAO fill:#8b5cf6,color:#fff
    style EDICAO fill:#10b981,color:#fff
```

---

## Arquitetura de Agentes

| Agente | Tier | Papel | Frameworks |
|---|---|---|---|
| ai-reels-chief | T0 | Orquestrador pipeline 7 fases | Pipeline orchestration |
| hook-architect | T1 | Hooks 3 primeiros segundos | Hook-Retain-Reward (Hormozi), 7Fs (Bourgoin), Hook Point (Kane) |
| script-director | T1 | Roteiro 7 beats + direcao 10D | Eight-Point Arc (Blackman), Performance Direction |
| voice-engineer | T1 | Clonagem de voz PT-BR | ElevenLabs multilingual_v2, PVC, speed 1.15 |
| avatar-director | T1 | Lip sync talking head | HeyGen Creator (web UI) |
| video-composer | T2 | Pos-producao programatica | Remotion 4.0.427, FFmpeg |
| qa-sentinel | T2 | QA binario + gate humano | Checklist 14 itens, Devil's Advocate |

---

## Remotion — Composicao `ReelEdit`

O coracao da edicao automatica. Cada reel e gerado a partir de um `reel-config.json` — zero codigo por video.

### 8 Camadas Visuais

```
+--------------------------+
|  8. Film Grain           |  noise3D (Remotion), opacity 0.05
|  7. Progress Bar         |  3px topo, cor do accent
|  6. Lower Third          |  Nome + @handle, slide-in com spring
|  5. Keyword Overlays     |  Texto animado em timestamps
|  4. Auto Captions        |  TikTok-style word-by-word
|  3. Vignette             |  Radial gradient cinematografico
|  2. Cut Flash            |  Flash branco nos pontos de corte
|  1. OffthreadVideo       |  Avatar HeyGen com punch-in/out
+--------------------------+
```

### Config-Driven — Exemplo `reel-config.json`

```json
{
  "slug": "ia-copiloto",
  "videoSrc": "heygen-avatar.mp4",
  "captionsSrc": "captions.json",
  "autoCuts": {
    "enabled": true,
    "intervalS": 4,
    "closeUpScale": 1.2,
    "hookScale": 1.25,
    "ctaScale": 1.15
  },
  "keywords": [
    { "text": "IA", "fromS": 6.08, "toS": 6.72, "position": "top", "color": "#C9A84C", "size": 90 }
  ],
  "lowerThird": {
    "name": "Tiago Guimaraes",
    "handle": "@tiag8guimaraes",
    "showFromS": 2,
    "showToS": 6
  },
  "captionStyle": {
    "switchMs": 1200,
    "highlightColor": "#C9A84C",
    "fontSize": 44
  },
  "features": {
    "cutFlash": true,
    "vignette": true,
    "grain": true,
    "progressBar": true,
    "captions": true,
    "lowerThird": true
  }
}
```

### Auto-Cuts — Algoritmo

O sistema gera cortes automaticamente a partir das pausas detectadas no `captions.json` (Whisper):

1. Detecta gaps > 200ms entre palavras
2. Gera pontos de corte em pausas naturais (intervalo minimo ~70% do `intervalS`)
3. Preenche gaps com cortes em intervalo fixo
4. Alterna normal (scale 1.0) / close-up (scale 1.2) com variacoes
5. Hook usa scale maior (1.25), CTA final usa ease-in longo

### Comandos de Render

```bash
# Preview no browser (Remotion Studio)
cd squads/ai-reels/remotion && npx remotion studio src/index.ts

# Render MP4
npx remotion render src/index.ts ReelEdit --output out/reel.mp4

# Render com codec especifico
npx remotion render src/index.ts ReelEdit --output out/reel.mp4 --codec h264

# Normalizar audio (pos-render)
ffmpeg -y -i out/reel.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v copy out/reel-final.mp4
```

### Specs Tecnicas

| Parametro | Valor |
|---|---|
| Resolucao | 1080x1920 (9:16) |
| FPS | 25 |
| Codec | H.264 |
| Audio | -14 LUFS (normalizado FFmpeg) |
| Formato | MP4 |
| Duracao | 15-90s (detecta do video) |

---

## Stack Tecnica

| Componente | Ferramenta | Custo | Status |
|---|---|---|---|
| TTS / Voz | ElevenLabs Creator (PVC, speed 1.15) | $22/mes | Ativo |
| Lip Sync / Avatar | HeyGen Creator (web UI) | $29/mes | Assinar |
| Pos-producao | Remotion 4.0.427 | $0 | Configurado |
| Legendas | Whisper (word-level) -> @remotion/captions | $0 | OK |
| Normalizacao audio | FFmpeg (-14 LUFS) | $0 | OK |

### Decisoes Tecnicas

| Decisao | Escolha | Alternativas rejeitadas |
|---|---|---|
| Lip sync | **HeyGen Creator $29/mo** | MuseTalk (borrado), LatentSync (dessync), Kling (10s limite) |
| Edicao | **Remotion** (programatico) | CapCut (manual), FFmpeg puro (limitado) |
| Velocidade voz | **1.15x** | 1.0x (lento demais para reels) |
| Captions | **@remotion/captions** (TikTok-style) | SRT overlay (estatico, sem animacao) |
| Grain | **noise3D** (@remotion/noise) | SVG feTurbulence (mais leve, pior resultado) |

---

## Scripts

| Script | Descricao |
|---|---|
| `scripts/elevenlabs-tts.ts` | Gera audio via ElevenLabs API (TTS) |
| `scripts/whisper-captions.ts` | Gera captions word-by-word via Whisper |
| `scripts/generate-reel-config.ts` | Gera `reel-config.json` a partir de captions + metadados |
| `scripts/test-lipsync.sh` | Testa lip sync tools (MuseTalk, LatentSync, etc.) |

## Workflows

| Workflow | Descricao |
|---|---|
| `wf-reel-production.yaml` | Pipeline completo para 1 reel (7 fases sequenciais) |
| `wf-batch-production.yaml` | Producao semanal batch (4-5 reels com aprovacao em lote) |

## Quality Gates

| Gate | Fase | Criterio |
|---|---|---|
| QG-AR-1 | Hook | Score >= 8/10, curiosity gap + formula comprovada |
| QG-AR-2 | Script | 7 beats completos, duracao 15-90s, timing validado |
| QG-AR-3 | Voz | Fidelidade >= 80%, zero artefatos, pronuncia PT-BR |
| QG-AR-4 | Lip Sync | Sync sem dessincronizacao + identidade preservada |
| QG-AR-5 | Edicao | 1080x1920 9:16, legendas, duracao correta |
| QG-AR-6 | Caption | Voice DNA pass, CTA especifico, guardrail 10/10 |
| QG-AR-7 | QA Final | 14/14 checklist, devil's advocate, aprovacao Tiago |

---

## Pre-requisitos

| # | Pre-requisito | Status | Como |
|---|---|---|---|
| 1 | ElevenLabs Creator ($22/mes) | OK | `ELEVENLABS_API_KEY` no `.env` |
| 2 | Voice clone criado (PVC) | OK | Voice ID: `YenbYX8x7myujzTnQhXP` |
| 3 | HeyGen Creator ($29/mes) | Pendente | Assinar em app.heygen.com |
| 4 | Video-template gravado | OK | 1080x1920, camera frontal, fundo neutro |
| 5 | Remotion instalado | OK | `cd remotion && npm install` |
| 6 | FFmpeg disponivel | OK | `brew install ffmpeg` |
| 7 | Whisper disponivel | OK | Via OpenAI API ou local |

Setup completo: `squads/ai-reels/docs/setup-guide.md`

## Custos

| Item | Custo/mes |
|---|---|
| ElevenLabs Creator | $22 |
| HeyGen Creator | $29 |
| Remotion | $0 (open source) |
| FFmpeg + Whisper | $0 |
| **Total** | **$51/mes** |

Capacidade: ~15 reels/mes (limitado por HeyGen 15min/mes no plano Creator).

---

## Estrutura de Arquivos

```
squads/ai-reels/
├── README.md                  # Este arquivo
├── agents/                    # 7 agentes (T0 + T1 + T2)
│   ├── ai-reels-chief.md      # Orquestrador
│   ├── hook-architect.md       # Hooks
│   ├── script-director.md      # Roteiro
│   ├── voice-engineer.md       # Voz
│   ├── avatar-director.md      # Avatar
│   ├── video-composer.md       # Edicao
│   └── qa-sentinel.md          # QA
├── tasks/                     # Tasks por fase
├── workflows/                 # Orquestracao
│   ├── wf-reel-production.yaml
│   └── wf-batch-production.yaml
├── checklists/                # Quality gates
├── templates/                 # Templates de output
├── data/                      # Knowledge base + tool stack
├── scripts/                   # Scripts de automacao
│   ├── elevenlabs-tts.ts
│   ├── whisper-captions.ts
│   ├── generate-reel-config.ts
│   └── test-lipsync.sh
├── remotion/                  # Projeto Remotion
│   ├── package.json           # Remotion 4.0.427
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── Root.tsx            # Composition registry
│   │   ├── ReelComposition.tsx # 8 camadas visuais
│   │   ├── auto-cuts.ts       # Algoritmo de cortes
│   │   └── types.ts           # TypeScript types
│   ├── public/                # Assets (video, captions, config)
│   └── out/                   # Renders (gitignored)
├── docs/                      # Guias internos
└── assets/                    # Assets compartilhados
```

## Comandos

| Comando | Descricao |
|---|---|
| `*create-reel "<tema>"` | Pipeline completo para 1 reel |
| `*batch-reels` | Producao semanal batch (4-5 reels) |
| `*generate-hooks "<tema>"` | Gerar 5 variacoes de hook |
| `*write-script "<tema>"` | Roteiro 7 beats completo |
| `*synth-voice <script.txt>` | Sintese de voz via ElevenLabs |
| `*render-edit` | Editar video via Remotion |
| `*qa-review <reel.mp4>` | QA binario + checklist 14 itens |

## Cross-References

- **content-engine**: `workflows/reels-creation.md` (workflow criativo), `checklists/reels-checklist.md`
- **docs/instagram**: `hook-formulas.md`, `reels-performance-direction.md`
- **docs/content/data**: `voice-dna.md` (guardrail de voz), `storytelling.md`
- **instagram-spy**: deteccao de tendencias, auditoria de hooks, triggers 7Fs
- **research**: `docs/research/2026-02-20-lip-sync-apis/` (comparativo 21 ferramentas)
- **research**: `docs/research/2026-02-21-remotion-instagram-reels/` (best practices YouTube)
