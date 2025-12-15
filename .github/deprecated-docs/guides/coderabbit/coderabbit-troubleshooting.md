# CodeRabbit Troubleshooting Guide

> **Version:** 1.0.0 | **Last Updated:** 2025-11-28 | **Status:** Source of Truth

## Table of Contents

1. [Quick Diagnostic](#1-quick-diagnostic)
2. [CLI Issues](#2-cli-issues)
3. [GitHub App Issues](#3-github-app-issues)
4. [Agent Integration Issues](#4-agent-integration-issues)
5. [Self-Healing Issues](#5-self-healing-issues)
6. [Performance Issues](#6-performance-issues)
7. [Common Error Messages](#7-common-error-messages)

---

## 1. Quick Diagnostic

### Health Check Commands

```bash
# Check CLI installation (in WSL)
wsl bash -c '~/.local/bin/coderabbit --version'
# Expected: v0.3.4 (or newer)

# Check authentication
wsl bash -c '~/.local/bin/coderabbit auth status'
# Expected: Authenticated as pedro@allfluence.com.br

# Test CLI execution
wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
# Expected: Review output (may take 7-15 minutes)

# Check GitHub App
gh api repos/{owner}/aios-fullstack/installation
# Expected: Installation object with CodeRabbit

# Check WSL status
wsl --status
# Expected: WSL 2 running
```

### Diagnostic Flowchart

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CODERABBIT DIAGNOSTIC FLOWCHART                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SYMPTOM: CodeRabbit not working                                        │
│           │                                                             │
│           ├── CLI not found?                                            │
│           │   └── See Section 2.1                                       │
│           │                                                             │
│           ├── Authentication error?                                     │
│           │   └── See Section 2.2                                       │
│           │                                                             │
│           ├── Timeout during review?                                    │
│           │   └── See Section 6.1                                       │
│           │                                                             │
│           ├── WSL not working?                                          │
│           │   └── See Section 2.3                                       │
│           │                                                             │
│           ├── GitHub App not reviewing PRs?                             │
│           │   └── See Section 3.1                                       │
│           │                                                             │
│           ├── Self-healing loop not working?                            │
│           │   └── See Section 5.1                                       │
│           │                                                             │
│           └── Generic error message?                                    │
│               └── See Section 7                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CLI Issues

### 2.1 CLI Not Found

**Symptom:**
```
command not found: coderabbit
```

**Causes:**
1. CLI not installed in WSL
2. Not using WSL wrapper correctly
3. PATH not configured

**Solutions:**

```bash
# Solution 1: Install CLI in WSL
wsl bash -c 'curl -fsSL https://coderabbit.ai/install.sh | bash'

# Solution 2: Verify installation path
wsl bash -c 'ls -la ~/.local/bin/coderabbit'

# Solution 3: Use full path
wsl bash -c '~/.local/bin/coderabbit --version'

# Solution 4: Add to PATH (in WSL ~/.bashrc)
wsl bash -c 'echo "export PATH=\$PATH:\$HOME/.local/bin" >> ~/.bashrc && source ~/.bashrc'
```

### 2.2 Authentication Error

**Symptom:**
```
Error: Authentication required. Run `coderabbit auth login`
```

**Solutions:**

```bash
# Check current auth status
wsl bash -c '~/.local/bin/coderabbit auth status'

# Re-authenticate
wsl bash -c '~/.local/bin/coderabbit auth login'
# Follow browser prompts

# Clear cached credentials and re-auth
wsl bash -c 'rm -rf ~/.coderabbit && ~/.local/bin/coderabbit auth login'
```

### 2.3 WSL Issues

**Symptom:**
```
'wsl' is not recognized as an internal or external command
```
or
```
The Windows Subsystem for Linux instance has terminated
```

**Solutions:**

```bash
# Solution 1: Check WSL status
wsl --status

# Solution 2: Restart WSL
wsl --shutdown
wsl

# Solution 3: Set default distribution
wsl --set-default Ubuntu

# Solution 4: Reinstall distribution (if corrupted)
wsl --unregister Ubuntu
wsl --install -d Ubuntu
# Re-install CodeRabbit after
```

### 2.4 Path Conversion Issues

**Symptom:**
```
No such file or directory: /mnt/c/Users/...
```

**Cause:** Windows path not properly converted to WSL path

**Solutions:**

```bash
# Ensure correct path format
# Windows: C:\Users\AllFluence-User\Workspaces\...
# WSL:     /mnt/c/Users/AllFluence-User/Workspaces/...

# Use wslpath to convert
wsl bash -c 'cd $(wslpath -u "C:\Users\AllFluence-User\Workspaces\AIOS\AIOS-V4\aios-fullstack") && pwd'

# Alternative: Use lowercase drive letter
wsl bash -c 'cd /mnt/c/users/allfluence-user/workspaces/aios/aios-v4/aios-fullstack && ls'
```

---

## 3. GitHub App Issues

### 3.1 App Not Reviewing PRs

**Symptom:** PR created but no CodeRabbit comments appear

**Checklist:**

| Check | Command/Action | Expected |
|-------|----------------|----------|
| App installed | GitHub Marketplace | "Installed" badge |
| Repo authorized | GitHub Settings > Installed Apps | aios-fullstack listed |
| .coderabbit.yaml exists | Check project root | File present |
| YAML valid | `yamllint .coderabbit.yaml` | No errors |
| Auto-review enabled | Check yaml config | `auto_review.enabled: true` |
| Base branch correct | Check yaml config | Branch in `base_branches` list |

**Solutions:**

```yaml
# Solution 1: Check .coderabbit.yaml exists and is valid
version: 2
reviews:
  auto_review:
    enabled: true
    base_branches:
      - main
      - develop
```

```bash
# Solution 2: Trigger manual review
# Comment on PR:
@coderabbitai review
```

```bash
# Solution 3: Check app webhook status
gh api repos/{owner}/{repo}/hooks
# Look for coderabbit webhook, check recent_deliveries
```

### 3.2 App Review Too Slow

**Symptom:** CodeRabbit takes more than 5 minutes to comment on PR

**Possible Causes:**
1. Large PR (many files)
2. CodeRabbit service overload
3. Network issues

**Solutions:**
1. Split PR into smaller chunks
2. Wait and retry (service may be busy)
3. Check CodeRabbit status page: https://status.coderabbit.ai

### 3.3 App Comments Too Generic

**Symptom:** CodeRabbit comments don't seem context-aware

**Solutions:**

```yaml
# Add path_instructions for context
reviews:
  path_instructions:
    - path: "src/api/**"
      instructions: |
        This is an API layer.
        Critical: Input validation, auth checks.
        High: Error handling, rate limiting.

    - path: ".aios-core/**"
      instructions: |
        AIOS agent definitions.
        Focus on workflow correctness.
        Preserve personality sections.
```

### 3.4 Wrong Files Being Reviewed

**Symptom:** CodeRabbit reviews files that should be ignored

**Solution:**

```yaml
# Add path_filters to exclude files
reviews:
  path_filters:
    - "!**/node_modules/**"
    - "!**/dist/**"
    - "!**/build/**"
    - "!**/*.min.js"
    - "!**/package-lock.json"
```

---

## 4. Agent Integration Issues

### 4.1 @qa Agent Not Running CodeRabbit

**Symptom:** `*review {story}` doesn't trigger CodeRabbit

**Checklist:**

| Check | Location | Expected |
|-------|----------|----------|
| Integration enabled | `.aios-core/agents/qa.md` | `coderabbit_integration.enabled: true` |
| WSL config correct | `.aios-core/agents/qa.md` | Valid paths |
| Command correct | `.aios-core/agents/qa.md` | Full WSL command |

**Solution:** Verify agent config:

```yaml
# In .aios-core/agents/qa.md
coderabbit_integration:
  enabled: true
  installation_mode: wsl
  wsl_config:
    distribution: Ubuntu
    installation_path: ~/.local/bin/coderabbit
    working_directory: /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack
  commands:
    qa_pre_review_uncommitted: |
      wsl bash -c 'cd /mnt/c/Users/AllFluence-User/Workspaces/AIOS/AIOS-V4/aios-fullstack && ~/.local/bin/coderabbit --prompt-only -t uncommitted'
```

### 4.2 @devops Agent PR Monitoring Fails

**Symptom:** `*create-pr` doesn't wait for CodeRabbit review

**Cause:** PR monitoring not configured or GitHub CLI not authenticated

**Solutions:**

```bash
# Check GitHub CLI auth
gh auth status

# Re-authenticate if needed
gh auth login

# Test API access
gh api repos/{owner}/{repo}/pulls
```

### 4.3 Severity Handling Not Working

**Symptom:** CRITICAL issues not blocking, or LOW issues being fixed

**Solution:** Check severity handling config:

```yaml
# In agent definition
severity_handling:
  CRITICAL: Block story completion, must fix immediately  # Must block
  HIGH: Report in QA gate, recommend fix before merge     # Should warn
  MEDIUM: Document as technical debt                      # Document only
  LOW: Optional improvements                              # Ignore
```

---

## 5. Self-Healing Issues

### 5.1 Self-Healing Loop Not Triggering

**Symptom:** CRITICAL issues found but no auto-fix attempted

**Causes:**
1. Self-healing disabled in config
2. Max iterations already reached
3. Issue type not recognized

**Solutions:**

```yaml
# Ensure self-healing is enabled
self_healing:
  enabled: true
  max_iterations: 3
  fix_levels:
    CRITICAL: always      # Must be "always" for auto-fix
    HIGH: ask_user
    MEDIUM: ignore
    LOW: ignore
```

### 5.2 Self-Healing Creates Broken Code

**Symptom:** Auto-fixes introduce new errors

**Solutions:**

1. **Run tests after each iteration:**
```bash
# Add to self-healing workflow
npm test  # After each fix
```

2. **Reduce auto-fix scope:**
```yaml
self_healing:
  fix_levels:
    CRITICAL: ask_user  # Change from "always" to "ask_user"
```

3. **Review and revert if needed:**
```bash
git diff  # Review changes
git checkout -- {file}  # Revert specific file
```

### 5.3 Self-Healing Infinite Loop

**Symptom:** Same issue keeps appearing after fix attempts

**Causes:**
1. Fix not actually resolving issue
2. CodeRabbit detecting different aspect of same problem
3. Fix introducing new CRITICAL issue

**Solutions:**

1. **Check iteration count:**
```
Max iterations: 3
Current iteration: 3
Status: STOPPED (max reached)
```

2. **Review fix history:**
```bash
git diff HEAD~3..HEAD  # See last 3 changes
```

3. **Manual intervention:**
```
Self-healing stopped after 3 iterations.
Remaining issues: 1 CRITICAL
Please review and fix manually.
```

---

## 6. Performance Issues

### 6.1 CLI Review Timeout

**Symptom:** Review takes more than 30 minutes or hangs

**Causes:**
1. Large codebase
2. Many files changed
3. Network issues
4. CodeRabbit service slow

**Solutions:**

```bash
# Solution 1: Increase timeout
# In agent config:
timeouts:
  default: 1800000  # 30 minutes
  max: 2700000      # 45 minutes

# Solution 2: Review smaller scope
wsl bash -c 'cd ... && coderabbit --prompt-only -t uncommitted -- src/api/'

# Solution 3: Check network
ping coderabbit.ai

# Solution 4: Cancel and retry
# Ctrl+C to cancel, wait, retry
```

### 6.2 High Memory Usage

**Symptom:** WSL using excessive memory during review

**Solutions:**

```bash
# Limit WSL memory (create/edit .wslconfig in Windows user folder)
# %UserProfile%\.wslconfig

[wsl2]
memory=4GB
processors=2
```

### 6.3 Slow WSL Disk Access

**Symptom:** File operations in /mnt/c/ are slow

**Solution:** Use native WSL filesystem when possible

```bash
# Clone repo in WSL native filesystem
cd ~
git clone https://github.com/org/repo.git
cd repo
coderabbit --prompt-only -t uncommitted
```

---

## 7. Common Error Messages

### Error: "No changes to review"

**Cause:** No uncommitted/committed changes detected

**Solutions:**
```bash
# Check git status
git status

# If changes exist but not detected:
git add .  # Stage changes
wsl bash -c 'cd ... && coderabbit --prompt-only -t uncommitted'
```

### Error: "Rate limit exceeded"

**Cause:** Too many API calls to CodeRabbit

**Solution:** Wait 15-30 minutes before retrying

### Error: "Invalid configuration"

**Cause:** .coderabbit.yaml syntax error

**Solution:**
```bash
# Validate YAML
yamllint .coderabbit.yaml

# Check for common issues:
# - Indentation (use 2 spaces)
# - Missing colons
# - Unquoted special characters
```

### Error: "Permission denied"

**Cause:** File permissions in WSL

**Solution:**
```bash
# Fix permissions
wsl bash -c 'chmod +x ~/.local/bin/coderabbit'
```

### Error: "Unable to parse output"

**Cause:** CodeRabbit output format changed or unexpected

**Solution:** Update CLI to latest version
```bash
wsl bash -c 'curl -fsSL https://coderabbit.ai/install.sh | bash'
```

---

## Support Resources

### Documentation
- [CodeRabbit Official Docs](https://docs.coderabbit.ai/)
- [CLI Reference](https://docs.coderabbit.ai/cli/overview)
- [Configuration Reference](https://docs.coderabbit.ai/reference/configuration)

### Community
- [CodeRabbit Discord](https://discord.gg/coderabbit)
- [GitHub Issues](https://github.com/coderabbitai/coderabbit/issues)

### AIOS Support
- [Integration Guide](./coderabbit-integration-guide.md)
- [Configuration Reference](./coderabbit-configuration-reference.md)
- [Workflows](./coderabbit-workflows.md)

---

## Troubleshooting Checklist

Before reporting an issue, verify:

- [ ] WSL is running (`wsl --status`)
- [ ] CLI is installed (`wsl bash -c '~/.local/bin/coderabbit --version'`)
- [ ] Authentication is valid (`wsl bash -c '~/.local/bin/coderabbit auth status'`)
- [ ] Working directory is correct
- [ ] .coderabbit.yaml is valid YAML
- [ ] GitHub App is installed (for PR reviews)
- [ ] Agent configs have CodeRabbit enabled
- [ ] Network connectivity is working

---

**Maintainer:** @architect (Aria)
**Last Updated:** 2025-11-28
**Version:** 1.0.0
