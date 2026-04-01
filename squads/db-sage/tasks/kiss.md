# Task: KISS Gate Analysis

| Field | Value |
|-------|-------|
| **execution_type** | `Hybrid` |
| **pattern** | EXEC-HY-001 |
| **rationale** | Worker coleta sinais e red flags; humano decide a opcao final de schema/integracao |

Executa o workflow `kiss-gate-workflow.yaml` de forma automática, sem pedir inputs ao usuário.

## Input

- `{context}` - PRD path, descrição textual, ou vazio (usa conversa)

## Execution

### STEP 1: Capturar Contexto

```
Se {context} é path de arquivo → ler arquivo
Se {context} é texto → usar diretamente
Se vazio → extrair da conversa atual
```

### STEP 2: Análise Automática do Schema

Executar queries para descobrir o que já existe:

```sql
-- Tabelas com nomes similares ao contexto
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c
        WHERE c.table_name = t.table_name) as cols
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name ILIKE '%{keyword}%';

-- Row counts das tabelas candidatas
SELECT schemaname || '.' || relname as table_name, n_live_tup as rows
FROM pg_stat_user_tables
WHERE relname ILIKE '%{keyword}%'
ORDER BY n_live_tup DESC;

-- FKs relacionadas
SELECT tc.table_name, ccu.table_name as references_table
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name ILIKE '%{keyword}%' OR ccu.table_name ILIKE '%{keyword}%');
```

### STEP 3: Preencher Campos do Workflow Automaticamente

Inferir valores para os campos do `kiss-gate-workflow.yaml`:

| Campo | Como Inferir |
|-------|--------------|
| `what_storing` | Extrair do contexto/PRD (entidade principal) |
| `how_many` | Estimar: "poucos/alguns" → 50, "milhares" → 10000, sem menção → 1000 |
| `how_often` | Inferir: "logs/eventos" → frequente, "config" → raramente |
| `who_access` | Detectar: multi-tenant → "multiple users", single app → "application" |
| `need_joins` | Analisar: menciona relacionamentos/FKs → true, dados isolados → false |

### STEP 4: Executar Lógica de Red Flags

Aplicar regras do workflow:

```
RED_FLAGS = 0

Se how_many < 100:
  → 🚩 "Poucos registros (<100) - considerar JSON/YAML"
  → RED_FLAGS++

Se who_access contém "just me" ou "single":
  → 🚩 "Usuário único - considerar SQLite local"
  → RED_FLAGS++

Se need_joins == false:
  → 🚩 "Sem relacionamentos - reconsiderar necessidade de DB"
  → RED_FLAGS++

Se tabela similar encontrada no STEP 2:
  → 🚩 "Tabela similar existe: {table_name} ({rows} rows)"
  → RED_FLAGS++
```

### STEP 5: Apresentar Diagnóstico

```markdown
## 🔍 KISS Analysis

**Contexto:** {resumo em 1 linha}

**Valores inferidos:**
- Armazenando: {what_storing}
- Volume estimado: {how_many} registros
- Frequência de mudança: {how_often}
- Acesso: {who_access}
- Relacionamentos: {need_joins ? "Sim" : "Não"}

**Schema existente relevante:**
{lista de tabelas similares encontradas ou "Nenhuma tabela similar"}

**Red Flags:** {RED_FLAGS}
{lista de red flags ou "✅ Nenhum"}

---

### Recomendação: {REUSE|EXTEND|CREATE|RECONSIDER}

{explicação em 1-2 frases}

### Opções

1. **{opção recomendada}** - {descrição}
2. **{alternativa}** - {descrição}
3. **{outra alternativa}** - {descrição}
```

### STEP 6: Aguardar Decisão

Usuário escolhe 1, 2 ou 3.

## Principle

> "Workflow executa, agente preenche, usuário decide"
