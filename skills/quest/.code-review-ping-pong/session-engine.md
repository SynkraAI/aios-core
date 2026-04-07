# Ping-Pong Session — Engine Docs

## Scope
- files:
  - SKILL.md
  - engine/ceremony.md
  - engine/checklist.md
  - engine/guide.md
  - engine/scanner.md
  - engine/xp-system.md

## Goals
- Consistência entre módulos: contratos (§ refs) existem e são recíprocos?
- Clareza: um LLM consegue executar cada seção sem ambiguidade?
- Visual consistency: progress bars, ícones e templates usam o mesmo estilo em todos os módulos
- Edge cases: todos os módulos tratam campos opcionais ausentes (fallback documentado?)
- Dependency graph: sem dependências circulares não documentadas
- Voice rules: guide.md §1 não tem erros de template
- XP naming: condition names não confundem pack authors

## Constraints
- Não alterar a arquitetura geral (5 módulos + SKILL.md orquestrador)
- Não modificar packs ou dashboard nesta sessão
- Manter compatibilidade com packs existentes

## Known Issues to Verify
- ceremony.md §7 usa ▓/░ mas guide.md §5-6 usa █/░
- guide.md §1 Voice Rule 1 tem erro de template "{hero_name}"
- xp-system.md §7 condition "total_xp >= N" avalia base_item_xp (nome confuso)
- xp-system.md §4 lógica de unused no streak só aparece no §10
- scanner.md §6 free-text table com IDs hardcoded de pack
