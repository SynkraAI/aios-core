const BackupManager = require('../../../aios-core/utils/backup-manager');
const fs = require('fs').promises;
const path = require('path');
const tar = require('tar');
const crypto = require('crypto');

// Mock dependencies
jest.mock('fs').promises;
jest.mock('tar');
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  gray: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text)
}));

describe('BackupManager', () => {
  let backupManager;
  const testRootPath = '/test/project';
  const backupDir = path.join(testRootPath, '.aios', 'backup');

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock file system
    fs.mkdir.mockResolvedValue(undefined);
    fs.access.mockResolvedValue(undefined);
    fs.readFile.mockResolvedValue('{}');
    fs.writeFile.mockResolvedValue(undefined);
    fs.copyFile.mockResolvedValue(undefined);
    fs.stat.mockResolvedValue({ size: 1024 * 1024 }); // 1MB
    fs.unlink.mockResolvedValue(undefined);
    fs.rm.mockResolvedValue(undefined);
    
    // Mock tar operations
    tar.create.mockResolvedValue(undefined);
    tar.extract.mockResolvedValue(undefined);
    tar.list.mockImplementation(({ onentry }) => {
      ['./backup-manifest.json', './src/file1.js', './src/file2.js'].forEach(path => {
        onentry({ path });
      });
      return Promise.resolve();
    });
    
    backupManager = new BackupManager({ rootPath: testRootPath });
  });

  describe('initialize', () => {
    test('should create backup directory and metadata file', async () => {
      fs.access.mockRejectedValueOnce(new Error('Not found')); // Metadata doesn't exist
      
      await backupManager.initialize();

      expect(fs.mkdir).toHaveBeenCalledWith(
        backupDir,
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(backupDir, 'backup-metadata.json'),
        expect.stringContaining('"version": "1.0.0"')
      );
    });

    test('should not overwrite existing metadata', async () => {
      await backupManager.initialize();

      expect(fs.access).toHaveBeenCalledWith(
        path.join(backupDir, 'backup-metadata.json')
      );
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test('should handle initialization errors gracefully', async () => {
      fs.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      await backupManager.initialize();
      
      // Should not throw, just log error
      expect(fs.mkdir).toHaveBeenCalled();
    });
  });

  describe('createFullBackup', () => {
    test('should create backup with all files', async () => {
      const files = [
        '/test/project/src/file1.js',
        '/test/project/src/file2.js'
      ];
      const metadata = { improvement_id: 'imp-123' };

      // Mock file reading for checksums
      fs.readFile
        .mockResolvedValueOnce('{}') // Metadata
        .mockResolvedValueOnce('content1') // file1
        .mockResolvedValueOnce('content2'); // file2

      const backupId = await backupManager.createFullBackup({ files, metadata });

      expect(backupId).toMatch(/^backup-\d+-[a-f0-9]+$/);
      expect(fs.copyFile).toHaveBeenCalledTimes(2);
      expect(tar.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gzip: { level: 6 },
          file: expect.stringContaining(`${backupId}.tar.gz`)
        }),
        ['.']
      );
      expect(backupManager.activeBackup).toBe(backupId);
    });

    test('should calculate checksums for files', async () => {
      const files = ['/test/project/src/file1.js'];
      const fileContent = 'test content';
      const expectedChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');

      fs.readFile
        .mockResolvedValueOnce('{}') // Metadata
        .mockResolvedValueOnce(fileContent); // file1

      await backupManager.createFullBackup({ files });

      const writeCall = fs.writeFile.mock.calls.find(call => 
        call[0].includes('backup-manifest.json')
      );
      const manifest = JSON.parse(writeCall[1]);
      
      expect(manifest.checksums['src/file1.js']).toBe(expectedChecksum);
    });

    test('should handle file copy errors gracefully', async () => {
      const files = [
        '/test/project/src/file1.js',
        '/test/project/src/file2.js'
      ];

      fs.readFile.mockResolvedValueOnce('{}'); // Metadata
      fs.copyFile
        .mockResolvedValueOnce() // file1 success
        .mockRejectedValueOnce(new Error('Permission denied')); // file2 fail

      const backupId = await backupManager.createFullBackup({ files });

      expect(backupId).toBeDefined();
      expect(tar.create).toHaveBeenCalled(); // Should still create archive
    });

    test('should clean old backups after creation', async () => {
      // Mock existing backups exceeding limit
      const existingBackups = Array(12).fill().map((_, i) => ({
        id: `backup-old-${i}`,
        timestamp: new Date(Date.now() - i * 1000000).toISOString(),
        status: 'completed',
        size: 1024
      }));

      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: existingBackups,
        statistics: { total_backups: 12, total_size: 12288 }
      }));

      await backupManager.createFullBackup({ files: ['/test/file.js'] });

      // Should delete 3 oldest backups (12 - 10 + 1 new = 3 to delete)
      expect(fs.unlink).toHaveBeenCalledTimes(2); // 12 - 10 = 2 to delete
    });

    test('should clean up on failure', async () => {
      tar.create.mockRejectedValue(new Error('Archive creation failed'));

      await expect(
        backupManager.createFullBackup({ files: ['/test/file.js'] })
      ).rejects.toThrow('Archive creation failed');

      expect(fs.unlink).toHaveBeenCalled(); // Cleanup backup file
    });
  });

  describe('restoreBackup', () => {
    const mockBackupInfo = {
      id: 'backup-123',
      timestamp: new Date().toISOString(),
      files: ['src/file1.js', 'src/file2.js'],
      checksums: {
        'src/file1.js': 'checksum1',
        'src/file2.js': 'checksum2'
      },
      status: 'completed'
    };

    beforeEach(() => {
      fs.readFile.mockImplementation(async (path) => {
        if (path.includes('backup-metadata.json')) {
          return JSON.stringify({
            version: '1.0.0',
            backups: [mockBackupInfo],
            statistics: { successful_restores: 0, failed_restores: 0 }
          });
        }
        if (path.includes('backup-manifest.json')) {
          return JSON.stringify(mockBackupInfo);
        }
        return 'file content';
      });
    });

    test('should restore backup successfully', async () => {
      const result = await backupManager.restoreBackup('backup-123');

      expect(result.success).toBe(true);
      expect(result.restored_files).toEqual(['src/file1.js', 'src/file2.js']);
      expect(tar.extract).toHaveBeenCalledWith({
        file: expect.stringContaining('backup-123.tar.gz'),
        cwd: expect.any(String)
      });
      expect(fs.copyFile).toHaveBeenCalledTimes(2);
    });

    test('should verify checksums during restore', async () => {
      // Mock different checksum
      const fileContent = 'modified content';
      fs.readFile.mockImplementation(async (path) => {
        if (path.includes('backup-metadata.json')) {
          return JSON.stringify({
            version: '1.0.0',
            backups: [mockBackupInfo]
          });
        }
        if (path.includes('backup-manifest.json')) {
          return JSON.stringify(mockBackupInfo);
        }
        return fileContent;
      });

      const result = await backupManager.restoreBackup('backup-123');

      expect(result.warnings).toContainEqual(
        expect.stringContaining('Checksum mismatch')
      );
    });

    test('should support dry run', async () => {
      const result = await backupManager.restoreBackup('backup-123', { dryRun: true });

      expect(result.success).toBe(true);
      expect(fs.copyFile).toHaveBeenCalledTimes(0); // No actual file restoration
      expect(tar.extract).toHaveBeenCalled(); // Still extracts to verify
    });

    test('should handle missing backup', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({
        version: '1.0.0',
        backups: []
      }));

      await expect(
        backupManager.restoreBackup('backup-missing')
      ).rejects.toThrow('Backup not found');
    });

    test('should create pre-restore backups', async () => {
      fs.access.mockResolvedValue(undefined); // Files exist

      await backupManager.restoreBackup('backup-123');

      // Should backup existing files before overwriting
      expect(fs.copyFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('.pre-restore')
      );
    });

    test('should handle restore failures', async () => {
      fs.copyFile.mockRejectedValue(new Error('Write protected'));

      const result = await backupManager.restoreBackup('backup-123');

      expect(result.success).toBe(false);
      expect(result.failed_files).toHaveLength(2);
      expect(result.failed_files[0].error).toBe('Write protected');
    });

    test('should update statistics', async () => {
      await backupManager.restoreBackup('backup-123');

      const writeCall = fs.writeFile.mock.calls.find(call =>
        call[0].includes('backup-metadata.json')
      );
      const metadata = JSON.parse(writeCall[1]);

      expect(metadata.statistics.successful_restores).toBe(1);
    });
  });

  describe('emergencyRestore', () => {
    test('should restore active backup if available', async () => {
      backupManager.activeBackup = 'backup-active';
      
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: [{
          id: 'backup-active',
          status: 'completed',
          files: [],
          checksums: {}
        }]
      }));

      const result = await backupManager.emergencyRestore();

      expect(result.backupId).toBe('backup-active');
    });

    test('should find most recent backup if no active', async () => {
      const backups = [
        {
          id: 'backup-old',
          timestamp: new Date(Date.now() - 1000000).toISOString(),
          status: 'completed',
          files: [],
          checksums: {}
        },
        {
          id: 'backup-recent',
          timestamp: new Date().toISOString(),
          status: 'completed',
          files: [],
          checksums: {}
        }
      ];

      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups
      }));

      const result = await backupManager.emergencyRestore();

      expect(result.backupId).toBe('backup-recent');
    });

    test('should throw if no backups available', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: []
      }));

      await expect(
        backupManager.emergencyRestore()
      ).rejects.toThrow('No backups available');
    });
  });

  describe('listBackups', () => {
    const mockBackups = [
      {
        id: 'backup-1',
        timestamp: new Date().toISOString(),
        files: ['file1.js', 'file2.js'],
        size: 2048,
        metadata: { type: 'improvement' },
        status: 'completed'
      },
      {
        id: 'backup-2',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        files: ['file3.js'],
        size: 1024,
        metadata: { type: 'rollback' },
        status: 'completed'
      }
    ];

    beforeEach(() => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: mockBackups
      }));
    });

    test('should list all backups', async () => {
      const backups = await backupManager.listBackups();

      expect(backups).toHaveLength(2);
      expect(backups[0].id).toBe('backup-1'); // Sorted by newest first
      expect(backups[0].size).toBe('2.00 KB');
      expect(backups[0].files).toBe(2);
    });

    test('should filter by status', async () => {
      const backups = await backupManager.listBackups({ status: 'completed' });

      expect(backups).toHaveLength(2);
    });

    test('should filter by date', async () => {
      const yesterday = new Date(Date.now() - 43200000); // 12 hours ago
      const backups = await backupManager.listBackups({ after: yesterday });

      expect(backups).toHaveLength(1);
      expect(backups[0].id).toBe('backup-1');
    });

    test('should filter by metadata', async () => {
      const backups = await backupManager.listBackups({
        metadata: { type: 'rollback' }
      });

      expect(backups).toHaveLength(1);
      expect(backups[0].id).toBe('backup-2');
    });

    test('should mark active backup', async () => {
      backupManager.activeBackup = 'backup-1';
      const backups = await backupManager.listBackups();

      expect(backups[0].isActive).toBe(true);
      expect(backups[1].isActive).toBe(false);
    });
  });

  describe('verifyBackup', () => {
    test('should verify valid backup', async () => {
      fs.access.mockResolvedValue(undefined);
      tar.list.mockResolvedValue(undefined);

      const result = await backupManager.verifyBackup('backup-123');

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect missing backup file', async () => {
      fs.access.mockRejectedValue(new Error('Not found'));

      const result = await backupManager.verifyBackup('backup-123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Backup file not found');
    });

    test('should detect missing manifest', async () => {
      tar.list.mockImplementation(({ onentry }) => {
        ['./src/file1.js', './src/file2.js'].forEach(path => {
          onentry({ path });
        });
        return Promise.resolve();
      });

      const result = await backupManager.verifyBackup('backup-123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing backup manifest');
    });

    test('should detect corrupted archive', async () => {
      tar.list.mockRejectedValue(new Error('Invalid tar file'));

      const result = await backupManager.verifyBackup('backup-123');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Archive corrupted');
    });
  });

  describe('deleteBackup', () => {
    test('should delete backup and update metadata', async () => {
      const metadata = {
        version: '1.0.0',
        backups: [{
          id: 'backup-123',
          size: 1024
        }],
        statistics: { total_size: 1024 }
      };

      fs.readFile.mockResolvedValue(JSON.stringify(metadata));

      const success = await backupManager.deleteBackup('backup-123');

      expect(success).toBe(true);
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('backup-123.tar.gz')
      );

      const writeCall = fs.writeFile.mock.calls[0];
      const updatedMetadata = JSON.parse(writeCall[1]);
      
      expect(updatedMetadata.backups).toHaveLength(0);
      expect(updatedMetadata.statistics.total_size).toBe(0);
    });

    test('should clear active backup if deleted', async () => {
      backupManager.activeBackup = 'backup-123';
      
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: [{ id: 'backup-123', size: 1024 }],
        statistics: {}
      }));

      await backupManager.deleteBackup('backup-123');

      expect(backupManager.activeBackup).toBeNull();
    });

    test('should handle delete errors gracefully', async () => {
      fs.unlink.mockRejectedValue(new Error('Permission denied'));

      const success = await backupManager.deleteBackup('backup-123');

      expect(success).toBe(false);
    });
  });

  describe('exportBackup', () => {
    test('should export backup and metadata', async () => {
      const backupInfo = {
        id: 'backup-123',
        size: 1024,
        files: ['test.js']
      };

      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        backups: [backupInfo]
      }));

      const result = await backupManager.exportBackup(
        'backup-123',
        '/export/backup.tar.gz'
      );

      expect(result.success).toBe(true);
      expect(fs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('backup-123.tar.gz'),
        '/export/backup.tar.gz'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('backup-123-metadata.json'),
        expect.any(String)
      );
    });

    test('should handle export errors', async () => {
      fs.copyFile.mockRejectedValue(new Error('Disk full'));

      await expect(
        backupManager.exportBackup('backup-123', '/export/backup.tar.gz')
      ).rejects.toThrow('Export failed');
    });
  });

  describe('importBackup', () => {
    test('should import backup with metadata', async () => {
      const metadata = {
        files: ['test.js'],
        size: 1024
      };

      const backupId = await backupManager.importBackup(
        '/import/backup.tar.gz',
        metadata
      );

      expect(backupId).toMatch(/^backup-/);
      expect(fs.copyFile).toHaveBeenCalledWith(
        '/import/backup.tar.gz',
        expect.stringContaining(`${backupId}.tar.gz`)
      );
    });

    test('should use provided backup ID if available', async () => {
      const metadata = {
        id: 'backup-imported',
        files: []
      };

      const backupId = await backupManager.importBackup(
        '/import/backup.tar.gz',
        metadata
      );

      expect(backupId).toBe('backup-imported');
    });

    test('should add import timestamp', async () => {
      let savedMetadata;
      fs.writeFile.mockImplementation((path, content) => {
        if (path.includes('backup-metadata.json')) {
          savedMetadata = JSON.parse(content);
        }
        return Promise.resolve();
      });

      await backupManager.importBackup('/import/backup.tar.gz', {});

      expect(savedMetadata.backups[0].imported).toBeDefined();
    });
  });

  describe('helper methods', () => {
    test('should format file sizes correctly', () => {
      expect(backupManager.formatSize(512)).toBe('512.00 B');
      expect(backupManager.formatSize(1024)).toBe('1.00 KB');
      expect(backupManager.formatSize(1024 * 1024)).toBe('1.00 MB');
      expect(backupManager.formatSize(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    test('should generate unique backup IDs', () => {
      const id1 = backupManager.generateBackupId();
      const id2 = backupManager.generateBackupId();

      expect(id1).toMatch(/^backup-\d+-[a-f0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    test('should check active backup status', () => {
      expect(backupManager.hasActiveBackup()).toBe(false);
      
      backupManager.activeBackup = 'backup-123';
      expect(backupManager.hasActiveBackup()).toBe(true);
    });
  });
});