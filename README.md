# ts-logger

Simple Typescript logger, usefull for all typescript/javascript projects.

## Usage

### Basic Example

Create your logger and use it (one logger with their own options).

```typescript
import {LoggerLevel, LoggerOptions} from '@kirakishin/ts-logger';

const myloggerOptions:LoggerOptions = new LoggerOptions({
  level:LoggerLevel.DEBUG
});

export class FooClass {
  private logger: Logger;

  constructor() {
    this.logger = loggerService.getLogger(this, myloggerOptions);
    this.logger.debug('my debug');
  }
}
```
will produces :
```javascript
[DEBUG] LOGGER{FooClass:4} my debug
```


### Multiple logger Example

Create your loggers and use it with shared options.
If you change an option as level, all classes that uses this shared options will have the same log level.
Its useful if you want to manage log level per application module for example.

```typescript
import {LoggerLevel, LoggerSharedOptions} from '@kirakishin/ts-logger';

const SharedLoggerOptions:LoggerSharedOptions = new LoggerSharedOptions({
  key: 'FooBarModule',
  level:LoggerLevel.DEBUG
});

export class FooClass {
  private logger: Logger;

  constructor() {
    this.logger = loggerService.getLogger(this, SharedLoggerOptions);
    this.logger.debug('my debug Foo');
  }
}

export class BarClass {
  private logger: Logger;

  constructor() {
    this.logger = loggerService.getLogger(this, SharedLoggerOptions);
    this.logger.debug('my debug Bar');
  }
}
```
will produces :
```javascript
[DEBUG] LOGGER{FooBarModule.FooClass:4} my debug Foo
[DEBUG] LOGGER{FooBarModule.BarClass:4} my debug Bar
```

The two loggers has the same log level.


### Logger and subLogger Example

Create your logger and a subLogger.

```typescript
import {LoggerLevel, LoggerOptions} from "@kirakishin/ts-logger";

const LoggerOptions:LoggerOptions = new LoggerOptions({
  level:LoggerLevel.DEBUG
});

export class FooClass {
  private logger: Logger;

  constructor() {
    this.logger = loggerService.getLogger(this, LoggerOptions);
    this.logger.debug('my debug');
    let myFunc1 = () => {
      let logger = this.logger.subLogger('myFunc1');
      logger.debug('i am now in myFunc1');
    }

    let fooName = this.getFooName();
    let barName = this.getBarName();
  }

  getFooName() {
    let logger = this.logger.subLogger('getFooName');
    logger.debug('i am getFooName method');
    logger.debug('now i let it go away');
    return 'FooName';
  }
  
  getBarName() {
    let logger = this.logger.subLogger('getBarName');
    logger.debug('i am getBarName method');
    let myFunc2 = () => {
      let logger = logger.subLogger('myFunc2');
      logger.debug('i am now in myFunc2');
    }
    logger.debug('now i let it go away');
    return myFunc2();
  }
}
```
will produces :
```text
[DEBUG] LOGGER{FooClass:4} my debug
[DEBUG] LOGGER{FooClass:4} [myFunc1] i am now in myFunc1
[DEBUG] LOGGER{FooClass:4} [getFooName] i am getFooName method
[DEBUG] LOGGER{FooClass:4} [getFooName] now i let it go away
[DEBUG] LOGGER{FooClass:4} [getBarName] i am getBarName method
[DEBUG] LOGGER{FooClass:4} [getBarName] now i let it go away
[DEBUG] LOGGER{FooClass:4} [getBarName.myFunc2] i am now in myFunc2
```

## Options

Available Options of the LoggerService :
 * level : see {@link LoggerLevel}
 * tokens : some context data for each log (by default, this is the datetime, the level, and the caller: `[datetimeToken, levelToken, callerToken]`)
 * global : export the LoggerService instance into `globalObject`[globalKey]. If enabled,
   it permit to access to loggers via `globalObject`[globalKey].loggers()
 * globalKey : key used to store the LoggerService into `globalObject`[globalKey]
 * globalObject : global object in which we store the loggerService (can be window on front side,
   or another custom object)
 * json : output a json for the log
 * jsonStringify : stringify the json output log
 * store : store options of LoggerService into LocalStorage. only level, localLogging, remoteLogging
   are loaded from LocalStorage
 * storeKey : key used to store the LoggerService options into LocalStorage
 * localLogging : log into client console ?
 * remoteLogging : cache log and send it to the server [TODO]
 * cacheLineNumber : number of cached line before send it to the server
 * datetime : add datetime into each log line
 * loggerInfo : display logger info used for the log line
 * loggerInfoMode : logger info is displayed as a string (same as sent to server)
 * or displayed as object on which you can click to see corresponding logger
 * logger : object with log methods definition (abstract layer to use winston or another layer)


 ## Log customization
 
 ### Use case
 We have logs like :
 ```
 [DEBUG] LOGGER{DesignService:4} [get] getting object code <DEMO>
 [DEBUG] LOGGER{RightsService:4} [preCheckSuperAdmin] checking user rights...
 [DEBUG] LOGGER{RightsService:4} [preCheckSuperAdmin] bypass rights is enabled for user
 ```
 To fully track user actions, we need something like :
 ```
 [DEBUG] [user1] [request0001] {DesignService:4} [get] getting object code <DEMO>
 [DEBUG] [user1] [request0001] [preCheckSuperAdmin] checking user rights...
 [DEBUG] [user1] [request0001] [preCheckSuperAdmin] bypass rights is enabled for user
 ```
 
 ### Implementation
 
You can use the `token` concept, each part of a log message is a token. The tokens are configurable in the loggerServiceOptions.
 
 By default, tokens `datetime`, `level`, `caller` and `subLogger` are enabled.

 
 We provide a list of tokens, there are default tokens : 
 - datetime
 - caller
 - subLogger
 - level
 
 User can create his own tokens, for example : 
 - requestId
 - user
 ...
 
 ```
 export const LoggerServiceOptions: LoggerServiceOptions = {
   level: LoggerLevel.ERROR,
   tokens: [
     levelToken,
     {
       name:'login',
       value: () => this.logContext.get('login'),
       format: 'brackets'
     },
     {
       name:'requestId',
       value: () => this.logContext.get('requestId'),
       format: 'brackets'
     },
     callerToken
   ],
   global: true,
   globalKey: 'logger',
   store: false,
 ...
 ```
 
 ## Log in JSON
 
 ### Use case
 For analysis we want to send logs to an elastic search instance. Logs should be in JSON.
 
 ### Implementation
 
 To enable json logging, just set `json` to true in options :
 ```
 export const LoggerServiceOptions: LoggerServiceOptions = {
   ...
   json: true
 ...
 ```
 Example of json log entry :
 ```
 {
 	level : 'info',
 	login : 'login001', # custom token
 	caller : 'access',
 	content : {
 		url : '/api/favicon-16x16.png',
 		method : 'GET',
 		login : undefined,
 		ip : '::ffff:127.0.0.1',
 		status : '304',
 		responseTime : '1'
 	}
 }
 ```