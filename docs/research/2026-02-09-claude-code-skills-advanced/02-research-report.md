# Research Report: Claude Code Skills - Advanced Techniques & Repositories

## Executive Summary

Este relatório documenta as melhores técnicas de criação de Skills avançadas para Claude Code e os repositórios mais relevantes da comunidade. A pesquisa revelou um ecossistema maduro com **+66k stars** no repositório oficial da Anthropic e **+100k stars combinados** nos repositórios da comunidade.

---

## 1. Anatomia de uma Skill Avançada

### 1.1 Estrutura de Diretório

```
my-skill/
├── SKILL.md           # Main instructions (required)
├── reference.md       # Detailed API docs (loaded on demand)
├── examples.md        # Usage examples
├── templates/         # Templates for Claude to fill
│   └── output.md
└── scripts/
    └── helper.py      # Executable scripts
```

### 1.2 Frontmatter Completo

```yaml
---
name: skill-name                    # Unique identifier (required)
description: What and when         # Helps Claude decide when to use
argument-hint: [filename] [format] # Autocomplete hint
disable-model-invocation: true     # Only user can invoke
user-invocable: false              # Only Claude can invoke
allowed-tools: Read, Grep, Bash    # Tool restrictions
model: opus                        # Force specific model
context: fork                      # Run in isolated subagent
agent: Explore                     # Which agent type for fork
hooks:                             # Skill-scoped hooks
  PreToolUse: [...]
  PostToolUse: [...]
---
```

### 1.3 Substitutions Dinâmicas

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed |
| `$ARGUMENTS[N]` / `$N` | Specific argument by index |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `!`command`` | Shell preprocessing (runs before skill content) |

---

## 2. Padrões Avançados de Skills

### 2.1 Dynamic Context Injection

Executa comandos shell ANTES de enviar o conteúdo para Claude:

```yaml
---
name: pr-summary
context: fork
agent: Explore
---

## Pull Request Context
- PR diff: !`gh pr diff`
- Comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Task
Summarize this pull request...
```

**Uso:** Injetar dados atuais (git status, API responses, file contents) dinamicamente.

### 2.2 Visual Output Generation

Skills podem gerar arquivos HTML interativos:

```yaml
---
name: codebase-visualizer
allowed-tools: Bash(python *)
---

# Codebase Visualizer
Generate interactive HTML tree view of project structure.

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```
```

**Exemplo Real:** Árvore colapsável com tamanhos de arquivos, cores por tipo, e gráficos de distribuição.

### 2.3 Subagent Execution (Fork Pattern)

```yaml
---
name: deep-research
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with file references
```

**Quando usar:** Tarefas isoladas que não precisam do histórico de conversa.

### 2.4 Continuous Learning Pattern

Implementado no `everything-claude-code`:

1. **`/learn`** - Extrai padrões da sessão atual
2. **Instincts** - Armazena com confidence scores
3. **`/evolve`** - Agrupa instincts relacionados em skills reutilizáveis
4. **`/instinct-import/export`** - Compartilha entre projetos

```
Session → Pattern Extraction → Instinct (confidence: 0.8) → Cluster → Skill
```

### 2.5 Multi-Agent Orchestration

```yaml
---
name: multi-plan
disable-model-invocation: true
---

# Multi-Service Planning
Coordinate multiple subagents for complex workflows:

1. Launch Planner agent for architecture
2. Launch Security reviewer in parallel
3. Launch TDD Guide for test strategy
4. Aggregate and resolve conflicts
```

**Comandos:** `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`

### 2.6 Hook Integration

```yaml
---
name: tdd-workflow
hooks:
  PreToolUse:
    - match: "Edit|Write"
      script: "./scripts/check-tests-exist.sh"
  PostToolUse:
    - match: "Bash(npm test)"
      script: "./scripts/update-coverage.sh"
