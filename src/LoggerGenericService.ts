import { LoggerServiceOptions } from './LoggerServiceOptions';
import { Logger } from './Logger';
import { LoggerSharedOptions } from './LoggerSharedOptions';
import { LoggerLevel } from './LoggerLevel';
import { LoggerServiceDefaultOptions } from './LoggerServiceDefaultOptions';
import { LogContext } from './LogContext';
import * as util from 'util';

export interface IloggerService {
  getLogger(instance: any, options?: any): Logger;

  level(level?: LoggerLevel): LoggerGenericService | LoggerLevel;

  global(): LoggerGenericService;

  store(): LoggerGenericService;

  unstore(): LoggerGenericService;
}

/**
 * Manage console logging with {@link Logger} loggers.
 * It has a global logging level and some options ({@link LoggerServiceOptions}).
 * If no options are passed, it uses {@link LoggerServiceDefaultOptions}.
 * Each loggers has it own logging level ({@link LoggerOptions} or {@link LoggerSharedOptions}).
 * For each logger, you can get a subLogger (to describe a method of a class for example).
 *
 *
 */
export class LoggerGenericService implements IloggerService {
  private static loggers: any = {};
  private static count = 0;
  private static instance: any = undefined;
  private cache: string[] = [];

  constructor(options?: LoggerServiceOptions) {
    if (!LoggerGenericService.instance) {
      LoggerGenericService.instance = this;
    }
    this._options = Object.assign(
      new LoggerServiceOptions(),
      LoggerServiceDefaultOptions,
      options
    );
    if (this.options.store) {
      this.load();
    }
    if (this.options.global) {
      this.global();
    }
  }

  private _options: LoggerServiceOptions;

  private get options(): LoggerServiceOptions {
    return this._options;
  }

  private set options(options: LoggerServiceOptions) {
    this._options = options;
    this.options.store && this.store();
  }

  public static getInstance() {
    if (LoggerGenericService.instance) {
      return LoggerGenericService.instance;
    }

    console.error(
      'LoggerGenericService',
      'service not already created.you must provide it in a ngModule'
    );
  }

  public count(): number {
    return LoggerGenericService.count;
  }

  public increment(): number {
    return LoggerGenericService.count++;
  }

  public getLogger(instance: any, options?: any): Logger {
    let caller;
    // if caller was given into options, use it instead of className
    if (options && options.caller) {
      caller = options.caller;
    } else {
      if (typeof instance === 'string') {
        caller = instance;
      } else {
        caller =
          instance && instance.constructor
            ? instance.constructor.name
            : instance
              ? instance
              : 'unnamed';
      }
    }
    if (LoggerGenericService.loggers[caller]) {
      return LoggerGenericService.loggers[caller];
    }
    const logger = new Logger(this, instance, options);
    LoggerGenericService.loggers[caller] = logger;
    return logger;
  }

  public loggersInstances() {
    return LoggerGenericService.loggers;
  }

  public loggers() {
    const obj: any = {
      global: this.options,
      loggers: {}
    };
    for (const i in LoggerGenericService.loggers) {
      if (
        LoggerGenericService.loggers[i].options instanceof LoggerSharedOptions
      ) {
        obj.loggers[`${LoggerGenericService.loggers[i].options.key}[${i}]`] =
          LoggerGenericService.loggers[i].options;
      } else {
        obj.loggers[i] = LoggerGenericService.loggers[i].options;
      }
    }
    return obj;
  }

  public level(level?: LoggerLevel): any {
    if (level !== undefined) {
      // const params = this.addContextInfos('info', ['[LoggerGenericService]']);
      // this.getConsoleMethod('info', params)(
      //   `log level changes from ${this._options.level} to ${level}`
      // );
      // console.info.apply(window.console, params);
      this._options.level = level;
      this.options.store && this.store();
      return this;
    } else {
      return this.options.level;
    }
  }

