// tests/integration/windows/shell-compat.test.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const isWindows = process.platform === 'win32';

// Skip entire test suite on non-Windows platforms
const describeOnWindows = isWindows ? describe : describe.skip;

describeOnWindows('PowerShell vs CMD Compatibility', () => {
  it('should document PowerShell execution policy handling', async () => {
    const storyPath = path.join(__dirname, '../../../docs/stories/v2.1/sprint-1/story-1.10a-windows-testing.md');
    const storyContent = await fs.readFile(storyPath, 'utf-8');

    // Verify PowerShell execution policy is documented
    expect(storyContent).toContain('Set-ExecutionPolicy');
    expect(storyContent).toContain('-Scope Process');
    expect(storyContent).toContain('-ExecutionPolicy Bypass');
  });

  it('should support PowerShell execution', async () => {
    // Test PowerShell is available
    return new Promise((resolve, reject) => {
      const powershell = spawn('powershell', ['-Command', 'Write-Output "test"'], { shell: true });
      let output = '';

      powershell.stdout.on('data', (data) => {
        output += data.toString();
      });

      powershell.on('close', (code) => {
        if (code === 0) {
          expect(output.trim()).toBe('test');
          resolve();
        } else {
          reject(new Error('PowerShell not available'));
        }
      });
    });
  });

  it('should support CMD execution', async () => {
    // Test CMD is available
    return new Promise((resolve, reject) => {
      const cmd = spawn('cmd', ['/c', 'echo test'], { shell: true });
      let output = '';

      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });

      cmd.on('close', (code) => {
        if (code === 0) {
          expect(output.trim()).toBe('test');
          resolve();
        } else {
          reject(new Error('CMD not available'));
        }
      });
    });
  });

  it('should handle Node.js execution in both shells', async () => {
    // Test Node.js works in PowerShell
    const powershellNode = await new Promise((resolve, reject) => {
      const ps = spawn('powershell', ['-Command', 'node --version'], { shell: true });
      let output = '';

      ps.stdout.on('data', (data) => {
        output += data.toString();
      });

      ps.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('Node.js not available in PowerShell'));
        }
      });
    });

    expect(powershellNode).toMatch(/^v\d+\.\d+\.\d+$/);

    // Test Node.js works in CMD
    const cmdNode = await new Promise((resolve, reject) => {
      const cmd = spawn('cmd', ['/c', 'node --version'], { shell: true });
      let output = '';

      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });

      cmd.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('Node.js not available in CMD'));
        }
      });
    });

    expect(cmdNode).toMatch(/^v\d+\.\d+\.\d+$/);

    // Versions should match
    expect(powershellNode).toBe(cmdNode);
  });

  it('should handle npm execution in both shells', async () => {
    // Test npm works in PowerShell
    const powershellNpm = await new Promise((resolve, reject) => {
      const ps = spawn('powershell', ['-Command', 'npm --version'], { shell: true });
      let output = '';

      ps.stdout.on('data', (data) => {
        output += data.toString();
      });

      ps.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('npm not available in PowerShell'));
        }
      });
    });

    expect(powershellNpm).toMatch(/^\d+\.\d+\.\d+$/);

    // Test npm works in CMD
    const cmdNpm = await new Promise((resolve, reject) => {
      const cmd = spawn('cmd', ['/c', 'npm --version'], { shell: true });
      let output = '';

      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });

      cmd.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('npm not available in CMD'));
        }
      });
    });

    expect(cmdNpm).toMatch(/^\d+\.\d+\.\d+$/);

    // Versions should match
    expect(powershellNpm).toBe(cmdNpm);
  });

  it('should verify path handling works in both shells', async () => {
    // Test path.join() produces Windows paths
    const testPath = path.join('C:', 'Users', 'Test', 'Project');

    // Windows uses backslashes
    expect(testPath).toContain('\\');

    // Path should be normalized
    expect(testPath).not.toContain('//');
    expect(testPath).not.toContain('/\\');
  });
});
