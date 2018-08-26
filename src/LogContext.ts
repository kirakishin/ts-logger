import { LoggerLevel } from './LoggerLevel';
import { Logger } from './Logger';

export interface LogContext {
  logger: Logger;
  level: LoggerLevel;
  subLogger?: string;
}
