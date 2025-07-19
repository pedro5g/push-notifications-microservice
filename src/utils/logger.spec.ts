import fs from 'node:fs';
import path from 'node:path';
import type { Mock } from 'vitest';
import { Logger, type LoggerOptions } from './logger';

vi.mock('node:fs');
vi.mock('node:path');
vi.mock('../../dirname', () => ({
  __dirname: '/mock/dir',
}));

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

describe('Logger', () => {
  let mockStdoutWrite: Mock;
  let mockConsoleError: Mock;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockStdoutWrite = vi.fn();
    Object.defineProperty(process.stdout, 'write', {
      value: mockStdoutWrite,
      writable: true,
    });

    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
    });

    mockConsoleError = vi.fn();
    console.error = mockConsoleError;

    mockFs.existsSync = vi.fn().mockReturnValue(true);
    mockFs.mkdirSync = vi.fn();
    mockFs.promises.appendFile = vi
      .fn()
      .mockImplementation((_path, _data, callback) => {
        if (callback) callback(null);
      });

    mockPath.resolve = vi.fn().mockReturnValue('/mock/dir/logs/app.log');
    mockPath.dirname = vi.fn().mockReturnValue('/mock/dir/logs');

    delete process.env.LOG_RULES;
    delete process.env.LOG_WRITE_TO_FILE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create logger with default options', () => {
      const logger = new Logger();

      expect(logger).toBeInstanceOf(Logger);
      expect(mockPath.resolve).toHaveBeenCalledWith(
        '/mock/dir',
        'logs/app.log'
      );
    });

    it('should create logger with custom context and options', () => {
      const options: LoggerOptions = {
        logFilePath: '/custom/log.txt',
        logToConsole: false,
        writeToFile: true,
      };

      const logger = new Logger('TestContext', options);

      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create log directory if it does not exist', () => {
      mockFs.existsSync = vi.fn().mockReturnValue(false);

      new Logger('Test', { writeToFile: true });

      expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/dir/logs');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/mock/dir/logs', {
        recursive: true,
      });
    });

    it('should handle directory creation error gracefully', () => {
      mockFs.existsSync = vi.fn().mockReturnValue(false);
      mockFs.mkdirSync = vi.fn().mockImplementation(() => {
        throw new Error('Permission denied');
      });

      new Logger('Test', { writeToFile: true });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to create log directory /mock/dir/logs:',
        expect.any(Error)
      );
    });
  });

  describe('Environment Variables', () => {
    it('should read LOG_WRITE_TO_FILE environment variable', async () => {
      process.env.LOG_WRITE_TO_FILE = 'true';
      const { Logger } = await import('@/utils/logger');

      const logger = new Logger();
      logger.info('test message');

      expect(mockFs.appendFile).toHaveBeenCalled();
    });

    it('should parse LOG_RULES environment variable', async () => {
      process.env.LOG_RULES =
        'context=test;level=debug/context=api;level=error';
      const { Logger } = await import('@/utils/logger');
      const logger = new Logger('test');
      logger.debug('debug message');

      await new Promise((resolve) => setImmediate(resolve));

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });
  });

  describe('Logging Methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('TestContext', {
        logToConsole: true,
        writeToFile: false,
      });
    });

    describe('info()', () => {
      it('should log info message', () => {
        logger.info('Test info message');

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[32mINFO\x1b[0m (TestContext): Test info message'
          )
        );
      });

      it('should log info with multiple arguments', () => {
        const data = { id: 1, name: 'test' };
        logger.info('User data:', data, 'processed');

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringMatching(
            /INFO.*User data:.*\{ id: 1, name: 'test' \}.*processed/
          )
        );
      });

      it('should respect console log override', () => {
        const logger = new Logger('Test', { logToConsole: false });
        logger.info('Test message', true);

        expect(mockStdoutWrite).toHaveBeenCalled();
      });

      it('should filter undefined arguments', () => {
        logger.info('Message', undefined, 'valid', undefined);

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringContaining('Message valid')
        );
        expect(mockStdoutWrite).not.toHaveBeenCalledWith(
          expect.stringContaining('undefined')
        );
      });
    });

    describe('error()', () => {
      it('should log error message', () => {
        logger.error('Test error message');

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[31mERROR!\x1b[0m (TestContext): Test error message'
          )
        );
      });

      it('should log error with Error object', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error);

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringMatching(/ERROR!.*Error occurred.*Error: Test error/)
        );
      });

      it('should log error with console override and Error', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error, false);

        expect(mockStdoutWrite).not.toHaveBeenCalled();
      });

      it('should handle error with multiple arguments', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error, 'context', { userId: 123 });

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringMatching(
            /ERROR!.*Error occurred.*context.*userId.*Error: Test error/
          )
        );
      });
    });

    describe('warn()', () => {
      it('should log warning message', () => {
        logger.warn('Test warning');

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[33mWARN\x1b[0m (TestContext): Test warning'
          )
        );
      });

      it('should log warning with arguments', () => {
        logger.warn('Warning:', 'deprecated feature', { version: '1.0' });

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringMatching(/WARN.*Warning:.*deprecated feature.*version/)
        );
      });
    });

    describe('debug()', () => {
      it('should log debug message when level allows', async () => {
        process.env.LOG_RULES = 'context=testcontext;level=debug';
        const { Logger } = await import('@/utils/logger');
        const logger = new Logger('TestContext');

        logger.debug('Debug message');

        expect(mockStdoutWrite).toHaveBeenCalledWith(
          expect.stringContaining(
            '\x1b[34mDEBUG\x1b[0m (TestContext): Debug message'
          )
        );
      });

      it('should not log debug message when level is higher', () => {
        process.env.LOG_RULES = 'context=testcontext;level=info';
        const logger = new Logger('TestContext');

        logger.debug('Debug message');

        expect(mockStdoutWrite).not.toHaveBeenCalled();
      });
    });
  });

  describe('File Writing', () => {
    it('should write to file when enabled', () => {
      const logger = new Logger('Test', { writeToFile: true });

      logger.info('Test message');

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        '/mock/dir/logs/app.log',
        expect.stringContaining('INFO (Test): Test message'),
        expect.any(Function)
      );
    });

    it('should remove ANSI colors when writing to file', () => {
      const logger = new Logger('Test', { writeToFile: true });

      logger.info('Colored message');

      expect(mockFs.appendFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.stringMatching(/\x1b\[[0-9;]*m/),
        expect.any(Function)
      );
    });
  });

  describe('Custom Writer', () => {
    it('should call custom writer when provided', () => {
      const customWriter = vi.fn();
      const logger = new Logger('Test', { customWriter });

      logger.info('Test message');

      expect(customWriter).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        'info',
        'Test'
      );
    });

    it('should handle async custom writer', async () => {
      const customWriter = vi.fn().mockResolvedValue(undefined);
      const logger = new Logger('Test', { customWriter });

      logger.info('Test message');

      expect(customWriter).toHaveBeenCalled();
    });

    it('should handle custom writer errors gracefully', async () => {
      const customWriter = vi.fn().mockRejectedValue(new Error('Writer error'));
      const logger = new Logger('Test', { customWriter });

      logger.info('Test message');
      await Promise.resolve();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Custom writer failed:',
        expect.any(Error)
      );
    });

    it('should handle synchronous custom writer errors', () => {
      const customWriter = vi.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });
      const logger = new Logger('Test', { customWriter });

      logger.info('Test message');

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Custom writer failed:',
        expect.any(Error)
      );
    });

    it('should allow setting custom writer after instantiation', () => {
      const logger = new Logger('Test');
      const customWriter = vi.fn();

      logger.setCustomWriter(customWriter);
      logger.info('Test message');

      expect(customWriter).toHaveBeenCalled();
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter logs based on context rules', async () => {
      process.env.LOG_RULES = 'context=test;level=warn';
      const { Logger } = await import('@/utils/logger');
      const logger = new Logger('test');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(mockStdoutWrite).not.toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
      expect(mockStdoutWrite).not.toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('WARN')
      );
      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('ERROR')
      );
    });

    it('should handle multiple context rules', () => {
      process.env.LOG_RULES =
        'context=api,db;level=error/context=test;level=debug';

      const apiLogger = new Logger('api');
      const testLogger = new Logger('test');

      apiLogger.info('API info');
      testLogger.debug('Test debug');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('api')
      );
      expect(mockStdoutWrite).not.toHaveBeenCalledWith(
        expect.stringContaining('test')
      );
    });

    it('should use default level for unknown contexts', () => {
      const logger = new Logger('unknown');

      logger.info('Info message');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
    });
  });

  describe('TTY Detection', () => {
    it('should use colored output when TTY is available', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
      });

      const logger = new Logger('Test');
      logger.info('Colored message');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('\x1b[32mINFO\x1b[0m')
      );
    });

    it('should use plain output when TTY is not available', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
      });

      const logger = new Logger('Test');
      logger.info('Plain message');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('INFO')
      );
      expect(mockStdoutWrite).not.toHaveBeenCalledWith(
        expect.stringContaining('\x1b[')
      );
    });
  });

  describe('Message Formatting', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = new Logger('Test');
    });

    it('should format objects correctly', () => {
      const obj = { name: 'test', id: 123 };
      logger.info('Object:', obj);

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringMatching(/Object:.*\{ name: 'test', id: 123 \}/)
      );
    });

    it('should format arrays correctly', () => {
      const arr = [1, 2, 'three'];
      logger.info('Array:', arr);

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringMatching(/Array:.*\[ 1, 2, 'three' \]/)
      );
    });

    it('should handle null and undefined gracefully', () => {
      logger.info('Values:', null, undefined, 'valid');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringMatching(/Values:.*null.*valid/)
      );
      expect(mockStdoutWrite).not.toHaveBeenCalledWith(
        expect.stringContaining('undefined')
      );
    });

    it('should format timestamps in ISO format', () => {
      const fixedDate = new Date('2025-01-20T10:30:00.000Z');
      vi.setSystemTime(fixedDate);

      logger.info('Test message');

      expect(mockStdoutWrite).toHaveBeenCalledWith(
        expect.stringContaining('[2025-01-20T10:30:00.000Z]')
      );

      vi.useRealTimers();
    });
  });
});
