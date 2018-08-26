import { LogContext } from './LogContext';
import { LogLevel } from 'typedoc/dist/lib/utils';

export interface Token {
  name: string;
  value: (logContext: LogContext) => any;
  format: 'braces' | 'none' | 'brackets';
}

export const levelToken: Token = {
  name: 'level',
  value: (logContext: LogContext) => {
    return LogLevel[logContext.level].toLowerCase();
  },
  format: 'brackets'
};

export const datetimeToken: Token = {
  name: 'datetime',
  value: () => {
    return new Date().toISOString();
  },
  format: 'brackets'
};

export const callerToken: Token = {
  name: 'caller',
  value: (logContext: LogContext) => {
    return logContext.logger.getFullCallerName();
  },
  format: 'braces'
};

export const subLoggerToken: Token = {
  name: 'subLogger',
  value: (logContext: LogContext) => {
    return logContext.subLogger;
  },
  format: 'brackets'
};