  public localLogging(localLogging?: boolean): any {
    if (localLogging !== undefined) {
      // const params = this.addContextInfos('info', ['[LoggerGenericService]']);
      // this.getConsoleMethod('info', params)(
      //   `localLogging changes from ${
      //     this._options.localLogging
      //   } to ${localLogging}`
      // );
      // console.info.apply(window.console, params);
      this._options.localLogging = localLogging;
      this.options.store && this.store();
      return this;
    } else {
      return this.options.localLogging;
    }
  }

  public remoteLogging(remoteLogging?: boolean): any {
    if (remoteLogging !== undefined) {
      // const params = this.addContextInfos('info', ['[LoggerGenericService]']);
      // this.getConsoleMethod('info', params)(
      //   `remoteLogging changes from ${
      //     this._options.remoteLogging
      //   } to ${remoteLogging}`
      // );
      // console.info.apply(window.console, params);
      this._options.remoteLogging = remoteLogging;
      this.options.store && this.store();
      return this;
    } else {
      return this.options.remoteLogging;
    }
  }

  public global(): LoggerGenericService {
    if (this.options.globalObject && this.options.globalKey) {
      (this.options.globalObject as any)[this.options.globalKey] = this;
    }
    return this;
  }

  public store(): LoggerGenericService {
    this.options.store = true;
    const copy = { ...this._options };
    delete copy.globalObject;
    try {
      if (this.options.storeKey) {
        localStorage[this.options.storeKey] = JSON.stringify(copy);
      }
    } catch (e) {
      console.error(`[LoggerGenericService] cannot stringify:`, copy);
    }
    return this;
  }

  public load(): LoggerGenericService {
    let stored;
    if (this.options.storeKey) {
      stored = localStorage.getItem(this.options.storeKey);
    }
    if (stored) {
      let storedOptions: LoggerServiceOptions;
      try {
        storedOptions = JSON.parse(stored) as LoggerServiceOptions;
      } catch (e) {
        console.error(
          'LoggerGenericService',
          'unable to parse stored options',
          'stored=',
          stored
        );
        return this;
      }
      this.options.store = true;
      this.options.level = storedOptions.level;
      this.options.localLogging = storedOptions.localLogging;
      this.options.remoteLogging = storedOptions.remoteLogging;
    }
    return this;
  }

  unstore(): LoggerGenericService {
    this._options.store = false;
    if (this.options.storeKey) {
      localStorage.removeItem(this.options.storeKey);
    }
    return this;
  }

  public sent() {
    // console.groupCollapsed(`LoggerGenericService sending logs (${this.cache.length} lines)`);
    this.cache.map(line => {
      console.log(line);
    });
    // console.groupEnd();
    this.cache = [];
  }

  private getExceptionWithErrorLineNumber(
    message: string,
    lineNumberToRemove: number
  ) {
    let err;
    try {
      throw new Error('myError');
    } catch (e) {
      err = e;
    }
    if (!err) {
      return '';
    }

    let aux = err.stack.split('\n');
    aux.splice(0, 2 + lineNumberToRemove); // removing the line that we force
    // to generate the error (var err = new Error();) from the message
    aux = aux.join('\n"');
    return message + ' \n' + aux;
  }

  private getArgsForConsole(logContext: LogContext): any[] {
    const args = [];

    if (this.options.tokens) {
      for (const token of this.options.tokens) {
        const value = token.value(logContext);
        if (value) {
          switch (token.format) {
            case 'none':
              break;
            case 'brackets':
              args.push(`[${value}]`);
              break;
            case 'braces':
              args.push(`{${value}}`);
              break;
          }
        }
      }
    }

    return args;
  }

