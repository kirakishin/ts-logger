import { LoggerGenericService } from './LoggerGenericService';
import { LoggerServiceOptions } from './LoggerServiceOptions';
import { Logger } from './Logger';

export class LoggerServiceFactory {
  private static _logger: LoggerGenericService;
  public getLogger: Function;
  public loggers: Function;

  constructor() {
    LoggerServiceFactory._logger = new LoggerGenericService();
    const logger = this.get();
    this.getLogger = logger.getLogger.bind(logger);
    this.loggers = logger.loggers.bind(logger);
  }

  public static get() {
    LoggerServiceFactory.checkInitialized();
    return LoggerServiceFactory._logger;
  }

  private static checkInitialized() {
    if (!LoggerServiceFactory._logger) {
      throw new Error(
        'LoggerServiceFactory: no logger initialized. please init before'
      );
    }
  }

  public get() {
    LoggerServiceFactory.checkInitialized();
    return LoggerServiceFactory._logger;
  }

  public init(config?: LoggerServiceOptions) {
    LoggerServiceFactory._logger = new LoggerGenericService(config);
    const logger = this.get();
    this.getLogger = logger.getLogger.bind(logger);
    this.loggers = logger.loggers.bind(logger);
  }
}

export let loggerService = new LoggerServiceFactory();
