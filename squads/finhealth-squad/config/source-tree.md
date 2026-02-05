# FinHealth Squad - Source Tree

## Directory Structure

```
packages/finhealth-squad/
│
├── config.yaml                    # Squad manifest (REQUIRED)
├── package.json                   # Node.js dependencies
├── README.md                      # Squad documentation
│
├── agents/                        # AI Agent Definitions
│   ├── billing-agent.md           # Faturista IA - TISS/SUS billing
│   ├── auditor-agent.md           # Auditor IA - Account auditing
│   ├── reconciliation-agent.md    # Conciliador IA - Payment reconciliation
│   ├── cashflow-agent.md          # Analista Financeiro IA - Cash flow
│   └── supervisor-agent.md        # Orquestrador - Squad coordination
│
├── tasks/                         # Executable Task Definitions
│   │
│   │ # Billing Tasks
│   ├── validate-tiss.md           # Validate TISS guide
│   ├── generate-tiss-guide.md     # Generate TISS guide
│   ├── generate-sus-aih.md        # Generate SUS AIH/BPA
│   ├── fix-billing-errors.md      # Fix billing errors
│   │
│   │ # Audit Tasks
│   ├── audit-account.md           # Audit hospital account
│   ├── audit-batch.md             # Batch audit
│   ├── score-glosa-risk.md        # Calculate glosa risk score
│   ├── detect-inconsistencies.md  # Detect inconsistencies
│   │
│   │ # Reconciliation Tasks
│   ├── reconcile-payment.md       # Reconcile payment
│   ├── match-invoices.md          # Match invoices
│   ├── generate-appeal.md         # Generate glosa appeal
│   ├── prioritize-appeals.md      # Prioritize appeals
│   │
│   │ # Cashflow Tasks
│   ├── forecast-cashflow.md       # Cash flow forecast
│   ├── detect-anomalies.md        # Detect financial anomalies
│   ├── score-delinquency.md       # Delinquency risk score
│   ├── generate-financial-report.md # Financial report
│   │
│   │ # Supervisor Tasks
│   ├── route-request.md           # Route user request
│   ├── monitor-sla.md             # Monitor SLA
│   └── generate-consolidated-report.md # Consolidated report
│
├── data/                          # Reference Data
│   ├── tuss-procedures.json       # TUSS procedure codes
│   ├── cbhpm-values.json          # CBHPM reference values
│   ├── sigtap-procedures.json     # SIGTAP SUS procedures
│   ├── glosa-codes.json           # Standard glosa codes
│   └── tiss-schemas/              # TISS XML schemas
│       └── .gitkeep
│
├── scripts/                       # Utility Scripts
│   ├── parsers/                   # XML/Data parsers
│   │   ├── tiss-xml-parser.ts     # TISS XML parser
│   │   └── payment-xml-parser.ts  # Payment XML parser
│   ├── validators/                # Data validators
│   │   ├── tiss-validator.ts      # TISS guide validator
│   │   └── account-validator.ts   # Account validator
│   └── generators/                # Report generators
│       ├── appeal-generator.ts    # Appeal document generator
│       └── report-generator.ts    # Report generator
│
├── config/                        # Configuration Files
│   ├── coding-standards.md        # Coding standards
│   ├── tech-stack.md              # Technology stack
│   └── source-tree.md             # This file
│
├── templates/                     # Output Templates
│   └── .gitkeep
│
├── checklists/                    # Quality Checklists
│   └── .gitkeep
│
├── workflows/                     # Multi-step Workflows
│   └── .gitkeep
│
└── tools/                         # Custom Integrations
    └── .gitkeep
```

## File Purposes

### Root Files
- `config.yaml` - Squad manifest, defines agents, tasks, workflows
- `package.json` - NPM dependencies and scripts
- `README.md` - Documentation and quick start

### Agents
Each agent file contains:
- Persona definition
- Capabilities and commands
- Dependencies (tasks, data, scripts)
- LLM configuration
- Interaction examples

### Tasks
Each task file contains:
- Input/Output TypeScript interfaces
- Execution steps (checklist)
- Acceptance criteria
- Usage examples

### Data
Reference data in JSON format:
- Procedure codes (TUSS, SIGTAP)
- Value tables (CBHPM)
- Glosa classifications
- XML schemas for validation

### Scripts
TypeScript utilities:
- Parsers for XML files
- Validators for data integrity
- Generators for documents

### Config
Documentation:
- Coding standards
- Technology choices
- Project structure
