# AIOS Development Tools (Private)

**Repository:** `Pedrovaleriolopez/aios-dev-tools`  
**Status:** PRIVATE  
**License:** PROPRIETARY  
**Purpose:** Internal development scripts and tools for AIOS Framework maintenance

---

## Overview

This repository contains internal development tools, analysis scripts, and consolidation utilities used for maintaining and evolving the AIOS Framework. These tools are not part of the public framework and are intended for internal development use only.

## Structure

```
aios-dev-tools/
├── scripts/              # Development and analysis scripts
│   ├── analysis/        # Analysis scripts
│   ├── consolidation/    # Entity consolidation scripts
│   ├── extraction/       # Data extraction scripts
│   └── generation/       # Report generation scripts
├── analyzers/            # Framework analysis tools
├── workflows/            # Internal development workflows
├── README.md             # This file
└── LICENSE               # PROPRIETARY license
```

## Scripts Directory

### Analysis Scripts

- `analyze-batches.js` - Orchestrates multi-batch analysis for decision patterns
- `analyze-decision-patterns.js` - Analyzes decision patterns from Pedro Valério's data
- `analyze-epic3-stories.js` - Analyzes Epic 3 stories
- `analyze-epic3.js` - Analyzes Epic 3
- `analyze-medium-gaps.js` - Analyzes medium gaps in framework

### Consolidation Scripts

- `consolidate-entities.js` - Compares entities between source and target directories
- `consolidate-results.js` - Consolidates analysis results
- `execute-consolidation-auto.js` - Auto-executes entity consolidation (Option A)
- `execute-consolidation.js` - Executes entity consolidation

### Extraction Scripts

- `extract-all-claude-backups.js` - Extracts all Claude backup files
- `extract-claude-history.js` - Extracts Claude conversation history

### Generation Scripts

- `generate-entity-summary.js` - Generates entity summary reports
- `generate-entity-table.js` - Generates entity tables

### Meta-Analysis Scripts

- `meta-analyze.js` - Meta-analysis tool

### Processing Scripts

- `chunk-conversations.js` - Chunks conversations for analysis

## Usage

These scripts are internal development tools. They are not part of the public AIOS Framework API and should not be used by end-users.

### Running Analysis Scripts

```bash
# Analyze decision patterns
node scripts/analysis/analyze-decision-patterns.js

# Analyze Epic 3
node scripts/analysis/analyze-epic3.js

# Analyze gaps
node scripts/analysis/analyze-medium-gaps.js
```

### Running Consolidation Scripts

```bash
# Consolidate entities
node scripts/consolidation/consolidate-entities.js

# Execute consolidation
node scripts/consolidation/execute-consolidation.js
```

## Migration History

**Migrated from:** `aios-fullstack/` root directory (Story 4.8)  
**Date:** 2025-11-12  
**Reason:** Separation of internal development tools from public framework

## License

**PROPRIETARY** - All rights reserved. These development tools are proprietary software and are not open-source.

See `LICENSE` file for full terms.

## Support

For internal development support, contact the AIOS development team.

---

**Created:** 2025-11-12  
**Migration from:** `aios-fullstack/` (Story 4.8)

