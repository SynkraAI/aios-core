# 1MCP AIOS Integration Guide

Complete guide for integrating 1MCP with AIOS agents and workflows.

---

## Overview

1MCP serves as the MCP aggregation layer for AIOS, providing preset-based tool access with 85% token reduction.

```
┌─────────────────────────────────────────┐
│          AIOS Agents Layer              │
│  @dev, @qa, @architect, @po, @sm, etc.  │
└──────────────┬──────────────────────────┘
               │ Agent-specific preset
               ▼
┌─────────────────────────────────────────┐
│          1MCP Aggregator                │
│  ├─ aios-dev (github, browser)          │
│  ├─ aios-research (context7, browser)   │
│  └─ aios-docker (docker, browser)       │
└──────────────┬──────────────────────────┘
               │ HTTP endpoint
               ▼
┌─────────────────────────────────────────┐
│          MCP Servers                    │
│  ├─ GitHub MCP                          │
│  ├─ Browser MCP                         │
│  ├─ Context7 MCP                        │
│  └─ Docker MCP                          │
└─────────────────────────────────────────┘
```

---

## Agent Preset Mapping

### Core Agents

#### @dev (Developer Agent)

**Preset:** `aios-dev`
**MCPs:** github, browser
**Token Budget:** ~35K

**Use Cases:**
- Story implementation from `docs/stories/*.md`
- Code review and validation
- Pull request creation
- Bug fixing and refactoring

**Workflow Example:**
```yaml
# story-004.8.md
---
agent: dev
preset: aios-dev
---

## Tasks
- [ ] Phase 1: Remove private code
- [ ] Phase 2: Update documentation
- [ ] Phase 3: Create release

## Tools Used (via 1MCP)
- github.search_code: Find files to update
- github.create_pr: Create pull request
- browser.navigate: Verify deployment
```

#### @qa (Quality Assurance Agent)

**Preset:** `aios-dev`
**MCPs:** github, browser
**Token Budget:** ~35K

**Use Cases:**
- Test execution and validation
- Bug reporting to GitHub
- Story acceptance verification
- Integration testing

**Workflow Example:**
```yaml
# Task: qa-review-story.md
agent: qa
preset: aios-dev

steps:
  1. Read acceptance criteria
  2. Execute tests (filesystem + browser)
  3. Verify functionality (browser.navigate)
  4. Report issues (github.create_issue)
  5. Update story status
```

#### @architect (Systems Architect Agent)

**Preset:** `aios-research`
**MCPs:** context7, browser
**Token Budget:** ~50K

**Use Cases:**
- Architecture design and research
- Framework evaluation
- API reference lookup
- Documentation writing

**Workflow Example:**
```yaml
# Task: architect-research-nextjs.md
agent: architect
preset: aios-research

steps:
  1. Query Context7: Next.js App Router docs
  2. Browse examples: browser.navigate
  3. Research patterns: context7 + browser
  4. Document findings: filesystem.write
```

#### @po (Product Owner Agent)

**Preset:** `aios-dev`
**MCPs:** github, browser
**Token Budget:** ~35K

**Use Cases:**
- Story creation and management
- Backlog prioritization
- Acceptance criteria definition
- Stakeholder communication

**Workflow Example:**
```yaml
# Task: po-create-story.md
agent: po
preset: aios-dev

steps:
  1. Read epic context
  2. Create story file (filesystem.write)
  3. Search related stories (github.search_code)
  4. Link to GitHub issue (github.create_issue)
  5. Update backlog
```

#### @sm (Scrum Master Agent)

**Preset:** `aios-dev`
**MCPs:** github, browser
**Token Budget:** ~35K

**Use Cases:**
- Sprint planning
- Team coordination
- Blocker resolution
- Velocity tracking

**Workflow Example:**
```yaml
# Task: sm-plan-sprint.md
agent: sm
preset: aios-dev

steps:
  1. Review open stories (filesystem.read)
  2. Check GitHub issues (github.list_issues)
  3. Calculate velocity (github.search_code)
  4. Generate sprint plan (filesystem.write)
```

### Specialized Agents

#### @analyst (Data Analyst Agent)

**Preset:** `aios-research`
**MCPs:** context7, browser
**Token Budget:** ~50K

**Use Cases:**
- Research and analysis
- Data collection and scraping
- Report generation
- Trend identification

#### @devops (DevOps Agent)

**Preset:** `aios-docker` (when needed)
**MCPs:** docker, browser
**Token Budget:** ~18K

**Use Cases:**
- Container management
- Deployment automation
- Infrastructure monitoring
- Service orchestration

---

## Task Integration

### Task Definition Format

```markdown
---
name: Task Name
agent: dev
preset: aios-dev
mcp_requirements:
  - github: ["search_code", "create_pr"]
  - browser: ["navigate", "screenshot"]
token_budget: 35K
---

# Task Steps

## Step 1: Preparation
**Tools:** filesystem.read

## Step 2: Implementation
**Tools:** github.search_code, filesystem.write

## Step 3: Verification
**Tools:** browser.navigate, browser.screenshot

## Step 4: Finalization
**Tools:** github.create_pr
```

