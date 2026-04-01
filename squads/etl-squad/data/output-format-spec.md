# Output Format Spec — ETL Squad

## Filosofia

**O output do ETL existe para ser CONSUMIDO por agentes, nao por humanos.**

Isso significa:
- Estrutura previsivel > prosa bonita
- Metadata SEMPRE presente > inferir depois
- Frontmatter YAML em todo .md > parsear headers
- Um arquivo por unidade semantica > monolitos

---

## 1. Formato Markdown (.md) — Padrao Universal

### Quando usar
- Conteudo textual de qualquer fonte (web, PDF, docs, transcricoes)
- Output padrao quando nenhum formato especifico eh solicitado
- Consumo por agentes que processam texto natural

### Estrutura obrigatoria

```markdown
---
source_type: webpage | youtube | pdf | audio | image | doc | spreadsheet | feed | repo | api
source_url: "https://..."
source_file: "./path/to/file.pdf"
title: "Titulo extraido ou inferido"
author: "Autor quando disponivel"
published_at: "2025-01-15T00:00:00Z"
extracted_at: "2025-03-05T14:30:00Z"
language: pt
word_count: 1200
token_estimate: 1800
quality_score: 0.87
tags: [branding, estrategia, posicionamento]
entities:
  people: [Philip Kotler, Seth Godin]
  companies: [Nike, Apple]
  products: []
topics: [marketing estrategico, brand positioning]
chunks: 5
pipeline: url-to-markdown
job_id: etl_abc123
---

# {Titulo}

> **Sumario:** Resumo de 2-3 frases do conteudo completo.

---

## {Secao 1}

Conteudo limpo, sem HTML, sem navegacao, sem ads.
Paragrafos preservados. Links inline preservados como [texto](url).

## {Secao 2}

Tabelas preservadas em formato markdown:

| Coluna A | Coluna B |
|----------|----------|
| valor 1  | valor 2  |

---

<!-- ETL_METADATA
chunks_generated: 5
noise_ratio: 0.12
extraction_method: readability
processing_time_ms: 2340
-->
```

### Regras de formatacao

| Regra | Detalhe |
|-------|---------|
| Frontmatter | YAML valido, SEMPRE presente, campos nulos = omitir |
| Titulo | H1 unico no inicio do body |
| Secoes | H2 para secoes principais, H3 para sub-secoes |
| Listas | Preservar listas originais, normalizar bullets para `-` |
| Links | Inline `[texto](url)`, nunca reference-style |
| Imagens | `![alt](url)` com alt descritivo, nunca vazio |
| Tabelas | GFM tables, header obrigatorio |
| Code blocks | Com language tag: ```python |
| Citacoes | `> ` blockquote |
| Separadores | `---` entre secoes principais |
| Encoding | UTF-8, sem BOM |
| Line endings | LF (unix) |
| Max line length | Sem limite (soft wrap) |
| Trailing whitespace | Nenhum |
| Final newline | Sempre |

### Anti-patterns de .md

- NAO incluir HTML tags no output (exceto comentarios ETL_METADATA)
- NAO incluir navegacao, menus, footers, sidebars, ads
- NAO incluir scripts ou styles
- NAO duplicar conteudo
- NAO incluir boilerplate "Subscribe to newsletter", "Share this"
- NAO usar headers para enfase (H4+ so quando hierarquia real)

---

## 2. Formato YAML (.yaml) — Dados Estruturados

### Quando usar
- Dados com schema definido (configs, registros, metadata)
- Output de spreadsheets quando estrutura > texto
- Registros de entidades extraidas
- Configuracoes e parametros

### Estrutura obrigatoria

```yaml
# ETL Output: {source_description}
# Pipeline: {pipeline_name}
# Extracted: {timestamp}

_meta:
  source_type: spreadsheet
  source_file: "./dados.xlsx"
  extracted_at: "2025-03-05T14:30:00Z"
  pipeline: spreadsheet-to-json
  job_id: etl_xyz789
  quality_score: 0.92
  record_count: 45

schema:
  columns:
    - name: empresa
      type: string
      nullable: false
    - name: receita_anual
      type: number
      format: currency_brl
      nullable: true
    - name: fundacao
      type: date
      format: "YYYY-MM-DD"
      nullable: true

