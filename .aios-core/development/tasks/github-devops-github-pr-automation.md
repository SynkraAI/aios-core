# github-pr-automation.md

**Task**: GitHub Pull Request Automation (Repository-Agnostic)

**Purpose**: Automate PR creation from story context using GitHub CLI, works with ANY repository.

**When to use**: After pushing feature branch, via `@github-devops *create-pr` command.

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: githubDevopsGithubPrAutomation()
responsável: Gage (Automator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aios-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aios-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Prerequisites
- GitHub CLI (`gh`) installed and authenticated
- Feature branch pushed to remote
- Repository context detected
- Story file (optional but recommended)

## Workflow Steps

### Step 1: Detect Repository Context

```javascript
const { detectRepositoryContext } = require('./../scripts/repository-detector');

const context = detectRepositoryContext();
if (!context) {
  throw new Error('Unable to detect repository. Run "aios init" first.');
}
```

### Step 2: Get Current Branch

```bash
git branch --show-current
```

### Step 3: Extract Story Information (if available)

```javascript
function extractStoryInfo(storyPath) {
  if (!storyPath || !fs.existsSync(storyPath)) {
    return null;
  }

  const content = fs.readFileSync(storyPath, 'utf8');

  // Extract story ID from path or content
  const storyIdMatch = storyPath.match(/(\d+\.\d+)/);
  const storyId = storyIdMatch ? storyIdMatch[1] : null;

  // Extract title
  const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
  const title = titleMatch ? titleMatch[1] : null;

  // Extract acceptance criteria
  const acMatch = content.match(/acceptance_criteria:([\s\S]*?)(?=\n\w+:|$)/);

  return {
    id: storyId,
    title,
    hasAcceptanceCriteria: !!acMatch
  };
}
```

### Step 4: Generate PR Title (Conventional Commits Format)

> **CRITICAL for Semantic-Release:** PR titles MUST follow Conventional Commits format.
> When merged via "Squash and merge", the PR title becomes the commit message that triggers releases.

```javascript
/**
 * Generate PR title in Conventional Commits format for semantic-release compatibility.
 *
 * Format: {type}({scope}): {description} [Story {id}]
 *
 * Examples:
 * - feat(auth): implement OAuth2 login [Story 6.17]
 * - fix(cli): resolve path parsing on Windows [Story 6.18]
 * - docs: update installation guide
 */
function generatePRTitle(branchName, storyInfo) {
  // Detect commit type from branch prefix
  const branchTypeMap = {
    'feature/': 'feat',
    'feat/': 'feat',
    'fix/': 'fix',
    'bugfix/': 'fix',
    'hotfix/': 'fix',
    'docs/': 'docs',
    'chore/': 'chore',
    'refactor/': 'refactor',
    'test/': 'test',
    'perf/': 'perf',
    'ci/': 'ci',
    'style/': 'style',
    'build/': 'build'
  };

  let type = 'feat'; // default
  for (const [prefix, commitType] of Object.entries(branchTypeMap)) {
    if (branchName.startsWith(prefix)) {
      type = commitType;
      break;
    }
  }

  // Extract scope from branch name if present (e.g., feat/auth/login -> scope=auth)
  const scopeMatch = branchName.match(/^[a-z-]+\/([a-z-]+)\//);
  const scope = scopeMatch ? scopeMatch[1] : null;
  const scopeStr = scope ? `(${scope})` : '';

  // Generate description
  if (storyInfo && storyInfo.id && storyInfo.title) {
    // Clean title: remove "Story X.Y:" prefix if present, lowercase first char
    let cleanTitle = storyInfo.title
      .replace(/^Story\s*\d+\.\d+[:\s-]*/i, '')
      .trim();

    // Lowercase first character for conventional commit style
    cleanTitle = cleanTitle.charAt(0).toLowerCase() + cleanTitle.slice(1);

    return `${type}${scopeStr}: ${cleanTitle} [Story ${storyInfo.id}]`;
  }

  // Fallback: convert branch name to description
  const description = branchName
    .replace(/^(feature|feat|fix|bugfix|hotfix|docs|chore|refactor|test|perf|ci|style|build)\//, '')
    .replace(/^[a-z-]+\//, '') // Remove scope if present
    .replace(/-/g, ' ')
    .toLowerCase()
    .trim();

  return `${type}${scopeStr}: ${description}`;
}
```

**Semantic-Release Trigger Rules:**
| PR Title Prefix | Release Type | Example |
|-----------------|--------------|---------|
| `feat:` or `feat(scope):` | Minor (2.3.0 → 2.4.0) | `feat(auth): add SSO support` |
| `fix:` or `fix(scope):` | Patch (2.3.0 → 2.3.1) | `fix(cli): resolve Windows paths` |
| `feat!:` or `BREAKING CHANGE:` | Major (2.3.0 → 3.0.0) | `feat!: redesign API` |
| `docs:`, `chore:`, `test:`, etc. | No release | `docs: update README` |

### Step 5: Generate PR Description

```javascript
function generatePRDescription(storyInfo, context) {
  let description = `## Summary\n\n`;

  if (storyInfo) {
    description += `This PR implements Story ${storyInfo.id}: ${storyInfo.title}\n\n`;
    description += `**Story File**: \`docs/stories/${storyInfo.id}-*.yaml\`\n\n`;
  } else {
    description += `Changes from branch: ${branchName}\n\n`;
  }

  description += `## Changes\n\n`;
  description += `- [List main changes here]\n\n`;

  description += `## Testing\n\n`;
  description += `- [ ] Unit tests passing\n`;
  description += `- [ ] Integration tests passing\n`;
  description += `- [ ] Manual testing completed\n\n`;

  description += `## Checklist\n\n`;
  description += `- [ ] Code follows project standards\n`;
  description += `- [ ] Tests added/updated\n`;
  description += `- [ ] Documentation updated\n`;
  description += `- [ ] Quality gates passed\n\n`;

  description += `---\n`;
  description += `**Repository**: ${context.repositoryUrl}\n`;
  description += `**Mode**: ${context.mode}\n`;
  description += `**Package**: ${context.packageName} v${context.packageVersion}\n`;

  return description;
}
```

### Step 6: Determine Base Branch

```javascript
function determineBaseBranch(projectRoot) {
  // Check default branch from git
  try {
    const defaultBranch = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
      cwd: projectRoot
    }).toString().trim().replace('refs/remotes/origin/', '');

    return defaultBranch || 'main';
  } catch (error) {
    // Fallback to main
    return 'main';
  }
}
```

### Step 7: Create PR via GitHub CLI

```bash
gh pr create \
  --title "{title}" \
  --body "{description}" \
  --base {baseBranch} \
  --head {currentBranch}
