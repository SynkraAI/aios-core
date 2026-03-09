# Task: Discover Tools for Squad

**Task ID:** discover-tools
**Version:** 1.0
**Execution Type:** Agent
**Purpose:** Research and discover tools (MCPs, APIs, CLIs, Libraries, GitHub Projects) that can potentialize a squad's deliverables
**Orchestrator:** @squad-chief
**Mode:** Autonomous with human validation
**Quality Standard:** AIOS Level (comprehensive research, validated sources)

**Frameworks Used:**
- `data/tool-registry.yaml` → Known tools and capability mapping
- `data/quality-dimensions-framework.md` → Tool quality scoring
- `data/decision-heuristics-framework.md` → Tool selection logic

---

## Overview

This task automatically researches and discovers external tools that can enhance a squad's capabilities, reducing user dependency and maximizing delivered value.

**Philosophy:** "A squad should leverage ALL available tools to deliver maximum value with minimum user intervention."

```
INPUT (domain + use_cases + existing_capabilities)
    ↓
[PHASE 0: CAPABILITY GAP ANALYSIS]
    → Map required capabilities
    → Check what tools already provide
    → Identify gaps to fill
    ↓
[PHASE 1: MCP SERVER DISCOVERY]
    → Search official MCP repositories
    → Search GitHub for MCP servers
    → Validate and score findings
    ↓
[PHASE 2: API DISCOVERY]
    → Search for domain-specific APIs
    → Check public API directories
    → Evaluate pricing and reliability
    ↓
[PHASE 3: CLI TOOL DISCOVERY]
    → Search awesome-lists
    → Check brew/npm/pip packages
    → Verify cross-platform support
    ↓
[PHASE 4: GITHUB PROJECT DISCOVERY]
    → Search topic collections
    → Find automation projects
    → Identify reusable components
    ↓
[PHASE 5: LIBRARY DISCOVERY]
    → Search PyPI/npm
    → Find domain-specific SDKs
    → Check integration patterns
    ↓
[PHASE 6: SYNTHESIS & RECOMMENDATIONS]
    → Score all discoveries
    → Rank by impact vs effort
    → Generate integration plan
    ↓
OUTPUT: Tool Discovery Report + Updated tool-registry.yaml
```

---

## Inputs

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `domain` | string | Yes | Squad domain | `"copywriting"`, `"legal"`, `"data"` |
| `use_cases` | list | Yes | Key squad use cases | `["sales pages", "email sequences"]` |
| `existing_tools` | list | No | Tools already in use | `["exa", "web_fetch"]` |
| `capability_gaps` | list | No | Known capability gaps | `["pdf_processing", "email_sending"]` |
| `budget_tier` | enum | No | `"free_only"`, `"low_cost"`, `"enterprise"` | `"low_cost"` |

---

## Preconditions

- [ ] squad-chief agent is active
- [ ] WebSearch/EXA tool available (for research)
- [ ] WebFetch tool available (for page analysis)
- [ ] Write permissions for `data/tool-registry.yaml`
- [ ] Domain and use cases clearly defined

---

## PHASE 0: CAPABILITY GAP ANALYSIS

**Duration:** 5-10 minutes
**Checkpoint:** None (fast analysis)
**Mode:** Autonomous

### Step 0.1: Map Required Capabilities

**Actions:**
```yaml
capability_mapping:
  for_each_use_case:
    - use_case: "{use_case}"
      ask:
        - "What INPUT does this use case need?"
        - "What PROCESSING does it require?"
        - "What OUTPUT should it produce?"
        - "What INTEGRATIONS would enhance it?"

      derive:
        input_capabilities:
          - "web_research"        # If needs external info
          - "file_reading"        # If needs local files
          - "user_input"          # If needs user data
          - "api_data"            # If needs external data

        processing_capabilities:
          - "text_analysis"       # NLP, sentiment, etc.
          - "data_transformation" # ETL, formatting
          - "code_generation"     # If creates code
          - "image_processing"    # If handles images

        output_capabilities:
          - "file_generation"     # Creates files
          - "api_calls"           # Sends to external services
          - "notifications"       # Alerts/messages
          - "reports"             # Structured reports

        enhancement_capabilities:
          - "automation"          # Reduces manual work
          - "quality_checks"      # Validates output
          - "integration"         # Connects to other tools
```

### Step 0.2: Check Existing Tool Coverage

**Actions:**
```yaml
coverage_analysis:
  load: "data/tool-registry.yaml"

  for_each_capability:
    - check: "capability_mapping.{capability}"
      find_tools: true

      result:
        covered: ["tool1", "tool2"]
        partially_covered: ["tool3"]  # Has capability but limited
        not_covered: true/false

  output:
    coverage_report:
      fully_covered: []
      partially_covered: []
      gaps: []  # These need tool discovery
```