records:
  - empresa: "Acme Corp"
    receita_anual: 15000000
    fundacao: "2010-03-15"
  - empresa: "Beta Inc"
    receita_anual: null
    fundacao: "2018-07-01"
```

### Regras YAML

| Regra | Detalhe |
|-------|---------|
| `_meta` block | SEMPRE primeiro, prefixo underscore |
| `schema` block | Quando dados tabulares, descrever colunas |
| Strings | Aspas duplas quando contem `:` ou caracteres especiais |
| Nulls | `null` explicito, nunca string vazia |
| Datas | ISO 8601: `"2025-03-05T14:30:00Z"` |
| Numeros | Sem separador de milhar, ponto decimal |
| Listas | Formato flow `[a, b]` para <5 items, block para >=5 |
| Comentarios | Header com source info, nunca inline |
| Indentacao | 2 espacos |
| Max nesting | 4 niveis |

---

## 3. Formato JSON (.json / .jsonl) — Interoperabilidade

### Quando usar .json
- API responses
- Dados complexos com nesting profundo
- Consumo programatico direto

### Quando usar .jsonl (JSON Lines)
- Datasets grandes (>100 registros)
- Streaming / processamento incremental
- Vector store ingestion
- Cada linha = 1 registro independente

### Envelope universal (todo job retorna isso)

```json
{
  "job_id": "etl_abc123",
  "status": "success",
  "source": {
    "type": "url",
    "subtype": "webpage",
    "original": "https://exemplo.com/artigo",
    "accessed_at": "2025-03-05T14:30:00Z"
  },
  "pipeline_used": "url-to-markdown",
  "content": {
    "format": "markdown",
    "body": "---\ntitle: ...\n---\n\n# Titulo\n\nConteudo...",
    "chunks": [
      {
        "id": "chunk_001",
        "text": "...",
        "token_count": 480,
        "section": "Introducao",
        "position": 0
      }
    ],
    "summary": "Resumo de 2-3 frases.",
    "word_count": 1200,
    "token_estimate": 1800
  },
  "metadata": {
    "title": "Titulo do artigo",
    "author": "Autor",
    "published_at": "2025-01-15",
    "language": "pt",
    "tags": ["branding"],
    "entities": {
      "people": ["Philip Kotler"],
      "companies": ["Nike"],
      "products": []
    },
    "topics": ["marketing estrategico"]
  },
  "quality": {
    "score": 0.87,
    "issues": [],
    "noise_ratio": 0.12
  },
  "performance": {
    "duration_ms": 2340,
    "stages": {
      "extract": 1200,
      "parse": 450,
      "enrich": 500,
      "validate": 90,
      "load": 100
    }
  }
}
```

---

## 4. Formato de Chunks — Para RAG / Vector Store

### Estrutura por chunk

```json
{
  "id": "etl_abc123_chunk_003",
  "text": "Conteudo limpo do chunk...",
  "metadata": {
    "source_url": "https://...",
    "source_title": "Titulo",
    "section": "Secao 2 > Subsecao 2.1",
    "position": 3,
    "total_chunks": 12,
    "language": "pt",
    "extracted_at": "2025-03-05T14:30:00Z"
  },
  "token_count": 487
}
```

### Regras de chunking

| Parametro | Default | Range |
|-----------|---------|-------|
| `chunk_size` | 500 tokens | 200-2000 |
| `chunk_overlap` | 50 tokens | 0-200 |
| `strategy` | semantic | semantic, paragraph, sentence, fixed |
| `respect_sections` | true | Nunca quebrar no meio de secao se possivel |
| `min_chunk_size` | 100 tokens | Chunks menores sao merged |

### Estrategias de chunking

- **semantic**: Quebra em fronteiras semanticas (paragrafos, secoes). PREFERIDO.
- **paragraph**: Cada paragrafo = 1 chunk. Merge se < min_chunk_size.
- **sentence**: Cada sentenca. Merge ate atingir chunk_size.
- **fixed**: Janela deslizante fixa. Ultimo recurso.

---

## 5. Formatos Especializados

### YouTube Brief (.md)

```markdown
---
source_type: youtube
video_id: "dQw4w9WgXcQ"
title: "Titulo do Video"
channel: "Nome do Canal"
duration_seconds: 1234
published_at: "2025-01-15T00:00:00Z"
chapters: true
language: pt
transcript_method: youtube_api | whisper
---

