# AIOS Gemini CLI Extension

Brings Synkra AIOS multi-agent orchestration to Gemini CLI.

## Installation

```bash
gemini extensions install github.com/synkra/aios-core/packages/gemini-aios-extension
```

Or manually copy to `~/.gemini/extensions/aios/`

## Features

### Agents
Access all AIOS agents via `@agent-name`:
- `@dev` - Developer (Dex)
- `@architect` - Architect (Aria)
- `@qa` - QA Engineer (Quinn)
- `@pm` - Product Manager (Morgan)
- `@devops` - DevOps (Gage)
- And more...

### Commands
- `/aios-status` - Show system status
- `/aios-agents` - List available agents
- `/aios-validate` - Validate installation

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
