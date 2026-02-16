'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { runParityValidation } = require('../../.aios-core/infrastructure/scripts/validate-parity');

describe('validate-parity', () => {
  function createMockProjectRoot() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-parity-'));
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(
      path.join(root, 'docs', 'ide-integration.md'),
      [
        '| IDE/CLI | Overall Status |',
        '| --- | --- |',
        '| Claude Code | Works |',
        '| Gemini CLI | Works |',
        '| Codex CLI | Limited |',
        '| Cursor | Limited |',
        '| GitHub Copilot | Limited |',
        '| AntiGravity | Limited |',
      ].join('\n'),
      'utf8',
    );
    return root;
  }

  function buildMockContract() {
    return {
      release: 'AIOS 4.0.4',
      global_required_checks: ['paths'],
      ide_matrix: [
        { ide: 'claude-code', display_name: 'Claude Code', expected_status: 'Works', required_checks: ['claude-sync', 'claude-integration'] },
        { ide: 'gemini', display_name: 'Gemini CLI', expected_status: 'Works', required_checks: ['gemini-sync', 'gemini-integration'] },
        { ide: 'codex', display_name: 'Codex CLI', expected_status: 'Limited', required_checks: ['codex-sync', 'codex-integration', 'codex-skills'] },
        { ide: 'cursor', display_name: 'Cursor', expected_status: 'Limited', required_checks: ['cursor-sync'] },
        { ide: 'github-copilot', display_name: 'GitHub Copilot', expected_status: 'Limited', required_checks: ['github-copilot-sync'] },
        { ide: 'antigravity', display_name: 'AntiGravity', expected_status: 'Limited', required_checks: ['antigravity-sync'] },
      ],
    };
  }

  it('passes when all checks return ok', () => {
    const projectRoot = createMockProjectRoot();
    const ok = { ok: true, errors: [], warnings: [] };
    const result = runParityValidation(
      { projectRoot },
      {
        runSyncValidate: () => ok,
        validateClaudeIntegration: () => ok,
        validateCodexIntegration: () => ok,
        validateGeminiIntegration: () => ok,
        validateCodexSkills: () => ok,
        validatePaths: () => ok,
        loadCompatibilityContract: () => buildMockContract(),
      },
    );

    expect(result.ok).toBe(true);
    expect(result.checks).toHaveLength(11);
    expect(result.checks.every((c) => c.ok)).toBe(true);
    expect(result.contractViolations).toHaveLength(0);
  });

  it('fails when any check fails', () => {
    const projectRoot = createMockProjectRoot();
    let count = 0;
    const result = runParityValidation(
      { projectRoot },
      {
        runSyncValidate: () => ({ ok: true, errors: [], warnings: [] }),
        validateClaudeIntegration: () => ({ ok: true, errors: [], warnings: [] }),
        validateCodexIntegration: () => {
          count += 1;
          return count === 1
            ? { ok: false, errors: ['broken codex integration'], warnings: [] }
            : { ok: true, errors: [], warnings: [] };
        },
        validateGeminiIntegration: () => ({ ok: true, errors: [], warnings: [] }),
        validateCodexSkills: () => ({ ok: true, errors: [], warnings: [] }),
        validatePaths: () => ({ ok: true, errors: [], warnings: [] }),
        loadCompatibilityContract: () => buildMockContract(),
      },
    );

    expect(result.ok).toBe(false);
    expect(result.checks.some((c) => c.id === 'codex-integration' && c.ok === false)).toBe(true);
  });

  it('fails when docs matrix claim diverges from contract', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aios-parity-mismatch-'));
    fs.mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'docs', 'ide-integration.md'), '| IDE/CLI | Overall Status |\n| --- | --- |\n| Codex CLI | Works |\n', 'utf8');

    const ok = { ok: true, errors: [], warnings: [] };
    const result = runParityValidation(
      { projectRoot },
      {
        runSyncValidate: () => ok,
        validateClaudeIntegration: () => ok,
        validateCodexIntegration: () => ok,
        validateGeminiIntegration: () => ok,
        validateCodexSkills: () => ok,
        validatePaths: () => ok,
        loadCompatibilityContract: () => buildMockContract(),
      },
    );

    expect(result.ok).toBe(false);
    expect(result.contractViolations.length).toBeGreaterThan(0);
  });
});
