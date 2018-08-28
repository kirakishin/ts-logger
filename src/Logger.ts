import { LoggerOptions } from './LoggerOptions';
import { LoggerGenericService } from './LoggerGenericService';
import { LoggerSharedOptions } from './LoggerSharedOptions';
import { LoggerLevel } from './LoggerLevel';
import { LoggerDefaultOptions } from './LoggerDefaultOptions';
import { LogContext } from './LogContext';

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
      const logContext: LogContext = {
        level: LoggerLevel.INFO,
        logger: this
      };
      this.service.getConsoleLogger(logContext)(
        `log level changes from ${this.options.level} to ${level}`
      );

      this.options.level = level;
      return this;
    } else {
      return this.options.level;
    }
  }

  public subLogger(name?: string, withId = false) {
    if (!name) {
      name = `#${this.service.increment()}`;
    } else if (withId) {
      name = `${name}.#${this.service.increment()}`;
    }

    const logger = this;
    return {
      get trace() {
        return logger.checkLevel(LoggerLevel.TRACE, name);
      },
      get log() {
        return logger.checkLevel(LoggerLevel.LOG, name);
      },
      get debug() {
        return logger.checkLevel(LoggerLevel.DEBUG, name);
      },
      get warn() {
        return logger.checkLevel(LoggerLevel.WARN, name);
      },
      get info() {
        return logger.checkLevel(LoggerLevel.INFO, name);
      },
      get error() {
        return logger.checkLevel(LoggerLevel.ERROR, name);
      },
      subLogger(newName?: string) {
        if (!newName) {
          newName = `#${logger.service.increment()}`;
        }
        return logger.subLoggerRecursive(name, newName);
      },
      prettify: this.prettify
    };
  }

  private checkLevel(level: LoggerLevel, subLogger?: string) {
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
        return this.service.getConsoleLogger.apply(this.service, [
          { level: level, logger: this, subLogger: subLogger }
        ]);
      }
    }

    return () => {
      return;
    };
  }

  public getFullCallerName(): string {
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
