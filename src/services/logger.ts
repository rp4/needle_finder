// Logger service for proper logging with environment-based levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'error';

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp } = entry;
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    // In development, use console methods
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.log(formattedMessage, data);
          break;
        case 'info':
          console.info(formattedMessage, data);
          break;
        case 'warn':
          console.warn(formattedMessage, data);
          break;
        case 'error':
          console.error(formattedMessage, error || data);
          if (error?.stack) {
            console.error('Stack trace:', error.stack);
          }
          break;
      }
    }

    // In production, we could send to monitoring service
    // For now, we just store critical errors in localStorage for debugging
    if (!this.isDevelopment && level === 'error') {
      try {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push({
          message,
          timestamp: entry.timestamp,
          error: error?.message,
          stack: error?.stack
        });
        // Keep only last 10 errors
        if (errors.length > 10) {
          errors.shift();
        }
        localStorage.setItem('app_errors', JSON.stringify(errors));
      } catch {
        // Silently fail if localStorage is not available
      }
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.log('error', message, undefined, error);
    } else {
      this.log('error', message, error);
    }
  }

  // Special method for privacy guard messages
  privacy(message: string): void {
    if (this.isDevelopment) {
      console.log(`%c🔒 ${message}`, 'color: green; font-weight: bold');
    }
  }

  // Method to clear stored errors (useful for debugging)
  clearStoredErrors(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch {
      // Silently fail
    }
  }

  // Method to get stored errors (useful for debugging)
  getStoredErrors(): unknown[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const logger = new Logger();