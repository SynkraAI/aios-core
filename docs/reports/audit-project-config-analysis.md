# Audit Project Config — Analise Tripartida

**Data:** 2026-03-18
**Skill:** `/audit-project-config`
**Analistas:** Kaizen | @oalanicolas (Knowledge Engineering) | @pedro-valerio (Process Absolutism)

---

## Scores

| Perspectiva | Score | Veredicto |
|-------------|-------|-----------|
| Kaizen | 7.5/10 | Bom base, precisa hardening |
| Knowledge Engineering | 8.0/10 | Gaps de documentacao criticos |
| Process Absolutism | 4.2/10 | VETO: 8 wrong paths, 0 checkpoints |

---

## Consenso das 3 Perspectivas

| Criterio | Kaizen | Knowledge | Process | Consenso |
|----------|--------|-----------|---------|----------|
| Validacao profunda | Superficial | L3 ausente | 8 wrong paths | P0 BLOCKER |
| Dry-run/Preview | Ausente | Boundary clara | Bulk corruption | P0 BLOCKER |
| Path resolution | Fragil | Model OK | 3 vetos | P0 BLOCKER |
| Documentacao | Clara | Gaps P0 (3) | Spec OK | P1 FIX |
| UX/Relatorio | Bom | Health score ausente | OK | P2 ENHANCEMENT |

---

## P0 — BLOCKERS (Implementar ANTES de usar skill)

### 1. Vetos de Input + Path Safety (Process)

12 vetos necessarios, agrupados em 4 categorias:

**Input Validation:**
- VETO_1: ACTIVE.md nao existe -> HALT
- VETO_2: Table schema invalido (colunas erradas) -> HALT
- VETO_3: Zero projetos encontrados -> HALT

**Path Safety:**
- VETO_4: Modo ambiguo (link INDEX sem `.aiox/` nem `docs/projects/`) -> SKIP + WARN
- VETO_5: Path computado fora de project root esperado -> HALT
- VETO_6: Path relativo nao resolve para absoluto -> HALT

**Auto-Fix Safety:**
- VETO_7: Auto-fix sem dry-run preview -> HALT
- VETO_8: Primeiro fix falha validacao -> HALT batch
- VETO_9: Destination not writeable -> SKIP + WARN

**Subprocess Safety:**
- VETO_10: Exit code != 0 -> HALT batch
- VETO_11: Output file missing apos sucesso reportado -> ROLLBACK + HALT
- VETO_12: Output file invalido (JSON/Markdown corrompido) -> ROLLBACK + HALT

### 2. Dry-Run Obrigatorio (Kaizen + Process)

Antes de qualquer auto-fix:
1. Mostrar lista: projeto -> destination path -> tipo
2. Usuario confirma CADA path correto
3. Oferecer "corrigir 1 primeiro" antes de batch
4. Se primeiro falha -> HALT batch inteiro

### 3. Validacao settings.json Profunda (Kaizen)

Validacoes que FALTAM:
- `hooks` como array (erro fatal conhecido, ver `.claude/rules/settings-format.md`)
- Matchers incorretos (`{"tools": ["Edit"]}` em vez de `"Edit"`)
- Permissions mal formadas
- Severidade por check (CRITICAL / HIGH / MEDIUM)

### 4. Template Structure Docs (Knowledge)

Adicionar ao skill:

```markdown
## Template Structure

Templates canonicos em: `tools/templates/project-configs/`

project-configs/
  base/.claude/ (settings.json, CLAUDE.md, rules/)
  app/ (overrides para projetos tipo 'app')
  squad/ (overrides para squads)
  mind-clone/ (overrides para mind cloning)
  pipeline/
  knowledge/
  research/

Project types validos: app, squad, mind-clone, pipeline, knowledge, research
```

### 5. Placeholders Table (Knowledge)

Adicionar ao skill:

```markdown
## Placeholders Validados

| Placeholder | Exemplo (substituido) |
|-------------|----------------------|
| {{PROJECT_NAME}} | Minha App |
| {{MODE}} | HYBRID |
| {{MODE_DESCRIPTION}} | Governanca local |
| {{INDEX_PATH}} | .aiox/INDEX.md |
| {{STORIES_PATH}} | .aiox/stories/active/ |
| {{SESSIONS_PATH}} | .aiox/sessions/ |
| {{PROJECT_SLUG}} | minha-app |
| {{SAVE_LOCATION}} | .aiox/ |
```

---

## P1 — CRITICAL (Antes de v1.0)

### 6. Subprocess Error Handling (Process)

```javascript
// Padrao obrigatorio para copy-project-config.js
const { exitCode, stderr } = await exec(command);
if (exitCode !== 0) throw new VetoError('VETO_10', stderr);

const settingsPath = path.join(destination, 'settings.json');
if (!fs.existsSync(settingsPath)) throw new VetoError('VETO_11', 'arquivo nao criado');

try { JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); }
catch (e) { throw new VetoError('VETO_12', 'JSON invalido'); }
```

### 7. Validation Layer Separation (Knowledge)

Separar em 3 camadas:

**L1 Structural:** Arquivos existem?
- `.claude/` directory
- `settings.json`
- `CLAUDE.md`
- `rules/behavioral-rules.md`

**L2 Semantic:** Conteudo valido?
- settings.json tem keys obrigatorias
- CLAUDE.md sem placeholders
- behavioral-rules.md tem conteudo (>100 chars)
- hooks nao e array