```

### Step 8: Assign Reviewers (Optional)

```javascript
function assignReviewers(storyType, prNumber) {
  const reviewerMap = {
    'feature': ['@dev-team'],
    'bugfix': ['@qa-team'],
    'docs': ['@tech-writer'],
    'security': ['@security-team']
  };

  const reviewers = reviewerMap[storyType] || ['@dev-team'];

  execSync(`gh pr edit ${prNumber} --add-reviewer ${reviewers.join(',')}`, {
    cwd: projectRoot
  });
}
```

## Example Usage

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function createPullRequest(storyPath) {
  // Detect repository
  const { detectRepositoryContext } = require('./../scripts/repository-detector');
  const context = detectRepositoryContext();

  console.log(`\n🔀 Creating Pull Request`);
  console.log(`Repository: ${context.repositoryUrl}\n`);

  // Get current branch
  const currentBranch = execSync('git branch --show-current', {
    cwd: context.projectRoot
  }).toString().trim();

  console.log(`Branch: ${currentBranch}`);

  // Extract story info
  const storyInfo = storyPath ? extractStoryInfo(storyPath) : null;

  // Generate PR title and description
  const title = generatePRTitle(currentBranch, storyInfo);
  const description = generatePRDescription(storyInfo, context);
  const baseBranch = determineBaseBranch(context.projectRoot);

  console.log(`Title: ${title}`);
  console.log(`Base: ${baseBranch}\n`);

  // Create PR
  const prUrl = execSync(
    `gh pr create --title "${title}" --body "${description}" --base ${baseBranch}`,
    { cwd: context.projectRoot }
  ).toString().trim();

  console.log(`\n✅ Pull Request created: ${prUrl}`);

  return { prUrl, title, baseBranch };
}

module.exports = { createPullRequest };
```

## Integration

Called by `@github-devops` via `*create-pr` command.

## Validation

- PR created in correct repository (detected URL)
- PR title follows Conventional Commits format (required for semantic-release)
- PR title includes story ID if available (e.g., `[Story 6.17]`)
- PR description includes repository context
- Base branch is correct (usually main/master)

## Semantic-Release Integration

**IMPORTANT:** When PRs are merged using "Squash and merge" on GitHub, the PR title becomes the merge commit message. This triggers semantic-release:

| Branch Pattern | Generated Title | Release |
|---------------|-----------------|---------|
| `feature/user-auth` | `feat: user auth` | ✅ Minor |
| `feat/auth/sso-login` | `feat(auth): sso login` | ✅ Minor |
| `fix/cli-parsing` | `fix: cli parsing` | ✅ Patch |
| `docs/readme-update` | `docs: readme update` | ❌ None |
| `chore/deps-update` | `chore: deps update` | ❌ None |

For breaking changes, manually edit the PR title to include `!`:
- `feat!: redesign authentication API [Story 7.1]`

## Notes

- Works with ANY repository
- Gracefully handles missing story file
- Uses GitHub CLI for reliability
- Repository context from detector
