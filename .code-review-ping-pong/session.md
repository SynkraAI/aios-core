# Ping-Pong Session — YT Forge

## Scope
- files:
  - skills/yt-forge/SKILL.md
  - skills/yt-forge/capability-map.yaml
  - skills/yt-forge/references/examples.md

## Goals
- Verificar qualidade geral da skill yt-forge como orquestrador (Tier 1 forge)
- Compliance com Forge Contract (5 traits: identity, intent classifier, routing, discovery, never-implements)
- Consistência entre SKILL.md e capability-map.yaml (intents batem com capabilities?)
- Routing table correto (executores existem, activation paths válidos)
- Discovery questions são suficientes e específicas ao domínio
- Exemplos em references/examples.md são realistas e cobrem todos os intents
- Texto pt-BR com acentuação completa (Artigo VII da Constitution)
- Clareza das pipelines por intent (nenhuma ambiguidade no fluxo)

## Constraints
- É uma skill de orquestração — NÃO tem código executável, só markdown e YAML
- Foco em qualidade do design, não em implementação
- Não alterar a arquitetura (Tier 1 MVF é intencional)
- Avaliar contra referências: forge-anatomy.md, tier-1-template.md, content-forge como modelo
