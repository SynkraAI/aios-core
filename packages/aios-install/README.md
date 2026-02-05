# @synkra/aios-install

NPX installer for AIOS - AI-Orchestrated System for Full Stack Development.

## Quick Start

```bash
npx @synkra/aios-install
```

That's it! The installer will guide you through setting up AIOS in less than 5 minutes.

## Features

- **Cross-platform support**: macOS, Windows (with WSL), and Linux
- **Dependency checking**: Verifies Node.js, Git, Docker, and GitHub CLI
- **Profile selection**: Choose between "bob" (simplified) or "advanced" mode
- **Brownfield support**: Detects existing AIOS installations and offers migration
- **Dry-run mode**: Preview what would be done without making changes

## Usage

### Interactive Installation

```bash
npx @synkra/aios-install
```

### Options

```bash
npx @synkra/aios-install --help

Options:
  -v, --version         Output the current version
  --dry-run            Preview what would be done without making changes
  --verbose            Enable verbose output
  --profile <type>     Set profile directly (bob or advanced)
  --skip-deps          Skip dependency checking
  --no-color           Disable colored output
  -h, --help           Display help for command
```

### Dry Run

Preview the installation without making any changes:

```bash
npx @synkra/aios-install --dry-run
```

### Direct Profile Selection

Skip the profile question by specifying it directly:

```bash
npx @synkra/aios-install --profile bob
npx @synkra/aios-install --profile advanced
```

## edmcp - Docker MCP Manager

The installer also includes `edmcp`, a CLI for managing MCPs in the Docker Gateway.

```bash
# List active MCPs
edmcp list

# Add an MCP
edmcp add exa
edmcp add https://github.com/user/my-mcp

# Remove an MCP
edmcp remove my-mcp
```

## Requirements

- **Node.js**: >= 18.0.0 (required)
- **Git**: >= 2.30 (required)
- **Docker**: Optional (required for edmcp)
- **GitHub CLI (gh)**: Optional (enhances workflow)

## Profiles

### Bob Mode (Default)

Simplified mode for new users. Only Bob is visible, orchestrating internally.

- Single interface through Bob
- Streamlined workflow
- Best for getting started quickly

### Advanced Mode

Full access to all agents and commands.

- Access to all 11 agents (@dev, @qa, @architect, etc.)
- Full command palette
- Best for experienced users

## Brownfield Migration

If you have an existing AIOS installation, the installer will:

1. Detect your current configuration
2. Offer to migrate to the new L1-L5 configuration hierarchy
3. Preserve your existing settings

## Support

- Documentation: https://github.com/SynkraAI/aios-core
- Issues: https://github.com/SynkraAI/aios-core/issues

## License

MIT
