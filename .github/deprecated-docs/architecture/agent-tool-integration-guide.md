# Agent-Tool Integration Standards Guide

**Version:** 2.0  
**Last Updated:** 2025-10-28  
**Status:** Official Standard - Dual Mode Support

---

## Overview

This guide defines the official standards for declaring tool dependencies in AIOS agent files. Following these standards prevents tool reference ambiguity and ensures consistent, maintainable agent configurations.

**Why These Standards Matter:**
- Prevents ambiguous tool references
- Enables automatic validation via pre-commit hooks
- Improves agent file readability and maintainability
- Supports tooling like autocomplete and validation scripts

**Dual Mode Support:**

This guide covers **TWO modes** of tool integration:

1. **1MCP Mode** (Recommended for new projects)
   - Uses short tool names (e.g., `supabase`, `github`)
   - Unified namespace via 1MCP aggregator
   - Simpler configuration
   - See Section: 1MCP Mode Standards

2. **Legacy Mode** (For projects without 1MCP)
   - Uses full tool IDs with prefixes (e.g., `mcp-supabase`, `cli-github-cli`)
   - Direct MCP server configuration
   - Explicit type differentiation
   - See Section: Legacy Mode Standards

**How to Determine Your Mode:**

```bash
# Check if 1MCP is installed
1mcp --version

# If command succeeds → Use 1MCP Mode Standards
# If command fails → Use Legacy Mode Standards
```

---

## 1MCP Mode Standards

**When using 1MCP** (check: `1mcp --version` succeeds):

### ✅ DO: Use Short Tool Names

In 1MCP mode, use simple, short tool names without prefixes:

```yaml
dependencies:
  tools:
    # Development
    - github            # GitHub integration
    - supabase          # Database and auth

    # Research
    - exa               # Advanced web research
    - context7          # Library documentation

    # Project Management
    - clickup           # Task tracking
    - google-workspace  # Drive, Docs, Sheets
```

**Why:** 1MCP provides a unified namespace. The aggregator handles routing to the correct MCP server, so prefixes are unnecessary and not recognized.

### ❌ DON'T: Use MCP Prefixes

In 1MCP mode, do NOT use legacy prefixes:

```yaml
dependencies:
  tools:
    - mcp-github        # ❌ Wrong: 1MCP doesn't recognize 'mcp-' prefix
    - mcp-supabase      # ❌ Wrong: Use 'supabase' instead
    - cli-github-cli    # ❌ Wrong: Use 'github' instead
```

**Why:** 1MCP unifies the namespace. Using prefixes will cause validation errors and tool resolution failures.

### Preset-Based Categorization

Organize tools by their primary 1MCP preset for readability:

```yaml
dependencies:
  tools:
    # aios-dev preset (development tools)
    - github            # GitHub integration
    - supabase          # Database and auth

    # aios-research preset (research tools)
    - exa               # Advanced web research
    - context7          # Library documentation

    # aios-pm preset (project management)
    - clickup           # Task tracking
    - google-workspace  # Drive, Docs, Sheets
```

**Standard Presets:**
- `aios-dev` - Development tools (github, supabase, n8n)
- `aios-research` - Research tools (exa, context7, google-workspace)
- `aios-pm` - Project management (clickup, google-workspace)
- `aios-full` - All available tools

### Inline Comments (Required)

Comments remain required in 1MCP mode, explaining purpose and use cases:

```yaml
dependencies:
  tools:
    - stripe            # Payment processing and invoicing
    - supabase          # Database operations and auth
    - github            # Repository management and code reviews
```

**Good Comment Examples:**
- ✅ "Payment processing and invoicing"
- ✅ "Database operations and auth"
- ✅ "Repository management and code reviews"

**Bad Comment Examples:**
- ❌ "Stripe tool"
- ❌ "For GitHub"
- ❌ "Database"

### Mode Detection

To verify you're in 1MCP mode:

```bash
# Method 1: Check 1MCP command
1mcp --version
# If succeeds → 1MCP Mode

# Method 2: Check config file
ls ~/.1mcp/config.json
# If exists → 1MCP Mode

# Method 3: Check Claude Code MCP config
cat ~/.claude.json | grep "1mcp"
# If found → 1MCP Mode
```

### Migration from Legacy to 1MCP

If migrating from legacy mode to 1MCP:

**Step 1: Verify 1MCP is installed**
```bash
1mcp --version
# Should show version number
```

**Step 2: Update agent tool references**

```yaml
# Before (Legacy)
dependencies:
  tools:
    - mcp-supabase      # Database operations
    - mcp-exa           # Web research
    - cli-github-cli    # GitHub integration

# After (1MCP)
dependencies:
  tools:
    - github            # GitHub integration
    - supabase          # Database operations
    - exa               # Web research
```

