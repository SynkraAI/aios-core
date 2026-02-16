# Research: Code Intelligence Alternatives for AIOS

**Date:** 2026-02-15
**Query:** Alternativas viaveis ao Nogic MCP para os 5 gaps de code intelligence do Epic NoGIC
**Coverage:** 85/100 | Sources: 15 | Workers: 4/5

## TL;DR

O Nogic (v0.1.0) e muito imaturo para ser base de um epic de 42 pontos. O **Code Graph MCP** (25+ linguagens, open-source, 9 tools, ast-grep/tree-sitter) cobre ~90% dos gaps com zero vendor lock-in. Recomendacao: reescrever epic como provider-agnostic com Code Graph MCP como primeiro provider.

## Documents

| File | Content |
|------|---------|
| [00-query-original.md](00-query-original.md) | Pergunta original + contexto |
| [01-deep-research-prompt.md](01-deep-research-prompt.md) | Sub-queries geradas |
| [02-research-report.md](02-research-report.md) | Findings completos (15 sources) |
| [03-recommendations.md](03-recommendations.md) | Recomendacoes + decision matrix |

## Key Alternatives Found

| Tool | Type | Languages | Cost | Score |
|------|------|-----------|------|-------|
| **Code Graph MCP** | MCP Server (ast-grep) | 25+ | Free/OSS | 8.0/10 |
| **Sourcegraph MCP** | Enterprise Platform | 8 families | Enterprise $$ | 7.0/10 |
| **Semgrep** | Security + Dataflow | 10 | Community free | 8.0/10 (hybrid) |
| **Nogic** | Code Intelligence | 3 | Free (now) | 5.0/10 |
| **Custom (tree-sitter)** | Build from scratch | Any | Dev time | 5.2/10 |
