# Ralph: Padrões e Boas Práticas

## Preparando um Story/PRD para Ralph

### Formato Correto

Ralph trabalha com stories/PRDs em Markdown com checkboxes:

```markdown
# Feature: User Authentication

Implementar sistema completo de autenticação de usuários.

## Tarefas

- [ ] Setup auth library (bcrypt ou argon2)
- [ ] Create User model with password hashing
- [ ] Implement login endpoint
- [ ] Implement registration endpoint
- [ ] Add JWT token generation
- [ ] Add token verification middleware
- [ ] Create logout endpoint
- [ ] Add unit tests for auth flows
- [ ] Add integration tests
- [ ] Update API documentation

## Acceptance Criteria

- Users can register with email and password
- Users can login and receive JWT token
- Token expires after 24 hours
- Failed login returns 401 Unauthorized
- All endpoints have tests with >80% coverage
```

### ✅ Boas Práticas ao Escrever Tasks

**DO:**
- ✅ Uma task = uma coisa específica (não "implement everything")
- ✅ Tasks são executáveis (não vague como "improve code")
- ✅ Tasks têm critério de sucesso claro (testes passam, build sucesso)
- ✅ Ordem lógica (dependências antes de dependentes)
- ✅ ~15-50 tarefas por PRD (ideal para Ralph)

**DON'T:**
- ❌ Tasks gigantescas (quebrar em tarefas menores)
- ❌ Tasks vague ("fix bugs", "make it better")
- ❌ Tasks sem critério de sucesso
- ❌ Ordem aleatória sem respeitar dependências
- ❌ >100 tarefas (muito; consider quebrar em múltiplos PRDs)

### Exemplo: PRD Well-Formed

```markdown
# Feature: Dark Mode Support

Implementar suporte completo a dark mode na aplicação.

## Tasks

- [ ] Install and configure darkmode library (tailwindcss dark mode)
- [ ] Create theme context provider (React Context API)
- [ ] Implement theme toggle component (header button)
- [ ] Apply dark mode colors to all pages
- [ ] Update CSS variables for dark theme
- [ ] Test dark mode on all device sizes
- [ ] Add localStorage persistence for theme choice
- [ ] Write E2E tests for theme switching
- [ ] Update documentation
- [ ] Deploy to staging and verify

## Acceptance Criteria

- Toggle button visible in header
- Theme persists across page reloads
- All components readable in both modes
- No contrast issues (WCAG AA standard)
- E2E tests pass
```

---

## Executando Ralph

### Inicialização Simples

```bash
@ralph
*develop docs/prd/feature-auth.md yolo
```

Ralph vai:
1. Ler o PRD
2. Encontrar primeira tarefa `[ ]`
3. Delegar para agente apropriado (@dev, @qa, etc)
4. Marcar como `[x]` quando completada
5. Continuar até todas as tarefas estarem `[x]`

### Modo Interactive

```bash
@ralph
*develop docs/prd/feature-auth.md interactive
```

Ralph pede confirmação antes de cada tarefa:
- "Continue com próxima tarefa?"
- "Aprova delegação para @dev?"
- Permite ajustes no meio da execução

### Retomando Sessão Interrompida

Se contexto ficar pesado ou você parar Ralph:

```bash
@ralph
*resume
```

Ralph:
1. Carrega ralph-state.yaml (sabe onde parou)
2. Carrega progress.md (todos os learnings até agora)
3. Continua do ponto exato sem perder progresso

---

## Monitorando Progresso

### Status Rápido

```bash
@ralph
*status
```

Output:
```
🔄 Ralph [running] iter:5 | task:"Add JWT token generation" | 4/10 (40%) | @dev | 15min elapsed
```

### Relatório Detalhado

```bash
@ralph
*report --verbose
```

Output:
```
📊 Ralph Progress Report
═══════════════════════

📋 Session: ralph-1738720000
📄 Source: docs/prd/feature-auth.md
⏱️  Started: 2025-02-05 10:00 | Elapsed: 30min

Progress: ████████░░ 8/12 tasks (67%)

✅ Completed (8):
  1. [x] Setup auth library (@dev)
  2. [x] Create User model (@dev)
  3. [x] Implement login endpoint (@dev)
  4. [x] Implement registration endpoint (@dev)
  5. [x] Add JWT token generation (@dev)
  6. [x] Add token verification middleware (@dev)
  7. [x] Create logout endpoint (@dev)
  8. [x] Add unit tests (@qa)

⏳ Pending (4):
  9. [ ] Add integration tests
  10. [ ] Update API documentation
  11. [ ] Deploy to production
  12. [ ] Monitor errors

💡 Key Learnings:
  - Auth library bcrypt is 3x slower than argon2
  - Token expiry should be 24 hours not 12
  - Database needs index on email for performance
  - Integration tests must run after unit tests

📈 Agents Used:
  @dev: 7 tasks | @qa: 2 tasks | @devops: 1 task

❌ Failed Tasks:
  - None
```

---

## Configurações Recomendadas

### Para Pequenos PRDs (5-15 tasks)

```bash
*config max_iterations 20
*config auto_commit true
*config context_limit 100000
*config mode yolo
```

### Para Médios PRDs (15-50 tasks)

```bash
*config max_iterations 100
*config auto_commit true
*config context_limit 80000
*config mode yolo
```

### Para Grandes PRDs (50+ tasks)

```bash
*config max_iterations 200
*config auto_commit true
*config context_limit 60000
*config mode interactive
# Requer mais intervenção humana
```

### Para Desenvolvimento Crítico (requer validação)

```bash
*config max_iterations 50
*config auto_commit false  # Commits manuais apenas
*config retry_on_failure true
*config max_retries 3      # Tenta 3x antes de falhar
*config mode interactive   # Sempre pede confirmação
```

