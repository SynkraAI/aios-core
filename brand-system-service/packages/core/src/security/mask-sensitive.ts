/**
 * Utility to mask sensitive fields in objects before logging.
 * Prevents API keys, tokens, and passwords from appearing in logs.
 *
 * @module security/mask-sensitive
 */

/** Fields that should be redacted in log output. */
const SENSITIVE_FIELDS = new Set([
  'accesskeyid',
  'secretaccesskey',
  'apikey',
  'api_key',
  'token',
  'password',
  'secret',
  'authorization',
  'dsn',
]);

const REDACTED = '***REDACTED***';

/**
 * Deep-clone an object and replace sensitive field values with REDACTED.
 * Matching is case-insensitive on field names.
 *
 * @param obj - Object to mask
 * @returns A new object with sensitive fields redacted
 */
export function maskSensitiveFields<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSensitiveFields(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = typeof value === 'string' && value.length > 0 ? REDACTED : value;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = maskSensitiveFields(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
