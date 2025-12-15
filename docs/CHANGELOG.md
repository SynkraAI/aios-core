# Changelog

All notable changes to Synkra AIOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2025-01-24

### Added

- **Interactive Installation Wizard**: Step-by-step guided setup with component selection
- **Multi-IDE Support**: Added support for 8 IDEs (Claude Code, Cursor, Windsurf, Trae, Roo Code, Cline, Gemini CLI, GitHub Copilot)
- **Squads System**: Modular add-ons including HybridOps for ClickUp integration
- **Cross-Platform Testing**: Full test coverage for Windows, macOS, and Linux
- **Error Handling & Rollback**: Automatic rollback on installation failure with recovery suggestions
- **Agent Improvements**:
  - Decision logging in yolo mode for `dev` agent
  - Backlog management commands for `qa` agent
  - CodeRabbit integration for automated code review
  - Contextual greetings with project status
- **Documentation Suite**:
  - Quick Start Guide (`docs/installation/v2.1-quick-start.md`)
  - Troubleshooting Guide with 23 documented issues
  - FAQ with 22 Q&As
  - Migration Guide v2.0 to v2.1

### Changed

- **Directory Structure**: Renamed `.bmad-core/` to `.aios-core/`
- **Configuration Format**: Enhanced `core-config.yaml` with new sections for git, projectStatus, and sharding options
- **Agent Format**: Updated agent YAML schema with persona_profile, commands visibility, and whenToUse fields
- **IDE Configuration**: Claude Code agents moved to `.claude/commands/AIOS/agents/`
- **File Locations**:
  - `docs/architecture/coding-standards.md` → `docs/framework/coding-standards.md`
  - `docs/architecture/tech-stack.md` → `docs/framework/tech-stack.md`
  - `.aios-core/utils/` → `.aios-core/scripts/`

### Fixed

- Installation failures on Windows with long paths
- PowerShell execution policy blocking scripts
- npm permission issues on Linux/macOS
- IDE configuration not applying after installation

### Deprecated

- Manual installation process (use `npx @synkra/aios-core install` instead)
- `.bmad-core/` directory name (automatically migrated)

### Security

- Added validation for installation directory to prevent system directory modifications
- Improved handling of environment variables and API keys

---

## [2.0.0] - 2024-12-01

### Added

- Initial public release of Synkra AIOS
- 11 specialized AI agents (dev, qa, architect, pm, po, sm, analyst, ux-expert, data-engineer, devops, db-sage)
- Task workflow system with 60+ pre-built tasks
- Template system with 20+ document templates
- Story-driven development methodology
- Basic Claude Code integration

### Known Issues

- Manual installation required (2-4 hours)
- Limited cross-platform support
- No interactive wizard

---

## [1.0.0] - 2024-10-15

### Added

- Initial internal release
- Core agent framework
- Basic task execution

---

## Migration Notes

### Upgrading from 2.0.x to 2.1.x

See [Migration Guide](./installation/migration-v2.0-to-v2.1.md) for detailed instructions.

**Quick upgrade:**

```bash
npx @synkra/aios-core install --force-upgrade
```

**Key changes:**
1. Directory renamed: `.bmad-core/` → `.aios-core/`
2. Update `core-config.yaml` with new fields
3. Re-run IDE configuration

---

## Links

- [Installation Guide](./installation/v2.1-quick-start.md)
- [Troubleshooting](./installation/troubleshooting.md)
- [FAQ](./installation/faq.md)
- [GitHub Repository](https://github.com/SynkraAI/aios-core)
- [Issue Tracker](https://github.com/SynkraAI/aios-core/issues)
