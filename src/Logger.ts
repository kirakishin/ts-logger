import { LoggerOptions } from './LoggerOptions';
import { LoggerGenericService } from './LoggerGenericService';
import { LoggerSharedOptions } from './LoggerSharedOptions';
import { LoggerLevel } from './LoggerLevel';
import { LoggerDefaultOptions } from './LoggerDefaultOptions';

/**
 * Manage a logger.
 * His log level can be passed with a {@link LoggerOptions} or a {@link LoggerSharedOptions}.
 * If not, {@link LoggerDefaultOptions} will be used.
 */
export class Logger {
  private caller: string;
  private options: LoggerOptions;

  constructor(
    private service: LoggerGenericService,
    instance: any,
    options?: LoggerOptions
  ) {
    instance = instance ? instance : undefined;
    if (options instanceof LoggerSharedOptions) {
      this.options = options;
    } else {
      this.options = Object.assign(
        new LoggerOptions(LoggerDefaultOptions),
        options
      );
    }
    // if caller was given into options, use it instead of className
    if (this.options.caller) {
      this.caller = this.options.caller;
    } else {
      if (typeof instance === 'string') {
        this.caller = instance;
      } else {
        this.caller =
          instance && instance.constructor
            ? instance.constructor.name
            : instance
              ? instance
              : 'unnamed';
      }
    }
  }

  public get trace(): Function {
    return this.checkLevel(LoggerLevel.TRACE);
  }

  public get log(): Function {
    return this.checkLevel(LoggerLevel.LOG);
  }

  public get debug(): Function {
    return this.checkLevel(LoggerLevel.DEBUG);
  }

  public get warn(): Function {
    return this.checkLevel(LoggerLevel.WARN);
  }

  public get info(): Function {
    return this.checkLevel(LoggerLevel.INFO);
  }

  public get error(): Function {
    return this.checkLevel(LoggerLevel.ERROR);
  }

  public prettify(o: any, space = 2) {
    try {
      return JSON.stringify(o, null, space);
    } catch (e) {
      console.error('[LoggerGenericService] cannot stringify object');
      return o;
    }
  }

  public level(level?: LoggerLevel): any {
    if (level !== undefined) {
      const params = this.service.addContextInfos('info', [
        '[Logger]',
        `[${this.caller}]`,
        `log level changes from ${this.options.level} to ${level}`
      ]);
      console.info.apply(window.console, params);
      this.options.level = level;
      return this;
    } else {
      return this.options.level;
    }
  }

  public toConsole() {
    const obj: any = {};
    const callerName = this.getFullCallerName();
    obj[callerName] = { options: this.options, logger: this };
    return obj;
  }

  public toServerString(): string {
    return `LOGGER{${this.getFullCallerName()}:${this.level()}}`;
  }

  public subLogger(name?: string, withId = false) {
    if (!name) {
      name = `#${this.service.increment()}`;
    } else if (withId) {
      name = `${name}.#${this.service.increment()}`;
    }
    const nameSurrounded = `[${name}]`;
    const logger = this;
    const obj = {
      get trace() {
        return logger
          .checkLevel(LoggerLevel.TRACE)
          .bind(logger, nameSurrounded);
      },
      get log() {
        return logger.checkLevel(LoggerLevel.LOG).bind(logger, nameSurrounded);
      },
      get debug() {
        return logger
          .checkLevel(LoggerLevel.DEBUG)
          .bind(logger, nameSurrounded);
      },
      get warn() {
        return logger.checkLevel(LoggerLevel.WARN).bind(logger, nameSurrounded);
      },
      get info() {
        return logger.checkLevel(LoggerLevel.INFO).bind(logger, nameSurrounded);
      },
      get error() {
        return logger
          .checkLevel(LoggerLevel.ERROR)
          .bind(logger, nameSurrounded);
      },
      subLogger(newName?: string) {
        if (!newName) {
          newName = `#${logger.service.increment()}`;
        }
        return logger.subLoggerRecursive(name, newName);
      },
      prettify: this.prettify
    };
    return obj;
  }

  private checkLevel(level: LoggerLevel) {
    let canLog = false;
    if (
      (level === LoggerLevel.TRACE &&
        this.level().valueOf() >= LoggerLevel.TRACE) ||
      (level === LoggerLevel.LOG &&
        this.level().valueOf() >= LoggerLevel.LOG) ||
      (level === LoggerLevel.DEBUG &&
        this.level().valueOf() >= LoggerLevel.DEBUG) ||
      (level === LoggerLevel.WARN &&
        this.level().valueOf() >= LoggerLevel.WARN) ||
      (level === LoggerLevel.INFO &&
        this.level().valueOf() >= LoggerLevel.INFO) ||
      (level === LoggerLevel.ERROR &&
        this.level().valueOf() >= LoggerLevel.ERROR)
    ) {
      canLog = true;
    }

    if (canLog) {
      // if logger level is less or equal than logger service's one, it's ok to log
      if (
        this.options.level &&
        this.options.level.valueOf() <= this.service.level().valueOf()
      ) {
        const args = [this];
        switch (level) {
          case LoggerLevel.TRACE:
            return this.service.getTrace.apply(this.service, args);
          case LoggerLevel.LOG:
            return this.service.getLog.apply(this.service, args);
          case LoggerLevel.DEBUG:
            return this.service.getDebug.apply(this.service, args);
          case LoggerLevel.WARN:
            return this.service.getWarn.apply(this.service, args);
          case LoggerLevel.INFO:
            return this.service.getInfo.apply(this.service, args);
          case LoggerLevel.ERROR:
            return this.service.getError.apply(this.service, args);
        }
      }
    }

    return () => {
      return;
    };
  }

  private getFullCallerName(): string {
    let callerName = this.caller;
    if (this.options instanceof LoggerSharedOptions) {
      callerName = `${this.options.key}.${callerName}`;
    }
    return callerName;
  }

  private subLoggerRecursive(name?: string, newName?: string) {
    return this.subLogger(`${name}.${newName}`);
  }
}
