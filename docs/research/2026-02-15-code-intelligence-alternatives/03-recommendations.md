# Recommendations: Code Intelligence para AIOS

**Date:** 2026-02-15

---

## TL;DR

O Nogic e muito imaturo (v0.1.0, closed-source, 3 linguagens, performance fraca) para ser a base de um epic de 42 pontos. A melhor alternativa e o **Code Graph MCP** (25+ linguagens, open-source, 9 tools, tree-sitter based) — cobre ~90% dos gaps do epic com zero vendor lock-in.

---

## Opcoes Viaveis (Ranked)

### Opcao A: Code Graph MCP (RECOMENDADA)

**Por que:**
- 25+ linguagens vs 3 do Nogic
- 9 tools que cobrem quase todos os gaps: find_references, find_callers, find_callees, dependency_analysis, complexity_analysis, analyze_codebase, find_definition, project_statistics
- Open source (sem vendor lock-in)
- Baseado em ast-grep (tree-sitter) — tecnologia madura
- v1.2.0 com tool guidance otimizado para LLM agents
- Performance otimizada com LRU cache para 500+ files
- JA e um MCP server — integracao direta com Claude Code

**Gap Coverage:**
| Gap | Tool do Code Graph MCP |
|-----|----------------------|
| IDS (duplicacao) | find_references + dependency_analysis |
| Brownfield (graph) | analyze_codebase + project_statistics |
| PRD/Stories (relacoes) | find_callers + find_callees + dependency_analysis |
| QA (blast radius) | find_references + complexity_analysis |
| Entity Registry (usedBy) | find_references + find_callers |

**O que FALTA vs Nogic:**
- `before_writing` (pre-creation check) → Pode ser construido como wrapper sobre find_references
- `find_similar` (semantic similarity) → Nao tem equivalente direto; grep + find_references cobre parcialmente
- `get_conventions` (naming patterns) → Pode ser construido analisando AST patterns
- `describe_project` (project overview) → analyze_codebase + project_statistics cobre

**Esforco de adaptacao do Epic:**
- NOG-1 simplifica (wrapper mais fino, ferramentas ja existem)
- NOG-2 a NOG-8 adaptam tool names mas logica similar
- Estimativa: ~30 pontos vs 42 (reducao de ~30%)

---

### Opcao B: Abordagem Hibrida (Code Graph MCP + Semgrep)

**Por que:**
- Code Graph MCP para code structure (references, dependencies, callers)
- Semgrep para security analysis + dataflow cross-file
- Dois MCPs maduros, complementares

**Vantagem extra:** Semgrep ja tem MCP nativo + dataflow analysis com 98% reducao de false positives

**Desvantagem:** Dois providers para manter, mais complexidade

---

### Opcao C: Sourcegraph MCP (Enterprise)

**Por que:** Compiler-level precision, SCIP protocol, 8 familias de linguagens

**Contra:** Enterprise pricing, overkill para AIOS como framework open source

---

### Opcao D: Custom Build (tree-sitter + tree-sitter-graph)

**Por que:** Maximo controle, zero dependencias externas

**Contra:** Esforco massivo (estimativa: 80+ pontos vs 42 do epic), reinventar roda

---

### Opcao E: Manter Nogic (Status Quo do Epic)

**Por que:** Ja tem PRD e 8 stories escritas

**Contra:**
- v0.1.0 closed-source, 3 linguagens, performance ruim
- MCP "not fully implemented" na versao atual
- Vendor lock-in em ferramenta pre-revenue
- Pricing futuro desconhecido (ARR model mencionado)
- Risk: ferramenta pode pivotar, morrer, ou ficar cara

---

## Decision Matrix

| Criterio (peso) | Nogic | Code Graph MCP | Hibrido (CG+Semgrep) | Sourcegraph | Custom Build |
|-----------------|-------|---------------|----------------------|-------------|-------------|
| Maturidade (25%) | 2/10 | 7/10 | 8/10 | 9/10 | 1/10 |
| Cobertura dos gaps (25%) | 9/10 | 7/10 | 9/10 | 9/10 | 10/10 |
| Custo/Risco (20%) | 4/10 | 9/10 | 8/10 | 3/10 | 6/10 |
| Linguagens (15%) | 3/10 | 9/10 | 9/10 | 8/10 | 9/10 |
| Esforco integracao (15%) | 6/10 | 8/10 | 6/10 | 5/10 | 2/10 |
| **TOTAL** | **5.0** | **8.0** | **8.0** | **7.0** | **5.2** |

---

## Recomendacao Final

### Para o AIOS: **Opcao A (Code Graph MCP)** como provider primario

**Acao sugerida:**
1. **Reescrever NOG-1** para abstrair o provider (nao "nogic-client", sim "code-intel-client")
2. **Implementar Code Graph MCP** como primeiro provider
3. **Manter abstraction layer** que permite trocar/adicionar providers futuros (Nogic quando amadurecer, Semgrep para security)
4. **Reduzir scope** de 42 para ~30 pontos (tools ja prontos, menos wrapper code)
5. **Eliminar risco** de vendor lock-in em ferramenta v0.1.0

### Principio mantido:
> Code Intelligence = Enhancement Layer, NOT Dependency
> Provider = Pluggable, NOT Hardcoded

---

## Next Steps

- **@pm**: Avaliar rewrite do PRD-NOGIC para provider-agnostic
- **@architect**: Desenhar abstraction layer para multi-provider
- **@dev**: PoC com Code Graph MCP (instalar + testar 9 tools no AIOS codebase)
- **@devops**: Avaliar setup do Code Graph MCP como MCP server

---

*Research v1.0 — Tech Search Pipeline*
*4 workers, 15 sources, coverage 85/100*
