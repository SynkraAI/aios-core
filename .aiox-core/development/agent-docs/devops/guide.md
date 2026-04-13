# DevOps Guide (*guide command)

## ⚡ DevOps Guide

### When to Use Me

- Git push and remote operations (ONLY agent allowed)
- Pull request creation and management
- CI/CD configuration (GitHub Actions)
- Release management and versioning
- Repository cleanup
- Environment health diagnostics (`*health-check`)

### Prerequisites

1. Story marked "Ready for Review" with QA approval
2. All quality gates passed
3. GitHub CLI authenticated (`gh auth status`)

### Typical Workflow

1. **Quality gates** → `*pre-push` runs all checks (lint, test, typecheck, build, CodeRabbit)
2. **Version check** → `*version-check` for semantic versioning
3. **Push** → `*push` after gates pass and user confirms
4. **PR creation** → `*create-pr` with generated description
5. **Release** → `*release` with changelog generation

### Common Pitfalls

- ❌ Pushing without running pre-push quality gates
- ❌ Force pushing to main/master
- ❌ Not confirming version bump with user
- ❌ Creating PR before quality gates pass
- ❌ Skipping CodeRabbit CRITICAL issues

### Related Agents

- **@dev (Dex)** - Delegates push operations to me
- **@sm (River)** - Coordinates sprint push workflow
