# Tool Evaluation Framework

Systematic methodology for evaluating and selecting tools, MCPs, APIs, and CLIs for AIOS squads.

---

## Table of Contents

1. [Framework Overview](#1-framework-overview)
2. [Evaluation Criteria Taxonomy](#2-evaluation-criteria-taxonomy)
3. [Weighted Scoring Model](#3-weighted-scoring-model)
4. [Evaluation Process](#4-evaluation-process)
5. [Decision Matrix Template](#5-decision-matrix-template)
6. [Specific Evaluation Guides](#6-specific-evaluation-guides)
7. [Risk Assessment](#7-risk-assessment)
8. [Total Cost of Ownership (TCO)](#8-total-cost-of-ownership-tco)
9. [Examples](#9-examples)
10. [Templates and Checklists](#10-templates-and-checklists)

---

## 1. Framework Overview

### Purpose

Provide a structured, repeatable methodology for evaluating tools that:
- Reduces bias in decision-making
- Ensures alignment with business and technical requirements
- Documents rationale for stakeholders
- Enables continuous improvement as technology evolves

### Framework Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOOL EVALUATION FRAMEWORK                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DEFINE REQUIREMENTS                                         │
│     └── What problem are we solving?                            │
│                                                                  │
│  2. IDENTIFY CRITERIA                                           │
│     └── What factors matter?                                    │
│                                                                  │
│  3. ASSIGN WEIGHTS                                              │
│     └── How important is each factor?                           │
│                                                                  │
│  4. SCORE OPTIONS                                               │
│     └── How well does each tool perform?                        │
│                                                                  │
│  5. CALCULATE & COMPARE                                         │
│     └── Which tool wins?                                        │
│                                                                  │
│  6. VALIDATE & DECIDE                                           │
│     └── Reality check before final decision                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use This Framework

| Situation | Use Framework? | Depth |
|-----------|----------------|-------|
| Adding new MCP to squad | Yes | Light |
| Selecting enterprise integration | Yes | Full |
| Evaluating API alternatives | Yes | Medium |
| Quick tool comparison (2 options) | Optional | Light |
| Major infrastructure decision | Yes | Full + Committee |

---

## 2. Evaluation Criteria Taxonomy

### Seven Evaluation Dimensions

Based on software evaluation research, tools should be evaluated across seven dimensions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVALUATION DIMENSIONS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. FUNCTIONAL                                                  │
│     Does it do what we need?                                    │
│                                                                  │
│  2. TECHNICAL                                                   │
│     How well is it built?                                       │
│                                                                  │
│  3. QUALITY                                                     │
│     How reliable and maintainable is it?                        │
│                                                                  │
│  4. VENDOR/MAINTAINER                                           │
│     Who is behind it? Can we trust them?                        │
│                                                                  │
│  5. OUTPUT                                                      │
│     What results does it produce?                               │
│                                                                  │
│  6. COST & BENEFIT                                              │
│     What's the TCO vs value delivered?                          │
│                                                                  │
│  7. ECOSYSTEM & OPINION                                         │
│     What does the community think?                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Criteria by Dimension

#### 1. Functional Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Feature Completeness | Does it have all needed features? | What % of our requirements are met? |
| Core Functionality | Does it do its main job well? | Does it excel at its primary purpose? |
| Use Case Fit | Is it designed for our use case? | Who is the target user? |
| Customizability | Can it be adapted to our needs? | Can we extend or configure it? |
| Scalability | Can it grow with us? | What are its limits? |

#### 2. Technical Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Architecture | How is it designed? | Is it modular? Monolithic? |
| Performance | How fast is it? | What's the latency? Throughput? |
| Security | How secure is it? | What auth methods? Encryption? |
| Integration | How well does it connect? | What APIs? Protocols? |
| Technology Stack | What's it built with? | Compatible with our stack? |
| Platform Support | Where does it run? | Cloud? On-prem? Both? |

#### 3. Quality Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Reliability | Does it work consistently? | What's the uptime SLA? |
| Maintainability | Is it easy to update? | How often are updates? |
| Testability | Can we test integrations? | Is there a sandbox? |
| Documentation | Is it well documented? | Quality of docs? Examples? |
| Error Handling | How does it handle failures? | Clear error messages? |

#### 4. Vendor/Maintainer Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Company Stability | Will they be around? | Revenue? Funding? Age? |
| Support Quality | Can we get help? | Response time? Channels? |
| Roadmap | Where is it going? | Aligned with our needs? |
| License | Can we use it legally? | Open source? Commercial? |
| Reputation | Are they trustworthy? | Reviews? References? |

#### 5. Output Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Data Format | What format is output? | JSON? XML? Custom? |
| Accuracy | Is output correct? | Error rate? |
| Completeness | Is output full? | Missing fields? |
| Consistency | Is output predictable? | Same input = same output? |

#### 6. Cost & Benefit Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Licensing Cost | What's the sticker price? | Per seat? Per API call? |
| Implementation Cost | What does setup cost? | Dev time? Training? |
| Operational Cost | What's ongoing cost? | Hosting? Support? |
| Hidden Costs | What else will we pay? | Overages? Add-ons? |
| ROI | What's the return? | Time saved? Revenue gained? |

#### 7. Ecosystem & Opinion Criteria

| Criterion | Description | Questions to Ask |
|-----------|-------------|------------------|
| Community Size | How many users? | GitHub stars? Downloads? |
| Activity | Is it actively developed? | Recent commits? Issues? |
| Third-Party Integrations | Who else uses it? | Plugins? Extensions? |
| Reviews | What do users say? | G2? Capterra? Reddit? |
| Industry Adoption | Who's using it? | Case studies? References? |

---

## 3. Weighted Scoring Model

### How Weighting Works

```
Weighted Score = Σ (Criterion Score × Criterion Weight)

Example:
  Feature Score: 4/5, Weight: 30%  → 4 × 0.30 = 1.20
  Price Score:   5/5, Weight: 20%  → 5 × 0.20 = 1.00
  Support Score: 3/5, Weight: 15%  → 3 × 0.15 = 0.45
  ...
  Total Weighted Score = 1.20 + 1.00 + 0.45 + ... = X.XX
```

### Weight Assignment Guidelines

| Priority Level | Weight Range | Example Criteria |
|----------------|--------------|------------------|
| Critical | 20-30% | Core functionality, Security |
| High | 15-20% | Integration, Performance |
| Medium | 10-15% | Documentation, Support |
| Low | 5-10% | Nice-to-haves, Future features |

**Rule:** All weights must sum to 100%

### Scoring Scale

| Score | Label | Meaning |
|-------|-------|---------|
| 0 | Does Not Meet | No capability or completely inadequate |
| 1 | Partially Meets | Basic capability with significant gaps |
| 2 | Meets | Adequate for requirements |
| 3 | Exceeds | Better than required |
| 4 | Exceptional | Best-in-class capability |

### Requirement Importance Multiplier

For RFP-style evaluation, add importance multiplier:

| Importance | Multiplier | Description |
|------------|------------|-------------|
| Essential | 3× | Must have, no exceptions |
| Desirable | 2× | Should have, strong preference |
| Nice to Have | 1× | Could have, optional |

```
Final Score = Score × Weight × Importance Multiplier
```

---

## 4. Evaluation Process

### Phase 1: Preparation (Day 1)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Define the Problem                                      │
├─────────────────────────────────────────────────────────────────┤
│ □ What business problem are we solving?                         │
│ □ What pain points exist with current solution?                 │
│ □ What does success look like?                                  │
│ □ Who are the stakeholders?                                     │
│ □ What's the timeline?                                          │
│ □ What's the budget?                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Gather Requirements                                     │
├─────────────────────────────────────────────────────────────────┤
│ □ List all functional requirements                              │
│ □ List all technical requirements                               │
│ □ Categorize: Essential / Desirable / Nice-to-Have             │
│ □ Get stakeholder sign-off on requirements                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Create Evaluation Criteria                              │
├─────────────────────────────────────────────────────────────────┤
│ □ Select relevant criteria from taxonomy                        │
│ □ Add project-specific criteria                                 │
│ □ Assign weights (must sum to 100%)                             │
│ □ Create scoring rubric                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Discovery (Days 2-5)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Identify Candidates                                     │
├─────────────────────────────────────────────────────────────────┤
│ □ Research market options                                       │
│ □ Check: MCP catalogs, GitHub, Smithery, MCP.so                │
│ □ Get recommendations from team                                 │
│ □ Create long list (5-10 candidates)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Initial Screening                                       │
├─────────────────────────────────────────────────────────────────┤
│ □ Quick review of each candidate                                │
│ □ Eliminate obvious non-fits                                    │
│ □ Score on critical criteria only                               │
│ □ Create short list (3-5 candidates)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Deep Evaluation (Days 6-15)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Detailed Assessment                                     │
├─────────────────────────────────────────────────────────────────┤
│ □ Review documentation for each candidate                       │
│ □ Test in sandbox/trial environment                             │
│ □ Evaluate against all criteria                                 │
│ □ Document evidence for each score                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Vendor/Maintainer Engagement                            │
├─────────────────────────────────────────────────────────────────┤
│ □ Request demos                                                 │
│ □ Ask clarifying questions                                      │
│ □ Request references                                            │
│ □ Negotiate terms (if applicable)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Calculate Scores                                        │
├─────────────────────────────────────────────────────────────────┤
│ □ Complete scoring matrix                                       │
│ □ Calculate weighted scores                                     │
│ □ Rank candidates                                               │
│ □ Identify top 2-3 options                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Decision (Days 16-20)

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: Risk Assessment                                         │
├─────────────────────────────────────────────────────────────────┤
│ □ Identify risks for top candidates                             │
│ □ Assess probability and impact                                 │
│ □ Develop mitigation strategies                                 │
│ □ Factor risk into final decision                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: Final Decision                                         │
├─────────────────────────────────────────────────────────────────┤
│ □ Present findings to stakeholders                              │
│ □ Make recommendation                                           │
│ □ Document decision rationale                                   │
│ □ Create implementation plan                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Decision Matrix Template

### Simple Decision Matrix

| Criterion | Weight | Tool A | Tool B | Tool C |
|-----------|--------|--------|--------|--------|
| Feature Completeness | 25% | | | |
| Integration Ease | 20% | | | |
| Performance | 15% | | | |
| Documentation | 15% | | | |
| Cost | 15% | | | |
| Community Support | 10% | | | |
| **TOTAL** | **100%** | | | |

### Detailed Decision Matrix

```markdown
## Tool Evaluation: [Category]

**Evaluation Date:** YYYY-MM-DD
**Evaluator(s):** [Names]
**Decision Deadline:** YYYY-MM-DD

### Candidates

| # | Tool Name | Version | Type | Link |
|---|-----------|---------|------|------|
| A | Tool A | v1.2.3 | MCP | [link] |
| B | Tool B | v2.0.0 | API | [link] |
| C | Tool C | v0.9.1 | CLI | [link] |

### Scoring Matrix

| Criterion | Weight | Importance | A Score | A Weighted | B Score | B Weighted | C Score | C Weighted |
|-----------|--------|------------|---------|------------|---------|------------|---------|------------|
| **Functional** | | | | | | | | |
| Core Features | 15% | Essential | 4 | 0.60 | 3 | 0.45 | 4 | 0.60 |
| API Coverage | 10% | Essential | 3 | 0.30 | 4 | 0.40 | 2 | 0.20 |
| Customization | 5% | Desirable | 2 | 0.10 | 3 | 0.15 | 4 | 0.20 |
| **Technical** | | | | | | | | |
| Performance | 10% | Essential | 4 | 0.40 | 3 | 0.30 | 3 | 0.30 |
| Security | 10% | Essential | 4 | 0.40 | 4 | 0.40 | 3 | 0.30 |
| Integration | 10% | Essential | 3 | 0.30 | 4 | 0.40 | 2 | 0.20 |
| **Quality** | | | | | | | | |
| Documentation | 10% | Desirable | 4 | 0.40 | 2 | 0.20 | 3 | 0.30 |
| Reliability | 5% | Essential | 4 | 0.20 | 3 | 0.15 | 3 | 0.15 |
| **Vendor** | | | | | | | | |
| Support | 5% | Desirable | 3 | 0.15 | 4 | 0.20 | 2 | 0.10 |
| Stability | 5% | Essential | 4 | 0.20 | 3 | 0.15 | 2 | 0.10 |
| **Cost** | | | | | | | | |
| License Cost | 10% | Essential | 3 | 0.30 | 2 | 0.20 | 4 | 0.40 |
| Implementation | 5% | Desirable | 3 | 0.15 | 3 | 0.15 | 4 | 0.20 |
| **TOTALS** | **100%** | | | **3.50** | | **3.15** | | **3.05** |

### Ranking

| Rank | Tool | Score | Recommendation |
|------|------|-------|----------------|
| 1 | Tool A | 3.50 | **RECOMMENDED** |
| 2 | Tool B | 3.15 | Alternative |
| 3 | Tool C | 3.05 | Not recommended |

### Decision Rationale

**Selected:** Tool A

**Reasons:**
1. Highest overall score (3.50)
2. Best documentation quality
3. Strong security features
4. Reasonable cost

**Trade-offs Accepted:**
- Less customizable than Tool C
- Slightly more expensive than Tool C
```

---

## 6. Specific Evaluation Guides

### MCP Server Evaluation

| Criterion | Weight | How to Evaluate |
|-----------|--------|-----------------|
| Tool Count | 15% | Number of tools provided |
| Tool Quality | 20% | Test each tool, check responses |
| Authentication | 15% | OAuth, API key, token refresh? |
| Error Handling | 10% | How are errors reported? |
| Rate Limits | 10% | What are the limits? |
| Documentation | 10% | Install guide, examples? |
| Community | 10% | GitHub stars, issues, activity |
| Maintenance | 10% | Last update, release frequency |

**Quick Checks:**

```bash
# Check GitHub activity
gh repo view [owner/repo] --json stargazersCount,updatedAt,openIssues

# Check npm downloads (if applicable)
npm show [package] time modified

# Test installation
npx -y [mcp-package] --help
```

### API Evaluation

| Criterion | Weight | How to Evaluate |
|-----------|--------|-----------------|
| Endpoint Coverage | 20% | What operations are supported? |
| Authentication | 15% | OAuth2, API keys, JWT? |
| Rate Limits | 10% | Requests per minute/hour? |
| Response Format | 10% | JSON, XML, consistent? |
| Error Responses | 10% | Meaningful error codes? |
| SDKs Available | 10% | Python, Node, etc.? |
| Documentation | 15% | OpenAPI, examples, tutorials? |
| Uptime SLA | 10% | 99.9%? 99.99%? |

**Quick Checks:**

```bash
# Test API endpoint
curl -X GET "https://api.example.com/endpoint" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\n%{http_code} %{time_total}s"

# Check SDK
pip show [sdk-package]
npm info [sdk-package]
```

### CLI Tool Evaluation

| Criterion | Weight | How to Evaluate |
|-----------|--------|-----------------|
| Command Coverage | 20% | What commands available? |
| Ease of Use | 15% | Intuitive commands? Help? |
| Output Formats | 10% | JSON, table, custom? |
| Scripting Support | 15% | Can it be automated? |
| Error Messages | 10% | Helpful error output? |
| Installation | 10% | npm, pip, binary? |
| Cross-Platform | 10% | Windows, Mac, Linux? |
| Performance | 10% | Speed of execution? |

**Quick Checks:**

```bash
# Check help
[cli] --help

# Check version
[cli] --version

# Test JSON output
[cli] command --output json
```

### Python Library Evaluation

| Criterion | Weight | How to Evaluate |
|-----------|--------|-----------------|
| API Coverage | 20% | What endpoints covered? |
| Type Hints | 10% | Full typing support? |
| Async Support | 10% | asyncio compatible? |
| Error Handling | 10% | Custom exceptions? |
| Dependencies | 10% | Minimal? Conflicting? |
| Test Coverage | 10% | CI status? Coverage %? |
| Documentation | 15% | Docs, examples, API ref? |
| Maintenance | 15% | Active development? |

**Quick Checks:**

```bash
# Check PyPI
pip show [package]
pip index versions [package]

# Check types
mypy --install-types [package]

# Check dependencies
pip show [package] --requires
```

---

## 7. Risk Assessment

### Risk Categories

| Category | Examples |
|----------|----------|
| **Technical** | Integration complexity, performance issues, security vulnerabilities |
| **Vendor** | Company stability, support quality, roadmap alignment |
| **Operational** | Learning curve, maintenance burden, dependency conflicts |
| **Financial** | Cost overruns, hidden fees, license changes |
| **Strategic** | Lock-in, obsolescence, market shifts |

### Risk Matrix

| Probability ↓ / Impact → | Low | Medium | High | Critical |
|---------------------------|-----|--------|------|----------|
| **High** | Medium | High | Critical | Critical |
| **Medium** | Low | Medium | High | Critical |
| **Low** | Low | Low | Medium | High |
| **Very Low** | Low | Low | Low | Medium |

### Risk Assessment Template

```markdown
## Risk Assessment: [Tool Name]

### Identified Risks

| # | Risk | Category | Probability | Impact | Score | Mitigation |
|---|------|----------|-------------|--------|-------|------------|
| 1 | API rate limits too low | Technical | Medium | High | High | Cache responses, batch requests |
| 2 | Vendor acquired/shut down | Vendor | Low | Critical | Medium | Abstract integration, keep alternatives |
| 3 | Token refresh complexity | Technical | Medium | Medium | Medium | Build token manager library |
| 4 | Price increase at renewal | Financial | Medium | Medium | Medium | Negotiate multi-year contract |
| 5 | Breaking API changes | Technical | High | High | Critical | Version lock, test suite |

### Risk Acceptance

| Risk Level | Action Required |
|------------|-----------------|
| Critical | Must mitigate before proceeding |
| High | Mitigation plan required |
| Medium | Accept with monitoring |
| Low | Accept |

### Overall Risk Assessment

**Risk Level:** [Low/Medium/High/Critical]

**Proceed:** [Yes/No/Conditional]

**Conditions (if applicable):**
- Mitigation for Risk #5 must be implemented
- Fallback to alternative must be documented
```

---

## 8. Total Cost of Ownership (TCO)

### TCO Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOTAL COST OF OWNERSHIP                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACQUISITION COSTS (Year 0)                                     │
│  ├── License/Purchase                                           │
│  ├── Implementation                                             │
│  ├── Training                                                   │
│  ├── Integration Development                                    │
│  └── Data Migration                                             │
│                                                                  │
│  OPERATIONAL COSTS (Annual)                                     │
│  ├── Subscription/Renewal                                       │
│  ├── Hosting/Infrastructure                                     │
│  ├── Support/Maintenance                                        │
│  ├── Internal Administration                                    │
│  └── Updates/Upgrades                                           │
│                                                                  │
│  HIDDEN COSTS (Often Overlooked)                                │
│  ├── Overages (API calls, storage)                              │
│  ├── Add-on Features                                            │
│  ├── Compliance/Audit                                           │
│  ├── Downtime Impact                                            │
│  └── Switching Costs                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### TCO Calculation Template

```markdown
## TCO Analysis: [Tool Name]

**Analysis Period:** 3 years
**Currency:** USD

### Acquisition Costs (Year 0)

| Item | Cost | Notes |
|------|------|-------|
| License/Setup | $X,XXX | One-time |
| Implementation | $X,XXX | 40 dev hours @ $XX/hr |
| Training | $X,XXX | 10 team members |
| Integration Dev | $X,XXX | 80 dev hours |
| **Subtotal** | **$XX,XXX** | |

### Operational Costs (Per Year)

| Item | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| Subscription | $X,XXX | $X,XXX | $X,XXX |
| Hosting | $X,XXX | $X,XXX | $X,XXX |
| Support | $X,XXX | $X,XXX | $X,XXX |
| Admin (0.1 FTE) | $X,XXX | $X,XXX | $X,XXX |
| **Subtotal** | $XX,XXX | $XX,XXX | $XX,XXX |

### Hidden Costs (Per Year)

| Item | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| API Overages | $X,XXX | $X,XXX | $X,XXX |
| Add-ons | $X,XXX | $X,XXX | $X,XXX |
| Downtime (est.) | $X,XXX | $X,XXX | $X,XXX |
| **Subtotal** | $X,XXX | $X,XXX | $X,XXX |

### Total Cost of Ownership

| Period | Cost |
|--------|------|
| Year 0 (Acquisition) | $XX,XXX |
| Year 1 (Operations) | $XX,XXX |
| Year 2 (Operations) | $XX,XXX |
| Year 3 (Operations) | $XX,XXX |
| **3-Year TCO** | **$XXX,XXX** |
| **Monthly Average** | **$X,XXX** |

### Comparison

| Tool | 3-Year TCO | Monthly | Rank |
|------|------------|---------|------|
| Tool A | $XXX,XXX | $X,XXX | 2 |
| Tool B | $XXX,XXX | $X,XXX | 1 |
| Tool C | $XXX,XXX | $X,XXX | 3 |
```

---

## 9. Examples

### Example 1: Evaluating Jira API Libraries

```markdown
## Evaluation: Jira Python Libraries

**Date:** 2026-02-04
**Evaluator:** QA Team
**Use Case:** Integrate Jira issue management into AIOS squad

### Candidates

| Library | Version | Stars | Last Update |
|---------|---------|-------|-------------|
| atlassian-python-api | 3.41.0 | 1.2K | 2 weeks ago |
| jira (python-jira) | 3.6.0 | 1.9K | 1 month ago |
| jira-cli | 1.5.0 | 300 | 3 months ago |

### Scoring Matrix

| Criterion | Weight | atlassian-python-api | jira | jira-cli |
|-----------|--------|---------------------|------|----------|
| API Coverage | 20% | 4 (0.80) | 4 (0.80) | 2 (0.40) |
| Confluence Support | 15% | 4 (0.60) | 0 (0.00) | 0 (0.00) |
| Xray Support | 10% | 1 (0.10) | 0 (0.00) | 0 (0.00) |
| Documentation | 15% | 3 (0.45) | 4 (0.60) | 2 (0.30) |
| Type Hints | 10% | 2 (0.20) | 3 (0.30) | 1 (0.10) |
| Async Support | 5% | 0 (0.00) | 0 (0.00) | 0 (0.00) |
| Maintenance | 10% | 4 (0.40) | 3 (0.30) | 2 (0.20) |
| Community | 10% | 3 (0.30) | 4 (0.40) | 2 (0.20) |
| Ease of Use | 5% | 4 (0.20) | 4 (0.20) | 3 (0.15) |
| **TOTAL** | **100%** | **3.05** | **2.60** | **1.35** |

### Decision

**Selected:** atlassian-python-api

**Rationale:**
1. Only library with Confluence + Jira in one package
2. Active maintenance (2 weeks ago)
3. Better coverage for our multi-Atlassian use case

**Trade-offs:**
- Slightly worse documentation than jira
- No async support (acceptable for our use)
```

### Example 2: Evaluating MCP Servers for Atlassian

```markdown
## Evaluation: Atlassian MCP Servers

**Date:** 2026-02-04
**Use Case:** Enable Claude to interact with Jira/Confluence

### Candidates

| MCP Server | Source | Status |
|------------|--------|--------|
| @anthropic/atlassian-remote-mcp-server | Official Atlassian | Beta |
| sooperset/mcp-atlassian | Community | Stable |

### Scoring Matrix

| Criterion | Weight | Official | Community |
|-----------|--------|----------|-----------|
| Jira Coverage | 20% | 4 (0.80) | 4 (0.80) |
| Confluence Coverage | 15% | 4 (0.60) | 4 (0.60) |
| Authentication | 15% | 4 (0.60) | 3 (0.45) |
| Documentation | 10% | 4 (0.40) | 3 (0.30) |
| Maintenance | 15% | 4 (0.60) | 3 (0.45) |
| Support | 10% | 4 (0.40) | 2 (0.20) |
| Features | 10% | 3 (0.30) | 4 (0.40) |
| Stability | 5% | 3 (0.15) | 4 (0.20) |
| **TOTAL** | **100%** | **3.85** | **3.40** |

### Decision

**Selected:** @anthropic/atlassian-remote-mcp-server (Official)

**Rationale:**
1. Official support from Atlassian
2. Better long-term maintenance guarantee
3. Superior authentication handling

**Fallback:** sooperset/mcp-atlassian if official has issues
```

---

## 10. Templates and Checklists

### Quick Evaluation Checklist

```markdown
## Quick Tool Evaluation: [Tool Name]

**Date:** _______________
**Evaluator:** _______________

### Must-Have Criteria (All must pass)

- [ ] Solves our core problem
- [ ] Compatible with our stack
- [ ] Within budget
- [ ] Acceptable security
- [ ] Maintained (updated in last 6 months)

**If any fail → REJECT**

### Should-Have Criteria (Score 1-5)

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Documentation quality | | |
| Ease of integration | | |
| Community support | | |
| Performance | | |
| Customizability | | |
| **Average** | | |

**If average < 3 → REJECT**

### Nice-to-Have Criteria

- [ ] Has SDK in our preferred language
- [ ] Has sandbox/trial
- [ ] Has enterprise support option
- [ ] Open source

### Quick Decision

- [ ] **APPROVE** - Proceed to detailed evaluation
- [ ] **REJECT** - Document reason: _______________
- [ ] **MAYBE** - Need more info: _______________
```

### Full Evaluation Template

See [Decision Matrix Template](#5-decision-matrix-template) above.

### Comparison Summary Template

```markdown
## Tool Comparison Summary

**Category:** [e.g., Jira Integration]
**Date:** YYYY-MM-DD

### Executive Summary

| | Tool A | Tool B | Tool C |
|---|--------|--------|--------|
| **Score** | 3.50 | 3.15 | 3.05 |
| **Cost/Year** | $X,XXX | $X,XXX | $X,XXX |
| **Risk Level** | Low | Medium | High |
| **Recommendation** | ✅ | ⚠️ | ❌ |

### Strengths & Weaknesses

| Tool | Strengths | Weaknesses |
|------|-----------|------------|
| A | Best docs, good support | Higher cost |
| B | Lowest cost, good features | Newer, less proven |
| C | Most customizable | Poor support, risky |

### Recommendation

**Select:** Tool A

**Confidence:** High (85%)

**Next Steps:**
1. Negotiate contract terms
2. Plan implementation
3. Prepare training materials
```

---

## Sources

- [Weighted Scoring Model Guide](https://userpilot.com/blog/weighted-scoring-model/)
- [LeanIX SaaS Evaluation](https://www.leanix.net/en/wiki/apm/saas-evaluation)
- [Gartner Vendor Selection Framework](https://www.gartner.com/en/documents/4000717)
- [Software Evaluation Criteria Research](https://www.researchgate.net/publication/220245744)
- [Weighted Decision Matrix - GoLeanSixSigma](https://goleansixsigma.com/weighted-criteria-matrix/)
- [Decision Matrix - Untools](https://untools.co/decision-matrix/)
- [Hexaview AI Tool Evaluation Framework](https://www.hexaviewtech.com/blog/evaluation-framework-weighted-scoring-model-open-source-ai-tools)
- [Spendflo Software Evaluation Checklist](https://www.spendflo.com/blog/software-assessment-checklist)

---

*Tool Evaluation Framework v1.0*
*Make better decisions with structured evaluation*
