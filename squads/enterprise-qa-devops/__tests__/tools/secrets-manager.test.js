/**
 * Secrets Manager Unit Tests
 * Enterprise QA DevOps Squad
 */

const fs = require('fs');
const { execSync } = require('child_process');
const {
  SecretsManager,
  CredentialLoader,
  EnvBackend
} = require('../../tools/secrets-manager');

// Mock child_process and fs
jest.mock('child_process');
jest.mock('fs');

describe('EnvBackend', () => {
  let backend;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);

    backend = new EnvBackend({ warnOnUse: false });
  });

  describe('getSecret', () => {
    it('should get secret from environment variable', async () => {
      process.env.TEST_SECRET = 'test-value';

      const value = await backend.getSecret('TEST_SECRET');

      expect(value).toBe('test-value');

      delete process.env.TEST_SECRET;
    });

    it('should return null for missing secret', async () => {
      const value = await backend.getSecret('NONEXISTENT_SECRET');

      expect(value).toBeNull();
    });
  });

  describe('setSecret', () => {
    it('should set secret in environment and file', async () => {
      fs.appendFileSync.mockImplementation(() => {});

      await backend.setSecret('NEW_SECRET', 'new-value');

      expect(process.env.NEW_SECRET).toBe('new-value');
      expect(fs.appendFileSync).toHaveBeenCalled();

      delete process.env.NEW_SECRET;
    });
  });

  describe('listSecrets', () => {
    it('should list known secret names that exist', async () => {
      process.env.ATLASSIAN_DOMAIN = 'test.atlassian.net';
      process.env.ATLASSIAN_EMAIL = 'test@example.com';

      const secrets = await backend.listSecrets();

      expect(secrets).toContain('ATLASSIAN_DOMAIN');
      expect(secrets).toContain('ATLASSIAN_EMAIL');

      delete process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_EMAIL;
    });
  });

  describe('healthCheck', () => {
    it('should return healthy with warning', async () => {
      const health = await backend.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.backend).toBe('env');
      expect(health.warning).toBeDefined();
    });
  });

  describe('loadEnvFile', () => {
    it('should load .env file if exists', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('LOADED_VAR=loaded-value\nANOTHER_VAR=another-value');

      new EnvBackend({ warnOnUse: false });

      expect(process.env.LOADED_VAR).toBe('loaded-value');
      expect(process.env.ANOTHER_VAR).toBe('another-value');

      delete process.env.LOADED_VAR;
      delete process.env.ANOTHER_VAR;
    });

    it('should handle quoted values in .env', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('QUOTED_VAR="quoted-value"');

      new EnvBackend({ warnOnUse: false });

      expect(process.env.QUOTED_VAR).toBe('quoted-value');

      delete process.env.QUOTED_VAR;
    });
  });
});

