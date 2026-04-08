---
name: memory-audit
description: |
  Auditoria do sistema de memória AIOS: detecta duplicatas, entradas obsoletas,
  conflitos e problemas estruturais em memory files, MEMORY.md e feedback.
  Modo --fix aplica correções com confirmação.
version: 1.0.0
category: tooling
tags: [memory, audit, cleanup]
---

# Memory Audit Skill

Auditoria completa do sistema de memória do AIOS: arquivos de memória, MEMORY.md, feedback, project context, user profiles e referências. Identifica duplicatas, entradas obsoletas, conflitos e problemas estruturais — e propõe (ou executa) correções com confirmação do usuário.

## Uso

```bash
/memory-audit                        # Auditoria completa (diagnóstico apenas)
/memory-audit --scope=global         # Apenas memórias globais (.claude/projects/)
/memory-audit --scope=project        # Apenas memória do projeto atual
/memory-audit --fix                  # Diagnóstico + correções automáticas (com confirmação)
/memory-audit --stale-days=30        # Threshold customizado para entradas obsoletas (padrão: 60)
```

---

## Description

O sistema de memória do AIOS é como um cérebro distribuído: cada projeto tem sua pasta `memory/`, existe um MEMORY.md central que funciona como índice, e feedback do usuário fica espalhado em vários arquivos. Com o tempo, esse cérebro acumula "lixo" — entradas duplicadas, feedback que já não se aplica, referências a projetos que não existem mais, e conflitos entre o que diz o feedback e o que diz o project-context.

Esta skill faz um check-up completo desse cérebro: escaneia tudo, classifica, detecta problemas e entrega um relatório com ações recomendadas. É como levar o cérebro ao médico — diagnóstico primeiro, tratamento depois (e só com autorização).

---

## When to Use

| Situação | Prioridade |
|----------|------------|
| Memória poluída — muitos arquivos, não sabe o que ainda vale | Alta |
| Suspeita de duplicatas (mesmo feedback em 2+ arquivos) | Alta |
| Entradas obsoletas (feedback de meses atrás, projetos encerrados) | Média |
| Health check periódico (1x por semana ou sprint) | Média |
| Após migração ou reestruturação de pastas | Alta |
| Antes de começar um projeto novo (garantir base limpa) | Baixa |
| MEMORY.md desatualizado (não reflete arquivos reais) | Alta |

## Do NOT Use For

| Situação | Use em vez disso |
|----------|------------------|
| Criar memórias novas | Memory Protocol (`.claude/rules/memory-protocol.md`) |
| Preencher project-context.md de projeto novo | `/new-project` ou bootstrap manual |
| Auditar ecossistema inteiro (squads, skills, tools) | `/ecosystem-audit` |
| Investigar bugs em hooks ou SessionStart | Diagnóstico manual ou `@devops` |

---

## Discovery Questions

Perguntas para fazer antes de executar. Usar AskUserQuestion tool. Pular se o usuário já forneceu contexto.

1. **Qual o escopo da auditoria? Global (todas as memórias) ou projeto específico?** — (global escaneia `.claude/projects/` + todos os projetos; projeto foca só no cwd)
2. **Quer cleanup automático ou apenas relatório diagnóstico?** — (com `--fix`, propõe e executa correções; sem, apenas reporta)
3. **Qual o threshold para considerar uma entrada "stale" (obsoleta)?** — (padrão: 60 dias sem atualização; ajustável com `--stale-days=N`)
4. **Tem projetos que foram encerrados recentemente e podem ter memória órfã?** — (ajuda a identificar memórias de projetos que não existem mais)
5. **Quer que o MEMORY.md seja regenerado automaticamente a partir dos arquivos encontrados?** — (útil quando o índice está muito desatualizado)

---

## Prerequisites

- Acesso de leitura às pastas de memória:
  - `.claude/projects/*/memory/` (memórias globais por projeto)
  - `docs/projects/*/memory/` (projetos CENTRALIZED)
  - `{project}/.aios/memory/` (projetos HYBRID)
- Acesso de leitura ao `MEMORY.md` índice central
- Para `--fix`: acesso de escrita aos arquivos de memória

