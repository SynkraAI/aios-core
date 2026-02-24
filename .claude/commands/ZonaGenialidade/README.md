# Zona Genialidade Squad - Installed Commands

**Version**: 1.0.0
**Installed**: 2026-02-17
**Source**: squads/zona-genialidade/

## Pipeline Completa (Recomendado)

- `/ZonaGenialidade:tasks:start` - Pipeline COMPLETO ponta-a-ponta (assessment -> analise -> matching -> blueprint)

## Available Agents

### Orchestrator
- `/ZonaGenialidade:agents:zona-genialidade-chief` - Chief Orchestrator (conduz assessment, roteia agentes, sintetiza Blueprint)

### Tier 0 - Foundation
- `/ZonaGenialidade:agents:gay-hendricks` - Diagnosticador de Zona de Genialidade (Zone of Genius Model)

### Tier 1 - Profiling
- `/ZonaGenialidade:agents:don-clifton` - Analista de Talentos e Forcas (CliftonStrengths 34)
- `/ZonaGenialidade:agents:dan-sullivan` - Estrategista de Habilidade Unica (Unique Ability)
- `/ZonaGenialidade:agents:roger-hamilton` - Arquiteto de Perfil de Riqueza (Wealth Dynamics)
- `/ZonaGenialidade:agents:alex-hormozi` - Arquiteto de Monetizacao (Value Equation + Grand Slam Offer)

### Tier 2 - Refinement
- `/ZonaGenialidade:agents:kathy-kolbe` - Analista de Forca Conativa (4 Action Modes)
- `/ZonaGenialidade:agents:sally-hogshead` - Estrategista de Posicionamento (Fascination Advantage)

## Available Tasks

- `/ZonaGenialidade:tasks:start` - Pipeline completa ponta-a-ponta
- `/ZonaGenialidade:tasks:run-assessment` - Assessment unificado (30 min)
- `/ZonaGenialidade:tasks:analyze-genius-profile` - Analise multi-framework (7 agentes)
- `/ZonaGenialidade:tasks:recommend-squad` - Recomendacao de squad ideal
- `/ZonaGenialidade:tasks:generate-blueprint` - Gerar Genius Zone Blueprint

## Quick Start

```
# Pipeline completa (RECOMENDADO)
/ZonaGenialidade:tasks:start

# Ou ativar o Chief e usar comandos:
/ZonaGenialidade:agents:zona-genialidade-chief
*assess      -> Iniciar assessment
*blueprint   -> Gerar Blueprint
*recommend-squad -> Recomendar squad
*status      -> Ver progresso
*help        -> Todos os comandos
```

## Documentation

- **Squad README**: `squads/zona-genialidade/README.md`
- **Config**: `squads/zona-genialidade/config.yaml`
- **Knowledge Base**: `squads/zona-genialidade/data/zona-genialidade-kb.md`
- **Agent Definitions**: `squads/zona-genialidade/agents/`
- **Task Definitions**: `squads/zona-genialidade/tasks/`

## Uninstall

```bash
rm -rf .claude/commands/ZonaGenialidade
rm -rf squads/zona-genialidade
```
