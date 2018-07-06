import DummyClass from '../src/ts-logger'
import { LoggerServiceFactory } from '../src/LoggerServiceFactory'

/**
 * Dummy test
 */
describe('LoggerServiceFactory test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('Logger is instantiable', () => {
    expect(new LoggerServiceFactory()).toBeInstanceOf(LoggerServiceFactory)
  })
})
