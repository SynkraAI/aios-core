/**
 * Unit tests for Transaction Manager
 * @module transaction-manager.test
 */

const TransactionManager = require('../../../aios-core/utils/transaction-manager');
const fs = require('fs-extra');
const path = require('path');

// Mock fs-extra
jest.mock('fs-extra');

describe('TransactionManager', () => {
  let transactionManager;
  const testRootPath = '/test/root';
  const mockTransactionId = 'txn-1234567890-abcd';

  beforeEach(() => {
    // Mock file system methods
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
    fs.readJson.mockResolvedValue({});
    fs.writeJson.mockResolvedValue();
    fs.remove.mockResolvedValue();
    fs.readdir.mockResolvedValue([]);
    fs.stat.mockResolvedValue({ mtime: new Date() });
    fs.copy.mockResolvedValue();
    
    // Mock date for consistent transaction IDs
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    
    transactionManager = new TransactionManager({ rootPath: testRootPath });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('beginTransaction', () => {
    test('creates new transaction with metadata', async () => {
      const options = {
        type: 'component_creation',
        description: 'Test transaction',
        user: 'test-user',
        metadata: { custom: 'data' }
      };

      const txnId = await transactionManager.beginTransaction(options);

      expect(txnId).toMatch(/^txn-\d+-[a-z0-9]+$/);
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('transaction.json'),
        expect.objectContaining({
          id: txnId,
          type: 'component_creation',
          description: 'Test transaction',
          user: 'test-user',
          status: 'active'
        }),
        { spaces: 2 }
      );
    });

    test('creates backup directory for transaction', async () => {
      const txnId = await transactionManager.beginTransaction({});

      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining(path.join('transactions', txnId))
      );
      expect(fs.ensureDir).toHaveBeenCalledWith(
        expect.stringContaining(path.join('transactions', txnId, 'backups'))
      );
    });

    test('initializes empty operations array', async () => {
      await transactionManager.beginTransaction({});

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operations: []
        }),
        expect.any(Object)
      );
    });
  });

  describe('recordOperation', () => {
    beforeEach(async () => {
      // Set up existing transaction
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: []
      });
    });

    test('records create operation with backup', async () => {
      const operation = {
        type: 'create',
        target: 'file',
        path: '/test/file.js'
      };

      await transactionManager.recordOperation(mockTransactionId, operation);

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operations: [expect.objectContaining({
            ...operation,
            id: expect.any(String),
            timestamp: expect.any(String)
          })]
        }),
        expect.any(Object)
      );
    });

    test('creates backup for update operations', async () => {
      fs.pathExists.mockResolvedValue(true); // File exists

      const operation = {
        type: 'update',
        target: 'file',
        path: '/test/existing.js'
      };

      await transactionManager.recordOperation(mockTransactionId, operation);

      expect(fs.copy).toHaveBeenCalledWith(
        '/test/existing.js',
        expect.stringContaining('backups')
      );
    });

    test('records manifest update operation', async () => {
      const operation = {
        type: 'manifest_update',
        target: 'manifest',
        path: '/test/manifest.yaml',
        oldContent: 'old yaml',
        newContent: 'new yaml'
      };

      await transactionManager.recordOperation(mockTransactionId, operation);

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operations: [expect.objectContaining(operation)]
        }),
        expect.any(Object)
      );
    });

    test('throws error for inactive transaction', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'committed',
        operations: []
      });

      await expect(transactionManager.recordOperation(mockTransactionId, {}))
        .rejects.toThrow('Transaction is not active');
    });
  });

  describe('commitTransaction', () => {
    test('updates transaction status to committed', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: []
      });

      await transactionManager.commitTransaction(mockTransactionId);

      expect(fs.writeJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          status: 'committed',
          endTime: expect.any(String)
        }),
        expect.any(Object)
      );
    });

    test('throws error if transaction not active', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'rolled_back'
      });

      await expect(transactionManager.commitTransaction(mockTransactionId))
        .rejects.toThrow('Transaction is not active');
    });
  });

  describe('rollbackTransaction', () => {
    test('rolls back create operations by deleting files', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: [{
          id: 'op-1',
          type: 'create',
          target: 'file',
          path: '/test/new-file.js'
        }]
      });

      fs.pathExists.mockResolvedValue(true); // File exists

      const result = await transactionManager.rollbackTransaction(mockTransactionId);

      expect(fs.remove).toHaveBeenCalledWith('/test/new-file.js');
      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
    });

    test('rolls back update operations by restoring backups', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: [{
          id: 'op-1',
          type: 'update',
          target: 'file',
          path: '/test/updated-file.js',
          backup: '/backups/updated-file.js.backup'
        }]
      });

      const result = await transactionManager.rollbackTransaction(mockTransactionId);

      expect(fs.copy).toHaveBeenCalledWith(
        '/backups/updated-file.js.backup',
        '/test/updated-file.js',
        { overwrite: true }
      );
      expect(result.successful).toHaveLength(1);
    });

    test('rolls back manifest updates', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: [{
          id: 'op-1',
          type: 'manifest_update',
          target: 'manifest',
          path: '/test/manifest.yaml',
          oldContent: 'old content',
          newContent: 'new content'
        }]
      });

      const result = await transactionManager.rollbackTransaction(mockTransactionId);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/test/manifest.yaml',
        'old content',
        'utf8'
      );
      expect(result.successful).toHaveLength(1);
    });

    test('continues on error when continueOnError is true', async () => {
      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations: [
          {
            id: 'op-1',
            type: 'create',
            path: '/test/file1.js'
          },
          {
            id: 'op-2',
            type: 'create',
            path: '/test/file2.js'
          }
        ]
      });

      // First remove succeeds, second fails
      fs.remove
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('Permission denied'));

      const result = await transactionManager.rollbackTransaction(
        mockTransactionId,
        { continueOnError: true }
      );

      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toMatchObject({
        operation: 'op-2',
        error: 'Permission denied'
      });
    });

    test('processes operations in reverse order', async () => {
      const operations = [
        { id: 'op-1', type: 'create', path: '/test/1.js' },
        { id: 'op-2', type: 'create', path: '/test/2.js' },
        { id: 'op-3', type: 'create', path: '/test/3.js' }
      ];

      fs.readJson.mockResolvedValue({
        id: mockTransactionId,
        status: 'active',
        operations
      });

      fs.pathExists.mockResolvedValue(true);
      const removeCalls = [];
      fs.remove.mockImplementation(path => {
        removeCalls.push(path);
        return Promise.resolve();
      });

      await transactionManager.rollbackTransaction(mockTransactionId);

      expect(removeCalls).toEqual([
        '/test/3.js',
        '/test/2.js',
        '/test/1.js'
      ]);
    });
  });

  describe('getLastTransaction', () => {
    test('returns most recent transaction', async () => {
      fs.readdir.mockResolvedValue(['txn-1', 'txn-2', 'txn-3']);
      fs.stat
        .mockResolvedValueOnce({ mtime: new Date('2025-01-01') })
        .mockResolvedValueOnce({ mtime: new Date('2025-01-03') })
        .mockResolvedValueOnce({ mtime: new Date('2025-01-02') });

      fs.readJson.mockResolvedValue({
        id: 'txn-2',
        status: 'committed'
      });

      const result = await transactionManager.getLastTransaction();

      expect(result.id).toBe('txn-2');
    });

    test('returns null when no transactions exist', async () => {
      fs.readdir.mockResolvedValue([]);

      const result = await transactionManager.getLastTransaction();

      expect(result).toBeNull();
    });
  });

  describe('listTransactions', () => {
    test('returns limited number of transactions', async () => {
      const txnIds = Array(20).fill(0).map((_, i) => `txn-${i}`);
      fs.readdir.mockResolvedValue(txnIds);
      
      fs.stat.mockResolvedValue({ mtime: new Date() });
      fs.readJson.mockResolvedValue({
        id: 'txn-test',
        type: 'test',
        status: 'committed',
        operations: []
      });

      const result = await transactionManager.listTransactions(5);

      expect(result).toHaveLength(5);
    });

    test('sorts transactions by date descending', async () => {
      fs.readdir.mockResolvedValue(['txn-old', 'txn-new']);
      
      fs.stat
        .mockResolvedValueOnce({ mtime: new Date('2025-01-01') })
        .mockResolvedValueOnce({ mtime: new Date('2025-01-02') });

      fs.readJson
        .mockResolvedValueOnce({ id: 'txn-old', startTime: '2025-01-01' })
        .mockResolvedValueOnce({ id: 'txn-new', startTime: '2025-01-02' });

      const result = await transactionManager.listTransactions();

      expect(result[0].id).toBe('txn-new');
      expect(result[1].id).toBe('txn-old');
    });
  });

  describe('cleanupOldTransactions', () => {
    test('removes transactions older than retention period', async () => {
      const now = Date.now();
      const oldDate = new Date(now - 31 * 24 * 60 * 60 * 1000); // 31 days old
      const recentDate = new Date(now - 1 * 24 * 60 * 60 * 1000); // 1 day old

      fs.readdir.mockResolvedValue(['txn-old', 'txn-recent']);
      
      fs.stat
        .mockResolvedValueOnce({ mtime: oldDate })
        .mockResolvedValueOnce({ mtime: recentDate });

      const result = await transactionManager.cleanupOldTransactions();

      expect(fs.remove).toHaveBeenCalledTimes(1);
      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('txn-old')
      );
      expect(result).toBe(1);
    });

    test('keeps transactions within retention period', async () => {
      const recentDate = new Date();
      
      fs.readdir.mockResolvedValue(['txn-recent']);
      fs.stat.mockResolvedValue({ mtime: recentDate });

      const result = await transactionManager.cleanupOldTransactions();

      expect(fs.remove).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('loadTransaction', () => {
    test('loads transaction from disk', async () => {
      const mockTransaction = {
        id: mockTransactionId,
        type: 'test',
        status: 'committed'
      };

      fs.readJson.mockResolvedValue(mockTransaction);

      const result = await transactionManager.loadTransaction(mockTransactionId);

      expect(result).toEqual(mockTransaction);
      expect(fs.readJson).toHaveBeenCalledWith(
        expect.stringContaining(path.join(mockTransactionId, 'transaction.json'))
      );
    });

    test('returns null for non-existent transaction', async () => {
      fs.readJson.mockRejectedValue(new Error('ENOENT'));

      const result = await transactionManager.loadTransaction('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles file system errors gracefully', async () => {
      fs.ensureDir.mockRejectedValue(new Error('Disk full'));

      await expect(transactionManager.beginTransaction({}))
        .rejects.toThrow('Disk full');
    });

    test('validates transaction exists before operations', async () => {
      fs.readJson.mockRejectedValue(new Error('ENOENT'));

      await expect(transactionManager.recordOperation('invalid-txn', {}))
        .rejects.toThrow('Transaction not found');
    });
  });
});