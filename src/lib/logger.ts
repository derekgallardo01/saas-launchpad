/**
 * Structured logging utility.
 *
 * - JSON format in production for machine parsing (Datadog, CloudWatch, etc.)
 * - Pretty, colorized format in development for readability.
 * - Configurable log level via `LOG_LEVEL` env variable.
 * - Request ID tracking via the `context` parameter.
 *
 * @example
 * ```ts
 * import { log } from "@/lib/logger";
 *
 * log.info("User signed in", { userId: "abc", provider: "github" });
 * log.warn("Rate limit approaching", { remaining: 5 });
 * log.error("Stripe webhook failed", { error: err.message, eventId: "evt_123" });
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = process.env.NODE_ENV === "production";
const configuredLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ?? (isProduction ? "info" : "debug");

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
}

function formatPretty(entry: LogEntry): string {
  const colors: Record<LogLevel, string> = {
    debug: "\x1b[36m", // cyan
    info: "\x1b[32m",  // green
    warn: "\x1b[33m",  // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const dim = "\x1b[2m";

  const level = `${colors[entry.level]}${entry.level.toUpperCase().padEnd(5)}${reset}`;
  const time = `${dim}${entry.timestamp}${reset}`;
  const ctx = entry.context ? ` ${dim}${JSON.stringify(entry.context)}${reset}` : "";

  return `${time} ${level} ${entry.message}${ctx}`;
}

function formatJSON(entry: LogEntry): string {
  return JSON.stringify({
    level: entry.level,
    msg: entry.message,
    ts: entry.timestamp,
    ...entry.context,
  });
}

function emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  const formatted = isProduction ? formatJSON(entry) : formatPretty(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
      break;
  }
}

export const log = {
  debug: (message: string, context?: Record<string, unknown>) => emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => emit("error", message, context),

  /**
   * Create a child logger with pre-bound context (e.g., request ID).
   *
   * @example
   * ```ts
   * const reqLog = log.child({ requestId: "req_abc123", userId: "usr_1" });
   * reqLog.info("Processing request");  // includes requestId + userId
   * ```
   */
  child: (baseContext: Record<string, unknown>) => ({
    debug: (message: string, context?: Record<string, unknown>) =>
      emit("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: Record<string, unknown>) =>
      emit("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: Record<string, unknown>) =>
      emit("warn", message, { ...baseContext, ...context }),
    error: (message: string, context?: Record<string, unknown>) =>
      emit("error", message, { ...baseContext, ...context }),
  }),
};
