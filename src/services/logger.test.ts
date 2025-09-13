import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  let consoleLogSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('in development mode', () => {
    it('logs debug messages', () => {
      logger.debug('Debug message', { data: 'test' });
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('logs info messages', () => {
      logger.info('Info message', { data: 'test' });
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('logs warning messages', () => {
      logger.warn('Warning message', { data: 'test' });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('logs error messages with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('logs error messages with data', () => {
      logger.error('Error occurred', { details: 'some error' });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('privacy logging', () => {
    it('logs privacy messages with special formatting', () => {
      logger.privacy('Privacy message');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒'),
        expect.any(String)
      );
    });
  });

  describe('error storage', () => {
    it('can clear stored errors', () => {
      localStorage.setItem('app_errors', JSON.stringify([{ error: 'test' }]));
      logger.clearStoredErrors();
      expect(localStorage.getItem('app_errors')).toBeNull();
    });

    it('can retrieve stored errors', () => {
      const errors = [{ error: 'test1' }, { error: 'test2' }];
      localStorage.setItem('app_errors', JSON.stringify(errors));
      const retrieved = logger.getStoredErrors();
      expect(retrieved).toEqual(errors);
    });

    it('returns empty array when no errors stored', () => {
      const retrieved = logger.getStoredErrors();
      expect(retrieved).toEqual([]);
    });
  });

  describe('message formatting', () => {
    it('includes timestamp in log messages', () => {
      logger.info('Test message');
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('includes log level in messages', () => {
      logger.warn('Test warning');
      const call = consoleWarnSpy.mock.calls[0][0];
      expect(call).toContain('[WARN]');
    });
  });
});