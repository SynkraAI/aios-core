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

## Manutenção

Para adicionar novo hook:

1. Criar arquivo `.claude/hooks/novo-hook.py`
2. Adicionar entrada em `.claude/settings.local.json`
3. Documentar neste README
4. Testar com casos reais

---

*Criado: 2026-01-24*
*Arquitetura: docs/architecture/claude-md-governance-system.md*
