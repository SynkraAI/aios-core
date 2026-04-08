# YT Forge — Exemplos de Execução

## Exemplo 1: Transcrever vídeo do YouTube

**Comando:** `/yt-forge quero transcrever esse vídeo https://youtube.com/watch?v=abc123`

**Plano gerado:**

```
PLANO — YT Forge

Etapa 1: Transcrever vídeo
  Executor: Groq Transcriber
  Motivo: Grátis, suporta YouTube direto sem download
  Input: https://youtube.com/watch?v=abc123
  Output: transcrição em .md com frontmatter

Checkpoints: nenhum (execução rápida)
```

**Resultado:** Arquivo `abc123-transcription.md` com texto completo e metadados.

---

## Exemplo 2: Tutorial a partir de uma live

**Comando:** `/yt-forge quero fazer um tutorial sobre funil de vendas a partir dessa live https://youtube.com/watch?v=def456`

**Plano gerado:**

```
PLANO — YT Forge

Etapa 1: Transcrever live
  Executor: Groq Transcriber
  Motivo: Grátis, extrai legendas do YouTube em segundos
  Input: https://youtube.com/watch?v=def456
  Output: transcrição completa em .md

  ⏸️ CHECKPOINT: Revisar transcrição antes de gerar tutorial

Etapa 2: Gerar tutorial
  Executor: Tutorial Generator
  Motivo: Skill focada em garimpar trechos e montar passo a passo didático
  Input: transcrição + tema "funil de vendas"
  Output: tutorial estruturado em .md com passos, exemplos e dicas

Checkpoints: após Etapa 1 (revisar transcrição)
```

**Resultado:** Tutorial "Como Criar um Funil de Vendas" com 12 passos, exemplos da live e resumo rápido.

---

## Exemplo 3: Estruturar transcrição existente

**Comando:** `/yt-forge tenho essa transcrição ~/docs/mentoria-dia-24.md, quero ela bem editada e estruturada`

**Plano gerado:**

```
PLANO — YT Forge

Pré-condição: O Transcript Sculptor espera um diretório como input.
  O forge vai instruir o usuário a garantir que o arquivo esteja numa pasta dedicada,
  ou que aponte diretamente para o diretório pai onde a transcrição se encontra.

Etapa 1: Processar transcrição via Transcript Sculptor
  Executor: Transcript Sculptor → /transcript-sculptor:process ~/docs/mentorias/
  Motivo: Squad com 5 agentes — preserva DNA do falante (98%+), quality gates automáticos
  Input: ~/docs/mentorias/ (diretório contendo mentoria-dia-24.md)
  Output: ~/docs/mentorias-output/mentorias-masterpiece.md

Checkpoints: Transcript Sculptor tem quality gates internos (content preservation >= 98%)
```

**Resultado:** Documento editorial em `mentorias-masterpiece.md` com TOC navegável, separação por falante, zone classification e score de qualidade 9.1/10.

---

## Exemplo 4: Extrair frameworks de uma live

**Comando:** `/yt-forge quero extrair os frameworks e modelos mentais dessa live do Hormozi https://youtube.com/watch?v=ghi789`

**Plano gerado:**

```
PLANO — YT Forge

Etapa 1: Extrair frameworks
  Executor: Video Content Distillery (workflow: framework-extraction)
  Motivo: 9 agentes com metodologias reais — Cedric Chin (conhecimento tácito), Shane Parrish (mental models)
  Input: https://youtube.com/watch?v=ghi789
  Output: frameworks.yaml + knowledge-base.md

  ⏸️ CHECKPOINT: Revisar frameworks extraídos

Checkpoints: após extração (antes de armazenar na knowledge base)
```

**Resultado:** 7 frameworks identificados, 12 heurísticas, 3 mental models — tudo classificado e cross-referenciado.

---

## Exemplo 5: Conteúdo multiplataforma a partir de uma live

**Comando:** `/yt-forge quero gerar conteúdo multiplataforma a partir dessa live de 2h https://youtube.com/watch?v=jkl012`

**Plano gerado:**

```
PLANO — YT Forge

⚠️ AVISO: Pipeline pesado — 6 fases, 9 agentes, estimativa de 30-45 min de processamento.

Etapa 1: Pipeline completo via Video Content Distillery
  Executor: @content-distillery:distillery-chief *distill https://youtube.com/watch?v=jkl012
  Motivo: Pipeline de 6 fases com ingestão interna — download, transcrição, extração de frameworks,
          multiplicação (4A Framework), atomização e otimização YouTube
  Input: https://youtube.com/watch?v=jkl012
  Output:
    - frameworks.yaml (5-8 frameworks extraídos)
    - 80+ ideias de conteúdo (scored)
    - 60+ peças prontas para plataforma (carrosséis, threads, posts)
    - Calendário de conteúdo de 4 semanas

  ⏸️ CHECKPOINT 1: Após extração de frameworks (antes de multiplicar)
     → Revisar se os frameworks fazem sentido e se vale continuar

  ⏸️ CHECKPOINT 2: Após multiplicação de ideias (antes de produzir peças)
     → Revisar scoring das ideias e priorizar quais viram peças

Checkpoints: 2 (após frameworks + após multiplicação)
```

**Resultado:** 6 frameworks, 82 ideias de conteúdo, 64 peças prontas para Instagram/LinkedIn/Twitter e calendário de 4 semanas com distribuição otimizada.
