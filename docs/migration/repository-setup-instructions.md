# Repository Setup Instructions

**Story:** 4.8 - Repository Open-Source Migration  
**Phase:** 2 - Criação de Repositórios  
**Date:** 2025-11-12

---

## Overview

This document provides step-by-step instructions for creating and configuring the new repositories required for Story 4.8.

## Prerequisites

- GitHub account with repository creation permissions
- GitHub CLI (`gh`) installed (optional, but recommended)
- Access to `Pedrovaleriolopez` GitHub organization/account

---

## Step 1: Create `aios-expansion-packs` Repository (PRIVATE)

### Option A: Using GitHub CLI

```bash
# Create private repository
gh repo create Pedrovaleriolopez/aios-expansion-packs \
  --private \
  --description "Proprietary expansion packs for AIOS Framework" \
  --clone

# Navigate to repository
cd aios-expansion-packs

# Initialize with README and LICENSE
# (Files are prepared in docs/migration/)
```

### Option B: Using GitHub Web UI

1. Go to https://github.com/new
2. **Repository name:** `aios-expansion-packs`
3. **Description:** "Proprietary expansion packs for AIOS Framework"
4. **Visibility:** ✅ Private
5. **Initialize repository:**
   - ✅ Add a README file
   - ✅ Add .gitignore (Node)
   - ✅ Choose a license: **None** (will add PROPRIETARY license)
6. Click **Create repository**

### Initial Setup

```bash
# Clone repository (if using Option B)
git clone https://github.com/Pedrovaleriolopez/aios-expansion-packs.git
cd aios-expansion-packs

# Copy prepared files
cp ../aios-fullstack/docs/migration/aios-expansion-packs-README.md README.md
cp ../aios-fullstack/docs/migration/aios-expansion-packs-LICENSE.md LICENSE

# Create initial structure
mkdir -p creator innerlens mmos-mapper aios-infrastructure-devops meeting-notes hybrid-ops

# Initial commit
git add .
git commit -m "Initial repository setup - Story 4.8"
git push origin main
```

---

## Step 2: Create `aios-dev-tools` Repository (PRIVATE)

### Option A: Using GitHub CLI

```bash
# Create private repository
gh repo create Pedrovaleriolopez/aios-dev-tools \
  --private \
  --description "Internal development tools for AIOS Framework" \
  --clone

# Navigate to repository
cd aios-dev-tools
```

### Option B: Using GitHub Web UI

1. Go to https://github.com/new
2. **Repository name:** `aios-dev-tools`
3. **Description:** "Internal development tools for AIOS Framework"
4. **Visibility:** ✅ Private
5. **Initialize repository:**
   - ✅ Add a README file
   - ✅ Add .gitignore (Node)
   - ✅ Choose a license: **None** (will add PROPRIETARY license)
6. Click **Create repository**

### Initial Setup

```bash
# Clone repository (if using Option B)
git clone https://github.com/Pedrovaleriolopez/aios-dev-tools.git
cd aios-dev-tools

# Copy prepared files
cp ../aios-fullstack/docs/migration/aios-dev-tools-README.md README.md
cp ../aios-fullstack/docs/migration/aios-dev-tools-LICENSE.md LICENSE

# Create initial structure
mkdir -p scripts/analysis scripts/consolidation scripts/extraction scripts/generation
mkdir -p analyzers workflows

# Initial commit
git add .
git commit -m "Initial repository setup - Story 4.8"
git push origin main
```

---

## Step 3: Configure `aios-fullstack` Repository Governance

### 3.1 Branch Protection Rules

**Location:** Settings → Branches → Add rule

**Rule Name:** `main`

**Configuration:**
1. ✅ **Require a pull request before merging**
   - Required number of approvals: 1
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require review from Code Owners

2. ✅ **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging
   - **Status checks:**
     - `test` (npm test)
     - `lint` (npm run lint)
     - `build` (npm run build)

