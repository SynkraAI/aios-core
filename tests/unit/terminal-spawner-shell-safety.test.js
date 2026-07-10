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
});
