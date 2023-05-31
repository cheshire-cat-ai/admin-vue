/**
 * This module defines and exports a service that is used to console.log messages for debugging purposes.
 * It doesn't do anything in production mode.
 */
import { config } from '@/config'

/**
 * This is a service that is used to log messages to the console in development mode.
 */
const LogService = Object.freeze({
  print: (...args: unknown[]) => {
    if (config.mode === 'development') {
      console.log('🐱 Log:', ...args)
    }
  }
})

export default LogService
