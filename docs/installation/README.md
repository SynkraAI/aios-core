# Synkra AIOS Installation Documentation

**Version:** 2.1.0
**Last Updated:** 2025-01-24

---

## Overview

This directory contains comprehensive installation and setup documentation for Synkra AIOS.

---

## Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [Quick Start Guide](./v2.1-quick-start.md) | Complete installation walkthrough | New users |
| [Troubleshooting](./troubleshooting.md) | Common issues and solutions | All users |
| [FAQ](./faq.md) | Frequently asked questions | All users |
| [Migration Guide](./migration-v2.0-to-v2.1.md) | Upgrading from v2.0 | Existing users |

---

## Quick Links

### New Installation

```bash
npx @synkra/aios-core install
```

See [Quick Start Guide](./v2.1-quick-start.md) for detailed instructions.

### Upgrading

```bash
npx @synkra/aios-core install --force-upgrade
```

See [Migration Guide](./migration-v2.0-to-v2.1.md) for breaking changes and upgrade procedure.

### Having Issues?

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Search [FAQ](./faq.md)
3. Open a [GitHub Issue](https://github.com/SynkraAI/aios-core/issues)

---

## Prerequisites

- Node.js 18.0.0+
- npm 9.0.0+
- Git 2.30+

---

## Supported Platforms

| Platform | Status |
|----------|--------|
| Windows 10/11 | Full Support |
| macOS 12+ | Full Support |
| Ubuntu 20.04+ | Full Support |
| Debian 11+ | Full Support |

---

## Supported IDEs

| IDE | Agent Activation |
|-----|------------------|
| Claude Code | `/dev`, `/qa`, etc. |
| Cursor | `@dev`, `@qa`, etc. |
| Windsurf | `@dev`, `@qa`, etc. |
| Trae | `@dev`, `@qa`, etc. |
| Roo Code | Mode selector |
| Cline | `@dev`, `@qa`, etc. |
| Gemini CLI | Mention in prompt |
| GitHub Copilot | Chat modes |

---

## Related Documentation

- [Coding Standards](../framework/coding-standards.md)
- [Tech Stack](../framework/tech-stack.md)
- [Architecture](../architecture/)
- [Changelog](../CHANGELOG.md)

---

## Support

- **GitHub Issues**: [@synkra/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Documentation**: [docs/](../)
