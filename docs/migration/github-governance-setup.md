# GitHub Governance Setup Guide

**Story:** 4.8 - Repository Open-Source Migration  
**Phase:** 2.3 - Configure PR Governance  
**Date:** 2025-11-12

---

## Overview

This guide documents the GitHub governance configuration for `aios-fullstack` to ensure proper PR approval process, especially for expansion-pack contributions.

## Branch Protection Rules

### Main Branch Protection

**Repository:** `Pedrovaleriolopez/aios-fullstack`

**Settings Location:** Settings → Branches → Branch protection rules → Add rule

**Rule Name:** `main`

**Configuration:**
- ✅ **Require a pull request before merging**
  - Required approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed: ✅
  - Require review from Code Owners: ✅ (if CODEOWNERS file exists)

- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: ✅
  - Status checks required:
    - `test` (npm test)
    - `lint` (npm run lint)
    - `build` (npm run build)

- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Only allow specified actors: Repository admins only

### Expansion-Pack PR Requirements

**Special Rule:** PRs affecting `expansion-packs/expansion-creator/` require PO approval

**Implementation:**
1. Create CODEOWNERS file (see below)
2. Configure branch protection to require CODEOWNERS approval
3. Set up GitHub Actions workflow to tag PRs with `needs-po-review`

## CODEOWNERS File

**Location:** `.github/CODEOWNERS`

**Content:**
```
# Global owners
* @Pedrovaleriolopez

# Expansion packs require PO approval
/expansion-packs/expansion-creator/ @Pedrovaleriolopez
/expansion-packs/etl/ @Pedrovaleriolopez

# Core framework
/aios-core/ @Pedrovaleriolopez

# Documentation
/docs/ @Pedrovaleriolopez
```

## GitHub Labels

### Standard Labels

**Repository:** Settings → Labels

**Labels to Create:**

#### Type Labels
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation only changes
- `question` - Further information is requested
- `refactoring` - Code refactoring

#### Expansion Pack Labels
- `expansion-pack` - Related to expansion packs
- `needs-po-review` - Requires Product Owner review
- `approved` - PO approved, ready to merge
- `rejected` - PO rejected, needs changes

#### Priority Labels
- `priority:critical` - Critical priority
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

#### Status Labels
- `blocked` - Blocked by another issue/PR
- `wontfix` - This will not be worked on
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right

## GitHub Actions Workflow

### Auto-Label Expansion Pack PRs

**File:** `.github/workflows/pr-labeling.yml`

**Purpose:** Automatically label PRs that affect expansion-packs

**Content:**
```yaml
name: PR Labeling

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Check for expansion-pack changes
        uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          configuration-path: .github/labeler.yml
          sync-labels: true
```

### Labeler Configuration

**File:** `.github/labeler.yml`

**Content:**
```yaml
expansion-pack:
  - expansion-packs/**/*
  - expansion-packs/expansion-creator/**/*
  - expansion-packs/etl/**/*

needs-po-review:
  - expansion-packs/expansion-creator/**/*
  - '**/*expansion-pack*.md'
  - '.github/ISSUE_TEMPLATE/expansion-pack*.md'
```

## PR Template Configuration

### Standard PR Template

**Location:** `.github/PULL_REQUEST_TEMPLATE.md`

**Status:** ✅ Created (see Phase 2.3)

### Expansion Pack PR Template

**Location:** `.github/PULL_REQUEST_TEMPLATE/expansion-pack.md`

**Status:** ✅ Created (see Phase 2.3)

## Issue Templates

### Standard Templates

**Location:** `.github/ISSUE_TEMPLATE/`

**Templates:**
- ✅ `bug_report.md` - Existing
- ✅ `feature_request.md` - Existing
- ✅ `expansion-pack-proposal.md` - Created (Phase 2.3)

## GitHub Settings

### Repository Settings

**Settings → General:**

- ✅ **Features:**
  - Issues: ✅ Enabled
  - Projects: ✅ Enabled
  - Wiki: ⚠️ Optional
  - Discussions: ⚠️ Optional (consider for community)

- ✅ **Pull Requests:**
  - Allow merge commits: ✅
  - Allow squash merging: ✅
  - Allow rebase merging: ✅
  - Automatically delete head branches: ✅

### Security Settings

**Settings → Security:**

- ✅ **Code security and analysis:**
  - Dependency graph: ✅ Enabled
  - Dependabot alerts: ✅ Enabled
  - Dependabot security updates: ✅ Enabled
  - Code scanning: ⚠️ Consider enabling (GitHub Advanced Security)

## Manual Setup Steps

### 1. Create Repositories

**Required Actions:**
1. Create `Pedrovaleriolopez/aios-expansion-packs` (PRIVATE)
2. Create `Pedrovaleriolopez/aios-dev-tools` (PRIVATE)

**Commands (via GitHub CLI or Web UI):**
```bash
# Using GitHub CLI
gh repo create Pedrovaleriolopez/aios-expansion-packs --private --description "Proprietary expansion packs for AIOS Framework"
gh repo create Pedrovaleriolopez/aios-dev-tools --private --description "Internal development tools for AIOS Framework"
```

### 2. Configure Branch Protection

**For `aios-fullstack`:**
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Configure as specified above

### 3. Create Labels

**For `aios-fullstack`:**
1. Go to Issues → Labels
2. Create all labels listed above
3. Set appropriate colors:
   - `expansion-pack`: Blue
   - `needs-po-review`: Red
   - `approved`: Green
   - `rejected`: Gray

### 4. Upload Templates

**Files to upload:**
- `.github/PULL_REQUEST_TEMPLATE.md` ✅ Created
- `.github/PULL_REQUEST_TEMPLATE/expansion-pack.md` ✅ Created
- `.github/ISSUE_TEMPLATE/expansion-pack-proposal.md` ✅ Created
- `.github/CODEOWNERS` - To be created
- `.github/labeler.yml` - To be created
- `.github/workflows/pr-labeling.yml` - To be created

### 5. Configure GitHub Actions

**For `aios-fullstack`:**
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Enable "Read and write permissions" for workflows
4. Upload `.github/workflows/pr-labeling.yml`

## Verification Checklist

- [ ] Repositories created (`aios-expansion-packs`, `aios-dev-tools`)
- [ ] Branch protection rules configured
- [ ] CODEOWNERS file created and uploaded
- [ ] Labels created
- [ ] PR templates uploaded
- [ ] Issue templates uploaded
- [ ] GitHub Actions workflow configured
- [ ] Labeler configuration uploaded
- [ ] Security settings configured

## Testing

### Test PR Process

1. Create a test PR affecting `expansion-packs/expansion-creator/`
2. Verify:
   - ✅ PR is automatically labeled with `expansion-pack`
   - ✅ PR is automatically labeled with `needs-po-review`
   - ✅ Branch protection requires approval
   - ✅ Status checks are required

### Test Issue Process

1. Create a test issue using `expansion-pack-proposal` template
2. Verify:
   - ✅ Issue is automatically labeled with `expansion-pack`
   - ✅ Issue is automatically labeled with `needs-po-review`
   - ✅ Template fields are present

---

**Created:** 2025-11-12  
**Next Step:** Execute manual setup steps (requires GitHub access)

