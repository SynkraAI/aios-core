---
name: deepgram-transcriber
description: >-
  Transcription batch de audios usando Deepgram Nova-3 API. Auto-compressao,
  processamento paralelo (multi-worker), resume automatico.
  Use para transcrever qualquer volume de audio de forma rapida e eficiente.
risk: safe
source: self
paths:
  - ".aios/skills/deepgram-transcriber/"
lazy_load: true
context_budget: 800
---

# Deepgram Transcriber

Skill de transcricao em batch usando a API da Deepgram com modelo Nova-3. Processa audios locais com compressao automatica, workers paralelos e capacidade de resume.

## When to Use This Skill

- Transcrever grandes volumes de audio (cursos, palestras, mentorias, lives)
- Processar batch de multiplos arquivos de audio em paralelo
- Transcrever audio de qualquer formato (.m4a, .wav, .mp3)
- Quando precisar de transcricao rapida sem consumir RAM/GPU local
- Quando o Groq estiver travando por rate limits

## Do NOT Use This Skill When

- O audio ja tem transcricao (script detecta automaticamente)
- Precisa de transcricao em tempo real (streaming)
- Precisa de diarizacao (identificacao de falantes) — use outro servico
- Volume pequeno (1-2 arquivos curtos) — Groq pode ser suficiente e gratuito

## Prerequisites

- Python 3.10+
- Pacote `deepgram-sdk` instalado: `pip3 install --break-system-packages deepgram-sdk`
- `ffmpeg` instalado: `brew install ffmpeg`
- API key configurada em `.aios/skills/deepgram-transcriber/.env`

## Quick Start

```bash
# Transcrever todos os audios em um diretorio
python3 tools/deepgram-batch-transcribe.py ./audios

# Com 5 workers paralelos (mais rapido)
python3 tools/deepgram-batch-transcribe.py ./audios --workers 5

# Sem compressao (enviar arquivo original)
python3 tools/deepgram-batch-transcribe.py ./audios --no-compress

# Idioma diferente
python3 tools/deepgram-batch-transcribe.py ./audios --language en

# Compressao mais agressiva
python3 tools/deepgram-batch-transcribe.py ./audios --bitrate 32k
```

## Workflow

### Phase 1: Setup

1. Verificar se `.aios/skills/deepgram-transcriber/.env` existe e tem key configurada
2. Verificar se `ffmpeg` esta instalado: `which ffmpeg`
3. Verificar se `deepgram-sdk` esta instalado: `pip3 show deepgram-sdk`
4. Se algum prerequisito faltar, orientar o usuario a instalar

**Veto conditions (BLOQUEIA se qualquer uma falhar):**
- `.env` nao existe ou nao tem `DEEPGRAM_API_KEY` → PARAR, orientar criacao do `.env`
- `ffmpeg` nao instalado → PARAR, instruir `brew install ffmpeg`
- `deepgram-sdk` nao instalado → PARAR, instruir `pip3 install --break-system-packages deepgram-sdk`

**Completion criteria:** Todos os 3 prerequisitos verificados com sucesso.

### Phase 2: Scan

1. Perguntar ao usuario o diretorio dos audios (se nao fornecido via `$ARGUMENTS`)
2. Verificar se o diretorio existe e tem arquivos de audio
3. Calcular quantidade, tamanho, duracao e custo estimado

**Veto conditions:**
- Diretorio nao existe → PARAR, pedir caminho correto
- Nenhum arquivo de audio encontrado → PARAR, informar ao usuario

**Completion criteria:** Diretorio validado com pelo menos 1 arquivo de audio pendente. Custo estimado apresentado ao usuario.

### Phase 3: Execute

1. Rodar: `python3 tools/deepgram-batch-transcribe.py <directory> --workers 3`
2. Monitorar output para erros
3. O script salva progresso — se interrompido, ao re-executar retoma de onde parou

**Veto conditions:**
- Erro de autenticacao (401/403) → PARAR, verificar validade da API key no `.env`
- Erro persistente (5+ falhas consecutivas) → PARAR, investigar causa

**Completion criteria:** Script finaliza com 0 erros, ou com erros parciais reportados.

### Phase 4: Validate

1. Verificar se os arquivos `.md` foram criados ao lado dos audios
2. Spot-check: ler o inicio de 1-2 transcricoes para validar qualidade
3. Reportar resultado final: arquivos transcritos, erros, tempo total, custo

**Completion criteria:** Pelo menos 1 transcricao validada por leitura. Resultado reportado ao usuario.

## Features

### Auto-compressao

Antes de enviar cada arquivo para a API, o script:
- Converte para MP3 mono 16kHz a 64kbps
- Reducao tipica: 60-67% do tamanho original
- Desativar com `--no-compress`

### Workers paralelos

- Default: 3 workers simultaneos
- Configuravel com `--workers N`
- Deepgram tem rate limits generosos — 5 workers funciona bem
- Cada worker processa um arquivo independente

### Resume automatico

- Progresso salvo em `.transcription-state-dg.json` no diretorio de audio
- Se o script for interrompido, ao re-executar ele pula os arquivos ja transcritos
- Para forcar re-transcricao, deletar o arquivo de estado

## Output Format

Cada audio gera um `.md` com:

```markdown
# Titulo (nome da pasta)

> **Fonte:** arquivo-original.m4a
> **Duracao:** 45min
> **Transcricao:** Deepgram nova-3 | 2026-03-05

---

Texto transcrito aqui com paragrafos formatados...
```

## CLI Reference

```
python3 tools/deepgram-batch-transcribe.py <directory> [options]

Arguments:
  directory          Directory to scan for audio files

Options:
  --no-compress      Skip auto-compression
  --bitrate BITRATE  Compression bitrate (default: 64k)
  --language LANG    Audio language (default: pt-BR)
  --workers N        Concurrent workers (default: 3)
  -h, --help         Show help
```

## API Key Configuration

A key fica em `.aios/skills/deepgram-transcriber/.env` (gitignored).

```bash
# .env format:
DEEPGRAM_API_KEY=dg_your_key_here
```

**Prioridade de carregamento:**
1. `.aios/skills/deepgram-transcriber/.env` (preferido)
2. `.aios/skills/groq-transcriber/.env` (fallback — compartilhado)
3. Variavel de ambiente `DEEPGRAM_API_KEY` (fallback)

## Pricing

- **$0.0043/min** (~R$2.50 por hora de audio)
- $200 de credito gratis no signup em console.deepgram.com
- ~770 horas de audio com o credito gratis

## Deepgram vs Groq — Quando usar cada

| Criterio | Deepgram | Groq |
|----------|----------|------|
| Volume grande (50+ arquivos) | **Melhor** | Trava por rate limit |
| Custo zero | Nao (pago) | **Melhor** (gratis) |
| Velocidade | **~15s/hora** | ~3min/hora |
| Paralelismo | **3-5 workers** | 1 por vez |
| Qualidade pt-BR | Excelente (Nova-3) | Excelente (Whisper Large) |

## Script Location

`tools/deepgram-batch-transcribe.py`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: deepgram` | `pip3 install --break-system-packages deepgram-sdk` |
| `ffmpeg not found` | `brew install ffmpeg` |
| Timeout errors | Reduce `--workers` ou tente novamente (resume automatico) |
| File too large timeout | Tente com `--bitrate 32k` para comprimir mais |
| Transcription quality issues | Try `--no-compress` ou higher `--bitrate` |
| Script interrupted | Re-run — resume is automatic |