describe('SecretsManager', () => {
  let manager;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);

    manager = new SecretsManager({
      backend: 'env',
      cacheTimeout: 1000
    });
  });

  describe('initialization', () => {
    it('should default to env backend', () => {
      expect(manager.backend).toBeInstanceOf(EnvBackend);
    });

    it('should initialize cache and audit log', () => {
      expect(manager.cache).toBeInstanceOf(Map);
      expect(manager.auditLog).toEqual([]);
    });
  });

  describe('getSecret', () => {
    it('should get secret and cache it', async () => {
      process.env.CACHED_SECRET = 'cached-value';

      const value1 = await manager.getSecret('CACHED_SECRET');
      const value2 = await manager.getSecret('CACHED_SECRET');

      expect(value1).toBe('cached-value');
      expect(value2).toBe('cached-value');
      expect(manager.cache.has('CACHED_SECRET')).toBe(true);

      delete process.env.CACHED_SECRET;
    });

    it('should skip cache when requested', async () => {
      process.env.SKIP_CACHE_SECRET = 'value1';

      await manager.getSecret('SKIP_CACHE_SECRET');

      process.env.SKIP_CACHE_SECRET = 'value2';

      const cached = await manager.getSecret('SKIP_CACHE_SECRET');
      const fresh = await manager.getSecret('SKIP_CACHE_SECRET', { skipCache: true });

      expect(cached).toBe('value1'); // From cache
      expect(fresh).toBe('value2'); // Fresh value

      delete process.env.SKIP_CACHE_SECRET;
    });

    it('should expire cache after timeout', async () => {
      manager.cacheTimeout = 50; // 50ms for test
      process.env.EXPIRING_SECRET = 'initial';

      await manager.getSecret('EXPIRING_SECRET');

      process.env.EXPIRING_SECRET = 'updated';

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 100));

      const value = await manager.getSecret('EXPIRING_SECRET');

      expect(value).toBe('updated');

      delete process.env.EXPIRING_SECRET;
    });
  });

  describe('setSecret', () => {
    it('should set secret and update cache', async () => {
      fs.appendFileSync.mockImplementation(() => {});

      await manager.setSecret('NEW_SECRET', 'new-value');

      expect(manager.cache.has('NEW_SECRET')).toBe(true);
      expect(manager.cache.get('NEW_SECRET').value).toBe('new-value');

      delete process.env.NEW_SECRET;
    });

    it('should set rotation reminder', async () => {
      fs.appendFileSync.mockImplementation(() => {});

      await manager.setSecret('ROTATING_SECRET', 'value');

      const reminders = manager.getRotationReminders();

      // New secrets shouldn't be immediately due
      expect(reminders.dueForRotation).toHaveLength(0);
    });
  });

  describe('getSecrets', () => {
    it('should get multiple secrets', async () => {
      process.env.SECRET_A = 'value-a';
      process.env.SECRET_B = 'value-b';

      const results = await manager.getSecrets(['SECRET_A', 'SECRET_B', 'SECRET_C']);

      expect(results.SECRET_A).toBe('value-a');
      expect(results.SECRET_B).toBe('value-b');
      expect(results.SECRET_C).toBeNull();

      delete process.env.SECRET_A;
      delete process.env.SECRET_B;
    });
  });

  describe('validateSecrets', () => {
    it('should report missing secrets', async () => {
      process.env.PRESENT_SECRET = 'exists';

      const result = await manager.validateSecrets(['PRESENT_SECRET', 'MISSING_SECRET']);

      expect(result.found).toContain('PRESENT_SECRET');
      expect(result.missing).toContain('MISSING_SECRET');
      expect(result.complete).toBe(false);

      delete process.env.PRESENT_SECRET;
    });

    it('should report complete when all present', async () => {
      process.env.SECRET_1 = 'a';
      process.env.SECRET_2 = 'b';

      const result = await manager.validateSecrets(['SECRET_1', 'SECRET_2']);

      expect(result.complete).toBe(true);
      expect(result.missing).toHaveLength(0);

      delete process.env.SECRET_1;
      delete process.env.SECRET_2;
    });
  });

  describe('rotation reminders', () => {
    it('should track rotation reminders', () => {
      manager.setRotationReminder('OLD_SECRET', 0); // Due immediately
      manager.setRotationReminder('UPCOMING_SECRET', 7); // Due in 7 days
      manager.setRotationReminder('FUTURE_SECRET', 30); // Due in 30 days

      const reminders = manager.getRotationReminders();

      expect(reminders.dueForRotation).toHaveLength(1);
      expect(reminders.upcoming).toHaveLength(1);
    });
  });

  describe('audit logging', () => {
    it('should record audit entries', async () => {
      process.env.AUDIT_SECRET = 'value';

      await manager.getSecret('AUDIT_SECRET');

      const log = manager.getAuditLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log[log.length - 1].action).toBe('GET');

      delete process.env.AUDIT_SECRET;
    });

    it('should filter audit log by secret name', async () => {
      process.env.FILTER_A = 'a';
      process.env.FILTER_B = 'b';

      await manager.getSecret('FILTER_A');
      await manager.getSecret('FILTER_B');
      await manager.getSecret('FILTER_A');

      const log = manager.getAuditLog({ secretName: 'FILTER_A' });

      expect(log.every(entry => entry.secretName === 'FILTER_A')).toBe(true);

      delete process.env.FILTER_A;
      delete process.env.FILTER_B;
    });

    it('should limit audit log entries', async () => {
      process.env.LIMIT_SECRET = 'value';

      for (let i = 0; i < 10; i++) {
        await manager.getSecret('LIMIT_SECRET', { skipCache: true });
      }

      const log = manager.getAuditLog({ limit: 3 });

      expect(log).toHaveLength(3);

      delete process.env.LIMIT_SECRET;
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      process.env.CLEAR_SECRET = 'value';

      await manager.getSecret('CLEAR_SECRET');
      expect(manager.cache.has('CLEAR_SECRET')).toBe(true);

      manager.clearCache();
      expect(manager.cache.size).toBe(0);

      delete process.env.CLEAR_SECRET;
    });
  });

  describe('healthCheck', () => {
    it('should return comprehensive health status', async () => {
      const health = await manager.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.cache).toBeDefined();
      expect(health.rotation).toBeDefined();
      expect(health.auditLog).toBeDefined();
    });
  });

  describe('static methods', () => {
    it('should generate random token', () => {
      const token1 = SecretsManager.generateToken();
      const token2 = SecretsManager.generateToken();

      expect(token1).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(token1).not.toBe(token2);
    });

    it('should hash values consistently', () => {
      const hash1 = SecretsManager.hashValue('secret');
      const hash2 = SecretsManager.hashValue('secret');
      const hash3 = SecretsManager.hashValue('different');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toHaveLength(8);
    });
  });
});

