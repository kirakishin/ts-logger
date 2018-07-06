import { LoggerLevel } from './LoggerLevel';
import { LoggerOptions } from './LoggerOptions';

/**
 * Default options for a Logger.
 * Used only if you initialize a logger with a LoggerSharedOptions.
 * ({@link LoggerService.getLogger})
 */
export const LoggerDefaultOptions: LoggerOptions = {
  level: LoggerLevel.DEBUG
};
