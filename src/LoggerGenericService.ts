import { LoggerServiceOptions } from './LoggerServiceOptions'
import { Logger } from './Logger'
import { LoggerSharedOptions } from './LoggerSharedOptions'
import { LoggerLevel } from './LoggerLevel'
import { LoggerInfoMode } from './LoggerInfoMode'
import { LoggerServiceDefaultOptions } from './LoggerServiceDefaultOptions'

export interface IloggerService {
  getLogger(instance: any, options?: any): Logger

  level(level?: LoggerLevel): LoggerGenericService | LoggerLevel

  global(): LoggerGenericService

  store(): LoggerGenericService

  unstore(): LoggerGenericService

  getDebug(...args: any[]): any
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
  private static loggers: any = {}
  private static count = 0
  private static instance: any = undefined
  private cache: string[] = []
  private _options: LoggerServiceOptions

  constructor(options?: LoggerServiceOptions) {
    if (!LoggerGenericService.instance) {
      LoggerGenericService.instance = this
    }
    this._options = Object.assign(
      new LoggerServiceOptions(),
      LoggerServiceDefaultOptions,
      options
    )
    if (this.options.store) {
      this.load()
    }
    if (this.options.global) {
      this.global()
    }
  }

  private get options(): LoggerServiceOptions {
    return this._options
  }

  private set options(options: LoggerServiceOptions) {
    this._options = options
    this.options.store && this.store()
  }

  public static getInstance() {
    if (LoggerGenericService.instance) {
      return LoggerGenericService.instance
    }

    console.error(
      'LoggerGenericService',
      'service not already created.you must provide it in a ngModule'
    )
  }

  public count(): number {
    return LoggerGenericService.count
  }

  public increment(): number {
    return LoggerGenericService.count++
  }

  public getLogger(instance: any, options?: any): Logger {
    let caller
    // if caller was given into options, use it instead of className
    if (options && options.caller) {
      caller = options.caller
    } else {
      if (typeof instance === 'string') {
        caller = instance
      } else {
        caller =
          instance && instance.constructor
            ? instance.constructor.name
            : instance
              ? instance
              : 'unnamed'
      }
    }
    if (LoggerGenericService.loggers[caller]) {
      return LoggerGenericService.loggers[caller]
    }
    const logger = new Logger(this, instance, options)
    LoggerGenericService.loggers[caller] = logger
    return logger
  }

  public loggersInstances() {
    return LoggerGenericService.loggers
  }

  public loggers() {
    const obj: any = {
      global: this.options,
      loggers: {}
    }
    for (const i in LoggerGenericService.loggers) {
      if (
        LoggerGenericService.loggers[i].options instanceof LoggerSharedOptions
      ) {
        obj.loggers[`${LoggerGenericService.loggers[i].options.key}[${i}]`] =
          LoggerGenericService.loggers[i].options
      } else {
        obj.loggers[i] = LoggerGenericService.loggers[i].options
      }
    }
    return obj
  }

  public level(level?: LoggerLevel): any {
    if (level !== undefined) {
      const params = this.addContextInfos('info', ['[LoggerGenericService]'])
      this.getConsoleMethod('info', params)(
        `log level changes from ${this._options.level} to ${level}`
      )
      // console.info.apply(window.console, params);
      this._options.level = level
      this.options.store && this.store()
      return this
    } else {
      return this.options.level
    }
  }

  public localLogging(localLogging?: boolean): any {
    if (localLogging !== undefined) {
      const params = this.addContextInfos('info', ['[LoggerGenericService]'])
      this.getConsoleMethod('info', params)(
        `localLogging changes from ${
          this._options.localLogging
        } to ${localLogging}`
      )
      // console.info.apply(window.console, params);
      this._options.localLogging = localLogging
      this.options.store && this.store()
      return this
    } else {
      return this.options.localLogging
    }
  }

  public remoteLogging(remoteLogging?: boolean): any {
    if (remoteLogging !== undefined) {
      const params = this.addContextInfos('info', ['[LoggerGenericService]'])
      this.getConsoleMethod('info', params)(
        `remoteLogging changes from ${
          this._options.remoteLogging
        } to ${remoteLogging}`
      )
      // console.info.apply(window.console, params);
      this._options.remoteLogging = remoteLogging
      this.options.store && this.store()
      return this
    } else {
      return this.options.remoteLogging
    }
  }

  public global(): LoggerGenericService {
    if (this.options.globalObject && this.options.globalKey) {
      ;(this.options.globalObject as any)[this.options.globalKey] = this
    }
    return this
  }

  public store(): LoggerGenericService {
    this.options.store = true
    const copy = { ...this._options }
    delete copy.globalObject
    try {
      if (this.options.storeKey) {
        localStorage[this.options.storeKey] = JSON.stringify(copy)
      }
    } catch (e) {
      console.error(`[LoggerGenericService] cannot stringify:`, copy)
    }
    return this
  }

  public load(): LoggerGenericService {
    let stored
    if (this.options.storeKey) {
      stored = localStorage.getItem(this.options.storeKey)
    }
    if (stored) {
      let storedOptions: LoggerServiceOptions
      try {
        storedOptions = JSON.parse(stored) as LoggerServiceOptions
      } catch (e) {
        console.error(
          'LoggerGenericService',
          'unable to parse stored options',
          'stored=',
          stored
        )
        return this
      }
      this.options.store = true
      this.options.level = storedOptions.level
      this.options.localLogging = storedOptions.localLogging
      this.options.remoteLogging = storedOptions.remoteLogging
    }
    return this
  }