3. ✅ **Require conversation resolution before merging**
4. ✅ **Do not allow bypassing the above settings**
5. ✅ **Restrict who can push to matching branches**
   - Only allow specified actors: Repository admins only

### 3.2 Create Labels

**Location:** Issues → Labels → New label

Create the following labels:

**Type Labels:**
- `bug` - #d73a4a
- `enhancement` - #a2eeef
- `documentation` - #0075ca
- `question` - #d876e3
- `refactoring` - #7057ff

**Expansion Pack Labels:**
- `expansion-pack` - #1d76db
- `needs-po-review` - #b60205
- `approved` - #0e8a16
- `rejected` - #ffffff

**Priority Labels:**
- `priority:critical` - #b60205
- `priority:high` - #fbca04
- `priority:medium` - #0e8a16
- `priority:low` - #c5def5

**Status Labels:**
- `blocked` - #d93f0b
- `wontfix` - #ffffff
- `duplicate` - #cfd3d7
- `invalid` - #e4e669

### 3.3 Upload Templates

**Files already created:**
- ✅ `.github/PULL_REQUEST_TEMPLATE.md`
- ✅ `.github/PULL_REQUEST_TEMPLATE/expansion-pack.md`
- ✅ `.github/ISSUE_TEMPLATE/expansion-pack-proposal.md`
- ✅ `.github/CODEOWNERS`
- ✅ `.github/labeler.yml`
- ✅ `.github/workflows/pr-labeling.yml`

**Action:** Commit and push these files to `aios-fullstack` repository

### 3.4 Enable GitHub Actions

**Location:** Settings → Actions → General

**Configuration:**
- ✅ Allow all actions and reusable workflows
- ✅ Allow GitHub Actions to create and approve pull requests
- ✅ Read and write permissions

---

## Step 4: Verify Setup

### Test Expansion Pack PR Process

1. Create a test branch:
   ```bash
   git checkout -b test-expansion-pack-pr
   ```

2. Make a small change to `expansion-packs/expansion-creator/README.md`

3. Create PR:
   ```bash
   git add .
   git commit -m "Test: expansion-pack PR"
   git push origin test-expansion-pack-pr
   gh pr create --title "Test: Expansion Pack PR" --body "Testing PR labeling"
   ```

4. Verify:
   - ✅ PR is labeled with `expansion-pack`
   - ✅ PR is labeled with `needs-po-review`
   - ✅ Branch protection requires approval
   - ✅ Status checks are required

### Test Issue Template

1. Go to Issues → New Issue
2. Select "Expansion Pack Proposal"
3. Verify template loads correctly
4. Create test issue
5. Verify:
   - ✅ Issue is labeled with `expansion-pack`
   - ✅ Issue is labeled with `needs-po-review`

---

## Checklist

### Repositories Created
- [ ] `aios-expansion-packs` (PRIVATE)
- [ ] `aios-dev-tools` (PRIVATE)

### Repository Configuration
- [ ] `aios-expansion-packs` README.md uploaded
- [ ] `aios-expansion-packs` LICENSE uploaded
- [ ] `aios-dev-tools` README.md uploaded
- [ ] `aios-dev-tools` LICENSE uploaded

### GitHub Governance (`aios-fullstack`)
- [ ] Branch protection rules configured
- [ ] CODEOWNERS file uploaded
- [ ] Labels created
- [ ] PR templates uploaded
- [ ] Issue templates uploaded
- [ ] GitHub Actions workflow configured
- [ ] Labeler configuration uploaded

### Verification
- [ ] Test PR created and verified
- [ ] Test issue created and verified
- [ ] Labels applied correctly
- [ ] Branch protection working

---

## Next Steps

After completing this setup:
1. Proceed to Phase 3: Migração de Arquivos
2. Move expansion packs to `aios-expansion-packs`
3. Move internal tools to `aios-dev-tools`
4. Update references in `aios-fullstack`

---

**Created:** 2025-11-12  
**Status:** Ready for execution

