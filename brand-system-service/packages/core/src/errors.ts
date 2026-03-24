/**
 * Base error class for Brand System Service.
 * All BSS errors extend this for consistent error handling.
 */
export class BSSError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'BSSError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Configuration-related errors (missing env vars, invalid values).
 */
export class ConfigError extends BSSError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

/**
 * Build pipeline errors (template rendering, file generation).
 */
export class BuildError extends BSSError {
  constructor(message: string) {
    super(message, 'BUILD_ERROR');
    this.name = 'BuildError';
  }
}

/**
 * Storage-related errors (R2 operations, path validation, file validation).
 */
export class StorageError extends BSSError {
  public readonly operation: string;

  constructor(message: string, operation: string) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
    this.operation = operation;
  }
}
