# FinHealth Squad - Healthcare Financial AI

**Version:** 1.0.0
**Status:** Development
**Author:** Noxtec

Intelligent Financial Module for Healthcare with AI - Part of Synkra AIOS Squads.

## Purpose

FinHealth Squad provides specialized AI agents for hospital financial operations:

- **TISS/SUS Billing** - Generate and validate healthcare billing guides
- **Medical Account Auditing** - AI-powered audit with glosa prediction
- **Payment Reconciliation** - Automated reconciliation and appeal generation
- **Cash Flow Management** - Forecasting and anomaly detection

## Agents

| Agent | Role | Key Tasks |
|-------|------|-----------|
| `@billing` | TISS/SUS Specialist | validate-tiss, generate-tiss-guide, generate-sus-aih |
| `@auditor` | Medical Account Auditor | audit-account, score-glosa-risk, detect-inconsistencies |
| `@reconciliation` | Payment Reconciliation | reconcile-payment, generate-appeal, prioritize-appeals |
| `@cashflow` | Financial Analyst | forecast-cashflow, detect-anomalies, generate-financial-report |
| `@supervisor` | Squad Orchestrator | route-request, monitor-sla, generate-consolidated-report |

## Quick Start

```bash
# Install dependencies
cd packages/finhealth-squad
npm install

# Activate an agent (in AIOS context)
@billing validate-tiss --guia=<guide_data>
@auditor audit-account --conta=<account_data>
```

## Architecture

```
User Request --> Task --> Agent Execution --> Output
                              |
                        Workflow (if multi-step)
```

**Task-First Architecture:** Every functionality starts as a Task. Agents execute tasks. Workflows orchestrate multiple tasks.

## Workflows

### billing-pipeline
Complete billing flow: generate -> validate -> audit -> send

### audit-pipeline
Batch audit of pending accounts (daily at 6 AM)

### reconciliation-pipeline
Payment reconciliation triggered on payment receipt

### monthly-close
Monthly financial closing (1st of each month)

## Reference Data

- `data/tuss-procedures.json` - TUSS procedure codes
- `data/cbhpm-values.json` - CBHPM reference values
- `data/sigtap-procedures.json` - SIGTAP SUS procedures
- `data/glosa-codes.json` - Standard glosa codes by category

## Tech Stack

- **Framework:** Synkra AIOS + Squads
- **LLM:** Claude API (primary), OpenAI GPT-4o (fallback)
- **Standards:** TISS/ANS, FHIR, SIGTAP

## File Structure

```
finhealth-squad/
├── config.yaml           # Squad manifest
├── package.json          # Dependencies
├── README.md             # This file
├── agents/               # AI agent definitions
│   ├── billing-agent.md
│   ├── auditor-agent.md
│   ├── reconciliation-agent.md
│   ├── cashflow-agent.md
│   └── supervisor-agent.md
├── tasks/                # Executable task definitions
├── data/                 # Reference data (TUSS, CBHPM, etc.)
├── scripts/              # Utility scripts
│   ├── parsers/          # XML parsers
│   ├── validators/       # Data validators
│   └── generators/       # Report generators
├── config/               # Configuration files
├── templates/            # Output templates
├── checklists/           # Quality validation
└── workflows/            # Multi-step workflows
```

## Integration

### With Hospital Systems
```yaml
# Any hospital system (Tasy, MV, Philips) integrates via API
POST /api/v1/billing/validate
Authorization: Bearer <api_key>
Content-Type: application/json
```

### Multi-Tenant
Each hospital is an isolated tenant with:
- Separate database schema
- Custom configurations
- White-label support
- Independent API keys

## Requirements

- Node.js >= 18.0.0
- AIOS >= 2.1.0

## License

Proprietary - Noxtec

---

**Maintained by:** Noxtec
**Last Updated:** 2025-02
**Compatibility:** AIOS v2.1+
