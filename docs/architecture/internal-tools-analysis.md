# Internal Tools vs Public Tools Analysis

**Date:** 2025-11-12  
**Story:** 4.8 - Repository Open-Source Migration  
**Phase:** 1.1 - Tools Identification

---

## Executive Summary

**Public Tools (Stay in `aios-fullstack`):** 8 tools  
**Internal Tools (Move to `aios-dev-tools`):** 12+ scripts

**Criteria:**
- **Public:** Used by end-users, part of npm package, referenced in public documentation
- **Internal:** Development/analysis scripts, consolidation tools, entity analysis, decision analysis

---

## Public Tools (Stay in `aios-fullstack`)

### 1. Build & Package Tools

**Location:** `tools/`

#### `tools/cli.js` ✅ PUBLIC
- **Purpose:** Main CLI tool for building agents, teams, and expansion packs
- **Usage:** `node tools/cli.js build`, `node tools/cli.js validate`, `node tools/cli.js list:agents`
- **NPM Scripts:** `build:agents`, `build:teams`, `list:agents`, `validate`
- **Status:** ✅ Keep in `aios-fullstack` (public API)

#### `tools/package-builder.js` ✅ PUBLIC
- **Purpose:** Creates distribution-ready packages with proper entry points
- **Usage:** `npm run build`, `npm run build:packages`
- **NPM Script:** `build`, `build:packages`
- **Status:** ✅ Keep in `aios-fullstack` (public build tool)

#### `tools/npm-publish.js` ✅ PUBLIC
- **Purpose:** Publishes packages to npm registry
- **Usage:** `npm run publish:dry-run`, `npm run publish:stable`
- **NPM Scripts:** `publish:dry-run`, `publish:preview`, `publish:stable`, `publish:interactive`
- **Status:** ✅ Keep in `aios-fullstack` (public publishing tool)

### 2. Installation Tools

**Location:** `tools/installer/`

#### `tools/installer/` ✅ PUBLIC
- **Purpose:** Interactive installation wizard for AIOS framework
- **Usage:** `npx aios-fullstack install`
- **NPM Script:** `install:aios`
- **Public API:** Yes - used by end-users via npx
- **Status:** ✅ Keep in `aios-fullstack` (public installer)

**Structure:**
```
installer/
├── bin/
│   └── aios.js          # Main installer entry point
├── lib/
│   ├── installer.js     # Core installer logic
│   ├── ide-setup.js     # IDE configuration
│   ├── config-loader.js # Configuration loading
│   └── ...
└── config/
    └── install.config.yaml
```

### 3. Setup Tools

#### `tools/setup-github-cli.js` ✅ PUBLIC
- **Purpose:** Sets up GitHub CLI for users
- **Usage:** `npm run setup:github`
- **NPM Script:** `setup:github`, `setup`
- **Status:** ✅ Keep in `aios-fullstack` (public setup tool)

### 4. Version Management

#### `tools/version-bump.js` ✅ PUBLIC
- **Purpose:** Bumps version numbers
- **Usage:** `npm run version:patch`, `npm run version:minor`, `npm run version:major`
- **NPM Scripts:** `version:patch`, `version:minor`, `version:major`
- **Status:** ✅ Keep in `aios-fullstack` (public versioning tool)

#### `tools/bump-expansion-version.js` ✅ PUBLIC
- **Purpose:** Bumps expansion pack versions
- **Usage:** `npm run version:expansion`
- **NPM Script:** `version:expansion`
- **Status:** ✅ Keep in `aios-fullstack` (public tool)

#### `tools/update-expansion-version.js` ✅ PUBLIC
- **Purpose:** Updates expansion pack version
- **Usage:** `npm run version:expansion:set`
- **NPM Script:** `version:expansion:set`
- **Status:** ✅ Keep in `aios-fullstack` (public tool)

#### `tools/bump-all-versions.js` ✅ PUBLIC
- **Purpose:** Bumps all versions
- **Usage:** `npm run version:all`
- **NPM Script:** `version:all`
- **Status:** ✅ Keep in `aios-fullstack` (public tool)

### 5. Build Utilities

#### `tools/builders/web-builder.js` ✅ PUBLIC
- **Purpose:** Builds web bundles for agents and teams
- **Usage:** Used by `tools/cli.js`
- **Status:** ✅ Keep in `aios-fullstack` (public build utility)

#### `tools/lib/` ✅ PUBLIC
- **Purpose:** Shared utilities for public tools
- **Files:**
  - `dependency-resolver.js` - Resolves dependencies
  - `yaml-utils.js` - YAML utilities
- **Status:** ✅ Keep in `aios-fullstack` (public utilities)

### 6. Upgraders

#### `tools/upgraders/v3-to-v4-upgrader.js` ✅ PUBLIC
- **Purpose:** Upgrades from v3 to v4
- **Usage:** Used by CLI
- **Status:** ✅ Keep in `aios-fullstack` (public upgrade tool)

---

## Internal Tools (Move to `aios-dev-tools`)

### 1. Analysis Scripts (Root Directory)

**Location:** Root of `aios-fullstack/`

#### `analyze-batches.js` ❌ INTERNAL
- **Purpose:** Orchestrates multi-batch analysis, generates prompts for decision analysis
- **Usage:** Internal development tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `analyze-decision-patterns.js` ❌ INTERNAL
- **Purpose:** Analyzes decision patterns from Pedro Valério's data
- **Usage:** Internal analysis tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `analyze-epic3-stories.js` ❌ INTERNAL
- **Purpose:** Analyzes Epic 3 stories
- **Usage:** Internal analysis tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `analyze-epic3.js` ❌ INTERNAL
- **Purpose:** Analyzes Epic 3
- **Usage:** Internal analysis tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `analyze-medium-gaps.js` ❌ INTERNAL
- **Purpose:** Analyzes medium gaps in framework
- **Usage:** Internal analysis tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