### Step 0.3: Prioritize Gaps

**Actions:**
```yaml
gap_prioritization:
  for_each_gap:
    - capability: "{gap}"
      score:
        impact: 0-10  # How much value does filling this gap add?
        frequency: 0-10  # How often is this capability needed?
        user_dependency: 0-10  # How much does gap require user intervention?

      priority: (impact * 0.4) + (frequency * 0.3) + (user_dependency * 0.3)

  output:
    prioritized_gaps:
      - capability: "..."
        priority: 8.5
        search_queries: []
```

**Output (PHASE 0):**
```yaml
phase_0_output:
  total_capabilities_needed: 15
  already_covered: 8
  partially_covered: 3
  gaps_to_research: 4
  prioritized_gaps:
    - capability: "pdf_processing"
      priority: 9.2
    - capability: "email_automation"
      priority: 8.5
    - capability: "competitor_monitoring"
      priority: 7.8
```

---

## PHASE 1: MCP SERVER DISCOVERY

**Duration:** 10-15 minutes
**Checkpoint:** SC_MCP_001 (MCP Discovery Gate)
**Mode:** Autonomous

### Step 1.1: Search Official MCP Repositories

**Actions:**
```yaml
official_mcp_search:
  sources:
    - url: "https://github.com/modelcontextprotocol/servers"
      type: "official"
      priority: 1

    - url: "https://github.com/anthropics/anthropic-tools"
      type: "official"
      priority: 1

    - url: "https://glama.ai/mcp/servers"
      type: "directory"
      priority: 2

  search_queries:
    - "MCP server {domain}"
    - "Model Context Protocol {use_case}"
    - "{domain} anthropic MCP"

  for_each_result:
    extract:
      - name
      - description
      - capabilities
      - installation
      - requirements
      - last_updated
      - stars
      - issues_count
```

### Step 1.2: Search GitHub for Community MCPs

**Actions:**
```yaml
github_mcp_search:
  queries:
    - query: "topic:mcp-server {domain}"
      type: "topic"
    - query: "mcp server {domain} in:readme"
      type: "code"
    - query: "model context protocol {use_case}"
      type: "repositories"

  filters:
    - stars: ">= 10"
    - updated: "within 6 months"
    - has_readme: true
    - has_license: true

  for_each_result:
    validate:
      - has_installation_docs: true
      - has_usage_examples: true
      - compatible_with_claude: true  # Check for anthropic/claude mentions
```

### Step 1.3: Score and Rank MCP Findings

**Actions:**
```yaml
mcp_scoring:
  criteria:
    official_source:
      weight: 0.30
      check: "Is from modelcontextprotocol or anthropic?"

    documentation:
      weight: 0.20
      check: "Has complete README?"

    maintenance:
      weight: 0.20
      check: "Updated in last 6 months?"

    community:
      weight: 0.15
      check: "Stars > 50? Active issues?"

    capability_match:
      weight: 0.15
      check: "Solves prioritized gap?"

  threshold: 6.0
  max_recommendations: 5
```

**Output (PHASE 1):**
```yaml
phase_1_output:
  mcps_found: 12
  mcps_qualified: 5
  top_recommendations:
    - name: "mcp-server-pdf"
      score: 8.5
      fills_gap: "pdf_processing"
      source: "https://github.com/..."
      install: "npm install @mcp/server-pdf"
```

---

## PHASE 2: API DISCOVERY

**Duration:** 10-15 minutes
**Checkpoint:** SC_API_001 (API Discovery Gate)
**Mode:** Autonomous

### Step 2.1: Search API Directories

**Actions:**
```yaml
api_directory_search:
  sources:
    - name: "RapidAPI"
      url: "https://rapidapi.com/search/{domain}"
      type: "marketplace"

    - name: "Public APIs"
      url: "https://github.com/public-apis/public-apis"
      type: "directory"

    - name: "API List"
      url: "https://apilist.fun"
      type: "directory"

    - name: "ProgrammableWeb"
      url: "https://www.programmableweb.com/category/{domain}/apis"
      type: "directory"

  search_queries:
    - "{domain} API"
    - "best {domain} APIs 2025 2026"
    - "{use_case} REST API"
    - "{domain} SaaS API integration"
```

### Step 2.2: Evaluate API Quality

