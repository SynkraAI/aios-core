# BMAD-METHOD

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](docs/versions.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

**AI-Powered Agile Development Framework** - Transform your software development with specialized AI agents that work as your complete Agile team.

## 🚀 Quick Start

### Fastest Start: Web UI (2 minutes) 🏃‍♂️

1. Copy `.bmad-core/web-bundles/teams/team-fullstack.txt`
2. Create a new Gemini Gem or CustomGPT
3. Upload the file and set instructions: "Your critical operating instructions are attached, do not break character as directed"
4. Start chatting! Type `/help` to see available commands

### IDE Quick Start (5 minutes) 💻

**Prerequisites**: Install [Node.js](https://nodejs.org) (v14 or higher)

**Option A: Using npx (easiest)**
```bash
npx bmad-method install
# Choose: full installation, destination folder, and IDE
```

**Option B: Clone and install**
```bash
git clone https://github.com/bmadcode/bmad-method.git
cd bmad-method
npm install
npm run install:bmad
# When prompted, choose your project directory for installation
```

This installs all agents and configures them for your IDE.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Available Agents](#available-agents)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Overview

BMAD-METHOD (Breakthrough Method of Agile AI-Driven Development) revolutionizes software development by providing specialized AI agents for every role in an Agile team. Each agent has deep expertise in their domain and can collaborate to deliver complete software projects.

### Why BMAD?

- **🎯 Specialized Expertise**: Each agent is an expert in their specific role
- **🔄 True Agile Workflow**: Follows real Agile methodologies and best practices
- **📦 Modular Design**: Use one agent or an entire team
- **🛠️ IDE Integration**: Works seamlessly with Cursor, Claude Code, and Windsurf
- **🌐 Platform Agnostic**: Use with ChatGPT, Claude, Gemini, or any AI platform

## Installation

### Method 1: Pre-Built Web Bundles (Fastest) 📦

For ChatGPT, Claude, or Gemini web interfaces:

1. Choose a bundle:
   - **Recommended**: `.bmad-core/web-bundles/teams/team-fullstack.txt` (complete development team)
   - Or pick from individual agents in `.bmad-core/web-bundles/agents/`
2. Upload to your AI platform (Gemini Gem, CustomGPT, or directly in chat)
3. Set instructions: "Your critical operating instructions are attached, do not break character as directed"
4. Type `/help` to see available commands

### Method 2: CLI Installer (For IDEs) 🎯

**Prerequisites**: Install [Node.js](https://nodejs.org) v14+ first

Install directly into your project:

```bash
# Interactive installation (recommended)
npx bmad-method install
# You'll be prompted for:
# - Installation type (full/single agent)
# - Destination directory
# - IDE configuration

# Or use command line options
npx bmad-method install --full --directory ./my-project --ide cursor
npx bmad-method install --agent pm --directory ./my-project --ide claude-code
```

**Supported IDEs:**

The BMad Method works with any IDE, but has built-in integration for:

- `cursor` - Cursor IDE with @agent commands
- `claude-code` - Claude Code with /agent commands
- `windsurf` - Windsurf with @agent commands

## Available Agents

### Core Development Team

| Agent       | Role               | Specialty                                     |
| ----------- | ------------------ | --------------------------------------------- |
| `analyst`   | Business Analyst   | market analysis, brainstorming, project brief |
| `pm`        | Product Manager    | Product strategy, roadmaps, PRDs              |
| `architect` | Solution Architect | System design, technical architecture         |
| `dev`       | Developer          | Code implementation across all technologies   |
| `qa`        | QA Specialist      | Testing strategies, quality assurance         |
| `ux-expert` | UX Designer        | User experience, UI design, prototypes        |
| `po`        | Product Owner      | Backlog management, story validation          |
| `sm`        | Scrum Master       | Sprint planning, story creation               |

### Meta Agents

| Agent               | Role             | Specialty                             |
| ------------------- | ---------------- | ------------------------------------- |
| `bmad-orchestrator` | Team Coordinator | Multi-agent workflows, role switching |
| `bmad-master`       | Universal Expert | All capabilities without switching    |

## Usage

### With IDE Integration

After installation with `--ide` flag:

```bash
# In Cursor
@pm Create a PRD for a task management app

# In Claude Code
/architect Design a microservices architecture

# In Windsurf
@dev Implement story 1.3
```

### With Web UI (ChatGPT/Claude/Gemini)

After uploading a bundle you can ask /help of the agent to learn what it can do

### CLI Commands

```bash
# List all available agents
npx bmad-method list

# Update existing installation with changes
npx bmad-method update

# Check installation status
npx bmad-method status
```

## Teams & Workflows

### Pre-Configured Teams

Save context by using specialized teams:

- **Team All**: Complete Agile team with all 10 agents
- **Team Fullstack**: Frontend + Backend development focus
- **Team No-UI**: Backend/API development without UX

### Workflows

Structured approaches for different scenarios:

- **Greenfield**: Starting new projects (fullstack/service/UI)
- **Brownfield**: Enhancing existing projects
- **Simple**: Quick prototypes and MVPs
- **Complex**: Enterprise and large-scale projects

## Project Structure

```plaintext
.bmad-core/
├── agents/          # Individual agent definitions
├── agent-teams/     # Team configurations
├── workflows/       # Development workflows
├── templates/       # Document templates (PRD, Architecture, etc.)
├── tasks/           # Reusable task definitions
├── checklists/      # Quality checklists
├── data/            # Knowledge base
└── web-bundles/     # Pre-built bundles

tools/
├── cli.js           # Build tool
├── installer/       # NPX installer
└── lib/             # Build utilities

expansion-packs/     # Optional add-ons (DevOps, Mobile, etc.)
```

## Advanced Features

### Dynamic Dependencies

Each agent only loads the resources it needs, keeping context windows lean.

### Template System

Rich templates for all document types:

- Product Requirements (PRD)
- Architecture Documents
- User Stories
- Test Plans
- And more...

### Slash Commands

Quick actions and role switching:

- `/help` - Show available commands
- `/pm` - Switch to Product Manager
- `*create-doc` - Create from template
- `*validate` - Run validations

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/bmadcode/bmad-method.git
cd bmad-method
npm install
npm run validate  # Check configurations
npm test         # Run tests
```

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/bmadcode/bmad-method/issues)
- 💬 [Discussions](https://github.com/bmadcode/bmad-method/discussions)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Version History

- **Current**: [v4.0.0](https://github.com/bmadcode/bmad-method) - Complete framework rewrite with CLI installer, dynamic dependencies, and expansion packs
- **Previous Versions**:
  - [Version 3](https://github.com/bmadcode/BMAD-METHOD/tree/V3) - Introduced the unified BMAD Agent and Gemini optimization
  - [Version 2](https://github.com/bmadcode/BMAD-METHOD/tree/V2) - Added web agents and template separation
  - [Version 1](https://github.com/bmadcode/BMAD-METHOD/tree/V1) - Original 7-file proof of concept

See [versions.md](docs/versions.md) for detailed version history and migration guides.

## Author

Created by Brian (BMad) Madison

---

[![Contributors](https://contrib.rocks/image?repo=bmadcode/bmad-method)](https://github.com/bmadcode/bmad-method/graphs/contributors)

<p align="center">Built with ❤️ for the AI-assisted development community</p>
