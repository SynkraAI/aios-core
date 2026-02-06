#!/usr/bin/env python3
"""
Hook: SQL Governance

REGRA: Comandos SQL que criam/alteram/deletam objetos de banco DEVEM ser aprovados.

Este hook intercepta comandos Bash que contêm SQL perigoso e bloqueia
operações não autorizadas em banco de dados.

Exit Codes:
- 0: Permitido
- 2: Bloqueado (SQL perigoso detectado)
"""

import json
import sys
import os
import re

# =============================================================================
# CONFIGURAÇÃO: Patterns SQL que requerem aprovação
# =============================================================================

DANGEROUS_PATTERNS = [
    # DDL - Criação
    (r"\bCREATE\s+TABLE\b", "CREATE TABLE"),
    (r"\bCREATE\s+VIEW\b", "CREATE VIEW"),
    (r"\bCREATE\s+MATERIALIZED\s+VIEW\b", "CREATE MATERIALIZED VIEW"),
    (r"\bCREATE\s+FUNCTION\b", "CREATE FUNCTION"),
    (r"\bCREATE\s+TRIGGER\b", "CREATE TRIGGER"),
    (r"\bCREATE\s+INDEX\b", "CREATE INDEX"),
    (r"\bCREATE\s+TYPE\b", "CREATE TYPE"),
    (r"\bCREATE\s+SCHEMA\b", "CREATE SCHEMA"),
    (r"\bCREATE\s+EXTENSION\b", "CREATE EXTENSION"),
    (r"\bCREATE\s+POLICY\b", "CREATE POLICY"),

    # DDL - Alteração
    (r"\bALTER\s+TABLE\b", "ALTER TABLE"),
    (r"\bALTER\s+VIEW\b", "ALTER VIEW"),
    (r"\bALTER\s+FUNCTION\b", "ALTER FUNCTION"),

    # DDL - Deleção
    (r"\bDROP\s+TABLE\b", "DROP TABLE"),
    (r"\bDROP\s+VIEW\b", "DROP VIEW"),
    (r"\bDROP\s+FUNCTION\b", "DROP FUNCTION"),
    (r"\bDROP\s+TRIGGER\b", "DROP TRIGGER"),
    (r"\bDROP\s+INDEX\b", "DROP INDEX"),
    (r"\bDROP\s+SCHEMA\b", "DROP SCHEMA"),
    (r"\bDROP\s+POLICY\b", "DROP POLICY"),

    # DML Perigoso
    (r"\bTRUNCATE\b", "TRUNCATE"),
    (r"\bDELETE\s+FROM\b(?!.*\bWHERE\b)", "DELETE without WHERE"),

    # Backup proibido (criar tabela como cópia)
    (r"\bCREATE\s+TABLE\b.*\bAS\s+SELECT\b", "CREATE TABLE AS SELECT (backup proibido)"),

    # Storage
    (r"\bINSERT\s+INTO\s+storage\.buckets\b", "INSERT INTO storage.buckets"),
]

# Patterns que indicam contexto seguro (não bloquear)
SAFE_CONTEXTS = [
    r"--.*$",                          # Comentário SQL
    r"SELECT\s+.*\bFROM\b",            # Query de leitura
    r"information_schema",             # Query de metadata
    r"pg_catalog",                     # Query de sistema
    r"\bEXPLAIN\b",                    # Explain plan
]

# Comandos que são sempre permitidos
ALLOWED_COMMANDS = [
    "supabase migration",              # CLI de migration
    "supabase db push",                # Push de migrations
    "supabase db pull",                # Pull de schema
    "pg_dump",                         # Backup (exportar)
    "psql.*-f.*migrations",            # Aplicar migration file
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def extract_sql_from_command(command: str) -> str:
    """Extrai possível SQL de um comando bash."""
    # Remover aspas externas se houver
    sql = command

    # Detectar SQL inline em psql -c
    psql_match = re.search(r'psql.*-c\s+["\'](.+?)["\']', command, re.DOTALL)
    if psql_match:
        sql = psql_match.group(1)

    # Detectar heredoc
    heredoc_match = re.search(r'<<["\']?(\w+)["\']?\s*\n(.+?)\n\1', command, re.DOTALL)
    if heredoc_match:
        sql = heredoc_match.group(2)

    return sql.upper()

def is_safe_context(command: str) -> bool:
    """Verifica se o comando está em contexto seguro."""
    command_lower = command.lower()

    for allowed in ALLOWED_COMMANDS:
        if re.search(allowed, command_lower):
            return True

    return False

def detect_dangerous_sql(command: str) -> list[tuple[str, str]]:
    """Detecta patterns SQL perigosos no comando."""
    sql = extract_sql_from_command(command)
    detected = []

    for pattern, description in DANGEROUS_PATTERNS:
        if re.search(pattern, sql, re.IGNORECASE):
            detected.append((pattern, description))

    return detected

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Se não conseguir parsear, permitir (fail-open)
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Só processar Bash
    if tool_name != "Bash":
        sys.exit(0)

    command = tool_input.get("command", "")
    if not command:
        sys.exit(0)

    # Verificar se é contexto seguro
    if is_safe_context(command):
        sys.exit(0)

    # Detectar SQL perigoso
    dangerous = detect_dangerous_sql(command)

    if not dangerous:
        sys.exit(0)

    # BLOQUEAR: SQL perigoso detectado
    detected_list = "\n".join([f"║    • {desc:<64} ║" for _, desc in dangerous[:5]])

    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛑 SQL GOVERNANCE: Operação de banco requer aprovação                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Operações detectadas:                                                       ║
{detected_list}
║                                                                              ║
║  REGRA: Comandos que criam/alteram/deletam objetos de banco DEVEM:           ║
║                                                                              ║
║    1. Ser propostos ao usuário ANTES de executar                             ║
║    2. Incluir justificativa e análise de impacto                             ║
║    3. Aguardar aprovação explícita                                           ║
║                                                                              ║
║  EXCEÇÕES PERMITIDAS:                                                        ║
║    • supabase migration (CLI oficial)                                        ║
║    • pg_dump (backup/export)                                                 ║
║    • Aplicar migrations existentes em supabase/migrations/                   ║
║                                                                              ║
║  AÇÃO: Proponha as mudanças ao usuário e aguarde aprovação.                  ║
║        Use o formato: Schema/SQL + Justificativa + Impacto                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(error_message, file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