**Actions:**
```yaml
api_evaluation:
  for_each_api:
    check:
      pricing:
        - has_free_tier: true/false
        - free_requests_per_month: N
        - paid_starting_price: "$X/month"

      reliability:
        - documented_uptime: "99.X%"
        - status_page_exists: true/false

      documentation:
        - openapi_spec: true/false
        - code_examples: true/false
        - sdk_available: ["python", "node", "etc"]

      authentication:
        - type: "api_key" | "oauth" | "jwt"
        - complexity: "simple" | "moderate" | "complex"

      rate_limits:
        - requests_per_second: N
        - requests_per_day: N
        - burst_limit: N
```

### Step 2.3: Match APIs to Capabilities

**Actions:**
```yaml
api_capability_matching:
  for_each_gap:
    - gap: "email_automation"
      matching_apis:
        - name: "SendGrid"
          match_score: 9.0
          free_tier: "100 emails/day"

        - name: "Mailgun"
          match_score: 8.5
          free_tier: "5000 emails/month"

    - gap: "competitor_monitoring"
      matching_apis:
        - name: "SimilarWeb API"
          match_score: 7.5
          free_tier: "Limited"
```

**Output (PHASE 2):**
```yaml
phase_2_output:
  apis_found: 25
  apis_with_free_tier: 15
  apis_recommended: 8
  top_recommendations:
    - name: "SendGrid"
      category: "email"
      fills_gap: "email_automation"
      free_tier: "100 emails/day"
      integration_effort: "low"
```

---

## PHASE 3: CLI TOOL DISCOVERY

**Duration:** 5-10 minutes
**Checkpoint:** None
**Mode:** Autonomous

### Step 3.1: Search Awesome Lists

**Actions:**
```yaml
awesome_list_search:
  sources:
    - "https://github.com/agarrharr/awesome-cli-apps"
    - "https://github.com/alebcay/awesome-shell"
    - "https://github.com/topics/awesome-{domain}"
    - "https://github.com/sindresorhus/awesome"

  search_within:
    - categories: ["{domain}", "productivity", "automation"]
    - keywords: ["{use_case}", "{capability}"]
```

### Step 3.2: Check Package Managers

**Actions:**
```yaml
package_manager_search:
  homebrew:
    query: "brew search {domain}"
    filter: "stars > 100"

  npm:
    query: "npm search {domain} cli"
    filter: "downloads > 1000/week"

  pip:
    query: "pip search {domain}"  # or pypi.org search
    filter: "downloads > 5000/month"
```

### Step 3.3: Validate CLI Tools

**Actions:**
```yaml
cli_validation:
  for_each_tool:
    check:
      - installation: "brew/npm/pip available?"
      - cross_platform: "macOS + Linux + Windows?"
      - documentation: "man page or --help?"
      - scriptable: "Can be called from bash?"
      - output_format: "JSON/YAML output available?"
```

**Output (PHASE 3):**
```yaml
phase_3_output:
  cli_tools_found: 18
  cli_tools_recommended: 6
  top_recommendations:
    - name: "jq"
      purpose: "JSON processing"
      install: "brew install jq"
      fills_gap: "data_transformation"
```

---

## PHASE 4: GITHUB PROJECT DISCOVERY

**Duration:** 10-15 minutes
**Checkpoint:** None
**Mode:** Autonomous

### Step 4.1: Search GitHub Topics

**Actions:**
```yaml
github_topic_search:
  queries:
    - "topic:{domain}"
    - "topic:{domain}-automation"
    - "topic:awesome-{domain}"
    - "topic:{use_case}"

  collections:
    - "https://github.com/collections/{domain}"

  filters:
    - stars: ">= 100"
    - language: ["Python", "JavaScript", "TypeScript", "Go"]
    - updated: "within 1 year"
    - has_license: ["MIT", "Apache-2.0", "BSD"]
```

### Step 4.2: Analyze Project Relevance

**Actions:**
```yaml
project_analysis:
  for_each_project:
    extract:
      - name
      - description
      - readme_summary
      - features_list
      - installation_steps
      - dependencies
      - api_available
      - cli_available

    score:
      - relevance_to_domain: 0-10
      - reusability: 0-10  # Can components be extracted?
      - maintenance: 0-10
      - documentation: 0-10
```

### Step 4.3: Identify Reusable Components

**Actions:**
```yaml
component_extraction:
  for_each_project:
    identify:
      - standalone_scripts: "Can run independently?"
      - library_functions: "Can be imported?"
      - api_endpoints: "Exposes REST/GraphQL?"
      - prompt_templates: "Has AI prompts?"
      - workflows: "Has automation scripts?"
```

**Output (PHASE 4):**
```yaml
phase_4_output:
  projects_found: 45
  projects_relevant: 12
  reusable_components: 8
  top_recommendations:
    - name: "landing-page-analyzer"
      stars: 1500
      fills_gap: "competitor_analysis"
      component: "analysis_script.py"
```

