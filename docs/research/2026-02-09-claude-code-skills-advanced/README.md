# Claude Code Skills - Advanced Techniques & Repositories

> Deep Research: Melhores técnicas de criação de SKILLS avançadas e repositórios para referência.

**Data:** 2026-02-09
**Status:** Completo
**Coverage Score:** 92% (HIGH)

---

## TL;DR

### Top 5 Repositórios para Mapear

| # | Repositório | Stars | Destaque |
|---|-------------|-------|----------|
| 1 | [anthropics/skills](https://github.com/anthropics/skills) | 66.5k | **Oficial** - Padrão de referência |
| 2 | [everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 42.7k | 135 agents, continuous learning |
| 3 | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 33k | 78+ app integrations |
| 4 | [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 23.2k | Curated list, 8 categories |
| 5 | [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 6.8k | Skills focado em Claude Code |

### Top 5 Técnicas Avançadas

1. **Dynamic Context Injection** - `!`command`` para preprocessar dados
2. **Fork Pattern** - `context: fork` para execução isolada
3. **Visual Output** - Scripts que geram HTML interativo
4. **Continuous Learning** - Auto-extração de patterns → skills
5. **Multi-Agent Orchestration** - Coordenação de subagents paralelos

---

## Arquivos desta Pesquisa

| Arquivo | Conteúdo |
|---------|----------|
| [00-query-original.md](00-query-original.md) | Pergunta + contexto inferido |
| [01-deep-research-prompt.md](01-deep-research-prompt.md) | Sub-queries e sources |
| [02-research-report.md](02-research-report.md) | **Relatório completo** |
| [03-recommendations.md](03-recommendations.md) | **Recomendações práticas** |

---

## Quick Links

### Documentação Oficial
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Anthropic Complete Guide (PDF)](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
- [Agent Skills Open Standard](https://agentskills.io)

### Tutoriais
- [Claude Code Skills Crash Course (YouTube)](https://www.youtube.com/watch?v=rcRS8-7OgBo)
- [How to Create Claude Code Skills (YouTube)](https://www.youtube.com/watch?v=erkzROBDEFY)

### Repositórios Especializados
- [claude-code-skill-factory](https://github.com/alirezarezvani/claude-code-skill-factory) - Factory para gerar skills
- [Claudeception](https://github.com/blader/claude-code-continuous-learning-skill) - Continuous learning

---

## Estrutura de Skill Avançada

```yaml
---
name: skill-name
description: What and when to use
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
disable-model-invocation: true
---

# Dynamic Context
- Status: !`git status --short`

# Instructions
[Clear task description]

$ARGUMENTS
```

---

## Próximos Passos

**Para implementar skills baseadas nesta pesquisa:**
- Acionar **@pm** para priorização
- Acionar **@dev** para execução técnica

A documentação completa está nesta pasta para referência.
