# Suggest Domain

Analyzes a rule and suggests the ideal SYNAPSE domain for it.

---

## Purpose

Help users place rules in the most appropriate domain by analyzing the rule's content, matching it against existing domain keywords, and considering domain purposes.

---

## Prerequisites

- `.synapse/manifest` exists
- At least one domain exists in `.synapse/`

---

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `rule-text` | Yes | The rule text to analyze |

---

## Steps

### Step 1: Load Existing Domains

Read `.synapse/manifest` and build a list of all domains with their:
- Domain name and key
- RECALL keywords (from `{DOMAIN_KEY}_RECALL`)
- Current state (active/inactive)
- Rule count (from reading each domain file)

### Step 2: Analyze Rule Content

Examine the rule text for:
- **Agent references:** mentions of `@dev`, `@qa`, `@architect`, etc. -> suggests agent-specific domain
- **Workflow references:** mentions of "story", "sprint", "review", "deploy" -> suggests workflow domain
- **Technical keywords:** "test", "lint", "commit", "branch" -> match against RECALL keywords
- **Domain-specific terms:** "security", "performance", "accessibility" -> match domain names

### Step 3: Score Domains

For each existing domain, calculate a relevance score:

| Factor | Weight | Points | Description |
|--------|--------|--------|-------------|
| RECALL keyword match | High | 3 | Rule text contains a domain's RECALL keyword |
| Domain name word match | Medium | 2 | Rule text contains words from domain name |
| Agent trigger match | High | 3 | Rule mentions an agent that triggers a domain |
| Existing rule similarity | Low | 1 | Rule is similar to existing rules in domain |

Sum the points for each domain. Maximum possible score is 9 (round up to 10 if all factors match). Present as `{score}/10`.

### Step 4: Present Suggestion

Display the top suggestion(s):

```
Suggested domain for rule: "{rule-text}"

  1. {domain-name} (score: {score}/10)
     Reason: {justification}
     RECALL keywords: {keywords}
     Current rules: {count}

  2. {domain-name} (score: {score}/10)
     Reason: {justification}

  [NEW] Create new domain "{suggested-name}"
     If no existing domain fits well.
```

### Step 5: Offer Quick Action (Optional)

After displaying the suggestion, offer:

```
Quick actions:
  1. Add rule to {suggested-domain} now
  2. Create new domain and add rule
  3. Cancel (do nothing)
```

If user selects 1: Follow the add-rule task for the suggested domain.
If user selects 2: Follow the create-domain task, then add-rule.
If user selects 3: Exit without changes.

---

## Validation

- [ ] All existing domains loaded and analyzed
- [ ] Suggestion includes justification
- [ ] Score is based on keyword matching and domain analysis
- [ ] Quick action options work correctly if selected
- [ ] Handles case where no good match exists (suggests new domain)

---

## Error Handling

| Error | Message |
|-------|---------|
| No domains exist | `No domains found in manifest. Use "create" to create your first domain.` |
| Empty rule text | `Error: Please provide the rule text to analyze.` |
| Manifest not found | `Error: .synapse/manifest not found. SYNAPSE must be initialized first.` |

---

*Suggest Domain — SYNAPSE CRUD Command C7*
*Source: SYNAPSE-HOOK-SKILL-COMMAND-ANALYSIS.md section 2.3*
