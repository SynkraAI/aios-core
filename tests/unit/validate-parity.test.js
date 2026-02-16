'use strict';

const { runParityValidation } = require('../../.aios-core/infrastructure/scripts/validate-parity');

describe('validate-parity', () => {
  it('passes when all checks return ok', () => {
    const ok = { ok: true, errors: [], warnings: [] };
    const result = runParityValidation(
      { projectRoot: '/tmp/mock' },
      {
        runSyncValidate: () => ok,
        validateClaudeIntegration: () => ok,
        validateCodexIntegration: () => ok,
        validateGeminiIntegration: () => ok,
        validateCodexSkills: () => ok,
        validatePaths: () => ok,
      },
    );

    expect(result.ok).toBe(true);
    expect(result.checks).toHaveLength(8);
    expect(result.checks.every((c) => c.ok)).toBe(true);
  });

  it('fails when any check fails', () => {
    let count = 0;
    const result = runParityValidation(
      { projectRoot: '/tmp/mock' },
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
      },
    );

    expect(result.ok).toBe(false);
    expect(result.checks.some((c) => c.id === 'codex-integration' && c.ok === false)).toBe(true);
  });
});