**L3 Temporal:** Atualizado?
- Template version matches current (hash check)
- No deprecated patterns (old hooks format)

### 8. Mode Selection Guide (Knowledge)

Adicionar ao skill:

```markdown
## CENTRALIZED vs HYBRID

| Criterio | CENTRALIZED | HYBRID |
|----------|-------------|--------|
| Projeto vive em | aios-core/ | ~/CODE/Projects/ |
| INDEX.md em | docs/projects/{name}/ | {path}/.aiox/ |
| Use quando | Squad, mind clone, research | App full-stack, pipeline externo |
```

### 9. Placeholder Detection Context-Aware (Process)

- Ignorar `{{` dentro de code blocks (triple backtick)
- Ignorar `{{` em comentarios HTML
- Se ambiguo -> perguntar ao usuario

---

## P2 — ENHANCEMENTS (Post-v1.0)

### 10. Cache Incremental (Kaizen)

`.audit-cache.json` com hash tracking por projeto. Flag `--force` para ignorar.

### 11. Relatorio Exportavel (Kaizen)

Salvar em `docs/reports/audit-{timestamp}.md`. Symlink `LATEST.md`. Flag `--ci` com exit code.

### 12. Health Score Summary (Kaizen + Knowledge)

```
Project Health: 15/20 OK (75%)
BEFORE: 15/20 OK | AFTER: 18/20 OK | DELTA: +3 fixed
```

### 13. Before/After Diff (Kaizen + Knowledge)

Inspirado em Michael Feathers Characterization Testing. Gerar diff visual quando auto-fix e usado.

---

## Axiomas Criados

### Process (@pedro-valerio)

| ID | Nome | Principio |
|----|------|-----------|
| PV_PATH_INFERENCE | Path por heuristica | Computar path sem validar = caminho errado silencioso |
| PV_BULK_ACTION | Batch sem validacao | Operacao batch sem check individual = propagacao de erro |
| PV_USER_CHOICE_BYPASS | Escolha sem validation | User choice sem validar = bypass de seguranca |
| PV_RELATIVE_PATH_HELL | Relative path | `../` em path computation = quebra se estrutura mudar |
| PV_TABLE_PARSE_BLIND | Parse sem schema | Parse Markdown sem validar schema = campo errado usado |

### Knowledge (@oalanicolas)

| ID | Nome | Principio |
|----|------|-----------|
| AN_KE_001 | Domain Boundary via User Consent | Observer -> Actor APENAS com aprovacao explicita |
| AN_KE_002 | External Dependency Documentation | Skill depende de recurso externo? Documentar path + estrutura |
| AN_KE_003 | Implicit Knowledge Triage | Tornar explicito se usuario precisa pra entender output |
| AN_KE_004 | Validation Layer Separation | Separar Structural / Semantic / Temporal |
| AN_KE_005 | Progressive Disclosure | L0 What -> L1 Why -> L2 How -> L3 Details |
| AN_KE_006 | External Dependency Graph | Documentar graph de dependencias externas |

---

## Wrong Paths Mapeados

| ID | Input/Estado | Consequencia | Veto |
|----|-------------|--------------|------|
| WP-1 | INDEX.md em subpasta inesperada | Path .claude/ computado errado | VETO_4+5 |
| WP-2 | ACTIVE.md com colunas renomeadas | Parse extrai campo errado como path | VETO_2 |
| WP-3 | CWD diferente do esperado | Path relativo resolve em lugar errado | VETO_6 |
| WP-4 | Batch auto-fix sem preview | Bulk corruption em 15+ projetos | VETO_7 |
| WP-5 | copy-project-config.js falha | Relatorio diz "corrigido" mas nao foi | VETO_10+11 |
| WP-6 | `{{` em code block | Falso positivo (placeholder report) | Context-aware detection |
| WP-7 | behavioral-rules.md ausente | Ambiguidade: blocker ou warning? | Decision tree explicita |
| WP-8 | User seleciona projeto com path errado | Fix em lugar errado | VETO_5 por selecao |

---

## Metafora Unificada

**Kaizen:** "Checkup medico anual: hoje basico, pode ser completo com raio-X e historico"
**Knowledge:** "Medico que faz check-up mas nao explica quais exames rodou"
**Process:** "Cirurgiao sem checklist: pode operar no paciente errado sem validar antes"

**Sintese:** Skill e como medico competente (workflow claro) mas trabalhando sem equipamento adequado (validacoes), sem prontuario completo (docs), e sem protocolo de seguranca (vetos). Arriscado usar em producao sem hardening.

---

## Roadmap de Implementacao

```
Sprint 1 (3h) — BLOCKERS:
  - Vetos 1-6 (Input + Path Safety)
  - Dry-run obrigatorio
  - Validacao settings.json profunda

Sprint 2 (2h) — CRITICAL:
  - Subprocess error handling (Vetos 10-12)
  - Validation Layer Separation
  - Template Structure + Placeholders docs

Sprint 3 (1.5h) — ENHANCEMENTS:
  - Cache incremental
  - Relatorio exportavel
  - Health score + Before/After diff
```

**Esforco total estimado:** ~6.5h
**Score esperado pos-fix:** Kaizen 9.5 | Knowledge 9.2 | Process 8.5+