### 2. Consolidation Scripts

#### `consolidate-entities.js` ❌ INTERNAL
- **Purpose:** Compares entities between source and target directories, creates consolidation plan
- **Usage:** Internal consolidation tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `consolidate-results.js` ❌ INTERNAL
- **Purpose:** Consolidates analysis results
- **Usage:** Internal consolidation tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `execute-consolidation-auto.js` ❌ INTERNAL
- **Purpose:** Auto-executes entity consolidation (Option A)
- **Usage:** Internal consolidation tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `execute-consolidation.js` ❌ INTERNAL
- **Purpose:** Executes entity consolidation
- **Usage:** Internal consolidation tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

### 3. Data Extraction Scripts

#### `extract-all-claude-backups.js` ❌ INTERNAL
- **Purpose:** Extracts all Claude backup files
- **Usage:** Internal data extraction tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `extract-claude-history.js` ❌ INTERNAL
- **Purpose:** Extracts Claude conversation history
- **Usage:** Internal data extraction tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

### 4. Entity Generation Scripts

#### `generate-entity-summary.js` ❌ INTERNAL
- **Purpose:** Generates entity summary reports
- **Usage:** Internal reporting tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

#### `generate-entity-table.js` ❌ INTERNAL
- **Purpose:** Generates entity tables
- **Usage:** Internal reporting tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

### 5. Meta-Analysis Scripts

#### `meta-analyze.js` ❌ INTERNAL
- **Purpose:** Meta-analysis tool
- **Usage:** Internal analysis tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

### 6. Conversation Processing Scripts

#### `chunk-conversations.js` ❌ INTERNAL
- **Purpose:** Chunks conversations for analysis
- **Usage:** Internal data processing tool
- **Status:** ❌ Move to `aios-dev-tools/scripts/`

---

## Tools Directory Analysis

### `tools/` Directory Structure

```
tools/
├── cli.js                    ✅ PUBLIC (CLI tool)
├── package-builder.js        ✅ PUBLIC (build tool)
├── npm-publish.js            ✅ PUBLIC (publish tool)
├── setup-github-cli.js       ✅ PUBLIC (setup tool)
├── version-bump.js           ✅ PUBLIC (versioning)
├── bump-expansion-version.js  ✅ PUBLIC (versioning)
├── update-expansion-version.js ✅ PUBLIC (versioning)
├── bump-all-versions.js      ✅ PUBLIC (versioning)
├── builders/                 ✅ PUBLIC (build utilities)
│   └── web-builder.js
├── installer/                ✅ PUBLIC (installation wizard)
│   ├── bin/
│   ├── lib/
│   └── config/
├── lib/                      ✅ PUBLIC (shared utilities)
│   ├── dependency-resolver.js
│   └── yaml-utils.js
├── upgraders/                ✅ PUBLIC (upgrade tools)
│   └── v3-to-v4-upgrader.js
└── [other files]             ✅ PUBLIC (various public tools)
```

**Decision:** ✅ **ENTIRE `tools/` directory stays in `aios-fullstack`**

---

## Scripts Directory Analysis

### `scripts/` Directory

**Location:** `scripts/`

**Files:**
- `postinstall.js` - Post-installation script
- Other scripts (`.cmd`, `.ps1` files)

**Status:** ⚠️ **REVIEW NEEDED** - Check if these are public or internal

**Recommendation:** Review each script individually to determine if it's public (user-facing) or internal (development-only)

---

## Migration Plan

### Tools to Keep in `aios-fullstack` (Public)

✅ **Entire `tools/` directory** - All public tools  
✅ **`scripts/postinstall.js`** - Public post-installation script (if applicable)

### Scripts to Move to `aios-dev-tools` (Internal)

❌ **Root-level analysis scripts:**
- `analyze-batches.js`
- `analyze-decision-patterns.js`
- `analyze-epic3-stories.js`
- `analyze-epic3.js`
- `analyze-medium-gaps.js`

❌ **Root-level consolidation scripts:**
- `consolidate-entities.js`
- `consolidate-results.js`
- `execute-consolidation-auto.js`
- `execute-consolidation.js`

❌ **Root-level extraction scripts:**
- `extract-all-claude-backups.js`
- `extract-claude-history.js`

❌ **Root-level generation scripts:**
- `generate-entity-summary.js`
- `generate-entity-table.js`

❌ **Root-level meta-analysis scripts:**
- `meta-analyze.js`

❌ **Root-level processing scripts:**
- `chunk-conversations.js`

---

## Summary

### Public Tools Count: 8+ (entire `tools/` directory)
- Build tools
- Installation tools
- Version management
- Setup tools
- Publishing tools

### Internal Scripts Count: 12+
- Analysis scripts (5)
- Consolidation scripts (4)
- Extraction scripts (2)
- Generation scripts (2)
- Meta-analysis scripts (1)
- Processing scripts (1)

### Migration Impact

**Low Impact:** Public tools remain accessible  
**Medium Impact:** Internal scripts need to be moved and references updated

---

**Created:** 2025-11-12  
**Next Step:** Complete Phase 1 tasks and update story file