### Task Execution Flow

```
User activates agent → Claude Code loads preset → 1MCP filters tools → Agent executes task
```

**Example:**
```bash
User: "@dev implement story 004.8"

1. Claude Code sees agent: @dev
2. Loads preset: aios-dev (configured in ~/.claude.json)
3. 1MCP returns: github + browser tools (~35K tokens)
4. Agent executes story workflow:
   - Read story file
   - Search related code (github)
   - Implement changes
   - Create PR (github)
   - Verify deployment (browser)
```

---

## Story Integration

### Story File Format

```markdown
---
story: Story 4.8
title: Repository Open-Source Migration
agent: dev
preset: aios-dev
epic: Epic 4 - Partner Foundation
status: in_progress
---

# Story 4.8: Repository Open-Source Migration

## Context
AIOS needs to be published as open-source...

## Tasks
- [ ] Phase 1: Remove private code
- [ ] Phase 2: Update documentation
- [ ] Phase 3: Create release

## Acceptance Criteria
- [ ] No private code in repository
- [ ] All secrets removed
- [ ] Documentation updated
- [ ] MIT license applied

## MCP Usage
**Preset:** aios-dev (github + browser)
**Token Budget:** ~35K
**Tools:**
- github.search_code: Find files to update
- github.create_pr: Create pull request
- browser.navigate: Verify GitHub Pages

## Implementation Notes
Story follows AIOS development workflow with 1MCP integration.
```

### Story Execution

```bash
# User command
@dev implement story-004.8

# AIOS flow:
1. Load story file: docs/stories/story-004.8.md
2. Extract agent: @dev
3. Load preset: aios-dev (from story metadata)
4. Execute tasks sequentially:
   - [ ] Phase 1 → [x] Phase 1
   - [ ] Phase 2 → [x] Phase 2
   - [ ] Phase 3 → [x] Phase 3
5. Update story progress
6. Report completion
```

---

## Configuration Files

### ~/.claude.json (User-Level)

```json
{
  "mcpServers": {
    "1mcp-dev": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-dev",
      "description": "Default preset for development tasks"
    },
    "1mcp-research": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-research",
      "description": "Research-heavy tasks (docs lookup)"
    },
    "1mcp-docker": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-docker",
      "description": "Docker/container management (on-demand)"
    }
  }
}
```

### ~/.1mcp/config.json (1MCP Config)

```json
{
  "mcps": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "enabled": true
    },
    "browser": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "enabled": true
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "enabled": true
    },
    "docker": {
      "command": "npx",
      "args": ["-y", "@docker/mcp-server-docker-desktop"],
      "enabled": false
    }
  },
  "presets": {
    "aios-dev": {
      "filter": ["github", "browser"],
      "description": "Development preset"
    },
    "aios-research": {
      "filter": ["context7", "browser"],
      "description": "Research preset"
    },
    "aios-docker": {
      "filter": ["docker", "browser"],
      "description": "Docker preset"
    }
  },
  "server": {
    "port": 3050,
    "host": "127.0.0.1"
  }
}
```

---

## Agent Workflows

### @dev Story Implementation Workflow

```
1. Story Activation
   └─> @dev activated with story-004.8.md

2. Preset Loading
   └─> 1MCP loads aios-dev preset (github + browser)

3. Story Parsing
   └─> Extract tasks, acceptance criteria, context

4. Task Execution (Sequential)
   Phase 1: Remove private code
   ├─> github.search_code: Find private files
   ├─> filesystem.read: Verify content
   ├─> filesystem.write: Remove/update files
   └─> Mark task complete

   Phase 2: Update documentation
   ├─> filesystem.read: Read current docs
   ├─> context7: Research best practices (if needed)
   ├─> filesystem.write: Update docs
   └─> Mark task complete

   Phase 3: Create release
   ├─> github.create_pr: Open pull request
   ├─> browser.navigate: Verify PR created
   └─> Mark task complete

5. Story Completion
   └─> Update story status, notify user
```

### @architect Research Workflow

```
1. Research Task Activation
   └─> @architect activated with research query

2. Preset Loading
   └─> 1MCP loads aios-research preset (context7 + browser)

3. Research Execution
   Step 1: Query Documentation
   ├─> context7: Look up API reference
   └─> Extract key information

   Step 2: Browse Examples
   ├─> browser.navigate: Find code examples
   ├─> browser.scrape: Extract patterns
   └─> Analyze implementations

   Step 3: Synthesize Findings
   ├─> Combine context7 + browser results
   ├─> Generate recommendations
   └─> filesystem.write: Document findings

4. Report Generation
   └─> Create markdown report with citations
```

---

## Best Practices

### 1. Preset Selection

**Always use the minimal preset needed:**

| Scenario | Preset | Reason |
|----------|--------|--------|
| Story implementation | aios-dev | GitHub + Browser sufficient |
| Architecture design | aios-research | Need docs lookup |
| Docker deployment | aios-docker | Specialized tools only |
| Multi-domain task | aios-full | Last resort (expensive) |