**Step 3: Validate changes**

```bash
# Re-parse agents
cd outputs/architecture-map/schemas
node parse-markdown-agents.js

# Validate tool references (dual-mode validation)
node validate-tool-references.js

# Should show: "Mode: 1MCP" and all references valid
```

**Recommendation:**
- **New projects:** Use 1MCP mode (simpler, unified namespace)
- **Existing projects:** Migrate to 1MCP when convenient
- **Both modes supported:** Choose based on team preference and timeline

---

## Legacy Mode Standards

**For projects NOT using 1MCP** (check: `1mcp --version` fails):

### 1. Tool Reference Format (Legacy)

#### ✅ DO: Use Full Tool ID

Always use the complete tool identifier with the appropriate prefix:

```yaml
dependencies:
  tools:
    - mcp-supabase           # Database operations and auth
    - mcp-google-workspace   # Drive, Docs, Sheets APIs
    - cli-github-cli         # GitHub PR and issue management
    - browser                # E2E testing and UI validation
```

**Why:** Full IDs eliminate ambiguity. Each tool has exactly one correct identifier.

#### ❌ DON'T: Use Short Names

Never use abbreviated or short names without prefixes:

```yaml
dependencies:
  tools:
    - supabase          # ❌ Ambiguous: mcp-supabase or cli-supabase-cli?
    - workspace         # ❌ Ambiguous: mcp-google-workspace or mcp-n8n?
    - github            # ❌ Ambiguous: cli-github-cli or mcp-github?
```

**Why:** Short names create ambiguity. Validation scripts cannot determine which tool you intended.

---

### 2. Tool ID Naming Conventions (Legacy)

#### Prefix Rules

Tool IDs follow a strict prefix convention based on tool type:

| Prefix | Type | Example | When to Use |
|--------|------|---------|-------------|
| `mcp-{name}` | MCP Server | `mcp-supabase` | API integrations, cloud services |
| `cli-{name}-cli` | CLI Wrapper | `cli-github-cli` | Command-line tools |
| `local-{name}` | Local Binary | `local-ffmpeg` | Local executables |
| *(no prefix)* | Core Tool | `browser`, `context7` | Framework built-ins |

#### Priority Order

When multiple tool types exist for the same service, use this priority:

1. **MCP servers (`mcp-*`)** - Preferred for API integrations
2. **CLI wrappers (`cli-*`)** - For command-line tools
3. **Local tools (`local-*`)** - For local binaries

**Example:** If both `mcp-github` and `cli-github-cli` exist, prefer `cli-github-cli` for GitHub operations since GitHub CLI is the official tool.

---

### 3. Inline Comment Standards (Legacy)

#### ✅ DO: Explain Tool Purpose

Comments should describe **what the tool does** and **when it's used**:

```yaml
- mcp-stripe            # Payment processing, subscriptions, invoices
- mcp-google-workspace  # Research documentation (Drive, Docs, Sheets)
- cli-github-cli        # PR reviews, issue management, repository operations
- browser               # E2E testing, UI validation, debugging
```

**Good Comment Characteristics:**
- Describes functional capability
- Mentions key use cases
- Explains value to the agent
- Concise but informative

#### ❌ DON'T: Just Repeat Tool Name

Avoid comments that merely restate the tool name:

```yaml
- mcp-stripe          # ❌ Stripe tool
- mcp-stripe          # ❌ For stripe
- mcp-stripe          # ❌ Stripe integration
```

**Why:** These comments provide no additional information beyond the tool ID itself.

---

### 4. Tool Categorization (Legacy)

For agents with multiple tools (>3), group them by functional category with comment headers:

```yaml
dependencies:
  tools:
    # Research & Documentation
    - mcp-google-workspace  # Drive, Docs, Sheets
    - mcp-exa               # Advanced web research
    - context7              # Library documentation

    # Development & Integration
    - mcp-supabase          # Database and auth
    - cli-github-cli        # GitHub operations
    - mcp-stripe            # Payment processing

    # Testing & Validation
    - browser               # E2E testing
    - mcp-n8n               # Workflow automation
```

**Standard Categories:**
- Research & Documentation
- Development & Integration
- Testing & Validation
- Data & Analytics
- Communication & Collaboration
- Infrastructure & DevOps

**Benefits:**
- Improved readability
- Easier to scan and understand agent capabilities
- Logical organization for maintenance

---

### 5. Real-World Examples (Legacy)

#### Good Example: analyst.md

```yaml
dependencies:
  tools:
    - mcp-google-workspace  # Research documentation (Drive, Docs, Sheets)
    - mcp-exa               # Advanced web research
    - context7              # Library documentation lookup
```

**Why This Works:**
- Full tool IDs used
- Clear, descriptive comments
- Logical order (documentation tools grouped)