  private cacheLog(logContext: LogContext, ...args: any[]) {
    const level = LoggerLevel[logContext.level].toLowerCase();

    if (this.localLogging()) {
      const loggerMethod: any = this.getConsoleMethod(level, []);
      loggerMethod.apply(loggerMethod, this.getArgsForConsole(logContext));
    }
    const newArgs: any[] = [];
    for (const i in args) {
      // logging an Logger, convert it into a string for cache log
      if (args[i] instanceof Logger) {
        console.log('Logger', args[i]);
        if (this.options.loggerInfo) {
          newArgs[i] = args[i].toServerString();
        }

        // else if its not a string, stringify it
      } else if (typeof args[i] !== 'string') {
        const isObject = typeof args[i] === 'object' && args[i] !== null;
        let str = '';
        try {
          str = JSON.stringify(args[i]);
        } catch (e) {
          try {
            str = JSON.stringify(e);
          } catch (e) {
            str = '[!error on stringify the error!]';
          }
        }
        str = isObject ? '\n------\n' + str + '\n------\n' : str;
        newArgs[i] = str;

        // else its a string
      } else {
        newArgs[i] = args[i];
      }
    }
    const params = newArgs.join(' ');
    let cacheMessage;
    if (level !== 'debug') {
      cacheMessage = this.getExceptionWithErrorLineNumber(params, 2);
    } else {
      cacheMessage = params;
    }
    this.cache.push(`[${level.toUpperCase()}] `.concat(cacheMessage));
    this.rotateCache();
  }

  private rotateCache() {
    if (
      this.cache &&
      this.options.cacheLineNumbers &&
      this.cache.length >= this.options.cacheLineNumbers
    ) {
      this.sent();
    }
  }

  public getConsoleLogger(logContext: LogContext) {
    let canLog = false;
    if (
      (logContext.level === LoggerLevel.TRACE &&
        this.level().valueOf() >= LoggerLevel.TRACE) ||
      (logContext.level === LoggerLevel.LOG &&
        this.level().valueOf() >= LoggerLevel.LOG) ||
      (logContext.level === LoggerLevel.DEBUG &&
        this.level().valueOf() >= LoggerLevel.DEBUG) ||
      (logContext.level === LoggerLevel.WARN &&
        this.level().valueOf() >= LoggerLevel.WARN) ||
      (logContext.level === LoggerLevel.INFO &&
        this.level().valueOf() >= LoggerLevel.INFO) ||
      (logContext.level === LoggerLevel.ERROR &&
        this.level().valueOf() >= LoggerLevel.ERROR)
    ) {
      canLog = true;
    }

    if (canLog) {
      if (this.remoteLogging()) {
        return (...args: any[]) => {
          return this.cacheLog.apply(this, [logContext, args]);
        };
      }

      if (this.localLogging()) {
        if (this.options.json) {
          return this.getConsoleJsonMethod(logContext);
        } else {
          const method = LoggerLevel[logContext.level].toLowerCase();
          return this.getConsoleMethod(
            method,
            this.getArgsForConsole(logContext)
          );
        }
      }
    }
    return () => {
      return;
    };
  }

  private getConsoleJsonMethod(logContext: LogContext): Function {
    return (...args: any[]) => {
      const obj: any = {};

      // append each token to obj
      if (this.options.tokens) {
        for (const token of this.options.tokens) {
          const value = token.value(logContext);
          if (value) {
            obj[token.name] = value;
          }
        }
      }

      // set log content to object when there is a single object argument
      if (
        args.length === 1 &&
        args[0] !== null &&
        typeof args[0] === 'object'
      ) {
        obj['content'] = args[0];
      } else {
        obj['content'] = util.format.apply(this, args);
      }

      try {
        const logger: any = this.options.logger;
        logger['log'].apply(logger['log'], [obj]);
      } catch (e) {
        console.log(obj);
      }
    };
  }

  private getConsoleMethod(method: string, args: any): Function {
    args.splice(0, 0, this);
    // args.splice(1, 0, 'UNIFIED_LOGGER');
    // console.debug only exists on chrome and its equal to log, so replace by log
    method = method === 'debug' ? 'log' : method;
    const logger: any = this.options.logger;
    try {
      return logger[method].bind.apply(logger[method], args);
    } catch (e) {
      const defaultLogger: any = {
        trace: () => console.trace,
        log: () => console.log,
        debug: () => console.debug,
        info: () => console.info,
        warn: () => console.warn,
        error: () => console.error
      };
      return defaultLogger[method].bind.apply(defaultLogger[method], args);
    }
  }
}