---

## PHASE 5: LIBRARY DISCOVERY

**Duration:** 5-10 minutes
**Checkpoint:** None
**Mode:** Autonomous

### Step 5.1: Search Package Registries

**Actions:**
```yaml
library_search:
  pypi:
    queries:
      - "{domain}"
      - "{use_case}"
      - "{domain} sdk"
    filters:
      - downloads: "> 10000/month"
      - python_version: ">= 3.8"

  npm:
    queries:
      - "{domain}"
      - "@{company}/{domain}"  # Scoped packages
    filters:
      - downloads: "> 5000/week"
      - node_version: ">= 16"
```

### Step 5.2: Evaluate Library Quality

**Actions:**
```yaml
library_evaluation:
  for_each_library:
    check:
      - documentation: "Has docs site?"
      - type_hints: "TypeScript/Python types?"
      - testing: "Test coverage > 80%?"
      - maintenance: "Last release < 6 months?"
      - dependencies: "Minimal dependencies?"
      - examples: "Usage examples?"
```

**Output (PHASE 5):**
```yaml
phase_5_output:
  libraries_found: 30
  libraries_recommended: 10
  top_recommendations:
    - name: "langchain"
      type: "python"
      fills_gap: "llm_orchestration"
      install: "pip install langchain"
```

---

## PHASE 6: SYNTHESIS & RECOMMENDATIONS

**Duration:** 5-10 minutes
**Checkpoint:** SC_TDR_001 (Tool Discovery Report Gate)
**Mode:** Interactive

### Step 6.1: Consolidate All Findings

**Actions:**
```yaml
consolidation:
  combine:
    - phase_1_output  # MCPs
    - phase_2_output  # APIs
    - phase_3_output  # CLIs
    - phase_4_output  # GitHub projects
    - phase_5_output  # Libraries

  deduplicate:
    - "Same tool found in multiple searches"

  categorize_by_gap:
    - gap: "pdf_processing"
      tools: [mcp-pdf, pdfplumber, poppler-cli]
```

### Step 6.2: Calculate Impact vs Effort Matrix

**Actions:**
```yaml
impact_effort_matrix:
  for_each_tool:
    impact_score:
      - capability_coverage: 0-10  # How much of gap does it fill?
      - quality_improvement: 0-10  # How much better is output?
      - automation_gain: 0-10      # How much manual work saved?

    effort_score:
      - installation_complexity: 0-10
      - integration_time: "hours/days"
      - cost: "$0/free | $X/month | enterprise"
      - learning_curve: "low | medium | high"

    roi_score: impact_score / effort_score

  quadrants:
    quick_wins: "High impact, low effort"
    strategic: "High impact, high effort"
    fill_ins: "Low impact, low effort"
    avoid: "Low impact, high effort"
```

### Step 6.3: Generate Integration Plan

**Actions:**
```yaml
integration_plan:
  immediate_actions:  # Quick wins
    - tool: "jq"
      action: "Add to CLI dependencies"
      effort: "5 minutes"

  short_term:  # This week
    - tool: "mcp-server-pdf"
      action: "Install and configure MCP"
      effort: "1 hour"

  medium_term:  # This month
    - tool: "SendGrid API"
      action: "Create email integration task"
      effort: "4 hours"

  evaluate_later:  # Need more info
    - tool: "Enterprise API X"
      reason: "Need to verify pricing"
```

### Step 6.4: Update Tool Registry

**Actions:**
```yaml
update_registry:
  file: "data/tool-registry.yaml"

  add_to_mcp_servers:
    - new discoveries from Phase 1

  add_to_domain_recommendations:
    domain: "{domain}"
    essential: [discovered_essential_tools]
    recommended: [discovered_recommended_tools]
    optional: [discovered_optional_tools]

  update_capability_mapping:
    - add new capability → tool mappings
```

**Checkpoint SC_TDR_001:**
```yaml
heuristic_id: SC_TDR_001
name: "Tool Discovery Report Complete"
blocking: true
criteria:
  - all_gaps_researched: true
  - at_least_1_tool_per_gap: true
  - impact_effort_scored: true
  - integration_plan_created: true
  - registry_updated: true
```

---

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Tool Discovery Report | `squads/{pack_name}/docs/tool-discovery-report.md` | Comprehensive research findings |
| Updated Registry | `data/tool-registry.yaml` | New tools added to global registry |
| Integration Plan | `squads/{pack_name}/docs/tool-integration-plan.md` | Prioritized implementation steps |
| Capability Map | `squads/{pack_name}/data/capability-tools.yaml` | Squad-specific capability → tool mapping |

