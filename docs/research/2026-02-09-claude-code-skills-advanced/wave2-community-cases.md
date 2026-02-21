# Deep Research: Community Cases - Real Projects Using Claude Code Advanced Features

**Date:** 2026-02-09
**Researcher:** deep-researcher agent (teams-researcher)
**Sources consulted:** 20+ unique sources, 12+ pages deep-read
**Status:** Complete

---

## TL;DR

- **Anthropic official**: anthropics/skills repo has official skill packs (docx, pdf, pptx, xlsx, skill-creator) + partner skills from Vercel, Stripe, Cloudflare, Trail of Bits
- **obra/superpowers**: Most mature community framework (accepted into Anthropic marketplace Jan 2026), implements complete TDD-driven methodology with 12+ skills and subagent-driven development
- **wshobson/agents**: Largest collection - 112 agents, 146 skills, 79 tools, 73 plugins, 16 orchestrators organized by model tier (Opus/Sonnet/Haiku)
- **eddiemessiah/config-claude-code**: Battle-tested hackathon-winning config with 9 agents, 10 commands, full hook system
- **ChrisWiles/claude-code-showcase**: JIRA-to-PR pipeline, skill evaluation hooks, scheduled agent workflows
- **Anthropic internal**: Growth Marketing team generates hundreds of ads in minutes; Legal team built prototype systems; Data Scientists build React apps without TypeScript knowledge
- **SkillsMP marketplace**: 160,000+ agent skills compatible with Claude Code, Codex CLI, ChatGPT
- **awesome-agent-skills (VoltAgent)**: 300+ skills from official dev teams (Anthropic, Google Labs, Vercel, Stripe, Cloudflare, etc.)

---

## 1. Official Anthropic Resources

### anthropics/skills Repository

**Structure:**
```
anthropics/skills/
├── .claude-plugin/          # Plugin configuration
├── skills/                  # Official skill implementations
│   ├── docx/SKILL.md        # Word documents (source-available)
│   ├── pdf/SKILL.md         # PDF manipulation (source-available)
│   ├── pptx/SKILL.md        # PowerPoint (source-available)
│   ├── xlsx/SKILL.md        # Excel (source-available)
│   ├── skill-creator/SKILL.md  # Interactive skill creation
│   ├── algorithmic-art/SKILL.md # Generative art with p5.js
│   ├── canvas-design/SKILL.md   # Visual design PNG/PDF
│   ├── frontend-design/SKILL.md # React + Tailwind
│   ├── web-artifacts-builder/SKILL.md # HTML artifacts
│   ├── mcp-builder/SKILL.md     # MCP server creation
│   ├── webapp-testing/SKILL.md  # Playwright testing
│   ├── slack-gif-creator/SKILL.md # Animated GIFs
│   ├── brand-guidelines/SKILL.md # Anthropic brand
│   └── internal-comms/SKILL.md  # Status reports
├── spec/                    # Agent Skills specification
└── template/                # Skill template
```

**Licensing:** Most skills Apache 2.0 (open source). Document skills (docx, pdf, pptx, xlsx) are source-available (not open source).

