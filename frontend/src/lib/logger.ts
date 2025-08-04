import { NextRequest } from "next/server"

export interface LogEntry {
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  shortlinkId?: string
  action?: string
  metadata?: Record<string, any>
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000 // Keep last 1000 logs in memory

  private addLog(entry: Omit<LogEntry, "timestamp">) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    }

    this.logs.push(logEntry)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[${logEntry.level.toUpperCase()}] ${logEntry.message}`, logEntry)
    }
  }

  info(message: string, metadata?: Partial<LogEntry>) {
    this.addLog({ level: "info", message, ...metadata })
  }

  warn(message: string, metadata?: Partial<LogEntry>) {
    this.addLog({ level: "warn", message, ...metadata })
  }

  error(message: string, metadata?: Partial<LogEntry>) {
    this.addLog({ level: "error", message, ...metadata })
  }

  debug(message: string, metadata?: Partial<LogEntry>) {
    this.addLog({ level: "debug", message, ...metadata })
  }

  // Log API requests
  logApiRequest(req: NextRequest, action: string, metadata?: Record<string, any>) {
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    this.info(`API Request: ${action}`, {
      action,
      ipAddress,
      userAgent,
      url: req.url,
      method: req.method,
      ...metadata
    })
  }

  // Log shortlink access
  logShortlinkAccess(shortlinkId: string, ipAddress: string, userAgent: string, metadata?: Record<string, any>) {
    this.info(`Shortlink accessed: ${shortlinkId}`, {
      action: "shortlink_access",
      shortlinkId,
      ipAddress,
      userAgent,
      ...metadata
    })
  }

  // Log authentication events
  logAuthEvent(
    userId: string,
    action: "login" | "logout" | "register",
    ipAddress: string,
    metadata?: Record<string, any>
  ) {
    this.info(`Auth event: ${action}`, {
      action,
      userId,
      ipAddress,
      ...metadata
    })
  }

  // Log rate limit events
  logRateLimit(ipAddress: string, endpoint: string, metadata?: Record<string, any>) {
    this.warn(`Rate limit exceeded: ${endpoint}`, {
      action: "rate_limit",
      ipAddress,
      endpoint,
      ...metadata
    })
  }

  // Log errors with context
  logError(error: Error, context?: Record<string, any>) {
    this.error(`Error: ${error.message}`, {
      action: "error",
      stack: error.stack,
      ...context
    })
  }

  // Get logs for a specific time range
  getLogs(startTime?: Date, endTime?: Date, level?: string): LogEntry[] {
    let filtered = this.logs

    if (startTime) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= startTime)
    }

    if (endTime) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= endTime)
    }

    if (level) {
      filtered = filtered.filter((log) => log.level === level)
    }

    return filtered.reverse() // Most recent first
  }

  // Get logs by user
  getLogsByUser(userId: string): LogEntry[] {
    return this.logs.filter((log) => log.userId === userId).reverse()
  }

  // Get logs by shortlink
  getLogsByShortlink(shortlinkId: string): LogEntry[] {
    return this.logs.filter((log) => log.shortlinkId === shortlinkId).reverse()
  }

  // Get error logs
  getErrorLogs(): LogEntry[] {
    return this.logs.filter((log) => log.level === "error").reverse()
  }

  // Get rate limit logs
  getRateLimitLogs(): LogEntry[] {
    return this.logs.filter((log) => log.action === "rate_limit").reverse()
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Get log statistics
  getStats() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentLogs = this.logs.filter((log) => new Date(log.timestamp) >= oneHourAgo)
    const dailyLogs = this.logs.filter((log) => new Date(log.timestamp) >= oneDayAgo)

    return {
      total: this.logs.length,
      lastHour: recentLogs.length,
      lastDay: dailyLogs.length,
      byLevel: {
        info: this.logs.filter((log) => log.level === "info").length,
        warn: this.logs.filter((log) => log.level === "warn").length,
        error: this.logs.filter((log) => log.level === "error").length,
        debug: this.logs.filter((log) => log.level === "debug").length
      },
      byAction: {
        shortlink_access: this.logs.filter((log) => log.action === "shortlink_access").length,
        rate_limit: this.logs.filter((log) => log.action === "rate_limit").length,
        error: this.logs.filter((log) => log.action === "error").length
      }
    }
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Export logger functions for convenience
export const log = {
  info: (message: string, metadata?: Partial<LogEntry>) => logger.info(message, metadata),
  warn: (message: string, metadata?: Partial<LogEntry>) => logger.warn(message, metadata),
  error: (message: string, metadata?: Partial<LogEntry>) => logger.error(message, metadata),
  debug: (message: string, metadata?: Partial<LogEntry>) => logger.debug(message, metadata),
  api: (req: NextRequest, action: string, metadata?: Record<string, any>) =>
    logger.logApiRequest(req, action, metadata),
  shortlink: (shortlinkId: string, ipAddress: string, userAgent: string, metadata?: Record<string, any>) =>
    logger.logShortlinkAccess(shortlinkId, ipAddress, userAgent, metadata),
  auth: (userId: string, action: "login" | "logout" | "register", ipAddress: string, metadata?: Record<string, any>) =>
    logger.logAuthEvent(userId, action, ipAddress, metadata),
  rateLimit: (ipAddress: string, endpoint: string, metadata?: Record<string, any>) =>
    logger.logRateLimit(ipAddress, endpoint, metadata),
  error: (error: Error, context?: Record<string, any>) => logger.logError(error, context)
}