---

## Output Templates

### Tool Discovery Report Template

```markdown
# Tool Discovery Report: {Squad Name}

**Generated:** {date}
**Domain:** {domain}
**Gaps Analyzed:** {N}
**Tools Discovered:** {total}

## Executive Summary

{1-paragraph summary of findings}

## Capability Gaps Identified

| Capability | Priority | Tools Found | Recommended |
|------------|----------|-------------|-------------|
| {gap} | {priority} | {count} | {tool_name} |

## Top Recommendations

### Quick Wins (Implement Now)

| Tool | Type | Fills Gap | Effort | Impact |
|------|------|-----------|--------|--------|
| {tool} | {mcp/api/cli} | {gap} | {effort} | {impact} |

### Strategic (Plan for)

{...}

## Detailed Findings

### MCP Servers
{detailed MCP findings}

### APIs
{detailed API findings}

### CLI Tools
{detailed CLI findings}

### GitHub Projects
{detailed project findings}

### Libraries
{detailed library findings}

## Integration Plan

### Immediate (Today)
- [ ] {action}

### Short-term (This Week)
- [ ] {action}

### Medium-term (This Month)
- [ ] {action}

## Next Steps

1. {next step}
2. {next step}
```

---

## Integration with Squad Creation

### When to Execute

This task should be executed:

1. **During Squad Creation** - Phase 0.5 (after Discovery, before Research)
   ```yaml
   # In wf-create-squad.yaml
   - id: phase_0_5
     name: "TOOL DISCOVERY"
     task: "tasks/discover-tools.md"
     inputs:
       domain: "{domain}"
       use_cases: "{use_cases}"
   ```

2. **When Adding New Use Cases** - To find tools for new capabilities

3. **Periodically** - Monthly refresh to discover new tools

### Task Dependencies

```yaml
depends_on:
  - "Phase 0: Discovery" # Need domain and use_cases

feeds_into:
  - "Phase 3: Creation" # Tools inform task design
  - "Phase 4: Integration" # Tools added to dependencies
```

---

## Validation Criteria

### Research Quality
- [ ] All priority gaps researched
- [ ] At least 3 sources searched per category
- [ ] Results validated (not just listed)

### Recommendations Quality
- [ ] Each recommendation has score
- [ ] Impact vs effort calculated
- [ ] Integration effort estimated

### Actionability
- [ ] Integration plan has concrete steps
- [ ] Quick wins identified
- [ ] Dependencies listed

---

## Error Handling

```yaml
error_handling:
  search_fails:
    - action: "Try alternative search queries"
    - fallback: "Mark gap as 'manual research needed'"

  no_tools_found:
    - action: "Expand search to adjacent domains"
    - fallback: "Document as 'custom development needed'"

  api_access_denied:
    - action: "Note authentication requirements"
    - fallback: "Check for open alternatives"
```

---

## Examples

### Example 1: Copywriting Squad

**Input:**
```yaml
domain: "copywriting"
use_cases: ["sales pages", "email sequences", "headlines"]
capability_gaps: ["competitor_analysis", "headline_testing", "email_automation"]
```

**Output (Summarized):**
```yaml
tools_discovered: 23
top_recommendations:
  mcp:
    - mcp-server-playwright  # Screenshot competitor pages
  apis:
    - sendgrid              # Email delivery
    - headline-analyzer-api # A/B headline scoring
  cli:
    - lighthouse            # Page performance analysis
  github:
    - swipe-file-analyzer   # Analyze competitor copy
```

### Example 2: Legal Squad

**Input:**
```yaml
domain: "legal"
use_cases: ["contract review", "compliance check", "legal research"]
capability_gaps: ["pdf_extraction", "legal_database", "signature_verification"]
```

**Output (Summarized):**
```yaml
tools_discovered: 18
top_recommendations:
  mcp:
    - mcp-server-pdf        # PDF processing
  apis:
    - case-law-api          # Legal precedents
    - docusign-api          # E-signatures
  libraries:
    - pdfplumber            # Python PDF extraction
    - spacy-legal           # Legal NER
```

---

## Heuristics Reference

| Heuristic ID | Name | Where Applied | Blocking |
|--------------|------|---------------|----------|
| SC_MCP_001 | MCP Discovery Gate | Phase 1 | No |
| SC_API_001 | API Discovery Gate | Phase 2 | No |
| SC_TDR_001 | Tool Discovery Report | Phase 6 | Yes |

---

_Task Version: 1.0_
_Last Updated: 2026-02-03_
_Lines: 750+_