---

## Learnings: O Ouro do Ralph

### Como Ralph Aprende

Cada iteração, Ralph registra **learnings** em `progress.md`:

```markdown
## Iteration 3 - Implement login endpoint

### What Worked
- Used bcrypt with saltRounds: 10
- Added request validation middleware first
- Wrote tests before implementation

### Patterns Discovered
- This codebase uses dependency injection for database
- Always check existing patterns in models/ before creating new ones

### Gotchas
- Bcrypt is slow; consider argon2 for future
- Password errors should NOT reveal if email exists (security)
- Database queries need explicit error handling

### Useful Context
- Database connection pool size: 20
- API timeout: 5000ms
- All endpoints return {status, data, errors} format
```

### Usando Learnings em Tarefas Futuras

Quando Ralph lê `progress.md` antes de próxima tarefa, consegue:
- ❌ Evitar erros anteriores
- ✅ Reutilizar padrões que funcionam
- ✅ Conhecer gotchas e armadilhas
- ✅ Entender contexto do projeto sem reler tudo

---

## Estrutura de Decisões (Decision Log)

Ralph registra decisões importantes em `decision-log.md` usando formato ADR (Architecture Decision Record):

```markdown
# ADR-1: Authentication Strategy

**Date:** 2025-02-05
**Status:** Accepted

## Context

Aplicação precisa de autenticação para usuários.
Opções: JWT, Session-based, OAuth

## Decision

Usar JWT (JSON Web Tokens) com refresh tokens.

## Rationale

- JWT é stateless (melhor para microserviços)
- Refresh tokens permitem logout (segurança)
- Compatível com mobile apps
- Comunidade larga e bem documentada

## Consequences

**Positive:**
- Simples de implementar
- Escalável horizontalmente
- Padrão da indústria

**Negative:**
- Token revocation é complexo
- Tokens podem não expirar se não forem verificados
- Storage em browser precisa ser seguro (não localStorage para sensitive)

## Alternatives Considered

1. Session-based: mais complexo, stateful
2. OAuth: muito pesado para auth interna, melhor para terceiros

## Related Issues

None

## Follow-up Actions

- [ ] Review token expiry policy after 1 month of production
- [ ] Consider token blacklist if revocation needed
```

---

## Troubleshooting e Debug

### Ralph não avança na tarefa

**Checklist:**
1. A tarefa foi delegada para o agente certo?
   - Verifique `ralph-state.yaml` → `current_task`
   - Compare com mapeamento em `agents/ralph.md`

2. Testes passam localmente?
   - Execute manualmente antes de usar Ralph

3. Há ambiguidade na task description?
   - Reescreva task mais específica

### Contexto fica pesado muito rápido

**Solução:**
```bash
*config context_limit 70000  # Mais agressivo
*resume  # Força reset
```

### Tasks marcadas [x] mas são incorretas

**Recover:**
1. Edite story/PRD manualmente: `[x]` → `[ ]`
2. Execute: `@ralph *resume`
3. Ralph detecta tarefa ainda pendente e retoma

### Aprender a desabilitar auto-commit

```bash
*config auto_commit false
# Agora Ralph pede `git add/commit` manual
# Use para validação antes de confirmar
```

---

## Casos de Uso

### Case 1: Nova Feature (Estruturada)

```
Timeline: 2-4 horas
Tarefas: 15-25
Mode: yolo
auto_commit: true

@ralph *develop docs/prd/new-feature.md yolo
# Deixa rodar até <promise>COMPLETE</promise>
```

### Case 2: Bug Complexo com Pesquisa

```
Timeline: 4-8 horas
Tarefas: 20-35
Mode: interactive
auto_commit: false

@ralph *develop docs/prd/bug-investigation.md interactive
# Revisa cada passo; commits manuais
```

### Case 3: Refactoring Crítico

```
Timeline: 8+ horas
Tarefas: 30+
Mode: interactive
max_retries: 3
auto_commit: false

@ralph *develop docs/prd/big-refactor.md interactive
# Máxima supervisão; tudo revisado
```

---

## Performance Tips

### 1. Quebrar Tasks Corretas Ganha Tempo
```
❌ RUIM: "Refactor auth system"
✅ BOM: "Extract auth validation to helper function"
✅ BOM: "Add unit tests for password validation"
✅ BOM: "Replace bcrypt calls with new helper"
```

Tarefas pequenas → mais chances de sucesso → menos retries → mais rápido

### 2. Ordem Importa

```
❌ RUIM:
- [ ] Write tests
- [ ] Implement feature
- [ ] Deploy

✅ BOM:
- [ ] Setup dependencies
- [ ] Implement feature
- [ ] Write tests
- [ ] Verify tests pass
- [ ] Deploy
```

### 3. Testes Críticos

```
SEMPRE:
- [ ] Run all tests before marking complete
- [ ] Ensure build passes
- [ ] Verify no linting errors
```

Ralph respeitará critérios de sucesso que você definir.

---

## Integrando com CI/CD

Ralph pode ser parte de pipeline:

```bash
# .github/workflows/dev.yml
- name: Run Ralph Loop
  run: |
    docker run --rm -v $(pwd):/work claude-code \
      @ralph *develop docs/prd/feature.md yolo
```

Permite que PRDs sejam executadas **automaticamente** por CI/CD com Ralph como orchestrator.

---

## Próximas Leituras

- [README.md](../README.md) - Visão geral do Ralph
- [HISTORIA.md](./HISTORIA.md) - Origem e scripts originais
- [../agents/ralph.md](../agents/ralph.md) - Definição do agente Ralph
- [../tasks/ralph-develop.md](../tasks/ralph-develop.md) - Task: develop detalhado

---

**Última Atualização:** 2025-02-05
