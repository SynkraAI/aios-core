---
name: groq-transcriber
description: >-
  Transcrição em batch de áudios usando Groq Whisper API. Auto-compressão,
  rotação de múltiplas API keys, split de arquivos grandes e resume automático.
  Use para transcrever qualquer volume de áudio de forma rápida e eficiente.
risk: safe
source: self
paths:
  - ".aios/skills/groq-transcriber/"
lazy_load: true
context_budget: 800
---

# Groq Transcriber

Skill de transcrição em batch usando a API da Groq com Whisper. Processa áudios locais com compressão automática, rotação de API keys e capacidade de resume.

## When to Use This Skill

- Transcrever áudios de cursos, palestras, mentorias, lives
- Processar batch de múltiplos arquivos de áudio
- Transcrever áudio de qualquer formato (.m4a, .wav, .mp3)
- Quando precisar de transcrição rápida sem consumir RAM/GPU local

## Do NOT Use This Skill When

- O áudio já tem transcrição (script detecta automaticamente)
- Precisa de transcrição em tempo real (streaming)
- Precisa de diarização (identificação de falantes) — use outro serviço

## Prerequisites

- Python 3.10+
- Pacote `groq` instalado: `pip3 install groq`
- `ffmpeg` instalado: `brew install ffmpeg`
- API keys configuradas em `.aios/skills/groq-transcriber/.env` (ou via variável de ambiente como fallback)

## Quick Start

```bash
# Transcrever todos os áudios em um diretório
GROQ_API_KEYS=key1,key2,key3 python3 tools/groq-batch-transcribe.py ./audios

# Sem compressão (enviar arquivo original)
python3 tools/groq-batch-transcribe.py ./audios --no-compress

# Idioma diferente
python3 tools/groq-batch-transcribe.py ./audios --language en

# Compressão mais agressiva (para uploads mais rápidos)
python3 tools/groq-batch-transcribe.py ./audios --bitrate 32k
```

## Workflow

### Phase 1: Setup

1. Verificar se `.aios/skills/groq-transcriber/.env` existe e tem keys configuradas
2. Verificar se `ffmpeg` está instalado: `which ffmpeg`
3. Verificar se `groq` está instalado: `pip3 show groq`
4. Se algum prerequisito faltar, orientar o usuário a instalar

**Veto conditions (BLOQUEIA se qualquer uma falhar):**
- `.env` não existe ou não tem `GROQ_API_KEYS` → PARAR, orientar criação do `.env`
- `ffmpeg` não instalado → PARAR, instruir `brew install ffmpeg`
- `groq` não instalado → PARAR, instruir `pip3 install groq`

**Completion criteria:** Todos os 3 prerequisitos verificados com sucesso.

### Phase 2: Scan

1. Perguntar ao usuário o diretório dos áudios (se não fornecido via `$ARGUMENTS`)
2. Verificar se o diretório existe e tem arquivos de áudio
3. Rodar o script em modo dry-run mental: calcular quantidade, tamanho, duração

**Veto conditions:**
- Diretório não existe → PARAR, pedir caminho correto
- Nenhum arquivo de áudio encontrado → PARAR, informar ao usuário

**Completion criteria:** Diretório validado com pelo menos 1 arquivo de áudio pendente.

### Phase 3: Execute

1. Rodar: `python3 tools/groq-batch-transcribe.py <directory>`
2. Monitorar output em tempo real para erros
3. Se houver rate limit em todas as keys, o script aguarda automaticamente
4. O script salva progresso — se interrompido, ao re-executar retoma de onde parou

**Veto conditions:**
- Erro de autenticação (401) → PARAR, verificar validade das API keys no `.env`
- Erro persistente (3+ falhas consecutivas) → PARAR, investigar causa

**Completion criteria:** Script finaliza com 0 erros, ou com erros parciais reportados.

### Phase 4: Validate

1. Verificar se os arquivos `.md` foram criados ao lado dos áudios
2. Spot-check: ler o início de 1-2 transcrições para validar qualidade
3. Reportar resultado final: arquivos transcritos, erros, tempo total

**Completion criteria:** Pelo menos 1 transcrição validada por leitura. Resultado reportado ao usuário.

## Features

### Auto-compressão

Antes de enviar cada arquivo para a API, o script:
- Converte para MP3 mono 16kHz a 64kbps
- Whisper usa 16kHz mono internamente, então não há perda de qualidade
- Redução típica: 80-95% do tamanho original
- Desativar com `--no-compress`

### Rotação de API keys

- Configure múltiplas keys: `GROQ_API_KEYS=key1,key2,key3`
- Quando uma key bate rate limit, rotaciona para a próxima automaticamente
- Se todas estiverem em cooldown, espera a primeira liberar
- Retrocompatível com `GROQ_API_KEY` (key única)

### Split de arquivos grandes

- Arquivos maiores que 24MB são divididos em chunks de 10 minutos
- Cada chunk é transcrito separadamente e o texto é concatenado
- Se um chunk ainda estiver grande, é re-codificado com bitrate menor

### Resume automático

- Progresso salvo em `.transcription-state.json` no diretório de áudio
- Se o script for interrompido, ao re-executar ele pula os arquivos já transcritos
- Para forçar re-transcrição, deletar o arquivo de estado

## Output Format

Cada áudio gera um `.md` com:

```markdown
# Título (nome da pasta)

> **Fonte:** arquivo-original.m4a
> **Duração:** 45min
> **Transcrição:** Groq Whisper (whisper-large-v3-turbo) | 2026-03-05

---

Texto transcrito aqui...
```

## CLI Reference

```
python3 tools/groq-batch-transcribe.py <directory> [options]

Arguments:
  directory          Directory to scan for audio files

Options:
  --no-compress      Skip auto-compression
  --bitrate BITRATE  Compression bitrate (default: 64k)
  --language LANG    Audio language (default: pt)
  -h, --help         Show help
```

## API Keys Configuration

As keys ficam em `.aios/skills/groq-transcriber/.env` (gitignored). O script carrega automaticamente deste arquivo.

```bash
# .env format:
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
```

**Prioridade de carregamento:**
1. `.aios/skills/groq-transcriber/.env` (preferido)
2. Variável de ambiente `GROQ_API_KEYS` (fallback)
3. Variável de ambiente `GROQ_API_KEY` (legado, key única)

Para adicionar/remover keys, edite o `.env` diretamente. O `.env.example` serve de referência.

## Constraints

- Maximum file size per request: 25MB (script handles splitting automatically)
- Rate limits depend on Groq tier (free ~20 req/min per key)
- Audio formats supported: `.m4a`, `.wav`, `.mp3`
- Script skips directories that already have `.md` files

## Script Location

`tools/groq-batch-transcribe.py`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: groq` | `pip3 install groq` |
| `ffmpeg not found` | `brew install ffmpeg` |
| Rate limit errors | Add more API keys via `GROQ_API_KEYS` |
| File too large after split | Reduce `--bitrate` (e.g., `32k`) |
| Transcription quality issues | Try `--no-compress` or higher `--bitrate` |
| Script interrupted | Re-run — resume is automatic |