describe('CredentialLoader', () => {
  let manager;
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(false);

    manager = new SecretsManager({ backend: 'env' });
    loader = new CredentialLoader(manager);
  });

  describe('loadAtlassian', () => {
    it('should load Atlassian credentials', async () => {
      process.env.ATLASSIAN_DOMAIN = 'test.atlassian.net';
      process.env.ATLASSIAN_EMAIL = 'test@example.com';
      process.env.ATLASSIAN_API_TOKEN = 'api-token';

      const creds = await loader.loadAtlassian();

      expect(creds.domain).toBe('test.atlassian.net');
      expect(creds.email).toBe('test@example.com');
      expect(creds.apiToken).toBe('api-token');

      delete process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_EMAIL;
      delete process.env.ATLASSIAN_API_TOKEN;
    });
  });

  describe('loadXray', () => {
    it('should load Xray credentials', async () => {
      process.env.XRAY_CLIENT_ID = 'client-id';
      process.env.XRAY_CLIENT_SECRET = 'client-secret';

      const creds = await loader.loadXray();

      expect(creds.clientId).toBe('client-id');
      expect(creds.clientSecret).toBe('client-secret');

      delete process.env.XRAY_CLIENT_ID;
      delete process.env.XRAY_CLIENT_SECRET;
    });
  });

  describe('loadMicrosoft365', () => {
    it('should load Microsoft 365 credentials', async () => {
      process.env.MS365_CLIENT_ID = 'ms-client-id';
      process.env.MS365_CLIENT_SECRET = 'ms-client-secret';
      process.env.MS365_TENANT_ID = 'tenant-id';

      const creds = await loader.loadMicrosoft365();

      expect(creds.clientId).toBe('ms-client-id');
      expect(creds.clientSecret).toBe('ms-client-secret');
      expect(creds.tenantId).toBe('tenant-id');

      delete process.env.MS365_CLIENT_ID;
      delete process.env.MS365_CLIENT_SECRET;
      delete process.env.MS365_TENANT_ID;
    });
  });

  describe('loadAll', () => {
    it('should load all credentials in parallel', async () => {
      process.env.ATLASSIAN_DOMAIN = 'domain';
      process.env.ATLASSIAN_EMAIL = 'email';
      process.env.ATLASSIAN_API_TOKEN = 'token';
      process.env.XRAY_CLIENT_ID = 'xray-id';
      process.env.XRAY_CLIENT_SECRET = 'xray-secret';
      process.env.MS365_CLIENT_ID = 'ms-id';
      process.env.MS365_CLIENT_SECRET = 'ms-secret';
      process.env.MS365_TENANT_ID = 'tenant';

      const creds = await loader.loadAll();

      expect(creds.atlassian.domain).toBe('domain');
      expect(creds.xray.clientId).toBe('xray-id');
      expect(creds.microsoft365.clientId).toBe('ms-id');

      // Cleanup
      delete process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_EMAIL;
      delete process.env.ATLASSIAN_API_TOKEN;
      delete process.env.XRAY_CLIENT_ID;
      delete process.env.XRAY_CLIENT_SECRET;
      delete process.env.MS365_CLIENT_ID;
      delete process.env.MS365_CLIENT_SECRET;
      delete process.env.MS365_TENANT_ID;
    });
  });

  describe('validate', () => {
    it('should validate required credentials', async () => {
      process.env.ATLASSIAN_DOMAIN = 'domain';
      process.env.ATLASSIAN_EMAIL = 'email';
      // Missing other credentials

      const result = await loader.validate();

      expect(result.found).toContain('ATLASSIAN_DOMAIN');
      expect(result.missing).toContain('ATLASSIAN_API_TOKEN');
      expect(result.complete).toBe(false);

      delete process.env.ATLASSIAN_DOMAIN;
      delete process.env.ATLASSIAN_EMAIL;
    });
  });
});
