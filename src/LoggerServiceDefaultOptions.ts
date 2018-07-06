import { LoggerLevel } from './LoggerLevel';
import { LoggerServiceOptions } from './LoggerServiceOptions';
import { LoggerInfoMode } from './LoggerInfoMode';

/**
 * Default Options of the LoggerService
 */
export const LoggerServiceDefaultOptions: LoggerServiceOptions = {
  level: LoggerLevel.ERROR,
  global: true,
  globalKey: 'logger',
  store: false,
  storeKey: 'logger',
  localLogging: true,
  remoteLogging: false,
  environment: 'server',
  cacheLineNumbers: 3,
  datetime: true,
  loggerInfo: true,
  loggerInfoMode: LoggerInfoMode.Object,
  logger: {
    trace: () => console.trace,
    log: () => console.log,
    debug: () => console.debug,
    info: () => console.info,
    warn: () => console.warn,
    error: () => console.error
  }
};
