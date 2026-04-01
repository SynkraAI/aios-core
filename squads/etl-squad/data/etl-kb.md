# ETL Squad — Knowledge Base

## Core Principle

**O output do ETL existe para ser consumido por agentes, nao por humanos.**

Toda decisao de formato, estrutura e naming segue este principio.

## Pipeline Flow

```
source → Route → Extract → Parse → Enrich → Validate → Load → output
```

Cada fase tem um agent responsavel. Fluxo unidirecional com retry loops controlados.

## Output Decision Tree

| Tipo de conteudo | Formato | Template |
|-----------------|---------|----------|
| Texto/documento | .md com frontmatter YAML | markdown-output-tmpl.md |
| Dados tabulares (<100 registros) | .yaml com schema | yaml-output-tmpl.yaml |
| Dados tabulares (>=100 registros) | .jsonl | chunk-jsonl-tmpl.jsonl |
| Chunks para RAG | .jsonl | chunk-jsonl-tmpl.jsonl |
| Job report | .json | envelope universal |
| Batch output | diretorio/ com index.yaml | — |

## Frontmatter Fields (Markdown)

### Obrigatorios
- `source_type` — webpage, youtube, pdf, audio, image, doc, spreadsheet, feed, repo, api
- `title` — extraido ou inferido
- `extracted_at` — ISO 8601
- `language` — ISO 639-1
- `word_count` — contagem de palavras do body
- `pipeline` — nome do pipeline usado
- `job_id` — identificador unico do job

### Opcionais (quando disponiveis)
- `source_url`, `source_file` — origem
- `author`, `published_at` — metadata da fonte
- `token_estimate` — word_count * 1.3 (en) ou 1.5 (pt)
- `quality_score` — 0.0 a 1.0
- `tags`, `entities`, `topics` — enriquecimento semantico
- `chunks` — numero de chunks gerados

## Quality Scoring

| Componente | Peso | O que mede |
|-----------|------|-----------|
| Frontmatter completo | 20% | Campos obrigatorios presentes |
| Encoding limpo | 15% | UTF-8, sem corrupcao |
| Noise abaixo threshold | 20% | Conteudo util vs ruido |
| Coerencia | 20% | Texto legivel e completo |
| Length adequado | 10% | Dentro dos limites |
| Chunks validos | 15% | Estrutura correta |

**Thresholds:** pass >= 0.6, warn 0.4-0.59, fail < 0.4

## Chunking Strategies

1. **semantic** (default) — quebra em fronteiras de secao/paragrafo
2. **paragraph** — cada paragrafo = chunk, merge se muito pequeno
3. **sentence** — cada sentenca, merge ate chunk_size
4. **fixed** — janela deslizante, ultimo recurso

**Defaults:** chunk_size=500 tokens, overlap=50, min_chunk_size=100

## Extraction Fallback Chains

| Fonte | Primario | Fallback 1 | Fallback 2 |
|-------|----------|------------|------------|
| Webpage | Readability | Playwright | archive.org |
| PDF | pdfjs-dist | Tesseract OCR | Claude Vision |
| Audio | Whisper local | Deepgram API | — |
| Image | Tesseract | Claude Vision | — |
| YouTube | Transcript API | Whisper (audio) | — |

## Naming Convention

```
{pipeline}_{source-slug}_{date}.{ext}
```

Slug: lowercase, hifens, sem acentos, max 50 chars.

## Compatibility

A ETL Squad estende (nao substitui) a camada ETL nativa do AIOX:
- `extractYouTube` → youtube-to-brief oferece mais estrutura
- `fetch-page` → url-to-markdown oferece noise removal superior
- `chunkContent` → enricher oferece chunking semantico configuravel
