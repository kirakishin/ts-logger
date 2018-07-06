import { LoggerLevel } from './LoggerLevel'

/**
 * Available options of a Logger.
 * level : LoggerLevel used for the logger
 * caller? : optional name used as caller (default uses class name)
 * @type {{level?: LoggerLevel, caller?: string}}
 */
export class LoggerOptions {
  level?: LoggerLevel
  caller?: string

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.caller = options.caller
  }
}
