# Ping-Pong Session — Packs Quality

## Scope
- files:
  - packs/app-development.yaml
  - packs/design-system-forge.yaml
  - packs/squad-upgrade.yaml
  - engine/scanner.md
  - engine/xp-system.md

## Goals
- Schema compliance: todos os campos obrigatórios presentes em cada item?
- Valores consistentes: XP totals no header batem com a soma real dos items?
- Idioma: levels, messages e labels seguem o mesmo idioma dentro de cada pack?
- Scan rules: todas as funções usadas existem no scanner.md §4.1?
- Achievements: conditions usam syntax documentada no xp-system.md §7?
- Agnosticismo: nenhum item referencia pessoas, tools ou skills específicas que possam não existir
- Expansion gate: parent_item referencia item required (não optional) no pack pai?
- Missing fields: fases sem complete_message/unlock_message — o engine trata gracefully?
- Integration checks: commands correspondem ao nome do check?
- Compound conditions (AND): parser suporta? Documentado?

## Constraints
- Não alterar a estrutura de fases/items — apenas corrigir valores, campos e consistência
- Não adicionar novos items ou achievements
- Manter backward compatibility com quest-logs existentes

## Known Issues to Verify
- app-development.yaml: comentário "Version: 1.0.0" vs pack.version "2.0.0"
- app-development.yaml: levels em inglês, rest do sistema em pt-BR
- app-development.yaml: item 6.3 command @pedro-valerio (não agnóstico)
- design-system-forge.yaml: parent_item "2.5" é optional no pack pai
- design-system-forge.yaml: item 2.5 note diz "OBRIGATÓRIO" mas required: false
- squad-upgrade.yaml: fases sem complete_message/unlock_message
- squad-upgrade.yaml: campo checkpoint não documentado no engine
- squad-upgrade.yaml: item 2.4 scan_rule usa regex pipe sem documentação
