/**
 * Deploy Tests — Story E7.1.7
 *
 * Tests for:
 * - systemd unit file exists and contains correct directives
 * - install.sh is executable and has correct content
 * - uninstall.sh is executable and has correct content
 * - overnight.sh is executable and has correct content
 * - logrotate config exists and is valid
 * - No secrets in committed files
 * - Backlog directory exists
 *
 * @module deploy.test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgDir = resolve(__dirname, '..');
const projectRoot = resolve(pkgDir, '..', '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a file has the executable bit set for owner.
 */
function isExecutable(filePath) {
  const stat = statSync(filePath);
  // Owner execute bit: 0o100
  return (stat.mode & 0o100) !== 0;
}

/**
 * Read a file as UTF-8 text.
 */
function readText(filePath) {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Parse a basic INI-style systemd unit file into sections.
 * Returns { 'Unit': { key: value, ... }, 'Service': { ... }, ... }
 */
function parseSystemdUnit(text) {
  const sections = {};
  let currentSection = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Section header
    const sectionMatch = line.match(/^\[(\w+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      if (!sections[currentSection]) {
        sections[currentSection] = {};
      }
      continue;
    }

    // Key=Value pair within a section
    if (currentSection) {
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const key = line.substring(0, eqIdx).trim();
        const value = line.substring(eqIdx + 1).trim();

        // Some keys can appear multiple times (e.g., Environment)
        if (sections[currentSection][key] !== undefined) {
          if (Array.isArray(sections[currentSection][key])) {
            sections[currentSection][key].push(value);
          } else {
            sections[currentSection][key] = [sections[currentSection][key], value];
          }
        } else {
          sections[currentSection][key] = value;
        }
      }
    }
  }

  return sections;
}

// ---------------------------------------------------------------------------
// Tests: systemd unit file (AC1, AC2, AC3)
// ---------------------------------------------------------------------------

describe('systemd unit file — aios-orchestrator.service', () => {
  const servicePath = resolve(pkgDir, 'systemd', 'aios-orchestrator.service');

  it('exists', () => {
    assert.ok(existsSync(servicePath), `Service file should exist at ${servicePath}`);
  });

  it('parses as valid INI with [Unit], [Service], [Install] sections', () => {
    const text = readText(servicePath);
    const parsed = parseSystemdUnit(text);

    assert.ok(parsed.Unit, 'Must have [Unit] section');
    assert.ok(parsed.Service, 'Must have [Service] section');
    assert.ok(parsed.Install, 'Must have [Install] section');
  });

  it('[Unit] has correct Description and After', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Unit.Description, 'AIOS SDK Orchestrator');
    assert.equal(parsed.Unit.After, 'network.target');
  });

  it('[Service] Type=simple, User=ubuntu', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.Type, 'simple');
    assert.equal(parsed.Service.User, 'ubuntu');
  });

  it('[Service] WorkingDirectory points to project root', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.WorkingDirectory, '/home/ubuntu/aios-core');
  });

  it('[Service] ExecStart references orchestrator.mjs with --no-interactive', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.ok(
      parsed.Service.ExecStart.includes('orchestrator.mjs'),
      'ExecStart must reference orchestrator.mjs'
    );
    assert.ok(
      parsed.Service.ExecStart.includes('--no-interactive'),
      'ExecStart must include --no-interactive for systemd'
    );
  });

  it('[Service] Restart=on-failure (NOT always) — AC2/NFR-007', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.Restart, 'on-failure');
  });

  it('[Service] RestartSec=10 — AC2/NFR-007', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.RestartSec, '10');
  });

  it('[Unit] StartLimitIntervalSec=300 and StartLimitBurst=3 — AC2', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Unit.StartLimitIntervalSec, '300');
    assert.equal(parsed.Unit.StartLimitBurst, '3');
  });

  it('[Service] MemoryMax=512M — AC3/CON-001', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.MemoryMax, '512M');
  });

  it('[Service] EnvironmentFile loads .env (dash prefix for optional) — AC8', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    // The dash prefix means "don't fail if file doesn't exist"
    assert.ok(
      parsed.Service.EnvironmentFile.includes('.env'),
      'EnvironmentFile must reference .env'
    );
    assert.ok(
      parsed.Service.EnvironmentFile.startsWith('-'),
      'EnvironmentFile must have dash prefix (optional file)'
    );
  });

  it('[Service] WatchdogSec is set — CP-13 fix', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.ok(parsed.Service.WatchdogSec, 'WatchdogSec must be set');
    const watchdogSec = parseInt(parsed.Service.WatchdogSec, 10);
    assert.ok(watchdogSec > 0, 'WatchdogSec must be positive');
  });

  it('[Service] NotifyAccess=main', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.NotifyAccess, 'main');
  });

  it('[Service] StandardOutput=journal and StandardError=journal', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Service.StandardOutput, 'journal');
    assert.equal(parsed.Service.StandardError, 'journal');
  });

  it('[Install] WantedBy=multi-user.target', () => {
    const parsed = parseSystemdUnit(readText(servicePath));

    assert.equal(parsed.Install.WantedBy, 'multi-user.target');
  });

  it('does NOT contain ANTHROPIC_API_KEY — AC8 security', () => {
    const text = readText(servicePath);

    assert.ok(
      !text.includes('ANTHROPIC_API_KEY=sk-'),
      'Service file must NOT contain hardcoded API keys'
    );
    assert.ok(
      !text.includes('sk-ant-'),
      'Service file must NOT contain any Anthropic key prefix'
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: install.sh (AC7)
// ---------------------------------------------------------------------------

describe('install.sh', () => {
  const installPath = resolve(pkgDir, 'install.sh');

  it('exists', () => {
    assert.ok(existsSync(installPath), `install.sh should exist at ${installPath}`);
  });

  it('is executable', () => {
    assert.ok(isExecutable(installPath), 'install.sh must have executable permission');
  });

  it('starts with #!/bin/bash', () => {
    const text = readText(installPath);
    assert.ok(text.startsWith('#!/bin/bash'), 'Must have bash shebang');
  });

  it('contains set -euo pipefail', () => {
    const text = readText(installPath);
    assert.ok(text.includes('set -euo pipefail'), 'Must have strict mode');
  });

  it('copies service file to /etc/systemd/system/', () => {
    const text = readText(installPath);
    assert.ok(
      text.includes('/etc/systemd/system'),
      'Must reference systemd system directory'
    );
  });

  it('runs systemctl daemon-reload', () => {
    const text = readText(installPath);
    assert.ok(text.includes('systemctl daemon-reload'), 'Must run daemon-reload');
  });

  it('runs systemctl enable', () => {
    const text = readText(installPath);
    assert.ok(text.includes('systemctl enable'), 'Must enable the service');
  });
});

// ---------------------------------------------------------------------------
// Tests: uninstall.sh (AC7)
// ---------------------------------------------------------------------------

describe('uninstall.sh', () => {
  const uninstallPath = resolve(pkgDir, 'uninstall.sh');

  it('exists', () => {
    assert.ok(existsSync(uninstallPath), `uninstall.sh should exist at ${uninstallPath}`);
  });

  it('is executable', () => {
    assert.ok(isExecutable(uninstallPath), 'uninstall.sh must have executable permission');
  });

  it('starts with #!/bin/bash', () => {
    const text = readText(uninstallPath);
    assert.ok(text.startsWith('#!/bin/bash'), 'Must have bash shebang');
  });

  it('contains set -euo pipefail', () => {
    const text = readText(uninstallPath);
    assert.ok(text.includes('set -euo pipefail'), 'Must have strict mode');
  });

  it('stops the service', () => {
    const text = readText(uninstallPath);
    assert.ok(text.includes('systemctl stop'), 'Must stop the service');
  });

  it('disables the service', () => {
    const text = readText(uninstallPath);
    assert.ok(text.includes('systemctl disable'), 'Must disable the service');
  });

  it('removes the service file', () => {
    const text = readText(uninstallPath);
    assert.ok(text.includes('rm -f'), 'Must remove the service file');
  });

  it('runs systemctl daemon-reload after removal', () => {
    const text = readText(uninstallPath);
    assert.ok(text.includes('systemctl daemon-reload'), 'Must run daemon-reload');
  });
});

// ---------------------------------------------------------------------------
// Tests: overnight.sh (AC4, AC5)
// ---------------------------------------------------------------------------

describe('overnight.sh', () => {
  const overnightPath = resolve(pkgDir, 'overnight.sh');

  it('exists', () => {
    assert.ok(existsSync(overnightPath), `overnight.sh should exist at ${overnightPath}`);
  });

  it('is executable', () => {
    assert.ok(isExecutable(overnightPath), 'overnight.sh must have executable permission');
  });

  it('starts with #!/bin/bash', () => {
    const text = readText(overnightPath);
    assert.ok(text.startsWith('#!/bin/bash'), 'Must have bash shebang');
  });

  it('contains set -euo pipefail', () => {
    const text = readText(overnightPath);
    assert.ok(text.includes('set -euo pipefail'), 'Must have strict mode');
  });

  it('supports --dry-run flag', () => {
    const text = readText(overnightPath);
    assert.ok(text.includes('--dry-run'), 'Must support --dry-run');
    assert.ok(text.includes('DRY_RUN'), 'Must have DRY_RUN variable');
  });

  it('uses find to enumerate *.story.md files', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('*.story.md'),
      'Must search for *.story.md files'
    );
  });

  it('stops on first failure — CP-14 fix', () => {
    const text = readText(overnightPath);
    // Check for exit code checking and break/exit on failure
    assert.ok(text.includes('EXIT_CODE'), 'Must capture exit code');
    assert.ok(text.includes('exit 1'), 'Must exit on failure');
  });

  it('sends OpenClaw notification on failure — AC5', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('openclaw message send'),
      'Must use openclaw for notifications'
    );
    assert.ok(
      text.includes('FAILED'),
      'Failure notification must include FAILED'
    );
  });

  it('sends OpenClaw notification on batch completion — AC5', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('Complete'),
      'Completion notification must include Complete'
    );
  });

  it('wraps openclaw in || true to prevent notification failure from aborting script — AC5', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('|| true'),
      'OpenClaw calls must be wrapped in || true'
    );
  });

  it('references orchestrator.mjs for execution', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('orchestrator.mjs'),
      'Must call orchestrator.mjs for story execution'
    );
  });

  it('passes --no-interactive to orchestrator', () => {
    const text = readText(overnightPath);
    assert.ok(
      text.includes('--no-interactive'),
      'Must pass --no-interactive to orchestrator'
    );
  });

  it('--dry-run lists stories without executing', () => {
    // Actually run the dry-run to validate it works.
    // If the backlog is empty, the script exits 0 with "No story files found"
    // before reaching the dry-run output. Both outcomes are valid.
    try {
      const result = execFileSync('bash', [
        resolve(pkgDir, 'overnight.sh'),
        '--dry-run',
        '--backlog', resolve(projectRoot, 'docs/stories/backlog'),
      ], {
        encoding: 'utf-8',
        timeout: 5000,
        cwd: pkgDir,
      });

      // Either "Dry Run" (stories found) or "No story files found" (empty backlog)
      const validOutput = result.includes('Dry Run') || result.includes('No story files found');
      assert.ok(
        validOutput,
        'Dry run output should indicate dry run mode or empty backlog'
      );
    } catch (err) {
      // execFileSync throws on non-zero exit — that would be a real failure
      throw err;
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: logrotate config (AC6)
// ---------------------------------------------------------------------------

describe('logrotate config', () => {
  const logrotatePath = resolve(pkgDir, 'systemd', 'aios-orchestrator.logrotate');

  it('exists', () => {
    assert.ok(existsSync(logrotatePath), `Logrotate config should exist at ${logrotatePath}`);
  });

  it('targets orchestrator.log', () => {
    const text = readText(logrotatePath);
    assert.ok(
      text.includes('orchestrator.log'),
      'Must target orchestrator.log'
    );
  });

  it('has daily rotation', () => {
    const text = readText(logrotatePath);
    assert.ok(text.includes('daily'), 'Must have daily rotation');
  });

  it('retains 5 rotated files (NFR-006)', () => {
    const text = readText(logrotatePath);
    assert.ok(text.includes('rotate 5'), 'Must retain 5 rotated files');
  });

  it('has maxsize 10M (NFR-006)', () => {
    const text = readText(logrotatePath);
    assert.ok(text.includes('maxsize 10M'), 'Must have 10M max size');
  });

  it('uses compress', () => {
    const text = readText(logrotatePath);
    assert.ok(text.includes('compress'), 'Must compress rotated logs');
  });

  it('uses copytruncate for orchestrator.log', () => {
    const text = readText(logrotatePath);
    assert.ok(text.includes('copytruncate'), 'Must use copytruncate');
  });
});

// ---------------------------------------------------------------------------
// Tests: Security — no secrets in committed files (AC8)
// ---------------------------------------------------------------------------

describe('security — no secrets in committed files', () => {
  const filesToCheck = [
    resolve(pkgDir, 'systemd', 'aios-orchestrator.service'),
    resolve(pkgDir, 'install.sh'),
    resolve(pkgDir, 'uninstall.sh'),
    resolve(pkgDir, 'overnight.sh'),
    resolve(pkgDir, 'systemd', 'aios-orchestrator.logrotate'),
  ];

  for (const filePath of filesToCheck) {
    const fileName = filePath.split('/').pop();

    it(`${fileName} does not contain API keys`, () => {
      if (!existsSync(filePath)) return; // Skip if file doesn't exist
      const text = readText(filePath);

      assert.ok(!text.includes('sk-ant-'), `${fileName} must not contain Anthropic key prefix`);
      assert.ok(!text.match(/ANTHROPIC_API_KEY\s*=\s*sk-/), `${fileName} must not contain hardcoded API key`);
    });
  }

  it('.env is in .gitignore', () => {
    const gitignorePath = resolve(projectRoot, '.gitignore');
    assert.ok(existsSync(gitignorePath), '.gitignore must exist');

    const text = readText(gitignorePath);
    assert.ok(text.includes('.env'), '.env must be in .gitignore');
  });
});

// ---------------------------------------------------------------------------
// Tests: Backlog directory exists
// ---------------------------------------------------------------------------

describe('backlog directory', () => {
  it('docs/stories/backlog/ exists', () => {
    const backlogDir = resolve(projectRoot, 'docs/stories/backlog');
    assert.ok(existsSync(backlogDir), 'Backlog directory must exist');
  });
});
