# YouTube Captions

Extrai legendas/captions do YouTube em segundos (sem baixar audio). Output .md pronto para `/etl-universal-converter`.

## Uso

```bash
# Video unico
python tools/youtube-captions/youtube_captions.py "https://youtube.com/watch?v=xxx" -o ~/transcripts/

# Playlist inteira
python tools/youtube-captions/youtube_captions.py --playlist "https://youtube.com/playlist?list=xxx" -o ~/transcripts/

# Idioma especifico
python tools/youtube-captions/youtube_captions.py "URL" -l en -o ~/transcripts/

# Output JSON
python tools/youtube-captions/youtube_captions.py "URL" --format json -o ~/transcripts/
```

## Search Mode

Busca automaticamente os top vídeos de uma pessoa no YouTube (canal próprio + participações em podcasts, entrevistas, palestras) e extrai legendas.

**Requisito:** YouTube Data API v3 key ([obter aqui](https://console.cloud.google.com/apis/credentials)).

```bash
# Buscar top 100 vídeos com +10min de duração
python tools/youtube-captions/youtube_captions.py \
  --search "Naval Ravikant" \
  --max 100 \
  --min-duration 600 \
  -o squads/mind-cloning/minds/naval-ravikant/sources/transcripts/

# Buscar top 50 vídeos com +5min
python tools/youtube-captions/youtube_captions.py \
  --search "Leandro Ladeira" --max 50 --min-duration 300 -o ~/transcripts/

# Usando API key via flag (alternativa ao env var)
python tools/youtube-captions/youtube_captions.py \
  --search "Tim Ferriss" --api-key YOUR_KEY -o ~/transcripts/
```

**API Key:** via env `YOUTUBE_API_KEY` (recomendado) ou flag `--api-key`.

**Argumentos do search mode:**

| Flag | Default | Descrição |
|------|---------|-----------|
| `--search QUERY` | — | Termo de busca (nome da pessoa) |
| `--max N` | 100 | Máximo de vídeos a buscar |
| `--min-duration S` | 600 | Duração mínima em segundos (600 = 10min) |
| `--api-key KEY` | env var | YouTube Data API v3 key |

**Output do search mode:**

```
output_dir/
├── _INDEX.md                    # Tabela com todos os vídeos extraídos
├── _search_manifest.yaml        # Metadados da busca (totais, skips)
├── naval-ravikant-joe-rogan.md
├── naval-ravikant-tim-ferriss.md
└── ...
```

**Quota:** API grátis permite 10.000 units/dia (~50 buscas de 100 vídeos/dia).

## Prioridade de Legendas

1. Legendas manuais > auto-geradas
2. Idioma: pt-BR > pt > en > en-US > es

## Output

Arquivo .md com frontmatter:

```yaml
---
title: "Titulo do Video"
channel: "Nome do Canal"
date: "2024-01-15"
language: "pt-BR"
subtitle_type: "manual"
duration: "00:15:30"
source_url: "https://www.youtube.com/watch?v=xxx"
source_type: youtube_captions
word_count: 2450
extracted_at: "2026-03-13 10:00"
---
```

## Fluxo Completo

```
youtube_captions.py <url> -o ~/transcripts/     # Segundos
/etl-universal-converter *convert ~/transcripts/video.md  # Decupagem
```

## Requisitos

- Python 3.10+
- yt-dlp (`pip install yt-dlp`)
- YouTube Data API v3 key (apenas para search mode)
