# HCS Self-Healing Specification

**Version:** 1.0
**Status:** Proposed
**Created:** 2025-12-30
**Story:** HCS-1 Investigation
**Author:** @architect (Aria) via @dev (Dex)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Self-Healing Philosophy](#self-healing-philosophy)
- [Tier Definitions](#tier-definitions)
- [Safety Rules](#safety-rules)
- [Backup Strategy](#backup-strategy)
- [Rollback Procedures](#rollback-procedures)
- [Implementation Guidelines](#implementation-guidelines)

---

## Executive Summary

This document specifies the self-healing capabilities of the AIOS Health Check System (HCS). Self-healing allows the system to automatically fix certain issues while maintaining safety and user control.

### Core Principles

1. **Safety First:** Never modify files that could cause data loss or security issues
2. **Transparency:** All actions are logged and reversible
3. **User Control:** Critical fixes require explicit confirmation
4. **Incremental:** Start with safe fixes, escalate to user for complex issues

---

## Self-Healing Philosophy

### Industry Patterns Applied

| System         | Self-Healing Approach                   | Lesson for HCS                               |
| -------------- | --------------------------------------- | -------------------------------------------- |
| **Kubernetes** | Restart containers on liveness failure  | Automatic recovery for known-safe operations |
| **VS Code**    | Auto-update extensions, block malicious | Silent updates, explicit blocks              |
| **Terraform**  | `apply` only after `plan` approval      | Separate detection from remediation          |
| **npm/yarn**   | `--update-checksums` to fix integrity   | User-initiated recovery commands             |
| **Git**        | `reflog` for recovery                   | Always preserve history/backups              |

### Decision Tree

```
Issue Detected
     │
     ▼
┌─────────────────┐
│ Is fix trivial  │
│ and reversible? │
└────────┬────────┘
         │
    Yes  │  No
    ▼    │  ▼
┌────────┴──────────┐
│                   │
▼                   ▼
Tier 1           ┌─────────────────┐
Auto-fix         │ Does fix modify │
silently         │ user data/code? │
                 └────────┬────────┘
                          │
                     No   │   Yes
                     ▼    │   ▼
                 ┌────────┴──────────┐
                 │                   │
                 ▼                   ▼
              Tier 2              Tier 3
              Prompt              Manual
              User                Guide
```

---

## Tier Definitions

### Tier 1: Silent Auto-Fix

**Definition:** Safe, reversible operations that require no user confirmation.

**Characteristics:**

- Zero risk of data loss
- Fully reversible
- No user code/configuration changes
- System/framework files only
- Backup always created

**Actions:**

| Action                 | Description                                        | Backup        |
| ---------------------- | -------------------------------------------------- | ------------- |
| `recreate_config`      | Recreate missing `.aios/config.yaml` from template | Yes           |
| `clear_cache`          | Clear stale cache files in `.aios/cache/`          | Yes           |
| `create_dirs`          | Create missing framework directories               | No (additive) |
| `fix_permissions`      | Fix file permissions on framework files            | Yes           |
| `regenerate_lockfile`  | Regenerate package lockfile integrity              | Yes           |
| `restart_mcp`          | Restart unresponsive MCP servers                   | No            |
| `reset_project_status` | Reset corrupted project status file                | Yes           |

**Example Issues:**

```yaml
# Tier 1 issues - auto-fix silently
- id: PC-001
  description: '.aios/config.yaml missing'
  severity: CRITICAL
  tier: 1
  action: recreate_config
  message: 'Recreated config from template'

- id: LE-005
  description: 'MCP server not responding'
  severity: HIGH
  tier: 1
  action: restart_mcp
  message: 'Restarted MCP server'

- id: RH-008
  description: '.gitignore incomplete'
  severity: LOW
  tier: 1
  action: append_gitignore
  message: 'Added missing entries to .gitignore'
```

**User Notification:**

```
✅ Auto-fixed 3 issues:
   • Recreated .aios/config.yaml (backup: .aios/backups/config.yaml.1735564800)
   • Restarted context7 MCP server
   • Added .aios/cache/ to .gitignore
```

---

### Tier 2: Prompted Auto-Fix

**Definition:** Moderate-risk operations that require user confirmation before execution.

**Characteristics:**

- May modify user-adjacent files (not user code)
- Reversible with backup
- Could affect workflow temporarily
- Requires explicit "yes" from user

**Actions:**

| Action                | Description                        | Backup | User Prompt                   |
| --------------------- | ---------------------------------- | ------ | ----------------------------- |
| `update_deps`         | Update outdated dependencies       | Yes    | "Update X packages?"          |
| `fix_symlinks`        | Repair broken symlinks             | Yes    | "Fix N broken links?"         |
| `regenerate_files`    | Regenerate template-based files    | Yes    | "Regenerate from template?"   |
| `fix_ide_config`      | Repair IDE configuration           | Yes    | "Repair VS Code settings?"    |
| `migrate_config`      | Migrate config to new version      | Yes    | "Migrate config v1→v2?"       |
| `create_missing_docs` | Create missing documentation files | No     | "Create coding-standards.md?" |

**Example Issues:**

```yaml
# Tier 2 issues - prompt user
- id: PC-003
  description: 'coding-standards.md missing'
  severity: MEDIUM
  tier: 2
  action: create_missing_docs
  prompt: 'Create coding-standards.md from template?'
  options:
    - 'yes' # Create file
    - 'no' # Skip
    - 'custom' # Let user specify location

- id: RH-006
  description: '3 packages outdated (security patches)'
  severity: MEDIUM
  tier: 2
  action: update_deps
  prompt: 'Update 3 packages with security patches?'
  details:
    - 'lodash: 4.17.20 → 4.17.21 (security)'
    - 'axios: 0.21.0 → 0.21.4 (security)'
    - 'yaml: 2.0.0 → 2.3.4 (security)'
```

**User Interaction:**

```
⚠️ Found 2 issues that require confirmation:

[1/2] coding-standards.md missing
      Action: Create from template
      Location: docs/framework/coding-standards.md

      Apply fix? [Y]es / [N]o / [S]kip all: y

      ✅ Created docs/framework/coding-standards.md

[2/2] 3 packages have security updates
      Action: npm update lodash axios yaml
      Backup: package-lock.json.backup

      Apply fix? [Y]es / [N]o / [S]kip all: y

      ✅ Updated 3 packages
```

---

### Tier 3: Manual Guide

**Definition:** High-risk or complex issues that cannot be safely auto-fixed. Provides guidance for manual resolution.

**Characteristics:**

- Risk of data loss or corruption
- Involves user code/configuration
- Requires human judgment
- Security-sensitive operations
- Breaking changes

**Actions:**

| Action          | Description                       | Guidance Provided   |
| --------------- | --------------------------------- | ------------------- |
| `manual_guide`  | Provide step-by-step instructions | Commands to run     |
| `external_link` | Link to documentation             | URL + context       |
| `suggest_agent` | Suggest appropriate agent         | "@architect review" |
| `escalate`      | Flag for human review             | Open GitHub issue   |

**Example Issues:**

```yaml
# Tier 3 issues - manual guide only
- id: PC-002
  description: "Task references non-existent agent 'legacy-dev'"
  severity: HIGH
  tier: 3
  guide:
    title: 'Fix Invalid Agent Reference'
    steps:
      - 'Open .aios-core/development/tasks/deploy.md'
      - 'Find line: agent: legacy-dev'
      - 'Replace with: agent: devops'
      - 'Verify with: npx aios task validate deploy'
    suggested_agent: '@architect'

- id: RH-007
  description: 'Critical vulnerability in production dependency'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'Critical Security Vulnerability'
    details: 'CVE-2024-XXXXX in express@4.17.0'
    steps:
      - 'Review CVE details: https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'
      - 'Check if vulnerability affects your usage'
      - 'If affected, run: npm audit fix --force'
      - 'Test application thoroughly after update'
      - 'Consider consulting @architect for breaking changes'
    urgency: 'IMMEDIATE'
    external_link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX'

- id: DE-004
  description: 'SSL certificate expires in 7 days'
  severity: CRITICAL
  tier: 3
  guide:
    title: 'SSL Certificate Expiration Warning'
    steps:
      - 'Contact your SSL provider or IT team'
      - 'Renew certificate before expiration'
      - 'Update certificate in deployment environment'
    suggested_agent: '@devops'
```

**User Guidance Output:**

```
❌ Found 2 issues requiring manual intervention:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CRITICAL] SSL Certificate Expiration Warning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your SSL certificate expires in 7 days.

Steps to resolve:
  1. Contact your SSL provider or IT team
  2. Renew certificate before expiration
  3. Update certificate in deployment environment

Suggested: Activate @devops for assistance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HIGH] Fix Invalid Agent Reference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Task 'deploy' references non-existent agent 'legacy-dev'.

Steps to resolve:
  1. Open .aios-core/development/tasks/deploy.md
  2. Find line: agent: legacy-dev
  3. Replace with: agent: devops
  4. Verify with: npx aios task validate deploy

Suggested: Activate @architect for review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Safety Rules

### Never Auto-Fix (Blocklist)

The following types of files/operations are **NEVER** auto-fixed:

```yaml
neverAutoFix:
  files:
    - '**/*.{js,ts,jsx,tsx,py,go,rs}' # Source code
    - '**/*.{json,yaml,yml}' # User config (outside .aios/)
    - '.env*' # Environment files
    - '**/secrets/**' # Secrets
    - '**/credentials*' # Credentials
    - '.git/**' # Git internals
    - 'package.json' # User dependencies
    - 'tsconfig.json' # User config
    - '.eslintrc*' # User linting rules

  operations:
    - delete_user_files # Never delete user files
    - modify_git_history # Never rewrite git history
    - change_remote_urls # Never modify remotes
    - push_to_remote # Never auto-push
    - modify_ci_secrets # Never touch CI secrets
    - change_permissions_recursive # Never chmod -R

  conditions:
    - file_has_uncommitted_changes # Don't touch modified files
    - file_size_exceeds_1mb # Large files need review
    - path_outside_project # Stay in project bounds
```

### Safe Auto-Fix (Allowlist)

Only these patterns are candidates for auto-fix:

```yaml
safeToAutoFix:
  paths:
    - '.aios/**' # AIOS workspace files
    - '.aios-core/**/*.yaml' # Framework YAML (careful)
    - '.claude/**' # Claude configuration
    - '.vscode/settings.json' # IDE settings only
    - '.cursor/**' # Cursor IDE config
    - 'node_modules/.cache/**' # Cache files

  conditions:
    - file_is_regenerable # Can be recreated from template
    - file_has_backup # Backup exists
    - action_is_reversible # Can be undone
    - user_initiated_check # User ran health-check
```

### Pre-Fix Validation

Before any fix is applied:

```javascript
async function validateFix(check, action) {
  // 1. Verify action is in allowlist
  if (!SAFE_ACTIONS.includes(action.type)) {
    return { allowed: false, reason: 'Action not in safe list' };
  }

  // 2. Check file path is safe
  if (!isPathSafe(action.targetPath)) {
    return { allowed: false, reason: 'Path not in safe zone' };
  }

  // 3. Verify file hasn't been modified
  if (await hasUncommittedChanges(action.targetPath)) {
    return { allowed: false, reason: 'File has uncommitted changes' };
  }

  // 4. Ensure backup can be created
  if (action.requiresBackup && !(await canCreateBackup(action.targetPath))) {
    return { allowed: false, reason: 'Cannot create backup' };
  }

  // 5. Verify action is reversible
  if (!action.rollbackCommand) {
    return { allowed: false, reason: 'No rollback procedure defined' };
  }

  return { allowed: true };
}
```

---

## Backup Strategy

### Backup Location

```
.aios/
├── backups/
│   ├── health-check-2025-12-30T10-30-00/
│   │   ├── manifest.json           # What was backed up
│   │   ├── config.yaml             # Backed up files
│   │   ├── settings.json
│   │   └── package-lock.json
│   ├── health-check-2025-12-29T14-20-00/
│   │   └── ...
│   └── .retention                  # Retention policy
```

### Backup Manifest

```json
{
  "id": "health-check-2025-12-30T10-30-00",
  "created": "2025-12-30T10:30:00.000Z",
  "checkId": "HC-20251230-103000",
  "issuesFixed": 3,
  "files": [
    {
      "original": ".aios/config.yaml",
      "backup": "config.yaml",
      "action": "recreate_config",
      "checksum": "sha256:abc123...",
      "size": 2048
    }
  ],
  "rollbackCommand": "npx aios health-check --rollback health-check-2025-12-30T10-30-00"
}
```

### Retention Policy

```yaml
# .aios/backups/.retention
retention:
  maxBackups: 10 # Keep last 10 backups
  maxAge: 7 # days
  minKeep: 3 # Always keep at least 3
  autoCleanup: true # Clean old backups automatically
```

### Backup Before Fix

```javascript
async function createBackup(action) {
  const backupId = `health-check-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const backupDir = path.join('.aios', 'backups', backupId);

  await fs.ensureDir(backupDir);

  const manifest = {
    id: backupId,
    created: new Date().toISOString(),
    files: [],
  };

  for (const file of action.filesToBackup) {
    const content = await fs.readFile(file);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    const backupName = path.basename(file);

    await fs.writeFile(path.join(backupDir, backupName), content);

    manifest.files.push({
      original: file,
      backup: backupName,
      checksum: `sha256:${checksum}`,
      size: content.length,
    });
  }

  await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });

  return { backupId, backupDir, manifest };
}
```

---

## Rollback Procedures

### Automatic Rollback

If a fix fails mid-execution:

```javascript
async function applyFixWithRollback(check, action) {
  const backup = await createBackup(action);

  try {
    await action.execute();
    await verifyFix(check);

    return { success: true, backup: backup.backupId };
  } catch (error) {
    console.error(`Fix failed: ${error.message}`);
    console.log(`Rolling back from backup: ${backup.backupId}`);

    await rollback(backup);

    return { success: false, error: error.message, rolledBack: true };
  }
}
```

### Manual Rollback Command

```bash
# Rollback specific backup
npx aios health-check --rollback health-check-2025-12-30T10-30-00

# List available backups
npx aios health-check --list-backups

# Rollback last backup
npx aios health-check --rollback-last
```

### Rollback Process

```javascript
async function rollback(backupId) {
  const backupDir = path.join('.aios', 'backups', backupId);
  const manifest = await fs.readJson(path.join(backupDir, 'manifest.json'));

  console.log(`Rolling back ${manifest.files.length} files...`);

  for (const file of manifest.files) {
    const backupPath = path.join(backupDir, file.backup);
    const content = await fs.readFile(backupPath);

    // Verify checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    if (`sha256:${checksum}` !== file.checksum) {
      throw new Error(`Backup corrupted: ${file.original}`);
    }

    await fs.writeFile(file.original, content);
    console.log(`  ✅ Restored: ${file.original}`);
  }

  console.log('Rollback complete.');
}
```

---

## Implementation Guidelines

### Self-Healing Engine Structure

```
.aios-core/core/health-check/
├── healers/
│   ├── index.js              # Healer registry
│   ├── tier1/
│   │   ├── recreate-config.js
│   │   ├── clear-cache.js
│   │   ├── restart-mcp.js
│   │   └── fix-permissions.js
│   ├── tier2/
│   │   ├── update-deps.js
│   │   ├── fix-ide-config.js
│   │   └── create-docs.js
│   └── tier3/
│       ├── manual-guide-generator.js
│       └── escalation-handler.js
├── backup/
│   ├── backup-manager.js
│   ├── retention-policy.js
│   └── rollback-handler.js
└── safety/
    ├── allowlist.js
    ├── blocklist.js
    └── validator.js
```

### Healer Interface

```javascript
// Base healer interface
class BaseHealer {
  constructor(options = {}) {
    this.tier = options.tier || 1;
    this.requiresBackup = options.requiresBackup || true;
    this.requiresConfirmation = options.requiresConfirmation || false;
  }

  // Override in subclass
  async canHeal(issue) {
    throw new Error('Not implemented');
  }

  // Override in subclass
  async heal(issue, context) {
    throw new Error('Not implemented');
  }

  // Override in subclass
  async verify(issue) {
    throw new Error('Not implemented');
  }

  // Common rollback
  async rollback(backupId) {
    return await rollbackManager.rollback(backupId);
  }
}

// Example Tier 1 healer
class RecreateConfigHealer extends BaseHealer {
  constructor() {
    super({ tier: 1, requiresBackup: true, requiresConfirmation: false });
  }

  async canHeal(issue) {
    return issue.id === 'PC-001' && !(await fs.pathExists('.aios/config.yaml'));
  }

  async heal(issue, context) {
    const template = await fs.readFile('.aios-core/templates/config-template.yaml');
    await fs.writeFile('.aios/config.yaml', template);
    return { success: true, message: 'Recreated config from template' };
  }

  async verify(issue) {
    return await fs.pathExists('.aios/config.yaml');
  }
}
```

### Logging All Healing Actions

```javascript
// .aios/logs/self-healing.log
const healingLog = {
  append: async (entry) => {
    const logPath = '.aios/logs/self-healing.log';
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
  },
};

// Usage
await healingLog.append({
  action: 'recreate_config',
  tier: 1,
  issue: 'PC-001',
  backup: 'health-check-2025-12-30T10-30-00',
  result: 'success',
  duration: '45ms',
});
```

---

## Related Documents

- [ADR: HCS Architecture](./adr/adr-hcs-health-check-system.md)
- [HCS Execution Modes](./hcs-execution-modes.md)
- [HCS Check Specifications](./hcs-check-specifications.md)
- [Story HCS-2: Implementation](../stories/epics/epic-health-check-system/story-hcs-2-implementation.md)

---

_Document created as part of Story HCS-1 Investigation_
