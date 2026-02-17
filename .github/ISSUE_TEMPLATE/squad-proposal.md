---
name: Squad Proposal
about: Propose a new AIOS Squad for the framework
title: '[SQUAD] '
labels: ['squad', 'new-squad', 'needs-triage']
assignees: ''
---

## 📦 Squad Proposal

### Squad Information
- **Squad Name:** (e.g., `my-domain-squad`)
- **Short Title:** (e.g., "My Domain Squad - Specialized AI Team")
- **Version:** 1.0.0
- **Author:** (Your name/org)

### 📋 Description
A clear and concise description of what this AIOS Squad does and what domain it covers.

> AIOS Squads are modular teams of AI agents that work together to accomplish specialized tasks.

### 🎯 Purpose
What problem does this squad solve? What domain or use case does it address?

### 🏗️ Proposed Structure

**Agents:** (List proposed agents in this squad)
- `@agent-1` - Purpose and expertise
- `@agent-2` - Purpose and expertise

**Tasks:** (List proposed tasks)
- `*task-1` - Workflow purpose
- `*task-2` - Workflow purpose

**Templates:** (List proposed templates)
- `template-1-tmpl.yaml` - Purpose

**Checklists:** (List proposed checklists)
- `checklist-1-checklist.md` - Purpose

### 🔗 Integration Points
How does this squad integrate with:
- Core AIOS framework (aios-core)?
- Other squads (ETL, Creator, MMOS)?
- External services/APIs?

### 📊 Use Cases
Provide 2-3 concrete use cases:
1. Use case 1
2. Use case 2
3. Use case 3

### 🎨 Example Workflow
```bash
# Example of how users would use this squad
@my-domain-squad:agent-1
*task-1 --option value

# Or via CLI
aios squad activate my-domain
```

### 📦 Dependencies
- **Core Framework:** Required aios-core version?
- **Other Squads:** Any dependencies on other AIOS Squads?
- **External Services:** Any API keys or external services needed?

### 🔒 License & Distribution
- [ ] This squad will be open-source (MIT) in `aios-squads` repo
- [ ] This squad requires proprietary license
- [ ] This squad will be community-contributed

### 📖 Documentation Plan
- [ ] README.md with usage examples
- [ ] Agent documentation for each agent
- [ ] Task workflow documentation
- [ ] Integration guide with existing squads

### ✅ Checklist
- [ ] Squad follows AIOS structure (`{squad}/agents/`, `{squad}/tasks/`, etc.)
- [ ] All agents follow naming convention (`{agent-name}.md`)
- [ ] All tasks have proper YAML frontmatter
- [ ] pack.yaml manifest is included
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] No hard dependencies on private repos

### 👥 Contributor Information
- **Willing to maintain:** [ ] Yes [ ] No
- **Can provide support:** [ ] Yes [ ] No
- **Available for review:** [ ] Yes [ ] No

### 🔗 Related
- Related issues or discussions
- Similar squads for reference

---

**Note:** All squad proposals are reviewed by maintainers. Approved squads may be included in the official `aios-squads` repository.

**Tagline:** *AIOS Squads: Equipes de AI agents trabalhando com você* 🤖
