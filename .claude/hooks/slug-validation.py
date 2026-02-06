#!/usr/bin/env python3
"""
Hook: Slug Validation

REGRA: Todos os slugs DEVEM usar snake_case (underscores, não hyphens).

Este hook intercepta comandos SQL que inserem/atualizam slugs e valida
o formato antes de permitir a operação.

Pattern válido: ^[a-z0-9]+(_[a-z0-9]+)*$
Exemplos válidos: jose_carlos_amorim, alan_nicolas, elon_musk
Exemplos inválidos: jose-carlos-amorim, JoseAmorim, ELON_MUSK

Exit Codes:
- 0: Permitido
- 2: Bloqueado (slug com formato inválido)
"""

import json
import sys
import re

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

# Pattern válido para slugs
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(_[a-z0-9]+)*$")

# Tabelas que têm coluna slug
TABLES_WITH_SLUG = [
    "minds",
    "contents",
    "content_projects",
    "tools",
    "drivers",
    "mapping_systems",
    "frameworks",
]

# =============================================================================
# LÓGICA DO HOOK
# =============================================================================

def extract_slug_values(command: str) -> list[tuple[str, str]]:
    """
    Extrai valores de slug de comandos SQL INSERT/UPDATE.

    Returns:
        Lista de tuplas (table, slug_value)
    """
    found = []
    command_upper = command.upper()

    for table in TABLES_WITH_SLUG:
        table_upper = table.upper()

        # Detectar INSERT INTO table (..., slug, ...) VALUES (..., 'value', ...)
        insert_pattern = rf"INSERT\s+INTO\s+{table}\s*\([^)]*\bslug\b[^)]*\)\s*VALUES\s*\(([^)]+)\)"
        insert_match = re.search(insert_pattern, command, re.IGNORECASE)
        if insert_match:
            values_str = insert_match.group(1)
            # Extrair valores entre aspas
            slug_values = re.findall(r"'([^']+)'", values_str)
            for sv in slug_values:
                # Verificar se parece um slug (não é UUID, não é número)
                if not re.match(r"^[0-9a-f-]{36}$", sv) and not sv.isdigit():
                    found.append((table, sv))

        # Detectar UPDATE table SET slug = 'value'
        update_pattern = rf"UPDATE\s+{table}\s+.*SET\s+.*\bslug\s*=\s*'([^']+)'"
        update_match = re.search(update_pattern, command, re.IGNORECASE)
        if update_match:
            found.append((table, update_match.group(1)))

    return found

def validate_slug(slug: str) -> tuple[bool, str]:
    """
    Valida se o slug está no formato correto.

    Returns:
        (is_valid, error_message)
    """
    if SLUG_PATTERN.match(slug):
        return True, ""

    errors = []

    if "-" in slug:
        errors.append("contém hyphens (use underscores)")
    if any(c.isupper() for c in slug):
        errors.append("contém maiúsculas (use lowercase)")
    if slug.startswith("_") or slug.endswith("_"):
        errors.append("começa ou termina com underscore")
    if "__" in slug:
        errors.append("contém underscores duplos")
    if not errors:
        errors.append("formato inválido")

    return False, ", ".join(errors)

def main():
    # Ler input do stdin
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Só processar Bash
    if tool_name != "Bash":
        sys.exit(0)

    command = tool_input.get("command", "")
    if not command:
        sys.exit(0)

    # Extrair slugs do comando
    slug_values = extract_slug_values(command)

    if not slug_values:
        sys.exit(0)

    # Validar cada slug
    invalid_slugs = []
    for table, slug in slug_values:
        is_valid, error = validate_slug(slug)
        if not is_valid:
            invalid_slugs.append((table, slug, error))

    if not invalid_slugs:
        sys.exit(0)

    # BLOQUEAR: Slug inválido detectado
    slug_errors = "\n".join([
        f"║    • {table}.slug = '{slug[:30]}' → {error[:30]:<30} ║"
        for table, slug, error in invalid_slugs[:5]
    ])

    # Sugerir correção
    suggestions = "\n".join([
        f"║    • '{slug}' → '{slug.lower().replace('-', '_')}'{'':>30} ║"
        for _, slug, _ in invalid_slugs[:5]
    ])

    error_message = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  🛑 SLUG VALIDATION: Formato de slug inválido                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Slugs inválidos detectados:                                                 ║
{slug_errors}
║                                                                              ║
║  REGRA: Todos os slugs DEVEM usar snake_case                                 ║
║                                                                              ║
║    Pattern válido: ^[a-z0-9]+(_[a-z0-9]+)*$                                  ║
║    ✅ jose_carlos_amorim                                                     ║
║    ✅ alan_nicolas                                                           ║
║    ❌ jose-carlos-amorim (hyphen)                                            ║
║    ❌ JoseAmorim (camelCase)                                                 ║
║                                                                              ║
║  Sugestões de correção:                                                      ║
{suggestions}
║                                                                              ║
║  POR QUÊ: Slugs inconsistentes causam falhas silenciosas no frontend.        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    print(error_message, file=sys.stderr)
    sys.exit(2)

if __name__ == "__main__":
    main()