Source: [github.com/anthropics/skills](https://github.com/anthropics/skills)

### Anthropic's Agent Skills Philosophy

Key design principles from Anthropic's engineering blog:

1. **Progressive Disclosure**: Metadata → Core SKILL.md → Referenced resources. Only load what's needed.
2. **Code Execution Integration**: Skills bundle Python/Bash scripts for deterministic operations (sorting, PDF field extraction)
3. **Evaluation-First**: Identify capability gaps through testing before building skills
4. **Context Window Management**: Agents with filesystem access don't need entire skill in context simultaneously

> "Skills transform general-purpose agents into domain-specific specialists by packaging procedural knowledge into composable, discoverable capabilities." — [Anthropic Engineering Blog](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)

### How Anthropic Internal Teams Use Claude Code

| Team | Use Case | Impact |
|------|----------|--------|
| **Growth Marketing** | Agentic workflow: CSV with hundreds of ads → identify underperformers → generate variations | "Hundreds of new ads in minutes instead of hours" |
| **Growth Marketing** | Figma plugin: swap headlines/descriptions across ad variations | "Hours of copy-pasting to half a second per batch" |
| **Security Engineering** | TDD workflow transformation | "Problems that take 10-15 min resolve 3x faster" |
| **Data Infrastructure** | K8s incident response: screenshot → diagnosis → remediation commands | "Saved 20 minutes during system outage" |
| **Inference Team** | Translate tests to unfamiliar languages (Rust) | Native-language tests without manual conversion |
| **Product Design** | Figma → autonomous feature development loops | Edge cases discovered during design, not development |
| **Data Scientists** | Build React apps for RL visualization | "Built entire React applications without TypeScript fluency" |
| **Legal Team** | Prototype "phone tree" systems | No traditional dev resources needed |
| **Infrastructure** | Codebase onboarding for new data scientists | Replaces traditional catalog tools |

Source: [Anthropic Blog](https://claude.com/blog/how-anthropic-teams-use-claude-code)

---

## 2. Major Community Frameworks

### obra/superpowers (Most Mature)

**Status:** Accepted into Anthropic marketplace (Jan 15, 2026)
**Impact:** 2-3x development acceleration reported

**Complete Skill Set:**

| Category | Skills |
|----------|--------|
| **Testing** | Test-Driven Development (RED-GREEN-REFACTOR) |
| **Debugging** | Systematic Debugging (4-phase root cause), Verification Before Completion |
| **Collaboration** | Brainstorming, Writing Plans, Executing Plans, Dispatching Parallel Agents, Code Review (requesting + receiving), Git Worktrees, Finishing Branch, Subagent-Driven Development |
| **Meta** | Writing Skills, Using Superpowers |

**Methodology (7-Step Workflow):**
1. Brainstorming — refine ideas through questions before coding
2. Git Worktrees — isolated development branches
3. Planning — 2-5 minute tasks with exact specifications
4. Subagent-Driven Development — fresh agent per task with two-stage review
5. TDD — RED/GREEN/REFACTOR enforced
6. Code Review — plan-based validation with severity blocking
7. Branch Completion — verify, merge decision, cleanup

**Key Innovation:** Autonomous multi-hour sessions. "It's not uncommon for Claude to work autonomously for a couple hours at a time without deviating from the plan."

**Commands:** `/brainstorm`, `/write-plan`, `/go`

Source: [github.com/obra/superpowers](https://github.com/obra/superpowers), [blog.fsck.com](https://blog.fsck.com/2025/10/09/superpowers/)

### wshobson/agents (Largest Collection)

**Scale:**
- 112 specialized agents
- 146 agent skills
- 79 development tools
- 73 focused plugins
- 16 multi-agent workflow orchestrators

**Agent Tier Model:**

| Tier | Model | Count | Use Case |
|------|-------|-------|----------|
| **Tier 1** | Opus 4.5 | 42 | Critical architecture, security, code review, production coding |
| **Tier 2** | Flexible | 42 | AI/ML, backend, frontend/mobile, specialized domains |
| **Tier 3** | Sonnet | 51 | Docs, testing, debugging, networking, API docs |
| **Tier 4** | Haiku | 18 | SEO, deployment, simple docs, sales, content |

**Plugin Categories (24):**
Development (4), Infrastructure (5), Security (4), Languages (7), Workflows (5), Documentation, Testing, AI/ML, Data, Databases, Operations, Performance, Payments, Gaming, Marketing, Business, Blockchain, and more.

**Progressive Loading:** Each plugin averages 3.4 components. Installing Python development loads 3 agents + 1 tool + 16 skills (~1,000 tokens).

Source: [github.com/wshobson/agents](https://github.com/wshobson/agents)

### eddiemessiah/config-claude-code (Hackathon Winner)

**Validation:** Won Anthropic x Forum Ventures hackathon (Sep 2025) building zenith.chat entirely in Claude Code. Evolved over 10+ months of intensive use.

**Configuration:**

| Component | Count | Examples |
|-----------|-------|---------|
| **Agents** | 9 | Planner, Architect, TDD Guide, Code Reviewer, Security Reviewer, Build Error Resolver, E2E Runner, Refactor Cleaner, Doc Updater |
| **Commands** | 10 | `/tdd`, `/plan`, `/e2e`, `/code-review`, `/build-fix`, `/refactor-clean`, `/test-coverage`, `/update-codemaps`, `/update-docs` |
| **Rules** | 8 | Security, coding style, testing, git workflow, agent delegation, performance, API patterns, hooks |
| **Skills** | 7+ | Coding standards, Backend patterns, Frontend patterns, TDD workflow, Security review, ClickHouse analytics |

**Key Insight:** "Context window management is critical — 200K shrinks to ~70K with excessive MCPs. Maintain under 80 active tools."

Source: [github.com/eddiemessiah/config-claude-code](https://github.com/eddiemessiah/config-claude-code)

### ChrisWiles/claude-code-showcase (Workflow Automation)

**Notable Innovations:**

1. **Skill Evaluation Hooks**: Pattern-matching system suggests relevant skills based on prompt keywords
2. **JIRA-to-PR Pipeline**: `/ticket` command fetches JIRA tickets, reads acceptance criteria, searches codebase, creates branches, implements features, updates status
3. **Scheduled Agent Workflows**: Monthly docs sync, weekly code quality reviews, biweekly dependency audits
4. **Multi-System MCP Integration**: JIRA + GitHub + Slack + Sentry + PostgreSQL

**Structure:**
```
.claude/
├── agents/code-reviewer.md
├── commands/onboard.md, pr-review.md, ticket.md
├── hooks/skill-eval.sh, skill-eval.js, skill-rules.json
├── skills/testing-patterns/, graphql-schema/, core-components/
├── rules/code-style.md, security.md
└── settings.json (4 hook event types)
```

Source: [github.com/ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)

### rohitg00/pro-workflow (Battle-Tested Patterns)

**794 GitHub stars, 37 commits**

**Core Workflows:**
- Self-Correction Loop (auto-learns from corrections)
- Parallel Worktrees (work while Claude thinks)
- Wrap-Up Ritual (session closure protocol)
- Split Memory (modular CLAUDE.md)
- Batch Review at Checkpoints (80/20 principle)

**Unique Features:**
- **Scout Agent**: Confidence-gated exploration with readiness scoring (0-100 scale)
- **Replay System**: `/replay` surfaces past learnings from SQLite before starting tasks
- **Handoff Protocol**: `/handoff` generates structured session transitions
- **Adaptive Quality Gates**: Thresholds adjust based on correction history

**Memory Architecture:** SQLite at `~/.pro-workflow/data.db` with FTS5 full-text search across 10 learning domains.

Source: [github.com/rohitg00/pro-workflow](https://github.com/rohitg00/pro-workflow)

### OneRedOak/claude-code-workflows (AI-Native Startup)

**3.6K stars, 534 forks**

Three production workflows from an AI-native startup, inspired by Anthropic's own development process:

1. **Code Review Workflow**: Dual-loop architecture (automated + human), slash commands + GitHub Actions
2. **Security Review Workflow**: OWASP Top 10, severity-classified findings, remediation guidance
3. **Design Review Workflow**: Playwright MCP for browser automation, UI/UX + accessibility compliance

Source: [github.com/OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)

---

## 3. Skills Ecosystem & Marketplaces

### SkillsMP (Agent Skills Marketplace)

- **Scale:** 160,000+ agent skills
- **Compatibility:** Claude Code, Codex CLI, ChatGPT
- **URL:** [skillsmp.com](https://skillsmp.com/)

### awesome-agent-skills (VoltAgent)

- **Scale:** 300+ skills from official dev teams
- **Official Partners:** Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Trail of Bits, Sentry, Expo, Hugging Face
- **Community:** Additional community-built skills

Source: [github.com/VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

### awesome-claude-skills (travisvn)

Curated list including notable skills:

| Skill | Description |
|-------|-------------|
| **obra/superpowers** | Complete development methodology (TDD, debugging, collaboration) |
| **Trail of Bits Security** | CodeQL/Semgrep analysis, vulnerability detection |
| **ios-simulator-skill** | iOS app building and navigation automation |
| **loki-mode** | Multi-agent autonomous startup system (37 AI agents) |
| **ffuf-web-fuzzing** | Expert web fuzzing with authenticated requests |
| **claude-d3js-skill** | D3.js data visualizations |
| **claude-scientific-skills** | Scientific libraries and databases |

Source: [github.com/travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)

### Subagent Collections

| Repository | Agents | Focus |
|-----------|--------|-------|
| **0xfurai/claude-code-subagents** | 100+ | Domain-specific specialists, auto-invoked by context |
| **lst97/claude-code-sub-agents** | Multiple | Full-stack development personal use |
| **vijaythecoder/awesome-claude-agents** | Multiple | AI development team simulation |
| **davepoon/claude-code-subagents-collection** | Hub | Aggregation of skills, agents, commands, hooks |

Source: Various GitHub repos

---

## 4. Third-Party Orchestration Tools

### claude-flow (ruvnet)

- **Scale:** 60+ specialized agents, 170+ MCP tools
- **Downloads:** ~500K
- **Monthly Active Users:** ~100K across 80+ countries
- **Performance:** 84.8% SWE-Bench, 75% cost savings
- **Features:** Hive Mind system, self-learning SONA, fault-tolerant consensus

Source: [github.com/ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)

### oh-my-claudecode

5 execution modes: Autopilot, Ultrapilot (3-5x parallel), Swarm (SQLite-based atomic claiming), Pipeline (sequential chains), Ecomode (30-50% token savings).

Source: [github.com/Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)

### claude-squad

Multi-tool agent management: Claude Code + Aider + Codex + OpenCode + Amp. Git worktree isolation.

### Compound Engineering Plugin

Structured workflow: `/workflows:plan` (feature → implementation plans), `/workflows:review` (multi-specialist code review), `/workflows:compound` (learning documentation). Philosophy: 80% planning, 20% execution.

---

## 5. Patterns Observed Across Community

### Common Architecture Patterns

1. **Tiered Model Selection**: Opus for critical decisions, Sonnet for general work, Haiku for fast tasks
2. **Progressive Disclosure**: Metadata only at startup → full skill on match → resources on demand
3. **Hook-Driven Quality Gates**: PreToolUse, PostToolUse, UserPromptSubmit, Stop events
4. **Modular CLAUDE.md**: Split into rules/, references, context files to avoid token bloat
5. **Scheduled Agent Workflows**: Periodic automated maintenance (docs, dependencies, quality)
6. **Session Continuity**: Handoff protocols, memory persistence (SQLite, files, memory tool)

### What Separates Sophisticated Setups

| Level | Characteristics |
|-------|----------------|
| **Basic** | CLAUDE.md + few rules |
| **Intermediate** | Custom agents + commands + basic hooks |
| **Advanced** | Full skill packs + quality gates + CI integration + scheduled agents |
| **Expert** | Multi-agent orchestration + adaptive quality + memory persistence + marketplace skills |

### Key Community Insights

- "CLAUDE.md is the single highest-impact thing you can do — 10 minutes saves hours per session"
- "A well-configured project ships features 5-10x faster than vanilla Claude Code"
- "Context window management is critical — 200K shrinks to ~70K with excessive MCPs"
- "Skills should be evaluated by running representative tasks, not designed speculatively"
- "80% planning and review, 20% execution" (Compound Engineering philosophy)

---

## 6. Market Context (Feb 2026)

### Ecosystem Scale

- **SkillsMP Marketplace:** 160,000+ agent skills
- **awesome-agent-skills:** 300+ from official partners
- **skill-manager proposal:** Automated installer for 31,767+ community skills
- **Anthropic plugins:** Growing official marketplace

### Industry Adoption

- Gartner: 40% enterprise apps will include task-specific AI agents by end 2026
- CrewAI: $18M funding, 100K+ developers, 60% Fortune 500
- Claude Code Teams: Experimental but proven at scale (C compiler: 16 agents, $20K, 100K lines)

### Trends

1. **Skill standardization**: Anthropic's SKILL.md format becoming defacto standard
2. **Marketplace growth**: From custom configs to installable plugins
3. **Model mixing**: Tier-based agent assignment (Opus/Sonnet/Haiku) for cost optimization
4. **Agent teams**: Moving from single-session to multi-session coordination
5. **Quality gates**: Hooks evolving from simple checks to adaptive systems

---

## Sources

### Official Anthropic
- [anthropics/skills repository](https://github.com/anthropics/skills)
- [Equipping Agents for the Real World - Anthropic Blog](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)
- [How Anthropic Teams Use Claude Code](https://claude.com/blog/how-anthropic-teams-use-claude-code)

### Major Community Frameworks
- [obra/superpowers](https://github.com/obra/superpowers)
- [wshobson/agents (112 agents)](https://github.com/wshobson/agents)
- [eddiemessiah/config-claude-code](https://github.com/eddiemessiah/config-claude-code)
- [ChrisWiles/claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [rohitg00/pro-workflow](https://github.com/rohitg00/pro-workflow)
- [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)

### Skills Ecosystem
- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [SkillsMP Marketplace](https://skillsmp.com/)
- [0xfurai/claude-code-subagents](https://github.com/0xfurai/claude-code-subagents)

### Orchestration Tools
- [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
- [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)

### Guides & Blogs
- [Superpowers Blog Post](https://blog.fsck.com/2025/10/09/superpowers/)
- [Superpowers Complete Guide 2026](https://pasqualepillitteri.it/en/news/215/superpowers-claude-code-complete-guide)

---

## Gaps

1. **Performance benchmarks**: No standardized benchmarks comparing community frameworks
2. **Cost comparison**: No data on cost-per-feature across different setups
3. **Enterprise adoption patterns**: Limited visibility into how large companies configure Claude Code
4. **Skill composition**: Limited documentation on how to compose multiple skill packs without conflicts
5. **Security audit**: No independent security audit of popular community skills/plugins