# {Titulo do Video}

> **Canal:** {Nome do Canal} | **Duracao:** 20:34 | **Publicado:** 15 Jan 2025

## Sumario Executivo

Resumo de 3-5 frases cobrindo os pontos principais.

## Capitulos

### [00:00] Introducao
Conteudo do capitulo...

### [05:23] Tema Principal
Conteudo do capitulo...

## Transcricao Completa

<details>
<summary>Expandir transcricao (1.200 palavras)</summary>

[00:00] Texto da transcricao com timestamps...
[00:15] Continuacao...

</details>

## Insights Chave

- Insight 1
- Insight 2
- Insight 3
```

### Spreadsheet (.yaml)

Schema + records conforme secao 2 acima.

### Presentation/Deck (.md)

```markdown
---
source_type: presentation
source_file: "./deck.pptx"
slide_count: 15
has_notes: true
---

# {Titulo da Apresentacao}

## Slide 1: {Titulo do Slide}

{Conteudo textual do slide}

> **Notas do apresentador:** {notas se existirem}

---

## Slide 2: {Titulo}

{Conteudo}

| Dado | Valor |
|------|-------|
| ...  | ...   |
```

### Audio Transcript (.md)

```markdown
---
source_type: audio
source_file: "./podcast.mp3"
duration_seconds: 3600
speakers: [Speaker A, Speaker B]
transcript_method: whisper
whisper_model: base
language: pt
---

# Transcricao: {Titulo}

> **Duracao:** 1:00:00 | **Speakers:** 2 | **Metodo:** Whisper base

## Sumario

Resumo de 3-5 frases.

## Transcricao

**[00:00] Speaker A:** Texto falado...

**[00:15] Speaker B:** Resposta...

**[02:30] Speaker A:** Continuacao...
```

---

## 6. Decisao de Formato — Flowchart

```
Input recebido
  |
  +-- E texto/documento?
  |     +-- SIM --> .md com frontmatter YAML
  |
  +-- E dado tabular/estruturado?
  |     +-- < 100 registros --> .yaml com schema
  |     +-- >= 100 registros --> .jsonl (1 registro/linha)
  |
  +-- E para vector store / RAG?
  |     +-- SIM --> .jsonl de chunks
  |
  +-- E resposta de API?
  |     +-- SIM --> .json (envelope universal)
  |
  +-- E batch de multiplas fontes?
        +-- SIM --> pasta/ com 1 arquivo por fonte + index.yaml
```

---

## 7. Convencoes de Naming

### Arquivos de output

```
{pipeline}_{source-slug}_{date}.{ext}

Exemplos:
url-to-markdown_artigo-sobre-branding_2025-03-05.md
youtube-to-brief_palestra-kotler_2025-03-05.md
pdf-to-knowledge_relatorio-anual-2024_2025-03-05.md
spreadsheet-to-json_base-clientes_2025-03-05.yaml
batch-urls_pesquisa-concorrentes_2025-03-05/index.yaml
```

### Slugs
- Lowercase, hifens, sem acentos
- Max 50 caracteres
- Derivado do titulo quando possivel

---

## 8. Checklist de Qualidade do Output

Antes de entregar qualquer arquivo:

- [ ] Frontmatter/`_meta` presente e completo
- [ ] Encoding UTF-8, sem BOM, LF line endings
- [ ] Sem HTML residual no body
- [ ] Sem conteudo duplicado
- [ ] Sem boilerplate (nav, footer, ads, subscribe)
- [ ] Titulo presente (H1 em .md, `title` em YAML/JSON)
- [ ] `quality_score` >= 0.6
- [ ] `noise_ratio` <= 0.3
- [ ] Chunks respeitam fronteiras semanticas
- [ ] Links preservados e funcionais
- [ ] Tabelas formatadas corretamente
- [ ] Arquivo termina com newline