---

## Phases

### Phase 1 — Scan (Inventário)

Escanear todas as pastas de memória e listar cada arquivo encontrado.

**Locais a escanear:**
- `.claude/projects/*/memory/` — memórias globais (feedback, project, reference, user)
- `.claude/projects/*/memory/MEMORY.md` — índices de memória
- `docs/projects/*/memory/` — projetos centralizados
- Projetos HYBRID detectados via `.aios/` — `{path}/.aios/memory/`

**Output desta fase:**
```
Scan completo:
- 3 pastas de memória encontradas
- 47 arquivos de memória total
- 2 MEMORY.md índices
```

### Phase 2 — Classify (Classificação)

Para cada arquivo de memória, extrair e classificar:

| Campo | Como extrair |
|-------|-------------|
| **Tipo** | Prefixo do nome: `feedback_*`, `project_*`, `reference_*`, `user_*` |
| **Data** | Campo `date:` no frontmatter YAML, ou data de modificação do arquivo |
| **Projeto** | Pasta pai (qual projeto pertence) |
| **Severidade** | Campo `severity:` no frontmatter (se existir) |
| **Agente** | Campo `agent:` no frontmatter (se existir) |
| **Relevância** | Calculada: `alta` (< 30 dias), `média` (30-60 dias), `baixa` (> 60 dias) |

**Output desta fase:**
```
Classificação:
- 18 feedback files (12 alta, 4 média, 2 baixa relevância)
- 15 project files
- 8 reference files
- 6 user files
```

### Phase 3 — Detect Issues (Detecção de Problemas)

Verificar 6 categorias de problemas:

#### 3.1 Duplicatas
- Arquivos com conteúdo similar (> 80% overlap no campo "Regra" ou "Correção")
- Mesmo tópico documentado em 2+ arquivos diferentes
- Critério: comparar `topic:` no frontmatter + corpo do arquivo

#### 3.2 Entradas Obsoletas (Stale)
- Arquivos com `date:` anterior ao threshold (padrão 60 dias)
- Feedback sobre features/projetos que não existem mais
- Referências a caminhos de arquivo que não existem

#### 3.3 Órfãos
- Arquivos listados no MEMORY.md que não existem no disco
- Arquivos no disco que não estão listados no MEMORY.md
- Memórias de projetos que foram removidos

#### 3.4 Conflitos
- Dois feedbacks que se contradizem (ex: "sempre usar X" vs "nunca usar X")
- Feedback que contradiz regra em `project-context.md`
- Detecção por keywords opostos: "sempre/nunca", "usar/evitar", "sim/não"

#### 3.5 Estruturais
- `project-context.md` ausente ou vazio (template não preenchido)
- MEMORY.md sem categorias padrão (Feedback, Project, Reference)
- Frontmatter YAML malformado ou ausente
- Arquivos sem prefixo de tipo (`feedback_`, `project_`, etc.)

#### 3.6 Qualidade
- Feedback sem campo "Regra" (não tem ação clara)
- Entradas com menos de 3 linhas de conteúdo (muito vagas)
- Texto pt-BR sem acentuação (violação do Artigo VII)

### Phase 4 — Report (Relatório)

Gerar relatório completo em `docs/reports/memory-audit-YYYY-MM-DD.md`.

**Formato do relatório:**

