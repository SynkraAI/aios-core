# Ralph Squad

**Autonomous Development Loop Orchestrator**

Implementa o conceito Ralph (context-fresh iterations) integrado com a inteligência do AIOS. Usa swarm de agentes especializados, scripts para economia de tokens, e memória persistente em arquivos para manter contexto entre iterações.

---

## 📚 O Conceito Ralph

### Origem e Inspiração

Ralph é uma **técnica de desenvolvimento** criada por Geoffrey Huntley que permite que a IA complete tarefas longas e complexas de forma autônoma sem degradação de qualidade. A ideia central: **contextualmente fresco a cada iteração**.

**Referência:** [Video: Ralph Wiggum LOOP](https://youtu.be/yAE3ONleUas?si=VapH_tqQmFSZNWXx)

### O Problema: Context Rot (Podridão de Contexto)

Modelos de IA como Claude sofrem de **degradação de performance** conforme a janela de contexto se enche:
- Após ~100k tokens, o modelo se torna "mais burro"
- Históricos longos causam confusão e erros acumulados
- Iterações falhas deixam "cicatrizes" no contexto que afetam tentativas futuras

### A Solução Ralph: Sessões Frescas

Para cada tarefa, Ralph inicia uma **sessão totalmente nova** com **0 tokens de contexto**:
- Cada iteração começa "pura" sem bagagem de tentativas anteriores
- Claude usa 100% de sua inteligência em cada tarefa
- A memória entre iterações fica em **arquivos** (PRD.md, progress.md), não no chat
- Garante escalabilidade infinita sem degradação

### Diferença: Script vs. Plugin AIOS

| Aspecto | Script Ralph (original) | Ralph AIOS Squad |
|--------|------------------------|------------------|
| **Sessão** | Nova instância do Claude em cada iteração | Subagents com contexto 0 via Task tool |
| **Contexto** | Sempre limpo (0 tokens) | Layer 1: subagents frescos; Layer 2: orchestrator reset |
| **Memória** | PRD.md, progress.txt | progress.md, ralph-state.yaml, story files |
| **Mecanismo** | Loop externo (sh/ps1) | Agente Ralph interno com tasks |
| **Escalabilidade** | Até 20-50 iterações | Iterações infinitas com auto-reset |

---

## 🔄 Como Funciona

### Flow de Execução

```
1. INICIAÇÃO
   ├─ Ler story/PRD (fonte de tarefas)
   ├─ Inicializar ralph-state.yaml
   └─ Inicializar progress.md

2. LOOP PRINCIPAL (ITERAÇÕES)
   ├─ Tarefa 1: Extrair próxima [ ] não completada
   ├─ Tarefa 2: Analisar tipo (code, test, architecture, etc)
   ├─ Tarefa 3: Selecionar agente AIOS apropriado
   ├─ Tarefa 4: Delegar via Task tool (CONTEXTO FRESCO!)
   ├─ Tarefa 5: Verificar resultado e marcar [x]
   ├─ Tarefa 6: Registrar learnings em progress.md
   ├─ Tarefa 7: Auto-commit (opcional)
   └─ Tarefa 8: Verificar contexto (se pesado → salvar estado + *resume)

3. ENCERRAMENTO
   ├─ Gerar relatório final
   └─ Retornar story/PRD 100% completo
```

### Dual-Layer Context Management

**Layer 1: Subagents (Contexto Fresco)**
- Cada tarefa delegada via Task tool começa com contexto zero
- Subagent recebe: tarefa + learnings acumulados + instruções AIOS
- Nenhum histórico de iterações anteriores polui o contexto
- Máxima inteligência a cada tarefa

**Layer 2: Orchestrator Reset**
- Ralph principal monitora consumo de tokens (~4-5k por iteração)
- Quando contexto atinge ~80k tokens:
  - Salva estado completo em ralph-state.yaml
  - Registra learnings em progress.md
  - Instrui `*resume` para continuar de onde parou
  - Novo orchestrator começa "limpo"

---

## 🚀 Utilizando Ralph

### Conceito

Ralph executa stories/PRDs completas de forma autônoma usando:
- **Subagents com contexto fresco** via Task tool (nunca acumula contexto)
- **Memória persistente em arquivos** (progress.md, ralph-state.yaml)
- **Scripts para operações mecânicas** (economia de ~4-5k tokens por iteração)
- **Swarm de agentes AIOS** (delega para o agente certo por tipo de tarefa)

### Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `*develop {story\|prd} [yolo\|interactive]` | Inicia loop autônomo de desenvolvimento |
| `*resume` | Retoma execução interrompida (carrega estado salvo) |
| `*report [--verbose]` | Relatório detalhado de progresso |
| `*status` | Estado rápido (one-liner) |
| `*stop` | Para o loop gracefully (salva estado antes) |
| `*config [key] [value]` | Configurações do loop |
| `*help` | Mostra todos os comandos |
| `*exit` | Sair do modo ralph |

### Exemplo de Uso

```bash
@ralph
*develop story-2.1 yolo
# → Ralph executa story 2.1 de forma autônoma até completar

@ralph
*report --verbose
# → Mostra progresso detalhado

@ralph
*resume
# → Retoma sessão interrompida do ponto exato
```

---

## 📁 Estrutura do Squad

```
squads/ralph/
├── squad.yaml                          # Manifest do squad
├── README.md                           # Este arquivo (documentação completa)
├── config/
│   ├── coding-standards.md             # Padrões de código
│   ├── tech-stack.md                   # Stack tecnológica
│   └── source-tree.md                  # Estrutura documentada
├── agents/
│   └── ralph.md                        # Definição do agente Ralph
├── tasks/
│   ├── ralph-develop.md                # Task: Loop autônomo principal
│   ├── ralph-report.md                 # Task: Relatório de progresso
│   ├── ralph-resume.md                 # Task: Retomada de execução
│   ├── ralph-status.md                 # Task: Status rápido
│   └── ralph-config.md                 # Task: Configurações
├── scripts/
│   ├── ralph-parser.js                 # Extrai próximas tarefas de stories/PRDs
│   ├── ralph-state.js                  # Serializa/deserializa estado (YAML)
│   ├── ralph-progress.js               # Append de learnings e métricas
│   └── ralph-context-monitor.js        # Estima tokens e detecta reset necessário
├── workflows/                          # (futuro: workflows multi-step)
├── checklists/                         # (futuro: checklists de validação)
├── templates/                          # (futuro: templates de documentos)
├── tools/                              # (futuro: ferramentas customizadas)
└── data/                               # (futuro: dados estáticos)
```

---

## 🧠 Context Management

### Layer 1: Subagents (Contexto Fresco)

Cada tarefa é delegada via **Task tool** para um subagent que:
- Começa com contexto **zero** (0 tokens)
- Recebe apenas: descrição da tarefa + learnings acumulados + instruções AIOS
- Descarta completamente histórico de iterações anteriores
- Usa 100% de sua inteligência na tarefa atual

### Layer 2: Orchestrator Reset

Quando Ralph principal acumula contexto pesado (~80k tokens):
1. **Verifica** via `ralph-context-monitor.js`
2. **Salva estado** em arquivos:
   - `ralph-state.yaml` - estado exato (iteração, tarefa atual, etc)
   - `progress.md` - learnings e métricas acumuladas
   - Story/PRD file - checkboxes atualizados [x]/[ ]
   - `decision-log.md` - decisões em formato ADR
3. **Para gracefully** e instrui `*resume`
4. **Nova sessão** começa "limpa" sem bagagem anterior

### Token Optimization

- **Scripts para operações mecânicas** → economiza ~4-5k tokens por iteração
- **Memória em arquivos** → nunca acumula em contexto
- **Subagents desincrustados** → cada um começa com slate limpo
- **Estimativa de savings**: 4-5k tokens economizados por iteração vs. approach tradicional

---

## 🔗 Integração com AIOS

Ralph integra com **todos os agentes AIOS**:

| Tipo de Tarefa | Agente Delegado |
|---|---|
| Implementação de código | `@dev` (Dex) |
| Testes e validação | `@qa` (Quinn) |
| Decisões de arquitetura | `@architect` (Archie) |
| Criação/gestão de stories | `@pm` / `@sm` |
| Database e ETL | `@data-engineer` |
| UI/UX | `@ux-design-expert` |
| Pesquisa e análise | `@analyst` |
| Git e deploy | `@devops` (Gage) |
| Tarefas genéricas | `@dev` (fallback) |

Ralph **nunca faz trabalho diretamente** — sempre delega ao agente especialista via Task tool.

---

## 📊 Arquivos de Estado

### ralph-state.yaml
Contém o estado exato da sessão:
```yaml
session_id: "ralph-1738720000"
source: "docs/stories/story-2.1.md"
mode: yolo
status: running|paused|completed|failed
current_iteration: 5
current_task: "Implement user authentication"
tasks_total: 12
tasks_completed: 4
tasks_failed: 0
started_at: "2025-02-05T10:00:00Z"
last_updated: "2025-02-05T10:30:00Z"
```

### progress.md
Acumula learnings entre iterações:
```markdown
# Ralph Progress - story-2.1

## Iteration 1
- Task: Setup project structure
- Agent: @dev
- Result: SUCCESS
- Learning: Project uses monorepo structure

## Iteration 2
...
```

### decision-log.md
Registra decisões em formato ADR (Architecture Decision Record):
```markdown
# ADR-1: Monorepo Structure

**Decision:** Use monorepo pattern
**Context:** Multiple related packages
**Consequences:** Simpler CI/CD
**Learning:** Discovered pattern from Iteration 1
```

---

## ⚙️ Configuração

Ralph pode ser customizado via `*config`:

| Key | Default | Descrição |
|-----|---------|-----------|
| `max_iterations` | 100 | Máximo de iterações antes de parar |
| `auto_commit` | true | Commit automático após cada tarefa |
| `mode` | yolo | Modo default: yolo ou interactive |
| `context_limit` | 80000 | Tokens antes de trigger auto-reset |
| `allowed_agents` | all | Agentes permitidos (all ou lista) |
| `retry_on_failure` | true | Retry automático em caso de falha |
| `max_retries` | 2 | Máximo de retries por tarefa |
| `commit_prefix` | "ralph:" | Prefixo para commits automáticos |

### Exemplo de Configuração

```bash
@ralph
*config max_iterations 50
*config auto_commit false
*config context_limit 100000
```

---

## 🛠️ Scripting (Advanced)

Ralph fornece **4 scripts Node.js** para integração customizada:

### 1. ralph-parser.js
Extrai tarefas de stories/PRDs:
```bash
node ralph-parser.js next <file>       # Próxima tarefa [ ]
node ralph-parser.js progress <file>   # Contagem: 8/12 completas
node ralph-parser.js mark <file> <n>   # Marca tarefa N como [x]
node ralph-parser.js list <file>       # Lista todas as tarefas
```

### 2. ralph-state.js
Gerencia estado de sessão:
```bash
node ralph-state.js init <source>      # Cria estado para nova sessão
node ralph-state.js load               # Carrega estado atual
node ralph-state.js update <key> <val> # Atualiza campo
node ralph-state.js status             # Status one-liner
```

### 3. ralph-progress.js
Rastreia progresso e learnings:
```bash
node ralph-progress.js init <source>        # Inicia progress.md
node ralph-progress.js log <iter> <task> <agent> <result> [learning]
node ralph-progress.js error <iter> <task> <msg>
node ralph-progress.js summary              # Resumo acumulado
node ralph-progress.js learnings            # Lista todos os learnings
```

### 4. ralph-context-monitor.js
Monitora consumo de contexto:
```bash
node ralph-context-monitor.js check [limit]  # Verifica se reset necessário
node ralph-context-monitor.js estimate       # Estima tokens acumulados
```

---

## 💡 Padrões e Boas Práticas

### ✅ Faça

- Use mode `yolo` para execução completamente autônoma
- Registre learnings explicitamente em cada iteração
- Configure `max_iterations` baseado no tamanho do PRD
- Use `*report --verbose` para debug detalhado
- Revise `decision-log.md` para entender escolhas feitas

### ❌ Não Faça

- ❌ Não confie em histórico da conversa para memória (use arquivos!)
- ❌ Não execute tarefas complexas sem verificar learnings anteriores
- ❌ Não configure `context_limit` muito baixo (menos de 60k)
- ❌ Não desabilite `auto_commit` sem motivo válido
- ❌ Não tente "ajudar" Ralph modificando estado manualmente

---

## 🔍 Troubleshooting

### "Context getting heavy" Warning

**Causa:** Ralph detectou contexto pesado (~80k tokens)
**Solução:** Deixe completar iteração atual, então `*resume` iniciará nova sessão

### Tasks não avançam

**Causa:** Delegação para agente errado
**Solução:** Verifique em `ralph-state.yaml` qual agente foi escolhido e `*resume`

### Progress.md não atualiza

**Causa:** Script ralph-progress.js falhou silenciosamente
**Solução:** Execute manualmente: `node ralph-progress.js log ...`

### Story/PRD checkboxes não sincronizam

**Causa:** File permissions ou formato markdown incorreto
**Solução:** Verifique que story tem formato `- [ ] Task description` exato

---

## 📖 Referências

- **Video Origem:** [Ralph Wiggum LOOP - Geoffrey Huntley](https://youtu.be/yAE3ONleUas?si=VapH_tqQmFSZNWXx)
- **Conceito:** Context-fresh iterations, dual-layer memory management
- **Inspiração:** Script Ralph original (ralph.sh, ralph.ps1)
- **Framework:** AIOS (AI-Orchestrated System)

---

## 👤 Autor

**Oximito** — criador do squad Ralph para AIOS

## 📄 Licença

MIT

---

**Last Updated:** 2025-02-05
**Version:** 1.0.0
