import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { env } from '@/config/env';
import { __dirname } from '../../dirname';

const stringTag = '[object String]';
const isString = (value: unknown): value is string =>
  typeof value === 'string' ||
  (!Array.isArray(value) &&
    Object.prototype.toString.call(value) === stringTag);

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  logFilePath?: string;
  logToConsole?: boolean;
  writeToFile?: boolean;
  customWriter?: (
    message: string,
    level: LogLevel,
    context: string
  ) => Promise<void> | void;
}

export class Logger {
  private readonly context: string;
  private readonly logFilePath: string;
  private readonly logToConsole: boolean;
  private readonly writeToFile: boolean;
  private readonly isTTYout: boolean;
  private readonly customWriter?: LoggerOptions['customWriter'];

  private static contextRules: Record<string, number> = {};
  private readonly DEFAULT_CONTEXT: string;
  private readonly DEFAULT_LEVEL: LogLevel = 'info';
  private readonly LOG_LEVEL_MAP: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(context?: string, opts: LoggerOptions = {}) {
    const { logFilePath, logToConsole, writeToFile, customWriter } = opts;

    this.DEFAULT_CONTEXT = (context || 'Logger').toLowerCase();
    this.context = context || 'Logger';
    this.logFilePath = logFilePath || path.resolve(__dirname, 'logs/app.log');
    this.logToConsole = logToConsole ?? true;
    this.writeToFile = writeToFile ?? env.LOG_WRITE_TO_FILE === 'true';
    this.customWriter = customWriter;
    this.isTTYout = process.stdout.isTTY;

    if (!Object.keys(Logger.contextRules).length) {
      this.initializeContextRules();
    }

    if (this.writeToFile || this.customWriter) {
      this.ensureLogDirectoryExists();
    }
  }

  private log(msg: string): void {
    process.stdout.write(msg);
  }

