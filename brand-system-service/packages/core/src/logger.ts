/**
 * Structured logger for Brand System Service.
 * Outputs JSON-formatted logs for observability.
 */

export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

interface LogEntry {
  level: string;
  timestamp: string;
  module: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Create a structured logger instance for a specific module.
 *
 * @param module - Module name for log attribution
 * @param debug - Enable debug-level logging
 * @returns Logger instance
 */
export function createLogger(module: string, debug = false): Logger {
  const write = (level: string, message: string, data?: Record<string, unknown>): void => {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      module,
      message,
    };
    if (data) {
      entry.data = data;
    }

    const output = JSON.stringify(entry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      // eslint-disable-next-line no-console
      console.log(output);
    }
  };

  return {
    info: (message, data) => write('info', message, data),
    warn: (message, data) => write('warn', message, data),
    error: (message, data) => write('error', message, data),
    debug: (message, data) => {
      if (debug) {
        write('debug', message, data);
      }
    },
  };
}