  unstore(): LoggerGenericService {
    this._options.store = false
    if (this.options.storeKey) {
      localStorage.removeItem(this.options.storeKey)
    }
    return this
  }

  public getTrace(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.TRACE, args)
  }

  public getLog(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.LOG, args)
  }

  public getDebug(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.DEBUG, args)
  }

  public getWarn(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.WARN, args)
  }

  public getInfo(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.INFO, args)
  }

  public getError(...args: any[]) {
    return this.getConsoleLogger(LoggerLevel.ERROR, args)
  }

  public sent() {
    // console.groupCollapsed(`LoggerGenericService sending logs (${this.cache.length} lines)`);
    this.cache.map(line => {
      console.log(line)
    })
    // console.groupEnd();
    this.cache = []
  }

  public addContextInfos(level: string, args: any) {
    args.splice(0, 0, `[${level.toUpperCase()}]`)
    if (this.options.datetime) {
      args.splice(0, 0, `[${new Date().toISOString()}]`)
    }
    return args
  }

  private getExceptionWithErrorLineNumber(
    message: string,
    lineNumberToRemove: number
  ) {
    let err
    try {
      throw new Error('myError')
    } catch (e) {
      err = e
    }
    if (!err) {
      return ''
    }

    let aux = err.stack.split('\n')
    aux.splice(0, 2 + lineNumberToRemove) // removing the line that we force
    // to generate the error (var err = new Error();) from the message
    aux = aux.join('\n"')
    return message + ' \n' + aux
  }

  private getArgsWithLoggerForConsole(args: any) {
    const newArgs: any = []
    for (const i in args) {
      if (args[i] instanceof Logger) {
        if (this.options.loggerInfo) {
          if (
            this.options.loggerInfoMode === LoggerInfoMode.String ||
            this.options.environment === 'server'
          ) {
            newArgs[i] = args[i].toServerString()
          } else if (this.options.loggerInfoMode === LoggerInfoMode.Object) {
            newArgs[i] = args[i].toConsole()
          }
        }
      } else {
        newArgs[i] = args[i]
      }
    }
    return newArgs
  }

  private cacheLog(level: string, ...args: any[]) {
    if (this.localLogging()) {
      const loggerMethod: any = this.getConsoleMethod(level, [])
      loggerMethod.apply(loggerMethod, this.getArgsWithLoggerForConsole(args))
    }
    const newArgs: any[] = []
    for (const i in args) {
      // logging an Logger, convert it into a string for cache log
      if (args[i] instanceof Logger) {
        console.log('Logger', args[i])
        if (this.options.loggerInfo) {
          newArgs[i] = args[i].toServerString()
        }

        // else if its not a string, stringify it
      } else if (typeof args[i] !== 'string') {
        const isObject = typeof args[i] === 'object' && args[i] !== null
        let str = ''
        try {
          str = JSON.stringify(args[i])
        } catch (e) {
          try {
            str = JSON.stringify(e)
          } catch (e) {
            str = '[!error on stringify the error!]'
          }
        }
        str = isObject ? '\n------\n' + str + '\n------\n' : str
        newArgs[i] = str

        // else its a string
      } else {
        newArgs[i] = args[i]
      }
    }
    const params = newArgs.join(' ')
    let cacheMessage
    if (level !== 'debug') {
      cacheMessage = this.getExceptionWithErrorLineNumber(params, 2)
    } else {
      cacheMessage = params
    }
    this.cache.push(`[${level.toUpperCase()}] `.concat(cacheMessage))
    this.rotateCache()
  }

  private rotateCache() {
    if (
      this.cache &&
      this.options.cacheLineNumbers &&
      this.cache.length >= this.options.cacheLineNumbers
    ) {
      this.sent()
    }
  }

  private getConsoleLogger(level: LoggerLevel, args: any) {
    let canLog = false
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
      canLog = true
    }
    const levelStr = LoggerLevel[level].toLowerCase()

    if (canLog) {
      args = this.addContextInfos(levelStr, args)

      if (this.remoteLogging()) {
        return (...args2: any[]) => {
          const params = args.concat(args2)
          return this.cacheLog.apply(this, [levelStr].concat(params))
        }
      }
      if (this.localLogging()) {
        return this.getConsoleMethod(
          levelStr,
          this.getArgsWithLoggerForConsole(args)
        )
      }
    }
    return () => {
      return
    }
  }

  private getConsoleMethod(method: string, args: any) {
    args.splice(0, 0, this)
    args.splice(1, 0, 'UNIFIED_LOGGER')
    // console.debug only exists on chrome and its equal to log, so replace by log
    method = method === 'debug' ? 'log' : method
    const logger: any = this.options.logger
    try {
      return logger[method].bind.apply(logger[method], args)
    } catch (e) {
      const defaultLogger: any = {
        trace: () => console.trace,
        log: () => console.log,
        debug: () => console.debug,
        info: () => console.info,
        warn: () => console.warn,
        error: () => console.error
      }
      return defaultLogger[method].bind.apply(defaultLogger[method], args)
    }
  }
}