```markdown
# Memory Audit Report

**Data:** YYYY-MM-DD
**Escopo:** global | projeto {nome}
**Health Score:** X/100

## Métricas

| Métrica | Valor |
|---------|-------|
| Total de arquivos de memória | 47 |
| Entradas obsoletas (stale) | 5 |
| Duplicatas detectadas | 3 |
| Órfãos (índice vs disco) | 2 |
| Conflitos | 1 |
| Issues estruturais | 4 |
| Issues de qualidade | 2 |

## Health Score Breakdown

| Categoria | Peso | Score | Detalhes |
|-----------|------|-------|----------|
| Completude (index vs disco) | 25% | 22/25 | 2 órfãos |
| Frescor (% não-stale) | 25% | 20/25 | 5 stale de 47 |
| Unicidade (sem duplicatas) | 20% | 17/20 | 3 duplicatas |
| Estrutura (formatação) | 15% | 11/15 | 4 issues |
| Consistência (sem conflitos) | 15% | 13/15 | 1 conflito |

## Issues Encontrados

### P0 — Críticos (ação imediata)
1. **Conflito:** feedback_X.md diz "sempre usar Y" mas project-context.md diz "evitar Y"
   - **Ação:** Resolver manualmente — qual regra prevalece?

### P1 — Altos (corrigir esta semana)
1. **Duplicata:** feedback_copy-rules.md e feedback_copy-outreach-rules.md cobrem o mesmo tópico
   - **Ação:** Mesclar em um único arquivo
2. **Órfão:** MEMORY.md referencia `feedback_old-deploy-rules.md` que não existe
   - **Ação:** Remover entrada do MEMORY.md

### P2 — Médios (próximo ciclo)
1. **Stale:** 5 arquivos sem atualização há mais de 60 dias
   - **Ação:** Revisar relevância e arquivar ou remover

### P3 — Baixos (quando possível)
1. **Estrutural:** 2 arquivos sem frontmatter YAML
   - **Ação:** Adicionar frontmatter padrão

## Ações Recomendadas (Resumo)

- [ ] Resolver 1 conflito (P0)
- [ ] Mesclar 3 duplicatas (P1)
- [ ] Corrigir 2 órfãos no MEMORY.md (P1)
- [ ] Revisar 5 entradas stale (P2)
- [ ] Adicionar frontmatter em 2 arquivos (P3)
```

### Phase 5 — Fix (Correção com Confirmação)

Executado apenas com `--fix`. Cada categoria de correção requer confirmação:

#### Correções automáticas (seguras)
- Remover entradas do MEMORY.md que apontam para arquivos inexistentes
- Adicionar ao MEMORY.md arquivos que existem mas não estão indexados
- Adicionar frontmatter padrão em arquivos sem frontmatter
- **Confirmar antes:** "Vou corrigir X órfãos no MEMORY.md e adicionar Y arquivos ao índice. Confirma?"

#### Correções semi-automáticas (requerem revisão)
- Mesclar duplicatas (mostrar os dois arquivos, propor versão mesclada)
- Arquivar stale entries (mover para `memory/archive/`)
- **Confirmar antes:** mostrar diff de cada merge/archive

#### Correções manuais (apenas reportar)
- Conflitos entre feedback e project-context (decisão humana)
- Entradas de baixa qualidade (humano decide se expande ou remove)

---

## Métricas

| Métrica | Descrição | Cálculo |
|---------|-----------|---------|
| **Total memories** | Quantidade total de arquivos de memória | Contagem de `*.md` nas pastas de memória |
| **Stale count** | Entradas obsoletas | Arquivos com data > threshold (padrão 60 dias) |
| **Duplicate count** | Duplicatas detectadas | Pares de arquivos com > 80% overlap |
| **Orphan count** | Dessincronia índice/disco | Entradas no MEMORY.md sem arquivo + arquivos sem entrada |
| **Conflict count** | Contradições entre memórias | Pares de regras que se contradizem |
| **Health Score** | Score geral (0-100) | Média ponderada das 5 categorias |

---

## Output

- **Relatório:** `docs/reports/memory-audit-YYYY-MM-DD.md`
- **Console:** resumo com health score e contagem de issues por prioridade
- **Fix log:** se `--fix` foi usado, log de todas as correções aplicadas

**Resumo no console:**

```
Memory Audit — 2026-03-24
Health Score: 82/100
Total: 47 memórias | 5 stale | 3 duplicatas | 2 órfãos | 1 conflito
Relatório: docs/reports/memory-audit-2026-03-24.md
Próximo passo: resolver 1 conflito P0 manualmente
```

---

## Referências

- Memory Protocol: `.claude/rules/memory-protocol.md`
- Ecosystem Audit (skill complementar): `skills/ecosystem-audit/SKILL.md`
- Estrutura de memória: `.claude/CLAUDE.md` (seção Project Structure)
- Regra pt-BR: `skills/pt-br-accentuation/SKILL.md`
