# Squad Creator Premium - Installed Commands

**Version**: 3.0.0
**Installed**: 2026-02-17
**Source**: squads/squad-creator/

## Available Agents

- `/squadCreator:agents:squad-chief` - Master Orchestrator (triage, routing, squad creation)
- `/squadCreator:agents:oalanicolas` - Mind Cloning Architect (Voice DNA, Thinking DNA extraction)
- `/squadCreator:agents:pedro-valerio` - Process Absolutist (workflow validation, veto conditions)

## Also Available Via

- `/AIOS:agents:squad-creator` - Entry agent (squad-chief)
- `/squadCreator:squad` - Skill with subagent support

## Usage

### Activate the main orchestrator:
```
/squadCreator:agents:squad-chief
```

### Create a squad:
```
*create-squad {domain}
```

### Clone a mind:
```
*clone-mind {name}
```

## Documentation

- **Pack README**: `squads/squad-creator/README.md`
- **Quick Start**: `squads/squad-creator/docs/QUICK-START.md`
- **Commands**: `squads/squad-creator/docs/COMMANDS.md`
- **Agent Details**: `squads/squad-creator/agents/`
- **Task Workflows**: `squads/squad-creator/tasks/`

## Uninstall

```bash
rm -rf .claude/commands/squadCreator
rm -rf squads/squad-creator
```
