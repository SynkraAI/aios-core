# Branch Protection Configuration

**Repository:** SynkraAI/aios-core
**Branch:** main
**Status:** ⚠️ NOT CONFIGURED
**Generated:** 2026-02-06
**Story:** 5.10 - GitHub DevOps Setup

---

## Why Branch Protection?

Branch protection ensures code quality by:
- ✅ Requiring all CI checks to pass before merge
- ✅ Enforcing code review before merging to main
- ✅ Preventing force pushes that could lose history
- ✅ Requiring conversation resolution on PRs

**Current Risk:** Without protection, code can be merged to main without tests, reviews, or validation.

---

## Configuration Steps

### Via GitHub Web UI

1. Navigate to: **Settings** → **Branches** → **Add branch protection rule**

2. **Branch name pattern:** `main`

3. **Protect matching branches** - Enable these settings:

#### Required Status Checks

```
☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

  Status checks that are required:
    ☑ Validation Summary
    ☑ ESLint
    ☑ TypeScript Type Checking
    ☑ Jest Tests (Node 18)
    ☑ Jest Tests (Node 20)
    ☑ Story Checkbox Validation
    ☑ Install Manifest Validation
    ☑ IDE Command Sync Validation
    ☑ Installer Smoke Test
```

#### Pull Request Reviews

```
☑ Require pull request reviews before merging
  Required number of approvals before merging: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (optional - needs CODEOWNERS file)
```

#### Additional Settings

```
☑ Require conversation resolution before merging
☐ Require signed commits (optional - for additional security)
☐ Require linear history (optional - prevents merge commits)
☑ Include administrators (recommended - enforces rules for everyone)
☐ Restrict who can push to matching branches (optional)
☐ Allow force pushes (KEEP UNCHECKED)
☐ Allow deletions (KEEP UNCHECKED)
```

---

## Configuration via GitHub CLI (Requires Admin)

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/SynkraAI/aios-core/branches/main/protection \
  --input - << 'PROTECTION'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Validation Summary",
      "ESLint",
      "TypeScript Type Checking",
      "Jest Tests (Node 18)",
      "Jest Tests (Node 20)",
      "Story Checkbox Validation",
      "Install Manifest Validation",
      "IDE Command Sync Validation",
      "Installer Smoke Test"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
PROTECTION
```

---

## Status Check Names

The following job names must match exactly (from `.github/workflows/ci.yml`):

| Status Check Name | Workflow Job | Purpose |
|-------------------|--------------|---------|
| `Validation Summary` | `validation-summary` | Overall CI status |
| `ESLint` | `lint` | Code quality linting |
| `TypeScript Type Checking` | `typecheck` | Type safety validation |
| `Jest Tests (Node 18)` | `test` (matrix: node 18) | Unit tests on Node 18 |
| `Jest Tests (Node 20)` | `test` (matrix: node 20) | Unit tests on Node 20 |
| `Story Checkbox Validation` | `story-validation` | Story progress tracking |
| `Install Manifest Validation` | `manifest-validation` | Manifest integrity |
| `IDE Command Sync Validation` | `ide-sync-validation` | IDE command sync |
| `Installer Smoke Test` | `installer-smoke-test` | Installer integrity |

**Note:** Status check names are case-sensitive and must match the job names exactly.

---

## Verification

After configuration, verify by:

1. Create a test PR with failing tests
2. Attempt to merge - should be blocked by branch protection
3. Fix tests and push
4. Merge should now be allowed after CI passes

```bash
# Check branch protection status
gh api repos/SynkraAI/aios-core/branches/main/protection | jq '.'

# Expected output should include:
# - required_status_checks.contexts[] with all check names
# - required_pull_request_reviews.required_approving_review_count: 1
# - allow_force_pushes: false
# - allow_deletions: false
```

---

## Impact Assessment

**Before Branch Protection:**
- ❌ Code can be pushed directly to main
- ❌ Tests can be skipped
- ❌ No review requirement
- ❌ Force pushes allowed (dangerous)

**After Branch Protection:**
- ✅ All code goes through PRs
- ✅ All CI checks must pass
- ✅ At least 1 reviewer approval required
- ✅ Force pushes blocked
- ✅ Quality gates enforced

**Migration Path:** Existing workflow continues normally. Protection only affects new pushes/PRs.

---

## Troubleshooting

### Issue: Status checks not appearing

**Solution:** Push a commit to trigger CI workflow first. GitHub needs to see the checks run at least once before they can be added to branch protection.

### Issue: Cannot push to main after enabling protection

**Expected behavior.** All changes must go through pull requests now.

**Workflow:**
1. Create feature branch: `git checkout -b feature/my-change`
2. Make changes and commit
3. Push branch: `git push -u origin feature/my-change`
4. Create PR: `gh pr create`
5. Wait for CI checks to pass
6. Request review
7. Merge via PR interface

### Issue: Admin bypass not working

**Solution:** Ensure "Include administrators" is checked in the protection settings.

---

## Related Files

- `.github/workflows/ci.yml` - Main CI workflow
- `.github/workflows/pr-automation.yml` - PR automation
- `.coderabbit.yaml` - CodeRabbit configuration

---

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub API: Branch Protection](https://docs.github.com/en/rest/branches/branch-protection)
- [Story 5.10 - GitHub DevOps Setup](../docs/stories/v2.1/sprint-5/story-5.10-github-devops-user-projects.md)

---

**Action Required:** Repository admin must apply this configuration.

**Priority:** 🔴 HIGH - Branch protection is a critical security and quality control measure.

---

*Generated by @devops (Gage) - AIOS DevOps Setup Task*
*Last Updated: 2026-02-06*