  private ensureLogDirectoryExists(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create log directory ${logDir}:`, error);
      }
    }
  }

  info(message: string): void;
  info(message: string, ...args: unknown[]): void;
  info(message: string, consoleLog: boolean, ...args: unknown[]): void;
  info(
    message: string,
    consoleLogOrArg?: boolean | unknown,
    ...args: unknown[]
  ): void {
    if (this.shouldLog('info', this.context)) {
      const { consoleLog, processedArgs } = this.processArguments(
        consoleLogOrArg,
        args
      );
      const labelInfo = this.isTTYout ? '\x1b[32mINFO\x1b[0m' : 'INFO';
      const fullMessage = this.formatMessage(message, processedArgs);
      const logMessage = `[${this.timestamp()}] ${labelInfo} (${this.context}): ${fullMessage}\n`;
      this.writeLog(logMessage, 'info', consoleLog);
    }
  }

  error(message: string): void;
  error(message: string, ...args: unknown[]): void;
  error(message: string, error: Error, ...args: unknown[]): void;
  error(message: string, consoleLog: boolean, ...args: unknown[]): void;
  error(
    message: string,
    error: Error,
    consoleLog: boolean,
    ...args: unknown[]
  ): void;
  error(
    message: string,
    errorOrConsoleLogOrArg?: Error | boolean | unknown,
    consoleLogOrArg?: boolean | unknown,
    ...args: unknown[]
  ): void {
    if (this.shouldLog('error', this.context)) {
      let error: Error | undefined;
      let consoleLog: boolean | undefined;
      let processedArgs: unknown[];

      if (errorOrConsoleLogOrArg instanceof Error) {
        error = errorOrConsoleLogOrArg;
        const result = this.processArguments(consoleLogOrArg, args);
        consoleLog = result.consoleLog;
        processedArgs = result.processedArgs;
      } else {
        const result = this.processArguments(errorOrConsoleLogOrArg, [
          consoleLogOrArg,
          args || '',
        ]);
        consoleLog = result.consoleLog;
        processedArgs = result.processedArgs;
      }

      const labelError = this.isTTYout ? '\x1b[31mERROR!\x1b[0m' : 'ERROR!';
      const fullMessage = this.formatMessage(message, processedArgs);
      const errorInfo = error ? ` ${util.inspect(error)}` : '';
      const logMessage = `[${this.timestamp()}] ${labelError} (${this.context}): ${fullMessage}${errorInfo}\n`;
      this.writeLog(logMessage, 'error', consoleLog);
    }
  }

  warn(message: string): void;
  warn(message: string, ...args: unknown[]): void;
  warn(message: string, consoleLog: boolean, ...args: unknown[]): void;
  warn(
    message: string,
    consoleLogOrArg?: boolean | unknown,
    ...args: unknown[]
  ): void {
    if (this.shouldLog('warn', this.context)) {
      const { consoleLog, processedArgs } = this.processArguments(
        consoleLogOrArg,
        args || ''
      );
      const labelWarn = this.isTTYout ? '\x1b[33mWARN\x1b[0m' : 'WARN';
      const fullMessage = this.formatMessage(message, processedArgs);
      const logMessage = `[${this.timestamp()}] ${labelWarn} (${this.context}): ${fullMessage}\n`;
      this.writeLog(logMessage, 'warn', consoleLog);
    }
  }

  debug(message: string): void;
  debug(message: string, ...args: unknown[]): void;
  debug(message: string, consoleLog: boolean, ...args: unknown[]): void;
  debug(
    message: string,
    consoleLogOrArg?: boolean | unknown,
    ...args: unknown[]
  ): void {
    if (this.shouldLog('debug', this.context)) {
      const { consoleLog, processedArgs } = this.processArguments(
        consoleLogOrArg,
        args || ''
      );
      const labelDebug = this.isTTYout ? '\x1b[34mDEBUG\x1b[0m' : 'DEBUG';
      const fullMessage = this.formatMessage(message, processedArgs);
      const logMessage = `[${this.timestamp()}] ${labelDebug} (${this.context}): ${fullMessage}\n`;
      this.writeLog(logMessage, 'debug', consoleLog);
    }
  }

  private processArguments(
    firstArg: boolean | unknown,
    restArgs: unknown[]
  ): { consoleLog: boolean | undefined; processedArgs: unknown[] } {
    if (typeof firstArg === 'boolean') {
      return {
        consoleLog: firstArg,
        processedArgs: restArgs.filter((arg) => arg !== undefined),
      };
    }
    const allArgs = firstArg !== undefined ? [firstArg, ...restArgs] : restArgs;
    return {
      consoleLog: undefined,
      processedArgs: allArgs.filter((arg) => arg !== undefined),
    };
  }

  private formatMessage(message: string, args: unknown[]): string {
    if (args.length === 0) {
      return this.output(message);
    }

    const formattedArgs = args.map((arg) => this.output(arg)).join(' ');
    return `${this.output(message)} ${formattedArgs}`;
  }

  private initializeContextRules(): void {
    const rules = env.LOG_RULES ?? '';

    if (!rules) {
      Logger.contextRules[this.DEFAULT_CONTEXT] =
        this.LOG_LEVEL_MAP[this.DEFAULT_LEVEL];
      return;
    }

    rules
      .toLowerCase()
      .split('/')
      .forEach((rule) => {
        let contextPart = this.DEFAULT_CONTEXT;
        let levelPart = this.DEFAULT_LEVEL;
        const parts = rule.split(';');

        parts.forEach((part) => {
          if (part.startsWith('context=')) {
            contextPart = part.split('=')[1] || this.DEFAULT_CONTEXT;
          }
          if (part.startsWith('level=')) {
            const level = part.split('=')[1] || this.DEFAULT_LEVEL;
            if (this.isValidLogLevel(level)) {
              levelPart = level;
            }
          }
        });

        const contexts = contextPart.split(',');
        const numericLevel =
          this.LOG_LEVEL_MAP[levelPart] ??
          this.LOG_LEVEL_MAP[this.DEFAULT_LEVEL];

        contexts.forEach((context) => {
          Logger.contextRules[context.trim()] = numericLevel;
        });
      });
  }

  private isValidLogLevel(level: string): level is LogLevel {
    return level in this.LOG_LEVEL_MAP;
  }

  private shouldLog(methodLevel: LogLevel, context: string): boolean {
    return (
      this.LOG_LEVEL_MAP[methodLevel] >= this.getLogLevel(context.toLowerCase())
    );
  }

  private output(msg: unknown): string {
    return isString(msg) ? msg : util.inspect(msg);
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  private getLogLevel(context?: string): number {
    context = context ?? '';
    const level =
      Logger.contextRules[context] ??
      Logger.contextRules[this.DEFAULT_CONTEXT] ??
      this.LOG_LEVEL_MAP[this.DEFAULT_LEVEL];

    return level;
  }

  private async writeLog(
    message: string,
    level: LogLevel,
    consoleLog?: boolean
  ): Promise<void> {
    if (this.customWriter) {
      try {
        await this.customWriter(message, level, this.context);
      } catch (error) {
        console.error('Custom writer failed:', error);
      }
    }

    if (this.writeToFile) {
      fs.appendFile(
        this.logFilePath,
        this.normalizeStrToSaveFile(message),
        (err) => {
          if (err) {
            console.error('Failed to write to log file', err);
          }
        }
      );
    }

    if (this.checkConsoleLogPriority(consoleLog)) {
      this.log(message);
    }
  }

  private checkConsoleLogPriority(consoleLog?: boolean): boolean {
    if (consoleLog !== undefined) return consoleLog;
    return this.logToConsole;
  }

  private normalizeStrToSaveFile(msg: string): string {
    return msg.replace(/\x1b\[[0-9;]*m/g, '');
  }

  setCustomWriter(writer: LoggerOptions['customWriter']): void {
    (this as any).customWriter = writer;
  }
}