#### Good Example: ux-expert.md

```yaml
dependencies:
  tools:
    - mcp-21st-dev-magic    # UI component generation and design system
    - browser               # Test web applications and debug UI
```

**Why This Works:**
- Correct prefixes (`mcp-`, no prefix for core tool)
- Comments explain specific use cases
- Minimal but complete

#### Good Example: dev.md (categorized)

```yaml
dependencies:
  tools:
    # Development Tools
    - cli-github-cli        # Manage branches, commits, PRs, code reviews
    - context7              # Look up library documentation during development
    
    # Infrastructure
    - mcp-supabase          # Database operations, migrations, queries
    - mcp-n8n               # Workflow automation and integration
    
    # Testing
    - browser               # Test web applications and debug UI
    - local-ffmpeg          # Process media files during development
```

**Why This Works:**
- Clear categorization
- Descriptive comments for each tool
- Mix of prefixes used correctly
- Easy to scan and maintain

---

### 6. Validation Checklist (Legacy)

Before committing agent file changes, verify:

- [ ] All tool references use full IDs (`mcp-`, `cli-`, `local-`, or core tool name)
- [ ] Each tool has an inline comment explaining its purpose
- [ ] Tools are grouped by category if more than 3 tools
- [ ] Tool IDs exist in `core-config.yaml` or 1MCP registry
- [ ] No ambiguous short names (e.g., `supabase` → `mcp-supabase`)
- [ ] Pre-commit validation passes (Story 3.22)

**Automated Validation:**
Run the validation script before committing:

```bash
cd outputs/architecture-map/schemas
node validate-tool-references.js
```

---

### 7. Common Mistakes (Legacy)

#### Mistake 1: Using npm Package Name

```yaml
# ❌ WRONG: Using npm package name
- @modelcontextprotocol/server-supabase

# ✅ CORRECT: Using tool ID
- mcp-supabase
```

**Fix:** Always use the registered tool ID from `core-config.yaml`, not the npm package name.

#### Mistake 2: Inconsistent Naming

```yaml
# ❌ WRONG: Various incorrect formats
- supabase              # Missing prefix
- Supabase              # Wrong capitalization
- supabase-mcp          # Wrong prefix order
- mcp_supabase          # Wrong separator

# ✅ CORRECT: Standard format
- mcp-supabase          # Lowercase, correct prefix, hyphen separator
```

**Fix:** Use lowercase with hyphen separator: `prefix-toolname`

#### Mistake 3: Missing Comments

```yaml
# ❌ WRONG: No context provided
- mcp-stripe
- mcp-supabase
- cli-github-cli

# ✅ CORRECT: Clear purpose explained
- mcp-stripe            # Payment processing and invoicing
- mcp-supabase          # Database operations and auth
- cli-github-cli        # GitHub repository management
```

**Fix:** Always include inline comments explaining the tool's purpose.

#### Mistake 4: Vague Comments

```yaml
# ❌ WRONG: Too vague
- mcp-google-workspace  # Google integration

# ✅ CORRECT: Specific use cases
- mcp-google-workspace  # Drive, Docs, Sheets for research
```

**Fix:** Be specific about which features/APIs are used and why.

#### Mistake 5: Tool Not in Registry

```yaml
# ❌ WRONG: Using unregistered tool
- mcp-custom-tool       # This tool doesn't exist in core-config.yaml
```

**Fix:** First register the tool in `core-config.yaml` or via the registration wizard (Story 3.23), then add to agent.

---

### 8. Tool Registration (Legacy)

#### Before Adding a Tool to an Agent

1. **Verify tool exists:**
   ```bash
   # Check if tool is registered
   grep -r "mcp-toolname" .aios-core/core-config.yaml
   ```

2. **If tool doesn't exist, register it first:**
   - Use the MCP tool registration wizard (Story 3.23)
   - Or manually add to `core-config.yaml`

3. **Then add to agent file following this guide**

#### Finding Available Tools

```bash
# List all registered tools
grep -A 1 "tools:" .aios-core/core-config.yaml

# Search for specific tool type
grep "mcp-" .aios-core/core-config.yaml
```

---

### 9. Migration Guide (Legacy)

#### For Existing Agents with Non-Compliant References

If your agent file has short names or incorrect formats:

##### Step 1: Identify Issues

```bash
# Find short name references
grep -r "- supabase$" .aios-core/agents/
grep -r "- github$" .aios-core/agents/
grep -r "- workspace$" .aios-core/agents/
```

##### Step 2: Look Up Correct Tool ID

Check `core-config.yaml` for the full tool ID:

```bash
grep -B 2 -A 2 "supabase" .aios-core/core-config.yaml
```

##### Step 3: Update Agent File

Replace short name with full ID and add comment:

