#!/usr/bin/env python3
"""
Hook: Read Protection

REGRA: Arquivos protegidos DEVEM ser lidos completamente (sem limit/offset).

Este hook intercepta chamadas Read e bloqueia leitura parcial em arquivos
que requerem contexto completo para edição segura.

Exit Codes:
- 0: Permitido
- 2: Bloqueado (arquivo protegido com limit/offset)
"""

import json
import sys
import os
import fnmatch
from pathlib import Path

# =============================================================================
# CONFIGURAÇÃO: Arquivos que DEVEM ser lidos completamente
# =============================================================================

PROTECTED_PATTERNS = [
    # Configuração do Claude
    ".claude/CLAUDE.md",
    ".claude/rules/*.md",
    ".claude/settings*.json",

    # Definições de agentes
    ".aios-core/development/agents/*.md",
    ".aios-upstream/.aios-core/development/agents/*.md",

    # Documentação crítica
    "docs/mmos/ARCHITECTURE_RULES.md",
    "supabase/docs/SCHEMA.md",

    # Configuração do projeto
    "package.json",
    "tsconfig.json",
    "tsconfig.*.json",

    # Arquivos de código críticos
    "app/components/ui/icons/icon-map.ts",

    # Migrations (sempre ler completo antes de editar)
    "supabase/migrations/*.sql",
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def get_project_root():
    """Obtém o root do projeto via variável de ambiente ou cwd."""
    return os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())

def normalize_path(file_path: str, project_root: str) -> str:
    """Normaliza path para relativo ao projeto."""
    if file_path.startswith(project_root):
        return file_path[len(project_root):].lstrip("/")
    if file_path.startswith("/"):
        # Path absoluto fora do projeto
        return file_path
    return file_path

def matches_protected_pattern(relative_path: str) -> bool:
    """Verifica se o path corresponde a algum padrão protegido."""
    for pattern in PROTECTED_PATTERNS:
        if fnmatch.fnmatch(relative_path, pattern):
            return True
        # Também verificar se é substring (para paths com wildcards)
        if "*" not in pattern and pattern in relative_path:
            return True
    return False

def has_partial_read_params(tool_input: dict) -> tuple[bool, str]:
    """Verifica se a chamada Read tem parâmetros de leitura parcial."""
    limit = tool_input.get("limit")
    offset = tool_input.get("offset")

    reasons = []
    if limit is not None:
        reasons.append(f"limit={limit}")
    if offset is not None and offset != 0:
        reasons.append(f"offset={offset}")

    return len(reasons) > 0, ", ".join(reasons)

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Se não conseguir parsear, permitir (fail-open)
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Só processar Read
    if tool_name != "Read":
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    # Normalizar path
    project_root = get_project_root()
    relative_path = normalize_path(file_path, project_root)

    # Verificar se é arquivo protegido
    if not matches_protected_pattern(relative_path):
        sys.exit(0)

    # Verificar se tem parâmetros de leitura parcial
    is_partial, partial_reason = has_partial_read_params(tool_input)

    if not is_partial:
        # Leitura completa, permitir
        sys.exit(0)

    # BLOQUEAR: Tentando ler arquivo protegido parcialmente
    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛑 READ PROTECTION: Arquivo protegido deve ser lido completamente           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Arquivo: {relative_path[:58]:<58} ║
║  Problema: {partial_reason:<57} ║
║                                                                              ║
║  REGRA: Este arquivo está na lista de arquivos protegidos.                   ║
║         Arquivos protegidos DEVEM ser lidos completamente para evitar:       ║
║         - Edições com contexto incompleto                                    ║
║         - Duplicações acidentais                                             ║
║         - Breaking changes não intencionais                                  ║
║                                                                              ║
║  SOLUÇÃO: Remova os parâmetros 'limit' e 'offset' da chamada Read.           ║
║                                                                              ║
║  ✅ Read(file_path="{relative_path[:40]}")
║  ❌ Read(file_path="...", limit=100)                                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(error_message, file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