---
```

**Tipos de hooks:** `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStart`, `SubagentStop`

---

## 3. Top Repositórios para Referência

### 3.1 Oficiais

| Repositório | Stars | Descrição |
|-------------|-------|-----------|
| [anthropics/skills](https://github.com/anthropics/skills) | 66.5k | Repositório oficial - docx, pdf, pptx, xlsx skills |
| [code.claude.com/docs/skills](https://code.claude.com/docs/en/skills) | - | Documentação oficial completa |

### 3.2 Collections (Awesome Lists)

| Repositório | Stars | Destaque |
|-------------|-------|----------|
| [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 42.7k | 135 agents, 35 skills, 42 commands, continuous learning |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 33k | 78+ app integrations via MCP |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 23.2k | Curated list with 8 categories |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | 6.8k | Skills + resources focado em Claude Code |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 6.5k | 300+ skills cross-platform |

### 3.3 Toolkits & Factories

| Repositório | Stars | Destaque |
|-------------|-------|----------|
| [alirezarezvani/claude-code-skill-factory](https://github.com/alirezarezvani/claude-code-skill-factory) | 473 | Factory para gerar skills em escala |
| [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) | 119 | 135 agents, 35 skills, 42 commands, 120 plugins |
| [jezweb/claude-skills](https://github.com/jezweb/claude-skills) | 283 | Cloudflare, React, Tailwind v4 |
| [majiayu000/claude-arsenal](https://github.com/majiayu000/claude-arsenal) | 7 | 46 skills, 7 agents em múltiplas linguagens |

### 3.4 Especializados

| Repositório | Stars | Destaque |
|-------------|-------|----------|
| [blader/Claudeception](https://github.com/blader/claude-code-continuous-learning-skill) | 1.5k | Continuous learning & skill extraction |
| [abracadabra50/claude-code-voice-skill](https://github.com/abracadabra50/claude-code-voice-skill) | 153 | Voice conversations over phone |
| [meetrais/claude-agent-skills](https://github.com/meetrais/claude-agent-skills) | 9 | Default + Custom skills examples |

---

## 4. Categorias de Skills Populares

### 4.1 Development
- **TDD Workflows** - Test-driven development automation
- **Code Review** - Automated PR review patterns
- **Build Fix** - Error resolution automation
- **Refactoring** - Safe code transformation

### 4.2 Documentation
- **Changelog** - Auto-generate from commits
- **API Docs** - OpenAPI/Swagger generation
- **README** - Project documentation

### 4.3 DevOps
- **CI/CD** - Pipeline integration
- **Docker** - Container management
- **Deploy** - Production deployment workflows

### 4.4 Security
- **Code Audit** - Vulnerability detection
- **Secret Scan** - Credential leak prevention
- **OWASP** - Security checklist validation

### 4.5 Document Processing
- **DOCX** - Word document creation/editing
- **PDF** - Extract, merge, annotate
- **PPTX** - Slide generation
- **XLSX** - Spreadsheet manipulation

### 4.6 Research & Analysis
- **Deep Research** - Multi-source investigation
- **Competitive Analysis** - Market research
- **Data Analysis** - CSV/JSON processing

---

## 5. Padrões de Arquitetura

### 5.1 Invocation Control Matrix

| Frontmatter | User Invokes | Claude Invokes | Context Loading |
|-------------|--------------|----------------|-----------------|
| (default) | ✅ | ✅ | Description always, full on invoke |
| `disable-model-invocation: true` | ✅ | ❌ | Description NOT in context |
| `user-invocable: false` | ❌ | ✅ | Description always |

### 5.2 Storage Hierarchy

| Level | Path | Scope |
|-------|------|-------|
| Enterprise | Managed settings | All org users |
| Personal | `~/.claude/skills/` | All your projects |
| Project | `.claude/skills/` | This project only |
| Plugin | `<plugin>/skills/` | Where enabled |

**Precedence:** Enterprise > Personal > Project > Plugin

### 5.3 Tool Restriction Patterns

```yaml
# Read-only exploration
allowed-tools: Read, Grep, Glob

# Safe automation
allowed-tools: Read, Bash(npm test), Bash(npm run lint)

# Full power (use with caution)
allowed-tools: Read, Write, Edit, Bash
```

---

## 6. Best Practices (Anthropic Official)

### 6.1 Planning & Design
1. **Start with the outcome** - What should Claude produce?
2. **Map the process** - Break into clear steps
3. **Identify decision points** - Where does Claude need to choose?
4. **Define constraints** - What should Claude avoid?

### 6.2 Testing & Iteration
1. **Test with edge cases** - Unusual inputs
2. **Verify output format** - Consistent structure
3. **Check error handling** - Graceful failures
4. **Iterate on description** - Improve auto-discovery

### 6.3 Distribution
- **Project:** Commit `.claude/skills/` to version control
- **Plugin:** Create `skills/` in plugin directory
- **Enterprise:** Deploy via managed settings

### 6.4 Size Guidelines
- Keep `SKILL.md` under **500 lines**
- Move detailed reference to separate files
- Use progressive loading for large content

---

## 7. Ferramentas de Suporte

### 7.1 Skill Creation Tools
- **`/skill-create`** - Analyzes git history, generates SKILL.md
- **ecc.tools** - GitHub App for large repos (10k+ commits)
- **skill-factory** - Template-based generation

### 7.2 Monitoring & Analytics
- **ccflare** - Web dashboard for usage metrics
- **cchistory** - Session history browser
- **Claudex** - Full-text search of conversations

### 7.3 Orchestration
- **Claude Squad** - Terminal app for parallel agents
- **TSK** - Rust CLI with Docker sandboxing
- **crystal** - Desktop app for agent management

---

## 8. Agent Skills Open Standard

Claude Code segue o [Agent Skills](https://agentskills.io) open standard, compatível com:
- Claude Code (Anthropic)
- Cursor
- Codex (OpenAI)
- Gemini CLI
- GitHub Copilot
- Antigravity
- Windsurf
- OpenCode

Isso permite criar skills portáveis entre diferentes AI coding assistants.

---

## Sources

1. [Anthropic Official Skills Docs](https://code.claude.com/docs/en/skills)
2. [anthropics/skills Repository](https://github.com/anthropics/skills)
3. [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
4. [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
5. [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)
6. [Anthropic Complete Guide PDF](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
7. [Claude Code Skills Crash Course (YouTube)](https://www.youtube.com/watch?v=rcRS8-7OgBo)
8. [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
