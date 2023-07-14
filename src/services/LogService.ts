/**
 * This is a service that is used to log messages for debugging purposes.
 * It doesn't do anything in production mode.
 */
const LogService = Object.freeze({
  print: (...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.log('🐱 Log:', ...args)
    }
  }
})

export default LogService