```yaml
# Before
- supabase

# After
- mcp-supabase          # Database operations and auth
```

##### Step 4: Validate

```bash
cd outputs/architecture-map/schemas
node parse-markdown-agents.js
node validate-tool-references.js
```

#### Audit Results (2025-10-28)

**Total Agents Audited:** 11  
**Agents with Issues:** 7  
**Total Non-Compliant References:** 19

##### High Priority Agents (Core Team)

**dev.md** - 5 issues
- ❌ `github-cli` → ✅ `cli-github-cli`
- ❌ `supabase` → ✅ `mcp-supabase` (ambiguous!)
- ❌ `n8n` → ✅ `mcp-n8n`
- ❌ `ffmpeg` → ✅ `local-ffmpeg`
- ✅ `browser`, `context7` (correct)

**architect.md** - 4 issues
- ❌ `exa` → ✅ `mcp-exa`
- ❌ `github-cli` → ✅ `cli-github-cli`
- ❌ `supabase-cli` → ✅ `cli-supabase-cli`
- ❌ `railway-cli` → ✅ `cli-railway-cli`
- ✅ `context7` (correct)

**qa.md** - 2 issues
- ❌ `github-cli` → ✅ `cli-github-cli`
- ❌ `supabase` → ✅ `mcp-supabase` (ambiguous!)
- ✅ `browser`, `context7` (correct)

**po.md** - 3 issues
- ❌ `github-cli` → ✅ `cli-github-cli`
- ❌ `clickup` → ✅ Needs prefix (check if `mcp-clickup` or `cli-clickup`)
- ✅ `context7` (correct)

**sm.md** - 3 issues
- ❌ `github-cli` → ✅ `cli-github-cli`
- ❌ `clickup` → ✅ Needs prefix (check if `mcp-clickup` or `cli-clickup`)
- ✅ `context7` (correct)

##### Medium Priority Agents

**pm.md** - No tool dependencies (OK)

**ux-expert.md** - No tool dependencies listed (OK)

**analyst.md** - Not audited in current scan

**aios-orchestrator.md** - 2 issues (if has tools)

**aios-master.md** - 2 issues (if has tools)

##### Summary

| Priority | Agents | Issues | Estimated Fix Time |
|----------|--------|--------|-------------------|
| High | 5 agents | 17 issues | 45-60 minutes |
| Medium | 3 agents | 2 issues | 10-15 minutes |
| Low | 3 agents | 0 issues | 0 minutes |
| **Total** | **11 agents** | **19 issues** | **55-75 minutes** |

#### Migration Priority

**High Priority** (update first):
- `dev.md` (5 issues) - Most used developer agent
- `architect.md` (4 issues) - Architecture decisions
- `qa.md`, `po.md`, `sm.md` (2-3 issues each) - Core workflow agents

**Medium Priority**:
- `aios-orchestrator.md`, `aios-master.md` - Framework agents

**Low Priority**:
- Agents without tool dependencies

**Estimated Effort:**
- Per agent: 5-10 minutes
- High priority agents: ~1 hour
- Total (all agents): 55-75 minutes
- Can be done incrementally (not blocking)

---

## Quick Reference

### 1MCP Mode

```yaml
dependencies:
  tools:
    # [Preset Category - e.g., aios-dev]
    - toolname    # Purpose and key use cases
```

**Prefixes:** None (short names only)  
**Validation:** `node outputs/architecture-map/schemas/validate-tool-references.js`

### Legacy Mode

#### Standard Format Template

```yaml
dependencies:
  tools:
    # [Category Name - optional for >3 tools]
    - prefix-toolname    # Purpose and key use cases
```

#### Prefix Quick Reference

- `mcp-*` → MCP servers (APIs, cloud services)
- `cli-*-cli` → CLI wrappers  
- `local-*` → Local binaries
- *(no prefix)* → Core framework tools

#### Validation Command

```bash
node outputs/architecture-map/schemas/validate-tool-references.js
```

---

## Related Documentation

- **Story 3.3**: Original issue that motivated these standards
- **Story 3.21**: Automated tool reference validation script
- **Story 3.22**: Pre-commit hook that enforces standards
- **Story 3.23**: MCP tool registration workflow
- **Story 3.30**: Will add 1MCP mode standards (future)

---

## Questions or Issues?

If you encounter:
- Tool references that don't match any registered tool
- Ambiguity in which tool ID to use
- Questions about categorization

**Contact:** Architecture team or check `.aios-core/core-config.yaml` registry

---

**Document Version:** 2.0  
**Created:** 2025-10-28 (Story 3.24)  
**Updated:** 2025-10-28 (Story 3.30 - Added 1MCP Mode Standards)  
**Created by:** James (@dev)  
**Status:** Official Standard - DUAL MODE (1MCP + Legacy)

