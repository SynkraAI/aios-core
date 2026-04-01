# ETL Squad v1.1

Squad autônoma para ingerir qualquer fonte de dado e transformá-la em estruturas limpas, semânticas e prontas para consumo por agentes AIOX.

## Agents

| Agent | Tier | Role |
|-------|------|------|
| `etl-chief` | 0 | Orchestrator — classifica fonte, seleciona pipeline, coordena fluxo |
| `extractor` | 1 | Extrai conteúdo bruto (web, arquivo, API, mídia, vídeo keyframes) |
| `parser` | 1 | Transforma conteúdo bruto em markdown/YAML estruturado |
| `enricher` | 2 | Adiciona metadata, sumário, chunks, entidades, tags. Suporta enrich standalone e compile merge |
| `validator` | 2 | Quality gate — score e decisão pass/warn/fail. Valida contratos do squad |
| `loader` | 2 | Escreve output no formato e destino corretos |

## Comandos do ETL Chief

| Categoria | Comando | Descrição |
|-----------|---------|-----------|
| Core Pipeline | `*process` | Processar fonte única (pipeline completo) |
| Core Pipeline | `*batch` | Processar múltiplas fontes em paralelo |
| Compilação | `*compile` | Merge multi-source com TOC e dedup |
| Enriquecimento | `*enrich` | Enriquecer texto bruto standalone |
| Vídeo | `*extract-keyframes` | Extrair keyframes de vídeo (ffmpeg) |
| Workspace | `*workspace-preflight` | Validar workspace e dependências |
| Workspace | `*workspace-context` | Carregar routing policy |
| Validação | `*validate-contracts` | Cross-reference registry/tasks/agents |
| Jobs | `*status` | Status de jobs ativos |
| Jobs | `*retry` | Retry de job falhado |
| Geral | `*chat-mode` | Modo conversacional |
| Geral | `*help` | Listar comandos |
| Geral | `*exit` | Sair |

## Pipelines

| Pipeline | Fase | Input | Output |
|----------|------|-------|--------|
| `url-to-markdown` | 1 | URL qualquer | .md |
| `youtube-to-brief` | 1 | YouTube URL | .md (brief estruturado) |
| `pdf-to-knowledge` | 1 | .pdf | .md + .jsonl (chunks) |
| `spreadsheet-to-json` | 2 | .xlsx/.csv | .yaml (com schema) |
| `deck-to-text` | 2 | .pptx | .md (por slide) |
| `audio-to-transcript` | 2 | .mp3/.mp4 | .md (com timestamps) |
| `image-to-text` | 2 | .jpg/.png | .md (OCR ou descrição) |
| `feed-to-items` | 3 | RSS/Sitemap | .yaml (lista de items) |
| `repo-to-context` | 3 | GitHub URL | .md (contexto do repo) |
| `batch-urls` | 3 | Lista de URLs | diretório/ com index |
| `compile` | v1.1 | Múltiplas fontes processadas | .md (compilado com TOC) |
| `enrich` | v1.1 | Texto bruto | .md (com frontmatter) |
| `extract-keyframes` | v1.1 | Vídeo (.mp4/.avi/.mov) | diretório/ com .jpg + index.yaml |

## Uso

### CLI
```bash
# URL simples
aiox etl process --source "https://exemplo.com/artigo"

# Pipeline específico
aiox etl process --pipeline youtube-to-brief --source "https://youtube.com/watch?v=xxx"

# Arquivo local
aiox etl process --source ./arquivo.pdf --output json

# Batch
aiox etl batch --sources ./urls.txt --parallel 5

# Compilar múltiplas fontes
aiox etl compile --sources ./output1.md ./output2.md --title "Relatório"

# Enriquecer texto bruto
aiox etl enrich --source ./rascunho.txt

# Extrair keyframes de vídeo
aiox etl extract-keyframes --source ./video.mp4 --interval 60

# Validar workspace
aiox etl workspace-preflight

# Validar contratos
aiox etl validate-contracts
```

### Squad API
```javascript
const result = await squads.etl.process({
  source: 'https://...',
  pipeline: 'url-to-markdown',
  options: { chunkSize: 500, overlap: 50, language: 'pt' }
});
```

## Output

Todo output segue `data/output-format-spec.md`:

- **Markdown** (.md): Frontmatter YAML + body limpo, para conteúdo textual
- **YAML** (.yaml): `_meta` + `schema` + `records`, para dados estruturados
- **JSONL** (.jsonl): 1 registro/linha, para datasets grandes e vector stores
- **JSON** (.json): Envelope universal de job report

## Qualidade

Cada output passa por quality gate automático:
- Frontmatter completo (20%)
- Encoding UTF-8 limpo (15%)
- Noise ratio < 0.3 (20%)
- Coerência textual (20%)
- Length adequado (10%)
- Chunks válidos (15%)

**Threshold:** score >= 0.6 para PASS

## Dependências Externas (Opcionais)

| Tool | Comando | Necessário para |
|------|---------|-----------------|
| `ffmpeg` / `ffprobe` | `extract-keyframes` | Extração de keyframes de vídeo |
| `tesseract` | `image-to-text` | OCR de imagens |
| `whisper` | `audio-to-transcript` | Transcrição de áudio |

Todas opcionais — squad emite WARN se não instaladas.

## Estrutura

```
squads/etl-squad/
  squad.yaml (v1.1.0)
  README.md
  agents/
    etl-chief.md, extractor.md, parser.md,
    enricher.md, validator.md, loader.md
  tasks/ (16)
    url-to-markdown.md, youtube-to-brief.md, pdf-to-knowledge.md,
    spreadsheet-to-json.md, deck-to-text.md, audio-to-transcript.md,
    image-to-text.md, feed-to-items.md, repo-to-context.md, batch-urls.md,
    compile.md, enrich.md, extract-keyframes.md,
    workspace-preflight.md, workspace-context.md, validate-contracts.md
  workflows/ (3)
    wf-etl-pipeline.yaml, wf-batch-processing.yaml, wf-compile.yaml
  templates/
    markdown-output-tmpl.md, yaml-output-tmpl.yaml, chunk-jsonl-tmpl.jsonl
  checklists/
    quality-gate-checklist.md, squad-checklist.md
  data/
    etl-kb.md, output-format-spec.md, source-type-registry.yaml
```
