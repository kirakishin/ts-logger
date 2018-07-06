import { LoggerLevel } from './LoggerLevel';
import { LoggerInfoMode } from './LoggerInfoMode';

/**
 * Available Options of the LoggerService
 * level : see {@link LoggerLevel}
 * global : export the LoggerService instance into `globalObject`[globalKey]. If enabled,
 * it permit to access to loggers via `globalObject`[globalKey].loggers()
 * globalKey : key used to store the LoggerService into `globalObject`[globalKey]
 * globalObject : global object in which we store the loggerService (can be window on front side,
 * or another custom object)
 * store : store options of LoggerService into LocalStorage. only level, localLogging, remoteLogging
 * are loaded from LocalStorage
 * storeKey : key used to store the LoggerService options into LocalStorage
 * localLogging : log into client console ?
 * remoteLogging : cache log and send it to the server [TODO]
 * cacheLineNumber : number of cached line before send it to the server
 * datetime : add datetime into each log line
 * loggerInfo : display logger info used for the log line
 * loggerInfoMode : logger info is displayed as a string (same as sent to server)
 * or displayed as object on which you can click to see corresponding logger
 * logger : object with log methods definition (abstract layer to use winston or another layer)
 */
export class LoggerServiceOptions {
  level?: LoggerLevel;
  global?: boolean;
  globalKey?: string;
  globalObject?: any;
  store?: boolean;
  storeKey?: string;
  localLogging?: boolean;
  remoteLogging?: boolean;
  environment: 'server' | 'client' = 'client';
  cacheLineNumbers?: number;
  datetime?: boolean;
  loggerInfo?: boolean;
  loggerInfoMode?: LoggerInfoMode;
  logger?: {
    trace: Function;
    log: Function;
    debug: Function;
    info: Function;
    warn: Function;
    error: Function;
  };
}
