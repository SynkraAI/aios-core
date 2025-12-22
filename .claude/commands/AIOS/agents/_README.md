# AIOS Agents Directory

This directory contains agent definition files that define the personas, capabilities, and tool dependencies for all AIOS agents.

## Quick Start

Each agent file (`.md`) defines:
- Agent persona and behavior
- Available commands
- Tool dependencies
- Task and template dependencies

## Tool Integration Standards

**IMPORTANT:** When declaring tool dependencies in agent files, follow the official standards:

📚 **[Agent-Tool Integration Standards Guide](../../../docs/architecture/agent-tool-integration-guide.md)**

### Quick Reference

Always use **full tool IDs** with proper prefixes:

```yaml
dependencies:
  tools:
    - mcp-supabase           # ✅ CORRECT
    - cli-github-cli         # ✅ CORRECT  
    - browser                # ✅ CORRECT (core tool)
    
    - supabase               # ❌ WRONG: ambiguous short name
    - github                 # ❌ WRONG: missing prefix
```

### Tool ID Prefixes

| Prefix | Type | Example |
|--------|------|---------|
| `mcp-*` | MCP Servers | `mcp-supabase` |
| `cli-*-cli` | CLI Wrappers | `cli-github-cli` |
| `local-*` | Local Binaries | `local-ffmpeg` |
| *(none)* | Core Tools | `browser`, `context7` |

### Before Committing

✅ **Validation Checklist:**
- [ ] All tools use full IDs (no short names)
- [ ] Each tool has inline comment
- [ ] Tools grouped by category (if >3 tools)
- [ ] Run validation: `node outputs/architecture-map/schemas/validate-tool-references.js`

## Available Agents

### Core Agents (11 Active)

1. **aios-master** - Master Orchestrator & Framework Developer (Orion)
   - Unified agent combining framework development and orchestration
   - Framework component creation (agents, tasks, workflows)
   - Workflow coordination and planning
   - Document creation and task execution

2. **analyst** - Business Analyst (Atlas)
   - Requirements analysis and elicitation
   - Market research and competitive analysis

3. **architect** - Technical Architect (Aria)
   - System design and architecture
   - Technical decision-making

4. **data-engineer** - Database Architect & Operations Engineer (Dara)
   - Comprehensive database design and Supabase configuration
   - Schema architecture, RLS policies, migrations
   - Query optimization and monitoring
   - 11 specialized database tasks included
   - 6 database templates for documentation

5. **dev** - Full Stack Developer (James)
   - Code implementation and debugging
   - Test-driven development

6. **devops** - GitHub Repository Manager & DevOps Specialist (Gage)
   - Repository operations and version management
   - CI/CD and quality gates
   - Only agent authorized to push to remote repository

7. **pm** - Engineering Manager (Morgan)
   - Project planning and resource allocation
   - Sprint management

8. **po** - Product Owner (Sarah)
   - Backlog management and story refinement
   - Acceptance criteria and prioritization

9. **qa** - Quality Assurance (Quinn)
   - Testing strategy and validation
   - Quality gates and reviews

10. **sm** - Scrum Master (River)
    - Agile ceremonies and team facilitation
    - Process improvement

11. **ux-design-expert** - UX Designer (Uma)
    - User experience and interface design
    - Usability research

### Deprecated Agents (Backward Compatible)

The following agent names redirect to their new locations:

- **db-sage** → **data-engineer** (renamed for consistency with persona)
- **github-devops** → **devops** (renamed for broader scope)
- **aios-developer** → **aios-master** (merged for unified framework operations)
- **aios-orchestrator** → **aios-master** (merged for unified workflow coordination)

Redirect files maintain backward compatibility in both:
- `.aios-core/development/agents/` (framework source)
- `.claude/commands/AIOS/agents/` (IDE integration)

## Agent Files

All agent `.md` files in this directory are automatically parsed and validated by:
- `parse-markdown-agents.js` - Extracts agent metadata
- `validate-tool-references.js` - Validates tool references
- Pre-commit hook (Story 3.22) - Catches issues before commit

## Adding New Agents

1. Use agent elicitation workflow: `.aios-core/elicitation/agent-elicitation.js`
2. Follow integration standards (link above)
3. Validate before committing

## Questions?

See full documentation: [Agent-Tool Integration Standards Guide](../../../docs/architecture/agent-tool-integration-guide.md)

---

**Last Updated:** 2025-01-14
**Story:** 6.1.2.1 - Agent File Operations (Renames, Merge, Redirects)

