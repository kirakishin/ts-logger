import { LoggerLevel } from './LoggerLevel';
import { LoggerServiceOptions } from './LoggerServiceOptions';
import { LoggerInfoMode } from './LoggerInfoMode';
import { callerToken, datetimeToken, levelToken } from './Token';

/**
 * Default Options of the LoggerService
 */
export const LoggerServiceDefaultOptions: LoggerServiceOptions = {
  level: LoggerLevel.ERROR,
  tokens: [datetimeToken, levelToken, callerToken],
  global: true,
  globalKey: 'logger',
  json: false,
  jsonStringify: false,
  store: false,
  storeKey: 'logger',
  localLogging: true,
  remoteLogging: false,
  environment: 'server',
  cacheLineNumbers: 3,
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
