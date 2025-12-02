/**
 * Frontend structured logging utility
 *
 * Provides console logging with request ID correlation and timestamp.
 * Automatically suppressed in production builds.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  extra?: Record<string, any>;
}

/**
 * Check if logging is enabled (development mode only)
 */
function isLoggingEnabled(): boolean {
  return import.meta.env.DEV;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.message,
  ];

  if (entry.requestId) {
    parts.push(`(Request ID: ${entry.requestId})`);
  }

  return parts.join(" ");
}

/**
 * Base logging function
 */
function log(
  level: LogLevel,
  message: string,
  extra?: Record<string, any>
): void {
  if (!isLoggingEnabled()) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    extra,
  };

  const formatted = formatLogEntry(entry);

  // Use appropriate console method
  switch (level) {
    case "debug":
      console.debug(formatted, extra || "");
      break;
    case "info":
      console.info(formatted, extra || "");
      break;
    case "warn":
      console.warn(formatted, extra || "");
      break;
    case "error":
      console.error(formatted, extra || "");
      break;
  }
}

/**
 * Logger interface for consistent logging across the app
 */
export const logger = {
  debug: (message: string, extra?: Record<string, any>) =>
    log("debug", message, extra),
  info: (message: string, extra?: Record<string, any>) =>
    log("info", message, extra),
  warn: (message: string, extra?: Record<string, any>) =>
    log("warn", message, extra),
  error: (message: string, extra?: Record<string, any>) =>
    log("error", message, extra),
};

export default logger;
