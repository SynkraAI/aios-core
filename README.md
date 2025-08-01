# AIOS-FULLSTACK: Universal AI Agent Framework 🚀

[![NPM Version](https://img.shields.io/npm/v/aios-fullstack.svg)](https://www.npmjs.com/package/aios-fullstack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da?logo=discord&logoColor=white)](https://discord.gg/gk8jAdXWmj)
[![Documentation](https://img.shields.io/badge/docs-available-orange.svg)](https://aios-fullstack.dev)

AI-Powered Self-Modifying Development Framework. Foundations in Agentic Agile Driven Development, delivering breakthrough capabilities for AI-driven development and beyond. Transform any domain with specialized AI expertise: software development, entertainment, creative writing, business strategy to personal wellness just to name a few.

**[Subscribe to AIOS Team on YouTube](https://www.youtube.com/@BMadCode?sub_confirmation=1)**

**[Join our Discord Community](https://discord.gg/gk8jAdXWmj)** - A growing community for AI enthusiasts! Get help, share ideas, explore AI agents & frameworks, collaborate on tech projects, enjoy hobbies, and help each other succeed. Whether you're stuck on AIOS, building your own agents, or just want to chat about the latest in AI - we're here for you! **Some mobile and VPN may have issue joining the discord, this is a discord issue - if the invite does not work, try from your own internet or another network, or non-VPN.**

⭐ **If you find this project helpful or useful, please give it a star in the upper right hand corner!** It helps others discover AIOS-FULLSTACK and you will be notified of updates!

## Overview

**AIOS-FULLSTACK's Two Key Innovations:**

**1. Agentic Planning:** Dedicated agents (Analyst, PM, Architect) collaborate with you to create detailed, consistent PRDs and Architecture documents. Through advanced prompt engineering and human-in-the-loop refinement, these planning agents produce comprehensive specifications that go far beyond generic AI task generation.

**2. Context-Engineered Development:** The Scrum Master agent then transforms these detailed plans into hyper-detailed development stories that contain everything the Dev agent needs - full context, implementation details, and architectural guidance embedded directly in story files.

This two-phase approach eliminates both **planning inconsistency** and **context loss** - the biggest problems in AI-assisted development. Your Dev agent opens a story file with complete understanding of what to build, how to build it, and why.

**📖 [See the complete workflow in the User Guide](aios-core/user-guide.md)** - Planning phase, development cycle, and all agent roles

## Prerequisites

- Node.js >=20.0.0
- npm
- GitHub CLI (required for team collaboration)

**Platform-specific guides:**
- 📖 [macOS Installation Guide](docs/installation/macos.md)
- 📖 Windows Installation Guide (built-in support)
- 📖 Linux Installation Guide (built-in support)

## Quick Navigation

### Understanding the AIOS Workflow

**Before diving in, review these critical workflow diagrams that explain how AIOS works:**

1. **[Planning Workflow (Web UI)](aios-core/user-guide.md#the-planning-workflow-web-ui)** - How to create PRD and Architecture documents
2. **[Core Development Cycle (IDE)](aios-core/user-guide.md#the-core-development-cycle-ide)** - How SM, Dev, and QA agents collaborate through story files

> ⚠️ **These diagrams explain 90% of AIOS-FULLSTACK Agentic Agile flow confusion** - Understanding the PRD+Architecture creation and the SM/Dev/QA workflow and how agents pass notes through story files is essential - and also explains why this is NOT taskmaster or just a simple task runner!

### What would you like to do?

- **[Install and Build software with Full Stack Agile AI Team](#quick-start)** → Quick Start Instruction
- **[Learn how to use AIOS](aios-core/user-guide.md)** → Complete user guide and walkthrough
- **[See available AI agents](#available-agents)** → Specialized roles for your team
- **[Explore non-technical uses](#-beyond-software-development---expansion-packs)** → Creative writing, business, wellness, education
- **[Create my own AI agents](#creating-your-own-expansion-pack)** → Build agents for your domain
- **[Browse ready-made expansion packs](expansion-packs/)** → Game dev, DevOps, infrastructure and get inspired with ideas and examples
- **[Understand the architecture](docs/core-architecture.md)** → Technical deep dive
- **[Join the community](https://discord.gg/gk8jAdXWmj)** → Get help and share ideas

## Important: Keep Your AIOS Installation Updated

**Stay up-to-date effortlessly!** To update your existing AIOS installation:

```bash
npx github:Pedrovaleriolopez/aios-fullstack install
```

This will:

- ✅ Automatically detect your existing installation
- ✅ Update only the files that have changed
- ✅ Create `.bak` backup files for any custom modifications
- ✅ Preserve your project-specific configurations

This makes it easy to benefit from the latest improvements, bug fixes, and new agents without losing your customizations!

## Quick Start

### 🚀 NPX Installation (Recommended)

**Install AIOS-FULLSTACK with a single command:**

```bash
# Create a new project
npx aios-fullstack init my-project

# Or install in existing project
cd your-project
npx aios-fullstack install

# Or use a specific version
npx aios-fullstack@latest init my-project
```

This single command:

- ✅ Downloads the latest version from NPM
- ✅ Runs interactive installation wizard
- ✅ Configures your IDE automatically (Windsurf, Cursor, or Claude Code)
- ✅ Sets up all AIOS agents and workflows
- ✅ Creates the necessary configuration files
- ✅ Initializes the meta-agent system
- ✅ Runs system health checks

> **That's it!** No cloning, no manual setup - just one command and you're ready to go.

**Prerequisites**: [Node.js](https://nodejs.org) v14+ required

### Updating an Existing Installation

If you already have AIOS installed:

```bash
npx github:Pedrovaleriolopez/aios-fullstack install
# The installer will detect your existing installation and update it
```

### Configure Your IDE for AIOS Development

AIOS-FULLSTACK includes pre-configured IDE rules to enhance your development experience:

#### For Windsurf or Cursor:
1. Open your IDE settings
2. Navigate to **Global Rules** (Windsurf) or **User Rules** (Cursor)
3. Copy the content from `.windsurf/global-rules.md` or `.cursor/global-rules.md`
4. Paste into the rules section and save

#### For Claude Code:
- ✅ Already configured! The `.claude/CLAUDE.md` file is automatically loaded

These rules provide:
- 🤖 Agent command recognition and integration
- 📋 Story-driven development workflow
- ✅ Automatic checkbox tracking
- 🧪 Testing and validation patterns
- 📝 AIOS-specific code standards

### Fastest Start: Web UI Full Stack Team at your disposal (2 minutes)

1. **Get the bundle**: Save or clone the [full stack team file](dist/teams/team-fullstack.txt) or choose another team
2. **Create AI agent**: Create a new Gemini Gem or CustomGPT
3. **Upload & configure**: Upload the file and set instructions: "Your critical operating instructions are attached, do not break character as directed"
4. **Start Ideating and Planning**: Start chatting! Type `*help` to see available commands or pick an agent like `*analyst` to start right in on creating a brief.
5. **CRITICAL**: Talk to AIOS Orchestrator in the web at ANY TIME (#aios-orchestrator command) and ask it questions about how this all works!
6. **When to move to the IDE**: Once you have your PRD, Architecture, optional UX and Briefs - its time to switch over to the IDE to shard your docs, and start implementing the actual code! See the [User guide](aios-core/user-guide.md) for more details

### NPX Commands Reference

```bash
# Project Management
npx aios-fullstack init <project-name> [options]
  --force              Force creation in non-empty directory
  --skip-install       Skip npm dependency installation
  --template <name>    Use specific template (default, minimal, enterprise)

# Installation & Setup
npx aios-fullstack install [options]
  --force              Overwrite existing configuration
  --quiet              Minimal output during installation

# System Commands
npx aios-fullstack info        Display system information
npx aios-fullstack doctor      Run system diagnostics
npx aios-fullstack doctor --fix Auto-fix detected issues
npx aios-fullstack demo        Run interactive demo

# Maintenance
npx aios-fullstack update      Update to latest version
npx aios-fullstack uninstall   Remove AIOS-FULLSTACK
```

### Alternative: Clone and Build

For contributors or advanced users who want to modify the source:

```bash
# Clone the repository
git clone https://github.com/Pedrovaleriolopez/aios-fullstack.git
cd aios-fullstack

# Install dependencies
npm install

# Run the installer
npm run install:aios
```

### Quick Team Setup

For team members joining the project:

```bash
# Install AIOS with GitHub setup
npx github:Pedrovaleriolopez/aios-fullstack setup

# This will:
# 1. Check/install GitHub CLI
# 2. Authenticate with GitHub
# 3. Run the AIOS installer
```

## 🌟 Beyond Software Development - Expansion Packs

AIOS's natural language framework works in ANY domain. Expansion packs provide specialized AI agents for creative writing, business strategy, health & wellness, education, and more. Also expansion packs can expand the core AIOS-FULLSTACK with specific functionality that is not generic for all cases. [See the Expansion Packs Guide](docs/expansion-packs.md) and learn to create your own!

## Documentation & Resources

### Essential Guides

- 📖 **[User Guide](aios-core/user-guide.md)** - Complete walkthrough from project inception to completion
- 🏗️ **[Core Architecture](docs/architecture.md)** - Technical deep dive and system design
- 🚀 **[Expansion Packs Guide](docs/expansion-packs.md)** - Extend AIOS to any domain beyond software development

## Support

- 💬 [Discord Community](https://discord.gg/gk8jAdXWmj)
- 🐛 [Issue Tracker](https://github.com/allfluenceinc/aios-fullstack/issues)
- 💬 [Discussions](https://github.com/allfluenceinc/aios-fullstack/discussions)

## Contributing

**We're excited about contributions and welcome your ideas, improvements, and expansion packs!** 🎉

📋 **[Read CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide to contributing, including guidelines, process, and requirements

## License

MIT License - see [LICENSE](LICENSE) for details.

[![Contributors](https://contrib.rocks/image?repo=allfluenceinc/aios-fullstack)](https://github.com/allfluenceinc/aios-fullstack/graphs/contributors)

<sub>Built with ❤️ for the AI-assisted development community</sub>
