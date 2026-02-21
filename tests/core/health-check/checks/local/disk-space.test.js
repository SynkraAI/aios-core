/**
 * Unit tests for DiskSpaceCheck
 *
 * Tests disk space availability: free space thresholds, platform-specific
 * parsing (Unix df, Windows PowerShell/wmic), and healer guide.
 */

const { execSync } = require('child_process');
const os = require('os');
const DiskSpaceCheck = require('../../../../../.aios-core/core/health-check/checks/local/disk-space');

jest.mock('child_process');
jest.mock('os');

describe('DiskSpaceCheck', () => {
  let check;

  beforeEach(() => {
    jest.resetAllMocks();
    check = new DiskSpaceCheck();
  });

  // ============================================================
  // Constructor
  // ============================================================
  describe('constructor', () => {
    test('has correct id', () => {
      expect(check.id).toBe('local.disk-space');
    });

    test('has MEDIUM severity', () => {
      expect(check.severity).toBe('MEDIUM');
    });

    test('is not cacheable', () => {
      expect(check.cacheable).toBe(false);
    });

    test('has healingTier 3', () => {
      expect(check.healingTier).toBe(3);
    });
  });

  // ============================================================
  // execute - sufficient space (Unix)
  // ============================================================
  describe('execute - pass (Unix)', () => {
    test('passes with plenty of free space', async () => {
      os.platform.mockReturnValue('darwin');
      // df -k: total=500GB, used=200GB, avail=300GB
      const totalKB = 500 * 1024 * 1024;
      const usedKB = 200 * 1024 * 1024;
      const availKB = 300 * 1024 * 1024;
      execSync.mockReturnValue(
        `Filesystem  1K-blocks     Used     Avail Capacity\n/dev/disk1  ${totalKB} ${usedKB} ${availKB}    40%\n`
      );

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('pass');
      expect(result.message).toContain('OK');
    });
  });

  // ============================================================
  // execute - warning (low space)
  // ============================================================
  describe('execute - warning', () => {
    test('warns when free space below 5GB', async () => {
      os.platform.mockReturnValue('linux');
      const availKB = 3 * 1024 * 1024; // 3GB in KB
      const totalKB = 100 * 1024 * 1024;
      const usedKB = totalKB - availKB;
      execSync.mockReturnValue(
        `Filesystem  1K-blocks     Used     Avail Capacity\n/dev/sda1  ${totalKB} ${usedKB} ${availKB}    97%\n`
      );

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('warning');
      expect(result.message).toContain('running low');
    });
  });

  // ============================================================
  // execute - fail (critical low space)
  // ============================================================
  describe('execute - fail', () => {
    test('fails when free space below 1GB', async () => {
      os.platform.mockReturnValue('linux');
      const availKB = 512 * 1024; // 0.5GB in KB
      const totalKB = 100 * 1024 * 1024;
      const usedKB = totalKB - availKB;
      execSync.mockReturnValue(
        `Filesystem  1K-blocks     Used     Avail Capacity\n/dev/sda1  ${totalKB} ${usedKB} ${availKB}    99%\n`
      );

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('fail');
      expect(result.message).toContain('Low disk space');
      expect(result.recommendation).toContain('Free up');
    });
  });

  // ============================================================
  // execute - Windows path
  // ============================================================
  describe('execute - Windows', () => {
    test('uses Windows disk check on win32', async () => {
      os.platform.mockReturnValue('win32');
      execSync.mockReturnValue(JSON.stringify({
        Free: 50 * 1024 * 1024 * 1024,
        Used: 200 * 1024 * 1024 * 1024,
      }));

      const result = await check.execute({ projectRoot: 'C:\\project' });
      expect(result.status).toBe('pass');
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('powershell'),
        expect.any(Object)
      );
    });

    test('falls back to wmic when PowerShell fails', async () => {
      os.platform.mockReturnValue('win32');
      let callCount = 0;
      execSync.mockImplementation(() => {
        callCount++;
        if (callCount === 1) throw new Error('PowerShell not found');
        return 'Node,FreeSpace,Size\nPC,53687091200,268435456000\n';
      });

      const result = await check.execute({ projectRoot: 'C:\\project' });
      expect(result.status).toBe('pass');
    });

    test('returns defaults when both Windows methods fail', async () => {
      os.platform.mockReturnValue('win32');
      execSync.mockImplementation(() => {
        throw new Error('command not found');
      });

      const result = await check.execute({ projectRoot: 'C:\\project' });
      // Falls back to { free: 10, total: 100, usedPercent: 90 }
      expect(result.status).toBe('pass');
    });
  });

  // ============================================================
  // execute - error handling
  // ============================================================
  describe('execute - error handling', () => {
    test('returns error when Unix df fails', async () => {
      os.platform.mockReturnValue('darwin');
      execSync.mockImplementation(() => {
        throw new Error('df: command not found');
      });

      const result = await check.execute({ projectRoot: '/project' });
      expect(result.status).toBe('error');
      expect(result.message).toContain('Could not check disk space');
    });
  });

  // ============================================================
  // getUnixDiskSpace
  // ============================================================
  describe('getUnixDiskSpace', () => {
    test('parses df output correctly', () => {
      const totalKB = 500 * 1024 * 1024;
      const usedKB = 300 * 1024 * 1024;
      const availKB = 200 * 1024 * 1024;
      execSync.mockReturnValue(
        `Filesystem  1K-blocks     Used     Avail Capacity\n/dev/disk1  ${totalKB} ${usedKB} ${availKB}    60%\n`
      );

      const info = check.getUnixDiskSpace('/project');
      expect(info.free).toBeCloseTo(200, 0);
      expect(info.total).toBeCloseTo(500, 0);
      expect(info.usedPercent).toBe(60);
    });

    test('throws on unexpected df output', () => {
      execSync.mockReturnValue('Filesystem\n');

      expect(() => check.getUnixDiskSpace('/project')).toThrow('Could not parse');
    });
  });

  // ============================================================
  // getHealer
  // ============================================================
  describe('getHealer', () => {
    test('returns manual cleanup guide', () => {
      const healer = check.getHealer();
      expect(healer.name).toBe('disk-cleanup-guide');
      expect(healer.action).toBe('manual');
      expect(healer.steps.length).toBeGreaterThan(0);
      expect(healer.warning).toContain('careful');
    });
  });
});
