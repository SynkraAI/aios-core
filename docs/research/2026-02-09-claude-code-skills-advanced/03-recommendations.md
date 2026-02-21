# Recomendações: Criando Skills Avançadas

## TL;DR

Para criar skills avançadas de qualidade, siga este caminho:

1. **Estude o oficial** → [anthropics/skills](https://github.com/anthropics/skills) + [docs](https://code.claude.com/docs/en/skills)
2. **Clone exemplos** → [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
3. **Use patterns** → Fork, Dynamic Injection, Visual Output
4. **Teste iterativamente** → Edge cases, error handling

---

## Recomendação 1: Repositórios para Começar

### Nível 1 - Fundamentos
| Repositório | Por que |
|-------------|---------|
| [anthropics/skills](https://github.com/anthropics/skills) | Padrão oficial, exemplos de documento skills |
| [code.claude.com/docs/skills](https://code.claude.com/docs/en/skills) | Documentação completa e atualizada |

### Nível 2 - Exemplos Avançados
| Repositório | Por que |
|-------------|---------|
| [everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 135 agents, 35 skills, continuous learning |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Curated list bem organizada |

### Nível 3 - Especialização
| Repositório | Por que |
|-------------|---------|
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 78+ integrações com apps externos |
| [blader/Claudeception](https://github.com/blader/claude-code-continuous-learning-skill) | Continuous learning pattern |

---

## Recomendação 2: Técnicas Essenciais para Dominar

### 2.1 Dynamic Context Injection (`!`command``)

**O que é:** Executa shell commands antes de enviar para Claude.

**Quando usar:**
- Injetar dados atuais (git status, API responses)
- Carregar arquivos dinamicamente
- Preprocessar informações

**Exemplo:**
```yaml
---
name: context-aware
---

Current branch: !`git branch --show-current`
Recent commits: !`git log --oneline -5`
Modified files: !`git diff --name-only`

Now help me with: $ARGUMENTS
```

### 2.2 Fork Pattern (`context: fork`)

**O que é:** Executa skill em subagent isolado.

**Quando usar:**
- Tarefas que não precisam do histórico
- Processamento paralelo
- Sandbox para operações arriscadas

**Exemplo:**
```yaml
---
name: isolated-analysis
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

Analyze $ARGUMENTS without modifying anything.
```

### 2.3 Visual Output Generation

**O que é:** Skills que geram HTML/visualizações interativas.

**Quando usar:**
- Análise de dados
- Dependency graphs
- Code coverage reports

**Estrutura:**
```
skill/
├── SKILL.md
└── scripts/
    └── visualize.py  # Gera HTML interativo
```

### 2.4 Continuous Learning

**O que é:** Sistema que extrai padrões e gera novas skills automaticamente.

**Implementação (do everything-claude-code):**
```
/learn           → Extrai patterns da sessão
/instinct-status → Lista instincts com confidence
/evolve          → Agrupa instincts → Skill
```

### 2.5 Multi-Agent Orchestration

**O que é:** Coordenação de múltiplos subagents especializados.

**Pattern:**
```yaml
---
name: multi-review
context: fork
---

1. Spawn Security Reviewer → check vulnerabilities
2. Spawn Performance Analyst → check bottlenecks
3. Spawn TDD Guide → check test coverage
4. Aggregate findings → prioritized report
```

---

## Recomendação 3: Template para Skill Avançada

```yaml
---
# METADATA
name: advanced-skill
description: |
  What this skill does and when to use it.
  Include keywords for auto-discovery.
argument-hint: [required-arg] [optional-arg]

# INVOCATION CONTROL
disable-model-invocation: true  # User-only
# user-invocable: false         # Claude-only (uncomment if needed)

# EXECUTION CONTEXT
context: fork                   # Isolated execution
agent: Explore                  # Or: Plan, general-purpose, custom

# PERMISSIONS
allowed-tools: Read, Grep, Glob, Bash(npm test)

# LIFECYCLE HOOKS
hooks:
  PreToolUse:
    - match: "Edit|Write"
      script: "./scripts/validate.sh"
---

# Skill Name

## Context
Dynamic context injection:
- Git status: !`git status --short`
- Current branch: !`git branch --show-current`

## Task
[Clear instructions for what Claude should do]

$ARGUMENTS

## Guidelines
1. [Constraint 1]
2. [Constraint 2]
3. [Constraint 3]

## Output Format
[Expected structure of the output]

## Additional Resources
- For detailed API docs, see [reference.md](reference.md)
- For examples, see [examples.md](examples.md)
```

---

## Recomendação 4: Checklist de Qualidade

### Antes de Criar
- [ ] Skill similar já existe em squads/ ou awesome lists?
- [ ] Objetivo claro e mensurável?
- [ ] Usuário ou Claude invoca?

### Durante Criação
- [ ] Description contém keywords para auto-discovery?
- [ ] SKILL.md < 500 linhas (move resto para supporting files)?
- [ ] Tool restrictions apropriadas?
- [ ] Error handling para edge cases?

### Após Criar
- [ ] Testou invocação direta (`/skill-name`)?
- [ ] Testou auto-discovery (descrição match)?
- [ ] Testou com argumentos?
- [ ] Documentou exemplos de uso?

---

## Recomendação 5: Próximos Passos

### Para Implementar Skills
**Implementação não é escopo desta pesquisa.**

Recomendo:
- **@pm** para priorização e criação de stories
- **@dev** para implementação técnica
- **@architect** para design de patterns complexos

### Para Continuar Pesquisa
- Explorar patterns específicos de `everything-claude-code`
- Analisar integrations patterns do `ComposioHQ`
- Estudar continuous learning do `Claudeception`

---

## Sources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [anthropics/skills](https://github.com/anthropics/skills)
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
