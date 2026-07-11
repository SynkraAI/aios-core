'use strict';

const fs = require('fs');
const path = require('path');

describe('terminal dispatch shell safety', () => {
  it('uses argv execution instead of interpolated execSync', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../.aiox-core/core/orchestration/terminal-spawner.js'),
      'utf8',
    );
    expect(source).toContain("execFileSync('bash', [scriptPath, ...args]");
    expect(source).not.toContain("const { spawn, execSync } = require('child_process')");
    expect(source).not.toMatch(/execSync\s*\(\s*`bash/);
  });

  it('quotes every argument before constructing the visual-terminal command', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../.aiox-core/scripts/pm.sh'),
      'utf8',
    );
    expect(source).toContain("printf -v quoted '%q'");
    expect(source).not.toContain('full_cmd+=" ${PARAMS}"');
    expect(source).toContain('osascript - "$cmd"');
  });

  it('guards spawn_terminal at the shell level against test/CI/no-visual environments (#802 follow-up)', () => {
    // Direct `bash pm.sh …` invocations bypass the Node spawner's
    // detectEnvironment(); the shell guard must mirror it so a test runner,
    // CI, or an explicit opt-out can never open a real terminal window.
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../.aiox-core/scripts/pm.sh'),
      'utf8',
    );
    const guard = source
      .split('\n')
      .find((line) => line.includes('if [[') && line.includes('$INLINE_MODE'));
    expect(guard).toBeDefined();
    expect(guard).toContain('JEST_WORKER_ID');
    expect(guard).toContain('NODE_ENV');
    expect(guard).toContain('${CI:-false}');
    expect(guard).toContain('AIOX_NO_VISUAL_TERMINAL');
  });
});
