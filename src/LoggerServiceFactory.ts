import { LoggerGenericService } from './LoggerGenericService'
import { LoggerServiceOptions } from './LoggerServiceOptions'

export class LoggerServiceFactory {
  private static _logger: LoggerGenericService
  public getLogger = undefined
  public loggers = undefined

  constructor() {
    this.init()
  }

  public static get() {
    LoggerServiceFactory.checkInitialized()
    return LoggerServiceFactory._logger
  }

  private static checkInitialized() {
    if (!LoggerServiceFactory._logger) {
      throw new Error(
        'LoggerServiceFactory: no logger initialized. please init before'
      )
    }
  }

  public get() {
    LoggerServiceFactory.checkInitialized()
    return LoggerServiceFactory._logger
  }

  public init(config?: LoggerServiceOptions) {
    LoggerServiceFactory._logger = new LoggerGenericService(config)
    const logger = this.get()
    this.getLogger = logger.getLogger.bind(logger)
    this.loggers = logger.loggers.bind(logger)
  }
}

export let loggerService = new LoggerServiceFactory()
