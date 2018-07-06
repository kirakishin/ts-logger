import { LoggerLevel } from './LoggerLevel'
import { LoggerOptions } from './LoggerOptions'

/**
 * Available options of a Logger with a shared options object.
 * This type of options is useful if you want to use a shared options object for many loggers.
 * @type {{key: string, level: LoggerLevel}}
 */
export class LoggerSharedOptions extends LoggerOptions {
  key: string

  // level: LoggerLevel;

  constructor(options: LoggerSharedOptions) {
    super(options)
    this.key = options.key
  }
}
