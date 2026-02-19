# AIOS Gemini CLI Extension

Brings Synkra AIOS multi-agent orchestration to Gemini CLI.

## Installation

```bash
gemini extensions install github.com/synkra/aios-core/packages/gemini-aios-extension
```

Or manually copy to `~/.gemini/extensions/aios/`

## Features

### Quick Agent Launcher
Use slash commands for fast activation flow (Codex `$`-like UX):
- `/aios-menu` - show all quick launch commands
- `/aios-dev`
- `/aios-architect`
- `/aios-qa`
- `/aios-devops`
- `/aios-master`
- and other `/aios-<agent-id>` commands

Each launcher returns a ready-to-send activation prompt plus greeting preview.

### Commands
- `/aios-status` - Show system status
- `/aios-agents` - List available agents
- `/aios-validate` - Validate installation
- `/aios-menu` - Show quick launch menu
- `/aios-agent <id>` - Generic launcher by agent id

### Hooks
Automatic integration with AIOS memory and security:
- Session context loading
- Gotchas and patterns injection
- Security validation (blocks secrets)
- Audit logging

## Requirements

- Gemini CLI v0.26.0+
- AIOS Core installed (`npx aios-core install`)
- Node.js 18+

## Cross-CLI Compatibility

AIOS skills work identically in both Claude Code and Gemini CLI. Same agents, same commands, same format.

## License

MIT
