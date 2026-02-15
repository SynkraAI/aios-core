# Claude Code Hooks

Sistema de governança automática para regras do CLAUDE.md.

## Arquitetura

```
PreToolUse Hooks
├── Read          → read-protection.py
├── Write|Edit    → enforce-architecture-first.py
│                 → write-path-validation.py
│                 → mind-clone-governance.py
└── Bash          → sql-governance.py
                  → slug-validation.py

Stop Hooks
└── (prompt)      → handoff enforcement (settings.json)
```

## Hooks Disponíveis

### 1. read-protection.py
**Trigger:** `Read`
**Comportamento:** BLOQUEIA (exit 2)

Impede leitura parcial (`limit`/`offset`) em arquivos protegidos:
- `.claude/CLAUDE.md`
- `.claude/rules/*.md`
- `.aios-core/development/agents/*.md`
- `supabase/docs/SCHEMA.md`
- `package.json`, `tsconfig.json`
- `app/components/ui/icons/icon-map.ts`

### 2. enforce-architecture-first.py
**Trigger:** `Write|Edit`
**Comportamento:** BLOQUEIA (exit 2)

Exige documentação aprovada antes de criar código em paths protegidos:
- `supabase/functions/` → requer doc em `docs/architecture/` ou `docs/approved-plans/`
- `supabase/migrations/` → requer doc ou permite edição de arquivo existente

### 3. write-path-validation.py
**Trigger:** `Write|Edit`
**Comportamento:** AVISA (exit 0 + stderr)

Avisa quando documentos parecem estar no path errado:
- Sessions/handoffs → `docs/sessions/YYYY-MM/`
- Architecture → `docs/architecture/`
- Guides → `docs/guides/`

### 4. sql-governance.py
**Trigger:** `Bash`
**Comportamento:** BLOQUEIA (exit 2)

Intercepta comandos SQL perigosos:
- `CREATE TABLE/VIEW/FUNCTION/TRIGGER`
- `ALTER TABLE`
- `DROP TABLE/VIEW/FUNCTION`
- `CREATE TABLE AS SELECT` (backup proibido)

**Exceções permitidas:**
- `supabase migration` (CLI oficial)
- `pg_dump` (backup/export)

### 5. slug-validation.py
**Trigger:** `Bash`
**Comportamento:** BLOQUEIA (exit 2)

Valida formato snake_case em slugs:
- Pattern: `^[a-z0-9]+(_[a-z0-9]+)*$`
- ✅ `jose_carlos_amorim`
- ❌ `jose-carlos-amorim` (hyphen)
- ❌ `JoseAmorim` (camelCase)

### 6. mind-clone-governance.py
**Trigger:** `Write|Edit`
**Comportamento:** BLOQUEIA (exit 2)

Impede criação de mind clones sem DNA extraído previamente.

**O que é bloqueado:**
- Criar novo arquivo `squads/*/agents/*.md` que pareça ser um mind clone
- Mind clones = agents baseados em pessoas reais (não funcionais)

**O que NÃO é bloqueado:**
- Editar arquivos existentes (permite updates)
- Agents funcionais (identificados por sufixo):
  - `-chief`, `-orchestrator`, `-chair`
  - `-validator`, `-calculator`, `-generator`, `-extractor`, `-analyzer`
  - `-architect`, `-mapper`, `-designer`, `-engineer`
  - `tools-*`, `process-*`, `workflow-*`

**Locais de DNA verificados:**
- `squads/{pack}/data/minds/{agent_id}_dna.yaml`
- `squads/{pack}/data/minds/{agent_id}_dna.md`
- `squads/{pack}/data/{agent_id}-dna.yaml`
- `outputs/minds/{agent_id}/`

**Solução quando bloqueado:**
1. Execute o pipeline de extração de DNA: `/squad-creator` → `*collect-sources` → `*extract-voice-dna` → `*extract-thinking-dna`
2. OU se é agent funcional, renomeie com sufixo apropriado

### 7. Stop Hook: Handoff Enforcement
**Trigger:** `Stop` (quando o agente tenta encerrar sua resposta)
**Comportamento:** BLOQUEIA via prompt LLM
**Tipo:** `prompt` (não é script — configurado em `settings.json`)

Garante que um handoff seja criado sempre que houver commits/pushes na sessão.

**Como funciona:**
1. Quando o agente tenta encerrar uma resposta, o Stop hook dispara
2. Um modelo LLM analisa a conversa e verifica:
   - Se houve `git commit` ou `git push` via Bash tool
   - Se um arquivo `docs/sessions/*/handoff-*.md` foi criado via Write tool
3. Se houve commits mas **não** houve handoff → `decision='block'`
4. Se não houve commits ou handoff já existe → `decision='approve'`

**Por que Stop e não PreToolUse?**

| Tipo | Quando roda | O que resolve |
|------|------------|---------------|
| `PreToolUse` | Antes de uma tool call | Impedir ações proibidas |
| `Stop` | Quando agente encerra | Garantir obrigações pós-trabalho |

O Stop hook resolve um problema diferente: enforcement de **obrigações pós-trabalho**. Não é sobre impedir uma ação, é sobre garantir que algo foi feito antes de encerrar.

**Cenários:**
```
Sessão sem commits        → approve (sem interferência)
Commits + handoff criado  → approve (obrigação cumprida)
Commits SEM handoff       → block   (agente forçado a criar handoff)
```

---

## Exit Codes

| Code | Significado |
|------|-------------|
| 0 | Permitido (operação continua) |
| 2 | Bloqueado (operação cancelada, mostra stderr) |
| Outro | Erro não-bloqueante |

## Input Format

Hooks recebem JSON via stdin:

```json
{
  "session_id": "abc123",
  "hook_event_name": "PreToolUse",
  "tool_name": "Read",
  "tool_input": {
    "file_path": "/path/to/file",
    "limit": 100
  },
  "cwd": "/Users/alan/Code/mmos"
}
```

## Debugging

Para testar um hook manualmente:

```bash
echo '{"tool_name": "Read", "tool_input": {"file_path": ".claude/CLAUDE.md", "limit": 100}}' | python3 .claude/hooks/read-protection.py
echo $?  # Deve retornar 2 (bloqueado)
```

## Configuração

Hooks são configurados em `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/read-protection.py\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Stop Hooks (prompt-based)

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the conversation. If ANY git commits or git pushes were executed (via Bash tool with 'git commit' or 'git push' in the command), check if a handoff document was created in docs/sessions/ during this session (via Write tool creating a file matching 'docs/sessions/*/handoff-*.md'). If commits/pushes happened but NO handoff was created, return decision='block' with reason='Handoff obrigatório: crie um handoff em docs/sessions/YYYY-MM/handoff-YYYY-MM-DD-<tema>.md antes de encerrar.'. Otherwise return decision='approve'."
          }
        ]
      }
    ]
  }
}
```

---

## Manutenção

Para adicionar novo hook:

1. Criar arquivo `.claude/hooks/novo-hook.py`
2. Adicionar entrada em `.claude/settings.local.json`
3. Documentar neste README
4. Testar com casos reais

---

*Criado: 2026-01-24*
*Arquitetura: docs/architecture/claude-md-governance-system.md*