### 2. Agent Specialization

**Don't mix agent responsibilities:**

❌ Bad:
```markdown
# @dev doing architecture research
# Using aios-full preset (expensive)
```

✅ Good:
```markdown
# @architect does research (aios-research)
# @dev implements design (aios-dev)
```

### 3. Token Budget Monitoring

**Track token usage regularly:**

```bash
# Check current budget
/context

# Expected by preset:
# aios-dev: 25-40K
# aios-research: 40-60K
# aios-docker: 15-20K
# aios-full: 60-80K

# If higher: Check for duplicate MCPs in ~/.claude.json
```

### 4. Preset Switching

**Static approach (recommended):**
- Configure one primary preset in `~/.claude.json`
- Switch manually when needed (edit config, restart Claude)

**Dynamic approach (advanced):**
- Configure all presets in `~/.claude.json`
- Mention preset in prompts: "Using aios-research, research Next.js"

### 5. Error Handling

**If MCP tools fail:**

```bash
# 1. Check 1MCP server
curl http://127.0.0.1:3050/health

# 2. Verify preset
curl http://127.0.0.1:3050/mcp?preset=aios-dev

# 3. Check MCP status
1mcp mcp list

# 4. Restart if needed
pkill -f "1mcp serve"
1mcp serve --port 3050 --host 127.0.0.1
```

---

## Monitoring Integration

### Token Usage Tracking

```bash
# Create monitoring script
cat > check-1mcp-tokens.sh << 'EOF'
#!/bin/bash
echo "=== 1MCP Token Budget Check ==="
echo "Date: $(date)"
echo ""
echo "Preset: aios-dev"
curl -s http://127.0.0.1:3050/mcp?preset=aios-dev | \
  jq '.tools | length' | \
  awk '{print "Tools available: " $1 " (~35K tokens)"}'
echo ""
echo "Preset: aios-research"
curl -s http://127.0.0.1:3050/mcp?preset=aios-research | \
  jq '.tools | length' | \
  awk '{print "Tools available: " $1 " (~50K tokens)"}'
EOF

chmod +x check-1mcp-tokens.sh
./check-1mcp-tokens.sh
```

### Health Monitoring

```bash
# Create health check script
cat > check-1mcp-health.sh << 'EOF'
#!/bin/bash
echo "=== 1MCP Health Check ==="
echo ""

# Server status
if curl -sf http://127.0.0.1:3050/health > /dev/null; then
  echo "✓ Server: OK"
else
  echo "✗ Server: DOWN"
fi

# Preset availability
for preset in aios-dev aios-research aios-docker; do
  if curl -sf "http://127.0.0.1:3050/mcp?preset=$preset" > /dev/null; then
    echo "✓ Preset $preset: OK"
  else
    echo "✗ Preset $preset: FAIL"
  fi
done

# MCP status
echo ""
echo "MCP Status:"
1mcp mcp list | grep -E "(enabled|disabled)"
EOF

chmod +x check-1mcp-health.sh
./check-1mcp-health.sh
```

---

## Migration Guide

### From Direct MCPs to 1MCP

**Step 1: Backup**
```bash
cp ~/.claude.json ~/.claude.json.backup-$(date +%Y%m%d)
```

**Step 2: Install 1MCP**
```bash
npm install -g @1mcp/agent
```

**Step 3: Migrate MCPs**
```bash
# Add each MCP to 1MCP
1mcp mcp add github -- npx -y @modelcontextprotocol/server-github
1mcp mcp add browser -- npx -y @modelcontextprotocol/server-puppeteer
1mcp mcp add context7 -- npx -y @upstash/context7-mcp
```

**Step 4: Create Presets**
```bash
1mcp preset create aios-dev --filter "github,browser"
1mcp preset create aios-research --filter "context7,browser"
```

**Step 5: Update ~/.claude.json**
```json
{
  "mcpServers": {
    "1mcp-dev": {
      "type": "http",
      "url": "http://127.0.0.1:3050/mcp?preset=aios-dev"
    }
  }
}
```

**Step 6: Start Server & Verify**
```bash
1mcp serve --port 3050 --host 127.0.0.1
# In new terminal:
/context  # Should show ~35K tokens
```

---

## Troubleshooting

See `docs/guides/1mcp-troubleshooting.md` for complete troubleshooting guide.

**Quick Fixes:**

- **Tools not loading:** Check 1MCP server running
- **Token budget high:** Remove direct MCPs from `~/.claude.json`
- **Preset not found:** Run `1mcp preset list`, recreate if missing
- **Server crashes:** Use PM2 or increase Node.js memory

---

## Support

- **Full Guide:** `docs/guides/1mcp-implementation.md`
- **Quick Start:** `docs/guides/1mcp-quickstart.md`
- **Troubleshooting:** `docs/guides/1mcp-troubleshooting.md`
- **GitHub Issues:** `@synkra/aios-core/issues` (tag: `1mcp`)

---

**Version:** 1.0
**Status:** Production-Ready ✅
**Integration:** AIOS Framework
**Token Reduction:** 85% (280K → 40K)
