/**
 * Secrets Manager
 * Enterprise QA DevOps Squad
 *
 * Secure credential management with multiple backend support.
 * Supports Azure Key Vault, AWS Secrets Manager, 1Password CLI, and .env fallback.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Secret Backend Interface
 */
class SecretBackend {
  async getSecret(name) {
    throw new Error('getSecret not implemented');
  }

  async setSecret(name, value) {
    throw new Error('setSecret not implemented');
  }

  async listSecrets() {
    throw new Error('listSecrets not implemented');
  }

  async healthCheck() {
    throw new Error('healthCheck not implemented');
  }
}

/**
 * Azure Key Vault Backend
 */
class AzureKeyVaultBackend extends SecretBackend {
  constructor(options = {}) {
    super();
    this.vaultUrl = options.vaultUrl || process.env.AZURE_KEY_VAULT_URL;

    if (!this.vaultUrl) {
      throw new Error('Azure Key Vault URL not configured. Set AZURE_KEY_VAULT_URL');
    }
  }

  async getSecret(name) {
    try {
      const result = execSync(
        `az keyvault secret show --vault-name "${this.getVaultName()}" --name "${name}" --query value -o tsv`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return result.trim();
    } catch (error) {
      if (error.message.includes('SecretNotFound')) {
        return null;
      }
      throw new Error(`Azure Key Vault error: ${error.message}`);
    }
  }

  async setSecret(name, value) {
    try {
      execSync(
        `az keyvault secret set --vault-name "${this.getVaultName()}" --name "${name}" --value "${value}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return true;
    } catch (error) {
      throw new Error(`Azure Key Vault error: ${error.message}`);
    }
  }

  async listSecrets() {
    try {
      const result = execSync(
        `az keyvault secret list --vault-name "${this.getVaultName()}" --query "[].name" -o tsv`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return result.trim().split('\n').filter(Boolean);
    } catch (error) {
      throw new Error(`Azure Key Vault error: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      execSync(
        `az keyvault show --name "${this.getVaultName()}" -o none`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return { status: 'healthy', backend: 'azure-key-vault', vault: this.vaultUrl };
    } catch (error) {
      return { status: 'unhealthy', backend: 'azure-key-vault', error: error.message };
    }
  }

  getVaultName() {
    // Extract vault name from URL: https://vault-name.vault.azure.net/
    const match = this.vaultUrl.match(/https:\/\/([^.]+)\.vault\.azure\.net/);
    return match ? match[1] : this.vaultUrl;
  }
}

/**
 * AWS Secrets Manager Backend
 */
class AWSSecretsManagerBackend extends SecretBackend {
  constructor(options = {}) {
    super();
    this.region = options.region || process.env.AWS_REGION || 'us-east-1';
    this.prefix = options.prefix || 'aios/enterprise-qa-devops';
  }

  async getSecret(name) {
    try {
      const secretId = `${this.prefix}/${name}`;
      const result = execSync(
        `aws secretsmanager get-secret-value --secret-id "${secretId}" --query SecretString --output text --region ${this.region}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return result.trim();
    } catch (error) {
      if (error.message.includes('ResourceNotFoundException')) {
        return null;
      }
      throw new Error(`AWS Secrets Manager error: ${error.message}`);
    }
  }

  async setSecret(name, value) {
    const secretId = `${this.prefix}/${name}`;

    try {
      // Try to update existing secret
      execSync(
        `aws secretsmanager put-secret-value --secret-id "${secretId}" --secret-string "${value}" --region ${this.region}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return true;
    } catch (error) {
      if (error.message.includes('ResourceNotFoundException')) {
        // Create new secret
        execSync(
          `aws secretsmanager create-secret --name "${secretId}" --secret-string "${value}" --region ${this.region}`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        return true;
      }
      throw new Error(`AWS Secrets Manager error: ${error.message}`);
    }
  }

  async listSecrets() {
    try {
      const result = execSync(
        `aws secretsmanager list-secrets --query "SecretList[?starts_with(Name, '${this.prefix}/')].Name" --output text --region ${this.region}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return result.trim().split('\t').filter(Boolean).map(n => n.replace(`${this.prefix}/`, ''));
    } catch (error) {
      throw new Error(`AWS Secrets Manager error: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      execSync(
        `aws secretsmanager list-secrets --max-results 1 --region ${this.region}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return { status: 'healthy', backend: 'aws-secrets-manager', region: this.region };
    } catch (error) {
      return { status: 'unhealthy', backend: 'aws-secrets-manager', error: error.message };
    }
  }
}

/**
 * 1Password CLI Backend
 */
class OnePasswordBackend extends SecretBackend {
  constructor(options = {}) {
    super();
    this.vault = options.vault || process.env.OP_VAULT || 'Private';
    this.itemPrefix = options.itemPrefix || 'aios-squad';
  }

  async getSecret(name) {
    try {
      const itemName = `${this.itemPrefix}-${name}`;
      const result = execSync(
        `op item get "${itemName}" --vault "${this.vault}" --fields password --format json`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const parsed = JSON.parse(result);
      return parsed.value || parsed;
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw new Error(`1Password error: ${error.message}`);
    }
  }

  async setSecret(name, value) {
    const itemName = `${this.itemPrefix}-${name}`;

    try {
      // Try to edit existing item
      execSync(
        `op item edit "${itemName}" --vault "${this.vault}" password="${value}"`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      return true;
    } catch (error) {
      if (error.message.includes('not found')) {
        // Create new item
        execSync(
          `op item create --category password --title "${itemName}" --vault "${this.vault}" password="${value}"`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        return true;
      }
      throw new Error(`1Password error: ${error.message}`);
    }
  }

  async listSecrets() {
    try {
      const result = execSync(
        `op item list --vault "${this.vault}" --format json`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const items = JSON.parse(result);
      return items
        .filter(item => item.title.startsWith(this.itemPrefix))
        .map(item => item.title.replace(`${this.itemPrefix}-`, ''));
    } catch (error) {
      throw new Error(`1Password error: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      execSync('op account get', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      return { status: 'healthy', backend: '1password', vault: this.vault };
    } catch (error) {
      return { status: 'unhealthy', backend: '1password', error: error.message };
    }
  }
}

/**
 * Environment Variable Backend (.env fallback)
 */
class EnvBackend extends SecretBackend {
  constructor(options = {}) {
    super();
    this.envFile = options.envFile || path.join(process.cwd(), '.env');
    this.warnOnUse = options.warnOnUse !== false;

    // Load existing .env if present
    this.loadEnvFile();
  }

  loadEnvFile() {
    if (fs.existsSync(this.envFile)) {
      const content = fs.readFileSync(this.envFile, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      });
    }
  }

  async getSecret(name) {
    if (this.warnOnUse) {
      console.warn(`[SECURITY WARNING] Reading secret "${name}" from environment variable. Consider using a proper secrets manager.`);
    }
    return process.env[name] || null;
  }

  async setSecret(name, value) {
    if (this.warnOnUse) {
      console.warn(`[SECURITY WARNING] Writing secret "${name}" to .env file. This is not recommended for production.`);
    }

    process.env[name] = value;

    // Append to .env file
    const line = `${name}=${value}\n`;
    fs.appendFileSync(this.envFile, line);
    return true;
  }

  async listSecrets() {
    const secretNames = [
      'ATLASSIAN_DOMAIN',
      'ATLASSIAN_EMAIL',
      'ATLASSIAN_API_TOKEN',
      'XRAY_CLIENT_ID',
      'XRAY_CLIENT_SECRET',
      'MS365_CLIENT_ID',
      'MS365_CLIENT_SECRET',
      'MS365_TENANT_ID'
    ];
    return secretNames.filter(name => process.env[name]);
  }

  async healthCheck() {
    return {
      status: 'healthy',
      backend: 'env',
      warning: 'Using environment variables is not recommended for production'
    };
  }
}

/**
 * Secrets Manager - Main Class
 */
class SecretsManager {
  constructor(options = {}) {
    this.backend = this.initializeBackend(options);
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
    this.auditLog = [];
    this.rotationReminders = new Map();
  }

  /**
   * Initialize the appropriate backend
   */
  initializeBackend(options) {
    const backendType = options.backend || process.env.SECRETS_BACKEND || 'env';

    switch (backendType.toLowerCase()) {
      case 'azure':
      case 'azure-key-vault':
        return new AzureKeyVaultBackend(options);

      case 'aws':
      case 'aws-secrets-manager':
        return new AWSSecretsManagerBackend(options);

      case '1password':
      case 'op':
        return new OnePasswordBackend(options);

      case 'env':
      default:
        return new EnvBackend(options);
    }
  }

  /**
   * Get a secret value
   */
  async getSecret(name, options = {}) {
    // Check cache
    if (!options.skipCache && this.cache.has(name)) {
      const cached = this.cache.get(name);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.audit('GET_CACHED', name);
        return cached.value;
      }
      this.cache.delete(name);
    }

    const value = await this.backend.getSecret(name);

    if (value) {
      this.cache.set(name, { value, timestamp: Date.now() });
    }

    this.audit('GET', name, { found: !!value });
    return value;
  }

  /**
   * Set a secret value
   */
  async setSecret(name, value) {
    const result = await this.backend.setSecret(name, value);

    // Update cache
    this.cache.set(name, { value, timestamp: Date.now() });

    // Set rotation reminder (90 days default)
    this.setRotationReminder(name, 90);

    this.audit('SET', name);
    return result;
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(names) {
    const results = {};
    for (const name of names) {
      results[name] = await this.getSecret(name);
    }
    return results;
  }

  /**
   * List available secrets
   */
  async listSecrets() {
    const secrets = await this.backend.listSecrets();
    this.audit('LIST', 'all');
    return secrets;
  }

  /**
   * Check which required secrets are missing
   */
  async validateSecrets(requiredSecrets) {
    const missing = [];
    const found = [];

    for (const name of requiredSecrets) {
      const value = await this.getSecret(name);
      if (value) {
        found.push(name);
      } else {
        missing.push(name);
      }
    }

    return { missing, found, complete: missing.length === 0 };
  }

  /**
   * Set rotation reminder
   */
  setRotationReminder(name, days = 90) {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + days);

    this.rotationReminders.set(name, {
      name,
      reminderDate,
      daysUntilRotation: days
    });
  }

  /**
   * Get secrets due for rotation
   */
  getRotationReminders() {
    const now = new Date();
    const dueForRotation = [];
    const upcoming = [];

    for (const [name, reminder] of this.rotationReminders) {
      const daysUntil = Math.ceil((reminder.reminderDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 0) {
        dueForRotation.push({ name, daysOverdue: Math.abs(daysUntil) });
      } else if (daysUntil <= 14) {
        upcoming.push({ name, daysUntil });
      }
    }

    return { dueForRotation, upcoming };
  }

  /**
   * Clear secret cache
   */
  clearCache() {
    this.cache.clear();
    this.audit('CACHE_CLEAR', 'all');
  }

  /**
   * Audit logging
   */
  audit(action, secretName, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      secretName,
      ...metadata
    };

    this.auditLog.push(entry);

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(options = {}) {
    let log = [...this.auditLog];

    if (options.secretName) {
      log = log.filter(entry => entry.secretName === options.secretName);
    }

    if (options.action) {
      log = log.filter(entry => entry.action === options.action);
    }

    if (options.since) {
      const since = new Date(options.since);
      log = log.filter(entry => new Date(entry.timestamp) >= since);
    }

    if (options.limit) {
      log = log.slice(-options.limit);
    }

    return log;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const backendHealth = await this.backend.healthCheck();
    const rotationStatus = this.getRotationReminders();

    return {
      ...backendHealth,
      cache: {
        size: this.cache.size,
        timeout: this.cacheTimeout
      },
      rotation: {
        dueCount: rotationStatus.dueForRotation.length,
        upcomingCount: rotationStatus.upcoming.length
      },
      auditLog: {
        entries: this.auditLog.length
      }
    };
  }

  /**
   * Generate secure random token
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a value (for logging without exposing secrets)
   */
  static hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 8);
  }
}

/**
 * Credential Loader - convenience class for loading all squad credentials
 */
class CredentialLoader {
  constructor(secretsManager) {
    this.secrets = secretsManager;
  }

  /**
   * Load Atlassian credentials
   */
  async loadAtlassian() {
    return {
      domain: await this.secrets.getSecret('ATLASSIAN_DOMAIN'),
      email: await this.secrets.getSecret('ATLASSIAN_EMAIL'),
      apiToken: await this.secrets.getSecret('ATLASSIAN_API_TOKEN')
    };
  }

  /**
   * Load Xray credentials
   */
  async loadXray() {
    return {
      clientId: await this.secrets.getSecret('XRAY_CLIENT_ID'),
      clientSecret: await this.secrets.getSecret('XRAY_CLIENT_SECRET')
    };
  }

  /**
   * Load Microsoft 365 credentials
   */
  async loadMicrosoft365() {
    return {
      clientId: await this.secrets.getSecret('MS365_CLIENT_ID'),
      clientSecret: await this.secrets.getSecret('MS365_CLIENT_SECRET'),
      tenantId: await this.secrets.getSecret('MS365_TENANT_ID')
    };
  }

  /**
   * Load all credentials
   */
  async loadAll() {
    const [atlassian, xray, microsoft365] = await Promise.all([
      this.loadAtlassian(),
      this.loadXray(),
      this.loadMicrosoft365()
    ]);

    return { atlassian, xray, microsoft365 };
  }

  /**
   * Validate all required credentials exist
   */
  async validate() {
    const required = [
      'ATLASSIAN_DOMAIN',
      'ATLASSIAN_EMAIL',
      'ATLASSIAN_API_TOKEN',
      'XRAY_CLIENT_ID',
      'XRAY_CLIENT_SECRET',
      'MS365_CLIENT_ID',
      'MS365_CLIENT_SECRET',
      'MS365_TENANT_ID'
    ];

    return this.secrets.validateSecrets(required);
  }
}

module.exports = {
  SecretsManager,
  CredentialLoader,
  AzureKeyVaultBackend,
  AWSSecretsManagerBackend,
  OnePasswordBackend,
  EnvBackend
};
